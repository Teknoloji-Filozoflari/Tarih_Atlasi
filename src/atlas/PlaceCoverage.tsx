import { View } from 'react-native';
import { placesManifest as m } from '../places/generated/catalog';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
export function PlaceCoverage() {
  return (
    <View>
      <AppText variant="small" muted>
        {t(m.version ? 'cities.installed' : 'cities.notInstalled')}
      </AppText>
      {!!m.version && (
        <>
          <AppText variant="small">
            {t('cities.coverage')} {m.countries.length} · {t('cities.settlements')}:{' '}
            {m.counts.settlements} · {t('cities.divisions')}: {m.counts.administrative} ·{' '}
            {t('cities.sections')}: {m.counts.sections}
          </AppText>
          <AppText variant="small" muted>
            {t('cities.snapshot')} {m.downloadedAt?.slice(0, 10)}
          </AppText>
        </>
      )}
    </View>
  );
}
