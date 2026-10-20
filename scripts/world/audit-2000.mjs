import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { assertWorldManifest } from '../../src/data/world/manifest.ts';
import { worldNames } from '../../src/data/world/names.ts';
import { WORLD_SOURCE, WORLD_ATTRIBUTION } from '../../src/data/world/types.ts';
import { identityReviewByIndex, identityReviews } from './identity-review.mjs';

assertWorldManifest(worldManifest);
const root = new URL('../../', import.meta.url);
const imported = JSON.parse(
  await readFile(new URL('docs/reports/world-coverage/import-report.json', root), 'utf8'),
);
assert.equal(imported.archiveSha256, worldManifest.archiveSha256);
const year = 2000;
const rows = worldManifest.rows.filter((r) => r.start <= year && r.end >= year);
const report = {
  reviewedAt: '2026-10-17',
  year,
  sourceId: WORLD_SOURCE,
  archiveSha256: worldManifest.archiveSha256,
  metadataRevision: worldManifest.revision,
  attribution: WORLD_ATTRIBUTION,
  scope:
    'All 192 source POLITY rows intersecting MS 2000 were inventoried. This is not a list of 192 independent countries, nor independent historical/geometric certification of every row.',
  counts: {
    sourcePoliticalRows: rows.length,
    drawable: rows.filter((r) => r.pack !== null || r.legacy).length,
    withheld: rows.filter((r) => r.withheld).length,
    newNamePeriodFindingsAtYear: rows.filter((r) => identityReviewByIndex.has(r.index)).length,
    sourceRowsAcceptedWithIsolatedTangentHolePairs: imported.tangentHoleRows.length,
  },
  greece: {
    index: 13502,
    geometrySha256: rows.find((r) => r.index === 13502).key,
    issue:
      'False rejection of two isolated tangent hole pairs. No new points or boundary repair; source MultiPolygon is retained.',
    reference: 'https://locationtech.github.io/jts/javadoc/org/locationtech/jts/geom/Polygon.html',
  },
  jordan: {
    index: 13443,
    label: 'Ürdün Krallığı',
    finding: 'A monarchy is not inherently an anachronism in MS 2000. Jordan is retained.',
    references: [
      'https://jordan.gov.jo/EN/Pages/Hashemite_Monarchs_of_Jordan',
      'https://www.rhc.jo/en/jordans-governing-system',
    ],
  },
  rows: rows.map((r) => ({
    sourceFeatureIndex: r.index,
    sourceName: r.name,
    displayName: worldNames[r.name] ?? r.name,
    sourceInterval: { start: r.start, end: r.end },
    boundaryStatus: r.withheld ? 'WITHHELD' : 'SOURCE_RECONSTRUCTION',
    reason: r.withheld,
    identityEvidenceStatus: identityReviewByIndex.has(r.index)
      ? 'CONTRADICTORY_SOURCE_NAME_PERIOD'
      : r.index === 13443
        ? 'JORDAN_MONARCHY_CORROBORATED_NOT_BOUNDARY_CERTIFICATION'
        : 'NO_INDEPENDENT_IDENTITY_OR_SOVEREIGNTY_CERTIFICATION',
    references: identityReviewByIndex.get(r.index)?.references ?? [],
    aggregateOrDependencyStatus: 'NOT_CLASSIFIED_AS_AN_INDEPENDENT_COUNTRY',
    geometrySha256: r.key,
  })),
  newIdentityFindings: identityReviews,
};
assert.deepEqual(
  [report.counts.sourcePoliticalRows, report.counts.drawable, report.counts.withheld],
  [192, 179, 13],
);
assert.ok(report.greece.geometrySha256);
assert.equal(rows.find((r) => r.index === 13443).withheld, null);
await mkdir(new URL('docs/reports/country-data-audit/', root), { recursive: true });
await writeFile(
  new URL('docs/reports/country-data-audit/ms2000.json', root),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    { pass: true, ...report.counts, greece: report.greece.geometrySha256, jordan: 'retained' },
    null,
    2,
  ),
);
