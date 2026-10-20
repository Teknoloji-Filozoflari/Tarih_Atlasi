import { geographyWithheld } from '../data/publication-policy.ts';
import {
  defaultFilters,
  filtersSchema,
  matchesHistoricalFilters,
  type HistoricalFilters,
} from '../preferences/model.ts';
import { eventLayer, eventHasMapEvidence } from '../events/model.ts';
import { personLocationLevel } from '../persons/model.ts';
import type {
  HistoricalRecord,
  HistoricalEntity,
  TerritoryVersion,
  CulturalRegion,
  Person,
  PersonLocation,
  HistoricalEvent,
  HistoricalPlace,
  TemporalExtent,
  BBox,
} from '../domain/types.ts';
import type { DeepReadonly, HistoricalDataProvider } from '../data/provider.ts';
import { boxesIntersect, geometryBounds, bboxSchema } from '../domain/geometry.ts';
import { array, boolean, enumeration, object, parse } from '../domain/schema.ts';
import { dateKey, temporalIntervals, temporalContradictsParent } from '../domain/temporal.ts';
import { assertSelectableYear, displayYearToAstronomical } from './year.ts';

export type CoverageMode =
  'exact verified' | 'documented approximate' | 'no supported historical geography';
export type Layer = 'polity' | 'culture' | 'person' | 'battle' | 'event' | 'place';
export type Geography =
  TerritoryVersion | CulturalRegion | PersonLocation | HistoricalEvent | HistoricalPlace;
