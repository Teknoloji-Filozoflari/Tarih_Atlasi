import {
  defaultFilters,
  isHistoricalFilters,
  type HistoricalFilters,
} from '../preferences/model.ts';
import type { CoverageMode, Layer } from './engine.ts';
import type { FrameLoader, TimelineFrame } from './frame.ts';
import { abortable } from './frame.ts';
import { MIN_YEAR, assertSelectableYear } from './year.ts';
import { jumpYear } from './interaction.ts';
export type PlaybackSpeed = 1 | 10 | 100;
export interface AppliedTimeline {
  revision: number;
  year: number;
  sourceYear: number | null;
  coverageStatus: CoverageMode | 'loading';
  catalogVersion: string;
}
export interface TimelineState {
  requestedYear: number;
  renderedSourceYear: number | null;
  renderedRequestedYear: number | null;
  coverageStatus: CoverageMode | 'loading' | 'error';
  renderStatus: 'pending' | 'applied' | 'unavailable';
  revision: number;
  frame: TimelineFrame | null;
  playing: boolean;
  speed: PlaybackSpeed;
  preview: boolean;
  includeApproximatePersons: boolean;
  maxYear: number;
  reducedMotion: boolean;
}
export interface Scheduler {
  set: (callback: () => void, ms: number) => unknown;
  clear: (id: unknown) => void;
}
const scheduler: Scheduler = {
  set: (callback, ms) => setTimeout(callback, ms),
  clear: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
};
export function createTimelineStore(
  initialYear: number,
  maxYear: number,
  load: FrameLoader,
  clock: Scheduler = scheduler,
) {
  assertSelectableYear(initialYear, maxYear);
  let state: TimelineState = {
    requestedYear: initialYear,
    renderedSourceYear: null,
    renderedRequestedYear: null,
    coverageStatus: 'loading',
    renderStatus: 'unavailable',
    revision: 0,
    frame: null,
    playing: false,
    speed: 1,
    preview: false,
    includeApproximatePersons: false,
    maxYear,
    reducedMotion: true,
  };
  const subscribers = new Set<() => void>();
  let rendererReady = false,
    foreground = true;
  let layers: readonly Layer[] = ['polity', 'culture', 'person', 'battle', 'event'];
  let filters: HistoricalFilters = { ...defaultFilters };
  let abort: AbortController | null = null,
    queryTimer: unknown = null,
    playTimer: unknown = null,
    disposed = false;
  const publish = (patch: Partial<TimelineState>) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...patch });
    subscribers.forEach((fn) => fn());
  };
  const clearQuery = () => {
    abort?.abort();
    abort = null;
    if (queryTimer !== null) clock.clear(queryTimer);
    queryTimer = null;
  };
  const stop = () => {
    if (playTimer !== null) clock.clear(playTimer);
    playTimer = null;
    if (state.playing) publish({ playing: false });
  };
  const execute = () => {
    queryTimer = null;
    if (disposed || !foreground) return;
    const controller = new AbortController();
    abort = controller;
    const revision = state.revision,
      year = state.requestedYear,
      preview = state.preview,
      requestedLayers = [...layers];
    void abortable(
      Promise.resolve().then(() => {
        if (controller.signal.aborted) throw new Error('Timeline query aborted');
        return load(year, {
          layers: requestedLayers,
          filters,
          preview,
          includeApproximatePersons: state.includeApproximatePersons,
          signal: controller.signal,
        });
      }),
      controller.signal,
    )
      .then((frame) => {
        if (disposed || controller.signal.aborted || revision !== state.revision) return;
        if (
          frame.requestedYear !== year ||
          frame.coverage.selectedYear !== year ||
          frame.contextYear !== (frame.coverage.isPreview ? frame.coverage.sourceYear : year)
        )
          throw new Error('Inconsistent timeline frame');
        publish({ frame, coverageStatus: frame.coverage.selectedYearMode });
      })
      .catch(() => {
        if (!disposed && !controller.signal.aborted && revision === state.revision)
          publish({ frame: null, coverageStatus: 'error' });
      });
  };
  const request = (year: number, preview: boolean, debounced = false) => {
    assertSelectableYear(year, state.maxYear);
    clearQuery();
    publish({
      requestedYear: year,
      preview,
      revision: state.revision + 1,
      frame: null,
      renderedSourceYear: null,
      renderedRequestedYear: null,
      coverageStatus: 'loading',
      renderStatus: rendererReady ? 'pending' : 'unavailable',
    });
    if (debounced) queryTimer = clock.set(execute, 80);
    else execute();
  };
  const arm = () => {
    if (playTimer !== null) clock.clear(playTimer);
    playTimer = null;
    if (!state.playing || disposed) return;
    playTimer = clock.set(
      () => {
        playTimer = null;
        if (disposed || !state.playing) return;
        const year = jumpYear(state.requestedYear, state.speed, state.maxYear);
        request(year, false);
        if (year === state.maxYear) stop();
        else arm();
      },
      state.reducedMotion ? 1000 : 500,
    );
  };
  return {
    getSnapshot: () => state,
    getConfigurationKey: () => JSON.stringify([layers, filters, state.includeApproximatePersons]),
    configure(value: {
      layers: readonly Layer[];
      filters: HistoricalFilters;
      approximate: boolean;
    }) {
      if (!isHistoricalFilters(value.filters)) throw new Error('Invalid filters');
      if (
        JSON.stringify([layers, filters, state.includeApproximatePersons]) ===
        JSON.stringify([value.layers, value.filters, value.approximate])
      )
        return;
      stop();
      layers = [...value.layers];
      filters = { ...value.filters };
      publish({ includeApproximatePersons: value.approximate });
      request(state.requestedYear, state.preview);
    },
    subscribe(fn: () => void) {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },
    start() {
      disposed = false;
      request(state.requestedYear, state.preview);
    },
    setForeground(value: boolean) {
      if (foreground === value) return;
      foreground = value;
      if (!value) {
        stop();
        clearQuery();
      } else if (!state.frame || state.coverageStatus === 'loading')
        request(state.requestedYear, state.preview);
    },
    pause: stop,
    retry() {
      stop();
      request(state.requestedYear, state.preview);
    },
    selectYear(year: number, debounced = false) {
      if (disposed) return;
      stop();
      request(year, false, debounced);
    },
    jump(delta: number) {
      if (disposed) return;
      stop();
      request(jumpYear(state.requestedYear, delta, state.maxYear), false);
    },
    flush() {
      if (queryTimer !== null) {
        clock.clear(queryTimer);
        queryTimer = null;
        execute();
      }
    },
    setPreview(preview: boolean) {
      if (disposed) return;
      stop();
      request(state.requestedYear, preview);
    },
    setApproximatePersons(value: boolean) {
      if (value === state.includeApproximatePersons) return;
      stop();
      publish({ includeApproximatePersons: value });
      request(state.requestedYear, state.preview);
    },
    setFilters(value: HistoricalFilters) {
      if (!isHistoricalFilters(value)) throw new Error('Invalid filters');
      if (JSON.stringify(filters) === JSON.stringify(value)) return;
      stop();
      filters = { ...value };
      request(state.requestedYear, state.preview);
    },
    setLayers(value: readonly Layer[]) {
      if (disposed) return;
      layers = [...value];
      request(state.requestedYear, state.preview);
    },
    setSpeed(speed: PlaybackSpeed) {
      if (![1, 10, 100].includes(speed)) throw new RangeError('Invalid playback speed');
      publish({ speed });
      arm();
    },
    setReducedMotion(reducedMotion: boolean) {
      publish({ reducedMotion });
      arm();
    },
    setMaxYear(value: number) {
      assertSelectableYear(value, value);
      if (value < 1) throw new RangeError('System year must be CE');
      if (state.requestedYear > value) {
        stop();
        state = Object.freeze({ ...state, maxYear: value });
        request(value, false);
      } else publish({ maxYear: value });
    },
    play() {
      if (disposed) return;
      if (state.requestedYear === state.maxYear) request(MIN_YEAR, false);
      else if (state.preview) request(state.requestedYear, false);
      publish({ playing: true });
      arm();
    },
    acknowledge(applied: AppliedTimeline) {
      if (
        disposed ||
        applied.revision !== state.revision ||
        applied.year !== state.requestedYear ||
        !state.frame
      )
        return;
      const expected = state.frame.coverage;
      if (applied.coverageStatus === 'loading') {
        publish({ renderedSourceYear: null, renderedRequestedYear: null, renderStatus: 'pending' });
        return;
      }
      if (
        applied.catalogVersion !== expected.catalogVersion ||
        applied.sourceYear !== expected.sourceYear ||
        applied.coverageStatus !== expected.mode
      )
        return;
      rendererReady = true;
      publish({
        renderedSourceYear: applied.sourceYear,
        renderedRequestedYear: applied.year,
        renderStatus: 'applied',
      });
    },
    rendererUnavailable() {
      rendererReady = false;
      publish({
        renderedSourceYear: null,
        renderedRequestedYear: null,
        renderStatus: 'unavailable',
      });
    },
    rendererAvailable() {
      rendererReady = true;
      publish({ renderStatus: 'pending' });
    },
    dispose() {
      stop();
      clearQuery();
      disposed = true;
      subscribers.clear();
    },
  };
}
export type TimelineStore = ReturnType<typeof createTimelineStore>;
