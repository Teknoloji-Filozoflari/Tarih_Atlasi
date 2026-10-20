import type { DataLoadStatus } from '../data/chunks/runtime-core.ts';
import type { HistoricalFilters } from '../preferences/model.ts';
import type { CoverageReport, TimelineEngine, Layer } from './engine.ts';
export interface TimelineFrame {
  requestedYear: number;
  contextYear: number;
  dataStatus?: DataLoadStatus;
  coverage: CoverageReport;
  entities: Awaited<ReturnType<TimelineEngine['getEntitiesAtYear']>>;
  territories: Awaited<ReturnType<TimelineEngine['getTerritoriesAtYear']>>;
  persons: Awaited<ReturnType<TimelineEngine['getPersonsAtYear']>>;
  events: Awaited<ReturnType<TimelineEngine['getEventsAtYear']>>;
}
export interface FrameOptions {
  layers: readonly Layer[];
  filters?: HistoricalFilters;
  preview: boolean;
  includeApproximatePersons?: boolean;
  signal: AbortSignal;
}
export type FrameLoader = (year: number, options: FrameOptions) => Promise<TimelineFrame>;
/** Cancels waiting/committing. In-memory engine work is finite and cannot be preempted mid-loop. */
export function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new Error('Timeline query aborted'));
    if (signal.aborted) {
      abort();
      void promise.catch(() => {});
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    void promise.then(
      (value) => {
        signal.removeEventListener('abort', abort);
        if (!signal.aborted) resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
  });
}
export function timelineFrameLoader(engine: TimelineEngine): FrameLoader {
  return async (year, options) => {
    if (options.signal.aborted) throw new Error('Timeline query aborted');
    const coverage = await abortable(
      engine.getDataCoverage(year, {
        signal: options.signal,
        layers: options.layers,
        ...(options.filters ? { filters: options.filters } : {}),
        includeApproximatePersons: options.includeApproximatePersons ?? false,
        ...(options.preview ? { preview: 'nearest-snapshot' as const } : {}),
      }),
      options.signal,
    );
    const contextYear =
      coverage.isPreview && coverage.sourceYear !== null ? coverage.sourceYear : year;
    const [entities, territories, persons, events] = await abortable(
      Promise.all([
        engine.getEntitiesAtYear(contextYear),
        engine.getTerritoriesAtYear(contextYear),
        engine.getPersonsAtYear(contextYear),
        engine.getEventsAtYear(contextYear),
      ]),
      options.signal,
    );
    const visibleEvents = options.filters
      ? (
          await Promise.all(
            events.map(async (hit) =>
              (await engine.matchesFilters(hit.record, contextYear, options.filters!)) ? hit : null,
            ),
          )
        ).filter((hit): hit is (typeof events)[number] => hit !== null)
      : events;
    return {
      requestedYear: year,
      contextYear,
      coverage,
      entities,
      territories,
      persons,
      events: visibleEvents,
    };
  };
}
