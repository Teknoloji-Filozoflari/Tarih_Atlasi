import type { HistoricalDataProvider, HistoricalHit } from '../provider.ts';
import type { WorldRepository } from './repository.ts';
import { worldEntityId, worldTerritoryId, worldSource } from './records.ts';
import { WORLD_SOURCE } from './types.ts';
import { boxesIntersect } from '../../domain/geometry.ts';
export function withWorldProvider(
  base: HistoricalDataProvider,
  world: WorldRepository,
): HistoricalDataProvider {
  return {
    catalogVersion: base.catalogVersion,
    async getById(id) {
      return (await world.getById(id)) ?? (await base.getById(id));
    },
    async getSource(id) {
      return id === WORLD_SOURCE ? worldSource : base.getSource(id);
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
        throw new Error('WORLD_QUERY_BUDGET');
      const old: HistoricalHit[] = [];
      let next: number | null = 0;
      for (let page = 0; next !== null; page++) {
        if (page >= 10) throw new Error('BASE_QUERY_BUDGET');
        const response = await base.query({ ...q, offset: next, limit: 100 });
        old.push(...response.hits);
        next = response.nextOffset;
      }
      const selected = new Set<string>();
      if (q.includeUncertain !== false && q.includeUncertain !== undefined) {
        for (const r of world.reviewedRows) {
          if (
            r.start > q.endYear ||
            r.end < q.startYear ||
            (q.bbox && (!r.bbox || !boxesIntersect(r.bbox, q.bbox)))
          )
            continue;
          if (!q.kinds?.length || q.kinds.includes('entity')) selected.add(worldEntityId(r.name));
          if (!r.legacy && (!q.kinds?.length || q.kinds.includes('territory')))
            selected.add(worldTerritoryId(r));
        }
      }
      const candidates = [
        ...old.map((h) => ({ id: h.record.id, old: h })),
        ...[...selected].map((id) => ({ id, old: null })),
      ].sort((a, b) => a.id.localeCompare(b.id, 'en'));
      const hits: HistoricalHit[] = [];
      for (const item of candidates.slice(offset, offset + limit)) {
        if (item.old) hits.push(item.old);
        else {
          const record = await world.getById(item.id);
          if (record) hits.push({ record, temporalMatch: 'possible' });
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
