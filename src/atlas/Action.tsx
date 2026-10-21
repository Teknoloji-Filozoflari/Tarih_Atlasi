import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, StyleSheet } from 'react-native';
import type { View } from 'react-native';
import { AppText } from '../ui/AppText';
import { theme } from '../theme/tokens';
export function Action({
  label,
  symbol,
  onPress,
  selected = false,
  disabled = false,
  autoFocus = false,
  iconOnly = false,
}: {
  label: string;
  symbol?: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  iconOnly?: boolean;
}) {
  const ref = useRef<View>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() => {
      ref.current?.focus();
      if (Platform.OS !== 'web') {
        const node = findNodeHandle(ref.current);
        if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);
  return (
    <Pressable
      ref={ref}
      {...(Platform.OS === 'web' ? { title: label, 'aria-pressed': selected } : {})}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        iconOnly && { width: theme.layout.minTouchTarget, paddingHorizontal: 0, flexShrink: 0 },
        hovered && !disabled && { backgroundColor: theme.colors.hover },
        selected && styles.selected,
        focused && styles.focused,
        (pressed || disabled) && styles.dim,
      ]}
    >
      {!!symbol && (
        <AppText accessible={false} style={styles.symbol}>
          {symbol}
        </AppText>
      )}
      {!iconOnly && (
        <AppText variant="small" style={{ flexShrink: 1 }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  action: {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceRaised,
    flexShrink: 1,
  },
  selected: { borderColor: theme.colors.accent },
  focused: { borderColor: theme.colors.focus },
  dim: { opacity: 0.6 },
  symbol: { color: theme.colors.accent },
});
