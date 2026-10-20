import type { WorldManifest, WorldGeometries } from './types.ts';
import { assertWorldManifest, validateWorldPack } from './manifest.ts';
export type WorldAssetReader = (
  index: number,
  pack: WorldManifest['packs'][number],
  signal: AbortSignal,
) => Promise<string>;
/** Two finite workers; byte/count LRU. Imported asset modules contain URI metadata, never geometry strings. */
export function createWorldLoader(manifest: WorldManifest, read: WorldAssetReader) {
  assertWorldManifest(manifest);
  const cache = new Map<number, { data: WorldGeometries; bytes: number }>();
  let memoryBytes = 0,
    reads = 0,
    hits = 0,
    epoch = 0;
  const limit = 8 * 1024 * 1024,
    maxEntries = 24;
  let active = 0;
  const controllers = new Set<AbortController>();
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
  const slot = async (signal: AbortSignal) => {
    if (signal.aborted) throw new Error('WORLD_LOAD_ABORT');
    if (active < 2) {
      active++;
      return;
    }
    if (queue.length >= 32) throw new Error('WORLD_QUEUE_BUDGET');
    await new Promise<void>((resolve, reject) => {
      const entry = {
        signal,
        resolve,
        reject,
        cancel: () => {
          const i = queue.indexOf(entry);
          if (i >= 0) queue.splice(i, 1);
          reject(new Error('WORLD_LOAD_ABORT'));
        },
      };
      queue.push(entry);
      signal.addEventListener('abort', entry.cancel, { once: true });
    });
  };
  async function load(index: number, signal: AbortSignal) {
    if (signal.aborted) throw new Error('WORLD_LOAD_ABORT');
    const found = cache.get(index);
    if (found) {
      cache.delete(index);
      cache.set(index, found);
      hits++;
      return found.data;
    }
    const pack = manifest.packs[index];
    if (!pack) throw new Error('WORLD_PACK_INDEX');
    await slot(signal);
    try {
      if (signal.aborted) throw new Error('WORLD_LOAD_ABORT');
      const resumed = cache.get(index);
      if (resumed) {
        hits++;
        return resumed.data;
      }
      const current = epoch;
      const controller = new AbortController();
      controllers.add(controller);
      const cancel = () => controller.abort();
      signal.addEventListener('abort', cancel, { once: true });
      const timer = setTimeout(() => controller.abort(), 15000);
      let raw: string;
      try {
        // Reader cancellation is cooperative; the race also rejects an uncooperative late reply.
        raw = await new Promise<string>((resolve, reject) => {
          const abort = () => reject(new Error('WORLD_LOAD_ABORT_OR_TIMEOUT'));
          controller.signal.addEventListener('abort', abort, { once: true });
          void read(index, pack, controller.signal).then(
            (v) => {
              controller.signal.removeEventListener('abort', abort);
              if (!controller.signal.aborted) resolve(v);
            },
            (e) => {
              controller.signal.removeEventListener('abort', abort);
              reject(e);
            },
          );
        });
      } finally {
        controllers.delete(controller);
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
      }
      if (signal.aborted || current !== epoch) throw new Error('WORLD_LOAD_STALE');
      const data = validateWorldPack(raw, pack);
      reads++;
      const previous = cache.get(index);
      if (previous) {
        memoryBytes -= previous.bytes;
        cache.delete(index);
      }
      while (cache.size && (memoryBytes + pack.bytes > limit || cache.size >= maxEntries)) {
        const key = cache.keys().next().value!;
        memoryBytes -= cache.get(key)!.bytes;
        cache.delete(key);
      }
      cache.set(index, { data, bytes: pack.bytes });
      memoryBytes += pack.bytes;
      return data;
    } finally {
      release();
    }
  }
  return {
    async loadMany(indices: readonly number[], signal: AbortSignal) {
      const unique = [...new Set(indices)];
      if (
        unique.length > 512 ||
        unique.reduce((n, i) => n + (manifest.packs[i]?.bytes ?? Infinity), 0) > 32 * 1024 * 1024
      )
        throw new Error('WORLD_YEAR_PACK_BUDGET');
      const values = new Map<number, WorldGeometries>();
      // Avoid both a catalog-sized promise queue and retained decoded packs from other years.
      for (let i = 0; i < unique.length; i += 2) {
        const batch = await Promise.all(
          unique.slice(i, i + 2).map(async (index) => [index, await load(index, signal)] as const),
        );
        if (signal.aborted) throw new Error('WORLD_LOAD_ABORT');
        for (const [index, data] of batch) values.set(index, data);
      }
      return values;
    },
    clear() {
      epoch++;
      for (const controller of controllers) controller.abort();
      for (const entry of queue.splice(0)) {
        entry.signal.removeEventListener('abort', entry.cancel);
        entry.reject(new Error('WORLD_LOAD_STALE'));
      }
      cache.clear();
      memoryBytes = 0;
    },
    stats: () => ({
      memoryBytes,
      entries: cache.size,
      limit,
      maxEntries,
      reads,
      hits,
      active,
      queued: queue.length,
    }),
  };
}
