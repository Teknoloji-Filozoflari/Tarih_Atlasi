import { useState } from 'react';
import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { CultureLegend } from './CultureLegend';
import { atlasStyles as s } from './styles';
import type { AreaOption } from './SelectionOptions';
export function CulturalRecords({
  options,
  onChoose,
}: {
  options: readonly AreaOption[];
  onChoose: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  return (
    <View style={s.stack}>
      <CultureLegend count={options.length} />
      {!options.length && (
        <>
          <AppText>{t('culture.empty')}</AppText>
          <AppText>{t('culture.pilotBlocked')}</AppText>
        </>
      )}
      <AppText>
        {t('selection.total')} {options.length}
      </AppText>
      {options.slice(offset, offset + 8).map((option) => (
        <Action key={option.id} label={`≈ ${option.label}`} onPress={() => onChoose(option.id)} />
      ))}
      {options.length > 8 && (
        <View style={s.row}>
          <Action
            label={t('selection.previous')}
            disabled={offset === 0}
            onPress={() => setOffset((value) => Math.max(0, value - 8))}
          />
          <Action
            label={t('selection.next')}
            disabled={offset + 8 >= options.length}
            onPress={() => setOffset((value) => value + 8)}
          />
        </View>
      )}
    </View>
  );
}
