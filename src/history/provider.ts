import type { HistoricalDataProvider, HistoricalHit } from '../data/provider.ts';
import type { HistoryRepository } from './repository.ts';
import { boxesIntersect } from '../domain/geometry.ts';
/** Archive query is paged by manifest metadata; legacy engines keep their original small provider. */
export function withHistoryProvider(
  base: HistoricalDataProvider,
  archive: HistoryRepository,
): HistoricalDataProvider {
  return {
    ...base,
    async getById(id) {
      return archive.rowFor(id) ? archive.record(id) : base.getById(id);
    },
    async getSource(id) {
      return id.startsWith('source:history:') || id.startsWith('source:history-place-')
        ? archive.source(id)
        : base.getSource(id);
    },
    async query(q) {
      const offset = q.offset ?? 0,
        limit = q.limit ?? 50;
      if (
        !Number.isInteger(offset) ||
        offset < 0 ||
        offset > 30000 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      )
        throw Error('HISTORY_QUERY_BUDGET');
      // Validate inputs using the existing provider before considering manifest rows.
      const old: HistoricalHit[] = [];
      let next: number | null = 0;
      for (let page = 0; next !== null; page++) {
        if (page >= 300) throw Error('HISTORY_BASE_PAGE_BUDGET');
        const result = await base.query({ ...q, limit: 100, offset: next });
        old.push(...result.hits);
        if (result.nextOffset !== null && result.nextOffset <= next)
          throw Error('HISTORY_PAGINATION');
        next = result.nextOffset;
      }
      const candidates: { id: string; hit: HistoricalHit | null }[] = old.map((h) => ({
        id: h.record.id,
        hit: h,
      }));
      for (const row of archive.rows) {
        const matches = !(
          (row.start !== null && row.start > q.endYear) ||
          (row.end !== null && row.end < q.startYear) ||
          (!q.includeUncertain && (row.uncertain || row.start === null || row.end === null))
        );
        const inBox = !q.bbox || (!!row.bbox && boxesIntersect([...row.bbox], q.bbox));
        if (
          row.geometryYear !== null &&
          row.geometryYear >= q.startYear &&
          row.geometryYear <= q.endYear &&
          inBox &&
          (!q.kinds?.length || q.kinds.includes('person-location'))
        )
          candidates.push({ id: row.id + '-birth', hit: null });
        if (!matches) continue;
        for (const [id, kind] of [
          [row.id, row.kind],
          [row.id + '-identity', 'entity'],
        ] as const)
          if (
            (!q.kinds?.length || q.kinds.includes(kind)) &&
            (!q.bbox || (kind === 'event' && row.geometry && inBox))
          )
            candidates.push({ id, hit: null });
      }
      candidates.sort((a, b) => a.id.localeCompare(b.id, 'en'));
      const hits: HistoricalHit[] = [];
      for (const candidate of candidates.slice(offset, offset + limit)) {
        if (candidate.hit) hits.push(candidate.hit);
        else {
          const record = await archive.record(candidate.id);
          if (record)
            hits.push({
              record,
              temporalMatch: record.temporal.uncertain ? 'possible' : 'documented-interval',
            });
        }
      }
      return {
        hits,
        total: candidates.length,
        nextOffset: offset + limit < candidates.length ? offset + limit : null,
      };
    },
  };
}
