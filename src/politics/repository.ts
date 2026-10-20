import type { HistoricalDataProvider, DeepReadonly } from '../data/provider.ts';
import type {
  HistoricalEntity,
  PoliticalRelationship,
  SourceRecord,
  HistoricalPlace,
} from '../domain/types.ts';
import { createTimelineEngine, type TimelineEngine } from '../timeline/engine.ts';
import {
  isPolitical,
  politicalClasses,
  politicalNames,
  politicalCapitals,
  politicalDescriptions,
  supportedAt,
} from './model.ts';
export function createPoliticalRepository(
  provider: HistoricalDataProvider,
  timeline: TimelineEngine = createTimelineEngine(provider),
) {
  const cache = new Map<
    number,
    Promise<{
      entities: Map<string, DeepReadonly<HistoricalEntity>>;
      relations: DeepReadonly<PoliticalRelationship>[];
    }>
  >();
  function context(year: number) {
    const cached = cache.get(year);
    if (cached) {
      cache.delete(year);
      cache.set(year, cached);
      return cached;
    }
    const value = (async () => {
      const entities = new Map<string, DeepReadonly<HistoricalEntity>>(),
        relations: DeepReadonly<PoliticalRelationship>[] = [];
      let offset: number | null = 0;
      for (let page = 0; offset !== null; page++) {
        if (page >= 10) throw new Error('Political context budget exceeded');
        const result = await provider.query({
          startYear: year,
          endYear: year,
          kinds: ['entity', 'political-relationship'],
          includeUncertain: true,
          offset,
          limit: 100,
        });
        for (const { record } of result.hits)
          if (record.reviewStatus === 'verified' && supportedAt(record.temporal, year)) {
            if (record.kind === 'entity' && isPolitical(record)) entities.set(record.id, record);
            if (record.kind === 'political-relationship') relations.push(record);
          }
        if (result.nextOffset !== null && result.nextOffset <= offset)
          throw new Error('Invalid political pagination');
        offset = result.nextOffset;
      }
      return { entities, relations };
    })().catch((error) => {
      cache.delete(year);
      throw error;
    });
    cache.set(year, value);
    if (cache.size > 32) cache.delete(cache.keys().next().value!);
    return value;
  }
  return {
    context,
    async detail(id: string, requestedYear: number, sourceYear = requestedYear) {
      const territory = await provider.getById(id);
      if (territory?.kind !== 'territory') return null;
      const entity = await provider.getById(territory.entityId);
      if (entity?.kind !== 'entity' || !isPolitical(entity)) return null;
      const [atYear, ctx] = await Promise.all([
        timeline.getTerritoriesAtYear(sourceYear),
        context(sourceYear),
      ]);
      const supported = atYear.some((hit) => hit.record.id === territory.id);
      const relations = supported
        ? ctx.relations.filter((relation) =>
            relation.territoryIds.length > 0
              ? relation.territoryIds.includes(id)
              : relation.fromEntityId === entity.id || relation.toEntityId === entity.id,
          )
        : [];
      const capitals: { place: DeepReadonly<HistoricalPlace>; claimId: string }[] = [];
      if (supported)
        for (const claim of politicalCapitals(entity, sourceYear)) {
          const place = await provider.getById(claim.placeId);
          if (
            place?.kind === 'place' &&
            place.reviewStatus === 'verified' &&
            supportedAt(place.temporal, sourceYear)
          )
            capitals.push({ place, claimId: claim.id });
        }
      const sourceIds = [
        ...new Set(
          [
            ...territory.evidence,
            ...entity.evidence,
            ...relations.flatMap((r) => r.evidence),
            ...capitals.flatMap((capital) => capital.place.evidence),
          ].map((e) => e.sourceId),
        ),
      ];
      const sources: DeepReadonly<SourceRecord>[] = [];
      for (const sourceId of sourceIds) {
        const source = await provider.getSource(sourceId);
        if (source) sources.push(source);
      }
      return {
        supported,
        requestedYear,
        sourceYear,
        territory,
        entity,
        ...politicalNames(entity, sourceYear),
        classes: supported ? politicalClasses(entity, sourceYear) : [],
        descriptions: supported ? politicalDescriptions(entity, sourceYear) : [],
        uncertainProfile:
          supported &&
          [
            ...(entity.politicalProfile?.classifications ?? []),
            ...(entity.politicalProfile?.names ?? []),
            ...(entity.politicalProfile?.descriptions ?? []),
            ...(entity.politicalProfile?.capitals ?? []),
          ].some((claim) => supportedAt(claim.temporal, sourceYear) && claim.temporal.uncertain),
        capitals,
        relations: relations.map((relation) => ({
          record: relation,
          from: ctx.entities.get(relation.fromEntityId)
            ? politicalNames(ctx.entities.get(relation.fromEntityId)!, sourceYear).name
            : relation.fromEntityId,
          to: ctx.entities.get(relation.toEntityId)
            ? politicalNames(ctx.entities.get(relation.toEntityId)!, sourceYear).name
            : relation.toEntityId,
        })),
        sources,
      };
    },
  };
}
