import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';
import { buildPeople, writePeople, sourceCoordinate } from './build.mjs';
import { reviewedBroadInputs } from '../../src/people/policy.ts';
import { validateCatalog } from '../../src/domain/validate.ts';
import { inspectCatalog } from '../etl/pipeline.mjs';

export const broadOptions = {
  version: '1.4.0-births',
  requestCount: 57,
  namespace: 'people-broad',
  approvedInputs: reviewedBroadInputs,
  rawDirectory: 'data/people/broad-raw/',
  outputDirectory: 'src/people/broad/',
  productionDirectory: 'data/people/broad-production/',
};
export const broadNotice =
  'Wikidata contributors — CC0-1.0\nhttps://www.wikidata.org/wiki/Wikidata:Licensing\nBroad content 1.4.0-births: reviewed editorial extraction, not an HTTP/API response. 56 people and 23 events; one candidate withheld without immutable revision. Source revisions and input checksums retained. Modern place points represent source places, not exact birth sites. Uncertain and regional birth assertions are not annual presence evidence. Seven battle points are approximate representatives; sixteen other events have no approved map geometry. Day values retain original calendar text; querying is year-only. No Wikipedia prose, portraits, Nobel API data or third-party geometry copied. Not a complete world-history, Nobel or TIME catalog; independent upstream corroboration incomplete.\n';

export async function buildBroad() {
  const result = await buildPeople(broadOptions);
  const raw = JSON.parse(await readFile('data/people/broad-raw/browser-review.json', 'utf8'));
  for (const [index, fact] of raw.events.entries()) {
    const pack = result.packs[index % result.packs.length];
    const template = pack.records.find((r) => r.kind === 'entity');
    const sourceTemplate = pack.sources[0],
      inputTemplate = pack.inputs[0];
    const suffix = fact.qid.toLowerCase(),
      id = `broad:event-${suffix}`;
    const sourceId = `source:people-broad-${suffix}`,
      inputId = `input:people-broad-${suffix}`;
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
      start: { kind: 'known', date: { year: fact.start, month: null, day: null } },
      end: { kind: 'known', date: { year: fact.end, month: null, day: null } },
      precision: 'year',
      uncertain: fact.uncertain,
      sourceDate: { ...template.temporal.sourceDate, text: `${fact.date}; ${fact.note}` },
      support: {
        kind: fact.start === fact.end ? 'snapshot' : 'continuous',
        note: 'Kaynağın yıl/aralık iddiası; savaşın her yılda tek bir noktada gerçekleştiği anlamına gelmez.',
      },
    };
    const geometry = fact.coordinate
      ? { type: 'Point', coordinates: sourceCoordinate([fact.coordinate]).coordinates }
      : null;
    const evidence = [
      {
        ...template.evidence[0],
        sourceId,
        sourceRevision: fact.revision,
        rawInputId: inputId,
        locator: `${fact.date}; ${fact.coordinate ? `P625 ${fact.coordinate}; ` : ''}${fact.note}`,
        claims: geometry
          ? ['identity', 'temporal', 'geometry', 'location']
          : ['identity', 'temporal'],
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
      locationSemantics: geometry ? 'representative' : 'unknown',
      geometry,
      geometryReason: geometry
        ? null
        : 'Konum kaydı bu incelemede doğrulanmadı; olay listesinde bulunabilir.',
      details: {
        placeId: null,
        description: [{ language: 'tr', value: fact.description }],
        locationPrecision: {
          classification: geometry ? 'approximate-point' : 'unknown',
          toleranceKm: null,
          explanation: fact.note,
        },
        wikipediaSitelinks: [],
        alternativeDates:
          fact.qid === 'Q12551'
            ? [
                {
                  temporal: {
                    ...temporal,
                    end: { kind: 'known', date: { year: 1455, month: null, day: null } },
                    uncertain: true,
                  },
                  evidenceIndices: [0],
                  explanation:
                    'P582 latest date 1455 niteleyicisi; ana yıllık filtre 1453 bitişini kullanır.',
                },
              ]
            : [],
      },
    });
  }
  for (const pack of result.packs) {
    pack.transformations[0].inputIds = pack.inputs.map((i) => i.id);
    pack.transformations[0].description +=
      ' Reviewed event statements: year-only, calendar preserved; no inferred war centroid. Image/reference qualifiers are not event dates.';
    const valid = validateCatalog(pack);
    if (!valid.ok) throw Error(JSON.stringify(valid.issues));
    await inspectCatalog(pack, broadOptions.rawDirectory);
    if (Buffer.byteLength(JSON.stringify(pack)) > 256 * 1024) throw Error('PEOPLE_PACK_BUDGET');
  }
  return result;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await buildBroad();
  if (process.argv.includes('--check')) {
    const { peopleCatalogs, peopleManifest } = await import('../../src/people/broad/index.ts');
    assert.deepEqual(peopleCatalogs, result.packs);
    assert.deepEqual(peopleManifest.selected, result.selected);
    assert.deepEqual(peopleManifest.inputs, result.inputs);
    assert.deepEqual(
      peopleManifest,
      JSON.parse(await readFile('data/people/broad-production/manifest.json', 'utf8')),
    );
    assert.equal(
      await readFile('assets/licenses/Wikidata-broad-content-NOTICE.txt', 'utf8'),
      broadNotice,
    );
  } else {
    await writePeople(result, broadOptions);
    await writeFile('assets/licenses/Wikidata-broad-content-NOTICE.txt', broadNotice);
  }
  console.log(
    JSON.stringify({
      people: result.selected.length,
      annualBirths: result.selected.filter((p) => p.annualBirth).length,
      pending: result.pending.length,
      events: 23,
      status: 'PASS',
    }),
  );
}
