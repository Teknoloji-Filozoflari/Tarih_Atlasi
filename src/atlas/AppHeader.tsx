import { TextInput, View } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function AppHeader({
  query,
  onQuery,
  onSearch,
  onLayers,
  onDiscover,
  onBookmarks,
  onShare,
  compact,
}: {
  query: string;
  onQuery: (q: string) => void;
  onSearch: () => void;
  onLayers: () => void;
  onDiscover: () => void;
  onBookmarks: () => void;
  onShare: () => void;
  compact: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.sm,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
      testID="app-header"
    >
      <AppText
        accessibilityRole="header"
        variant="heading"
        style={compact ? { flex: 1, minWidth: 0 } : undefined}
      >
        {t('app.name')}
      </AppText>
      {!compact && (
        <TextInput
          style={[s.input, { flex: 1, minWidth: 140 }]}
          accessibilityLabel={t('atlas.search')}
          placeholder={t('atlas.search.placeholder')}
          placeholderTextColor={theme.colors.muted}
          value={query}
          maxLength={120}
          onChangeText={onQuery}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
      )}
      <Action label={t('atlas.search.submit')} symbol="⌕" iconOnly onPress={onSearch} />
      <Action label={t('atlas.layers')} symbol="▱" iconOnly onPress={onLayers} />
      {!compact && (
        <>
          <Action label={t('bookmarks.title')} symbol="☆" iconOnly onPress={onBookmarks} />
          <Action label={t('share.title')} symbol="↗" iconOnly onPress={onShare} />
        </>
      )}
      <Action label={t('map.discover')} symbol="⋯" iconOnly={compact} onPress={onDiscover} />
    </View>
  );
}
