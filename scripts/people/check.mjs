import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { buildPeople, peopleNotice, PEOPLE_VERSION } from './build.mjs';
import { peopleCatalogs, peopleManifest } from '../../src/people/generated/index.ts';
import { createPeopleExtension } from '../../src/people/extension.ts';
const expected = await buildPeople();
const manifest = JSON.parse(
  await readFile(new URL('../../data/people/production/manifest.json', import.meta.url)),
);
assert.deepEqual(peopleManifest, manifest);
assert.equal(manifest.version, PEOPLE_VERSION);
assert.equal(manifest.requested, 113);
assert.equal(manifest.published, expected.selected.length);
assert.equal(manifest.reviewedAt, expected.reviewedAt);
assert.deepEqual(manifest.inputs, expected.inputs);
assert.deepEqual(manifest.selected, expected.selected);
assert.deepEqual(manifest.pending, expected.pending);
assert.equal(manifest.annualBirths, expected.selected.filter((p) => p.annualBirth).length);
assert.equal(
  manifest.biographicalOnly,
  expected.selected.filter((p) => p.geometryAvailable && !p.annualBirth).length,
);
assert.deepEqual(peopleCatalogs, expected.packs);
assert.equal(manifest.entries.length, expected.packs.length);
for (const [i, pack] of expected.packs.entries()) {
  const raw = JSON.stringify(pack);
  assert.deepEqual(manifest.entries[i], {
    index: i,
    sha256: createHash('sha256').update(raw).digest('hex'),
    bytes: Buffer.byteLength(raw),
    records: pack.records.length,
  });
}
const roster = JSON.parse(
  await readFile(new URL('../../data/people/raw/requests.json', import.meta.url)),
);
const review = JSON.parse(
  await readFile(new URL('../../data/people/raw/browser-review.json', import.meta.url)),
);
assert.deepEqual(roster.requests, review.requests);
assert.equal(
  await readFile(
    new URL('../../assets/licenses/Wikidata-births-NOTICE.txt', import.meta.url),
    'utf8',
  ),
  peopleNotice,
);
const extension = createPeopleExtension(peopleCatalogs, peopleManifest);
console.log(
  JSON.stringify({
    status: 'PASS',
    people: manifest.published,
    births: manifest.annualBirths,
    biographies: manifest.biographicalOnly,
    pending: manifest.pending.length,
    packs: manifest.entries.length,
    records: extension.records.length,
    bytes: manifest.entries.reduce((n, e) => n + e.bytes, 0),
  }),
);
