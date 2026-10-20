import type * as MapLibre from 'maplibre-gl';
import { modernCities, MODERN_CITY_MIN_ZOOM } from '../../places/modern.ts';
import { facingGlobe } from '../../persons/clustering.ts';
import { choosePoliticalLabels } from '../../politics/selection.ts';
import { theme } from '../../theme/tokens.ts';
import { t } from '../../i18n/index.ts';
import { projectAnchor } from './project-anchor.ts';
import type { ModernCity } from '../../places/modern.ts';
import type { PlacesProvider } from '../../places/repository.ts';
export type PlaceLayerState = 'loading' | 'ready' | 'partial' | 'error' | 'not-installed';
/** Separate modern reference; bounded local chunks, never live GeoNames/map-motion API calls. */
export function modernCityMarkers(
  library: typeof MapLibre,
  map: MapLibre.Map,
  container: HTMLDivElement,
  onSelect: (id: string, packIndex?: number, catalogVersion?: string) => void,
  provider?: PlacesProvider,
  onStatus?: (state: PlaceLayerState, loaded: number) => void,
) {
  let enabled = false,
    signature = '',
    dragged = false,
    disposed = false,
    paused = false;
  let pending = new AbortController();
  const entries: {
    marker: MapLibre.Marker;
    button: HTMLButtonElement;
    click: (e: MouseEvent) => void;
  }[] = [];
  const down = () => {
      dragged = false;
    },
    drag = () => {
      dragged = true;
    };
  map.on('dragstart', drag);
  const clear = () => {
    for (const e of entries) {
      e.button.removeEventListener('click', e.click);
      e.button.removeEventListener('pointerdown', down);
      e.marker.remove();
    }
    entries.length = 0;
  };
  const render = (
    data: readonly ModernCity[],
    center: { lng: number; lat: number },
    zoom: number,
  ) => {
    clear();
    const byId = new Map(data.map((c) => [c.id, c]));
    const candidates = data
      .filter((c) => facingGlobe(c.coordinate[0], c.coordinate[1], center.lng, center.lat))
      .map((c) => {
        const p = projectAnchor(map, ...c.coordinate);
        return {
          id: c.id,
          text: c.name,
          x: p.x,
          y: p.y,
          priority: c.labelPriority ?? 1,
          small: false,
          selected: false,
          compact: true,
        };
      });
    const chosen = choosePoliticalLabels(
      candidates,
      container.clientWidth,
      container.clientHeight,
      zoom,
    );
    for (const candidate of chosen) {
      const city = byId.get(candidate.id)!;
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('atlas-modern-city');
      button.textContent = `${city.featureCode?.startsWith('ADM') ? '◇' : '·'} ${city.name}`;
      button.setAttribute('aria-label', `${t('cities.select')} ${city.name}`);
      button.title = t('cities.reference');
      button.style.cssText = `min-width:${theme.layout.minTouchTarget}px;min-height:${theme.layout.minTouchTarget}px;border:0;background:transparent;color:${theme.politicalMap.label};font:${theme.modernCityLabel.fontSize}px system-ui;text-shadow:0 1px 2px ${theme.politicalMap.labelShadow},0 -1px 2px ${theme.politicalMap.labelShadow};cursor:pointer;touch-action:manipulation`;
      const click = (e: MouseEvent) => {
        e.stopPropagation();
        if (
          enabled &&
          !disposed &&
          !paused &&
          (e.detail === 0 || !dragged) &&
          !button.classList.contains('maplibregl-marker-covered')
        )
          onSelect(
            city.id,
            city.packIndex,
            city.packIndex !== undefined ? (provider?.manifest.version ?? undefined) : undefined,
          );
      };
      button.addEventListener('pointerdown', down);
      button.addEventListener('click', click);
      const marker = new library.Marker({ element: button, opacityWhenCovered: 0 })
        .setLngLat([...city.coordinate])
        .addTo(map);
      entries.push({ marker, button, click });
    }
    return candidates.length > chosen.length;
  };
  return {
    set(show: boolean) {
      enabled = show;
    },
    retry() {
      signature = '';
      pending.abort();
    },
    pause() {
      paused = true;
      signature = '';
      pending.abort();
    },
    resume() {
      paused = false;
      signature = '';
    },
    refresh() {
      if (disposed || paused || typeof map.project !== 'function') return;
      const center = map.getCenter(),
        zoom = map.getZoom();
      const next = JSON.stringify([
        enabled,
        center.lng,
        center.lat,
        zoom,
        map.getBearing(),
        map.getPitch(),
        container.clientWidth,
        container.clientHeight,
      ]);
      if (next === signature) return;
      signature = next;
      pending.abort();
      pending = new AbortController();
      const signal = pending.signal;
      clear();
      if (!enabled || zoom < MODERN_CITY_MIN_ZOOM) return;
      if (!provider?.manifest.version) {
        render(modernCities, center, zoom);
        onStatus?.('not-installed', modernCities.length);
        return;
      }
      const bounds = typeof map.getBounds === 'function' ? map.getBounds() : null;
      const span = 360 / 2 ** Math.max(0, zoom - 1);
      onStatus?.('loading', 0);
      void provider
        .query(
          {
            west: bounds?.getWest() ?? center.lng - span,
            east: bounds?.getEast() ?? center.lng + span,
            south: Math.max(-90, bounds?.getSouth() ?? center.lat - span),
            north: Math.min(90, bounds?.getNorth() ?? center.lat + span),
            // Catalog LOD ends at 8; street-scale camera zoom must still query cities.
            zoom: Math.min(8, zoom),
          },
          signal,
        )
        .then(
          (result) => {
            if (disposed || signal.aborted || !enabled) return;
            const collisions = render(result.cities, center, zoom);
            onStatus?.(
              result.failedPacks > 0 ? 'error' : result.limited || collisions ? 'partial' : 'ready',
              result.cities.length,
            );
          },
          () => {
            if (!disposed && !signal.aborted) onStatus?.('error', 0);
          },
        );
    },
    dispose() {
      disposed = true;
      pending.abort();
      clear();
      map.off('dragstart', drag);
    },
  };
}
