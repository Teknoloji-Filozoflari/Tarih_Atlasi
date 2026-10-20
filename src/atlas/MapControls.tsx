import { View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { Action } from './Action';
export function MapControls({
  ready,
  onReset,
  onInfo,
  onAttribution,
  onZoom,
}: {
  ready: boolean;
  onReset: () => void;
  onInfo: () => void;
  onAttribution: () => void;
  onZoom: (delta: number) => void;
}) {
  return (
    <View
      style={{ gap: theme.spacing.xs, width: 100, flexDirection: 'row', flexWrap: 'wrap' }}
      accessibilityRole="toolbar"
    >
      {ready && (
        <>
          <Action
            label={t('map.zoomIn')}
            symbol="+"
            iconOnly
            disabled={!ready}
            onPress={() => onZoom(1)}
          />
          <Action
            label={t('map.zoomOut')}
            symbol="−"
            iconOnly
            disabled={!ready}
            onPress={() => onZoom(-1)}
          />
          <Action
            label={t('globe.reset')}
            symbol="↺"
            iconOnly
            disabled={!ready}
            onPress={onReset}
          />
        </>
      )}
      <Action label={t('atlas.info')} symbol="ⓘ" iconOnly onPress={onInfo} />
      <Action label={t('globe.licenses')} symbol="©" iconOnly onPress={onAttribution} />
    </View>
  );
}
