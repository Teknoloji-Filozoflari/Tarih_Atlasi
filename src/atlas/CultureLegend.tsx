import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { atlasStyles as s } from './styles';
export function CultureLegend({ count = 0 }: { count?: number }) {
  return (
    <View style={s.stack} testID="culture-legend">
      <AppText variant="heading" accessibilityRole="header">
        {t('culture.legendTitle')}
      </AppText>
      <AppText>{t('culture.legendPolity')}</AppText>
      <AppText>{t('culture.legendCulture')}</AppText>
      <AppText>{t('culture.distinction')}</AppText>
      {count > 32 && <AppText accessibilityLiveRegion="polite">{t('culture.density')}</AppText>}
      <AppText variant="small" muted>
        {t('culture.basemap')}
      </AppText>
    </View>
  );
}
