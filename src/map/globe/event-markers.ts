import type * as MapLibre from 'maplibre-gl';
import type { RenderFeatureCollection } from '../../data/pilot.ts';
import type { HistoricalEventType } from '../../domain/types.ts';
import { eventSymbol } from '../../events/model.ts';
import { t } from '../../i18n/index.ts';
import { personMarkers } from './person-markers.ts';
/** Same bounded marker lifecycle; region anchors are labels, never event point geometry. */
export function eventMarkers(
  library: typeof MapLibre,
  map: MapLibre.Map,
  container: HTMLDivElement,
  onSelect: (ids: string[], anchorId: string) => void,
) {
  return personMarkers(library, map, container, onSelect, {
    kind: 'event',
    className: 'atlas-event-marker',
    selectLabel: t('events.select'),
    clusterLabel: t('events.cluster'),
    clusterNotice: t('events.clusterNotice'),
    symbol: (feature: RenderFeatureCollection['features'][number]) =>
      eventSymbol(feature.properties.classification as HistoricalEventType),
  });
}
