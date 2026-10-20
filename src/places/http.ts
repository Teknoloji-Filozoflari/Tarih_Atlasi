import { PLACE_PACK_BYTES, type PlacePack } from './catalog.ts';

export function placeHTTPURL(pack: PlacePack, href: string, basePath = '') {
  if (
    !/^[a-f0-9]{64}$/u.test(pack.sha256) ||
    !Number.isSafeInteger(pack.bytes) ||
    pack.bytes < 2 ||
    pack.bytes > PLACE_PACK_BYTES ||
    !/^(?:\/[A-Za-z0-9_-]+)*\/?$/u.test(basePath)
  )
    throw new Error('PLACES_ASSET_PATH');
  const base = new URL(href);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password)
    throw new Error('PLACES_ASSET_ORIGIN');
  return new URL(`${basePath.replace(/\/$/u, '')}/data/places/${pack.sha256}.atlas`, base).href;
}

/** Hash/row validation follows in the repository; transport bounds bytes before parsing. */
export async function readHTTPPlace(
  pack: PlacePack,
  signal: AbortSignal,
  href: string,
  basePath = '',
  fetcher: typeof fetch = fetch,
): Promise<string> {
  if (signal.aborted) throw new Error('PLACES_ABORT');
  const response = await fetcher(placeHTTPURL(pack, href, basePath), {
    signal,
    redirect: 'error',
    credentials: 'omit',
    cache: 'force-cache',
  });
  if (
    !response.ok ||
    response.redirected ||
    Number(response.headers.get('content-length') ?? 0) > pack.bytes ||
    !response.body
  )
    throw new Error('PLACES_ASSET_HTTP');
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let bytes = 0,
    raw = '';
  const abort = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener('abort', abort, { once: true });
  try {
    for (;;) {
      if (signal.aborted) throw new Error('PLACES_ABORT');
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > pack.bytes) throw new Error('PLACES_ASSET_BYTES');
      raw += decoder.decode(value, { stream: true });
    }
    if (signal.aborted) throw new Error('PLACES_ABORT');
    if (bytes !== pack.bytes) throw new Error('PLACES_ASSET_BYTES');
    return raw + decoder.decode();
  } finally {
    signal.removeEventListener('abort', abort);
    await reader.cancel().catch(() => {});
  }
}
