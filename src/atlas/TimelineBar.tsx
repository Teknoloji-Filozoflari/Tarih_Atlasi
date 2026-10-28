import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { MIN_YEAR } from './presentation';
import {
  sliderWindow,
  yearFraction,
  snapshotMarkers,
  type TimelineScale,
} from '../timeline/interaction';
import type { PlaybackSpeed } from '../timeline/store';
import { YearSlider } from './YearSlider';
import { TimelineRuler } from './TimelineRuler';
import { PlaybackControls } from './PlaybackControls';
import { EntitySheet } from './EntitySheet';
import { yearLabel } from './yearLabel';
import { activePeriodId, periodHighlight } from './periodWindows';
export { yearLabel };
export function TimelineBar({
  year,
  maxYear,
  onSelect,
  onJump,
  onPicker,
  onInteract,
  onRelease,
  playing,
  speed,
  onPlay,
  onSpeed,
  snapshots,
  compact,
  reducedMotion,
  dense = false,
  statusLabel,
}: {
  year: number;
  maxYear: number;
  onSelect: (year: number, debounced?: boolean) => void;
  onJump: (delta: number) => void;
  onPicker: () => void;
  onInteract: () => void;
  onRelease: () => void;
  playing: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onSpeed: (speed: PlaybackSpeed) => void;
  snapshots: readonly number[];
  compact: boolean;
  reducedMotion: boolean;
  dense?: boolean;
  statusLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scale, setScale] = useState<TimelineScale>('all');
  const [anchor, setAnchor] = useState(year);
  const [focused, setFocused] = useState<string | null>(null);
  const window = sliderWindow(Math.min(anchor, maxYear), maxYear, scale);
  const outside = year < window.minYear || year > window.maxYear;
  if (outside) setAnchor(year);
  const bounds = outside ? sliderWindow(year, maxYear, scale) : window;
  const ticks = snapshotMarkers(snapshots, bounds.minYear, bounds.maxYear, compact ? 24 : 64);
  const highlight = periodHighlight(
    activePeriodId(year, maxYear),
    maxYear,
    bounds.minYear,
    bounds.maxYear,
  );
  const changeScale = (next: TimelineScale) => {
    onInteract();
    setAnchor(year);
    setScale(next);
  };
  return (
    <View style={[styles.root, (!compact || dense) && styles.horizontal]} testID="timeline-bar">
      <View style={styles.row}>
        <Action
          label={t(playing ? 'playback.pause' : 'playback.play')}
          symbol={playing ? 'Ⅱ' : '▶'}
          iconOnly
          onPress={onPlay}
        />
        <Action
          label={t('atlas.year.previous')}
          symbol="‹"
          iconOnly
          disabled={year === MIN_YEAR}
          onPress={() => onJump(-1)}
        />
        <Pressable
          onPress={onPicker}
          accessibilityRole="button"
          accessibilityLabel={yearLabel(year)}
          onFocus={() => setFocused('year')}
          onBlur={() => setFocused(null)}
          style={({ pressed }) => [
            styles.year,
            pressed && styles.pressed,
            focused === 'year' && styles.focused,
          ]}
        >
          <AppText variant="heading" style={styles.yearText}>
            {yearLabel(year)}
          </AppText>
          {!!statusLabel && (
            <AppText
              variant="label"
              muted
              numberOfLines={1}
              testID="historical-coverage"
              accessibilityLiveRegion="polite"
            >
              {statusLabel}
            </AppText>
          )}
        </Pressable>
        <Action
          label={t('atlas.year.next')}
          symbol="›"
          iconOnly
          disabled={year === maxYear}
          onPress={() => onJump(1)}
        />
        <Action
          label={t('playback.more')}
          symbol="⋯"
          iconOnly
          selected={expanded}
          onPress={() => {
            onInteract();
            setExpanded(true);
          }}
        />
      </View>
      <View style={styles.rail}>
        <YearSlider
          year={year}
          minYear={bounds.minYear}
          maxYear={bounds.maxYear}
          onStart={onInteract}
          onChange={(value) => onSelect(value, true)}
          onEnd={onRelease}
          highlight={highlight}
        />
        <TimelineRuler minYear={bounds.minYear} maxYear={bounds.maxYear} compact={compact} />
      </View>
      {expanded && (
        <EntitySheet
          title={t('playback.tools')}
          wide={!compact}
          presentation="tools"
          onClose={() => setExpanded(false)}
        >
          <View style={styles.options} testID="timeline-tools">
            <View style={styles.currentYear}>
              <View>
                <AppText variant="label" muted>
                  {t('playback.selectedYear')}
                </AppText>
                <AppText variant="heading" style={styles.yearText}>
                  {yearLabel(year)}
                </AppText>
              </View>
              <Action
                label={t('playback.chooseYear')}
                onPress={() => {
                  setExpanded(false);
                  onPicker();
                }}
              />
            </View>
            <View style={styles.group}>
              <AppText variant="label" accessibilityRole="header">
                {t('playback.jumpHeading')}
              </AppText>
              <View style={styles.jumpGrid}>
                {(
                  [
                    ['playback.back10', -10],
                    ['playback.forward10', 10],
                    ['playback.back100', -100],
                    ['playback.forward100', 100],
                  ] as const
                ).map(([label, delta]) => (
                  <View key={label} style={styles.jumpCell}>
                    <Action
                      label={t(label)}
                      disabled={delta < 0 ? year === MIN_YEAR : year === maxYear}
                      onPress={() => onJump(delta)}
                    />
                  </View>
                ))}
                <View style={styles.jumpCell}>
                  <Action
                    label={t('playback.start')}
                    disabled={year === MIN_YEAR}
                    onPress={() => onSelect(MIN_YEAR)}
                  />
                </View>
                <View style={styles.jumpCell}>
                  <Action
                    label={t('playback.end')}
                    disabled={year === maxYear}
                    onPress={() => onSelect(maxYear)}
                  />
                </View>
              </View>
            </View>
            <View style={styles.group}>
              <AppText variant="label" accessibilityRole="header">
                {t('playback.scaleHeading')}
              </AppText>
              <View style={styles.scales} testID="timeline-scales">
                {(['all', 200, 20] as const).map((value) => (
                  <Action
                    key={value}
                    label={t(
                      value === 'all'
                        ? 'playback.scale.all'
                        : value === 200
                          ? 'playback.scale.200'
                          : 'playback.scale.20',
                    )}
                    selected={scale === value}
                    onPress={() => changeScale(value)}
                  />
                ))}
              </View>
              <View>
                <View
                  style={styles.marks}
                  accessible
                  accessibilityLabel={
                    ticks.length
                      ? `${t('playback.snapshots')} ${ticks.map(yearLabel).join(', ')}`
                      : t('playback.noSnapshots')
                  }
                >
                  <View style={styles.unsupported} />
                  {ticks.map((value) => (
                    <View
                      key={value}
                      testID={`snapshot-tick-${value}`}
                      style={[
                        styles.tick,
                        { left: `${yearFraction(value, bounds.minYear, bounds.maxYear) * 100}%` },
                      ]}
                    />
                  ))}
                </View>
                <TimelineRuler
                  minYear={bounds.minYear}
                  maxYear={bounds.maxYear}
                  compact={compact}
                />
              </View>
            </View>
            <View style={styles.group}>
              <AppText variant="label" accessibilityRole="header">
                {t('playback.speedHeading')}
              </AppText>
              <PlaybackControls
                hideToggle
                playing={playing}
                speed={speed}
                onToggle={onPlay}
                onSpeed={onSpeed}
              />
            </View>
            <AppText variant="small" muted>
              {t('playback.coverageLegend')}
              {reducedMotion ? ` ${t('playback.reduced')}` : ''}
            </AppText>
          </View>
        </EntitySheet>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  year: {
    minHeight: theme.layout.minTouchTarget,
    minWidth: 96,
    flexShrink: 1,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: theme.radius.sm,
  },
  yearText: { color: theme.colors.accent, fontVariant: ['tabular-nums'] },
  focused: { borderColor: theme.colors.focus },
  pressed: { backgroundColor: theme.colors.hover },
  rail: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 140,
    minHeight: theme.layout.minTouchTarget,
    gap: theme.spacing.xs,
  },
  options: { gap: theme.spacing.md },
  currentYear: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  group: {
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  jumpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  jumpCell: { flexBasis: '45%', flexGrow: 1 },
  scales: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  marks: { height: 10, position: 'relative', marginHorizontal: 12 },
  unsupported: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.muted,
  },
  tick: { position: 'absolute', height: 10, width: 2, backgroundColor: theme.colors.accent },
});
