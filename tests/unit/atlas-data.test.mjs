import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { normalizedPolityParts, CLIO_SOURCE } from '../../scripts/pilot/polities.mjs';
import { preparedPilot, pilotManifest } from '../../src/data/generated/pilot.ts';
import { historicalFeatures, pilotTimeline } from '../../src/data/pilot.ts';
import { normalizePhysical } from '../../src/map/globe/physical-detail.ts';
import { physicalStyle, assertHistoricalMapStyle } from '../../src/map/globe/style.ts';
import { licensePolicy } from '../../src/domain/licensePolicy.ts';
import { externalURL } from '../../src/sources/url-policy.ts';
const facts = JSON.parse(
  await readFile(
    new URL('../../data/pilot/raw/cliopatria-reviewed-rows.json', import.meta.url),
    'utf8',
  ),
);
const parts = preparedPilot.records.filter(
  (r) => r.kind === 'territory' && r.id.startsWith('atlas:clio-'),
);
const positions = (geometry) => {
  const found = [];
  const walk = (v) => {
    if (typeof v[0] === 'number') found.push(JSON.stringify(v));
    else v.forEach(walk);
  };
  walk(geometry.coordinates);
  return found.sort();
};
test('16 reviewed political rows preserve every vertex, source property and documented date; multipart splitting drops no islands', () => {
  assert.equal(facts.rows.length, 16);
  assert.equal(parts.length, 32);
  assert.equal(pilotManifest.polityCoverageIndex.length, 33);
  for (const row of facts.rows) {
    const id = `atlas:clio-r${row.index}`,
      records = parts
        .filter((r) => r.entityId === id)
        .sort((a, b) => Number(a.id.split('-').at(-1)) - Number(b.id.split('-').at(-1)));
    assert.deepEqual(
      records.flatMap((r) => positions(r.geometry)).sort(),
      positions(row.feature.geometry),
    );
    assert.deepEqual(
      normalizedPolityParts(row.feature.geometry),
      records.map((r) => r.geometry),
    );
    for (const r of records) {
      assert.equal(r.temporal.start.date.year, row.feature.properties.FromYear);
      assert.equal(r.temporal.end.date.year, row.feature.properties.ToYear);
      assert.equal(r.temporal.uncertain, true);
      assert.equal(r.temporal.support.kind, 'continuous');
      assert.equal(r.boundary, 'approximate');
      assert.equal(r.confidence.level, 'low');
      assert.equal(r.wikidataId, null);
      assert.equal(r.synthetic, false);
      assert.equal(r.evidence[0].sourceId, CLIO_SOURCE);
    }
  }
  assert.equal(parts.filter((r) => r.entityId === 'atlas:clio-r7267').length, 4);
  assert.equal(parts.filter((r) => r.entityId === 'atlas:clio-r13377').length, 14);
});
test('country reconstructions exist only inside source intervals and independent political visibility; no modern extension', async () => {
  for (const [year, expected] of [
    [-501, 0],
    [-500, 2],
    [-481, 2],
    [-480, 0],
    [1453, 8],
    [2000, 22],
    [2024, 0],
    [2026, 0],
  ]) {
    const view = { year, polity: true, culture: false };
    assert.equal((await historicalFeatures(view, 3)).features.length, expected, String(year));
    assert.equal((await historicalFeatures({ ...view, polity: false }, 3)).features.length, 0);
    if (expected)
      assert.equal((await pilotTimeline.getDataCoverage(year)).mode, 'documented approximate');
  }
  const present = (await historicalFeatures({ year: 2000, polity: true, culture: false }, 3))
    .features;
  assert.equal(new Set(present.map((f) => parts.find((r) => r.id === f.id)?.entityId)).size, 9);
});
test('Cliopatria approval is exact revision/hash/attribution gated, not a blanket permission for all downloaded rows', () => {
  const source = preparedPilot.sources.find((s) => s.id === CLIO_SOURCE);
  const input = preparedPilot.inputs.find((i) => i.sourceId === CLIO_SOURCE);
  assert.equal(licensePolicy(source, input).decision, 'allow');
  for (const [s, i] of [
    [{ ...source, revision: 'latest' }, input],
    [source, { ...input, sha256: '0'.repeat(64) }],
    [{ ...source, id: 'source:other-row' }, input],
  ])
    assert.notEqual(licensePolicy(s, i).decision, 'allow');
});
const physicalFixture = (
  geometry,
  properties = { name: 'SYNTHETIC TEST', ADMIN: 'NOT REAL DATA' },
) => ({ type: 'FeatureCollection', features: [{ type: 'Feature', properties, geometry }] });
const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
};
test('physical-only normalization strips every name, preserves coordinates and rejects political/invalid/empty geometry', () => {
  const land = normalizePhysical(physicalFixture(polygon), 'land');
  assert.deepEqual(land.features[0].properties, {});
  assert.deepEqual(land.features[0].geometry, polygon);
  for (const geometry of [
    { type: 'Point', coordinates: [0, 0] },
    {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [2, 2],
        ],
      ],
    },
    {
      ...polygon,
      coordinates: [
        [
          [181, 0],
          [1, 0],
          [1, 1],
          [181, 0],
        ],
      ],
    },
  ])
    assert.throws(() => normalizePhysical(physicalFixture(geometry), 'land'));
  assert.throws(() =>
    normalizePhysical(physicalFixture({ type: 'MultiLineString', coordinates: [] }), 'rivers'),
  );
  assert.throws(() => normalizePhysical(physicalFixture(polygon), 'rivers'));
});
test('lake/river style remains globe-only, label-free and local; modern names cannot re-enter hydrography', () => {
  const land = normalizePhysical(physicalFixture(polygon), 'land');
  const rivers = normalizePhysical(
    physicalFixture({
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [1, 1],
        ],
      ],
    }),
    'rivers',
  );
  const style = physicalStyle(land, { land, lakes: land, rivers });
  assert.equal(style.projection.type, 'globe');
  assert.equal(style.sources.rivers.type, 'geojson');
  assert.ok(style.layers.find((l) => l.id === 'physical-rivers').minzoom >= 2);
  assert.equal(
    style.layers.some((l) => l.type === 'symbol'),
    false,
  );
  const changed = structuredClone(style);
  changed.sources.lakes.data.features[0].properties.ADMIN = 'MODERN';
  assert.throws(() => assertHistoricalMapStyle(changed), /PHYSICAL_LABEL_POLICY/);
  changed.sources.lakes.data = 'https://example.com/tiles';
  assert.throws(() => assertHistoricalMapStyle(changed), /SOURCE_POLICY/);
});
test('new external source policy is limited to the pinned archive and cannot become arbitrary GitHub navigation or Wikipedia guessing', () => {
  assert.equal(externalURL(facts.archiveSource, 'source'), facts.archiveSource);
  for (const url of [
    facts.archiveSource.replace('v0.2.1', 'main'),
    facts.archiveSource + '?redirect=1',
    facts.archiveSource.replace('cliopatria.geojson.zip', 'anything.html'),
    'https://github.com/other/repo',
  ])
    assert.equal(externalURL(url, 'source'), null);
  assert.equal(externalURL(facts.archiveSource, 'wikipedia'), null);
});

test('split islands produce one discoverable country entry while preserving independent interpretations and every map component', async () => {
  const { politicalRepresentatives } = await import('../../src/politics/selection.ts');
  const year2000 = parts.filter(
    (r) => r.temporal.start.date.year <= 2000 && r.temporal.end.date.year >= 2000,
  );
  const representatives = politicalRepresentatives(year2000);
  assert.equal(representatives.length, 9);
  assert.equal(year2000.length, 22);
  const spain = year2000.filter((r) => r.entityId === 'atlas:clio-r13377');
  const chosen = representatives.find((r) => r.entityId === 'atlas:clio-r13377');
  const { visualSize } = await import('../../src/politics/geometry.ts');
  assert.equal(visualSize(chosen.geometry), Math.max(...spain.map((r) => visualSize(r.geometry))));
  const independent = structuredClone(spain[0]);
  independent.id = 'test:independent-source';
  independent.evidence[0].locator += '; DIFFERENT interpretation';
  assert.equal(politicalRepresentatives([...spain, independent]).length, 2);
});
