import type { HistoricalEvent, HistoricalEventType } from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';
export const eventLayer = (type: HistoricalEventType): 'battle' | 'event' =>
  type === 'WAR' || type === 'BATTLE' || type === 'CAMPAIGN' ? 'battle' : 'event';
export const eventSymbol = (type: HistoricalEventType) =>
  type === 'WAR' || type === 'CAMPAIGN'
    ? '⚑'
    : type === 'BATTLE'
      ? '⚔'
      : type === 'TREATY'
        ? '§'
        : '✦';
export function eventTitle(record: DeepReadonly<HistoricalEvent>) {
  return (record.names.find((n) => n.language === 'tr') ?? record.names[0]!).value;
}
/** Common catalog fields are canonical; never keep two mutable date/source stores. */
export const eventProjection = (record: DeepReadonly<HistoricalEvent>) => ({
  id: record.id,
  title: eventTitle(record),
  dateExtent: record.temporal,
  placeId: record.details?.placeId ?? null,
  participants: record.participantIds,
  sources: record.evidence,
  reviewStatus: record.reviewStatus,
});
export function eventHasMapEvidence(record: DeepReadonly<HistoricalEvent>) {
  const t = record.temporal;
  if (
    record.reviewStatus !== 'verified' ||
    t.reviewStatus !== 'verified' ||
    t.start.kind !== 'known' ||
    t.end.kind !== 'known' ||
    t.precision === 'unknown' ||
    !t.support ||
    !record.geometry ||
    (record.eventType === 'WAR' && record.geometry.type === 'Point') ||
    record.locationSemantics === 'unknown' ||
    ['low', 'unknown'].includes(record.confidence.level)
  )
    return false;
  if (!record.evidence.some((e) => e.claims.includes('temporal') && e.claims.includes('geometry')))
    return false;
  const p = record.details?.locationPrecision;
  return (
    !!p &&
    (record.geometry.type === 'Point'
      ? ['site', 'approximate-point'].includes(p.classification)
      : p.classification === 'documented-region')
  );
}
