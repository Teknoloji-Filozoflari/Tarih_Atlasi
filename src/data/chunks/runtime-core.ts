import type { ChunkStorage } from './cache.ts';
import { createChunkCache } from './cache.ts';
import { createChunkLoader } from './loader.ts';
import { chunkManifest } from './generated/manifest.ts';
import { bundledChunk } from './generated/bundled.ts';
import { discoverChunks, type ChunkEntry } from './manifest.ts';
export interface DataLoadStatus {
  origins: ('memory' | 'cache' | 'network' | 'bundled' | 'asset')[];
  chunks: number;
  cacheWarning: boolean;
  catalogVersion: string;
}
export function createDataRuntime(
  storage: ChunkStorage,
  network: ((entry: ChunkEntry, signal: AbortSignal) => Promise<string>) | null,
) {
  const loader = createChunkLoader(chunkManifest, createChunkCache(storage), network, bundledChunk);
  return {
    ...loader,
    async ensure(
      report: {
        catalogVersion: string;
        sourceYear: number | null;
        selectedYear: number;
        records: readonly { record: { id: string } }[];
      },
      signal: AbortSignal,
      lod: 'fine' | 'coarse' = 'fine',
    ) {
      if (report.catalogVersion !== chunkManifest.catalogVersion)
        throw new Error('CHUNK_CATALOG_VERSION');
      const ids = report.records.map((h) => h.record.id);
      const entries = discoverChunks(chunkManifest, {
        year: report.sourceYear ?? report.selectedYear,
        lod,
        recordIds: ids,
      });
      if (ids.some((id) => !entries.some((e) => e.recordId === id)))
        throw new Error('CHUNK_COVERAGE_MISMATCH');
      const values: { entry: ChunkEntry; result: Awaited<ReturnType<typeof loader.load>> }[] = [];
      // Do not create a catalog-sized Promise queue: batches never exceed loader concurrency.
      for (let offset = 0; offset < entries.length; offset += 2) {
        const batch = await Promise.all(
          entries
            .slice(offset, offset + 2)
            .map(async (entry) => ({ entry, result: await loader.load(entry, signal) })),
        );
        if (signal.aborted) throw new Error('CHUNK_ABORT');
        values.push(...batch);
      }
      const status: DataLoadStatus = {
        origins: [...new Set(values.map((v) => v.result.origin))],
        chunks: values.length,
        cacheWarning: values.some((v) => v.result.cacheWarning),
        catalogVersion: report.catalogVersion,
      };
      return { values, status };
    },
  };
}
