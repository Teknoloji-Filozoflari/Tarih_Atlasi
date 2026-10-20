import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { isQid, parseSitelinkSnapshot } from '../../src/sources/sitelinks.ts';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const MAX_BYTES = 262144;
/** API data remains a candidate. A redirect is an identity change, never auto-followed. */
export function sitelinkCandidate(raw, id, now) {
  const entity = raw?.entities?.[id];
  if (
    !isQid(id) ||
    entity?.id !== id ||
    'missing' in entity ||
    entity.redirects ||
    raw.redirects ||
    !Number.isSafeInteger(entity.lastrevid) ||
    entity.lastrevid < 1 ||
    !entity.sitelinks ||
    typeof entity.sitelinks !== 'object'
  )
    throw new Error('SITELINK_ENTITY_CHANGED_OR_MISSING');
  const snapshot = {
    wikidataId: id,
    revision: String(entity.lastrevid),
    sourceUrl: `https://www.wikidata.org/w/index.php?title=${id}&oldid=${entity.lastrevid}`,
    verifiedAt: new Date(now).toISOString().replace(/\.\d{3}Z$/, 'Z'),
    reviewStatus: 'verified',
    representation: 'wikidata-api-extraction',
    licenseId: 'CC0-1.0',
    attribution: 'Wikidata contributors — structured sitelinks (CC0).',
    sitelinks: ['trwiki', 'enwiki'].flatMap((site) => {
      const value = entity.sitelinks[site];
      return value ? [{ site, title: value.title, url: value.url }] : [];
    }),
  };
  if (!parseSitelinkSnapshot(snapshot)) throw new Error('SITELINK_API_SCHEMA');
  return { ...snapshot, reviewStatus: 'unverified', productionApproved: false };
}
/** Caller serializes IDs. Three attempts, 15s each, 256KiB, Retry-After <=30s. */
export async function fetchSitelinkCandidate(
  id,
  {
    userAgent,
    fetcher = fetch,
    now = Date.now(),
    cached = null,
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = {},
) {
  if (
    !isQid(id) ||
    typeof userAgent !== 'string' ||
    userAgent.length > 240 ||
    !/^TarihAtlasi\/[\w.-]+ \([^\r\n]*(?:@|https?:\/\/)[^\r\n]+\)$/.test(userAgent)
  )
    throw new Error('SITELINK_ID_OR_CONTACT_USER_AGENT');
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'wbgetentities',
    ids: id,
    props: 'info|sitelinks/urls',
    sitefilter: 'trwiki|enwiki',
    format: 'json',
    maxlag: '5',
  }).toString();
  const cacheKey = `sitelinks-v1/${id}/trwiki-enwiki`;
  if (
    cached &&
    cached.id === id &&
    Number.isFinite(cached.receipt?.fetchedAt) &&
    now >= cached.receipt.fetchedAt &&
    now - cached.receipt.fetchedAt < 86400000
  ) {
    if (
      cached.receipt.cacheKey !== cacheKey ||
      cached.receipt.sourceUrl !== url.href ||
      cached.receipt.licenseId !== 'CC0-1.0'
    )
      throw new Error('SITELINK_CACHE_IDENTITY');
    const bytes = Buffer.from(cached.text, 'utf8');
    if (
      bytes.length > MAX_BYTES ||
      bytes.length !== cached.receipt.bytes ||
      digest(bytes) !== cached.receipt.sha256
    )
      throw new Error('SITELINK_CACHE_CHECKSUM');
    const candidate = sitelinkCandidate(JSON.parse(cached.text), id, cached.receipt.fetchedAt);
    if (candidate.revision !== cached.receipt.sourceRevision)
      throw new Error('SITELINK_CACHE_REVISION');
    return { ...cached, candidate, cacheHit: true };
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await fetcher(url, {
        headers: { 'User-Agent': userAgent, Accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      if (attempt === 2) throw new Error('SITELINK_NETWORK_OR_TIMEOUT');
      await wait(1000 * 2 ** attempt);
      continue;
    }
    const retry = response.headers.get('retry-after');
    const delay =
      retry === null
        ? 1000 * 2 ** attempt
        : /^\d+(?:\.\d+)?$/.test(retry)
          ? Number(retry) * 1000
          : Math.max(0, Date.parse(retry) - now);
    if (!Number.isFinite(delay) || delay > 30000) {
      await response.body?.cancel();
      throw new Error('SITELINK_RETRY_DEFER');
    }
    if ([429, 503].includes(response.status)) {
      await response.body?.cancel();
      if (attempt === 2) throw new Error('SITELINK_RETRY_BUDGET');
      await wait(delay);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error('SITELINK_HTTP');
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('SITELINK_BODY');
    const chunks = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > MAX_BYTES) throw new Error('SITELINK_SIZE');
        chunks.push(value);
      }
    } catch (error) {
      await reader.cancel();
      throw error;
    } finally {
      reader.releaseLock();
    }
    const bytes = Buffer.concat(chunks),
      text = bytes.toString('utf8'),
      raw = JSON.parse(text);
    if (raw.error?.code === 'maxlag') {
      if (attempt === 2) throw new Error('SITELINK_MAXLAG');
      await wait(Math.max(5000, delay));
      continue;
    }
    if (raw.error) throw new Error('SITELINK_API');
    const candidate = sitelinkCandidate(raw, id, now);
    return {
      id,
      text,
      candidate,
      cacheHit: false,
      receipt: {
        cacheKey,
        fetchedAt: now,
        sha256: digest(bytes),
        bytes: bytes.length,
        sourceRevision: candidate.revision,
        sourceUrl: url.href,
        licenseId: 'CC0-1.0',
      },
    };
  }
  throw new Error('SITELINK_RETRY_BUDGET');
}
