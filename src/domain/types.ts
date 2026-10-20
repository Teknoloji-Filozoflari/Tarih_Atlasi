/** Domain v2. Historical years have no zero; GeoJSON positions are [longitude, latitude]. */
export type ReviewStatus = 'unverified' | 'in-review' | 'verified' | 'rejected';
export type EntityType =
  | 'POLITY'
  | 'KINGDOM'
  | 'EMPIRE'
  | 'CULTURE'
  | 'CIVILIZATION'
  | 'CULTURAL_REGION'
  | 'PERSON'
  | 'BATTLE'
  | 'EVENT'
  | 'PLACE';
export interface Name {
  language: string;
  value: string;
}
export interface HistoricalDate {
  year: number;
  month: number | null;
  day: number | null;
}
export type TemporalBound =
  { kind: 'known'; date: HistoricalDate } | { kind: 'unknown' | 'unbounded'; date: null };
export interface TemporalExtent {
  start: TemporalBound;
  end: TemporalBound;
  precision: 'day' | 'month' | 'year' | 'decade' | 'century' | 'range' | 'unknown';
  uncertain: boolean;
  calendar: 'proleptic-gregorian';
  yearNumbering: 'historical-no-zero';
  sourceDate: { text: string; calendar: string; yearNumbering: string };
  basis: 'observed' | 'derived';
  reviewStatus: ReviewStatus;
  /** Explicit source claim; absence never authorizes spreading geometry over years. */
  support?: { kind: 'snapshot' | 'continuous'; note: string };
  /** Disjoint, inclusive supported periods within the outer envelope; gaps remain gaps. */
  periods?: { start: HistoricalDate; end: HistoricalDate }[];
}
export interface Confidence {
  level: 'high' | 'medium' | 'low' | 'unknown';
  rationale: string;
  spatialAccuracyKm: number | null;
}
export type Claim = 'identity' | 'temporal' | 'geometry' | 'location' | 'coverage';
export interface Evidence {
  sourceId: string;
  sourceRevision: string;
  rawInputId: string;
  locator: string;
  claims: Claim[];
  licenseId: string;
  attribution: string;
  basis: 'observed' | 'derived';
  transformationIds: string[];
}
export interface RecordMetadata {
  id: string;
  names: Name[];
  alternativeNames: Name[];
  wikidataId: string | null;
  temporal: TemporalExtent;
  confidence: Confidence;
  licenseId: string;
  attribution: string;
  reviewStatus: ReviewStatus;
  synthetic: boolean;
}
export interface SourcedRecord extends RecordMetadata {
  evidence: Evidence[];
}
export type Position = [number, number];
export type BBox = [number, number, number, number];
export interface Point {
  type: 'Point';
  coordinates: Position;
}
export interface LineString {
  type: 'LineString';
  coordinates: Position[];
}
export interface Polygon {
  type: 'Polygon';
  coordinates: Position[][];
}
export interface MultiPolygon {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}
export type AreaGeometry = Polygon | MultiPolygon;
export type Geometry = Point | LineString | AreaGeometry;
export interface GeoFeature {
  type: 'Feature';
  id: string;
  properties: { recordId: string };
  geometry: Geometry;
}
export interface FeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}
export interface HistoricalEntity extends SourcedRecord {
  kind: 'entity';
  entityType: EntityType;
  politicalProfile?: PoliticalProfile;
}
export type PoliticalType = 'POLITY' | 'KINGDOM' | 'EMPIRE';
export interface PoliticalAssertion {
  id: string;
  temporal: TemporalExtent;
  /** Indices into the owning entity's validated evidence array; no parallel rights bypass. */
  evidenceIndices: number[];
}
export interface PoliticalProfile {
  classifications: (PoliticalAssertion & { value: PoliticalType })[];
  names: (PoliticalAssertion & { name: Name; usage: 'preferred' | 'alternative' })[];
  descriptions: (PoliticalAssertion & { language: string; text: string })[];
  capitals: (PoliticalAssertion & { placeId: string })[];
}
export interface SpatialRecord extends SourcedRecord {
  geometry: Geometry | null;
  geometryReason: string | null;
}
export interface TerritoryVersion extends SpatialRecord {
  kind: 'territory';
  entityId: string;
  interpretationId: string;
  boundary: 'documented' | 'approximate' | 'disputed';
  geometry: AreaGeometry | LineString | null;
  scopeId: string;
  extentType: 'full-area' | 'partial-area' | 'boundary-segment';
  politicalStatus:
    'claimed' | 'controlled' | 'disputed' | 'shared' | 'treaty-delimitation' | 'unknown';
  counterpartEntityIds: string[];
  borderPrecision: {
    classification: 'surveyed' | 'reconstructed' | 'treaty-idealized' | 'unknown';
    toleranceKm: number | null;
    description: string;
  };
}
export interface PoliticalRelationship extends SourcedRecord {
  kind: 'political-relationship';
  fromEntityId: string;
  toEntityId: string;
  relationship:
    | 'vassalage'
    | 'overlapping-claim'
    | 'disputed-control'
    | 'shared-control'
    | 'cession'
    | 'predecessor-of'
    | 'split-from'
    | 'merged-into'
    | 'founded-from'
    | 'name-continuity';
  territoryIds: string[];
  description: string;
}
export interface CulturalRegion extends SpatialRecord {
  kind: 'cultural-region';
  entityId: string;
  semantics: 'cultural-interaction' | 'cultural-distribution';
  geometry: AreaGeometry | null;
  culturalContext?: {
    interpretationId: string;
    description: string;
    geographicContext: string;
    uncertainties: string[];
  };
  wikipedia?: VerifiedSitelink;
}
export interface VerifiedSitelink {
  wikidataId: string;
  site: string;
  title: string;
  url: string;
  sourceId: string;
  sourceRevision: string;
  rawInputId: string;
  verifiedAt: string;
}
export interface CulturalRelationship extends SourcedRecord {
  kind: 'cultural-relationship';
  fromEntityId: string;
  toEntityId: string;
  relationship: 'interaction' | 'influence' | 'affiliation' | 'related-tradition';
  regionIds: string[];
  description: string;
}
export interface Person extends SourcedRecord {
  kind: 'person';
  entityId: string;
  profile?: PersonProfile;
}
export interface PersonProfile {
  birth: TemporalExtent;
  death: TemporalExtent;
  descriptions: Name[];
  occupations: Name[];
  wikipedia: VerifiedSitelink[];
  /** No automatic P18 download: file rights require a separate reviewed media pipeline. */
  image: {
    sourceUrl: string;
    licenseId: string;
    attribution: string;
    reviewStatus: ReviewStatus;
  } | null;
}
export type HistoricalPerson = Person & { profile: PersonProfile };
export type PersonRelationship =
  'BIRTH' | 'DEATH' | 'RESIDENCE' | 'WORK' | 'REIGN' | 'DOCUMENTED_EVENT';
