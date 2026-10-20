import type { HistoricalEntity, TemporalExtent } from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';
import { intersectsYear } from '../domain/temporal.ts';
import { theme } from '../theme/tokens.ts';
export const CULTURAL_TYPES = ['CULTURE', 'CIVILIZATION', 'CULTURAL_REGION'] as const;
export const isCultural = (entity: DeepReadonly<HistoricalEntity>) =>
  CULTURAL_TYPES.some((type) => type === entity.entityType);
export function culturalName(entity: DeepReadonly<HistoricalEntity>) {
  return entity.names.find((name) => name.language === 'tr')?.value ?? entity.names[0]!.value;
}
export function culturalAtYear(temporal: DeepReadonly<TemporalExtent>, year: number) {
  return (
    temporal.reviewStatus === 'verified' &&
    temporal.start.kind === 'known' &&
    temporal.end.kind === 'known' &&
    temporal.precision !== 'unknown' &&
    intersectsYear(temporal as TemporalExtent, year)
  );
}
export function cultureColor(entityId: string) {
  let hash = 0;
  for (const c of entityId) hash = (Math.imul(hash, 31) + c.codePointAt(0)!) >>> 0;
  return theme.culturalPalette[hash % theme.culturalPalette.length]!;
}
/** Even N fully overlapping fills have composite opacity <= .30; no data is dropped. */
export function culturalFillOpacity(count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 1000)
    throw new RangeError('Culture density budget');
  return Math.min(0.1, 1 - Math.pow(0.7, 1 / count));
}
