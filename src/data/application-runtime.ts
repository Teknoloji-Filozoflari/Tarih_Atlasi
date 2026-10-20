import { dataRuntime } from './chunks/runtime';
import { worldRepository } from './world/runtime';
import type { DataLoadStatus } from './chunks/runtime-core';
import { peopleExtension } from '../people/runtime';
import { historyArchive } from '../history/runtime';
export async function ensureApplicationData(
  report: Parameters<typeof dataRuntime.ensure>[0],
  signal: AbortSignal,
  lod: 'fine' | 'coarse' = 'fine',
) {
  const world = report.records.filter((r) => r.record.id.startsWith('world:'));
  if (world.length) {
    const records = await worldRepository.territories(
      report.sourceYear ?? report.selectedYear,
      signal,
    );
    const ids = new Set(records.map((r) => r.id));
    if (world.some((r) => !ids.has(r.record.id))) throw new Error('WORLD_COVERAGE_SCOPE');
  }
  const result = await dataRuntime.ensure(
    {
      ...report,
      records: report.records.filter(
        (r) =>
          !r.record.id.startsWith('world:') &&
          !peopleExtension.hasGeometry(r.record.id) &&
          !historyArchive.hasGeometry(r.record.id),
      ),
    },
    signal,
    lod,
  );
  const packs = new Set(world.map((r) => worldRepository.rowFor(r.record.id)?.pack));
  const status: DataLoadStatus = {
    ...result.status,
    chunks: result.status.chunks + packs.size,
    origins: [
      ...result.status.origins,
      ...(world.length ? ['asset' as const] : []),
      ...(report.records.some(
        (r) => peopleExtension.hasGeometry(r.record.id) || historyArchive.hasGeometry(r.record.id),
      )
        ? ['bundled' as const]
        : []),
    ],
  };
  return { ...result, status };
}

export const applicationDataRuntime = {
  ...dataRuntime,
  clearMemory() {
    dataRuntime.clearMemory();
    worldRepository.clear();
    historyArchive.clear();
  },
  stats() {
    return { ...dataRuntime.stats(), world: worldRepository.loader.stats() };
  },
};
