/** Each new request invalidates old successes and failures; invalidate on unmount. */
export function createLatestQuery() {
  let revision = 0;
  return {
    invalidate() {
      revision++;
    },
    async run<T>(query: () => Promise<T>): Promise<T | null> {
      const ticket = ++revision;
      try {
        const result = await query();
        return ticket === revision ? result : null;
      } catch (error) {
        if (ticket !== revision) return null;
        throw error;
      }
    },
  };
}
