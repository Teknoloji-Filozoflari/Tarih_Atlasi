import type { HistoricalDataProvider, DeepReadonly } from '../data/provider.ts';
import type { HistoricalEntity, SourceRecord } from '../domain/types.ts';
import { createTimelineEngine, type TimelineEngine } from '../timeline/engine.ts';
import { eventHasMapEvidence, eventLayer, eventProjection } from './model.ts';

export function createEventRepository(
  provider: HistoricalDataProvider,
  timeline: TimelineEngine = createTimelineEngine(provider),
) {
  return {
    async atYear(
      year: number,
      {
        battle = true,
        event = true,
        offset = 0,
      }: { battle?: boolean; event?: boolean; offset?: number } = {},
    ) {
      if (!Number.isInteger(offset) || offset < 0 || offset > 1000)
        throw new Error('Event list bounds');
      const records = (await timeline.getEventsAtYear(year)).filter((h) =>
        eventLayer(h.record.eventType) === 'battle' ? battle : event,
      );
      return {
        year,
        total: records.length,
        records: records.slice(offset, offset + 8),
        nextOffset: offset + 8 < records.length ? offset + 8 : null,
      };
    },
    async detail(id: string, year: number) {
      const record = await provider.getById(id);
      if (record?.kind !== 'event' || record.reviewStatus !== 'verified') return null;
      const supported = (await timeline.getEventsAtYear(year)).some((h) => h.record.id === id);
      const participants: DeepReadonly<HistoricalEntity>[] = [];
      for (const id of record.participantIds) {
        const p = await provider.getById(id);
        if (p?.kind === 'entity') participants.push(p);
      }
      const sources: DeepReadonly<SourceRecord>[] = [];
      for (const id of new Set(record.evidence.map((e) => e.sourceId))) {
        const source = await provider.getSource(id);
        if (source) sources.push(source);
      }
      return {
        record,
        ...eventProjection(record),
        supported,
        mapSupported: supported && eventHasMapEvidence(record),
        participants,
        sources,
        year,
      };
    },
  };
}
