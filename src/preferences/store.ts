import type { BookmarkStorage } from '../discovery/bookmarks.ts';
import { defaultPreferences, parsePreferences, type Preferences } from './model.ts';
export interface PreferenceSnapshot {
  value: Preferences;
  status: 'loading' | 'ready' | 'read-error';
  saving: boolean;
  writeError: boolean;
}
function frozen<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(frozen);
    Object.freeze(value);
  }
  return value;
}
const copy = (p: Readonly<Preferences>) => parsePreferences(JSON.stringify(p));
export function createPreferenceStore(storage: BookmarkStorage) {
  let state: PreferenceSnapshot = {
    value: frozen(copy(defaultPreferences)),
    status: 'loading',
    saving: false,
    writeError: false,
  };
  let loading: Promise<void> | null = null,
    queue = Promise.resolve(),
    serial = 0;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<PreferenceSnapshot>) => {
    state = Object.freeze({ ...state, ...patch });
    listeners.forEach((fn) => fn());
  };
  const persist = (value: Preferences) => {
    const revision = ++serial,
      raw = JSON.stringify(value);
    publish({ value: frozen(value), saving: true, writeError: false });
    queue = queue
      .then(() => storage.write(raw))
      .then(() => {
        if (revision === serial) publish({ saving: false, writeError: false });
      })
      .catch(() => {
        if (revision === serial) publish({ saving: false, writeError: true });
      });
    return queue;
  };
  return {
    getSnapshot: () => state,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    load() {
      if (state.status === 'ready') return Promise.resolve();
      if (loading) return loading;
      publish({ status: 'loading' });
      loading = Promise.resolve()
        .then(() => storage.read())
        .then((raw) => {
          publish({
            value: frozen(raw === null ? copy(defaultPreferences) : parsePreferences(raw)),
            status: 'ready',
          });
        })
        .catch(() => publish({ status: 'read-error' }))
        .finally(() => {
          loading = null;
        });
      return loading;
    },
    update(change: (value: Preferences) => Preferences) {
      if (state.status !== 'ready') return Promise.resolve();
      return persist(copy(change(copy(state.value))));
    },
    retryWrite() {
      return state.status === 'ready' ? persist(copy(state.value)) : Promise.resolve();
    },
    async reset() {
      if (loading) await loading;
      publish({ status: 'ready' });
      return persist(copy(defaultPreferences));
    },
  };
}
