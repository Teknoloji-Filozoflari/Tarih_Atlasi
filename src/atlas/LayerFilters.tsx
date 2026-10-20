import { View } from 'react-native';
import { t, type MessageKey } from '../i18n';
import {
  confidenceChoices,
  politicalChoices,
  relationshipChoices,
  eventChoices,
  type HistoricalFilters,
} from '../preferences/model';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function LayerFilters({
  value,
  disabled,
  onChange,
}: {
  value: HistoricalFilters;
  disabled: boolean;
  onChange: (value: HistoricalFilters) => void;
}) {
  const groups = [
    ['confidence', 'layers.confidence', confidenceChoices],
    ['politicalType', 'layers.politicalType', politicalChoices],
    ['personRelationship', 'layers.relationship', relationshipChoices],
    ['eventType', 'layers.eventType', eventChoices],
  ] as const;
  return (
    <View style={s.stack} testID="layer-filters">
      <AppText variant="heading" accessibilityRole="header">
        {t('layers.filters')}
      </AppText>
      <AppText muted>{t('layers.filterHelp')}</AppText>
      <Action
        label={t('layers.exactOnly')}
        selected={value.exactOnly}
        disabled={disabled}
        onPress={() => onChange({ ...value, exactOnly: !value.exactOnly })}
      />
      {groups.map(([field, title, options]) => (
        <View key={field} style={s.stack}>
          <AppText accessibilityRole="header">{t(title)}</AppText>
          <View style={s.row}>
            {options.map((option) => {
              const key = `layers.option.${option}` as MessageKey;
              return (
                <Action
                  key={option}
                  label={`${t(title)}: ${t(key)}`}
                  selected={value[field] === option}
                  disabled={disabled}
                  onPress={() => onChange({ ...value, [field]: option })}
                />
              );
            })}
          </View>
        </View>
      ))}
      <AppText muted>{t('layers.confidenceNotice')}</AppText>
    </View>
  );
}
