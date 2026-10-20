import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildBroad } from '../../scripts/people/broad.mjs';
import {
  collectHistory,
  discoveryQuery,
  discoveredIds,
  groups,
} from '../../scripts/history/collect.mjs';
import { peopleCatalogs, peopleManifest } from '../../src/people/broad/index.ts';
import { createPeopleExtension, combinePeopleExtensions } from '../../src/people/extension.ts';
import {
  pilotProvider,
  pilotTimeline,
  pilotSearch,
  createHistoricalFeatureLoader,
} from '../../src/data/pilot.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createEventRepository } from '../../src/events/repository.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import { eventHasMapEvidence } from '../../src/events/model.ts';
import { sourceLinks } from '../../src/sources/catalog.ts';
import {
  peopleCatalogs as initial,
  peopleManifest as initialManifest,
} from '../../src/people/generated/index.ts';
import {
  peopleCatalogs as expanded,
  peopleManifest as expandedManifest,
} from '../../src/people/expanded/index.ts';
import {
  peopleCatalogs as ottoman,
  peopleManifest as ottomanManifest,
} from '../../src/people/ottoman/index.ts';
import {
  peopleCatalogs as globalCatalogs,
  peopleManifest as globalManifest,
} from '../../src/people/global/index.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { createApplicationData } from '../../src/data/application-core.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';

const extension = createPeopleExtension(peopleCatalogs, peopleManifest);
const provider = extension.withProvider(pilotProvider),
  timeline = createTimelineEngine(provider);
const persons = createPersonRepository(provider, timeline),
  events = createEventRepository(provider, timeline);
const records = extension.records;
const event = (qid) => records.find((r) => r.kind === 'event' && r.wikidataId === qid);

test('complete application composes five source releases without duplicate identities or exceeding search/timeline quotas', async () => {
  const merged = [
    [initial, initialManifest],
    [expanded, expandedManifest],
    [ottoman, ottomanManifest],
    [globalCatalogs, globalManifest],
    [peopleCatalogs, peopleManifest],
  ]
    .map(([packs, manifest]) => createPeopleExtension(packs, manifest))
    .reduce(combinePeopleExtensions);
  assert.equal(merged.records.length, 710);
  const app = createApplicationData(
    {
      provider: pilotProvider,
      timeline: pilotTimeline,
      search: pilotSearch,
      catalog: preparedPilot,
    },
    createWorldRepository(worldManifest, async () => {
      throw Error('NO_GEOMETRY_DOWNLOAD_EXPECTED');
    }),
    merged,
  );
  for (const [query, qid, group] of [
    ['Richard Feynman', 'Q39246', 'person'],
    ['Orhan Pamuk', 'Q241248', 'person'],
    ['Waterloo', 'Q48314', 'war'],
    ['Kore Savaşı', 'Q8663', 'war'],
  ]) {
    const result = app.search.search(query).records.filter((r) => r.wikidataId === qid);
    assert.equal(result.length, 1, query);
    assert.equal(result[0].group, group);
  }
  const personRows = await app.provider.query({
    kinds: ['person'],
    startYear: -10000,
    endYear: 10000,
    includeUncertain: true,
    includeBiographical: true,
    limit: 100,
  });
  assert.equal(personRows.total, 234);
  const eventRows = await app.provider.query({
    kinds: ['event'],
    startYear: -2000,
    endYear: 2026,
    includeUncertain: true,
    includeBiographical: true,
    limit: 100,
  });
  assert.equal(eventRows.total, 36);
  const ataturk = merged.records.find((r) => r.kind === 'person' && r.wikidataId === 'Q5152');
  assert.ok(ataturk);
  assert.ok(await app.persons.detail(ataturk.id, 1881));
});

