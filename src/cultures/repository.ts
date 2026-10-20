import type { HistoricalDataProvider, DeepReadonly } from '../data/provider.ts';
import type { CulturalRelationship, SourceRecord } from '../domain/types.ts';
import { createTimelineEngine, type TimelineEngine } from '../timeline/engine.ts';
import { culturalAtYear, culturalName, isCultural } from './model.ts';
export function createCulturalRepository(
  provider: HistoricalDataProvider,
  timeline: TimelineEngine = createTimelineEngine(provider),
) {
  const cache = new Map<number, Promise<DeepReadonly<CulturalRelationship>[]>>();
  function relationsAt(year: number) {
    const previous = cache.get(year);
    if (previous) {
      cache.delete(year);
      cache.set(year, previous);
      return previous;
    }
    const promise = (async () => {
      const relations: DeepReadonly<CulturalRelationship>[] = [];
      let offset: number | null = 0;
      for (let page = 0; offset !== null; page++) {
        if (page >= 10) throw new Error('Cultural query budget');
        const result = await provider.query({
          startYear: year,
          endYear: year,
          kinds: ['cultural-relationship'],
          includeUncertain: true,
          limit: 100,
          offset,
        });
        for (const hit of result.hits)
          if (
            hit.record.kind === 'cultural-relationship' &&
            hit.record.reviewStatus === 'verified' &&
            culturalAtYear(hit.record.temporal, year)
          )
            relations.push(hit.record);
        if (result.nextOffset !== null && result.nextOffset <= offset)
          throw new Error('Invalid cultural pagination');
        offset = result.nextOffset;
      }
      return relations;
    })().catch((error) => {
      cache.delete(year);
      throw error;
    });
    cache.set(year, promise);
    if (cache.size > 32) cache.delete(cache.keys().next().value!);
    return promise;
  }
  return {
    async detail(id: string, requestedYear: number, sourceYear = requestedYear) {
      const region = await provider.getById(id);
      if (region?.kind !== 'cultural-region') return null;
      const entity = await provider.getById(region.entityId);
      if (entity?.kind !== 'entity' || !isCultural(entity)) return null;
      const [atYear, allRelations] = await Promise.all([
        timeline.getCulturesAtYear(sourceYear),
        relationsAt(sourceYear),
      ]);
      const supported = atYear.some((hit) => hit.record.id === region.id);
      const relations = supported
        ? allRelations.filter((r) =>
            r.regionIds.length
              ? r.regionIds.includes(region.id)
              : r.fromEntityId === entity.id || r.toEntityId === entity.id,
          )
        : [];
      const sources: DeepReadonly<SourceRecord>[] = [];
      for (const sourceId of new Set(
        [...region.evidence, ...entity.evidence, ...relations.flatMap((r) => r.evidence)].map(
          (e) => e.sourceId,
        ),
      )) {
        const source = await provider.getSource(sourceId);
        if (source) sources.push(source);
      }
      return {
        region,
        entity,
        name: culturalName(entity),
        supported,
        requestedYear,
        sourceYear,
        relations,
        sources,
        wikipedia: supported ? (region.wikipedia ?? null) : null,
      };
    },
  };
}
