import test from 'node:test';
import assert from 'node:assert/strict';
import { compareReference } from '../../scripts/world/compare-reference.mjs';
import { auditSources } from '../../scripts/world/download-audit-sources.mjs';
import { acquireAllowedSource } from '../../scripts/map-sources.mjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('synthetic interior sampling detects partial mainland coverage and wrong identity even when the anchor is covered', () => {
  const box = (west, east) => ({
    type: 'Polygon',
    coordinates: [
      [
        [west, 0],
        [east, 0],
        [east, 10],
        [west, 10],
        [west, 0],
      ],
    ],
  });
  const fc = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { NAME: 'SYNTHETIC TEST ONLY', WIKIDATAID: 'Q1' },
        geometry: box(0, 10),
      },
    ],
  };
  const source = {
    id: 'test:partial',
    names: [{ value: 'SYNTHETIC TEST ONLY' }],
    geometry: box(0, 6),
    wikidataId: 'Q2',
    reviewStatus: 'verified',
    synthetic: false,
  };
  const before = JSON.stringify(source);
  const [r] = compareReference(fc, [source]);
  assert.equal(r.probes[0].hits.length, 1);
  assert.equal(r.probes[0].identityComparison, 'DIFFERENT_QID_REVIEW_REQUIRED');
  assert.ok(r.interiorProbes.some((p) => p.status === 'NO_SOURCE_POLYGON_AT_REFERENCE_POINT'));
  assert.ok(r.interiorProbes.length <= 26);
  assert.equal(JSON.stringify(source), before);
  assert.equal(r.independentHistoricalCertification, false);
  assert.deepEqual(compareReference(fc, [source]), [r]);
  const [matched] = compareReference(fc, [{ ...source, wikidataId: 'Q1' }]);
  assert.equal(matched.probes[0].identityComparison, 'SAME_QID_NOT_HISTORICALLY_CERTIFIED');
});

test('synthetic reference probes flag a missing island without filling it or certifying the year', () => {
  // SYNTHETIC TEST ONLY; no real country/coordinates in production.
  const ring = (x) => [
    [x, 0],
    [x + 1, 0],
    [x + 1, 1],
    [x, 1],
    [x, 0],
  ];
  const g = { type: 'Polygon', coordinates: [ring(0)] };
  const fc = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { NAME: 'SYNTHETIC' },
        geometry: { type: 'MultiPolygon', coordinates: [[ring(0)], [ring(10)]] },
      },
    ],
  };
  const before = JSON.stringify(fc);
  const [r] = compareReference(fc, [
    { id: 'test:only-mainland', names: [{ value: 'SYNTHETIC' }], geometry: g },
  ]);
  assert.equal(r.probes.length, 2);
  assert.equal(r.probes[0].hits.length, 1);
  assert.equal(r.probes[1].status, 'NO_SOURCE_POLYGON_AT_REFERENCE_POINT');
  assert.equal(r.independentHistoricalCertification, false);
  assert.equal(JSON.stringify(fc), before);
  assert.throws(
    () => compareReference({ type: 'FeatureCollection', features: Array(513).fill(null) }, []),
    /BUDGET/,
  );
  const [bad] = compareReference(
    { type: 'FeatureCollection', features: [{ geometry: { type: 'Point', coordinates: [0, 0] } }] },
    [],
  );
  assert.equal(bad.status, 'REFERENCE_GEOMETRY_REVIEW_REQUIRED');
});
test('audit downloader keeps sources unreviewed, verifies cache offline and rejects arbitrary endpoints', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-audit-test-'));
  const spec = auditSources[0];
  const raw = JSON.stringify({ type: 'FeatureCollection', features: [], syntheticTestOnly: true });
  try {
    const downloaded = await acquireAllowedSource(
      spec,
      dir,
      { fetcher: async () => new Response(raw) },
      auditSources,
    );
    assert.equal(downloaded.status, 'downloaded-unreviewed');
    const cached = await acquireAllowedSource(
      spec,
      dir,
      {
        verifyOnly: true,
        fetcher: async () => {
          throw Error('NETWORK_FORBIDDEN');
        },
      },
      auditSources,
    );
    assert.equal(cached.sha256, downloaded.sha256);
    await assert.rejects(
      acquireAllowedSource(
        { ...spec, url: 'https://example.com/untrusted' },
        dir,
        {},
        auditSources,
      ),
      /NOT_ALLOWLISTED/,
    );
    assert.equal(auditSources.filter((s) => s.license === 'public-domain').length, 2);
    assert.ok(
      auditSources
        .filter((s) => s.file.includes('geoboundaries'))
        .every((s) => s.role === 'license-and-date-review-only'),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
