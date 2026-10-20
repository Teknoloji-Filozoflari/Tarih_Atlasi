/** Historical display years: negative BCE, positive CE, never zero. */
export const MIN_YEAR = -2000;
export function displayYearToAstronomical(year: number): number {
  if (!Number.isInteger(year) || year === 0 || Math.abs(year) > 10000)
    throw new RangeError('Historical year must be a nonzero integer within ±10000');
  return year < 0 ? year + 1 : year;
}
export function astronomicalToDisplayYear(year: number): number {
  if (!Number.isInteger(year) || year < -9999 || year > 10000)
    throw new RangeError('Astronomical year outside supported range');
  return year <= 0 ? year - 1 : year;
}
export function selectableYearRange(now = new Date()) {
  const maxYear = now.getFullYear();
  if (!Number.isInteger(maxYear) || maxYear < 1 || maxYear > 10000)
    throw new RangeError('System year outside supported range');
  return { minYear: MIN_YEAR, maxYear };
}
export function assertSelectableYear(year: number, maxYear = selectableYearRange().maxYear) {
  displayYearToAstronomical(year);
  if (year < MIN_YEAR || year > maxYear) throw new RangeError('Year outside selectable range');
}
export function stepDisplayYear(year: number, direction: -1 | 1, maxYear: number) {
  assertSelectableYear(year, maxYear);
  if (direction !== -1 && direction !== 1) throw new RangeError('Invalid step');
  const ordinal = displayYearToAstronomical(year) + direction;
  return astronomicalToDisplayYear(
    Math.max(displayYearToAstronomical(MIN_YEAR), Math.min(maxYear, ordinal)),
  );
}
/** Calendar-year steps; deliberately not elapsed days. */
export function elapsedYears(start: number, end: number) {
  return displayYearToAstronomical(end) - displayYearToAstronomical(start);
}
export function inclusiveYearCount(start: number, end: number) {
  const elapsed = elapsedYears(start, end);
  if (elapsed < 0) throw new RangeError('Reversed interval');
  return elapsed + 1;
}
