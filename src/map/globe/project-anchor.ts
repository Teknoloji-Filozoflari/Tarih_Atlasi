import type { Map } from 'maplibre-gl';
/** Screen-only world-copy adjustment. Never mutates source historical coordinates. */
export function projectAnchor(
  map: Pick<Map, 'getCenter' | 'getProjection' | 'project'>,
  lng: number,
  lat: number,
) {
  const longitude =
    map.getProjection()?.type === 'mercator'
      ? lng + 360 * Math.round((map.getCenter().lng - lng) / 360)
      : lng;
  return map.project([longitude, lat]);
}
