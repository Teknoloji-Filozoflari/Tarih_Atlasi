import type { MessageKey } from '../i18n/index.ts';
import { MIN_YEAR } from '../timeline/year.ts';
import { yearFraction } from '../timeline/interaction.ts';

/** UI navigation windows from product docs — not historical empire claims. */
export interface PeriodWindow {
  readonly id: string;
  readonly labelKey: MessageKey;
  readonly rangeKey: MessageKey;
  readonly start: number;
  readonly end: number;
  readonly targetYear: number;
}

type PeriodDef = {
  readonly id: string;
  readonly labelKey: MessageKey;
  readonly rangeKey: MessageKey;
  readonly start: number | null;
  readonly end: number | null;
  readonly targetYear: number | null;
};

/** Fixed product windows; `present` end/target resolve against `maxYear`. */
export const PERIOD_WINDOW_DEFS: readonly PeriodDef[] = [
  {
    id: 'range-start',
    labelKey: 'period.rangeStart',
    rangeKey: 'period.rangeStart.range',
    start: MIN_YEAR,
    end: MIN_YEAR,
    targetYear: MIN_YEAR,
  },
  {
    id: 'pilot-p01',
    labelKey: 'period.pilotP01',
    rangeKey: 'period.pilotP01.range',
    start: -1600,
    end: -1200,
    targetYear: -1400,
  },
  {
    id: 'era-ms1',
    labelKey: 'period.eraMs1',
    rangeKey: 'period.eraMs1.range',
    start: 1,
    end: 1,
    targetYear: 1,
  },
  {
    id: 'pilot-p02',
    labelKey: 'period.pilotP02',
    rangeKey: 'period.pilotP02.range',
    start: 1200,
    end: 1200,
    targetYear: 1200,
  },
  {
    id: 'pilot-p03',
    labelKey: 'period.pilotP03',
    rangeKey: 'period.pilotP03.range',
    start: 1923,
    end: 1923,
    targetYear: 1923,
  },
  {
    id: 'present',
    labelKey: 'period.present',
    rangeKey: 'period.present.range',
    start: null,
    end: null,
    targetYear: null,
  },
];

export function periodWindows(maxYear: number): readonly PeriodWindow[] {
  if (!Number.isInteger(maxYear) || maxYear < 1) throw new RangeError('PERIOD_MAX_YEAR');
  return PERIOD_WINDOW_DEFS.map((def) => ({
    id: def.id,
    labelKey: def.labelKey,
    rangeKey: def.rangeKey,
    start: def.start ?? maxYear,
    end: def.end ?? maxYear,
    targetYear: def.targetYear ?? maxYear,
  }));
}

/** Narrowest inclusive window containing `year`, if any. */
export function activePeriodId(year: number, maxYear: number): string | null {
  const windows = periodWindows(maxYear);
  let best: PeriodWindow | null = null;
  let bestSpan = Number.POSITIVE_INFINITY;
  for (const window of windows) {
    if (year < window.start || year > window.end) continue;
    const span = window.end - window.start;
    if (span < bestSpan) {
      best = window;
      bestSpan = span;
    }
  }
  return best?.id ?? null;
}

export function periodHighlight(
  periodId: string | null,
  maxYear: number,
  minYear: number,
  viewMax: number,
): { startFraction: number; endFraction: number } | null {
  if (!periodId) return null;
  const period = periodWindows(maxYear).find((p) => p.id === periodId);
  if (!period) return null;
  const start = Math.max(minYear, Math.min(viewMax, period.start));
  const end = Math.max(minYear, Math.min(viewMax, period.end));
  if (end < start) return null;
  return {
    startFraction: yearFraction(start, minYear, viewMax),
    endFraction: yearFraction(end, minYear, viewMax),
  };
}
