import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { parseYearInput } from '../timeline/interaction';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
export function YearInput({
  year,
  maxYear,
  onApply,
  onInteract,
}: {
  year: number;
  maxYear: number;
  onApply: (year: number) => void;
  onInteract: () => void;
}) {
  const [text, setText] = useState(yearLabel(year));
  const [error, setError] = useState(false);
  const [era, setEra] = useState<'MÖ' | 'MS'>(year < 0 ? 'MÖ' : 'MS');
  const apply = () => {
    onInteract();
    const value = parseYearInput(/^[0-9]+$/u.test(text.trim()) ? `${era} ${text}` : text, maxYear);
    setError(value === null);
    if (value !== null) onApply(value);
  };
  return (
    <View style={s.stack}>
      <AppText>{t('playback.input.help')}</AppText>
      <View style={s.row}>
        <Action
          label={t('atlas.bce')}
          selected={era === 'MÖ'}
          onPress={() => {
            onInteract();
            setEra('MÖ');
            setText(`${t('atlas.bce')} ${text.replace(/^(MÖ|MS)\s*|\s*(MÖ|MS)$/giu, '').trim()}`);
          }}
        />
        <Action
          label={t('atlas.ce')}
          selected={era === 'MS'}
          onPress={() => {
            onInteract();
            setEra('MS');
            setText(`${t('atlas.ce')} ${text.replace(/^(MÖ|MS)\s*|\s*(MÖ|MS)$/giu, '').trim()}`);
          }}
        />
      </View>
      <TextInput
        accessibilityLabel={t('atlas.year.input')}
        value={text}
        style={s.input}
        onFocus={onInteract}
        onChangeText={(value) => {
          onInteract();
          setText(value);
          const parsed = parseYearInput(value, maxYear);
          if (parsed !== null) setEra(parsed < 0 ? 'MÖ' : 'MS');
          setError(false);
        }}
        maxLength={16}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder={t('playback.input.placeholder')}
        placeholderTextColor={theme.colors.muted}
        onSubmitEditing={apply}
        returnKeyType="go"
      />
      {error && (
        <AppText accessibilityRole="alert" style={{ color: theme.colors.danger }}>
          {t('atlas.year.invalid')}
        </AppText>
      )}
      <Action label={t('atlas.year.apply')} onPress={apply} />
    </View>
  );
}
