import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildOttoman } from '../../scripts/people/ottoman.mjs';
import {
  peopleCatalogs as initial,
  peopleManifest as initialManifest,
} from '../../src/people/generated/index.ts';
import {
  peopleCatalogs as expanded,
  peopleManifest as expandedManifest,
} from '../../src/people/expanded/index.ts';
import { peopleCatalogs, peopleManifest } from '../../src/people/ottoman/index.ts';
import { createPeopleExtension, combinePeopleExtensions } from '../../src/people/extension.ts';
import { pilotProvider, createHistoricalFeatureLoader } from '../../src/data/pilot.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import { createSourceRepository } from '../../src/sources/repository.ts';
import { requestedPeople } from '../../src/people/generated/requests.ts';
import { peopleCoverage, birthReview, pendingPeople } from '../../src/people/discovery.ts';

const extension = combinePeopleExtensions(
  combinePeopleExtensions(
    createPeopleExtension(initial, initialManifest),
    createPeopleExtension(expanded, expandedManifest),
  ),
  createPeopleExtension(peopleCatalogs, peopleManifest),
);
const provider = extension.withProvider(pilotProvider);
const timeline = createTimelineEngine(provider);
const persons = createPersonRepository(provider, timeline);
const sourceRepository = createSourceRepository(provider, extension.inputs);
const features = createHistoricalFeatureLoader(timeline);
const profile = (qid) => extension.records.find((r) => r.kind === 'person' && r.wikidataId === qid);
const location = (qid) =>
  extension.records.find((r) => r.kind === 'person-location' && r.personId === profile(qid)?.id);

