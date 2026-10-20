import { BOOKMARK_KEY, type BookmarkStorage } from './bookmarks.ts';
export function createWebBookmarkStorage(
  get: () => Pick<Storage, 'getItem' | 'setItem'>,
): BookmarkStorage {
  return {
    async read() {
      return get().getItem(BOOKMARK_KEY);
    },
    async write(text) {
      get().setItem(BOOKMARK_KEY, text);
    },
  };
}
export const bookmarkStorage = createWebBookmarkStorage(() => window.localStorage);
