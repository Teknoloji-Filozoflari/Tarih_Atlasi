export interface QueryClock {
  set(fn: () => void, ms: number): unknown;
  clear(id: unknown): void;
}
const realClock: QueryClock = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
};
/** Cancel timers AND stale async successes/errors. No query text leaves this process. */
export function createSearchController<T>(
  search: (query: string, offset: number, signal: AbortSignal) => Promise<T> | T,
  publish: (state: { loading: boolean; value: T | null; failed: boolean }) => void,
  clock: QueryClock = realClock,
) {
  let token = 0,
    timer: unknown = null,
    abort: AbortController | null = null;
  const cancel = () => {
    token++;
    if (timer !== null) clock.clear(timer);
    timer = null;
    abort?.abort();
    abort = null;
  };
  return {
    cancel,
    run(query: string, offset = 0, immediate = false) {
      cancel();
      const current = token;
      abort = new AbortController();
      const signal = abort.signal;
      publish({ loading: true, value: null, failed: false });
      timer = clock.set(
        () => {
          timer = null;
          void Promise.resolve()
            .then(() => search(query, offset, signal))
            .then(
              (value) => {
                if (current === token && !signal.aborted)
                  publish({ loading: false, value, failed: false });
              },
              () => {
                if (current === token && !signal.aborted)
                  publish({ loading: false, value: null, failed: true });
              },
            );
        },
        immediate ? 0 : 220,
      );
    },
  };
}
