import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { assertWorldManifest, validateWorldPack } from '../../src/data/world/manifest.ts';
import { normalizeWorldGeometry } from '../../src/data/world/geometry.ts';
import { createWorldLoader } from '../../src/data/world/loader.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { createApplicationData } from '../../src/data/application-core.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createSearchIndex } from '../../src/discovery/search.ts';
import { createHistoricalFeatureLoader } from '../../src/data/pilot.ts';
import { worldInput, worldSource, worldEntityId } from '../../src/data/world/records.ts';
import { licensePolicy } from '../../src/domain/licensePolicy.ts';
import { createTimelineStore } from '../../src/timeline/store.ts';
import { timelineFrameLoader } from '../../src/timeline/frame.ts';
import {
  createChunkedFeatureLoader,
  worldInlineVerifier,
} from '../../src/map/globe/data-loader.ts';
const disk = async (index, pack, signal) => {
  if (signal.aborted) throw new Error('ABORT');
  return readFile(new URL(`../../assets/world/${pack.sha256}.atlas`, import.meta.url), 'utf8');
};
const provider = createHistoricalDataProvider(preparedPilot),
  base = createTimelineEngine(provider),
  world = createWorldRepository(worldManifest, disk);
const app = createApplicationData(
  {
    provider,
    timeline: base,
    search: createSearchIndex(preparedPilot, base),
    catalog: preparedPilot,
  },
  world,
);
const features = createHistoricalFeatureLoader(app.timeline, app.politics);
const signal = () => new AbortController().signal;
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('reviewed 2010 and 2024 country supplements pass the renderer chunk path without pretending to be archived packs', async () => {
  for (const [year, ids] of [
    [2010, ['world:clio-r13239', 'world:clio-r13580']],
    [2024, ['world:clio-r13613', 'world:clio-r13659', 'world:clio-r13773', 'world:clio-r13605']],
  ]) {
    const collection = await features({ year, polity: true, culture: false }, 4);
    const load = async () => ({
      ...collection,
      features: collection.features.filter((f) => ids.includes(f.id)),
    });
    assert.equal((await load()).features.length, ids.length);
    // Empty test transport: source-checked inline records have no .atlas pack to fetch.
    const transport = { ensure: async () => ({ values: [] }) };
    const guarded = createChunkedFeatureLoader(load, transport, worldInlineVerifier(world));
    const rendered = await guarded({ year, polity: true, culture: false }, 4);
    assert.deepEqual(rendered.features.map((f) => f.id).sort(), ids.sort());
    assert.ok(ids.every((id) => world.rowFor(id).pack === null));
    await assert.rejects(
      createChunkedFeatureLoader(load, transport)({ year, polity: true, culture: false }, 4),
      /CHUNK_GEOMETRY/,
    );
  }
  assert.equal(worldInlineVerifier(world)('world:unreviewed'), false);
});

test('year changes retain colors for the same supported political identity and its split parts', async () => {
  const view = (year) => ({
    year,
    polity: true,
    culture: false,
  });
  const before = await features(view(2000), 3),
    after = await features(view(2001), 3);
  const colors = new Map();
  for (const feature of before.features.filter((f) => f.properties.kind === 'territory')) {
    const { entityId, color, fillOpacity } = feature.properties;
    if (colors.has(entityId))
      assert.equal(color, colors.get(entityId), 'split parts share a color');
    colors.set(entityId, color);
    assert.ok(fillOpacity > 0, 'supported political areas carry visible opacity');
  }
  let matches = 0;
  for (const feature of after.features.filter((f) => f.properties.kind === 'territory')) {
    if (colors.has(feature.properties.entityId)) {
      assert.equal(feature.properties.color, colors.get(feature.properties.entityId));
      matches++;
    }
  }
  assert.ok(matches > 100, 'compare actual supported year frames, not an empty mock');
});

