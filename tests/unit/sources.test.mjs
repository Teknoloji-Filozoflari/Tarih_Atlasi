// Synthetic snapshots below are TEST ONLY. Real pilot assertions use the reviewed catalog.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { createSitelinkResolver, parseSitelinkSnapshot } from '../../src/sources/sitelinks.ts';
import { externalURL, openCheckedExternal } from '../../src/sources/url-policy.ts';
import { openExternal as openWeb } from '../../src/sources/external.web.ts';
import { createSourceRepository } from '../../src/sources/repository.ts';
import { sourceLinks, sitelinkManifest } from '../../src/sources/catalog.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { pilotSources } from '../../src/data/pilot.ts';
import { buildSitelinks, prepareSitelinks } from '../../scripts/sitelinks.mjs';
import {
  fetchSitelinkCandidate,
  sitelinkCandidate,
} from '../../scripts/etl/wikidata-sitelinks.mjs';
import { isAllowedNavigation } from '../../src/map-contract/navigation.ts';

const now = Date.parse('2026-10-16T00:00:00Z');
const userAgent = 'TarihAtlasi/test (https://example.invalid/SYNTHETIC-TEST-ONLY)';
function snapshot(sites = ['enwiki', 'trwiki']) {
  return {
    wikidataId: 'Q1',
    revision: '123',
    sourceUrl: 'https://www.wikidata.org/w/index.php?title=Q1&oldid=123',
    verifiedAt: '2026-10-16T00:00:00Z',
    reviewStatus: 'verified',
    representation: 'wikidata-api-extraction',
    licenseId: 'CC0-1.0',
    attribution: 'SYNTHETIC TEST ONLY; not actual Q1 data',
    sitelinks: sites.map((site) => ({
      site,
      title: 'SYNTHETIC TEST ONLY',
      url: `https://${site.slice(0, -4)}.wikipedia.org/wiki/SYNTHETIC_TEST_ONLY`,
    })),
  };
}
const raw = () => ({
  entities: {
    Q1: {
      id: 'Q1',
      lastrevid: 123,
      sitelinks: Object.fromEntries(snapshot().sitelinks.map((link) => [link.site, link])),
    },
  },
});
const response = (value) =>
  new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
