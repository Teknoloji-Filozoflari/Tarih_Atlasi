import type { MapViewportProps } from '../map-contract/viewport';
import { MapViewport } from '../map/MapViewport';
export function GlobeViewport(props: MapViewportProps) {
  return <MapViewport {...props} />;
}
