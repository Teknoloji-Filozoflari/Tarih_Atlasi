import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fixtureCatalog, simulateReviewed, extent, polygon } from '../fixtures/historical.mjs';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { timelineFrameLoader } from '../../src/timeline/frame.ts';
import { createEventRepository } from '../../src/events/repository.ts';
import {
  eventLayer,
  eventSymbol,
  eventProjection,
  eventHasMapEvidence,
} from '../../src/events/model.ts';
import {
  createHistoricalFeatureLoader,
  historicalFeatures,
  pilotEvents,
} from '../../src/data/pilot.ts';
import { preparedPilot, pilotManifest } from '../../src/data/generated/pilot.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { inspectCatalog, sha256 } from '../../scripts/etl/pipeline.mjs';
import { clusterPersonPoints } from '../../src/persons/clustering.ts';
import { parseMessage } from '../../src/map-contract/protocol.ts';
import { physicalStyle } from '../../src/map/globe/style.ts';
function fixture() {
  const catalog = simulateReviewed(fixtureCatalog());
  catalog.records = catalog.records.filter((r) => r.kind !== 'coverage');
  for (const r of [...catalog.sources, ...catalog.records])
    r.temporal = {
      ...r.temporal,
      uncertain: false,
      support: { kind: 'continuous', note: 'SYNTHETIC TEST only' },
    };
  const event = catalog.records.find((r) => r.id === 'test:event');
  event.confidence.level = 'high';
  event.temporal = {
    ...event.temporal,
    start: { kind: 'known', date: { year: 1, month: null, day: null } },
    end: { kind: 'known', date: { year: 1, month: null, day: null } },
    support: { kind: 'snapshot', note: 'SYNTHETIC TEST only' },
  };
  const provider = createHistoricalDataProvider(catalog),
    timeline = createTimelineEngine(provider);
  return { catalog, event, provider, timeline, repo: createEventRepository(provider, timeline) };
}
const engine = (catalog) => createTimelineEngine(createHistoricalDataProvider(catalog));
function rejected(catalog, code) {
  const result = validateCatalog(catalog);
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some((i) => i.code === code),
    JSON.stringify(result.issues),
  );
}

