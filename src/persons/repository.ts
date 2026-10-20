import type { HistoricalDataProvider, DeepReadonly } from '../data/provider.ts';
import type { HistoricalRecord, Person, PersonLocation, SourceRecord } from '../domain/types.ts';
import { createTimelineEngine, type TimelineEngine } from '../timeline/engine.ts';
import { personLocationLevel, personName } from './model.ts';

export function createPersonRepository(
  provider: HistoricalDataProvider,
  timeline: TimelineEngine = createTimelineEngine(provider),
) {
  let indexed: Promise<readonly DeepReadonly<HistoricalRecord>[]> | null = null;
  function all() {
    return (indexed ??= (async () => {
      const records: DeepReadonly<HistoricalRecord>[] = [];
      let offset: number | null = 0;
      for (let page = 0; offset !== null; page++) {
        if (page >= 10) throw new Error('Person query budget');
        const result = await provider.query({
          startYear: -10000,
          endYear: 10000,
          kinds: ['person', 'person-location'],
          includeUncertain: true,
          includeBiographical: true,
          limit: 100,
          offset,
        });
        records.push(...result.hits.map((h) => h.record));
        if (result.nextOffset !== null && result.nextOffset <= offset)
          throw new Error('Invalid person pagination');
        offset = result.nextOffset;
      }
      return records;
    })().catch((error) => {
      indexed = null;
      throw error;
    }));
  }
  const aliveAtYear = async (year: number) =>
    (await timeline.getPersonsAtYear(year)).map((h) => h.person.record);
  const documentedAtYear = async (year: number, includeApproximate = false) =>
    (await timeline.getPersonsAtYear(year)).flatMap((h) =>
      h.locations
        .filter((l) => {
          const level = personLocationLevel(l.record);
          return level === 'exact' || (includeApproximate && level === 'approximate');
        })
        .map((l) => ({
          person: h.person.record,
          location: l.record,
          level: personLocationLevel(l.record),
        })),
    );
  return {
    PERSON_ALIVE_AT_YEAR: aliveAtYear,
    PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR: documentedAtYear,
    async search(query: string, offset = 0) {
      if (query.length > 300 || !Number.isInteger(offset) || offset < 0 || offset > 1000)
        throw new Error('Person search bounds');
      const key = query.trim().toLocaleLowerCase('tr');
      const matches = (await all()).filter(
        (r): r is DeepReadonly<Person> =>
          r.kind === 'person' &&
          r.reviewStatus === 'verified' &&
          (!key ||
            [...r.names, ...r.alternativeNames].some((n) =>
              n.value.toLocaleLowerCase('tr').includes(key),
            ) ||
            r.wikidataId?.toLocaleLowerCase('tr') === key),
      );
      return {
        total: matches.length,
        records: matches.slice(offset, offset + 8),
        nextOffset: offset + 8 < matches.length ? offset + 8 : null,
      };
    },
    async detail(id: string, year: number) {
      const candidate = await provider.getById(id);
      const person =
        candidate?.kind === 'person'
          ? candidate
          : candidate?.kind === 'person-location'
            ? await provider.getById(candidate.personId)
            : null;
      if (person?.kind !== 'person' || person.reviewStatus !== 'verified') return null;
      const locations = (await all()).filter(
        (r): r is DeepReadonly<PersonLocation> =>
          r.kind === 'person-location' && r.personId === person.id && r.reviewStatus === 'verified',
      );
      const dated = await documentedAtYear(year, true);
      const sources: DeepReadonly<SourceRecord>[] = [];
      for (const sourceId of new Set(
        [person, ...locations].flatMap((r) => r.evidence.map((e) => e.sourceId)),
      )) {
        const source = await provider.getSource(sourceId);
        if (source) sources.push(source);
      }
      return {
        person,
        name: personName(person),
        alive: (await aliveAtYear(year)).some((p) => p.id === person.id),
        locations,
        supportedIds: dated.filter((h) => h.person.id === person.id).map((h) => h.location.id),
        sources,
        year,
      };
    },
  };
}
