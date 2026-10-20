import { yearFraction } from './interaction.ts';
/** Round historical years, with no year zero. Marks describe scale, not data coverage. */
export function timelineRuler(minYear: number, maxYear: number, compact: boolean) {
  const span = maxYear - minYear - (minYear < 0 && maxYear > 0 ? 1 : 0);
  if (
    !Number.isInteger(minYear) ||
    !Number.isInteger(maxYear) ||
    minYear < -2000 ||
    maxYear > 9999 ||
    minYear === 0 ||
    maxYear === 0 ||
    span <= 0
  )
    throw new RangeError('TIMELINE_RULER_RANGE');
  const target = compact ? 3 : 8;
  const step =
    [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000].find((v) => span / v <= target) ?? 2000;
  const years = new Set([minYear, maxYear]);
  for (let year = Math.ceil(minYear / step) * step; year <= maxYear; year += step) {
    const value = year === 0 ? 1 : year;
    if (value < minYear || value > maxYear) continue;
    const fraction = yearFraction(value, minYear, maxYear);
    if (fraction > (compact ? 0.15 : 0.08) && fraction < (compact ? 0.85 : 0.92)) years.add(value);
  }
  return [...years]
    .sort((a, b) => a - b)
    .map((year) => ({ year, fraction: yearFraction(year, minYear, maxYear) }));
}
