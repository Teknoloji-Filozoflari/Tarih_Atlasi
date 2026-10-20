import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { format } from 'prettier';
import { mapSources, acquireMapSource } from './map-sources.mjs';
import { normalizePhysical } from '../src/map/globe/physical-detail.ts';
const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
assert.ok(process.argv.length === 2 || (check && process.argv.length === 3));
const names = ['land', 'lakes', 'rivers'];
const pending = [];
const hashes = [
  '1ac90796408bc6ad6911d69448485d3c4dbf2190370080368a09976e1c9f7416',
  '2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9',
  'bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a',
];
const normalizedHashes = [
  '057bd8c8d81f8f4cd3395d40cdca033307297b130853eb8336f4216697f5db8a',
  '7941b67b737ca033535340c3cec6f69f080aad3b3ae15f7333c2f6267600dedd',
  '44d95cfe4879bdd9576006b034dbcbb36ce4be42a48a7974c9ecbae751dfad74',
];
const hash = (b) => createHash('sha256').update(b).digest('hex');
const manifestPath = new URL('assets/licenses/physical-detail-provenance.json', root);
const manifest = check
  ? JSON.parse(await readFile(manifestPath, 'utf8'))
  : {
      version: '5.1.2',
      license: 'public domain',
      terms: 'https://www.naturalearthdata.com/about/terms-of-use/',
      attribution: 'Made with Natural Earth.',
      transformation:
        'Physical coordinates preserved; all properties stripped. Contemporary reference, not historical coast/water reconstruction. No tiles, modern borders or labels.',
      layers: [],
    };
for (const [i, name] of names.entries()) {
  const spec = mapSources[i],
    output = new URL(`src/map/globe/generated/physical-${name}-10m.ts`, root);
  let raw;
  if (check) {
    const info = await lstat(output);
    assert.ok(info.isFile() && info.size <= 24 * 1024 * 1024);
    raw = (await import(output.href)).raw;
    assert.equal(hash(raw), manifest.layers[i].outputSha256);
    assert.equal(manifest.layers[i].inputSha256, hashes[i]);
    assert.equal(manifest.layers[i].source, spec.url);
    assert.equal(manifest.license, 'public domain');
    assert.equal(manifest.terms, spec.licenseURL);
    const data = normalizePhysical(JSON.parse(raw), name);
    assert.equal(JSON.stringify(data), raw);
    assert.equal(manifest.layers[i].features, data.features.length);
    assert.equal(manifest.layers[i].outputBytes, Buffer.byteLength(raw));
    assert.equal(manifest.version, '5.1.2');
    assert.deepEqual(manifest.layers[i].omittedEmptyFeatures, name === 'rivers' ? [1452] : []);
  } else {
    const staging = new URL('data/staging/map-sources/', root);
    const receipt = await acquireMapSource(spec, fileURLToPath(staging), { verifyOnly: true });
    assert.equal(receipt.sha256, hashes[i], 'Unreviewed revision: stop rather than auto-approve');
    const input = JSON.parse(await readFile(new URL(spec.file, staging), 'utf8'));
    const omittedEmptyFeatures = [];
    if (name === 'rivers')
      input.features = input.features.filter((f, index) => {
        if (f.geometry?.type === 'MultiLineString' && f.geometry.coordinates.length === 0) {
          omittedEmptyFeatures.push(index);
          return false;
        }
        return true;
      });
    const normalized = normalizePhysical(input, name);
    raw = JSON.stringify(normalized);
    manifest.layers.push({
      name,
      source: spec.url,
      inputSha256: receipt.sha256,
      inputBytes: receipt.bytes,
      omittedEmptyFeatures,
      outputSha256: hash(raw),
      outputBytes: Buffer.byteLength(raw),
      features: normalized.features.length,
    });
    pending.push([
      output,
      await format(
        `// Natural Earth v5.1.2 public domain. See assets/licenses/physical-detail-provenance.json.\nexport const raw = ${JSON.stringify(raw)};\n`,
        { parser: 'typescript', singleQuote: true, printWidth: 95 },
      ),
    ]);
  }
  assert.equal(
    hash(raw),
    normalizedHashes[i],
    'Physical output differs from pinned reviewed transform',
  );
  console.log(`${check ? 'Checked' : 'Prepared'} ${name}: ${Buffer.byteLength(raw)} bytes`);
}
if (!check) {
  for (const [file, text] of pending) await writeFile(file, text);
  await writeFile(
    manifestPath,
    await format(JSON.stringify(manifest), { parser: 'json', printWidth: 100 }),
  );
}