test('world rights and metadata are pinned to one reviewed archive/derivation; remote metadata cannot approve itself', () => {
  assertWorldManifest(worldManifest);
  assert.equal(licensePolicy(worldSource, worldInput).decision, 'allow');
  assert.notEqual(
    licensePolicy({ ...worldSource, revision: 'latest' }, worldInput).decision,
    'allow',
  );
  assert.notEqual(
    licensePolicy(worldSource, { ...worldInput, sha256: '0'.repeat(64) }).decision,
    'allow',
  );
  const changed = structuredClone(worldManifest);
  changed.rows[0].start--;
  assert.throws(() => assertWorldManifest(changed), /METADATA_REVIEW_PIN/);
  assert.equal(worldManifest.rows.length, 13379);
  assert.equal(worldManifest.sourceRows, 13797);
  assert.equal(worldManifest.relationRows, 385);
  assert.equal(worldManifest.invalidMetadataRows, 6);
  assert.equal(
    worldManifest.rows.some((r) => r.start === 0 || r.end === 0),
    false,
  );
});

test('large source polygons are validated with bounded sweep work without weakening small-catalog geometry limits', () => {
  // SYNTHETIC test circle: never enters a production manifest or asset.
  const ring = Array.from({ length: 2001 }, (_, i) => [
    Math.cos((i * 2 * Math.PI) / 2000),
    Math.sin((i * 2 * Math.PI) / 2000),
  ]);
  ring[2000] = [...ring[0]];
  const valid = normalizeWorldGeometry({ type: 'Polygon', coordinates: [ring] });
  assert.equal(valid.points, 2001);
  const duplicate = normalizeWorldGeometry({
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ],
    ],
  });
  assert.equal(duplicate.removedDuplicatePositions, 1);
  assert.deepEqual(duplicate.geometry.coordinates[0], [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
  ]);
  for (const coordinates of [
    [
      [
        [0, 0],
        [2, 2],
        [0, 2],
        [2, 0],
        [0, 0],
      ],
    ],
    [
      [
        [179, 0],
        [-179, 0],
        [-179, 1],
        [179, 0],
      ],
    ],
    [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 2],
      ],
    ],
  ])
    assert.throws(() => normalizeWorldGeometry({ type: 'Polygon', coordinates }));
  assert.throws(() =>
    normalizeWorldGeometry({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [Infinity, 1],
          [0, 0],
        ],
      ],
    }),
  );
});

test('isolated tangent holes are valid without changing coordinates; crossings, shared edges, nesting and contact networks still fail closed', () => {
  // SYNTHETIC geometry only: the production Greek source is checked separately.
  const shell = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];
  const hole = [
    [1, 1],
    [3, 1],
    [3, 3],
    [1, 3],
    [1, 1],
  ];
  const tangent = [
    [3, 3],
    [5, 3],
    [5, 5],
    [3, 5],
    [3, 3],
  ];
  const input = { type: 'Polygon', coordinates: [shell, hole, tangent] };
  const normalized = normalizeWorldGeometry(input);
  const positions = (g) =>
    g.coordinates
      .flat(1)
      .map((p) => p.join(','))
      .sort();
  assert.deepEqual(positions(normalized.geometry), positions(input));
  for (const other of [
    [
      [3, 1],
      [5, 1],
      [5, 3],
      [3, 3],
      [3, 1],
    ], // shared edge
    [
      [2, 2],
      [4, 2],
      [4, 4],
      [2, 4],
      [2, 2],
    ], // crossing
    [
      [1, 1],
      [2, 1.5],
      [1.5, 2],
      [1, 1],
    ], // nested hole with tangent
    [
      [11, 11],
      [12, 11],
      [12, 12],
      [11, 11],
    ], // outside shell
  ])
    assert.throws(() =>
      normalizeWorldGeometry({ type: 'Polygon', coordinates: [shell, hole, other] }),
    );
  assert.throws(
    () =>
      normalizeWorldGeometry({
        type: 'Polygon',
        coordinates: [
          shell,
          hole,
          tangent,
          [
            [5, 5],
            [7, 5],
            [7, 7],
            [5, 7],
            [5, 5],
          ],
        ],
      }),
    /HOLE_CONTACT_NETWORK/,
  );
  assert.throws(
    () =>
      normalizeWorldGeometry({
        type: 'Polygon',
        coordinates: [
          shell,
          [
            [0, 0],
            [2, 1],
            [1, 2],
            [0, 0],
          ],
        ],
      }),
    /RING_INTERSECTION/,
  );
});

