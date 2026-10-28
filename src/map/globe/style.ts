import { theme } from '../../theme/tokens.ts';
import type { StyleSpecification, FilterSpecification, ExpressionSpecification } from 'maplibre-gl';
import type { LandCollection } from './land.ts';
import type { PhysicalDetail } from './physical-detail.ts';

export function physicalStyle(land: LandCollection, detail?: PhysicalDetail): StyleSpecification {
  const style: StyleSpecification = {
    version: 8,
    projection: { type: 'globe' },
    // Fiziksel taban yazısız; siyasi kaynak ve yerel DOM etiketleri ayrı katmandır.
    sources: {
      land: { type: 'geojson', data: land },
      historical: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      ...(detail
        ? {
            lakes: { type: 'geojson' as const, data: detail.lakes },
            rivers: { type: 'geojson' as const, data: detail.rivers },
          }
        : {}),
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': theme.colors.ocean } },
      {
        id: 'physical-land',
        type: 'fill',
        source: 'land',
        paint: { 'fill-color': theme.colors.land, 'fill-outline-color': theme.colors.coast },
      },
      {
        id: 'event-area',
        type: 'fill',
        source: 'historical',
        filter: ['all', ['==', ['get', 'kind'], 'event'], ['==', ['geometry-type'], 'Polygon']],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['coalesce', ['get', 'fillOpacity'], 0.08],
        },
      },
      {
        id: 'event-region-edge',
        type: 'line',
        source: 'historical',
        filter: ['all', ['==', ['get', 'kind'], 'event'], ['==', ['geometry-type'], 'Polygon']],
        paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-dasharray': [2, 3] },
      },
      {
        id: 'polity-area',
        type: 'fill',
        source: 'historical',
        filter: ['all', ['==', ['get', 'kind'], 'territory'], ['==', ['geometry-type'], 'Polygon']],
        paint: {
          'fill-color': ['coalesce', ['get', 'color'], theme.politicalMap.fallback],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            theme.politicalMap.fillOpacity.selected,
            ['coalesce', ['get', 'fillOpacity'], theme.politicalMap.fillOpacity.normal],
          ],
          // Dark land underlay hides residual hairlines; antialias keeps coast edges soft.
          'fill-antialias': true,
        },
      },
      // Keep physical water visible above country color, below political borders.
      {
        id: 'physical-lakes',
        type: 'fill',
        source: detail ? 'lakes' : 'land',
        layout: { visibility: detail ? 'visible' : 'none' },
        paint: { 'fill-color': theme.colors.ocean },
      },
      {
        id: 'physical-rivers',
        type: 'line',
        source: detail ? 'rivers' : 'land',
        minzoom: 2,
        layout: { visibility: detail ? 'visible' : 'none' },
        paint: {
          'line-color': theme.colors.river,
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 8, 1.5],
        },
      },
      {
        id: 'polity-documented',
        type: 'line',
        source: 'historical',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'territory'],
          ['==', ['get', 'lineStyle'], 'documented'],
        ],
        paint: {
          'line-color': theme.politicalMap.border,
          'line-opacity': theme.politicalMap.borderOpacity,
          // Slightly wider borders cover antialias hairlines without inventing edges.
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.9, 3, 1.15, 6, 1.55],
        },
      },
      {
        id: 'polity-approximate',
        type: 'line',
        source: 'historical',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'territory'],
          ['==', ['get', 'lineStyle'], 'approximate'],
        ],
        paint: {
          'line-color': theme.politicalMap.border,
          // Most Cliopatria rows are approximate; keep the mark quiet on dark fills.
          'line-opacity': theme.politicalMap.approximateBorderOpacity,
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.7, 3, 0.95, 6, 1.25],
          'line-dasharray': [2, 2],
        },
      },
      ...(['disputed', 'shared', 'vassal'] as const).map((kind) => ({
        id: `polity-${kind}`,
        type: 'line' as const,
        source: 'historical',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'territory'],
          ['==', ['get', 'lineStyle'], kind],
        ] as FilterSpecification,
        paint: {
          'line-color': theme.politicalMap.border,
          'line-opacity': theme.politicalMap.approximateBorderOpacity,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            0.85,
            3,
            1.1,
            6,
            1.4,
          ] as ExpressionSpecification,
          'line-dasharray':
            kind === 'disputed' ? [1, 2] : kind === 'shared' ? [5, 2, 1, 2] : [4, 3],
        },
      })),
      {
        id: 'polity-selected-outline',
        type: 'line',
        source: 'historical',
        filter: ['==', ['get', 'kind'], 'territory'],
        paint: {
          'line-color': theme.politicalMap.selection,
          // A narrow offset keeps the sourced uncertainty dashes visible.
          'line-width': 1,
          'line-gap-width': 3,
          'line-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0],
        },
      },
      {
        id: 'culture-area',
        type: 'fill',
        source: 'historical',
        filter: ['==', ['get', 'kind'], 'cultural-region'],
        paint: {
          'fill-color': ['coalesce', ['get', 'color'], theme.colors.culture],
          'fill-opacity': ['coalesce', ['get', 'fillOpacity'], 0.1],
        },
      },
      {
        id: 'culture-soft-edge',
        type: 'line',
        source: 'historical',
        filter: ['==', ['get', 'kind'], 'cultural-region'],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], theme.colors.culture],
          'line-width': 6,
          'line-blur': 3,
          'line-opacity': 0.35,
        },
      },
      {
        id: 'culture-uncertain',
        type: 'line',
        source: 'historical',
        filter: ['==', ['get', 'kind'], 'cultural-region'],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], theme.colors.culture],
          'line-width': 2,
          'line-dasharray': [1, 3],
        },
      },
      {
        id: 'culture-selected',
        type: 'line',
        source: 'historical',
        filter: ['==', ['get', 'kind'], 'cultural-region'],
        paint: {
          'line-color': theme.politicalMap.selection,
          'line-width': 2,
          'line-dasharray': [1, 3],
          'line-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0],
        },
      },
    ],
  };
  assertHistoricalMapStyle(style);
  return style;
}

