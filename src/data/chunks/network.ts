import type { ChunkEntry } from './manifest.ts';
import { MAX_CHUNK_BYTES } from './manifest.ts';
export class NetworkChunkError extends Error {
  readonly retryable: boolean;
  readonly delayMs: number;
  constructor(retryable: boolean, delayMs = 0) {
    super('DATA_HTTP');
    this.retryable = retryable;
    this.delayMs = delayMs;
  }
}
/** Same-origin static release files only; never arbitrary URLs or Wikimedia/map tile requests. */
export async function fetchChunk(entry: ChunkEntry, signal: AbortSignal): Promise<string> {
  if (typeof location === 'undefined' || !['https:', 'http:'].includes(location.protocol))
    throw new Error('NO_DATA_ORIGIN');
  const url = new URL(`/data/chunks/${entry.file}`, location.origin);
  if (url.origin !== location.origin || entry.file !== `${entry.sha256}.json`)
    throw new Error('DATA_ORIGIN');
  const response = await fetch(url.href, {
    signal,
    credentials: 'omit',
    redirect: 'error',
    cache: 'force-cache',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const retry = response.headers.get('retry-after');
    const seconds =
      retry === null
        ? 0
        : /^\d+$/.test(retry)
          ? Number(retry)
          : Math.max(0, (Date.parse(retry) - Date.now()) / 1000);
    throw new NetworkChunkError(
      response.status === 429 || response.status >= 500,
      Number.isFinite(seconds) ? seconds * 1000 : 10000,
    );
  }
  if (Number(response.headers.get('content-length') ?? 0) > MAX_CHUNK_BYTES)
    throw new Error('DATA_SIZE');
  if (!response.body) throw new Error('DATA_STREAM_REQUIRED');
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let raw = '',
    bytes = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > entry.bytes || signal.aborted) throw new Error('DATA_SIZE_OR_ABORT');
      raw += decoder.decode(next.value, { stream: true });
    }
    return raw + decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
