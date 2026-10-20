import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';
import { Readable } from 'node:stream';
import { mkdtemp, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readGeoJSONFeatures } from '../../scripts/etl/geojson-stream.mjs';
import {
  inspectCShapesStream,
  inspectCShapesFile,
  cshapesDate,
} from '../../scripts/etl/cshapes-review.mjs';

// All records and geometries below are explicitly SYNTHETIC; no real CShapes
// file is available in this environment and these are never product content.
const shape = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
      [0, 0],
    ],
  ],
};
const feature = (fields = {}) => ({
  type: 'Feature',
  properties: {
    synthetic: true,
    statename: 'SYNTHETIC Ü — ]}, \\"',
    startdate: '1999-01-01',
    enddate: '2001-12-31',
    status: 1,
    gwcode: 'SYNTHETIC',
    ...fields,
  },
  geometry: shape,
});
const gwFeature = (fields = {}) => ({
  type: 'Feature',
  properties: {
    synthetic: true,
    cntry_name: 'SYNTHETIC GW calendar export',
    gwcode: 99999,
    gwsyear: 1999,
    gwsmonth: 1,
    gwsday: 1,
    gweyear: 2000,
    gwemonth: 6,
    gweday: 11,
    gwsdate: '31.12.1998 23:00:00',
    gwedate: '10.06.2000 22:00:00',
    ...fields,
  },
  geometry: shape,
});
const collection = (features, extra = {}) =>
  JSON.stringify({ type: 'FeatureCollection', ...extra, features });
const source = (text, step = 65536) => {
  const buffer = Buffer.from(text);
  return Readable.from(
    (function* () {
      for (let offset = 0; offset < buffer.length; offset += step)
        yield buffer.subarray(offset, offset + step);
    })(),
  );
};
const parse = async (text, options) => {
  const rows = [];
  for await (const f of readGeoJSONFeatures(source(text, 1), options)) rows.push(f);
  return rows;
};

test('streaming GeoJSON handles every-byte Unicode/escape boundaries, root order and empty arrays without guessing nested features', async () => {
  const input = feature();
  assert.deepEqual(
    await parse(
      collection([input], { name: 'SYNTHETIC', foreign: { features: ['not the root array'] } }),
    ),
    [input],
  );
  assert.deepEqual(await parse(JSON.stringify({ features: [input], type: 'FeatureCollection' })), [
    input,
  ]);
  assert.deepEqual(await parse(collection([])), []);
});
test('streaming GeoJSON rejects truncation, trailing JSON, duplicate roots, malformed separators and bounded resource attacks', async () => {
  for (const value of [
    collection([feature()]).slice(0, -1),
    collection([]) + '{}',
    '{"type":"FeatureCollection","features":[],"features":[]}',
    '{"type":"FeatureCollection","features":[{},]}',
    '{"type":"FeatureCollection","features":[],}',
    '{"type":"FeatureCollection","features":[null]}',
    '{"type":"Point","features":[]}',
  ])
    await assert.rejects(() => parse(value));
  await assert.rejects(
    () => parse(collection([feature()]), { limits: { bytes: 32 } }),
    /INPUT_BUDGET/,
  );
  await assert.rejects(
    () => parse(collection([feature()]), { limits: { featureBytes: 32 } }),
    /VALUE_BUDGET/,
  );
  await assert.rejects(
    () =>
      parse(collection([], { name: 'SYNTHETIC'.repeat(40) }), { limits: { metadataBytes: 64 } }),
    /VALUE_BUDGET/,
  );
  await assert.rejects(
    () => parse(collection([feature(), feature()]), { limits: { features: 1 } }),
    /FEATURE_BUDGET/,
  );
  await assert.rejects(
    () => parse(collection([feature()]), { limits: { depth: 2 } }),
    /DEPTH_BUDGET/,
  );
  await assert.rejects(() => parse(collection([]), { limits: { unknown: 5 } }), /LIMIT_CONFIG/);
  const invalidUtf8 = Readable.from([Buffer.from([0xc3, 0x28])]);
  await assert.rejects(async () => {
    for await (const f of readGeoJSONFeatures(invalidUtf8)) void f;
  });
});
test('CShapes candidate inventory keeps exact source dates and partial-year rows but never approves a synthetic file or infers independent countries', async () => {
  const report = await inspectCShapesStream(
    source(
      collection([
        feature(),
        feature({
          statename: 'SYNTHETIC partial',
          startdate: '2000-06-01',
          enddate: '2000-09-01',
          status: 2,
        }),
        feature({ statename: 'SYNTHETIC past', startdate: '1886-01-01', enddate: '1999-12-31' }),
      ]),
      7,
    ),
  );
  assert.equal(report.summary.features, 3);
  assert.equal(report.summary.candidateRows, 2);
  assert.equal(report.summary.candidateGeometryPassed, 2);
  assert.equal(report.candidates[1].yearIntersection, 'partial-year-candidate');
  assert.equal(report.candidates[1].sourceStart, '2000-06-01');
  assert.equal(report.candidates[1].status, 2);
  assert.deepEqual(report.observedDateRange, { earliest: '1886-01-01', latest: '2001-12-31' });
  assert.equal(report.productionAllowed, false);
  assert.equal(report.originAuthenticity, 'UNVERIFIED_LOCAL_INPUT');
  assert.equal(report.datasetClass, 'synthetic-test-data');
  assert.equal(report.reference.publisherDataLicense, 'CC-BY-NC-SA-4.0');
  assert.ok(
    !JSON.stringify(report).includes('"coordinates"'),
    'review output must not export geometry',
  );
  const empty = await inspectCShapesStream(source(collection([])));
  assert.equal(empty.status, 'SCHEMA_REVIEW_REQUIRED');
});
test('CShapes inspector flags schema, CRS, status, invalid dates and invalid geometry; no modern/nearest fallback fills missing years', async () => {
  const unknown = {
    type: 'Feature',
    properties: { name: 'SYNTHETIC unknown schema', from: 1900, to: 2100 },
    geometry: shape,
  };
  const schema = await inspectCShapesStream(source(collection([unknown])));
  assert.equal(schema.status, 'SCHEMA_REVIEW_REQUIRED');
  assert.equal(schema.summary.candidateRows, 0);
  const bad = feature({ startdate: '2000-02-30' });
  const report = await inspectCShapesStream(
    source(
      collection([bad, feature({ status: 99 }), { ...feature(), geometry: null }], {
        crs: { type: 'name', properties: { name: 'EPSG:3857' } },
      }),
    ),
  );
  assert.equal(report.status, 'DATA_REVIEW_REQUIRED');
  assert.equal(report.summary.invalidDateRows, 1);
  assert.equal(report.summary.unsupportedStatusRows, 1);
  assert.equal(report.summary.candidateGeometryReview, 1);
  assert.equal(report.crsStatus, 'CRS_REVIEW_REQUIRED');
  const future = await inspectCShapesStream(source(collection([feature()])), { year: 2026 });
  assert.equal(future.summary.candidateRows, 0);
  assert.equal(future.productionAllowed, false);
  for (const value of [
    '00/01/2000',
    '2000-01-00',
    '2001-02-29',
    '2000-01-01T03:00:00Z',
    '0000-01-01',
    20000101,
  ])
    assert.equal(cshapesDate(value), null);
  assert.equal(cshapesDate('2000-02-29T00:00:00Z'), '2000-02-29');
});

