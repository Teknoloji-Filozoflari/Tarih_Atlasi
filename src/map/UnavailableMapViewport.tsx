import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import type { MapViewportProps } from '@/map-contract/viewport';
import { theme } from '@/theme/tokens';
import { AppText } from '@/ui/AppText';
import { Icon } from '@/ui/Icon';

export function UnavailableMapViewport({ testID = 'map-viewport' }: MapViewportProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Icon name="atlas" size={48} />
      <AppText variant="heading" accessibilityRole="header" style={styles.center}>
        {t('map.unavailable.title')}
      </AppText>
      <AppText muted style={styles.description}>
        {t('map.unavailable.description')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
  },
  center: { textAlign: 'center' },
  description: { maxWidth: 420, textAlign: 'center' },
});
