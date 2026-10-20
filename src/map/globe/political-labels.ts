import { projectAnchor } from './project-anchor.ts';
import { count } from '../../performance/metrics.ts';
import type * as MapLibre from 'maplibre-gl';
import type { RenderFeatureCollection } from '../../data/pilot.ts';
import { choosePoliticalLabels, politicalLabelLayout } from '../../politics/selection.ts';
import { theme } from '../../theme/tokens.ts';
import { facingGlobe } from '../../persons/clustering.ts';
import { t } from '../../i18n/index.ts';
/** Bounded local DOM labels; no glyph/font/tile service. Visual anchors are not historical places. */
export function politicalLabels(
  library: typeof MapLibre,
  map: MapLibre.Map,
  container: HTMLDivElement,
  onSelect: (id: string) => void,
) {
  let features: RenderFeatureCollection['features'] = [],
    selected: string | null = null;
  let lastSignature = '';
  let enabled = true,
    sparse = false;
  let dragged = false;
  const drag = () => {
    dragged = true;
  };
  const down = () => {
    dragged = false;
  };
  map.on('dragstart', drag);
  const entries: {
    marker: MapLibre.Marker;
    button: HTMLButtonElement;
    select: (event: MouseEvent) => void;
  }[] = [];
  const clear = () => {
    for (const entry of entries) {
      entry.button.removeEventListener('click', entry.select);
      entry.button.removeEventListener('pointerdown', down);
      entry.marker.remove();
    }
    entries.length = 0;
  };
  return {
    set(
      value: RenderFeatureCollection['features'],
      id: string | null,
      show = true,
      reduced = false,
    ) {
      enabled = show;
      sparse = reduced;
      features = value;
      selected = id;
    },
    refresh() {
      if (typeof map.project !== 'function') return;
      const center = map.getCenter();
      const key = JSON.stringify([
        enabled,
        map.getProjection()?.type,
        sparse,
        selected,
        container.clientWidth,
        container.clientHeight,
        center.lng,
        center.lat,
        map.getZoom(),
        map.getBearing(),
        map.getPitch(),
        features
          .filter((f) => ['territory', 'cultural-region', 'place'].includes(f.properties.kind))
          .map((f) => [f.id, f.properties]),
      ]);
      if (key === lastSignature) return;
      lastSignature = key;
      clear();
      count('labels.rebuild');
      if (!enabled) return;
      const candidates = features
        .filter(
          (feature) =>
            ['territory', 'cultural-region', 'place'].includes(feature.properties.kind) &&
            feature.properties.anchorLng !== null &&
            feature.properties.anchorLat !== null &&
            (map.getProjection()?.type !== 'globe' ||
              facingGlobe(
                feature.properties.anchorLng!,
                feature.properties.anchorLat!,
                center.lng,
                center.lat,
              )),
        )
        .map((feature) => {
          const p = feature.properties,
            point = projectAnchor(map, p.anchorLng!, p.anchorLat!);
          return {
            id: feature.id,
            text: p.label,
            x: point.x,
            y: point.y,
            priority: p.priority,
            small: p.small,
            selected: feature.id === selected,
            compact: p.kind === 'territory',
          };
        });
      const accepted = choosePoliticalLabels(
        candidates,
        container.clientWidth,
        container.clientHeight,
        map.getZoom(),
      );
      for (const candidate of sparse ? accepted.slice(0, 8) : accepted) {
        const feature = features.find((f) => f.id === candidate.id)!,
          p = feature.properties;
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('atlas-political-label');
        button.textContent = `${p.kind === 'place' ? '⌖ ' : p.kind === 'cultural-region' ? '≈ ' : ''}${p.label}`;
        button.setAttribute(
          'aria-label',
          `${t(p.kind === 'place' ? 'layers.placeSelect' : p.kind === 'cultural-region' ? 'culture.select' : 'politics.article')} ${p.label}`,
        );
        button.title = t('politics.anchorNotice');
        if (p.kind === 'territory') {
          const layout = politicalLabelLayout(p.label, map.getZoom());
          button.classList.add('atlas-country-label');
          button.setAttribute('aria-current', String(feature.id === selected));
          button.style.cssText = `width:${layout.width}px;height:${layout.height}px;min-width:${theme.layout.minTouchTarget}px;min-height:${theme.layout.minTouchTarget}px;box-sizing:border-box;padding:0 4px;border:0;border-radius:3px;background:transparent;color:${theme.politicalMap.label};font:${feature.id === selected ? 600 : 500} ${layout.fontSize}px/1.25 system-ui;letter-spacing:0.02em;text-shadow:0 1px 1px ${theme.politicalMap.labelShadow};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;--atlas-label-focus:${theme.politicalMap.selection};--atlas-label-focus-background:${theme.politicalMap.labelFocusBackground}`;
        } else {
          button.style.cssText = `max-width:220px;min-height:${theme.layout.minTouchTarget}px;min-width:${theme.layout.minTouchTarget}px;border:1px solid ${p.color};border-radius:${theme.radius.sm}px;background:${theme.colors.surface};color:${theme.colors.text};font:12px system-ui;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer`;
        }
        const select = (event: MouseEvent) => {
          event.stopPropagation();
          if (
            (event.detail === 0 || !dragged) &&
            !button.classList.contains('maplibregl-marker-covered')
          )
            onSelect(feature.id);
        };
        button.addEventListener('pointerdown', down);
        button.addEventListener('click', select);
        const marker = new library.Marker({ element: button, opacityWhenCovered: 0 });
        entries.push({ marker, button, select });
        marker.setLngLat([p.anchorLng!, p.anchorLat!]).addTo(map);
      }
    },
    dispose() {
      clear();
      map.off('dragstart', drag);
    },
  };
}
