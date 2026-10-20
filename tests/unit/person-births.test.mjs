import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { sourceYear, sourceCoordinate, buildPeople } from '../../scripts/people/build.mjs';
import { peopleCatalogs, peopleManifest } from '../../src/people/generated/index.ts';
import { createPeopleExtension } from '../../src/people/extension.ts';
import { birthReview, pendingPeople } from '../../src/people/discovery.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { pilotProvider, createHistoricalFeatureLoader } from '../../src/data/pilot.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import { createSearchIndex } from '../../src/discovery/search.ts';
import { createSourceRepository } from '../../src/sources/repository.ts';
import { createChunkedFeatureLoader } from '../../src/map/globe/data-loader.ts';
import { createApplicationData } from '../../src/data/application-core.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';

const extension = createPeopleExtension(peopleCatalogs, peopleManifest);
const provider = extension.withProvider(pilotProvider);
const timeline = createTimelineEngine(provider);
const persons = createPersonRepository(provider, timeline);
const records = new Map(preparedPilot.records.map((r) => [r.id, r]));
for (const r of extension.records) records.set(r.id, r);
const search = createSearchIndex({ ...preparedPilot, records: [...records.values()] }, timeline);
const sources = createSourceRepository(provider, [...preparedPilot.inputs, ...extension.inputs]);
const features = createHistoricalFeatureLoader(timeline);
const view = {
  polity: false,
  culture: false,
  person: true,
  labels: false,
  includeApproximatePersons: true,
};
const profile = (qid) => extension.records.find((r) => r.kind === 'person' && r.wikidataId === qid);
const locations = (qid) =>
  extension.records.filter((r) => r.kind === 'person-location' && r.personId === profile(qid).id);

test('actual application composition exposes the new people without losing country sources, old events or marker IDs', async () => {
  const world = createWorldRepository(worldManifest, (_i, pack) =>
    readFile(new URL(`../../assets/world/${pack.sha256}.atlas`, import.meta.url), 'utf8'),
  );
  const app = createApplicationData(
    {
      provider: pilotProvider,
      timeline: createTimelineEngine(pilotProvider),
      search: createSearchIndex(preparedPilot, createTimelineEngine(pilotProvider)),
      catalog: preparedPilot,
    },
    world,
    extension,
  );
  assert.equal((await app.persons.search('Atatürk')).records[0].wikidataId, 'Q5152');
  assert.ok(app.search.search('Marie Curie').records.some((r) => r.wikidataId === 'Q7186'));
  const coverage = await app.timeline.getDataCoverage(1881, {
    layers: ['person'],
    includeApproximatePersons: true,
  });
  assert.ok(coverage.records.some((r) => r.record.id === locations('Q5152')[0].id));
  const polities = await app.timeline.getTerritoriesAtYear(2010);
  for (const id of ['world:clio-r13239', 'world:clio-r13580']) {
    assert.ok(polities.some((p) => p.record.id === id));
    assert.ok((await app.sources.detail([id])).rows.every((r) => r.matched));
  }
  const oldEvent = preparedPilot.records.find((r) => r.kind === 'event');
  assert.deepEqual(await app.provider.getById(oldEvent.id), oldEvent);
  assert.equal((await app.provider.getById('atlas:newton-birth')).personId, 'atlas:person-newton');
  world.clear();
});

