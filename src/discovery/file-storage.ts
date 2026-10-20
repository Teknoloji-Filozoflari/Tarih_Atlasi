import { MAX_BOOKMARK_BYTES, type BookmarkStorage } from './bookmarks.ts';
export interface BookmarkFileIO {
  documentDirectory: string | null;
  getInfoAsync(uri: string): Promise<{ exists: boolean; isDirectory?: boolean; size?: number }>;
  readAsStringAsync(uri: string): Promise<string>;
  writeAsStringAsync(uri: string, text: string): Promise<void>;
  moveAsync(options: { from: string; to: string }): Promise<void>;
}
/** Fixed application-private path; temporary write + rename, never truncate the saved file. */
export function createFileBookmarkStorage(
  io: BookmarkFileIO,
  filename:
    | 'atlas-bookmarks-v1.json'
    | 'atlas-preferences-v1.json'
    | 'atlas-notes-v1.json' = 'atlas-bookmarks-v1.json',
): BookmarkStorage {
  const path = () => {
    if (!io.documentDirectory) throw new Error('BOOKMARK_DIRECTORY');
    if (
      !['atlas-bookmarks-v1.json', 'atlas-preferences-v1.json', 'atlas-notes-v1.json'].includes(
        filename,
      )
    )
      throw new Error('LOCAL_FILE_NAME');
    return `${io.documentDirectory}${filename}`;
  };
  return {
    async read() {
      const file = path(),
        info = await io.getInfoAsync(file);
      if (!info.exists) return null;
      if (
        info.isDirectory ||
        typeof info.size !== 'number' ||
        !Number.isFinite(info.size) ||
        info.size > (filename === 'atlas-preferences-v1.json' ? 4096 : MAX_BOOKMARK_BYTES)
      )
        throw new Error('BOOKMARK_SIZE');
      return io.readAsStringAsync(file);
    },
    async write(text) {
      const file = path(),
        temp = `${file}.tmp`;
      await io.writeAsStringAsync(temp, text);
      await io.moveAsync({ from: temp, to: file });
    },
  };
}
