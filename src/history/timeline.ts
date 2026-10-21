import type { TimelineEngine, CoverageOptions, CoverageReport } from '../timeline/engine.ts';
import type { HistoryRepository } from './repository.ts';
import { matchesHistoricalFilters } from '../preferences/model.ts';
import { displayYearToAstronomical } from '../timeline/year.ts';

export function withHistoryTimeline(
  base: TimelineEngine,
  archive: HistoryRepository,
): TimelineEngine {
  // Frame assembly asks for identities, people and events concurrently. Read each
  // matching archive pack once, instead of thrashing the eight-pack LRU three times.
  // Only the latest year's projected hits are retained; raw catalog limits stay intact.
  async function collectYear(year: number) {
    const entities: Awaited<ReturnType<TimelineEngine['getEntitiesAtYear']>> = [];
    const persons: Awaited<ReturnType<TimelineEngine['getPersonsAtYear']>> = [];
    const events: Awaited<ReturnType<TimelineEngine['getEventsAtYear']>> = [];
    for await (const { engine } of archive.enginesAt(year, 'all')) {
      const [e, p, v] = await Promise.all([
        engine.getEntitiesAtYear(year),
        engine.getPersonsAtYear(year),
        engine.getEventsAtYear(year),
      ]);
      entities.push(...e);
      persons.push(...p);
      events.push(...v);
    }
    return { entities, persons, events };
  }
  let latest: { year: number; result: ReturnType<typeof collectYear> } | null = null;
  function yearContents(year: number) {
    if (latest?.year === year) return latest.result;
    const result = collectYear(year);
    latest = { year, result };
    void result.catch(() => {
      if (latest?.result === result) latest = null;
    });
    return result;
  }
  async function snapshots(options: CoverageOptions = {}) {
    const groups = new Map(
      (await base.getAvailableSnapshots(options)).map((s) => [s.year, new Set(s.recordIds)]),
    );
    if (
      options.layers &&
      !options.layers.some((l) => l === 'person' || l === 'battle' || l === 'event')
    )
      return [...groups].map(([year, ids]) => ({ year, recordIds: [...ids] }));
    for await (const { engine } of archive.geometryEngines(options.signal))
      for (const item of await engine.getAvailableSnapshots(options)) {
        const ids = groups.get(item.year) ?? new Set<string>();
        for (const id of item.recordIds) ids.add(id);
        groups.set(item.year, ids);
      }
    return [...groups]
      .sort((a, b) => a[0] - b[0])
      .map(([year, ids]) => ({ year, recordIds: [...ids].sort() }));
  }
  async function coverage(year: number, options: CoverageOptions = {}): Promise<CoverageReport> {
    const { preview, ...current } = options;
    const first = await base.getDataCoverage(year, current);
    const reports: CoverageReport[] = [first];
    if (
      !options.layers ||
      options.layers.some((l) => l === 'person' || l === 'battle' || l === 'event')
    )
      for await (const { engine } of archive.enginesAt(year, 'geometry', options.signal))
        reports.push(await engine.getDataCoverage(year, current));
    if (options.signal?.aborted) throw Error('HISTORY_COVERAGE_ABORT');
    const records = reports.flatMap((r) => r.records),
      mode = records.length
        ? records.every((h) => h.mode === 'exact verified')
          ? 'exact verified'
          : 'documented approximate'
        : 'no supported historical geography';
    const selected: CoverageReport = {
      ...first,
      records,
      sourceYear: records.length ? year : null,
      mode,
      selectedYearMode: mode,
      isPreview: false,
    };
    if (records.length || !preview) return selected;
    const nearest = (await snapshots(current)).sort(
      (a, b) =>
        Math.abs(displayYearToAstronomical(a.year) - displayYearToAstronomical(year)) -
          Math.abs(displayYearToAstronomical(b.year) - displayYearToAstronomical(year)) ||
        a.year - b.year,
    )[0];
    if (!nearest) return selected;
    const source = await coverage(nearest.year, current),
      supported = source.records.filter((h) => h.record.temporal.support?.kind === 'snapshot');
    return supported.length
      ? {
          ...selected,
          sourceYear: nearest.year,
          isPreview: true,
          records: supported,
          mode: source.mode,
        }
      : selected;
  }
  return {
    ...base,
    async getEntitiesAtYear(year) {
      const [baseEntities, extra] = await Promise.all([
        base.getEntitiesAtYear(year),
        yearContents(year),
      ]);
      return [
        ...new Map([...baseEntities, ...extra.entities].map((h) => [h.record.id, h])).values(),
      ];
    },
    async getPersonsAtYear(year) {
      const [persons, extra] = await Promise.all([base.getPersonsAtYear(year), yearContents(year)]);
      return [...persons, ...extra.persons];
    },
    async getEventsAtYear(year) {
      const [events, extra] = await Promise.all([base.getEventsAtYear(year), yearContents(year)]);
      return [...events, ...extra.events];
    },
    async matchesFilters(record, year, filters) {
      if (archive.rowFor(record.id)) return matchesHistoricalFilters(record, filters, year, false);
      return base.matchesFilters(record, year, filters);
    },
    getDataCoverage: coverage,
    getAvailableSnapshots: snapshots,
    clearCache() {
      latest = null;
      base.clearCache();
      archive.clear();
    },
  };
}