test('all 36 requested Ottoman sultans resolve to distinct sourced profiles; earlier IDs and profiles survive', async () => {
  const requests = requestedPeople.records.filter((r) =>
    r.sections.some((s) => s.includes('OSMANLI PADİŞAHLARI')),
  );
  assert.equal(requests.length, 36);
  assert.equal(new Set(requests.map((r) => r.recordId)).size, 36);
  for (const r of requests) {
    assert.equal(r.status, 'published', r.name);
    assert.equal((await provider.getById(r.recordId)).wikidataId, r.wikidataId);
    assert.deepEqual(
      pendingPeople(r.name).filter((p) => p.id === r.id),
      [],
    );
  }
  assert.equal((await persons.search('')).total, 174);
  assert.equal(peopleCoverage.availableRequested, 220);
  assert.equal(peopleCoverage.annualBirths, 193);
  assert.ok(await provider.getById('atlas:newton-birth'));
  assert.ok(await provider.getById('atlas:muhammad-medina-residence'));
  assert.notEqual(profile('Q96261').id, profile('Q131394').id);
  assert.notEqual(profile('Q131394').id, profile('Q159934').id);
});
test('every new annual birth point is limited to its sourced year, remains approximate and has matched immutable evidence', async () => {
  const annual = peopleManifest.selected.filter((p) => p.annualBirth);
  assert.equal(annual.length, 22);
  for (const p of annual) {
    const l = location(p.qid),
      year = p.birth[0];
    assert.equal(l.locationType, 'timed-presence');
    assert.equal(l.temporal.support.kind, 'snapshot');
    assert.equal(l.spatialContext.coordinateRole, 'representative-place');
    assert.ok(
      (await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year, true)).some(
        (r) => r.location.id === l.id,
      ),
    );
    for (const y of [year - 1, year + 1, 2000])
      assert.ok(
        !(await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(y, true)).some(
          (r) => r.location.id === l.id,
        ),
      );
    const detail = await sourceRepository.detail([l.id]);
    assert.equal(detail.rows.length, 2);
    for (const row of detail.rows) {
      assert.ok(row.matched && row.source && row.input);
      assert.match(
        row.source.url,
        /https:\/\/www\.wikidata\.org\/w\/index\.php\?title=Q\d+&oldid=\d+$/u,
      );
      assert.equal(row.source.licenseId, 'CC0-1.0');
    }
  }
  const l = location('Q161872');
  const view = { year: 1524, person: true, polity: false, culture: false, labels: false };
  assert.ok(!(await features(view, 4)).features.some((f) => f.id === l.id));
  assert.ok(
    (await features({ ...view, includeApproximatePersons: true }, 4)).features.some(
      (f) => f.id === l.id,
    ),
  );
});
test('disputed chronology is preserved without choosing a map year, including corrected prior birth snapshots', async () => {
  for (const qid of [
    'Q133168',
    'Q96261',
    'Q168769',
    'Q131394',
    'Q165983',
    'Q494660',
    'Q199481',
    'Q8474',
    'Q8413',
    'Q9554',
    'Q255',
    'Q30578',
  ]) {
    const p = profile(qid),
      l = location(qid);
    assert.ok(p.profile.birth.uncertain, qid);
    assert.equal(l.locationType, 'biographical', qid);
    assert.equal(l.temporal.start.kind, 'unknown', qid);
    assert.equal(birthReview(qid).annualBirth, false, qid);
    const year = p.profile.birth.start.date?.year;
    if (year)
      assert.ok(
        !(await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year, true)).some(
          (r) => r.location.id === l.id,
        ),
        qid,
      );
  }
  assert.match(birthReview('Q8474').note, /1496/u);
  assert.match(birthReview('Q165983').note, /1448/u);
});
test('unverified places have no city-center fallback and palace sites do not become precise birth-room coordinates', () => {
  for (const qid of ['Q128358', 'Q174798', 'Q151500']) assert.equal(location(qid), undefined);
  assert.equal(profile('Q174798').profile.birth.start.kind, 'unknown');
  assert.match(profile('Q174798').profile.descriptions[0].value, /çelişen/u);
  assert.equal(location('Q170707').spatialContext.scale, 'site');
  assert.equal(location('Q170707').spatialContext.coordinateRole, 'representative-place');
  assert.equal(location('Q151494').locationType, 'biographical');
  assert.match(birthReview('Q151494').note, /1863/u);
  assert.equal(birthReview('Q199633').qid, 'Q199633');
  assert.equal(profile('Q20793524'), undefined);
});
test('two births at the same representative point in 1642 retain separate selectable records', async () => {
  const first = location('Q170514'),
    second = location('Q172061');
  assert.notEqual(first.id, second.id);
  assert.deepEqual(first.geometry, second.geometry);
  const layer = await features(
    {
      year: 1642,
      person: true,
      polity: false,
      culture: false,
      labels: false,
      includeApproximatePersons: true,
    },
    4,
  );
  assert.equal(layer.features.filter((f) => [first.id, second.id].includes(f.id)).length, 2);
});
test('source bytes, reviewed decisions, release and license gates are required; old uncertainty qualifiers remain in raw evidence', async () => {
  const result = await buildOttoman();
  assert.deepEqual(result.packs, peopleCatalogs);
  const wrong = structuredClone(peopleManifest);
  wrong.inputs.decisions = '0'.repeat(64);
  assert.throws(() => createPeopleExtension(peopleCatalogs, wrong), /PEOPLE_REVIEW_REQUIRED/u);
  const corrupt = structuredClone(peopleCatalogs);
  corrupt[0].records[0].licenseId = 'UNKNOWN';
  assert.throws(() => createPeopleExtension(corrupt, peopleManifest), /PEOPLE_PACK_INTEGRITY/u);
  assert.throws(
    () => createPeopleExtension(initial, { ...initialManifest, version: '1.0.0-births' }),
    /PEOPLE_REVIEW_REQUIRED/u,
  );
  const raw = JSON.parse(
    await readFile(new URL('../../data/people/raw/browser-review.json', import.meta.url)),
  );
  for (const [qid, qualifier] of [
    ['Q8413', 'circa'],
    ['Q9554', 'disputed'],
    ['Q255', 'presumably'],
    ['Q30578', 'circa'],
  ]) {
    assert.ok(raw.people.find((p) => p.qid === qid).props['date of birth'].includes(qualifier));
    assert.equal(birthReview(qid).annualBirth, false);
  }
});
