import { Pressable, StyleSheet, View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { layers, type LayerId, type LayerVisibility } from './presentation';
import { readLayerCatalogCounts } from './catalogCounts';

const counts = readLayerCatalogCounts();

export function FloatingLayersPanel({
  visibility,
  onToggle,
  onOpenFull,
  compact,
}: {
  visibility: LayerVisibility;
  onToggle: (id: LayerId) => void;
  onOpenFull: () => void;
  compact: boolean;
}) {
  const active = layers.reduce((n, layer) => n + (visibility[layer.id] ? 1 : 0), 0);
  return (
    <View
      style={[styles.root, compact && styles.compact]}
      testID="floating-layers-panel"
      accessibilityRole="toolbar"
      accessibilityLabel={t('atlas.layers')}
    >
      <View style={styles.header}>
        <AppText variant="label" style={styles.title}>
          {t('atlas.layers')}
        </AppText>
        <View style={styles.badge} accessible={false}>
          <AppText variant="label" style={styles.badgeText}>
            {active}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('layers.panel.openFull')}
          onPress={onOpenFull}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <AppText variant="label" muted>
            {t('layers.panel.more')}
          </AppText>
        </Pressable>
      </View>
      <View style={styles.grid} testID="floating-layer-toggles">
        {layers.map((layer) => {
          const on = visibility[layer.id];
          return (
            <Pressable
              key={layer.id}
              accessibilityRole="button"
              accessibilityLabel={t(layer.label)}
              accessibilityState={{ selected: on }}
              onPress={() => onToggle(layer.id)}
              style={({ pressed }) => [
                styles.cell,
                on && { borderColor: layer.color },
                pressed && styles.pressed,
              ]}
            >
              <AppText accessible={false} style={{ color: on ? layer.color : theme.colors.muted }}>
                {layer.symbol}
              </AppText>
              {!compact && (
                <AppText
                  variant="label"
                  numberOfLines={1}
                  style={{ color: on ? theme.colors.text : theme.colors.muted }}
                >
                  {t(layer.label)}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.counts} testID="floating-layer-counts">
        {layers.map((layer) => {
          const value = counts[layer.id];
          if (value === null || value === undefined) return null;
          return (
            <AppText key={layer.id} variant="label" muted style={styles.countLine}>
              {t(layer.label)} {value}
            </AppText>
          );
        })}
        <AppText variant="label" muted style={styles.footnote}>
          {t('layers.panel.countsNote')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: theme.spacing.sm,
    top: theme.spacing.sm,
    width: 168,
    maxWidth: '42%',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(18, 29, 40, 0.88)',
    zIndex: 2,
  },
  compact: { width: 112 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    color: theme.colors.text,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  badgeText: { color: theme.colors.accent, fontVariant: ['tabular-nums'] },
  more: {
    marginLeft: 'auto',
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  grid: { gap: theme.spacing.xs },
  cell: {
    minHeight: theme.layout.minTouchTarget,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pressed: { backgroundColor: theme.colors.hover },
  counts: {
    gap: 2,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  countLine: { fontVariant: ['tabular-nums'] },
  footnote: { marginTop: theme.spacing.xs, fontWeight: '400' },
});
