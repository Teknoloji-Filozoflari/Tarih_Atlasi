import { utf8 } from './chunks/hash.ts';
import type { HistoricalFilters } from '../preferences/model.ts';
import { createEventRepository } from '../events/repository.ts';
import { createSourceRepository } from '../sources/repository.ts';
import { createSearchIndex } from '../discovery/search.ts';
import { eventTitle, eventLayer } from '../events/model.ts';
import { createPersonRepository } from '../persons/repository.ts';
import { personName, personLocationLevel } from '../persons/model.ts';
import { theme } from '../theme/tokens.ts';
import { createHistoricalDataProvider } from './provider.ts';
import { preparedPilot, pilotManifest } from './generated/pilot.ts';
import { validateCatalog } from '../domain/validate.ts';
import type { Geometry } from '../domain/types.ts';
import { PILOT_ID } from './pilot-contract.ts';
import { createPoliticalRepository } from '../politics/repository.ts';
import { createCulturalRepository } from '../cultures/repository.ts';
import { cultureColor, culturalFillOpacity, culturalName } from '../cultures/model.ts';
import {
  politicalNames,
  politicalClasses,
  polityColor,
  politicalAppearance,
} from '../politics/model.ts';
import { politicalAnchor, visualSize } from '../politics/geometry.ts';
import {
  createTimelineEngine,
  type CoverageOptions,
  type CoverageMode,
  type TimelineEngine,
} from '../timeline/engine.ts';

// Pilot is a bounded bootstrap index, never a place to embed a growing world geometry archive.
const bootstrapWithinBudget = utf8(JSON.stringify(preparedPilot)).length <= 512 * 1024;
const validation = validateCatalog(bootstrapWithinBudget ? preparedPilot : null);
const provider = validation.ok ? createHistoricalDataProvider(validation.value) : null;
export const pilotProvider = provider;
export const pilotSources =
  provider && validation.ok ? createSourceRepository(provider, validation.value.inputs) : null;
export const pilotTimeline = provider ? createTimelineEngine(provider) : null;
export const pilotSearch =
  validation.ok && pilotTimeline ? createSearchIndex(validation.value, pilotTimeline) : null;
export const pilotEvents =
  provider && pilotTimeline ? createEventRepository(provider, pilotTimeline) : null;
export const pilotPolitics =
  provider && pilotTimeline ? createPoliticalRepository(provider, pilotTimeline) : null;
export const pilotPersons =
  provider && pilotTimeline ? createPersonRepository(provider, pilotTimeline) : null;
export const pilotCultures =
  provider && pilotTimeline ? createCulturalRepository(provider, pilotTimeline) : null;
