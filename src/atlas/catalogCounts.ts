import { historyManifest } from '../history/generated/manifest.ts';
import { peopleCoverage } from '../people/discovery.ts';
import { worldManifest } from '../data/world/generated/manifest.ts';
import type { LayerId } from './presentation.ts';

export type LayerCatalogCounts = Readonly<Partial<Record<LayerId, number | null>>>;

/** Real catalog totals for the floating layer rail — not year-slice visibility. */
export function readLayerCatalogCounts(): LayerCatalogCounts {
  let wars = 0;
  let events = 0;
  for (const row of historyManifest.rows) {
    if (row.kind !== 'event') continue;
    if (row.group === 'battle' || row.group === 'war') wars += 1;
    else if (row.group === 'event') events += 1;
  }
  return {
    state: worldManifest.rows.length,
    culture: 0,
    person: peopleCoverage.profiles,
    war: wars,
    event: events,
    labels: null,
  };
}
