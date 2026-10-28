import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { activePeriodId, periodWindows } from './periodWindows';

export function PeriodChips({
  year,
  maxYear,
  onSelectYear,
  reducedMotion,
}: {
  year: number;
  maxYear: number;
  onSelectYear: (year: number) => void;
  reducedMotion: boolean;
}) {
  const active = activePeriodId(year, maxYear);
  const windows = periodWindows(maxYear);
  return (
    <View style={styles.root} testID="period-chips">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel={t('period.chips')}
      >
        {windows.map((period) => {
          const selected = period.id === active;
          return (
            <Pressable
              key={period.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t(period.labelKey)} ${t(period.rangeKey)}`}
              onPress={() => onSelectYear(period.targetYear)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
                !reducedMotion && selected && styles.chipSelectedMotion,
              ]}
            >
              <AppText
                variant="small"
                numberOfLines={1}
                style={[styles.label, selected && styles.labelSelected]}
              >
                {t(period.labelKey)}
              </AppText>
              <AppText variant="label" muted numberOfLines={1} style={styles.range}>
                {t(period.rangeKey)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      <AppText variant="label" muted style={styles.note}>
        {t('period.chips.note')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  chip: {
    minHeight: theme.layout.minTouchTarget,
    minWidth: 120,
    maxWidth: 180,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    justifyContent: 'center',
    gap: 2,
  },
  chipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(228, 194, 139, 0.12)',
  },
  chipSelectedMotion: {
    // Intentional presence without neon glow; opacity shift only when motion allowed.
    opacity: 1,
  },
  pressed: { backgroundColor: theme.colors.hover },
  label: { color: theme.colors.muted },
  labelSelected: { color: theme.colors.accent },
  range: { fontVariant: ['tabular-nums'], fontWeight: '400' },
  note: { paddingBottom: theme.spacing.xs },
});
