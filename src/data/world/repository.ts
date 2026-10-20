import type { WorldManifest, WorldRow } from './types.ts';
import type { HistoricalRecord, HistoricalEntity, TerritoryVersion } from '../../domain/types.ts';
import { worldEntity, worldEntityId, worldTerritoryId } from './records.ts';
import {
  reviewedWorldRow,
  reviewedWorldTerritory,
  reviewedSupplementGeometry,
  hasWorldGeometry,
} from './review.ts';
import { createWorldLoader, type WorldAssetReader } from './loader.ts';
import { assertSelectableYear } from '../../timeline/year.ts';
function freeze<T>(v: T): T {
  if (v && typeof v === 'object') {
    for (const child of Object.values(v)) freeze(child);
    Object.freeze(v);
  }
  return v;
}
export function createWorldRepository(manifest: WorldManifest, reader: WorldAssetReader) {
  const loader = createWorldLoader(manifest, reader);
  freeze(manifest);
  const reviewedRows = freeze(manifest.rows.map(reviewedWorldRow));
  const byIndex = new Map(reviewedRows.map((r) => [worldTerritoryId(r), r]));
  const byEntity = new Map<string, WorldRow[]>();
  for (const r of reviewedRows) {
    const id = worldEntityId(r.name);
    const rows = byEntity.get(id) ?? [];
    rows.push(r);
    byEntity.set(id, rows);
  }
  const meta = new Map<string, HistoricalEntity>();
  for (const [id, rows] of byEntity) {
    const periods: { start: number; end: number }[] = [];
    for (const r of [...rows].sort((a, b) => a.start - b.start || a.end - b.end)) {
      const previous = periods.at(-1);
      if (previous && r.start <= previous.end + 1) previous.end = Math.max(previous.end, r.end);
      else periods.push({ start: r.start, end: r.end });
    }
    meta.set(id, freeze(worldEntity(rows[0]!, periods, rows)));
  }
  const yearCache = new Map<number, readonly WorldRow[]>();
  const rowsAt = (year: number) => {
    assertSelectableYear(year);
    const cached = yearCache.get(year);
    if (cached) return cached;
    const rows = reviewedRows.filter((r) => r.start <= year && r.end >= year);
    yearCache.set(year, rows);
    if (yearCache.size > 32) yearCache.delete(yearCache.keys().next().value!);
    return rows;
  };
  let lastYear: { year: number; signature: string; records: readonly TerritoryVersion[] } | null =
    null;
  let requestSerial = 0;
  async function territories(
    year: number,
    signal = new AbortController().signal,
  ): Promise<readonly TerritoryVersion[]> {
    if (signal.aborted) throw new Error('WORLD_YEAR_ABORT');
    if (lastYear?.year === year) return lastYear.records;
    const serial = ++requestSerial;
    const rows = rowsAt(year).filter((r) => !r.legacy && hasWorldGeometry(r));
    const signature = rows.map((r) => r.index).join('/');
    if (lastYear?.signature === signature) {
      lastYear = { ...lastYear, year };
      return lastYear.records;
    }
    const values = await loader.loadMany(
      rows.flatMap((r) => (r.pack === null ? [] : [r.pack])),
      signal,
    );
    if (signal.aborted) throw new Error('WORLD_YEAR_ABORT');
    const records = Object.freeze(
      rows.map((row) => {
        const geometry = reviewedSupplementGeometry(row) ?? values.get(row.pack!)?.[row.key!];
        if (!geometry) throw new Error('WORLD_MISSING_GEOMETRY');
        return freeze(reviewedWorldTerritory(row, geometry));
      }),
    );
    if (serial === requestSerial) lastYear = { year, signature, records };
    return records;
  }
  return {
    manifest,
    reviewedRows,
    loader,
    rowsAt,
    entityRows: byEntity,
    entities: meta,
    entitiesAt(year: number) {
      return [...new Set(rowsAt(year).map((r) => worldEntityId(r.name)))].map((id) =>
        meta.get(id)!,
      );
    },
    territories,
    summary(year: number) {
      const rows = rowsAt(year);
      return {
        total: rows.length,
        drawn: rows.filter((r) => hasWorldGeometry(r) || r.legacy).length,
        withheld: rows.filter((r) => r.withheld).length,
        unknownDateRows: manifest.invalidMetadataRows,
        sourceEndYear: 2024,
      };
    },
    async getById(id: string): Promise<HistoricalRecord | null> {
      const entity = meta.get(id);
      if (entity) return entity;
      const row = byIndex.get(id);
      if (!row) return null;
      if (row.pack === null)
        return freeze(reviewedWorldTerritory(row, reviewedSupplementGeometry(row)));
      const packs = await loader.loadMany([row.pack], new AbortController().signal);
      return freeze(reviewedWorldTerritory(row, packs.get(row.pack)![row.key!]!));
    },
    rowFor: (id: string) => byIndex.get(id) ?? null,
    clear() {
      requestSerial++;
      lastYear = null;
      loader.clear();
      yearCache.clear();
    },
  };
}
export type WorldRepository = ReturnType<typeof createWorldRepository>;
