import type { ChunkStorage } from './cache.ts';
import { MAX_CHUNK_BYTES } from './manifest.ts';
export interface ChunkFileIO {
  cacheDirectory: string | null;
  makeDirectoryAsync(path: string, options: { intermediates: boolean }): Promise<void>;
  readDirectoryAsync(path: string): Promise<string[]>;
  getInfoAsync(
    path: string,
  ): Promise<{ exists: boolean; isDirectory?: boolean; size?: number; modificationTime?: number }>;
  readAsStringAsync(path: string): Promise<string>;
  writeAsStringAsync(path: string, raw: string): Promise<void>;
  moveAsync(value: { from: string; to: string }): Promise<void>;
  deleteAsync(path: string, options: { idempotent: boolean }): Promise<void>;
}
export function createFileChunkStorage(io: ChunkFileIO): ChunkStorage {
  const directory = () => {
    if (!io.cacheDirectory) throw new Error('CACHE_DIRECTORY');
    return `${io.cacheDirectory}atlas-historical-v1/`;
  };
  const file = (key: string) => {
    if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('CACHE_KEY');
    return `${directory()}${key}.json`;
  };
  return {
    async list() {
      await io.makeDirectoryAsync(directory(), { intermediates: true });
      const names = await io.readDirectoryAsync(directory());
      // Only this private cache directory may be cleaned; preferences/bookmarks live elsewhere.
      if (names.length > 128) {
        for (const name of names)
          if (/^[a-f0-9]{64}\.json(?:\.tmp)?$/.test(name))
            await io.deleteAsync(directory() + name, { idempotent: true });
        return [];
      }
      const result = [];
      for (const name of names) {
        if (/^[a-f0-9]{64}\.json\.tmp$/.test(name)) {
          await io.deleteAsync(directory() + name, { idempotent: true });
          continue;
        }
        if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
        const info = await io.getInfoAsync(directory() + name);
        if (
          info.isDirectory ||
          !Number.isFinite(info.size) ||
          info.size! > MAX_CHUNK_BYTES ||
          info.size! < 1
        ) {
          await io.deleteAsync(directory() + name, { idempotent: true });
          continue;
        }
        result.push({
          key: name.slice(0, -5),
          bytes: info.size!,
          touched: (info.modificationTime ?? 0) * 1000,
        });
      }
      return result;
    },
    async read(key) {
      const path = file(key),
        info = await io.getInfoAsync(path);
      if (!info.exists) return null;
      if (info.isDirectory || !Number.isFinite(info.size) || info.size! > MAX_CHUNK_BYTES) {
        await io.deleteAsync(path, { idempotent: true });
        return null;
      }
      return io.readAsStringAsync(path);
    },
    async write(key, raw) {
      const path = file(key);
      await io.makeDirectoryAsync(directory(), { intermediates: true });
      await io.writeAsStringAsync(path + '.tmp', raw);
      await io.moveAsync({ from: path + '.tmp', to: path });
    },
    async remove(key) {
      await io.deleteAsync(file(key), { idempotent: true });
    },
  };
}
