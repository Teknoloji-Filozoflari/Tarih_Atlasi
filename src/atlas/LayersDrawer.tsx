import { View, Switch } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { theme } from '../theme/tokens';
import { layers, type LayerId, type LayerVisibility } from './presentation';
import { atlasStyles as s } from './styles';
import { LegendPanel } from './LegendPanel';
import { LayerFilters } from './LayerFilters';
import { Action } from './Action';
import type { Preferences } from '../preferences/model';
import { PlaceCoverage } from './PlaceCoverage';
export function LayersDrawer({
  visibility,
  onToggle,
  preferences,
  disabled,
  onChange,
  onSettings,
  onAttribution,
  onPlaceBrowser,
}: {
  visibility: LayerVisibility;
  onToggle: (id: LayerId) => void;
  preferences: Preferences;
  disabled: boolean;
  onChange: (patch: Partial<Preferences>) => void;
  onSettings: () => void;
  onAttribution: () => void;
  onPlaceBrowser?: () => void;
}) {
  return (
    <View style={s.stack}>
      <AppText muted>{t('atlas.layers.help')}</AppText>
      <View style={s.stack} testID="historical-layer-controls">
        {layers.map((layer) => (
          <View
            key={layer.id}
            style={[
              s.row,
              { justifyContent: 'space-between', minHeight: theme.layout.minTouchTarget },
            ]}
          >
            <View style={[s.row, { flex: 1 }]}>
              <AppText accessible={false} style={{ color: layer.color }}>
                {layer.symbol}
              </AppText>
              <AppText style={{ flex: 1 }}>{t(layer.label)}</AppText>
            </View>
            <Switch
              accessibilityLabel={t(layer.label)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={disabled}
              value={visibility[layer.id]}
              onValueChange={() => onToggle(layer.id)}
              trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
            />
          </View>
        ))}
      </View>
      <AppText variant="small" muted>
        {t('atlas.layers.distinction')}
      </AppText>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <AppText style={{ flex: 1 }}>{t('cities.layer')}</AppText>
        <Switch
          accessibilityLabel={t('cities.layer')}
          disabled={disabled}
          value={preferences.modernCities ?? true}
          onValueChange={() => onChange({ modernCities: !(preferences.modernCities ?? true) })}
          trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
        />
      </View>
      <AppText variant="small" muted>
        {t('cities.scope')}
      </AppText>
      <PlaceCoverage />
      {onPlaceBrowser && <Action label={t('cities.browse')} onPress={onPlaceBrowser} />}
      <AppText variant="small" muted>
        {t('pilot.missing')}
      </AppText>
      <AppText muted>{t('layers.labelsHelp')}</AppText>
      <Action
        label={t('person.showApproximate')}
        selected={preferences.includeApproximatePersons}
        disabled={disabled}
        onPress={() =>
          onChange({ includeApproximatePersons: !preferences.includeApproximatePersons })
        }
      />
      <LayerFilters
        value={preferences.filters}
        disabled={disabled}
        onChange={(filters) => onChange({ filters })}
      />
      <AppText accessibilityRole="header" variant="heading">
        {t('layers.density')}
      </AppText>
      <Action
        label={t('layers.sparse')}
        selected={preferences.sparseLabels}
        disabled={disabled}
        onPress={() => onChange({ sparseLabels: !preferences.sparseLabels })}
      />
      <AppText muted>{t('layers.sparseNotice')}</AppText>
      <LegendPanel />
      <Action label={t('layers.settings')} onPress={onSettings} />
      <Action label={t('globe.licenses')} onPress={onAttribution} />
    </View>
  );
}
