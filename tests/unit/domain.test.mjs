import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse } from '../../src/domain/schema.ts';
import {
  historicalDateSchema,
  ordinalYear,
  temporalExtentSchema,
  temporalRange,
} from '../../src/domain/temporal.ts';
import { featureCollectionSchema, geometrySchema } from '../../src/domain/geometry.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { licensePolicy } from '../../src/domain/licensePolicy.ts';
import {
  createHistoricalDataProvider,
  loadHistoricalDataProvider,
} from '../../src/data/provider.ts';
import {
  extent,
  fixtureCatalog,
  polygon,
  record,
  simulateReviewed,
} from '../fixtures/historical.mjs';
import { sha256 } from '../../scripts/etl/pipeline.mjs';

function rejected(value, code, mode = 'staging') {
  const result = validateCatalog(value, mode);
  assert.equal(result.ok, false);
  if (code)
    assert.ok(
      result.issues.some((entry) => entry.code === code),
      JSON.stringify(result.issues),
    );
}
test('domain şeması bütün sentetik kayıt türlerini kabul eder; üretim sentetiği reddeder', () => {
  const catalog = fixtureCatalog();
  assert.equal(validateCatalog(catalog, 'staging').ok, true);
  rejected(catalog, 'SYNTHETIC_PRODUCTION', 'production');
  const hypothesis = simulateReviewed(catalog);
  hypothesis.records[0].reviewStatus = 'unverified';
  rejected(hypothesis, 'UNVERIFIED_PRODUCTION', 'production');
  for (const mutate of [
    (x) => delete x.records[0].attribution,
    (x) => {
      x.records[0].attribution = '';
    },
    (x) => {
      x.records[0].id = x.records[1].id;
    },
    (x) => {
      x.records[0].unknownField = true;
    },
    (x) => {
      x.schemaVersion = 999;
    },
    (x) => {
      x.records[0].wikidataId = 'https://wikipedia.org/fake';
    },
    (x) => {
      x.records[0].names = [];
    },
  ]) {
    const copy = fixtureCatalog();
    mutate(copy);
    rejected(copy);
  }
});
test('MÖ/MS, hassasiyet, gerçek takvim günü ve belirsizlik ayrı doğrulanır', () => {
  assert.equal(ordinalYear(1) - ordinalYear(-1), 1);
  assert.throws(() => ordinalYear(0));
  for (const date of [
    { year: 0, month: null, day: null },
    { year: 1900, month: 2, day: 29 },
    { year: 1, month: null, day: 1 },
    { year: 2000, month: 4, day: 31 },
  ])
    assert.equal(parse(historicalDateSchema, date).ok, false);
  assert.equal(parse(historicalDateSchema, { year: 2000, month: 2, day: 29 }).ok, true);
  const uncertain = extent();
  uncertain.start = { kind: 'unknown', date: null };
  assert.equal(parse(temporalExtentSchema, uncertain).ok, true);
  assert.equal(temporalRange(uncertain).start, null);
  uncertain.start.kind = 'unbounded';
  assert.equal(temporalRange(uncertain).start, -Infinity);
  const inverted = extent(2, -2);
  assert.equal(parse(temporalExtentSchema, inverted).ok, false);
  const wrongPrecision = extent();
  wrongPrecision.start.date.month = 2;
  assert.equal(parse(temporalExtentSchema, wrongPrecision).ok, false);
  const hiddenUnknown = extent();
  hiddenUnknown.end = { kind: 'unknown', date: null };
  hiddenUnknown.uncertain = false;
  assert.equal(parse(temporalExtentSchema, hiddenUnknown).ok, false);
});
test('GeoJSON CRS84, dört geometri türü ve kaynaklı feature kimliği doğrulanır', () => {
  const geometries = [
    polygon(),
    { type: 'Point', coordinates: [180, 90] },
    {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
        [2, 1],
      ],
    },
    {
      type: 'MultiPolygon',
      coordinates: [
        polygon().coordinates,
        [
          [
            [10, 0],
            [11, 0],
            [11, 1],
            [10, 0],
          ],
        ],
      ],
    },
  ];
  for (const geometry of geometries)
    assert.equal(parse(geometrySchema, geometry).ok, true, JSON.stringify(geometry));
  const collection = {
    type: 'FeatureCollection',
    features: geometries.map((geometry, index) => ({
      type: 'Feature',
      id: `test:feature-${index}`,
      properties: { recordId: `test:feature-${index}` },
      geometry,
    })),
  };
  assert.equal(parse(featureCollectionSchema, collection).ok, true);
  collection.features[0].properties.recordId = 'test:other';
  assert.equal(parse(featureCollectionSchema, collection).ok, false);
  for (const bad of [
    null,
    { type: 'Point', coordinates: [1, 100] },
    { type: 'Point', coordinates: [Infinity, 1] },
    { type: 'Point', coordinates: [1, 2, 3] },
    { type: 'Polygon', coordinates: [] },
    { ...polygon(), crs: { name: 'EPSG:4326' } },
  ])
    assert.equal(parse(geometrySchema, bad).ok, false);
});
test('topoloji: açık/ters/kesişen halkalar, dış delikler, örtüşme ve detay bütçesi reddedilir', () => {
  const cases = [
    [
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4],
          ],
        ],
      },
      'UNCLOSED_RING',
    ],
    [{ type: 'Polygon', coordinates: [polygon().coordinates[0].toReversed()] }, 'RING_WINDING'],
    [
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [4, 4],
            [0, 4],
            [4, 0],
            [0, 0],
          ],
        ],
      },
      'TOPOLOGY_INTERSECTION',
    ],
    [
      {
        type: 'Polygon',
        coordinates: [
          ...polygon().coordinates,
          [
            [10, 10],
            [10, 11],
            [11, 11],
            [11, 10],
            [10, 10],
          ],
        ],
      },
      'HOLE_OUTSIDE',
    ],
    [
      {
        type: 'MultiPolygon',
        coordinates: [
          polygon().coordinates,
          [
            [
              [1, 1],
              [2, 1],
              [2, 2],
              [1, 1],
            ],
          ],
        ],
      },
      'MULTIPOLYGON_OVERLAP',
    ],
    [
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [2, 0],
          [1, 0],
        ],
      },
      'TOPOLOGY_OVERLAP',
    ],
    [
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0, 0],
        ],
      },
      'ZERO_EDGE',
    ],
    [
      {
        type: 'MultiPolygon',
        coordinates: Array.from({ length: 16 }, () => [Array.from({ length: 100 }, () => [0, 0])]),
      },
      'EXCESSIVE_DETAIL',
    ],
  ];
  for (const [geometry, code] of cases) {
    const result = parse(geometrySchema, geometry);
    assert.equal(result.ok, false, code);
    assert.ok(
      result.issues.some((entry) => entry.code === code),
      `${code}: ${JSON.stringify(result.issues)}`,
    );
  }
  const holes = {
    type: 'Polygon',
    coordinates: [
      ...polygon().coordinates,
      [
        [1, 1],
        [1, 3],
        [3, 3],
        [3, 1],
        [1, 1],
      ],
    ],
  };
  assert.equal(parse(geometrySchema, holes).ok, true);
  const detailed = {
    type: 'LineString',
    coordinates: Array.from({ length: 600 }, (_, index) => [index / 1000, 0]),
  };
  const budget = parse(geometrySchema, detailed);
  assert.equal(budget.ok, false);
  assert.ok(budget.issues.some((entry) => entry.code === 'TOPOLOGY_BUDGET'));
});
test('antimeridyen bölünmeden reddedilir; iki tarafta açıkça bölünmüş alan geçer', () => {
  const bad = parse(geometrySchema, {
    type: 'LineString',
    coordinates: [
      [179, 0],
      [-179, 1],
    ],
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.issues[0].code, 'ANTIMERIDIAN_UNSPLIT');
  assert.equal(
    parse(geometrySchema, {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [179, 0],
            [180, 0],
            [180, 1],
            [179, 0],
          ],
        ],
        [
          [
            [-180, 0],
            [-179, 0],
            [-179, 1],
            [-180, 0],
          ],
        ],
      ],
    }).ok,
    true,
  );
});
test('üretim hak kapısı: bilinmeyen/yasak/atıfsız/manuel inceleme bekleyen kaynak reddedilir', () => {
  const reviewed = simulateReviewed(fixtureCatalog());
  assert.equal(
    validateCatalog(reviewed, 'production').ok,
    true,
    'isolated SYNTHETIC policy simulation only',
  );
  for (const sourceKey of ['unknown', 'historical-basemaps', 'euratlas', 'cshapes']) {
    const copy = structuredClone(reviewed);
    copy.sources[0].sourceKey = sourceKey;
    rejected(copy, 'LICENSE_DISALLOWED', 'production');
  }
  const source = reviewed.sources[0],
    input = reviewed.inputs[0];
  assert.equal(licensePolicy({ ...source, licenseId: 'GPL-3.0' }, input).decision, 'disallowed');
  assert.equal(licensePolicy({ ...source, attribution: '' }, input).decision, 'disallowed');
  assert.equal(licensePolicy({ ...source, licenseScope: 'article' }, input).decision, 'disallowed');
  assert.equal(
    licensePolicy(
      {
        ...source,
        sourceKey: 'openhistoricalmap',
        objectLicense: 'CC0-1.0',
        membersReviewed: true,
      },
      input,
    ).decision,
    'manual-review',
  );
  const changed = structuredClone(reviewed);
  changed.records[0].attribution = 'Atıf silindi';
  rejected(changed, 'RIGHTS_MISMATCH', 'production');
});
test('provenance revizyon/ham girdi/türetim/üst kaynak zinciri kaybolamaz veya aklanamaz', () => {
  for (const [mutate, code] of [
    [
      (x) => {
        x.records[0].evidence[0].sourceRevision = 'wrong';
      },
      'EVIDENCE_REFERENCE',
    ],
    [
      (x) => {
        x.records[0].evidence[0].basis = 'derived';
      },
      'DERIVATION_MISSING',
    ],
    [
      (x) => {
        x.records[0].temporal.basis = 'derived';
      },
      'TEMPORAL_DERIVATION',
    ],
    [
      (x) => {
        x.sources[0].upstreamIds = ['test:missing'];
      },
      'SOURCE_REFERENCE',
    ],
    [
      (x) => {
        x.sources[0].upstreamIds = ['test:source'];
      },
      'SOURCE_CYCLE',
    ],
    [
      (x) => {
        x.inputs[0].sourceRevision = 'wrong';
      },
      'INPUT_SOURCE',
    ],
    [
      (x) => {
        x.inputs[0].relativePath = '../escape';
      },
      'RAW_PATH',
    ],
  ]) {
    const copy = fixtureCatalog();
    mutate(copy);
    rejected(copy, code);
  }
  const copy = simulateReviewed(fixtureCatalog());
  const upstream = {
    ...structuredClone(copy.sources[0]),
    id: 'test:blocked',
    sourceKey: 'historical-basemaps',
    rawInputId: 'test:blocked-raw',
  };
  copy.sources.push(upstream);
  copy.sources[0].upstreamIds.push(upstream.id);
  copy.inputs.push({ ...copy.inputs[0], id: 'test:blocked-raw', sourceId: upstream.id });
  rejected(copy, 'LICENSE_DISALLOWED', 'production');
});
test('kültür/siyaset ve yaşam yeri/zamanlı bulunma ayrımı ile tarih çelişkileri korunur', () => {
  const variants = [
    [
      (x) => {
        x.records.find((r) => r.kind === 'cultural-region').entityId = 'test:entity-POLITY';
      },
      'SEMANTIC_REFERENCE',
    ],
    [
      (x) => {
        x.records.find((r) => r.id === 'test:biography').locationType = 'timed-presence';
      },
      'PERSON_LOCATION_CLASS',
    ],
    [
      (x) => {
        x.records.find((r) => r.id === 'test:presence').temporal.start = {
          kind: 'unknown',
          date: null,
        };
      },
      'TIMED_PRESENCE_DATE',
    ],
    [
      (x) => {
        x.records.find((r) => r.id === 'test:presence').evidence[0].claims = [
          'identity',
          'temporal',
          'geometry',
        ];
      },
      'PERSON_LOCATION_SOURCE',
    ],
    [
      (x) => {
        x.records.find((r) => r.id === 'test:presence').temporal = extent(100, 101);
      },
      'PERSON_DATE_CONFLICT',
    ],
    [
      (x) => {
        x.records.find((r) => r.id === 'test:presence').temporal = extent(-3, 1);
      },
      'PERSON_DATE_CONFLICT',
    ],
    [
      (x) => {
        const location = x.records.find((r) => r.id === 'test:presence');
        const separate = {
          ...structuredClone(location.evidence[0]),
          locator: 'SYNTHETIC unrelated general place',
          claims: ['location'],
        };
        location.evidence[0].claims = ['identity', 'temporal', 'geometry'];
        location.evidence.push(separate);
      },
      'TIMED_PRESENCE_EVIDENCE',
    ],
    [
      (x) => {
        const r = structuredClone(x.records.find((r) => r.kind === 'territory'));
        r.id = 'test:overlap';
        x.records.push(r);
      },
      'TERRITORY_DATE_CONFLICT',
    ],
    [
      (x) => {
        x.records.find((r) => r.kind === 'coverage').recordCount = 5;
      },
      'COVERAGE_COUNT',
    ],
    [
      (x) => {
        x.records.find((r) => r.id === 'test:event').geometry = null;
      },
      'GEOMETRY_REASON',
    ],
  ];
  for (const [mutate, code] of variants) {
    const copy = fixtureCatalog();
    mutate(copy);
    rejected(copy, code);
  }
});
test('tarih/coğrafya indeksleri MÖ/MS, antimeridyen, belirsizlik, sayfalama ve değişmez snapshot sağlar', async () => {
  const input = fixtureCatalog();
  const provider = createHistoricalDataProvider(input, 'staging');
  const query = { startYear: -1, endYear: 1, kinds: ['person-location'], includeUncertain: true };
  assert.deepEqual(
    (await provider.query(query)).hits.map((h) => h.record.id),
    ['test:presence'],
  );
  const all = await provider.query({ ...query, includeBiographical: true, limit: 1 });
  assert.equal(all.total, 2);
  assert.equal(all.nextOffset, 1);
  assert.equal(all.hits[0].temporalMatch, 'biographical');
  assert.equal((await provider.query({ ...query, includeUncertain: false })).total, 0);
  input.records[0].names[0].value = 'MUTATED';
  assert.notEqual((await provider.getById(input.records[0].id)).names[0].value, 'MUTATED');
  assert.throws(() => {
    all.hits[0].record.names[0].value = 'MUTATED';
  }, TypeError);
  assert.equal(await provider.getById('test:missing'), null);
  assert.equal((await provider.getSource('test:source')).revision, 'synthetic-rev-1');
  assert.equal(
    (await provider.query({ startYear: 10, endYear: 20, includeUncertain: true })).total,
    0,
  );
  const crossing = fixtureCatalog();
  crossing.records.push(
    record('test:dateline', {
      kind: 'event',
      entityId: 'test:entity-EVENT',
      eventType: 'OTHER',
      participantIds: [],
      locationSemantics: 'representative',
      geometry: { type: 'Point', coordinates: [179, 0] },
      geometryReason: null,
    }),
  );
  const indexed = createHistoricalDataProvider(crossing, 'staging');
  assert.deepEqual(
    (
      await indexed.query({
        startYear: -1,
        endYear: 1,
        includeUncertain: true,
        bbox: [170, -5, -170, 5],
      })
    ).hits.map((h) => h.record.id),
    ['test:dateline'],
  );
  await assert.rejects(provider.query({ startYear: 0, endYear: 1 }));
  await assert.rejects(provider.query({ startYear: 1, endYear: 1, limit: 10000 }));
  const unknown = fixtureCatalog();
  unknown.records.find((r) => r.id === 'test:event').temporal.start = {
    kind: 'unknown',
    date: null,
  };
  const possible = await createHistoricalDataProvider(unknown, 'staging').query({
    startYear: -100,
    endYear: -99,
    includeUncertain: true,
  });
  assert.equal(possible.hits[0].temporalMatch, 'possible');
});
test('yükleyici checksum ve şema kapısını geçmeden provider oluşturmaz', async () => {
  let hashed = false;
  await assert.rejects(
    loadHistoricalDataProvider('界'.repeat(1400000), '0'.repeat(64), async () => {
      hashed = true;
      return '0'.repeat(64);
    }),
    /size rejected/,
  );
  assert.equal(hashed, false, 'UTF-8 byte cap runs before hashing; no TextEncoder dependency');
  const empty = { ...fixtureCatalog(), sources: [], records: [], inputs: [], transformations: [] };
  const bytes = JSON.stringify(empty);
  assert.equal(
    (await loadHistoricalDataProvider(bytes, sha256(bytes), async (x) => sha256(x))).catalogVersion,
    empty.catalogVersion,
  );
  await assert.rejects(
    loadHistoricalDataProvider(bytes, '0'.repeat(64), async (x) => sha256(x)),
    /checksum/,
  );
  await assert.rejects(loadHistoricalDataProvider('{bad', sha256('{bad'), async (x) => sha256(x)));
  const synthetic = JSON.stringify(fixtureCatalog());
  await assert.rejects(
    loadHistoricalDataProvider(synthetic, sha256(synthetic), async (x) => sha256(x)),
    /catalog rejected/,
  );
});

