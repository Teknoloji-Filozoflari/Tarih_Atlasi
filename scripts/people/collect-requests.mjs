import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { normalizeSearch } from '../../src/discovery/search.ts';
import { requestOutput } from './requests.mjs';
import { fetchPersonEntity } from '../etl/wikidata-persons.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const qid = (value) => typeof value === 'string' && /^Q[1-9]\d{0,15}$/u.test(value);
export function exactCandidates(results, request) {
  const names = new Set([request.name, ...request.aliases].map(normalizeSearch));
  return [
    ...new Set(
      results
        .filter(
          (r) =>
            qid(r.id) &&
            [r.label, r.match?.text, ...(r.aliases ?? [])].some(
              (n) => typeof n === 'string' && names.has(normalizeSearch(n)),
            ),
        )
        .map((r) => r.id),
    ),
  ];
}
export function inspectRequestedEntity(raw, id, request) {
  const e = raw?.entities?.[id];
  if (!qid(id) || e?.id !== id || !Number.isSafeInteger(e.lastrevid) || e.lastrevid < 1)
    throw new Error('REQUEST_ENTITY_REVISION');
  const human = (e.claims?.P31 ?? []).some(
    (s) => s.rank !== 'deprecated' && s.mainsnak?.datavalue?.value?.id === 'Q5',
  );
  const labels = [...Object.values(e.labels ?? {}), ...Object.values(e.aliases ?? {}).flat()].map(
    (l) => l.value,
  );
  const requested = new Set([request.name, ...request.aliases].map(normalizeSearch));
  const nameMatched = labels.some(
    (n) => typeof n === 'string' && requested.has(normalizeSearch(n)),
  );
  const places = [
    ...new Set(
      (e.claims?.P19 ?? [])
        .filter((s) => s.rank !== 'deprecated' && s.mainsnak?.snaktype === 'value')
        .map((s) => s.mainsnak.datavalue?.value?.id)
        .filter(qid),
    ),
  ];
  return {
    requestId: request.id,
    name: request.name,
    wikidataId: id,
    sourceRevision: String(e.lastrevid),
    human,
    nameMatched,
    placeIds: places,
    status: !human
      ? 'rejected-not-human'
      : !nameMatched
        ? 'identity-review-required'
        : 'source-review-required',
    // Exact identity is not an approval of P569/P19 qualifiers, region scale or historical coordinates.
    reviewStatus: 'unverified',
    productionApproved: false,
    geometry: null,
  };
}
export function parseCollectOptions(args) {
  const options = { limit: 25, delayMs: 1000, verify: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--verify') options.verify = true;
    else if (args[i] === '--limit') options.limit = Number(args[++i]);
    else if (args[i] === '--delay-ms') options.delayMs = Number(args[++i]);
    else throw new Error('REQUEST_COLLECT_ARGUMENT');
  }
  if (
    !Number.isInteger(options.limit) ||
    options.limit < 1 ||
    options.limit > 1000 ||
    !Number.isInteger(options.delayMs) ||
    options.delayMs < 1000 ||
    options.delayMs > 30000
  )
    throw new Error('REQUEST_COLLECT_BUDGET');
  return options;
}
export async function collectRequests(
  args = process.argv.slice(2),
  userAgent = process.env.WIKIDATA_USER_AGENT,
  dependencies = {},
) {
  const options = parseCollectOptions(args),
    registry = dependencies.registry ?? (await requestOutput());
  if (
    !options.verify &&
    (typeof userAgent !== 'string' ||
      userAgent.length > 240 ||
      !/^TarihAtlasi\/[\w.-]+ \([^\r\n]*(?:@|https?:\/\/)[^\r\n]+\)$/u.test(userAgent))
  )
    throw new Error(
      'WIKIDATA_USER_AGENT gerekli: TarihAtlasi/0.1.0 (gerçek iletişim adresiniz veya proje URL’niz)',
    );
  const root = dependencies.root ?? new URL('../../data/staging/people-requests/', import.meta.url);
  await mkdir(root, { recursive: true });
  const wait = dependencies.wait ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const fetcher = dependencies.fetcher ?? fetch;
  const cached = async (name) => {
    try {
      const data = await readFile(new URL(name + '.json', root));
      const receipt = JSON.parse(await readFile(new URL(name + '.receipt.json', root), 'utf8'));
      if (
        data.length > 4 * 1024 * 1024 ||
        receipt.bytes !== data.length ||
        receipt.sha256 !== hash(data) ||
        receipt.licenseId !== 'CC0-1.0'
      )
        throw new Error('REQUEST_CACHE_CORRUPT');
      return { text: data.toString('utf8'), receipt };
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  };
  const save = async (name, text, receipt) => {
    await writeFile(new URL(name + '.json', root), text);
    await writeFile(new URL(name + '.receipt.json', root), JSON.stringify(receipt, null, 2) + '\n');
  };
  let http = 0;
  const entity = async (id) => {
    const stored = await cached(id);
    if (stored) {
      const raw = JSON.parse(stored.text),
        value = raw.entities?.[id];
      const url = new URL(stored.receipt.sourceUrl);
      if (
        url.origin !== 'https://www.wikidata.org' ||
        url.pathname !== '/w/api.php' ||
        url.searchParams.get('action') !== 'wbgetentities' ||
        url.searchParams.get('ids') !== id ||
        value?.id !== id ||
        String(value.lastrevid) !== stored.receipt.sourceRevision
      )
        throw new Error('REQUEST_CACHE_REVISION');
      return raw;
    }
    if (options.verify) throw new Error('REQUEST_ENTITY_NOT_DOWNLOADED:' + id);
    await wait(options.delayMs);
    http++;
    const result = await fetchPersonEntity(id, { userAgent, fetcher, wait });
    await save(id, result.text, result.receipt);
    return JSON.parse(result.text);
  };
  const search = async (request, language) => {
    const key = request.id.replace(':', '-') + '-' + language;
    const stored = await cached(key);
    if (stored) {
      const url = new URL(stored.receipt.sourceUrl),
        result = JSON.parse(stored.text).search;
      if (
        url.origin !== 'https://www.wikidata.org' ||
        url.pathname !== '/w/api.php' ||
        url.searchParams.get('action') !== 'wbsearchentities' ||
        url.searchParams.get('search') !== request.name ||
        url.searchParams.get('language') !== language ||
        !Array.isArray(result) ||
        result.length > 5
      )
        throw new Error('REQUEST_SEARCH_CACHE_SCOPE');
      return result;
    }
    if (options.verify) throw new Error('REQUEST_SEARCH_NOT_DOWNLOADED:' + request.name);
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.search = new URLSearchParams({
      action: 'wbsearchentities',
      search: request.name,
      language,
      uselang: language,
      type: 'item',
      limit: '5',
      format: 'json',
      maxlag: '5',
    }).toString();
    for (let attempt = 0; attempt < 3; attempt++) {
      await wait(options.delayMs * 2 ** attempt);
      http++;
      const response = await fetcher(url, {
        headers: { 'User-Agent': userAgent, Accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
      });
      if ([429, 503].includes(response.status)) {
        const value = response.headers.get('retry-after');
        const delay =
          value === null
            ? 0
            : /^\d+(?:\.\d+)?$/u.test(value)
              ? Number(value) * 1000
              : Math.max(0, Date.parse(value) - Date.now());
        await response.body?.cancel();
        if (!Number.isFinite(delay) || delay > 30000 || attempt === 2)
          throw new Error('REQUEST_RETRY_LATER');
        await wait(delay);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error('REQUEST_HTTP_' + response.status);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('REQUEST_SEARCH_BODY');
      const chunks = [];
      let bytes = 0;
      try {
        for (;;) {
          const next = await reader.read();
          if (next.done) break;
          bytes += next.value.length;
          if (bytes > 256 * 1024) throw new Error('REQUEST_SEARCH_SIZE');
          chunks.push(next.value);
        }
      } catch (error) {
        await reader.cancel();
        throw error;
      } finally {
        reader.releaseLock();
      }
      const text = Buffer.concat(chunks).toString('utf8'),
        raw = JSON.parse(text);
      if (raw.error?.code === 'maxlag' && attempt < 2) {
        await wait(5000);
        continue;
      }
      if (!Array.isArray(raw.search) || raw.search.length > 5)
        throw new Error('REQUEST_SEARCH_SCHEMA');
      await save(key, text, {
        fetchedAt: Date.now(),
        sha256: hash(Buffer.from(text)),
        bytes: Buffer.byteLength(text),
        sourceUrl: url.toString(),
        licenseId: 'CC0-1.0',
      });
      return raw.search;
    }
    throw new Error('REQUEST_SEARCH_RETRIES');
  };
  const results = [];
  let handled = 0;
  for (const request of registry.records.filter(
    (r) => r.kind === 'person' && r.status !== 'published',
  )) {
    const resultFile = new URL(request.id.replace(':', '-') + '.review.json', root);
    // Resume by completed, source-bound per-request decisions; nothing is silently published.
    try {
      const prior = JSON.parse(await readFile(resultFile, 'utf8'));
      if (prior.inputSha256 === registry.inputSha256 && prior.productionApproved === false) {
        if (options.verify) {
          if (prior.wikidataId) {
            const checked = inspectRequestedEntity(
              await entity(prior.wikidataId),
              prior.wikidataId,
              request,
            );
            for (const id of checked.placeIds.slice(0, 4)) await entity(id);
          } else {
            await search(request, 'tr');
            await search(request, 'en');
          }
        }
        results.push(prior);
        continue;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (handled >= options.limit) break;
    const candidates = request.wikidataId
      ? [request.wikidataId]
      : exactCandidates(
          [...(await search(request, 'tr')), ...(await search(request, 'en'))],
          request,
        );
    let decision;
    if (candidates.length !== 1)
      decision = {
        requestId: request.id,
        name: request.name,
        status: candidates.length ? 'ambiguous-candidates' : 'no-exact-identity-match',
        candidates,
        productionApproved: false,
        geometry: null,
      };
    else {
      decision = inspectRequestedEntity(await entity(candidates[0]), candidates[0], request);
      if (decision.human && decision.nameMatched)
        for (const id of decision.placeIds.slice(0, 4)) await entity(id);
      if (decision.placeIds.length > 4) decision.status = 'too-many-birthplaces-review-required';
    }
    decision.inputSha256 = registry.inputSha256;
    await writeFile(resultFile, JSON.stringify(decision, null, 2) + '\n');
    results.push(decision);
    handled++;
    console.log(`${request.name}: ${decision.status}; UNVERIFIED; productionApproved=false`);
  }
  const report = {
    version: 1,
    inputSha256: registry.inputSha256,
    completed: results.length,
    newlyHandled: handled,
    httpRequests: http,
    productionApproved: false,
    results,
  };
  await writeFile(new URL('collection-report.json', root), JSON.stringify(report, null, 2) + '\n');
  return report;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await collectRequests();
    console.log(
      JSON.stringify({
        completed: result.completed,
        newlyHandled: result.newlyHandled,
        httpRequests: result.httpRequests,
        productionApproved: false,
      }),
    );
  } catch (error) {
    console.error(error.cause?.code ?? error.message);
    process.exitCode = 1;
  }
}
