import type { TemporalExtent } from '../domain/types.ts';
/** Structured presentation keeps missing components null. No Jan 1 or fake day. */
export function describeTemporal(extent: TemporalExtent) {
  const describe = (bound: TemporalExtent['start']) =>
    bound.kind === 'known' ? { ...bound.date } : null;
  return {
    start: describe(extent.start),
    end: describe(extent.end),
    precision: extent.precision,
    uncertain: extent.uncertain,
    sourceDate: { ...extent.sourceDate },
    support: extent.support ? { ...extent.support } : null,
    periods: extent.periods?.map((p) => ({ start: { ...p.start }, end: { ...p.end } })) ?? null,
    reviewStatus: extent.reviewStatus,
  };
}
