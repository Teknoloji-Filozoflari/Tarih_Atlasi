import { View } from 'react-native';
import { t } from '../i18n';
import type { MapProjection } from '../map-contract/protocol';
import { theme } from '../theme/tokens';
import { Action } from './Action';
export function MapModeSwitch({
  projection,
  onChange,
  disabled = false,
}: {
  projection: MapProjection;
  onChange: (mode: MapProjection) => void;
  disabled?: boolean;
}) {
  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel={t('map.view')}
      style={{ flexDirection: 'row', gap: theme.spacing.xs }}
    >
      <Action
        label={t('map.atlas')}
        selected={projection === 'mercator'}
        disabled={disabled}
        onPress={() => onChange('mercator')}
      />
      <Action
        label={t('map.globe')}
        selected={projection === 'globe'}
        disabled={disabled}
        onPress={() => onChange('globe')}
      />
    </View>
  );
}
