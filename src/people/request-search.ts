import type { SearchIndex } from '../discovery/search.ts';
import { normalizeSearch } from '../discovery/search.ts';
import { requestedPeople } from './generated/requests.ts';
/** User spellings are search hints only, never rewritten as sourced historical aliases. */
export function withRequestedPeople(base: SearchIndex): SearchIndex {
  const hints = new Map<string, string>(
    requestedPeople.records.flatMap((r) =>
      r.recordId ? [[r.recordId, r.aliases.join(' ')] as const] : [],
    ),
  );
  const entries = base.entries.map((e) =>
    hints.has(e.id)
      ? Object.freeze({ ...e, terms: normalizeSearch(e.terms + ' ' + hints.get(e.id)) })
      : e,
  );
  return {
    ...base,
    entries: Object.freeze(entries),
    search(query, offset = 0, signal) {
      if (signal?.aborted) throw new Error('SEARCH_ABORTED');
      if (query.length > 120 || !Number.isInteger(offset) || offset < 0 || offset > 30000)
        throw new Error('SEARCH_QUERY_BUDGET');
      const normalized = normalizeSearch(query),
        terms = normalized.split(' ').filter(Boolean);
      const groups = ['state', 'culture', 'person', 'war', 'event', 'place'];
      const result = entries
        .filter((e) => terms.every((term) => e.terms.includes(term)))
        .sort(
          (a, b) =>
            groups.indexOf(a.group) - groups.indexOf(b.group) ||
            Number(normalizeSearch(b.name) === normalized) -
              Number(normalizeSearch(a.name) === normalized) ||
            a.name.localeCompare(b.name, 'tr') ||
            a.id.localeCompare(b.id, 'en'),
        );
      return {
        total: result.length,
        records: result.slice(offset, offset + 8),
        nextOffset: offset + 8 < result.length ? offset + 8 : null,
      };
    },
  };
}
