import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  splitRequests,
  buildRequestRegistry,
  requestOutput,
} from '../../scripts/people/requests.mjs';
import {
  exactCandidates,
  inspectRequestedEntity,
  parseCollectOptions,
  collectRequests,
} from '../../scripts/people/collect-requests.mjs';
import { requestedPeople } from '../../src/people/generated/requests.ts';
import {
  peopleCatalogs as initial,
  peopleManifest as initialManifest,
} from '../../src/people/generated/index.ts';
import {
  peopleCatalogs as additional,
  peopleManifest as additionalManifest,
} from '../../src/people/expanded/index.ts';
import { createPeopleExtension, combinePeopleExtensions } from '../../src/people/extension.ts';
import { pilotProvider, createHistoricalFeatureLoader } from '../../src/data/pilot.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import { createSearchIndex } from '../../src/discovery/search.ts';
import { withRequestedPeople } from '../../src/people/request-search.ts';
import { pendingPeople, birthReview, peopleCoverage } from '../../src/people/discovery.ts';
import { createSourceRepository } from '../../src/sources/repository.ts';
const combined = combinePeopleExtensions(
  createPeopleExtension(initial, initialManifest),
  createPeopleExtension(additional, additionalManifest),
);
const provider = combined.withProvider(pilotProvider),
  timeline = createTimelineEngine(provider),
  persons = createPersonRepository(provider, timeline);
const recordMap = new Map([...preparedPilot.records, ...combined.records].map((r) => [r.id, r]));
const search = withRequestedPeople(
  createSearchIndex({ ...preparedPilot, records: [...recordMap.values()] }, timeline),
);
const features = createHistoricalFeatureLoader(timeline);
const sources = createSourceRepository(provider, [...preparedPilot.inputs, ...combined.inputs]);
const get = (qid) => combined.records.find((r) => r.kind === 'person' && r.wikidataId === qid);
const birth = (qid) =>
  combined.records.find(
    (r) =>
      r.kind === 'person-location' && r.personId === get(qid)?.id && r.relationshipType === 'BIRTH',
  );