test('every world source year uses only its declared interval, reports quarantine, and never extrapolates to today', async () => {
  for (const [year, total, drawn, geometries] of [
    [-2000, 4, 4, 4],
    [-500, 48, 46, 46],
    [1, 45, 45, 45],
    [1453, 135, 130, 133],
    [2000, 192, 183, 196],
    [2010, 191, 183, 196],
    [2024, 195, 189, 189], // Exact duplicate 13741 excluded; canonical 13771 retained.
    [2026, 0, 0, 0],
  ]) {
    const report = await app.timeline.getDataCoverage(year, { layers: ['polity'] });
    assert.equal(report.politicalCoverage.total, total);
    assert.equal(report.politicalCoverage.drawn, drawn);
    assert.equal(report.records.length, geometries);
    assert.equal(
      report.mode,
      geometries ? 'documented approximate' : 'no supported historical geography',
    );
    for (const h of report.records) {
      assert.equal(h.record.temporal.uncertain, true);
      assert.ok(
        h.record.temporal.start.date.year <= year && h.record.temporal.end.date.year >= year,
      );
    }
  }
  for (const year of [-2, -1, 1, 2])
    assert.equal(
      (await app.timeline.getDataCoverage(year, { layers: ['polity'] })).selectedYear,
      year,
    );
  await assert.rejects(() => app.timeline.getDataCoverage(0));
});

test('USA, Canada, Russia and China render with original large components; approximate filters and independent layers remain honest', async () => {
  const collection = await features({ year: 2000, polity: true, culture: false }, 3);
  for (const name of [
    'United States of America',
    'Canada',
    'Russian Federation',
    "People's Republic of China",
  ]) {
    const id = worldEntityId(name),
      found = collection.features.find((f) => f.properties.entityId === id);
    assert.ok(found, name);
    assert.ok(found.geometry.coordinates.flat(Infinity).length > 1000, name);
  }
  const noPolitics = await features({ year: 2000, polity: false, culture: false }, 3);
  assert.equal(noPolitics.features.length, 0);
  const filters = {
    exactOnly: true,
    confidence: 'all',
    politicalType: 'all',
    personRelationship: 'all',
    eventType: 'all',
  };
  assert.equal(
    (await features({ year: 2000, polity: true, culture: false, filters }, 3)).features.length,
    0,
  );
  const people = await app.timeline.getDataCoverage(1880, {
    layers: ['person', 'place'],
    includeApproximatePersons: true,
    preview: 'nearest-snapshot',
  });
  assert.deepEqual(
    people.records.map((h) => h.record.id),
    ['atlas:einstein-birth'],
  );
  assert.equal(
    people.sourceYear,
    1879,
    'explicit nearest preview retains the actual birth snapshot year',
  );
  assert.equal(people.isPreview, true);
  const directPeople = await app.timeline.getDataCoverage(1880, {
    layers: ['person', 'place'],
    includeApproximatePersons: true,
  });
  assert.equal(
    directPeople.records.length,
    0,
    'world source never restores withheld person geography or backdates the birth snapshot',
  );
  assert.equal(
    (await features({ year: 1066, polity: false, culture: false, battle: true, event: false }, 3))
      .features.length,
    1,
  );
  assert.equal(
    (await features({ year: 1066, polity: false, culture: false, battle: false, event: true }, 3))
      .features.length,
    0,
  );
});

