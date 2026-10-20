import type { MapProjection } from '../map-contract/protocol.ts';
import { boolean, enumeration, object, parse } from '../domain/schema.ts';
import type { DeepReadonly } from '../data/provider.ts';
import type { HistoricalEntity, HistoricalRecord, PoliticalType } from '../domain/types.ts';
import { politicalClasses } from '../politics/model.ts';

export const confidenceChoices = ['all', 'high', 'medium', 'low', 'unknown'] as const;
export const politicalChoices = ['all', 'POLITY', 'KINGDOM', 'EMPIRE'] as const;
export const relationshipChoices = [
  'all',
  'BIRTH',
  'DEATH',
  'RESIDENCE',
  'WORK',
  'REIGN',
  'DOCUMENTED_EVENT',
] as const;
export const eventChoices = [
  'all',
  'BATTLE',
  'WAR',
  'CAMPAIGN',
  'TREATY',
  'FOUNDATION',
  'DISSOLUTION',
  'CULTURAL_EVENT',
  'OTHER',
] as const;
export interface HistoricalFilters {
  exactOnly: boolean;
  confidence: (typeof confidenceChoices)[number];
  politicalType: (typeof politicalChoices)[number];
  personRelationship: (typeof relationshipChoices)[number];
  eventType: (typeof eventChoices)[number];
}
export const defaultFilters: Readonly<HistoricalFilters> = Object.freeze({
  exactOnly: false,
  confidence: 'all',
  politicalType: 'all',
  personRelationship: 'all',
  eventType: 'all',
});
export const filtersSchema = object<HistoricalFilters>({
  exactOnly: boolean,
  confidence: enumeration(confidenceChoices),
  politicalType: enumeration(politicalChoices),
  personRelationship: enumeration(relationshipChoices),
  eventType: enumeration(eventChoices),
});
export function isHistoricalFilters(value: unknown): value is HistoricalFilters {
  return parse(filtersSchema, value).ok;
}
/** A display filter never supplies missing evidence, dates, coordinates or entity classes. */
export function matchesHistoricalFilters(
  record: DeepReadonly<HistoricalRecord>,
  filters: HistoricalFilters,
  year: number,
  exact: boolean,
  entity?: DeepReadonly<HistoricalEntity>,
): boolean {
  if (filters.exactOnly && !exact) return false;
  if (filters.confidence !== 'all' && record.confidence.level !== filters.confidence) return false;
  if (
    record.kind === 'event' &&
    filters.eventType !== 'all' &&
    record.eventType !== filters.eventType
  )
    return false;
  if (
    record.kind === 'person-location' &&
    filters.personRelationship !== 'all' &&
    record.relationshipType !== filters.personRelationship
  )
    return false;
  if (record.kind === 'territory' && filters.politicalType !== 'all') {
    if (!entity || !politicalClasses(entity, year).includes(filters.politicalType as PoliticalType))
      return false;
  }
  return true;
}
export const layerIds = ['state', 'culture', 'person', 'war', 'event', 'labels'] as const;
export type LayerVisibility = Record<(typeof layerIds)[number], boolean>;
export interface Preferences {
  version: 1;
  projection?: MapProjection;
  language: 'tr';
  theme: 'dark';
  layers: LayerVisibility;
  filters: HistoricalFilters;
  includeApproximatePersons: boolean;
  motion: 'system' | 'reduce';
  sparseLabels: boolean;
  modernCities?: boolean;
}
export const defaultPreferences: Readonly<Preferences> = Object.freeze({
  version: 1,
  projection: 'globe',
  language: 'tr',
  theme: 'dark',
  layers: Object.freeze({
    state: true,
    culture: true,
    person: true,
    war: true,
    event: true,
    labels: true,
  }),
  filters: defaultFilters,
  includeApproximatePersons: true,
  motion: 'system',
  sparseLabels: false,
  modernCities: true,
});
export const preferencesSchema = object<Preferences>(
  {
    projection: enumeration(['mercator', 'globe'] as const),
    version: enumeration([1] as const),
    language: enumeration(['tr'] as const),
    theme: enumeration(['dark'] as const),
    layers: object<LayerVisibility>({
      state: boolean,
      culture: boolean,
      person: boolean,
      war: boolean,
      event: boolean,
      labels: boolean,
    }),
    filters: filtersSchema,
    includeApproximatePersons: boolean,
    motion: enumeration(['system', 'reduce'] as const),
    sparseLabels: boolean,
    modernCities: boolean,
  },
  ['projection', 'modernCities'],
);
export const PREFERENCES_KEY = 'tarihatlasi.preferences.v1';
export const MAX_PREFERENCES_BYTES = 4096;
export function parsePreferences(raw: unknown): Preferences {
  if (
    typeof raw !== 'string' ||
    raw.length > MAX_PREFERENCES_BYTES ||
    Array.from(raw).reduce(
      (n, c) =>
        n +
        (c.codePointAt(0)! <= 0x7f
          ? 1
          : c.codePointAt(0)! <= 0x7ff
            ? 2
            : c.codePointAt(0)! <= 0xffff
              ? 3
              : 4),
      0,
    ) > MAX_PREFERENCES_BYTES
  )
    throw new Error('PREFERENCES_SIZE');
  const value: unknown = JSON.parse(raw);
  const result = parse(preferencesSchema, value);
  if (!result.ok) throw new Error('PREFERENCES_SCHEMA');
  return JSON.parse(JSON.stringify(result.value)) as Preferences;
}
