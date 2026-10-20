import type { ChunkEntry } from './manifest.ts';
import { validateChunk, MAX_CHUNK_BYTES } from './manifest.ts';
import { utf8 } from './hash.ts';
export interface StoredItem {
  key: string;
  bytes: number;
  touched: number;
}
export interface ChunkStorage {
  list(): Promise<StoredItem[]>;
  read(key: string): Promise<string | null>;
  write(key: string, raw: string): Promise<void>;
  remove(key: string): Promise<void>;
}
export const cachePolicies = Object.freeze({
  historical: {
    diskBytes: 2 * 1024 * 1024,
    memoryBytes: 512 * 1024,
    diskEntries: 32,
    memoryEntries: 8,
    immutable: true,
  },
  wikimediaDescription: {
    enabled: false,
    reason: 'Only reviewed bundled Wikidata descriptions; no article or image download.',
  },
  physicalStyle: { mode: 'bundled-versioned', remote: false },
  externalTiles: {
    enabled: false,
    reason: 'No licensed provider configured; never auto-cache tiles.',
  },
});
export function memoryStorage(): ChunkStorage {
  const data = new Map<string, { raw: string; touched: number }>();
  return {
    async list() {
      return [...data].map(([key, v]) => ({ key, bytes: utf8(v.raw).length, touched: v.touched }));
    },
    async read(k) {
      return data.get(k)?.raw ?? null;
    },
    async write(k, raw) {
      data.set(k, { raw, touched: Date.now() });
    },
    async remove(k) {
      data.delete(k);
    },
  };
}
/** Disk is only an optimization. Every cached body is authenticated against the trusted manifest and rights gate again. */
export function createChunkCache(storage: ChunkStorage, limits = cachePolicies.historical) {
  const memory = new Map<string, string>();
  const unsaved = new Set<string>();
  let allowed: ReadonlySet<string> | null = null;
  let memoryBytes = 0,
    queue = Promise.resolve();
  const statistics = { memoryHits: 0, diskHits: 0, corruptions: 0, evictions: 0, storageErrors: 0 };
  const serial = <T>(run: () => Promise<T>): Promise<T> => {
    const operation = queue.then(run);
    queue = operation.then(
      () => {},
      () => {},
    );
    return operation;
  };
  const remember = (key: string, raw: string) => {
    const previous = memory.get(key);
    if (previous) memoryBytes -= utf8(previous).length;
    memory.delete(key);
    memory.set(key, raw);
    memoryBytes += utf8(raw).length;
    while (memory.size > limits.memoryEntries || memoryBytes > limits.memoryBytes) {
      const first = memory.entries().next().value;
      if (!first) break;
      memory.delete(first[0]);
      unsaved.delete(first[0]);
      memoryBytes -= utf8(first[1]).length;
    }
  };
  const touches = new Map<string, number>();
  let access = Date.now();
  async function trim(incoming?: { key: string; bytes: number }) {
    const items = await storage.list();
    if (items.length > 128) throw new Error('CACHE_INDEX_BUDGET');
    for (const item of items)
      if (allowed && !allowed.has(item.key)) {
        await storage.remove(item.key);
        touches.delete(item.key);
        statistics.evictions++;
      }
    const ordered = items
      .filter((i) => !allowed || allowed.has(i.key))
      .filter((i) => i.key !== incoming?.key)
      .sort(
        (a, b) =>
          (touches.get(a.key) ?? a.touched) - (touches.get(b.key) ?? b.touched) ||
          a.key.localeCompare(b.key, 'en'),
      );
    let bytes = ordered.reduce((n, i) => n + i.bytes, 0) + (incoming?.bytes ?? 0),
      count = ordered.length + (incoming ? 1 : 0);
    for (const item of ordered) {
      if (bytes <= limits.diskBytes && count <= limits.diskEntries) break;
      await storage.remove(item.key);
      touches.delete(item.key);
      bytes -= item.bytes;
      count--;
      statistics.evictions++;
    }
  }
  return {
    restrictTo(keys: readonly string[]) {
      if (keys.length > 512 || keys.some((key) => !/^[a-f0-9]{64}$/.test(key)))
        throw new Error('CACHE_ALLOWLIST');
      allowed = new Set(keys);
      memory.clear();
      memoryBytes = 0;
      unsaved.clear();
      touches.clear();
    },
    async get(entry: ChunkEntry) {
      if (allowed && !allowed.has(entry.sha256)) return null;
      const key = entry.sha256,
        hit = memory.get(key);
      if (hit) {
        remember(key, hit);
        touches.set(key, ++access);
        statistics.memoryHits++;
        return { raw: hit, origin: 'memory' as const, cacheWarning: unsaved.has(key) };
      }
      return serial(async () => {
        try {
          await trim();
          const raw = await storage.read(key);
          if (raw === null) return null;
          try {
            validateChunk(raw, entry);
          } catch {
            statistics.corruptions++;
            await storage.remove(key);
            touches.delete(key);
            return null;
          }
          remember(key, raw);
          touches.set(key, ++access);
          statistics.diskHits++;
          return { raw, origin: 'cache' as const, cacheWarning: false };
        } catch {
          statistics.storageErrors++;
          return null;
        }
      });
    },
    put(entry: ChunkEntry, raw: string) {
      if (allowed && !allowed.has(entry.sha256)) throw new Error('CACHE_RELEASE');
      validateChunk(raw, entry); // Never let raw input choose its own cache rights.
      if (entry.bytes > MAX_CHUNK_BYTES || entry.bytes > limits.diskBytes)
        throw new Error('CACHE_ITEM_BUDGET');
      remember(entry.sha256, raw);
      unsaved.add(entry.sha256);
      touches.set(entry.sha256, ++access);
      return serial(async () => {
        try {
          await trim({ key: entry.sha256, bytes: entry.bytes });
          await storage.write(entry.sha256, raw);
          unsaved.delete(entry.sha256);
          return true;
        } catch {
          statistics.storageErrors++;
          return false;
        }
      });
    },
    clearMemory() {
      memory.clear();
      memoryBytes = 0;
      touches.clear();
      unsaved.clear();
    },
    stats: () => ({ ...statistics, memoryBytes, memoryEntries: memory.size }),
  };
}
