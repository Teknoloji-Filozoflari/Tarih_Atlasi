import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sourceURLMatchesRevision } from '../../src/domain/source-url.ts';
import { externalURL } from '../../src/sources/url-policy.ts';
import { parse, httpsSchema } from '../../src/domain/schema.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { pilotTimeline, historicalFeatures, pilotPersons } from '../../src/data/pilot.ts';
import { publicationPolicyVersion, withheldGeography } from '../../src/data/publication-policy.ts';
import { chunkManifest } from '../../src/data/chunks/generated/manifest.ts';
import { assertManifest } from '../../src/data/chunks/manifest.ts';
import { isAllowedNavigation } from '../../src/map-contract/navigation.ts';
import { auditCoverage } from '../../scripts/qa/coverage.mjs';

test('immutable source URL must match revision, QID when present, and unique title/oldid', () => {
  const source = {
    url: 'https://www.wikidata.org/w/index.php?title=Q1&oldid=123',
    revision: '123',
    wikidataId: 'Q1',
  };
  assert.equal(sourceURLMatchesRevision(source), true);
  assert.equal(
    externalURL('https://archive.artic.edu/van-gogh-bedrooms/timeline', 'source'),
    'https://archive.artic.edu/van-gogh-bedrooms/timeline',
  );
  for (const change of [
    { revision: '124' },
    { wikidataId: 'Q2' },
    { url: source.url + '&oldid=123' },
    { url: source.url + '&title=Q2' },
    { url: source.url.replace('www.wikidata.org', 'example.invalid') },
    { url: source.url.replace('title=Q1', 'title=not-a-qid') },
  ])
    assert.equal(sourceURLMatchesRevision({ ...source, ...change }), false);
  const catalog = structuredClone(preparedPilot);
  const pinned = catalog.sources.find((s) => s.url.includes('oldid='));
  pinned.url = pinned.url.replace(/oldid=\d+/, 'oldid=1');
  const result = validateCatalog(catalog);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((i) => i.code === 'SOURCE_URL_REVISION'));
});
test('source links reject URL parser normalization tricks, credentials, controls and unsafe schemes', () => {
  assert.equal(parse(httpsSchema, 'https://www.wikidata.org/wiki/Q1').ok, true);
  for (const url of [
    'http://www.wikidata.org/wiki/Q1',
    'javascript:alert(1)',
    'https://www.wikidata.org\\evil',
    'https://www.wikidata.org/\nQ1',
    'https://user:pass@www.wikidata.org/wiki/Q1',
    'https://www.wikidata.org:8443/wiki/Q1',
    'https://www.wikidata.org/%00Q1',
    'https://www.wikidata.org/%5cQ1',
  ])
    assert.equal(parse(httpsSchema, url).ok, false, url);
});
test('DOM bootstrap navigation rejects remote/file redirects, query injection and traversal', () => {
  const local = 'file:///android_asset/www.bundle/abcdef012345.html';
  assert.equal(isAllowedNavigation(local, null), true);
  for (const url of [
    local + '?redirect=https://example.invalid',
    local + '#script',
    local.replace('abcdef012345', '%2e%2e/secret'),
    'file:///etc/passwd',
    'https://www.wikidata.org/wiki/Q1',
    'file:///android_asset/www.bundle/evil\\file.html',
  ])
    assert.equal(isAllowedNavigation(url, null), false, url);
  assert.equal(
    isAllowedNavigation(
      'http://localhost:8081/_expo/@dom/map?platform=web',
      'http://localhost:8081',
    ),
    true,
  );
  assert.equal(
    isAllowedNavigation('http://localhost:8082/_expo/@dom/map', 'http://localhost:8081'),
    false,
  );
});
test('review overlay preserves archival provenance but never restores withheld locations via approximate or nearest preview', async () => {
  assert.equal(chunkManifest.publicationPolicyVersion, publicationPolicyVersion);
  assert.throws(
    () => assertManifest({ ...chunkManifest, publicationPolicyVersion: 'old' }),
    /MANIFEST_VERSION/,
  );
  const deniedManifest = structuredClone(chunkManifest);
  deniedManifest.entries[0].recordId = withheldGeography[0];
  assert.throws(() => assertManifest(deniedManifest), /MANIFEST_ENTRY/);
  assert.ok(
    preparedPilot.records.some(
      (r) =>
        r.id === withheldGeography[0] &&
        r.geometry === null &&
        r.geometryReason.includes('WITHHELD:'),
    ),
  );
  for (const year of [1878, 1879, 1880, 1881]) {
    const coverage = await pilotTimeline.getDataCoverage(year, {
      layers: ['person', 'place'],
      includeApproximatePersons: true,
      preview: 'nearest-snapshot',
    });
    assert.deepEqual(
      coverage.records.map((h) => h.record.id),
      ['atlas:einstein-birth'],
    );
    assert.equal(coverage.sourceYear, 1879);
    assert.equal(coverage.isPreview, year !== 1879);
    const direct = await pilotTimeline.getDataCoverage(year, {
      layers: ['person', 'place'],
      includeApproximatePersons: true,
    });
    assert.deepEqual(
      direct.records.map((h) => h.record.id),
      year === 1879 ? ['atlas:einstein-birth'] : [],
    );
    assert.deepEqual(
      (
        await historicalFeatures(
          {
            year,
            polity: false,
            culture: false,
            person: true,
            labels: true,
            includeApproximatePersons: true,
            previewSnapshot: true,
          },
          3,
        )
      ).features.map((f) => f.id),
      ['atlas:einstein-birth'],
    );
  }
  assert.deepEqual((await pilotPersons.PERSON_ALIVE_AT_YEAR(1880)).map((p) => p.id).sort(), [
    'atlas:person-einstein',
    'atlas:van-gogh',
  ]);
  assert.ok((await pilotPersons.detail('atlas:van-gogh', 1880)).locations.length);
  assert.equal(
    chunkManifest.entries.some((e) => withheldGeography.includes(e.recordId)),
    false,
  );
});
test('whole selectable timeline coverage is counted without turning life periods into geography', async () => {
  const report = await auditCoverage();
  assert.equal(report.selectableYears, 2000 + new Date().getFullYear());
  assert.equal(report.counts.withheldGeographyRecords, 2);
  assert.equal(report.counts.defaultGeographyYears, 154);
  assert.equal(report.counts.optInGeographyYears, 169);
  assert.deepEqual(
    report.supportedGeographyYears.map((y) => y.year),
    [
      ...Array.from({ length: 20 }, (_, i) => -500 + i),
      ...Array.from({ length: 53 }, (_, i) => 1415 + i),
      ...Array.from({ length: 11 }, (_, i) => 622 + i),
      1066,
      1071,
      1468,
      1506,
      1643,
      1879,
      1526,
      1915,
      1916,
      1867,
      ...Array.from({ length: 75 }, (_, i) => 1949 + i),
    ].sort((a, b) => a - b),
  );
  assert.equal(report.counts.fullPolityPolygons, 14);
  assert.equal(report.counts.culturalGeometries, 0);
  assert.equal(report.counts.missingAttributions, 0);
  assert.equal(report.counts.anyLifePeriodYears, 567);
  assert.ok(!report.supportedGeographyYears.some((y) => [0, 1880, 2024, 2026].includes(y.year)));
});
