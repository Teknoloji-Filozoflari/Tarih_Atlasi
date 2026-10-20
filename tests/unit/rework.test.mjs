// All added geometry below is SYNTHETIC, in memory only, never product data.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fixtureCatalog, simulateReviewed } from '../fixtures/historical.mjs';
import { validateCatalog } from '../../src/domain/validate.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine, recordCoverageMode } from '../../src/timeline/engine.ts';
import { defaultFilters } from '../../src/preferences/model.ts';
import { personLocationLevel } from '../../src/persons/model.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { withheldGeography, publicationPolicyVersion } from '../../src/data/publication-policy.ts';
import { prepareBundle, sha256, canonicalJSON } from '../../scripts/etl/pipeline.mjs';
import { buildChunks } from '../../scripts/chunks.mjs';
import { createBookmarkRepository } from '../../src/discovery/bookmarks.ts';
function fixture() {
  const c = simulateReviewed(fixtureCatalog());
  for (const r of [...c.sources, ...c.records])
    r.temporal = {
      ...r.temporal,
      uncertain: false,
      support: { kind: 'continuous', note: 'SYNTHETIC TEST ONLY' },
    };
  return c;
}
test('AUD-01: exact-only coverage excludes representative person coordinates even with high confidence', async () => {
  const c = fixture(),
    r = c.records.find((r) => r.id === 'test:presence');
  r.confidence.level = 'high';
  r.spatialContext = {
    scale: 'city',
    coordinateRole: 'representative-place',
    description: 'SYNTHETIC city anchor',
  };
  assert.equal(validateCatalog(c).ok, true);
  assert.equal(personLocationLevel(r), 'approximate');
  assert.equal(recordCoverageMode(r), 'documented approximate');
  const e = createTimelineEngine(createHistoricalDataProvider(c));
  const report = await e.getDataCoverage(1, {
    layers: ['person'],
    includeApproximatePersons: true,
    filters: { ...defaultFilters, exactOnly: true },
  });
  assert.deepEqual(report.records, []);
});
test('AUD-02: generic production ETL removes withheld geometry and preserves archival bytes', async () => {
  const rawURL = new URL('../../data/pilot/raw/wikidata-person-facts.json', import.meta.url),
    before = await readFile(rawURL);
  const bundle = await prepareBundle(preparedPilot, 'data/pilot/raw'),
    out = JSON.parse(bundle.catalogText),
    manifest = JSON.parse(bundle.manifestText);
  assert.equal(manifest.publicationPolicyVersion, publicationPolicyVersion);
  assert.deepEqual(manifest.withheldGeography, [...withheldGeography]);
  for (const id of withheldGeography) {
    const r = out.records.find((r) => r.id === id);
    assert.equal(r.geometry, null);
    assert.match(r.geometryReason, /WITHHELD:/);
    assert.ok(r.evidence.length);
  }
  assert.equal(sha256(await readFile(rawURL)), sha256(before));
  assert.equal(JSON.parse(before).representation, 'editorial-fact-extraction-not-http-response');
});
test('AUD-03: Wikidata source identity and revision cannot be bypassed with a live Q page', () => {
  const c = structuredClone(preparedPilot),
    s = c.sources.find((s) => s.id === 'source:event-q83224');
  s.wikidataId = 'Q83224';
  s.url = 'https://www.wikidata.org/wiki/Q1';
  assert.equal(validateCatalog(c).ok, false);
  s.url = `https://www.wikidata.org/w/index.php?title=Q83224&oldid=${s.revision}`;
  assert.equal(validateCatalog(c).ok, true);
});
test('AUD-04: generated chunks preserve transitive source and raw-input dependencies', async () => {
  const c = fixture(),
    parent = structuredClone(c.sources[0]);
  parent.id = 'test:upstream-source';
  parent.rawInputId = 'test:upstream-raw';
  parent.upstreamIds = [];
  c.sources[0].upstreamIds = [parent.id];
  c.sources.push(parent);
  c.inputs.push({ ...structuredClone(c.inputs[0]), id: parent.rawInputId, sourceId: parent.id });
  assert.equal(validateCatalog(c).ok, true);
  const { artifacts } = await buildChunks(c);
  assert.ok(Object.keys(artifacts).length);
  for (const raw of Object.values(artifacts)) {
    const chunk = JSON.parse(raw);
    assert.ok(chunk.sources.some((s) => s.id === parent.id));
    assert.ok(chunk.inputs.some((i) => i.id === parent.rawInputId));
    assert.equal(validateCatalog(chunk).ok, true);
  }
});
test('AUD-05: discontinuous periods are discoverable even when the envelope start is unsupported', async () => {
  const c = fixture(),
    r = c.records.find((r) => r.id === 'test:territory'),
    date = (year) => ({ year, month: null, day: null });
  r.temporal.periods = [
    { start: date(-1), end: date(-1) },
    { start: date(1), end: date(1) },
  ];
  const { manifest } = await buildChunks(c);
  assert.equal(manifest.entries.filter((e) => e.recordId === r.id).length, 2);
});
test('AUD-06: corrupt bookmarks are preserved until reviewed reset; concurrent changes are protected', async () => {
  let raw = '{broken',
    writes = 0;
  const repo = createBookmarkRepository(
    {
      read: async () => raw,
      write: async (v) => {
        raw = v;
        writes++;
      },
    },
    2026,
  );
  await assert.rejects(repo.list());
  assert.equal(await repo.recoveryText(), '{broken');
  assert.equal(writes, 0);
  raw = '{newer';
  await assert.rejects(repo.resetAfterReview('{broken'), /BOOKMARK_RECOVERY_CHANGED/);
  assert.equal(raw, '{newer');
  assert.equal(writes, 0);
  assert.deepEqual(await repo.resetAfterReview(await repo.recoveryText()), []);
  assert.deepEqual(await repo.list(), []);
  assert.equal(writes, 1);
  await repo.save({
    id: 'bookmark-recovered',
    kind: 'year',
    view: { year: 1066, entityId: null, camera: null },
  });
  assert.equal((await repo.list()).length, 1);
});
test('AUD-07: canonical key ordering does not change scope or invalidate generated chunks', async () => {
  const original = structuredClone(preparedPilot),
    before = await buildChunks(original),
    row = original.records.find((r) => r.id === 'atlas:alaska-treaty-segment-1867');
  row.temporal = {
    end: row.temporal.end,
    ...Object.fromEntries(Object.entries(row.temporal).filter(([k]) => k !== 'end')),
  };
  assert.deepEqual(await buildChunks(original), before);
  assert.equal(canonicalJSON(original), canonicalJSON(preparedPilot));
});

