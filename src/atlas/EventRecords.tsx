import { useState } from 'react';
import { View } from 'react-native';
import type { HistoricalEvent } from '../domain/types';
import type { TemporalHit } from '../timeline/engine';
import { eventHasMapEvidence, eventLayer, eventSymbol, eventTitle } from '../events/model';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
export function EventRecords({
  records,
  year,
  battle,
  event,
  loading,
  failed,
  onChoose,
}: {
  records: readonly TemporalHit<HistoricalEvent>[];
  year: number;
  battle: boolean;
  event: boolean;
  loading: boolean;
  failed: boolean;
  onChoose: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const visible = records.filter((h) =>
    eventLayer(h.record.eventType) === 'battle' ? battle : event,
  );
  return (
    <View style={s.stack} testID="event-records">
      <AppText variant="heading">
        {t('events.records')} · {yearLabel(year)}
      </AppText>
      <AppText>{t('events.legend')}</AppText>
      <AppText muted>{t('events.listNotice')}</AppText>
      {!battle && !event && <AppText>{t('events.layersHidden')}</AppText>}
      {failed ? (
        <AppText accessibilityRole="alert">{t('events.loadError')}</AppText>
      ) : loading ? (
        <AppText accessibilityLiveRegion="polite">{t('state.loading.title')}</AppText>
      ) : (
        <>
          <AppText>
            {t('selection.total')} {visible.length}
          </AppText>
          {!visible.length && <AppText>{t('events.empty')}</AppText>}
          {visible.slice(offset, offset + 8).map(({ record }) => (
            <View key={record.id} style={s.stack}>
              <Action
                label={`${eventSymbol(record.eventType)} ${eventTitle(record)}`}
                onPress={() => onChoose(record.id)}
              />
              <AppText muted>
                {t(`events.type.${record.eventType}`)} ·{' '}
                {t(eventHasMapEvidence(record) ? 'events.mapped' : 'events.noGeometry')}
              </AppText>
            </View>
          ))}
          {visible.length > 8 && (
            <View style={s.row}>
              <Action
                label={t('selection.previous')}
                disabled={offset === 0}
                onPress={() => setOffset(offset - 8)}
              />
              <Action
                label={t('selection.next')}
                disabled={offset + 8 >= visible.length}
                onPress={() => setOffset(offset + 8)}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}
