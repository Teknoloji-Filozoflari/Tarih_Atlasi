import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { pilotSearch } from '../data/application';
import { createSearchController } from '../discovery/query';
import type { SearchEntry, SearchGroup } from '../discovery/search';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
import { yearLabel } from './yearLabel';
import { PendingPeople } from './PendingPeople';
export const searchSymbol: Record<SearchGroup, string> = {
  state: '▱',
  culture: '≈',
  person: '●',
  war: '⚔',
  event: '✦',
  place: '⌖',
};
export function SearchPeriod({ entry }: { entry: SearchEntry }) {
  return (
    <AppText variant="small">
      {entry.temporal.start.kind === 'known'
        ? yearLabel(entry.temporal.start.date.year)
        : t('pilot.unknown')}{' '}
      –{' '}
      {entry.temporal.end.kind === 'known'
        ? yearLabel(entry.temporal.end.date.year)
        : t('pilot.unknown')}
      {entry.temporal.uncertain ? ` · ${t('search.approximate')}` : ''}
    </AppText>
  );
}
type Result = ReturnType<NonNullable<typeof pilotSearch>['search']>;
export function SearchResults({
  query,
  onQuery,
  onChoose,
}: {
  query: string;
  onQuery: (q: string) => void;
  onChoose: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<{ loading: boolean; value: Result | null; failed: boolean }>(
    { loading: true, value: null, failed: false },
  );
  useEffect(() => {
    const controller = createSearchController<Result>((q, o, signal) => {
      if (!pilotSearch) throw new Error('CATALOG_MISSING');
      return pilotSearch.search(q, o, signal);
    }, setResult);
    controller.run(query, offset);
    return controller.cancel;
  }, [query, offset]);
  return (
    <View style={s.stack} testID="search-records">
      <TextInput
        autoFocus
        accessibilityLabel={t('search.edit')}
        style={s.input}
        value={query}
        maxLength={120}
        placeholder={t('atlas.search.placeholder')}
        placeholderTextColor={theme.colors.muted}
        onChangeText={(q) => {
          setOffset(0);
          onQuery(q);
        }}
        returnKeyType="search"
      />
      <AppText>{t('search.notice')}</AppText>
      {result.loading ? (
        <AppText accessibilityLiveRegion="polite">{t('state.loading.title')}</AppText>
      ) : result.failed ? (
        <AppText accessibilityRole="alert">{t('search.failed')}</AppText>
      ) : (
        <>
          <AppText accessibilityLiveRegion="polite">
            {t('search.results')} {result.value?.total ?? 0}
          </AppText>
          {!result.value?.total && <AppText>{t('search.empty')}</AppText>}
          {(['state', 'culture', 'person', 'war', 'event', 'place'] as const).map((group) => {
            const entries = result.value?.records.filter((e) => e.group === group) ?? [];
            return entries.length ? (
              <View key={group} style={s.stack}>
                <AppText accessibilityRole="header">
                  {searchSymbol[group]} {t(`search.group.${group}`)}
                </AppText>
                {entries.map((entry) => (
                  <View key={entry.id} style={s.stack}>
                    <Action
                      label={entry.name}
                      symbol={searchSymbol[group]}
                      onPress={() => onChoose(entry.id)}
                    />
                    <SearchPeriod entry={entry} />
                    <AppText variant="small" muted>
                      {entry.originalName !== entry.name ? `${entry.originalName} · ` : ''}
                      {entry.bounds.length ? t('search.geographySeparate') : t('search.noGeometry')}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : null;
          })}
          <View style={s.row}>
            <Action
              label={t('selection.previous')}
              disabled={!offset}
              onPress={() => setOffset(Math.max(0, offset - 8))}
            />
            <Action
              label={t('selection.next')}
              disabled={result.value?.nextOffset == null}
              onPress={() => setOffset(result.value!.nextOffset!)}
            />
          </View>
        </>
      )}
      {!!query.trim() && <PendingPeople key={query} query={query} />}
    </View>
  );
}
