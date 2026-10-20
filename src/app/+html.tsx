import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

import { theme } from '@/theme/tokens';

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <ScrollViewStyleReset />
      </head>
      <body style={{ backgroundColor: theme.colors.background }}>{children}</body>
    </html>
  );
}
