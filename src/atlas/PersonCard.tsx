import { RecordDetails } from './RecordDetails';
import { geographyWithheld } from '../data/publication-policy';
import { openExternal } from '../sources/external';
import { SourceActions } from './SourceActions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { pilotPersons } from '../data/application';
import type { DeepReadonly } from '../data/provider';
import type { TemporalBound, TemporalExtent } from '../domain/types';
import { personDescription, personLocationLevel } from '../persons/model';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
import { birthReview } from '../people/discovery';
type Detail = Awaited<ReturnType<NonNullable<typeof pilotPersons>['detail']>>;
export function PersonCard({
  recordId,
  year,
  requestedYear,
  includeApproximate,
  canFocus,
  visibleLocationIds,
  onFocus,
  onBirthYear,
  detailsOpen = false,
}: {
  recordId: string;
  year: number;
  requestedYear: number;
  includeApproximate: boolean;
  canFocus: boolean;
  visibleLocationIds?: readonly string[];
  onFocus: (id: string) => void;
  onBirthYear?: (year: number) => void;
  detailsOpen?: boolean;
}) {
  const [value, setValue] = useState<{ key: string; detail: Detail } | null>(null);
  const [locationPage, setLocationPage] = useState(0);
  const [otherPage, setOtherPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const key = `${recordId}/${year}`;
  useEffect(() => {
    let active = true;
    void (pilotPersons ? pilotPersons.detail(recordId, year) : Promise.resolve(null))
      .then((detail) => {
        if (active) setValue({ key, detail });
      })
      .catch(() => {
        if (active) setValue({ key, detail: null });
      });
    return () => {
      active = false;
    };
  }, [recordId, year, key]);
  if (value?.key !== key) return <AppText>{t('state.loading.title')}</AppText>;
  const d = value.detail;
  if (!d) return <AppText accessibilityRole="alert">{t('person.loadError')}</AppText>;
  const profile = d.person.profile,
    description = personDescription(d.person);
  const review = birthReview(d.person.wikidataId);
  const date = (bound: DeepReadonly<TemporalBound>) =>
    bound.kind !== 'known'
      ? t('pilot.unknown')
      : `${bound.date.day !== null ? `${bound.date.day}.` : ''}${bound.date.month !== null ? `${bound.date.month}.` : ''}${yearLabel(bound.date.year)}`;
  const lifeDate = (extent: DeepReadonly<TemporalExtent>) =>
    JSON.stringify(extent.start) === JSON.stringify(extent.end)
      ? date(extent.start)
      : `(${date(extent.start)} – ${date(extent.end)})`;
  const selectedFirst = (a: { id: string }, b: { id: string }) =>
    Number(b.id === recordId) - Number(a.id === recordId);
  const visible = d.locations
    .filter(
      (l) =>
        (visibleLocationIds === undefined || visibleLocationIds.includes(l.id)) &&
        d.supportedIds.includes(l.id) &&
        (personLocationLevel(l) === 'exact' || includeApproximate),
    )
    .sort(selectedFirst);
  const other = d.locations.filter((l) => !visible.some((v) => v.id === l.id)).sort(selectedFirst);
  const shownVisible = visible.slice(locationPage * 8, locationPage * 8 + 8),
    shownOther = other.slice(otherPage * 8, otherPage * 8 + 8);
  const pager = (page: number, total: number, setPage: (page: number) => void) => (
    <View style={s.row}>
      <Action
        label={t('selection.previous')}
        disabled={page === 0}
        onPress={() => setPage(page - 1)}
      />
      <AppText>
        {page * 8 + 1}–{Math.min(total, page * 8 + 8)} / {total}
      </AppText>
      <Action
        label={t('selection.next')}
        disabled={(page + 1) * 8 >= total}
        onPress={() => setPage(page + 1)}
      />
    </View>
  );
  const link = (url: string) => {
    void openExternal(url).catch(() => setFailed(true));
  };
  if (!detailsOpen)
    return (
      <View style={s.stack} testID="person-card">
        <AppText variant="heading" accessibilityRole="header">
          {d.name.value}
        </AppText>
        <AppText variant="small">
          {profile ? lifeDate(profile.birth) : date(d.person.temporal.start)} –{' '}
          {profile ? lifeDate(profile.death) : date(d.person.temporal.end)}
        </AppText>
        {description && <AppText>{description.value}</AppText>}
        {description && description.language !== 'tr' && (
          <AppText variant="small" muted>
            {t('person.originalText')} {description.language}
          </AppText>
        )}
        {visible[0] ? (
          <AppText variant="small" muted>
            {t(`person.relationship.${visible[0].relationshipType ?? 'DOCUMENTED_EVENT'}`)} ·{' '}
            {t(personLocationLevel(visible[0]) === 'exact' ? 'person.exact' : 'person.approximate')}
          </AppText>
        ) : (
          <AppText variant="small" muted>
            {t('person.noLocation')}
          </AppText>
        )}
        {(profile?.birth.uncertain || profile?.death.uncertain) && (
          <AppText variant="small">{t('person.lifeUncertain')}</AppText>
        )}
        {requestedYear !== year && (
          <AppText accessibilityRole="alert">
            {t('timeline.preview.warning')} {yearLabel(year)}
          </AppText>
        )}
        <SourceActions
          compact
          articleOnly
          allowArticleLookup
          wikidataId={d.person.wikidataId}
          recordIds={[d.person.id]}
        />
      </View>
    );
  return (
    <View style={s.stack} testID="person-card">
      <AppText variant="heading" accessibilityRole="header">
        ● {d.name.value}
      </AppText>
      {d.name.fallback && (
        <AppText muted>
          {t('person.originalName')} {d.name.language}
        </AppText>
      )}
      <AppText>
        {t('person.life')} {profile ? lifeDate(profile.birth) : date(d.person.temporal.start)} –{' '}
        {profile ? lifeDate(profile.death) : date(d.person.temporal.end)}
      </AppText>
      {(profile?.birth.uncertain || profile?.death.uncertain) && (
        <AppText>{t('person.lifeUncertain')}</AppText>
      )}
      {review && (
        <>
          <AppText variant="small">{review.note}</AppText>
          {review.annualBirth && review.birth && onBirthYear && (
            <Action
              label={`${t('births.goYear')} · ${yearLabel(review.birth[0])}`}
              onPress={() => onBirthYear(review.birth![0])}
            />
          )}
        </>
      )}
      {!d.alive && <AppText>{t('person.notAliveSupported')}</AppText>}
      {description && (
        <>
          <AppText>{description.value}</AppText>
          {description.language !== 'tr' && (
            <AppText muted>
              {t('person.originalText')} {description.language}
            </AppText>
          )}
        </>
      )}
      <AppText variant="small">
        {t('playback.requested')} {yearLabel(requestedYear)}
      </AppText>
      {requestedYear !== year && (
        <AppText accessibilityRole="alert">
          {t('timeline.preview.warning')} {yearLabel(year)}
        </AppText>
      )}
      {!visible.length && (
        <AppText variant="small">
          {t(
            !includeApproximate && d.supportedIds.length
              ? 'person.approximateAvailable'
              : 'person.noLocation',
          )}
        </AppText>
      )}
      {shownVisible.slice(0, 1).map((l) => (
        <View key={l.id} style={s.stack}>
          <AppText variant="small">
            {t(personLocationLevel(l) === 'exact' ? 'person.exact' : 'person.approximate')} ·{' '}
            {t(`person.relationship.${l.relationshipType ?? 'DOCUMENTED_EVENT'}`)}
          </AppText>
          <AppText variant="small">
            {l.spatialContext?.description ?? t('person.coordinateUnknown')}
          </AppText>
          <Action label={t('person.focus')} disabled={!canFocus} onPress={() => onFocus(l.id)} />
        </View>
      ))}
      <SourceActions
        key={key}
        compact
        allowArticleLookup
        wikidataId={d.person.wikidataId}
        recordIds={[d.person.id, ...d.locations.map((l) => l.id)]}
      />
      <RecordDetails>
        <AppText>{t('person.aliveNotice')}</AppText>
        {profile && (
          <AppText muted>
            {profile.birth.sourceDate.text} · {t(`person.precision.${profile.birth.precision}`)} /{' '}
            {profile.death.sourceDate.text} · {t(`person.precision.${profile.death.precision}`)}
          </AppText>
        )}
        {(profile?.occupations ?? []).map((n, i) => (
          <AppText key={i}>
            {t('person.occupation')} {n.value} ({n.language})
          </AppText>
        ))}
        <AppText>
          {t('playback.requested')} {yearLabel(requestedYear)} · {t('politics.sourceYear')}{' '}
          {yearLabel(year)}
        </AppText>
        {requestedYear !== year && (
          <AppText accessibilityRole="alert">{t('timeline.preview.warning')}</AppText>
        )}
        {!visible.length && (
          <AppText accessibilityRole="alert">
            {t(d.supportedIds.length ? 'layers.filtered' : 'person.noLocation')}
          </AppText>
        )}
        {shownVisible.map((l) => (
          <View key={l.id} style={s.stack}>
            <AppText>
              {personLocationLevel(l) === 'exact' ? '●' : '≈'}{' '}
              {t(personLocationLevel(l) === 'exact' ? 'person.exact' : 'person.approximate')}
            </AppText>
            <AppText>
              {l.names.find((n) => n.language === 'tr')?.value ?? l.names[0]!.value} ·{' '}
              {t(`person.relationship.${l.relationshipType ?? 'DOCUMENTED_EVENT'}`)}
            </AppText>
            <AppText>
              {date(l.temporal.start)} – {date(l.temporal.end)} ·{' '}
              {t(`person.precision.${l.temporal.precision}`)}
            </AppText>
            <AppText muted>{l.temporal.sourceDate.text}</AppText>
            <AppText>{l.spatialContext?.description ?? t('person.coordinateUnknown')}</AppText>
            <AppText>{l.confidence.rationale}</AppText>
            <Action label={t('person.focus')} disabled={!canFocus} onPress={() => onFocus(l.id)} />
          </View>
        ))}
        {visible.length > 8 && pager(locationPage, visible.length, setLocationPage)}
        <Action
          label={t('person.otherLinks')}
          symbol={expanded ? '−' : '+'}
          selected={expanded}
          onPress={() => setExpanded(!expanded)}
        />
        {expanded &&
          shownOther.map((l) => (
            <View key={l.id} style={s.stack}>
              <AppText>
                {personLocationLevel(l) === 'biographical' ? '◇' : '≈'}{' '}
                {t(
                  geographyWithheld(l.id)
                    ? 'qa.withheld'
                    : personLocationLevel(l) === 'biographical'
                      ? l.temporal.start.kind === 'unknown' && l.temporal.end.kind === 'unknown'
                        ? 'person.biographical'
                        : 'person.biographicalDated'
                      : d.supportedIds.includes(l.id)
                        ? 'layers.filtered'
                        : 'person.outsideYear',
                )}
              </AppText>
              <AppText>
                {l.names[0]!.value} ·{' '}
                {t(`person.relationship.${l.relationshipType ?? 'DOCUMENTED_EVENT'}`)}
              </AppText>
              <AppText>
                {date(l.temporal.start)} – {date(l.temporal.end)} ·{' '}
                {t(`person.precision.${l.temporal.precision}`)}
              </AppText>
              <AppText>{l.spatialContext?.description ?? t('person.coordinateUnknown')}</AppText>
            </View>
          ))}
        {expanded && other.length > 8 && pager(otherPage, other.length, setOtherPage)}
        <AppText>{t('person.coordinateNotice')}</AppText>
        <AppText>{t('politics.sources')}</AppText>
        {d.sources.map((source) => (
          <View key={source.id} style={s.stack}>
            <AppText variant="small">
              {source.attribution} · {source.licenseId} · {source.revision}
            </AppText>
            <Action label={source.names[0]!.value} symbol="↗" onPress={() => link(source.url)} />
          </View>
        ))}
        {[d.person, ...shownVisible, ...(expanded ? shownOther : [])].flatMap((r) =>
          r.evidence.map((e, i) => (
            <AppText variant="small" muted key={`${r.id}/${i}`}>
              {e.locator} · {e.attribution}
            </AppText>
          )),
        )}
      </RecordDetails>
      {failed && <AppText accessibilityRole="alert">{t('pilot.linkError')}</AppText>}
    </View>
  );
}
