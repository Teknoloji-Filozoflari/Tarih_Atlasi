import { sha256, utf8 } from '../data/chunks/hash.ts';

export const PLACE_PACK_BYTES = 256 * 1024;
export const PLACE_PACK_ROWS = 800;
export const PLACE_FEATURES = [
  'PPL',
  'PPLA',
  'PPLA2',
  'PPLA3',
  'PPLA4',
  'PPLA5',
  'PPLC',
  'PPLCD',
  'PPLF',
  'PPLG',
  'PPLL',
  'PPLR',
  'PPLS',
  'PPLX',
  'STLMT',
  'ADM1',
  'ADM2',
  'ADM3',
  'ADM4',
] as const;
export type PlaceCode = (typeof PLACE_FEATURES)[number];
// Source facts only. Population ranks labels; no undated current population claim in UI.
export type PlaceRow = readonly [
  geonameId: number,
  name: string,
  longitude: number,
  latitude: number,
  code: PlaceCode,
  country: string,
  admin1: string,
  admin1Name: string,
  admin2: string,
  admin2Name: string,
  admin3: string,
  admin4: string,
  modified: string,
  population: number,
];
export interface PlacePack {
  sha256: string;
  bytes: number;
  count: number;
  minZoom: 4 | 6 | 8;
  bbox: readonly [number, number, number, number];
  countries: readonly string[];
  codes: readonly PlaceCode[];
}
export interface PlacesManifest {
  schema: 1;
  version: string | null;
  license: 'CC-BY-4.0';
  synthetic: boolean;
  downloadedAt: string | null;
  inputs: readonly {
    file: string;
    url: string;
    sha256: string;
    bytes: number;
    downloadedAt: string;
  }[];
  countries: readonly {
    code: string;
    name: string;
    settlements: number;
    administrative: number;
    sections: number;
  }[];
  counts: {
    settlements: number;
    administrative: number;
    sections: number;
    excluded: number;
    invalid: number;
  };
  packs: readonly PlacePack[];
}
export const isGeoNamesId = (id: unknown): id is string =>
  typeof id === 'string' && /^geonames:[1-9]\d{0,9}$/u.test(id);
