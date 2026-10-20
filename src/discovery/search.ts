import type { LayerVisibility } from '../preferences/model.ts';
import type { DeepReadonly } from '../data/provider.ts';
import type { Catalog, HistoricalRecord, TemporalExtent, BBox, Geometry } from '../domain/types.ts';
import type { TimelineEngine, TemporalHit, Geography } from '../timeline/engine.ts';
import { geometryBounds } from '../domain/geometry.ts';
import { intersectsYear } from '../domain/temporal.ts';
import { personLocationLevel } from '../persons/model.ts';
import { eventLayer } from '../events/model.ts';
import { focusPlan } from './camera.ts';
import { displayYearToAstronomical } from '../timeline/year.ts';
export type SearchGroup = 'state' | 'culture' | 'person' | 'war' | 'event' | 'place';
export function searchVisibilityLayer(group: SearchGroup): keyof LayerVisibility {
  return (
    {
      state: 'state',
      culture: 'culture',
      person: 'person',
      war: 'war',
      event: 'event',
      place: 'labels',
    } as const
  )[group];
}
export interface SearchEntry {
  id: string;
  group: SearchGroup;
  type: string;
  name: string;
  language: string;
  originalName: string;
  aliases: readonly string[];
  terms: string;
  temporal: DeepReadonly<TemporalExtent>;
  wikidataId: string | null;
  /** Manifest-only search entries load their full, verified record on demand. */
  record: DeepReadonly<HistoricalRecord> | null;
  geographicIds: readonly string[];
  bounds: readonly BBox[];
}
export function normalizeSearch(text: string): string {
  return text
    .replace(/[İIı]/gu, 'i')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}
