import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { pilotPersons } from '../data/application';
import { personName } from '../persons/model';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
import { PendingPeople } from './PendingPeople';
import { peopleCoverage } from '../people/discovery';
type Result = Awaited<ReturnType<NonNullable<typeof pilotPersons>['search']>>;
export function PersonRecords({
  query,
  onChoose,
  onEnableBirths,
}: {
  query: string;
  onChoose: (id: string) => void;
  onEnableBirths: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [value, setValue] = useState<{ key: string; result: Result | null } | null>(null);
  const key = `${query}/${offset}`;
  useEffect(() => {
    let active = true;
    void (pilotPersons ? pilotPersons.search(query, offset) : Promise.resolve(null))
      .then((result) => {
        if (active) setValue({ key, result });
      })
      .catch(() => {
        if (active) setValue({ key, result: null });
      });
    return () => {
      active = false;
    };
  }, [query, offset, key]);
  const result = value?.key === key ? value.result : null;
  return (
    <View style={s.stack} testID="person-records">
      <AppText>{t('person.searchNotice')}</AppText>
      <AppText variant="small">
        {t('births.coverage')} {peopleCoverage.availableRequested}/{peopleCoverage.requested} ·{' '}
        {t('births.annualCount')} {peopleCoverage.annualBirths}
      </AppText>
      <AppText variant="small">{t('births.yearOnly')}</AppText>
      <Action label={t('births.enable')} symbol="≈" onPress={onEnableBirths} />
      {value?.key !== key ? (
        <AppText>{t('state.loading.title')}</AppText>
      ) : !result ? (
        <AppText accessibilityRole="alert">{t('person.loadError')}</AppText>
      ) : (
        <>
          <AppText accessibilityLiveRegion="polite">
            {t('person.results')} {result.total}
          </AppText>
          {!result.total && <AppText>{t('person.empty')}</AppText>}
          {result.records.map((person) => (
            <Action
              key={person.id}
              symbol="●"
              label={personName(person).value}
              onPress={() => onChoose(person.id)}
            />
          ))}
          <View style={s.row}>
            <Action
              label={t('selection.previous')}
              disabled={offset === 0}
              onPress={() => setOffset(Math.max(0, offset - 8))}
            />
            <Action
              label={t('selection.next')}
              disabled={result.nextOffset === null}
              onPress={() => setOffset(result.nextOffset!)}
            />
          </View>
        </>
      )}
      <PendingPeople query={query} />
    </View>
  );
}