test('sitelink: explicit trwiki wins regardless of API order; enwiki then Wikidata fallback', () => {
  assert.equal(createSitelinkResolver('test', [snapshot()]).resolve('Q1').kind, 'trwiki');
  assert.equal(createSitelinkResolver('test', [snapshot(['enwiki'])]).resolve('Q1').kind, 'enwiki');
  const fallback = createSitelinkResolver('test', [snapshot([])]).resolve('Q1');
  assert.equal(fallback.kind, 'wikidata');
  assert.equal(fallback.reason, 'missing-languages');
  assert.equal(fallback.url, 'https://www.wikidata.org/wiki/Q1');
});
test('unreviewed QID is distinct from confirmed missing languages; no ID never yields a slug', () => {
  const resolver = createSitelinkResolver('test', []);
  assert.equal(resolver.resolve('Q2').reason, 'not-reviewed');
  for (const id of [null, 'Vincent van Gogh', 'Q0', 'Q1/../../', 'Q1?url=https://evil.invalid']) {
    assert.equal(resolver.resolve(id).kind, 'unavailable');
    assert.equal(resolver.resolve(id).url, null);
  }
});
test('snapshot gate rejects identity/revision/license/review/URL/title/duplicate-site tampering', () => {
  for (const mutate of [
    (s) => (s.wikidataId = 'Q2'),
    (s) => (s.revision = '124'),
    (s) => (s.reviewStatus = 'unverified'),
    (s) => (s.licenseId = 'unknown'),
    (s) => (s.attribution = ''),
    (s) => (s.redirect = 'Q2'),
    (s) => (s.sitelinks[0].url = 'https://evil.invalid/wiki/SYNTHETIC_TEST_ONLY'),
    (s) => (s.sitelinks[0].title = 'Invented'),
    (s) => s.sitelinks.push(s.sitelinks[0]),
    (s) => (s.sitelinks[0].site = 'dewiki'),
    (s) => (s.verifiedAt = 'not a date'),
    (s) => (s.verifiedAt = '2026-02-31T00:00:00Z'),
  ]) {
    const s = snapshot();
    mutate(s);
    assert.equal(parseSitelinkSnapshot(s), null, JSON.stringify(s));
  }
  assert.throws(
    () => createSitelinkResolver('test', [snapshot(), snapshot()]),
    /SITELINK_SNAPSHOT/,
  );
});
test('bounded LRU owns immutable snapshots; release replaces cache without stale identity reuse', () => {
  const s = snapshot(),
    resolver = createSitelinkResolver('test-1', [s]);
  s.sitelinks[0].title = 'Caller mutation';
  const first = resolver.resolve('Q1');
  assert.equal(resolver.resolve('Q1'), first);
  assert.throws(() => {
    first.snapshot.sitelinks[0].url = 'https://evil.invalid';
  }, TypeError);
  for (let id = 2; id < 140; id++) resolver.resolve(`Q${id}`);
  assert.equal(resolver.cacheSize, 128);
  assert.notEqual(resolver.resolve('Q1'), first);
  const next = createSitelinkResolver('test-2', [snapshot(['enwiki'])]);
  assert.equal(next.resolve('Q1').kind, 'enwiki');
  resolver.clear();
  assert.equal(resolver.cacheSize, 0);
});
test('reviewed real pilot resolves verified Turkish links; other event and political ID stay honest', () => {
  assert.equal(sourceLinks.resolve('Q5582').url, 'https://tr.wikipedia.org/wiki/Vincent_van_Gogh');
  assert.equal(
    sourceLinks.resolve('Q83224').url,
    'https://tr.wikipedia.org/wiki/Hastings_Muharebesi',
  );
  assert.equal(sourceLinks.resolve('Q150995').reason, 'not-reviewed');
  assert.equal(sourceLinks.resolve(null).kind, 'unavailable');
  assert.equal(sitelinkManifest.version, '1.2.0');
});
test('reviewed raw checksum and deterministic generated output gate production publication', async () => {
  await prepareSitelinks(true);
  const bytes = await readFile('data/sitelinks/reviewed.json');
  assert.equal(await buildSitelinks(bytes), await buildSitelinks(bytes));
  await assert.rejects(
    buildSitelinks(Buffer.concat([bytes, Buffer.from(' ')])),
    /SITELINK_REVIEW_CHECKSUM/,
  );
});
test('external URL rejects scripts, credentials, ports, lookalikes, controls and traversal', () => {
  for (const url of [
    'javascript:alert(1)',
    'http://tr.wikipedia.org/wiki/A',
    'file:///etc/passwd',
    'intent://A',
    'https://tr.wikipedia.org.evil.invalid/wiki/A',
    'https://tr.wikipedia.org@evil.invalid/wiki/A',
    'https://user:pass@tr.wikipedia.org/wiki/A',
    'https://tr.wikipedia.org:443/wiki/A',
    'https://tr.wikipedia.org./wiki/A',
    'https://tr.wikipedia.org/wiki/A?redirect=evil',
    'https://tr.wikipedia.org/wiki/A#x',
    'https://tr.wikipedia.org/wiki/%0aA',
    'https://tr.wikipedia.org/wiki/%5cA',
    'https://tr.wikipedia.org/wiki/%2e%2e/A',
    'https://tr.wikipedia.org/wiki/../A',
    'https://tr.wikipedia.org\\@evil.invalid/wiki/A',
    'https://tr.wikipedia.org/wiki/ A',
    'https://commons.wikimedia.org/wiki/File:A',
    'https://en.wikipedia.org/',
  ])
    assert.equal(externalURL(url, 'wikipedia'), null, url);
  assert.ok(externalURL('https://tr.wikipedia.org/wiki/Hastings_Muharebesi', 'wikipedia'));
  assert.equal(externalURL('https://example.invalid/a', 'source'), null);
  assert.equal(externalURL('https://www.wikidata.org/wiki/Q1?bad=1', 'wikidata'), null);
});
test('all current source URLs pass exact allowlist; map WebView rejects every external target', () => {
  for (const source of preparedPilot.sources) {
    assert.ok(externalURL(source.url, 'source'), source.url);
    assert.equal(isAllowedNavigation(source.url, 'http://localhost:8081'), false);
  }
  assert.equal(
    isAllowedNavigation(sourceLinks.resolve('Q5582').url, 'http://localhost:8081'),
    false,
  );
});
test('safe external opener is synchronous, fails closed and propagates launch failure', async () => {
  const opened = [];
  const promise = openCheckedExternal('https://www.wikidata.org/wiki/Q1', 'wikidata', (url) =>
    opened.push(url),
  );
  assert.equal(opened.length, 1);
  await promise;
  await assert.rejects(
    openCheckedExternal('javascript:x', 'source', () => opened.push('bad')),
    /EXTERNAL_URL_REJECTED/,
  );
  assert.equal(opened.length, 1);
  await assert.rejects(
    openCheckedExternal('https://www.wikidata.org/wiki/Q1', 'wikidata', () =>
      Promise.reject(new Error('OS refused')),
    ),
    /OS refused/,
  );
});
test('web external tab uses noopener/noreferrer including browsers returning null', async () => {
  const previous = globalThis.window,
    calls = [];
  try {
    globalThis.window = {
      open: (...args) => {
        calls.push(args);
        return null;
      },
    };
    await openWeb('https://tr.wikipedia.org/wiki/Hastings_Muharebesi', 'wikipedia');
    assert.deepEqual(calls, [
      ['https://tr.wikipedia.org/wiki/Hastings_Muharebesi', '_blank', 'noopener,noreferrer'],
    ]);
  } finally {
    globalThis.window = previous;
  }
});
test('source details retain exact statement, revision, raw checksum, transformations and uncertainty', async () => {
  const location = preparedPilot.records.find((r) => r.kind === 'person-location');
  const detail = await pilotSources.detail([location.id, location.id]);
  assert.equal(detail.records.length, 1);
  assert.ok(detail.rows.length);
  assert.deepEqual(detail.rows[0].evidence, location.evidence[0]);
  assert.equal(detail.rows[0].matched, true);
  assert.match(detail.rows[0].input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(detail.records[0].temporal.uncertain, location.temporal.uncertain);
  assert.equal(detail.catalogVersion, '0.7.0-discovery');
});
test('source revision/input mismatch hides source URL; missing record and query budgets are handled', async () => {
  const provider = createHistoricalDataProvider(preparedPilot),
    record = preparedPilot.records.find((r) => r.kind === 'event');
  const repo = createSourceRepository(
    {
      ...provider,
      getSource: async (id) => ({ ...(await provider.getSource(id)), revision: 'wrong' }),
    },
    preparedPilot.inputs,
  );
  const detail = await repo.detail([record.id]);
  assert.equal(detail.rows[0].matched, false);
  assert.equal(detail.rows[0].source, null);
  assert.equal(detail.rows[0].input, null);
  assert.equal((await repo.detail(['missing:record'])).rows.length, 0);
  await assert.rejects(repo.detail(Array(1001).fill('test')), /SOURCE_BUDGET/);
});
test('sitelink API candidate has no production approval; QID change, missing and malformed URLs fail', () => {
  const candidate = sitelinkCandidate(raw(), 'Q1', now);
  assert.equal(candidate.reviewStatus, 'unverified');
  assert.equal(candidate.productionApproved, false);
  assert.equal(parseSitelinkSnapshot(candidate), null);
  for (const change of [
    (r) => (r.entities.Q1.id = 'Q2'),
    (r) => (r.entities.Q1.missing = ''),
    (r) => (r.redirects = [{ from: 'Q1', to: 'Q2' }]),
    (r) => delete r.entities.Q1.lastrevid,
    (r) => (r.entities.Q1.sitelinks.trwiki.url = 'https://evil.invalid/wiki/TEST'),
  ]) {
    const r = raw();
    change(r);
    assert.throws(() => sitelinkCandidate(r, 'Q1', now));
  }
  const r = raw();
  r.entities.Q1.sitelinks = {};
  assert.deepEqual(sitelinkCandidate(r, 'Q1', now).sitelinks, []);
});
test('collector sends bounded GET to official wbgetentities, no title guesses, contact UA, no redirects', async () => {
  let count = 0;
  const result = await fetchSitelinkCandidate('Q1', {
    userAgent,
    now,
    fetcher: async (url, options) => {
      count++;
      assert.equal(url.origin, 'https://www.wikidata.org');
      assert.equal(url.searchParams.get('props'), 'info|sitelinks/urls');
      assert.equal(url.searchParams.get('sitefilter'), 'trwiki|enwiki');
      assert.equal(url.searchParams.get('maxlag'), '5');
      assert.equal(url.searchParams.has('titles'), false);
      assert.equal(options.headers['User-Agent'], userAgent);
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal instanceof AbortSignal);
      return response(raw());
    },
  });
  assert.equal(count, 1);
  assert.equal(result.candidate.productionApproved, false);
  assert.match(result.receipt.sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.receipt.sourceRevision, '123');
});
test('collector fresh 24h cache is checksum+revision bound; expired entries refresh, never auto-approve', async () => {
  const result = await fetchSitelinkCandidate('Q1', {
    userAgent,
    now,
    fetcher: async () => response(raw()),
  });
  const noFetch = () => {
    throw new Error('unexpected network');
  };
  const hit = await fetchSitelinkCandidate('Q1', {
    userAgent,
    now: now + 1000,
    cached: result,
    fetcher: noFetch,
  });
  assert.equal(hit.cacheHit, true);
  assert.equal(hit.candidate.reviewStatus, 'unverified');
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      cached: { ...result, text: result.text + ' ' },
      fetcher: noFetch,
    }),
    /SITELINK_CACHE_CHECKSUM/,
  );
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      cached: { ...result, receipt: { ...result.receipt, sourceRevision: '999' } },
      fetcher: noFetch,
    }),
    /SITELINK_CACHE_REVISION/,
  );
  for (const changed of [
    { cacheKey: 'wrong-version' },
    { sourceUrl: 'https://evil.invalid' },
    { licenseId: 'unknown' },
  ]) {
    await assert.rejects(
      fetchSitelinkCandidate('Q1', {
        userAgent,
        now,
        cached: { ...result, receipt: { ...result.receipt, ...changed } },
        fetcher: noFetch,
      }),
      /SITELINK_CACHE_IDENTITY/,
    );
  }
  let refresh = 0;
  await fetchSitelinkCandidate('Q1', {
    userAgent,
    now: now + 86400000,
    cached: result,
    fetcher: async () => {
      refresh++;
      return response(raw());
    },
  });
  assert.equal(refresh, 1);
});
test('429 honors Retry-After and maxlag waits; excessive Retry-After defers instead of hammering', async () => {
  const waits = [];
  let calls = 0;
  await fetchSitelinkCandidate('Q1', {
    userAgent,
    now,
    wait: async (ms) => waits.push(ms),
    fetcher: async () => {
      calls++;
      if (calls === 1) return new Response('', { status: 429, headers: { 'retry-after': '2' } });
      if (calls === 2) return response({ error: { code: 'maxlag' } });
      return response(raw());
    },
  });
  assert.deepEqual(waits, [2000, 5000]);
  assert.equal(calls, 3);
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      fetcher: async () => new Response('', { status: 429, headers: { 'retry-after': '120' } }),
    }),
    /SITELINK_RETRY_DEFER/,
  );
});
test('timeout/network/429 exhausted budget remains bounded; pinned offline links remain available', async () => {
  const pinned = sourceLinks.resolve('Q5582');
  let calls = 0;
  const waits = [];
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      wait: async (ms) => waits.push(ms),
      fetcher: async () => {
        calls++;
        throw new DOMException('raw endpoint detail', 'TimeoutError');
      },
    }),
    /SITELINK_NETWORK_OR_TIMEOUT/,
  );
  assert.equal(calls, 3);
  assert.deepEqual(waits, [1000, 2000]);
  assert.equal(sourceLinks.resolve('Q5582'), pinned);
  calls = 0;
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      wait: async () => {},
      fetcher: async () => {
        calls++;
        return new Response('', { status: 429 });
      },
    }),
    /SITELINK_RETRY_BUDGET/,
  );
  assert.equal(calls, 3);
});
test('collector rejects missing contact UA, large bodies and non-success HTTP', async () => {
  await assert.rejects(fetchSitelinkCandidate('Q1', { now }), /SITELINK_ID_OR_CONTACT_USER_AGENT/);
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      fetcher: async () => new Response('x'.repeat(262145)),
    }),
    /SITELINK_SIZE/,
  );
  await assert.rejects(
    fetchSitelinkCandidate('Q1', {
      userAgent,
      now,
      fetcher: async () => new Response('', { status: 404 }),
    }),
    /SITELINK_HTTP/,
  );
});
