import type { BookmarkStorage } from '../discovery/bookmarks.ts';
import { PREFERENCES_KEY } from './model.ts';
export function createWebPreferenceStorage(
  get: () => Pick<Storage, 'getItem' | 'setItem'>,
): BookmarkStorage {
  return {
    async read() {
      return get().getItem(PREFERENCES_KEY);
    },
    async write(raw) {
      get().setItem(PREFERENCES_KEY, raw);
    },
  };
}
export const preferenceStorage = createWebPreferenceStorage(() => window.localStorage);
