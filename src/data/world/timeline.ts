import type {
  TimelineEngine,
  CoverageOptions,
  CoverageReport,
  TemporalHit,
  Geography,
} from '../../timeline/engine.ts';
import type { WorldRepository } from './repository.ts';
import { defaultFilters, matchesHistoricalFilters } from '../../preferences/model.ts';
import { boxesIntersect } from '../../domain/geometry.ts';
import { displayYearToAstronomical } from '../../timeline/year.ts';
import { worldTerritoryId } from './records.ts';
import { hasWorldGeometry } from './review.ts';
export function withWorldTimeline(base: TimelineEngine, world: WorldRepository): TimelineEngine {
  const worldHits = async (
    year: number,
    options: CoverageOptions = {},
  ): Promise<TemporalHit<Geography>[]> => {
    if (options.layers && !options.layers.includes('polity')) return [];
    const filters = options.filters ?? defaultFilters;
    if (
      filters.exactOnly ||
      !['all', 'low'].includes(filters.confidence) ||
      !['all', 'POLITY'].includes(filters.politicalType)
    )
      return [];
    const records = await world.territories(year, options.signal);
    return records
      .filter(
        (r) =>
          matchesHistoricalFilters(r, filters, year, false, world.entities.get(r.entityId)) &&
          (!options.bbox ||
            (world.rowFor(r.id)?.bbox && boxesIntersect(world.rowFor(r.id)!.bbox!, options.bbox))),
      )
      .map((record) => ({ record, mode: 'documented approximate' as const }));
  };
  const snapshots: TimelineEngine['getAvailableSnapshots'] = async (options = {}) => {
    const existing = await base.getAvailableSnapshots(options);
    const filters = options.filters ?? defaultFilters;
    if (
      (options.layers && !options.layers.includes('polity')) ||
      filters.exactOnly ||
      !['all', 'low'].includes(filters.confidence) ||
      !['all', 'POLITY'].includes(filters.politicalType)
    )
      return existing;
    const grouped = new Map(existing.map((s) => [s.year, new Set(s.recordIds)]));
    for (const row of world.reviewedRows) {
      if (
        row.legacy ||
        !hasWorldGeometry(row) ||
        row.start !== row.end ||
        row.start < -2000 ||
        row.end > new Date().getFullYear() ||
        (options.bbox && (!row.bbox || !boxesIntersect(row.bbox, options.bbox)))
      )
        continue;
      const ids = grouped.get(row.start) ?? new Set<string>();
      ids.add(worldTerritoryId(row));
      grouped.set(row.start, ids);
    }
    return [...grouped]
      .sort((a, b) => a[0] - b[0])
      .map(([year, ids]) => ({ year, recordIds: [...ids].sort() }));
  };
  return {
    ...base,
    getAvailableSnapshots: snapshots,
    async getEntitiesAtYear(year) {
      return [
        ...(await base.getEntitiesAtYear(year)),
        ...world
          .entitiesAt(year)
          .map((record) => ({ record, mode: 'documented approximate' as const })),
      ];
    },
    async getTerritoriesAtYear(year) {
      return [
        ...(await base.getTerritoriesAtYear(year)),
        ...(await world.territories(year)).map((record) => ({
          record,
          mode: 'documented approximate' as const,
        })),
      ];
    },
    async matchesFilters(record, year, filters) {
      if (record.id.startsWith('world:'))
        return matchesHistoricalFilters(
          record,
          filters,
          year,
          false,
          'entityId' in record ? world.entities.get(record.entityId) : undefined,
        );
      return base.matchesFilters(record, year, filters);
    },
    async getDataCoverage(year, options = {}) {
      const { preview, ...currentOptions } = options;
      const first = await base.getDataCoverage(year, currentOptions); // validates year/options before asset work
      const extra = await worldHits(year, options);
      if (options.signal?.aborted) throw new Error('WORLD_COVERAGE_ABORT');
      let report: CoverageReport;
      if (extra.length) {
        report = {
          ...first,
          records: [...first.records, ...extra],
          sourceYear: year,
          isPreview: false,
          mode: 'documented approximate',
          selectedYearMode: 'documented approximate',
        };
      } else if (preview && !first.records.length) {
        const available = await snapshots(options);
        const nearest = [...available].sort(
          (a, b) =>
            Math.abs(displayYearToAstronomical(a.year) - displayYearToAstronomical(year)) -
              Math.abs(displayYearToAstronomical(b.year) - displayYearToAstronomical(year)) ||
            a.year - b.year,
        )[0];
        if (nearest) {
          const atSource = await base.getDataCoverage(nearest.year, currentOptions);
          const sourceWorld = await worldHits(nearest.year, currentOptions);
          const records = [...atSource.records, ...sourceWorld].filter(
            (h) => h.record.temporal.support?.kind === 'snapshot',
          );
          report = records.length
            ? {
                ...first,
                records,
                isPreview: true,
                sourceYear: nearest.year,
                mode: records.every((h) => h.mode === 'exact verified')
                  ? 'exact verified'
                  : 'documented approximate',
              }
            : first;
        } else report = first;
      } else report = first;
      return (options.layers ?? ['polity']).includes('polity')
        ? { ...report, politicalCoverage: world.summary(report.sourceYear ?? year) }
        : report;
    },
    clearCache() {
      base.clearCache();
      world.clear();
    },
  };
}
