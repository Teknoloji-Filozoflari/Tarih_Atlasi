import {
  createSitelinkResolver,
  isQid,
  parseSitelinkSnapshot,
  type SitelinkResolution,
} from './sitelinks.ts';

const MAX_BYTES = 262144,
  TTL = 24 * 60 * 60 * 1000;
/** User-initiated link lookup only. No map coordinates, names or searches are sent.
 * This authenticates a QID→sitelink response, not historical borders/identity claims.
 */
export function createLiveSitelinkClient({
  fetcher = fetch,
  now = Date.now,
}: { fetcher?: typeof fetch; now?: () => number } = {}) {
  const cache = new Map<string, { expires: number; value: SitelinkResolution }>();
  let active = false,
    blockedUntil = 0;
  const cached = (id: string | null) => {
    if (!isQid(id)) return null;
    const entry = cache.get(id);
    if (!entry || entry.expires <= now()) {
      cache.delete(id);
      return null;
    }
    cache.delete(id);
    cache.set(id, entry);
    return entry.value;
  };
  return {
    cached,
    async resolve(id: string, signal: AbortSignal): Promise<SitelinkResolution> {
      if (!isQid(id)) throw new Error('ARTICLE_QID');
      if (signal.aborted) throw new Error('ARTICLE_ABORTED');
      const saved = cached(id);
      if (saved) return saved;
      if (active || now() < blockedUntil) throw new Error('ARTICLE_RATE_LIMIT');
      active = true;
      blockedUntil = now() + 1000;
      const controller = new AbortController(),
        abort = () => controller.abort();
      signal.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(abort, 8000);
      let response: Response | undefined;
      try {
        const url = new URL('https://www.wikidata.org/w/api.php');
        for (const [k, v] of Object.entries({
          action: 'wbgetentities',
          ids: id,
          props: 'info|sitelinks/urls',
          sitefilter: 'trwiki|enwiki',
          format: 'json',
          origin: '*',
          maxlag: '5',
        }))
          url.searchParams.set(k, v);
        response = await fetcher(url.href, {
          method: 'GET',
          signal: controller.signal,
          credentials: 'omit',
          redirect: 'error',
          referrerPolicy: 'no-referrer',
          headers: {
            Accept: 'application/json',
            'Api-User-Agent': 'TarihAtlasi/0.1 (user-initiated sitelink lookup)',
          },
        });
        if (response.status === 429 || response.status === 503) {
          const retry = response.headers.get('retry-after') ?? '';
          const delay = /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - now();
          // Never retry automatically; a delay beyond one day defers this session.
          blockedUntil =
            Number.isFinite(delay) && delay > 86400000
              ? Infinity
              : now() + Math.max(10000, Number.isFinite(delay) ? delay : 10000);
          throw new Error('ARTICLE_RATE_LIMIT');
        }
        if (
          !response.ok ||
          response.redirected ||
          (response.url && response.url !== url.href) ||
          !response.headers.get('content-type')?.includes('application/json')
        )
          throw new Error('ARTICLE_RESPONSE');
        if (Number(response.headers.get('content-length')) > MAX_BYTES)
          throw new Error('ARTICLE_SIZE');
        let text = '';
        if (response.body?.getReader) {
          const reader = response.body.getReader(),
            decoder = new TextDecoder('utf-8', { fatal: true });
          let bytes = 0;
          try {
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              if ((bytes += value.byteLength) > MAX_BYTES) throw new Error('ARTICLE_SIZE');
              text += decoder.decode(value, { stream: true });
            }
            text += decoder.decode();
          } finally {
            await reader.cancel().catch(() => {});
          }
        } else {
          text = await response.text();
          // RN fetch has no streaming body on some runtimes. Bound before parse;
          // native transport memory still requires real-device verification.
          if (
            text.length > MAX_BYTES ||
            Array.from(text).reduce(
              (n, c) =>
                n +
                (c.codePointAt(0)! < 128
                  ? 1
                  : c.codePointAt(0)! < 2048
                    ? 2
                    : c.codePointAt(0)! < 65536
                      ? 3
                      : 4),
              0,
            ) > MAX_BYTES
          )
            throw new Error('ARTICLE_SIZE');
        }
        if (signal.aborted || controller.signal.aborted) throw new Error('ARTICLE_ABORTED');
        const raw = JSON.parse(text),
          entity = raw?.entities?.[id];
        if (
          raw.error ||
          raw.redirects ||
          !entity ||
          entity.id !== id ||
          'missing' in entity ||
          entity.redirects ||
          !Number.isSafeInteger(entity.lastrevid) ||
          entity.lastrevid < 1 ||
          !entity.sitelinks ||
          typeof entity.sitelinks !== 'object' ||
          Array.isArray(entity.sitelinks)
        )
          throw new Error('ARTICLE_ENTITY');
        const snapshot = parseSitelinkSnapshot({
          wikidataId: id,
          revision: String(entity.lastrevid),
          sourceUrl: `https://www.wikidata.org/w/index.php?title=${id}&oldid=${entity.lastrevid}`,
          verifiedAt: new Date(now()).toISOString().replace(/\.\d{3}Z$/, 'Z'),
          reviewStatus: 'verified',
          representation: 'wikidata-api-extraction',
          licenseId: 'CC0-1.0',
          attribution:
            'Wikidata contributors — user-requested structured sitelinks (CC0); no article text or images.',
          sitelinks: ['trwiki', 'enwiki'].flatMap((site) =>
            Object.hasOwn(entity.sitelinks, site)
              ? [{ site, title: entity.sitelinks[site]?.title, url: entity.sitelinks[site]?.url }]
              : [],
          ),
        });
        if (!snapshot) throw new Error('ARTICLE_SITELINK');
        const value = createSitelinkResolver(`live-${snapshot.revision}`, [snapshot]).resolve(id);
        if (signal.aborted) throw new Error('ARTICLE_ABORTED');
        cache.set(id, { expires: now() + TTL, value });
        if (cache.size > 128) cache.delete(cache.keys().next().value!);
        return value;
      } finally {
        if (response?.body && !response.body.locked) await response.body.cancel().catch(() => {});
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        active = false;
      }
    },
    clear() {
      cache.clear();
    },
  };
}
export const liveSitelinks = createLiveSitelinkClient();