export const pilotStatus = Object.freeze({
  ok: validation.ok,
  boundaryCount: validation.ok
    ? validation.value.records.filter((r) => r.kind === 'territory').length
    : 0,
  catalogRecordCount: validation.ok ? validation.value.records.length : 0,
  eventCount: validation.ok ? validation.value.records.filter((r) => r.kind === 'event').length : 0,
  personCount: validation.ok
    ? validation.value.records.filter((r) => r.kind === 'person').length
    : 0,
});
export { pilotManifest };
export async function getPilotRecord(id: string) {
  return provider ? provider.getById(id) : null;
}
export async function getPilotSource() {
  return provider ? provider.getSource('source:nara-alaska-1867') : null;
}
export async function getPilotCoverage(year: number, options: CoverageOptions = {}) {
  if (!pilotTimeline) throw new Error('Pilot catalog rejected');
  return pilotTimeline.getDataCoverage(year, options);
}
export interface HistoricalView {
  year: number;
  polity: boolean;
  culture: boolean;
  person?: boolean;
  battle?: boolean;
  event?: boolean;
  includeApproximatePersons?: boolean;
  previewSnapshot?: boolean;
  labels?: boolean;
  sparseLabels?: boolean;
  filters?: HistoricalFilters;
  signal?: AbortSignal;
}
export interface RenderFeatureCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    id: string;
    properties: {
      recordId: string;
      kind: string;
      boundary: string;
      politicalStatus: string;
      catalogVersion: string;
      sourceYear: number;
      preview: boolean;
      coverageMode: CoverageMode;
      entityId: string;
      label: string;
      color: string;
      lineStyle: string;
      fillOpacity: number;
      priority: number;
      small: boolean;
      anchorLng: number | null;
      anchorLat: number | null;
      classification: string;
    };
    geometry: Geometry;
  }[];
}
export function createHistoricalFeatureLoader(
  timeline: TimelineEngine,
  politics: ReturnType<typeof createPoliticalRepository> | null = null,
) {
  return async function historicalFeatures(
    view: HistoricalView,
    zoom: number,
  ): Promise<RenderFeatureCollection> {
    const layers: NonNullable<CoverageOptions['layers']>[number][] = [];
    if (view.polity) layers.push('polity');
    if (view.culture) layers.push('culture');
    if (view.person) layers.push('person');
    if (view.battle) layers.push('battle');
    if (view.event) layers.push('event');
    if (view.labels) layers.push('place');
    const result = await timeline.getDataCoverage(view.year, {
      ...(view.signal ? { signal: view.signal } : {}),
      layers,
      ...(view.filters ? { filters: view.filters } : {}),
      includeApproximatePersons: view.includeApproximatePersons ?? false,
      ...(view.previewSnapshot ? { preview: 'nearest-snapshot' as const } : {}),
    });
    const features: RenderFeatureCollection['features'] = [];
    const context = politics ? await politics.context(result.sourceYear ?? view.year) : null;
    const entities = new Map(
      (await timeline.getEntitiesAtYear(result.sourceYear ?? view.year)).map((hit) => [
        hit.record.id,
        hit.record,
      ]),
    );
    const cultureCount = result.records.filter(
      (hit) => hit.record.kind === 'cultural-region',
    ).length;
    const eventAreaCount = result.records.filter(
      (h) => h.record.kind === 'event' && h.record.geometry && h.record.geometry.type !== 'Point',
    ).length;
    const persons = new Map(
      (await timeline.getPersonsAtYear(result.sourceYear ?? view.year)).map((h) => [
        h.person.record.id,
        h.person.record,
      ]),
    );
    for (const { record } of result.records) {
      if (record.kind === 'place' && record.geometry) {
        const anchor = politicalAnchor(record.geometry as Geometry);
        features.push({
          type: 'Feature',
          id: record.id,
          geometry: JSON.parse(JSON.stringify(record.geometry)) as Geometry,
          properties: {
            recordId: record.id,
            kind: 'place',
            boundary: 'approximate',
            politicalStatus: 'not-sovereignty',
            catalogVersion: result.catalogVersion,
            sourceYear: result.sourceYear!,
            preview: result.isPreview,
            coverageMode: result.mode,
            entityId: record.entityId,
            label:
              record.names.find((name) => name.language === 'tr')?.value ?? record.names[0]!.value,
            color: theme.colors.muted,
            lineStyle: 'place',
            fillOpacity: 0,
            priority: 30,
            small: true,
            anchorLng: anchor?.[0] ?? null,
            anchorLat: anchor?.[1] ?? null,
            classification: 'PLACE',
          },
        });
        continue;
      }
      if (record.kind === 'event' && record.geometry) {
        const anchor = politicalAnchor(record.geometry as Geometry);
        features.push({
          type: 'Feature',
          id: record.id,
          geometry: JSON.parse(JSON.stringify(record.geometry)) as Geometry,
          properties: {
            recordId: record.id,
            kind: 'event',
            boundary: record.locationSemantics === 'documented' ? 'documented' : 'approximate',
            politicalStatus: 'not-sovereignty',
            catalogVersion: result.catalogVersion,
            sourceYear: result.sourceYear!,
            preview: result.isPreview,
            coverageMode: result.mode,
            entityId: record.entityId,
            label: eventTitle(record),
            color:
              eventLayer(record.eventType) === 'battle' ? theme.colors.war : theme.colors.event,
            lineStyle: 'event',
            fillOpacity: Math.min(0.08, 0.3 / Math.max(1, eventAreaCount)),
            priority: 45,
            small: record.geometry.type === 'Point',
            anchorLng: anchor?.[0] ?? null,
            anchorLat: anchor?.[1] ?? null,
            classification: record.eventType,
          },
        });
        continue;
      }

      if (record.kind === 'person-location' && record.geometry) {
        const person = persons.get(record.personId);
        if (!person) continue;
        const approximate = personLocationLevel(record) === 'approximate';
        features.push({
          type: 'Feature',
          id: record.id,
          geometry: JSON.parse(JSON.stringify(record.geometry)) as Geometry,
          properties: {
            recordId: record.id,
            kind: record.kind,
            boundary: approximate ? 'approximate' : 'documented',
            politicalStatus: 'not-sovereignty',
            catalogVersion: result.catalogVersion,
            sourceYear: result.sourceYear!,
            preview: result.isPreview,
            coverageMode: result.mode,
            entityId: record.personId,
            label: personName(person).value,
            color: theme.colors.person,
            lineStyle: approximate ? 'person-approximate' : 'person-exact',
            fillOpacity: 1,
            priority: 50,
            small: true,
            anchorLng: record.geometry.coordinates[0],
            anchorLat: record.geometry.coordinates[1],
            classification: record.relationshipType ?? 'DOCUMENTED_EVENT',
          },
        });
        continue;
      }
      if (record.kind !== 'territory' && record.kind !== 'cultural-region') continue;
      if (!record.geometry) continue;
      const entity = entities.get(record.entityId);
      const anchor = politicalAnchor(record.geometry as Geometry);
      const size = visualSize(record.geometry as Geometry);
      const appearance =
        record.kind === 'territory'
          ? politicalAppearance(record, context?.relations ?? [])
          : { lineStyle: 'culture', fillOpacity: culturalFillOpacity(Math.max(1, cultureCount)) };
      const geometry = JSON.parse(JSON.stringify(record.geometry)) as Geometry;
      if (record.id === PILOT_ID && geometry.type === 'LineString' && zoom < 2.5)
        geometry.coordinates = [geometry.coordinates[0]!, geometry.coordinates.at(-1)!];
      features.push({
        type: 'Feature',
        id: record.id,
        properties: {
          recordId: record.id,
          kind: record.kind,
          boundary: record.kind === 'territory' ? record.boundary : 'uncertain-area',
          politicalStatus: record.kind === 'territory' ? record.politicalStatus : 'not-sovereignty',
          catalogVersion: result.catalogVersion,
          sourceYear: result.sourceYear!,
          preview: result.isPreview,
          coverageMode: result.mode,
          entityId: record.entityId,
          label:
            record.kind === 'territory' && record.extentType === 'boundary-segment'
              ? record.names[0]!.value
              : entity
                ? record.kind === 'cultural-region'
                  ? culturalName(entity)
                  : politicalNames(entity, result.sourceYear ?? view.year).name
                : record.names[0]!.value,
          color:
            record.kind === 'cultural-region'
              ? cultureColor(record.entityId)
              : polityColor(record.entityId),
          ...appearance,
          priority: size === 0 ? 10 : 1000 / (1 + Math.sqrt(size)),
          small: size < 4,
          anchorLng: anchor?.[0] ?? null,
          anchorLat: anchor?.[1] ?? null,
          classification: entity
            ? record.kind === 'cultural-region'
              ? entity.entityType
              : politicalClasses(entity, result.sourceYear ?? view.year).join(',')
            : '',
        },
        geometry,
      });
    }
    return { type: 'FeatureCollection', features };
  };
}
const pilotFeatureLoader = pilotTimeline
  ? createHistoricalFeatureLoader(pilotTimeline, pilotPolitics)
  : null;
export async function historicalFeatures(
  view: HistoricalView,
  zoom: number,
): Promise<RenderFeatureCollection> {
  if (!pilotFeatureLoader) throw new Error('Pilot catalog rejected');
  return pilotFeatureLoader(view, zoom);
}
