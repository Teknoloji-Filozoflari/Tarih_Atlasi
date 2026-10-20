import { nativeIntentPath } from '../discovery/view';
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  return nativeIntentPath(path, new Date().getFullYear(), initial);
}