test('broad release deterministically publishes 56 distinct reviewed people and 23 events within unchanged budgets', async () => {
  assert.deepEqual((await buildBroad()).packs, peopleCatalogs);
  assert.equal(peopleManifest.published, 56);
  assert.equal(peopleManifest.annualBirths, 36);
  assert.equal(peopleManifest.biographicalOnly, 10);
  assert.equal(peopleManifest.selected.filter((p) => !p.geometryAvailable).length, 10);
  assert.deepEqual(
    peopleManifest.pending.map((p) => p.wikidataId),
    ['Q9364'],
  );
  const people = records.filter((r) => r.kind === 'person'),
    eventRecords = records.filter((r) => r.kind === 'event');
  assert.equal(new Set(people.map((r) => r.wikidataId)).size, 56);
  assert.equal(eventRecords.length, 23);
  assert.equal(eventRecords.filter(eventHasMapEvidence).length, 7);
  for (const r of [...people, ...eventRecords]) {
    assert.equal(r.synthetic, false);
    assert.equal(r.licenseId, 'CC0-1.0');
    assert.equal(sourceLinks.resolve(r.wikidataId).kind, 'trwiki', r.wikidataId);
    for (const e of r.evidence) {
      const source = await provider.getSource(e.sourceId);
      assert.ok(source?.url.endsWith(`&oldid=${e.sourceRevision}`));
      assert.equal(source.licenseScope, 'data');
    }
  }
  const changed = structuredClone(peopleCatalogs);
  changed[0].records[0].licenseId = 'UNKNOWN';
  assert.throws(() => createPeopleExtension(changed, peopleManifest), /PEOPLE_PACK_INTEGRITY/);
  assert.throws(
    () =>
      createPeopleExtension(peopleCatalogs, {
        ...peopleManifest,
        inputs: { ...peopleManifest.inputs, decisions: '0'.repeat(64) },
      }),
    /PEOPLE_REVIEW_REQUIRED/,
  );
});
test('year-qualified birth points and uncertain biographies stay separate in the expanded content', async () => {
  const feynman = records.find((r) => r.kind === 'person' && r.wikidataId === 'Q39246');
  const birth = records.find((r) => r.kind === 'person-location' && r.personId === feynman.id);
  assert.equal(birth.temporal.start.date.year, 1918);
  assert.ok(
    (await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1918, true)).some(
      (r) => r.location.id === birth.id,
    ),
  );
  assert.ok(
    !(await persons.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1919, true)).some(
      (r) => r.location.id === birth.id,
    ),
  );
  for (const qid of ['Q10261', 'Q9397', 'Q989', 'Q6279']) {
    const person = records.find((r) => r.kind === 'person' && r.wikidataId === qid);
    assert.ok(person, qid);
    const locations = records.filter(
      (r) => r.kind === 'person-location' && r.personId === person.id,
    );
    assert.ok(locations.every((l) => l.locationType === 'biographical'));
    assert.equal(peopleManifest.selected.find((p) => p.qid === qid).annualBirth, false);
  }
  assert.ok(!records.some((r) => r.wikidataId === 'Q9364'));
});
test('event dates use reviewed statements rather than image, reference or entry-into-force qualifiers', async () => {
  for (const [qid, start, end] of [
    ['Q33132', 1863, 1863],
    ['Q74623', 1683, 1699],
    ['Q2487', 1618, 1648],
    ['Q8736', 1919, 1919],
    ['Q6271', -218, -201],
  ]) {
    const e = event(qid);
    assert.equal(e.temporal.start.date.year, start);
    assert.equal(e.temporal.end.date.year, end);
    assert.equal(e.temporal.precision, 'year');
    assert.equal(e.temporal.start.date.day, null);
    assert.equal((await events.detail(e.id, start)).supported, true);
    assert.equal((await events.detail(e.id, end + 1)).supported, false);
  }
  assert.equal(event('Q12551').details.alternativeDates[0].temporal.end.date.year, 1455);
  assert.equal(event('Q12551').temporal.end.date.year, 1453);
  assert.match(event('Q8663').details.description[0].value, /kalıcı barış/);
  assert.notEqual(event('Q192769').id, event('Q40949').id);
});
test('wars without reviewed geometry remain in year lists and cannot acquire a fabricated centroid', async () => {
  const korea = event('Q8663'),
    versailles = event('Q8736');
  assert.equal(korea.geometry, null);
  assert.equal(korea.locationSemantics, 'unknown');
  assert.equal((await events.detail(korea.id, 1951)).mapSupported, false);
  assert.ok(
    (await events.atYear(1951, { battle: true, event: false })).records.some(
      (h) => h.record.id === korea.id,
    ),
  );
  assert.ok(
    !(await events.atYear(1951, { battle: false, event: true })).records.some(
      (h) => h.record.id === korea.id,
    ),
  );
  assert.ok(
    (await events.atYear(1919, { battle: false, event: true })).records.some(
      (h) => h.record.id === versailles.id,
    ),
  );
  const load = createHistoricalFeatureLoader(timeline);
  const features = await load(
    {
      year: 1815,
      polity: false,
      culture: false,
      person: false,
      battle: true,
      event: false,
      labels: false,
    },
    4,
  );
  assert.ok(features.features.some((f) => f.id === event('Q48314').id));
  assert.ok(!features.features.some((f) => f.id === event('Q78994').id));
});