test('world search, historical context, focus geometry and exact source/license cards work while bad geometry stays listable', async () => {
  const usa = app.search
    .search('Amerika Birleşik Devletleri')
    .records.find((e) => e.originalName === 'United States of America');
  assert.ok(usa);
  const destination = await app.search.destination(usa.id, 2000, 2026);
  assert.equal(destination.current.hits.length, 1);
  const record = destination.current.hits[0].record,
    detail = await app.politics.detail(record.id, 2000);
  assert.equal(detail.supported, true);
  assert.equal(detail.name, 'ABD');
  assert.ok(usa.aliases.includes('Amerika Birleşik Devletleri'));
  assert.ok(detail.alternatives.includes('Amerika Birleşik Devletleri'));
  assert.equal(detail.entity.wikidataId, null);
  assert.equal(detail.capitals.length, 0);
  assert.equal(detail.relations.length, 0);
  const source = await app.sources.detail([record.id]);
  assert.equal(source.rows[0].matched, true);
  assert.equal(source.rows[0].source.licenseId, 'CC-BY-4.0');
  assert.equal(source.rows[0].input.sha256, worldManifest.archiveSha256);
  const ottoman = app.search
    .search('Osmanlı')
    .records.find((e) => e.originalName === 'Ottoman Empire');
  assert.ok(ottoman);
  const requested = await app.search.destination(ottoman.id, 2000, 2026);
  assert.equal(requested.current.year, 2000);
  assert.equal(requested.current.hits.length, 0);
  assert.ok(requested.related.year < 2000);
  assert.ok(requested.related.hits.length);
  const tunisia = app.search
    .search('Tunus')
    .records.find((e) => e.originalName === 'Republic of Tunisia');
  assert.ok(tunisia);
  const restored = await app.search.destination(tunisia.id, 2000, 2026);
  assert.equal(restored.current.hits.length, 1);
  assert.equal(restored.current.hits[0].record.id, 'world:clio-r13374');
  const somalia = app.search.get(worldEntityId('Federal Republic of Somalia'));
  assert.ok(somalia);
  const unavailable = await app.search.destination(somalia.id, 2000, 2026);
  assert.equal(unavailable.current.hits.length, 0);
  assert.ok(somalia.geographicIds.length);
  const bad = await app.provider.getById('world:clio-r13215');
  assert.equal(bad.geometry, null);
  assert.equal(bad.geometryReason, 'SOURCE_NAME_PERIOD_REQUIRES_REVIEW');
  const badSource = await app.sources.detail([bad.id]);
  assert.equal(badSource.rows[0].matched, true);
  assert.equal(
    (await app.politics.detail('atlas:clio-r7267-area-0', 1453)).supported,
    true,
    'legacy source part ID remains valid',
  );
});

test('world cache rejects corruption and metadata changes, bounds retained bytes, and warm adjacent years reuse identical geometries', async () => {
  const pack = worldManifest.packs[0],
    raw = await disk(0, pack, signal());
  validateWorldPack(raw, pack);
  assert.throws(() => validateWorldPack(raw + ' ', pack), /INTEGRITY/);
  assert.throws(() => validateWorldPack(raw, { ...pack, sha256: '0'.repeat(64) }), /INTEGRITY/);
  let reads = 0;
  const repo = createWorldRepository(worldManifest, async (...args) => {
    reads++;
    return disk(...args);
  });
  await repo.territories(2000);
  const before = reads;
  await repo.territories(2000);
  assert.equal(reads, before);
  const rows2001 = repo
    .rowsAt(2001)
    .filter((r) => !r.legacy && r.pack !== null)
    .map((r) => r.index);
  const rows2000 = repo
    .rowsAt(2000)
    .filter((r) => !r.legacy && r.pack !== null)
    .map((r) => r.index);
  if (JSON.stringify(rows2000) === JSON.stringify(rows2001)) {
    await repo.territories(2001);
    assert.equal(reads, before);
  }
  await repo.territories(1453);
  const stats = repo.loader.stats();
  assert.ok(stats.memoryBytes <= stats.limit);
  assert.ok(stats.entries <= stats.maxEntries);
  repo.clear();
  assert.equal(repo.loader.stats().memoryBytes, 0);
});

