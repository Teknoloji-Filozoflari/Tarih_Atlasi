import { t } from '../i18n/index.ts';
import { externalURL } from './url-policy.ts';
import type { ArticleTab } from './article-navigation.ts';
export function reserveArticleTab(): ArticleTab {
  // Empty same-origin tab: immediately sever opener before any asynchronous work.
  const tab = window.open('about:blank', '_blank');
  if (!tab) throw new Error('ARTICLE_POPUP_BLOCKED');
  tab.opener = null;
  const meta = tab.document.createElement('meta');
  meta.name = 'referrer';
  meta.content = 'no-referrer';
  tab.document.head.appendChild(meta);
  tab.document.title = t('sources.articleLoading');
  tab.document.body.textContent = t('sources.articleLoading');
  return {
    navigate(url) {
      if (!externalURL(url, 'wikipedia') && !externalURL(url, 'wikidata'))
        throw new Error('ARTICLE_URL');
      if (tab.closed) throw new Error('ARTICLE_TAB_CLOSED');
      tab.location.replace(url);
    },
    close() {
      tab.close();
    },
  };
}
