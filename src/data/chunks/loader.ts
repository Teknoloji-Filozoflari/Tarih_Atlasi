import type { Catalog } from '../../domain/types.ts';
import { NetworkChunkError } from './network.ts';
import { abortable } from '../../timeline/frame.ts';
import type { createChunkCache } from './cache.ts';
import { assertManifest, validateChunk, type ChunkEntry, type ChunkManifest } from './manifest.ts';
export interface ChunkResult {
  catalog: Catalog;
  origin: 'memory' | 'cache' | 'network' | 'bundled';
  cacheWarning: boolean;
}
export function createChunkLoader(
  manifest: ChunkManifest,
  cache: ReturnType<typeof createChunkCache>,
  network: ((entry: ChunkEntry, signal: AbortSignal) => Promise<string>) | null,
  bundled: (hash: string) => Promise<string>,
  options: { concurrency?: number; timeoutMs?: number } = {},
) {
  assertManifest(manifest);
  cache.restrictTo(manifest.entries.map((e) => e.sha256));
  const concurrency = options.concurrency ?? 2,
    timeoutMs = options.timeoutMs ?? 4000;
  if (
    !Number.isInteger(concurrency) ||
    concurrency < 1 ||
    concurrency > 4 ||
    timeoutMs < 1 ||
    timeoutMs > 10000
  )
    throw new Error('CHUNK_LOAD_BUDGET');
  const allowed = new Map(manifest.entries.map((e) => [e.id, JSON.stringify(e)]));
  let active = 0;
  const waiters: (() => void)[] = [];
  async function slot(signal: AbortSignal) {
    if (active < concurrency) {
      active++;
      return;
    }
    if (waiters.length >= 32) throw new Error('CHUNK_QUEUE_BUDGET');
    let wake!: () => void;
    try {
      await abortable(
        new Promise<void>((resolve) => {
          wake = resolve;
          waiters.push(resolve);
        }),
        signal,
      );
    } catch (e) {
      const i = waiters.indexOf(wake);
      if (i >= 0) waiters.splice(i, 1);
      else release();
      throw e;
    }
  }
  function release() {
    const next = waiters.shift();
    if (next) next();
    else active--;
  }
  return {
    async load(entry: ChunkEntry, signal: AbortSignal): Promise<ChunkResult> {
      if (allowed.get(entry.id) !== JSON.stringify(entry))
        throw new Error('CHUNK_UNTRUSTED_MANIFEST');
      if (signal.aborted) throw new Error('CHUNK_ABORT');
      await slot(signal);
      try {
        if (signal.aborted) throw new Error('CHUNK_ABORT');
        const cached = await cache.get(entry);
        if (signal.aborted) throw new Error('CHUNK_ABORT');
        if (cached)
          return {
            catalog: validateChunk(cached.raw, entry),
            origin: cached.origin,
            cacheWarning: cached.cacheWarning,
          };
        for (let attempt = 0; network && attempt < 2; attempt++) {
          const controller = new AbortController(),
            abort = () => controller.abort();
          signal.addEventListener('abort', abort, { once: true });
          if (signal.aborted) abort();
          const timeout = setTimeout(abort, timeoutMs);
          let delayMs = 150;
          try {
            const raw = await abortable(
              Promise.resolve().then(() => network(entry, controller.signal)),
              controller.signal,
            );
            const catalog = validateChunk(raw, entry);
            if (signal.aborted) throw new Error('CHUNK_ABORT');
            const saved = await cache.put(entry, raw);
            if (signal.aborted) throw new Error('CHUNK_ABORT');
            return { catalog, origin: 'network', cacheWarning: !saved };
          } catch (error) {
            if (signal.aborted) throw new Error('CHUNK_ABORT');
            if (error instanceof NetworkChunkError) {
              if (!error.retryable || error.delayMs > 2000) break;
              delayMs = Math.max(delayMs, error.delayMs);
            }
          } finally {
            clearTimeout(timeout);
            signal.removeEventListener('abort', abort);
          }
          if (attempt === 0)
            await new Promise<void>((resolve, reject) => {
              const abort = () => {
                clearTimeout(timer);
                signal.removeEventListener('abort', abort);
                reject(new Error('CHUNK_ABORT'));
              };
              const timer = setTimeout(() => {
                signal.removeEventListener('abort', abort);
                resolve();
              }, delayMs);
              signal.addEventListener('abort', abort, { once: true });
              if (signal.aborted) abort();
            });
        }
        const raw = await abortable(bundled(entry.sha256), signal),
          catalog = validateChunk(raw, entry);
        if (signal.aborted) throw new Error('CHUNK_ABORT');
        const saved = await cache.put(entry, raw);
        if (signal.aborted) throw new Error('CHUNK_ABORT');
        return { catalog, origin: 'bundled', cacheWarning: !saved };
      } finally {
        release();
      }
    },
    stats: () => ({ active, queued: waiters.length, ...cache.stats() }),
    clearMemory: cache.clearMemory,
  };
}