test('projection and demo bridge whitelist rejects unknown values; regional zoom 5–8 survives shared links', async () => {
  const { parseMessage, isCamera, INITIAL_CAMERA } =
    await import('../../src/map-contract/protocol.ts');
  const { shareQuery, parseShareQuery } = await import('../../src/discovery/view.ts');
  const payload = {
    year: 1867,
    polity: true,
    culture: true,
    focusPilot: false,
    projection: 'mercator',
    showDemo: false,
  };
  const parse = (p) =>
    parseMessage(
      JSON.stringify({
        version: 1,
        type: 'catalog.view',
        sessionId: 'test',
        requestId: 'command-1',
        payload: p,
      }),
      'command',
      'test',
    );
  assert.ok(parse(payload));
  assert.ok(parse({ ...payload, projection: 'globe' }));
  for (const projection of ['albers', 'Globe', null, {}, 1])
    assert.equal(parse({ ...payload, projection }), null);
  assert.equal(parse({ ...payload, showDemo: 'false' }), null);
  for (const zoom of [5, 6, 7, 8, 10, 14, 16]) {
    const camera = { ...INITIAL_CAMERA, zoom };
    assert.equal(isCamera(camera), true);
    const view = { year: 1066, entityId: null, camera };
    assert.deepEqual(parseShareQuery(shareQuery(view, 2026), 2026), view);
  }
  assert.equal(isCamera({ ...INITIAL_CAMERA, zoom: 16.01 }), false);
});

test('new shared/bookmarked projection is optional for legacy data and strictly whitelisted', async () => {
  const { parseSavedView, parseShareQuery, shareQuery } =
    await import('../../src/discovery/view.ts');
  const legacy = { year: -1, entityId: null, camera: null };
  assert.deepEqual(parseSavedView(legacy, 2026), legacy);
  for (const projection of ['mercator', 'globe']) {
    const view = { ...legacy, projection };
    assert.deepEqual(parseShareQuery(shareQuery(view, 2026), 2026), view);
    assert.deepEqual(parseSavedView(view, 2026), view);
  }
  assert.equal(parseShareQuery('year=1&projection=javascript', 2026), null);
  assert.equal(parseShareQuery('year=1&projection=globe&projection=mercator', 2026), null);
});

test('Atlas antimeridian markers use the nearest visible world copy without rewriting geography', async () => {
  const { projectAnchor } = await import('../../src/map/globe/project-anchor.ts');
  const project = (position) => position;
  const source = [-179, 20];
  const flat = {
    getProjection: () => ({ type: 'mercator' }),
    getCenter: () => ({ lng: 179 }),
    project,
  };
  assert.deepEqual(projectAnchor(flat, ...source), [181, 20]);
  assert.deepEqual(source, [-179, 20]);
  assert.deepEqual(
    projectAnchor({ ...flat, getCenter: () => ({ lng: -179 }) }, 179, 20),
    [-181, 20],
  );
  assert.deepEqual(
    projectAnchor({ ...flat, getProjection: () => ({ type: 'globe' }) }, ...source),
    source,
  );
});

