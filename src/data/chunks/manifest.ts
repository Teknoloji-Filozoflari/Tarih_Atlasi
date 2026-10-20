import { publicationPolicyVersion, geographyWithheld } from '../publication-policy.ts';
import { parse } from '../../domain/schema.ts';
import type { BBox, Catalog, TemporalExtent } from '../../domain/types.ts';
import { geometryBounds, boxesIntersect, bboxSchema } from '../../domain/geometry.ts';
import { temporalIntervals, dateKey, temporalExtentSchema } from '../../domain/temporal.ts';
import { validateCatalog } from '../../domain/validate.ts';
import { sha256, utf8 } from './hash.ts';
const canonicalValue = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b, 'en'))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalValue(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
};
export const MAX_CHUNK_BYTES = 256 * 1024;
export interface ChunkEntry {
  id: string;
  recordId: string;
  catalogVersion: string;
  lod: 'fine' | 'coarse';
  bbox: BBox[];
  temporal: TemporalExtent;
  bytes: number;
  sha256: string;
  file: string;
  licenseIds: string[];
  attribution: string;
  sourceIds: string[];
}
export interface ChunkManifest {
  version: 1;
  publicationPolicyVersion: string;
  catalogVersion: string;
  catalogSha256: string;
  entries: ChunkEntry[];
}
export function assertManifest(value: ChunkManifest): void {
  if (
    !value ||
    value.version !== 1 ||
    value.publicationPolicyVersion !== publicationPolicyVersion ||
    !/^[a-f0-9]{64}$/.test(value.catalogSha256) ||
    !Array.isArray(value.entries) ||
    value.entries.length > 512
  )
    throw new Error('MANIFEST_VERSION');
  const ids = new Set<string>();
  for (const e of value.entries) {
    if (
      !e ||
      ids.has(e.id) ||
      e.id !== `${e.sha256}-${e.lod}` ||
      !/^[a-f0-9]{64}$/.test(e.sha256) ||
      e.catalogVersion !== value.catalogVersion ||
      e.file !== `${e.sha256}.json` ||
      !Number.isInteger(e.bytes) ||
      e.bytes < 1 ||
      e.bytes > MAX_CHUNK_BYTES ||
      !['fine', 'coarse'].includes(e.lod) ||
      !e.recordId ||
      geographyWithheld(e.recordId) ||
      !e.attribution?.trim() ||
      !e.licenseIds?.length ||
      !e.sourceIds?.length ||
      !e.bbox?.length ||
      e.bbox.length > 8 ||
      !parse(temporalExtentSchema, e.temporal).ok ||
      e.bbox.some((b) => !parse(bboxSchema, b).ok)
    )
      throw new Error('MANIFEST_ENTRY');
    ids.add(e.id);
  }
}
/** Manifest is trusted code, never a remote self-approval document. Payload still passes production rights gate. */
export function validateChunk(raw: string, entry: ChunkEntry): Catalog {
  if (
    raw.length > MAX_CHUNK_BYTES ||
    utf8(raw).length !== entry.bytes ||
    sha256(raw) !== entry.sha256
  )
    throw new Error('CHUNK_INTEGRITY');
  const validation = validateCatalog(JSON.parse(raw));
  if (!validation.ok) throw new Error('CHUNK_RIGHTS_OR_SCHEMA');
  const catalog = validation.value,
    record = catalog.records.find((r) => r.id === entry.recordId);
  if (
    catalog.catalogVersion !== entry.catalogVersion ||
    !record ||
    !('geometry' in record) ||
    !record.geometry ||
    canonicalValue(record.temporal) !== canonicalValue(entry.temporal) ||
    JSON.stringify(geometryBounds(record.geometry)) !== JSON.stringify(entry.bbox) ||
    catalog.sources.some(
      (s) => !entry.sourceIds.includes(s.id) || !entry.licenseIds.includes(s.licenseId),
    ) ||
    entry.sourceIds.some((id) => !catalog.sources.some((s) => s.id === id)) ||
    !record.attribution.trim()
  )
    throw new Error('CHUNK_VERSION_OR_SCOPE');
  return catalog;
}
export function discoverChunks(
  manifest: ChunkManifest,
  request: { year: number; lod: 'fine' | 'coarse'; bbox?: BBox; recordIds?: readonly string[] },
): ChunkEntry[] {
  assertManifest(manifest);
  if (
    !Number.isInteger(request.year) ||
    request.year === 0 ||
    request.year < -2000 ||
    request.year > new Date().getFullYear()
  )
    throw new Error('CHUNK_YEAR');
  const start = dateKey({ year: request.year, month: null, day: null }),
    end = dateKey({ year: request.year, month: null, day: null }, true);
  return manifest.entries.filter(
    (e) =>
      e.lod === request.lod &&
      (!request.recordIds || request.recordIds.includes(e.recordId)) &&
      (!request.bbox || e.bbox.some((b) => boxesIntersect(b, request.bbox!))) &&
      e.temporal.support &&
      temporalIntervals(e.temporal).some(
        (i) => i.start !== null && i.end !== null && i.start <= end && i.end >= start,
      ),
  );
}
