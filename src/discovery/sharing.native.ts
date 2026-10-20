import { Share } from 'react-native';
import { shareQuery, type SavedView } from './view';
export function makeShareURL(view: SavedView, maxYear: number) {
  return `tarihatlasi:///?${shareQuery(view, maxYear)}`;
}
export async function copyShareURL(_url: string): Promise<void> {
  throw new Error('CLIPBOARD_UNAVAILABLE');
}
export async function shareView(url: string, title: string): Promise<'shared' | 'copied'> {
  await Share.share({ title, message: url }, { dialogTitle: title });
  return 'shared';
}
