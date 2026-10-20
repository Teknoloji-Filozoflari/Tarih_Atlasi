import { useState } from 'react';
import { View } from 'react-native';
import type { ModernCity } from '../places/modern';
import { openExternal } from '../sources/external';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { ArticleAction } from './ArticleAction';
import { RecordDetails } from './RecordDetails';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function ModernCityCard({
  city,
  onFocus,
  onBrowse,
}: {
  city: ModernCity;
  onFocus?: () => void;
  onBrowse?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={s.stack} testID="modern-city-card">
      <AppText variant="heading" accessibilityRole="header">
        ⌖ {city.name}
      </AppText>
      <AppText>{t('cities.reference')}</AppText>
      <AppText variant="small" muted>
        {t('cities.precision')}
      </AppText>
      {!!city.featureCode && (
        <AppText>
          {t(
            city.featureCode.startsWith('ADM')
              ? 'cities.division'
              : city.featureCode === 'PPLX'
                ? 'cities.section'
                : 'cities.settlement',
          )}{' '}
          · {city.featureCode}
        </AppText>
      )}
      {!!city.countryName && (
        <AppText>
          {t('cities.country')} {city.countryName} ({city.countryCode})
        </AppText>
      )}
      {!!city.admin1 && (
        <AppText>
          {t('cities.admin1')} {city.admin1}
        </AppText>
      )}
      {!!city.admin2 && (
        <AppText>
          {t('cities.admin2')} {city.admin2}
        </AppText>
      )}
      {!!city.featureCode && (
        <AppText variant="small" muted>
          {t('cities.adminWarning')}
        </AppText>
      )}
      {city.wikidataId ? (
        <ArticleAction key={city.id} wikidataId={city.wikidataId} />
      ) : (
        <>
          <AppText variant="small" muted>
            {t('cities.noWikipedia')}
          </AppText>
          <Action
            label={t('cities.openGeoNames')}
            symbol="↗"
            onPress={() => {
              void openExternal(city.sourceUrl, 'source').catch(() => setFailed(true));
            }}
          />
        </>
      )}
      {onFocus && <Action label={t('cities.focus')} symbol="⌖" onPress={onFocus} />}
      {onBrowse && <Action label={t('cities.browse')} onPress={onBrowse} />}
      <RecordDetails>
        <AppText>
          {t(city.featureCode ? 'cities.snapshot' : 'sources.retrieved')}{' '}
          {city.reviewedAt.slice(0, 10)}
        </AppText>
        {!!city.modifiedAt && (
          <AppText>
            {t('cities.modified')} {city.modifiedAt}
          </AppText>
        )}
        {city.adminCodes && (
          <AppText>
            {t('cities.adminCodes')} {city.adminCodes.map((code) => code || '—').join(' / ')}
          </AppText>
        )}
        <AppText>{city.locator}</AppText>
        <AppText>
          {t('cities.coordinates')} {city.coordinate[1].toFixed(4)}, {city.coordinate[0].toFixed(4)}
        </AppText>
        <AppText>
          {t(city.licenseId === 'CC-BY-4.0' ? 'cities.geonamesAttribution' : 'cities.attribution')}{' '}
          · {city.licenseId} · {city.revision}
        </AppText>
        <Action
          label={t('sources.direct')}
          symbol="↗"
          onPress={() => {
            void openExternal(city.sourceUrl, 'source').catch(() => setFailed(true));
          }}
        />
      </RecordDetails>
      {failed && <AppText accessibilityRole="alert">{t('pilot.linkError')}</AppText>}
    </View>
  );
}