test('all 952 submitted name occurrences are accounted for; conservative aliases produce 823 separate requests', async () => {
  const raw = await readFile(
    new URL('../../data/people/raw/expanded-request.txt', import.meta.url),
    'utf8',
  );
  const entries = splitRequests(raw),
    registry = await requestOutput();
  assert.equal(entries.length, 952);
  assert.deepEqual(registry, requestedPeople);
  assert.equal(registry.records.length, 823);
  for (const entry of entries)
    assert.ok(
      registry.records.some((r) => r.originals.includes(entry.original)),
      entry.original,
    );
  for (const group of [
    'Isaac Newton',
    'Anaksimandros',
    'Gottlieb Daimler',
    'Dmitri Mendeleev',
    'Antonio Vivaldi',
  ])
    assert.equal(registry.records.filter((r) => r.name === group).length, 1, group);
  const byName = (name) => registry.records.find((r) => r.name === name);
  assert.notEqual(byName('Robert Boyle').id, byName('Roger Bacon').id);
  assert.notEqual(byName('I. Murad').id, byName('II. Murad').id);
  assert.notEqual(byName('Ptolemaios').id, byName('Batlamyus').id);
  assert.equal(byName('Millî Salih Demirel').kind, 'ambiguous');
  assert.equal(byName('Millî Salih Demirel').wikidataId, null);
});
test('bands and ambiguous monarchs are not fabricated people; Beatles and Wright members retain separate identities', async () => {
  const rows = (await requestOutput()).records;
  assert.equal(rows.filter((r) => r.kind === 'group').length, 5);
  assert.equal(rows.filter((r) => r.kind === 'ambiguous').length, 9);
  for (const name of [
    'John Lennon',
    'Paul McCartney',
    'George Harrison',
    'Ringo Starr',
    'Orville Wright',
    'Wilbur Wright',
  ])
    assert.equal(rows.filter((r) => r.name === name).length, 1);
  for (const r of rows.filter((r) => r.kind !== 'person')) {
    assert.equal(r.recordId, null);
    assert.equal(r.wikidataId, null);
  }
  assert.equal(pendingPeople('Queen')[0].kind, 'group');
  assert.deepEqual(pendingPeople('Hattuşili'), []);
  assert.deepEqual(pendingPeople('Millî Salih Demirel'), []);
  assert.ok(
    rows
      .filter((r) => r.kind === 'ambiguous')
      .every((r) => r.status === 'skipped-unresolved-identity'),
  );
  assert.equal(pendingPeople('ArCHIMEDES')[0].wikidataId, 'Q8739');
});
test('29 source-backed profiles retain reviewed birth decisions and augment the earlier catalogs', async () => {
  assert.equal(additionalManifest.published, 29);
  // Kanuni's source-year conflict was reviewed: 1494 is no longer an annual point.
  assert.equal(additionalManifest.annualBirths, 25);
  assert.equal((await persons.search('')).total, 141);
  assert.equal(peopleCoverage.profiles, 3202);
  assert.equal(peopleCoverage.annualBirths, 193);
  assert.ok(await provider.getById('atlas:newton-birth'));
  assert.ok(await provider.getById('atlas:muhammad-medina-residence'));
  for (const qid of [
    'Q34503',
    'Q8474',
    'Q664549',
    'Q9036',
    'Q7251',
    'Q615',
    'Q11571',
    'Q19837',
    'Q254',
    'Q7374',
  ]) {
    assert.ok(get(qid));
    assert.ok(birth(qid));
    const detail = await sources.detail([birth(qid).id]);
    assert.equal(detail.rows.length, 2);
    assert.ok(detail.rows.every((r) => r.matched && r.source && r.input));
  }
  assert.equal(birthReview('Q34503').birth[0], 1432);
  assert.equal(birthReview('Q664549').birth[0], 1910);
  assert.equal(birth('Q83100').locationType, 'biographical');
  assert.equal(birth('Q183297'), undefined);
  assert.equal(birth('Q132157').locationType, 'biographical');
  assert.equal(get('Q132157').names[0].value, 'Elealı Zenon');
  assert.equal(get('Q132157').profile.birth.uncertain, true);
  assert.equal(get('Q132157').profile.death.uncertain, true);
  assert.equal(search.search('Zenon').records[0].wikidataId, 'Q132157');
});
test('a documented birth remains visible with unknown death; no lifetime, current presence or artificial death year is inferred', async () => {
  for (const qid of ['Q39259', 'Q615', 'Q11571', 'Q41421', 'Q5284', 'Q34253', 'Q2263', 'Q8877']) {
    const p = get(qid),
      l = birth(qid),
      year = p.profile.birth.start.date.year;
    assert.equal(p.profile.death.start.kind, 'unknown');
    assert.equal(p.temporal.end.kind, 'unknown');
    assert.ok(
      (await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year, true)).some(
        (r) => r.location.id === l.id,
      ),
    );
    for (const other of [year - 1, year + 1, 2026]) {
      assert.ok(
        !(await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(other, true)).some(
          (r) => r.location.id === l.id,
        ),
      );
      assert.ok(!(await persons.PERSON_ALIVE_AT_YEAR(other)).some((r) => r.id === p.id));
    }
    const view = { year, person: true, polity: false, culture: false, labels: false };
    assert.ok(!(await features(view, 4)).features.some((f) => f.id === l.id));
    assert.ok(
      (await features({ ...view, includeApproximatePersons: true }, 4)).features.some(
        (f) => f.id === l.id,
      ),
    );
    const destination = await search.destination(p.id, 2000, 2026);
    assert.equal(destination.related.year, year);
  }
});
test('source-linked homonymous places and west/south longitude remain intact, and unsigned expansion inputs cannot publish', () => {
  assert.equal(birthReview('Q7245').placeQid, 'Q537803');
  assert.notEqual(birthReview('Q7245').placeQid, 'Q812');
  assert.equal(birthReview('Q2263').placeQid, 'Q490441');
  assert.ok(birth('Q615').geometry.coordinates.every((n) => n < 0));
  assert.ok(birth('Q7251').geometry.coordinates[0] < 0);
  assert.ok(birth('Q664549').geometry.coordinates[0] > 20);
  const m = structuredClone(additionalManifest);
  m.inputs.browserReview = '0'.repeat(64);
  assert.throws(() => createPeopleExtension(additional, m), /PEOPLE_REVIEW_REQUIRED/u);
  assert.throws(() => combinePeopleExtensions(combined, combined), /PEOPLE_RELEASE_COLLISION/u);
});
test('user spelling hints find existing sourced profiles without changing canonical names, source evidence or Wikipedia identity', () => {
  for (const [term, qid] of [
    ['Sir Isaac Newton', 'Q935'],
    ['Nikolas Kopernik', 'Q619'],
    ['Gregor Johann Mendel', 'Q37970'],
    ['II. Mehmed', 'Q34503'],
    ['Sir Alexander Fleming', 'Q37064'],
  ])
    assert.ok(
      search.search(term).records.some((r) => r.wikidataId === qid),
      term,
    );
  assert.equal(search.get(get('Q935').id).name, 'Isaac Newton');
  assert.equal(get('Q935').names[0].value, 'Isaac Newton');
  assert.ok(!get('Q935').alternativeNames.some((n) => n.value === 'Sir Isaac Newton'));
});
test('collector refuses first-result matching, non-human namesakes and invalid/retried unlimited work; candidates remain unverified', () => {
  const request = {
    id: 'request:synthetic',
    name: 'SYNTHETIC TEST PERSON',
    aliases: ['SYNTHETIC ALIAS'],
  };
  const result = exactCandidates(
    [
      { id: 'Q999999999', label: 'wrong namesake' },
      { id: 'Q999999998', label: 'SYNTHETIC ALIAS' },
    ],
    request,
  );
  assert.deepEqual(result, ['Q999999998']);
  assert.deepEqual(
    exactCandidates(
      [
        { id: 'Q9', label: 'SYNTHETIC ALIAS' },
        { id: 'Q10', label: 'SYNTHETIC TEST PERSON' },
      ],
      request,
    ),
    ['Q9', 'Q10'],
  );
  const raw = {
    entities: {
      Q999999998: {
        id: 'Q999999998',
        lastrevid: 1,
        labels: { en: { value: 'SYNTHETIC TEST PERSON' } },
        claims: { P31: [{ rank: 'normal', mainsnak: { datavalue: { value: { id: 'Q123' } } } }] },
      },
    },
  };
  assert.equal(inspectRequestedEntity(raw, 'Q999999998', request).status, 'rejected-not-human');
  raw.entities.Q999999998.claims.P31[0].mainsnak.datavalue.value.id = 'Q5';
  const decision = inspectRequestedEntity(raw, 'Q999999998', request);
  assert.equal(decision.productionApproved, false);
  assert.equal(decision.geometry, null);
  for (const args of [['--limit', '0'], ['--limit', '1001'], ['--delay-ms', '0'], ['--unknown']])
    assert.throws(() => parseCollectOptions(args));
  assert.equal(parseCollectOptions(['--limit', '1000', '--verify']).verify, true);
  assert.throws(() => splitRequests('=== SYNTHETIC ===\nSYNTHETIC (bad'));
  assert.equal(
    buildRequestRegistry('=== SYNTHETIC ===\nSYNTHETIC PERSON', []).records[0].recordId,
    null,
  );
});

