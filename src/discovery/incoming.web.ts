import { useSyncExternalStore } from 'react';
import { parseShareQuery } from './view';
const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  window.addEventListener('hashchange', notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener('hashchange', notify);
  };
};
const getURL = () => window.location.search + window.location.hash;
const serverURL = () => '';
/** Raw query check preserves duplicate/malformed fields that route decoding might normalize. */
export function useIncomingView(_params: Record<string, unknown>, maxYear: number) {
  const raw = useSyncExternalStore(subscribe, getURL, serverURL);
  if (!raw) return { status: 'none' as const, view: null };
  if (raw.includes('#')) return { status: 'invalid' as const, view: null };
  const view = parseShareQuery(raw, maxYear);
  return view ? { status: 'ready' as const, view } : { status: 'invalid' as const, view: null };
}
