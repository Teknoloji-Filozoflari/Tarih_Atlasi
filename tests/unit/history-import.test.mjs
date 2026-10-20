import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { sourceTime, normalizeEntity } from '../../scripts/history/normalize.mjs';
import { checkedRaw } from '../../scripts/history/import.mjs';
import { checkHistory } from '../../scripts/history/check.mjs';
import { historyManifest } from '../../src/history/generated/manifest.ts';
import {
  createHistoryRepository,
  assertHistoryManifest,
  validateHistoryPack,
} from '../../src/history/repository.ts';
import { withHistoryTimeline } from '../../src/history/timeline.ts';
import { withHistoryProvider } from '../../src/history/provider.ts';
import { withHistorySearch } from '../../src/history/search.ts';
import { withHistoryPersons } from '../../src/history/persons.ts';
import {
  pilotProvider,
  pilotTimeline,
  pilotSearch,
  createHistoricalFeatureLoader,
} from '../../src/data/pilot.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import { createEventRepository } from '../../src/events/repository.ts';
import { createSourceRepository } from '../../src/sources/repository.ts';
import { createSitelinkResolver } from '../../src/sources/sitelinks.ts';
import { sha256 } from '../../src/data/chunks/hash.ts';
import { createApplicationData } from '../../src/data/application-core.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { createPeopleExtension, combinePeopleExtensions } from '../../src/people/extension.ts';
import { peopleCatalogs as a, peopleManifest as am } from '../../src/people/generated/index.ts';
import { peopleCatalogs as b, peopleManifest as bm } from '../../src/people/expanded/index.ts';
import { peopleCatalogs as c, peopleManifest as cm } from '../../src/people/ottoman/index.ts';
import { peopleCatalogs as d, peopleManifest as dm } from '../../src/people/global/index.ts';
import { peopleCatalogs as e, peopleManifest as em } from '../../src/people/broad/index.ts';
const reader = async (_index, pack) => readFile(`assets/history/${pack.sha256}.atlas`, 'utf8');
test('real application preserves Atatürk, political context and old providers while exposing all 3203 people and 1120 events', async () => {
  const extension = [
    [a, am],
    [b, bm],
    [c, cm],
    [d, dm],
    [e, em],
  ]
    .map(([p, m]) => createPeopleExtension(p, m))
    .reduce(combinePeopleExtensions);
  const app = createApplicationData(
    {
      provider: pilotProvider,
      timeline: pilotTimeline,
      search: pilotSearch,
      catalog: preparedPilot,
    },
    createWorldRepository(worldManifest, async () => {
      throw Error('NO_WORLD_GEOMETRY_REQUEST_EXPECTED');
    }),
    extension,
    archive,
  );
  assert.equal((await app.persons.search('')).total, 3203);
  assert.equal(
    (
      await app.provider.query({
        startYear: -10000,
        endYear: 10000,
        kinds: ['event'],
        includeUncertain: true,
        limit: 1,
      })
    ).total,
    1120,
  );
  assert.equal(app.search.search('Aziz Sancar').records[0].wikidataId, 'Q15118973');
  const ataturk = app.search.search('Atatürk').records.find((r) => r.wikidataId === 'Q5152');
  assert.ok(ataturk);
  const detail = await app.persons.detail(ataturk.id, 1881);
  assert.ok(detail.supportedIds.length);
  const context = await app.politics.context(2024);
  assert.ok(context.entities.size > 150);
  const card = await app.sources.detail([archive.rowForQid('Q15118973').id]);
  assert.ok(card.rows.every((r) => r.matched));
});
const archive = createHistoryRepository(historyManifest, reader);
const timeline = withHistoryTimeline(pilotTimeline, archive),
  provider = withHistoryProvider(pilotProvider, archive);
const search = withHistorySearch(pilotSearch, timeline, archive),
  persons = withHistoryPersons(
    createPersonRepository(pilotProvider, pilotTimeline),
    timeline,
    archive,
  );
const events = createEventRepository(provider, timeline),
  sources = createSourceRepository(provider, [], archive.rawInput);

