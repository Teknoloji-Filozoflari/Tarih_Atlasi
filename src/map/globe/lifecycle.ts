// Async import biterken ekran kapanmış olabilir: sonradan eklenen kaynak da temizlenir.
export function resourceScope() {
  let disposed = false;
  const cleanups: (() => void)[] = [];
  return {
    get disposed() {
      return disposed;
    },
    add(cleanup: () => void) {
      if (disposed) cleanup();
      else cleanups.push(cleanup);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups.reverse()) {
        try {
          cleanup();
        } catch {
          /* Diğer GPU/dinleyici temizliğini engelleme. */
        }
      }
      cleanups.length = 0;
    },
  };
}
