import { historicalFeatures, type HistoricalView } from '../../data/pilot.ts';
import { createDataRuntime } from '../../data/chunks/runtime-core.ts';
import { chunkStorage } from '../../data/chunks/storage.web.ts';
import { fetchChunk } from '../../data/chunks/network.ts';
import type { WorldRepository } from '../../data/world/repository.ts';
import { hasWorldGeometry } from '../../data/world/review.ts';
/** Only the authenticated repository may recognize reviewed inline supplements. */
export function worldInlineVerifier(repository: Pick<WorldRepository, 'rowFor'>) {
  return (id: string) => {
    const row = repository.rowFor(id);
    return !!row && !row.legacy && hasWorldGeometry(row);
  };
}
export const globeDataRuntime = createDataRuntime(
  chunkStorage,
  typeof location !== 'undefined' && ['https:', 'http:'].includes(location.protocol)
    ? fetchChunk
    : null,
);
/** Shared loader: only an authenticated world repository can opt an inline geometry into this path. */
export function createChunkedFeatureLoader(
  load: typeof historicalFeatures,
  runtime: Pick<typeof globeDataRuntime, 'ensure'>,
  verifiedInline: (id: string) => boolean = () => false,
) {
  return async (view: HistoricalView, zoom: number) => {
    const collection = await load(view, zoom);
    if (!collection.features.length) return collection;
    const first = collection.features[0]!.properties;
    const { values } = await runtime.ensure(
      {
        catalogVersion: first.catalogVersion,
        sourceYear: first.sourceYear,
        selectedYear: view.year,
        records: collection.features.map((f) => ({ record: { id: f.id } })),
      },
      view.signal ?? new AbortController().signal,
      zoom < 2.5 ? 'coarse' : 'fine',
    );
    return {
      ...collection,
      features: collection.features.map((f) => {
        if (verifiedInline(f.id)) return f;
        const record = values
          .find((v) => v.entry.recordId === f.id)
          ?.result.catalog.records.find((r) => r.id === f.id);
        if (!record || !('geometry' in record) || !record.geometry)
          throw new Error('CHUNK_GEOMETRY');
        return { ...f, geometry: record.geometry };
      }),
    };
  };
}
export const chunkedHistoricalFeatures = createChunkedFeatureLoader(
  historicalFeatures,
  globeDataRuntime,
);