test('113 requested identities are accounted for, including two separate Wright brothers and pending source reviews', async () => {
  const roster = JSON.parse(
    await readFile(new URL('../../data/people/raw/requests.json', import.meta.url)),
  );
  assert.equal(roster.requests.length, 113);
  assert.equal(new Set(roster.requests.map((r) => r.candidateWikidataId)).size, 113);
  assert.equal(peopleManifest.published + peopleManifest.pending.length, 113);
  for (const r of roster.requests) {
    const p = profile(r.candidateWikidataId);
    if (p) {
      assert.ok(
        search.search(r.name).records.some((e) => e.wikidataId === r.candidateWikidataId),
        r.name,
      );
      assert.equal(p.synthetic, false);
      assert.equal(p.profile.image, null);
      assert.deepEqual(p.profile.wikipedia, []);
    } else assert.ok(peopleManifest.pending.some((p) => p.wikidataId === r.candidateWikidataId));
  }
  assert.notEqual(profile('Q494455').id, profile('Q1396131').id);
  assert.notEqual(profile('Q374210').id, profile('Q692').id);
  assert.equal(pendingPeople('ARCHIMEDES')[0].wikidataId, 'Q8739');
  assert.equal(pendingPeople('Watt')[0].wikidataId, 'Q9041');
  assert.equal((await persons.search('')).total, 112); // Earlier Van Gogh is retained.
});
test('all independent packs retain production rights/hash limits and reproduce reviewed snapshots', async () => {
  assert.deepEqual((await buildPeople()).packs, peopleCatalogs);
  assert.equal(peopleCatalogs.length, 14);
  assert.ok(Buffer.byteLength(JSON.stringify(preparedPilot)) <= 512 * 1024);
  for (const c of peopleCatalogs) {
    assert.equal(validateCatalog(c).ok, true);
    assert.ok(c.inputs.length <= 64);
    assert.ok(Buffer.byteLength(JSON.stringify(c)) <= 256 * 1024);
    for (const r of c.records) {
      assert.equal(r.licenseId, 'CC0-1.0');
      assert.ok(r.attribution.length);
      assert.ok(r.evidence.length);
      for (const e of r.evidence) {
        const s = await provider.getSource(e.sourceId);
        assert.equal(s.revision, e.sourceRevision);
        assert.match(s.url, /^https:\/\/www.wikidata.org\/w\/index.php\?title=Q\d+&oldid=\d+$/u);
      }
    }
  }
});
test('birth source parsing rejects year zero, centuries and reference IDs; DMS preserves longitude/hemisphere', () => {
  for (const value of ['0', 'Q935', '20. century', '2700s BCE', 'https://example.org/1881', null])
    assert.equal(sourceYear(value), null);
  assert.equal(sourceYear('384 BCE'), -384);
  assert.equal(sourceYear('25 December 1642^{Julian}'), 1642);
  assert.equal(sourceYear('4 January 1643^{Gregorian}'), 1643);
  assert.deepEqual(sourceCoordinate(['41°0\'0"S, 173°0\'0"E']).coordinates, [173, -41]);
  assert.deepEqual(sourceCoordinate(['52°0\'0"N, 2°0\'0"W']).coordinates, [-2, 52]);
  assert.throws(() => sourceCoordinate(['90°61\'0"N, 2°0\'0"W']));
});
test('Atatürk source supports only the 1881 birth snapshot at the approximate Selanik representative point', async () => {
  const p = profile('Q5152'),
    [l] = locations('Q5152');
  assert.equal(p.profile.birth.start.date.year, 1881);
  assert.equal(p.profile.birth.start.date.month, null);
  assert.equal(p.profile.birth.start.date.day, null);
  assert.match(p.confidence.rationale, /19 Mayıs/u);
  assert.equal(l.relationshipType, 'BIRTH');
  assert.equal(l.temporal.support.kind, 'snapshot');
  assert.deepEqual(l.geometry.coordinates, [22 + 56 / 60 + 8 / 3600, 40 + 38 / 60 + 25 / 3600]);
  assert.equal(l.spatialContext.coordinateRole, 'representative-place');
  assert.ok(l.evidence.some((e) => e.locator.includes('P19:') && e.claims.includes('temporal')));
  assert.ok(l.evidence.some((e) => e.locator.includes('P625:') && e.claims.includes('geometry')));
  for (const year of [1880, 1882, 1919, 1938, 2000])
    assert.ok(!(await features({ ...view, year }, 4)).features.some((f) => f.id === l.id));
  assert.ok((await features({ ...view, year: 1881 }, 4)).features.some((f) => f.id === l.id));
  assert.ok(
    !(await features({ ...view, year: 1881, includeApproximatePersons: false }, 4)).features.some(
      (f) => f.id === l.id,
    ),
  );
  const d = await search.destination(p.id, 2000, 2026);
  assert.equal(d.current.year, 2000);
  assert.equal(d.current.hits.length, 0);
  assert.equal(d.related.year, 1881);
  assert.ok(d.related.hits.some((h) => h.record.id === l.id));
});
test('annual points are unique birth-year-only claims and corrected old marker IDs remain stable', async () => {
  const births = extension.records.filter(
    (r) => r.kind === 'person-location' && r.locationType === 'timed-presence',
  );
  assert.equal(births.length, peopleManifest.annualBirths);
  assert.equal(locations('Q935')[0].id, 'atlas:newton-birth');
  assert.equal(locations('Q937')[0].id, 'atlas:einstein-birth');
  assert.equal(profile('Q935').profile.birth.start.date.year, 1643);
  for (const l of births) {
    assert.equal(l.relationshipType, 'BIRTH');
    assert.equal(l.temporal.start.date.year, l.temporal.end.date.year);
    assert.equal(l.temporal.start.date.month, null);
    const year = l.temporal.start.date.year;
    for (const y of [year, year === 1 ? -1 : year - 1, year === -1 ? 1 : year + 1]) {
      const matches = await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(y, true);
      assert.equal(matches.filter((h) => h.location.id === l.id).length, y === year ? 1 : 0, l.id);
    }
  }
  assert.ok(await provider.getById('atlas:muhammad-medina-residence'));
  assert.ok(await provider.getById('atlas:gutenberg-death'));
  assert.ok(await provider.getById('atlas:columbus-death'));
});
test('traditional/ambiguous biographies never become an arbitrary annual map point; regional birthplaces never become city centers', async () => {
  for (const qid of ['Q9077', 'Q9441', 'Q302', 'Q8958', 'Q4604', 'Q9200', 'Q720', 'Q1496']) {
    assert.equal(birthReview(qid).annualBirth, false);
    assert.ok(
      locations(qid).every(
        (l) => l.locationType === 'biographical' && l.temporal.start.kind === 'unknown',
      ),
    );
  }
  for (const qid of ['Q23', 'Q41284', 'Q9333', 'Q8423', 'Q188903', 'Q3044'])
    assert.equal(locations(qid).length, 0);
  for (const qid of ['Q8747', 'Q6691', 'Q189574', 'Q161904']) {
    assert.equal(locations(qid).length, 0);
    assert.equal(profile(qid).profile.birth.start.kind, 'unknown');
  }
  for (const year of [-2000, -600, -500, -7, -1, 1, 5, 570, 1400, 2000]) {
    const points = (await features({ ...view, year }, 4)).features;
    for (const qid of ['Q9077', 'Q9441', 'Q302', 'Q8958'])
      assert.ok(!points.some((p) => locations(qid).some((l) => l.id === p.id)));
  }
});
test('review and integrity failures cannot silently publish new/modified raw data, licenses or attribution', () => {
  const clone = () => [structuredClone(peopleCatalogs), structuredClone(peopleManifest)];
  const rehash = (packs, m) => {
    const raw = JSON.stringify(packs[0]);
    m.entries[0].sha256 = createHash('sha256').update(raw).digest('hex');
    m.entries[0].bytes = Buffer.byteLength(raw);
  };
  let [packs, m] = clone();
  packs[0].records[0].names[0].value = 'tampered';
  assert.throws(() => createPeopleExtension(packs, m), /PEOPLE_PACK_INTEGRITY/u);
  [packs, m] = clone();
  packs[0].records[0].attribution = '';
  rehash(packs, m);
  assert.throws(() => createPeopleExtension(packs, m), /PEOPLE_RIGHTS/u);
  [packs, m] = clone();
  packs[0].records[0].licenseId = 'UNKNOWN';
  rehash(packs, m);
  assert.throws(() => createPeopleExtension(packs, m), /PEOPLE_RIGHTS/u);
  [packs, m] = clone();
  m.inputs.browserReview = '0'.repeat(64);
  assert.throws(() => createPeopleExtension(packs, m), /PEOPLE_REVIEW_REQUIRED/u);
  [packs, m] = clone();
  packs[0].inputs[0].sha256 = '0'.repeat(64);
  rehash(packs, m);
  assert.throws(() => createPeopleExtension(packs, m), /PEOPLE_RIGHTS/u);
});
test('validated extension values are deeply immutable and the renderer accepts only rights-checked birth geometry', async () => {
  const [l] = locations('Q5152');
  assert.throws(() => {
    l.geometry.coordinates[0] = 0;
  }, TypeError);
  assert.equal(extension.hasGeometry(profile('Q5152').id), false);
  assert.equal(extension.hasGeometry('unknown:point'), false);
  let ensured = false;
  const runtime = {
    ensure: async () => {
      ensured = true;
      return { values: [], status: { chunks: 0, origins: ['bundled'], stale: false } };
    },
  };
  const loader = createChunkedFeatureLoader(features, runtime, (id) => extension.hasGeometry(id));
  const result = await loader({ ...view, year: 1881 }, 4);
  assert.ok(ensured);
  assert.ok(result.features.some((f) => f.id === l.id));
  await assert.rejects(
    createChunkedFeatureLoader(features, runtime)({ ...view, year: 1881 }, 4),
    /CHUNK_GEOMETRY/u,
  );
  const d = await sources.detail([l.id]);
  assert.equal(d.rows.length, 2);
  assert.ok(d.rows.every((r) => r.matched && r.input && r.source));
});
