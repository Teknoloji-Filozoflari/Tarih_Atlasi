import { View, StyleSheet } from 'react-native';
import { t } from '../i18n';
import type { PlaybackSpeed } from '../timeline/store';
import { theme } from '../theme/tokens';
import { Action } from './Action';
export function PlaybackControls({
  playing,
  speed,
  onToggle,
  onSpeed,
  hideToggle = false,
}: {
  hideToggle?: boolean;
  playing: boolean;
  speed: PlaybackSpeed;
  onToggle: () => void;
  onSpeed: (speed: PlaybackSpeed) => void;
}) {
  return (
    <View style={styles.row} testID="playback-controls">
      {!hideToggle && (
        <Action
          label={t(playing ? 'playback.pause' : 'playback.play')}
          symbol={playing ? 'Ⅱ' : '▶'}
          onPress={onToggle}
        />
      )}
      {([1, 10, 100] as const).map((value) => (
        <Action
          key={value}
          label={t(
            value === 1
              ? 'playback.speed1'
              : value === 10
                ? 'playback.speed10'
                : 'playback.speed100',
          )}
          selected={speed === value}
          onPress={() => onSpeed(value)}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.xs },
});
