import { RecordDetails } from './RecordDetails';
import { openExternal } from '../sources/external';
import { SourceActions } from './SourceActions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { pilotEvents } from '../data/application';
import type { DeepReadonly } from '../data/provider';
import type { TemporalBound } from '../domain/types';
import { eventLayer, eventSymbol } from '../events/model';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
type Detail = Awaited<ReturnType<NonNullable<typeof pilotEvents>['detail']>>;
export function EventCard({
  id,
  year,
  requestedYear,
  battle,
  event,
  canFocus,
  onFocus,
  detailsOpen = false,
}: {
  id: string;
  year: number;
  requestedYear: number;
  battle: boolean;
  event: boolean;
  canFocus: boolean;
  onFocus: () => void;
  detailsOpen?: boolean;
}) {
  const [value, setValue] = useState<{ key: string; detail: Detail } | null>(null);
  const [failed, setFailed] = useState(false);
  const key = `${id}/${year}`;
  useEffect(() => {
    let active = true;
    void (pilotEvents ? pilotEvents.detail(id, year) : Promise.resolve(null))
      .then((detail) => {
        if (active) setValue({ key, detail });
      })
      .catch(() => {
        if (active) setValue({ key, detail: null });
      });
    return () => {
      active = false;
    };
  }, [id, year, key]);
  if (value?.key !== key) return <AppText>{t('state.loading.title')}</AppText>;
  const d = value.detail;
  if (!d) return <AppText accessibilityRole="alert">{t('events.loadError')}</AppText>;
  const record = d.record,
    details = record.details,
    timing = record.temporal,
    description = details?.description.find((n) => n.language === 'tr') ?? details?.description[0];
  const visible = d.supported && (eventLayer(record.eventType) === 'battle' ? battle : event);
  const date = (bound: DeepReadonly<TemporalBound>) =>
    bound.kind !== 'known'
      ? t('pilot.unknown')
      : `${bound.date.day !== null ? `${bound.date.day}.` : ''}${bound.date.month !== null ? `${bound.date.month}.` : ''}${yearLabel(bound.date.year)}`;
  const open = (url: string) => {
    void openExternal(url).catch(() => setFailed(true));
  };
  if (!detailsOpen)
    return (
      <View style={s.stack} testID="event-card">
        <AppText variant="heading" accessibilityRole="header">
          {eventSymbol(record.eventType)} {d.title}
        </AppText>
        <AppText variant="small">
          {date(timing.start)} – {date(timing.end)}
        </AppText>
        {description && <AppText>{description.value}</AppText>}
        {description && description.language !== 'tr' && (
          <AppText muted variant="small">
            {t('person.originalText')} {description.language}
          </AppText>
        )}
        {timing.uncertain && <AppText variant="small">{t('events.dateUncertain')}</AppText>}
        <AppText variant="small" muted>
          {d.mapSupported
            ? t(`events.precision.${details?.locationPrecision.classification ?? 'unknown'}`)
            : t('events.noGeometry')}
        </AppText>
        {!visible && <AppText accessibilityRole="alert">{t('events.unsupported')}</AppText>}
        {requestedYear !== year && (
          <AppText accessibilityRole="alert">{t('timeline.preview.warning')}</AppText>
        )}
        <SourceActions
          compact
          articleOnly
          allowArticleLookup
          wikidataId={record.wikidataId}
          recordIds={[record.id]}
        />
      </View>
    );
  return (
    <View style={s.stack} testID="event-card">
      <AppText variant="heading" accessibilityRole="header">
        {eventSymbol(record.eventType)} {d.title}
      </AppText>
      <AppText>{t(`events.type.${record.eventType}`)}</AppText>
      {!visible && <AppText accessibilityRole="alert">{t('events.unsupported')}</AppText>}
      <AppText>
        {t('playback.requested')} {yearLabel(requestedYear)} · {t('events.listYear')}{' '}
        {yearLabel(year)}
      </AppText>
      {requestedYear !== year && (
        <AppText accessibilityRole="alert">{t('timeline.preview.warning')}</AppText>
      )}
      <AppText>
        {t('politics.period')} {date(timing.start)} – {date(timing.end)}
      </AppText>
      <AppText>
        {t(`person.precision.${timing.precision}`)}
        {timing.uncertain ? ` · ${t('events.dateUncertain')}` : ''}
      </AppText>
      {description && (
        <>
          <AppText>{description.value}</AppText>
          {description.language !== 'tr' && (
            <AppText>
              {t('person.originalText')} {description.language}
            </AppText>
          )}
        </>
      )}
      <AppText>
        {t('events.location')}{' '}
        {details?.locationPrecision.explanation ??
          record.geometryReason ??
          t('person.coordinateUnknown')}
      </AppText>
      <AppText>
        {t(`events.precision.${details?.locationPrecision.classification ?? 'unknown'}`)}
      </AppText>
      {details?.locationPrecision.toleranceKm !== null &&
        details?.locationPrecision.toleranceKm !== undefined && (
          <AppText>
            {t('events.tolerance')} {details.locationPrecision.toleranceKm}
          </AppText>
        )}
      {!d.mapSupported && <AppText>{t('events.noGeometry')}</AppText>}

      {d.mapSupported && (
        <Action label={t('events.focus')} disabled={!visible || !canFocus} onPress={onFocus} />
      )}
      <SourceActions
        key={key}
        compact
        allowArticleLookup
        wikidataId={record.wikidataId}
        recordIds={[record.id]}
      />
      <RecordDetails>
        <AppText muted>
          {timing.sourceDate.text} · {timing.sourceDate.calendar}
        </AppText>
        <AppText>{record.confidence.rationale}</AppText>
        <AppText>{t('events.participants')}</AppText>
        {!d.participants.length && <AppText muted>{t('events.participantsMissing')}</AppText>}
        {d.participants.map((p) => (
          <AppText key={p.id}>
            {(p.names.find((n) => n.language === 'tr') ?? p.names[0]!).value}
          </AppText>
        ))}
        {(details?.alternativeDates ?? []).map((alternative, index) => (
          <View key={index} style={s.stack}>
            <AppText>
              {t('events.alternative')} {date(alternative.temporal.start)} –{' '}
              {date(alternative.temporal.end)}
            </AppText>
            <AppText>{alternative.explanation}</AppText>
            <AppText muted>{alternative.temporal.sourceDate.text}</AppText>
            {alternative.evidenceIndices.map((i) => (
              <AppText key={i} variant="small">
                {record.evidence[i]?.locator}
              </AppText>
            ))}
          </View>
        ))}
        <AppText>{t('politics.sources')}</AppText>
        {d.sources.map((source) => (
          <View key={source.id} style={s.stack}>
            <AppText variant="small">
              {source.attribution} · {source.licenseId} · {source.revision}
            </AppText>
            <Action label={source.names[0]!.value} symbol="↗" onPress={() => open(source.url)} />
          </View>
        ))}
        {record.evidence.map((e, index) => (
          <AppText key={index} muted variant="small">
            {e.locator}
          </AppText>
        ))}
      </RecordDetails>
      {failed && <AppText accessibilityRole="alert">{t('events.offlineLink')}</AppText>}
    </View>
  );
}
