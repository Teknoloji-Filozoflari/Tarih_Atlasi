// SYNTHETIC ONLY: all added people, periods and geometries below are test fixtures.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  displayYearToAstronomical,
  astronomicalToDisplayYear,
  selectableYearRange,
  stepDisplayYear,
  elapsedYears,
  inclusiveYearCount,
} from '../../src/timeline/year.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createLatestQuery } from '../../src/timeline/latest.ts';
import { describeTemporal } from '../../src/timeline/format.ts';
import { temporalExtentSchema } from '../../src/domain/temporal.ts';
import { parse } from '../../src/domain/schema.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { fixtureCatalog, simulateReviewed, extent } from '../fixtures/historical.mjs';

const date = (year) => ({ year, month: null, day: null });
function supported(start, end = start, kind = 'continuous') {
  return {
    ...extent(start, end),
    uncertain: false,
    reviewStatus: 'verified',
    support: { kind, note: 'SYNTHETIC TEST source explicitly supports this interval' },
  };
}
function engineFixture() {
  const catalog = simulateReviewed(fixtureCatalog());
  for (const record of [...catalog.sources, ...catalog.records]) record.temporal = supported(-2, 2);
  const territory = catalog.records.find((r) => r.kind === 'territory');
  territory.temporal = supported(-1, -1, 'snapshot');
  const presence = catalog.records.find((r) => r.id === 'test:presence');
  presence.temporal = supported(1, 1, 'snapshot');
  const biography = catalog.records.find((r) => r.id === 'test:biography');
  biography.temporal = {
    ...extent(),
    start: { kind: 'unknown', date: null },
    end: { kind: 'unknown', date: null },
    reviewStatus: 'verified',
  };
  return { catalog, territory, presence, biography };
}
const engineFor = (catalog, options) =>
  createTimelineEngine(createHistoricalDataProvider(catalog, 'staging'), options);

test('altın MÖ/MS dönüşümleri ve süreler yıl sıfırı üretmez', () => {
  assert.deepEqual([-2, -1, 1, 2].map(displayYearToAstronomical), [-1, 0, 1, 2]);
  assert.equal(displayYearToAstronomical(-2000), -1999);
  assert.deepEqual([-1, 0, 1, 2].map(astronomicalToDisplayYear), [-2, -1, 1, 2]);
  assert.equal(stepDisplayYear(-1, 1, 2026), 1);
  assert.equal(stepDisplayYear(1, -1, 2026), -1);
  assert.equal(elapsedYears(-1, 1), 1);
  assert.equal(inclusiveYearCount(-2, 2), 4);
  assert.throws(() => displayYearToAstronomical(0));
  assert.throws(() => astronomicalToDisplayYear(NaN));
  assert.deepEqual(selectableYearRange(new Date(2031, 0, 1)), { minYear: -2000, maxYear: 2031 });
  assert.equal(stepDisplayYear(-2000, -1, 2031), -2000);
  assert.equal(stepDisplayYear(2031, 1, 2031), 2031);
});

test('altın başlangıç/bitiş ve kesintili varlık boşluğu korunur', async () => {
  const { catalog } = engineFixture();
  const entity = catalog.records.find((r) => r.id === 'test:entity-POLITY');
  entity.temporal.periods = [
    { start: date(-2), end: date(-1) },
    { start: date(2), end: date(2) },
  ];
  const engine = engineFor(catalog);
  for (const year of [-2, -1, 2])
    assert.ok((await engine.getEntitiesAtYear(year)).some((h) => h.record.id === entity.id));
  for (const year of [-3, 1, 3])
    assert.ok(!(await engine.getEntitiesAtYear(year)).some((h) => h.record.id === entity.id));
});

test('altın snapshot komşu yıla taşınmaz; support olmadan sürekli geometri varsayılmaz', async () => {
  const { catalog, territory } = engineFixture();
  const engine = engineFor(catalog);
  assert.equal((await engine.getTerritoriesAtYear(-1)).length, 1);
  for (const year of [-2, 1, 2]) assert.equal((await engine.getTerritoriesAtYear(year)).length, 0);
  territory.temporal = supported(-2, 2);
  delete territory.temporal.support;
  const unsupported = engineFor(catalog);
  assert.equal((await unsupported.getTerritoriesAtYear(1)).length, 0);
  assert.equal(
    (await unsupported.getDataCoverage(1, { layers: ['polity'] })).mode,
    'no supported historical geography',
  );
});

