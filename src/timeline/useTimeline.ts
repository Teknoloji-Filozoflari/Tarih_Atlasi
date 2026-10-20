import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getPilotCoverage } from '../data/application';
import type { CoverageReport } from './engine';
import { createLatestQuery } from './latest';
import { selectableYearRange } from './year';

/** Refresh on resume and through the year rollover; never freezes the launch year. */
export function useCurrentYear() {
  const [year, setYear] = useState(() => selectableYearRange().maxYear);
  useEffect(() => {
    const update = () => setYear(selectableYearRange().maxYear);
    update();
    const timer = setInterval(update, 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  return year;
}
export function useTimelineCoverage(
  year: number,
  polity: boolean,
  culture: boolean,
  preview: boolean,
) {
  const key = `${year}/${polity}/${culture}/${preview}`;
  const [value, setValue] = useState<{
    key: string;
    report: CoverageReport | null;
    failed: boolean;
  } | null>(null);
  useEffect(() => {
    const latest = createLatestQuery();
    void latest
      .run(() =>
        getPilotCoverage(year, {
          layers: [
            ...(polity ? ['polity' as const] : []),
            ...(culture ? ['culture' as const] : []),
          ],
          ...(preview ? { preview: 'nearest-snapshot' as const } : {}),
        }),
      )
      .then((report) => {
        if (report) setValue({ key, report, failed: false });
      })
      .catch(() => setValue({ key, report: null, failed: true }));
    return () => latest.invalidate();
  }, [key, year, polity, culture, preview]);
  return value?.key === key ? value : { key, report: null, failed: false };
}