/** Fail closed: this physical style has no symbol/glyph/remote source escape hatch. */
export function assertHistoricalMapStyle(style: StyleSpecification): void {
  const allowed = new Set([
    'ocean',
    'physical-land',
    'physical-lakes',
    'physical-rivers',
    'event-area',
    'event-region-edge',
    'polity-area',
    'polity-documented',
    'polity-approximate',
    'polity-disputed',
    'polity-shared',
    'polity-vassal',
    'polity-selected-outline',
    'culture-area',
    'culture-soft-edge',
    'culture-uncertain',
    'culture-selected',
  ]);
  if (
    style.version !== 8 ||
    style.projection?.type !== 'globe' ||
    style.glyphs ||
    style.sprite ||
    !['historical/land', 'historical/lakes/land/rivers'].includes(
      Object.keys(style.sources).sort().join('/'),
    )
  )
    throw new Error('HISTORICAL_STYLE_POLICY');
  for (const source of Object.values(style.sources)) {
    if (
      source.type !== 'geojson' ||
      typeof source.data !== 'object' ||
      source.data.type !== 'FeatureCollection'
    )
      throw new Error('HISTORICAL_SOURCE_POLICY');
  }
  for (const name of ['land', 'lakes', 'rivers']) {
    const physical = style.sources[name];
    if (!physical && name !== 'land') continue;
    if (
      physical?.type !== 'geojson' ||
      typeof physical.data !== 'object' ||
      physical.data.type !== 'FeatureCollection' ||
      physical.data.features.some(
        (feature: { properties?: Record<string, unknown> | null }) =>
          Object.keys(feature.properties ?? {}).length !== 0,
      )
    )
      throw new Error('PHYSICAL_LABEL_POLICY');
  }
  if (new Set(style.layers.map((layer) => layer.id)).size !== style.layers.length)
    throw new Error('HISTORICAL_LAYER_POLICY');
  for (const layer of style.layers) {
    if (
      !allowed.has(layer.id) ||
      layer.type === 'symbol' ||
      (layer.id === 'ocean'
        ? layer.type !== 'background'
        : !('source' in layer) ||
          layer.source !==
            (layer.id === 'physical-land'
              ? 'land'
              : layer.id === 'physical-lakes'
                ? style.sources.lakes
                  ? 'lakes'
                  : 'land'
                : layer.id === 'physical-rivers'
                  ? style.sources.rivers
                    ? 'rivers'
                    : 'land'
                  : 'historical'))
    )
      throw new Error('HISTORICAL_LAYER_POLICY');
  }
}