test('world loader concurrency is globally two; cancelled/cleared late replies cannot enter cache', async () => {
  let active = 0,
    max = 0;
  const pending = [];
  const loader = createWorldLoader(worldManifest, async (index, pack, signal) => {
    active++;
    max = Math.max(max, active);
    return new Promise((resolve, reject) => {
      const cancel = () => {
        active--;
        reject(new Error('ABORT'));
      };
      signal.addEventListener('abort', cancel, { once: true });
      pending.push(async () => {
        signal.removeEventListener('abort', cancel);
        active--;
        resolve(await disk(index, pack, signal));
      });
    });
  });
  const c = new AbortController(),
    one = loader.loadMany([0, 1, 2, 3], c.signal),
    two = loader.loadMany([4, 5], c.signal);
  const outcomes = Promise.allSettled([one, two]);
  await tick();
  assert.equal(max, 2);
  assert.ok(loader.stats().queued <= 32);
  c.abort();
  await outcomes;
  assert.equal(loader.stats().active, 0);
  assert.equal(loader.stats().entries, 0);
  const late = [];
  const delayed = createWorldLoader(
    worldManifest,
    () => new Promise((resolve) => late.push(resolve)),
  );
  const waiting = delayed.loadMany([0], signal());
  const handled = assert.rejects(waiting, /ABORT|STALE/);
  await tick();
  delayed.clear();
  late[0](await disk(0, worldManifest.packs[0], signal()));
  await handled;
  assert.equal(delayed.stats().entries, 0);
});

test('fast world year changes use the existing latest-request store and preserve supported final context', async () => {
  const store = createTimelineStore(2000, 2026, timelineFrameLoader(app.timeline));
  store.start();
  store.selectYear(1453);
  store.selectYear(2024);
  for (
    let i = 0;
    i < 300 && (!store.getSnapshot().frame || store.getSnapshot().frame.requestedYear !== 2024);
    i++
  )
    await new Promise((resolve) => setTimeout(resolve, 10));
  const current = store.getSnapshot();
  assert.equal(current.requestedYear, 2024);
  assert.equal(current.frame.requestedYear, 2024);
  assert.equal(current.frame.coverage.politicalCoverage.total, 195);
  assert.equal(current.frame.coverage.records.length, 189);
  store.dispose();
});

test('packaged DOM data decompresses losslessly with a strict output cap and does not need file-origin access', async () => {
  const { decodeWorldGzip } = await import('../../src/data/world/dom-codec.ts');
  const p = worldManifest.packs[0];
  const { gzip } = await import(`../../src/data/world/generated/dom-${p.sha256}.ts`);
  const raw = await decodeWorldGzip(gzip, p.bytes, signal());
  assert.equal(raw, await disk(0, p, signal()));
  validateWorldPack(raw, p);
  await assert.rejects(() => decodeWorldGzip(gzip, p.bytes - 1, signal()), /SIZE/);
  await assert.rejects(() => decodeWorldGzip('not gzip!', p.bytes, signal()), /SIZE/);
  const c = new AbortController();
  c.abort();
  await assert.rejects(() => decodeWorldGzip(gzip, p.bytes, c.signal), /ABORT/);
});

test('native SDK tasks keep actual concurrency bounded when a running copy cannot be cancelled', async () => {
  const { createWorldTaskQueue } = await import('../../src/data/world/task-queue.ts');
  const gate = createWorldTaskQueue(),
    callbacks = [];
  let active = 0,
    max = 0;
  const execute = () =>
    new Promise((resolve) => {
      active++;
      max = Math.max(max, active);
      callbacks.push(() => {
        active--;
        resolve();
      });
    });
  const a = new AbortController(),
    b = new AbortController();
  const p = gate.run(a.signal, execute),
    q = gate.run(b.signal, execute);
  const cancelled = new AbortController();
  const waiting = gate.run(cancelled.signal, execute);
  const rejected = assert.rejects(waiting, /ABORT/);
  await tick();
  cancelled.abort();
  await rejected;
  a.abort();
  b.abort();
  assert.equal(gate.stats().active, 2, 'SDK work holds its slot until it actually settles');
  callbacks[0]();
  callbacks[1]();
  await Promise.all([p, q]);
  assert.equal(max, 2);
  assert.equal(gate.stats().active, 0);
});

