// Read-only source audit. Diagnostic probes are not production locations/borders.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { assertWorldManifest } from '../../src/data/world/manifest.ts';
import {
  containsPoliticalPoint,
  politicalAnchor,
  visualSize,
} from '../../src/politics/geometry.ts';
import { polityWikidataId } from '../../src/sources/polity-identity.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { acquireAllowedSource } from '../map-sources.mjs';
import { auditSources } from './download-audit-sources.mjs';
import { compareReference } from './compare-reference.mjs';

const root = new URL('../../', import.meta.url);
const output = new URL('docs/reports/world-data-audit/', root);
const hash = (v) => createHash('sha256').update(v).digest('hex');
assertWorldManifest(worldManifest);
const repo = createWorldRepository(worldManifest, (_, p) =>
  readFile(new URL(`assets/world/${p.sha256}.atlas`, root), 'utf8'),
);
const archive = new URL('data/staging/map-sources/cliopatria-v0.2.1.geojson.zip', root);
assert.equal((await stat(archive)).size, 46005176);
assert.equal(hash(await readFile(archive)), worldManifest.archiveSha256);
const child = spawn('unzip', [
  '-p',
  fileURLToPath(archive),
  'cliopatria_polities_only_v021.geojson',
]);
child.stderr.resume();
const done = new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ZIP_EXIT_${code}`))));
});
void done.catch(() => {});
const timer = setTimeout(() => child.kill(), 120000);
const metadata = new Map(),
  focus = [];
let index = 0,
  bytes = 0;
try {
  for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
    bytes += Buffer.byteLength(line);
    if (line.length > 8 * 1024 * 1024 || bytes > 180 * 1024 * 1024) throw Error('SOURCE_SIZE');
    if (!line.startsWith('{ "type": "Feature"')) continue;
    const i = index++;
    if (index > 15000) throw Error('SOURCE_COUNT');
    const f = JSON.parse(line.replace(/,\s*$/, ''));
    metadata.set(i, f.properties);
    if ([7187, 7251, 7267, 13749, 13750].includes(i)) {
      focus.push({
        index: i,
        properties: f.properties,
        geometrySha256: hash(JSON.stringify(f.geometry)),
        components: (f.geometry.type === 'Polygon'
          ? [f.geometry.coordinates]
          : f.geometry.coordinates
        ).map((p) => ({
          positions: p.flat().length,
          bbox: [
            Math.min(...p[0].map((v) => v[0])),
            Math.min(...p[0].map((v) => v[1])),
            Math.max(...p[0].map((v) => v[0])),
            Math.max(...p[0].map((v) => v[1])),
          ],
        })),
        diagnosticIstanbulPoint: {
          lonLat: [28.98, 41.01],
          contained: containsPoliticalPoint(f.geometry, [28.98, 41.01]),
        },
      });
    }
  }
  await done;
} finally {
  clearTimeout(timer);
  child.kill();
}
assert.equal(index, 13797);
const yearly = [];
for (let year = -2000; year <= new Date().getUTCFullYear(); year++) {
  if (year === 0) continue;
  yearly.push({ year, ...repo.summary(year) });
}
const reasons = {};
for (const r of repo.reviewedRows)
  if (r.withheld) reasons[r.withheld] = (reasons[r.withheld] ?? 0) + 1;
const group = new Map();
for (const [i, p] of metadata) {
  if (p.Type !== 'POLITY' || !p.Wikidata) continue;
  const names = group.get(p.Wikidata) ?? new Map();
  const values = names.get(p.Name) ?? [];
  values.push(i);
  names.set(p.Name, values);
  group.set(p.Wikidata, names);
}
const reusedIdentities = [...group]
  .filter(([, n]) => n.size > 1)
  .map(([qid, n]) => ({
    qid,
    names: [...n].map(([name, indices]) => ({ name, indices })),
    status: 'REVIEW_CANDIDATE_NOT_PROVEN_ERROR',
  }));
const shapes = (g) => ({
  components: g.type === 'Polygon' ? 1 : g.coordinates.length,
  positions: g.coordinates.flat(Infinity).length / 2,
  planarSquareDegrees: visualSize(g),
});
const old = await repo.territories(2023);
const now = await repo.territories(2024);
const previous = new Map(old.map((r) => [r.entityId, r]));
const inventory = repo.rowsAt(2024).map((row) => {
  const record = now.find((r) => r.id === `world:clio-r${row.index}`),
    prior = record && previous.get(record.entityId);
  const metric = record ? shapes(record.geometry) : null,
    before = prior ? shapes(prior.geometry) : null;
  const anchor = record ? politicalAnchor(record.geometry) : null;
  return {
    index: row.index,
    name: row.name,
    sourceName: metadata.get(row.index).Name,
    sourceQid: metadata.get(row.index).Wikidata,
    effectiveQid: record ? polityWikidataId(record) : null,
    interval: [row.start, row.end],
    bbox: row.bbox,
    reason: row.withheld,
    drawable: !!record,
    extentType: record?.extentType ?? null,
    geometry: metric,
    previous2023: prior ? { id: prior.id, ...before } : null,
    componentLoss: !!(metric && before && metric.components < before.components),
    planarAreaRatio:
      metric && before?.planarSquareDegrees
        ? metric.planarSquareDegrees / before.planarSquareDegrees
        : null,
    anchorOverlaps: anchor
      ? now
          .filter((r) => r.id !== record.id && containsPoliticalPoint(r.geometry, anchor))
          .map((r) => ({ id: r.id, name: r.names[0].value }))
      : [],
    independentHistoricalCertification: false,
  };
});
const probes = [];
for (const year of [1440, 1452, 1453, 1454, 2010, 2023, 2024]) {
  const records = [
    ...(await repo.territories(year)),
    ...preparedPilot.records.filter(
      (r) =>
        r.kind === 'territory' &&
        r.geometry &&
        r.temporal.start.kind === 'known' &&
        r.temporal.end.kind === 'known' &&
        r.temporal.start.date.year <= year &&
        r.temporal.end.date.year >= year,
    ),
  ];
  for (const [label, point] of [
    ['istanbul-inspection', [28.98, 41.01]],
    ['istanbul-inland-inspection', [28.8, 41.1]],
    ['syria-northeast-inspection', [41, 37]],
    ['syria-north-inspection', [38, 36.8]],
    ['syria-interior-inspection', [39, 36]],
    ['cabinda-inspection', [12.3, -5.5]],
  ]) {
    probes.push({
      year,
      label,
      lonLat: point,
      hits: records
        .filter((r) => containsPoliticalPoint(r.geometry, point))
        .map((r) => ({ id: r.id, name: r.names[0].value })),
    });
  }
}
const referenceChecks = [];
for (const spec of auditSources.filter((s) => s.license === 'public-domain')) {
  const dir = fileURLToPath(new URL('data/staging/world-audit/', root));
  try {
    const receipt = await acquireAllowedSource(spec, dir, { verifyOnly: true }, auditSources);
    const fc = JSON.parse(
      await readFile(new URL(`data/staging/world-audit/${spec.file}`, root), 'utf8'),
    );
    referenceChecks.push({
      file: spec.file,
      sha256: receipt.sha256,
      status: 'DIAGNOSTIC_ONLY_NOT_YEAR_CERTIFIED',
      rows: compareReference(fc, now),
    });
  } catch (error) {
    if (error.message !== 'SOURCE_NOT_DOWNLOADED') throw error;
    referenceChecks.push({ file: spec.file, status: 'BLOCKED_NOT_DOWNLOADED' });
  }
}
const report = {
  auditVersion: 2,
  sourceArchiveSha256: worldManifest.archiveSha256,
  productionChangedByAudit: false,
  scope:
    'All source metadata, every selectable year, all 2024 source rows; geometry/identity diagnostics are review candidates, not a country-completeness or sovereignty certificate. Probe coordinates are analysis-only.',
  sourceRows: index,
  metadataRows: repo.reviewedRows.length,
  yearCount: yearly.length,
  reasons,
  sampleYears: yearly.filter((r) =>
    [
      -2000, -1000, -500, 1, 500, 1000, 1204, 1299, 1400, 1440, 1452, 1453, 1454, 1500, 1800, 1900,
      1950, 2000, 2010, 2023, 2024, 2025, 2026,
    ].includes(r.year),
  ),
  inventory2024: inventory,
  reusedIdentities,
  focus,
  probes,
  referenceChecks,
  limitations: [
    'Contemporary reference samples, if available, are not a complete coastline/intersection audit or evidence of 2024 sovereignty.',
    'Component/area changes can be legitimate; no automatic repair.',
    'No new geometry generated; no year-specific control inferred.',
    'All-year scan checks metadata; geometry probes use selected years only.',
  ],
};
await mkdir(output, { recursive: true });
await writeFile(new URL('audit.json', output), JSON.stringify(report, null, 2) + '\n');
await writeFile(new URL('yearly-counts.json', output), JSON.stringify(yearly) + '\n');
const referenceSummary = referenceChecks.map((check) => {
  if (!check.rows) return { file: check.file, status: check.status };
  const rows = check.rows.map((r) => {
    const samples = r.interiorProbes ?? [];
    return {
      name: r.name,
      qid: r.sourceQid,
      status: r.status ?? 'DIAGNOSTIC_ONLY',
      components: r.componentCount,
      sampledComponents: r.sampledComponents,
      samples: samples.length,
      missing: samples.filter((p) => p.status === 'NO_SOURCE_POLYGON_AT_REFERENCE_POINT').length,
      differentIdentity: samples.filter(
        (p) => p.identityComparison === 'DIFFERENT_QID_REVIEW_REQUIRED',
      ).length,
      sameIdentity: samples.filter(
        (p) => p.identityComparison === 'SAME_QID_NOT_HISTORICALLY_CERTIFIED',
      ).length,
    };
  });
  return {
    file: check.file,
    sha256: check.sha256,
    features: rows.length,
    samples: rows.reduce((n, r) => n + r.samples, 0),
    missingSamples: rows.reduce((n, r) => n + r.missing, 0),
    differingIdentitySamples: rows.reduce((n, r) => n + r.differentIdentity, 0),
    featuresWithMissingSamples: rows.filter((r) => r.missing).length,
    rows,
  };
});
await writeFile(
  new URL('reference-summary.json', output),
  JSON.stringify(
    {
      auditVersion: 2,
      reference:
        'Natural Earth v5.1.2, public domain; https://www.naturalearthdata.com/about/terms-of-use/',
      source:
        'Cliopatria v0.2.1 / Seshat Global History Databank (Bennett et al.), CC BY 4.0; https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1',
      limitation:
        'Counts are deterministic samples, not country counts, area percentages, temporal certification or sovereignty decisions. Largest eight components sampled per feature; differing QIDs require review.',
      comparisons: referenceSummary,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    {
      status: 'AUDIT_COMPLETE_NOT_HISTORICALLY_CERTIFIED',
      sourceRows: index,
      years: yearly.length,
      summary2024: repo.summary(2024),
      componentLoss: inventory
        .filter((r) => r.componentLoss)
        .map((r) => ({
          name: r.name,
          before: r.previous2023.components,
          after: r.geometry.components,
        })),
      identityReuseCandidates: reusedIdentities.length,
    },
    null,
    2,
  ),
);
