import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildExpansion, expansionNotice } from './expansion.mjs';
import { requestOutput } from './requests.mjs';
import { peopleCatalogs, peopleManifest } from '../../src/people/expanded/index.ts';
import { requestedPeople } from '../../src/people/generated/requests.ts';
import { createPeopleExtension } from '../../src/people/extension.ts';
const expected = await buildExpansion();
assert.deepEqual(peopleCatalogs, expected.packs);
assert.deepEqual(peopleManifest.selected, expected.selected);
assert.deepEqual(peopleManifest.pending, expected.pending);
assert.deepEqual(peopleManifest.inputs, expected.inputs);
assert.deepEqual(
  peopleManifest,
  JSON.parse(
    await readFile(new URL('../../data/people/expanded-production/manifest.json', import.meta.url)),
  ),
);
createPeopleExtension(peopleCatalogs, peopleManifest);
const registry = await requestOutput();
assert.deepEqual(registry, requestedPeople);
assert.deepEqual(
  registry,
  JSON.parse(
    await readFile(new URL('../../data/people/production/requests.json', import.meta.url)),
  ),
);
assert.equal(registry.records.length, 823);
assert.equal(registry.occurrences, 952);
// The aggregate request registry includes subsequent Ottoman/global/broad/history releases.
// Pin the reviewed totals; the original 29-profile expansion remains independently checked below.
assert.deepEqual(registry.summary, {
  uniqueRequests: 823,
  published: 220,
  groups: 5,
  ambiguous: 9,
  pending: 594,
  skipped: 9,
});
assert.equal(peopleManifest.published, 29);
assert.equal(peopleManifest.annualBirths, 25);
assert.equal(peopleManifest.biographicalOnly, 3);
assert.equal(
  await readFile(
    new URL('../../assets/licenses/Wikidata-expanded-people-NOTICE.txt', import.meta.url),
    'utf8',
  ),
  expansionNotice,
);
console.log(
  JSON.stringify({
    status: 'PASS',
    requested: registry.summary,
    occurrences: registry.occurrences,
    additionalProfiles: peopleManifest.published,
    additionalBirths: peopleManifest.annualBirths,
    bytes: peopleManifest.entries.reduce((n, e) => n + e.bytes, 0),
  }),
);
