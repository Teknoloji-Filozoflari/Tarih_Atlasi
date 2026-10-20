import type { HistoricalDataProvider, DeepReadonly } from './provider.ts';
import type { HistoricalRecord } from '../domain/types.ts';
import type { TimelineEngine } from '../timeline/engine.ts';
import type { SearchIndex } from '../discovery/search.ts';
import type { WorldRepository } from './world/repository.ts';
import { withWorldProvider } from './world/provider.ts';
import { withWorldTimeline } from './world/timeline.ts';
import { withWorldSearch } from './world/search.ts';
import { worldInput } from './world/records.ts';
import { createPoliticalRepository } from '../politics/repository.ts';
import { createSourceRepository } from '../sources/repository.ts';
import { validateCatalog } from '../domain/validate.ts';
import type { PeopleExtension } from '../people/extension.ts';
import { createTimelineEngine } from '../timeline/engine.ts';
import { createSearchIndex } from '../discovery/search.ts';
import { createPersonRepository } from '../persons/repository.ts';
import { withRequestedPeople } from '../people/request-search.ts';
import { createEventRepository } from '../events/repository.ts';
import type { HistoryRepository } from '../history/repository.ts';
import { withHistoryTimeline } from '../history/timeline.ts';
import { withHistoryProvider } from '../history/provider.ts';
import { withHistorySearch } from '../history/search.ts';
import { withHistoryPersons } from '../history/persons.ts';
export function createApplicationData(
  base: {
    provider: HistoricalDataProvider;
    timeline: TimelineEngine;
    search: SearchIndex;
    catalog: unknown;
  },
  world: WorldRepository,
  people?: PeopleExtension,
  history?: HistoryRepository,
) {
  const catalog = validateCatalog(base.catalog);
  if (!catalog.ok) throw new Error('BOOTSTRAP_RIGHTS');
  const localProvider = people ? people.withProvider(base.provider) : base.provider;
  const localTimeline = people ? createTimelineEngine(localProvider) : base.timeline;
  // Search projection only. Every extension catalog was separately schema/rights/hash-validated.
  const localRecords = new Map<string, DeepReadonly<HistoricalRecord>>(
    catalog.value.records.map((r) => [r.id, r]),
  );
  for (const record of people?.records ?? []) localRecords.set(record.id, record);
  const search = people
    ? createSearchIndex({ ...catalog.value, records: [...localRecords.values()] }, localTimeline)
    : base.search;
  const timeline = withWorldTimeline(
    history ? withHistoryTimeline(localTimeline, history) : localTimeline,
    world,
  );
  const worldProvider = withWorldProvider(localProvider, world);
  const provider = history ? withHistoryProvider(worldProvider, history) : worldProvider;
  const localPersons = createPersonRepository(localProvider, localTimeline);
  const worldSearch = withWorldSearch(search, timeline, world);
  return {
    provider,
    timeline,
    search: withRequestedPeople(
      history ? withHistorySearch(worldSearch, timeline, history) : worldSearch,
    ),
    persons: history ? withHistoryPersons(localPersons, timeline, history) : localPersons,
    events: createEventRepository(
      history ? withHistoryProvider(localProvider, history) : localProvider,
      history ? withHistoryTimeline(localTimeline, history) : localTimeline,
    ),
    politics: createPoliticalRepository(worldProvider, timeline),
    sources: createSourceRepository(
      provider,
      [...catalog.value.inputs, ...(people?.inputs ?? []), worldInput],
      history ? history.rawInput : undefined,
    ),
  };
}
