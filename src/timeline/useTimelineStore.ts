import { defaultFilters, type HistoricalFilters } from '../preferences/model';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { pilotTimeline } from '../data/application';
import { timelineFrameLoader } from './frame';
import { createTimelineStore } from './store';
import type { Layer } from './engine';
import { useReducedMotion } from '../atlas/useReducedMotion';
import { dataErrorCode } from '../data/error-code';
export function useTimelineStore(
  maxYear: number,
  layers: readonly Layer[],
  active: boolean,
  filters: HistoricalFilters = defaultFilters,
  approximate = false,
  motion: 'system' | 'reduce' = 'system',
) {
  const [store] = useState(() =>
    createTimelineStore(Math.min(2024, maxYear), maxYear, async (year, options) => {
      if (!pilotTimeline) throw new Error('Pilot rejected');
      try {
        const frame = await timelineFrameLoader(pilotTimeline)(year, options);
        const { ensureApplicationData } = await import('../data/application-runtime');
        const { status } = await ensureApplicationData(frame.coverage, options.signal);
        return { ...frame, dataStatus: status };
      } catch (error) {
        if (!options.signal.aborted) console.warn('[atlas.timeline]', dataErrorCode(error));
        throw error;
      }
    }),
  );
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const reducedMotion = useReducedMotion();
  const filterKey = JSON.stringify(filters);
  const key = layers.join('/');
  const [snapshots, setSnapshots] = useState<readonly number[]>([]);
  useEffect(() => {
    store.start();
    return () => store.dispose();
  }, [store]);
  useEffect(() => store.setMaxYear(maxYear), [store, maxYear]);
  useEffect(
    () => store.setReducedMotion(reducedMotion || motion === 'reduce'),
    [store, reducedMotion, motion],
  );
  useEffect(() => {
    const current = key.split('/').filter(Boolean) as Layer[];
    store.configure({
      layers: current,
      filters: JSON.parse(filterKey) as HistoricalFilters,
      approximate,
    });
    let alive = true;
    void pilotTimeline
      ?.getAvailableSnapshots({
        includeApproximatePersons: approximate,
        layers: current,
        filters: JSON.parse(filterKey) as HistoricalFilters,
      })
      .then((values) => {
        if (alive) setSnapshots(values.map((value) => value.year));
      })
      .catch(() => {
        if (alive) setSnapshots([]);
      });
    return () => {
      alive = false;
    };
  }, [store, key, maxYear, approximate, filterKey]);
  useEffect(() => {
    store.setForeground(active && AppState.currentState === 'active');
  }, [store, active]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (value) => {
      store.setForeground(active && value === 'active');
      if (value !== 'active') {
        store.pause();
        void import('../data/application-runtime').then(({ applicationDataRuntime }) =>
          applicationDataRuntime.clearMemory(),
        );
      }
    });
    return () => subscription.remove();
  }, [store, active]);
  const pending = store.getConfigurationKey() !== JSON.stringify([layers, filters, approximate]);
  return {
    store,
    state: pending
      ? {
          ...state,
          frame: null,
          coverageStatus: 'loading' as const,
          renderStatus: 'pending' as const,
          renderedSourceYear: null,
          renderedRequestedYear: null,
        }
      : state,
    snapshots,
  };
}
