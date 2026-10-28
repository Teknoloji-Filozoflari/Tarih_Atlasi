import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendDiscoveryPilot } from '../../scripts/pilot/discovery.mjs';
import { preparedPilot, pilotManifest } from '../../src/data/generated/pilot.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { parse } from '../../src/domain/schema.ts';
import { catalogSchema } from '../../src/domain/schemas.ts';
import {
  pilotPersons,
  pilotSearch,
  pilotTimeline,
  historicalFeatures,
} from '../../src/data/pilot.ts';
import { modernCities, getModernCity, MODERN_CITY_MIN_ZOOM } from '../../src/places/modern.ts';
import { parseMessage, INITIAL_CAMERA, encode } from '../../src/map-contract/protocol.ts';
import { parsePreferences, defaultPreferences } from '../../src/preferences/model.ts';
import { eventLayer } from '../../src/events/model.ts';
import { clusterPersonPoints } from '../../src/persons/clustering.ts';
import { externalURL } from '../../src/sources/url-policy.ts';

test('ten requested people are searchable with reviewed identity, short summaries and no unlicensed media', async () => {
  const expected = [
    ['Muhammed', 'Q9458'],
    ['Isacc Newton', 'Q935'],
    ['İsa', 'Q302'],
    ['Buda', 'Q9441'],
    ['Konfüçyüs', 'Q4604'],
    ['Aziz Paul', 'Q9200'],
    ["Ts'ai Lun", 'Q229235'],
    ['Johan Gutenberg', 'Q8958'],
    ['Kolomb', 'Q7322'],
    ['Einstein', 'Q937'],
  ];
  for (const [query, qid] of expected) {
    const result = await pilotSearch.search(query);
    assert.ok(
      result.records.some((p) => p.wikidataId === qid),
      query,
    );
    const person = preparedPilot.records.find((p) => p.kind === 'person' && p.wikidataId === qid);
    assert.equal(person.synthetic, false);
    assert.equal(person.profile.image, null);
    assert.deepEqual(person.profile.wikipedia, []);
    assert.ok(person.profile.descriptions[0].value.length < 210);
    assert.equal(person.licenseId, 'CC0-1.0');
  }
  assert.equal(pilotManifest.personSummary.personCount, 11);
  assert.equal((await pilotPersons.search('Buda')).records[0].temporal.start.kind, 'unknown');
});
test('conflicting chronology remains unknown/ranged and Newton uses the reviewed Gregorian year', async () => {
  const get = (id) => preparedPilot.records.find((r) => r.id === `atlas:person-${id}`);
  assert.equal(get('newton').profile.birth.start.date.year, 1643);
  assert.equal(get('gutenberg').profile.death.start.date.day, null);
  assert.equal(get('jesus').profile.birth.uncertain, true);
  assert.equal(get('jesus').profile.birth.start.date.year, -7);
  assert.equal(get('jesus').profile.birth.end.date.year, -2);
  for (const y of [-600, -500, 1, 2000])
    assert.ok(!(await pilotPersons.PERSON_ALIVE_AT_YEAR(y)).some((p) => p.id === get('buddha').id));
});
test('lifetimes never manufacture markers; reviewed residence is opt-in and restricted to 622–632', async () => {
  const view = { polity: false, culture: false, person: true, labels: false };
  for (const year of [570, 621, 633, 1727, 1880, 1955, 2000]) {
    assert.deepEqual(
      (await historicalFeatures({ ...view, year, includeApproximatePersons: true }, 4)).features,
      [],
    );
  }
  for (const year of [622, 630, 632]) {
    assert.deepEqual((await historicalFeatures({ ...view, year }, 4)).features, []);
    const result = await historicalFeatures({ ...view, year, includeApproximatePersons: true }, 4);
    assert.deepEqual(
      result.features.map((f) => f.id),
      ['atlas:muhammad-medina-residence'],
    );
    assert.equal(result.features[0].properties.lineStyle, 'person-approximate');
    assert.deepEqual(result.features[0].geometry.coordinates, [39.61, 24.47]);
  }
});
test('birth/death snapshots stay in their event year, preserve west longitude and never turn into lifetime residence', async () => {
  const view = {
    polity: false,
    culture: false,
    person: true,
    includeApproximatePersons: true,
    labels: false,
  };
  for (const [year, id, relation] of [
    [1643, 'newton-birth', 'BIRTH'],
    [1879, 'einstein-birth', 'BIRTH'],
    [1468, 'gutenberg-death', 'DEATH'],
    [1506, 'columbus-death', 'DEATH'],
  ]) {
    const record = preparedPilot.records.find((r) => r.id === `atlas:${id}`);
    assert.equal(record.relationshipType, relation);
    assert.equal(record.temporal.support.kind, 'snapshot');
    assert.deepEqual(
      (await historicalFeatures({ ...view, year }, 4)).features.map((f) => f.id),
      [record.id],
    );
    for (const y of [year - 1, year + 1])
      assert.ok(
        !(await historicalFeatures({ ...view, year: y }, 4)).features.some(
          (f) => f.id === record.id,
        ),
      );
    assert.equal(
      (await historicalFeatures({ ...view, year, includeApproximatePersons: false }, 4)).features
        .length,
      0,
    );
  }
  assert.ok(
    preparedPilot.records.find((r) => r.id === 'atlas:newton-birth').geometry.coordinates[0] < 0,
  );
  assert.ok(
    preparedPilot.records.find((r) => r.id === 'atlas:columbus-death').geometry.coordinates[0] < 0,
  );
});

