import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Transform } from 'node:stream';
import { format } from 'prettier';
import { mapSources, acquireMapSource } from '../map-sources.mjs';
import { normalizeWorldGeometry } from '../../src/data/world/geometry.ts';
import { identityReviewByIndex } from './identity-review.mjs';
import {
  WORLD_ARCHIVE_SHA,
  WORLD_REVISION,
  WORLD_MAX_PACK_BYTES,
  WORLD_ATTRIBUTION,
} from '../../src/data/world/types.ts';
const root = new URL('../../', import.meta.url),
  staging = new URL('data/staging/map-sources/', root);
const assets = new URL('assets/world/', root),
  generated = new URL('src/data/world/generated/', root);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const legacy = JSON.parse(
  await readFile(new URL('data/pilot/raw/cliopatria-reviewed-rows.json', root), 'utf8'),
);
const legacyIds = new Set(legacy.rows.map((r) => r.index));
// Exact source rows flagged during the expanded identity/date/political-scope audit.
const scopeReview = new Set([
  11956, 13234, 13305, 13406, 13558, 13601, 13622, 13642, 13684, 13708, 13753, 13773,
]);
for (const [i, hash] of [
  [3, WORLD_ARCHIVE_SHA],
  [4, legacy.licenseSha256],
  [5, legacy.readmeSha256],
])
  assert.equal(
    (await acquireMapSource(mapSources[i], fileURLToPath(staging), { verifyOnly: true })).sha256,
    hash,
  );
const check = process.argv.includes('--check');
const write = async (file, text) => {
  if (check) assert.equal(await readFile(file, 'utf8'), text, fileURLToPath(file));
  else await writeFile(file, text);
};
if (!check) {
  await mkdir(assets, { recursive: true });
  await mkdir(generated, { recursive: true });
  await mkdir(new URL('docs/reports/world-coverage/', root), { recursive: true });
}
const manifest = {
  version: 1,
  archiveSha256: WORLD_ARCHIVE_SHA,
  license: 'CC-BY-4.0',
  revision: WORLD_REVISION,
  preparedAt: '2026-10-17',
  rows: [],
  packs: [],
  sourceRows: 0,
  relationRows: 0,
  outOfRangeRows: 0,
};
const report = {
  archiveSha256: WORLD_ARCHIVE_SHA,
  sourceRows: 0,
  relationRows: 0,
  outOfRangeRows: 0,
  polityRows: 0,
  accepted: 0,
  legacy: 0,
  withheld: [],
  invalidMetadata: [],
  tangentHoleRows: [],
  removedDuplicatePositions: 0,
  uniqueGeometries: 0,
  packBytes: 0,
  years: {},
};
const geometries = new Map();
const normalizedGeometries = new Map();
let current = {},
  currentBytes = 2,
  currentCount = 0;
async function flush() {
  if (!currentCount) return;
  const raw = JSON.stringify({
      version: 1,
      archiveSha256: WORLD_ARCHIVE_SHA,
      license: 'CC-BY-4.0',
      attribution: WORLD_ATTRIBUTION,
      geometries: current,
    }),
    hash = sha(raw);
  assert.ok(Buffer.byteLength(raw) <= WORLD_MAX_PACK_BYTES);
  await write(new URL(`${hash}.atlas`, assets), raw);
  await write(
    new URL(`dom-${hash}.ts`, generated),
    await format(
      `// Licensed immutable DOM-only compressed data; decoded on demand.\nexport const gzip = ${JSON.stringify(gzipSync(raw, { level: 9 }).toString('base64'))};\n`,
      { parser: 'typescript', singleQuote: true, printWidth: 100 },
    ),
  );
  manifest.packs.push({ sha256: hash, bytes: Buffer.byteLength(raw), geometries: currentCount });
  report.packBytes += Buffer.byteLength(raw);
  current = {};
  currentBytes = 2;
  currentCount = 0;
}
const child = spawn(
  'unzip',
  ['-p', fileURLToPath(new URL(mapSources[3].file, staging)), legacy.member],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
const done = new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', (c) => (c === 0 ? resolve() : reject(new Error('ZIP_EXIT_' + c))));
});
void done.catch(() => {});
let bytes = 0,
  lineBytes = 0;
