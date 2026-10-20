import { useState } from 'react';
import { Platform, View } from 'react-native';
import type { SavedView } from '../discovery/view';
import { makeShareURL, shareView, copyShareURL } from '../discovery/sharing';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function SharePanel({ view, maxYear }: { view: SavedView; maxYear: number }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  let url: string | null = null;
  try {
    url = makeShareURL(view, maxYear);
  } catch {
    /* SSR/ineligible origin; no guessed deployment host. */
  }
  return (
    <View style={s.stack} testID="share-panel">
      <AppText>{t('share.notice')}</AppText>
      {url ? (
        <>
          <AppText selectable testID="share-url">
            {url}
          </AppText>
          {Platform.OS === 'web' && (
            <Action
              label={t('share.copy')}
              onPress={() => {
                setFailed(false);
                void copyShareURL(url!)
                  .then(() => setCopied(true))
                  .catch(() => setFailed(true));
              }}
            />
          )}
          <Action
            label={t('share.send')}
            onPress={() => {
              setFailed(false);
              void shareView(url!, t('app.name'))
                .then((action) => setCopied(action === 'copied'))
                .catch(() => setFailed(true));
            }}
          />
        </>
      ) : (
        <AppText accessibilityRole="alert">{t('share.unavailable')}</AppText>
      )}
      {copied && <AppText accessibilityLiveRegion="polite">{t('share.copied')}</AppText>}
      {failed && <AppText accessibilityRole="alert">{t('share.failed')}</AppText>}
    </View>
  );
}
