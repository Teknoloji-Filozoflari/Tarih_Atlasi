import { webShareURL, type SavedView } from './view';
export function makeShareURL(view: SavedView, maxYear: number) {
  return webShareURL(`${window.location.origin}${window.location.pathname}`, view, maxYear);
}
export async function copyShareURL(url: string) {
  if (!navigator.clipboard?.writeText) throw new Error('CLIPBOARD_UNAVAILABLE');
  await navigator.clipboard.writeText(url);
}
export async function shareView(url: string, title: string): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    await navigator.share({ title, url });
    return 'shared';
  }
  await copyShareURL(url);
  return 'copied';
}
