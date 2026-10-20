import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { atlasStyles as s } from './styles';
export function EntityCard({ demo = false }: { demo?: boolean }) {
  return (
    <View style={s.stack}>
      <AppText variant="heading" accessibilityRole="header">
        {t(demo ? 'atlas.demo.title' : 'home.scope.title')}
      </AppText>
      <AppText>{t(demo ? 'globe.demo.detail' : 'home.scope.description')}</AppText>
      <AppText muted>{t(demo ? 'atlas.demo.source' : 'pilot.missing')}</AppText>
      <AppText variant="small" muted>
        {t('about.evidence.description')}
      </AppText>
    </View>
  );
}
