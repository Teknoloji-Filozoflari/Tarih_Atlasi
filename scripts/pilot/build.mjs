import { appendEventPilot } from './events.mjs';
import { appendDiscoveryPilot, discoveryNotice } from './discovery.mjs';
import { appendPersonPilot } from './persons.mjs';
import { appendPolitiesPilot, CLIO_ATTRIBUTION } from './polities.mjs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { format } from 'prettier';
import { prepareBundle, canonicalJSON, sha256, readBounded } from '../etl/pipeline.mjs';
import { parse } from '../../src/domain/schema.ts';
import { featureCollectionSchema, geometryBounds } from '../../src/domain/geometry.ts';

export async function buildPilot() {
  const root = new URL('../../', import.meta.url);
  const notices =
    (await readFile(new URL('assets/licenses/NARA-pilot-NOTICE.txt', root), 'utf8')) +
    '\n' +
    (await readFile(new URL('assets/licenses/Wikidata-person-NOTICE.txt', root), 'utf8')) +
    '\n' +
    (await readFile(new URL('assets/licenses/Wikidata-event-NOTICE.txt', root), 'utf8')) +
    '\n' +
    discoveryNotice +
    '\n' +
    CLIO_ATTRIBUTION +
    '\nhttps://creativecommons.org/licenses/by/4.0/\nSource: https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1\nOnly 16 reviewed rows; approximate reconstruction, not independently verified borders.\n';
  const rawRoot = new URL('data/pilot/raw/', root);
  const raw = await readBounded(new URL('alaska-treaty-facts.json', rawRoot), 65536);
  const facts = JSON.parse(raw.toString('utf8'));
  if (
    facts.sourceRevision !== 'NARA-RG11-1867-03-30-page-reviewed-2024-03-28-extract-1' ||
    facts.synthetic !== false ||
    facts.representation !== 'editorial-fact-extraction-not-http-response' ||
    facts.facts.meridianWestOfGreenwichDegrees !== 141 ||
    facts.facts.ratificationsExchanged !== '1867-06-20' ||
    facts.derivation.clipLatitudeSouth !== 65 ||
    facts.derivation.clipLatitudeNorth !== 68 ||
    facts.derivation.sampleStepDegrees !== 0.5
  )
    throw new Error('Unreviewed pilot input: source/facts/clipping changed');
  const temporal = () => ({
    start: { kind: 'known', date: { year: 1867, month: 6, day: 20 } },
    end: { kind: 'known', date: { year: 1867, month: 6, day: 20 } },
    precision: 'day',
    uncertain: false,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: 'Exchanged June 20, 1867; Article IV: cession on exchange of ratifications',
      calendar: 'Gregorian (U.S. proclamation)',
      yearNumbering: 'historical-no-zero',
    },
    basis: 'derived',
    reviewStatus: 'verified',
    support: {
      kind: 'snapshot',
      note: 'NARA md. I/IV ve onay bildirimi; yalnız 1867-06-20 belge anı. Sürekli geçerlilik çıkarılmaz.',
    },
  });
  const metadata = (id, name) => ({
    id,
    names: [{ language: 'tr', value: name }],
    alternativeNames: [],
    wikidataId: null,
    temporal: temporal(),
    confidence: {
      level: 'medium',
      rationale:
        'Resmî antlaşma tanımı kaynaklı; gün kesin, WGS84 yer ölçümü ve fiilî egemenlik kapsamı kanıtlanmıyor.',
      spatialAccuracyKm: null,
    },
    licenseId: facts.rights.licenseId,
    attribution: facts.rights.attribution,
    reviewStatus: 'verified',
    synthetic: false,
  });
  const evidence = (claims) => [
    {
      sourceId: 'source:nara-alaska-1867',
      sourceRevision: facts.sourceRevision,
      rawInputId: 'input:nara-alaska-facts',
      locator: facts.locator,
      claims,
      licenseId: facts.rights.licenseId,
      attribution: facts.rights.attribution,
      basis: 'derived',
      transformationIds: ['transform:alaska-meridian-clip-v1'],
    },
  ];
  const entity = (id, name, entityType) => ({
    ...metadata(id, name),
    kind: 'entity',
    entityType,
    evidence: evidence(['identity', 'temporal']),
  });
  const coordinates = Array.from({ length: 7 }, (_, i) => [
    -facts.facts.meridianWestOfGreenwichDegrees,
    facts.derivation.clipLatitudeSouth + i * facts.derivation.sampleStepDegrees,
  ]);
  const territory = {
    ...metadata('atlas:alaska-treaty-segment-1867', 'Alaska antlaşması — 141°B sınır kesiti'),
    kind: 'territory',
    entityId: 'atlas:united-states-1867',
    interpretationId: 'interpretation:1867-treaty-text',
    scopeId: 'scope:meridian141-n65-68',
    boundary: 'approximate',
    extentType: 'boundary-segment',
    politicalStatus: 'treaty-delimitation',
    counterpartEntityIds: ['atlas:british-possessions-1867'],
    geometry: { type: 'LineString', coordinates },
    geometryReason: null,
    borderPrecision: {
      classification: 'treaty-idealized',
      toleranceKm: null,
      description:
        'Antlaşmadaki 141° batı meridyeninin 65–68°K görüntüleme kesiti. Kesit uçları tarihî sınır uçları değildir; ölçülmüş WGS84 sınırı veya tam ülke alanı değildir.',
    },
    evidence: evidence(['identity', 'temporal', 'geometry']),
  };
  let catalog = {
    schemaVersion: 2,
    catalogVersion: '0.7.0-discovery',
    createdAt: facts.reviewedAt,
    sources: [
      {
        ...metadata('source:nara-alaska-1867', 'NARA — 1867 Alaska Antlaşması olgu çıkarımı'),
        kind: 'source',
        sourceKey: 'nara-treaty-facts',
        url: facts.sourceUrl,
        revision: facts.sourceRevision,
        retrievedAt: facts.reviewedAt,
        rawInputId: 'input:nara-alaska-facts',
        upstreamIds: [],
        licenseUrl: facts.rights.policyUrl,
        licenseScope: 'data',
        objectLicense: null,
        membersReviewed: false,
      },
    ],
    inputs: [
      {
        id: 'input:nara-alaska-facts',
        relativePath: 'alaska-treaty-facts.json',
        sha256: sha256(raw),
        bytes: raw.length,
        sourceId: 'source:nara-alaska-1867',
        sourceRevision: facts.sourceRevision,
      },
    ],
    transformations: [
      {
        id: 'transform:alaska-meridian-clip-v1',
        version: '1.0.0',
        description:
          'NARA antlaşma olguları → yalnız 1867-06-20 snapshot; 141°B ideal meridyeni 65–68°K proje penceresiyle kes ve 0.5° örnekle. Tam kaynak HTTP yanıtı veya ölçülmüş geometri değildir.',
        inputIds: ['input:nara-alaska-facts'],
      },
    ],
    records: [
      entity('atlas:united-states-1867', 'Amerika Birleşik Devletleri — antlaşma tarafı', 'POLITY'),
      entity('atlas:russian-empire-1867', 'Rusya İmparatorluğu — devreden taraf', 'EMPIRE'),
      entity(
        'atlas:british-possessions-1867',
        'Britanya’nın Kuzey Amerika’daki toprakları',
        'POLITY',
      ),
      territory,
      {
        ...metadata('atlas:alaska-cession-1867', 'Alaska devri — antlaşma ilişkisi'),
        kind: 'political-relationship',
        fromEntityId: 'atlas:russian-empire-1867',
        toEntityId: 'atlas:united-states-1867',
        relationship: 'cession',
        territoryIds: [territory.id],
        description:
          'Antlaşma md. I ve IV: onay belgelerinin değişimiyle devir. Bu kayıt arazideki fiilî denetimi veya Yerli halkların haklarını modellemez.',
        evidence: evidence(['identity', 'temporal']),
      },
      {
        ...metadata('atlas:alaska-pilot-coverage', '1867 antlaşma kesiti — kısmi kapsam'),
        kind: 'coverage',
        layer: 'polity',
        region: [-141, 65, -141, 68],
        status: 'partial',
        recordCount: 1,
        recordIds: [territory.id],
        description:
          'Tek tarihli, tek meridyen kesiti. Kültür alanı ve tam devlet poligonu yok; diğer yıl/bölgeler kapsam dışı.',
        evidence: evidence(['identity', 'temporal', 'coverage']),
      },
    ],
  };
  await appendPersonPilot(catalog, rawRoot);
  await appendEventPilot(catalog, rawRoot);
  const discovery = await appendDiscoveryPilot(catalog, rawRoot);
  const polityParts = await appendPolitiesPilot(catalog, rawRoot);
  const bundle = await prepareBundle(catalog, fileURLToPath(rawRoot));
  catalog = JSON.parse(bundle.catalogText);
  const collection = (points) => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: territory.id,
        properties: { recordId: territory.id },
        geometry: { type: 'LineString', coordinates: points },
      },
    ],
  });
  const areas = catalog.records
    .filter((r) => r.kind === 'territory' && r.id !== territory.id && r.geometry)
    .map((r) => ({
      type: 'Feature',
      id: r.id,
      properties: { recordId: r.id },
      geometry: r.geometry,
    }));
  const fine = collection(coordinates),
    coarse = collection([coordinates[0], coordinates.at(-1)]);
  for (const value of [fine, coarse]) {
    value.features.push(...areas);
    const validated = parse(featureCollectionSchema, value);
    if (!validated.ok) throw new Error(JSON.stringify(validated.issues));
  }
  const artifacts = {
    'NOTICE.txt': notices,
    'catalog.json': bundle.catalogText,
    'boundaries-fine.geojson': `${canonicalJSON(fine)}\n`,
    'boundaries-coarse.geojson': `${canonicalJSON(coarse)}\n`,
    'events.geojson': `${canonicalJSON({ type: 'FeatureCollection', features: catalog.records.filter((r) => r.kind === 'event' && r.geometry).map((r) => ({ type: 'Feature', id: r.id, properties: { recordId: r.id }, geometry: r.geometry })) })}\n`,
    'person-locations.geojson': `${canonicalJSON({ type: 'FeatureCollection', features: catalog.records.filter((r) => r.kind === 'person-location' && r.geometry).map((r) => ({ type: 'Feature', id: r.id, properties: { recordId: r.id }, geometry: r.geometry })) })}\n`,
  };
  const manifest = {
    ...JSON.parse(bundle.manifestText),
    representation: 'mixed-source-fact-extractions-and-approximate-polity-reconstructions',
    eventSummary: {
      eventCount: catalog.records.filter((r) => r.kind === 'event').length,
      geometryCount: catalog.records.filter((r) => r.kind === 'event' && r.geometry).length,
    },
    eventCoverageIndex: catalog.records
      .filter((r) => r.kind === 'event')
      .map((r) => ({
        recordId: r.id,
        eventType: r.eventType,
        validity: r.temporal,
        bbox: r.geometry ? geometryBounds(r.geometry)[0] : null,
        locationPrecision: r.details.locationPrecision,
        confidence: r.confidence,
        evidence: r.evidence,
      })),
    personSummary: {
      personCount: catalog.records.filter((r) => r.kind === 'person').length,
      locationCount: catalog.records.filter((r) => r.kind === 'person-location').length,
    },
    personCoverageIndex: catalog.records
      .filter((r) => r.kind === 'person-location')
      .map((r) => ({
        recordId: r.id,
        personId: r.personId,
        bbox: r.geometry ? geometryBounds(r.geometry)[0] : null,
        validity: r.temporal,
        confidence: r.confidence,
        spatialContext: r.spatialContext,
        defaultVisible: false,
        evidence: r.evidence,
      })),
    coverageIndex: [
      {
        recordId: territory.id,
        bbox: geometryBounds(territory.geometry)[0],
        dataTime: '1867-03-30 treaty / 1867-06-20 proclamation',
        validity: territory.temporal,
        borderPrecision: territory.borderPrecision,
        confidence: territory.confidence,
        sourceId: territory.evidence[0].sourceId,
        sourceRevision: territory.evidence[0].sourceRevision,
      },
    ],
    polityCoverageIndex: catalog.records
      .filter((r) => r.kind === 'territory')
      .map((r) => ({
        recordId: r.id,
        entityId: r.entityId,
        bbox: geometryBounds(r.geometry),
        validity: r.temporal,
        borderPrecision: r.borderPrecision,
        confidence: r.confidence,
        evidence: r.evidence,
      })),
    artifacts: Object.entries(artifacts).map(([file, value]) => ({
      file,
      bytes: Buffer.byteLength(value),
      sha256: createHash('sha256').update(value).digest('hex'),
    })),
    lod: [
      {
        file: 'boundaries-coarse.geojson',
        minZoom: 0,
        maxZoomExclusive: 2.5,
        treatyPositions: 2,
        polygonCoordinates: 'unchanged',
      },
      {
        file: 'boundaries-fine.geojson',
        minZoom: 2.5,
        maxZoomExclusive: 9,
        treatyPositions: 7,
        polygonCoordinates: 'unchanged',
      },
    ],
    omissions: {
      completePolityPolygons: catalog.records.filter(
        (r) => r.kind === 'territory' && r.extentType === 'full-area',
      ).length,
      polityParts,
      culturalRegions: 0,
      otherEras: 'unverified',
      otherGeographies: 'unverified',
      outsidePoliticalSnapshot: 'no-verified-data',
    },
  };
  return {
    cityModule: await format(
      `// Generated from hash-bound discovery-facts.json; modern reference only.\nexport const modernCitySnapshot = ${canonicalJSON({ version: '1.0.0', reviewedAt: discovery.reviewedAt, licenseId: discovery.licenseId, cities: discovery.cities })} as const;\n`,
      { parser: 'typescript', singleQuote: true, printWidth: 100 },
    ),
    catalog: JSON.parse(bundle.catalogText),
    fine,
    coarse,
    manifest,
    artifacts,
    notices,
    reportText: bundle.reportText,
  };
}
export async function writePilot() {
  const built = await buildPilot();
  await writeFile(
    new URL('../../assets/licenses/Wikidata-discovery-NOTICE.txt', import.meta.url),
    discoveryNotice,
  );
  await mkdir(new URL('../../src/places/generated/', import.meta.url), { recursive: true });
  await writeFile(
    new URL('../../src/places/generated/modern-cities.ts', import.meta.url),
    built.cityModule,
  );
  const directory = new URL('../../data/pilot/production/', import.meta.url);
  await mkdir(directory, { recursive: true });
  for (const [file, text] of Object.entries(built.artifacts))
    await writeFile(new URL(file, directory), text);
  await writeFile(new URL('manifest.json', directory), `${canonicalJSON(built.manifest)}\n`);
  await writeFile(new URL('review-report.json', directory), built.reportText);
  const generated = new URL('../../src/data/generated/pilot.ts', import.meta.url);
  await mkdir(new URL('.', generated), { recursive: true });
  const content = `// Generated by scripts/pilot/build.mjs. Source/rights checks run before writing.\nexport const preparedPilot: unknown = ${canonicalJSON(built.catalog)};\nexport const pilotManifest = ${canonicalJSON(built.manifest)} as const;\nexport const pilotNotices = ${JSON.stringify(built.notices)};\n`;
  await writeFile(
    generated,
    await format(content, { parser: 'typescript', singleQuote: true, printWidth: 100 }),
  );
  return built;
}
