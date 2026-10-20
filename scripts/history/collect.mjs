import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const isQid = (q) => typeof q === 'string' && /^Q[1-9]\d{0,15}$/.test(q);
export const groups = Object.freeze({
  nobel:
    'VALUES ?award { wd:Q38104 wd:Q44585 wd:Q80061 wd:Q37922 wd:Q35637 wd:Q47170 } ?item wdt:P166 ?award .',
  time: '?item wdt:P166 wd:Q207826 .',
  scientists: '?item wdt:P31 wd:Q5; wdt:P106/wdt:P279* wd:Q901 .',
  philosophers: '?item wdt:P31 wd:Q5; wdt:P106/wdt:P279* wd:Q4964182 .',
  politicians: '?item wdt:P31 wd:Q5; wdt:P106/wdt:P279* wd:Q82955 .',
  religious: '?item wdt:P31 wd:Q5; wdt:P106/wdt:P279* wd:Q2259532 .',
  people: '?item wdt:P31 wd:Q5; wikibase:sitelinks ?links . FILTER(?links >= 40)',
  battles: '?item wdt:P31/wdt:P279* wd:Q178561 .',
  wars: '?item wdt:P31/wdt:P279* wd:Q198 .',
  events: '?item wdt:P31/wdt:P279* wd:Q13418847 .',
});
export function discoveryQuery(group, cursor = null, pageSize = 50) {
  if (
    !Object.hasOwn(groups, group) ||
    (cursor !== null && !isQid(cursor)) ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  )
    throw Error('HISTORY_QUERY_BUDGET');
  return `SELECT DISTINCT ?item WHERE { ${groups[group]} ${cursor ? `FILTER(STR(?item) > STR(wd:${cursor}))` : ''} } ORDER BY STR(?item) LIMIT ${pageSize}`;
}
export function discoveredIds(value) {
  if (!Array.isArray(value?.results?.bindings) || value.results.bindings.length > 100)
    throw Error('HISTORY_QUERY_SCHEMA');
  const ids = value.results.bindings.map(
    (r) =>
      r.item?.type === 'uri' &&
      r.item.value?.match(/^http:\/\/www.wikidata.org\/entity\/(Q[1-9]\d{0,15})$/)?.[1],
  );
  if (
    ids.some((q) => !isQid(q)) ||
    new Set(ids).size !== ids.length ||
    ids.some((q, i) => i > 0 && q <= ids[i - 1])
  )
    throw Error('HISTORY_QUERY_IDS');
  return ids;
}
export async function collectHistory({
  group = 'nobel',
  limit = 2000,
  userAgent = process.env.WIKIDATA_USER_AGENT,
  root = 'data/staging/history',
  fetcher = fetch,
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
} = {}) {
  if (!Object.hasOwn(groups, group) || !Number.isInteger(limit) || limit < 1 || limit > 10000)
    throw Error('HISTORY_COLLECT_BUDGET');
  if (
    typeof userAgent !== 'string' ||
    userAgent.length > 240 ||
    !/^TarihAtlasi\/[\w.-]+ \([^\r\n]*(?:@|https?:\/\/)[^\r\n]+\)$/.test(userAgent)
  )
    throw Error('WIKIDATA_USER_AGENT: gerçek proje URL veya iletişim adresi gerekli.');
  await mkdir(root, { recursive: true });
  let cursor = null;
  const collected = new Set();
  const json = async (key, url, options = {}) => {
    const path = `${root}/${key}.json`,
      receiptPath = `${root}/${key}.receipt.json`;
    try {
      const bytes = await readFile(path),
        receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
      if (
        bytes.length > 4 * 1024 * 1024 ||
        receipt.sha256 !== hash(bytes) ||
        receipt.bytes !== bytes.length ||
        receipt.url !== String(url) ||
        receipt.requestHash !== hash(JSON.stringify(options)) ||
        receipt.licenseId !== 'CC0-1.0' ||
        receipt.productionApproved !== false
      )
        throw Error('HISTORY_CACHE_CORRUPT');
      return JSON.parse(bytes);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      await wait(1000);
      let response;
      try {
        response = await fetcher(url, {
          ...options,
          redirect: 'error',
          headers: { 'User-Agent': userAgent, Accept: 'application/json', ...options.headers },
          signal: AbortSignal.timeout(20000),
        });
      } catch (e) {
        if (attempt === 2) throw e;
        await wait(500 * 2 ** attempt);
        continue;
      }
      if (response.status === 429 || response.status >= 500) {
        const after = response.headers.get('retry-after');
        const ms = after
          ? /^\d+$/.test(after)
            ? Number(after) * 1000
            : Date.parse(after) - Date.now()
          : 1000 * 2 ** attempt;
        if (!Number.isFinite(ms) || ms > 30000 || attempt === 2)
          throw Error(`HISTORY_RETRY_LATER_${response.status}`);
        await wait(Math.max(1000, ms));
        continue;
      }
      if (!response.ok) throw Error(`HISTORY_HTTP_${response.status}`);
      const chunks = [];
      let size = 0;
      for await (const b of response.body) {
        size += b.length;
        if (size > 4 * 1024 * 1024) throw Error('HISTORY_RESPONSE_SIZE');
        chunks.push(b);
      }
      const bytes = Buffer.concat(chunks),
        value = JSON.parse(bytes);
      if (value.error?.code === 'maxlag' || value.error?.code === 'ratelimited') {
        if (attempt === 2) throw Error('HISTORY_API_RETRY_LATER');
        const after = response.headers.get('retry-after');
        const delay = after
          ? /^\d+$/.test(after)
            ? Number(after) * 1000
            : Date.parse(after) - Date.now()
          : 5000 * 2 ** attempt;
        if (!Number.isFinite(delay) || delay > 30000) throw Error('HISTORY_API_RETRY_LATER');
        await wait(Math.max(5000, delay));
        continue;
      }
      if (value.error) throw Error('HISTORY_API_ERROR');
      const receipt = {
        url: String(url),
        requestHash: hash(JSON.stringify(options)),
        sha256: hash(bytes),
        bytes: bytes.length,
        fetchedAt: new Date().toISOString(),
        licenseId: 'CC0-1.0',
        productionApproved: false,
      };
      await writeFile(path + '.tmp', bytes);
      await rename(path + '.tmp', path);
      await writeFile(receiptPath + '.tmp', JSON.stringify(receipt, null, 2) + '\n');
      await rename(receiptPath + '.tmp', receiptPath);
      return value;
    }
    throw Error('HISTORY_RETRY_LIMIT');
  };
  while (collected.size < limit) {
    const pageSize = Math.min(50, limit - collected.size);
    const query = discoveryQuery(group, cursor, pageSize);
    const response = await json(
      `query-${group}-${cursor ?? 'start'}-${limit - collected.size}`,
      'https://query.wikidata.org/sparql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/sparql-results+json',
        },
        body: new URLSearchParams({ query, format: 'json' }).toString(),
      },
    );
    const ids = discoveredIds(response);
    if (ids.length > pageSize) throw Error('HISTORY_PAGE_BUDGET');
    if (!ids.length) break;
    if (
      cursor &&
      ids.some(
        (q) => `http://www.wikidata.org/entity/${q}` <= `http://www.wikidata.org/entity/${cursor}`,
      )
    )
      throw Error('HISTORY_CURSOR');
    for (const id of ids) {
      const url = new URL('https://www.wikidata.org/w/api.php');
      url.search = new URLSearchParams({
        action: 'wbgetentities',
        ids: id,
        props: 'info|labels|aliases|descriptions|claims|sitelinks/urls',
        languages: 'tr|en',
        format: 'json',
        maxlag: '5',
      }).toString();
      const data = await json(`entity-${id}`, url);
      const e = data.entities?.[id];
      if (e?.id !== id || !Number.isSafeInteger(e.lastrevid) || e.lastrevid < 1)
        throw Error('HISTORY_ENTITY_IDENTITY');
      // Original statements retain qualifiers, ranks, GUIDs and references. No annual presence approval.
      collected.add(id);
    }
    cursor = ids.at(-1);
    await writeFile(
      `${root}/${group}-checkpoint.json`,
      JSON.stringify(
        {
          group,
          cursor,
          collected: [...collected],
          status: 'collected-unreviewed',
          productionApproved: false,
        },
        null,
        2,
      ) + '\n',
    );
  }
  return {
    group,
    records: collected.size,
    status: 'collected-unreviewed',
    productionApproved: false,
    root,
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    let group = 'nobel',
      limit = 2000;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--group') group = args[++i];
      else if (args[i] === '--limit') limit = Number(args[++i]);
      else if (args[i] === '--help') {
        console.log(
          `history:collect --group ${Object.keys(groups).join('|')} --limit 1..10000; WIKIDATA_USER_AGENT required. Cached, resumable, unreviewed staging only.`,
        );
        process.exit(0);
      } else throw Error('HISTORY_ARGUMENT');
    }
    console.log(JSON.stringify(await collectHistory({ group, limit })));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
