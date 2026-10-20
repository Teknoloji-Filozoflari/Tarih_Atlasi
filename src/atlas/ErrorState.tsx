import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={s.panel}>
      <AppText accessibilityRole="alert">{t('globe.processLost')}</AppText>
      <Action label={t('state.error.retry')} onPress={onRetry} />
    </View>
  );
}
