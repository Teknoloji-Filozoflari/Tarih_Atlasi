import { NOTES_KEY } from './model';
export const noteStorage = {
  async read() {
    return window.localStorage.getItem(NOTES_KEY);
  },
  async write(raw: string) {
    window.localStorage.setItem(NOTES_KEY, raw);
  },
};
