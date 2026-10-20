import type { BBox, Catalog, HistoricalRecord, SourceRecord } from '../domain/types.ts';
import {
  array,
  boolean,
  enumeration,
  nullable,
  numeric,
  object,
  parse,
  refine,
  issue,
} from '../domain/schema.ts';
import { bboxSchema, boxesIntersect, geometryBounds, splitBBox } from '../domain/geometry.ts';
import { dateKey, temporalRange, temporalIntervals } from '../domain/temporal.ts';
import {
  CatalogValidationError,
  validateCatalog,
  type ValidationMode,
} from '../domain/validate.ts';

export type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
export interface HistoricalQuery {
  startYear: number;
  endYear: number;
  bbox?: BBox | null;
  kinds?: HistoricalRecord['kind'][];
  includeUncertain?: boolean;
  includeBiographical?: boolean;
  offset?: number;
  limit?: number;
}
export interface HistoricalHit {
  record: DeepReadonly<HistoricalRecord>;
  temporalMatch: 'documented-interval' | 'possible' | 'biographical';
}
export interface HistoricalDataProvider {
  readonly catalogVersion: string;
  getById(id: string): Promise<DeepReadonly<HistoricalRecord> | null>;
  getSource(id: string): Promise<DeepReadonly<SourceRecord> | null>;
  query(
    query: HistoricalQuery,
  ): Promise<{ hits: HistoricalHit[]; total: number; nextOffset: number | null }>;
}
const kinds = [
  'entity',
  'territory',
  'political-relationship',
  'cultural-region',
  'cultural-relationship',
  'person',
  'person-location',
  'event',
  'place',
  'coverage',
] as const;
const querySchema = refine(
  object({
    startYear: numeric(-10000, 10000, true),
    endYear: numeric(-10000, 10000, true),
    bbox: nullable(bboxSchema),
    kinds: array(enumeration(kinds), 0, 10),
    includeUncertain: boolean,
    includeBiographical: boolean,
    offset: numeric(0, 1000, true),
    limit: numeric(1, 100, true),
  }),
  (query, path, issues) => {
    if (query.startYear === 0 || query.endYear === 0 || query.startYear > query.endYear)
      issue(issues, path, 'QUERY_DATE', 'Geçerli, sıralı ve yıl sıfırı olmayan aralık gerekli.');
  },
);
function freeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
function cells(box: BBox): string[] {
  const keys = new Set<string>();
  for (const part of splitBBox(box)) {
    const x1 = Math.min(11, Math.floor((part[0] + 180) / 30)),
      x2 = Math.min(11, Math.floor((part[2] + 180) / 30));
    const y1 = Math.min(5, Math.floor((part[1] + 90) / 30)),
      y2 = Math.min(5, Math.floor((part[3] + 90) / 30));
    for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) keys.add(`${x}/${y}`);
  }
  return [...keys];
}
export function createHistoricalDataProvider(
  value: unknown,
  mode: ValidationMode = 'production',
): HistoricalDataProvider {
  const result = validateCatalog(value, mode);
  if (!result.ok) throw new CatalogValidationError(result.issues);
  // Own the snapshot: later caller mutations cannot bypass validation or invalidate indices.
  const catalog = JSON.parse(JSON.stringify(result.value)) as Catalog;
  const records = new Map(catalog.records.map((record) => [record.id, record]));
  const sources = new Map(catalog.sources.map((source) => [source.id, source]));
  const geographic = new Map<string, Set<string>>();
  const bounds = new Map<string, BBox[]>();
  for (const record of catalog.records) {
    const boxes =
      record.kind === 'coverage'
        ? [record.region]
        : 'geometry' in record && record.geometry
          ? geometryBounds(record.geometry)
          : [];
    bounds.set(record.id, boxes);
    for (const box of boxes)
      for (const key of cells(box)) {
        if (!geographic.has(key)) geographic.set(key, new Set());
        geographic.get(key)!.add(record.id);
      }
  }
  const temporal = catalog.records
    .map((record) => {
      const range = temporalRange(record.temporal);
      return {
        record,
        start: range.start ?? -Infinity,
        end: range.end ?? Infinity,
        uncertain: range.uncertain,
      };
    })
    .sort((a, b) =>
      a.start === b.start
        ? a.record.id < b.record.id
          ? -1
          : a.record.id > b.record.id
            ? 1
            : 0
        : a.start < b.start
          ? -1
          : 1,
    );
  const maxEnds: number[] = [];
  let maxEnd = -Infinity;
  for (const entry of temporal) {
    maxEnd = Math.max(maxEnd, entry.end);
    maxEnds.push(maxEnd);
  }
  freeze(catalog);
  return {
    catalogVersion: catalog.catalogVersion,
    async getById(id) {
      return records.get(id) ?? null;
    },
    async getSource(id) {
      return sources.get(id) ?? null;
    },
    async query(query) {
      const checked = parse(querySchema, {
        bbox: null,
        kinds: [],
        includeUncertain: false,
        includeBiographical: false,
        offset: 0,
        limit: 50,
        ...query,
      });
      if (!checked.ok) throw new CatalogValidationError(checked.issues);
      const q = checked.value;
      const start = dateKey({ year: q.startYear, month: null, day: null });
      const end = dateKey({ year: q.endYear, month: null, day: null }, true);
      const geoIds = q.bbox
        ? new Set(cells(q.bbox).flatMap((key) => [...(geographic.get(key) ?? [])]))
        : null;
      let lo = 0,
        hi = temporal.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (temporal[mid]!.start <= end) lo = mid + 1;
        else hi = mid;
      }
      const hits: HistoricalHit[] = [];
      for (let index = lo - 1; index >= 0 && maxEnds[index]! >= start; index--) {
        const entry = temporal[index]!,
          record = entry.record;
        const biographical =
          record.kind === 'person-location' && record.locationType === 'biographical';
        if (
          entry.end < start ||
          (record.temporal.periods &&
            !temporalIntervals(record.temporal).some(
              (interval) =>
                interval.start !== null &&
                interval.end !== null &&
                interval.start <= end &&
                interval.end >= start,
            )) ||
          (entry.uncertain && !q.includeUncertain) ||
          (biographical && !q.includeBiographical) ||
          (q.kinds.length && !q.kinds.includes(record.kind))
        )
          continue;
        if (
          q.bbox &&
          (!geoIds!.has(record.id) ||
            !bounds.get(record.id)!.some((box) => boxesIntersect(box, q.bbox!)))
        )
          continue;
        hits.push({
          record,
          temporalMatch: biographical
            ? 'biographical'
            : entry.uncertain
              ? 'possible'
              : 'documented-interval',
        });
      }
      hits.sort((a, b) => (a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0));
      return {
        hits: hits.slice(q.offset, q.offset + q.limit),
        total: hits.length,
        nextOffset: q.offset + q.limit < hits.length ? q.offset + q.limit : null,
      };
    },
  };
}
/** Digest adapter keeps Node crypto out of shared/native code. Expected hash comes from a trusted release manifest. */
function utf8Bytes(text: string): number {
  let bytes = 0;
  for (const character of text) {
    const code = character.codePointAt(0)!;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (bytes > 4 * 1024 * 1024) break;
  }
  return bytes;
}
export async function loadHistoricalDataProvider(
  catalogText: string,
  expectedSha256: string,
  sha256: (text: string) => Promise<string>,
): Promise<HistoricalDataProvider> {
  if (
    catalogText.length > 4 * 1024 * 1024 ||
    utf8Bytes(catalogText) > 4 * 1024 * 1024 ||
    !/^[a-f0-9]{64}$/.test(expectedSha256) ||
    (await sha256(catalogText)) !== expectedSha256
  )
    throw new Error('Catalog checksum/size rejected');
  return createHistoricalDataProvider(JSON.parse(catalogText));
}
