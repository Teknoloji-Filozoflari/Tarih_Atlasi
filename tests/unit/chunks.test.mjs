import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, readFile, writeFile, mkdir, readdir, rename, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sha256, utf8 } from '../../src/data/chunks/hash.ts';
import { chunkManifest } from '../../src/data/chunks/generated/manifest.ts';
import { bundledChunk } from '../../src/data/chunks/generated/bundled.ts';
import { discoverChunks, assertManifest, validateChunk } from '../../src/data/chunks/manifest.ts';
import { createChunkCache, memoryStorage, cachePolicies } from '../../src/data/chunks/cache.ts';
import { createChunkLoader } from '../../src/data/chunks/loader.ts';
import { createDataRuntime } from '../../src/data/chunks/runtime-core.ts';
import { createFileChunkStorage } from '../../src/data/chunks/file-storage.ts';
import { createWebChunkStorage } from '../../src/data/chunks/storage.web.ts';
import { fetchChunk } from '../../src/data/chunks/network.ts';
import { chunkedHistoricalFeatures } from '../../src/map/globe/data-loader.ts';
import { buildChunks } from '../../scripts/chunks.mjs';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { pilotTimeline } from '../../src/data/pilot.ts';
import { createMetrics } from '../../src/performance/metrics.ts';
import { parseMessage } from '../../src/map-contract/protocol.ts';
const signal = () => new AbortController().signal;
const [entry] = discoverChunks(chunkManifest, { year: 1867, lod: 'fine' });
// A third distinct permitted body for quota/queue tests: the treaty's coarse LOD.
const [third] = discoverChunks(chunkManifest, { year: 1867, lod: 'coarse' });
const [battle] = discoverChunks(chunkManifest, { year: 1066, lod: 'fine' });
const tick = () => new Promise((r) => setImmediate(r));
const withBody = (body, e = entry) => {
  const raw = JSON.stringify(body) + '\n',
    hash = sha256(raw);
  return {
    raw,
    entry: {
      ...e,
      id: `${hash}-${e.lod}`,
      sha256: hash,
      file: `${hash}.json`,
      bytes: utf8(raw).length,
    },
  };
};

