import type { SearchIndex, SearchEntry } from '../discovery/search.ts';
import { normalizeSearch } from '../discovery/search.ts';
import type { TemporalExtent, Geometry, BBox } from '../domain/types.ts';
import type { HistoryRepository } from './repository.ts';
import type { TimelineEngine } from '../timeline/engine.ts';
import { intersectsYear } from '../domain/temporal.ts';
import { assertSelectableYear, displayYearToAstronomical } from '../timeline/year.ts';
import { geometryBounds } from '../domain/geometry.ts';

export function withHistorySearch(
  base: SearchIndex,
  timeline: TimelineEngine,
  archive: HistoryRepository,
): SearchIndex {
  const additions: SearchEntry[] = archive.rows.map((r) => ({
    id: r.id,
    group: r.group === 'battle' || r.group === 'war' ? 'war' : r.group,
    type: r.type,
    name: r.name,
    language: r.language,
    originalName: r.name,
    wikidataId: r.qid,
    aliases: r.aliases,
    terms: normalizeSearch([...r.aliases, ...r.groups, r.qid, r.id].join(' ')),
    temporal: {
      start:
        r.start === null
          ? { kind: 'unknown', date: null }
          : { kind: 'known', date: { year: r.start, month: null, day: null } },
      end:
        r.end === null
          ? { kind: 'unknown', date: null }
          : { kind: 'known', date: { year: r.end, month: null, day: null } },
      precision: r.start !== null && r.end !== null ? 'year' : 'unknown',
      uncertain: r.uncertain,
      calendar: 'proleptic-gregorian',
      yearNumbering: 'historical-no-zero',
      sourceDate: {
        text: 'Manifest tarih özeti; tam statement ve hassasiyet kaynak kartında.',
        calendar: 'Özgün kaynak takvimi ayrıntı kaydında.',
        yearNumbering: 'historical-no-zero',
      },
      basis: 'derived',
      reviewStatus: 'verified',
    },
    record: null,
    geographicIds: r.geometry ? [r.geometryYear !== null ? r.id + '-birth' : r.id] : [],
    bounds: r.bbox ? [r.bbox as BBox] : [],
  }));
  const entries = Object.freeze([...base.entries, ...additions]),
    byId = new Map(additions.map((e) => [e.id, e]));
  const get = (id: string) => byId.get(id) ?? base.get(id);
  async function context(id: string, year: number, signal?: AbortSignal) {
    assertSelectableYear(year);
    const entry = byId.get(id);
    if (!entry) return base.context(id, year, signal);
    if (signal?.aborted) throw Error('SEARCH_ABORTED');
    const record = await archive.record(id, signal);
    if (!record) throw Error('HISTORY_RECORD_MISSING');
    const report = await timeline.getDataCoverage(year, {
      layers: ['person', 'battle', 'event'],
      includeApproximatePersons: true,
      ...(signal ? { signal } : {}),
    });
    if (signal?.aborted) throw Error('SEARCH_ABORTED');
    return {
      entry: {
        ...entry,
        record,
        temporal: record.temporal,
        bounds: entry.bounds.length
          ? entry.bounds
          : 'geometry' in record && record.geometry
            ? geometryBounds(record.geometry as Geometry)
            : [],
      },
      year,
      hits: report.records.filter((h) => entry.geographicIds.includes(h.record.id)),
      dated: intersectsYear(record.temporal as TemporalExtent, year),
    };
  }
  return {
    ...base,
    entries,
    get,
    search(query, offset = 0, signal) {
      if (signal?.aborted) throw Error('SEARCH_ABORTED');
      if (query.length > 120 || !Number.isInteger(offset) || offset < 0 || offset > 30000)
        throw Error('SEARCH_QUERY_BUDGET');
      const terms = normalizeSearch(query).split(' ').filter(Boolean),
        groups = ['state', 'culture', 'person', 'war', 'event', 'place'];
      const result = entries
        .filter((e) => terms.every((t) => e.terms.includes(t)))
        .sort(
          (a, b) =>
            groups.indexOf(a.group) - groups.indexOf(b.group) ||
            Number(normalizeSearch(b.name) === normalizeSearch(query)) -
              Number(normalizeSearch(a.name) === normalizeSearch(query)) ||
            a.name.localeCompare(b.name, 'tr') ||
            a.id.localeCompare(b.id, 'en'),
        );
      return {
        total: result.length,
        records: result.slice(offset, offset + 8),
        nextOffset: offset + 8 < result.length ? offset + 8 : null,
      };
    },
    context,
    async destination(id, year, maxYear, signal) {
      if (!byId.has(id)) return base.destination(id, year, maxYear, signal);
      const current = await context(id, year, signal);
      if (!current) return null;
      const row = archive.rowFor(id)!;
      const dates = [...new Set([row.geometryYear, row.activeStart, row.activeEnd])]
        .filter((v): v is number => v !== null && v >= -2000 && v <= maxYear)
        .sort(
          (a, b) =>
            Math.abs(displayYearToAstronomical(a) - displayYearToAstronomical(year)) -
            Math.abs(displayYearToAstronomical(b) - displayYearToAstronomical(year)),
        );
      let related = current.dated ? current : null;
      if (!current.hits.length)
        for (const date of dates) {
          const candidate = await context(id, date, signal);
          if (!related) related = candidate;
          if (candidate?.hits.length) {
            related = candidate;
            break;
          }
        }
      return { current, related };
    },
  };
}