test('altın kişi yaşamı, kaynaklı bulunma ve tarihsiz biyografi ayrı kalır', async () => {
  const { catalog } = engineFixture();
  const engine = engineFor(catalog);
  const before = (await engine.getPersonsAtYear(-1))[0];
  assert.equal(before.locations.length, 0);
  assert.equal(before.biographicalLocations.length, 1);
  assert.equal(before.locationStatus, 'no-supported-location');
  const at = (await engine.getPersonsAtYear(1))[0];
  assert.equal(at.locations.length, 1);
  assert.equal(at.locations[0].record.id, 'test:presence');
  assert.equal((await engine.getEventsAtYear(1)).length, 2);
  assert.equal((await engine.getPersonsAtYear(3)).length, 0);
});

test('altın bilinmeyen/yüzyıl/range hassasiyeti kesin gün veya kesin coğrafya olamaz', async () => {
  const { catalog, territory } = engineFixture();
  territory.temporal = { ...supported(100, 199), precision: 'century', uncertain: true };
  // Synthetic identity period must cover the century used for this precision test.
  catalog.records.find((record) => record.id === territory.entityId).temporal = supported(-2, 199);
  const engine = engineFor(catalog);
  assert.equal(
    (await engine.getDataCoverage(150, { layers: ['polity'] })).mode,
    'documented approximate',
  );
  assert.equal(describeTemporal(territory.temporal).precision, 'century');
  assert.equal(describeTemporal(territory.temporal).start.day, null);
  const invalid = { ...territory.temporal, precision: 'day' };
  assert.equal(parse(temporalExtentSchema, invalid).ok, false);
  assert.equal(parse(temporalExtentSchema, { ...territory.temporal, precision: 'range' }).ok, true);
  territory.temporal = {
    ...extent(),
    reviewStatus: 'verified',
    start: { kind: 'unknown', date: null },
  };
  delete territory.temporal.support;
  const unknown = engineFor(catalog);
  assert.equal((await unknown.getTerritoriesAtYear(1)).length, 0);
});

test('altın kültür çakışması ve rakip siyasi yorumlar ayrı sonuçlardır', async () => {
  const { catalog, territory } = engineFixture();
  const culture = catalog.records.find((r) => r.kind === 'cultural-region');
  catalog.records.push({ ...structuredClone(culture), id: 'test:overlapping-culture' });
  catalog.records.push({
    ...structuredClone(territory),
    id: 'test:rival',
    interpretationId: 'test:rival-interpretation',
  });
  const engine = engineFor(catalog);
  assert.equal((await engine.getTerritoriesAtYear(-1)).length, 2);
  const coverage = await engine.getDataCoverage(-1, { layers: ['culture'] });
  assert.equal(coverage.records.length, 2);
  assert.equal(coverage.mode, 'documented approximate');
});

test('altın nearest snapshot yalnız açık seçimle; yıl ve kaynak yılı ayrı kalır', async () => {
  const { catalog } = engineFixture();
  const engine = engineFor(catalog);
  assert.equal((await engine.getDataCoverage(1, { layers: ['polity'] })).sourceYear, null);
  const preview = await engine.getDataCoverage(1, {
    layers: ['polity'],
    preview: 'nearest-snapshot',
  });
  assert.equal(preview.selectedYear, 1);
  assert.equal(preview.sourceYear, -1);
  assert.equal(preview.isPreview, true);
  assert.equal(preview.mode, 'documented approximate');
  assert.equal(preview.selectedYearMode, 'no supported historical geography');
  assert.deepEqual(
    (await engine.getAvailableSnapshots({ layers: ['polity'] })).map((x) => x.year),
    [-1],
  );
  assert.equal((await engine.getDataCoverage(1, { layers: ['polity'] })).records.length, 0);
});

