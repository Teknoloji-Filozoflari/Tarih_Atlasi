import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { YearInput } from './YearInput';
import { atlasStyles as s } from './styles';
export function YearPicker({
  year,
  maxYear,
  onApply,
  onInteract = () => {},
}: {
  year: number;
  maxYear: number;
  onApply: (year: number) => void;
  onInteract?: () => void;
}) {
  return (
    <View style={s.stack}>
      <AppText>{t('atlas.year.help')}</AppText>
      <YearInput year={year} maxYear={maxYear} onApply={onApply} onInteract={onInteract} />
      <AppText variant="small" muted>
        {t('atlas.year.preview')}
      </AppText>
    </View>
  );
}
