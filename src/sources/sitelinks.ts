import { isWikipediaSitelink } from '../domain/sitelink.ts';
import { externalURL } from './url-policy.ts';

export interface SitelinkSnapshot {
  wikidataId: string;
  revision: string;
  sourceUrl: string;
  verifiedAt: string;
  reviewStatus: 'verified';
  representation: 'editorial-sitelink-extraction-not-http-response' | 'wikidata-api-extraction';
  licenseId: 'CC0-1.0';
  attribution: string;
  sitelinks: { site: 'trwiki' | 'enwiki'; title: string; url: string }[];
}
export const isQid = (value: unknown): value is string =>
  typeof value === 'string' && /^Q[1-9]\d{0,15}$/u.test(value);
const plain = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
/** Fail closed: no redirect, missing entity, unreviewed candidate or invented slug. */
export function parseSitelinkSnapshot(value: unknown): Readonly<SitelinkSnapshot> | null {
  if (!plain(value)) return null;
  const keys = [
    'wikidataId',
    'revision',
    'sourceUrl',
    'verifiedAt',
    'reviewStatus',
    'representation',
    'licenseId',
    'attribution',
    'sitelinks',
  ];
  if (Object.keys(value).some((k) => !keys.includes(k)) || keys.some((k) => !(k in value)))
    return null;
  if (
    !isQid(value.wikidataId) ||
    typeof value.revision !== 'string' ||
    !/^[1-9]\d{0,15}$/u.test(value.revision) ||
    value.sourceUrl !==
      `https://www.wikidata.org/w/index.php?title=${value.wikidataId}&oldid=${value.revision}` ||
    typeof value.verifiedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u.test(value.verifiedAt) ||
    !Number.isFinite(Date.parse(value.verifiedAt)) ||
    new Date(value.verifiedAt).toISOString().replace('.000Z', 'Z') !== value.verifiedAt ||
    value.reviewStatus !== 'verified' ||
    !['editorial-sitelink-extraction-not-http-response', 'wikidata-api-extraction'].includes(
      String(value.representation),
    ) ||
    value.licenseId !== 'CC0-1.0' ||
    typeof value.attribution !== 'string' ||
    !value.attribution.trim() ||
    value.attribution.length > 1000 ||
    !Array.isArray(value.sitelinks) ||
    value.sitelinks.length > 2
  )
    return null;
  const sites = new Set<string>();
  for (const link of value.sitelinks) {
    if (
      !plain(link) ||
      Object.keys(link).length !== 3 ||
      !['trwiki', 'enwiki'].includes(String(link.site)) ||
      typeof link.title !== 'string' ||
      link.title.length > 500 ||
      typeof link.url !== 'string' ||
      !externalURL(link.url, 'wikipedia') ||
      !isWikipediaSitelink(link as SitelinkSnapshot['sitelinks'][number]) ||
      sites.has(String(link.site))
    )
      return null;
    sites.add(String(link.site));
  }
  const snapshot = JSON.parse(JSON.stringify(value)) as unknown as SitelinkSnapshot;
  for (const link of snapshot.sitelinks) Object.freeze(link);
  Object.freeze(snapshot.sitelinks);
  return Object.freeze(snapshot);
}
export type SitelinkResolution = Readonly<{
  kind: 'trwiki' | 'enwiki' | 'wikidata' | 'unavailable';
  reason: 'verified' | 'missing-languages' | 'not-reviewed' | 'no-id';
  url: string | null;
  wikidataId: string | null;
  snapshot: Readonly<SitelinkSnapshot> | null;
}>;
/** Immutable release snapshot; cache key includes release and language policy, max128. */
export function createSitelinkResolver(version: string, values: unknown[]) {
  if (!/^[\w.-]{1,80}$/u.test(version) || values.length > 1000) throw new Error('SITELINK_BUDGET');
  const snapshots = new Map<string, Readonly<SitelinkSnapshot>>();
  for (const value of values) {
    const snapshot = parseSitelinkSnapshot(value);
    if (!snapshot || snapshots.has(snapshot.wikidataId)) throw new Error('SITELINK_SNAPSHOT');
    snapshots.set(snapshot.wikidataId, snapshot);
  }
  const cache = new Map<string, SitelinkResolution>();
  return {
    resolve(id: string | null): SitelinkResolution {
      if (!isQid(id))
        return Object.freeze({
          kind: 'unavailable',
          reason: 'no-id',
          url: null,
          wikidataId: null,
          snapshot: null,
        });
      const key = `${version}/${id}/trwiki-enwiki-wikidata`;
      const cached = cache.get(key);
      if (cached) {
        cache.delete(key);
        cache.set(key, cached);
        return cached;
      }
      const snapshot = snapshots.get(id) ?? null;
      const link =
        snapshot?.sitelinks.find((s) => s.site === 'trwiki') ??
        snapshot?.sitelinks.find((s) => s.site === 'enwiki');
      const result: SitelinkResolution = Object.freeze({
        kind: link?.site ?? 'wikidata',
        reason: link ? 'verified' : snapshot ? 'missing-languages' : 'not-reviewed',
        url: link?.url ?? `https://www.wikidata.org/wiki/${id}`,
        wikidataId: id,
        snapshot,
      });
      cache.set(key, result);
      if (cache.size > 128) cache.delete(cache.keys().next().value!);
      return result;
    },
    get cacheSize() {
      return cache.size;
    },
    clear() {
      cache.clear();
    },
  };
}
