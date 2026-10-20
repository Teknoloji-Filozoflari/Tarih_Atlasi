import { ActivityIndicator, View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { useReducedMotion } from './useReducedMotion';
import { atlasStyles as s } from './styles';
export function LoadingState() {
  const reduced = useReducedMotion();
  return (
    <View accessibilityLiveRegion="polite" style={s.panel}>
      {!reduced && <ActivityIndicator color={theme.colors.accent} />}
      <AppText>{t('globe.loading')}</AppText>
    </View>
  );
}
