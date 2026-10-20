import type { ChunkStorage } from './cache.ts';
import { MAX_CHUNK_BYTES } from './manifest.ts';
export function createWebChunkStorage(
  open: () => Promise<Cache>,
  origin: () => string,
): ChunkStorage {
  const keyURL = (key: string) => {
    if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('CACHE_KEY');
    return `${origin()}/__atlas-cache/historical-v1/${key}`;
  };
  return {
    async list() {
      const cache = await open(),
        keys = await cache.keys();
      if (keys.length > 128) {
        for (const key of keys) await cache.delete(key);
        return [];
      }
      return Promise.all(
        keys.map(async (request) => {
          const response = await cache.match(request),
            key = new URL(request.url).pathname.split('/').at(-1)!;
          return {
            key,
            bytes: Number(response?.headers.get('x-atlas-bytes') ?? MAX_CHUNK_BYTES + 1),
            touched: Number(response?.headers.get('x-atlas-touched') ?? 0),
          };
        }),
      );
    },
    async read(key) {
      const response = await (await open()).match(keyURL(key));
      if (!response) return null;
      const size = Number(response.headers.get('x-atlas-bytes'));
      if (!Number.isInteger(size) || size < 1 || size > MAX_CHUNK_BYTES)
        throw new Error('CACHE_SIZE');
      const raw = await response.text();
      if (raw.length > MAX_CHUNK_BYTES) throw new Error('CACHE_SIZE');
      return raw;
    },
    async write(key, raw) {
      // Known manifest has a separate exact UTF8 check; Response carries actual HTTP cache metadata separately.
      await (
        await open()
      ).put(
        keyURL(key),
        new Response(raw, {
          headers: {
            'content-type': 'application/json',
            'x-atlas-bytes': String(new Blob([raw]).size),
            'x-atlas-touched': String(Date.now()),
          },
        }),
      );
    },
    async remove(key) {
      await (await open()).delete(keyURL(key));
    },
  };
}
export const chunkStorage = createWebChunkStorage(
  () => caches.open('tarihatlasi-historical-v1'),
  () => location.origin,
);
