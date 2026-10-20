import { projectAnchor } from './project-anchor.ts';
import { count } from '../../performance/metrics.ts';
import type * as MapLibre from 'maplibre-gl';
import type { RenderFeatureCollection } from '../../data/pilot.ts';
import { clusterPersonPoints, facingGlobe } from '../../persons/clustering.ts';
import { theme } from '../../theme/tokens.ts';
import { t } from '../../i18n/index.ts';
import { applyMarkerScale } from './marker-scale.ts';

export function personMarkers(
  library: typeof MapLibre,
  map: MapLibre.Map,
  container: HTMLDivElement,
  onSelect: (ids: string[], anchorId: string) => void,
  presentation?: {
    kind: string;
    kinds?: readonly string[];
    className: string;
    selectLabel: string;
    clusterLabel: string;
    clusterNotice: string;
    symbol: (feature: RenderFeatureCollection['features'][number]) => string;
  },
) {
  let features: RenderFeatureCollection['features'] = [],
    selected: string | null = null,
    dragged = false;
  let lastSignature = '';
  const accepts = (f: RenderFeatureCollection['features'][number]) =>
    (presentation?.kinds ?? [presentation?.kind ?? 'person-location']).includes(f.properties.kind);
  const entries: {
    marker: MapLibre.Marker;
    button: HTMLButtonElement;
    click: (e: MouseEvent) => void;
    clustered: boolean;
  }[] = [];
  const down = () => {
    dragged = false;
  };
  const drag = () => {
    dragged = true;
  };
  map.on('dragstart', drag);
  const scale = () => {
    for (const entry of entries) applyMarkerScale(entry.button, map.getZoom(), entry.clustered);
  };
  map.on('zoom', scale);
  const clear = () => {
    for (const { marker, button, click } of entries) {
      button.removeEventListener('click', click);
      button.removeEventListener('pointerdown', down);
      marker.remove();
    }
    entries.length = 0;
  };
  return {
    set(value: RenderFeatureCollection['features'], id: string | null) {
      features = value;
      selected = id;
    },
    refresh() {
      if (typeof map.project !== 'function') return;
      const center = map.getCenter();
      const key = JSON.stringify([
        selected,
        map.getProjection()?.type,
        container.clientWidth,
        container.clientHeight,
        center.lng,
        center.lat,
        map.getZoom(),
        map.getBearing(),
        map.getPitch(),
        features.filter(accepts).map((f) => [f.id, f.properties]),
      ]);
      if (key === lastSignature) return;
      lastSignature = key;
      clear();
      count('markers.rebuild');
      const candidates = features.filter(
        (f) =>
          accepts(f) &&
          f.properties.anchorLng !== null &&
          f.properties.anchorLat !== null &&
          (map.getProjection()?.type !== 'globe' ||
            facingGlobe(f.properties.anchorLng!, f.properties.anchorLat!, center.lng, center.lat)),
      );
      const clusters = clusterPersonPoints(
        candidates.map((f) => {
          const p = projectAnchor(map, f.properties.anchorLng!, f.properties.anchorLat!);
          return { id: f.id, x: p.x, y: p.y };
        }),
        container.clientWidth,
        container.clientHeight,
        map.getZoom(),
      );
      for (const cluster of clusters) {
        const feature = candidates.find((f) => f.id === cluster.anchor.id)!,
          p = feature.properties;
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add(presentation?.className ?? 'atlas-person-marker');
        button.classList.add(p.kind === 'event' ? 'atlas-event-marker' : 'atlas-person-marker');
        button.dataset.clusterCount = String(cluster.ids.length);
        const symbol =
          presentation?.symbol(feature) ?? (p.lineStyle === 'person-approximate' ? '≈' : '●');
        button.textContent = cluster.ids.length > 1 ? String(cluster.ids.length) : symbol;
        button.setAttribute(
          'aria-label',
          cluster.ids.length > 1
            ? `${presentation?.clusterLabel ?? t('person.cluster')} ${cluster.ids.length}. ${presentation?.clusterNotice ?? t('person.clusterNotice')}`
            : presentation
              ? `${presentation.selectLabel} ${p.label}${p.kind === 'person-location' ? `. ${t(p.lineStyle === 'person-approximate' ? 'person.approximate' : 'person.exact')}` : ''}`
              : `${t('person.select')} ${p.label}. ${t(p.lineStyle === 'person-approximate' ? 'person.approximate' : 'person.exact')}`,
        );
        button.title =
          cluster.ids.length > 1
            ? (presentation?.clusterNotice ?? t('person.clusterNotice'))
            : p.label;
        const clustered = cluster.ids.length > 1,
          color = clustered ? theme.colors.culture : p.color;
        button.style.cssText = `width:${theme.layout.minTouchTarget}px;height:${theme.layout.minTouchTarget}px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;isolation:isolate;color:${color};font:600 12px system-ui;cursor:pointer;touch-action:manipulation;outline-offset:3px;--atlas-marker-background:${clustered ? theme.colors.surfaceRaised : theme.colors.surface};--atlas-marker-color:${color};--atlas-marker-border:${!clustered && p.lineStyle === 'person-approximate' ? 'dashed' : 'solid'};--atlas-marker-radius:50%;--atlas-marker-focus:${theme.colors.focus}`;
        applyMarkerScale(button, map.getZoom(), clustered);
        button.setAttribute('aria-pressed', String(cluster.ids.includes(selected ?? '')));
        if (
          !clustered &&
          p.kind === 'person-location' &&
          typeof document.createElementNS === 'function'
        ) {
          button.textContent = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('width', '26');
          svg.setAttribute('height', '26');
          svg.setAttribute('aria-hidden', 'true');
          svg.style.pointerEvents = 'none';
          svg.style.width = 'var(--atlas-marker-icon-size)';
          svg.style.height = 'var(--atlas-marker-icon-size)';
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21v-2a8 6 0 0 1 16 0v2Z');
          path.setAttribute('fill', 'currentColor');
          svg.appendChild(path);
          button.appendChild(svg);
        }
        if (!clustered) {
          const caption = document.createElement('span');
          caption.classList.add('atlas-marker-caption');
          caption.textContent = p.label;
          caption.setAttribute('aria-hidden', 'true');
          caption.style.cssText = `display:var(--atlas-marker-caption-display);position:absolute;top:calc(50% + var(--atlas-marker-size) / 2 + 3px);left:50%;transform:translateX(-50%);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;padding:2px 5px;border-radius:4px;background:${theme.colors.surface};color:${theme.colors.text};font:12px system-ui`;
          button.appendChild(caption);
        }
        const click = (e: MouseEvent) => {
          e.stopPropagation();
          if (
            (e.detail === 0 || !dragged) &&
            !button.classList.contains('maplibregl-marker-covered')
          )
            onSelect(cluster.ids, cluster.anchor.id);
        };
        button.addEventListener('pointerdown', down);
        button.addEventListener('click', click);
        const marker = new library.Marker({ element: button, opacityWhenCovered: 0 });
        entries.push({ marker, button, click, clustered });
        marker.setLngLat([p.anchorLng!, p.anchorLat!]).addTo(map);
      }
    },
    dispose() {
      clear();
      map.off('dragstart', drag);
      map.off('zoom', scale);
    },
  };
}
