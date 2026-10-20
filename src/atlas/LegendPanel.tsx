import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { theme } from '../theme/tokens';
import { atlasStyles as s } from './styles';
export function LegendPanel() {
  return (
    <View style={s.stack} testID="legend-panel">
      <AppText variant="heading" accessibilityRole="header">
        {t('layers.legend')}
      </AppText>
      {(
        [
          ['■', 'layers.legend.polityColor', theme.politicalMap.fallback],
          ['━', 'layers.legend.documented', theme.politicalMap.border],
          ['┄', 'layers.legend.approximate', theme.politicalMap.border],
          ['≈ ◇', 'layers.legend.culture', theme.colors.culture],
          ['⚔', 'layers.legend.war', theme.colors.war],
          ['▤ ✦', 'layers.legend.event', theme.colors.event],
          ['● / ≈', 'layers.legend.person', theme.colors.person],
          ['?', 'layers.legend.unknown', theme.colors.muted],
          ['⌖', 'layers.legend.place', theme.colors.muted],
          ['⌖', 'cities.reference', theme.colors.muted],
          ['②', 'discovery.clusterNotice', theme.colors.culture],
        ] as const
      ).map(([symbol, key, color]) => (
        <View style={s.row} key={key}>
          <AppText accessible={false} style={{ color }}>
            {symbol}
          </AppText>
          <AppText style={{ flex: 1 }}>{t(key)}</AppText>
        </View>
      ))}
      <AppText muted>{t('culture.basemap')}</AppText>
    </View>
  );
}
