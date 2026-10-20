import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { sha256 } from '../../scripts/etl/pipeline.mjs';
import { auditOHM, fetchOHM, ohmDate, ohmQuery } from '../../scripts/etl/ohm.mjs';
import { preparedPilot, pilotManifest } from '../../src/data/generated/pilot.ts';
import { historicalFeatures, getPilotRecord, getPilotSource } from '../../src/data/pilot.ts';
import { PILOT_ID, PILOT_VERSION } from '../../src/data/pilot-contract.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { licensePolicy } from '../../src/domain/licensePolicy.ts';
import { physicalStyle } from '../../src/map/globe/style.ts';
import { parseMessage, encode } from '../../src/map-contract/protocol.ts';
import { fixtureCatalog, record } from '../fixtures/historical.mjs';

test('gerçek pilotun olgu/üretim checksumları, snapshot ve sınırlı geometri kapsamı korunur', async () => {
  const result = validateCatalog(preparedPilot);
  assert.equal(result.ok, true);
  const root = new URL('../../data/pilot/production/', import.meta.url);
  for (const artifact of pilotManifest.artifacts) {
    const bytes = await readFile(new URL(artifact.file, root));
    assert.equal(sha256(bytes), artifact.sha256);
    assert.equal(bytes.length, artifact.bytes);
  }
  const raw = await readFile(
    new URL('../../data/pilot/raw/alaska-treaty-facts.json', import.meta.url),
  );
  assert.equal(
    sha256(raw),
    result.value.inputs.find((r) => r.id === 'input:nara-alaska-facts').sha256,
  );
  const facts = JSON.parse(raw.toString('utf8'));
  assert.equal(facts.representation, 'editorial-fact-extraction-not-http-response');
  const boundary = await getPilotRecord(PILOT_ID);
  assert.equal(boundary.synthetic, false);
  const indexed = pilotManifest.coverageIndex.find((r) => r.recordId === boundary.id);
  assert.equal(indexed.sourceId, 'source:nara-alaska-1867');
  assert.equal(indexed.sourceId, boundary.evidence[0].sourceId);
  assert.equal(indexed.sourceRevision, boundary.evidence[0].sourceRevision);
  assert.equal(boundary.temporal.start.date.day, 20);
  assert.equal(boundary.temporal.start.date.month, 6);
  assert.equal(boundary.temporal.start.date.year, 1867);
  assert.deepEqual(boundary.temporal.end.date, boundary.temporal.start.date);
  assert.equal(boundary.borderPrecision.toleranceKm, null);
  assert.equal(boundary.boundary, 'approximate');
  assert.equal(boundary.extentType, 'boundary-segment');
  assert.equal(boundary.politicalStatus, 'treaty-delimitation');
  assert.deepEqual(boundary.geometry.coordinates, [
    [-141, 65],
    [-141, 65.5],
    [-141, 66],
    [-141, 66.5],
    [-141, 67],
    [-141, 67.5],
    [-141, 68],
  ]);
  assert.equal(
    result.value.records.some((entry) => entry.kind === 'cultural-region'),
    false,
  );
  assert.equal(pilotManifest.omissions.completePolityPolygons, 14);
  assert.equal((await getPilotSource()).licenseId, 'CC0-1.0');
});
test('pilot hakkı yalnız incelenmiş kaynak ID/revizyon/hash ile geçer; genel NARA izni verilmez', () => {
  const source = preparedPilot.sources.find((r) => r.id === 'source:nara-alaska-1867'),
    input = preparedPilot.inputs.find((r) => r.id === 'input:nara-alaska-facts');
  assert.equal(licensePolicy(source, input).decision, 'allow');
  for (const [changedSource, changedInput] of [
    [
      { ...source, id: 'source:unreviewed' },
      { ...input, sourceId: 'source:unreviewed' },
    ],
    [
      { ...source, revision: 'new' },
      { ...input, sourceRevision: 'new' },
    ],
    [source, { ...input, sha256: '0'.repeat(64) }],
    [{ ...source, sourceKey: 'historical-basemaps' }, input],
  ])
    assert.notEqual(licensePolicy(changedSource, changedInput).decision, 'allow');
  const v1 = structuredClone(preparedPilot);
  v1.schemaVersion = 1;
  assert.equal(validateCatalog(v1).ok, false, 'v1 is not silently interpreted as v2');
});
test('pilot yıl/layer/LOD sorgusu tek snapshotı gösterir; başka tarihe veya kültüre yaymaz', async () => {
  for (const year of [-2000, 1866, 1868, 2026])
    assert.equal(
      (await historicalFeatures({ year, polity: true, culture: true }, 3)).features.length,
      0,
    );
  const view = { year: 1867, polity: true, culture: true };
  assert.equal((await historicalFeatures(view, 1)).features[0].geometry.coordinates.length, 2);
  assert.equal((await historicalFeatures(view, 3)).features[0].geometry.coordinates.length, 7);
  assert.equal((await historicalFeatures({ ...view, polity: false }, 3)).features.length, 0);
  assert.equal((await historicalFeatures({ ...view, culture: false }, 3)).features.length, 1);
});
test('sınır kesiti/tam alan ve siyasal ilişkiler v2 semantiğinde ayrılır; bölgesel örtüşme korunur', () => {
  const catalog = fixtureCatalog();
  const territory = catalog.records.find((entry) => entry.kind === 'territory');
  const sameEntityOtherRegion = structuredClone(territory);
  sameEntityOtherRegion.id = 'test:other-region';
  sameEntityOtherRegion.scopeId = 'scope:other-region';
  sameEntityOtherRegion.politicalStatus = 'disputed';
  catalog.records.push(sameEntityOtherRegion);
  catalog.records.push(
    record('test:vassalage', {
      kind: 'political-relationship',
      fromEntityId: 'test:entity-KINGDOM',
      toEntityId: 'test:entity-EMPIRE',
      relationship: 'vassalage',
      territoryIds: [],
      description: 'SYNTHETIC vassalage; no real polity claim',
    }),
  );
  assert.equal(validateCatalog(catalog, 'staging').ok, true);
  territory.extentType = 'boundary-segment';
  assert.equal(
    validateCatalog(catalog, 'staging').ok,
    false,
    'area cannot become a line segment by relabeling',
  );
});
test('fiziksel tabanda siyasi yazı/tile yok; kesin/yaklaşık/kültürel çizgi stilleri ayrıdır', () => {
  const style = physicalStyle({ type: 'FeatureCollection', features: [] });
  assert.equal(style.projection.type, 'globe');
  assert.equal(
    style.layers.some((layer) => layer.type === 'symbol'),
    false,
  );
  assert.equal(style.glyphs, undefined);
  assert.equal(style.sprite, undefined);
  assert.ok(Object.values(style.sources).every((source) => source.type === 'geojson'));
  assert.equal(
    style.layers.find((layer) => layer.id === 'polity-documented').paint['line-dasharray'],
    undefined,
  );
  assert.deepEqual(
    style.layers.find((layer) => layer.id === 'polity-approximate').paint['line-dasharray'],
    [3, 2],
  );
  assert.deepEqual(
    style.layers.find((layer) => layer.id === 'culture-uncertain').paint['line-dasharray'],
    [1, 3],
  );
});
test('yeni köprü komutu ve kaynaklı seçim zarfı yıl/katman/ID/sürüm doğrular', () => {
  const event = (type, payload) => ({
    version: 1,
    type,
    payload,
    sessionId: 'test',
    requestId: 'event-1',
  });
  const view = event('catalog.view', {
    year: 1867,
    polity: true,
    culture: false,
    focusPilot: true,
  });
  assert.deepEqual(parseMessage(encode(view), 'command', 'test'), view);
  for (const payload of [
    { ...view.payload, year: 0 },
    { ...view.payload, year: 1867.5 },
    { ...view.payload, script: 'eval' },
    { ...view.payload, polity: 'true' },
  ])
    assert.equal(parseMessage(encode({ ...view, payload }), 'command', 'test'), null);
  const selection = event('entity.selected', { recordId: PILOT_ID, catalogVersion: PILOT_VERSION });
  assert.deepEqual(parseMessage(encode(selection), 'event', 'test'), selection);
  for (const payload of [
    { ...selection.payload, recordId: 'atlas:unknown' },
    { ...selection.payload, catalogVersion: 'old' },
    { ...selection.payload, geometry: [] },
  ])
    assert.equal(parseMessage(encode({ ...selection, payload }), 'event', 'test'), null);
});
const syntheticOHM = () => ({
  elements: [
    {
      type: 'relation',
      id: 1,
      version: 2,
      timestamp: '2026-01-01T00:00:00Z',
      tags: {
        name: 'SYNTHETIC OHM TEST',
        start_date: '0000',
        end_date: '0001',
        license: 'CC0-1.0',
      },
      members: [{ type: 'way', ref: 2, role: 'outer' }],
    },
    {
      type: 'way',
      id: 2,
      version: 3,
      timestamp: '2026-01-01T00:00:00Z',
      tags: {
        license: 'CC-BY-SA-4.0',
        source: 'SYNTHETIC RESTRICTED MEMBER',
        'start_date:edtf': '0000?',
      },
      nodes: [3],
    },
    {
      type: 'node',
      id: 3,
      version: 1,
      timestamp: '2026-01-01T00:00:00Z',
      lat: 0,
      lon: 0,
      tags: {},
    },
  ],
});
test('OHM tüm üye hak/zaman etiketlerini korur; eksik zaman sonsuz geçerlilik olmaz', () => {
  const raw = syntheticOHM(),
    audit = auditOHM(raw, 1);
  assert.equal(audit.productionApproved, false);
  assert.equal(audit.incomplete, false);
  assert.equal(audit.records[1].license.explicit, 'CC-BY-SA-4.0');
  assert.deepEqual(audit.records[1].tags, raw.elements[1].tags);
  assert.equal(audit.records[2].time.end.kind, 'unknown');
  assert.equal(audit.records[0].time.endSemantics, 'exclusive-source-date-not-normalized');
  assert.equal(audit.records[0].time.start.date.year, -1);
  assert.equal(ohmDate('-0001-02-01').date.year, -2);
  assert.equal(ohmDate('1900-02-29').kind, 'review-required');
  assert.equal(ohmDate('c. 1200').kind, 'review-required');
  raw.elements.pop();
  assert.equal(auditOHM(raw, 1).incomplete, true);
  assert.throws(() => auditOHM({ elements: [] }, 1));
  assert.throws(() => ohmQuery(-1));
});
test('OHM alımı sınırlı tekrar/backoff uygular; Retry-After süresini kısaltmaz', async () => {
  let requests = 0;
  const delays = [];
  const result = await fetchOHM(1, {
    fetcher: async () =>
      ++requests === 1
        ? new Response('', { status: 429, headers: { 'Retry-After': '1' } })
        : Response.json(syntheticOHM()),
    wait: async (ms) => {
      delays.push(ms);
    },
  });
  assert.equal(requests, 2);
  assert.deepEqual(delays, [1000]);
  assert.equal(result.audit.productionApproved, false);
  requests = 0;
  await assert.rejects(
    fetchOHM(1, {
      fetcher: async () => {
        requests++;
        return new Response('', { status: 429, headers: { 'Retry-After': '120' } });
      },
      wait: async () => assert.fail('must defer instead of retrying early'),
    }),
    /RETRY_AFTER/,
  );
  assert.equal(requests, 1);
});

test('önizleme köprü alanı yalnız açık boolean kabul eder; varsayılan yıl kaydı taşınmaz', async () => {
  const payload = {
    year: 1868,
    polity: true,
    culture: true,
    focusPilot: false,
    previewSnapshot: true,
  };
  const message = {
    version: 1,
    type: 'catalog.view',
    sessionId: 'test-session',
    requestId: 'command-1',
    payload,
  };
  assert.ok(parseMessage(encode(message), 'command', 'test-session'));
  for (const value of ['true', 1, null]) {
    assert.equal(
      parseMessage(
        encode({ ...message, payload: { ...payload, previewSnapshot: value } }),
        'command',
        'test-session',
      ),
      null,
    );
  }
  const report = await historicalFeatures({ ...payload, previewSnapshot: true }, 3);
  assert.equal(report.features.length, 1);
  assert.equal(report.features[0].properties.sourceYear, 1867);
  assert.equal(report.features[0].properties.preview, true);
  assert.equal(
    (await historicalFeatures({ ...payload, previewSnapshot: false }, 3)).features.length,
    0,
  );
});
