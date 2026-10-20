import { isHistoricalFilters, type HistoricalFilters } from '../preferences/model.ts';
import { isNoteMarker, type NoteMarker } from '../annotations/model.ts';
import { PILOT_ID, PILOT_VERSION } from '../data/pilot-contract.ts';
import type { AppliedTimeline } from '../timeline/store.ts';
import { isHistoricalSelectionPage, type HistoricalSelectionPage } from './selection.ts';
import { getModernCity } from '../places/modern.ts';
import { isPlaceSelection, type PlaceSelection } from '../places/catalog.ts';
import { placesManifest } from '../places/generated/catalog.ts';

// Köprü yalnız küçük JSON metinlerini taşır; geometri veya çalıştırılabilir kod taşımaz.
export const BRIDGE_VERSION = 1;
export const MAX_MESSAGE_BYTES = 4096;
export const MAX_MAP_ZOOM = 16;
export type MapProjection = 'mercator' | 'globe';
export const DEMO_ID = 'synthetic-demo';
export interface CameraState {
  center: { lng: number; lat: number };
  zoom: number;
  bearing: number;
  pitch: number;
}
export const INITIAL_CAMERA: CameraState = {
  // A view preference, never a historical country/settlement coordinate.
  center: { lng: 35, lat: 39 },
  zoom: 4,
  bearing: 0,
  pitch: 0,
};
export type RendererError = 'webgl' | 'assets' | 'context-lost' | 'renderer' | 'timeout';
type Envelope<T extends string, P> = {
  version: 1;
  type: T;
  requestId: string;
  sessionId: string;
  payload: P;
};
export type RoadStatus = 'off' | 'zoom' | 'loading' | 'ready' | 'error';
export type GlobeCommand =
  | Envelope<'selection.page', { selectionId: number; revision: number; offset: number }>
  | Envelope<'camera.reset', Record<string, never>>
  | Envelope<'camera.set', CameraState>
  | Envelope<'polity.select', { recordId: string | null; revision: number }>
  | Envelope<'polity.focus', { recordId: string; revision: number; reducedMotion: boolean }>
  | Envelope<
      'catalog.view',
      {
        projection?: MapProjection;
        notes?: NoteMarker[];
        showDemo?: boolean;
        reducedMotion?: boolean;
        camera?: CameraState;
        year: number;
        polity: boolean;
        culture: boolean;
        person?: boolean;
        battle?: boolean;
        event?: boolean;
        labels?: boolean;
        modernCities?: boolean;
        modernRoads?: boolean;
        retryData?: boolean;
        sparseLabels?: boolean;
        filters?: HistoricalFilters;
        includeApproximatePersons?: boolean;
        focusPilot: boolean;
        previewSnapshot?: boolean;
        revision?: number;
        suspendHistory?: boolean;
        selectedId?: string | null;
      }
    >;
export type GlobeEvent =
  | Envelope<'note.selected', { id: string }>
  | Envelope<'roads.status', { state: RoadStatus }>
  | Envelope<'city.selected', { cityId: string }>
  | Envelope<'place.selected', PlaceSelection>
  | Envelope<
      'places.status',
      { state: 'loading' | 'ready' | 'partial' | 'error' | 'not-installed'; loaded: number }
    >
  | Envelope<
      'entity.article',
      { recordId: string; revision: number; catalogVersion: typeof PILOT_VERSION }
    >
  | Envelope<'catalog.error', { revision: number; catalogVersion: string; code: 'data' }>
  | Envelope<'selection.changed', HistoricalSelectionPage>
  | Envelope<'renderer.ready', { projection: 'globe' }>
  | Envelope<'camera.changed', CameraState>
  | Envelope<'demo.selected', { id: typeof DEMO_ID; synthetic: true }>
  | Envelope<
      'entity.selected',
      {
        recordId: string;
        catalogVersion: typeof PILOT_VERSION;
        revision?: number;
        candidateIds?: string[];
      }
    >
  | Envelope<'catalog.applied', AppliedTimeline>
  | Envelope<'renderer.error', { code: RendererError }>;