test('observed GW calendar profile preserves unzoned timestamps, missing status and partial-year transitions without approving or shifting dates', async () => {
  const report = await inspectCShapesStream(
    source(
      collection([
        gwFeature(),
        gwFeature({
          gwsyear: 2000,
          gwsmonth: 6,
          gwsday: 12,
          gweyear: 2019,
          gwemonth: 12,
          gweday: 31,
          gwsdate: '11.06.2000 22:00:00',
          gwedate: '30.12.2019 23:00:00',
        }),
        feature(),
      ]),
    ),
  );
  assert.equal(report.inspectionVersion, 2);
  assert.equal(report.summary.features, 3);
  assert.equal(report.summary.supportedSchemaRows, 3);
  assert.equal(report.summary.gwCalendarSchemaRows, 2);
  assert.equal(report.summary.codebookSchemaRows, 1);
  assert.equal(report.summary.unsupportedSchemaRows, 0);
  assert.equal(report.summary.missingStatusRows, 2);
  assert.equal(report.summary.exportedTimestampReviewRows, 2);
  assert.equal(report.status, 'DATA_REVIEW_REQUIRED');
  assert.equal(report.productionAllowed, false);
  assert.equal(report.candidates[0].sourceStart, '1999-01-01');
  assert.equal(report.candidates[0].sourceEnd, '2000-06-11');
  assert.equal(report.candidates[1].sourceStart, '2000-06-12');
  assert.equal(report.candidates[0].sourceDateFields.gwsdate, '31.12.1998 23:00:00');
  assert.equal(report.candidates[0].sourceDateFields.gwsyear, 1999);
  assert.equal(report.candidates[0].status, null);
  assert.equal(report.candidates[0].yearIntersection, 'partial-year-candidate');
  assert.equal(report.candidates[0].schemaProfile, 'observed-gw-calendar-export');
  assert.deepEqual(report.observedDateRange, { earliest: '1999-01-01', latest: '2019-12-31' });
  assert.equal(
    (await inspectCShapesStream(source(collection([gwFeature()])), { year: 2026 })).summary
      .candidateRows,
    0,
  );
});

