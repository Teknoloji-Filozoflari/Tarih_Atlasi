import type { DeepReadonly } from '../data/provider.ts';
import type { TerritoryVersion } from '../domain/types.ts';
import { WORLD_ARCHIVE_SHA, WORLD_SOURCE, WORLD_REVISION } from '../data/world/types.ts';
import {
  polityIdentityArchive,
  polityIdentityIds,
  polityIdentitySha,
} from './generated/polity-identities.ts';
import { sha256 } from '../data/chunks/hash.ts';
import { isQid } from './sitelinks.ts';

// Reviewed extraction of source-provided QIDs, not approval of Wikipedia titles.
const expected = 'ed0da9156a1b5fabc6e3f6016ccf3537a8a8fafd5ebcd13a6fdf92dbbbeef92b';
if (
  polityIdentityArchive !== WORLD_ARCHIVE_SHA ||
  polityIdentitySha !== expected ||
  sha256(JSON.stringify(polityIdentityIds)) !== expected
)
  throw new Error('POLITY_IDENTITY_INTEGRITY');
Object.freeze(polityIdentityIds);
export function polityWikidataId(record: DeepReadonly<TerritoryVersion>): string | null {
  if (record.synthetic || record.reviewStatus !== 'verified') return null;
  if (isQid(record.wikidataId)) return record.wikidataId;
  const match = /^(?:world:clio-r|atlas:clio-r)(\d+)(?:-area-\d+)?$/.exec(record.id);
  if (!match) return null;
  const index = match[1]!;
  const trusted = record.evidence.some(
    (e) =>
      ((e.sourceId === WORLD_SOURCE &&
        e.sourceRevision === WORLD_REVISION &&
        e.rawInputId === 'input:cliopatria-v021-archive') ||
        (e.sourceId === 'source:cliopatria-v021-reviewed-rows' &&
          e.sourceRevision === 'v0.2.1-selected-rows-1' &&
          e.rawInputId === 'input:cliopatria-reviewed-rows')) &&
      e.locator.startsWith(`cliopatria_polities_only_v021.geojson; Feature[${index}] (0-based);`),
  );
  return trusted && isQid(polityIdentityIds[index]) ? polityIdentityIds[index]! : null;
}
