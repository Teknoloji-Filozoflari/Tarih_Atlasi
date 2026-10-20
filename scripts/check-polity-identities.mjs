import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { polityWikidataId } from '../src/sources/polity-identity.ts';
import { polityIdentityIds } from '../src/sources/generated/polity-identities.ts';
import { worldManifest } from '../src/data/world/generated/manifest.ts';
const indices = new Set(worldManifest.rows.map((row) => String(row.index)));
for (const [index, id] of Object.entries(polityIdentityIds)) {
  assert.ok(indices.has(index));
  assert.match(id, /^Q[1-9]\d{0,15}$/);
}
assert.equal(Object.keys(polityIdentityIds).length, 13375);
assert.equal(typeof polityWikidataId, 'function'); // importing runs the independent checksum pin.
assert.equal(
  createHash('sha256')
    .update(
      await readFile(new URL('../assets/licenses/Cliopatria-identity-NOTICE.txt', import.meta.url)),
    )
    .digest('hex'),
  '51214acabf93a1ba55f285f9d510df50e78c0b609143d2cdc15279e432fd43c2',
  'Source identity attribution must accompany the extracted metadata.',
);
console.log(
  'PASS: 13375 source-provided QIDs match the reviewed extraction checksum, source row scope and NOTICE; no Wikipedia titles generated.',
);