export type GlobeMessage = GlobeCommand | GlobeEvent;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, names: string[]): boolean {
  return (
    Object.keys(value).length === names.length && names.every((key) => Object.hasOwn(value, key))
  );
}
function number(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
export function isCamera(value: unknown): value is CameraState {
  return (
    record(value) &&
    keys(value, ['center', 'zoom', 'bearing', 'pitch']) &&
    record(value.center) &&
    keys(value.center, ['lng', 'lat']) &&
    number(value.center.lng, -180, 180) &&
    number(value.center.lat, -90, 90) &&
    number(value.zoom, 0, MAX_MAP_ZOOM) &&
    number(value.bearing, -180, 180) &&
    number(value.pitch, 0, 60)
  );
}
// TextEncoder'a bağımlı değil: Hermes tarafında da aynı UTF-8 sınırı.
function byteLength(value: string): number {
  let bytes = 0;
  for (const character of value) {
    const point = character.codePointAt(0)!;
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
  }
  return bytes;
}
export function parseMessage(
  raw: unknown,
  direction: 'command',
  sessionId: string,
): GlobeCommand | null;
export function parseMessage(
  raw: unknown,
  direction: 'event',
  sessionId: string,
): GlobeEvent | null;
export function parseMessage(
  raw: unknown,
  direction: 'command' | 'event',
  sessionId: string,
): GlobeMessage | null {
  if (
    typeof raw !== 'string' ||
    raw.length > MAX_MESSAGE_BYTES ||
    byteLength(raw) > MAX_MESSAGE_BYTES
  )
    return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !record(value) ||
    !keys(value, ['version', 'type', 'requestId', 'sessionId', 'payload']) ||
    value.version !== BRIDGE_VERSION ||
    value.sessionId !== sessionId ||
    typeof value.sessionId !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,80}$/.test(value.sessionId) ||
    typeof value.requestId !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,80}$/.test(value.requestId) ||
    !record(value.payload)
  )
    return null;
  const payload = value.payload;
  const validId = (id: unknown): id is string =>
    typeof id === 'string' && id.length <= 160 && /^[a-z][a-z0-9-]*:[A-Za-z0-9._:-]+$/u.test(id);
  const validRevision = (revision: unknown) =>
    number(revision, 0, 1_000_000_000) && Number.isInteger(revision);
  if (direction === 'command') {
    if (
      value.type === 'selection.page' &&
      keys(payload, ['selectionId', 'revision', 'offset']) &&
      validRevision(payload.revision) &&
      validRevision(payload.selectionId) &&
      Number(payload.selectionId) > 0 &&
      number(payload.offset, 0, 999) &&
      Number.isInteger(payload.offset) &&
      Number(payload.offset) % 8 === 0
    )
      return value as GlobeCommand;
    if (value.type === 'camera.reset' && keys(payload, [])) return value as GlobeCommand;
    if (value.type === 'camera.set' && isCamera(payload)) return value as GlobeCommand;
    if (
      value.type === 'polity.select' &&
      keys(payload, ['recordId', 'revision']) &&
      (payload.recordId === null || validId(payload.recordId)) &&
      validRevision(payload.revision)
    )
      return value as GlobeCommand;
    if (
      value.type === 'polity.focus' &&
      keys(payload, ['recordId', 'revision', 'reducedMotion']) &&
      validId(payload.recordId) &&
      validRevision(payload.revision) &&
      typeof payload.reducedMotion === 'boolean'
    )
      return value as GlobeCommand;

    if (
      value.type === 'catalog.view' &&
      ['year', 'polity', 'culture', 'focusPilot'].every((key) => Object.hasOwn(payload, key)) &&
      Object.keys(payload).every((key) =>
        [
          'projection',
          'notes',
          'showDemo',
          'reducedMotion',
          'retryData',
          'filters',
          'labels',
          'modernCities',
          'modernRoads',
          'sparseLabels',
          'camera',
          'year',
          'polity',
          'culture',
          'person',
          'battle',
          'event',
          'includeApproximatePersons',
          'focusPilot',
          'previewSnapshot',
          'revision',
          'suspendHistory',
          'selectedId',
        ].includes(key),
      ) &&
      (!Object.hasOwn(payload, 'reducedMotion') || typeof payload.reducedMotion === 'boolean') &&
      (!Object.hasOwn(payload, 'notes') ||
        (Array.isArray(payload.notes) &&
          payload.notes.length <= 8 &&
          payload.notes.every(
            (n: unknown) =>
              isNoteMarker(n) && Object.keys(n).sort().join(',') === 'id,kind,lat,lng',
          ) &&
          new Set(payload.notes.map((n: NoteMarker) => n.id)).size === payload.notes.length)) &&
      (!Object.hasOwn(payload, 'showDemo') || typeof payload.showDemo === 'boolean') &&
      (!Object.hasOwn(payload, 'projection') ||
        ['globe', 'mercator'].includes(String(payload.projection))) &&
      (!Object.hasOwn(payload, 'retryData') || typeof payload.retryData === 'boolean') &&
      (!Object.hasOwn(payload, 'filters') || isHistoricalFilters(payload.filters)) &&
      (!Object.hasOwn(payload, 'labels') || typeof payload.labels === 'boolean') &&
      (!Object.hasOwn(payload, 'modernCities') || typeof payload.modernCities === 'boolean') &&
      (!Object.hasOwn(payload, 'modernRoads') || typeof payload.modernRoads === 'boolean') &&
      (!Object.hasOwn(payload, 'sparseLabels') || typeof payload.sparseLabels === 'boolean') &&
      (!Object.hasOwn(payload, 'camera') || isCamera(payload.camera)) &&
      (!Object.hasOwn(payload, 'selectedId') ||
        payload.selectedId === null ||
        validId(payload.selectedId)) &&
      (!Object.hasOwn(payload, 'previewSnapshot') ||
        typeof payload.previewSnapshot === 'boolean') &&
      (!Object.hasOwn(payload, 'suspendHistory') || typeof payload.suspendHistory === 'boolean') &&
      (!Object.hasOwn(payload, 'revision') ||
        (number(payload.revision, 0, 1_000_000_000) && Number.isInteger(payload.revision))) &&
      number(payload.year, -2000, new Date().getFullYear()) &&
      Number.isInteger(payload.year) &&
      payload.year !== 0 &&
      typeof payload.polity === 'boolean' &&
      typeof payload.culture === 'boolean' &&
      (!Object.hasOwn(payload, 'person') || typeof payload.person === 'boolean') &&
      (!Object.hasOwn(payload, 'includeApproximatePersons') ||
        typeof payload.includeApproximatePersons === 'boolean') &&
      (!Object.hasOwn(payload, 'battle') || typeof payload.battle === 'boolean') &&
      (!Object.hasOwn(payload, 'event') || typeof payload.event === 'boolean') &&
      typeof payload.focusPilot === 'boolean'
    )
      return value as GlobeCommand;
  } else {
    if (
      value.type === 'note.selected' &&
      keys(payload, ['id']) &&
      typeof payload.id === 'string' &&
      /^local:[a-z0-9-]{1,48}$/.test(payload.id)
    )
      return value as GlobeEvent;
    if (
      value.type === 'roads.status' &&
      keys(payload, ['state']) &&
      typeof payload.state === 'string' &&
      ['off', 'zoom', 'loading', 'ready', 'error'].includes(payload.state)
    )
      return value as GlobeEvent;
    if (value.type === 'place.selected' && isPlaceSelection(payload, placesManifest))
      return value as GlobeEvent;
    if (
      value.type === 'places.status' &&
      keys(payload, ['state', 'loaded']) &&
      ['loading', 'ready', 'partial', 'error', 'not-installed'].includes(String(payload.state)) &&
      number(payload.loaded, 0, 14000) &&
      Number.isInteger(payload.loaded)
    )
      return value as GlobeEvent;
    if (
      value.type === 'catalog.error' &&
      keys(payload, ['revision', 'catalogVersion', 'code']) &&
      validRevision(payload.revision) &&
      payload.catalogVersion === PILOT_VERSION &&
      payload.code === 'data'
    )
      return value as GlobeEvent;
    if (
      value.type === 'selection.changed' &&
      isHistoricalSelectionPage(payload) &&
      payload.catalogVersion === PILOT_VERSION
    )
      return value as GlobeEvent;
    if (
      value.type === 'renderer.ready' &&
      keys(payload, ['projection']) &&
      payload.projection === 'globe'
    )
      return value as GlobeEvent;
    if (value.type === 'camera.changed' && isCamera(payload)) return value as GlobeEvent;
    if (
      value.type === 'city.selected' &&
      keys(payload, ['cityId']) &&
      typeof payload.cityId === 'string' &&
      getModernCity(payload.cityId)
    )
      return value as GlobeEvent;
    if (
      value.type === 'catalog.applied' &&
      keys(payload, ['revision', 'year', 'sourceYear', 'coverageStatus', 'catalogVersion']) &&
      number(payload.revision, 0, 1_000_000_000) &&
      Number.isInteger(payload.revision) &&
      number(payload.year, -2000, new Date().getFullYear()) &&
      Number.isInteger(payload.year) &&
      payload.year !== 0 &&
      (payload.sourceYear === null ||
        (number(payload.sourceYear, -2000, new Date().getFullYear()) &&
          Number.isInteger(payload.sourceYear) &&
          payload.sourceYear !== 0)) &&
      [
        'loading',
        'exact verified',
        'documented approximate',
        'no supported historical geography',
      ].includes(String(payload.coverageStatus)) &&
      ['loading', 'no supported historical geography'].includes(String(payload.coverageStatus)) ===
        (payload.sourceYear === null) &&
      payload.catalogVersion === PILOT_VERSION
    )
      return value as GlobeEvent;

    if (
      value.type === 'demo.selected' &&
      keys(payload, ['id', 'synthetic']) &&
      payload.id === DEMO_ID &&
      payload.synthetic === true
    )
      return value as GlobeEvent;
    if (
      value.type === 'entity.article' &&
      keys(payload, ['recordId', 'revision', 'catalogVersion']) &&
      validId(payload.recordId) &&
      validRevision(payload.revision) &&
      payload.catalogVersion === PILOT_VERSION
    )
      return value as GlobeEvent;
    if (
      value.type === 'entity.selected' &&
      payload.catalogVersion === PILOT_VERSION &&
      ((keys(payload, ['recordId', 'catalogVersion']) && payload.recordId === PILOT_ID) ||
        (keys(payload, ['recordId', 'catalogVersion', 'revision', 'candidateIds']) &&
          validId(payload.recordId) &&
          validRevision(payload.revision) &&
          Array.isArray(payload.candidateIds) &&
          payload.candidateIds.length >= 1 &&
          payload.candidateIds.length <= 8 &&
          payload.candidateIds.every(validId) &&
          new Set(payload.candidateIds).size === payload.candidateIds.length &&
          payload.candidateIds.includes(payload.recordId)))
    )
      return value as GlobeEvent;
    if (
      value.type === 'renderer.error' &&
      keys(payload, ['code']) &&
      typeof payload.code === 'string' &&
      ['webgl', 'assets', 'context-lost', 'renderer', 'timeout'].includes(payload.code)
    )
      return value as GlobeEvent;
  }
  return null;
}
export function encode(message: GlobeMessage): string {
  return JSON.stringify(message);
}
