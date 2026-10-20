import { geographyWithheld } from '../data/publication-policy.ts';
import type { Person, PersonLocation } from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';

export type LocationEvidenceLevel = 'exact' | 'approximate' | 'biographical' | 'unsupported';
/** Evidence classification, never derived from the person's lifetime or a place centroid. */
export function personLocationLevel(location: DeepReadonly<PersonLocation>): LocationEvidenceLevel {
  if (geographyWithheld(location.id) || location.reviewStatus !== 'verified') return 'unsupported';
  if (location.locationType === 'biographical') return 'biographical';
  const t = location.temporal;
  if (
    t.reviewStatus !== 'verified' ||
    t.start.kind !== 'known' ||
    t.end.kind !== 'known' ||
    !t.support ||
    !location.evidence.some(
      (e) => e.claims.includes('location') && e.claims.includes('temporal'),
    ) ||
    ['low', 'unknown'].includes(location.confidence.level)
  )
    return 'unsupported';
  if (
    !location.geometry ||
    !location.spatialContext ||
    !['site', 'city'].includes(location.spatialContext.scale)
  )
    return 'unsupported';
  return !t.uncertain &&
    ['day', 'month', 'year'].includes(t.precision) &&
    location.confidence.level === 'high' &&
    location.spatialContext.coordinateRole === 'documented-site'
    ? 'exact'
    : 'approximate';
}
export function personName(person: DeepReadonly<Person>) {
  const name = person.names.find((n) => n.language === 'tr') ?? person.names[0]!;
  return { value: name.value, language: name.language, fallback: name.language !== 'tr' };
}
export function personDescription(person: DeepReadonly<Person>) {
  const descriptions = person.profile?.descriptions ?? [];
  return descriptions.find((d) => d.language === 'tr') ?? descriptions[0] ?? null;
}
/** Aliases expose the canonical TemporalExtent; there is no second, contradictory date store. */
export const personLocationDates = (location: DeepReadonly<PersonLocation>) => ({
  validFrom: location.temporal.start,
  validTo: location.temporal.end,
  precision: location.temporal.precision,
});
