import type { Catalog, HistoricalRecord, RawInput, SourceRecord } from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';
import type { HistoryManifest, HistoryReader } from './types.ts';
import { validateCatalog } from '../domain/validate.ts';
import { sha256, utf8 } from '../data/chunks/hash.ts';
import { createHistoricalDataProvider } from '../data/provider.ts';
import { createTimelineEngine } from '../timeline/engine.ts';
import { createWorldTaskQueue } from '../data/world/task-queue.ts';
import { HISTORY_INPUT_SHA, HISTORY_MANIFEST_SHA } from './policy.ts';
import { rememberHistoryLink } from './link-cache.ts';
import type { SitelinkSnapshot } from '../sources/sitelinks.ts';

export function assertHistoryManifest(manifest: HistoryManifest) {
  if (
    manifest.version !== '1.0.0-history' ||
    manifest.inputSha256 !== HISTORY_INPUT_SHA ||
    sha256(JSON.stringify(manifest)) !== HISTORY_MANIFEST_SHA ||
    manifest.rows.length > 10000 ||
    manifest.packs.length > 512 ||
    manifest.packs.reduce((n, p) => n + p.bytes, 0) > 64 * 1024 * 1024 ||
    manifest.packs.some((p) => p.bytes > 256 * 1024 || p.bytes < 2 || p.records > 100) ||
    manifest.rows.some(
      (r) =>
        r.id !== `history:${r.qid.toLowerCase()}` ||
        !/^Q[1-9]\d{0,15}$/u.test(r.qid) ||
        !manifest.packs[r.pack] ||
        r.name.length > 300,
    ) ||
    new Set(manifest.rows.map((r) => r.id)).size !== manifest.rows.length
  )
    throw Error('HISTORY_MANIFEST_REVIEW');
}
function frozen<T>(value: T): DeepReadonly<T> {
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) frozen(v);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
export function validateHistoryPack(text: string, index: number, manifest: HistoryManifest) {
  const pack = manifest.packs[index];
  if (!pack || utf8(text).length !== pack.bytes || sha256(text) !== pack.sha256)
    throw Error('HISTORY_PACK_HASH');
  const valid = validateCatalog(JSON.parse(text));
  if (
    !valid.ok ||
    valid.value.catalogVersion !== manifest.version ||
    valid.value.records.length !== pack.records
  )
    throw Error('HISTORY_PACK_RIGHTS');
  const rows = manifest.rows.filter((r) => r.pack === index),
    records = valid.value.records;
  if (
    rows.some(
      (row) =>
        !records.some(
          (r) =>
            r.id === row.id &&
            r.kind === row.kind &&
            r.wikidataId === row.qid &&
            r.names[0]?.value === row.name,
        ),
    ) ||
    records.some(
      (r) =>
        !rows.some(
          (row) =>
            r.id === row.id ||
            r.id === row.id + '-identity' ||
            (row.geometryYear !== null && r.id === row.id + '-birth'),
        ),
    ) ||
    valid.value.inputs.some(
      (i) =>
        !i.relativePath.match(
          /^data\/(?:staging\/history\/entity-Q[1-9]\d*\.json|people\/(?:raw|expanded-raw|ottoman-raw|global-raw|broad-raw)\/browser-review\.json)$/u,
        ),
    )
  )
    throw Error('HISTORY_PACK_SCOPE');
  return frozen(valid.value);
}
export function createHistoryRepository(input: HistoryManifest, read: HistoryReader) {
  assertHistoryManifest(input);
  const manifest = frozen(JSON.parse(JSON.stringify(input)) as HistoryManifest);
  const rows = new Map(manifest.rows.map((r) => [r.id, r])),
    qids = new Map(manifest.rows.map((r) => [r.qid, r]));
  type Loaded = { catalog: DeepReadonly<Catalog>; engine: ReturnType<typeof createTimelineEngine> };
  const cache = new Map<number, Loaded>(),
    queue = createWorldTaskQueue();
  let epoch = 0,
    reads = 0;
  const controllers = new Set<AbortController>();
  function link(record: DeepReadonly<HistoricalRecord>): SitelinkSnapshot | null {
    if (record.kind !== 'person' && record.kind !== 'event') return null;
    const sites =
      record.kind === 'person' ? record.profile?.wikipedia : record.details?.wikipediaSitelinks;
    const source = record.evidence[0];
    if (!record.wikidataId || !source || !sites?.length) return null;
    return {
      wikidataId: record.wikidataId,
      revision: source.sourceRevision,
      sourceUrl: `https://www.wikidata.org/w/index.php?title=${record.wikidataId}&oldid=${source.sourceRevision}`,
      verifiedAt: sites[0]!.verifiedAt.replace(/\.\d{3}Z$/u, 'Z'),
      reviewStatus: 'verified',
      representation: 'wikidata-api-extraction',
      licenseId: 'CC0-1.0',
      attribution: source.attribution,
      sitelinks: sites
        .filter((s) => s.site === 'trwiki' || s.site === 'enwiki')
        .map((s) => ({ site: s.site as 'trwiki' | 'enwiki', title: s.title, url: s.url })),
    };
  }
  async function load(
    index: number,
    signal: AbortSignal = new AbortController().signal,
  ): Promise<Loaded> {
    if (signal.aborted) throw Error('HISTORY_ABORT');
    const old = cache.get(index);
    if (old) {
      cache.delete(index);
      cache.set(index, old);
      return old;
    }
    const version = epoch;
    return queue.run(signal, async () => {
      const warm = cache.get(index);
      if (warm) return warm;
      const pack = manifest.packs[index];
      if (!pack) throw Error('HISTORY_PACK_INDEX');
      const controller = new AbortController(),
        cancel = () => controller.abort();
      controllers.add(controller);
      signal.addEventListener('abort', cancel, { once: true });
      const timeout = setTimeout(cancel, 15000);
      try {
        const text = await read(index, pack, controller.signal);
        if (controller.signal.aborted || signal.aborted || version !== epoch)
          throw Error('HISTORY_STALE_OR_ABORT');
        const catalog = validateHistoryPack(text, index, manifest as HistoryManifest);
        const value = {
          catalog,
          engine: createTimelineEngine(createHistoricalDataProvider(catalog)),
        };
        for (const record of catalog.records) {
          const snapshot = link(record);
          if (snapshot) rememberHistoryLink(snapshot);
        }
        reads++;
        while (cache.size >= 8) cache.delete(cache.keys().next().value!);
        cache.set(index, value);
        return value;
      } finally {
        clearTimeout(timeout);
        controllers.delete(controller);
        signal.removeEventListener('abort', cancel);
      }
    });
  }
  const rowFor = (id: string) => rows.get(id.replace(/-(?:identity|birth)$/u, '')) ?? null;
  async function record(
    id: string,
    signal?: AbortSignal,
  ): Promise<DeepReadonly<HistoricalRecord> | null> {
    const row = rowFor(id);
    return row
      ? ((await load(row.pack, signal)).catalog.records.find((r) => r.id === id) ?? null)
      : null;
  }
  return {
    manifest,
    rows: manifest.rows,
    rowFor,
    rowForQid: (qid: string) => qids.get(qid) ?? null,
    load,
    record,
    hasGeometry(id: string) {
      const row = rowFor(id);
      return (
        !!row?.geometry &&
        ((row.kind === 'event' && row.id === id) ||
          (row.kind === 'person' && id === row.id + '-birth'))
      );
    },
    async source(id: string): Promise<DeepReadonly<SourceRecord> | null> {
      const index = manifest.sourcePacks[id];
      return index === undefined
        ? null
        : ((await load(index)).catalog.sources.find((s) => s.id === id) ?? null);
    },
    async rawInput(id: string): Promise<DeepReadonly<RawInput> | null> {
      const index = manifest.sourcePacks[id.replace(/^input:/u, 'source:')];
      return index === undefined
        ? null
        : ((await load(index)).catalog.inputs.find((i) => i.id === id) ?? null);
    },
    async sitelink(qid: string, signal: AbortSignal) {
      const row = qids.get(qid);
      if (!row) return null;
      const value = await record(row.id, signal);
      return value ? link(value) : null;
    },
    async *enginesAt(year: number, kind: 'person' | 'event' | 'geometry', signal?: AbortSignal) {
      const indices = [
        ...new Set(
          manifest.rows
            .filter(
              (r) =>
                (kind === 'geometry' ? r.geometry : r.kind === kind) &&
                (kind === 'geometry' && r.geometryYear !== null
                  ? r.geometryYear === year
                  : r.activeStart !== null &&
                    r.activeEnd !== null &&
                    r.activeStart <= year &&
                    r.activeEnd >= year),
            )
            .map((r) => r.pack),
        ),
      ];
      // No unbounded Promise.all or queue growth; at most two actual asset reads.
      for (let i = 0; i < indices.length; i += 2)
        for (const value of await Promise.all(
          indices.slice(i, i + 2).map((index) => load(index, signal)),
        ))
          yield value;
    },
    async *geometryEngines(signal?: AbortSignal) {
      for (const index of new Set(manifest.rows.filter((r) => r.geometry).map((r) => r.pack)))
        yield await load(index, signal);
    },
    stats: () => ({ cachedPacks: cache.size, reads, maxCachedPacks: 8, ...queue.stats() }),
    clear() {
      epoch++;
      for (const c of controllers) c.abort();
      cache.clear();
    },
  };
}
export type HistoryRepository = ReturnType<typeof createHistoryRepository>;
