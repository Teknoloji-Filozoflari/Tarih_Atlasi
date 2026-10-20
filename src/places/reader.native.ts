import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { placeAsset } from './generated/assets';
import type { PlaceReader } from './repository';
import { atlasAssetCache as cache } from '../data/world/asset-cache.native';
// Packaged, licensed static assets. Expo's local copy is reused; no third-party API request.
export const readPlaceAsset: PlaceReader = async (index, pack, signal) => {
  if (signal.aborted) throw new Error('PLACES_ABORT');
  const asset = Asset.fromModule(placeAsset(index));
  if (asset.localUri?.startsWith('file://')) {
    const info = await FileSystem.getInfoAsync(asset.localUri);
    if (!info.exists) {
      asset.localUri = null;
      asset.downloaded = false;
    }
  }
  await asset.downloadAsync();
  if (signal.aborted) throw new Error('PLACES_ABORT');
  const uri = asset.localUri;
  if (!uri?.startsWith('file://') || uri.includes('..')) throw new Error('PLACES_LOCAL_ASSET');
  const release = cache.hold(uri);
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || info.isDirectory || info.size !== pack.bytes)
      throw new Error('PLACES_ASSET_BYTES');
    const raw = await FileSystem.readAsStringAsync(uri);
    if (signal.aborted) throw new Error('PLACES_ABORT');
    await cache.prune();
    return raw;
  } finally {
    release();
  }
};
