import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rename, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  defaultFilters,
  defaultPreferences,
  parsePreferences,
  isHistoricalFilters,
  PREFERENCES_KEY,
} from '../../src/preferences/model.ts';
import { createPreferenceStore } from '../../src/preferences/store.ts';
import { createWebPreferenceStorage } from '../../src/preferences/storage.web.ts';
import { createFileBookmarkStorage } from '../../src/discovery/file-storage.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import {
  createHistoricalFeatureLoader,
  pilotTimeline,
  historicalFeatures,
} from '../../src/data/pilot.ts';
import { createPoliticalRepository } from '../../src/politics/repository.ts';
import { timelineFrameLoader } from '../../src/timeline/frame.ts';
import { createTimelineStore } from '../../src/timeline/store.ts';
import { physicalStyle, assertHistoricalMapStyle } from '../../src/map/globe/style.ts';
import { encode, parseMessage } from '../../src/map-contract/protocol.ts';
import { fixtureCatalog, simulateReviewed } from '../fixtures/historical.mjs';
import { culturalFixture } from '../fixtures/cultures.mjs';
function fixture(catalog = simulateReviewed(fixtureCatalog())) {
  for (const r of [...catalog.sources, ...catalog.records]) {
    r.temporal.uncertain = false;
    r.temporal.support = { kind: 'continuous', note: 'SYNTHETIC TEST ONLY' };
    r.confidence.level = 'high';
  }
  const entity = catalog.records.find((r) => r.id === 'test:entity-POLITY');
  entity.politicalProfile = {
    classifications: ['KINGDOM', 'EMPIRE'].map((value) => ({
      id: `test:class-${value}`,
      value,
      temporal: structuredClone(entity.temporal),
      evidenceIndices: [0],
    })),
    names: [],
    descriptions: [],
    capitals: [],
  };
  const provider = createHistoricalDataProvider(catalog),
    engine = createTimelineEngine(provider);
  return {
    catalog,
    engine,
    load: createHistoricalFeatureLoader(engine, createPoliticalRepository(provider)),
  };
}
const filters = (patch = {}) => ({ ...defaultFilters, ...patch });
const view = {
  year: 1,
  polity: true,
  culture: true,
  person: true,
  battle: true,
  event: true,
  labels: true,
};
const tick = () => new Promise((resolve) => setImmediate(resolve));
const ids = (report) => report.records.map((h) => h.record.id);

