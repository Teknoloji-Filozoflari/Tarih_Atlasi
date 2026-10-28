import { View, StyleSheet } from 'react-native';
import { timelineRuler } from '../timeline/ruler';
import { AppText } from '../ui/AppText';
import { theme } from '../theme/tokens';
import { yearLabel } from './yearLabel';
export function TimelineRuler({
  minYear,
  maxYear,
  compact,
}: {
  minYear: number;
  maxYear: number;
  compact: boolean;
}) {
  const ticks = timelineRuler(minYear, maxYear, compact);
  return (
    <View style={styles.root} pointerEvents="none" accessible={false} testID="timeline-ruler">
      {ticks.map(({ year, fraction }, i) => (
        <View key={year} style={[styles.tick, { left: `${fraction * 100}%` }]}>
          <View style={styles.line} />
          <AppText
            variant="label"
            muted
            style={[
              styles.label,
              i === 0 ? styles.first : i === ticks.length - 1 ? styles.last : styles.middle,
            ]}
          >
            {yearLabel(year)}
          </AppText>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { height: 28, marginHorizontal: 12, position: 'relative' },
  tick: { position: 'absolute', top: 0 },
  line: { height: 6, width: 1, backgroundColor: theme.colors.muted },
  label: {
    width: 90,
    position: 'absolute',
    top: 7,
    fontVariant: ['tabular-nums'],
    color: theme.colors.muted,
  },
  first: { left: 0, textAlign: 'left' },
  last: { right: 0, textAlign: 'right' },
  middle: { left: -45, textAlign: 'center' },
});
