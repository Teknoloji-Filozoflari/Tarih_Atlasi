import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { physicalLand } from '../src/map/globe/generated/physical-land.ts';
import { workerSource } from '../src/map/globe/generated/worker-source.ts';
import { globeNotices } from '../src/map/globe/generated/notices.ts';
import { validateLand } from '../src/map/globe/land.ts';
import { preparePhysicalWorker } from './globe/validate-worker.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');
try {
  assert.ok(physicalLand && workerSource && globeNotices, 'Run npm run globe:prepare');
  const manifest = JSON.parse(
    await readFile(new URL('../assets/licenses/globe-provenance.json', import.meta.url), 'utf8'),
  );
  assert.equal(
    manifest.source,
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson',
  );
  assert.equal(manifest.dataVersion, '5.1.2');
  assert.equal(manifest.dataLicense, 'public domain');
  const bytes = await readFile(
    new URL('../src/map/globe/generated/natural-earth-v5.1.2-land.geojson', import.meta.url),
  );
  assert.equal(hash(bytes), manifest.downloadedSha256);
  assert.equal(bytes.length, manifest.downloadedBytes);
  const land = validateLand(JSON.parse(bytes.toString('utf8')));
  assert.equal(hash(JSON.stringify(land)), manifest.transformedSha256);
  assert.equal(hash(JSON.stringify(physicalLand)), manifest.transformedSha256);
  const pkg = JSON.parse(
    await readFile(new URL('../node_modules/maplibre-gl/package.json', import.meta.url), 'utf8'),
  );
  assert.equal(pkg.version, '6.14.0');
  assert.equal(pkg.version, manifest.rendererVersion);
  const original = await readFile(
    new URL('../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url),
    'utf8',
  );
  assert.equal(hash(original), manifest.originalWorkerSha256);
  const ts = await import('typescript');
  const prepared = preparePhysicalWorker(ts, original);
  assert.equal(prepared.code, workerSource);
  assert.equal(prepared.disabledImports, manifest.disabledImports);
  assert.equal(prepared.disabledEvaluations, manifest.disabledEvaluations);
  assert.equal(hash(workerSource), manifest.workerSha256);
  assert.equal(Buffer.byteLength(workerSource), manifest.workerBytes);
  assert.equal(hash(globeNotices), manifest.noticesSha256);
  for (const name of [
    'MapLibre-LICENSE.txt',
    'MaterialSymbols-FONT-LICENSE.txt',
    'MaterialSymbols-WRAPPER-LICENSE.txt',
  ]) {
    const license = await readFile(new URL(`../assets/licenses/${name}`, import.meta.url), 'utf8');
    assert.ok(
      license.length > 0 && globeNotices.includes(license),
      `Missing bundled notice: ${name}`,
    );
  }
  console.log(
    `PASS — ${land.features.length} physical land features; source/data/worker hashes and bundled notices match. No GPU/runtime claim.`,
  );
} catch (error) {
  console.error('BLOCKED — globe asset validation:', error.message);
  process.exitCode = 1;
}
