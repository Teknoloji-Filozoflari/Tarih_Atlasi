import type { VerifiedSitelink } from './types.ts';
/** Validate an explicit URL, never construct a Wikipedia slug from a name or QID. */
export function isWikipediaSitelink(link: Pick<VerifiedSitelink, 'site' | 'title' | 'url'>) {
  if (!/^[a-z]{2,3}(?:[-_][a-z0-9]+)*wiki$/u.test(link.site) || !link.title.trim()) return false;
  try {
    const url = new URL(link.url),
      language = link.site.slice(0, -4).replaceAll('_', '-');
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      url.hostname === `${language}.wikipedia.org` &&
      url.pathname.startsWith('/wiki/') &&
      url.pathname.length > 6 &&
      decodeURIComponent(url.pathname.slice(6)).replaceAll('_', ' ') ===
        link.title.replaceAll('_', ' ')
    );
  } catch {
    return false;
  }
}
/** ETL compares against the preserved, checksum-verified Wikidata entity JSON. */
export function matchesWikidataSitelink(raw: unknown, link: VerifiedSitelink) {
  if (!isWikipediaSitelink(link) || !raw || typeof raw !== 'object' || !('entities' in raw))
    return false;
  const entities = raw.entities;
  if (!entities || typeof entities !== 'object' || !(link.wikidataId in entities)) return false;
  const entity = (entities as Record<string, unknown>)[link.wikidataId];
  if (
    !entity ||
    typeof entity !== 'object' ||
    !('id' in entity) ||
    entity.id !== link.wikidataId ||
    !('sitelinks' in entity)
  )
    return false;
  const sites = entity.sitelinks;
  if (!sites || typeof sites !== 'object') return false;
  const site = (sites as Record<string, unknown>)[link.site];
  return (
    !!site &&
    typeof site === 'object' &&
    'title' in site &&
    'url' in site &&
    site.title === link.title &&
    site.url === link.url
  );
}