test('coğrafya indeksi ±180° eşdeğerliğini ve kesin hücre sınırlarını kaçırmaz', async () => {
  const catalog = fixtureCatalog();
  for (const [id, coordinates] of [
    ['test:east-seam', [180, 0]],
    ['test:west-seam', [-180, 0]],
    ['test:grid-boundary', [30, 30]],
  ]) {
    catalog.records.push(
      record(id, {
        kind: 'event',
        entityId: 'test:entity-EVENT',
        eventType: 'OTHER',
        participantIds: [],
        locationSemantics: 'representative',
        geometry: { type: 'Point', coordinates },
        geometryReason: null,
      }),
    );
  }
  const provider = createHistoricalDataProvider(catalog, 'staging');
  const query = { startYear: -1, endYear: 1, includeUncertain: true, kinds: ['event'] };
  for (const longitude of [-180, 180]) {
    const result = await provider.query({ ...query, bbox: [longitude, -1, longitude, 1] });
    assert.deepEqual(
      result.hits.map((hit) => hit.record.id),
      ['test:east-seam', 'test:west-seam'],
    );
  }
  assert.deepEqual(
    (await provider.query({ ...query, bbox: [30, 30, 30, 30] })).hits.map((hit) => hit.record.id),
    ['test:grid-boundary'],
  );
  rejected(catalog, 'VALIDATION_MODE', 'unknown');
});