test('synthetic HTTP collection retries politely, resumes from hash-checked cache, verifies offline and never publishes candidates', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atlas-request-collection-'));
  const root = pathToFileURL(directory + '/');
  const id = 'Q999999998',
    placeId = 'Q999999997';
  const request = {
    id: 'request:synthetic',
    name: 'SYNTHETIC TEST PERSON',
    aliases: [],
    kind: 'person',
    status: 'source-review-required',
    wikidataId: null,
  };
  const registry = {
    inputSha256: 'SYNTHETIC TEST INPUT',
    records: [request, { ...request, id: 'request:group', kind: 'group' }],
  };
  const snak = (value) => ({
    rank: 'normal',
    mainsnak: { snaktype: 'value', datavalue: { value: { id: value } } },
  });
  const entity = {
    id,
    lastrevid: 123,
    labels: { en: { value: request.name } },
    claims: { P31: [snak('Q5')], P19: [snak(placeId)] },
  };
  let calls = 0,
    active = 0,
    maxActive = 0;
  const waits = [];
  const dependencies = {
    root,
    registry,
    wait: async (ms) => {
      waits.push(ms);
    },
    fetcher: async (url) => {
      calls++;
      active++;
      maxActive = Math.max(maxActive, active);
      try {
        const u = new URL(url);
        assert.equal(u.origin, 'https://www.wikidata.org');
        if (calls === 1) return new Response('', { status: 429, headers: { 'retry-after': '1' } });
        if (u.searchParams.get('action') === 'wbsearchentities')
          return Response.json({ search: [{ id, label: request.name }] });
        const target = u.searchParams.get('ids');
        assert.ok([id, placeId].includes(target));
        return Response.json({
          entities: {
            [target]: target === id ? entity : { id: placeId, lastrevid: 124, claims: {} },
          },
        });
      } finally {
        active--;
      }
    },
  };
  try {
    const result = await collectRequests(
      ['--limit', '1'],
      'TarihAtlasi/test (https://example.test/contact)',
      dependencies,
    );
    assert.equal(calls, 5);
    assert.equal(maxActive, 1);
    assert.ok(waits.includes(1000));
    assert.equal(result.completed, 1);
    assert.equal(result.productionApproved, false);
    assert.equal(result.results[0].productionApproved, false);
    assert.equal(result.results[0].geometry, null);
    assert.equal(result.results[0].sourceRevision, '123');
    const verified = await collectRequests(['--verify'], undefined, {
      ...dependencies,
      fetcher: async () => {
        throw new Error('unexpected HTTP');
      },
    });
    assert.equal(verified.httpRequests, 0);
    assert.equal(verified.completed, 1);
    const receiptFile = new URL(id + '.receipt.json', root);
    const originalReceipt = await readFile(receiptFile, 'utf8');
    const modified = JSON.parse(originalReceipt);
    modified.sourceRevision = '999';
    await writeFile(receiptFile, JSON.stringify(modified));
    await assert.rejects(
      collectRequests(['--verify'], undefined, dependencies),
      /REQUEST_CACHE_REVISION/u,
    );
    await writeFile(receiptFile, originalReceipt);
    await writeFile(new URL(id + '.json', root), '{}');
    await assert.rejects(
      collectRequests(['--verify'], undefined, dependencies),
      /REQUEST_CACHE_CORRUPT/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
