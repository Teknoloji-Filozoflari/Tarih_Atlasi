import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createLiveSitelinkClient } from '../../src/sources/live-sitelinks.ts';
import { navigateArticle } from '../../src/sources/article-navigation.ts';
import { timelineRuler } from '../../src/timeline/ruler.ts';
import { parseMessage } from '../../src/map-contract/protocol.ts';
import { PILOT_VERSION } from '../../src/data/pilot-contract.ts';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { validateWorldPack } from '../../src/data/world/manifest.ts';
import { reviewedWorldRow, reviewedWorldTerritory } from '../../src/data/world/review.ts';
import { containsPoliticalPoint } from '../../src/politics/geometry.ts';
import { polityWikidataId } from '../../src/sources/polity-identity.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';

// All API responses below are SYNTHETIC TEST ONLY, not actual Q1 facts.
const raw = (sites = ['trwiki', 'enwiki']) => ({
  entities: {
    Q1: {
      id: 'Q1',
      lastrevid: 123,
      sitelinks: Object.fromEntries(
        sites.map((site) => [
          site,
          {
            site,
            title: 'SYNTHETIC TEST ONLY',
            url: `https://${site.slice(0, -4)}.wikipedia.org/wiki/SYNTHETIC_TEST_ONLY`,
          },
        ]),
      ),
    },
  },
});
const response = (value, status = 200, headers = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
const signal = () => new AbortController().signal;

test('country link lookup sends only the source QID, authenticates sitelinks and caches without guessing titles', async () => {
  let now = Date.parse('2026-10-17T00:00:00Z'),
    calls = 0;
  const client = createLiveSitelinkClient({
    now: () => now,
    fetcher: async (url, options) => {
      calls++;
      const target = new URL(url);
      assert.equal(target.origin, 'https://www.wikidata.org');
      assert.equal(target.pathname, '/w/api.php');
      assert.equal(target.searchParams.get('ids'), 'Q1');
      assert.equal(target.searchParams.get('props'), 'info|sitelinks/urls');
      assert.equal(target.searchParams.get('origin'), '*');
      assert.equal(target.searchParams.has('callback'), false);
      assert.equal(target.searchParams.has('search'), false);
      assert.equal(options.credentials, 'omit');
      assert.equal(options.redirect, 'error');
      assert.equal(options.referrerPolicy, 'no-referrer');
      assert.match(options.headers['Api-User-Agent'], /^TarihAtlasi\//);
      return response(raw());
    },
  });
  const result = await client.resolve('Q1', signal());
  assert.equal(result.kind, 'trwiki');
  assert.equal(result.url, raw().entities.Q1.sitelinks.trwiki.url);
  assert.equal(result.snapshot.revision, '123');
  assert.equal(result.snapshot.representation, 'wikidata-api-extraction');
  assert.equal(await client.resolve('Q1', signal()), result);
  assert.equal(calls, 1);
  now += 24 * 60 * 60 * 1000 + 1;
  assert.equal(client.cached('Q1'), null);
  await client.resolve('Q1', signal());
  assert.equal(calls, 2);
  const dateLimited = createLiveSitelinkClient({
    now: () => now,
    fetcher: async () => response({}, 429, { 'retry-after': new Date(now + 60000).toUTCString() }),
  });
  await assert.rejects(() => dateLimited.resolve('Q1', signal()), /RATE_LIMIT/);
  now += 20000;
  await assert.rejects(() => dateLimited.resolve('Q1', signal()), /RATE_LIMIT/);
});

test('live country links choose existing EN then Wikidata, and never manufacture a missing language URL', async () => {
  for (const [sites, kind] of [
    [['enwiki'], 'enwiki'],
    [[], 'wikidata'],
  ]) {
    const client = createLiveSitelinkClient({ fetcher: async () => response(raw(sites)) });
    const result = await client.resolve('Q1', signal());
    assert.equal(result.kind, kind);
    if (!sites.length) {
      assert.equal(result.reason, 'missing-languages');
      assert.equal(result.url, 'https://www.wikidata.org/wiki/Q1');
    }
  }
});

test('redirected identities, invalid URLs/revisions, malformed content and oversized responses cannot enter live link cache', async () => {
  const wrong = raw();
  wrong.entities.Q1.sitelinks.trwiki.url = 'javascript:alert(1)';
  const noRevision = raw();
  delete noRevision.entities.Q1.lastrevid;
  const other = raw();
  other.entities.Q1.id = 'Q2';
  for (const value of [
    wrong,
    noRevision,
    other,
    { ...raw(), redirects: [{ from: 'Q1', to: 'Q2' }] },
    { entities: { Q1: { id: 'Q1', missing: '' } } },
  ]) {
    const client = createLiveSitelinkClient({ fetcher: async () => response(value) });
    await assert.rejects(() => client.resolve('Q1', signal()));
    assert.equal(client.cached('Q1'), null);
  }
  for (const build of [
    () => new Response('<html>no JSON</html>', { headers: { 'content-type': 'text/html' } }),
    () => new Response('{', { headers: { 'content-type': 'application/json' } }),
    () => response(raw(), 200, { 'content-length': '262145' }),
    () => new Response(new Uint8Array(262145), { headers: { 'content-type': 'application/json' } }),
    () => {
      const r = response(raw());
      Object.defineProperty(r, 'url', { value: 'https://evil.invalid/' });
      return r;
    },
  ]) {
    const client = createLiveSitelinkClient({ fetcher: async () => build() });
    await assert.rejects(() => client.resolve('Q1', signal()));
    assert.equal(client.cached('Q1'), null);
  }
});

test('country requests bound concurrency, honor Retry-After, reject invalid IDs and cancel stale work', async () => {
  let now = 100000,
    calls = 0;
  const rate = createLiveSitelinkClient({
    now: () => now,
    fetcher: async () => {
      calls++;
      return response({}, 429, { 'retry-after': '60' });
    },
  });
  await assert.rejects(() => rate.resolve('Q1', signal()), /RATE_LIMIT/);
  await assert.rejects(() => rate.resolve('Q1', signal()), /RATE_LIMIT/);
  assert.equal(calls, 1);
  now += 61000;
  await assert.rejects(() => rate.resolve('Q1', signal()), /RATE_LIMIT/);
  assert.equal(calls, 2);
  const controller = new AbortController();
  const client = createLiveSitelinkClient({
    fetcher: async (url, options) =>
      new Promise((resolve, reject) =>
        options.signal.addEventListener('abort', () => reject(new Error('SYNTHETIC aborted')), {
          once: true,
        }),
      ),
  });
  const running = client.resolve('Q1', controller.signal);
  await assert.rejects(() => client.resolve('Q2', signal()), /RATE_LIMIT/);
  controller.abort();
  await assert.rejects(() => running);
  assert.equal(client.cached('Q1'), null);
  await assert.rejects(() => client.resolve('not-an-id', signal()), /QID/);
});

test('article navigation uses checked destinations and closes reserved tabs on stale or malicious results', async () => {
  const actions = [],
    tab = { navigate: (url) => actions.push(url), close: () => actions.push('closed') };
  const client = createLiveSitelinkClient({ fetcher: async () => response(raw()) });
  const value = await client.resolve('Q1', signal());
  await navigateArticle(async () => value, tab, signal());
  assert.deepEqual(actions, [value.url]);
  actions.length = 0;
  await assert.rejects(() =>
    navigateArticle(
      async () => ({ ...value, url: 'https://evil.invalid/wiki/test' }),
      tab,
      signal(),
    ),
  );
  assert.deepEqual(actions, ['closed']);
  actions.length = 0;
  const controller = new AbortController();
  await assert.rejects(() =>
    navigateArticle(
      async () => {
        controller.abort();
        return value;
      },
      tab,
      controller.signal,
    ),
  );
  assert.deepEqual(actions, ['closed']);
});

test('new country-name bridge action carries only bounded ID/revision and refuses URL injection, stale envelope and command direction', () => {
  const event = {
    version: 1,
    sessionId: 'test',
    requestId: 'event-1',
    type: 'entity.article',
    payload: { recordId: 'world:clio-r13424', revision: 1, catalogVersion: PILOT_VERSION },
  };
  assert.ok(parseMessage(JSON.stringify(event), 'event', 'test'));
  assert.equal(parseMessage(JSON.stringify(event), 'command', 'test'), null);
  for (const change of [
    { ...event, sessionId: 'old' },
    { ...event, version: 2 },
    { ...event, payload: { ...event.payload, url: 'https://evil.invalid' } },
    { ...event, payload: { ...event.payload, recordId: 'javascript:alert(1)' } },
    { ...event, payload: { ...event.payload, revision: -1 } },
  ])
    assert.equal(parseMessage(JSON.stringify(change), 'event', 'test'), null);
});

test('timeline ruler handles BCE/CE without zero, stays bounded, and denotes scale rather than fabricated coverage', () => {
  for (const [min, max] of [
    [-2000, 2026],
    [-10, 10],
    [-1, 1],
    [2000, 2020],
    [1826, 2026],
  ]) {
    for (const compact of [true, false]) {
      const ticks = timelineRuler(min, max, compact);
      assert.equal(ticks[0].year, min);
      assert.equal(ticks.at(-1).year, max);
      assert.equal(ticks[0].fraction, 0);
      assert.equal(ticks.at(-1).fraction, 1);
      assert.ok(ticks.length <= 12);
      assert.ok(ticks.every((t) => t.year !== 0 && t.fraction >= 0 && t.fraction <= 1));
      assert.ok(ticks.every((t, i) => !i || t.year > ticks[i - 1].year));
    }
  }
  for (const pair of [
    [0, 2026],
    [-2001, 2026],
    [1, 1],
    [1, 1e12],
  ])
    assert.throws(() => timelineRuler(...pair, false));
});

test('source QIDs are preserved for licensed pilot countries; synthetic, unrelated and altered provenance never fabricates a mapping', () => {
  const record = preparedPilot.records.find((r) => r.id === 'atlas:clio-r13091-area-0');
  assert.equal(polityWikidataId(record), 'Q43');
  assert.equal(polityWikidataId({ ...record, synthetic: true }), null);
  assert.equal(polityWikidataId({ ...record, id: 'test:SYNTHETIC' }), null);
  assert.equal(
    polityWikidataId({
      ...record,
      evidence: record.evidence.map((e) => ({ ...e, sourceRevision: 'unreviewed' })),
    }),
    null,
  );
});

test('2010 France color uses only unchanged metropolitan source components; duplicate Netherlands cannot produce double color', async () => {
  const row = worldManifest.rows.find((r) => r.index === 13247),
    pack = worldManifest.packs[row.pack];
  const geometries = validateWorldPack(
    await readFile(new URL(`../../assets/world/${pack.sha256}.atlas`, import.meta.url), 'utf8'),
    pack,
  );
  const original = geometries[row.key],
    before = JSON.stringify(original);
  assert.equal(
    containsPoliticalPoint(original, [4, 25]),
    true,
    'source defect is reproduced in Sahara',
  );
  const corrected = reviewedWorldTerritory(reviewedWorldRow(row), original);
  assert.equal(corrected.extentType, 'partial-area');
  assert.equal(corrected.geometry.coordinates.length, 2);
  assert.deepEqual(corrected.geometry.coordinates, [
    original.coordinates[5],
    original.coordinates[6],
  ]);
  assert.equal(containsPoliticalPoint(corrected.geometry, [4, 25]), false);
  assert.equal(containsPoliticalPoint(corrected.geometry, [2, 47]), true);
  assert.equal(JSON.stringify(original), before, 'original archive geometry remains unchanged');
  assert.match(corrected.borderPrecision.description, /tam alanı değildir/);
  assert.ok(
    corrected.evidence[0].transformationIds.includes(
      'transform:france-metropolitan-source-subset-v1',
    ),
  );
  const duplicate = worldManifest.rows.find((r) => r.index === 13116),
    canonical = worldManifest.rows.find((r) => r.index === 13120);
  assert.equal(duplicate.key, canonical.key);
  assert.equal(duplicate.start, canonical.start);
  assert.equal(duplicate.end, canonical.end);
  assert.equal(reviewedWorldRow(duplicate).pack, null);
  assert.equal(reviewedWorldRow(canonical).pack, canonical.pack);
  assert.throws(() => reviewedWorldRow({ ...row, key: '0'.repeat(64) }), /REVIEW_MISMATCH/);
});
