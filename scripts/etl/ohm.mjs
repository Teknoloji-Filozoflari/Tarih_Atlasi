import { parse } from '../../src/domain/schema.ts';
import { historicalDateSchema } from '../../src/domain/temporal.ts';

export const OHM_LIMITS = Object.freeze({
  elements: 2000,
  bytes: 4 * 1024 * 1024,
  attempts: 3,
  timeoutMs: 10000,
});
// OHM uses ISO astronomical years: 0000 = 1 BCE, -0001 = 2 BCE. Preserve raw text.
export function ohmDate(raw) {
  if (typeof raw !== 'string') return { kind: 'unknown', sourceText: raw ?? null };
  const match = /^(-?\d{4,6})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(raw);
  if (!match) return { kind: 'review-required', sourceText: raw };
  const astronomical = Number(match[1]);
  const date = {
    year: astronomical <= 0 ? astronomical - 1 : astronomical,
    month: match[2] ? Number(match[2]) : null,
    day: match[3] ? Number(match[3]) : null,
  };
  if (!parse(historicalDateSchema, date).ok) return { kind: 'review-required', sourceText: raw };
  return {
    kind: 'known',
    date,
    precision: match[3] ? 'day' : match[2] ? 'month' : 'year',
    sourceText: raw,
  };
}
export function auditOHM(value, relationId) {
  if (
    !value ||
    !Array.isArray(value.elements) ||
    value.elements.length < 1 ||
    value.elements.length > OHM_LIMITS.elements
  )
    throw new Error('OHM_ELEMENTS_LIMIT');
  const index = new Map();
  for (const element of value.elements) {
    if (
      !['node', 'way', 'relation'].includes(element.type) ||
      !Number.isSafeInteger(element.id) ||
      element.id <= 0 ||
      !Number.isSafeInteger(element.version) ||
      element.version <= 0 ||
      !Number.isFinite(Date.parse(element.timestamp)) ||
      (element.tags !== undefined &&
        (!element.tags ||
          Array.isArray(element.tags) ||
          typeof element.tags !== 'object' ||
          Object.values(element.tags).some((tag) => typeof tag !== 'string')))
    )
      throw new Error('OHM_META_REQUIRED');
    const key = `${element.type}/${element.id}`;
    if (index.has(key)) throw new Error('OHM_DUPLICATE_ELEMENT');
    index.set(key, element);
  }
  const root = index.get(`relation/${relationId}`);
  if (!root) throw new Error('OHM_ROOT_MISSING');
  const records = [];
  for (const element of value.elements) {
    const tags = element.tags ?? {};
    const missingMembers = [];
    if (element.type === 'relation') {
      if (!Array.isArray(element.members)) throw new Error('OHM_MEMBERS_REQUIRED');
      for (const member of element.members)
        if (!index.has(`${member.type}/${member.ref}`))
          missingMembers.push(`${member.type}/${member.ref}`);
    }
    if (element.type === 'way') {
      if (!Array.isArray(element.nodes)) throw new Error('OHM_NODES_REQUIRED');
      for (const id of element.nodes)
        if (!index.has(`node/${id}`)) missingMembers.push(`node/${id}`);
    }
    const license = tags.license ?? null;
    records.push({
      type: element.type,
      id: element.id,
      version: element.version,
      timestamp: element.timestamp,
      tags, // All tags retained: license:*, source:*, attribution, EDTF, date notes and anything else.
      license: {
        explicit: license,
        basis: license ? 'object-tag' : 'OHM-default-CC0-subject-to-member-and-source-review',
        productionApproved: false,
      },
      time: {
        start: ohmDate(tags.start_date),
        end: ohmDate(tags.end_date),
        startSemantics: 'inclusive-source-date',
        endSemantics: 'exclusive-source-date-not-normalized',
        uncertain: Boolean(tags['start_date:edtf'] || tags['end_date:edtf']),
      },
      missingMembers,
    });
  }
  return {
    status: 'quarantined-manual-review',
    root: { id: root.id, version: root.version },
    records,
    incomplete: records.some((record) => record.missingMembers.length > 0),
    productionApproved: false,
  };
}
export function ohmQuery(relationId) {
  if (!Number.isSafeInteger(relationId) || relationId < 1 || relationId > 999999999999)
    throw new Error('OHM_RELATION_ID');
  return `[out:json][timeout:15][maxsize:4194304];relation(${relationId});(._;>>;);out meta;`;
}
export async function fetchOHM(
  relationId,
  { fetcher = fetch, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {},
) {
  const url = new URL('https://overpass-api.openhistoricalmap.org/api/interpreter');
  url.searchParams.set('data', ohmQuery(relationId));
  for (let attempt = 0; attempt < OHM_LIMITS.attempts; attempt++) {
    let delay = 500 * 2 ** attempt;
    try {
      const response = await fetcher(url, {
        redirect: 'error',
        signal: AbortSignal.timeout(OHM_LIMITS.timeoutMs),
        headers: {
          Accept: 'application/json',
          'User-Agent': 'TarihAtlasi/0.1 (bounded historical data research)',
        },
      });
      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
          const value = response.headers.get('retry-after');
          if (value) {
            const requested = /^\d+$/.test(value)
              ? Number(value) * 1000
              : Date.parse(value) - Date.now();
            if (!Number.isFinite(requested) || requested > 10000)
              throw new TypeError('RETRY_AFTER: retry later, no early retry');
            delay = Math.max(delay, requested);
          }
        }
        if (response.status !== 429 && response.status < 500)
          throw new TypeError(`HTTP ${response.status}`);
        throw new Error(`HTTP ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new TypeError('OHM_EMPTY_BODY');
      const chunks = [];
      let bytes = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > OHM_LIMITS.bytes) throw new TypeError('OHM_BYTES_LIMIT');
          chunks.push(value);
        }
      } catch (error) {
        await reader.cancel();
        throw error;
      }
      const buffer = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
      const audit = auditOHM(value, relationId);
      return { raw: buffer, audit, url: url.href };
    } catch (error) {
      if (
        (error instanceof TypeError && !error.cause) ||
        error instanceof SyntaxError ||
        attempt + 1 === OHM_LIMITS.attempts
      )
        throw error;
      await wait(delay);
    }
  }
  throw new Error('OHM_FETCH_FAILED');
}