test('downloaded history release validates every normalized chunk, licensed source, explicit sitelink and unchanged cache cap', async () => {
  const result = await checkHistory();
  assert.deepEqual(
    [result.people, result.events, result.birthPoints, result.geometries, result.packs],
    [2969, 1084, 46, 81, 338],
  );
  assert.equal(historyManifest.counts.downloaded, 4273);
  assert.equal(historyManifest.counts.skipped, 220);
  assert.ok(result.cache.cachedPacks <= 8);
  assert.ok(
    historyManifest.skipped.some(
      (r) => r.qid === 'Q11602081' && r.reason === 'fictional-or-legendary-manual-review',
    ),
  );
  assert.ok(
    historyManifest.skipped.some(
      (r) => r.qid === 'Q1037458' && r.reason === 'fictional-or-legendary-manual-review',
    ),
  );
});

// All time/receipt payloads in these unit cases are SYNTHETIC TEST ONLY.
const time = (year, patch = {}, qualifiers = {}) => ({
  id: 'Q1$SYNTHETIC-TEST',
  rank: 'normal',
  mainsnak: {
    snaktype: 'value',
    datavalue: {
      value: {
        time: `${year < 0 ? '-' : '+'}${String(Math.abs(year)).padStart(4, '0')}-01-01T00:00:00Z`,
        precision: 9,
        before: 0,
        after: 0,
        calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
        ...patch,
      },
    },
  },
  references: [{ hash: 'SYNTHETIC-TEST-REFERENCE' }],
  qualifiers,
});
test('Wikidata JSON BCE years stay historical without zero; low precision, qualifiers, conflicting claims and calendars never invent an exact date', () => {
  for (const year of [-2000, -2, -1, 1, 2, 1881]) {
    const t = sourceTime([time(year)]);
    assert.equal(t.start.date.year, year);
    assert.equal(t.start.date.day, null);
  }
  assert.equal(sourceTime([time(0)]).start.kind, 'unknown');
  assert.equal(
    sourceTime([time(1900, { time: '+1900-02-29T00:00:00Z', precision: 11 })]).start.kind,
    'unknown',
  );
  assert.equal(
    sourceTime([time(2000, { time: '+2000-02-29T00:00:00Z', precision: 11 })]).start.date.year,
    2000,
  );
  for (const value of [
    sourceTime([time(1600, { precision: 7 })]),
    sourceTime([time(1600, { before: 1 })]),
    sourceTime([time(1600, {}, { P1480: [{ datavalue: { value: { id: 'Q5727902' } } }] })]),
    sourceTime([time(1600), time(1601)]),
  ])
    assert.equal(value.start.kind, 'unknown');
  assert.equal(
    sourceTime([time(1600, { calendarmodel: 'http://www.wikidata.org/entity/Q1985786' })])
      .uncertain,
    true,
  );
  assert.match(sourceTime([time(1600, {}, { P1480: [] })]).sourceDate.text, /P1480/);
  const entity = {
    id: 'Q1',
    lastrevid: 123,
    labels: { en: { value: 'SYNTHETIC TEST ONLY' } },
    descriptions: { en: { value: 'fictional war, SYNTHETIC TEST ONLY' } },
    claims: { P31: [] },
  };
  assert.equal(
    normalizeEntity(entity, {}, ['wars']).reason,
    'fictional-or-legendary-manual-review',
  );
  const receipt = { fetchedAt: '2026-10-21T00:00:00.000Z', bytes: 1, sha256: '0'.repeat(64) };
  for (const [qid, type] of [
    ['Q178561', 'BATTLE'],
    ['Q198', 'WAR'],
    ['Q131569', 'TREATY'],
  ]) {
    const sample = {
      ...entity,
      descriptions: { en: { value: 'SYNTHETIC TEST ONLY' } },
      claims: { P31: [{ rank: 'normal', mainsnak: { datavalue: { value: { id: qid } } } }] },
    };
    assert.equal(normalizeEntity(sample, receipt, ['events']).record.eventType, type);
  }
});
test('input receipts reject altered bytes, missing rights, changed origins and request identity without deleting source files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-history-receipt-'));
  try {
    const path = join(root, 'synthetic.json'),
      text = JSON.stringify({ label: 'SYNTHETIC TEST ONLY' }),
      digest = createHash('sha256').update(text).digest('hex');
    const receipt = {
      bytes: Buffer.byteLength(text),
      sha256: digest,
      licenseId: 'CC0-1.0',
      productionApproved: false,
      url: 'https://www.wikidata.org/w/api.php',
      requestHash: 'test',
      fetchedAt: '2026-10-21T00:00:00.000Z',
    };
    await writeFile(path, text);
    await writeFile(join(root, 'synthetic.receipt.json'), JSON.stringify(receipt));
    assert.equal((await checkedRaw(path, receipt.url, 'test')).value.label, 'SYNTHETIC TEST ONLY');
    for (const patch of [
      { licenseId: 'UNKNOWN' },
      { productionApproved: true },
      { url: 'https://evil.invalid/' },
      { sha256: '0'.repeat(64) },
    ]) {
      await writeFile(
        join(root, 'synthetic.receipt.json'),
        JSON.stringify({ ...receipt, ...patch }),
      );
      await assert.rejects(checkedRaw(path, receipt.url, 'test'), /HISTORY_RAW_RECEIPT/);
      assert.equal(await readFile(path, 'utf8'), text);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('manifest pin and runtime rights checks reject changed indexes, corrupt assets and forged output hashes', async () => {
  const changed = structuredClone(historyManifest);
  changed.rows[0].name += ' TEST';
  assert.throws(() => assertHistoryManifest(changed), /HISTORY_MANIFEST_REVIEW/);
  const text = await reader(0, historyManifest.packs[0]);
  assert.throws(() => validateHistoryPack(text + ' ', 0, historyManifest), /HISTORY_PACK_HASH/);
  const value = JSON.parse(text);
  value.sources[0].licenseId = 'UNKNOWN';
  const forged = JSON.stringify(value),
    manifest = structuredClone(historyManifest);
  manifest.packs[0] = {
    ...manifest.packs[0],
    sha256: sha256(forged),
    bytes: Buffer.byteLength(forged),
  };
  assert.throws(() => validateHistoryPack(forged, 0, manifest), /HISTORY_PACK_RIGHTS/);
});
test('manifest-only local search loads no assets, supports Turkish aliases and reaches all pages beyond the legacy 1000-record index', async () => {
  let reads = 0;
  const repo = createHistoryRepository(historyManifest, async (...args) => {
    reads++;
    return reader(...args);
  });
  const indexed = withHistorySearch(pilotSearch, withHistoryTimeline(pilotTimeline, repo), repo);
  for (const term of ['Aziz Sancar', 'Svante Paabo']) assert.equal(indexed.search(term).total, 1);
  assert.ok(search.search('nobel').total >= 948);
  assert.equal(reads, 0);
  assert.equal(indexed.search('').total, pilotSearch.entries.length + 4053);
  assert.ok(indexed.search('', 4000).records.length > 0);
  assert.equal(reads, 0);
  assert.equal(indexed.search('Aziz Sancar').records[0].record, null);
  assert.ok(
    (await persons.search('Aziz Sancar')).records.some((p) => p.wikidataId === 'Q15118973'),
  );
  const result = await provider.query({
    startYear: -10000,
    endYear: 10000,
    kinds: ['person'],
    includeUncertain: true,
    limit: 3,
    offset: 2900,
  });
  assert.equal(result.total, 2980);
  assert.equal(result.hits.length, 3);
});
test('archive detail exposes exact source revisions, raw checksum and existing TR/EN Wikipedia links without network lookup', async () => {
  const row = archive.rowForQid('Q15118973');
  assert.ok(row);
  const detail = await persons.detail(row.id, 2024);
  assert.equal(detail.person.wikidataId, 'Q15118973');
  const source = await sources.detail([row.id]);
  assert.ok(source.rows.length);
  assert.ok(source.rows.every((r) => r.matched));
  const snapshot = await archive.sitelink(row.qid, new AbortController().signal),
    link = createSitelinkResolver('test-history', [snapshot]).resolve(row.qid);
  assert.equal(link.kind, 'trwiki');
  assert.equal(link.url, 'https://tr.wikipedia.org/wiki/Aziz_Sancar');
  assert.ok(source.rows[0].source.url.includes(`oldid=${snapshot.revision}`));
  const unlocated = archive.rows.find((r) => r.kind === 'person' && !r.geometry);
  const noPoint = await persons.detail(unlocated.id, 2024);
  assert.deepEqual(noPoint.locations, []);
  assert.deepEqual(noPoint.supportedIds, []);
});
test('all 46 imported births render only in their approved year and preserve source/place evidence and uncertainty', async () => {
  for (const row of archive.rows.filter((r) => r.geometryYear !== null)) {
    const { engine } = await archive.load(row.pack),
      load = createHistoricalFeatureLoader(engine),
      id = row.id + '-birth';
    const view = {
      year: row.geometryYear,
      polity: false,
      culture: false,
      person: true,
      battle: false,
      event: false,
      labels: false,
      includeApproximatePersons: true,
    };
    assert.ok(
      (await load(view, 4)).features.some((f) => f.id === id),
      row.name,
    );
    for (const year of [row.geometryYear - 1, row.geometryYear + 1])
      if (year !== 0)
        assert.ok(!(await load({ ...view, year }, 4)).features.some((f) => f.id === id), row.name);
    assert.ok(
      !(await load({ ...view, includeApproximatePersons: false }, 4)).features.some(
        (f) => f.id === id,
      ),
    );
    const detail = await persons.detail(id, row.geometryYear);
    assert.ok(detail.supportedIds.includes(id));
    const source = await sources.detail([id]);
    assert.equal(source.rows.length, 2);
    assert.ok(source.rows.every((r) => r.matched));
  }
});
test('public timeline preserves requested year, opt-in approximate points, layer independence and unknown war locations', async () => {
  const row = archive.rows.find((r) => r.geometryYear !== null),
    year = row.geometryYear;
  const report = await timeline.getDataCoverage(year, {
    layers: ['person'],
    includeApproximatePersons: true,
  });
  assert.equal(report.selectedYear, year);
  assert.equal(report.isPreview, false);
  assert.ok(report.records.some((h) => h.record.id === row.id + '-birth'));
  const hidden = await timeline.getDataCoverage(year, {
    layers: ['event'],
    includeApproximatePersons: true,
  });
  assert.ok(!hidden.records.some((h) => h.record.id === row.id + '-birth'));
  const war = archive.rows.find(
    (r) => r.group === 'war' && r.activeStart !== null && r.activeEnd > r.activeStart,
  );
  const detail = await events.detail(war.id, war.activeStart);
  assert.equal(detail.supported, true);
  assert.equal(detail.mapSupported, false);
  assert.equal(detail.record.geometry, null);
  assert.ok(
    !(await events.atYear(war.activeStart, { battle: false, event: true })).records.some(
      (h) => h.record.id === war.id,
    ),
  );
});
test('archive cache stays at eight packs, limits actual reads to two and rejects late results after cancellation/clear', async () => {
  let active = 0,
    max = 0;
  const repo = createHistoryRepository(historyManifest, async (...args) => {
    active++;
    max = Math.max(max, active);
    try {
      return await reader(...args);
    } finally {
      active--;
    }
  });
  await Promise.all(Array.from({ length: 14 }, (_, index) => repo.load(index)));
  assert.ok(max <= 2);
  assert.equal(repo.stats().cachedPacks, 8);
  let release, started;
  const began = new Promise((resolve) => {
    started = resolve;
  });
  const late = createHistoryRepository(historyManifest, async () => {
    started();
    return await new Promise((resolve) => {
      release = resolve;
    });
  });
  const controller = new AbortController(),
    pending = late.load(0, controller.signal);
  await began;
  controller.abort();
  late.clear();
  release(await reader(0, historyManifest.packs[0]));
  await assert.rejects(pending, /HISTORY_STALE_OR_ABORT/);
  assert.equal(late.stats().cachedPacks, 0);
  assert.equal(late.stats().active, 0);
});
