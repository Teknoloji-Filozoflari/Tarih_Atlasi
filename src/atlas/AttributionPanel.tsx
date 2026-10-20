import { Link } from 'expo-router';
import type { RoadStatus } from '../map-contract/protocol';
import { View, Switch } from 'react-native';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { globeNotices } from '../map/globe/generated/notices';
import { atlasStyles as s } from './styles';
import { pilotNotices } from '../data/generated/pilot';
import { sourceNotices } from '../sources/catalog';
import { bookmarkStorageNotice } from '../discovery/notices';
export function AttributionPanel({
  roadsEnabled,
  roadsStatus,
  onRoadsChange,
}: {
  roadsEnabled: boolean;
  roadsStatus: RoadStatus;
  onRoadsChange: (value: boolean) => void;
}) {
  return (
    <View style={s.stack}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: theme.layout.minTouchTarget,
        }}
      >
        <AppText>{t('roads.toggle')}</AppText>
        <Switch
          accessibilityLabel={t('roads.toggle')}
          value={roadsEnabled}
          onValueChange={onRoadsChange}
        />
      </View>
      <AppText variant="small" accessibilityLiveRegion="polite">
        {t(`roads.${roadsStatus}`)}
      </AppText>
      <AppText variant="small">{t('roads.notice')}</AppText>
      <AppText variant="small">
        OpenFreeMap · © OpenMapTiles · {t('roads.attribution')} · ODbL
      </AppText>
      <Link
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: theme.colors.accent, minHeight: theme.layout.minTouchTarget }}
      >
        OpenStreetMap · ODbL
      </Link>
      <Link
        href="https://openmaptiles.org/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: theme.colors.accent, minHeight: theme.layout.minTouchTarget }}
      >
        © OpenMapTiles
      </Link>
      <Link
        href="https://openfreemap.org/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: theme.colors.accent, minHeight: theme.layout.minTouchTarget }}
      >
        OpenFreeMap
      </Link>
      <AppText>{t('globe.attribution')}</AppText>
      <AppText>{t('sources.attribution.ne')}</AppText>
      <AppText>{t('world.attribution')}</AppText>
      <AppText variant="small" muted>
        {t('world.reviewAttribution')}
      </AppText>
      <AppText variant="small" muted>
        {t('sources.identityAttribution')}
      </AppText>
      <AppText>{t('sources.attribution.ohm')}</AppText>
      <AppText>{t('sources.attribution.wikidata')}</AppText>
      <AppText variant="small" muted>
        {t('births.attribution')}
      </AppText>
      <AppText variant="small" muted>
        {t('history.attribution')}
      </AppText>
      <AppText variant="small" muted>
        {t('cities.geonamesAttribution')} · CC BY 4.0 · https://www.geonames.org/ ·
        https://creativecommons.org/licenses/by/4.0/
      </AppText>
      <AppText variant="small" muted>
        {t('cities.geonamesChanges')}
      </AppText>
      <AppText variant="small" muted>
        {t('cities.attribution')} · CC0-1.0
      </AppText>
      <AppText>{t('sources.attribution.wikipedia')}</AppText>
      <AppText>{t('sources.attribution.commons')}</AppText>
      <AppText>{t('sources.attribution.style')}</AppText>

      <AppText muted>{t('atlas.attribution.status')}</AppText>
      <AppText variant="small" muted>
        {t('culture.basemap')}
      </AppText>
      <AppText variant="small">{t('pilot.attribution')}</AppText>
      <AppText variant="small">{pilotNotices}</AppText>
      <AppText variant="small">{sourceNotices}</AppText>
      <AppText variant="small">{bookmarkStorageNotice}</AppText>
      <AppText variant="small">{globeNotices ?? t('atlas.attribution.missing')}</AppText>
      <Link
        href="/about"
        style={{ color: theme.colors.accent, minHeight: theme.layout.minTouchTarget, fontSize: 16 }}
      >
        {t('navigation.about')}
      </Link>
    </View>
  );
}
