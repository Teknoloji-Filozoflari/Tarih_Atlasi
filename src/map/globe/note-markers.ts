import type * as MapLibre from 'maplibre-gl';
import type { NoteMarker } from '../../annotations/model.ts';
import { theme } from '../../theme/tokens.ts';
import { t } from '../../i18n/index.ts';
import { applyMarkerScale } from './marker-scale.ts';
export function noteMarkers(
  library: typeof MapLibre,
  map: MapLibre.Map,
  select: (id: string) => void,
) {
  let signature = '',
    dragged = false;
  let cleanups: (() => void)[] = [];
  const buttons: HTMLButtonElement[] = [];
  const drag = () => {
    dragged = true;
  };
  map.on('dragstart', drag);
  const scale = () => buttons.forEach((button) => applyMarkerScale(button, map.getZoom()));
  map.on('zoom', scale);
  const clear = () => {
    cleanups.forEach((f) => f());
    cleanups = [];
    buttons.length = 0;
  };
  return {
    set(items: readonly NoteMarker[]) {
      const key = JSON.stringify(items);
      if (key === signature) return;
      signature = key;
      clear();
      for (const item of items) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = item.kind === 'person' ? '●' : item.kind === 'war' ? '⚔' : '◆';
        button.className = 'atlas-local-note';
        button.setAttribute('aria-label', `${t('notes.unverified')} · ${t(`notes.${item.kind}`)}`);
        button.style.cssText = `width:${theme.layout.minTouchTarget}px;height:${theme.layout.minTouchTarget}px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;isolation:isolate;color:${theme.colors.text};cursor:pointer;font:600 12px system-ui;--atlas-marker-background:${theme.colors.surface};--atlas-marker-color:${theme.colors.accent};--atlas-marker-border:dashed;--atlas-marker-radius:25%`;
        applyMarkerScale(button, map.getZoom());
        buttons.push(button);
        const down = () => {
          dragged = false;
        };
        const click = (e: MouseEvent) => {
          e.stopPropagation();
          if (
            (e.detail === 0 || !dragged) &&
            !button.classList.contains('maplibregl-marker-covered')
          )
            select(item.id);
        };
        button.addEventListener('pointerdown', down);
        button.addEventListener('click', click);
        const marker = new library.Marker({ element: button, opacityWhenCovered: 0 })
          .setLngLat([item.lng, item.lat])
          .addTo(map);
        cleanups.push(() => {
          button.removeEventListener('pointerdown', down);
          button.removeEventListener('click', click);
          marker.remove();
        });
      }
    },
    dispose() {
      clear();
      map.off('dragstart', drag);
      map.off('zoom', scale);
    },
  };
}
