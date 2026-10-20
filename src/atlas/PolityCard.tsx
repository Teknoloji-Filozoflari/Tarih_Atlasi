import { SourceActions } from './SourceActions';
import { polityWikidataId } from '../sources/polity-identity';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { t } from '../i18n';
import { pilotPolitics } from '../data/application';
import { createLatestQuery } from '../timeline/latest';
import { AppText } from '../ui/AppText';
import { yearLabel } from './yearLabel';
import { Action } from './Action';
import { atlasStyles as s } from './styles';

type Detail = Awaited<ReturnType<NonNullable<typeof pilotPolitics>['detail']>>;
export function PolityCard({
  recordId,
  requestedYear,
  sourceYear,
  preview,
  canFocus,
  onFocus,
  candidateIds,
  candidateLabels,
  onChoose,
}: {
  recordId: string;
  requestedYear: number;
  sourceYear: number;
  preview: boolean;
  canFocus: boolean;
  onFocus: () => void;
  candidateIds: readonly string[];
  candidateLabels: Readonly<Record<string, string>>;
  onChoose: (id: string) => void;
}) {
  const key = `${recordId}/${requestedYear}/${sourceYear}/${preview}`;
  const [value, setValue] = useState<{ key: string; detail: Detail } | null>(null);
  useEffect(() => {
    const latest = createLatestQuery();
    void latest
      .run(async () => ({
        detail: pilotPolitics
          ? await pilotPolitics.detail(recordId, requestedYear, sourceYear)
          : null,
      }))
      .then((result) => {
        if (result) setValue({ key, detail: result.detail });
      })
      .catch(() => setValue({ key, detail: null }));
    return () => latest.invalidate();
  }, [recordId, requestedYear, sourceYear, key]);
  if (value?.key !== key)
    return <AppText accessibilityLiveRegion="polite">{t('state.loading.title')}</AppText>;
  const d = value.detail;
  if (!d) return <AppText accessibilityRole="alert">{t('politics.unavailable')}</AppText>;
  const start = d.territory.temporal.start,
    end = d.territory.temporal.end;
  const date = (bound: typeof start) =>
    bound.kind !== 'known'
      ? t('pilot.unknown')
      : `${bound.date.day !== null ? `${bound.date.day}.` : ''}${bound.date.month !== null ? `${bound.date.month}.` : ''}${yearLabel(bound.date.year)}`;
  return (
    <View style={s.stack} testID="polity-card">
      <AppText variant="heading" accessibilityRole="header">
        {d.name}
      </AppText>
      <AppText variant="small" muted>
        {t(
          d.territory.boundary === 'documented' && !d.territory.temporal.uncertain
            ? 'timeline.mini.exact'
            : 'timeline.mini.approximate',
        )}
      </AppText>
      {d.territory.names[0]?.language !== 'tr' && (
        <AppText muted>{t('world.originalName')}</AppText>
      )}
      {!d.territory.geometry && (
        <AppText accessibilityRole="alert">{t('world.geometryWithheld')}</AppText>
      )}
      {d.territory.extentType === 'partial-area' && (
        <AppText accessibilityRole="alert">{t('world.partialArea')}</AppText>
      )}
      {d.territory.geometryReason?.startsWith('DUPLICATE_SOURCE') && (
        <AppText>{t('world.duplicate')}</AppText>
      )}
      {d.territory.geometryReason === 'SOURCE_NAME_PERIOD_REQUIRES_REVIEW' && (
        <AppText accessibilityRole="alert">{t('world.identityWithheld')}</AppText>
      )}
      {!d.supported && <AppText accessibilityRole="alert">{t('politics.unsupported')}</AppText>}
      {preview && (
        <AppText>
          {t('timeline.preview.active')} {yearLabel(sourceYear)}. {t('timeline.preview.warning')}
        </AppText>
      )}
      {d.supported && (
        <AppText>
          {t('politics.sourceYear')} {yearLabel(sourceYear)}
        </AppText>
      )}
      <AppText>
        {t('politics.period')} {date(start)} – {date(end)}
      </AppText>
      {d.classes.length > 0 && (
        <AppText>{d.classes.map((value) => t(`politics.${value}`)).join(' · ')}</AppText>
      )}
      {d.uncertainProfile && <AppText>{t('politics.approximateProfile')}</AppText>}
      {d.descriptions.map((claim) => (
        <AppText key={claim.id}>{claim.text}</AppText>
      ))}
      {d.territory.extentType === 'boundary-segment' && (
        <AppText>{t('politics.polygonBlocked')}</AppText>
      )}
      {d.capitals.length > 0 && (
        <>
          <AppText>{t('politics.capitals')}</AppText>
          {d.capitals.map((capital) => (
            <AppText key={capital.claimId}>
              {capital.place.names.find((name) => name.language === 'tr')?.value ??
                capital.place.names[0]?.value}
            </AppText>
          ))}
        </>
      )}
      {d.relations.length > 0 && (
        <>
          <AppText>{t('politics.relations')}</AppText>
          {d.relations.map(({ record, from, to }) => (
            <View key={record.id} style={s.stack}>
              <AppText>
                {t(`politics.${record.relationship}`)}: {from} → {to}
              </AppText>
              <AppText muted>{record.description}</AppText>
            </View>
          ))}
        </>
      )}
      <SourceActions
        key={key}
        wikidataId={polityWikidataId(d.territory) ?? d.entity.wikidataId}
        allowArticleLookup
        compact
        recordIds={[
          d.territory.id,
          d.entity.id,
          ...d.relations.map((r) => r.record.id),
          ...d.capitals.map((c) => c.place.id),
        ]}
      />
      <Action label={t('politics.focus')} disabled={!d.supported || !canFocus} onPress={onFocus} />
      {candidateIds.length > 1 && (
        <>
          <AppText>{t('politics.candidates')}</AppText>
          {candidateIds.map((id) => (
            <Action
              key={id}
              label={candidateLabels[id] ?? t('politics.unavailable')}
              selected={id === recordId}
              onPress={() => onChoose(id)}
            />
          ))}
        </>
      )}
    </View>
  );
}
