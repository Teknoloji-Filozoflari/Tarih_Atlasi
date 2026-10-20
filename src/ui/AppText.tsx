import { Platform, StyleSheet, Text } from 'react-native';
import type { TextProps } from 'react-native';

import { theme } from '@/theme/tokens';

type Variant = keyof typeof theme.typography;
interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
}

export function AppText({ variant = 'body', muted = false, style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, theme.typography[variant], muted && styles.muted, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
    fontFamily: Platform.select({ android: 'sans-serif', web: 'system-ui', default: 'System' }),
  },
  muted: { color: theme.colors.muted },
});
