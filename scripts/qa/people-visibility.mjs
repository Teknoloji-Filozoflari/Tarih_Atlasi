import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { peopleCatalogs as a, peopleManifest as am } from '../../src/people/generated/index.ts';
import { peopleCatalogs as b, peopleManifest as bm } from '../../src/people/expanded/index.ts';
import { peopleCatalogs as c, peopleManifest as cm } from '../../src/people/ottoman/index.ts';
import { peopleCatalogs as d, peopleManifest as dm } from '../../src/people/global/index.ts';
import { peopleCatalogs as e, peopleManifest as em } from '../../src/people/broad/index.ts';
import { createPeopleExtension, combinePeopleExtensions } from '../../src/people/extension.ts';
import { pilotProvider, createHistoricalFeatureLoader } from '../../src/data/pilot.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createPersonRepository } from '../../src/persons/repository.ts';
import { stepDisplayYear } from '../../src/timeline/year.ts';
export async function auditPeopleVisibility() {
  const releases = [
    [a, am],
    [b, bm],
    [c, cm],
    [d, dm],
    [e, em],
  ];
  const extension = releases
    .map(([catalog, manifest]) => createPeopleExtension(catalog, manifest))
    .reduce(combinePeopleExtensions);
  const provider = extension.withProvider(pilotProvider),
    timeline = createTimelineEngine(provider),
    persons = createPersonRepository(provider, timeline);
  const load = createHistoricalFeatureLoader(timeline),
    entries = [];
  const view = {
    polity: false,
    culture: false,
    person: true,
    battle: false,
    event: false,
    labels: false,
    includeApproximatePersons: true,
  };
  // Sequential bounded work; no network/download or whole-world geometry load.
  for (const row of releases.flatMap(([, manifest]) => manifest.selected)) {
    const failures = [];
    const person = await provider.getById(row.id);
    if (person?.kind !== 'person' || person.wikidataId !== row.qid)
      failures.push('PROFILE_IDENTITY');
    const locations = extension.records.filter(
      (r) => r.kind === 'person-location' && r.personId === row.id,
    );
    const year = row.birth?.[0] ?? 2024;
    if (!(await persons.detail(row.id, year))) failures.push('DETAIL_UNAVAILABLE');
    if (row.annualBirth) {
      const births = locations.filter(
        (r) => r.temporal.support?.kind === 'snapshot' && r.relationshipType === 'BIRTH',
      );
      if (births.length !== 1) failures.push('BIRTH_LOCATION_COUNT');
      for (const location of births) {
        for (const zoom of [1, 4, 8]) {
          const f = (await load({ ...view, year }, zoom)).features.find(
            (f) => f.id === location.id,
          );
          if (
            !f ||
            JSON.stringify(f.geometry) !== JSON.stringify(location.geometry) ||
            !f.properties.label.includes(row.name)
          )
            failures.push(`RENDER_${zoom}`);
        }
        for (const adjacent of [
          stepDisplayYear(year, -1, new Date().getFullYear()),
          stepDisplayYear(year, 1, new Date().getFullYear()),
        ])
          if (
            (await load({ ...view, year: adjacent }, 4)).features.some((f) => f.id === location.id)
          )
            failures.push('LIFETIME_SPREAD');
        if (
          (await load({ ...view, year, includeApproximatePersons: false }, 4)).features.some(
            (f) => f.id === location.id,
          )
        )
          failures.push('APPROXIMATE_PROMOTED');
        const detail = await persons.detail(location.id, year);
        if (!detail?.supportedIds.includes(location.id)) failures.push('MARKER_DETAIL');
      }
    } else {
      for (const location of locations)
        if (
          location.locationType === 'biographical' &&
          (await load({ ...view, year }, 4)).features.some((f) => f.id === location.id)
        )
          failures.push('BIOGRAPHY_ANNUAL');
    }
    for (const evidence of person?.evidence ?? [])
      if (!(await provider.getSource(evidence.sourceId))) failures.push('SOURCE_MISSING');
    entries.push({
      id: row.id,
      name: row.name,
      birth: row.birth,
      annualBirth: row.annualBirth,
      geometryAvailable: row.geometryAvailable,
      reason: row.reason,
      locationIds: locations.map((r) => r.id),
      failures,
    });
  }
  return {
    scope:
      'Published reviewed birth releases only; pipeline/metadata validation, not independent historical truth or browser/GPU verification',
    profiles: entries.length,
    annualBirths: entries.filter((r) => r.annualBirth).length,
    failed: entries.filter((r) => r.failures.length).length,
    entries,
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await auditPeopleVisibility();
  await writeFile(
    'docs/reports/people-visibility-audit.json',
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      profiles: result.profiles,
      annualBirths: result.annualBirths,
      failed: result.failed,
      report: 'docs/reports/people-visibility-audit.json',
    }),
  );
  if (result.failed) process.exitCode = 1;
}
