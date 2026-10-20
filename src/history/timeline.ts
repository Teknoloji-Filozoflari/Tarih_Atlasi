import type { TimelineEngine, CoverageOptions, CoverageReport } from '../timeline/engine.ts';
import type { HistoryRepository } from './repository.ts';
import { matchesHistoricalFilters } from '../preferences/model.ts';
import { displayYearToAstronomical } from '../timeline/year.ts';

export function withHistoryTimeline(
  base: TimelineEngine,
  archive: HistoryRepository,
): TimelineEngine {
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
      const extra = [];
      for (const kind of ['person', 'event'] as const)
        for await (const { engine } of archive.enginesAt(year, kind))
          extra.push(...(await engine.getEntitiesAtYear(year)));
      return [
        ...new Map(
          [...(await base.getEntitiesAtYear(year)), ...extra].map((h) => [h.record.id, h]),
        ).values(),
      ];
    },
    async getPersonsAtYear(year) {
      const result = [...(await base.getPersonsAtYear(year))];
      for await (const { engine } of archive.enginesAt(year, 'person'))
        result.push(...(await engine.getPersonsAtYear(year)));
      return result;
    },
    async getEventsAtYear(year) {
      const result = [...(await base.getEventsAtYear(year))];
      for await (const { engine } of archive.enginesAt(year, 'event'))
        result.push(...(await engine.getEventsAtYear(year)));
      return result;
    },
    async matchesFilters(record, year, filters) {
      if (archive.rowFor(record.id)) return matchesHistoricalFilters(record, filters, year, false);
      return base.matchesFilters(record, year, filters);
    },
    getDataCoverage: coverage,
    getAvailableSnapshots: snapshots,
    clearCache() {
      base.clearCache();
      archive.clear();
    },
  };
}
