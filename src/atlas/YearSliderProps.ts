export interface YearSliderProps {
  year: number;
  minYear: number;
  maxYear: number;
  onStart: () => void;
  onChange: (year: number) => void;
  onEnd: () => void;
  /** Inclusive period band as 0–1 fractions of the visible slider window. */
  highlight?: { startFraction: number; endFraction: number } | null;
}
