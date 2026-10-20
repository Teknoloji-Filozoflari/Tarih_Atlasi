import { defaultFilters, type HistoricalFilters } from '../preferences/model';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { pilotSearch, pilotTimeline } from '../data/application';
import { focusHit, type SearchDestination } from '../discovery/search';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { PersonCard } from './PersonCard';
import { EventCard } from './EventCard';
import { PolityCard } from './PolityCard';
import { CultureCard } from './CultureCard';
import { SourceActions } from './SourceActions';
import { SearchPeriod, searchSymbol } from './SearchResults';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
export function SearchTargetPanel({
  id,
  year,
  maxYear,
  canFocus,
  includeApproximate,
  filters = defaultFilters,
  onFocus,
  onYear,
  onBack,
  detailsOpen = false,
  onBirthYear,
}: {
  id: string;
  year: number;
  maxYear: number;
  canFocus: boolean;
  includeApproximate: boolean;
  filters?: HistoricalFilters;
  onFocus: (id: string, approximate: boolean) => void;
  onYear: (year: number, approximate: boolean) => void;
  onBack: () => void;
  detailsOpen?: boolean;
  onBirthYear?: (year: number) => void;
}) {
  const [value, setValue] = useState<{ key: string; data: SearchDestination | null } | null>(null);
  const [permitted, setPermitted] = useState<{ key: string; ids: readonly string[] } | null>(null);
  const filterKey = JSON.stringify(filters);
  const permittedKey = `${id}/${year}/${filterKey}`;
  const [page, setPage] = useState(0);
  const key = `${id}/${year}/${maxYear}`;
  useEffect(() => {
    const controller = new AbortController();
    void (pilotSearch?.destination(id, year, maxYear, controller.signal) ?? Promise.resolve(null))
      .then((data) => {
        if (!controller.signal.aborted) setValue({ key, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setValue({ key, data: null });
      });
    return () => controller.abort();
  }, [id, year, maxYear, key]);
  useEffect(() => {
    let active = true;
    const hits = value?.key === key ? (value.data?.current.hits ?? []) : [];
    void Promise.all(
      hits.map(async (hit) =>
        (await pilotTimeline?.matchesFilters(
          hit.record,
          year,
          JSON.parse(filterKey) as HistoricalFilters,
        ))
          ? hit.record.id
          : null,
      ),
    )
      .then((ids) => {
        if (active)
          setPermitted({ key: permittedKey, ids: ids.filter((v): v is string => v !== null) });
      })
      .catch(() => {
        if (active) setPermitted({ key: permittedKey, ids: [] });
      });
    return () => {
      active = false;
    };
  }, [id, year, key, value, filterKey, permittedKey]);
  const allowed = permitted?.key === permittedKey ? permitted.ids : [];
  if (value?.key !== key) return <AppText>{t('state.loading.title')}</AppText>;
  if (!value.data) return <AppText accessibilityRole="alert">{t('search.missing')}</AppText>;
  const { current, related } = value.data,
    entry = current.entry;
  const detailId = current.hits[0]?.record.id ?? entry.geographicIds[0];
  return (
    <View style={s.stack} testID="search-target">
      <AppText muted>{t('layers.searchNotice')}</AppText>
      <Action label={t('search.back')} onPress={onBack} />
      <AppText accessibilityRole="header" variant="heading">
        {searchSymbol[entry.group]} {entry.name}
      </AppText>
      <SearchPeriod entry={entry} />
      <AppText>{t(`search.group.${entry.group}`)}</AppText>
      {entry.aliases.length > 1 && (
        <AppText>
          {t('search.aliases')} {entry.aliases.join(' · ')}
        </AppText>
      )}
      <AppText>
        {t('search.currentYear')} {yearLabel(year)}
      </AppText>
      <AppText>{current.hits.length ? t('search.supported') : t('search.noYearGeography')}</AppText>
      <Action label={t('search.stay')} onPress={() => onYear(year, false)} />
      {related && related.year !== year && (
        <>
          <AppText>{t('search.jumpNotice')}</AppText>
          {related.hits.some((h) => focusHit(h)?.approximate) && (
            <AppText>{t('search.approximateChoice')}</AppText>
          )}
          <Action
            label={`${t('search.goYear')} (${yearLabel(related.year)})`}
            onPress={() =>
              onYear(
                related.year,
                related.hits.some((h) => focusHit(h)?.approximate === true),
              )
            }
          />
        </>
      )}
      {current.hits.slice(page * 8, page * 8 + 8).map((hit) => {
        const target = focusHit(hit);
        return target ? (
          <Action
            key={hit.record.id}
            label={`${t(target.approximate ? 'search.focusApproximate' : 'search.focus')} — ${hit.record.names[0]?.value ?? hit.record.id}`}
            disabled={!canFocus || !allowed.includes(hit.record.id)}
            symbol="⌖"
            onPress={() => onFocus(target.recordId, target.approximate)}
          />
        ) : null;
      })}
      {current.hits.length > 8 && (
        <View style={s.row}>
          <Action
            label={t('selection.previous')}
            disabled={!page}
            onPress={() => setPage(page - 1)}
          />
          <Action
            label={t('selection.next')}
            disabled={(page + 1) * 8 >= current.hits.length}
            onPress={() => setPage(page + 1)}
          />
        </View>
      )}
      {entry.group === 'person' ? (
        <PersonCard
          detailsOpen={detailsOpen}
          recordId={entry.id}
          visibleLocationIds={allowed}
          year={year}
          requestedYear={year}
          includeApproximate={includeApproximate}
          onBirthYear={(target) => (onBirthYear ? onBirthYear(target) : onYear(target, true))}
          canFocus={canFocus && allowed.length > 0}
          onFocus={(recordId) => {
            if (allowed.includes(recordId)) onFocus(recordId, false);
          }}
        />
      ) : entry.group === 'event' || entry.group === 'war' ? (
        <EventCard
          detailsOpen={detailsOpen}
          id={entry.id}
          year={year}
          requestedYear={year}
          battle
          event
          canFocus={canFocus && allowed.length > 0}
          onFocus={() => {
            if (detailId) onFocus(detailId, false);
          }}
        />
      ) : entry.group === 'state' && detailId ? (
        <PolityCard
          recordId={detailId}
          requestedYear={year}
          sourceYear={year}
          preview={false}
          canFocus={canFocus && !!detailId && allowed.includes(detailId)}
          onFocus={() => onFocus(detailId, false)}
          candidateIds={[]}
          candidateLabels={{}}
          onChoose={() => {}}
        />
      ) : entry.group === 'culture' && detailId ? (
        <CultureCard recordId={detailId} requestedYear={year} sourceYear={year} preview={false} />
      ) : (
        <SourceActions recordIds={[entry.id]} wikidataId={entry.wikidataId} />
      )}
    </View>
  );
}
