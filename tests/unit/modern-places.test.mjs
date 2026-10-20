// SYNTHETIC fixtures only, all files isolated in tmp. Never publish this gazetteer as real data.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile, mkdir, symlink } from 'node:fs/promises';
import { Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { createPlacesMiddleware } from '../../scripts/places/static.cjs';
import { exportWebPlaces } from '../../scripts/places/export-web.mjs';
import { readHTTPPlace, placeHTTPURL } from '../../src/places/http.ts';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { gunzipSync } from 'node:zlib';
import {
  parseGeoName,
  parseAdminNames,
  parseCountryNames,
  buildPlaces,
  writePlacesModules,
  createPlaceIdTracker,
  unzipGeoNames,
} from '../../scripts/places/build.mjs';
import { placeSources, acquirePlaceSource } from '../../scripts/places/download.mjs';
import { downloadTimeoutMs, parseDownloadArgs } from '../../scripts/map-sources.mjs';
import {
  isPlaceRow,
  placeZoom,
  assertPlacesManifest,
  validatePlacePack,
  isPlaceSelection,
} from '../../src/places/catalog.ts';
import { createPlacesRepository, containsLongitude } from '../../src/places/repository.ts';
import { externalURL } from '../../src/sources/url-policy.ts';
import { createWorldNativeCache } from '../../src/data/world/native-cache.ts';

const hash = (raw) => createHash('sha256').update(raw).digest('hex');
test('large GeoNames downloads allow a bounded two-hour timeout while other source limits stay at thirty minutes', async () => {
  const spec = placeSources.find((s) => s.file === 'allCountries.zip');
  assert.deepEqual(parseDownloadArgs(['--timeout-seconds', '7200'], spec), { timeoutMs: 7200000 });
  assert.throws(() => parseDownloadArgs(['--timeout-seconds', '7200']), /SOURCE_TIMEOUT_BUDGET/u);
  assert.throws(
    () => parseDownloadArgs(['--timeout-seconds', '7201'], spec),
    /SOURCE_TIMEOUT_BUDGET/u,
  );
  assert.throws(
    () => downloadTimeoutMs({ ...spec, maxTimeoutMs: Infinity }, 1000),
    /SOURCE_TIMEOUT_BUDGET/u,
  );
  const root = await mkdtemp(join(tmpdir(), 'atlas-places-timeout-'));
  try {
    // SYNTHETIC transport only; no real GeoNames records or two-hour wait.
    const result = await acquirePlaceSource(spec, root, {
      timeoutMs: 7200000,
      fetcher: async (_url, options) => {
        assert.ok(options.signal instanceof AbortSignal);
        return new Response('SYNTHETIC download timeout test');
      },
    });
    assert.equal(result.status, 'downloaded-unreviewed');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
const countries = new Map([
  ['TR', 'SYNTHETIC country TR'],
  ['US', 'SYNTHETIC country US'],
]);
const admin1 = new Map([['TR.01', 'SYNTHETIC upper division']]);
const admin2 = new Map([['TR.01.02', 'SYNTHETIC second division']]);
function line(id = 1, patch = {}) {
  const fields = [
    String(id),
    `SYNTHETIC place ${id}`,
    'synthetic',
    '',
    '1',
    '2',
    'P',
    'PPL',
    'TR',
    '',
    '01',
    '02',
    '',
    '',
    '100000',
    '',
    '',
    'Europe/Istanbul',
    '2026-10-17',
  ];
  for (const [i, value] of Object.entries(patch)) fields[Number(i)] = value;
  return fields.join('\t');
}
const inputs = placeSources.map((s) => ({
  file: s.file,
  url: s.url,
  sha256: hash('SYNTHETIC input ' + s.file),
  bytes: 100,
  downloadedAt: '2026-10-18T09:00:00Z',
}));
function fixture(groups) {
  const version = hash('SYNTHETIC version'),
    raws = [];
  const packs = groups.map((rows) => {
    const raw = JSON.stringify({
      schema: 1,
      version,
      license: 'CC-BY-4.0',
      synthetic: false,
      rows,
    });
    raws.push(raw);
    return {
      sha256: hash(raw),
      bytes: Buffer.byteLength(raw),
      count: rows.length,
      minZoom: placeZoom(rows[0]),
      bbox: [
        Math.min(...rows.map((r) => r[2])),
        Math.min(...rows.map((r) => r[3])),
        Math.max(...rows.map((r) => r[2])),
        Math.max(...rows.map((r) => r[3])),
      ],
      countries: [...new Set(rows.map((r) => r[5]))],
      codes: [...new Set(rows.map((r) => r[4]))],
    };
  });
  const counts = { settlements: 0, administrative: 0, sections: 0, invalid: 0, excluded: 0 };
  const countryCounts = new Map();
  for (const row of groups.flat()) {
    const kind = row[4].startsWith('ADM')
      ? 'administrative'
      : row[4] === 'PPLX'
        ? 'sections'
        : 'settlements';
    counts[kind]++;
    const c = countryCounts.get(row[5]) ?? {
      code: row[5],
      name: countries.get(row[5]),
      settlements: 0,
      administrative: 0,
      sections: 0,
    };
    c[kind]++;
    countryCounts.set(row[5], c);
  }
  const manifest = {
    schema: 1,
    version,
    license: 'CC-BY-4.0',
    synthetic: false,
    downloadedAt: inputs[0].downloadedAt,
    inputs,
    countries: [...countryCounts.values()],
    counts,
    packs,
  };
  assertPlacesManifest(manifest);
  return { manifest, raws };
}
const row = (id, patch) => {
  const parsed = parseGeoName(line(id, patch), admin1, admin2, countries);
  assert.equal(parsed.status, 'accepted');
  return parsed.row;
};
async function isolated(run) {
  const root = await mkdtemp(join(tmpdir(), 'atlas-SYNTHETIC-places-'));
  try {
    return await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('GeoNames source parsing preserves lon-lat, administrative codes and exact source dates, without nearest-parent inference', () => {
  const r = row(1, { 4: '-23.25', 5: '-77.5' });
  assert.deepEqual(r.slice(2, 4), [-77.5, -23.25]);
  assert.equal(r[7], admin1.get('TR.01'));
  assert.equal(r[9], admin2.get('TR.01.02'));
  assert.equal(r[12], '2026-10-17');
  const missing = row(2, { 10: '99', 11: '01' });
  assert.equal(missing[7], '');
  assert.equal(missing[9], '');
  assert.deepEqual(missing.slice(6, 10), ['99', '', '01', '']);
});
test('settlement seats and administrative units stay distinct; district and section LOD does not become a country boundary', () => {
  for (const code of ['ADM1', 'ADM2', 'ADM3', 'ADM4']) {
    const p = parseGeoName(line(1, { 6: 'A', 7: code }), admin1, admin2, countries);
    assert.equal(p.kind, 'administrative');
    assert.equal(placeZoom(p.row), code === 'ADM1' ? 4 : code === 'ADM2' ? 6 : 8);
  }
  assert.equal(
    parseGeoName(line(1, { 7: 'PPLA2' }), admin1, admin2, countries).kind,
    'settlements',
  );
  const section = parseGeoName(line(2, { 7: 'PPLX' }), admin1, admin2, countries);
  assert.equal(section.kind, 'sections');
  assert.equal(placeZoom(section.row), 8);
});
test('historical, destroyed, abandoned places, modern country boundaries and street features are excluded from current-place import', () => {
  for (const [cls, code] of [
    ['P', 'PPLH'],
    ['P', 'PPLW'],
    ['P', 'PPLQ'],
    ['P', 'PPLCH'],
    ['A', 'ADM2H'],
    ['A', 'PCLI'],
    ['R', 'ST'],
    ['S', 'BLDG'],
  ])
    assert.equal(
      parseGeoName(line(1, { 6: cls, 7: code }), admin1, admin2, countries).status,
      'excluded',
    );
});
test('malformed coordinates, source dates, row schemas and unknown country codes never manufacture a location', () => {
  for (const p of [
    { 4: '' },
    { 5: '181' },
    { 4: '-91' },
    { 18: '2026-02-30' },
    { 14: 'NaN' },
    { 8: 'XX' },
    { 0: '0' },
  ])
    assert.equal(parseGeoName(line(1, p), admin1, admin2, countries).status, 'invalid');
  assert.equal(parseGeoName('SYNTHETIC bad row', admin1, admin2, countries).status, 'invalid');
  assert.equal(parseGeoName('x'.repeat(24001), admin1, admin2, countries).status, 'invalid');
  assert.equal(isPlaceRow([...row(1), 'extra']), false);
});
test('admin and country auxiliary sources enforce their official columns and retain unlocalized source names', () => {
  assert.equal(
    parseAdminNames('TR.01\tSYNTHETIC upper\tSYNTHETIC upper\t123\n', 1).get('TR.01'),
    'SYNTHETIC upper',
  );
  assert.equal(
    parseCountryNames('# comment\nTR\tTUR\t792\tTU\tSYNTHETIC country\n').get('TR'),
    'SYNTHETIC country',
  );
  assert.throws(() => parseAdminNames('TR.01.02\tx\tx\t123', 1));
  assert.throws(() => parseCountryNames('TR\tTUR\t792\tTU\tx\nTR\tTUR\t792\tTU\ty'));
});

test('duplicate GeoNames IDs are rejected across different LOD/spatial packs with a bounded bitset', () => {
  const track = createPlaceIdTracker();
  for (const id of [1, 2, 65535, 65536, 9999999999]) track(id);
  assert.throws(() => track(65536), /DUPLICATE_ID/);
  assert.throws(() => track(1), /DUPLICATE_ID/);
});

function syntheticZip(files) {
  let offset = 0;
  const locals = [],
    directory = [];
  for (const [name, text] of files) {
    const path = Buffer.from(name),
      data = Buffer.from(text);
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(path.length, 26);
    locals.push(local, path, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(path.length, 28);
    central.writeUInt32LE(offset, 42);
    directory.push(central, path);
    offset += local.length + path.length + data.length;
  }
  const dir = Buffer.concat(directory),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, dir, end]);
}
test('actual unzip path streams only fixed allCountries.txt member, leaves other paths untouched and rejects corrupt archives', async () => {
  await isolated(async (root) => {
    const file = join(root, 'SYNTHETIC.zip'),
      text = line(1) + '\n' + line(2) + '\n';
    await writeFile(
      file,
      syntheticZip([
        ['allCountries.txt', text],
        ['../SYNTHETIC-escape', 'never extract'],
      ]),
    );
    const lines = [];
    for await (const line of unzipGeoNames(file)) lines.push(line);
    assert.deepEqual(lines, [line(1), line(2)]);
    await writeFile(file, 'SYNTHETIC broken zip');
    await assert.rejects(async () => {
      for await (const unexpected of unzipGeoNames(file)) {
        assert.fail(`Corrupt synthetic ZIP yielded data: ${unexpected}`);
      }
    }, /UNZIP/);
  });
});
test('global acquisition has fixed source allowlist, rights metadata, receipt verification and preservation of corrupt/untracked user files', async () => {
  assert.equal(placeSources.length, 5);
  assert.ok(placeSources.some((s) => s.file === 'allCountries.zip'));
  await isolated(async (root) => {
    let requests = 0;
    const spec = placeSources[0];
    const fetcher = async (url, options) => {
      requests++;
      assert.equal(url, spec.url);
      assert.equal(options.redirect, 'error');
      assert.match(options.headers['User-Agent'], /TarihAtlasi/);
      return new Response('SYNTHETIC download, not real source facts');
    };
    await acquirePlaceSource(spec, root, { fetcher });
    await acquirePlaceSource(spec, root, { fetcher, verifyOnly: true });
    assert.equal(requests, 1);
    await assert.rejects(
      acquirePlaceSource({ ...spec, url: 'https://evil.example/' }, root, { fetcher }),
      /ALLOWLISTED/,
    );
    await writeFile(join(root, spec.file), 'SYNTHETIC corrupted cache');
    await assert.rejects(acquirePlaceSource(spec, root, { fetcher }), /PRESERVED/);
    assert.equal(await readFile(join(root, spec.file), 'utf8'), 'SYNTHETIC corrupted cache');
  });
});
test('streamed ETL creates deterministic bounded country/LOD/spatial packages and equivalent DOM copies; synthetic defaults are rejected for production', async () => {
  await isolated(async (root) => {
    const lines = [
      line(1, { 6: 'A', 7: 'ADM2' }),
      ...Array.from({ length: 805 }, (_, i) => line(i + 2)),
      line(900, { 7: 'PPLH' }),
      'SYNTHETIC invalid',
    ];
    const options = { lines, countries, admin1, admin2, inputs, synthetic: false };
    const a = await buildPlaces({
      ...options,
      temporary: join(root, 'a'),
      output: join(root, 'assets-a'),
    });
    const b = await buildPlaces({
      ...options,
      temporary: join(root, 'b'),
      output: join(root, 'assets-b'),
    });
    assert.deepEqual(a, b);
    assertPlacesManifest(a);
    assert.deepEqual(a.counts, {
      settlements: 805,
      administrative: 1,
      sections: 0,
      excluded: 1,
      invalid: 1,
    });
    assert.equal(a.packs.length, 3);
    for (const p of a.packs) {
      assert.ok(p.count <= 800 && p.bytes <= 262144);
      validatePlacePack(await readFile(join(root, 'assets-a', p.sha256 + '.atlas'), 'utf8'), p, a);
    }
    const generated = join(root, 'src/places/generated/world');
    await writePlacesModules(a, join(root, 'assets-a'), generated);
    const refs = await readFile(join(generated, 'assets.ts'), 'utf8');
    assert.ok(refs.includes("require('../../../../assets/places/"));
    const catalogCode = await readFile(join(generated, 'catalog.ts'), 'utf8');
    const encodedCatalog = catalogCode.slice(
      catalogCode.indexOf('JSON.parse(') + 11,
      catalogCode.lastIndexOf(')'),
    );
    assert.deepEqual(JSON.parse(JSON.parse(encodedCatalog)), a);
    for (const p of a.packs) {
      const module = await readFile(join(generated, `dom-${p.sha256}.ts`), 'utf8');
      const encoded = /'([^']+)'/u.exec(module)[1];
      assert.equal(
        gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'),
        await readFile(join(root, 'assets-a', p.sha256 + '.atlas'), 'utf8'),
      );
    }
    const unverified = await buildPlaces({
      ...options,
      synthetic: undefined,
      temporary: join(root, 'c'),
      output: join(root, 'assets-c'),
    });
    assert.equal(unverified.synthetic, true);
    assert.throws(() => assertPlacesManifest(unverified), /MANIFEST/);
  });
});
test('production validation rejects unknown license, missing provenance, altered chunks and invalid source rows even with a recalculated hash', () => {
  const { manifest, raws } = fixture([[row(1)]]);
  assert.throws(() => assertPlacesManifest({ ...manifest, license: 'unknown' }));
  assert.throws(() => assertPlacesManifest({ ...manifest, inputs: [] }));
  assert.throws(() =>
    assertPlacesManifest({
      ...manifest,
      inputs: manifest.inputs.map((s, i) => (i ? s : { ...s, url: 'https://evil.example/' })),
    }),
  );
  assert.throws(() => validatePlacePack(raws[0] + ' ', manifest.packs[0], manifest), /CHECKSUM/);
  for (const update of [
    (d) => {
      d.license = 'unknown';
    },
    (d) => {
      d.synthetic = true;
    },
    (d) => {
      d.rows[0][12] = '2026-02-30';
    },
    (d) => {
      d.rows[0][2] = 190;
    },
    (d) => {
      d.rows[0][1] = '';
    },
  ]) {
    const doc = JSON.parse(raws[0]);
    update(doc);
    const raw = JSON.stringify(doc),
      p = { ...manifest.packs[0], sha256: hash(raw), bytes: Buffer.byteLength(raw) };
    assert.throws(() => validatePlacePack(raw, p, manifest));
  }
});
test('viewport querying respects zoom and antimeridian; selecting a city verifies version and hash without adding historical dates or fabricated Wikipedia IDs', async () => {
  const { manifest, raws } = fixture([
    [row(1, { 5: '179', 4: '10' })],
    [row(2, { 5: '-179', 4: '10' })],
    [row(3, { 6: 'A', 7: 'ADM2', 5: '179', 4: '10' })],
  ]);
  const repo = createPlacesRepository(manifest, async (i) => raws[i]),
    signal = new AbortController().signal;
  assert.equal(containsLongitude(179, 170, -170), true);
  assert.equal(containsLongitude(-179, 170, -170), true);
  assert.equal(containsLongitude(0, 170, -170), false);
  const view = { west: 170, east: -170, south: 0, north: 20, zoom: 4 };
  const low = await repo.query(view, signal);
  assert.deepEqual(low.cities.map((c) => c.id).sort(), ['geonames:1', 'geonames:2']);
  assert.equal((await repo.query({ ...view, zoom: 6 }, signal)).cities.length, 3);
  const c = await repo.get('geonames:3', 2, manifest.version, signal);
  assert.equal(c.admin2, 'SYNTHETIC second division');
  assert.equal(c.sourceUrl, 'https://www.geonames.org/3/');
  assert.equal(c.wikidataId, undefined);
  assert.equal('temporal' in c, false);
  assert.equal(await repo.get(c.id, 2, hash('other version'), signal), null);
  assert.equal(await repo.get('geonames:999', 2, manifest.version, signal), null);
});
test('country browsing makes colliding records accessible, pages without duplicates, and separates settlements from administrative entities', async () => {
  const { manifest, raws } = fixture([
    Array.from({ length: 90 }, (_, i) => row(i + 1)),
    [row(99, { 6: 'A', 7: 'ADM2' })],
  ]);
  const repo = createPlacesRepository(manifest, async (i) => raws[i]),
    signal = new AbortController().signal;
  let cursor = null;
  const ids = [];
  do {
    const page = await repo.browse('TR', false, cursor, signal);
    assert.ok(page.cities.length <= 40);
    ids.push(...page.cities.map((c) => c.id));
    cursor = page.next;
  } while (cursor);
  assert.equal(ids.length, 90);
  assert.equal(new Set(ids).size, 90);
  assert.deepEqual(
    (await repo.browse('TR', true, null, signal)).cities.map((c) => c.id),
    ['geonames:99'],
  );
  await assert.rejects(repo.browse('XX', false, null, signal), /BROWSE/);
});
test('city loading uses at most two reads, eight cache entries; abort and corrupt chunks cannot silently return invented/old cities', async () => {
  const { manifest, raws } = fixture(
    Array.from({ length: 12 }, (_, i) => [row(i + 1, { 5: String(i) })]),
  );
  let active = 0,
    max = 0;
  const repo = createPlacesRepository(manifest, async (i) => {
    active++;
    max = Math.max(max, active);
    await new Promise((r) => setImmediate(r));
    active--;
    return raws[i];
  });
  const view = { west: -1, east: 20, south: 0, north: 20, zoom: 4 };
  assert.equal((await repo.query(view, new AbortController().signal)).cities.length, 12);
  assert.equal(max, 2);
  assert.equal(repo.stats().entries, 8);
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(repo.query(view, abort.signal), /ABORT/);
  const bad = createPlacesRepository(manifest, async () => 'SYNTHETIC corrupt file');
  const result = await bad.query(view, new AbortController().signal);
  assert.equal(result.failedPacks, 12);
  assert.equal(result.cities.length, 0);
  repo.clear();
  assert.equal(repo.stats().entries, 0);
});
test('bridge place references are versioned/bounded; URLs, extra keys, unknown catalog and invalid indices are rejected', () => {
  const { manifest } = fixture([[row(1)]]);
  const p = { cityId: 'geonames:1', packIndex: 0, catalogVersion: manifest.version };
  assert.equal(isPlaceSelection(p, manifest), true);
  for (const update of [
    { cityId: 'https://evil.example' },
    { cityId: 'geonames:0' },
    { packIndex: -1 },
    { packIndex: 1 },
    { packIndex: 0.5 },
    { catalogVersion: 'other' },
    { url: 'https://evil.example' },
  ])
    assert.equal(isPlaceSelection({ ...p, ...update }, manifest), false);
});
test('GeoNames external links only open exact numeric HTTPS record paths', () => {
  assert.equal(
    externalURL('https://www.geonames.org/123/', 'source'),
    'https://www.geonames.org/123/',
  );
  for (const url of [
    'https://www.geonames.org/123/?redirect=evil',
    'https://www.geonames.org.evil/123/',
    'http://www.geonames.org/123/',
    'https://www.geonames.org/123/#x',
    'https://www.geonames.org/arbitrary/',
    'https://www.geonames.org/123/../../',
  ])
    assert.equal(externalURL(url, 'source'), null);
  assert.equal(externalURL('https://www.geonames.org/123/', 'wikipedia'), null);
});
test('shared native data cache retains a file until all geometry/place readers release their holds', async () => {
  let removed = 0;
  const io = {
    cacheDirectory: 'file:///SYNTHETIC/',
    readDirectoryAsync: async () => ['ExponentAsset-SYNTHETIC.atlas'],
    getInfoAsync: async () => ({ exists: !removed, isDirectory: false, size: 40 * 1048576 }),
    deleteAsync: async () => {
      removed++;
    },
  };
  const cache = createWorldNativeCache(io),
    first = cache.hold('file:///SYNTHETIC/ExponentAsset-SYNTHETIC.atlas'),
    second = cache.hold('file:///SYNTHETIC/ExponentAsset-SYNTHETIC.atlas');
  await cache.prune();
  first();
  first();
  await cache.prune();
  assert.equal(removed, 0);
  second();
  await cache.prune();
  assert.equal(removed, 1);
});

test('browser data transport loads only requested licensed packs and retains hash validation, caching and source identity', async () => {
  const { manifest, raws } = fixture([
    [row(41, { 1: 'SYNTHETIC İstanbul / Çığ', 6: 'A', 7: 'ADM2' })],
    [row(42)],
  ]);
  assert.ok(Buffer.byteLength(raws[0]) > raws[0].length);
  const requested = [];
  const fetcher = async (url, options) => {
    assert.equal(options.redirect, 'error');
    assert.equal(options.credentials, 'omit');
    requested.push(url);
    const index = manifest.packs.findIndex(
      (p) => url === 'https://atlas.example/data/places/' + p.sha256 + '.atlas',
    );
    assert.notEqual(index, -1);
    return new Response(
      new ReadableStream({
        start(controller) {
          // Split UTF-8 across bytes: decoder must preserve Turkish names and source checksum.
          for (const byte of Buffer.from(raws[index])) controller.enqueue(Uint8Array.of(byte));
          controller.close();
        },
      }),
    );
  };
  const repo = createPlacesRepository(manifest, async (_i, p, s) =>
    readHTTPPlace(p, s, 'https://atlas.example/?year=2024', '', fetcher),
  );
  const signal = new AbortController().signal;
  const page = await repo.browse('TR', true, null, signal);
  assert.equal(page.cities.length, 1);
  assert.equal(page.cities[0].id, 'geonames:41');
  assert.equal(page.cities[0].sourceUrl, 'https://www.geonames.org/41/');
  assert.equal('temporal' in page.cities[0], false);
  await repo.browse('TR', true, null, signal);
  assert.equal(requested.length, 1);
  const corrupt = createPlacesRepository(manifest, async (_i, p, s) =>
    readHTTPPlace(
      p,
      s,
      'https://atlas.example/',
      '',
      async () => new Response(raws[0].replace('SYNTHETIC', 'CORRUPTED')),
    ),
  );
  await assert.rejects(corrupt.browse('TR', true, null, signal));
});
test('browser pack requests reject foreign schemes, malformed paths, redirects, oversized/truncated bytes and cancellation', async () => {
  const { manifest, raws } = fixture([[row(43)]]),
    pack = manifest.packs[0];
  for (const base of [
    'file:///tmp/index.html',
    'javascript:alert(1)',
    'https://user:pw@atlas.example/',
  ])
    assert.throws(() => placeHTTPURL(pack, base), /PLACES_ASSET_ORIGIN/u);
  for (const basePath of ['//evil.example', '/../private', '/atlas?secret=1', '/atlas/%2e'])
    assert.throws(
      () => placeHTTPURL(pack, 'https://atlas.example/', basePath),
      /PLACES_ASSET_PATH/u,
    );
  assert.equal(
    new URL(placeHTTPURL(pack, 'https://atlas.example/', '/atlas/')).pathname,
    '/atlas/data/places/' + pack.sha256 + '.atlas',
  );
  assert.throws(() => placeHTTPURL({ ...pack, sha256: '../private' }, 'https://atlas.example/'));
  const signal = new AbortController().signal;
  for (const response of [
    new Response('x'),
    new Response(raws[0] + 'x'),
    new Response(raws[0], { headers: { 'content-length': String(pack.bytes + 1) } }),
    new Response('', { status: 404 }),
  ])
    await assert.rejects(
      readHTTPPlace(pack, signal, 'https://atlas.example/', '', async () => response),
      /PLACES_ASSET/u,
    );
  const redirect = new Response(raws[0]);
  Object.defineProperty(redirect, 'redirected', { value: true });
  await assert.rejects(
    readHTTPPlace(pack, signal, 'https://atlas.example/', '', async () => redirect),
    /PLACES_ASSET_HTTP/u,
  );
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(
    readHTTPPlace(pack, controller.signal, 'https://atlas.example/', '', async () => {
      calls++;
      return new Response(raws[0]);
    }),
    /PLACES_ABORT/u,
  );
  assert.equal(calls, 0);
});
test('Metro serves fixed hash data paths without traversals, symlinks, writes or eager data loading', async () =>
  isolated(async (root) => {
    const { manifest, raws } = fixture([[row(44)]]),
      pack = manifest.packs[0];
    await mkdir(join(root, 'assets/places'), { recursive: true });
    await writeFile(join(root, 'assets/places', pack.sha256 + '.atlas'), raws[0]);
    const request = async (url, method = 'GET') => {
      const chunks = [];
      let status, headers;
      const res = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });
      res.headersSent = false;
      res.writeHead = (value, h = {}) => {
        status = value;
        headers = h;
        res.headersSent = true;
      };
      const done = finished(res);
      await createPlacesMiddleware(
        root,
        (_req, response) => {
          response.writeHead(202);
          response.end();
        },
        async () => manifest,
      )({ url, method }, res);
      await done;
      return { status, headers, body: Buffer.concat(chunks).toString('utf8') };
    };
    const path = '/data/places/' + pack.sha256 + '.atlas';
    const data = await request(path);
    assert.equal(data.status, 200);
    assert.equal(data.body, raws[0]);
    assert.equal(data.headers['Content-Length'], pack.bytes);
    assert.match(data.headers['Cache-Control'], /immutable/u);
    assert.equal((await request(path, 'HEAD')).body, '');
    assert.equal((await request(path, 'POST')).status, 405);
    assert.equal((await request('/data/places/../../package.json')).status, 404);
    assert.equal((await request('/data/places/%2e%2e/private.atlas')).status, 404);
    assert.equal((await request('/index.html')).status, 202);
    const sha = '0'.repeat(64);
    assert.equal((await request('/data/places/' + sha + '.atlas')).status, 404);
    await symlink(
      join(root, 'assets/places', pack.sha256 + '.atlas'),
      join(root, 'assets/places', sha + '.atlas'),
    );
    assert.equal((await request('/data/places/' + sha + '.atlas')).status, 404);
  }));
test('static web export copies only rights-validated chunks and attribution, preserves conflicting files and rejects corruption', async () =>
  isolated(async (root) => {
    const { manifest, raws } = fixture([[row(45)]]),
      pack = manifest.packs[0];
    const source = join(root, 'source'),
      target = join(root, 'export'),
      notice = join(root, 'NOTICE.txt');
    await mkdir(source);
    await writeFile(join(source, pack.sha256 + '.atlas'), raws[0]);
    await writeFile(
      notice,
      'GeoNames\nhttps://creativecommons.org/licenses/by/4.0/\n' +
        manifest.version +
        '\nChanges: SYNTHETIC TEST ONLY',
    );
    const result = await exportWebPlaces(manifest, source, target, notice);
    assert.deepEqual(result, { packs: 1, bytes: pack.bytes });
    assert.equal(await readFile(join(target, pack.sha256 + '.atlas'), 'utf8'), raws[0]);
    assert.match(await readFile(join(target, 'NOTICE.txt'), 'utf8'), /GeoNames/u);
    await writeFile(join(target, pack.sha256 + '.atlas'), 'PRESERVE THIS FILE');
    await assert.rejects(exportWebPlaces(manifest, source, target, notice), /PRESERVED/u);
    assert.equal(
      await readFile(join(target, pack.sha256 + '.atlas'), 'utf8'),
      'PRESERVE THIS FILE',
    );
    await assert.rejects(
      exportWebPlaces(
        { ...manifest, license: 'UNKNOWN' },
        source,
        join(root, 'bad-license'),
        notice,
      ),
      /PLACES_MANIFEST/u,
    );
    await writeFile(
      join(source, pack.sha256 + '.atlas'),
      raws[0].replace('SYNTHETIC', 'CORRUPTED'),
    );
    await assert.rejects(exportWebPlaces(manifest, source, join(root, 'bad-chunk'), notice));
  }));
