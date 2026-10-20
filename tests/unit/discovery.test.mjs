import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rename, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fixtureCatalog, simulateReviewed } from '../fixtures/historical.mjs';
import { culturalFixture } from '../fixtures/cultures.mjs';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createSearchIndex, normalizeSearch } from '../../src/discovery/search.ts';
import { createSearchController } from '../../src/discovery/query.ts';
import { focusPlan } from '../../src/discovery/camera.ts';
import {
  parseShareQuery,
  shareQuery,
  webShareURL,
  nativeIntentPath,
  incomingView,
  parseSavedView,
} from '../../src/discovery/view.ts';
import {
  createBookmarkRepository,
  parseBookmarks,
  BOOKMARK_KEY,
} from '../../src/discovery/bookmarks.ts';
import { createFileBookmarkStorage } from '../../src/discovery/file-storage.ts';
import { createWebBookmarkStorage } from '../../src/discovery/storage.web.ts';
import { pilotSearch } from '../../src/data/pilot.ts';
import { bookmarkStorageNotice } from '../../src/discovery/notices.ts';
import { isCamera, encode, parseMessage } from '../../src/map-contract/protocol.ts';
const camera = { center: { lng: 179, lat: 20 }, zoom: 2.25, bearing: 35, pitch: 15 };
const view = { year: -1, entityId: 'test:person', camera };
function fixture(catalog = simulateReviewed(fixtureCatalog())) {
  for (const r of [...catalog.sources, ...catalog.records]) {
    r.temporal = {
      ...r.temporal,
      uncertain: false,
      reviewStatus: 'verified',
      support: { kind: 'continuous', note: 'SYNTHETIC TEST ONLY' },
    };
    r.confidence.level = 'high';
  }
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  return { catalog, engine, index: createSearchIndex(catalog, engine) };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));
function fakeClock() {
  let next = 0;
  const tasks = new Map();
  return {
    tasks,
    set: (fn, ms) => {
      tasks.set(++next, { fn, ms });
      return next;
    },
    clear: (id) => tasks.delete(id),
    flush() {
      for (const [id, { fn }] of [...tasks]) {
        tasks.delete(id);
        fn();
      }
    },
  };
}
test('search normalization folds Turkish I/İ/ı, Ş/ş and accents without translating names', () => {
  assert.equal(normalizeSearch('İSTANBUL  ıŞIK ŞÛRÂ'), 'istanbul isik sura');
  assert.equal(normalizeSearch('İmparatorluğu'), 'imparatorlugu');
  assert.equal(normalizeSearch('Héllēnikē — Roma'), 'hellenike roma');
  assert.equal(normalizeSearch('Αθήνα'), 'αθηνα');
});
test('common index has six groups, canonical person/event IDs and distinct homonyms/aliases', () => {
  const { catalog } = fixture();
  for (const r of catalog.records.filter(
    (r) => r.kind === 'entity' && ['POLITY', 'EMPIRE'].includes(r.entityType),
  )) {
    r.names = [{ language: 'tr', value: 'SENTETİK Şûrâ' }];
    r.alternativeNames = [{ language: 'en', value: 'SYNTHETIC Old Spelling' }];
  }
  const { index } = fixture(catalog);
  assert.deepEqual(
    new Set(index.entries.map((e) => e.group)),
    new Set(['state', 'culture', 'person', 'war', 'event', 'place']),
  );
  assert.equal(
    index.entries.some((e) => e.id === 'test:entity-PERSON'),
    false,
  );
  assert.equal(
    index.entries.some((e) => e.id === 'test:entity-EVENT'),
    false,
  );
  assert.equal(index.search('sura').total, 2);
  assert.equal(index.search('old spelling').total, 2);
  assert.equal(index.get('test:presence').id, 'test:person');
});
test('search pagination and query/catalog budgets are bounded; cancellation rejects immediately', () => {
  const { index, catalog } = fixture(culturalFixture(12));
  const first = index.search('');
  assert.equal(first.records.length, 8);
  assert.equal(first.nextOffset, 8);
  assert.notDeepEqual(
    index.search('', 8).records.map((e) => e.id),
    first.records.map((e) => e.id),
  );
  assert.throws(() => index.search('x'.repeat(121)), /BUDGET/);
  assert.throws(() => index.search('', -1), /BUDGET/);
  const abort = new AbortController();
  abort.abort();
  assert.throws(() => index.search('a', 0, abort.signal), /ABORTED/);
  assert.throws(
    () => createSearchIndex({ ...catalog, records: Array(1001).fill(catalog.records[0]) }, null),
    /CATALOG_BUDGET/,
  );
});
test('real search destinations honor snapshot year and never invent a location for a treaty', async () => {
  const h = await pilotSearch.destination('atlas:hastings-1066', 2026, 2026);
  assert.equal(h.current.hits.length, 0);
  assert.equal(h.related.year, 1066);
  assert.equal((await pilotSearch.context(h.current.entry.id, 1067)).hits.length, 0);
  const t = await pilotSearch.destination('atlas:westphalia-1648', 2026, 2026);
  assert.equal(t.related.year, 1648);
  assert.equal(t.related.hits.length, 0);
  assert.equal(pilotSearch.search('Alaska').records[0].group, 'state');
});
test('person lifetime remains searchable while disputed residence has no focusable destination', async () => {
  const value = await pilotSearch.destination('atlas:van-gogh', 1885, 2026);
  assert.equal(value.current.dated, true);
  assert.equal(value.current.hits.length, 0);
  assert.equal(value.related.hits.length, 0);
  assert.equal((await pilotSearch.context('atlas:van-gogh', 1881)).hits.length, 0);
});
test('overlapping cultures remain independently searchable and selectable at same year', async () => {
  const { index } = fixture(culturalFixture(2));
  for (const id of ['test:culture-entity-0', 'test:culture-entity-1']) {
    const result = await index.destination(id, 1, 2026);
    assert.equal(result.current.hits.length, 1);
    assert.equal(result.related.year, 1);
  }
});
test('unknown dated event stays in search without a fabricated related year or geometry', async () => {
  const { catalog } = fixture();
  const e = catalog.records.find((r) => r.id === 'test:battle');
  e.temporal = {
    ...e.temporal,
    start: { kind: 'unknown', date: null },
    end: { kind: 'unknown', date: null },
    precision: 'unknown',
    uncertain: true,
  };
  delete e.temporal.support;
  const index = createSearchIndex(
    catalog,
    createTimelineEngine(createHistoricalDataProvider(catalog)),
  );
  const value = await index.destination(e.id, 1, 2026);
  assert.equal(index.get(e.id).group, 'war');
  assert.equal(value.related, null);
  assert.equal(value.current.hits.length, 0);
});
test('index owns its immutable snapshot and local/offline searches issue no fetch', async () => {
  const { catalog, index } = fixture(),
    saved = globalThis.fetch;
  const before = index.get('test:person').name;
  catalog.records.find((r) => r.id === 'test:person').names[0].value = 'Changed caller';
  assert.equal(index.get('test:person').name, before);
  assert.throws(() => {
    index.get('test:person').record.names[0].value = 'Mutable result';
  }, TypeError);
  try {
    globalThis.fetch = () => {
      throw new Error('Unexpected network');
    };
    assert.ok(index.search('sentetik').total);
    await index.destination('test:person', 1, 2026);
  } finally {
    globalThis.fetch = saved;
  }
});
test('query debounce cancels timer, aborts in-flight work, and old success cannot replace new result', async () => {
  const clock = fakeClock(),
    requests = [],
    values = [];
  const controller = createSearchController(
    (q, offset, signal) => new Promise((resolve) => requests.push({ q, offset, signal, resolve })),
    (s) => values.push(s),
    clock,
  );
  controller.run('old');
  assert.equal([...clock.tasks.values()][0].ms, 220);
  controller.run('new');
  assert.equal(clock.tasks.size, 1);
  clock.flush();
  await tick();
  assert.equal(requests[0].q, 'new');
  controller.run('last');
  assert.equal(requests[0].signal.aborted, true);
  clock.flush();
  await tick();
  requests[1].resolve('last result');
  await tick();
  requests[0].resolve('stale result');
  await tick();
  assert.equal(values.at(-1).value, 'last result');
  controller.cancel();
});
test('query errors are localized state, stale failure/unmount publish nothing', async () => {
  const clock = fakeClock(),
    requests = [],
    values = [];
  const controller = createSearchController(
    () => new Promise((resolve, reject) => requests.push({ resolve, reject })),
    (s) => values.push(s),
    clock,
  );
  controller.run('first');
  clock.flush();
  await tick();
  controller.run('second');
  clock.flush();
  await tick();
  requests[0].reject(new Error('raw endpoint'));
  await tick();
  assert.equal(values.at(-1).loading, true);
  requests[1].reject(new Error('raw endpoint'));
  await tick();
  assert.deepEqual(values.at(-1), { loading: false, value: null, failed: true });
  controller.run('third');
  clock.flush();
  await tick();
  controller.cancel();
  const count = values.length;
  requests[2].resolve('unmounted');
  await tick();
  assert.equal(values.length, count);
});
test('camera focus distinguishes point from bounding-box frame and stays within bridge limits', () => {
  const point = focusPlan({ type: 'Point', coordinates: [25, 35] });
  assert.equal(point.kind, 'point');
  assert.deepEqual(point.camera.center, { lng: 25, lat: 35 });
  assert.ok(isCamera(point.camera));
  const polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [10, 0],
        [10, 20],
        [0, 20],
        [0, 0],
      ],
    ],
  };
  const box = focusPlan(polygon);
  assert.equal(box.kind, 'bounds');
  assert.deepEqual(box.bounds, [
    [0, 0],
    [10, 20],
  ]);
  assert.ok(isCamera(box.camera));
});
test('antimeridian MultiPolygon uses short arc, disjoint pieces stay covered; polar/world extent becomes global', () => {
  const g = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [170, 10],
          [180, 10],
          [180, 20],
          [170, 20],
          [170, 10],
        ],
      ],
      [
        [
          [-180, 10],
          [-170, 10],
          [-170, 20],
          [-180, 20],
          [-180, 10],
        ],
      ],
    ],
  };
  const result = focusPlan(g);
  assert.deepEqual(result.bounds, [
    [170, 10],
    [190, 20],
  ]);
  assert.equal(Math.abs(result.camera.center.lng), 180);
  const world = focusPlan({
    type: 'Polygon',
    coordinates: [
      [
        [-180, -90],
        [180, -90],
        [180, 90],
        [-180, 90],
        [-180, -90],
      ],
    ],
  });
  assert.equal(world.kind, 'global');
  assert.equal(world.camera.zoom, 0);
  assert.equal(world.bounds, null);
  const wide = focusPlan({
    type: 'Polygon',
    coordinates: [
      [
        [-170, -20],
        [0, -20],
        [170, -20],
        [170, 20],
        [0, 20],
        [-170, 20],
        [-170, -20],
      ],
    ],
  });
  assert.equal(wide.kind, 'global');
  assert.equal(wide.camera.zoom, 0);
});
test('public URL round trip preserves no-zero year, canonical entity and camera center/zoom only', () => {
  const query = shareQuery(view, 2026),
    parsed = parseShareQuery(query, 2026);
  assert.equal(parsed.year, -1);
  assert.equal(parsed.entityId, view.entityId);
  assert.deepEqual(parsed.camera, { ...camera, bearing: 0, pitch: 0 });
  const url = new URL(webShareURL('https://example.invalid/?token=PRIVATE#secret', view, 2026));
  assert.equal(url.hash, '');
  assert.equal(url.searchParams.has('token'), false);
  assert.equal(url.searchParams.has('query'), false);
  assert.equal(nativeIntentPath(`tarihatlasi:///?${query}`, 2026), `/?${query}`);
  assert.equal(parseSavedView({ ...view, secret: 'no' }, 2026), null);
});
test('share whitelist rejects unknown/duplicate/partial/invalid values including zero and numeric tricks', () => {
  for (const query of [
    '',
    'year=0',
    'year=-2001',
    'year=2027',
    'year=1&year=2',
    'year=1&token=secret',
    'year=1&lat=3',
    'year=1&lat=91&lon=0&zoom=1',
    'year=1&lat=0&lon=181&zoom=1',
    'year=1&lat=0&lon=0&zoom=17',
    'year=1&lat=0&lon=0&zoom=NaN',
    'year=1&lat=0&lon=0&zoom=1e0',
    'year=1&entityId=javascript:alert(1)',
    'year=%',
    'year=+1',
  ])
    assert.equal(parseShareQuery(query, 2026), null, query);
  assert.throws(() => webShareURL('javascript:evil', view, 2026), /SHARE_ORIGIN/);
  assert.equal(incomingView({ year: ['1', '2'] }, 2026).status, 'invalid');
  assert.equal(incomingView({}, 2026).status, 'none');
});
test('native ingress rejects arbitrary scheme/host/path/navigation but accepts only root scheme and dev initial launch', () => {
  for (const path of [
    'https://evil.invalid/?year=1',
    'tarihatlasi://evil/?year=1',
    'tarihatlasi:///about?year=1',
    'tarihatlasi:///?year=0',
    'file:///a',
    'tarihatlasi:///?year=1#evil',
    '/../about?year=1',
    'tarihatlasi:///about/../?year=1',
    'tarihatlasi:///%2e%2e/?year=1',
  ])
    assert.equal(nativeIntentPath(path, 2026), '/?linkError=1', path);
  assert.equal(nativeIntentPath('/', 2026), '/');
  assert.equal(nativeIntentPath('exp://127.0.0.1:8081/--/', 2026, true), '/');
  assert.equal(nativeIntentPath('exp://127.0.0.1:8081/--/?year=1', 2026, true), '/?linkError=1');
  assert.equal(
    incomingView({ year: '1066', entityId: 'atlas:hastings-1066' }, 2026).view.year,
    1066,
  );
});
const bookmark = (id = 'bookmark-test') => ({
  id,
  kind: 'entity',
  view: { year: 1066, entityId: 'atlas:hastings-1066', camera: null },
});
test('bookmark schema rejects unknown versions, oversized arrays/text, duplicates and invalid camera/date', () => {
  for (const data of [
    { version: 2, entries: [] },
    { version: 1, entries: Array(51).fill(bookmark()) },
    { version: 1, entries: [bookmark(), bookmark()] },
    { version: 1, entries: [{ ...bookmark(), view: { ...view, year: 0 } }] },
    {
      version: 1,
      entries: [{ ...bookmark(), view: { ...view, camera: { ...camera, zoom: 17 } } }],
    },
  ])
    assert.throws(() => parseBookmarks(JSON.stringify(data), 2026));
  assert.throws(() => parseBookmarks(' '.repeat(65537), 2026), /BOOKMARK_SIZE/);
});
test('bookmarks persist through new repository on actual disk; missing entity ID survives safely', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-bookmarks-'));
  const io = {
    documentDirectory: dir + '/',
    getInfoAsync: async (path) => {
      try {
        const info = await stat(path);
        return { exists: true, size: info.size, isDirectory: info.isDirectory() };
      } catch (e) {
        if (e.code === 'ENOENT') return { exists: false };
        throw e;
      }
    },
    readAsStringAsync: (path) => readFile(path, 'utf8'),
    writeAsStringAsync: writeFile,
    moveAsync: ({ from, to }) => rename(from, to),
  };
  try {
    const first = createBookmarkRepository(createFileBookmarkStorage(io), 2026);
    await first.save(bookmark());
    await first.save(bookmark('bookmark-second'));
    const second = createBookmarkRepository(createFileBookmarkStorage(io), 2026);
    assert.equal((await second.list()).length, 2);
    await second.save({
      ...bookmark('bookmark-missing'),
      view: { year: -1, entityId: 'atlas:removed-record', camera: null },
    });
    const reopened = await createBookmarkRepository(createFileBookmarkStorage(io), 2026).list();
    assert.equal(reopened.at(-1).view.entityId, 'atlas:removed-record');
    assert.equal(pilotSearch.get(reopened.at(-1).view.entityId), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('serial writes retain all saves; failed write preserves committed entries and caller mutation cannot alter them', async () => {
  let text = null,
    fail = false;
  const writes = [];
  const storage = {
    read: async () => text,
    write: async (value) => {
      writes.push(value);
      if (fail) throw new Error('disk full');
      text = value;
    },
  };
  const repo = createBookmarkRepository(storage, 2026),
    item = bookmark();
  const save = repo.save(item);
  item.view.year = 1648;
  await save;
  assert.equal((await repo.list())[0].view.year, 1066);
  await Promise.all([repo.save(bookmark('bookmark-b')), repo.save(bookmark('bookmark-c'))]);
  assert.equal((await repo.list()).length, 3);
  fail = true;
  await assert.rejects(repo.remove('bookmark-b'), /disk full/);
  assert.equal((await repo.list()).length, 3);
  fail = false;
  await repo.remove('bookmark-b');
  assert.equal((await repo.list()).length, 2);
  assert.equal(parseBookmarks(text, 2026).length, 2);
});
test('corrupt/unknown-version persistent state is never silently overwritten or treated as saved', async () => {
  for (const text of ['{broken', JSON.stringify({ version: 9, entries: [] })]) {
    let writes = 0;
    const repo = createBookmarkRepository(
      {
        read: async () => text,
        write: async () => {
          writes++;
        },
      },
      2026,
    );
    await assert.rejects(repo.list());
    await assert.rejects(repo.save(bookmark()));
    assert.equal(writes, 0);
  }
});
test('web storage uses stable local key across repository restarts and reports denied/quota failure', async () => {
  const data = new Map(),
    store = {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
    };
  const storage = createWebBookmarkStorage(() => store);
  await createBookmarkRepository(storage, 2026).save(bookmark());
  assert.ok(data.has(BOOKMARK_KEY));
  assert.equal((await createBookmarkRepository(storage, 2026).list()).length, 1);
  const blocked = createWebBookmarkStorage(() => {
    throw new Error('denied');
  });
  await assert.rejects(createBookmarkRepository(blocked, 2026).list(), /denied/);
});
test('atomic catalog/camera bridge validates camera and rejects unknown nested fields/oversized payload', () => {
  const message = {
    version: 1,
    type: 'catalog.view',
    sessionId: 'test',
    requestId: 'command-1',
    payload: { year: 1066, polity: true, culture: true, focusPilot: false, camera },
  };
  assert.ok(parseMessage(encode(message), 'command', 'test'));
  for (const invalid of [
    { ...camera, zoom: 99 },
    { ...camera, execute: 'url' },
    { ...camera, center: { lng: 1800, lat: 0 } },
  ])
    assert.equal(
      parseMessage(
        encode({ ...message, payload: { ...message.payload, camera: invalid } }),
        'command',
        'test',
      ),
      null,
    );
  assert.equal(
    parseMessage(
      encode({ ...message, payload: { ...message.payload, extra: 'a'.repeat(5000) } }),
      'command',
      'test',
    ),
    null,
  );
});

test('file storage rename failure keeps saved bytes, missing directory and oversized input are reported', async () => {
  const files = new Map([['/private/atlas-bookmarks-v1.json', 'previous saved bytes']]);
  let readCount = 0;
  const io = {
    documentDirectory: '/private/',
    getInfoAsync: async () => ({ exists: true, size: 10, isDirectory: false }),
    readAsStringAsync: async (path) => {
      readCount++;
      return files.get(path);
    },
    writeAsStringAsync: async (path, text) => {
      files.set(path, text);
    },
    moveAsync: async () => {
      throw new Error('rename failed');
    },
  };
  const storage = createFileBookmarkStorage(io);
  await assert.rejects(storage.write('next'), /rename failed/);
  assert.equal(files.get('/private/atlas-bookmarks-v1.json'), 'previous saved bytes');
  const large = createFileBookmarkStorage({
    ...io,
    getInfoAsync: async () => ({ exists: true, size: 65537, isDirectory: false }),
  });
  await assert.rejects(large.read(), /BOOKMARK_SIZE/);
  assert.equal(readCount, 0);
  await assert.rejects(
    createFileBookmarkStorage({ ...io, documentDirectory: null }).read(),
    /BOOKMARK_DIRECTORY/,
  );
});

test('fifty bookmark limit and recovery from transient read failure preserve prior data', async () => {
  let text = null,
    readFails = true;
  const repo = createBookmarkRepository(
    {
      read: async () => {
        if (readFails) throw new Error('transient');
        return text;
      },
      write: async (value) => {
        text = value;
      },
    },
    2026,
  );
  await assert.rejects(repo.list(), /transient/);
  readFails = false;
  assert.equal((await repo.list()).length, 0);
  for (let i = 0; i < 50; i++) await repo.save(bookmark(`bookmark-${i}`));
  const saved = text;
  await assert.rejects(repo.save(bookmark('bookmark-over-limit')), /BOOKMARK_SCHEMA/);
  assert.equal((await repo.list()).length, 50);
  assert.equal(text, saved);
  await repo.remove('bookmark-0');
  await repo.save(bookmark('bookmark-after-delete'));
  assert.equal((await repo.list()).length, 50);
});

test('direct FileSystem dependency matches SDK57 lock and bundled MIT license', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
  const sdk = JSON.parse(await readFile('node_modules/expo/bundledNativeModules.json', 'utf8'));
  assert.equal(manifest.dependencies['expo-file-system'], '57.0.7');
  assert.equal(sdk['expo-file-system'], '~57.0.7');
  assert.equal(lock.packages[''].dependencies['expo-file-system'], '57.0.7');
  assert.equal(lock.packages['node_modules/expo-file-system'].version, '57.0.7');
  const license = await readFile('assets/licenses/Expo-FileSystem-LICENSE.txt', 'utf8');
  assert.equal(license, await readFile('node_modules/expo-file-system/LICENSE', 'utf8'));
  assert.equal(bookmarkStorageNotice, `Expo FileSystem 57.0.7 — MIT\n${license}`);
});
