import {
  assertPlacesManifest,
  validatePlacePack,
  isGeoNamesId,
  type PlacePack,
  type PlacesManifest,
  type PlaceRow,
} from './catalog.ts';
import { geoNameCity, type ModernCity } from './modern.ts';
import { createWorldTaskQueue } from '../data/world/task-queue.ts';
export type PlaceReader = (index: number, pack: PlacePack, signal: AbortSignal) => Promise<string>;
export interface PlaceViewport {
  west: number;
  east: number;
  south: number;
  north: number;
  zoom: number;
}
export type PlaceQuery = { cities: readonly ModernCity[]; limited: boolean; failedPacks: number };
export interface PlaceCursor {
  pack: number;
  row: number;
}
export type PlaceBrowsePage = { cities: readonly ModernCity[]; next: PlaceCursor | null };
export interface PlacesProvider {
  readonly manifest: PlacesManifest;
  query(view: PlaceViewport, signal: AbortSignal): Promise<PlaceQuery>;
}
const wrap = (n: number) => ((((n + 180) % 360) + 360) % 360) - 180;
export function containsLongitude(lng: number, west: number, east: number): boolean {
  if (east - west >= 360) return true;
  const w = wrap(west),
    e = wrap(east);
  return w <= e ? lng >= w && lng <= e : lng >= w || lng <= e;
}
export function intersectsPlacePack(pack: PlacePack, v: PlaceViewport): boolean {
  return (
    pack.bbox[1] <= v.north &&
    pack.bbox[3] >= v.south &&
    (containsLongitude(pack.bbox[0], v.west, v.east) ||
      containsLongitude(pack.bbox[2], v.west, v.east) ||
      containsLongitude(wrap(v.west), pack.bbox[0], pack.bbox[2]))
  );
}
export function createPlacesRepository(manifest: PlacesManifest, read: PlaceReader) {
  assertPlacesManifest(manifest);
  const gate = createWorldTaskQueue();
  const cache = new Map<number, readonly PlaceRow[]>();
  let epoch = 0;
  async function load(index: number, signal: AbortSignal): Promise<readonly PlaceRow[]> {
    return gate.run(signal, async () => {
      if (signal.aborted) throw new Error('PLACES_ABORT');
      const hit = cache.get(index);
      if (hit) {
        cache.delete(index);
        cache.set(index, hit);
        return hit;
      }
      const pack = manifest.packs[index];
      if (!pack) throw new Error('PLACES_PACK_INDEX');
      const generation = epoch,
        controller = new AbortController();
      const abort = () => controller.abort();
      signal.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(abort, 15000);
      let raw: string;
      try {
        raw = await new Promise<string>((resolve, reject) => {
          const cancel = () => reject(new Error('PLACES_ABORT_OR_TIMEOUT'));
          controller.signal.addEventListener('abort', cancel, { once: true });
          void read(index, pack, controller.signal).then(
            (v) => {
              controller.signal.removeEventListener('abort', cancel);
              resolve(v);
            },
            (e: unknown) => {
              controller.signal.removeEventListener('abort', cancel);
              reject(e);
            },
          );
        });
      } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
      }
      if (signal.aborted || controller.signal.aborted || generation !== epoch)
        throw new Error('PLACES_STALE');
      const rows = validatePlacePack(raw, pack, manifest);
      cache.set(index, rows);
      // <=8 chunks / 2 MiB serialized data; parsed JS overhead is additional.
      while (cache.size > 8) cache.delete(cache.keys().next().value!);
      return rows;
    });
  }
  return {
    manifest,
    async browse(
      country: string,
      administrative: boolean,
      cursor: PlaceCursor | null,
      signal: AbortSignal,
    ): Promise<PlaceBrowsePage> {
      if (
        !manifest.countries.some((c) => c.code === country) ||
        (cursor &&
          (!Number.isSafeInteger(cursor.pack) ||
            cursor.pack < 0 ||
            cursor.pack >= manifest.packs.length ||
            !Number.isSafeInteger(cursor.row) ||
            cursor.row < 0 ||
            cursor.row >= 800))
      )
        throw new Error('PLACES_BROWSE');
      const cities: ModernCity[] = [];
      let scans = 0;
      for (let i = cursor?.pack ?? 0; i < manifest.packs.length; i++) {
        if (signal.aborted) throw new Error('PLACES_ABORT');
        const p = manifest.packs[i]!;
        if (
          !p.countries.includes(country) ||
          !p.codes.some((c) => c.startsWith('ADM') === administrative)
        )
          continue;
        if (scans++ >= 8) return { cities, next: { pack: i, row: 0 } };
        const rows = await load(i, signal);
        for (let j = i === cursor?.pack ? cursor.row : 0; j < rows.length; j++) {
          const row = rows[j]!;
          if (row[5] !== country || row[4].startsWith('ADM') !== administrative) continue;
          if (cities.length === 40) return { cities, next: { pack: i, row: j } };
          cities.push(geoNameCity(row, manifest, i));
        }
      }
      return { cities, next: null };
    },
    async get(
      id: string,
      packIndex: number,
      version: string,
      signal: AbortSignal,
    ): Promise<ModernCity | null> {
      if (
        !isGeoNamesId(id) ||
        version !== manifest.version ||
        !Number.isSafeInteger(packIndex) ||
        packIndex < 0
      )
        return null;
      const row = (await load(packIndex, signal)).find((r) => `geonames:${r[0]}` === id);
      return row ? geoNameCity(row, manifest, packIndex) : null;
    },
    async query(view: PlaceViewport, signal: AbortSignal): Promise<PlaceQuery> {
      if (
        ![view.west, view.east, view.south, view.north, view.zoom].every(Number.isFinite) ||
        view.south < -90 ||
        view.north > 90 ||
        view.south > view.north ||
        view.zoom < 0 ||
        view.zoom > 8
      )
        throw new Error('PLACES_VIEWPORT');
      const matches = manifest.packs
        .map((pack, index) => ({ pack, index }))
        .filter(({ pack }) => pack.minZoom <= view.zoom && intersectsPlacePack(pack, view));
      const center = wrap((view.west + (view.east < view.west ? view.east + 360 : view.east)) / 2);
      matches.sort(
        (a, b) =>
          a.pack.minZoom - b.pack.minZoom ||
          Math.abs(wrap((a.pack.bbox[0] + a.pack.bbox[2]) / 2 - center)) -
            Math.abs(wrap((b.pack.bbox[0] + b.pack.bbox[2]) / 2 - center)) ||
          a.index - b.index,
      );
      const selected = matches.slice(0, 64),
        cities: ModernCity[] = [];
      let cursor = 0,
        failedPacks = 0,
        limited = matches.length > selected.length;
      const worker = async () => {
        while (cursor < selected.length) {
          if (signal.aborted) throw new Error('PLACES_ABORT');
          const { pack, index } = selected[cursor++]!;
          try {
            for (const row of await load(index, signal)) {
              if (
                row[3] < view.south ||
                row[3] > view.north ||
                !containsLongitude(row[2], view.west, view.east)
              )
                continue;
              cities.push(geoNameCity(row, manifest, index));
            }
          } catch (e) {
            if (signal.aborted) throw e;
            failedPacks++;
          }
          if (pack.count > 0 && cities.length > 12000) {
            // Stop, report density; don't retain an unbounded world-sized set.
            limited = true;
            cursor = selected.length;
          }
        }
      };
      await Promise.all([worker(), worker()]);
      if (signal.aborted) throw new Error('PLACES_ABORT');
      return { cities, limited, failedPacks };
    },
    clear() {
      epoch++;
      cache.clear();
    },
    stats: () => ({ entries: cache.size, ...gate.stats() }),
  };
}
