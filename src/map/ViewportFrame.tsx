import type { PropsWithChildren } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { Action } from '../atlas/Action';
import { AppText } from '../ui/AppText';
import type { useGlobeHost } from './useGlobeHost';
import { developerMode } from '../config/build';
export function ViewportFrame({
  children,
  host,
  testID = 'map-viewport',
  showModernCities = true,
}: PropsWithChildren<{
  host: ReturnType<typeof useGlobeHost>;
  testID?: string;
  showModernCities?: boolean;
}>) {
  const { height } = useWindowDimensions();
  return (
    <View testID={testID} style={[styles.frame, height < 500 && { minHeight: 120 }]}>
      <View style={[styles.viewport, height < 500 && { minHeight: 120 }]}>{children}</View>
      {developerMode && host.camera && (
        <View
          pointerEvents="none"
          aria-hidden
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <AppText testID="globe-camera">{`${host.camera.center.lng.toFixed(2)}, ${host.camera.center.lat.toFixed(2)} · z ${host.camera.zoom.toFixed(2)}`}</AppText>
        </View>
      )}
      {showModernCities && host.camera && host.camera.zoom >= 4 && (
        <View
          testID="modern-cities-badge"
          style={{
            position: 'absolute',
            left: theme.spacing.sm,
            // Keep clear of the floating layers rail (top-left).
            bottom: theme.spacing.sm,
            maxWidth: 260,
            backgroundColor: 'rgba(18, 29, 40, 0.88)',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
            zIndex: 1,
          }}
        >
          <AppText variant="label">{t('cities.badge')}</AppText>
          <AppText variant="small" accessibilityLiveRegion="polite">
            {t(`cities.status.${host.placesStatus}`)}
          </AppText>
          {(host.placesStatus === 'error' || host.cityError) && (
            <>
              {host.cityError && (
                <AppText variant="small" accessibilityRole="alert">
                  {t('cities.error')}
                </AppText>
              )}
              <Action label={t('state.error.retry')} onPress={host.retryData} />
            </>
          )}
        </View>
      )}
      {host.dataError && (
        <View>
          <AppText accessibilityRole="alert">{t('performance.dataError')}</AppText>
          <Action label={t('performance.retry')} onPress={host.retryData} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  frame: { flex: 1, width: '100%', minHeight: 160 },
  viewport: {
    flex: 1,
    minHeight: 160,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
});
