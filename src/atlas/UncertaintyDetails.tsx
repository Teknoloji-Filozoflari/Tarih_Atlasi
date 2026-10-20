import { useState } from 'react';
import { View } from 'react-native';
import type { SourceDetail } from '../sources/repository';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function UncertaintyDetails({ detail }: { detail: SourceDetail }) {
  const [recordPage, setRecordPage] = useState(0);
  return (
    <View style={s.stack} testID="source-uncertainty">
      <AppText accessibilityRole="header" variant="heading">
        {t('sources.uncertainty')}
      </AppText>
      {detail.records.slice(recordPage * 8, recordPage * 8 + 8).map((record) => (
        <View key={record.id} style={s.stack}>
          <AppText>
            {record.names.find((n) => n.language === 'tr')?.value ?? record.names[0]?.value}
          </AppText>
          <AppText>{record.confidence.rationale}</AppText>
          {record.kind === 'territory' && <AppText>{record.borderPrecision.description}</AppText>}
          {record.alternativeNames.length > 0 && (
            <AppText>
              {t('politics.alternatives')} {record.alternativeNames.map((n) => n.value).join(' · ')}
            </AppText>
          )}
          <AppText>
            {record.temporal.sourceDate.text} · {record.temporal.sourceDate.calendar}
          </AppText>
          <AppText>
            {t(`person.precision.${record.temporal.precision}`)} ·{' '}
            {t(record.temporal.uncertain ? 'sources.approximate' : 'sources.sourcePrecision')}
          </AppText>
          <AppText>
            {t('sources.review')} {t(`sources.review.${record.reviewStatus}`)}
          </AppText>
          <AppText>{record.temporal.support?.note ?? t('sources.supportMissing')}</AppText>
        </View>
      ))}
      {detail.records.length > 8 && (
        <View style={s.row}>
          <Action
            label={t('selection.previous')}
            disabled={recordPage === 0}
            onPress={() => setRecordPage(recordPage - 1)}
          />
          <AppText>
            {recordPage * 8 + 1}–{Math.min(detail.records.length, recordPage * 8 + 8)} /{' '}
            {detail.records.length}
          </AppText>
          <Action
            label={t('selection.next')}
            disabled={(recordPage + 1) * 8 >= detail.records.length}
            onPress={() => setRecordPage(recordPage + 1)}
          />
        </View>
      )}
      <AppText muted>{t('sources.identityNotice')}</AppText>
    </View>
  );
}
