import { reserveArticleTab } from './article-tab';
import { navigateArticle } from './article-navigation';
import { sourceLinks } from './catalog';
import { liveSitelinks } from './live-sitelinks';
import { openExternal } from './external';
import { isQid } from './sitelinks';
import { historyArchive } from '../history/runtime';
export async function openArticle(id: string, signal: AbortSignal) {
  if (!isQid(id) || signal.aborted) throw new Error('ARTICLE_QID');
  const known = sourceLinks.resolve(id);
  if (known.snapshot && known.url) {
    await openExternal(known.url, known.kind === 'wikidata' ? 'wikidata' : 'wikipedia');
    return known;
  }
  const tab = reserveArticleTab();
  if (historyArchive.rowForQid(id)) {
    return navigateArticle(
      async () => {
        const snapshot = await historyArchive.sitelink(id, signal);
        if (!snapshot) return sourceLinks.resolve(id);
        const { createSitelinkResolver } = await import('./sitelinks');
        return createSitelinkResolver('history', [snapshot]).resolve(id);
      },
      tab,
      signal,
    );
  }
  return navigateArticle(() => liveSitelinks.resolve(id, signal), tab, signal);
}
