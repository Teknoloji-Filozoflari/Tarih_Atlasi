import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Buffer } from 'node:buffer';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fixtureCatalog, simulateReviewed, extent } from '../fixtures/historical.mjs';
import { validateCatalog } from '../../src/domain/validate.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { timelineFrameLoader } from '../../src/timeline/frame.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import {
  personLocationLevel,
  personDescription,
  personName,
  personLocationDates,
} from '../../src/persons/model.ts';
import { clusterPersonPoints, facingGlobe } from '../../src/persons/clustering.ts';
import { historicalFeatures, pilotPersons, getPilotRecord } from '../../src/data/pilot.ts';
import { preparedPilot, pilotManifest } from '../../src/data/generated/pilot.ts';
import { fetchPersonEntity, personCandidates } from '../../scripts/etl/wikidata-persons.mjs';
import { inspectCatalog, sha256 } from '../../scripts/etl/pipeline.mjs';
import { parseMessage } from '../../src/map-contract/protocol.ts';

function personFixture() {
  const catalog = simulateReviewed(fixtureCatalog());
  for (const record of [...catalog.sources, ...catalog.records])
    record.temporal = {
      ...record.temporal,
      uncertain: false,
      support: { kind: 'continuous', note: 'SYNTHETIC TEST support only' },
    };
  const location = catalog.records.find((r) => r.id === 'test:presence');
  location.temporal = {
    ...location.temporal,
    start: { kind: 'known', date: { year: 1, month: null, day: null } },
    end: { kind: 'known', date: { year: 1, month: null, day: null } },
    support: { kind: 'snapshot', note: 'SYNTHETIC TEST dated event only' },
  };
  location.confidence.level = 'high';
  const provider = createHistoricalDataProvider(catalog),
    timeline = createTimelineEngine(provider);
  return {
    catalog,
    location,
    provider,
    timeline,
    repo: createPersonRepository(provider, timeline),
  };
}
function rejected(catalog, code) {
  const result = validateCatalog(catalog);
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some((i) => i.code === code),
    JSON.stringify(result.issues),
  );
}
const rawEntity = () => ({
  entities: {
    Q1: {
      id: 'Q1',
      lastrevid: 123,
      labels: { en: { language: 'en', value: 'SYNTHETIC PERSON' } },
      claims: {
        P19: [
          {
            id: 'Q1$synthetic',
            rank: 'normal',
            mainsnak: { datavalue: { value: { id: 'Q2' } } },
            references: [{ hash: 'SYNTHETIC' }],
          },
        ],
        P551: [
          {
            id: 'Q1$dated-synthetic',
            qualifiers: {
              P580: [
                {
                  datavalue: {
                    value: {
                      time: '+0001-00-00T00:00:00Z',
                      precision: 9,
                      calendarmodel: 'SYNTHETIC',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      sitelinks: {},
    },
  },
});
const userAgent = 'TarihAtlasi/0.1 (https://example.invalid/synthetic-test)';

test('kişi yaşam sorgusu ile kaynaklı yıllık konum sorgusu birbirini ima etmez', async () => {
  const { repo } = personFixture();
  for (const year of [-2, -1, 1, 2])
    assert.equal((await repo.PERSON_ALIVE_AT_YEAR(year)).length, 1);
  for (const year of [-2, -1, 2])
    assert.equal((await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year)).length, 0);
  assert.equal((await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1)).length, 1);
  assert.equal((await repo.PERSON_ALIVE_AT_YEAR(3)).length, 0);
  await assert.rejects(repo.PERSON_ALIVE_AT_YEAR(0));
});
test('genel doğum/ölüm/ikamet/faaliyet bilgisi yıllık bulunma kaydı olmaz', async () => {
  for (const relationshipType of [
    'BIRTH',
    'DEATH',
    'RESIDENCE',
    'WORK',
    'REIGN',
    'DOCUMENTED_EVENT',
  ]) {
    const { catalog, location } = personFixture();
    location.locationType = 'biographical';
    location.relationship = 'associated';
    location.relationshipType = relationshipType;
    location.temporal = {
      ...extent(),
      start: { kind: 'unknown', date: null },
      end: { kind: 'unknown', date: null },
      reviewStatus: 'verified',
    };
    const repo = createPersonRepository(createHistoricalDataProvider(catalog));
    assert.equal((await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1, true)).length, 0);
    assert.equal(personLocationLevel(location), 'biographical');
    assert.ok((await repo.detail('test:person', 1)).locations.some((r) => r.id === location.id));
  }
});
test('yaklaşık/orta güvenli konum açık tercih ister; düşük/bilinmeyen güven haritaya girmez', async () => {
  for (const level of ['medium', 'low', 'unknown']) {
    const { catalog, location } = personFixture();
    location.confidence.level = level;
    const repo = createPersonRepository(createHistoricalDataProvider(catalog));
    assert.equal((await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1)).length, 0);
    assert.equal(
      (await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1, true)).length,
      level === 'medium' ? 1 : 0,
    );
  }
  const { location } = personFixture();
  location.temporal.uncertain = true;
  assert.equal(personLocationLevel(location), 'approximate');
});
test('kişi konum zaman ve yer kanıtı aynı locator içinde olmalı; doğum yılıyla yer birleştirilemez', () => {
  const { catalog, location } = personFixture();
  location.evidence = [
    { ...location.evidence[0], claims: ['identity', 'location'] },
    { ...location.evidence[0], locator: 'SYNTHETIC independent life date', claims: ['temporal'] },
  ];
  rejected(catalog, 'TIMED_PRESENCE_EVIDENCE');
});
test('krallık/bölge merkezi kişi noktasına dönüştürülemez; şehir yalnız temsilî/isteğe bağlıdır', () => {
  for (const scale of ['kingdom', 'region', 'unknown']) {
    const { catalog, location } = personFixture();
    location.spatialContext.scale = scale;
    rejected(catalog, 'PERSON_AREA_AS_POINT');
  }
  const { location } = personFixture();
  location.spatialContext = {
    scale: 'city',
    coordinateRole: 'representative-place',
    description: 'SYNTHETIC city anchor, not person GPS',
  };
  assert.equal(personLocationLevel(location), 'approximate');
});
test('yaşam dışındaki konum reddedilir; doğum yerini tüm yaşama yayma da reddedilir', () => {
  let { catalog, location } = personFixture();
  location.temporal.end.date.year = 3;
  location.temporal.support.kind = 'continuous';
  rejected(catalog, 'PERSON_DATE_CONFLICT');
  ({ catalog, location } = personFixture());
  location.relationshipType = 'BIRTH';
  location.temporal.support.kind = 'continuous';
  rejected(catalog, 'PERSON_LIFE_EVENT_LOCATION');
});
test('bilinmeyen yaşam veya tarihsiz bulunma kesin konum yaratmaz', async () => {
  const { catalog, location } = personFixture();
  location.temporal.start = { kind: 'unknown', date: null };
  location.temporal.uncertain = true;
  delete location.temporal.support;
  rejected(catalog, 'TIMED_PRESENCE_DATE');
  const fixed = personFixture();
  fixed.catalog.records.find((r) => r.kind === 'person').temporal.start = {
    kind: 'unknown',
    date: null,
  };
  fixed.catalog.records.find((r) => r.kind === 'person').temporal.uncertain = true;
  delete fixed.catalog.records.find((r) => r.kind === 'person').temporal.support;
  const repo = createPersonRepository(createHistoricalDataProvider(fixed.catalog, 'staging'));
  assert.equal((await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1, true)).length, 0);
});
test('koordinatsız kaynaklı yer ilişkisi otomatik yer centroidinden marker üretmez', async () => {
  const { catalog, location } = personFixture();
  location.geometry = null;
  location.geometryReason = 'SYNTHETIC: place only, not point evidence';
  const provider = createHistoricalDataProvider(catalog);
  const repo = createPersonRepository(provider);
  assert.equal((await repo.PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(1, true)).length, 0);
  assert.equal(
    (
      await createTimelineEngine(provider).getDataCoverage(1, {
        layers: ['person'],
        includeApproximatePersons: true,
      })
    ).records.length,
    0,
  );
});
test('konumsuz kişi araması yaşam filtresinden bağımsız, sınırlı ve alternatif adlarla çalışır', async () => {
  const { catalog } = personFixture();
  catalog.records = catalog.records.filter((r) => r.kind !== 'person-location');
  const person = catalog.records.find((r) => r.kind === 'person');
  person.alternativeNames = [{ language: 'tr', value: 'İstanbul SENTETİK' }];
  const repo = createPersonRepository(createHistoricalDataProvider(catalog));
  assert.equal((await repo.search('istanbul')).total, 1);
  assert.equal((await repo.detail(person.id, 2026)).supportedIds.length, 0);
  assert.equal((await repo.search('zzz')).total, 0);
  await assert.rejects(repo.search('x'.repeat(301)));
  await assert.rejects(repo.search('', -1));
});
test('çoklu konumlar aynı kişi kimliğini korur, yıl çerçevesine atomik girer ve kamera bilgisi üretmez', async () => {
  const { catalog, location } = personFixture();
  catalog.records.push({
    ...structuredClone(location),
    id: 'test:second-presence',
    geometry: { type: 'Point', coordinates: [2, 2] },
  });
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  const frame = await timelineFrameLoader(engine)(1, {
    layers: ['person'],
    preview: false,
    signal: new AbortController().signal,
  });
  assert.equal(frame.coverage.records.length, 2);
  assert.equal(frame.persons.length, 1);
  assert.equal(frame.persons[0].locations.length, 2);
  assert.ok(frame.coverage.records.every((h) => h.record.personId === 'test:person'));
  assert.equal('camera' in frame, false);
  assert.equal((await engine.getDataCoverage(2, { layers: ['person'] })).records.length, 0);
});
test('kişi profili/atıf/lisans üretim kapısında zorunlu; P18 medyası ayrı hak onayı ister', () => {
  for (const mutation of ['profile', 'attribution', 'license']) {
    const { catalog } = personFixture();
    const person = catalog.records.find((r) => r.kind === 'person');
    if (mutation === 'profile') delete person.profile;
    else if (mutation === 'attribution') person.attribution = '';
    else person.licenseId = 'unapproved';
    assert.equal(validateCatalog(catalog).ok, false);
  }
  const { catalog } = personFixture();
  catalog.records.find((r) => r.kind === 'person').profile.image = {
    sourceUrl: 'https://example.invalid/synthetic.jpg',
    licenseId: 'CC0-1.0',
    attribution: 'SYNTHETIC',
    reviewStatus: 'verified',
  };
  rejected(catalog, 'PERSON_MEDIA_RIGHTS');
});
test('kişi doğum/ölüm hassasiyeti ve kanonik validFrom/validTo korunur', () => {
  const { catalog, location } = personFixture();
  const person = catalog.records.find((r) => r.kind === 'person');
  person.profile.birth.start.date.year = -1;
  person.profile.birth.end.date.year = -1;
  rejected(catalog, 'PERSON_LIFE_CONFLICT');
  const projected = personLocationDates(location);
  assert.equal(projected.validFrom.date.year, 1);
  assert.equal(projected.precision, 'year');
});
test('Türkçe metin tercih edilir; kaynak dili korunan fallback makine çevirisi üretmez', () => {
  const { catalog } = personFixture();
  const person = catalog.records.find((r) => r.kind === 'person');
  person.names = [{ language: 'en', value: 'SYNTHETIC original name' }];
  person.profile.descriptions = [{ language: 'en', value: 'SYNTHETIC source text' }];
  assert.equal(personName(person).fallback, true);
  assert.equal(personDescription(person).language, 'en');
  person.profile.descriptions.push({ language: 'tr', value: 'SENTETİK açıklama' });
  assert.equal(personDescription(person).language, 'tr');
});
test('1000 kişi ilişkisi en fazla 64 kümeye girer; hiçbir ID kaybolmaz ve sıralama deterministiktir', () => {
  const points = Array.from({ length: 1000 }, (_, i) => ({
    id: `test:p-${i}`,
    x: (i % 40) * 100,
    y: Math.floor(i / 40) * 100,
  }));
  const clusters = clusterPersonPoints(points, 4000, 2500, 4);
  assert.ok(clusters.length <= 64);
  assert.equal(new Set(clusters.flatMap((c) => c.ids)).size, 1000);
  assert.deepEqual(clusters, clusterPersonPoints([...points].reverse(), 4000, 2500, 4));
  assert.throws(() => clusterPersonPoints([...points, points[0]], 4000, 2500, 1));
  assert.equal(
    clusterPersonPoints([{ id: 'test:outside', x: 999, y: 999 }], 360, 800, 1).length,
    0,
  );
});
test('küre arka yüzü ve zoom kümeleri konum/rota uydurmaz', () => {
  assert.equal(facingGlobe(0, 0, 0, 0), true);
  assert.equal(facingGlobe(180, 0, 0, 0), false);
  assert.equal(facingGlobe(-179, 0, 179, 0), true);
  const points = [
    { id: 'test:a', x: 10, y: 10 },
    { id: 'test:b', x: 90, y: 10 },
  ];
  assert.equal(clusterPersonPoints(points, 360, 800, 1).length, 1);
  assert.equal(clusterPersonPoints(points, 360, 800, 4).length, 2);
  assert.ok(clusterPersonPoints(points, 360, 800, 1).every((c) => points.includes(c.anchor)));
});
test('gerçek kişi kaynak çıkarımı korunur; çelişkili ev konumu opt-in ile bile haritaya dönmez', async () => {
  assert.equal(validateCatalog(preparedPilot).ok, true);
  assert.equal(pilotManifest.personSummary.personCount, 11);
  const person = (await pilotPersons.search('Gogh')).records[0];
  assert.equal(person.wikidataId, 'Q5582');
  assert.equal(person.synthetic, false);
  assert.equal(person.profile.image, null);
  assert.deepEqual(person.profile.wikipedia, []);
  const location = await getPilotRecord('atlas:van-gogh-maison-residence');
  assert.equal(location.temporal.precision, 'month');
  assert.equal(location.temporal.start.date.day, null);
  assert.equal(location.temporal.start.date.month, 8);
  assert.equal(personLocationLevel(location), 'unsupported');
  const view = { year: 1880, polity: false, culture: false, person: true };
  assert.equal((await historicalFeatures(view, 3)).features.length, 0);
  const collection = await historicalFeatures({ ...view, includeApproximatePersons: true }, 3);
  assert.equal(collection.features.length, 0);
  assert.equal(location.geometry, null);
  assert.match(location.geometryReason, /WITHHELD:/);
  for (const year of [1853, 1878, 1881, 1890, 2026])
    assert.equal(
      (await historicalFeatures({ ...view, year, includeApproximatePersons: true }, 3)).features
        .length,
      0,
    );
  assert.deepEqual(
    (
      await historicalFeatures({ ...view, year: 1879, includeApproximatePersons: true }, 3)
    ).features.map((f) => f.id),
    ['atlas:einstein-birth'],
  );
  const facts = JSON.parse(
    await readFile(
      new URL('../../data/pilot/raw/wikidata-person-facts.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(facts.representation, 'editorial-fact-extraction-not-http-response');
  assert.equal(facts.person.location.independentReferenceFetched, false);
});
test('kişi katmanı ve yaklaşık tercih köprüde yalnız boolean kabul eder', () => {
  const payload = {
    year: 1880,
    polity: false,
    culture: false,
    person: true,
    includeApproximatePersons: true,
    focusPilot: false,
  };
  const message = (p) =>
    JSON.stringify({
      version: 1,
      type: 'catalog.view',
      sessionId: 'test',
      requestId: 'command-1',
      payload: p,
    });
  assert.ok(parseMessage(message(payload), 'command', 'test'));
  for (const key of ['person', 'includeApproximatePersons'])
    assert.equal(parseMessage(message({ ...payload, [key]: 'true' }), 'command', 'test'), null);
});
test('Wikidata adayları GUID/niteleyici/referansları korur; P19/P551 otomatik onaylanmaz', () => {
  const raw = rawEntity(),
    candidate = personCandidates(raw, 'Q1');
  assert.equal(candidate.productionApproved, false);
  assert.equal(candidate.geometry, null);
  assert.equal(candidate.reviewStatus, 'unverified');
  assert.deepEqual(candidate.locations[0].statement, raw.entities.Q1.claims.P19[0]);
  assert.deepEqual(
    candidate.locations[1].statement.qualifiers,
    raw.entities.Q1.claims.P551[0].qualifiers,
  );
  assert.ok(candidate.locations.every((l) => l.annualPresenceApproved === false));
  assert.throws(() => personCandidates(raw, 'Q2'));
});
test('Wikidata alımı maxlag/UA/GET, bounded retry ve en az Retry-After bekleme uygular', async () => {
  let count = 0;
  const delays = [];
  const result = await fetchPersonEntity('Q1', {
    userAgent,
    fetcher: async (url, options) => {
      assert.equal(url.hostname, 'www.wikidata.org');
      assert.equal(url.searchParams.get('maxlag'), '5');
      assert.equal(options.headers['User-Agent'], userAgent);
      return ++count === 1
        ? new Response('', { status: 429, headers: { 'Retry-After': '2' } })
        : Response.json(rawEntity());
    },
    wait: async (ms) => delays.push(ms),
  });
  assert.equal(count, 2);
  assert.deepEqual(delays, [2000]);
  assert.equal(result.cacheHit, false);
  assert.equal(result.receipt.sha256, sha256(result.text));
  assert.equal(result.candidates.productionApproved, false);
  await assert.rejects(
    fetchPersonEntity('Q1', {
      userAgent,
      fetcher: async () => new Response('', { status: 503, headers: { 'Retry-After': '120' } }),
      wait: async () => assert.fail('No early retry'),
    }),
    /RETRY_AFTER/,
  );
  await assert.rejects(
    fetchPersonEntity('Q1', { userAgent: 'generic browser' }),
    /CONTACT_USER_AGENT/,
  );
});
test('Wikidata cache TTL/hash/revizyon ve oversized JSON sınırı uygulanır', async () => {
  const first = await fetchPersonEntity('Q1', {
    userAgent,
    now: 1000,
    fetcher: async () => Response.json(rawEntity()),
  });
  assert.equal(
    (
      await fetchPersonEntity('Q1', {
        userAgent,
        now: 2000,
        cached: first,
        fetcher: async () => assert.fail('Must use cache'),
      })
    ).cacheHit,
    true,
  );
  await assert.rejects(
    fetchPersonEntity('Q1', { userAgent, now: 2000, cached: { ...first, text: first.text + ' ' } }),
    /CACHE_CHECKSUM/,
  );
  await assert.rejects(
    fetchPersonEntity('Q1', {
      userAgent,
      now: 2000,
      cached: { ...first, receipt: { ...first.receipt, sourceRevision: 'forged' } },
    }),
    /CACHE_REVISION/,
  );
  let fetched = false;
  await fetchPersonEntity('Q1', {
    userAgent,
    now: 86402000,
    cached: first,
    fetcher: async () => {
      fetched = true;
      return Response.json(rawEntity());
    },
  });
  assert.equal(fetched, true);
  await assert.rejects(
    fetchPersonEntity('Q1', {
      userAgent,
      fetcher: async () => new Response('x'.repeat(4 * 1024 * 1024 + 1)),
    }),
    /SIZE/,
  );
});
test('Wikidata maxlag tekrarları sonludur ve aday şeması üretim kataloğu olamaz', async () => {
  let calls = 0;
  await assert.rejects(
    fetchPersonEntity('Q1', {
      userAgent,
      fetcher: async () => {
        calls++;
        return Response.json({ error: { code: 'maxlag' } });
      },
      wait: async () => {},
    }),
    /MAXLAG/,
  );
  assert.equal(calls, 3);
  assert.equal(validateCatalog(personCandidates(rawEntity(), 'Q1')).ok, false);
});
test('kişi Wikipedia URLsi ham sitelinkle eşleşmeden üretimden geçemez', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'tarih-person-sitelink-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { catalog } = personFixture(),
    person = catalog.records.find((r) => r.kind === 'person');
  person.wikidataId = 'Q1';
  const link = {
    site: 'trwiki',
    title: 'SENTETİK TEST',
    url: 'https://tr.wikipedia.org/wiki/SENTET%C4%B0K_TEST',
    wikidataId: 'Q1',
    sourceId: 'test:source',
    sourceRevision: 'synthetic-rev-1',
    rawInputId: 'test:raw',
    verifiedAt: catalog.createdAt,
  };
  person.profile.wikipedia = [link];
  async function raw(value) {
    const text = JSON.stringify(value);
    await writeFile(join(root, 'fixture.json'), text);
    catalog.inputs[0].bytes = Buffer.byteLength(text);
    catalog.inputs[0].sha256 = sha256(text);
  }
  await raw({ entities: { Q1: { id: 'Q1', sitelinks: {} } } });
  await assert.rejects(inspectCatalog(catalog, root), (error) =>
    error.issues.some((i) => i.message.includes('SITELINK_RAW_MISMATCH')),
  );
  await raw({
    entities: { Q1: { id: 'Q1', sitelinks: { trwiki: { title: link.title, url: link.url } } } },
  });
  assert.ok(await inspectCatalog(catalog, root));
  link.sourceRevision = 'forged';
  rejected(catalog, 'SITELINK_PROVENANCE');
});
