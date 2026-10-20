import { PrivacyPolicy } from '../atlas/PrivacyPolicy';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { theme } from '@/theme/tokens';
import { AppText } from '@/ui/AppText';
import { Screen } from '@/ui/Screen';

const sections = ['evidence', 'layers', 'privacy'] as const;

export default function AboutScreen() {
  return (
    <Screen>
      <AppText>{t('about.intro')}</AppText>
      {sections.map((section) => (
        <View key={section} style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {t(`about.${section}.title`)}
          </AppText>
          <AppText muted>{t(`about.${section}.description`)}</AppText>
        </View>
      ))}
      <PrivacyPolicy />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.sm },
});
