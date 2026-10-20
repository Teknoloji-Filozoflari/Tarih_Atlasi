import { WORLD_METADATA_SHA } from './policy.ts';
import { licensePolicy } from '../../domain/licensePolicy.ts';
import type { WorldManifest, WorldGeometries, WorldPack } from './types.ts';
import {
  WORLD_ARCHIVE_SHA,
  WORLD_REVISION,
  WORLD_MAX_PACK_BYTES,
  WORLD_ATTRIBUTION,
} from './types.ts';
import { worldSource, worldInput } from './records.ts';
import { sha256, utf8 } from '../chunks/hash.ts';
import { normalizeWorldGeometry } from './geometry.ts';
export function assertWorldManifest(m: WorldManifest) {
  const encoded = JSON.stringify(m);
  if (encoded.length > 4 * 1024 * 1024 || sha256(encoded) !== WORLD_METADATA_SHA)
    throw new Error('WORLD_METADATA_REVIEW_PIN');
  if (
    !m ||
    m.version !== 1 ||
    m.archiveSha256 !== WORLD_ARCHIVE_SHA ||
    m.revision !== WORLD_REVISION ||
    m.license !== 'CC-BY-4.0' ||
    !Array.isArray(m.rows) ||
    m.rows.length > 15000 ||
    !Array.isArray(m.packs) ||
    m.packs.length > 2048 ||
    licensePolicy(worldSource, worldInput).decision !== 'allow'
  )
    throw new Error('WORLD_MANIFEST_OR_RIGHTS');
  const ids = new Set<number>();
  for (const p of m.packs)
    if (
      !/^[a-f0-9]{64}$/.test(p.sha256) ||
      !Number.isInteger(p.bytes) ||
      p.bytes < 2 ||
      p.bytes > WORLD_MAX_PACK_BYTES ||
      !Number.isInteger(p.geometries) ||
      p.geometries < 1 ||
      p.geometries > 32
    )
      throw new Error('WORLD_PACK_SCOPE');
  for (const r of m.rows) {
    if (
      ids.has(r.index) ||
      !Number.isInteger(r.index) ||
      r.index < 0 ||
      r.index >= m.sourceRows ||
      typeof r.name !== 'string' ||
      !r.name.trim() ||
      r.name.length > 300 ||
      !Number.isInteger(r.start) ||
      !Number.isInteger(r.end) ||
      r.start === 0 ||
      r.end === 0 ||
      r.start > r.end ||
      r.start < -10000 ||
      r.end > 2024 ||
      typeof r.legacy !== 'boolean' ||
      (r.pack !== null &&
        (!Number.isInteger(r.pack) ||
          r.pack < 0 ||
          r.pack >= m.packs.length ||
          !r.key ||
          !/^[a-f0-9]{64}$/.test(r.key) ||
          r.withheld !== null)) ||
      (r.pack === null && !r.legacy && !r.withheld)
    )
      throw new Error('WORLD_ROW_SCOPE');
    if (
      r.bbox !== null &&
      (!Array.isArray(r.bbox) ||
        r.bbox.length !== 4 ||
        !r.bbox.every(Number.isFinite) ||
        r.bbox[0] < -180 ||
        r.bbox[2] > 180 ||
        r.bbox[1] < -90 ||
        r.bbox[3] > 90 ||
        r.bbox[0] > r.bbox[2] ||
        r.bbox[1] > r.bbox[3])
    )
      throw new Error('WORLD_BBOX');
    ids.add(r.index);
  }
}
export function validateWorldPack(raw: string, pack: WorldPack): WorldGeometries {
  if (
    raw.length > WORLD_MAX_PACK_BYTES ||
    utf8(raw).length !== pack.bytes ||
    sha256(raw) !== pack.sha256
  )
    throw new Error('WORLD_PACK_INTEGRITY');
  const envelope: unknown = JSON.parse(raw);
  if (
    !envelope ||
    typeof envelope !== 'object' ||
    !('version' in envelope) ||
    envelope.version !== 1 ||
    !('archiveSha256' in envelope) ||
    envelope.archiveSha256 !== WORLD_ARCHIVE_SHA ||
    !('license' in envelope) ||
    envelope.license !== 'CC-BY-4.0' ||
    !('attribution' in envelope) ||
    envelope.attribution !== WORLD_ATTRIBUTION ||
    !('geometries' in envelope)
  )
    throw new Error('WORLD_PACK_RIGHTS');
  const data: unknown = envelope.geometries;
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    Object.keys(data).length !== pack.geometries
  )
    throw new Error('WORLD_PACK_SCHEMA');
  for (const [key, value] of Object.entries(data)) {
    if (!/^[a-f0-9]{64}$/.test(key) || sha256(JSON.stringify(value)) !== key)
      throw new Error('WORLD_GEOMETRY_INTEGRITY');
    normalizeWorldGeometry(value, false);
  }
  return data as WorldGeometries;
}
