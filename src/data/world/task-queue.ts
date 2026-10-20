/** Keeps uninterruptible native asset copies/downloads bounded even after their UI caller aborts. */
export function createWorldTaskQueue() {
  let active = 0;
  const queue: {
    signal: AbortSignal;
    resolve: () => void;
    reject: (e: Error) => void;
    cancel: () => void;
  }[] = [];
  const release = () => {
    active--;
    const next = queue.shift();
    if (next) {
      next.signal.removeEventListener('abort', next.cancel);
      active++;
      next.resolve();
    }
  };
  return {
    async run<T>(signal: AbortSignal, task: () => Promise<T>): Promise<T> {
      if (signal.aborted) throw new Error('WORLD_NATIVE_ABORT');
      if (active < 2) active++;
      else {
        if (queue.length >= 32) throw new Error('WORLD_NATIVE_QUEUE_BUDGET');
        await new Promise<void>((resolve, reject) => {
          const item = {
            signal,
            resolve,
            reject,
            cancel: () => {
              const i = queue.indexOf(item);
              if (i >= 0) queue.splice(i, 1);
              reject(new Error('WORLD_NATIVE_ABORT'));
            },
          };
          queue.push(item);
          signal.addEventListener('abort', item.cancel, { once: true });
        });
      }
      try {
        if (signal.aborted) throw new Error('WORLD_NATIVE_ABORT');
        return await task();
      } finally {
        release();
      }
    },
    stats: () => ({ active, queued: queue.length }),
  };
}
