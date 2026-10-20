import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { openArticle } from '../sources/open-article';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
/** User gesture -> existing verified-sitelink service; no title-derived URLs. */
export function ArticleAction({ wikidataId }: { wikidataId: string }) {
  const request = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => () => request.current?.abort(), [wikidataId]);
  return (
    <View>
      <Action
        label={t(loading ? 'sources.articleLoading' : 'sources.wikipedia')}
        symbol="↗"
        disabled={loading}
        onPress={() => {
          request.current?.abort();
          const controller = new AbortController();
          request.current = controller;
          setLoading(true);
          setFailed(false);
          void openArticle(wikidataId, controller.signal)
            .catch(() => {
              if (!controller.signal.aborted) setFailed(true);
            })
            .finally(() => {
              if (!controller.signal.aborted) setLoading(false);
            });
        }}
      />
      {failed && <AppText accessibilityRole="alert">{t('pilot.linkError')}</AppText>}
    </View>
  );
}