test('portable SHA256 matches standard vectors and Node for UTF8, replacement surrogate and block boundaries', () => {
  for (const text of [
    '',
    'abc',
    'İıŞş tarih MÖ 🗺️',
    '\ud800',
    'a'.repeat(55),
    'a'.repeat(56),
    'a'.repeat(64),
    'a'.repeat(1000000),
    ...Array.from({ length: 8 }, (_, i) => randomBytes(i * 67).toString('base64')),
  ])
    assert.equal(sha256(text), createHash('sha256').update(text).digest('hex'));
});
test('chunk discovery respects region, LOD, no-zero calendar, exact snapshots and absent historical place support', () => {
  assert.equal(discoverChunks(chunkManifest, { year: 1866, lod: 'fine' }).length, 0);
  assert.equal(
    discoverChunks(chunkManifest, { year: 1867, lod: 'fine', bbox: [0, 0, 10, 10] }).length,
    0,
  );
  assert.equal(
    discoverChunks(chunkManifest, { year: 1867, lod: 'fine', bbox: [-142, 64, -140, 69] }).length,
    1,
  );
  assert.equal(discoverChunks(chunkManifest, { year: 1881, lod: 'coarse' }).length, 0);
  assert.equal(
    discoverChunks(chunkManifest, { year: 1880, lod: 'coarse', recordIds: [] }).length,
    0,
  );
  assert.throws(() => discoverChunks(chunkManifest, { year: 0, lod: 'fine' }));
  assert.throws(() => assertManifest({ ...chunkManifest, version: 2 }));
  assert.throws(() =>
    assertManifest({ ...chunkManifest, entries: [{ ...entry, file: '../unsafe.json' }] }),
  );
});
test('generated chunks remain deterministic, license gated and complete in provenance dependencies', async () => {
  const a = await buildChunks(),
    b = await buildChunks();
  assert.deepEqual(a, b);
  for (const e of a.manifest.entries) {
    const raw = a.artifacts[e.file],
      c = validateChunk(raw, e);
    assert.ok(c.records.some((r) => r.id === e.recordId));
    assert.ok(c.inputs.length && c.sources.length && c.transformations.length);
    assert.equal(raw, await bundledChunk(e.sha256));
  }
  const bad = structuredClone(preparedPilot);
  bad.sources[0].sourceKey = 'historical-basemaps';
  await assert.rejects(buildChunks(bad));
});
test('hash, version, rights, review and attribution tampering never enters disk or memory cache', async () => {
  const raw = await bundledChunk(entry.sha256),
    valid = JSON.parse(raw),
    store = memoryStorage(),
    cache = createChunkCache(store);
  await assert.rejects(async () => cache.put(entry, raw + ' '));
  for (const mutate of [
    (c) => {
      c.sources[0].sourceKey = 'historical-basemaps';
    },
    (c) => {
      c.sources[0].licenseId = 'UNKNOWN';
    },
    (c) => {
      c.records[0].attribution = '';
    },
    (c) => {
      c.records[0].reviewStatus = 'unverified';
    },
    (c) => {
      c.catalogVersion = 'other-version';
    },
  ]) {
    const bad = structuredClone(valid);
    mutate(bad);
    const candidate = withBody(bad);
    assert.throws(() => cache.put(candidate.entry, candidate.raw));
  }
  assert.equal(cache.stats().memoryEntries, 0);
  assert.equal((await store.list()).length, 0);
});
test('cache enforces byte/count LRU across reopens and removes corrupt body before approved bundled recovery', async () => {
  const store = memoryStorage(),
    limits = {
      ...cachePolicies.historical,
      diskBytes: 30000,
      diskEntries: 2,
      memoryEntries: 1,
      memoryBytes: 16000,
    };
  const cache = createChunkCache(store, limits);
  for (const e of [entry, third, battle]) await cache.put(e, await bundledChunk(e.sha256));
  assert.ok((await store.list()).length <= 2);
  assert.ok((await store.list()).reduce((n, i) => n + i.bytes, 0) <= 30000);
  assert.ok(cache.stats().memoryEntries <= 1);
  assert.ok(cache.stats().evictions >= 1);
  // Keep corruption injection inside the quota: an overfull test store may
  // legitimately evict BROKEN before validation, depending on timestamp ties.
  for (const item of await store.list()) await store.remove(item.key);
  await store.write(entry.sha256, 'BROKEN');
  assert.equal((await store.list()).length, 1);
  const next = createChunkCache(store, limits),
    loader = createChunkLoader(chunkManifest, next, null, bundledChunk);
  const result = await loader.load(entry, signal());
  assert.equal(result.origin, 'bundled');
  assert.equal(next.stats().corruptions, 1);
  next.clearMemory();
  assert.equal((await loader.load(entry, signal())).origin, 'cache');
});
test('cache read/size/quota failures remain controlled and unsaved memory hits keep warning', async () => {
  const storage = {
    async list() {
      return [];
    },
    async read() {
      throw new Error('denied');
    },
    async write() {
      throw new Error('quota');
    },
    async remove() {},
  };
  const cache = createChunkCache(storage),
    loader = createChunkLoader(chunkManifest, cache, null, bundledChunk);
  const first = await loader.load(entry, signal());
  assert.equal(first.origin, 'bundled');
  assert.equal(first.cacheWarning, true);
  const second = await loader.load(entry, signal());
  assert.equal(second.origin, 'memory');
  assert.equal(second.cacheWarning, true);
  assert.ok(cache.stats().storageErrors >= 2);
});
test('loader honors concurrency and aborts queued and superseded requests without stale cache commits', async () => {
  const cache = createChunkCache(memoryStorage());
  let running = 0,
    peak = 0;
  const resolvers = [];
  const loader = createChunkLoader(
    chunkManifest,
    cache,
    async (e, s) => {
      running++;
      peak = Math.max(peak, running);
      try {
        return await new Promise((resolve, reject) => {
          resolvers.push(() => bundledChunk(e.sha256).then(resolve));
          s.addEventListener('abort', () => reject(new Error('abort')), { once: true });
        });
      } finally {
        running--;
      }
    },
    bundledChunk,
    { concurrency: 1 },
  );
  const a = new AbortController(),
    b = new AbortController();
  const pa = loader.load(entry, a.signal),
    pb = loader.load(third, b.signal);
  await tick();
  assert.equal(loader.stats().active, 1);
  assert.equal(loader.stats().queued, 1);
  b.abort();
  await assert.rejects(pb);
  a.abort();
  await assert.rejects(pa);
  await tick();
  assert.equal(peak, 1);
  assert.equal(cache.stats().memoryEntries, 0);
  assert.equal(loader.stats().active, 0);
  assert.equal(loader.stats().queued, 0);
});
test('timeout ignores late network success, retries twice, then uses only pinned fallback', async () => {
  let attempts = 0;
  const late = [];
  const loader = createChunkLoader(
    chunkManifest,
    createChunkCache(memoryStorage()),
    () => {
      attempts++;
      return new Promise((r) => late.push(r));
    },
    bundledChunk,
    { timeoutMs: 5 },
  );
  const value = await loader.load(entry, signal());
  assert.equal(attempts, 2);
  assert.equal(value.origin, 'bundled');
  for (const resolve of late) resolve('MALICIOUS LATE BODY');
  await tick();
  assert.equal((await loader.load(entry, signal())).origin, 'memory');
});
test('one failed chunk does not mark incomplete view as applied; retry can recover without another year', async () => {
  const cache = createChunkCache(memoryStorage());
  let broken = true;
  const loader = createChunkLoader(chunkManifest, cache, null, async (hash) => {
    if (broken) throw new Error('missing');
    return bundledChunk(hash);
  });
  await assert.rejects(loader.load(entry, signal()));
  assert.equal(loader.stats().active, 0);
  broken = false;
  assert.equal(
    (await loader.load(entry, signal())).catalog.catalogVersion,
    chunkManifest.catalogVersion,
  );
  await assert.rejects(loader.load({ ...entry, catalogVersion: 'stale' }, signal()), /UNTRUSTED/);
});
test('runtime loads only current supported geography, uses approved offline cache and discloses version/origin', async () => {
  const runtime = createDataRuntime(memoryStorage(), null);
  const report = await pilotTimeline.getDataCoverage(1867, { layers: ['polity'] });
  const first = await runtime.ensure(report, signal());
  assert.equal(first.status.chunks, 1);
  assert.deepEqual(first.status.origins, ['bundled']);
  runtime.clearMemory();
  assert.deepEqual((await runtime.ensure(report, signal())).status.origins, ['cache']);
  const empty = await runtime.ensure(await pilotTimeline.getDataCoverage(1866), signal());
  assert.equal(empty.status.chunks, 0);
  await assert.rejects(runtime.ensure({ ...report, catalogVersion: 'stale' }, signal()), /VERSION/);
  await assert.rejects(
    runtime.ensure({ ...report, records: [{ record: { id: 'test:missing' } }] }, signal()),
    /MISMATCH/,
  );
});
test('shared DOM pipeline replaces only supported geometry with selected LOD, retaining year, evidence semantics and filters', async () => {
  const view = { year: 1867, polity: true, culture: false, labels: false };
  const coarse = await chunkedHistoricalFeatures(view, 1),
    fine = await chunkedHistoricalFeatures(view, 3);
  assert.equal(coarse.features[0].geometry.coordinates.length, 2);
  assert.equal(fine.features[0].geometry.coordinates.length, 7);
  assert.equal(coarse.features[0].properties.sourceYear, 1867);
  assert.equal(coarse.features[0].properties.coverageMode, 'documented approximate');
  assert.equal((await chunkedHistoricalFeatures({ ...view, year: 1866 }, 3)).features.length, 0);
});
test('native cache adapter persists bounded approved chunks on real host disk and cleans oversized/corrupt/temp files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-data-cache-'));
  const io = {
    cacheDirectory: dir + '/',
    async makeDirectoryAsync(p) {
      await mkdir(p, { recursive: true });
    },
    readDirectoryAsync: readdir,
    async getInfoAsync(p) {
      try {
        const s = await stat(p);
        return {
          exists: true,
          isDirectory: s.isDirectory(),
          size: s.size,
          modificationTime: s.mtimeMs / 1000,
        };
      } catch (e) {
        if (e.code === 'ENOENT') return { exists: false };
        throw e;
      }
    },
    readAsStringAsync: (p) => readFile(p, 'utf8'),
    writeAsStringAsync: writeFile,
    moveAsync: ({ from, to }) => rename(from, to),
    deleteAsync: (p) => rm(p, { force: true, recursive: true }),
  };
  try {
    await writeFile(join(dir, 'keep-bookmarks.json'), 'KEEP');
    const make = () => createChunkCache(createFileChunkStorage(io));
    await make().put(entry, await bundledChunk(entry.sha256));
    assert.equal((await make().get(entry)).origin, 'cache');
    await writeFile(join(dir, 'atlas-historical-v1', third.file), ' '.repeat(262145));
    await writeFile(join(dir, 'atlas-historical-v1', battle.file + '.tmp'), 'INTERRUPTED');
    assert.equal((await createFileChunkStorage(io).list()).length, 1);
    await writeFile(join(dir, 'atlas-historical-v1', entry.file), 'BROKEN');
    assert.equal(await make().get(entry), null);
    assert.equal(await readFile(join(dir, 'keep-bookmarks.json'), 'utf8'), 'KEEP');
    await assert.rejects(createFileChunkStorage(io).read('../escape'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('web CacheStorage adapter is namespaced and persists across cache instances without including tiles/articles', async () => {
  const bodies = new Map();
  const fake = {
    async keys() {
      return [...bodies.keys()].map((k) => new Request(k));
    },
    async match(k) {
      return bodies.get(typeof k === 'string' ? k : k.url)?.clone();
    },
    async put(k, r) {
      bodies.set(k, r.clone());
    },
    async delete(k) {
      return bodies.delete(typeof k === 'string' ? k : k.url);
    },
  };
  const make = () =>
    createChunkCache(
      createWebChunkStorage(
        async () => fake,
        () => 'https://atlas.example',
      ),
    );
  await make().put(entry, await bundledChunk(entry.sha256));
  assert.equal((await make().get(entry)).origin, 'cache');
  assert.match([...bodies.keys()][0], /\/__atlas-cache\/historical-v1\/[a-f0-9]{64}$/);
  assert.equal(cachePolicies.externalTiles.enabled, false);
  assert.equal(cachePolicies.wikimediaDescription.enabled, false);
});
test('network fetch accepts only trusted local path, omits credentials, rejects redirects and streaming oversize', async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: { origin: 'https://atlas.example', protocol: 'https:' },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'location', original);
    else delete globalThis.location;
  });
  const raw = await bundledChunk(entry.sha256);
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, `https://atlas.example/data/chunks/${entry.file}`);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    return new Response(raw);
  });
  assert.equal(await fetchChunk(entry, signal()), raw);
  t.mock.method(globalThis, 'fetch', async () => new Response('x'.repeat(entry.bytes + 1)));
  await assert.rejects(fetchChunk(entry, signal()), /SIZE/);
  await assert.rejects(fetchChunk({ ...entry, file: '../../bad' }, signal()), /ORIGIN/);
});
test('bridge data error is schema/version/revision checked, retry contains no geometry, and diagnostics ring is bounded', () => {
  const event = {
    version: 1,
    type: 'catalog.error',
    sessionId: 'perf',
    requestId: 'event-1',
    payload: { revision: 2, catalogVersion: chunkManifest.catalogVersion, code: 'data' },
  };
  assert.ok(parseMessage(JSON.stringify(event), 'event', 'perf'));
  for (const payload of [
    { ...event.payload, code: 'raw stack' },
    { ...event.payload, catalogVersion: 'other' },
    { ...event.payload, revision: -1 },
    { ...event.payload, geometry: {} },
  ])
    assert.equal(parseMessage(JSON.stringify({ ...event, payload }), 'event', 'perf'), null);
  const metrics = createMetrics(8);
  for (let i = 0; i < 1000; i++) metrics.record('SYNTHETIC cost', i);
  assert.equal(metrics.snapshot()['SYNTHETIC cost'].count, 1000);
  assert.equal(metrics.snapshot()['SYNTHETIC cost'].samples.length, 8);
  metrics.reset();
  assert.deepEqual(metrics.snapshot(), {});
});

