import { parseSavedView, type SavedView } from './view.ts';
export const BOOKMARK_KEY = 'tarihatlasi.bookmarks.v1';
export const MAX_BOOKMARK_BYTES = 65536;
export interface Bookmark {
  id: string;
  kind: 'year' | 'entity' | 'camera';
  view: SavedView;
}
export interface BookmarkStorage {
  read(): Promise<string | null>;
  write(text: string): Promise<void>;
}
const bytes = (s: string) =>
  Array.from(s).reduce(
    (n, c) =>
      n +
      (c.codePointAt(0)! < 128
        ? 1
        : c.codePointAt(0)! < 2048
          ? 2
          : c.codePointAt(0)! < 65536
            ? 3
            : 4),
    0,
  );
export function parseBookmarks(text: string, maxYear: number): Bookmark[] {
  if (text.length > MAX_BOOKMARK_BYTES || bytes(text) > MAX_BOOKMARK_BYTES)
    throw new Error('BOOKMARK_SIZE');
  let value: { version: unknown; entries: unknown };
  try {
    value = JSON.parse(text) as typeof value;
  } catch {
    throw new Error('BOOKMARK_CORRUPT');
  }
  if (
    !value ||
    Object.keys(value).sort().join(',') !== 'entries,version' ||
    value.version !== 1 ||
    !Array.isArray(value.entries) ||
    value.entries.length > 50
  )
    throw new Error('BOOKMARK_SCHEMA');
  const ids = new Set<string>();
  return value.entries.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('BOOKMARK_SCHEMA');
    const r = raw as Record<string, unknown>,
      view = parseSavedView(r.view, maxYear);
    if (
      Object.keys(r).sort().join(',') !== 'id,kind,view' ||
      typeof r.id !== 'string' ||
      !/^bookmark-[a-z0-9-]{1,70}$/u.test(r.id) ||
      ids.has(r.id) ||
      !['year', 'entity', 'camera'].includes(String(r.kind)) ||
      !view ||
      (r.kind === 'entity' && !view.entityId) ||
      (r.kind === 'camera' && !view.camera)
    )
      throw new Error('BOOKMARK_SCHEMA');
    ids.add(r.id);
    return { id: r.id, kind: r.kind as Bookmark['kind'], view };
  });
}
/** One read and serialized committed writes; failed persistence never publishes success. */
export function createBookmarkRepository(storage: BookmarkStorage, maxYear: number) {
  let loaded: Promise<void> | null = null,
    entries: Bookmark[] = [],
    queue: Promise<unknown> = Promise.resolve();
  const load = () =>
    (loaded ??= (async () => {
      const raw = await storage.read();
      entries = raw === null ? [] : parseBookmarks(raw, maxYear);
    })().catch((error) => {
      loaded = null;
      throw error;
    }));
  const copy = () => JSON.parse(JSON.stringify(entries)) as Bookmark[];
  function update(change: (items: Bookmark[]) => Bookmark[]) {
    const next = queue
      .catch(() => {})
      .then(async () => {
        await load();
        const value = change(copy());
        const text = JSON.stringify({ version: 1, entries: value });
        const validated = parseBookmarks(text, maxYear);
        await storage.write(text);
        entries = validated;
        return copy();
      });
    queue = next;
    return next;
  }
  return {
    async recoveryText() {
      const raw = await storage.read();
      if (raw !== null && raw.length > MAX_BOOKMARK_BYTES) throw new Error('BOOKMARK_SIZE');
      return raw;
    },
    resetAfterReview(expected: string | null) {
      const next = queue
        .catch(() => {})
        .then(async () => {
          if ((await storage.read()) !== expected) throw new Error('BOOKMARK_RECOVERY_CHANGED');
          await storage.write(JSON.stringify({ version: 1, entries: [] }));
          entries = [];
          loaded = Promise.resolve();
          return copy();
        });
      queue = next;
      return next;
    },
    async list() {
      await load();
      await queue.catch(() => {});
      return copy();
    },
    async save(bookmark: Bookmark) {
      const value = parseBookmarks(
        JSON.stringify({ version: 1, entries: [bookmark] }),
        maxYear,
      )[0]!;
      return update((items) => [...items.filter((b) => b.id !== value.id), value]);
    },
    remove(id: string) {
      return update((items) => items.filter((b) => b.id !== id));
    },
  };
}
