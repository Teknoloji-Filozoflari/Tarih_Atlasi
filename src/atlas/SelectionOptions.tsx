import { View } from 'react-native';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
import type { HistoricalSelectionPage, SelectionPageRequest } from '../map-contract/selection';
export interface AreaOption {
  id: string;
  label: string;
  kind: 'territory' | 'cultural-region' | 'person-location' | 'event' | 'place';
}
export function SelectionOptions({
  page,
  options,
  onChoose,
  onPage,
  enabled,
  selectedId,
}: {
  page: HistoricalSelectionPage;
  options: readonly AreaOption[];
  onChoose: (id: string) => void;
  onPage: (request: SelectionPageRequest) => void;
  enabled: boolean;
  selectedId: string | null;
}) {
  const choosePage = (offset: number) =>
    onPage({ offset, revision: page.revision, selectionId: page.selectionId });
  return (
    <View style={s.stack} testID="selection-options">
      <AppText accessibilityLiveRegion="polite">
        {t('selection.total')} {page.total} · {t('selection.range')} {page.offset + 1}–
        {page.offset + page.candidateIds.length}
      </AppText>
      {page.total > 8 && <AppText muted>{t('selection.density')}</AppText>}
      {page.candidateIds.map((id) => {
        const option = options.find((option) => option.id === id);
        if (!option) return null;
        return (
          <Action
            key={id}
            label={`${option.kind === 'place' ? '⌖' : option.kind === 'event' ? '✦' : option.kind === 'person-location' ? '●' : option.kind === 'cultural-region' ? '≈' : '▱'} ${option.label} · ${t(option.kind === 'place' ? 'layers.labels' : option.kind === 'event' ? 'events.title' : option.kind === 'person-location' ? 'person.title' : option.kind === 'cultural-region' ? 'selection.culture' : 'selection.polity')}`}
            selected={id === selectedId}
            disabled={!enabled}
            onPress={() => onChoose(id)}
          />
        );
      })}
      <View style={s.row}>
        <Action
          label={t('selection.previous')}
          disabled={!enabled || page.offset === 0}
          onPress={() => choosePage(page.offset - 8)}
        />
        <Action
          label={t('selection.next')}
          disabled={!enabled || page.offset + 8 >= page.total}
          onPress={() => choosePage(page.offset + 8)}
        />
      </View>
    </View>
  );
}
