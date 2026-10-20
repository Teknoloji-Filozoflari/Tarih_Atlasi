import type {
  Catalog,
  Confidence,
  CulturalRegion,
  DataCoverage,
  Evidence,
  HistoricalEntity,
  HistoricalEvent,
  EventDetails,
  HistoricalPlace,
  HistoricalRecord,
  Name,
  Person,
  PersonProfile,
  PersonLocation,
  PoliticalRelationship,
  RawInput,
  RecordMetadata,
  SourceRecord,
  SourcedRecord,
  TerritoryVersion,
  Transformation,
  PoliticalProfile,
  CulturalRelationship,
  VerifiedSitelink,
} from './types.ts';
import { isWikipediaSitelink } from './sitelink.ts';
import {
  array,
  boolean,
  enumeration,
  hashSchema,
  httpsSchema,
  idSchema,
  issue,
  nullable,
  numeric,
  object,
  refine,
  text,
  timestampSchema,
  type Schema,
} from './schema.ts';
import { reviewSchema, temporalExtentSchema } from './temporal.ts';
import {
  areaGeometrySchema,
  bboxSchema,
  geometrySchema,
  placeGeometrySchema,
  pointSchema,
} from './geometry.ts';

const nameSchema = object<Name>({
  language: text(30, /^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/),
  value: text(300),
});
export const confidenceSchema = object<Confidence>({
  level: enumeration(['high', 'medium', 'low', 'unknown'] as const),
  rationale: text(),
  spatialAccuracyKm: nullable(numeric(0, 40075)),
});
const metadata = {
  id: idSchema,
  names: array(nameSchema, 1, 30),
  alternativeNames: array(nameSchema, 0, 100),
  wikidataId: nullable(text(20, /^Q[1-9]\d*$/)),
  temporal: temporalExtentSchema,
  confidence: confidenceSchema,
  licenseId: text(100),
  attribution: text(4000),
  reviewStatus: reviewSchema,
  synthetic: boolean,
} satisfies { [K in keyof RecordMetadata]: Schema<RecordMetadata[K]> };
export const evidenceSchema = object<Evidence>({
  sourceId: idSchema,
  sourceRevision: text(200),
  rawInputId: idSchema,
  locator: text(),
  claims: array(
    enumeration(['identity', 'temporal', 'geometry', 'location', 'coverage'] as const),
    1,
    5,
  ),
  licenseId: text(100),
  attribution: text(4000),
  basis: enumeration(['observed', 'derived'] as const),
  transformationIds: array(idSchema, 0, 30),
});
const sourced = { ...metadata, evidence: array(evidenceSchema, 1, 30) } satisfies {
  [K in keyof SourcedRecord]: Schema<SourcedRecord[K]>;
};
const missingGeometry = nullable(text());
const entityTypes = [
  'POLITY',
  'KINGDOM',
  'EMPIRE',
  'CULTURE',
  'CIVILIZATION',
  'CULTURAL_REGION',
  'PERSON',
  'BATTLE',
  'EVENT',
  'PLACE',
] as const;
const politicalAssertion = {
  id: idSchema,
  temporal: temporalExtentSchema,
  evidenceIndices: array(numeric(0, 29, true), 1, 30),
};
export const politicalProfileSchema = object<PoliticalProfile>({
  classifications: array(
    object({ ...politicalAssertion, value: enumeration(['POLITY', 'KINGDOM', 'EMPIRE'] as const) }),
    0,
    6,
  ),
  names: array(
    object({
      ...politicalAssertion,
      name: nameSchema,
      usage: enumeration(['preferred', 'alternative'] as const),
    }),
    0,
    40,
  ),
  descriptions: array(
    object({
      ...politicalAssertion,
      language: text(30, /^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/),
      text: text(),
    }),
    0,
    10,
  ),
  capitals: array(object({ ...politicalAssertion, placeId: idSchema }), 0, 10),
});
export const historicalEntitySchema = object<HistoricalEntity>(
  {
    ...sourced,
    kind: enumeration(['entity'] as const),
    entityType: enumeration(entityTypes),
    politicalProfile: politicalProfileSchema,
  },
  ['politicalProfile'],
);
export const territoryVersionSchema = object<TerritoryVersion>({
  ...sourced,
  kind: enumeration(['territory'] as const),
  entityId: idSchema,
  interpretationId: idSchema,
  boundary: enumeration(['documented', 'approximate', 'disputed'] as const),
  geometry: nullable(
    refine(geometrySchema, (value, path, issues) => {
      if (value.type === 'Point')
        issue(issues, path, 'TERRITORY_GEOMETRY', 'Sınır için alan veya çizgi gerekli.');
    }) as Schema<Exclude<TerritoryVersion['geometry'], null>>,
  ),
  geometryReason: missingGeometry,
  scopeId: idSchema,
  extentType: enumeration(['full-area', 'partial-area', 'boundary-segment'] as const),
  politicalStatus: enumeration([
    'claimed',
    'controlled',
    'disputed',
    'shared',
    'treaty-delimitation',
    'unknown',
  ] as const),
  counterpartEntityIds: array(idSchema, 0, 30),
  borderPrecision: object({
    classification: enumeration([
      'surveyed',
      'reconstructed',
      'treaty-idealized',
      'unknown',
    ] as const),
    toleranceKm: nullable(numeric(0, 40075)),
    description: text(),
  }),
});
export const politicalRelationshipSchema = object<PoliticalRelationship>({
  ...sourced,
  kind: enumeration(['political-relationship'] as const),
  fromEntityId: idSchema,
  toEntityId: idSchema,
  relationship: enumeration([
    'vassalage',
    'overlapping-claim',
    'disputed-control',
    'shared-control',
    'cession',
    'predecessor-of',
    'split-from',
    'merged-into',
    'founded-from',
    'name-continuity',
  ] as const),
  territoryIds: array(idSchema, 0, 100),
  description: text(),
});
export const verifiedSitelinkSchema = refine(
  object<VerifiedSitelink>({
    wikidataId: text(20, /^Q[1-9]\d*$/),
    site: text(30),
    title: text(300),
    url: httpsSchema,
    sourceId: idSchema,
    sourceRevision: text(200),
    rawInputId: idSchema,
    verifiedAt: timestampSchema,
  }),
  (link, path, issues) => {
    if (!isWikipediaSitelink(link))
      issue(issues, path, 'WIKIPEDIA_SITELINK', 'Sitelink site/başlık/URL eşleşmesi geçersiz.');
  },
);
export const culturalRegionSchema = object<CulturalRegion>(
  {
    ...sourced,
    kind: enumeration(['cultural-region'] as const),
    entityId: idSchema,
    semantics: enumeration(['cultural-interaction', 'cultural-distribution'] as const),
    geometry: nullable(areaGeometrySchema),
    geometryReason: missingGeometry,
    culturalContext: object({
      interpretationId: idSchema,
      description: text(),
      geographicContext: text(),
      uncertainties: array(text(), 1, 10),
    }),
    wikipedia: verifiedSitelinkSchema,
  },
  ['culturalContext', 'wikipedia'],
);
export const culturalRelationshipSchema = object<CulturalRelationship>({
  ...sourced,
  kind: enumeration(['cultural-relationship'] as const),
  fromEntityId: idSchema,
  toEntityId: idSchema,
  relationship: enumeration([
    'interaction',
    'influence',
    'affiliation',
    'related-tradition',
  ] as const),
  regionIds: array(idSchema, 0, 100),
  description: text(),
});
export const personProfileSchema = object<PersonProfile>({
  birth: temporalExtentSchema,
  death: temporalExtentSchema,
  descriptions: array(nameSchema, 0, 10),
  occupations: array(nameSchema, 0, 30),
  wikipedia: array(verifiedSitelinkSchema, 0, 5),
  image: nullable(
    object<NonNullable<PersonProfile['image']>>({
      sourceUrl: httpsSchema,
      licenseId: text(100),
      attribution: text(4000),
      reviewStatus: reviewSchema,
    }),
  ),
});
export const personSchema = object<Person>(
  {
    ...sourced,
    kind: enumeration(['person'] as const),
    entityId: idSchema,
    profile: personProfileSchema,
  },
  ['profile'],
);
export const personLocationSchema = object<PersonLocation>(
  {
    ...sourced,
    kind: enumeration(['person-location'] as const),
    personId: idSchema,
    placeId: nullable(idSchema),
    locationType: enumeration(['timed-presence', 'biographical'] as const),
    relationship: enumeration(['presence', 'birth', 'death', 'residence', 'associated'] as const),
    relationshipType: enumeration([
      'BIRTH',
      'DEATH',
      'RESIDENCE',
      'WORK',
      'REIGN',
      'DOCUMENTED_EVENT',
    ] as const),
    spatialContext: object<NonNullable<PersonLocation['spatialContext']>>({
      scale: enumeration(['site', 'city', 'region', 'kingdom', 'unknown'] as const),
      coordinateRole: enumeration(['documented-site', 'representative-place'] as const),
      description: text(),
    }),
    geometry: nullable(pointSchema),
    geometryReason: missingGeometry,
  },
  ['relationshipType', 'spatialContext'],
);
export const eventDetailsSchema = object<EventDetails>({
  placeId: nullable(idSchema),
  description: array(nameSchema, 1, 10),
  locationPrecision: object<EventDetails['locationPrecision']>({
    classification: enumeration([
      'site',
      'approximate-point',
      'documented-region',
      'unknown',
    ] as const),
    toleranceKm: nullable(numeric(0, 40075)),
    explanation: text(),
  }),
  wikipediaSitelinks: array(verifiedSitelinkSchema, 0, 5),
  alternativeDates: array(
    object<EventDetails['alternativeDates'][number]>({
      temporal: temporalExtentSchema,
      evidenceIndices: array(numeric(0, 29, true), 1, 30),
      explanation: text(),
    }),
    0,
    10,
  ),
});
export const historicalEventSchema = object<HistoricalEvent>(
  {
    ...sourced,
    kind: enumeration(['event'] as const),
    entityId: idSchema,
    eventType: enumeration([
      'BATTLE',
      'WAR',
      'CAMPAIGN',
      'TREATY',
      'FOUNDATION',
      'DISSOLUTION',
      'CULTURAL_EVENT',
      'OTHER',
    ] as const),
    details: eventDetailsSchema,
    participantIds: array(idSchema, 0, 100),
    locationSemantics: enumeration(['documented', 'representative', 'unknown'] as const),
    geometry: nullable(placeGeometrySchema),
    geometryReason: missingGeometry,
  },
  ['details'],
);
export const historicalPlaceSchema = object<HistoricalPlace>({
  ...sourced,
  kind: enumeration(['place'] as const),
  entityId: idSchema,
  geometry: nullable(placeGeometrySchema),
  geometryReason: missingGeometry,
});
export const dataCoverageSchema = object<DataCoverage>({
  ...sourced,
  kind: enumeration(['coverage'] as const),
  layer: enumeration(['polity', 'culture', 'person', 'battle', 'event', 'place'] as const),
  region: bboxSchema,
  status: enumeration(['partial', 'no-verified-data', 'license-blocked', 'outside-pilot'] as const),
  recordCount: numeric(0, 1000, true),
  recordIds: array(idSchema, 0, 1000),
  description: text(),
});
const recordSchemas = {
  entity: historicalEntitySchema,
  territory: territoryVersionSchema,
  'political-relationship': politicalRelationshipSchema,
  'cultural-region': culturalRegionSchema,
  'cultural-relationship': culturalRelationshipSchema,
  person: personSchema,
  'person-location': personLocationSchema,
  event: historicalEventSchema,
  place: historicalPlaceSchema,
  coverage: dataCoverageSchema,
};
export const historicalRecordSchema: Schema<HistoricalRecord> = {
  check(value, path, issues) {
    const kind = value && typeof value === 'object' && 'kind' in value ? value.kind : null;
    if (typeof kind !== 'string' || !Object.hasOwn(recordSchemas, kind)) {
      issue(issues, path, 'RECORD_KIND', 'Bilinmeyen kayıt türü.');
      return;
    }
    recordSchemas[kind as keyof typeof recordSchemas].check(value, path, issues);
  },
};
export const sourceRecordSchema = object<SourceRecord>({
  ...metadata,
  kind: enumeration(['source'] as const),
  sourceKey: text(100),
  url: httpsSchema,
  revision: text(200),
  retrievedAt: timestampSchema,
  rawInputId: idSchema,
  upstreamIds: array(idSchema, 0, 100),
  licenseUrl: httpsSchema,
  licenseScope: enumeration(['data', 'code', 'article', 'image', 'tiles'] as const),
  objectLicense: nullable(text(100)),
  membersReviewed: boolean,
});
export const rawInputSchema = refine(
  object<RawInput>({
    id: idSchema,
    relativePath: text(250, /^[A-Za-z0-9._/-]+$/),
    sha256: hashSchema,
    bytes: numeric(1, 8 * 1024 * 1024, true),
    sourceId: idSchema,
    sourceRevision: text(200),
  }),
  (value, path, issues) => {
    if (value.relativePath.split('/').some((part) => !part || part === '.' || part === '..'))
      issue(issues, path, 'RAW_PATH', 'Ham dosya yolu göreli ve traversal içermeyen yol olmalı.');
  },
);
export const transformationSchema = object<Transformation>({
  id: idSchema,
  version: text(50),
  description: text(),
  inputIds: array(idSchema, 1, 32),
});
export const catalogSchema = object<Catalog>({
  schemaVersion: enumeration([2] as const),
  catalogVersion: text(80, /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/),
  createdAt: timestampSchema,
  sources: array(sourceRecordSchema, 0, 1000),
  records: array(historicalRecordSchema, 0, 1000),
  // Reviewed discovery adds 35 source-bound inputs. Still bounded; bootstrap byte
  // limit remains 512KiB and per-chunk source closure remains 32.
  inputs: array(rawInputSchema, 0, 64),
  transformations: array(transformationSchema, 0, 100),
});