test('projection preference is backward compatible, whitelisted and persisted without overwriting unreadable state', async () => {
  const { defaultPreferences, parsePreferences } = await import('../../src/preferences/model.ts');
  const { createPreferenceStore } = await import('../../src/preferences/store.ts');
  const legacy = structuredClone(defaultPreferences);
  delete legacy.projection;
  assert.equal(parsePreferences(JSON.stringify(legacy)).projection, undefined);
  let text = JSON.stringify(legacy),
    writes = 0;
  const storage = {
    read: async () => text,
    write: async (raw) => {
      text = raw;
      writes++;
    },
  };
  const first = createPreferenceStore(storage);
  await first.load();
  await first.update((value) => ({ ...value, projection: 'globe' }));
  const reopen = createPreferenceStore(storage);
  await reopen.load();
  assert.equal(reopen.getSnapshot().value.projection, 'globe');
  assert.throws(
    () => parsePreferences(JSON.stringify({ ...legacy, projection: 'unsupported' })),
    /PREFERENCES_SCHEMA/,
  );
  text = '{broken';
  const broken = createPreferenceStore(storage);
  await broken.load();
  const before = writes;
  await broken.update((v) => ({ ...v, projection: 'mercator' }));
  assert.equal(text, '{broken');
  assert.equal(writes, before);
});
test('place search preserves withdrawn geometry status and does not fabricate annual location evidence', async () => {
  const { pilotSearch } = await import('../../src/data/pilot.ts');
  const place = pilotSearch.get('atlas:maison-van-gogh');
  assert.equal(place.group, 'place');
  assert.equal(place.record.geometry, null);
  assert.deepEqual(place.bounds, []);
  assert.ok(pilotSearch.search('Maison').records.some((entry) => entry.id === place.id));
  const destination = await pilotSearch.destination(place.id, 1880, 2026);
  assert.deepEqual(destination.current.hits, []);
});
test('bookmark corruption exposes a bounded domain error and explicit recovery permits subsequent saves', async () => {
  let raw = '{broken secret-like local data';
  const repository = createBookmarkRepository(
    {
      read: async () => raw,
      write: async (text) => {
        raw = text;
      },
    },
    2026,
  );
  for (const action of [
    () => repository.list(),
    () => repository.remove('bookmark-one'),
    () =>
      repository.save({
        id: 'bookmark-one',
        kind: 'year',
        view: { year: 1, entityId: null, camera: null },
      }),
  ])
    await assert.rejects(
      action(),
      (error) => error.message === 'BOOKMARK_CORRUPT' && !error.message.includes('secret-like'),
    );
  assert.equal(raw, '{broken secret-like local data');
  await repository.resetAfterReview(await repository.recoveryText());
  await repository.save({
    id: 'bookmark-one',
    kind: 'year',
    view: { year: 1, entityId: null, camera: null },
  });
  assert.equal((await repository.list()).length, 1);
});

test('search visibility maps historical places to the labels preference without introducing an unknown key', async () => {
  const { searchVisibilityLayer } = await import('../../src/discovery/search.ts');
  const { defaultPreferences, parsePreferences } = await import('../../src/preferences/model.ts');
  for (const group of ['state', 'culture', 'person', 'war', 'event', 'place']) {
    const layer = searchVisibilityLayer(group);
    assert.ok(Object.hasOwn(defaultPreferences.layers, layer));
    assert.doesNotThrow(() =>
      parsePreferences(
        JSON.stringify({
          ...defaultPreferences,
          layers: { ...defaultPreferences.layers, [layer]: true },
        }),
      ),
    );
  }
  assert.equal(searchVisibilityLayer('place'), 'labels');
});

test('production preview CSP pins inline script hashes and refuses script attributes/eval/external defaults', async () => {
  const { exportCSP, exportResponse } = await import('../../scripts/qa/serve-export.mjs');
  const policy = exportCSP(
    '<script>console.log("SYNTHETIC TEST")</script><script src="/main.js"></script>',
  );
  assert.match(policy, /sha256-/);
  assert.match(policy, /script-src-attr 'none'/);
  assert.match(policy, /worker-src 'self' blob:/);
  assert.doesNotMatch(policy, /unsafe-eval/);
  assert.match(policy, /frame-ancestors 'none'/);
  for (const path of ['/../%2e%2e/private', '/%2fsecret', '/file\\hidden'])
    await assert.rejects(exportResponse(path), /PATH/);
});

test('globe-only product opens legacy flat views without losing date/camera or modifying saved data', async () => {
  const { PRODUCT_PROJECTION, globeView } = await import('../../src/map/product-view.ts');
  const { parseSavedView, shareQuery, parseShareQuery } =
    await import('../../src/discovery/view.ts');
  const legacy = {
    year: 1066,
    entityId: 'atlas:hastings-1066',
    camera: { center: { lng: 37, lat: 37 }, zoom: 2.5, bearing: 0, pitch: 0 },
    projection: 'mercator',
  };
  assert.equal(PRODUCT_PROJECTION, 'globe');
  assert.ok(parseSavedView(legacy, 2026));
  const opened = globeView(legacy);
  assert.deepEqual(opened, { ...legacy, projection: 'globe' });
  assert.equal(legacy.projection, 'mercator');
  assert.deepEqual(parseShareQuery(shareQuery(opened, 2026), 2026), opened);
  assert.equal(globeView({ year: -1, entityId: null, camera: null }).projection, 'globe');
});
