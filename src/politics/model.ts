import type {
  HistoricalEntity,
  PoliticalAssertion,
  PoliticalType,
  TemporalExtent,
  TerritoryVersion,
  PoliticalRelationship,
} from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';
import { intersectsYear } from '../domain/temporal.ts';
import { theme } from '../theme/tokens.ts';
import { shortCountryName } from './short-names.ts';
export const isPolitical = (entity: DeepReadonly<HistoricalEntity>) =>
  ['POLITY', 'KINGDOM', 'EMPIRE'].includes(entity.entityType);
export function supportedAt(temporal: DeepReadonly<TemporalExtent>, year: number) {
  return (
    temporal.reviewStatus === 'verified' &&
    temporal.start.kind === 'known' &&
    temporal.end.kind === 'known' &&
    temporal.precision !== 'unknown' &&
    intersectsYear(temporal as TemporalExtent, year)
  );
}
function assertionAt(
  entity: DeepReadonly<HistoricalEntity>,
  assertion: DeepReadonly<PoliticalAssertion>,
  year: number,
) {
  return (
    entity.reviewStatus === 'verified' &&
    supportedAt(assertion.temporal, year) &&
    assertion.evidenceIndices.length > 0 &&
    assertion.evidenceIndices.every((index) => !!entity.evidence[index])
  );
}
export function politicalClasses(
  entity: DeepReadonly<HistoricalEntity>,
  year: number,
): PoliticalType[] {
  if (
    !isPolitical(entity) ||
    entity.reviewStatus !== 'verified' ||
    !supportedAt(entity.temporal, year)
  )
    return [];
  const classes =
    entity.politicalProfile?.classifications
      .filter((a) => assertionAt(entity, a, year))
      .map((a) => a.value) ?? [];
  return [
    ...new Set<PoliticalType>([
      'POLITY',
      ...(entity.politicalProfile?.classifications.length
        ? classes
        : [entity.entityType as PoliticalType]),
    ]),
  ];
}
export function politicalNames(entity: DeepReadonly<HistoricalEntity>, year: number) {
  const dated = entity.politicalProfile?.names.filter((a) => assertionAt(entity, a, year)) ?? [];
  const sorted = [...dated].sort(
    (a, b) =>
      Number(b.name.language === 'tr') - Number(a.name.language === 'tr') ||
      Number(b.usage === 'preferred') - Number(a.usage === 'preferred') ||
      a.id.localeCompare(b.id, 'en'),
  );
  const fallback = [...entity.names].sort(
    (a, b) => Number(b.language === 'tr') - Number(a.language === 'tr'),
  );
  const full = sorted[0]?.name.value ?? fallback[0]?.value ?? entity.id;
  const short = shortCountryName(full);
  return {
    name: short,
    alternatives: [
      ...new Set([
        ...(short !== full ? [full] : []),
        ...sorted.slice(1).map((a) => a.name.value),
        ...(entity.politicalProfile?.names.length
          ? []
          : entity.alternativeNames.map((n) => n.value)),
      ]),
    ],
  };
}
export function politicalDescriptions(entity: DeepReadonly<HistoricalEntity>, year: number) {
  return (
    entity.politicalProfile?.descriptions.filter((a) => assertionAt(entity, a, year)) ?? []
  ).sort((a, b) => Number(b.language === 'tr') - Number(a.language === 'tr'));
}
export function politicalCapitals(entity: DeepReadonly<HistoricalEntity>, year: number) {
  return entity.politicalProfile?.capitals.filter((a) => assertionAt(entity, a, year)) ?? [];
}
export function polityColor(entityId: string) {
  let hash = 2166136261;
  for (const character of entityId) {
    hash ^= character.codePointAt(0)!;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  // Identity, not year, result order or geometry: split islands and adjacent
  // snapshots keep their color. Light atlas colors preserve dark small-label contrast.
  const color = theme.politicalMap.color;
  const hue = hash % 360;
  const lightness = color.minimumLightness + ((hash >>> 16) % color.lightnessSteps);
  return `hsl(${hue}, ${color.saturation}%, ${lightness}%)`;
}
export function politicalAppearance(
  territory: DeepReadonly<TerritoryVersion>,
  relations: readonly DeepReadonly<PoliticalRelationship>[],
) {
  const kinds = relations
    .filter((r) =>
      r.territoryIds.length
        ? r.territoryIds.includes(territory.id)
        : r.fromEntityId === territory.entityId ||
          (r.relationship !== 'vassalage' && r.toEntityId === territory.entityId),
    )
    .map((r) => r.relationship);
  const disputed =
    territory.boundary === 'disputed' ||
    territory.politicalStatus === 'claimed' ||
    territory.politicalStatus === 'disputed' ||
    kinds.includes('disputed-control') ||
    kinds.includes('overlapping-claim');
  const shared = territory.politicalStatus === 'shared' || kinds.includes('shared-control');
  const vassal = kinds.includes('vassalage');
  const approximate =
    territory.boundary !== 'documented' || territory.borderPrecision.classification !== 'surveyed';
  return {
    lineStyle: disputed
      ? 'disputed'
      : shared
        ? 'shared'
        : vassal
          ? 'vassal'
          : approximate
            ? 'approximate'
            : 'documented',
    fillOpacity: disputed
      ? theme.politicalMap.fillOpacity.disputed
      : shared
        ? theme.politicalMap.fillOpacity.shared
        : vassal
          ? theme.politicalMap.fillOpacity.vassal
          : theme.politicalMap.fillOpacity.normal,
  };
}
