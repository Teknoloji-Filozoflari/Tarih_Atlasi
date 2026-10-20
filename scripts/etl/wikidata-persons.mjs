import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
export const PERSON_IMPORT_VERSION = '1.0.0';
const MAX_BYTES = 4 * 1024 * 1024;
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const qid = (id) => typeof id === 'string' && /^Q[1-9]\d{0,15}$/.test(id);
export function personCandidates(raw, id) {
  const entity = raw?.entities?.[id];
  if (
    !qid(id) ||
    entity?.id !== id ||
    !Number.isSafeInteger(entity.lastrevid) ||
    entity.lastrevid <= 0 ||
    !entity.claims ||
    typeof entity.claims !== 'object'
  )
    throw new Error('WIKIDATA_ENTITY');
  const properties = ['P19', 'P20', 'P551', 'P937'];
  const links = properties.flatMap((property) =>
    (entity.claims[property] ?? []).map((statement) => ({
      property,
      statement, // Retain qualifiers, rank, GUID and all references without flattening.
      candidateRelationship: { P19: 'BIRTH', P20: 'DEATH', P551: 'RESIDENCE', P937: 'WORK' }[
        property
      ],
      annualPresenceApproved: false,
      reviewStatus: 'unverified',
      reason:
        'Property alone is not a dated presence claim. Review P580/P582/P585, source, place scale, coordinates and contradictions; never join lifetime as presence evidence.',
    })),
  );
  return {
    version: PERSON_IMPORT_VERSION,
    kind: 'person-import-review',
    wikidataId: id,
    sourceRevision: String(entity.lastrevid),
    reviewStatus: 'unverified',
    productionApproved: false,
    names: entity.labels ?? {},
    alternativeNames: entity.aliases ?? {},
    descriptions: entity.descriptions ?? {},
    life: { birth: entity.claims.P569 ?? [], death: entity.claims.P570 ?? [] },
    occupations: entity.claims.P106 ?? [],
    sitelinks: entity.sitelinks ?? {},
    locations: links,
    imageCandidates: entity.claims.P18 ?? [],
    mediaApproved: false,
    geometry: null,
  };
}
/** One request at a time, maximum three attempts. Cache bytes must match their receipt. */
export async function fetchPersonEntity(
  id,
  {
    userAgent,
    fetcher = fetch,
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    cached = null,
    now = Date.now(),
  } = {},
) {
  if (
    !qid(id) ||
    typeof userAgent !== 'string' ||
    userAgent.length > 240 ||
    !/^TarihAtlasi\/[\w.-]+ \([^\r\n]*(?:@|https?:\/\/)[^\r\n]+\)$/.test(userAgent)
  )
    throw new Error('WIKIDATA_ID_OR_CONTACT_USER_AGENT');
  if (
    cached &&
    cached.id === id &&
    Number.isFinite(cached.receipt?.fetchedAt) &&
    now >= cached.receipt.fetchedAt &&
    now - cached.receipt.fetchedAt < 86400000
  ) {
    const bytes = Buffer.from(cached.text, 'utf8');
    if (
      bytes.length > MAX_BYTES ||
      bytes.length !== cached.receipt.bytes ||
      digest(bytes) !== cached.receipt.sha256
    )
      throw new Error('WIKIDATA_CACHE_CHECKSUM');
    const raw = JSON.parse(cached.text);
    const candidates = personCandidates(raw, id);
    if (cached.receipt.sourceRevision !== candidates.sourceRevision)
      throw new Error('WIKIDATA_CACHE_REVISION');
    return { ...cached, candidates, cacheHit: true };
  }
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'wbgetentities',
    ids: id,
    props: 'info|labels|aliases|descriptions|claims|sitelinks/urls',
    languages: 'tr|en',
    format: 'json',
    maxlag: '5',
  }).toString();
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetcher(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate',
      },
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    const retryAfter = response.headers.get('retry-after');
    const delay =
      retryAfter === null
        ? 1000 * 2 ** attempt
        : /^\d+(?:\.\d+)?$/.test(retryAfter)
          ? Number(retryAfter) * 1000
          : Math.max(0, Date.parse(retryAfter) - now);
    if (!Number.isFinite(delay) || delay > 30000) throw new Error('WIKIDATA_RETRY_AFTER_DEFER');
    if ([429, 503].includes(response.status)) {
      await response.body?.cancel();
      if (attempt === 2) throw new Error('WIKIDATA_RETRY_BUDGET');
      await wait(delay);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`WIKIDATA_HTTP_${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('WIKIDATA_BODY');
    const chunks = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > MAX_BYTES) throw new Error('WIKIDATA_SIZE');
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
      if (attempt === 2) throw new Error('WIKIDATA_MAXLAG');
      await wait(Math.max(5000, delay));
      continue;
    }
    if (raw.error) throw new Error('WIKIDATA_API_ERROR');
    const candidates = personCandidates(raw, id);
    return {
      id,
      text,
      candidates,
      receipt: {
        fetchedAt: now,
        sha256: digest(bytes),
        bytes: bytes.length,
        sourceUrl: url.toString(),
        sourceRevision: candidates.sourceRevision,
        licenseId: 'CC0-1.0',
        userAgent,
      },
      cacheHit: false,
    };
  }
  throw new Error('WIKIDATA_RETRY_BUDGET');
}
