import type { SearchIndex, SearchEntry } from '../../discovery/search.ts';
import { normalizeSearch } from '../../discovery/search.ts';
import type { TimelineEngine } from '../../timeline/engine.ts';
import type { WorldRepository } from './repository.ts';
import { worldEntityId, worldTerritoryId } from './records.ts';
import { displayYearToAstronomical, assertSelectableYear } from '../../timeline/year.ts';
import { intersectsYear } from '../../domain/temporal.ts';
import type { TemporalExtent } from '../../domain/types.ts';
import { shortCountryName } from '../../politics/short-names.ts';
export function withWorldSearch(
  base: SearchIndex,
  engine: TimelineEngine,
  world: WorldRepository,
): SearchIndex {
  const additions: SearchEntry[] = [];
  for (const [id, rows] of world.entityRows) {
    const record = world.entities.get(id)!;
    const preferred = record.names[0]!,
      name = shortCountryName(preferred.value);
    const aliases = [
      ...new Set([
        name,
        preferred.value,
        rows[0]!.name,
        ...record.alternativeNames.map((n) => n.value),
      ]),
    ];
    const geographicIds = rows.flatMap((r) =>
      r.legacy ? (base.get(`atlas:clio-r${r.index}`)?.geographicIds ?? []) : [worldTerritoryId(r)],
    );
    additions.push(
      Object.freeze({
        id,
        group: 'state',
        type: 'POLITY',
        name,
        language: preferred.language,
        originalName: rows[0]!.name,
        aliases: Object.freeze(aliases),
        terms: normalizeSearch(aliases.join(' ')),
        temporal: record.temporal,
        wikidataId: record.wikidataId,
        record,
        geographicIds: Object.freeze(geographicIds),
        bounds: Object.freeze(rows.flatMap((r) => (r.bbox ? [r.bbox] : []))),
      }),
    );
  }
  const entries = Object.freeze([
    ...base.entries.filter((e) => !e.id.startsWith('atlas:clio-r')),
    ...additions,
  ]);
  const byId = new Map(entries.map((e) => [e.id, e]));
  const geography = new Map(entries.flatMap((e) => e.geographicIds.map((id) => [id, e] as const)));
  const get = (id: string) => byId.get(id) ?? geography.get(id) ?? base.get(id);
  async function context(id: string, year: number, signal?: AbortSignal) {
    if (signal?.aborted) throw new Error('SEARCH_ABORTED');
    const entry = get(id);
    if (!entry) return null;
    const report = await engine.getDataCoverage(year, {
      layers: ['polity', 'culture', 'person', 'battle', 'event', 'place'],
      includeApproximatePersons: true,
      ...(signal ? { signal } : {}),
    });
    if (signal?.aborted) throw new Error('SEARCH_ABORTED');
    const ids = new Set(entry.geographicIds);
    return {
      entry,
      year,
      hits: report.records.filter((h) => ids.has(h.record.id)),
      dated: intersectsYear(entry.temporal as TemporalExtent, year),
    };
  }
  return {
    catalogVersion: base.catalogVersion,
    entries,
    get,
    search(query, offset = 0, signal) {
      if (signal?.aborted) throw new Error('SEARCH_ABORTED');
      if (query.length > 120 || !Number.isInteger(offset) || offset < 0 || offset > 30000)
        throw new Error('SEARCH_QUERY_BUDGET');
      const normalized = normalizeSearch(query),
        terms = normalized.split(' ').filter(Boolean),
        groups = ['state', 'culture', 'person', 'war', 'event', 'place'];
      const records = entries
        .filter((e) => terms.every((t) => e.terms.includes(t)))
        .sort(
          (a, b) =>
            groups.indexOf(a.group) - groups.indexOf(b.group) ||
            Number(normalizeSearch(b.name) === normalized) -
              Number(normalizeSearch(a.name) === normalized) ||
            a.name.localeCompare(b.name, 'tr') ||
            a.id.localeCompare(b.id, 'en'),
        );
      return {
        total: records.length,
        records: records.slice(offset, offset + 8),
        nextOffset: offset + 8 < records.length ? offset + 8 : null,
      };
    },
    context,
    async destination(id, year, maxYear, signal) {
      assertSelectableYear(year);
      const entry = get(id);
      if (!entry) return null;
      if (!entry.id.startsWith('world:')) return base.destination(id, year, maxYear, signal);
      const current = await context(id, year, signal);
      if (!current) return null;
      if (current.hits.length) return { current, related: current };
      const rows = world.entityRows.get(worldEntityId(entry.originalName)) ?? [];
      const dates = [
        ...new Set(
          rows
            .map((r) => Math.max(-2000, r.start, Math.min(year, r.end)))
            .filter((y) => y !== 0 && y <= maxYear),
        ),
      ].sort(
        (a, b) =>
          Math.abs(displayYearToAstronomical(a) - displayYearToAstronomical(year)) -
            Math.abs(displayYearToAstronomical(b) - displayYearToAstronomical(year)) || a - b,
      );
      let related: typeof current | null = null;
      for (const date of dates.slice(0, 128)) {
        const value = await context(id, date, signal);
        if (!related) related = value;
        if (value?.hits.length) {
          related = value;
          break;
        }
      }
      return { current, related };
    },
  };
}