export interface TemporalHit<T = HistoricalRecord> {
  readonly record: DeepReadonly<T>;
  readonly mode: Exclude<CoverageMode, 'no supported historical geography'>;
}
export interface CoverageOptions {
  signal?: AbortSignal;
  filters?: HistoricalFilters;
  includeApproximatePersons?: boolean;
  layers?: readonly Layer[];
  bbox?: BBox;
  preview?: 'nearest-snapshot';
}
export interface CoverageReport {
  readonly politicalCoverage?: {
    total: number;
    drawn: number;
    withheld: number;
    unknownDateRows: number;
    sourceEndYear: number;
  };
  readonly catalogVersion: string;
  readonly selectedYear: number;
  readonly sourceYear: number | null;
  readonly isPreview: boolean;
  readonly mode: CoverageMode;
  readonly selectedYearMode: CoverageMode;
  readonly records: readonly TemporalHit<Geography>[];
  readonly coverageRecords: readonly DeepReadonly<
    Extract<HistoricalRecord, { kind: 'coverage' }>
  >[];
  readonly unresolvedTemporalRecords: number;
  readonly partial: true;
}
const coverageOptionsSchema = object<Omit<CoverageOptions, 'signal'>>(
  {
    filters: filtersSchema,
    layers: array(
      enumeration(['polity', 'culture', 'person', 'battle', 'event', 'place'] as const),
      0,
      6,
    ),
    bbox: bboxSchema,
    preview: enumeration(['nearest-snapshot'] as const),
    includeApproximatePersons: boolean,
  },
  ['layers', 'bbox', 'preview', 'includeApproximatePersons', 'filters'],
);
function checkedOptions(value: CoverageOptions): CoverageOptions {
  const { signal, ...data } = value;
  if (
    signal &&
    (typeof signal.aborted !== 'boolean' || typeof signal.addEventListener !== 'function')
  )
    throw new Error('Invalid timeline signal');
  const result = parse(coverageOptionsSchema, data);
  if (!result.ok) throw new Error('Invalid timeline coverage options');
  return {
    ...(JSON.parse(JSON.stringify(result.value)) as CoverageOptions),
    ...(signal ? { signal } : {}),
  };
}
interface Entry {
  record: DeepReadonly<HistoricalRecord>;
  start: number;
  end: number;
}
function reviewed(record: DeepReadonly<HistoricalRecord>) {
  return record.reviewStatus === 'verified' && record.temporal.reviewStatus === 'verified';
}
function datesKnown(temporal: DeepReadonly<TemporalExtent>) {
  return (
    temporal.start.kind === 'known' &&
    temporal.end.kind === 'known' &&
    temporal.precision !== 'unknown'
  );
}
function layerOf(record: DeepReadonly<HistoricalRecord>): Layer | null {
  switch (record.kind) {
    case 'territory':
      return 'polity';
    case 'cultural-region':
      return 'culture';
    case 'person-location':
      return record.locationType === 'timed-presence' ? 'person' : null;
    case 'event':
      return eventLayer(record.eventType);
    case 'place':
      return 'place';
    default:
      return null;
  }
}
function supportedGeography(
  record: DeepReadonly<HistoricalRecord>,
): record is DeepReadonly<Geography> {
  if (
    geographyWithheld(record.id) ||
    !reviewed(record) ||
    !datesKnown(record.temporal) ||
    !record.temporal.support ||
    !('geometry' in record) ||
    !record.geometry ||
    !layerOf(record)
  )
    return false;
  if (
    !record.evidence.some(
      (e) =>
        e.claims.includes('temporal') &&
        e.claims.includes(record.kind === 'person-location' ? 'location' : 'geometry'),
    )
  )
    return false;
  if (record.kind === 'event' && !eventHasMapEvidence(record)) return false;
  return true;
}
function supportedPresence(
  record: DeepReadonly<HistoricalRecord>,
): record is DeepReadonly<PersonLocation> {
  return (
    record.kind === 'person-location' &&
    !geographyWithheld(record.id) &&
    record.locationType === 'timed-presence' &&
    reviewed(record) &&
    datesKnown(record.temporal) &&
    !!record.temporal.support &&
    (!!record.geometry || !!record.placeId) &&
    record.evidence.some((e) => e.claims.includes('temporal') && e.claims.includes('location'))
  );
}
export function recordCoverageMode(record: DeepReadonly<HistoricalRecord>): TemporalHit['mode'] {
  const t = record.temporal;
  const approximate =
    t.uncertain ||
    ['decade', 'century', 'range', 'unknown'].includes(t.precision) ||
    record.confidence.level !== 'high' ||
    record.kind === 'cultural-region' ||
    (record.kind === 'person-location' && personLocationLevel(record) !== 'exact') ||
    (record.kind === 'territory' &&
      (record.boundary !== 'documented' || record.borderPrecision.classification !== 'surveyed')) ||
    (record.kind === 'event' && record.locationSemantics !== 'documented');
  return approximate ? 'documented approximate' : 'exact verified';
}
function frozen<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(frozen);
    Object.freeze(value);
  }
  return value;
}
function modeFor(records: readonly TemporalHit[]): CoverageMode {
  return !records.length
    ? 'no supported historical geography'
    : records.every((h) => h.mode === 'exact verified')
      ? 'exact verified'
      : 'documented approximate';
}

