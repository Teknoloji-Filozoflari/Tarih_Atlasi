import { openExternal } from '../sources/external';
import { SourceActions } from './SourceActions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getPilotRecord, getPilotSource } from '../data/application';
import { PILOT_ID } from '../data/pilot-contract';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';

export function PilotCard() {
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getPilotRecord>>>(null);
  const [source, setSource] = useState<Awaited<ReturnType<typeof getPilotSource>>>(null);
  const [failedLink, setFailedLink] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([getPilotRecord(PILOT_ID), getPilotSource()])
      .then(([record, source]) => {
        if (active) {
          setDetails(record);
          setSource(source);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  if (!loaded)
    return <AppText accessibilityLiveRegion="polite">{t('state.loading.title')}</AppText>;
  if (!details || !source || details.kind !== 'territory')
    return <AppText accessibilityRole="alert">{t('pilot.unavailable')}</AppText>;
  const date = details.temporal.start.kind === 'known' ? details.temporal.start.date : null;
  return (
    <View style={s.stack}>
      <AppText variant="heading" accessibilityRole="header">
        {details.names[0]?.value}
      </AppText>
      <AppText>
        {t('pilot.date')} {date ? `${date.day}.${date.month}.${date.year}` : t('pilot.unknown')}
      </AppText>
      <AppText>{t('pilot.description')}</AppText>
      <AppText>{details.borderPrecision.description}</AppText>
      <AppText>
        {t('pilot.confidence')} {t('pilot.confidence.medium')}
      </AppText>
      <AppText muted>{details.confidence.rationale}</AppText>
      <AppText>{t('pilot.sovereignty')}</AppText>
      <AppText variant="small">{t('pilot.attribution')}</AppText>
      <AppText variant="small">{source.attribution}</AppText>
      <Action
        label={t('pilot.source')}
        symbol="↗"
        onPress={() => {
          void openExternal(source.url).catch(() => setFailedLink(true));
        }}
      />
      <SourceActions wikidataId={details.wikidataId} recordIds={[details.id]} />
      {failedLink && <AppText accessibilityRole="alert">{t('pilot.linkError')}</AppText>}
      <AppText variant="small" muted>
        {t('pilot.missing')}
      </AppText>
    </View>
  );
}
