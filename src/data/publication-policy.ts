/** Release review overlay: preserves the original extraction without endorsing contested geography. */
export const publicationPolicyVersion = '1.0.0';
export const withheldGeography = Object.freeze([
  'atlas:van-gogh-maison-residence',
  'atlas:maison-van-gogh',
]);
export function geographyWithheld(id: string): boolean {
  return withheldGeography.includes(id);
}
export const publicationReview = Object.freeze({
  reviewedAt: '2026-10-16',
  reason:
    'One modern house point must not represent two separately documented Cuesmes residences across 1879–1880. Do not guess a corrected date or coordinate.',
  reference: 'https://archive.artic.edu/van-gogh-bedrooms/timeline',
  referenceSections: ['Early August 1879: Francq residence', 'July 1880: Decrucq residence'],
  resolution: 'WITHHELD_FROM_GEOGRAPHY_PENDING_MANUAL_SOURCE_REVIEW',
});
