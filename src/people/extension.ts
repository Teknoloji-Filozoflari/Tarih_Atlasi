import { sha256, utf8 } from '../data/chunks/hash.ts';
import {
  createHistoricalDataProvider,
  type HistoricalDataProvider,
  type HistoricalHit,
  type DeepReadonly,
} from '../data/provider.ts';
import type { Catalog, HistoricalRecord, RawInput, SourceRecord } from '../domain/types.ts';
import { validateCatalog } from '../domain/validate.ts';
import { reviewedInputsFor } from './policy.ts';

function freeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
function copy<T>(value: T): T {
  // Catalogs are validated JSON; this also works in native runtimes without structuredClone.
  return JSON.parse(JSON.stringify(value)) as T;
}

export interface PeopleRelease {
  readonly version: string;
  readonly inputs: { readonly browserReview: string; readonly decisions: string };
  readonly entries: readonly {
    readonly index: number;
    readonly sha256: string;
    readonly bytes: number;
    readonly records: number;
  }[];
}
/** Independently rights-validated bounded catalogs, never a relaxed oversized pilot catalog. */
export function createPeopleExtension(catalogs: readonly Catalog[], release: PeopleRelease) {
  const approved = reviewedInputsFor(release.version);
  if (
    !approved ||
    release.inputs.browserReview !== approved.browserReview ||
    release.inputs.decisions !== approved.decisions
  )
    throw new Error('PEOPLE_REVIEW_REQUIRED');
  if (
    catalogs.length > 16 ||
    catalogs.length !== release.entries.length ||
    !/^\d+\.\d+\.\d+-births$/u.test(release.version)
  )
    throw new Error('PEOPLE_RELEASE');
  const records = new Map<string, DeepReadonly<HistoricalRecord>>(),
    sources = new Map<string, DeepReadonly<SourceRecord>>(),
    inputs = new Map<string, DeepReadonly<RawInput>>();
  const providers: HistoricalDataProvider[] = [];
  for (const [index, catalog] of catalogs.entries()) {
    const entry = release.entries[index],
      raw = JSON.stringify(catalog);
    if (
      !entry ||
      entry.index !== index ||
      entry.bytes > 256 * 1024 ||
      utf8(raw).length !== entry.bytes ||
      sha256(raw) !== entry.sha256 ||
      catalog.catalogVersion !== release.version ||
      catalog.records.length !== entry.records
    )
      throw new Error('PEOPLE_PACK_INTEGRITY');
    const result = validateCatalog(catalog);
    if (
      !result.ok ||
      catalog.inputs.some(
        (i) =>
          i.sha256 !==
          (i.relativePath === 'browser-review.json'
            ? release.inputs.browserReview
            : i.relativePath === 'decisions.json'
              ? release.inputs.decisions
              : null),
      )
    )
      throw new Error('PEOPLE_RIGHTS');
    const provider = createHistoricalDataProvider(catalog);
    providers.push(provider);
    for (const record of result.value.records) {
      if (records.has(record.id)) throw new Error('PEOPLE_DUPLICATE_RECORD');
      records.set(record.id, freeze(copy(record)));
    }
    for (const source of result.value.sources) {
      const old = sources.get(source.id);
      if (old && JSON.stringify(old) !== JSON.stringify(source))
        throw new Error('PEOPLE_SOURCE_CONFLICT');
      sources.set(source.id, freeze(copy(source)));
    }
    for (const input of result.value.inputs) {
      const old = inputs.get(input.id);
      if (old && JSON.stringify(old) !== JSON.stringify(input))
        throw new Error('PEOPLE_INPUT_CONFLICT');
      inputs.set(input.id, freeze(copy(input)));
    }
  }
  if (records.size > 512) throw new Error('PEOPLE_RECORD_BUDGET');
  return {
    records: Object.freeze([...records.values()]),
    inputs: Object.freeze([...inputs.values()]),
    hasGeometry(id: string) {
      const r = records.get(id);
      return (
        (r?.kind === 'person-location' || r?.kind === 'event') &&
        r.reviewStatus === 'verified' &&
        !!r.geometry
      );
    },
    withProvider(base: HistoricalDataProvider): HistoricalDataProvider {
      return {
        // Existing bridge/chunk release remains the bootstrap context; extension has its own pinned version/hashes.
        catalogVersion: base.catalogVersion,
        async getById(id) {
          return records.get(id) ?? base.getById(id);
        },
        async getSource(id) {
          return sources.get(id) ?? base.getSource(id);
        },
        async query(q) {
          const offset = q.offset ?? 0,
            limit = q.limit ?? 50;
          if (
            !Number.isInteger(offset) ||
            offset < 0 ||
            offset > 1000 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
          )
            throw new Error('PEOPLE_QUERY_BUDGET');
          const merged = new Map<string, HistoricalHit>();
          for (const provider of [base, ...providers]) {
            let next: number | null = 0;
            for (let page = 0; next !== null; page++) {
              if (page >= 10) throw new Error('PEOPLE_PAGE_BUDGET');
              const result = await provider.query({ ...q, limit: 100, offset: next });
              for (const hit of result.hits) {
                // A superseded record must not leak into a year where the corrected record does not match.
                if (provider === base && records.has(hit.record.id)) continue;
                merged.set(hit.record.id, hit);
              }
              if (result.nextOffset !== null && result.nextOffset <= next)
                throw new Error('PEOPLE_PAGINATION');
              next = result.nextOffset;
            }
          }
          const all = [...merged.values()].sort((a, b) =>
            a.record.id.localeCompare(b.record.id, 'en'),
          );
          if (all.length > 1000) throw new Error('PEOPLE_TIMELINE_BUDGET');
          return {
            hits: all.slice(offset, offset + limit),
            total: all.length,
            nextOffset: offset + limit < all.length ? offset + limit : null,
          };
        },
      };
    },
  };
}
export type PeopleExtension = ReturnType<typeof createPeopleExtension>;

/** Each release retains its own quotas and rights gates; bootstrap timeline budget stays intact. */
export function combinePeopleExtensions(
  first: PeopleExtension,
  second: PeopleExtension,
): PeopleExtension {
  const ids = new Set(first.records.map((r) => r.id));
  if (second.records.some((r) => ids.has(r.id))) throw new Error('PEOPLE_RELEASE_COLLISION');
  if (first.records.length + second.records.length > 800) throw new Error('PEOPLE_COMBINED_BUDGET');
  return {
    records: Object.freeze([...first.records, ...second.records]),
    inputs: Object.freeze([...first.inputs, ...second.inputs]),
    hasGeometry: (id) => first.hasGeometry(id) || second.hasGeometry(id),
    withProvider: (base) => second.withProvider(first.withProvider(base)),
  };
}
