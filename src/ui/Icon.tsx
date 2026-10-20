import { Text } from 'react-native';

import { theme } from '@/theme/tokens';

const glyphs = { atlas: '◎', info: 'i', error: '!', back: '←', forward: '→' } as const;
export type IconName = keyof typeof glyphs;

// Küçük sistem glifleri; harici ikon fontu veya yeniden dağıtılan görsel yok.
// Anlamlı etiket, ikonu içeren kontrolün metniyle sağlanır.
export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <Text
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ color: theme.colors.accent, fontSize: size, lineHeight: size * 1.3 }}
    >
      {glyphs[name]}
    </Text>
  );
}
