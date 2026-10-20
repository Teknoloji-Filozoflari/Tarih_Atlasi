import { Asset } from 'expo-asset';
import { placeAsset } from './generated/assets';
import { decodeWorldGzip } from '../data/world/dom-codec';
import type { PlaceReader } from './repository';
export const readPlaceAsset: PlaceReader = async (index, pack, signal) => {
  if (location.protocol === 'file:') {
    const { domPlaceData } = await import('./generated/dom-bundled');
    return decodeWorldGzip(await domPlaceData(index), pack.bytes, signal);
  }
  const asset = Asset.fromModule(placeAsset(index)),
    url = new URL(asset.localUri ?? asset.uri, location.href);
  if (
    url.origin !== location.origin ||
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash
  )
    throw new Error('PLACES_ASSET_ORIGIN');
  const response = await fetch(url.href, {
    signal,
    redirect: 'error',
    credentials: 'omit',
    cache: 'force-cache',
  });
  if (
    !response.ok ||
    Number(response.headers.get('content-length') ?? 0) > pack.bytes ||
    !response.body
  )
    throw new Error('PLACES_ASSET_HTTP');
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let bytes = 0,
    raw = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > pack.bytes) throw new Error('PLACES_ASSET_BYTES');
      raw += decoder.decode(value, { stream: true });
    }
    return raw + decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
  }
};
