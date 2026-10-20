import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { assertWorldManifest, validateWorldPack } from '../../src/data/world/manifest.ts';
assertWorldManifest(worldManifest);
const root = new URL('../../assets/world/', import.meta.url);
let bytes = 0;
for (const pack of worldManifest.packs) {
  const raw = await readFile(new URL(`${pack.sha256}.atlas`, root), 'utf8');
  validateWorldPack(raw, pack);
  bytes += pack.bytes;
}
assert.deepEqual(
  (await readdir(root)).filter((n) => n.endsWith('.atlas')).sort(),
  worldManifest.packs.map((p) => p.sha256 + '.atlas').sort(),
);
assert.equal(worldManifest.sourceRows, 13797);
assert.equal(worldManifest.rows.length, 13379);
assert.equal(worldManifest.invalidMetadataRows, 6);
console.log(
  `PASS: ${worldManifest.rows.length} source political rows, ${worldManifest.packs.length} bounded immutable assets / ${bytes} bytes; publisher rights, manifest and every geometry hash verified. Not independent historical/device verification.`,
);
