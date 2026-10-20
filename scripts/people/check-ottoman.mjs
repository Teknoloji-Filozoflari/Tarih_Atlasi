import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildOttoman, ottomanNotice } from './ottoman.mjs';
import { peopleCatalogs, peopleManifest } from '../../src/people/ottoman/index.ts';
import { createPeopleExtension } from '../../src/people/extension.ts';

const expected = await buildOttoman();
assert.deepEqual(peopleCatalogs, expected.packs);
assert.deepEqual(peopleManifest.selected, expected.selected);
assert.deepEqual(peopleManifest.pending, []);
assert.deepEqual(peopleManifest.inputs, expected.inputs);
assert.deepEqual(
  peopleManifest,
  JSON.parse(
    await readFile(new URL('../../data/people/ottoman-production/manifest.json', import.meta.url)),
  ),
);
createPeopleExtension(peopleCatalogs, peopleManifest);
assert.equal(peopleManifest.published, 33);
assert.equal(peopleManifest.annualBirths, 22);
assert.equal(peopleManifest.biographicalOnly, 8);
assert.equal(peopleManifest.selected.filter((p) => !p.geometryAvailable).length, 3);
assert.equal(
  await readFile(
    new URL('../../assets/licenses/Wikidata-ottoman-people-NOTICE.txt', import.meta.url),
    'utf8',
  ),
  ottomanNotice,
);
console.log(
  JSON.stringify({
    status: 'PASS',
    version: peopleManifest.version,
    profiles: peopleManifest.published,
    annualBirths: peopleManifest.annualBirths,
    packs: peopleManifest.entries.length,
    bytes: peopleManifest.entries.reduce((n, e) => n + e.bytes, 0),
  }),
);
