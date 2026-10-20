import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { theme } from '@/theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

type AppStateProps = { state: 'loading' | 'empty' } | { state: 'error'; onRetry: () => void };

export function AppState(props: AppStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="polite"
      accessibilityRole={props.state === 'error' ? 'alert' : undefined}
    >
      {props.state === 'loading' ? (
        <ActivityIndicator
          color={theme.colors.accent}
          accessibilityLabel={t('state.loading.title')}
        />
      ) : (
        <Icon name={props.state === 'error' ? 'error' : 'atlas'} />
      )}
      <AppText variant="heading" accessibilityRole="header" style={styles.center}>
        {t(`state.${props.state}.title`)}
      </AppText>
      <AppText muted style={styles.center}>
        {t(`state.${props.state}.description`)}
      </AppText>
      {props.state === 'error' && <Button label={t('state.error.retry')} onPress={props.onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md, padding: theme.spacing.lg, alignItems: 'center' },
  center: { textAlign: 'center' },
});
