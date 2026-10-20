import { publicationPolicyVersion, withheldGeography } from '../../src/data/publication-policy.ts';
import { writeFile } from 'node:fs/promises';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { pilotTimeline, pilotManifest } from '../../src/data/pilot.ts';
import { selectableYearRange } from '../../src/timeline/year.ts';
import { geometryBounds, boxesIntersect } from '../../src/domain/geometry.ts';
export async function auditCoverage() {
  const validation = validateCatalog(preparedPilot);
  if (!validation.ok || !pilotTimeline) throw new Error('PRODUCTION_CATALOG_REJECTED');
  const catalog = validation.value,
    range = selectableYearRange(),
    years = [];
  for (let year = range.minYear; year <= range.maxYear; year++) {
    if (year === 0) continue;
    const normal = await pilotTimeline.getDataCoverage(year),
      opt = await pilotTimeline.getDataCoverage(year, { includeApproximatePersons: true });
    const [territories, cultures, persons, events] = await Promise.all([
      pilotTimeline.getTerritoriesAtYear(year),
      pilotTimeline.getCulturesAtYear(year),
      pilotTimeline.getPersonsAtYear(year),
      pilotTimeline.getEventsAtYear(year),
    ]);
    years.push({
      year,
      defaultGeography: normal.records.map((h) => h.record.id),
      optInGeography: opt.records.map((h) => h.record.id),
      mode: normal.mode,
      optInMode: opt.mode,
      territories: territories.length,
      cultures: cultures.length,
      personsAlive: persons.length,
      events: events.length,
    });
  }
  const geometries = new Map();
  for (const y of years)
    for (const id of y.optInGeography) {
      const record = catalog.records.find((r) => r.id === id);
      geometries.set(id, record);
    }
  const cells = [];
  for (let lon = -180; lon < 180; lon += 30)
    for (let lat = -90; lat < 90; lat += 30) {
      const bbox = [lon, lat, lon + 30, lat + 30];
      const ids = [...geometries.values()]
        .filter((r) => geometryBounds(r.geometry).some((b) => boxesIntersect(b, bbox)))
        .map((r) => r.id);
      cells.push({ bbox, exampleGeometryIds: ids });
    }
  const kinds = Object.fromEntries(
    [...new Set(catalog.records.map((r) => r.kind))]
      .sort()
      .map((k) => [k, catalog.records.filter((r) => r.kind === k).length]),
  );
  return {
    publicationPolicyVersion,
    withheldGeography,
    generatedAt: new Date().toISOString(),
    catalogVersion: catalog.catalogVersion,
    catalogSha256: pilotManifest.sha256,
    selectableRange: range,
    selectableYears: years.length,
    counts: {
      records: catalog.records.length,
      sources: catalog.sources.length,
      kinds,
      defaultGeographyYears: years.filter((y) => y.defaultGeography.length).length,
      optInGeographyYears: years.filter((y) => y.optInGeography.length).length,
      noSupportedDefaultGeographyYears: years.filter((y) => !y.defaultGeography.length).length,
      noSupportedOptInGeographyYears: years.filter((y) => !y.optInGeography.length).length,
      exactDefaultGeographyYears: years.filter((y) => y.mode === 'exact verified').length,
      anyEventYears: years.filter((y) => y.events).length,
      anyLifePeriodYears: years.filter((y) => y.personsAlive).length,
      fullPolityPolygons: catalog.records.filter(
        (r) => r.kind === 'territory' && r.extentType === 'full-area' && r.geometry,
      ).length,
      culturalGeometries: catalog.records.filter((r) => r.kind === 'cultural-region' && r.geometry)
        .length,
      eventsWithoutGeometry: catalog.records.filter((r) => r.kind === 'event' && !r.geometry)
        .length,
      independentlyDatedPlaceLabels: [...geometries.values()].filter((r) => r.kind === 'place')
        .length,
      approximateBoundaryRecords: catalog.records.filter(
        (r) =>
          r.kind === 'territory' &&
          (r.boundary !== 'documented' || r.borderPrecision.classification !== 'surveyed'),
      ).length,
      unknownDateGeometryRecords: catalog.records.filter(
        (r) =>
          'geometry' in r &&
          r.geometry &&
          (r.temporal.start.kind === 'unknown' || r.temporal.end.kind === 'unknown'),
      ).length,
      withheldGeographyRecords: withheldGeography.length,
      independentlyUnsupportedPlaceGeometry: catalog.records.filter(
        (r) =>
          r.kind === 'place' &&
          r.geometry &&
          !r.evidence.some((e) => e.claims.includes('temporal') && e.claims.includes('geometry')),
      ).length,
      invalidProductionSources: 0,
      missingAttributions: catalog.records.filter((r) => !r.attribution.trim()).length,
      unreviewedProductionRecords: catalog.records.filter((r) => r.reviewStatus !== 'verified')
        .length,
    },
    supportedGeographyYears: years.filter((y) => y.optInGeography.length),
    eventsOrLifeYears: years.filter((y) => y.events || y.personsAlive || y.territories),
    spatialSampling: {
      cellSizeDegrees: 30,
      totalCells: cells.length,
      cellsTouchingAnyPilotExample: cells.filter((c) => c.exampleGeometryIds.length).length,
      cellsWithoutAnyPilotExample: cells.filter((c) => !c.exampleGeometryIds.length).length,
      cells,
      notice:
        'Cell intersection is only a coarse sample, never complete area coverage, sovereignty or percent-world accuracy.',
    },
    sourceLimitations: {
      ancientUnreferencedDateStatementRecords: ['atlas:peloponnesian-war'],
      unresolvedAlternativeDateRecords: ['atlas:german-reunification-process'],
      unfetchedIndependentPersonReference: ['https://www.maisonvangogh.mons.be/historique'],
      exactHistoricalBoundarySurveyRecords: 0,
      notice:
        'Machine schema/revision checks are not independent verification of every historical claim; see historical-accuracy-audit.md.',
    },
    notices: [
      'Selectable timeline is independent of source coverage.',
      'Living at a year is not dated location evidence.',
      'No full world/year/polygon/culture completeness claim.',
      'Approximate person geography requires explicit opt-in; nearest preview is never used here.',
    ],
  };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const report = await auditCoverage();
  await writeFile(
    process.argv[2] ?? 'docs/reports/phase-16-coverage.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(
    `Coverage audited across ${report.selectableYears} selectable years; ${report.counts.optInGeographyYears} years with opt-in-supported pilot geography.`,
  );
}
