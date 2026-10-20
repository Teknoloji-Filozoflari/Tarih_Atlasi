import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { historyAsset } from './generated/assets';
import type { HistoryPack } from './types';
import { createWorldTaskQueue } from '../data/world/task-queue';
import { atlasAssetCache as cache } from '../data/world/asset-cache.native';
const gate = createWorldTaskQueue();
/** Packaged assets + bounded native cache; no geometry string crosses the DOM bridge. */
export async function readHistoryAsset(
  index: number,
  pack: HistoryPack,
  signal: AbortSignal,
): Promise<string> {
  return gate.run(signal, async () => {
    const asset = Asset.fromModule(historyAsset(index));
    if (asset.localUri?.startsWith('file://')) {
      const info = await FileSystem.getInfoAsync(asset.localUri);
      if (!info.exists) {
        asset.localUri = null;
        asset.downloaded = false;
      }
    }
    await asset.downloadAsync();
    if (signal.aborted) throw new Error('WORLD_ASSET_ABORT');
    const uri = asset.localUri;
    if (!uri || !uri.startsWith('file://') || uri.includes('..'))
      throw new Error('WORLD_LOCAL_ASSET');
    const release = cache.hold(uri);
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || info.isDirectory || info.size !== pack.bytes)
        throw new Error('WORLD_ASSET_SIZE');
      const raw = await FileSystem.readAsStringAsync(uri);
      if (signal.aborted) throw new Error('WORLD_ASSET_ABORT');
      await cache.prune();
      return raw;
    } finally {
      release();
    }
  });
}