/** Provider-only adapter. Initial catalog is bounded at 1000 records; no per-year expansion. */
export function createTimelineEngine(
  provider: HistoricalDataProvider,
  options: { cacheSize?: number } = {},
) {
  const capacity = options.cacheSize ?? 32;
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 128)
    throw new RangeError('Cache size must be 1–128');
  let indexPromise: Promise<{
    entries: Entry[];
    maxEnds: number[];
    all: DeepReadonly<HistoricalRecord>[];
  }> | null = null;
  const cache = new Map<number, readonly TemporalHit[]>();
  let indexScans = 0;
  const entityIndex = new Map<string, DeepReadonly<HistoricalEntity>>();
  const parentCompatible = (record: DeepReadonly<HistoricalRecord>) => {
    if (record.kind !== 'territory' && record.kind !== 'cultural-region' && record.kind !== 'event')
      return true;
    const parent = entityIndex.get(record.entityId);
    return (
      !!parent &&
      reviewed(parent) &&
      !temporalContradictsParent(
        record.temporal as TemporalExtent,
        parent.temporal as TemporalExtent,
      )
    );
  };
  async function index() {
    if (!indexPromise)
      indexPromise = (async () => {
        const all: DeepReadonly<HistoricalRecord>[] = [];
        let offset: number | null = 0;
        const seen = new Set<string>();
        for (let page = 0; offset !== null; page++) {
          if (page >= 10) throw new Error('Catalog exceeds timeline budget');
          const result = await provider.query({
            startYear: -10000,
            endYear: 10000,
            offset,
            limit: 100,
            includeUncertain: true,
            includeBiographical: true,
          });
          if (result.total > 1000) throw new Error('Catalog exceeds timeline budget');
          for (const hit of result.hits) {
            if (seen.has(hit.record.id)) throw new Error('Duplicate provider record');
            seen.add(hit.record.id);
            all.push(hit.record);
          }
          if (result.nextOffset !== null && result.nextOffset <= offset)
            throw new Error('Provider pagination did not advance');
          offset = result.nextOffset;
        }
        const entries: Entry[] = [];
        for (const record of all) if (record.kind === 'entity') entityIndex.set(record.id, record);
        for (const record of all)
          if (reviewed(record) && datesKnown(record.temporal))
            for (const interval of temporalIntervals(record.temporal as TemporalExtent))
              if (interval.start !== null && interval.end !== null)
                entries.push({ record, start: interval.start, end: interval.end });
        // A sourced birth proves presence in that birth year even when death/life-end is
        // unknown. It never supplies an open-ended lifetime or a guessed death date.
        for (const record of all) {
          if (record.kind !== 'person' || !reviewed(record) || datesKnown(record.temporal))
            continue;
          const birth = record.profile?.birth;
          if (
            !birth ||
            birth.reviewStatus !== 'verified' ||
            birth.uncertain ||
            !['day', 'month', 'year'].includes(birth.precision) ||
            birth.start.kind !== 'known' ||
            birth.end.kind !== 'known' ||
            birth.start.date.year !== birth.end.date.year ||
            !record.evidence.some((e) => e.claims.includes('temporal'))
          )
            continue;
          entries.push({
            record,
            start: dateKey({ year: birth.start.date.year, month: null, day: null }),
            end: dateKey({ year: birth.end.date.year, month: null, day: null }, true),
          });
        }
        entries.sort((a, b) => a.start - b.start || a.record.id.localeCompare(b.record.id, 'en'));
        let max = -Infinity;
        const maxEnds = entries.map((e) => (max = Math.max(max, e.end)));
        return { entries, maxEnds, all };
      })().catch((error) => {
        indexPromise = null;
        throw error;
      });
    return indexPromise;
  }
  async function atYear(year: number): Promise<readonly TemporalHit[]> {
    assertSelectableYear(year);
    const previous = cache.get(year);
    if (previous) {
      cache.delete(year);
      cache.set(year, previous);
      return previous;
    }
    const { entries, maxEnds } = await index();
    // A concurrent identical call may have populated this entry while the index loaded.
    if (cache.has(year)) return cache.get(year)!;
    indexScans++;
    const start = dateKey({ year, month: null, day: null }),
      end = dateKey({ year, month: null, day: null }, true);
    let lo = 0,
      hi = entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (entries[mid]!.start <= end) lo = mid + 1;
      else hi = mid;
    }
    const hits = new Map<string, TemporalHit>();
    for (let i = lo - 1; i >= 0 && maxEnds[i]! >= start; i--) {
      const entry = entries[i]!;
      if (entry.end >= start)
        hits.set(entry.record.id, { record: entry.record, mode: recordCoverageMode(entry.record) });
    }
    const result = frozen(
      [...hits.values()].sort((a, b) => a.record.id.localeCompare(b.record.id, 'en')),
    );
    cache.set(year, result);
    if (cache.size > capacity) cache.delete(cache.keys().next().value!);
    return result;
  }
  const allLayers: Layer[] = ['polity', 'culture', 'person', 'battle', 'event', 'place'];
  function passesFilters(
    record: DeepReadonly<HistoricalRecord>,
    year: number,
    opts: CoverageOptions,
  ) {
    return matchesHistoricalFilters(
      record,
      opts.filters ?? defaultFilters,
      year,
      recordCoverageMode(record) === 'exact verified',
      'entityId' in record ? entityIndex.get(record.entityId) : undefined,
    );
  }
  function inScope(record: DeepReadonly<HistoricalRecord>, opts: CoverageOptions, year = 1) {
    if (!passesFilters(record, year, opts)) return false;
    if (record.kind === 'person-location') {
      const level = personLocationLevel(record);
      if (level !== 'exact' && !(opts.includeApproximatePersons && level === 'approximate'))
        return false;
    }
    const layer = layerOf(record);
    if (!layer || !(opts.layers ?? allLayers).includes(layer)) return false;
    return (
      !opts.bbox ||
      ('geometry' in record &&
        !!record.geometry &&
        geometryBounds(record.geometry as NonNullable<Geography['geometry']>).some((box) =>
          boxesIntersect(box, opts.bbox!),
        ))
    );
  }
  function geographic(hits: readonly TemporalHit[], opts: CoverageOptions, year: number) {
    const persons = new Set(hits.filter((h) => h.record.kind === 'person').map((h) => h.record.id));
    return hits.filter(
      (h): h is TemporalHit<Geography> =>
        supportedGeography(h.record) &&
        parentCompatible(h.record) &&
        inScope(h.record, opts, year) &&
        (h.record.kind !== 'person-location' || persons.has(h.record.personId)),
    );
  }
  async function snapshots(opts: CoverageOptions = {}) {
    opts = checkedOptions(opts);
    const { all } = await index();
    const years = new Map<number, Set<string>>();
    for (const record of all) {
      if (
        !supportedGeography(record) ||
        !parentCompatible(record) ||
        record.temporal.support?.kind !== 'snapshot'
      )
        continue;
      const t = record.temporal;
      const dates =
        t.periods?.map((p) => p.start) ?? (t.start.kind === 'known' ? [t.start.date] : []);
      for (const date of dates) {
        if (!inScope(record, opts, date.year)) continue;
        if (date.year < -2000 || date.year > new Date().getFullYear()) continue;
        if (
          record.kind === 'person-location' &&
          !(await atYear(date.year)).some(
            (hit) => hit.record.kind === 'person' && hit.record.id === record.personId,
          )
        )
          continue;
        if (!years.has(date.year)) years.set(date.year, new Set());
        years.get(date.year)!.add(record.id);
      }
    }
    return frozen(
      [...years]
        .sort((a, b) => displayYearToAstronomical(a[0]) - displayYearToAstronomical(b[0]))
        .map(([year, ids]) => ({ year, recordIds: [...ids].sort() })),
    );
  }
  return {
    catalogVersion: provider.catalogVersion,
    async getEntitiesAtYear(year: number) {
      return (await atYear(year)).filter(
        (h): h is TemporalHit<HistoricalEntity> => h.record.kind === 'entity',
      );
    },
    async getTerritoriesAtYear(year: number) {
      return (await atYear(year)).filter(
        (h): h is TemporalHit<TerritoryVersion> =>
          h.record.kind === 'territory' &&
          supportedGeography(h.record) &&
          parentCompatible(h.record),
      );
    },
    async getCulturesAtYear(year: number) {
      return (await atYear(year)).filter(
        (h): h is TemporalHit<CulturalRegion> =>
          h.record.kind === 'cultural-region' &&
          supportedGeography(h.record) &&
          parentCompatible(h.record),
      );
    },
    async getPersonsAtYear(year: number) {
      const hits = await atYear(year);
      const { all } = await index();
      return frozen(
        hits
          .filter((h): h is TemporalHit<Person> => h.record.kind === 'person')
          .map((hit) => ({
            person: hit,
            locations: hits.filter(
              (h): h is TemporalHit<PersonLocation> =>
                h.record.kind === 'person-location' &&
                h.record.personId === hit.record.id &&
                supportedPresence(h.record),
            ),
            biographicalLocations: all.filter(
              (r): r is DeepReadonly<PersonLocation> =>
                r.kind === 'person-location' &&
                reviewed(r) &&
                r.personId === hit.record.id &&
                r.locationType === 'biographical',
            ),
            locationStatus: hits.some(
              (h) =>
                h.record.kind === 'person-location' &&
                h.record.personId === hit.record.id &&
                supportedPresence(h.record),
            )
              ? ('supported' as const)
              : ('no-supported-location' as const),
          })),
      );
    },
    async getEventsAtYear(year: number) {
      return (await atYear(year)).filter(
        (h): h is TemporalHit<HistoricalEvent> =>
          h.record.kind === 'event' && parentCompatible(h.record),
      );
    },
    async matchesFilters(
      record: DeepReadonly<HistoricalRecord>,
      year: number,
      filters: HistoricalFilters,
    ) {
      await index();
      if (!parse(filtersSchema, filters).ok) throw new Error('Invalid filters');
      return passesFilters(record, year, { filters });
    },
    getAvailableSnapshots: snapshots,
    async getDataCoverage(year: number, opts: CoverageOptions = {}): Promise<CoverageReport> {
      opts = checkedOptions(opts);
      const hits = await atYear(year);
      const { all } = await index();
      let records = geographic(hits, opts, year);
      const selectedYearMode = modeFor(records);
      let sourceYear: number | null = records.length ? year : null;
      let isPreview = false;
      if (!records.length && opts.preview === 'nearest-snapshot') {
        const available = await snapshots(opts);
        const nearest = [...available].sort(
          (a, b) =>
            Math.abs(displayYearToAstronomical(a.year) - displayYearToAstronomical(year)) -
              Math.abs(displayYearToAstronomical(b.year) - displayYearToAstronomical(year)) ||
            displayYearToAstronomical(a.year) - displayYearToAstronomical(b.year),
        )[0];
        if (nearest) {
          sourceYear = nearest.year;
          isPreview = true;
          records = geographic(await atYear(nearest.year), opts, nearest.year).filter(
            (h) => h.record.temporal.support?.kind === 'snapshot',
          );
        }
      }
      return frozen({
        catalogVersion: provider.catalogVersion,
        selectedYear: year,
        sourceYear,
        isPreview,
        mode: modeFor(records),
        selectedYearMode,
        records,
        coverageRecords: hits
          .filter(
            (h) =>
              h.record.kind === 'coverage' &&
              (opts.layers ?? allLayers).includes(h.record.layer) &&
              (!opts.bbox || boxesIntersect(h.record.region as BBox, opts.bbox)),
          )
          .map((h) => h.record as DeepReadonly<Extract<HistoricalRecord, { kind: 'coverage' }>>),
        unresolvedTemporalRecords: all.filter(
          (r) =>
            layerOf(r) &&
            inScope(r, opts, year) &&
            (!datesKnown(r.temporal) || !r.temporal.support),
        ).length,
        partial: true,
      });
    },
    cacheInfo: () => ({ size: cache.size, capacity, indexScans }),
    clearCache: () => cache.clear(),
  };
}
export type TimelineEngine = ReturnType<typeof createTimelineEngine>;
export const getEntitiesAtYear = (engine: TimelineEngine, year: number) =>
  engine.getEntitiesAtYear(year);
export const getTerritoriesAtYear = (engine: TimelineEngine, year: number) =>
  engine.getTerritoriesAtYear(year);
export const getCulturesAtYear = (engine: TimelineEngine, year: number) =>
  engine.getCulturesAtYear(year);
export const getPersonsAtYear = (engine: TimelineEngine, year: number) =>
  engine.getPersonsAtYear(year);
export const getEventsAtYear = (engine: TimelineEngine, year: number) =>
  engine.getEventsAtYear(year);
export const getAvailableSnapshots = (engine: TimelineEngine, options?: CoverageOptions) =>
  engine.getAvailableSnapshots(options);
export const getDataCoverage = (engine: TimelineEngine, year: number, options?: CoverageOptions) =>
  engine.getDataCoverage(year, options);
