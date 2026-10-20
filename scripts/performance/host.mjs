import { performance } from 'node:perf_hooks';
import { cpus, platform, arch } from 'node:os';
import { writeFile } from 'node:fs/promises';
import { pilotTimeline, historicalFeatures } from '../../src/data/pilot.ts';
import { clusterPersonPoints } from '../../src/persons/clustering.ts';
import { choosePoliticalLabels } from '../../src/politics/selection.ts';
import { chunkManifest } from '../../src/data/chunks/generated/manifest.ts';
import { bundledChunk } from '../../src/data/chunks/generated/bundled.ts';
import { createChunkCache, memoryStorage } from '../../src/data/chunks/cache.ts';
import { createChunkLoader } from '../../src/data/chunks/loader.ts';
import { createMetrics } from '../../src/performance/metrics.ts';
const out = process.argv[2] ?? 'docs/reports/phase-15-host-benchmark.json';
const percentile = (values, p) =>
  [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * p)];
async function sample(name, run, count = 100) {
  const samples = [];
  for (let i = 0; i < count; i++) {
    const start = performance.now();
    await run(i);
    samples.push(performance.now() - start);
  }
  return {
    name,
    iterations: count,
    medianMs: percentile(samples, 0.5),
    p95Ms: percentile(samples, 0.95),
    minMs: Math.min(...samples),
    maxMs: Math.max(...samples),
  };
}
const entry = chunkManifest.entries.find((e) => e.lod === 'fine');
const storage = memoryStorage(),
  cache = createChunkCache(storage),
  loader = createChunkLoader(chunkManifest, cache, null, bundledChunk);
const measurements = [];
measurements.push(
  await sample(
    'cold-bundled-chunk-verify-parse-in-memory-storage',
    async () => {
      const l = createChunkLoader(
        chunkManifest,
        createChunkCache(memoryStorage()),
        null,
        bundledChunk,
      );
      await l.load(entry, new AbortController().signal);
    },
    30,
  ),
);
await loader.load(entry, new AbortController().signal);
measurements.push(
  await sample(
    'warm-memory-chunk-verify-parse',
    () => loader.load(entry, new AbortController().signal),
    200,
  ),
);
measurements.push(
  await sample(
    'timeline-scrub-selected-years',
    (i) =>
      pilotTimeline.getDataCoverage([-2000, -431, 1066, 1648, 1867, 1880, 1990, 2026][i % 8], {
        includeApproximatePersons: true,
      }),
    1000,
  ),
);
measurements.push(
  await sample(
    'historical-feature-construction',
    (i) =>
      historicalFeatures(
        {
          year: i % 2 ? 1867 : 1880,
          polity: true,
          culture: true,
          person: true,
          includeApproximatePersons: true,
        },
        3,
      ),
    200,
  ),
);
const points = Array.from({ length: 1000 }, (_, i) => ({
  id: `test:synthetic-${i}`,
  x: (i * 31) % 1280,
  y: (i * 17) % 720,
}));
measurements.push(
  await sample(
    'SYNTHETIC-1000-marker-cluster-CPU',
    () => clusterPersonPoints(points, 1280, 720, 3),
    100,
  ),
);
const labels = points.map((p, i) => ({
  ...p,
  text: 'SYNTHETIC TEST LABEL',
  priority: i,
  small: false,
  selected: false,
}));
measurements.push(
  await sample(
    'SYNTHETIC-1000-label-collision-CPU',
    () => choosePoliticalLabels(labels, 1280, 720, 3),
    100,
  ),
);
const checkpoints = [];
for (let round = 0; round < 6; round++) {
  for (let i = 0; i < 200; i++) {
    await loader.load(
      chunkManifest.entries[i % chunkManifest.entries.length],
      new AbortController().signal,
    );
    await pilotTimeline.getDataCoverage((i % 4000) - 2000 || 1, {
      includeApproximatePersons: true,
    });
  }
  if (global.gc) global.gc();
  checkpoints.push({
    round,
    heapUsedBytes: process.memoryUsage().heapUsed,
    rssBytes: process.memoryUsage().rss,
    cache: cache.stats(),
    timeline: pilotTimeline.cacheInfo(),
  });
}
const metrics = createMetrics();
for (let i = 0; i < 10000; i++) metrics.record('bounded', i);
const report = {
  measuredAt: new Date().toISOString(),
  kind: 'HOST_CPU_ONLY_NOT_BROWSER_OR_ANDROID',
  environment: {
    node: process.version,
    platform: platform(),
    arch: arch(),
    cpu: cpus()[0]?.model,
    gcAvailable: Boolean(global.gc),
  },
  parameters: {
    coldIterations: 30,
    warmIterations: 200,
    scrubIterations: 1000,
    memoryRounds: 6,
    chunkEntries: chunkManifest.entries.length,
  },
  measurements,
  checkpoints,
  bounded: {
    metricSamples: metrics.snapshot().bounded.samples.length,
    chunkMemoryBytes: cache.stats().memoryBytes,
    timelineCacheEntries: pilotTimeline.cacheInfo().size,
  },
  excluded: [
    'No FPS, GPU memory, touch latency, Android PSS, battery, temperature or browser start time was measured.',
    'RSS/heap checkpoints do not establish absence of leaks; CPU workloads use real pilot and explicitly synthetic dense points.',
  ],
};
await writeFile(out, JSON.stringify(report, null, 2) + '\n');
console.log(`Measured ${measurements.length} host workloads; report ${out}`);
