import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { theme } from '../theme/tokens';
import { t } from '../i18n';
export function TimelineDock({ children }: PropsWithChildren) {
  return (
    <View
      testID="timeline-dock"
      accessibilityLabel={t('atlas.year.title')}
      style={{
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      {children}
    </View>
  );
}
