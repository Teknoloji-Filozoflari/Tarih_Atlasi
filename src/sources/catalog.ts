import { createSitelinkResolver } from './sitelinks.ts';
import { reviewedSitelinks, sitelinkManifest } from './generated/sitelinks.ts';
import { liveSitelinks } from './live-sitelinks.ts';
import { historyLink } from '../history/link-cache.ts';
export { sitelinkManifest };
export { sourceNotices } from './generated/sitelinks.ts';
const pinnedLinks = createSitelinkResolver(sitelinkManifest.version, reviewedSitelinks);
export const sourceLinks = {
  ...pinnedLinks,
  resolve(id: string | null) {
    const pinned = pinnedLinks.resolve(id);
    return liveSitelinks.cached(id) ?? (pinned.snapshot ? pinned : (historyLink(id) ?? pinned));
  },
};