export interface PlaceSelection {
  cityId: string;
  packIndex: number;
  catalogVersion: string;
}
export function isPlaceSelection(
  value: Record<string, unknown>,
  manifest: PlacesManifest,
): value is Record<string, unknown> & PlaceSelection {
  return (
    Object.keys(value).sort().join() === 'catalogVersion,cityId,packIndex' &&
    isGeoNamesId(value.cityId) &&
    typeof value.catalogVersion === 'string' &&
    value.catalogVersion === manifest.version &&
    typeof value.packIndex === 'number' &&
    Number.isSafeInteger(value.packIndex) &&
    value.packIndex >= 0 &&
    value.packIndex < manifest.packs.length
  );
}
const hash = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{64}$/u.test(v);
export function assertPlacesManifest(m: PlacesManifest): void {
  if (
    m.schema !== 1 ||
    m.license !== 'CC-BY-4.0' ||
    m.synthetic !== false ||
    m.packs.length > 30000 ||
    m.countries.length > 300 ||
    (m.version === null
      ? m.packs.length !== 0 ||
        m.inputs.length !== 0 ||
        m.countries.length !== 0 ||
        m.downloadedAt !== null
      : !hash(m.version)) ||
    (m.version !== null &&
      (!m.downloadedAt || !Number.isFinite(Date.parse(m.downloadedAt)) || m.inputs.length !== 5))
  )
    throw new Error('PLACES_MANIFEST');
  const names = new Set<string>();
  for (const input of m.inputs) {
    if (
      ![
        'readme.txt',
        'countryInfo.txt',
        'admin1CodesASCII.txt',
        'admin2Codes.txt',
        'allCountries.zip',
      ].includes(input.file) ||
      names.has(input.file) ||
      input.url !== `https://download.geonames.org/export/dump/${input.file}` ||
      !hash(input.sha256) ||
      !Number.isSafeInteger(input.bytes) ||
      input.bytes < 1 ||
      input.bytes > 768 * 1024 * 1024 ||
      !Number.isFinite(Date.parse(input.downloadedAt))
    )
      throw new Error('PLACES_INPUT');
    names.add(input.file);
  }
  let count = 0;
  const packHashes = new Set<string>();
  for (const p of m.packs) {
    if (
      !hash(p.sha256) ||
      packHashes.has(p.sha256) ||
      !Number.isSafeInteger(p.bytes) ||
      p.bytes < 2 ||
      p.bytes > PLACE_PACK_BYTES ||
      !Number.isSafeInteger(p.count) ||
      p.count < 1 ||
      p.count > PLACE_PACK_ROWS ||
      ![4, 6, 8].includes(p.minZoom) ||
      p.bbox.length !== 4 ||
      p.bbox.some((n) => !Number.isFinite(n)) ||
      p.bbox[0] < -180 ||
      p.bbox[2] > 180 ||
      p.bbox[1] < -90 ||
      p.bbox[3] > 90 ||
      p.bbox[0] > p.bbox[2] ||
      p.bbox[1] > p.bbox[3] ||
      !p.countries.length ||
      p.countries.length > 300 ||
      new Set(p.countries).size !== p.countries.length ||
      p.countries.some((c) => !/^[A-Z]{2}$/u.test(c)) ||
      !p.codes.length ||
      new Set(p.codes).size !== p.codes.length ||
      p.codes.some((c) => !PLACE_FEATURES.includes(c))
    )
      throw new Error('PLACES_PACK');
    count += p.count;
    packHashes.add(p.sha256);
  }
  if (
    Object.values(m.counts).some((n) => !Number.isSafeInteger(n) || n < 0) ||
    count !== m.counts.settlements + m.counts.administrative + m.counts.sections
  )
    throw new Error('PLACES_COUNTS');
  const codes = new Set<string>();
  for (const c of m.countries) {
    if (
      !/^[A-Z]{2}$/u.test(c.code) ||
      codes.has(c.code) ||
      !c.name ||
      c.name.length > 200 ||
      /[\u0000-\u001f\u007f]/u.test(c.name) ||
      [c.settlements, c.administrative, c.sections].some((n) => !Number.isSafeInteger(n) || n < 0)
    )
      throw new Error('PLACES_COUNTRY');
    codes.add(c.code);
  }
  for (const key of ['settlements', 'administrative', 'sections'] as const)
    if (m.countries.reduce((sum, c) => sum + c[key], 0) !== m.counts[key])
      throw new Error('PLACES_COUNTRY_COUNTS');
  for (const p of m.packs)
    if (p.countries.some((c) => !codes.has(c))) throw new Error('PLACES_PACK_COUNTRY');
}
export function isPlaceRow(v: unknown): v is PlaceRow {
  if (!Array.isArray(v) || v.length !== 14) return false;
  const [id, name, lng, lat, code, country, a1, n1, a2, n2, a3, a4, modified, population] = v;
  return (
    Number.isSafeInteger(id) &&
    id > 0 &&
    id < 1e10 &&
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= 200 &&
    [name, a1, n1, a2, n2, a3, a4].every(
      (s) => typeof s === 'string' && s.length <= 200 && !/[\u0000-\u001f\u007f]/u.test(s),
    ) &&
    typeof lng === 'number' &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180 &&
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    PLACE_FEATURES.includes(code) &&
    typeof country === 'string' &&
    /^[A-Z]{2}$/u.test(country) &&
    typeof modified === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/u.test(modified) &&
    Number.isFinite(Date.parse(modified)) &&
    new Date(modified).toISOString().slice(0, 10) === modified &&
    Number.isSafeInteger(population) &&
    population >= 0
  );
}
export function placeZoom(row: PlaceRow): 4 | 6 | 8 {
  if (row[4] === 'ADM2') return 6;
  if (['ADM3', 'ADM4', 'PPLX'].includes(row[4])) return 8;
  if (['PPLC', 'PPLCD', 'PPLG', 'PPLA', 'ADM1'].includes(row[4]) || row[13] >= 100000) return 4;
  if (['PPLA2', 'ADM2'].includes(row[4]) || row[13] >= 5000) return 6;
  return 8;
}
export function validatePlacePack(
  raw: string,
  pack: PlacePack,
  manifest: PlacesManifest,
): readonly PlaceRow[] {
  if (utf8(raw).length !== pack.bytes || sha256(raw) !== pack.sha256)
    throw new Error('PLACES_CHECKSUM');
  const doc = JSON.parse(raw) as {
    schema?: unknown;
    version?: unknown;
    license?: unknown;
    synthetic?: unknown;
    rows?: unknown;
  };
  if (
    doc.schema !== 1 ||
    doc.version !== manifest.version ||
    doc.license !== manifest.license ||
    doc.synthetic !== false ||
    !Array.isArray(doc.rows) ||
    doc.rows.length !== pack.count ||
    Object.keys(doc).sort().join() !== 'license,rows,schema,synthetic,version'
  )
    throw new Error('PLACES_DOCUMENT');
  const ids = new Set<number>();
  for (const row of doc.rows) {
    if (
      !isPlaceRow(row) ||
      ids.has(row[0]) ||
      placeZoom(row) !== pack.minZoom ||
      row[2] < pack.bbox[0] ||
      row[2] > pack.bbox[2] ||
      row[3] < pack.bbox[1] ||
      row[3] > pack.bbox[3] ||
      !manifest.countries.some((c) => c.code === row[5]) ||
      !pack.countries.includes(row[5]) ||
      !pack.codes.includes(row[4])
    )
      throw new Error('PLACES_ROW');
    ids.add(row[0]);
    Object.freeze(row);
  }
  return Object.freeze(doc.rows as PlaceRow[]);
}
