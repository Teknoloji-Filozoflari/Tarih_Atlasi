import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { sliderPositionYear, yearFraction, jumpYear } from '../timeline/interaction';
import { displayYearToAstronomical } from '../timeline/year';
import { yearLabel } from './yearLabel';
import type { YearSliderProps } from './YearSliderProps';
export function YearSlider(props: YearSliderProps) {
  const [width, setWidth] = useState(1);
  const measuredWidth = useRef(1);
  const left = useRef(0);
  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(event) => {
        left.current = event.nativeEvent.pageX - event.nativeEvent.locationX;
        props.onStart();
        props.onChange(
          sliderPositionYear(
            event.nativeEvent.locationX,
            measuredWidth.current,
            props.minYear,
            props.maxYear,
          ),
        );
      }}
      onResponderMove={(event) =>
        props.onChange(
          sliderPositionYear(
            event.nativeEvent.pageX - left.current,
            measuredWidth.current,
            props.minYear,
            props.maxYear,
          ),
        )
      }
      onResponderRelease={props.onEnd}
      onResponderTerminate={props.onEnd}
      onResponderTerminationRequest={() => false}
      testID="native-year-slider"
      style={styles.root}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={t('playback.slider')}
      accessibilityValue={{
        min: displayYearToAstronomical(props.minYear),
        max: displayYearToAstronomical(props.maxYear),
        now: displayYearToAstronomical(props.year),
        text: yearLabel(props.year),
      }}
      accessibilityActions={[
        { name: 'increment', label: t('atlas.year.next') },
        { name: 'decrement', label: t('atlas.year.previous') },
      ]}
      onAccessibilityAction={(event) => {
        const direction =
          event.nativeEvent.actionName === 'increment'
            ? 1
            : event.nativeEvent.actionName === 'decrement'
              ? -1
              : 0;
        if (!direction) return;
        props.onStart();
        props.onChange(Math.max(props.minYear, jumpYear(props.year, direction, props.maxYear)));
        props.onEnd();
      }}
      onLayout={(event) => {
        const next = Math.max(1, event.nativeEvent.layout.width);
        measuredWidth.current = next;
        setWidth(next);
      }}
    >
      <View pointerEvents="none" style={styles.track} />
      <View
        pointerEvents="none"
        style={[
          styles.progress,
          {
            width: Math.max(
              0,
              yearFraction(props.year, props.minYear, props.maxYear) * (width - 24),
            ),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            left: Math.max(
              0,
              Math.min(
                width - 24,
                yearFraction(props.year, props.minYear, props.maxYear) * (width - 24),
              ),
            ),
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { minHeight: theme.layout.minTouchTarget, justifyContent: 'center', width: '100%' },
  track: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  progress: {
    position: 'absolute',
    left: 12,
    height: 6,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
});
