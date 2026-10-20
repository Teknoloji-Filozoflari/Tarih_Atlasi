import { t } from '../i18n/index.ts';
import { displayYearToAstronomical } from '../timeline/year.ts';
export function yearLabel(year: number) {
  displayYearToAstronomical(year);
  return `${t(year < 0 ? 'atlas.bce' : 'atlas.ce')} ${Math.abs(year)}`;
}