test('429 long Retry-After defers network immediately to bundled data; 404 is not retried', async () => {
  const { NetworkChunkError } = await import('../../src/data/chunks/network.ts');
  for (const error of [new NetworkChunkError(true, 60000), new NetworkChunkError(false)]) {
    let count = 0;
    const loader = createChunkLoader(
      chunkManifest,
      createChunkCache(memoryStorage()),
      async () => {
        count++;
        throw error;
      },
      bundledChunk,
    );
    assert.equal((await loader.load(entry, signal())).origin, 'bundled');
    assert.equal(count, 1);
  }
});

test('new trusted release purges previously cached hashes that are no longer allowed', async () => {
  const storage = memoryStorage();
  await storage.write('a'.repeat(64), 'OLD RELEASE OR UNREVIEWED CONTENT');
  const withdrawnPersonHash = '4d9ea2a77a46511e3133a62b18786530fb4ab4b7268205954c502d96ec870e09';
  await storage.write(withdrawnPersonHash, 'WITHHELD OLD PERSON CHUNK');
  const loader = createChunkLoader(chunkManifest, createChunkCache(storage), null, bundledChunk);
  await loader.load(entry, signal());
  assert.ok(
    !(await storage.list()).some((i) => ['a'.repeat(64), withdrawnPersonHash].includes(i.key)),
  );
});
