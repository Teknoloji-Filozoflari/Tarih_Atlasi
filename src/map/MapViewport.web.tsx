import type { MapViewportProps } from '@/map-contract/viewport';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { GlobeView } from './globe/GlobeView';
import { useGlobeHost } from './useGlobeHost';
import { ViewportFrame } from './ViewportFrame';

export function MapViewport(props: MapViewportProps) {
  return props.active === false ? <AppText>{t('globe.paused')}</AppText> : <WebGlobe {...props} />;
}
function WebGlobe(props: MapViewportProps) {
  const host = useGlobeHost(props);
  return (
    <ViewportFrame host={host} {...props}>
      <GlobeView sessionId={host.sessionId} command={host.command} onEvent={host.onEvent} />
    </ViewportFrame>
  );
}