test('native cache quota only prunes owned atlas cache files and protects in-use assets and user data', async () => {
  const { createWorldNativeCache } = await import('../../src/data/world/native-cache.ts');
  const files = new Map(
    Array.from({ length: 5 }, (_, i) => [
      `ExponentAsset-SYNTHETIC${i}.atlas`,
      { exists: true, size: 10 * 1024 * 1024, modificationTime: i + 1 },
    ]),
  );
  files.set('bookmarks.json', { exists: true, size: 80 * 1024 * 1024 });
  files.set('unrelated.png', { exists: true, size: 100 * 1024 * 1024 });
  const deleted = [];
  const io = {
    cacheDirectory: '/SYNTHETIC-CACHE/',
    readDirectoryAsync: async () => [...files.keys()],
    getInfoAsync: async (path) => files.get(path.split('/').at(-1)) ?? { exists: false },
    deleteAsync: async (path) => {
      deleted.push(path);
      files.delete(path.split('/').at(-1));
    },
  };
  const cache = createWorldNativeCache(io),
    release = cache.hold('/SYNTHETIC-CACHE/ExponentAsset-SYNTHETIC0.atlas');
  await cache.prune();
  release();
  assert.equal(deleted.length, 2);
  assert.ok(!deleted.some((p) => p.endsWith('SYNTHETIC0.atlas')));
  assert.ok(files.has('bookmarks.json'));
  assert.ok(files.has('unrelated.png'));
});

test('merged world identities retain each source-row locator and disjoint periods without inventing identity links', () => {
  const entity = world.entities.get(worldEntityId('Ottoman Empire'));
  const rows = world.entityRows.get(entity.id);
  assert.ok(rows.length > 100);
  for (const row of rows) assert.ok(entity.evidence[0].locator.includes(String(row.index)));
  assert.equal(entity.wikidataId, null);
  assert.ok(entity.temporal.periods.length > 0);
});

test('raw identity contradictions stay quarantined; only pinned row reviews may restore approximate geography', async () => {
  for (const index of [
    11956, 13234, 13305, 13406, 13558, 13601, 13622, 13642, 13684, 13708, 13753, 13773,
  ]) {
    const row = worldManifest.rows.find((r) => r.index === index);
    assert.ok(row);
    assert.equal(row.pack, null);
    assert.equal(row.withheld, 'SOURCE_IDENTITY_DATE_OR_POLITY_SCOPE_REVIEW');
    const entry = app.search.get(worldEntityId(row.name));
    assert.ok(entry);
    assert.equal(entry.wikidataId, null);
  }
  const coverage = await app.timeline.getDataCoverage(2000, { layers: ['polity'] });
  assert.equal(coverage.politicalCoverage.withheld, 9);
});

test('Greece returns at MS 2000 with the original source geometry, while the valid Jordan monarchy is retained', async () => {
  const row = worldManifest.rows.find((r) => r.index === 13502);
  assert.equal(row.withheld, null);
  assert.equal(row.key, '72e9bf539749c5e60edc23a5e3a93bf750385d627943b6a1b28254a6dc862577');
  const greece = await app.provider.getById('world:clio-r13502');
  assert.equal(greece.geometry.type, 'MultiPolygon');
  assert.equal(greece.geometry.coordinates.length, 21);
  const normalized = normalizeWorldGeometry(greece.geometry);
  assert.deepEqual(normalized.geometry, greece.geometry);
  assert.equal(normalized.tangentHolePairs, 2);
  const collection = await features({ year: 2000, polity: true, culture: false }, 3);
  assert.ok(collection.features.some((f) => f.id === greece.id));
  const found = app.search.search('Yunanistan').records.find((r) => r.originalName === row.name);
  assert.ok(
    (await app.search.destination(found.id, 2000, 2026)).current.hits.some(
      (h) => h.record.id === greece.id,
    ),
  );
  const jordan = await app.provider.getById('world:clio-r13443');
  assert.ok(jordan.geometry);
  assert.equal(jordan.names[0].value, 'Ürdün Krallığı');
});

