/** Opt-in local diagnostics only: no entity names, queries, coordinates or network reporting. */
export function createMetrics(limit = 120) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 256) throw new Error('METRIC_BUDGET');
  const values = new Map<string, number[]>(),
    counts = new Map<string, number>();
  return {
    record(name: string, value = 1) {
      if (!Number.isFinite(value) || (!values.has(name) && values.size >= 32)) return;
      counts.set(name, (counts.get(name) ?? 0) + 1);
      const samples = values.get(name) ?? [];
      if (samples.length === limit) samples.shift();
      samples.push(value);
      values.set(name, samples);
    },
    snapshot() {
      return Object.fromEntries(
        [...values].map(([name, samples]) => [
          name,
          { count: counts.get(name)!, samples: [...samples] },
        ]),
      );
    },
    reset() {
      values.clear();
      counts.clear();
    },
  };
}
export const localMetrics = createMetrics();
export function profilingEnabled() {
  return (globalThis as { __ATLAS_PROFILE__?: boolean }).__ATLAS_PROFILE__ === true;
}
export function measure<T>(name: string, run: () => T): T {
  if (!profilingEnabled()) return run();
  const start = performance.now();
  try {
    return run();
  } finally {
    localMetrics.record(name, performance.now() - start);
  }
}
export function count(name: string) {
  if (profilingEnabled()) localMetrics.record(name);
}
