// SYNTHETIC ONLY. Imaginary overlapping cultures; never imported by the application.
import { fixtureCatalog, simulateReviewed, record, extent } from './historical.mjs';
export function culturalFixture(count = 2) {
  const catalog = simulateReviewed(fixtureCatalog());
  for (const r of [...catalog.sources, ...catalog.records])
    r.temporal = {
      ...extent(-2, 2),
      reviewStatus: 'verified',
      support: { kind: 'continuous', note: 'SYNTHETIC TEST support only' },
    };
  const base = catalog.records.find((r) => r.kind === 'cultural-region');
  catalog.records = catalog.records.filter((r) => r.kind !== 'cultural-region');
  for (let i = 0; i < count; i++) {
    const entity = record(`test:culture-entity-${i}`, {
      kind: 'entity',
      entityType: ['CULTURE', 'CIVILIZATION', 'CULTURAL_REGION'][i % 3],
    });
    entity.reviewStatus = 'verified';
    entity.synthetic = false;
    entity.temporal = structuredClone(base.temporal);
    catalog.records.push(entity);
    catalog.records.push({
      ...structuredClone(base),
      id: `test:culture-area-${i}`,
      entityId: entity.id,
    });
  }
  return catalog;
}