export interface PersonLocation extends SpatialRecord {
  kind: 'person-location';
  personId: string;
  placeId: string | null;
  locationType: 'timed-presence' | 'biographical';
  relationship: 'presence' | 'birth' | 'death' | 'residence' | 'associated';
  relationshipType?: PersonRelationship;
  spatialContext?: {
    scale: 'site' | 'city' | 'region' | 'kingdom' | 'unknown';
    coordinateRole: 'documented-site' | 'representative-place';
    description: string;
  };
  geometry: Point | null;
}
export type HistoricalEventType =
  | 'BATTLE'
  | 'WAR'
  | 'CAMPAIGN'
  | 'TREATY'
  | 'FOUNDATION'
  | 'DISSOLUTION'
  | 'CULTURAL_EVENT'
  | 'OTHER';
export interface EventDetails {
  placeId: string | null;
  description: Name[];
  locationPrecision: {
    classification: 'site' | 'approximate-point' | 'documented-region' | 'unknown';
    toleranceKm: number | null;
    explanation: string;
  };
  wikipediaSitelinks: VerifiedSitelink[];
  alternativeDates: { temporal: TemporalExtent; evidenceIndices: number[]; explanation: string }[];
}
export interface HistoricalEvent extends SpatialRecord {
  kind: 'event';
  entityId: string;
  eventType: HistoricalEventType;
  details?: EventDetails;
  geometry: Point | AreaGeometry | null;
  participantIds: string[];
  locationSemantics: 'documented' | 'representative' | 'unknown';
}
export interface HistoricalPlace extends SpatialRecord {
  kind: 'place';
  entityId: string;
  geometry: Point | AreaGeometry | null;
}
export interface DataCoverage extends SourcedRecord {
  kind: 'coverage';
  layer: 'polity' | 'culture' | 'person' | 'battle' | 'event' | 'place';
  region: BBox;
  status: 'partial' | 'no-verified-data' | 'license-blocked' | 'outside-pilot';
  recordCount: number;
  recordIds: string[];
  description: string;
}
export type HistoricalRecord =
  | HistoricalEntity
  | TerritoryVersion
  | PoliticalRelationship
  | CulturalRegion
  | CulturalRelationship
  | Person
  | PersonLocation
  | HistoricalEvent
  | HistoricalPlace
  | DataCoverage;
export interface SourceRecord extends RecordMetadata {
  kind: 'source';
  sourceKey: string;
  url: string;
  revision: string;
  retrievedAt: string;
  rawInputId: string;
  upstreamIds: string[];
  licenseUrl: string;
  licenseScope: 'data' | 'code' | 'article' | 'image' | 'tiles';
  objectLicense: string | null;
  membersReviewed: boolean;
}
export interface RawInput {
  id: string;
  relativePath: string;
  sha256: string;
  bytes: number;
  sourceId: string;
  sourceRevision: string;
}
export interface Transformation {
  id: string;
  version: string;
  description: string;
  inputIds: string[];
}
export interface Catalog {
  schemaVersion: 2;
  catalogVersion: string;
  createdAt: string;
  sources: SourceRecord[];
  records: HistoricalRecord[];
  inputs: RawInput[];
  transformations: Transformation[];
}