test('yedi olay türü ayrı kalır; eski EVENT belirsiz türü sessiz kabul edilmez', () => {
  for (const type of [
    'BATTLE',
    'WAR',
    'TREATY',
    'FOUNDATION',
    'DISSOLUTION',
    'CULTURAL_EVENT',
    'OTHER',
  ]) {
    const { catalog, event } = fixture();
    event.eventType = type;
    event.entityId = type === 'BATTLE' ? 'test:entity-BATTLE' : 'test:entity-EVENT';
    if (type === 'WAR') {
      event.geometry = null;
      event.geometryReason = 'SYNTHETIC unknown war geography';
      event.locationSemantics = 'unknown';
      event.details.locationPrecision.classification = 'unknown';
    }
    assert.equal(validateCatalog(catalog).ok, true, type);
  }
  const { catalog, event } = fixture();
  event.eventType = 'EVENT';
  rejected(catalog, 'SCHEMA_ENUM');
  assert.equal(eventLayer('WAR'), 'battle');
  assert.equal(eventLayer('TREATY'), 'event');
  assert.equal(new Set(['WAR', 'BATTLE', 'TREATY', 'OTHER'].map(eventSymbol)).size, 4);
});
test('yıl sıfırı olmayan MÖ/MS dönem kesişimi başlangıç/bitiş dahil çalışır', async () => {
  const { catalog, event } = fixture();
  event.temporal = {
    ...event.temporal,
    start: { kind: 'known', date: { year: -1, month: null, day: null } },
    end: { kind: 'known', date: { year: 1, month: null, day: null } },
    support: { kind: 'continuous', note: 'SYNTHETIC crossing' },
  };
  const timeline = engine(catalog);
  for (const y of [-1, 1])
    assert.ok((await timeline.getEventsAtYear(y)).some((h) => h.record.id === event.id));
  for (const y of [-2, 2])
    assert.equal(
      (await timeline.getEventsAtYear(y)).some((h) => h.record.id === event.id),
      false,
    );
  await assert.rejects(timeline.getEventsAtYear(0));
});
test('çok yıllı savaş tek nokta değildir; kaynaklı bölgeyle her belgeli yılda çizilebilir', async () => {
  const { catalog, event } = fixture();
  event.eventType = 'WAR';
  event.temporal = {
    ...extent(-2, 2),
    uncertain: false,
    reviewStatus: 'verified',
    support: { kind: 'continuous', note: 'SYNTHETIC war period' },
  };
  rejected(catalog, 'WAR_AS_POINT');
  event.geometry = polygon();
  event.locationSemantics = 'documented';
  event.details.locationPrecision.classification = 'documented-region';
  const timeline = engine(catalog),
    load = createHistoricalFeatureLoader(timeline);
  for (const year of [-2, -1, 1, 2]) {
    const features = (await load({ year, polity: false, culture: false, battle: true }, 3))
      .features;
    assert.equal(features.length, 1);
    assert.equal(features[0].geometry.type, 'Polygon');
    assert.equal(features[0].properties.classification, 'WAR');
  }
  assert.equal(
    (await load({ year: 3, polity: false, culture: false, battle: true }, 3)).features.length,
    0,
  );
});
test('geometrisiz tarihli olay yıl listesinde kalır, placeId bile kendiliğinden koordinat üretmez', async () => {
  const { catalog, event } = fixture();
  event.geometry = null;
  event.geometryReason = 'SYNTHETIC unknown';
  event.locationSemantics = 'unknown';
  event.details.placeId = 'test:place';
  event.details.locationPrecision.classification = 'unknown';
  const timeline = engine(catalog),
    repo = createEventRepository(createHistoricalDataProvider(catalog), timeline);
  assert.ok((await repo.atYear(1)).records.some((h) => h.record.id === event.id));
  assert.equal((await timeline.getDataCoverage(1, { layers: ['event'] })).records.length, 0);
  assert.equal(
    (
      await createHistoricalFeatureLoader(timeline)(
        { year: 1, polity: false, culture: false, event: true },
        2,
      )
    ).features.length,
    0,
  );
});
test('tarihsiz olay hiçbir yıla ve en yakın snapshot listesine taşınmaz', async () => {
  const { catalog, event } = fixture();
  event.temporal = {
    ...event.temporal,
    start: { kind: 'unknown', date: null },
    end: { kind: 'unknown', date: null },
    precision: 'unknown',
    uncertain: true,
  };
  delete event.temporal.support;
  const timeline = engine(catalog);
  for (const year of [-2000, -1, 1, 2026])
    assert.equal(
      (await timeline.getEventsAtYear(year)).some((h) => h.record.id === event.id),
      false,
    );
  assert.equal((await timeline.getAvailableSnapshots({ layers: ['event'] })).length, 0);
});
test('yaklaşık/alternatif tarihler bağımsız kanıt ve belirsizlik ister', () => {
  const { catalog, event } = fixture();
  event.details.alternativeDates = [
    {
      temporal: structuredClone(event.temporal),
      evidenceIndices: [0],
      explanation: 'SYNTHETIC competing source',
    },
  ];
  rejected(catalog, 'EVENT_ALTERNATIVE_UNCERTAINTY');
  event.temporal.uncertain = true;
  assert.equal(validateCatalog(catalog).ok, true);
  event.details.alternativeDates[0].evidenceIndices = [29];
  rejected(catalog, 'EVENT_ALTERNATIVE_SOURCE');
  event.details.alternativeDates[0].evidenceIndices = [0];
  event.details.alternativeDates[0].temporal.reviewStatus = 'unverified';
  rejected(catalog, 'EVENT_ALTERNATIVE_REVIEW');
});
test('konum hassasiyeti, geometri ve kaynak iddiası birbiriyle çelişemez', () => {
  const { catalog, event } = fixture();
  event.details.locationPrecision.classification = 'documented-region';
  rejected(catalog, 'EVENT_PRECISION');
  event.details.locationPrecision.classification = 'approximate-point';
  event.evidence = event.evidence.map((e) => ({ ...e, claims: ['identity', 'temporal'] }));
  rejected(catalog, 'EVENT_GEOGRAPHY_EVIDENCE');
});
test('olay dönemini kimlik dönemi dışına taşımak reddedilir', () => {
  const { catalog, event } = fixture();
  event.temporal.start.date.year = 3;
  event.temporal.end.date.year = 3;
  rejected(catalog, 'GEOGRAPHY_PARENT_DATE');
});
test('savaş ve olay listesi/harita bağımsız açılır, antlaşma olay anahtarına bağlıdır', async () => {
  const { catalog, event } = fixture();
  const treaty = structuredClone(event);
  treaty.id = 'test:treaty';
  treaty.eventType = 'TREATY';
  catalog.records.push(treaty);
  const battle = structuredClone(event);
  battle.id = 'test:battle-mapped';
  battle.eventType = 'BATTLE';
  battle.entityId = 'test:entity-BATTLE';
  catalog.records.push(battle);
  const provider = createHistoricalDataProvider(catalog),
    timeline = createTimelineEngine(provider),
    repo = createEventRepository(provider, timeline),
    load = createHistoricalFeatureLoader(timeline);
  assert.equal(
    (await repo.atYear(1, { battle: false, event: true })).records.some(
      (h) => h.record.eventType === 'BATTLE',
    ),
    false,
  );
  assert.equal(
    (await repo.atYear(1, { battle: true, event: false })).records.some(
      (h) => h.record.eventType === 'TREATY',
    ),
    false,
  );
  assert.equal((await repo.atYear(1, { battle: false, event: false })).total, 0);
  assert.equal(
    (await load({ year: 1, polity: false, culture: false, battle: false, event: true }, 3)).features
      .length,
    2,
  );
  assert.equal(
    (await load({ year: 1, polity: false, culture: false, battle: true, event: false }, 3)).features
      .length,
    1,
  );
  assert.equal(
    (await load({ year: 1, polity: false, culture: false, battle: false, event: false }, 3))
      .features.length,
    0,
  );
});
test('olay başlık/tarih/kaynak projeksiyonu kanonik alanları kullanır; kaynaklı katılımcılar çözülür', async () => {
  const { event, repo } = fixture(),
    projection = eventProjection(event);
  assert.equal(projection.dateExtent, event.temporal);
  assert.equal(projection.sources, event.evidence);
  assert.equal(projection.title, event.names[0].value);
  const detail = await repo.detail(event.id, 1);
  assert.equal(detail.participants[0].id, 'test:entity-PERSON');
  assert.equal(detail.sources[0].id, 'test:source');
  assert.equal((await repo.detail(event.id, 2)).supported, false);
  assert.equal(await repo.detail('test:missing', 1), null);
});
test('düşük/incelemesiz geometri haritada yok; tarihli kaynak kaydı listeden erişilebilir', async () => {
  const { catalog, event } = fixture();
  event.confidence.level = 'low';
  assert.equal(eventHasMapEvidence(event), false);
  const timeline = engine(catalog);
  assert.ok((await timeline.getEventsAtYear(1)).some((h) => h.record.id === event.id));
  assert.equal((await timeline.getDataCoverage(1, { layers: ['event'] })).records.length, 0);
  const unreviewed = structuredClone(event);
  unreviewed.reviewStatus = 'unverified';
  assert.equal(eventHasMapEvidence(unreviewed), false);
});
test('olay detay/atıf/lisans olmadan kayıt üretimden geçmez', () => {
  const { catalog, event } = fixture();
  delete event.details;
  rejected(catalog, 'EVENT_DETAILS');
  const invalid = fixture();
  invalid.event.attribution = '';
  assert.equal(validateCatalog(invalid.catalog).ok, false);
  const disallowed = fixture();
  disallowed.catalog.sources[0].sourceKey = 'historical-basemaps';
  assert.equal(validateCatalog(disallowed.catalog).ok, false);
});
test('snapshot geometri başka yıla sızmaz; açık önizleme kendi kaynak yılını korur', async () => {
  const { timeline, event } = fixture();
  assert.equal((await timeline.getDataCoverage(2, { layers: ['event'] })).records.length, 0);
  const report = await timeline.getDataCoverage(2, {
    layers: ['event'],
    preview: 'nearest-snapshot',
  });
  assert.equal(report.isPreview, true);
  assert.equal(report.sourceYear, 1);
  assert.equal(report.selectedYear, 2);
  assert.equal(report.records[0].record.id, event.id);
  const frame = await timelineFrameLoader(timeline)(2, {
    layers: ['event'],
    preview: true,
    signal: new AbortController().signal,
  });
  assert.equal(frame.contextYear, 1);
  assert.equal(
    frame.events.some((h) => h.record.id === event.id),
    true,
  );
});
test('yoğun olay listesi 8 kayıt sayfalar, kümeler bütün 1000 IDyi kaybetmeden sınırlar', async () => {
  const { catalog, event } = fixture();
  for (let i = 0; i < 25; i++)
    catalog.records.push({ ...structuredClone(event), id: `test:event-copy-${i}` });
  const repo = createEventRepository(createHistoricalDataProvider(catalog)),
    ids = [];
  for (let offset = 0; ;) {
    const page = await repo.atYear(1, { offset });
    assert.ok(page.records.length <= 8);
    ids.push(...page.records.map((h) => h.record.id));
    if (page.nextOffset === null) break;
    offset = page.nextOffset;
  }
  assert.equal(new Set(ids).size, 27);
  await assert.rejects(repo.atYear(1, { offset: -1 }));
  const clusters = clusterPersonPoints(
    Array.from({ length: 1000 }, (_, i) => ({
      id: `test:event-${i}`,
      x: (i % 40) * 100,
      y: Math.floor(i / 40) * 100,
    })),
    4000,
    2500,
    4,
  );
  assert.ok(clusters.length <= 64);
  assert.equal(new Set(clusters.flatMap((c) => c.ids)).size, 1000);
});
test('offline kaynaklı olay verisi dış ağ veya tile/glyph servisi gerektirmez', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => assert.fail('Static events must not fetch'));
  const events = await pilotEvents.atYear(1066);
  assert.equal(events.total, 1);
  const detail = await pilotEvents.detail('atlas:hastings-1066', 1066);
  assert.ok(detail.mapSupported);
  const features = await historicalFeatures(
    { year: 1066, polity: false, culture: false, battle: true, event: true },
    3,
  );
  assert.equal(features.features.length, 1);
  const style = physicalStyle({ type: 'FeatureCollection', features: [] });
  assert.equal(style.glyphs, undefined);
  assert.ok(Object.values(style.sources).every((s) => s.type === 'geojson'));
  assert.ok(style.layers.find((l) => l.id === 'event-region-edge').paint['line-dasharray']);
});
test('gerçek pilot çağları/türleri/takvim belirsizliği ve konumsuzluğu açık tutar', async () => {
  assert.equal(pilotManifest.eventSummary.eventCount, 11);
  assert.equal(pilotManifest.eventSummary.geometryCount, 5);
  assert.equal(validateCatalog(preparedPilot).ok, true);
  const events = preparedPilot.records.filter((r) => r.kind === 'event');
  assert.equal(
    events.every((r) => r.synthetic === false),
    true,
  );
  assert.deepEqual(events.map((r) => r.eventType).sort(), [
    'BATTLE',
    'BATTLE',
    'BATTLE',
    'BATTLE',
    'BATTLE',
    'CAMPAIGN',
    'OTHER',
    'TREATY',
    'WAR',
    'WAR',
    'WAR',
  ]);
  for (const year of [-431, -420, -404])
    assert.equal((await pilotEvents.atYear(year, { event: false })).total, 1);
  for (const year of [-432, -403])
    assert.equal((await pilotEvents.atYear(year, { event: false })).total, 0);
  const treaty = await pilotEvents.detail('atlas:westphalia-1648', 1648);
  assert.equal(treaty.record.geometry, null);
  assert.equal(treaty.record.temporal.start.date.day, 24);
  assert.equal(treaty.record.temporal.start.date.month, 10);
  const battle = await pilotEvents.detail('atlas:hastings-1066', 1066);
  assert.equal(battle.record.temporal.precision, 'year');
  assert.equal(battle.record.temporal.start.date.day, null);
  assert.equal(battle.record.details.locationPrecision.classification, 'approximate-point');
  assert.equal(battle.record.geometry.coordinates[0], 29 / 60 + 15 / 3600);
  const process = await pilotEvents.detail('atlas:german-reunification-process', 1990);
  assert.equal(process.record.temporal.uncertain, true);
  assert.equal(process.record.details.alternativeDates[0].temporal.start.date.year, 1991);
  assert.equal(process.mapSupported, false);
  const facts = JSON.parse(
    await readFile(
      new URL('../../data/pilot/raw/wikidata-event-facts.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(facts.representation, 'editorial-fact-extraction-not-http-response');
  assert.ok(
    events.every((r) => r.details.wikipediaSitelinks.length === 0 && r.participantIds.length === 0),
  );
});
test('olay ve savaş köprü tercihleri yalnız boolean, bilinmeyen alan ve tür reddedilir', () => {
  const payload = {
    year: 1066,
    polity: false,
    culture: false,
    battle: true,
    event: false,
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
  for (const key of ['battle', 'event'])
    assert.equal(parseMessage(message({ ...payload, [key]: 'true' }), 'command', 'test'), null);
  assert.equal(parseMessage(message({ ...payload, war: true }), 'command', 'test'), null);
});
test('olay Wikipedia sitelinki ham checksumlu Wikidata kaydıyla eşleşmeli', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'tarih-event-sitelink-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { catalog, event } = fixture();
  event.wikidataId = 'Q1';
  const link = {
    wikidataId: 'Q1',
    site: 'trwiki',
    title: 'SENTETİK OLAY',
    url: 'https://tr.wikipedia.org/wiki/SENTET%C4%B0K_OLAY',
    sourceId: 'test:source',
    sourceRevision: 'synthetic-rev-1',
    rawInputId: 'test:raw',
    verifiedAt: catalog.createdAt,
  };
  event.details.wikipediaSitelinks = [link];
  async function raw(sitelinks) {
    const text = JSON.stringify({ entities: { Q1: { id: 'Q1', sitelinks } } });
    await writeFile(join(root, 'fixture.json'), text);
    catalog.inputs[0].sha256 = sha256(text);
    catalog.inputs[0].bytes = Buffer.byteLength(text);
  }
  await raw({});
  await assert.rejects(inspectCatalog(catalog, root), (e) =>
    e.issues.some((i) => i.message.includes('SITELINK_RAW_MISMATCH')),
  );
  await raw({ trwiki: { title: link.title, url: link.url } });
  assert.ok(await inspectCatalog(catalog, root));
  link.sourceRevision = 'forged';
  rejected(catalog, 'SITELINK_PROVENANCE');
});

test('olay geometrisi Point/alanla sınırlı; ham antimeridyen atlaması reddedilir ve yoğun alan dolgu bütçesi korunur', async () => {
  const line = fixture();
  line.event.geometry = {
    type: 'LineString',
    coordinates: [
      [0, 0],
      [1, 1],
    ],
  };
  assert.equal(validateCatalog(line.catalog).ok, false);
  const seam = fixture();
  seam.event.geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [179, 0],
        [-179, 0],
        [-179, 4],
        [179, 4],
        [179, 0],
      ],
    ],
  };
  seam.event.details.locationPrecision.classification = 'documented-region';
  seam.event.locationSemantics = 'documented';
  assert.equal(validateCatalog(seam.catalog).ok, false);
  const { catalog, event } = fixture();
  event.geometry = polygon();
  event.locationSemantics = 'documented';
  event.details.locationPrecision.classification = 'documented-region';
  for (let i = 0; i < 20; i++)
    catalog.records.push({ ...structuredClone(event), id: `test:area-${i}` });
  const load = createHistoricalFeatureLoader(engine(catalog));
  const features = (await load({ year: 1, polity: false, culture: false, event: true }, 3))
    .features;
  assert.equal(features.length, 21);
  assert.ok(features.reduce((sum, f) => sum + f.properties.fillOpacity, 0) <= 0.300001);
  assert.ok(features.every((f) => f.geometry.type === 'Polygon'));
});

test('kesintili olay dönemindeki boşluk yeni yıla taşınmaz; gecikmiş frame iptali korunur', async () => {
  const { catalog, event } = fixture();
  event.temporal = {
    ...event.temporal,
    start: { kind: 'known', date: { year: -2, month: null, day: null } },
    end: { kind: 'known', date: { year: 2, month: null, day: null } },
    support: { kind: 'continuous', note: 'SYNTHETIC disjoint source' },
    periods: [
      { start: { year: -2, month: null, day: null }, end: { year: -1, month: null, day: null } },
      { start: { year: 2, month: null, day: null }, end: { year: 2, month: null, day: null } },
    ],
  };
  const timeline = engine(catalog);
  for (const year of [-2, -1, 2])
    assert.equal(
      (await timeline.getEventsAtYear(year)).some((h) => h.record.id === event.id),
      true,
    );
  assert.equal(
    (await timeline.getEventsAtYear(1)).some((h) => h.record.id === event.id),
    false,
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    timelineFrameLoader(timeline)(2, {
      layers: ['event'],
      preview: false,
      signal: controller.signal,
    }),
    /aborted/,
  );
});