const bounded = new Transform({
  transform(chunk, enc, cb) {
    bytes += chunk.length;
    for (const b of chunk) {
      lineBytes = b === 10 ? 0 : lineBytes + 1;
      if (lineBytes > 8 * 1024 * 1024) return cb(new Error('ROW_SIZE'));
    }
    if (bytes > 180 * 1024 * 1024) return cb(new Error('ZIP_SIZE'));
    cb(null, chunk);
  },
});
child.stdout.pipe(bounded);
child.stderr.resume();
const timer = setTimeout(() => child.kill(), 120000);
try {
  for await (const line of createInterface({ input: bounded, crlfDelay: Infinity })) {
    if (!line.startsWith('{ "type": "Feature"')) continue;
    const index = manifest.sourceRows++;
    if (index >= 15000) throw new Error('ROW_COUNT');
    const f = JSON.parse(line.replace(/,\s*$/, '')),
      p = f.properties;
    if (p.Type === 'RELATION') {
      manifest.relationRows++;
      continue;
    }
    if (
      p.Type !== 'POLITY' ||
      typeof p.Name !== 'string' ||
      !p.Name.trim() ||
      p.Name.length > 300 ||
      !Number.isInteger(p.FromYear) ||
      !Number.isInteger(p.ToYear) ||
      !p.FromYear ||
      !p.ToYear ||
      p.FromYear > p.ToYear
    ) {
      report.invalidMetadata.push({
        index,
        name: p.Name,
        from: p.FromYear,
        to: p.ToYear,
        reason: 'SOURCE_METADATA_INVALID_OR_YEAR_ZERO',
      });
      continue;
    }
    if (p.ToYear < -2000) {
      manifest.outOfRangeRows++;
      continue;
    }
    const row = {
      index,
      name: p.Name,
      start: p.FromYear,
      end: p.ToYear,
      pack: null,
      key: null,
      bbox: null,
      withheld: null,
      legacy: legacyIds.has(index),
    };
    const identityReview = identityReviewByIndex.get(index);
    if (identityReview)
      assert.equal(p.Name, identityReview.name, 'Pinned identity review mismatch');
    if (row.legacy) {
      report.legacy++;
      row.bbox = normalizeWorldGeometry(f.geometry, false).bbox;
    } else {
      try {
        if (identityReview) throw new Error('SOURCE_NAME_PERIOD_REQUIRES_REVIEW');
        if (
          index === 7187 ||
          (p.Name === 'Roman Kingdom' && p.FromYear <= -500 && p.ToYear >= -500)
        )
          throw new Error('HISTORICAL_DATE_REQUIRES_INDEPENDENT_REVIEW');
        if (scopeReview.has(index)) throw new Error('SOURCE_IDENTITY_DATE_OR_POLITY_SCOPE_REVIEW');
        const inputHash = sha(JSON.stringify(f.geometry));
        let cached = geometries.get(inputHash);
        if (!cached) {
          const normalized = normalizeWorldGeometry(f.geometry),
            raw = JSON.stringify(normalized.geometry),
            key = sha(raw),
            needed = Buffer.byteLength(JSON.stringify(key)) + Buffer.byteLength(raw) + 2;
          cached = normalizedGeometries.get(key);
          if (!cached) {
            if (needed + 1024 > WORLD_MAX_PACK_BYTES)
              throw new Error('WORLD_PACK_SINGLE_GEOMETRY_BUDGET');
            if (currentBytes + needed + 1024 > WORLD_MAX_PACK_BYTES || currentCount >= 32)
              await flush();
            cached = {
              key,
              pack: manifest.packs.length,
              bbox: normalized.bbox,
              tangentHolePairs: normalized.tangentHolePairs,
            };
            current[key] = normalized.geometry;
            currentBytes += needed;
            currentCount++;
            report.removedDuplicatePositions += normalized.removedDuplicatePositions;
            normalizedGeometries.set(key, cached);
          }
          geometries.set(inputHash, cached);
        }
        row.pack = cached.pack;
        row.key = cached.key;
        row.bbox = cached.bbox;
        if (cached.tangentHolePairs)
          report.tangentHoleRows.push({
            index,
            name: p.Name,
            start: p.FromYear,
            end: p.ToYear,
            pairs: cached.tangentHolePairs,
            geometrySha256: cached.key,
          });
        report.accepted++;
      } catch (e) {
        row.withheld = e.message;
        report.withheld.push({
          index,
          name: p.Name,
          start: p.FromYear,
          end: p.ToYear,
          reason: e.message,
        });
      }
    }
    manifest.rows.push(row);
  }
  await done;
  assert.equal(bytes, legacy.memberBytes);
  assert.equal(manifest.sourceRows, 13797);
  await flush();
} finally {
  clearTimeout(timer);
  child.kill();
}
report.sourceRows = manifest.sourceRows;
report.relationRows = manifest.relationRows;
report.outOfRangeRows = manifest.outOfRangeRows;
report.polityRows = manifest.rows.length;
report.uniqueGeometries = normalizedGeometries.size;
manifest.invalidMetadataRows = report.invalidMetadata.length;
for (const year of [-2000, -500, 1, 500, 1000, 1453, 1800, 1900, 2000, 2024, 2026]) {
  const rows = manifest.rows.filter((r) => r.start <= year && r.end >= year);
  report.years[year] = {
    source: rows.length,
    renderable: rows.filter((r) => r.legacy || r.pack !== null).length,
    withheld: rows.filter((r) => r.withheld).length,
  };
}
const text = JSON.stringify(manifest);
assert.ok(Buffer.byteLength(text) <= 4 * 1024 * 1024);
await write(
  new URL('manifest.ts', generated),
  await format(
    `// Generated trusted metadata, no geometry.\nimport type {WorldManifest} from '../types.ts';\nexport const worldManifest: WorldManifest = JSON.parse(${JSON.stringify(text)});\n`,
    { parser: 'typescript', singleQuote: true, printWidth: 100 },
  ),
);
await write(
  new URL('assets.ts', generated),
  await format(
    `/* eslint-disable @typescript-eslint/no-require-imports -- Expo static opaque assets require literal paths. */\n// Static asset references, never eager JSON modules.\nexport function worldAsset(index:number): number | string {\nswitch(index){\n${manifest.packs.map((p, i) => `case ${i}: return require('../../../../assets/world/${p.sha256}.atlas');`).join('\n')}\ndefault:throw new Error('WORLD_ASSET_INDEX');\n}}\n`,
    { parser: 'typescript', singleQuote: true, printWidth: 100 },
  ),
);
await write(
  new URL('dom-bundled.ts', generated),
  await format(
    `// DOM fallback modules retain compressed bytes, never a world-sized decoded catalog.\nexport async function domWorldData(index:number):Promise<string>{switch(index){\n${manifest.packs.map((p, i) => `case ${i}: return (await import('./dom-${p.sha256}')).gzip;`).join('\n')}\ndefault:throw new Error('WORLD_ASSET_INDEX');}}\n`,
    { parser: 'typescript', singleQuote: true, printWidth: 100 },
  ),
);
const notice =
  'Cliopatria / Seshat Global History Databank v0.2.1 (Bennett et al.). CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ Source https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1\nChanges: property removal, winding and identical consecutive position normalization. Source reconstruction, not independently verified historical borders. Date ranges retained; unsupported/malformed rows quarantined. No imported QID or Wikipedia title is approved.\n';
await write(new URL('NOTICE.txt', assets), notice);
if (!check) {
  await writeFile(
    new URL('docs/reports/world-coverage/import-report.json', root),
    JSON.stringify(report, null, 2) + '\n',
  );
  const allowed = new Set(manifest.packs.map((p) => p.sha256 + '.atlas'));
  for (const name of await readdir(generated))
    if (/^dom-[a-f0-9]{64}\.ts$/.test(name) && !allowed.has(name.slice(4, -3) + '.atlas'))
      await rm(new URL(name, generated));
  for (const name of await readdir(assets))
    if (/^[a-f0-9]{64}\.atlas$/.test(name) && !allowed.has(name)) await rm(new URL(name, assets));
}
console.log(
  JSON.stringify(
    {
      check,
      sourceRows: manifest.sourceRows,
      polityRows: report.polityRows,
      accepted: report.accepted,
      legacy: report.legacy,
      withheld: report.withheld.length,
      uniqueGeometries: report.uniqueGeometries,
      packs: manifest.packs.length,
      bytes: report.packBytes,
      metadataBytes: Buffer.byteLength(text),
      years: report.years,
    },
    null,
    2,
  ),
);
