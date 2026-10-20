import { ScrollView, View, type ViewProps } from 'react-native';
/** Large text may exceed one viewport; keep the timeline and source tools reachable. */
export function ScreenSurface({ largeText, ...props }: ViewProps & { largeText: boolean }) {
  return largeText ? (
    <ScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    />
  ) : (
    <View {...props} />
  );
}
