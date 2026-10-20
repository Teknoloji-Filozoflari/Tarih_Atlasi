import type { BookmarkStorage } from '../discovery/bookmarks.ts';
import { utf8 } from '../data/chunks/hash.ts';
export type NoteKind = 'person' | 'war' | 'event';
export interface LocalNote {
  id: string;
  kind: NoteKind;
  title: string;
  description: string;
  start: number;
  end: number;
  lng: number;
  lat: number;
  source: string;
  reviewStatus: 'unverified';
}
export type NoteMarker = Pick<LocalNote, 'id' | 'kind' | 'lng' | 'lat'>;
export const NOTES_KEY = 'tarihatlasi.notes.v1';
export const MAX_NOTES = 50;
export function isNoteMarker(v: unknown): v is NoteMarker {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const n = v as NoteMarker;
  return (
    /^local:[a-z0-9-]{1,48}$/.test(n.id) &&
    ['person', 'war', 'event'].includes(n.kind) &&
    Number.isFinite(n.lng) &&
    Math.abs(n.lng) <= 180 &&
    Number.isFinite(n.lat) &&
    Math.abs(n.lat) <= 90
  );
}
export function isLocalNote(v: unknown): v is LocalNote {
  if (!isNoteMarker(v)) return false;
  const n = v as LocalNote;
  const text = (s: unknown, max: number) =>
    typeof s === 'string' &&
    s.length <= max &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(s);
  const year = (y: number) =>
    Number.isInteger(y) && y !== 0 && y >= -2000 && y <= new Date().getFullYear();
  return (
    Object.keys(n).sort().join(',') ===
      'description,end,id,kind,lat,lng,reviewStatus,source,start,title' &&
    text(n.title, 100) &&
    n.title.trim().length > 0 &&
    text(n.description, 500) &&
    text(n.source, 300) &&
    year(n.start) &&
    year(n.end) &&
    n.start <= n.end &&
    n.reviewStatus === 'unverified'
  );
}
export function parseNotes(raw: string): LocalNote[] {
  if (raw.length > 60000 || utf8(raw).length > 60000) throw Error('NOTES_SIZE');
  const v: unknown = JSON.parse(raw);
  if (
    !v ||
    typeof v !== 'object' ||
    Object.keys(v).sort().join(',') !== 'records,version' ||
    !('version' in v) ||
    v.version !== 1 ||
    !('records' in v) ||
    !Array.isArray(v.records) ||
    v.records.length > MAX_NOTES ||
    !v.records.every(isLocalNote) ||
    new Set(v.records.map((n) => n.id)).size !== v.records.length
  )
    throw Error('NOTES_SCHEMA');
  return v.records;
}
export const notesAtYear = (notes: readonly LocalNote[], year: number) =>
  notes.filter((n) => n.start <= year && n.end >= year);
export function createNoteRepository(storage: BookmarkStorage) {
  let loaded = false,
    records: LocalNote[] = [],
    queue = Promise.resolve();
  return {
    async load() {
      const raw = await storage.read();
      records = raw === null ? [] : parseNotes(raw);
      loaded = true;
      return records.map((n) => ({ ...n }));
    },
    save(note: LocalNote) {
      const snapshot = { ...note };
      return this.change((rows) => [...rows.filter((n) => n.id !== snapshot.id), snapshot]);
    },
    remove(id: string) {
      return this.change((rows) => rows.filter((n) => n.id !== id));
    },
    change(fn: (rows: LocalNote[]) => LocalNote[]) {
      const work = queue.then(async () => {
        if (!loaded) throw Error('NOTES_NOT_LOADED');
        const next = fn(records.map((n) => ({ ...n })));
        const raw = JSON.stringify({ version: 1, records: next });
        parseNotes(raw);
        await storage.write(raw); // Publish only after successful persistence.
        records = next;
        return records.map((n) => ({ ...n }));
      });
      queue = work.then(
        () => {},
        () => {},
      );
      return work;
    },
  };
}
