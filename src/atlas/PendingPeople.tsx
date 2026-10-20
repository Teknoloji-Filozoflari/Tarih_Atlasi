import { View } from 'react-native';
import { useState } from 'react';
import { pendingPeople } from '../people/discovery';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { ArticleAction } from './ArticleAction';
import { atlasStyles as s } from './styles';
import { Action } from './Action';
export function PendingPeople({ query }: { query: string }) {
  const [page, setPage] = useState(0);
  const people = pendingPeople(query);
  const current = Math.min(page, Math.max(0, Math.ceil(people.length / 8) - 1));
  if (!people.length) return null;
  return (
    <View style={s.stack} testID="pending-people">
      <AppText>
        {t('births.pending')} {people.length}
      </AppText>
      {people.slice(current * 8, current * 8 + 8).map((p) => (
        <View key={p.id} style={s.stack}>
          <AppText>{p.name}</AppText>
          <AppText variant="small">
            {t(
              p.kind === 'group'
                ? 'births.group'
                : p.kind === 'ambiguous'
                  ? 'births.ambiguous'
                  : 'births.awaitingSource',
            )}
          </AppText>
          {p.wikidataId && <ArticleAction wikidataId={p.wikidataId} />}
        </View>
      ))}
      {people.length > 8 && (
        <View style={s.row}>
          <Action
            label={t('selection.previous')}
            disabled={!current}
            onPress={() => setPage(current - 1)}
          />
          <AppText>
            {current * 8 + 1}–{Math.min(people.length, current * 8 + 8)} / {people.length}
          </AppText>
          <Action
            label={t('selection.next')}
            disabled={(current + 1) * 8 >= people.length}
            onPress={() => setPage(current + 1)}
          />
        </View>
      )}
    </View>
  );
}
