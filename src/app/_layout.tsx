import { Suspense } from 'react';
import { Stack } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { theme } from '@/theme/tokens';
import { AppState } from '@/ui/AppState';
import { Screen } from '@/ui/Screen';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <Screen>
        <AppState state="error" onRetry={retry} />
      </Screen>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Suspense fallback={<AppState state="loading" />}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerBackTitle: t('navigation.back'),
            contentStyle: { backgroundColor: theme.colors.background },
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen name="index" options={{ title: t('app.name'), headerShown: false }} />
          <Stack.Screen name="about" options={{ title: t('about.title') }} />
          <Stack.Screen name="+not-found" options={{ title: t('state.notFound.title') }} />
        </Stack>
      </Suspense>
    </SafeAreaProvider>
  );
}
