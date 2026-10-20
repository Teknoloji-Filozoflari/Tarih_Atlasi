export type ExternalPurpose = 'wikipedia' | 'wikidata' | 'source';
const sourceHosts = new Set([
  'archive.artic.edu',
  'www.archives.gov',
  'www.wikidata.org',
  'www.naturalearthdata.com',
  'naturalearthdata.com',
  'www.openhistoricalmap.org',
  'wiki.openhistoricalmap.org',
  'creativecommons.org',
]);
/** Reject before URL normalization, then require an exact approved HTTPS host. */
export function externalURL(raw: string, purpose: ExternalPurpose): string | null {
  if (
    typeof raw !== 'string' ||
    raw.length > 2048 ||
    !raw.startsWith('https://') ||
    /[\s\\\u0000-\u001f\u007f]/u.test(raw) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|7f|5c|2f|2e)/iu.test(raw) ||
    /\/\.{1,2}(?:\/|$)/u.test(raw)
  )
    return null;
  try {
    const url = new URL(raw);
    // Explicit port 443 is normalized away; reject it in the authority as well.
    if (url.username || url.password || url.port || raw.split('/')[2]?.includes(':')) return null;
    if (purpose === 'wikipedia') {
      if (
        !['tr.wikipedia.org', 'en.wikipedia.org'].includes(url.hostname) ||
        !url.pathname.startsWith('/wiki/') ||
        url.pathname.length <= 6 ||
        url.search ||
        url.hash ||
        /[\u0000-\u001f\u007f]/u.test(decodeURIComponent(url.pathname))
      )
        return null;
    } else if (purpose === 'wikidata') {
      if (
        url.hostname !== 'www.wikidata.org' ||
        !/^\/wiki\/Q[1-9]\d{0,15}$/u.test(url.pathname) ||
        url.search ||
        url.hash
      )
        return null;
    } else if (url.hostname === 'www.geonames.org') {
      if (!/^\/[1-9]\d{0,9}\/$/u.test(url.pathname) || url.search || url.hash) return null;
    } else if (url.hostname === 'github.com') {
      if (
        !/^\/Seshat-Global-History-Databank\/cliopatria\/(?:blob|tree)\/v0\.2\.1(?:\/cliopatria\.geojson\.zip)?$/u.test(
          url.pathname,
        ) ||
        url.search ||
        url.hash
      )
        return null;
    } else if (!sourceHosts.has(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}
export async function openCheckedExternal(
  raw: string,
  purpose: ExternalPurpose,
  opener: (url: string) => void | Promise<unknown>,
): Promise<void> {
  const url = externalURL(raw, purpose);
  if (!url) throw new Error('EXTERNAL_URL_REJECTED');
  // Invoke synchronously within the click; awaiting first would lose browser activation.
  await opener(url);
}
