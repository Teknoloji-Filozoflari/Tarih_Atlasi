import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { MapViewportProps } from '@/map-contract/viewport';
import { developmentOrigin, isAllowedNavigation } from '../map-contract/navigation';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { ErrorState } from '../atlas/ErrorState';
import { theme } from '../theme/tokens';
import GlobeDOM from './GlobeDOM';
import { useGlobeHost } from './useGlobeHost';
import { ViewportFrame } from './ViewportFrame';

export function MapViewport(props: MapViewportProps) {
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active'),
    );
    return () => subscription.remove();
  }, []);
  return props.active === false || !foreground ? (
    <AppText>{t('globe.paused')}</AppText>
  ) : (
    <NativeGlobe {...props} />
  );
}
function NativeGlobe(props: MapViewportProps) {
  const [terminated, setTerminated] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (terminated)
    return (
      <ErrorState
        onRetry={() => {
          setAttempt((value) => value + 1);
          setTerminated(false);
        }}
      />
    );
  return <NativeSession key={attempt} {...props} terminated={() => setTerminated(true)} />;
}
function NativeSession({ terminated, ...props }: MapViewportProps & { terminated: () => void }) {
  const host = useGlobeHost(props);
  const devOrigin = developmentOrigin(Constants.expoConfig?.hostUri, __DEV__);
  return (
    <ViewportFrame host={host} {...props}>
      <GlobeDOM
        sessionId={host.sessionId}
        command={host.command}
        onEvent={host.onEvent}
        dom={{
          useExpoDOMWebView: false,
          style: { flex: 1, backgroundColor: theme.colors.background },
          containerStyle: { flex: 1 },
          // '*' burada dış URL'lerin Linking ile otomatik açılmasını önler.
          // Her navigasyonu aşağıdaki dar allowlist kararı reddeder/kabul eder.
          originWhitelist: ['*'],
          onShouldStartLoadWithRequest: (request) => isAllowedNavigation(request.url, devOrigin),
          setSupportMultipleWindows: false,
          onOpenWindow: () => {},
          javaScriptCanOpenWindowsAutomatically: false,
          mixedContentMode: 'never',
          allowFileAccess: true,
          allowFileAccessFromFileURLs: false,
          allowUniversalAccessFromFileURLs: false,
          domStorageEnabled: false,
          sharedCookiesEnabled: false,
          thirdPartyCookiesEnabled: false,
          androidLayerType: 'hardware',
          scrollEnabled: false,
          webviewDebuggingEnabled: __DEV__,
          onError: terminated,
          onRenderProcessGone: terminated,
          onContentProcessDidTerminate: terminated,
        }}
      />
    </ViewportFrame>
  );
}
