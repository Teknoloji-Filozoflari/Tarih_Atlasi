import type { HistoryRepository } from './repository.ts';
import { createPersonRepository } from '../persons/repository.ts';
import { createHistoricalDataProvider } from '../data/provider.ts';
import type { TimelineEngine } from '../timeline/engine.ts';
import { normalizeSearch } from '../discovery/search.ts';
import type { DeepReadonly } from '../data/provider.ts';
import type { Person } from '../domain/types.ts';
import { personLocationLevel } from '../persons/model.ts';
export function withHistoryPersons(
  base: ReturnType<typeof createPersonRepository>,
  timeline: TimelineEngine,
  archive: HistoryRepository,
): ReturnType<typeof createPersonRepository> {
  return {
    ...base,
    PERSON_ALIVE_AT_YEAR: async (year) =>
      (await timeline.getPersonsAtYear(year)).map((h) => h.person.record),
    async PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year, includeApproximate = false) {
      const result = [
        ...(await base.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year, includeApproximate)),
      ];
      for await (const { engine } of archive.enginesAt(year, 'geometry'))
        for (const row of await engine.getPersonsAtYear(year))
          for (const location of row.locations) {
            const level = personLocationLevel(location.record);
            if (level === 'exact' || (includeApproximate && level === 'approximate'))
              result.push({ person: row.person.record, location: location.record, level });
          }
      return result;
    },
    async search(query, offset = 0) {
      if (query.length > 300 || !Number.isInteger(offset) || offset < 0 || offset > 10000)
        throw Error('Person search bounds');
      const old: DeepReadonly<Person>[] = [];
      let next: number | null = 0;
      for (let page = 0; next !== null; page++) {
        if (page >= 128) throw Error('HISTORY_PERSON_PAGES');
        const response = await base.search(query, next);
        old.push(...response.records);
        next = response.nextOffset;
      }
      const terms = normalizeSearch(query).split(' ').filter(Boolean);
      const matched = archive.rows.filter(
        (r) =>
          r.kind === 'person' &&
          terms.every((t) => normalizeSearch([...r.aliases, r.qid].join(' ')).includes(t)),
      );
      const candidates = [
        ...old.map((r) => ({ id: r.id, record: r })),
        ...matched.map((r) => ({ id: r.id, record: null })),
      ].sort((a, b) => a.id.localeCompare(b.id, 'en'));
      const records: DeepReadonly<Person>[] = [];
      for (const candidate of candidates.slice(offset, offset + 8)) {
        const value = candidate.record ?? (await archive.record(candidate.id));
        if (value?.kind === 'person') records.push(value);
      }
      return {
        total: candidates.length,
        records,
        nextOffset: offset + 8 < candidates.length ? offset + 8 : null,
      };
    },
    async detail(id, year) {
      if (!archive.rowFor(id)) return base.detail(id, year);
      const loaded = await archive.load(archive.rowFor(id)!.pack);
      const scoped = createPersonRepository(
        createHistoricalDataProvider(loaded.catalog),
        loaded.engine,
      );
      return scoped.detail(id, year);
    },
  };
}