test('unreviewed name/period contradictions cannot enter rendered features; reviewed Libya retains its source correction and year guard', async () => {
  const indices = [13215, 13315, 13324, 13327, 13369, 13400, 13496, 13539, 13565, 13659];
  const collection = await features({ year: 2000, polity: true, culture: false }, 3);
  for (const index of indices) {
    const row = worldManifest.rows.find((r) => r.index === index);
    assert.equal(row.withheld, 'SOURCE_NAME_PERIOD_REQUIRES_REVIEW');
    assert.equal(row.pack, null);
    const value = await app.provider.getById(`world:clio-r${index}`);
    if (index === 13369 || index === 13659) {
      // Explicit, pinned Angola review; the upstream quarantine is unchanged.
      assert.ok(value.geometry);
      assert.equal(value.wikidataId, 'Q916');
      assert.match(value.temporal.sourceDate.text, /People's Republic of Angola/);
      assert.equal(
        collection.features.some((f) => f.id === value.id),
        index === 13369,
      );
      continue;
    }
    assert.equal(value.geometry, null);
    assert.equal(value.evidence[0].sourceId, worldSource.id);
    assert.ok(app.search.get(worldEntityId(row.name)));
    assert.ok(!collection.features.some((f) => f.id === value.id));
  }
  const libya = await app.provider.getById('world:clio-r13580');
  const earlierLibya = await app.provider.getById('world:clio-r13370');
  assert.ok(earlierLibya.geometry);
  assert.equal(earlierLibya.wikidataId, 'Q1016');
  assert.equal(earlierLibya.temporal.start.date.year, 1976);
  assert.equal(earlierLibya.temporal.end.date.year, 2005);
  assert.ok(collection.features.some((f) => f.id === earlierLibya.id));
  assert.equal(
    worldManifest.rows.find((r) => r.index === 13580).withheld,
    'SOURCE_NAME_PERIOD_REQUIRES_REVIEW',
  );
  assert.ok(libya.geometry);
  assert.equal(libya.wikidataId, 'Q1016');
  assert.match(libya.temporal.sourceDate.text, /Q17435890/);
  assert.equal(libya.temporal.start.date.year, 2006);
  assert.equal(libya.temporal.end.date.year, 2013);
  assert.ok(
    !collection.features.some((f) => f.id === libya.id),
    'review never backdates Libya into 2000',
  );
  for (const index of [13686, 13730, 13739])
    assert.equal(
      worldManifest.rows.find((r) => r.index === index).withheld,
      null,
      'separate, correctly dated 2024 source rows are not removed merely because of a bad earlier name interval',
    );
});

test('nearest world snapshot requires explicit preview and retains the requested year and source year separately', async () => {
  const ordinary = await app.timeline.getDataCoverage(2026, { layers: ['polity'] });
  assert.equal(ordinary.records.length, 0);
  assert.equal(ordinary.sourceYear, null);
  const preview = await app.timeline.getDataCoverage(2026, {
    layers: ['polity'],
    preview: 'nearest-snapshot',
  });
  assert.equal(preview.selectedYear, 2026);
  assert.equal(preview.sourceYear, 2024);
  assert.equal(preview.isPreview, true);
  assert.equal(preview.records.length, 189);
  assert.equal(preview.selectedYearMode, 'no supported historical geography');
  assert.ok(
    preview.records.every(
      (h) => h.record.temporal.start.date.year === 2024 && h.record.temporal.end.date.year === 2024,
    ),
  );
});
