import type { BBox, AreaGeometry } from '../../domain/types.ts';
// Immutable metadata only: no geometry or Wikipedia title guesses in bootstrap.
export interface WorldRow {
  index: number;
  name: string;
  start: number;
  end: number;
  pack: number | null;
  key: string | null;
  bbox: BBox | null;
  withheld: string | null;
  legacy: boolean;
  /** Runtime review supplement; never present in the authenticated raw manifest. */
  reviewedGeometryKey?: string;
  sourceName?: string;
  reviewedLabel?: string;
  reviewedQid?: string;
  reviewNote?: string;
}
export interface WorldPack {
  sha256: string;
  bytes: number;
  geometries: number;
}
export interface WorldManifest {
  version: 1;
  archiveSha256: string;
  license: 'CC-BY-4.0';
  revision: string;
  preparedAt: string;
  rows: WorldRow[];
  packs: WorldPack[];
  sourceRows: number;
  relationRows: number;
  invalidMetadataRows: number;
  outOfRangeRows: number;
}
export type WorldGeometries = Record<string, AreaGeometry>;
export const WORLD_MAX_PACK_BYTES = 512 * 1024;
export const WORLD_SOURCE = 'source:cliopatria-v021-world';
export const WORLD_REVISION = 'v0.2.1-world-source-reconstruction-2';
export const WORLD_ARCHIVE_SHA = 'e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4';
export const WORLD_ATTRIBUTION =
  'Cliopatria / Seshat Global History Databank v0.2.1 (Bennett et al.), CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/. Kaynak rekonstrüksiyonu; bağımsız tarihî doğrulama değildir. Halka yönü ve yinelenen ardışık noktalar kayıpsız normalize edildi; kaynak aralıkları korundu.';
