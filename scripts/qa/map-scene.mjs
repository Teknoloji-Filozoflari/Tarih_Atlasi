import { readFile } from 'node:fs/promises';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { worldTerritory } from '../../src/data/world/records.ts';
import { containsPoliticalPoint } from '../../src/politics/geometry.ts';
import { polityWikidataId } from '../../src/sources/polity-identity.ts';
import { hasWorldGeometry } from '../../src/data/world/review.ts';
const year = process.argv[2] === undefined ? 2010 : Number(process.argv[2]);
const world = createWorldRepository(worldManifest, async (i, pack) =>
  readFile(new URL(`../../assets/world/${pack.sha256}.atlas`, import.meta.url), 'utf8'),
);
const records = await world.territories(year);
const box = [0, 10, 42, 34];
const intersects = (b) => b && b[0] <= box[2] && b[2] >= box[0] && b[1] <= box[3] && b[3] >= box[1];
const effective = records.filter((r) => intersects(world.rowFor(r.id).bbox));
const rawRows = worldManifest.rows.filter(
  (r) => r.start <= year && r.end >= year && !r.legacy && r.pack !== null && intersects(r.bbox),
);
const packs = await world.loader.loadMany(
  rawRows.map((r) => r.pack),
  new AbortController().signal,
);
const original = rawRows.map((row) => worldTerritory(row, packs.get(row.pack)[row.key]));
function grid(values) {
  let probes = 0;
  const overlaps = [];
  for (let lat = 10; lat <= 34; lat += 2)
    for (let lng = 0; lng <= 42; lng += 2) {
      probes++;
      const hits = values.filter((r) => containsPoliticalPoint(r.geometry, [lng, lat]));
      if (hits.length > 1)
        overlaps.push({ point: [lng, lat], sourceRecords: hits.map((r) => r.id) });
    }
  return { probes, overlapProbes: overlaps.length, examples: overlaps.slice(0, 12) };
}
const rows = world.rowsAt(year),
  geometries = new Map(),
  duplicates = [];
for (const row of rows.filter(hasWorldGeometry)) {
  const key = row.reviewedGeometryKey ?? row.key;
  const previous = geometries.get(key);
  if (previous) duplicates.push([previous.index, row.index]);
  else geometries.set(key, row);
}
console.log(
  JSON.stringify(
    {
      year,
      scope:
        'Authenticated political source diagnostics only; North Africa sampling grid is not historical evidence or full topology certification. Legacy pilot rows are counted in summary but excluded from this grid.',
      summary: world.summary(year),
      reviewedSupplementRecords: records
        .filter((r) => world.rowFor(r.id)?.reviewedGeometryKey)
        .map((r) => ({
          id: r.id,
          period: [r.temporal.start.date.year, r.temporal.end.date.year],
          wikidataId: polityWikidataId(r),
          note: r.temporal.sourceDate.text,
        })),
      sourceIdentityCandidates: rows.filter((r) => polityWikidataId(worldTerritory(r, null)))
        .length,
      partialRecords: records
        .filter((r) => r.extentType === 'partial-area')
        .map((r) => ({ id: r.id, note: r.borderPrecision.description })),
      withheld: rows
        .filter((r) => r.withheld)
        .map((r) => ({ index: r.index, name: r.name, reason: r.withheld })),
      duplicateDrawableGeometryPairs: duplicates,
      northAfricaOriginalSource: grid(original),
      northAfricaReviewed: grid(effective),
    },
    null,
    2,
  ),
);
