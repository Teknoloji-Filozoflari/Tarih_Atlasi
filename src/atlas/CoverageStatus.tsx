import type { DataLoadStatus } from '../data/chunks/runtime-core';
import { View } from 'react-native';
import type { CoverageReport } from '../timeline/engine';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { yearLabel } from './TimelineBar';
import { Action } from './Action';
import { atlasStyles as s } from './styles';

export function CoverageStatus({
  year,
  report,
  failed,
  preview,
  onPreview,
  layerHidden,
  onRetry,
  dataStatus,
}: {
  year: number;
  report: CoverageReport | null;
  failed: boolean;
  preview: boolean;
  onPreview: (enabled: boolean) => void;
  layerHidden: boolean;
  onRetry?: () => void;
  dataStatus?: DataLoadStatus | undefined;
}) {
  const mode = report?.selectedYearMode;
  return (
    <View style={s.stack} testID="timeline-coverage">
      <AppText variant="small" accessibilityLiveRegion="polite" testID="historical-coverage">
        {failed
          ? t('timeline.error')
          : !report
            ? t('timeline.loading')
            : mode === 'exact verified'
              ? t('timeline.exact')
              : mode === 'documented approximate'
                ? t('timeline.approximate')
                : t('timeline.unsupported')}
      </AppText>
      <AppText variant="small" muted>
        {t('timeline.selected')} {yearLabel(year)}
      </AppText>
      {report?.politicalCoverage && (
        <AppText variant="small" testID="world-coverage">
          {t('world.coverage')} {report.politicalCoverage.total} / {report.politicalCoverage.drawn}{' '}
          / {report.politicalCoverage.withheld}
        </AppText>
      )}
      {year > 2024 && report?.politicalCoverage && (
        <AppText muted variant="small">
          {t('world.sourceEnd')}
        </AppText>
      )}
      {report?.isPreview && report.sourceYear !== null && (
        <AppText testID="snapshot-preview-label" accessibilityLiveRegion="polite">
          {t('timeline.preview.active')} {yearLabel(report.sourceYear)}.{' '}
          {t('timeline.preview.warning')}
        </AppText>
      )}
      {failed && onRetry && <Action label={t('performance.retry')} onPress={onRetry} />}
      {dataStatus && dataStatus.chunks > 0 && (
        <AppText variant="small" testID="data-load-status">
          {t('performance.dataOrigin')}{' '}
          {dataStatus.origins.map((origin) => t(`performance.origin.${origin}`)).join(' · ')} ·{' '}
          {dataStatus.catalogVersion}
          {dataStatus.cacheWarning ? ` · ${t('performance.cacheWarning')}` : ''}
        </AppText>
      )}
      {layerHidden && <AppText variant="small">{t('timeline.layersHidden')}</AppText>}
      {report && (
        <AppText variant="small" muted>
          {t('timeline.partial')}
        </AppText>
      )}
      {preview && <Action label={t('timeline.preview.stop')} onPress={() => onPreview(false)} />}
      {!preview && report && mode === 'no supported historical geography' && !layerHidden && (
        <Action label={t('timeline.preview.start')} onPress={() => onPreview(true)} />
      )}
      {preview && report && !report.records.length && (
        <AppText>{t('timeline.preview.empty')}</AppText>
      )}
    </View>
  );
}
