import { openExternal } from './external.native';
import type { ArticleTab } from './article-navigation';
export function reserveArticleTab(): ArticleTab {
  return {
    navigate: (url) =>
      openExternal(url, url.startsWith('https://www.wikidata.org/') ? 'wikidata' : 'wikipedia'),
    close: () => {},
  };
}
