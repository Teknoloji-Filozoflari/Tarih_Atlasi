import { View } from 'react-native';
import type { DeepReadonly } from '../data/provider';
import type { HistoricalPlace } from '../domain/types';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { SourceActions } from './SourceActions';
import { atlasStyles as s } from './styles';
import { yearLabel } from './yearLabel';
export function PlaceCard({
  record,
  year,
}: {
  record: DeepReadonly<HistoricalPlace>;
  year: number;
}) {
  return (
    <View style={s.stack}>
      <AppText variant="heading">
        {record.names.find((n) => n.language === 'tr')?.value ?? record.names[0]?.value}
      </AppText>
      <AppText>
        {t('layers.labels')} · {yearLabel(year)}
      </AppText>
      <AppText>{t('layers.legend.place')}</AppText>
      <AppText>{record.temporal.sourceDate.text}</AppText>
      <SourceActions recordIds={[record.id]} wikidataId={record.wikidataId} />
    </View>
  );
}
