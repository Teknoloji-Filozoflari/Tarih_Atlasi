/** Only Expo's private .atlas cache files belong to this data path; never touch user preferences or other assets. */
export interface WorldCacheIO {
  cacheDirectory: string | null;
  readDirectoryAsync(path: string): Promise<string[]>;
  getInfoAsync(
    path: string,
  ): Promise<{ exists: boolean; isDirectory?: boolean; size?: number; modificationTime?: number }>;
  deleteAsync(path: string, options: { idempotent: boolean }): Promise<void>;
}
export function createWorldNativeCache(io: WorldCacheIO) {
  const active = new Map<string, number>(),
    touches = new Map<string, number>();
  let tail = Promise.resolve();
  const quota = 32 * 1024 * 1024,
    maxFiles = 128;
  return {
    hold(path: string) {
      active.set(path, (active.get(path) ?? 0) + 1);
      touches.set(path, Date.now());
      let held = true;
      return () => {
        if (!held) return;
        held = false;
        const count = active.get(path) ?? 0;
        if (count <= 1) active.delete(path);
        else active.set(path, count - 1);
      };
    },
    prune() {
      const operation = tail.then(async () => {
        const root = io.cacheDirectory;
        if (!root) return;
        const names = (await io.readDirectoryAsync(root)).filter((n) =>
          /^ExponentAsset-[a-zA-Z0-9_-]+\.atlas$/.test(n),
        );
        const entries: { path: string; bytes: number; touched: number }[] = [];
        for (const name of names) {
          const path = root + name,
            info = await io.getInfoAsync(path);
          if (info.exists && !info.isDirectory && Number.isFinite(info.size))
            entries.push({
              path,
              bytes: info.size!,
              touched: touches.get(path) ?? (info.modificationTime ?? 0) * 1000,
            });
        }
        let bytes = entries.reduce((n, e) => n + e.bytes, 0),
          count = entries.length;
        for (const item of entries.sort((a, b) => a.touched - b.touched)) {
          if (bytes <= quota && count <= maxFiles) break;
          if (active.has(item.path)) continue;
          await io.deleteAsync(item.path, { idempotent: true });
          touches.delete(item.path);
          bytes -= item.bytes;
          count--;
        }
        const known = new Set(entries.map((e) => e.path));
        for (const key of touches.keys())
          if (!known.has(key) && !active.has(key)) touches.delete(key);
      });
      tail = operation.catch(() => {});
      return operation;
    },
  };
}
