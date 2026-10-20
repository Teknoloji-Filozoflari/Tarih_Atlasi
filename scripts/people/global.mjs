import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { buildPeople, writePeople, sourceCoordinate } from './build.mjs';
import { reviewedGlobalInputs } from '../../src/people/policy.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { inspectCatalog } from '../etl/pipeline.mjs';

export const globalOptions = {
  version: '1.3.0-births',
  requestCount: 4,
  namespace: 'people-global',
  approvedInputs: reviewedGlobalInputs,
  rawDirectory: 'data/people/global-raw/',
  outputDirectory: 'src/people/global/',
  productionDirectory: 'data/people/global-production/',
};
export const globalNotice =
  'Wikidata contributors — CC0-1.0\nhttps://www.wikidata.org/wiki/Wikidata:Licensing\nGlobal content 1.3.0-births: editorial extraction of 4 people, 4 place references and 2 events. Source revisions, qualifiers and input checksums retained. Two annual city-representative births; two biographical relationships do not assert annual presence. Event points are approximate representatives, not battlefields or territorial boundaries. Independent upstream corroboration is incomplete. No Wikipedia prose, images or third-party geometry copied.\n';
export async function buildGlobal() {
  const result = await buildPeople(globalOptions);
  const raw = JSON.parse(await readFile('data/people/global-raw/browser-review.json', 'utf8'));
  const pack = result.packs[0];
  const template = pack.records.find((r) => r.kind === 'entity');
  const sourceTemplate = pack.sources[0],
    inputTemplate = pack.inputs[0];
  for (const fact of raw.events) {
    const suffix = fact.qid.toLowerCase(),
      id = `global:event-${suffix}`;
    const sourceId = `source:people-global-${suffix}`,
      inputId = `input:people-global-${suffix}`;
    pack.sources.push({
      ...sourceTemplate,
      id: sourceId,
      names: [{ language: 'tr', value: `Wikidata ${fact.qid}` }],
      wikidataId: fact.qid,
      revision: fact.revision,
      url: `https://www.wikidata.org/w/index.php?title=${fact.qid}&oldid=${fact.revision}`,
      rawInputId: inputId,
    });
    pack.inputs.push({ ...inputTemplate, id: inputId, sourceId, sourceRevision: fact.revision });
    const temporal = {
      ...template.temporal,
      start: { kind: 'known', date: { year: fact.year, month: null, day: null } },
      end: { kind: 'known', date: { year: fact.year, month: null, day: null } },
      uncertain: false,
      sourceDate: { ...template.temporal.sourceDate, text: `P585 ${fact.date}; ${fact.note}` },
      support: { kind: 'snapshot', note: 'Yalnız kaynak olay yılı; komşu yıllara taşınmaz.' },
    };
    const evidence = [
      {
        ...template.evidence[0],
        sourceId,
        sourceRevision: fact.revision,
        rawInputId: inputId,
        locator: `P585 ${fact.date}; P625 ${fact.coordinate}; ${fact.note}`,
        claims: ['identity', 'temporal', 'geometry', 'location'],
      },
    ];
    const common = {
      ...template,
      id: `${id}-identity`,
      wikidataId: fact.qid,
      names: [{ language: 'tr', value: fact.name }],
      temporal,
      evidence,
      confidence: { ...template.confidence, rationale: fact.note },
      entityType: fact.eventType === 'BATTLE' ? 'BATTLE' : 'EVENT',
    };
    pack.records.push(common);
    const { entityType, ...metadata } = common;
    void entityType;
    pack.records.push({
      ...metadata,
      id,
      kind: 'event',
      entityId: common.id,
      eventType: fact.eventType,
      participantIds: [],
      locationSemantics: 'representative',
      geometry: { type: 'Point', coordinates: sourceCoordinate([fact.coordinate]).coordinates },
      geometryReason: null,
      details: {
        placeId: null,
        description: [{ language: 'tr', value: fact.description }],
        locationPrecision: {
          classification: 'approximate-point',
          toleranceKm: null,
          explanation: fact.note,
        },
        wikipediaSitelinks: [],
        alternativeDates: [],
      },
    });
  }
  pack.transformations[0].inputIds = pack.inputs.map((i) => i.id);
  pack.transformations[0].description +=
    ' Event P585/P625: year-only snapshot and approximate representative point; not battlefield geometry.';
  const valid = validateCatalog(pack);
  if (!valid.ok) throw Error(JSON.stringify(valid.issues));
  await inspectCatalog(pack, 'data/people/global-raw/');
  return result;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await buildGlobal();
  if (process.argv.includes('--check')) {
    const { peopleCatalogs, peopleManifest } = await import('../../src/people/global/index.ts');
    assert.deepEqual(peopleCatalogs, result.packs);
    assert.deepEqual(peopleManifest.selected, result.selected);
    assert.deepEqual(peopleManifest.inputs, result.inputs);
    assert.deepEqual(
      peopleManifest,
      JSON.parse(await readFile('data/people/global-production/manifest.json', 'utf8')),
    );
    assert.equal(
      await readFile('assets/licenses/Wikidata-global-content-NOTICE.txt', 'utf8'),
      globalNotice,
    );
  } else {
    await writePeople(result, globalOptions);
    await writeFile('assets/licenses/Wikidata-global-content-NOTICE.txt', globalNotice);
  }
  console.log(
    'Global content: 4 profiles, 2 annual birth points, 2 biographical relationships, 2 approximate event points. PASS',
  );
}
