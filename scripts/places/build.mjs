import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, readdir, writeFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { gzipSync } from 'node:zlib';
import { spawn } from 'node:child_process';
import { Buffer } from 'node:buffer';
import {
  isPlaceRow,
  placeZoom,
  PLACE_PACK_ROWS,
  PLACE_PACK_BYTES,
} from '../../src/places/catalog.ts';

const digest = (v) => createHash('sha256').update(v).digest('hex');
export function createPlaceIdTracker() {
  const pages = new Map();
  return (id) => {
    const page = Math.floor(id / 65536),
      bit = id % 65536;
    let bytes = pages.get(page);
    if (!bytes) {
      if (pages.size >= 4096) throw new Error('PLACES_ID_INDEX_BUDGET');
      bytes = new Uint8Array(8192);
      pages.set(page, bytes);
    }
    const offset = bit >>> 3,
      mask = 1 << (bit & 7);
    if (bytes[offset] & mask) throw new Error('PLACES_DUPLICATE_ID');
    bytes[offset] |= mask;
  };
}
const adminKey = (country, a1, a2 = '') => (a2 ? `${country}.${a1}.${a2}` : `${country}.${a1}`);
export function parseAdminNames(text, level) {
  const map = new Map();
  for (const line of text.split(/\r?\n/u)) {
    if (!line || line.startsWith('#')) continue;
    const [key, name, , id] = line.split('\t');
    if (
      !key ||
      !name ||
      name.length > 200 ||
      !/^[1-9]\d{0,9}$/u.test(id ?? '') ||
      key.split('.').length !== level + 1 ||
      map.has(key)
    )
      throw new Error('PLACES_ADMIN_SCHEMA');
    map.set(key, name);
  }
  if (map.size > 200000) throw new Error('PLACES_ADMIN_BUDGET');
  return map;
}
export function parseCountryNames(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/u)) {
    if (!line || line.startsWith('#')) continue;
    const fields = line.split('\t'),
      code = fields[0],
      name = fields[4];
    if (!/^[A-Z]{2}$/u.test(code ?? '') || !name || name.length > 200 || map.has(code))
      throw new Error('PLACES_COUNTRY_SCHEMA');
    map.set(code, name);
  }
  if (map.size > 300) throw new Error('PLACES_COUNTRY_BUDGET');
  return map;
}
// Exported for explicitly synthetic unit fixtures; never supplies coordinates/names by inference.
export function parseGeoName(line, admin1, admin2, countries) {
  if (!line || line.startsWith('#')) return { status: 'excluded' };
  if (line.length > 24000) return { status: 'invalid' };
  const f = line.split('\t');
  if (f.length !== 19) return { status: 'invalid' };
  const cls = f[6],
    code = f[7];
  const accepted =
    cls === 'A'
      ? /^ADM[1-4]$/u.test(code)
      : cls === 'P' &&
        [
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
        ].includes(code);
  if (!accepted) return { status: 'excluded' };
  if (
    !countries.has(f[8]) ||
    !/^[1-9]\d{0,9}$/u.test(f[0]) ||
    !/^-?\d+(?:\.\d+)?$/u.test(f[4]) ||
    !/^-?\d+(?:\.\d+)?$/u.test(f[5]) ||
    !/^\d+$/u.test(f[14])
  )
    return { status: 'invalid' };
  const row = [
    Number(f[0]),
    f[1],
    Number(f[5]),
    Number(f[4]),
    code,
    f[8],
    f[10],
    admin1.get(adminKey(f[8], f[10])) ?? '',
    f[11],
    admin2.get(adminKey(f[8], f[10], f[11])) ?? '',
    f[12],
    f[13],
    f[18],
    Number(f[14]),
  ];
  if (!isPlaceRow(row)) return { status: 'invalid' };
  const kind = cls === 'A' ? 'administrative' : code === 'PPLX' ? 'sections' : 'settlements';
  return { status: 'accepted', kind, row };
}
export async function* unzipGeoNames(file) {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 768 * 1048576)
    throw new Error('PLACES_ZIP_BUDGET');
  // Stream a fixed member; never extract arbitrary archive paths/symlinks.
  const child = spawn('unzip', ['-p', file, 'allCountries.txt'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '',
    bytes = 0;
  child.stderr.on('data', (b) => {
    if (stderr.length < 4096) stderr += b.toString();
  });
  const exited = new Promise((resolve) => {
    child.on('error', (e) => resolve(e));
    child.on('close', (code) => resolve(code === 0 ? null : new Error(`PLACES_UNZIP_${code}`)));
  });
  const timeout = setTimeout(() => child.kill('SIGKILL'), 30 * 60 * 1000);
  const stream = createInterface({ input: child.stdout, crlfDelay: Infinity });
  child.stdout.on('data', (b) => {
    bytes += b.length;
    if (bytes > 8 * 1024 ** 3) child.kill('SIGKILL');
  });
  try {
    for await (const line of stream) {
      if (bytes > 8 * 1024 ** 3) throw new Error('PLACES_UNZIP_BUDGET');
      yield line;
    }
    const error = await exited;
    if (error) throw error;
    if (bytes === 0) throw new Error('PLACES_EMPTY_ZIP');
  } finally {
    clearTimeout(timeout);
    stream.close();
    child.kill();
    await exited;
  }
}
/** Disk spool by 2° cell and LOD, <=16 open files, <=800 rows per output chunk.
 * No global array of cities or unbounded Promise.all. Caller owns an isolated temporary directory.
 */
export async function buildPlaces({
  lines,
  countries,
  admin1,
  admin2,
  inputs,
  temporary,
  output,
  synthetic = true,
  onProgress = () => {},
}) {
  const version = digest(
    `geonames-places-v1\n${inputs.map((s) => `${s.file}:${s.sha256}`).join('\n')}`,
  );
  const spool = join(temporary, 'spool');
  await mkdir(spool, { recursive: true });
  await mkdir(output, { recursive: true });
  const handles = new Map(),
    counts = { settlements: 0, administrative: 0, sections: 0, excluded: 0, invalid: 0 };
  const countryCounts = new Map();
  const trackId = createPlaceIdTracker();
  let rows = 0;
  try {
    for await (const line of lines) {
      if (++rows > 20000000) throw new Error('PLACES_SOURCE_ROWS_BUDGET');
      if (rows % 250000 === 0) onProgress({ rows, counts: { ...counts } });
      const parsed = parseGeoName(line, admin1, admin2, countries);
      if (parsed.status !== 'accepted') {
        counts[parsed.status]++;
        continue;
      }
      const { row, kind } = parsed;
      trackId(row[0]);
      counts[kind]++;
      const c = countryCounts.get(row[5]) ?? {
        code: row[5],
        name: countries.get(row[5]),
        settlements: 0,
        administrative: 0,
        sections: 0,
      };
      c[kind]++;
      countryCounts.set(row[5], c);
      const cell = `${placeZoom(row)}-${Math.min(179, Math.floor((row[2] + 180) / 2))}-${Math.min(89, Math.floor((row[3] + 90) / 2))}`;
      let handle = handles.get(cell);
      if (!handle) {
        if (handles.size >= 16) {
          const [old, opened] = handles.entries().next().value;
          await opened.close();
          handles.delete(old);
        }
        handle = await open(join(spool, cell + '.jsonl'), 'a');
      }
      handles.delete(cell);
      handles.set(cell, handle);
      await handle.writeFile(JSON.stringify(row) + '\n');
    }
  } finally {
    for (const handle of handles.values()) await handle.close();
  }
  const packs = [],
    manifest = {
      schema: 1,
      version,
      license: 'CC-BY-4.0',
      synthetic,
      downloadedAt: inputs.find((s) => s.file === 'allCountries.zip')?.downloadedAt ?? null,
      inputs,
      countries: [...countryCounts.values()].sort((a, b) => a.code.localeCompare(b.code, 'en')),
      counts,
      packs,
    };
  if (!counts.settlements || !counts.administrative)
    throw new Error('PLACES_SOURCE_NO_SETTLEMENTS_OR_ADMIN');
  const flush = async (batch, minZoom) => {
    if (!batch.length) return;
    const raw = JSON.stringify({
      schema: 1,
      version,
      license: 'CC-BY-4.0',
      synthetic,
      rows: batch,
    });
    if (Buffer.byteLength(raw) > PLACE_PACK_BYTES) throw new Error('PLACES_OUTPUT_BUDGET');
    const sha256 = digest(raw);
    await writeFile(join(output, sha256 + '.atlas'), raw, { flag: 'wx' });
    const bbox = [
      Math.min(...batch.map((r) => r[2])),
      Math.min(...batch.map((r) => r[3])),
      Math.max(...batch.map((r) => r[2])),
      Math.max(...batch.map((r) => r[3])),
    ];
    packs.push({
      sha256,
      bytes: Buffer.byteLength(raw),
      count: batch.length,
      minZoom,
      bbox,
      countries: [...new Set(batch.map((r) => r[5]))].sort(),
      codes: [...new Set(batch.map((r) => r[4]))].sort(),
    });
    if (packs.length > 30000) throw new Error('PLACES_PACK_COUNT_BUDGET');
  };
  for (const file of (await readdir(spool)).sort()) {
    let batch = [],
      bytes = 200;
    const stream = createInterface({
      input: createReadStream(join(spool, file)),
      crlfDelay: Infinity,
    });
    for await (const line of stream) {
      const row = JSON.parse(line),
        size = Buffer.byteLength(line) + 1;
      if (batch.length === PLACE_PACK_ROWS || bytes + size > PLACE_PACK_BYTES) {
        await flush(batch, Number(file[0]));
        batch = [];
        bytes = 200;
      }
      batch.push(row);
      bytes += size;
    }
    await flush(batch, Number(file[0]));
  }
  return manifest;
}
export async function writePlacesCatalog(manifest, path) {
  // Runtime protocol validation checks data; TypeScript must not infer 16k literal unions.
  await writeFile(
    path,
    `import type { PlacesManifest } from '../../catalog';\nexport const placesManifest: PlacesManifest = JSON.parse(${JSON.stringify(JSON.stringify(manifest))});\n`,
  );
}
export async function writePlacesModules(manifest, assets, generated) {
  await mkdir(generated, { recursive: true });
  let references =
    '/* eslint-disable @typescript-eslint/no-require-imports -- Expo static data assets. */\nexport function placeAsset(index: number): number | string {\nswitch(index) {\n';
  let dom =
    'export async function domPlaceData(index: number): Promise<string> {\nswitch(index) {\n';
  for (const [i, p] of manifest.packs.entries()) {
    references += `case ${i}: return require('../../../../assets/places/${p.sha256}.atlas');\n`;
    const raw = await readFile(join(assets, p.sha256 + '.atlas'));
    await writeFile(
      join(generated, `dom-${p.sha256}.ts`),
      `export const gzip = '${gzipSync(raw, { level: 9 }).toString('base64')}';\n`,
    );
    dom += `case ${i}: return (await import('./dom-${p.sha256}')).gzip;\n`;
  }
  const error = "default: throw new Error('PLACES_ASSET_INDEX');\n}}\n";
  await writeFile(join(generated, 'assets.ts'), references + error);
  await writeFile(join(generated, 'dom-bundled.ts'), dom + error);
  await writePlacesCatalog(manifest, join(generated, 'catalog.ts'));
}
