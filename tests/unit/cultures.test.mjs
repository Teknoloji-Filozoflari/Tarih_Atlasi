import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Buffer } from 'node:buffer';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { culturalFixture } from '../fixtures/cultures.mjs';
import { extent, record } from '../fixtures/historical.mjs';
import { validateCatalog } from '../../src/domain/validate.ts';
import { temporalContradictsParent } from '../../src/domain/temporal.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createCulturalRepository } from '../../src/cultures/repository.ts';
import { createHistoricalFeatureLoader, pilotCultures } from '../../src/data/pilot.ts';
import { cultureColor, culturalFillOpacity } from '../../src/cultures/model.ts';
import { theme } from '../../src/theme/tokens.ts';
import { createHitSelection, isHistoricalSelectionPage } from '../../src/map-contract/selection.ts';
import { PILOT_VERSION } from '../../src/data/pilot-contract.ts';
import { parseMessage } from '../../src/map-contract/protocol.ts';
import { physicalStyle } from '../../src/map/globe/style.ts';
import { matchesWikidataSitelink, isWikipediaSitelink } from '../../src/domain/sitelink.ts';
import { inspectCatalog, sha256 } from '../../scripts/etl/pipeline.mjs';

function rejected(catalog, code) {
  const result = validateCatalog(catalog, 'production');
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some((issue) => issue.code === code),
    JSON.stringify(result.issues),
  );
}
test('iki kültür aynı yerde ve zamanda siyasi alanla çakışabilir; ayrı tür/kimlik/geometri kalır', async () => {
  const catalog = culturalFixture(3);
  assert.equal(validateCatalog(catalog).ok, true);
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  assert.equal((await engine.getCulturesAtYear(1)).length, 3);
  assert.equal((await engine.getTerritoriesAtYear(1)).length, 1);
  assert.equal(
    (await engine.getDataCoverage(1, { layers: ['culture', 'polity'] })).records.length,
    4,
  );
  assert.equal((await engine.getDataCoverage(1, { layers: ['culture'] })).records.length, 3);
  assert.equal((await engine.getDataCoverage(1, { layers: ['polity'] })).records.length, 1);
  assert.equal((await engine.getDataCoverage(1, { layers: [] })).records.length, 0);
});
test('kültür alanı siyasi entityye bağlanamaz, bağlam/belirsizlik ve ayrı ilişki semantiği ister', () => {
  const catalog = culturalFixture();
  const region = catalog.records.find((r) => r.kind === 'cultural-region');
  const original = region.entityId;
  region.entityId = 'test:entity-POLITY';
  rejected(catalog, 'SEMANTIC_REFERENCE');
  region.entityId = original;
  delete region.culturalContext;
  rejected(catalog, 'CULTURAL_CONTEXT');
  const relation = record('test:cultural-link', {
    kind: 'cultural-relationship',
    fromEntityId: original,
    toEntityId: 'test:culture-entity-1',
    relationship: 'interaction',
    regionIds: [],
    description: 'SYNTHETIC relation',
  });
  const other = culturalFixture();
  relation.synthetic = false;
  relation.reviewStatus = 'verified';
  relation.temporal.reviewStatus = 'verified';
  other.records.push(relation);
  assert.equal(validateCatalog(other).ok, true);
  relation.toEntityId = 'test:entity-POLITY';
  rejected(other, 'SEMANTIC_REFERENCE');
});
test('kültür snapshotı/tarihsiz alan diğer yıllara yayılmaz; yaklaşık güven korunur', async () => {
  const catalog = culturalFixture();
  const regions = catalog.records.filter((r) => r.kind === 'cultural-region');
  regions[0].temporal = {
    ...extent(-1, -1),
    reviewStatus: 'verified',
    support: { kind: 'snapshot', note: 'SYNTHETIC' },
  };
  delete regions[1].temporal.support;
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  assert.equal((await engine.getCulturesAtYear(-1)).length, 1);
  assert.equal((await engine.getCulturesAtYear(1)).length, 0);
  const report = await engine.getDataCoverage(1, {
    layers: ['culture'],
    preview: 'nearest-snapshot',
  });
  assert.equal(report.sourceYear, -1);
  assert.equal(report.selectedYear, 1);
  assert.equal(report.mode, 'documented approximate');
  assert.equal(report.records.length, 1);
  assert.ok(report.records[0].record.confidence.rationale);
});
test('bağlı kimliğin bilinen dönemi/boşluğu dışındaki siyasi ve kültürel coğrafya üretimde reddedilir', () => {
  for (const kind of ['territory', 'cultural-region']) {
    const catalog = culturalFixture();
    const area = catalog.records.find((r) => r.kind === kind);
    const entity = catalog.records.find((r) => r.id === area.entityId);
    entity.temporal = { ...extent(-2, -1), reviewStatus: 'verified' };
    rejected(catalog, 'ENTITY_GEOGRAPHY_PERIOD');
    entity.temporal = {
      ...extent(-2, 2),
      reviewStatus: 'verified',
      periods: [
        { start: { year: -2, month: null, day: null }, end: { year: -1, month: null, day: null } },
        { start: { year: 2, month: null, day: null }, end: { year: 2, month: null, day: null } },
      ],
    };
    rejected(catalog, 'ENTITY_GEOGRAPHY_PERIOD');
  }
  const unknown = {
    ...extent(),
    start: { kind: 'unknown', date: null },
    end: { kind: 'unknown', date: null },
  };
  assert.equal(temporalContradictsParent(extent(), unknown), false);
});
test('özel provider doğrulayıcıyı atlasa da kültür/sınır/kapsam/snapshot çelişkili kimliği çizmez', async () => {
  const catalog = culturalFixture();
  const provider = createHistoricalDataProvider(catalog);
  const parentId = catalog.records.find((r) => r.kind === 'territory').entityId;
  const wrapped = {
    ...provider,
    query: async (q) => {
      const result = await provider.query(q);
      return {
        ...result,
        hits: result.hits.map((hit) =>
          hit.record.id === parentId
            ? {
                ...hit,
                record: {
                  ...hit.record,
                  temporal: { ...extent(-2, -1), reviewStatus: 'verified' },
                },
              }
            : hit,
        ),
      };
    },
  };
  const engine = createTimelineEngine(wrapped);
  assert.equal((await engine.getTerritoriesAtYear(1)).length, 0);
  assert.equal((await engine.getDataCoverage(1, { layers: ['polity'] })).records.length, 0);
});
test('kültürel ilişki bölge kapsamına uyar, siyasi ilişkiye dönüşmez; kart kaynak/belirsizlik taşır', async () => {
  const catalog = culturalFixture();
  const regions = catalog.records.filter((r) => r.kind === 'cultural-region');
  const relation = record('test:cultural-relation', {
    kind: 'cultural-relationship',
    fromEntityId: regions[0].entityId,
    toEntityId: regions[1].entityId,
    regionIds: [regions[1].id],
    relationship: 'influence',
    description: 'SYNTHETIC only scoped to second region',
  });
  relation.synthetic = false;
  relation.reviewStatus = 'verified';
  relation.temporal = structuredClone(regions[0].temporal);
  catalog.records.push(relation);
  const repo = createCulturalRepository(createHistoricalDataProvider(catalog));
  const first = await repo.detail(regions[0].id, 1),
    second = await repo.detail(regions[1].id, 1);
  assert.equal(first.relations.length, 0);
  assert.equal(second.relations.length, 1);
  assert.ok(first.region.culturalContext.uncertainties.length);
  assert.ok(first.sources.every((s) => s.attribution && s.licenseId));
  assert.equal((await repo.detail(regions[0].id, 3)).supported, false);
  assert.equal(first.wikipedia, null);
});
test('ortak feature loader bağımsız katmanlar ve eşzamanlı kültürler için farklı sembolik özellikler üretir', async () => {
  const catalog = culturalFixture(2),
    provider = createHistoricalDataProvider(catalog),
    engine = createTimelineEngine(provider);
  const load = createHistoricalFeatureLoader(engine);
  const result = await load({ year: 1, polity: true, culture: true }, 3);
  assert.equal(result.features.length, 3);
  assert.equal(result.features.filter((f) => f.properties.lineStyle === 'culture').length, 2);
  assert.ok(
    result.features
      .filter((f) => f.properties.kind === 'cultural-region')
      .every((f) => f.properties.classification && f.properties.fillOpacity <= 0.1),
  );
  assert.equal((await load({ year: 1, polity: false, culture: true }, 3)).features.length, 2);
  assert.equal((await load({ year: 1, polity: true, culture: false }, 3)).features.length, 1);
  assert.equal((await load({ year: 3, polity: true, culture: true }, 3)).features.length, 0);
});
test('yoğun kültürel örtüşmenin bileşik dolgusu bütçeli, renkler okunabilir ve IDye göre kararlıdır', () => {
  const luminance = (color) => {
    const c = color
      .slice(1)
      .match(/../g)
      .map((hex) => parseInt(hex, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  for (const count of [1, 2, 10, 32, 1000])
    assert.ok(1 - (1 - culturalFillOpacity(count)) ** count <= 0.300000001);
  for (const color of theme.culturalPalette) {
    const values = [luminance(color), luminance(theme.colors.land)].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 3);
  }
  assert.equal(cultureColor('test:identity'), cultureColor('test:identity'));
  assert.throws(() => culturalFillOpacity(1001));
  const style = physicalStyle({ type: 'FeatureCollection', features: [] });
  assert.deepEqual(
    validateStyleMin(style).map((e) => e.message),
    [],
  );
  assert.ok(style.layers.find((l) => l.id === 'culture-soft-edge').paint['line-blur'] > 0);
  assert.deepEqual(
    style.layers.find((l) => l.id === 'culture-uncertain').paint['line-dasharray'],
    [1, 3],
  );
});
test('1000 örtüşen adayın hepsi sayfalarla erişilir; eski seçim/revizyon ve bozuk offset reddedilir', () => {
  const selection = createHitSelection(PILOT_VERSION),
    ids = Array.from({ length: 1000 }, (_, i) => `test:overlap-${i}`);
  const first = selection.begin(ids, 7);
  assert.equal(first.candidateIds.length, 8);
  const reached = [];
  for (let offset = 0; offset < 1000; offset += 8) {
    const page = selection.page({ ...first, offset });
    assert.ok(isHistoricalSelectionPage(page));
    reached.push(...page.candidateIds);
  }
  assert.deepEqual(reached, ids);
  for (const request of [
    { ...first, offset: -8 },
    { ...first, offset: 1 },
    { ...first, offset: 1000 },
    { ...first, offset: 0, revision: 6 },
  ])
    assert.equal(selection.page(request), null);
  selection.clear();
  assert.equal(selection.page(first), null);
  assert.throws(() => selection.begin([...ids, 'test:extra'], 8));
});
test('seçim köprüsü sayfa şeması/session/katalog/revizyon/ID ve 4KiB sınırına uyar', () => {
  const pager = createHitSelection(PILOT_VERSION),
    page = pager.begin(
      Array.from({ length: 17 }, (_, i) => `test:area-${i}`),
      3,
    );
  const encode = (type, payload) =>
    JSON.stringify({ version: 1, type, payload, sessionId: 'test', requestId: 'event-1' });
  assert.ok(parseMessage(encode('selection.changed', page), 'event', 'test'));
  for (const broken of [
    { ...page, total: 1001 },
    { ...page, offset: 1 },
    { ...page, candidateIds: ['javascript:alert(1)'] },
    { ...page, extra: true },
    { ...page, catalogVersion: 'wrong' },
  ])
    assert.equal(parseMessage(encode('selection.changed', broken), 'event', 'test'), null);
  assert.ok(
    parseMessage(
      encode('selection.page', { revision: 3, selectionId: page.selectionId, offset: 8 }),
      'command',
      'test',
    ),
  );
  assert.equal(
    parseMessage(
      encode('selection.page', { revision: 3, selectionId: page.selectionId, offset: 7 }),
      'command',
      'test',
    ),
    null,
  );
});
test('Wikipedia adı/QIDden üretilmez; açık sitelink URLsi ham Wikidata yanıtıyla bire bir eşleşir', () => {
  const link = {
    site: 'trwiki',
    title: 'SENTETİK TEST',
    url: 'https://tr.wikipedia.org/wiki/SENTET%C4%B0K_TEST',
    wikidataId: 'Q1',
  };
  const raw = {
    entities: { Q1: { id: 'Q1', sitelinks: { trwiki: { title: link.title, url: link.url } } } },
  };
  assert.equal(isWikipediaSitelink(link), true);
  assert.equal(matchesWikidataSitelink(raw, link), true);
  assert.equal(matchesWikidataSitelink(raw, { ...link, title: 'different' }), false);
  assert.equal(
    isWikipediaSitelink({
      ...link,
      url: 'https://tr.wikipedia.org.evil.invalid/wiki/SENTET%C4%B0K_TEST',
    }),
    false,
  );
  assert.equal(matchesWikidataSitelink({ entities: { Q1: { id: 'Q1' } } }, link), false);
});
test('ETL sahte sitelinki üretime almadan reddeder; gerçek ham eşleşme ve hash korunur', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'tarih-culture-sitelink-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const catalog = culturalFixture(),
    region = catalog.records.find((r) => r.kind === 'cultural-region');
  region.wikidataId = 'Q1';
  region.wikipedia = {
    site: 'trwiki',
    title: 'SENTETİK TEST',
    url: 'https://tr.wikipedia.org/wiki/SENTET%C4%B0K_TEST',
    wikidataId: 'Q1',
    sourceId: 'test:source',
    sourceRevision: 'synthetic-rev-1',
    rawInputId: 'test:raw',
    verifiedAt: catalog.createdAt,
  };
  const write = async (raw) => {
    const text = JSON.stringify(raw);
    await writeFile(join(root, 'fixture.json'), text);
    catalog.inputs[0].bytes = Buffer.byteLength(text);
    catalog.inputs[0].sha256 = sha256(text);
  };
  await write({ entities: { Q1: { id: 'Q1', sitelinks: {} } } });
  await assert.rejects(inspectCatalog(catalog, root, 'production'), (error) =>
    error.issues.some((issue) => issue.message.includes('SITELINK_RAW_MISMATCH')),
  );
  await write({
    entities: {
      Q1: {
        id: 'Q1',
        sitelinks: { trwiki: { title: region.wikipedia.title, url: region.wikipedia.url } },
      },
    },
  });
  assert.equal(
    (await inspectCatalog(catalog, root)).records.find((r) => r.id === region.id).wikipedia.url,
    region.wikipedia.url,
  );
  region.wikipedia.sourceRevision = 'unreviewed';
  rejected(catalog, 'SITELINK_PROVENANCE');
});
test('üretim kültürü de lisans/atıf/sentetik kapılarına bağlıdır; gerçek pilot kültür içermediğini söyler', async () => {
  const catalog = culturalFixture();
  catalog.sources[0].sourceKey = 'd-place';
  rejected(catalog, 'LICENSE_DISALLOWED');
  const other = culturalFixture();
  other.records.find((r) => r.kind === 'cultural-region').synthetic = true;
  rejected(other, 'SYNTHETIC_PRODUCTION');
  assert.ok(pilotCultures);
  assert.equal(await pilotCultures.detail('atlas:alaska-treaty-segment-1867', 1867), null);
});

test('400 kültürlü sentetik yük tek indeks/sayfalama bütçesiyle sorgulanır, tekrarda bütün katalog yeniden taranmaz', async () => {
  const catalog = culturalFixture(400),
    provider = createHistoricalDataProvider(catalog);
  let queries = 0;
  const engine = createTimelineEngine({
    ...provider,
    query: async (q) => {
      queries++;
      return provider.query(q);
    },
  });
  assert.equal((await engine.getCulturesAtYear(1)).length, 400);
  const scans = engine.cacheInfo().indexScans,
    count = queries;
  assert.ok(queries <= 10);
  for (let i = 0; i < 10; i++) assert.equal((await engine.getCulturesAtYear(1)).length, 400);
  assert.equal(engine.cacheInfo().indexScans, scans);
  assert.equal(queries, count);
  const rendered = await createHistoricalFeatureLoader(engine)(
    { year: 1, polity: true, culture: true },
    2,
  );
  assert.equal(
    rendered.features.filter((f) => f.properties.kind === 'cultural-region').length,
    400,
  );
});