// Explicitly synthetic API responses for collector tests; never production inputs.
const userAgent = 'TarihAtlasi/test (https://example.invalid/SYNTHETIC-TEST-ONLY)';
const queryBody = (ids) => ({
  results: {
    bindings: ids.map((id) => ({
      item: { type: 'uri', value: `http://www.wikidata.org/entity/${id}` },
    })),
  },
});
const jsonResponse = (v, init) => new Response(JSON.stringify(v), init);
async function temporary(run) {
  const root = await mkdtemp(join(tmpdir(), 'atlas-history-'));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
test('history discovery is bounded, deterministic and rejects injected IDs, ambiguous results and unsorted pages', () => {
  for (const group of Object.keys(groups))
    assert.match(discoveryQuery(group, 'Q123', 50), /ORDER BY STR\(\?item\) LIMIT 50$/);
  assert.match(discoveryQuery('nobel'), /Q38104/);
  assert.match(discoveryQuery('time'), /Q207826/);
  for (const args of [
    ['unknown'],
    ['people', 'Q1) } UNION {'],
    ['wars', null, 0],
    ['wars', null, 101],
  ])
    assert.throws(() => discoveryQuery(...args), /HISTORY_QUERY_BUDGET/);
  for (const ids of [['Q2', 'Q1'], ['Q1', 'Q1'], ['Q0']])
    assert.throws(() => discoveredIds(queryBody(ids)), /HISTORY_QUERY_IDS/);
  assert.throws(() => discoveredIds({}), /HISTORY_QUERY_SCHEMA/);
});
test('history staging retains original qualifiers and checksum receipts, reuses cache and rejects corruption', async () =>
  temporary(async (root) => {
    const original = {
      entities: {
        Q1: {
          id: 'Q1',
          lastrevid: 123,
          labels: { en: { value: 'SYNTHETIC TEST' } },
          claims: {
            P569: [
              {
                id: 'Q1$TEST',
                rank: 'normal',
                qualifiers: { P1480: [{ snaktype: 'value' }] },
                references: [{ hash: 'test' }],
              },
            ],
          },
        },
      },
    };
    let calls = 0;
    const fetcher = async (url, options) => {
      calls++;
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers['User-Agent'], userAgent);
      return jsonResponse(String(url).includes('sparql') ? queryBody(['Q1']) : original);
    };
    const result = await collectHistory({
      root,
      userAgent,
      limit: 1,
      fetcher,
      wait: async () => {},
    });
    assert.equal(result.records, 1);
    assert.equal(result.productionApproved, false);
    assert.equal(calls, 2);
    assert.deepEqual(JSON.parse(await readFile(join(root, 'entity-Q1.json'), 'utf8')), original);
    const receipt = JSON.parse(await readFile(join(root, 'entity-Q1.receipt.json'), 'utf8'));
    assert.equal(receipt.productionApproved, false);
    assert.equal(receipt.licenseId, 'CC0-1.0');
    assert.equal(
      (
        await collectHistory({
          root,
          userAgent,
          limit: 1,
          fetcher: () => {
            throw Error('NETWORK_MUST_NOT_RUN');
          },
          wait: async () => {},
        })
      ).records,
      1,
    );
    await writeFile(join(root, 'entity-Q1.json'), '{}');
    await assert.rejects(
      collectHistory({ root, userAgent, limit: 1, fetcher, wait: async () => {} }),
      /HISTORY_CACHE_CORRUPT/,
    );
  }));
test('history collector backs off bounded transient failures and refuses long Retry-After, API errors and identity substitution', async () =>
  temporary(async (root) => {
    let calls = 0;
    const sleeps = [];
    const fetcher = async (url) => {
      calls++;
      if (calls === 1) return new Response('', { status: 429, headers: { 'retry-after': '2' } });
      if (String(url).includes('sparql')) return jsonResponse(queryBody(['Q1']));
      if (calls === 3) return jsonResponse({ error: { code: 'maxlag' } });
      return jsonResponse({ entities: { Q1: { id: 'Q1', lastrevid: 1 } } });
    };
    assert.equal(
      (
        await collectHistory({
          root,
          userAgent,
          limit: 1,
          fetcher,
          wait: async (ms) => sleeps.push(ms),
        })
      ).records,
      1,
    );
    assert.ok(sleeps.includes(2000));
    assert.equal(calls, 4);
    for (const [suffix, response, error] of [
      [
        'long',
        () => new Response('', { status: 429, headers: { 'retry-after': '120' } }),
        /HISTORY_RETRY_LATER/,
      ],
      [
        'identity',
        (url) =>
          jsonResponse(
            String(url).includes('sparql')
              ? queryBody(['Q1'])
              : { entities: { Q2: { id: 'Q2', lastrevid: 1 } } },
          ),
        /HISTORY_ENTITY_IDENTITY/,
      ],
      ['api', () => jsonResponse({ error: { code: 'badvalue' } }), /HISTORY_API_ERROR/],
      ['budget', () => jsonResponse(queryBody(['Q1', 'Q2'])), /HISTORY_PAGE_BUDGET/],
    ]) {
      await assert.rejects(
        collectHistory({
          root: join(root, suffix),
          userAgent,
          limit: 1,
          fetcher: response,
          wait: async () => {},
        }),
        error,
      );
    }
    await assert.rejects(
      collectHistory({ root, userAgent: 'generic-bot', limit: 1 }),
      /WIKIDATA_USER_AGENT/,
    );
    await assert.rejects(
      collectHistory({ root, userAgent, limit: 10001 }),
      /HISTORY_COLLECT_BUDGET/,
    );
  }));
