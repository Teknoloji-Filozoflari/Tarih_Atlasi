import { View } from 'react-native';
import { t } from '../i18n';
import { privacyPolicy } from '../privacy/policy';
import { AppText } from '../ui/AppText';
import { atlasStyles as s } from './styles';
export function PrivacyPolicy() {
  return (
    <View style={s.stack} testID="privacy-policy">
      <AppText variant="heading" accessibilityRole="header">
        {t('privacy.title')}
      </AppText>
      <AppText muted>
        {t('privacy.updated')} {privacyPolicy.version}
      </AppText>
      {privacyPolicy.sections.map((key) => (
        <AppText key={key}>{t(key)}</AppText>
      ))}
    </View>
  );
}
