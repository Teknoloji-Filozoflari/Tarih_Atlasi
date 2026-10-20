import type {
  Map,
  LayerSpecification,
  VectorSourceSpecification,
  FilterSpecification,
} from 'maplibre-gl';
import type { RoadStatus } from '../../map-contract/protocol.ts';
import { theme } from '../../theme/tokens.ts';

// Public production service, not a demo style. No external style, labels, glyphs or HTML.
export const ROAD_SOURCE = 'modern-openfreemap';
export const ROAD_TILE = 'https://tiles.openfreemap.org/planet/latest/{z}/{x}/{y}.pbf';
export const roadProvider = Object.freeze({
  url: ROAD_TILE,
  dataLicense: 'ODbL-1.0',
  schemaLicense: 'CC-BY-4.0',
  attribution: 'OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors · ODbL',
  licenseURL: 'https://www.openstreetmap.org/copyright',
  termsURL: 'https://openfreemap.org/tos/',
  temporal: 'contemporary-reference-only',
  offlineBundling: false,
});

/** Exact host/path AND bounded XYZ; historical map resources stay denied by default. */
export function roadRequest(url: string, enabled: boolean) {
  const match =
    /^https:\/\/tiles\.openfreemap\.org\/planet\/latest\/(\d{1,2})\/(\d{1,5})\/(\d{1,5})\.pbf$/.exec(
      url,
    );
  if (!enabled || !match) throw new Error('MAP_RESOURCE_DENIED');
  const [z, x, y] = match.slice(1).map(Number) as [number, number, number];
  if (z < 6 || z > 14 || x >= 2 ** z || y >= 2 ** z) throw new Error('MAP_RESOURCE_DENIED');
  // MapLibre exposes same-origin/include; the fixed remote origin gets no credentials.
  return { url, credentials: 'same-origin' as const, referrerPolicy: 'no-referrer' as const };
}

export function roadSource(): VectorSourceSpecification {
  return {
    type: 'vector',
    tiles: [ROAD_TILE],
    minzoom: 6,
    maxzoom: 14,
    attribution: roadProvider.attribution,
  };
}
export function roadLayers(): LayerSpecification[] {
  const base = { source: ROAD_SOURCE, minzoom: 6 };
  const roadFilter: FilterSpecification = [
    'all',
    ['==', ['geometry-type'], 'LineString'],
    [
      'in',
      ['get', 'class'],
      ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']],
    ],
  ];
  return [
    {
      ...base,
      id: 'modern-landcover',
      type: 'fill',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'farmland']]],
      paint: { 'fill-color': theme.roadMap.landcover, 'fill-opacity': 0.55 },
    },
    {
      ...base,
      id: 'modern-water',
      type: 'fill',
      'source-layer': 'water',
      paint: { 'fill-color': theme.roadMap.water },
    },
    {
      ...base,
      id: 'modern-buildings',
      type: 'fill',
      'source-layer': 'building',
      minzoom: 13,
      paint: { 'fill-color': theme.roadMap.building, 'fill-opacity': 0.7 },
    },
    {
      ...base,
      id: 'modern-road-casing',
      type: 'line',
      'source-layer': 'transportation',
      filter: roadFilter,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': theme.roadMap.casing,
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.7, 10, 2.5, 14, 7],
      },
    },
    {
      ...base,
      id: 'modern-road-center',
      type: 'line',
      'source-layer': 'transportation',
      filter: roadFilter,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': theme.roadMap.road,
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.2, 10, 1.3, 14, 4.5],
      },
    },
  ];
}

export type { RoadStatus } from '../../map-contract/protocol.ts';
/** Optional overlay errors never tear down the globe. Removing source cancels pending tiles. */
export function modernRoads(map: Map, report: (status: RoadStatus) => void) {
  let enabled = false,
    disposed = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const layers = roadLayers();
  const clear = () => {
    clearTimeout(timeout);
    for (const layer of [...layers].reverse())
      if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    if (map.getSource(ROAD_SOURCE)) map.removeSource(ROAD_SOURCE);
  };
  const failed = () => {
    if (!enabled || disposed) return;
    enabled = false;
    clear();
    report('error');
  };
  const status = () => {
    if (!enabled || disposed) return;
    clearTimeout(timeout);
    if (map.getZoom() < 6) {
      report('zoom');
      return;
    }
    if (map.isSourceLoaded(ROAD_SOURCE)) report('ready');
    else {
      report('loading');
      timeout = setTimeout(failed, 20000);
    }
  };
  const loaded = (event: { sourceId?: string; isSourceLoaded?: boolean }) => {
    if (event.sourceId === ROAD_SOURCE && event.isSourceLoaded) status();
  };
  map.on('moveend', status);
  map.on('sourcedata', loaded);
  return {
    allowed: () => enabled && !disposed,
    error: failed,
    set(value: boolean) {
      if (disposed) return;
      enabled = value;
      clear();
      if (!enabled) {
        report('off');
        return;
      }
      try {
        map.addSource(ROAD_SOURCE, roadSource());
        for (const layer of layers) map.addLayer(layer, 'polity-documented');
        status();
      } catch {
        failed();
      }
    },
    dispose() {
      disposed = true;
      enabled = false;
      map.off('moveend', status);
      map.off('sourcedata', loaded);
      clear();
    },
  };
}
