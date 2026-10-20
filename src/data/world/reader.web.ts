import { Asset } from 'expo-asset';
import { decodeWorldGzip } from './dom-codec';
import { worldAsset } from './generated/assets';
import type { WorldPack } from './types';
/** Local packaged resource only. Never accepts a URL from a bridge or source record. */
export async function readWorldAsset(
  index: number,
  pack: WorldPack,
  signal: AbortSignal,
): Promise<string> {
  if (location.protocol === 'file:') {
    const { domWorldData } = await import('./generated/dom-bundled');
    return decodeWorldGzip(await domWorldData(index), pack.bytes, signal);
  }
  const asset = Asset.fromModule(worldAsset(index));
  const base = location.href;
  const url = new URL(asset.localUri ?? asset.uri, base);
  if (
    url.username ||
    url.password ||
    url.search.length > 1024 ||
    url.hash ||
    !['http:', 'https:', 'file:'].includes(url.protocol) ||
    (location.protocol !== 'file:' && url.origin !== location.origin) ||
    (location.protocol === 'file:' && url.protocol !== 'file:')
  )
    throw new Error('WORLD_ASSET_ORIGIN');
  const response = await fetch(url.href, {
    signal,
    credentials: 'omit',
    redirect: 'error',
    cache: 'force-cache',
  });
  if (!response.ok && !(url.protocol === 'file:' && response.status === 0))
    throw new Error('WORLD_ASSET_HTTP');
  const declared = response.headers.get('content-length');
  if (declared && Number(declared) > pack.bytes) throw new Error('WORLD_ASSET_SIZE');
  if (!response.body) {
    const text = await response.text();
    if (text.length > pack.bytes) throw new Error('WORLD_ASSET_SIZE');
    return text;
  }
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let bytes = 0,
    text = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > pack.bytes) throw new Error('WORLD_ASSET_SIZE');
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
  }
}
