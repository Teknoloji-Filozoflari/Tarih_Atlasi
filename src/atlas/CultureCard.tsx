import { openExternal } from '../sources/external';
import { SourceActions } from './SourceActions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { t } from '../i18n';
import { pilotCultures } from '../data/application';
import { createLatestQuery } from '../timeline/latest';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { CultureLegend } from './CultureLegend';
import { atlasStyles as s } from './styles';
import type { TemporalBound } from '../domain/types';
type Detail = Awaited<ReturnType<NonNullable<typeof pilotCultures>['detail']>>;
export function CultureCard({
  recordId,
  requestedYear,
  sourceYear,
  preview,
}: {
  recordId: string;
  requestedYear: number;
  sourceYear: number;
  preview: boolean;
}) {
  const key = `${recordId}/${requestedYear}/${sourceYear}/${preview}`;
  const [value, setValue] = useState<{ key: string; detail: Detail } | null>(null);
  const [linkFailure, setLinkFailure] = useState<string | null>(null);
  useEffect(() => {
    const latest = createLatestQuery();
    void latest
      .run(async () => ({
        detail: pilotCultures
          ? await pilotCultures.detail(recordId, requestedYear, sourceYear)
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
  const type =
    d.entity.entityType === 'CIVILIZATION'
      ? 'CIVILIZATION'
      : d.entity.entityType === 'CULTURAL_REGION'
        ? 'CULTURAL_REGION'
        : 'CULTURE';
  const date = (bound: TemporalBound) =>
    bound.kind !== 'known'
      ? t('pilot.unknown')
      : `${bound.date.day !== null ? `${bound.date.day}.` : ''}${bound.date.month !== null ? `${bound.date.month}.` : ''}${yearLabel(bound.date.year)}`;
  const context = d.region.culturalContext;
  return (
    <View style={s.stack} testID="culture-card">
      <AppText variant="heading" accessibilityRole="header">
        ≈ {d.name}
      </AppText>
      <AppText>
        {t(`culture.${type}`)} · {t(`culture.${d.region.semantics}`)}
      </AppText>
      {!d.supported && <AppText accessibilityRole="alert">{t('culture.unsupported')}</AppText>}
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
        {t('politics.period')} {date(d.region.temporal.start)} – {date(d.region.temporal.end)}
      </AppText>
      <AppText muted>{d.region.temporal.sourceDate.text}</AppText>
      {d.region.temporal.uncertain && <AppText>{t('culture.temporalUncertain')}</AppText>}
      <AppText>{context?.description ?? t('culture.contextMissing')}</AppText>
      <AppText>
        {t('culture.context')} {context?.geographicContext ?? t('culture.contextMissing')}
      </AppText>
      <AppText>{t('culture.uncertainty')}</AppText>
      <AppText>{t(`culture.confidence.${d.region.confidence.level}`)}</AppText>
      {(context?.uncertainties ?? []).map((text, index) => (
        <AppText key={index}>≈ {text}</AppText>
      ))}
      <AppText>{d.region.confidence.rationale}</AppText>
      {d.relations.map((relation) => (
        <AppText key={relation.id}>
          {t(`culture.${relation.relationship}`)}: {relation.description}
        </AppText>
      ))}
      <AppText>{t('politics.sources')}</AppText>
      {d.sources.map((source) => (
        <View key={source.id} style={s.stack}>
          <AppText variant="small">
            {source.attribution} · {source.licenseId}
          </AppText>
          {[
            ...new Set(
              [
                ...d.region.evidence,
                ...d.entity.evidence,
                ...d.relations.flatMap((r) => r.evidence),
              ]
                .filter((e) => e.sourceId === source.id)
                .map((e) => e.locator),
            ),
          ].map((locator) => (
            <AppText key={locator} variant="small" muted>
              {locator}
            </AppText>
          ))}
          <Action
            label={
              source.names.find((name) => name.language === 'tr')?.value ?? source.names[0]!.value
            }
            symbol="↗"
            onPress={() => {
              void openExternal(source.url).catch(() => setLinkFailure(key));
            }}
          />
        </View>
      ))}
      <SourceActions
        key={key}
        wikidataId={d.entity.wikidataId}
        recordIds={[d.region.id, d.entity.id, ...d.relations.map((r) => r.id)]}
      />
      {linkFailure === key && <AppText accessibilityRole="alert">{t('pilot.linkError')}</AppText>}
      <CultureLegend />
    </View>
  );
}
