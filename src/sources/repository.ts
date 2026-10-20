import type { DeepReadonly, HistoricalDataProvider } from '../data/provider.ts';
import type { HistoricalRecord, RawInput, SourceRecord } from '../domain/types.ts';
/** Exact evidence rows, never infer a direct statement from a general entity URL. */
export function createSourceRepository(
  provider: HistoricalDataProvider,
  inputs: readonly DeepReadonly<RawInput>[],
  resolveInput?: (id: string) => Promise<DeepReadonly<RawInput> | null>,
) {
  const raw = new Map(inputs.map((input) => [input.id, Object.freeze({ ...input })]));
  return {
    async detail(ids: readonly string[]) {
      if (ids.length > 1000 || ids.some((id) => id.length > 240)) throw new Error('SOURCE_BUDGET');
      const records: DeepReadonly<HistoricalRecord>[] = [];
      const sources = new Map<string, DeepReadonly<SourceRecord>>();
      for (const id of new Set(ids)) {
        const record = await provider.getById(id);
        if (record) records.push(record);
      }
      for (const id of new Set(records.flatMap((r) => r.evidence.map((e) => e.sourceId)))) {
        const source = await provider.getSource(id);
        if (source) sources.set(id, source);
      }
      for (const id of new Set(records.flatMap((r) => r.evidence.map((e) => e.rawInputId)))) {
        if (!raw.has(id) && resolveInput) {
          const input = await resolveInput(id);
          if (input) raw.set(id, input);
        }
      }
      const rows = records.flatMap((record) =>
        record.evidence.map((evidence, index) => {
          const source = sources.get(evidence.sourceId) ?? null;
          const input = raw.get(evidence.rawInputId) ?? null;
          const matched =
            source?.revision === evidence.sourceRevision &&
            source.rawInputId === evidence.rawInputId &&
            input?.sourceRevision === evidence.sourceRevision &&
            input.sourceId === source.id;
          return {
            id: `${record.id}/${index}`,
            recordId: record.id,
            evidence,
            source: matched ? source : null,
            input: matched ? input : null,
            matched,
          };
        }),
      );
      return { catalogVersion: provider.catalogVersion, records, rows };
    },
  };
}

export type SourceDetail = Awaited<ReturnType<ReturnType<typeof createSourceRepository>['detail']>>;