test('GW calendar profile rejects ambiguous aliases, missing components, impossible or reversed dates and never substitutes display timestamp text', async () => {
  for (const record of [
    gwFeature({ statename: 'SYNTHETIC ambiguous name' }),
    gwFeature({ startdate: '1900-01-01' }),
    gwFeature({ gwsdate: 123 }),
    {
      ...gwFeature(),
      properties: {
        synthetic: true,
        cntry_name: 'SYNTHETIC incomplete',
        gwsyear: 2000,
        gwcode: 99999,
      },
    },
    feature({ cntry_name: 'SYNTHETIC conflicting name' }),
  ]) {
    const report = await inspectCShapesStream(source(collection([record])));
    assert.equal(report.status, 'SCHEMA_REVIEW_REQUIRED');
    assert.equal(report.summary.candidateRows, 0);
    assert.equal(report.productionAllowed, false);
  }
  for (const fields of [
    { gwsyear: '1999' },
    { gwsyear: 0 },
    { gwsmonth: 0 },
    { gwsmonth: 2, gwsday: 30 },
    { gwsyear: 2001 },
    { gwsyear: 2001, gwsmonth: 2, gwsday: 29 },
  ]) {
    const report = await inspectCShapesStream(source(collection([gwFeature(fields)])));
    assert.equal(report.summary.invalidDateRows, 1);
    assert.equal(report.summary.candidateRows, 0);
    assert.deepEqual(report.observedDateRange, { earliest: null, latest: null });
  }
});

// Minimal stored ZIP fixture, independent of the production ZIP reader. No
// external archive builder and no downloaded geometry needed by the tests.
function zip(entries) {
  const local = [],
    central = [];
  let offset = 0;
  const crc = (data) => {
    let c = 0xffffffff;
    for (const byte of data) {
      c ^= byte;
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  };
  for (const [name, text] of entries) {
    const filename = Buffer.from(name),
      data = Buffer.from(text),
      sum = crc(data),
      h = Buffer.alloc(30),
      c = Buffer.alloc(46);
    h.writeUInt32LE(0x04034b50);
    h.writeUInt16LE(20, 4);
    h.writeUInt32LE(sum, 14);
    h.writeUInt32LE(data.length, 18);
    h.writeUInt32LE(data.length, 22);
    h.writeUInt16LE(filename.length, 26);
    c.writeUInt32LE(0x02014b50);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt32LE(sum, 16);
    c.writeUInt32LE(data.length, 20);
    c.writeUInt32LE(data.length, 24);
    c.writeUInt16LE(filename.length, 28);
    c.writeUInt32LE(offset, 42);
    local.push(h, filename, data);
    central.push(c, filename);
    offset += h.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
test('local raw/ZIP inspection hashes and preserves the input, streams one explicit member, and refuses ambiguous, unsafe or symlink inputs', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'atlas-cshapes-synthetic-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const raw = join(directory, 'SYNTHETIC.geojson'),
    archive = join(directory, 'SYNTHETIC.zip'),
    text = collection([feature()]);
  await writeFile(raw, text);
  const input = await inspectCShapesFile(raw);
  assert.equal(input.input.bytes, Buffer.byteLength(text));
  assert.match(input.input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(await readFile(raw, 'utf8'), text);
  await writeFile(archive, zip([['SYNTHETIC.geojson', text]]));
  const zipped = await inspectCShapesFile(archive);
  assert.equal(zipped.input.member, 'SYNTHETIC.geojson');
  assert.equal(zipped.summary.candidateRows, 1);
  assert.deepEqual(zipped.candidates, input.candidates);
  await writeFile(
    archive,
    zip([
      ['a.geojson', text],
      ['b.geojson', text],
    ]),
  );
  await assert.rejects(() => inspectCShapesFile(archive), /SELECT_MEMBER/);
  assert.equal(
    (await inspectCShapesFile(archive, { member: 'b.geojson' })).input.member,
    'b.geojson',
  );
  await writeFile(archive, zip([['../unsafe.geojson', text]]));
  await assert.rejects(() => inspectCShapesFile(archive), /UNSAFE_MEMBER/);
  await writeFile(archive, zip([['wild[1].geojson', text]]));
  await assert.rejects(() => inspectCShapesFile(archive), /UNSAFE_MEMBER/);
  const link = join(directory, 'link.geojson');
  await symlink(raw, link);
  await assert.rejects(() => inspectCShapesFile(link), /FILE_BUDGET/);
  await assert.rejects(() => inspectCShapesFile(raw, { member: 'anything' }), /MEMBER_WITHOUT_ZIP/);
});
