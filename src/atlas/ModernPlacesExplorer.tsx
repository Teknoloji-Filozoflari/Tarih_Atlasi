import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { placesRepository } from '../places/runtime';
import { placesManifest } from '../places/generated/catalog';
import type { ModernCity } from '../places/modern';
import type { PlaceBrowsePage, PlaceCursor } from '../places/repository';
import { normalizeSearch } from '../discovery/search';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { theme } from '../theme/tokens';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
import { PlaceCoverage } from './PlaceCoverage';
export function ModernPlacesExplorer({ onChoose }: { onChoose: (city: ModernCity) => void }) {
  const [country, setCountry] = useState<string | null>(null),
    [query, setQuery] = useState('');
  const [administrative, setAdministrative] = useState(false),
    [offset, setOffset] = useState(0);
  const [cursor, setCursor] = useState<PlaceCursor | null>(null);
  const [result, setResult] = useState<{
    key: string;
    page: PlaceBrowsePage | null;
    failed: boolean;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([country, administrative, cursor, retry]);
  const page = result?.key === requestKey ? result.page : null;
  const failed = result?.key === requestKey && result.failed;
  useEffect(() => {
    if (!country) return;
    const request = new AbortController();
    void placesRepository.browse(country, administrative, cursor, request.signal).then(
      (p) => {
        if (!request.signal.aborted) setResult({ key: requestKey, page: p, failed: false });
      },
      () => {
        if (!request.signal.aborted) setResult({ key: requestKey, page: null, failed: true });
      },
    );
    return () => request.abort();
  }, [country, administrative, cursor, retry, requestKey]);
  if (!placesManifest.version)
    return (
      <View style={s.stack} testID="modern-places-explorer">
        <PlaceCoverage />
      </View>
    );
  const countries = placesManifest.countries.filter((c) =>
    normalizeSearch(`${c.name} ${c.code}`).includes(normalizeSearch(query)),
  );
  return (
    <View style={s.stack} testID="modern-places-explorer">
      <PlaceCoverage />
      {!country ? (
        <>
          <TextInput
            accessibilityLabel={t('cities.findCountry')}
            value={query}
            maxLength={100}
            placeholder={t('cities.findCountry')}
            placeholderTextColor={theme.colors.muted}
            style={s.input}
            onChangeText={(v) => {
              setQuery(v);
              setOffset(0);
            }}
          />
          <AppText variant="small" muted>
            {t('cities.countryNames')}
          </AppText>
          {countries.slice(offset, offset + 20).map((c) => (
            <Action
              key={c.code}
              label={`${c.name} (${c.code}) · ${c.settlements + c.administrative + c.sections}`}
              onPress={() => {
                setCountry(c.code);
                setCursor(null);
              }}
            />
          ))}
          {!countries.length && <AppText>{t('cities.noCountry')}</AppText>}
          <View style={s.row}>
            <Action
              label={t('cities.previous')}
              disabled={offset === 0}
              onPress={() => setOffset(Math.max(0, offset - 20))}
            />
            <Action
              label={t('cities.next')}
              disabled={offset + 20 >= countries.length}
              onPress={() => setOffset(offset + 20)}
            />
          </View>
        </>
      ) : (
        <>
          <Action
            label={t('cities.chooseCountry')}
            onPress={() => {
              setCountry(null);
              setCursor(null);
            }}
          />
          <AppText variant="heading">
            {placesManifest.countries.find((c) => c.code === country)?.name}
          </AppText>
          <View style={s.row}>
            <Action
              label={t('cities.settlements')}
              selected={!administrative}
              onPress={() => {
                setAdministrative(false);
                setCursor(null);
              }}
            />
            <Action
              label={t('cities.divisions')}
              selected={administrative}
              onPress={() => {
                setAdministrative(true);
                setCursor(null);
              }}
            />
          </View>
          <AppText variant="small" muted>
            {t('cities.adminWarning')}
          </AppText>
          {!page && !failed && (
            <AppText accessibilityLiveRegion="polite">{t('cities.loading')}</AppText>
          )}
          {failed && (
            <>
              <AppText accessibilityRole="alert">{t('cities.error')}</AppText>
              <Action label={t('state.error.retry')} onPress={() => setRetry((n) => n + 1)} />
            </>
          )}
          {page?.cities.map((city) => (
            <Action
              key={city.id}
              label={`${city.featureCode?.startsWith('ADM') ? '◇' : '·'} ${city.name} · ${city.admin2 || city.admin1 || city.countryCode}`}
              onPress={() => onChoose(city)}
            />
          ))}
          {page && page.cities.length === 0 && <AppText>{t('cities.emptyPage')}</AppText>}
          {page?.next && <Action label={t('cities.next')} onPress={() => setCursor(page.next)} />}
          {cursor && <Action label={t('cities.firstPage')} onPress={() => setCursor(null)} />}
        </>
      )}
    </View>
  );
}
