import { Link } from 'expo-router';

import { t } from '@/i18n';
import { theme } from '@/theme/tokens';
import { AppText } from '@/ui/AppText';
import { Screen } from '@/ui/Screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <AppText variant="heading" accessibilityRole="header">
        {t('state.notFound.title')}
      </AppText>
      <AppText muted>{t('state.notFound.description')}</AppText>
      <Link href="/" style={{ color: theme.colors.accent, paddingVertical: 16 }}>
        {t('navigation.home')}
      </Link>
    </Screen>
  );
}
