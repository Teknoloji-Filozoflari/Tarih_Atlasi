import { geographyWithheld, publicationReview } from '../data/publication-policy';
import { SourceDetails } from './SourceDetails';
import { UncertaintyDetails } from './UncertaintyDetails';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { pilotSources } from '../data/application';
import { sourceLinks } from '../sources/catalog';
import { openExternal } from '../sources/external';
import { openArticle } from '../sources/open-article';
import type { ExternalPurpose } from '../sources/url-policy';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
type Detail = Awaited<ReturnType<NonNullable<typeof pilotSources>['detail']>>;
/** Stays inside the existing sheet: no navigation, second WebView or camera mutation. */
export function SourceActions({
  recordIds,
  wikidataId,
  allowArticleLookup = false,
  compact = false,
  articleOnly = false,
}: {
  recordIds: readonly string[];
  wikidataId: string | null;
  allowArticleLookup?: boolean;
  compact?: boolean;
  articleOnly?: boolean;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [uncertaintyOpen, setUncertaintyOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const articleLoading = !!wikidataId && loadingId === wikidataId;
  const articleRequest = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => articleRequest.current?.abort();
  }, [wikidataId]);
  const [value, setValue] = useState<{ key: string; detail: Detail | null } | null>(null);
  const key = JSON.stringify(recordIds);
  const load = sourcesOpen || uncertaintyOpen;
  useEffect(() => {
    if (!load) return;
    let active = true;
    void (pilotSources?.detail(JSON.parse(key) as string[]) ?? Promise.resolve(null))
      .then((detail) => {
        if (active) setValue({ key, detail });
      })
      .catch(() => {
        if (active) setValue({ key, detail: null });
      });
    return () => {
      active = false;
    };
  }, [key, load]);
  const result = sourceLinks.resolve(wikidataId);
  const wikipedia = result.kind === 'trwiki' || result.kind === 'enwiki';
  const open = (url: string, purpose: ExternalPurpose) => {
    setFailed(false);
    void openExternal(url, purpose).catch(() => setFailed(true));
  };
  const detail = value?.key === key ? value.detail : undefined;
  return (
    <View style={s.stack} testID="source-actions">
      {recordIds.some(geographyWithheld) && (
        <View style={s.stack}>
          <AppText accessibilityRole="alert">{t('qa.withheld')}</AppText>
          <Action
            label={t('qa.reviewSource')}
            symbol="↗"
            onPress={() => open(publicationReview.reference, 'source')}
          />
        </View>
      )}
      {wikipedia && result.url && (
        <Action
          label={`${t('sources.wikipedia')} (${result.kind === 'trwiki' ? 'TR' : 'EN'})`}
          symbol="↗"
          onPress={() => open(result.url!, 'wikipedia')}
        />
      )}
      {!wikipedia && allowArticleLookup && wikidataId && (
        <Action
          label={t(
            articleLoading
              ? 'sources.articleLoading'
              : compact
                ? 'sources.wikipedia'
                : 'sources.articleLookup',
          )}
          symbol="↗"
          disabled={articleLoading}
          onPress={() => {
            const request = new AbortController();
            articleRequest.current?.abort();
            articleRequest.current = request;
            setLoadingId(wikidataId);
            setFailed(false);
            void openArticle(wikidataId, request.signal)
              .catch(() => {
                if (!request.signal.aborted) setFailed(true);
              })
              .finally(() => {
                if (!request.signal.aborted) setLoadingId(null);
              });
          }}
        />
      )}
      {allowArticleLookup && wikidataId && (!compact || sourcesOpen) && (
        <AppText muted variant="small">
          {t('sources.articleIdentity')}
        </AppText>
      )}
      {(!compact || sourcesOpen || !wikidataId) && (
        <AppText muted>
          {t(
            wikipedia
              ? result.kind === 'trwiki'
                ? 'sources.tr'
                : 'sources.en'
              : result.reason === 'no-id'
                ? 'sources.noId'
                : result.reason === 'missing-languages'
                  ? 'sources.missingLanguages'
                  : 'sources.notReviewed',
          )}
        </AppText>
      )}
      {result.wikidataId && (!compact || sourcesOpen || failed) && (
        <Action
          label={`${t('sources.wikidata')} (${result.wikidataId})`}
          symbol="↗"
          onPress={() => open(`https://www.wikidata.org/wiki/${result.wikidataId}`, 'wikidata')}
        />
      )}
      {!articleOnly && (
        <View style={s.row}>
          <Action
            label={t('sources.show')}
            selected={sourcesOpen}
            symbol={sourcesOpen ? '−' : '+'}
            onPress={() => setSourcesOpen(!sourcesOpen)}
          />
          <Action
            label={t('sources.uncertainty')}
            selected={uncertaintyOpen}
            symbol={uncertaintyOpen ? '−' : '+'}
            onPress={() => setUncertaintyOpen(!uncertaintyOpen)}
          />
        </View>
      )}
      {load && detail === undefined && (
        <AppText accessibilityLiveRegion="polite">{t('state.loading.title')}</AppText>
      )}
      {load && detail === null && (
        <AppText accessibilityRole="alert">{t('sources.loadError')}</AppText>
      )}
      {sourcesOpen && detail && <SourceDetails detail={detail} result={result} open={open} />}
      {uncertaintyOpen && detail && <UncertaintyDetails detail={detail} />}
      {failed && <AppText accessibilityRole="alert">{t('sources.openError')}</AppText>}
      {(!compact || sourcesOpen) && (
        <AppText muted variant="small">
          {t('sources.externalNotice')}
        </AppText>
      )}
    </View>
  );
}
