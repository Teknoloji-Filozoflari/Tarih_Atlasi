import type { SourceRecord } from './types.ts';
/** If a source cites an immutable upstream revision, its URL must cite that same revision. */
export function sourceURLMatchesRevision(
  source: Pick<SourceRecord, 'url' | 'revision' | 'wikidataId'>,
): boolean {
  try {
    const url = new URL(source.url);
    if (
      url.hostname === 'www.wikidata.org' ||
      source.wikidataId !== null ||
      url.searchParams.has('oldid')
    ) {
      if (
        url.hostname !== 'www.wikidata.org' ||
        url.pathname !== '/w/index.php' ||
        url.searchParams.getAll('oldid').length !== 1 ||
        url.searchParams.getAll('title').length !== 1 ||
        !/^[1-9]\d{0,15}$/.test(url.searchParams.get('oldid') ?? '') ||
        url.searchParams.get('oldid') !== source.revision ||
        !/^Q[1-9]\d{0,15}$/.test(url.searchParams.get('title') ?? '') ||
        (source.wikidataId !== null && source.wikidataId !== url.searchParams.get('title'))
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}
