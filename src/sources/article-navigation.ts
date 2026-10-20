import type { SitelinkResolution } from './sitelinks.ts';
import { externalURL } from './url-policy.ts';
export interface ArticleTab {
  navigate: (url: string) => void | Promise<unknown>;
  close: () => void;
}
/** Tab is reserved synchronously by web; native needs no reserved browser tab. */
export async function navigateArticle(
  resolve: () => Promise<SitelinkResolution>,
  tab: ArticleTab,
  signal: AbortSignal,
) {
  try {
    const result = await resolve();
    if (signal.aborted) throw new Error('ARTICLE_ABORTED');
    const purpose = result.kind === 'trwiki' || result.kind === 'enwiki' ? 'wikipedia' : 'wikidata';
    if (!result.url || !externalURL(result.url, purpose)) throw new Error('ARTICLE_URL');
    await tab.navigate(result.url);
    return result;
  } catch (error) {
    tab.close();
    throw error;
  }
}