function immutable<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) immutable(child);
    Object.freeze(value);
  }
  return value;
}
const groups: SearchGroup[] = ['state', 'culture', 'person', 'war', 'event', 'place'];
function groupOf(r: DeepReadonly<HistoricalRecord>): SearchGroup | null {
  if (r.kind === 'place') return 'place';
  if (r.kind === 'person') return 'person';
  if (r.kind === 'event') return eventLayer(r.eventType) === 'battle' ? 'war' : 'event';
  if (r.kind !== 'entity') return null;
  if (['POLITY', 'KINGDOM', 'EMPIRE'].includes(r.entityType)) return 'state';
  return ['CULTURE', 'CIVILIZATION', 'CULTURAL_REGION'].includes(r.entityType) ? 'culture' : null;
}
export function createSearchIndex(catalog: DeepReadonly<Catalog>, engine: TimelineEngine) {
  if (catalog.records.length > 1000) throw new Error('SEARCH_CATALOG_BUDGET');
  catalog = immutable(JSON.parse(JSON.stringify(catalog)) as Catalog);
  const entries: SearchEntry[] = [];
  for (const record of catalog.records) {
    const group = groupOf(record);
    if (!group || record.reviewStatus !== 'verified' || record.synthetic) continue;
    const geographies = catalog.records.filter(
      (r) =>
        ((r.kind === 'event' || r.kind === 'place') && r.id === record.id) ||
        (r.kind === 'person-location' &&
          r.locationType === 'timed-presence' &&
          r.personId === record.id) ||
        ((r.kind === 'territory' || r.kind === 'cultural-region') && r.entityId === record.id),
    );
    const preferred = record.names.find((n) => n.language === 'tr') ?? record.names[0]!;
    const aliases = [
      ...new Set(
        [
          ...record.names,
          ...record.alternativeNames,
          ...(record.kind === 'entity'
            ? (record.politicalProfile?.names.map((n) => n.name) ?? [])
            : []),
        ].map((n) => n.value),
      ),
    ];
    entries.push(
      Object.freeze({
        id: record.id,
        group,
        type:
          record.kind === 'event'
            ? record.eventType
            : record.kind === 'entity'
              ? record.entityType
              : record.kind === 'place'
                ? 'PLACE'
                : 'PERSON',
        name: preferred.value,
        language: preferred.language,
        originalName: record.names[0]!.value,
        aliases: Object.freeze(aliases),
        terms: normalizeSearch(
          [
            ...aliases,
            ...geographies.flatMap((g) => [...g.names, ...g.alternativeNames].map((n) => n.value)),
            record.wikidataId ?? '',
            record.id,
          ].join(' '),
        ),
        temporal: record.temporal,
        wikidataId: record.wikidataId,
        record,
        geographicIds: Object.freeze(geographies.map((g) => g.id)),
        bounds: immutable(
          geographies.flatMap((g) =>
            'geometry' in g && g.geometry ? geometryBounds(g.geometry as Geometry) : [],
          ),
        ),
      }),
    );
  }
  const byId = new Map(entries.map((e) => [e.id, e]));
  const get = (id: string) =>
    byId.get(id) ?? entries.find((e) => e.geographicIds.includes(id)) ?? null;
  async function context(id: string, year: number, signal?: AbortSignal) {
    if (signal?.aborted) throw new Error('SEARCH_ABORTED');
    const entry = get(id);
    if (!entry) return null;
    const coverage = await engine.getDataCoverage(year, {
      includeApproximatePersons: true,
      layers: ['polity', 'culture', 'person', 'battle', 'event', 'place'],
    });
    if (signal?.aborted) throw new Error('SEARCH_ABORTED');
    const hits = coverage.records.filter((h) => entry.geographicIds.includes(h.record.id));
    return { entry, year, hits, dated: intersectsYear(entry.temporal as TemporalExtent, year) };
  }
  return {
    catalogVersion: catalog.catalogVersion,
    entries: Object.freeze(entries),
    get,
    search(query: string, offset = 0, signal?: AbortSignal) {
      if (signal?.aborted) throw new Error('SEARCH_ABORTED');
      if (query.length > 120 || !Number.isInteger(offset) || offset < 0 || offset > 1000)
        throw new Error('SEARCH_QUERY_BUDGET');
      const terms = normalizeSearch(query).split(' ').filter(Boolean);
      const result = entries
        .filter((e) => terms.every((term) => e.terms.includes(term)))
        .sort(
          (a, b) =>
            groups.indexOf(a.group) - groups.indexOf(b.group) ||
            Number(normalizeSearch(b.name) === normalizeSearch(query)) -
              Number(normalizeSearch(a.name) === normalizeSearch(query)) ||
            (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
        );
      return {
        total: result.length,
        records: result.slice(offset, offset + 8),
        nextOffset: offset + 8 < result.length ? offset + 8 : null,
      };
    },
    context,
    async destination(id: string, year: number, maxYear: number, signal?: AbortSignal) {
      const current = await context(id, year, signal);
      if (!current) return null;
      const entry = current.entry;
      const dates = new Set<number>();
      // Only source-declared years; no scanning4000 years or spreading snapshot bounds.
      const candidates = catalog.records.filter((r) => entry.geographicIds.includes(r.id));
      for (const r of [...candidates, ...(entry.record ? [entry.record] : [])]) {
        if (r.temporal.reviewStatus !== 'verified' || r.temporal.precision === 'unknown') continue;
        const periods =
          r.temporal.periods ??
          (r.temporal.start.kind === 'known' && r.temporal.end.kind === 'known'
            ? [{ start: r.temporal.start.date, end: r.temporal.end.date }]
            : []);
        for (const p of periods) {
          const target =
            r.temporal.support?.kind === 'snapshot'
              ? p.start.year
              : Math.max(p.start.year, Math.min(year, p.end.year));
          if (target !== 0 && target >= -2000 && target <= maxYear) dates.add(target);
        }
      }
      const sorted = [...dates]
        .sort(
          (a, b) =>
            Math.abs(displayYearToAstronomical(a) - displayYearToAstronomical(year)) -
              Math.abs(displayYearToAstronomical(b) - displayYearToAstronomical(year)) || a - b,
        )
        .slice(0, 128);
      let related: typeof current | null = null;
      for (const candidate of sorted) {
        const value = await context(id, candidate, signal);
        if (value?.hits.length) {
          related = value;
          break;
        }
      }
      if (!related) {
        const candidate = sorted.find((y) => intersectsYear(entry.temporal as TemporalExtent, y));
        if (candidate !== undefined) related = await context(id, candidate, signal);
      }
      return { current, related };
    },
  };
}
export type SearchIndex = ReturnType<typeof createSearchIndex>;
export type SearchDestination = NonNullable<Awaited<ReturnType<SearchIndex['destination']>>>;
export function focusHit(hit: TemporalHit<Geography>) {
  if (!hit.record.geometry) return null;
  return {
    recordId: hit.record.id,
    plan: focusPlan(hit.record.geometry),
    approximate:
      hit.record.kind === 'person-location' && personLocationLevel(hit.record) === 'approximate',
  };
}
