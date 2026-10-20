import { theme } from '../../theme/tokens.ts';

/** Size only the painted glyph. Keep the separate accessible touch target intact. */
export function applyMarkerScale(button: HTMLButtonElement, zoom: number, clustered = false) {
  const token = theme.mapMarker;
  const progress = Number.isFinite(zoom)
    ? Math.max(0, Math.min(1, (zoom - token.farZoom) / (token.nearZoom - token.farZoom)))
    : 0;
  const from = clustered ? token.clusterFarSize : token.farSize;
  const to = clustered ? token.clusterNearSize : token.nearSize;
  const diameter = Math.round(from + (to - from) * progress);
  button.style.setProperty('--atlas-marker-size', `${diameter}px`);
  button.style.setProperty('--atlas-marker-icon-size', `${Math.round(diameter * 0.65)}px`);
  button.style.setProperty(
    '--atlas-marker-caption-display',
    zoom >= token.captionMinZoom ? 'block' : 'none',
  );
  button.style.fontSize = `${clustered ? Math.round(10 + 2 * progress) : Math.max(6, Math.round(diameter * 0.55))}px`;
}