test('campaigns stay in the war layer and broad wars/location-less battles never become map points', async () => {
  assert.equal(eventLayer('CAMPAIGN'), 'battle');
  for (const [year, id] of [
    [1071, 'manzikert-1071'],
    [1453, 'constantinople-1453'],
    [1526, 'mohacs-1526'],
    [1915, 'gallipoli-1915'],
    [1916, 'gallipoli-1915'],
  ]) {
    const view = { year, polity: false, culture: false, battle: true, event: false };
    assert.deepEqual(
      (await historicalFeatures(view, 4)).features.map((f) => f.id),
      [`atlas:${id}`],
    );
    assert.equal(
      (await historicalFeatures({ ...view, battle: false, event: true }, 4)).features.length,
      0,
    );
  }
  for (const [year, id] of [
    [1921, 'sakarya-1921'],
    [1914, 'world-war-i'],
    [1940, 'world-war-ii'],
  ]) {
    assert.ok(
      (await pilotTimeline.getEventsAtYear(year)).some((h) => h.record.id === `atlas:${id}`),
    );
    assert.equal(
      (await historicalFeatures({ year, polity: false, culture: false, battle: true }, 4)).features
        .length,
      0,
    );
  }
  assert.equal(
    (await historicalFeatures({ year: 1454, polity: false, culture: false, battle: true }, 4))
      .features.length,
    0,
  );
});
test('modern city references have no historical validity and exact source revisions; bridge accepts reviewed IDs only', () => {
  assert.deepEqual(INITIAL_CAMERA, {
    center: { lng: 35, lat: 39 },
    zoom: 1.4,
    bearing: 0,
    pitch: 0,
  });
  assert.equal(MODERN_CITY_MIN_ZOOM, 4);
  assert.equal(modernCities.length, 6);
  assert.ok(preparedPilot.records.every((r) => !r.id.startsWith('modern-city:')));
  const message = (payload) =>
    encode({
      version: 1,
      type: 'city.selected',
      requestId: 'event-1',
      sessionId: 'test-city',
      payload,
    });
  for (const c of modernCities) {
    assert.equal(getModernCity(c.id), c);
    assert.equal(c.licenseId, 'CC0-1.0');
    assert.equal(new URL(c.sourceUrl).searchParams.get('oldid'), c.revision);
    assert.ok(externalURL(c.sourceUrl, 'source'));
    assert.ok(parseMessage(message({ cityId: c.id }), 'event', 'test-city'));
    assert.ok(!('temporal' in c));
  }
  for (const payload of [
    { cityId: 'modern-city:unknown' },
    { cityId: 'https://evil.example' },
    { cityId: 'modern-city:ankara', year: 1453 },
  ])
    assert.equal(parseMessage(message(payload), 'event', 'test-city'), null);
  const legacy = { ...defaultPreferences };
  delete legacy.modernCities;
  assert.doesNotThrow(() => parsePreferences(JSON.stringify(legacy)));
  assert.equal(
    parsePreferences(JSON.stringify({ ...legacy, modernCities: false })).modernCities,
    false,
  );
  assert.throws(() => parsePreferences(JSON.stringify({ ...legacy, modernCities: 'yes' })));
});
test('nearby markers across a grid seam share one count without losing IDs or inventing an anchor', () => {
  const points = [
    { id: 'test:person', x: 55, y: 55 },
    { id: 'test:battle', x: 57, y: 57 },
    { id: 'test:far', x: 200, y: 200 },
  ];
  const groups = clusterPersonPoints(points, 360, 400, 4);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.flatMap((g) => g.ids).sort(), points.map((p) => p.id).sort());
  assert.ok(groups.some((g) => g.ids.includes('test:person') && g.ids.includes('test:battle')));
  assert.ok(groups.every((g) => points.includes(g.anchor)));
  assert.deepEqual(groups, clusterPersonPoints([...points].reverse(), 360, 400, 4));
});

test('new content cannot bypass attribution, rights or pinned input gates', async (t) => {
  assert.equal(preparedPilot.inputs.length, 35);
  assert.ok(new TextEncoder().encode(JSON.stringify(preparedPilot)).length < 512 * 1024);
  const oversized = parse(catalogSchema, {
    ...preparedPilot,
    inputs: Array.from({ length: 65 }, () => preparedPilot.inputs[0]),
  });
  assert.equal(oversized.ok, false);
  assert.ok(oversized.issues.some((i) => i.path === '$.inputs' && i.code === 'SCHEMA_ARRAY'));
  for (const patch of [{ attribution: '' }, { licenseId: 'UNREVIEWED' }, { synthetic: true }]) {
    const catalog = structuredClone(preparedPilot);
    Object.assign(
      catalog.records.find((r) => r.id === 'atlas:person-newton'),
      patch,
    );
    assert.equal(validateCatalog(catalog).ok, false);
  }
  const dir = await mkdtemp(join(tmpdir(), 'atlas-discovery-negative-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const raw = JSON.parse(
    await readFile(new URL('../../data/pilot/raw/discovery-facts.json', import.meta.url), 'utf8'),
  );
  raw.people[0].birth = [1, 1];
  await writeFile(join(dir, 'discovery-facts.json'), JSON.stringify(raw));
  await assert.rejects(
    appendDiscoveryPilot(
      { sources: [], records: [], inputs: [], transformations: [] },
      pathToFileURL(dir + '/'),
    ),
    /DISCOVERY_UNREVIEWED_INPUT/,
  );
});
