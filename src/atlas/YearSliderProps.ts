export interface YearSliderProps {
  year: number;
  minYear: number;
  maxYear: number;
  onStart: () => void;
  onChange: (year: number) => void;
  onEnd: () => void;
}