test('altın cache sınırlıdır, sürümle ayrılır ve aynı sorguyu tekrar taramaz', async () => {
  const { catalog } = engineFixture();
  let queries = 0;
  const provider = createHistoricalDataProvider(catalog, 'staging');
  const wrapped = {
    ...provider,
    query: async (q) => {
      queries++;
      return provider.query(q);
    },
  };
  const engine = createTimelineEngine(wrapped, { cacheSize: 2 });
  const first = await engine.getEntitiesAtYear(1);
  const initial = queries;
  const scans = engine.cacheInfo().indexScans;
  assert.deepEqual(await engine.getEntitiesAtYear(1), first);
  assert.equal(engine.cacheInfo().indexScans, scans);
  assert.equal(queries, initial);
  await engine.getEntitiesAtYear(-1);
  await engine.getEntitiesAtYear(2);
  assert.ok(engine.cacheInfo().size <= 2);
  assert.equal(engine.catalogVersion, catalog.catalogVersion);
});

test('altın geç gelen eski sorgu ve dispose sonucu yeni seçimi değiştiremez', async () => {
  const latest = createLatestQuery();
  let oldResolve;
  const old = latest.run(
    () =>
      new Promise((resolve) => {
        oldResolve = resolve;
      }),
  );
  const current = await latest.run(async () => 2);
  oldResolve(1);
  assert.equal(await old, null);
  assert.equal(current, 2);
  let resolve;
  const pending = latest.run(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  latest.invalidate();
  resolve(3);
  assert.equal(await pending, null);
});

test('temporal periods şeması çakışma, dış zarf ve snapshot uzatmasını reddeder', () => {
  const value = supported(-2, 2);
  for (const periods of [
    [{ start: date(-3), end: date(-1) }],
    [
      { start: date(-2), end: date(1) },
      { start: date(1), end: date(2) },
    ],
    [{ start: date(2), end: date(-2) }],
  ])
    assert.equal(parse(temporalExtentSchema, { ...value, periods }).ok, false);
  assert.equal(
    parse(temporalExtentSchema, {
      ...value,
      support: { kind: 'snapshot', note: 'SYNTHETIC invalid multiyear snapshot' },
    }).ok,
    false,
  );
});

test('sürekli sınırın ilk/son yılı dahil; tam doğrulanmış ile yaklaşık modlar ayrıdır', async () => {
  const { catalog, territory } = engineFixture();
  territory.temporal = supported(-1, 1);
  territory.boundary = 'documented';
  territory.borderPrecision.classification = 'surveyed';
  territory.confidence.level = 'high';
  const engine = engineFor(catalog);
  for (const year of [-1, 1]) {
    const report = await engine.getDataCoverage(year, { layers: ['polity'] });
    assert.equal(report.mode, 'exact verified');
    assert.equal(report.isPreview, false);
  }
  for (const year of [-2, 2])
    assert.equal(
      (await engine.getDataCoverage(year, { layers: ['polity'] })).mode,
      'no supported historical geography',
    );
  assert.equal(
    (await engine.getDataCoverage(1, { layers: ['polity'], bbox: [20, 20, 30, 30] })).records
      .length,
    0,
  );
  assert.equal((await engine.getDataCoverage(1, { layers: [] })).records.length, 0);
  await assert.rejects(() => engine.getDataCoverage(0));
  await assert.rejects(() => engine.getDataCoverage(1, { layers: ['invented'] }));
  await assert.rejects(() => engine.getAvailableSnapshots({ bbox: [999, 0, 1000, 1] }));
});

test('kesintili sınır sürümleri ve sağlayıcı zarfın boşluğunu doldurmaz', async () => {
  const { catalog, territory } = engineFixture();
  territory.temporal = {
    ...supported(-2, 2),
    periods: [
      { start: date(-2), end: date(-1) },
      { start: date(2), end: date(2) },
    ],
  };
  const second = {
    ...structuredClone(territory),
    id: 'test:gap-version',
    temporal: supported(1, 1, 'snapshot'),
  };
  catalog.records.push(second);
  const engine = engineFor(catalog);
  assert.deepEqual(
    (await engine.getTerritoriesAtYear(1)).map((h) => h.record.id),
    [second.id],
  );
  assert.deepEqual(
    (await engine.getTerritoriesAtYear(-1)).map((h) => h.record.id),
    [territory.id],
  );
});

test('bilinmeyen kişi yaşamı bilinen konumu bile yıllık bulunma kanıtına dönüştürmez', async () => {
  const { catalog } = engineFixture();
  const person = catalog.records.find((r) => r.kind === 'person');
  person.temporal = {
    ...extent(),
    reviewStatus: 'verified',
    start: { kind: 'unknown', date: null },
    end: { kind: 'unknown', date: null },
  };
  const engine = engineFor(catalog);
  assert.equal((await engine.getPersonsAtYear(1)).length, 0);
  assert.equal((await engine.getDataCoverage(1, { layers: ['person'] })).records.length, 0);
  assert.equal((await engine.getAvailableSnapshots({ layers: ['person'] })).length, 0);
});

test('kaynak ay/gün hassasiyeti korunur; bilinmeyen hassasiyete gün saklanamaz', () => {
  const month = {
    ...supported(1, 1, 'snapshot'),
    precision: 'month',
    start: { kind: 'known', date: { year: 1, month: 2, day: null } },
    end: { kind: 'known', date: { year: 1, month: 3, day: null } },
  };
  assert.equal(parse(temporalExtentSchema, month).ok, true);
  assert.equal(describeTemporal(month).start.day, null);
  assert.equal(
    parse(temporalExtentSchema, { ...month, precision: 'unknown', uncertain: true }).ok,
    false,
  );
});

test('snapshot listesi tarihsiz ve incelemesiz kayıtları atar; eşit uzaklıkta eski kaynak yılı seçilir', async () => {
  const { catalog, territory } = engineFixture();
  catalog.records.push({
    ...structuredClone(territory),
    id: 'test:later-snapshot',
    interpretationId: 'test:later',
    temporal: supported(2, 2, 'snapshot'),
  });
  const engine = engineFor(catalog);
  const preview = await engine.getDataCoverage(1, {
    layers: ['polity'],
    preview: 'nearest-snapshot',
  });
  assert.equal(preview.sourceYear, -1); // MÖ 1 -> MS 1 and MS 1 -> MS 2 both one step.
  assert.deepEqual(
    (await engine.getAvailableSnapshots({ layers: ['polity'] })).map((s) => s.year),
    [-1, 2],
  );
  territory.reviewStatus = 'unverified';
  assert.equal((await engineFor(catalog).getTerritoriesAtYear(-1)).length, 0);
});

test('indeks tek kuruluma ait sayfalı veriyi paylaşır ve aşırı katalog bütçesini reddeder', async () => {
  const { catalog } = engineFixture();
  const template = catalog.records.find((r) => r.kind === 'entity');
  for (let i = 0; i < 120; i++)
    catalog.records.push({ ...structuredClone(template), id: `test:extra-${i}` });
  const provider = createHistoricalDataProvider(catalog, 'staging');
  let queries = 0;
  const engine = createTimelineEngine({
    ...provider,
    query: async (q) => {
      queries++;
      return provider.query(q);
    },
  });
  await Promise.all([engine.getEntitiesAtYear(-1), engine.getEntitiesAtYear(1)]);
  assert.equal(queries, 2);
  const tooLarge = createTimelineEngine({
    ...provider,
    query: async () => ({ hits: [], total: 1001, nextOffset: 100 }),
  });
  await assert.rejects(() => tooLarge.getEntitiesAtYear(1), /budget/);
});

test('geç eski hata bastırılır; en yeni sorgunun hatası veri yokluğu sayılmaz', async () => {
  const latest = createLatestQuery();
  let reject;
  const stale = latest.run(
    () =>
      new Promise((_, r) => {
        reject = r;
      }),
  );
  assert.equal(await latest.run(async () => 5), 5);
  reject(new Error('OLD'));
  assert.equal(await stale, null);
  await assert.rejects(
    () =>
      latest.run(async () => {
        throw new Error('CURRENT');
      }),
    /CURRENT/,
  );
});

test('kaynaklı tarihli yer referansı bulunma kanıtı kalır; koordinat üretilmez', async () => {
  const { catalog, presence } = engineFixture();
  presence.geometry = null;
  presence.geometryReason = 'SYNTHETIC TEST: place identity only; no coordinates for presence';
  const engine = engineFor(catalog);
  const person = (await engine.getPersonsAtYear(1))[0];
  assert.equal(person.locations.length, 1);
  assert.equal(person.locationStatus, 'supported');
  assert.equal(person.locations[0].record.geometry, null);
  assert.equal(person.locations[0].record.placeId, 'test:place');
  assert.equal((await engine.getDataCoverage(1, { layers: ['person'] })).records.length, 0);
});
