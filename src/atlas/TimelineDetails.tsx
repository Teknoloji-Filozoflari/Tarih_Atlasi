import { eventLayer } from '../events/model';
import { View } from 'react-native';
import { t } from '../i18n';
import type { CoverageMode } from '../timeline/engine';
import type { TimelineState } from '../timeline/store';
import { AppText } from '../ui/AppText';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
export function coverageLabel(mode: CoverageMode | 'loading' | 'error') {
  return t(
    mode === 'loading'
      ? 'timeline.loading'
      : mode === 'error'
        ? 'timeline.error'
        : mode === 'exact verified'
          ? 'timeline.exact'
          : mode === 'documented approximate'
            ? 'timeline.approximate'
            : 'timeline.unsupported',
  );
}
export function TimelineDetails({ state }: { state: TimelineState }) {
  return (
    <View style={s.stack} testID="timeline-details">
      <AppText>
        {t('playback.requested')} {yearLabel(state.requestedYear)}
      </AppText>
      <AppText>
        {t('playback.renderedSource')}{' '}
        {state.renderedSourceYear === null
          ? t('playback.notRendered')
          : yearLabel(state.renderedSourceYear)}
      </AppText>
      <AppText>
        {t('playback.coverageStatus')} {coverageLabel(state.coverageStatus)}
      </AppText>
      <AppText variant="small" muted>
        {t(
          state.renderStatus === 'applied'
            ? 'playback.applied'
            : state.renderStatus === 'unavailable'
              ? 'playback.unavailable'
              : 'playback.pending',
        )}
      </AppText>
      {state.frame && (
        <AppText variant="small">
          {t('playback.sameYear')} {yearLabel(state.frame.contextYear)}
          {' · '}
          {t('atlas.layer.state')}: {state.frame.territories.length}
          {' · '}
          {t('atlas.layer.culture')}:{' '}
          {
            state.frame.coverage.records.filter((hit) => hit.record.kind === 'cultural-region')
              .length
          }
          {' · '}
          {t('person.aliveCount')}: {state.frame.persons.length}
          {' · '}
          {t('person.locationCount')}:{' '}
          {state.frame.coverage.records.filter((h) => h.record.kind === 'person-location').length}
          {' · '}
          {t('atlas.layer.war')}:{' '}
          {state.frame.events.filter((hit) => eventLayer(hit.record.eventType) === 'battle').length}
          {' · '}
          {t('atlas.layer.event')}:{' '}
          {state.frame.events.filter((hit) => eventLayer(hit.record.eventType) === 'event').length}
        </AppText>
      )}
    </View>
  );
}
