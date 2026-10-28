/**
 * TA-8 location-depth pilot: read-only coverage + candidate report.
 * Does not invent coordinates/dates, does not write production catalogs.
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { birthCityAllowlist, BIRTH_CITY_ALLOWLIST } from './birth-city-allowlist.mjs';

const REVIEW_DIRS = [
  'raw',
  'expanded-raw',
  'ottoman-raw',
  'global-raw',
  'broad-raw',
];

/** Place names that are not city-scale settlements for birth-year points. */
const NON_SETTLEMENT =
  /\b(hospital|palace|castle|manor|farm|county|house|clinic|medical|birth house|family home|plaza|marktplatz|spring farm)\b|palace of|castle of/i;

/**
 * Heuristic only — never auto-promotes to production.
 * @param {{ name: string, hasCoordinate: boolean, inAllowlist: boolean }} place
 */
export function classifyReviewedPlace(place) {
  if (place.inAllowlist) return 'allowlisted';
  if (!place.hasCoordinate) return 'missing-coordinate';
  if (NON_SETTLEMENT.test(place.name)) return 'excluded-non-settlement';
  // Single-token or short settlement-like names stay candidates for human review.
  return 'settlement-candidate';
}

/**
 * Parse history generated manifest.ts geometry flags without loading prettier-bound modules.
 * @param {string} source
 */
export function parseHistoryManifestGeometry(source) {
  const byKind = Object.create(null);
  let total = 0;
  let withGeometry = 0;
  const re =
    /\{\s*id:\s*'([^']+)'[\s\S]*?kind:\s*'([^']+)'[\s\S]*?geometry:\s*(true|false)/g;
  for (const match of source.matchAll(re)) {
    const kind = match[2];
    const geo = match[3] === 'true';
    byKind[kind] ??= { withGeometry: 0, withoutGeometry: 0 };
    if (geo) {
      byKind[kind].withGeometry++;
      withGeometry++;
    } else {
      byKind[kind].withoutGeometry++;
    }
    total++;
  }
  return { total, withGeometry, withoutGeometry: total - withGeometry, byKind };
}

/**
 * @param {string} root workspace root
 */
export async function loadReviewedPlaces(root = process.cwd()) {
  const places = new Map();
  for (const directory of REVIEW_DIRS) {
    const path = join(root, 'data/people', directory, 'browser-review.json');
    let raw;
    try {
      raw = await readFile(path, 'utf8');
    } catch {
      continue;
    }
    const data = JSON.parse(raw);
    for (const place of data.places ?? []) {
      const hasCoordinate = Boolean(place.props?.['coordinate location']);
      const entry = {
        qid: place.qid,
        name: place.name,
        revision: place.revision ?? null,
        hasCoordinate,
        inAllowlist: birthCityAllowlist.has(place.name),
        reviewDirectory: directory,
      };
      entry.classification = classifyReviewedPlace(entry);
      // Prefer first seen; later dirs may duplicate QIDs.
      if (!places.has(place.qid)) places.set(place.qid, entry);
    }
  }
  return [...places.values()].sort((a, b) => a.qid.localeCompare(b.qid));
}

export function summarizePlaces(places) {
  const byClass = Object.create(null);
  for (const place of places) {
    byClass[place.classification] ??= 0;
    byClass[place.classification]++;
  }
  return {
    reviewedPlaces: places.length,
    allowlistSize: BIRTH_CITY_ALLOWLIST.length,
    byClassification: byClass,
    settlementCandidates: places
      .filter((p) => p.classification === 'settlement-candidate')
      .map((p) => ({
        qid: p.qid,
        name: p.name,
        revision: p.revision,
        reviewDirectory: p.reviewDirectory,
      })),
    excludedNonSettlement: places
      .filter((p) => p.classification === 'excluded-non-settlement')
      .map((p) => ({ qid: p.qid, name: p.name })),
  };
}

/**
 * Documented production totals from pinned history import (no network).
 * Ratios use history archive + documented prior birth-point total.
 */
export function documentedCoverageSnapshot(historyGeometry) {
  const people = historyGeometry.byKind.person ?? { withGeometry: 0, withoutGeometry: 0 };
  const events = historyGeometry.byKind.event ?? { withGeometry: 0, withoutGeometry: 0 };
  const historyPeople = people.withGeometry + people.withoutGeometry;
  const historyEvents = events.withGeometry + events.withoutGeometry;
  // History import report: 46 new birth points → 193 app total; 35 new battle points.
  const documented = {
    totalPeopleProfiles: 3203,
    totalEvents: 1120,
    historyArchivePeople: historyPeople,
    historyArchiveEvents: historyEvents,
    historyPeopleWithMapGeometry: people.withGeometry,
    historyEventsWithMapGeometry: events.withGeometry,
    documentedAppAnnualBirthPoints: 193,
    historyBirthPointsInArchive: people.withGeometry,
    historyBattlePointsInArchive: events.withGeometry,
  };
  return {
    ...documented,
    ratios: {
      historyPeopleLocated:
        historyPeople === 0 ? null : +(people.withGeometry / historyPeople).toFixed(4),
      historyEventsLocated:
        historyEvents === 0 ? null : +(events.withGeometry / historyEvents).toFixed(4),
      appPeopleLocatedApprox:
        documented.totalPeopleProfiles === 0
          ? null
          : +(documented.documentedAppAnnualBirthPoints / documented.totalPeopleProfiles).toFixed(
              4,
            ),
    },
    notes: [
      'Person map points are birth-year timed-presence only; living in a year is not location evidence.',
      'Event map points are battle P625 with references + precision gates; wars/treaties get no invented centroid.',
      'Culture polygons remain 0 / BLOCKED — political polygons must not be relabeled as culture.',
    ],
  };
}

export async function runLocationDepthAudit({ root = process.cwd(), writeReport = false } = {}) {
  const manifestPath = join(root, 'src/history/generated/manifest.ts');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const historyGeometry = parseHistoryManifestGeometry(manifestSource);
  const places = await loadReviewedPlaces(root);
  const placeSummary = summarizePlaces(places);
  const coverage = documentedCoverageSnapshot(historyGeometry);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'read-only-pilot',
    productionMutated: false,
    culturePolygons: {
      status: 'BLOCKED',
      productionCount: 0,
      reason:
        'No verified cultural-area source with redistributable geometry+rights chain passed review (D-PLACE NC; Pleiades points≠areas; OHM object licenses; Historical Basemaps blocked).',
    },
    historyGeometry,
    coverage,
    places: placeSummary,
    safeNextSteps: [
      'Human-review settlement-candidate QIDs; add only city-scale names to birth-city-allowlist after confirming P625 revision hash.',
      'Re-run history:prepare only after allowlist+pin updates; do not invent coordinates.',
      'Battle expansion: only additional P625 statements that already pass normalize.mjs gates (single Earth point, refs, precision, no qualifiers).',
      'Culture: remain empty until a licensed cultural-distribution dataset with explicit area geometry is reviewed end-to-end.',
    ],
  };
  if (writeReport) {
    const outDir = join(root, 'docs/reports');
    await mkdir(outDir, { recursive: true });
    const outPath = join(outDir, 'location-depth-audit.json');
    await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`);
    report.reportPath = outPath;
  }
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const writeReport = process.argv.includes('--write-report');
  const report = await runLocationDepthAudit({ writeReport });
  console.log(JSON.stringify(report, null, 2));
}
