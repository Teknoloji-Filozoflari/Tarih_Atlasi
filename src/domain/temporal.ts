import type { HistoricalDate, TemporalBound, TemporalExtent, ReviewStatus } from './types.ts';
import { displayYearToAstronomical } from '../timeline/year.ts';
import {
  enumeration,
  object,
  numeric,
  nullable,
  refine,
  text,
  boolean,
  union,
  issue,
  type Schema,
  array,
} from './schema.ts';

export const reviewSchema = enumeration([
  'unverified',
  'in-review',
  'verified',
  'rejected',
] as const) satisfies Schema<ReviewStatus>;
export function ordinalYear(year: number): number {
  return displayYearToAstronomical(year);
}
export function daysInMonth(year: number, month: number): number {
  const y = ordinalYear(year);
  if (month === 2) return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}
export const historicalDateSchema: Schema<HistoricalDate> = refine(
  object<HistoricalDate>({
    year: numeric(-10000, 10000, true),
    month: nullable(numeric(1, 12, true)),
    day: nullable(numeric(1, 31, true)),
  }),
  (date, path, issues) => {
    if (date.year === 0) issue(issues, path, 'YEAR_ZERO', 'Tarihî yıl numaralamasında yıl 0 yok.');
    else if (
      date.day !== null &&
      (date.month === null || date.day > daysInMonth(date.year, date.month))
    )
      issue(issues, path, 'INVALID_DATE', 'Geçersiz gün/ay; hassasiyet uydurulamaz.');
  },
);
const boundSchema: Schema<TemporalBound> = union([
  object({ kind: enumeration(['known'] as const), date: historicalDateSchema }),
  object({
    kind: enumeration(['unknown', 'unbounded'] as const),
    date: enumeration([null] as const),
  }),
]);
// Ordering keys, not elapsed-day measurements. Gaps between months are intentional.
export function dateKey(date: HistoricalDate, upper = false): number {
  const month = date.month ?? (upper ? 12 : 1);
  const day = date.day ?? (upper ? daysInMonth(date.year, month) : 1);
  return ordinalYear(date.year) * 372 + (month - 1) * 31 + day - 1;
}
export function temporalRange(extent: TemporalExtent) {
  return {
    start:
      extent.start.kind === 'known'
        ? dateKey(extent.start.date)
        : extent.start.kind === 'unbounded'
          ? -Infinity
          : null,
    end:
      extent.end.kind === 'known'
        ? dateKey(extent.end.date, true)
        : extent.end.kind === 'unbounded'
          ? Infinity
          : null,
    uncertain: extent.uncertain || extent.start.kind === 'unknown' || extent.end.kind === 'unknown',
  };
}
export function temporalIntervals(extent: TemporalExtent) {
  return (
    extent.periods?.map((period) => ({
      start: dateKey(period.start),
      end: dateKey(period.end, true),
    })) ?? [temporalRange(extent)]
  );
}
export function intersectsYear(extent: TemporalExtent, year: number): boolean {
  const start = dateKey({ year, month: null, day: null });
  const end = dateKey({ year, month: null, day: null }, true);
  return temporalIntervals(extent).some(
    (interval) =>
      interval.start !== null &&
      interval.end !== null &&
      interval.start <= end &&
      interval.end >= start,
  );
}
/** Unknown bounds remain unknown; known contradictions and documented gaps are rejected. */
export function temporalContradictsParent(child: TemporalExtent, parent: TemporalExtent) {
  const bounds = temporalRange(parent);
  return temporalIntervals(child).some(
    (period) =>
      (bounds.start !== null && period.start !== null && period.start < bounds.start) ||
      (bounds.end !== null && period.end !== null && period.end > bounds.end) ||
      (!!parent.periods &&
        period.start !== null &&
        period.end !== null &&
        !temporalIntervals(parent).some(
          (p) =>
            p.start !== null && p.end !== null && period.start! >= p.start && period.end! <= p.end,
        )),
  );
}
export const temporalExtentSchema: Schema<TemporalExtent> = refine(
  object<TemporalExtent>(
    {
      start: boundSchema,
      end: boundSchema,
      precision: enumeration([
        'day',
        'month',
        'year',
        'decade',
        'century',
        'range',
        'unknown',
      ] as const),
      uncertain: boolean,
      calendar: enumeration(['proleptic-gregorian'] as const),
      yearNumbering: enumeration(['historical-no-zero'] as const),
      sourceDate: object({ text: text(), calendar: text(100), yearNumbering: text(100) }),
      basis: enumeration(['observed', 'derived'] as const),
      reviewStatus: reviewSchema,
      support: object({ kind: enumeration(['snapshot', 'continuous'] as const), note: text() }),
      periods: array(object({ start: historicalDateSchema, end: historicalDateSchema }), 1, 64),
    },
    ['support', 'periods'],
  ),
  (extent, path, issues) => {
    const range = temporalRange(extent);
    if (range.start !== null && range.end !== null && range.start > range.end)
      issue(issues, path, 'TEMPORAL_ORDER', 'Başlangıç bitişten sonra olamaz.');
    if (
      (extent.start.kind === 'unknown' ||
        extent.end.kind === 'unknown' ||
        ['decade', 'century', 'range', 'unknown'].includes(extent.precision)) &&
      !extent.uncertain
    )
      issue(issues, path, 'UNCERTAINTY_REQUIRED', 'Bilinmeyen/kaba tarih belirsizlik taşımalı.');
    if (
      extent.support &&
      (extent.start.kind !== 'known' ||
        extent.end.kind !== 'known' ||
        extent.precision === 'unknown')
    )
      issue(
        issues,
        path,
        'SUPPORT_DATE_REQUIRED',
        'Coğrafi geçerlilik için bilinen kaynak tarihleri gerekli.',
      );
    if (extent.periods && (extent.start.kind !== 'known' || extent.end.kind !== 'known'))
      issue(issues, path, 'PERIOD_ENVELOPE', 'Kesintili dönemler bilinen bir dış zarf ister.');
    let previousEnd = -Infinity;
    for (const period of extent.periods ?? []) {
      const start = dateKey(period.start),
        end = dateKey(period.end, true);
      if (
        start > end ||
        start <= previousEnd ||
        range.start === null ||
        range.end === null ||
        start < range.start ||
        end > range.end
      )
        issue(
          issues,
          path,
          'PERIOD_ORDER',
          'Dönemler sıralı, çakışmasız ve dış tarih zarfının içinde olmalı.',
        );
      previousEnd = end;
    }
    const periods =
      extent.periods ??
      (extent.start.kind === 'known' && extent.end.kind === 'known'
        ? [{ start: extent.start.date, end: extent.end.date }]
        : []);
    if (extent.support?.kind === 'snapshot' && periods.some((p) => p.start.year !== p.end.year))
      issue(issues, path, 'SNAPSHOT_YEAR', 'Snapshot birden fazla yıla uzatılamaz.');
    for (const bound of [
      extent.start,
      extent.end,
      ...(extent.periods ?? []).flatMap((p) => [
        { kind: 'known' as const, date: p.start },
        { kind: 'known' as const, date: p.end },
      ]),
    ]) {
      if (bound.kind !== 'known') continue;
      const date = bound.date;
      if (
        (extent.precision === 'day' && (date.month === null || date.day === null)) ||
        (extent.precision === 'month' && (date.month === null || date.day !== null)) ||
        (['year', 'decade', 'century', 'range', 'unknown'].includes(extent.precision) &&
          (date.month !== null || date.day !== null))
      )
        issue(
          issues,
          path,
          'PRECISION_CONFLICT',
          'Tarih alanları belirtilen hassasiyetle uyuşmuyor.',
        );
    }
  },
);
