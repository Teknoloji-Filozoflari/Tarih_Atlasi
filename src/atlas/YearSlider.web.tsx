import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { astronomicalToDisplayYear, displayYearToAstronomical } from '../timeline/year';
import { keyboardYear, yearFraction } from '../timeline/interaction';
import { yearLabel } from './yearLabel';
import type { YearSliderProps } from './YearSliderProps';
import type { CSSProperties } from 'react';
import './year-slider.css';
export function YearSlider({
  year,
  minYear,
  maxYear,
  onStart,
  onChange,
  onEnd,
  highlight = null,
}: YearSliderProps) {
  const bandStart = highlight ? Math.max(0, Math.min(1, highlight.startFraction)) * 100 : 0;
  const bandEnd = highlight ? Math.max(0, Math.min(1, highlight.endFraction)) * 100 : 0;
  const hasBand = highlight !== null && bandEnd >= bandStart;
  return (
    <input
      type="range"
      className="atlas-year-range"
      aria-label={t('playback.slider')}
      aria-valuetext={yearLabel(year)}
      min={displayYearToAstronomical(minYear)}
      max={displayYearToAstronomical(maxYear)}
      step={1}
      value={displayYearToAstronomical(year)}
      onPointerDown={onStart}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      onBlur={onEnd}
      onChange={(event) => onChange(astronomicalToDisplayYear(Number(event.currentTarget.value)))}
      onKeyDown={(event) => {
        const next = keyboardYear(event.key, year, maxYear);
        if (next === null) return;
        event.preventDefault();
        onStart();
        onChange(Math.max(minYear, Math.min(maxYear, next)));
        onEnd();
      }}
      style={
        {
          '--atlas-slider-accent': theme.colors.accent,
          '--atlas-slider-track': theme.colors.border,
          '--atlas-slider-focus': theme.colors.focus,
          '--atlas-slider-band': 'rgba(228, 194, 139, 0.35)',
          '--atlas-slider-progress': `${yearFraction(year, minYear, maxYear) * 100}%`,
          '--atlas-slider-band-start': hasBand ? `${bandStart}%` : '0%',
          '--atlas-slider-band-end': hasBand ? `${bandEnd}%` : '0%',
          '--atlas-slider-band-opacity': hasBand ? '1' : '0',
          width: '100%',
          minHeight: theme.layout.minTouchTarget,
          margin: 0,
          accentColor: theme.colors.accent,
          cursor: 'ew-resize',
          touchAction: 'pan-y',
        } as CSSProperties
      }
    />
  );
}
