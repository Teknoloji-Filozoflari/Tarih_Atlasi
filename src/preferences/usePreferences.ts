import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPreferenceStore } from './store';
import { preferenceStorage } from './storage';
export function usePreferences() {
  const [store] = useState(() => createPreferenceStore(preferenceStorage));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => {
    void store.load();
  }, [store]);
  return { store, ...state };
}