test('all six geography layers are independently removable without changing another layer or year', async () => {
  const { engine } = fixture();
  const layers = ['polity', 'culture', 'person', 'battle', 'event', 'place'];
  const all = await engine.getDataCoverage(1, { layers });
  for (const layer of layers) {
    const only = await engine.getDataCoverage(1, { layers: [layer] });
    const without = await engine.getDataCoverage(1, { layers: layers.filter((l) => l !== layer) });
    assert.deepEqual(new Set([...ids(only), ...ids(without)]), new Set(ids(all)));
    assert.ok(ids(only).every((id) => !ids(without).includes(id)));
    assert.equal(without.selectedYear, 1);
  }
  assert.equal((await engine.getDataCoverage(1, { layers: [] })).records.length, 0);
  assert.equal((await engine.getDataCoverage(3)).records.length, 0);
  assert.deepEqual(ids(await engine.getDataCoverage(1)), ids(all));
});
test('one filter predicate drives coverage, renderer features, snapshot context and event lists', async () => {
  const { engine, load } = fixture();
  for (const patch of [
    { exactOnly: true },
    { confidence: 'medium' },
    { eventType: 'WAR' },
    { politicalType: 'EMPIRE' },
    { personRelationship: 'RESIDENCE' },
  ]) {
    const selected = filters(patch),
      coverage = await engine.getDataCoverage(1, { filters: selected });
    const render = await load({ ...view, filters: selected }, 3);
    assert.deepEqual(new Set(render.features.map((f) => f.id)), new Set(ids(coverage)));
    const frame = await timelineFrameLoader(engine)(1, {
      layers: ['event', 'battle'],
      filters: selected,
      preview: false,
      signal: new AbortController().signal,
    });
    for (const h of frame.events)
      assert.equal(await engine.matchesFilters(h.record, 1, selected), true);
  }
  assert.ok(
    !(await load({ ...view, filters: filters({ exactOnly: true }) }, 3)).features.some((f) =>
      ['territory', 'cultural-region'].includes(f.properties.kind),
    ),
  );
  // A dated high-confidence person can remain even when eventType=WAR; filters are scoped by kind.
  assert.ok(
    (await load({ ...view, filters: filters({ eventType: 'WAR' }) }, 3)).features.some(
      (f) => f.properties.kind === 'person-location',
    ),
  );
});
test('multi-class polity matches both kingdom and empire without duplicated geometry', async () => {
  const { engine } = fixture();
  for (const politicalType of ['KINGDOM', 'EMPIRE', 'POLITY']) {
    const report = await engine.getDataCoverage(1, {
      layers: ['polity'],
      filters: filters({ politicalType }),
    });
    assert.deepEqual(ids(report), ['test:territory']);
  }
});
test('approximate person opt-in remains separate, and a relationship filter never promotes biography to dated presence', async () => {
  assert.equal(
    (await pilotTimeline.getDataCoverage(1880, { layers: ['person'] })).records.length,
    0,
  );
  const opted = await pilotTimeline.getDataCoverage(1880, {
    layers: ['person'],
    includeApproximatePersons: true,
    filters: filters({ personRelationship: 'RESIDENCE' }),
  });
  assert.equal(opted.records.length, 0);
  assert.equal(opted.mode, 'no supported historical geography');
  for (const selected of [
    filters({ exactOnly: true }),
    filters({ confidence: 'high' }),
    filters({ personRelationship: 'BIRTH' }),
  ])
    assert.equal(
      (
        await pilotTimeline.getDataCoverage(1880, {
          layers: ['person'],
          includeApproximatePersons: true,
          filters: selected,
        })
      ).records.length,
      0,
    );
  assert.equal(
    (
      await pilotTimeline.getDataCoverage(1860, {
        layers: ['person'],
        includeApproximatePersons: true,
      })
    ).records.length,
    0,
  );
});
test('real pilot has no annually supported historical place labels; modern building coordinate is never reused as one', async () => {
  for (const year of [-2000, 1066, 1867, 1879, 1880, 2026]) {
    assert.equal(
      (
        await historicalFeatures(
          {
            year,
            polity: false,
            culture: false,
            person: false,
            battle: false,
            event: false,
            labels: true,
          },
          3,
        )
      ).features.length,
      0,
    );
  }
  const { load } = fixture();
  assert.deepEqual(
    (
      await load(
        { ...view, polity: false, culture: false, person: false, battle: false, event: false },
        3,
      )
    ).features.map((f) => f.properties.kind),
    ['place'],
  );
});
test('filters never extrapolate snapshots into unsupported years or silently select an unmatching preview', async () => {
  const hidden = await pilotTimeline.getDataCoverage(1866, {
    layers: ['polity'],
    filters: filters({ confidence: 'high' }),
    preview: 'nearest-snapshot',
  });
  assert.equal(hidden.isPreview, false);
  assert.equal(hidden.sourceYear, null);
  const selected = filters({ confidence: 'medium' });
  assert.equal(
    (await pilotTimeline.getAvailableSnapshots({ layers: ['polity'], filters: selected })).length,
    1,
  );
  assert.equal(
    (await pilotTimeline.getDataCoverage(1866, { layers: ['polity'], filters: selected })).records
      .length,
    0,
  );
  const preview = await pilotTimeline.getDataCoverage(1866, {
    layers: ['polity'],
    filters: selected,
    preview: 'nearest-snapshot',
  });
  assert.equal(preview.selectedYear, 1866);
  assert.equal(preview.sourceYear, 1867);
  assert.equal(preview.isPreview, true);
});
test('overlapping cultures retain every record under shared filters and reduce fill opacity', async () => {
  const { engine, load } = fixture(culturalFixture(40));
  const collection = await load({ ...view, filters: filters({ confidence: 'high' }) }, 3);
  const regions = collection.features.filter((f) => f.properties.kind === 'cultural-region');
  assert.equal(regions.length, 40);
  assert.ok(
    regions.every((f) => f.properties.fillOpacity <= 0.02 && f.properties.lineStyle === 'culture'),
  );
  assert.equal(
    (
      await engine.getDataCoverage(1, {
        layers: ['culture'],
        filters: filters({ exactOnly: true }),
      })
    ).records.length,
    0,
  );
});
test('preference schema rejects extra fields, unknown versions, malformed switches/filters and oversized UTF8', () => {
  assert.deepEqual(parsePreferences(JSON.stringify(defaultPreferences)), defaultPreferences);
  for (const patch of [
    { version: 2 },
    { language: 'en' },
    { camera: {} },
    { layers: { ...defaultPreferences.layers, person: 1 } },
    { filters: { ...defaultFilters, eventType: 'UNKNOWN' } },
  ])
    assert.throws(() => parsePreferences(JSON.stringify({ ...defaultPreferences, ...patch })));
  assert.throws(() => parsePreferences(' '.repeat(4097)));
  assert.throws(() => parsePreferences('é'.repeat(2100)));
  assert.equal(isHistoricalFilters({ ...defaultFilters, allowUnverified: true }), false);
});
test('preferences persist through web storage re-creation, with a distinct key from bookmarks and no camera/year state', async () => {
  const saved = new Map([['tarihatlasi.bookmarks.v1', 'KEEP BOOKMARKS']]);
  const storage = createWebPreferenceStorage(() => ({
    getItem: (k) => saved.get(k) ?? null,
    setItem: (k, v) => saved.set(k, v),
  }));
  const a = createPreferenceStore(storage);
  await a.load();
  await a.update((v) => ({
    ...v,
    layers: { ...v.layers, culture: false, labels: false },
    filters: filters({ eventType: 'TREATY' }),
    motion: 'reduce',
  }));
  const b = createPreferenceStore(storage);
  await b.load();
  assert.equal(b.getSnapshot().value.layers.culture, false);
  assert.equal(b.getSnapshot().value.filters.eventType, 'TREATY');
  assert.equal(b.getSnapshot().value.motion, 'reduce');
  assert.equal(b.getSnapshot().status, 'ready');
  assert.ok(saved.has(PREFERENCES_KEY));
  assert.equal(saved.get('tarihatlasi.bookmarks.v1'), 'KEEP BOOKMARKS');
  assert.equal(Object.hasOwn(b.getSnapshot().value, 'year'), false);
  assert.equal(Object.hasOwn(b.getSnapshot().value, 'camera'), false);
  assert.throws(() => {
    b.getSnapshot().value.layers.person = false;
  });
});
test('Android file adapter persists preferences on real host disk, with a separate fixed file and size gate', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-preferences-'));
  const io = {
    documentDirectory: `${dir}/`,
    async getInfoAsync(path) {
      try {
        const info = await stat(path);
        return { exists: true, size: info.size, isDirectory: info.isDirectory() };
      } catch (e) {
        if (e.code === 'ENOENT') return { exists: false };
        throw e;
      }
    },
    readAsStringAsync: (p) => readFile(p, 'utf8'),
    writeAsStringAsync: (p, v) => writeFile(p, v),
    moveAsync: ({ from, to }) => rename(from, to),
  };
  try {
    await writeFile(join(dir, 'atlas-bookmarks-v1.json'), 'KEEP BOOKMARKS');
    const make = () =>
      createPreferenceStore(createFileBookmarkStorage(io, 'atlas-preferences-v1.json'));
    const a = make();
    await a.load();
    await a.update((v) => ({ ...v, sparseLabels: true }));
    const b = make();
    await b.load();
    assert.equal(b.getSnapshot().value.sparseLabels, true);
    assert.equal(await readFile(join(dir, 'atlas-bookmarks-v1.json'), 'utf8'), 'KEEP BOOKMARKS');
    await writeFile(join(dir, 'atlas-preferences-v1.json'), ' '.repeat(4097));
    const c = make();
    await c.load();
    assert.equal(c.getSnapshot().status, 'read-error');
    await assert.rejects(createFileBookmarkStorage(io, '../../bad').read(), /LOCAL_FILE_NAME/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('corrupt storage is preserved until explicit reset, read errors can retry and writes do not happen during hydration', async () => {
  let raw = '{"version":99}',
    writes = 0;
  const store = createPreferenceStore({
    async read() {
      return raw;
    },
    async write(v) {
      writes++;
      raw = v;
    },
  });
  const loading = store.load();
  await store.update((v) => ({ ...v, motion: 'reduce' }));
  await loading;
  assert.equal(store.getSnapshot().status, 'read-error');
  assert.equal(writes, 0);
  await store.update((v) => ({ ...v, motion: 'reduce' }));
  assert.equal(writes, 0);
  raw = JSON.stringify({ ...defaultPreferences, motion: 'reduce' });
  await store.load();
  assert.equal(store.getSnapshot().value.motion, 'reduce');
  await store.reset();
  assert.equal(store.getSnapshot().value.motion, 'system');
  assert.equal(writes, 1);
});
test('queued preference writes retain newest selection and expose failures, with working retry', async () => {
  let raw = null,
    fail = true;
  const storage = {
    async read() {
      return raw;
    },
    async write(v) {
      if (fail) throw new Error('QUOTA');
      raw = v;
    },
  };
  const store = createPreferenceStore(storage);
  await store.load();
  await store.update((v) => ({ ...v, motion: 'reduce' }));
  assert.equal(store.getSnapshot().writeError, true);
  assert.equal(store.getSnapshot().value.motion, 'reduce');
  assert.equal(raw, null);
  fail = false;
  await Promise.all([
    store.update((v) => ({ ...v, layers: { ...v.layers, war: false } })),
    store.update((v) => ({ ...v, sparseLabels: true })),
  ]);
  assert.equal(parsePreferences(raw).layers.war, false);
  assert.equal(parsePreferences(raw).sparseLabels, true);
  assert.equal(parsePreferences(raw).motion, 'reduce');
  assert.equal(store.getSnapshot().writeError, false);
  await store.retryWrite();
});
test('bridge validates bounded filters and labels; unknown nested filter commands fail closed', () => {
  const message = {
    version: 1,
    type: 'catalog.view',
    sessionId: 'preferences-test',
    requestId: 'command-1',
    payload: {
      year: -1,
      polity: false,
      culture: true,
      person: true,
      battle: false,
      event: true,
      labels: false,
      sparseLabels: true,
      filters: filters({ exactOnly: true }),
      focusPilot: false,
    },
  };
  assert.ok(parseMessage(encode(message), 'command', message.sessionId));
  for (const bad of [
    { filters: { ...defaultFilters, confidence: 'certain' } },
    { filters: { ...defaultFilters, sourceURL: 'https://example.invalid' } },
    { filters: { ...defaultFilters, eventType: 'a'.repeat(5000) } },
    { labels: 'true' },
    { sparseLabels: 1 },
  ])
    assert.equal(
      parseMessage(
        encode({ ...message, payload: { ...message.payload, ...bad } }),
        'command',
        message.sessionId,
      ),
      null,
    );
});
test('physical style guard rejects modern label/source/asset injection while allowing sourced historical styles', () => {
  const land = { type: 'FeatureCollection', features: [] },
    good = physicalStyle(land);
  assert.doesNotThrow(() => assertHistoricalMapStyle(good));
  const attacks = [
    (s) =>
      s.layers.push({
        id: 'country-label',
        type: 'symbol',
        source: 'land',
        layout: { 'text-field': '{name}' },
      }),
    (s) => s.layers.push({ id: 'modern-country-borders', type: 'line', source: 'land' }),
    (s) => {
      s.sources.modern = { type: 'vector', url: 'https://example.invalid' };
    },
    (s) => {
      s.sources.land.data = 'https://example.invalid/land.json';
    },
    (s) => {
      s.glyphs = 'https://example.invalid/{fontstack}/{range}.pbf';
    },
    (s) => {
      s.sprite = 'https://example.invalid/sprite';
    },
    (s) => {
      s.sources.land.data.features.push({
        type: 'Feature',
        properties: { name: 'MODERN COUNTRY' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      });
    },
  ];
  for (const mutate of attacks) {
    const bad = structuredClone(good);
    mutate(bad);
    assert.throws(() => assertHistoricalMapStyle(bad));
  }
});
test('changing filters invalidates stale query/ACK, preserves requested year and cancels playback', async () => {
  const { engine } = fixture(),
    realLoad = timelineFrameLoader(engine);
  const pending = [];
  const store = createTimelineStore(1, 2026, async (year, options) => {
    const frame = await realLoad(year, options);
    await new Promise((resolve) => pending.push(resolve));
    return frame;
  });
  store.start();
  await tick();
  store.play();
  await tick();
  const stale = store.getSnapshot().revision;
  store.configure({
    layers: ['event', 'battle'],
    filters: filters({ eventType: 'WAR' }),
    approximate: false,
  });
  await tick();
  assert.equal(store.getSnapshot().requestedYear, 1);
  assert.equal(store.getSnapshot().playing, false);
  for (const resolve of pending) resolve();
  await tick();
  assert.ok(store.getSnapshot().revision > stale);
  assert.equal(store.getSnapshot().frame.events.length, 0);
  store.acknowledge({
    revision: stale,
    year: 1,
    sourceYear: 1,
    coverageStatus: 'exact verified',
    catalogVersion: engine.catalogVersion,
  });
  assert.equal(store.getSnapshot().renderedSourceYear, null);
  store.dispose();
});

test('snapshot type filter evaluates each disjoint source year rather than the first snapshot year', async () => {
  const { catalog } = fixture();
  const territory = catalog.records.find((r) => r.kind === 'territory');
  const date = (year) => ({ year, month: null, day: null });
  territory.temporal.support.kind = 'snapshot';
  territory.temporal.periods = [-2, 2].map((year) => ({ start: date(year), end: date(year) }));
  const entity = catalog.records.find((r) => r.id === 'test:entity-POLITY');
  for (const claim of entity.politicalProfile.classifications) {
    claim.temporal.start.date = date(claim.value === 'KINGDOM' ? -2 : 2);
    claim.temporal.end.date = structuredClone(claim.temporal.start.date);
  }
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  const snapshots = await engine.getAvailableSnapshots({
    layers: ['polity'],
    filters: filters({ politicalType: 'EMPIRE' }),
  });
  assert.deepEqual(
    snapshots.map((s) => s.year),
    [2],
  );
  const preview = await engine.getDataCoverage(1, {
    layers: ['polity'],
    filters: filters({ politicalType: 'EMPIRE' }),
    preview: 'nearest-snapshot',
  });
  assert.equal(preview.sourceYear, 2);
});
