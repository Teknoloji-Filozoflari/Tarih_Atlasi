import {
  MIN_YEAR,
  displayYearToAstronomical,
  astronomicalToDisplayYear,
  assertSelectableYear,
} from './year.ts';
export function parseYearInput(input: string, maxYear: number): number | null {
  const match = /^(?:(MÖ|MS)\s*)?([0-9]{1,5})(?:\s*(MÖ|MS))?$/u.exec(
    input.trim().toLocaleUpperCase('tr-TR'),
  );
  if (!match || (match[1] && match[3])) return null;
  const value = Number(match[2]);
  const era = match[1] ?? match[3] ?? 'MS';
  const year = era === 'MÖ' ? -value : value;
  try {
    assertSelectableYear(year, maxYear);
    return year;
  } catch {
    return null;
  }
}
export function jumpYear(year: number, delta: number, maxYear: number) {
  assertSelectableYear(year, maxYear);
  if (!Number.isSafeInteger(delta)) throw new RangeError('Invalid year delta');
  return astronomicalToDisplayYear(
    Math.max(
      displayYearToAstronomical(MIN_YEAR),
      Math.min(displayYearToAstronomical(maxYear), displayYearToAstronomical(year) + delta),
    ),
  );
}
export type TimelineScale = 'all' | 200 | 20;
export function sliderWindow(anchor: number, maxYear: number, scale: TimelineScale) {
  assertSelectableYear(anchor, maxYear);
  if (scale === 'all') return { minYear: MIN_YEAR, maxYear };
  if (scale !== 20 && scale !== 200) throw new RangeError('Invalid timeline scale');
  const min = displayYearToAstronomical(MIN_YEAR);
  const start = Math.max(
    min,
    Math.min(maxYear - scale, displayYearToAstronomical(anchor) - scale / 2),
  );
  return {
    minYear: astronomicalToDisplayYear(start),
    maxYear: astronomicalToDisplayYear(Math.min(maxYear, start + scale)),
  };
}
export function yearFraction(year: number, minYear: number, maxYear: number) {
  const min = displayYearToAstronomical(minYear),
    max = displayYearToAstronomical(maxYear);
  if (min >= max) throw new RangeError('Invalid slider range');
  return Math.max(0, Math.min(1, (displayYearToAstronomical(year) - min) / (max - min)));
}
export function fractionYear(fraction: number, minYear: number, maxYear: number) {
  if (!Number.isFinite(fraction)) throw new RangeError('Invalid position');
  const min = displayYearToAstronomical(minYear),
    max = displayYearToAstronomical(maxYear);
  if (min >= max) throw new RangeError('Invalid slider range');
  return astronomicalToDisplayYear(
    Math.round(min + Math.max(0, Math.min(1, fraction)) * (max - min)),
  );
}
export function keyboardYear(key: string, year: number, maxYear: number): number | null {
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return jumpYear(year, -1, maxYear);
    case 'ArrowRight':
    case 'ArrowUp':
      return jumpYear(year, 1, maxYear);
    case 'PageDown':
      return jumpYear(year, -100, maxYear);
    case 'PageUp':
      return jumpYear(year, 100, maxYear);
    case 'Home':
      return MIN_YEAR;
    case 'End':
      return maxYear;
    default:
      return null;
  }
}
/** Keep real source years; never invent bin-centre dates when thinning dense markers. */
export function snapshotMarkers(
  years: readonly number[],
  minYear: number,
  maxYear: number,
  limit: number,
) {
  if (!Number.isInteger(limit) || limit < 2 || limit > 100)
    throw new RangeError('Invalid marker budget');
  const available = [...new Set(years)]
    .filter((year) => year >= minYear && year <= maxYear)
    .sort((a, b) => displayYearToAstronomical(a) - displayYearToAstronomical(b));
  if (available.length <= limit) return available;
  return Array.from(
    { length: limit },
    (_, i) => available[Math.round((i * (available.length - 1)) / (limit - 1))]!,
  );
}
/** Native thumb is 24 dp wide; map its centre rather than the view's outer edge. */
export function sliderPositionYear(
  position: number,
  width: number,
  minYear: number,
  maxYear: number,
) {
  if (!Number.isFinite(width) || width <= 0) throw new RangeError('Invalid slider width');
  return fractionYear((position - 12) / Math.max(1, width - 24), minYear, maxYear);
}
