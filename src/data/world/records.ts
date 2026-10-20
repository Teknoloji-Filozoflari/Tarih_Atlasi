import type {
  HistoricalEntity,
  TerritoryVersion,
  TemporalExtent,
  RawInput,
  SourceRecord,
  AreaGeometry,
} from '../../domain/types.ts';
import { sha256 } from '../chunks/hash.ts';
import type { WorldRow } from './types.ts';
import { WORLD_SOURCE, WORLD_REVISION, WORLD_ARCHIVE_SHA, WORLD_ATTRIBUTION } from './types.ts';
import { worldNames } from './names.ts';
const entityIds = new Map<string, string>();
export const worldEntityId = (name: string) => {
  const found = entityIds.get(name);
  if (found) return found;
  const id = `world:clio-e${sha256(name).slice(0, 24)}`;
  if (entityIds.size >= 2000) entityIds.delete(entityIds.keys().next().value!);
  entityIds.set(name, id);
  return id;
};
export const worldTerritoryId = (row: WorldRow) => `world:clio-r${row.index}`;
export function worldTemporal(start: number, end: number): TemporalExtent {
  return {
    start: { kind: 'known', date: { year: start, month: null, day: null } },
    end: { kind: 'known', date: { year: end, month: null, day: null } },
    precision: 'range',
    uncertain: true,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: `Cliopatria v0.2.1 FromYear=${start}, ToYear=${end}; iki uç dahil kaynak aralığı. Yıl bazında bağımsız gözlem değildir.`,
      calendar: 'source integer years',
      yearNumbering: 'negative BCE; positive CE; zero not accepted',
    },
    basis: 'derived',
    reviewStatus: 'verified',
    support: {
      kind: start === end ? 'snapshot' : 'continuous',
      note: 'Yalnız yayımlanmış kaynak aralığının yaklaşık rekonstrüksiyonu; bağımsız tarihî doğruluk onayı değildir.',
    },
  };
}
function common(id: string, name: string, start: number, end: number) {
  const translated = worldNames[name];
  return {
    id,
    names: [{ language: translated ? 'tr' : 'en', value: translated ?? name }],
    alternativeNames: translated ? [{ language: 'en', value: name }] : [],
    wikidataId: null,
    temporal: worldTemporal(start, end),
    confidence: {
      level: 'low' as const,
      rationale:
        'Yayıncı kaynak rekonstrüksiyonu. Hak/hash/biçim/topoloji kontrolleri tarihî egemenliğin bağımsız uzman doğrulaması değildir.',
      spatialAccuracyKm: null,
    },
    licenseId: 'CC-BY-4.0',
    attribution: WORLD_ATTRIBUTION,
    reviewStatus: 'verified' as const,
    synthetic: false,
  };
}
const evidence = (r: WorldRow, geometry = false) => [
  {
    sourceId: WORLD_SOURCE,
    sourceRevision: WORLD_REVISION,
    rawInputId: 'input:cliopatria-v021-archive',
    locator: `cliopatria_polities_only_v021.geojson; Feature[${r.index}] (0-based); Name=${r.sourceName ?? r.name}; FromYear=${r.start}; ToYear=${r.end}`,
    claims: geometry
      ? ['identity' as const, 'temporal' as const, 'geometry' as const]
      : ['identity' as const, 'temporal' as const],
    licenseId: 'CC-BY-4.0',
    attribution: WORLD_ATTRIBUTION,
    basis: 'derived' as const,
    transformationIds: ['transform:cliopatria-world-v2'],
  },
];
function applyCountryReview(record: HistoricalEntity | TerritoryVersion, row: WorldRow) {
  if (!row.reviewedGeometryKey) return record;
  record.evidence[0]!.transformationIds.push('transform:cliopatria-country-review-v2');
  if (row.reviewedLabel) {
    record.names = [{ language: 'tr', value: row.reviewedLabel }];
    record.alternativeNames = [{ language: 'en', value: row.sourceName ?? row.name }];
  }
  record.wikidataId = row.reviewedQid ?? null;
  record.temporal.sourceDate.text += ` ${row.reviewNote ?? ''}`;
  return record;
}
export const worldInput: RawInput = {
  id: 'input:cliopatria-v021-archive',
  relativePath: 'data/staging/map-sources/cliopatria-v0.2.1.geojson.zip',
  bytes: 46005176,
  sha256: WORLD_ARCHIVE_SHA,
  sourceId: WORLD_SOURCE,
  sourceRevision: WORLD_REVISION,
};
export const worldSource: SourceRecord = {
  ...common(WORLD_SOURCE, 'Cliopatria 0.2.1 — dünya siyasi rekonstrüksiyonları', -3400, 2024),
  kind: 'source',
  sourceKey: 'cliopatria',
  url: 'https://github.com/Seshat-Global-History-Databank/cliopatria/blob/v0.2.1/cliopatria.geojson.zip',
  revision: WORLD_REVISION,
  retrievedAt: '2026-10-16T20:31:52.000Z',
  rawInputId: worldInput.id,
  upstreamIds: [],
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  licenseScope: 'data',
  objectLicense: null,
  membersReviewed: false,
};
export function worldEntity(
  row: WorldRow,
  periods?: { start: number; end: number }[],
  rows: readonly WorldRow[] = [row],
): HistoricalEntity {
  const value: HistoricalEntity = {
    ...common(worldEntityId(row.name), row.name, row.start, row.end),
    kind: 'entity',
    entityType: 'POLITY',
    evidence: evidence(row),
  };
  if (periods?.length) {
    value.temporal = worldTemporal(periods[0]!.start, periods.at(-1)!.end);
    value.temporal.periods = periods.map((p) => ({
      start: { year: p.start, month: null, day: null },
      end: { year: p.end, month: null, day: null },
    }));
  }
  value.evidence[0]!.locator = `cliopatria_polities_only_v021.geojson; Name=${row.sourceName ?? row.name}; Feature[${rows.map((r) => r.index).join(',')}] (0-based); source intervals merged with gaps preserved`;
  value.temporal.sourceDate.text = `Cliopatria v0.2.1: ${rows.length} kaynak satırının belgelenmiş aralıklarının birleşimi; boşluklar korunur. Tek bir yaşam/egemenlik dönemi veya bağımsız yıllık ölçüm iddiası değildir.`;
  applyCountryReview(value, row);
  return value;
}
export function worldTerritory(row: WorldRow, geometry: AreaGeometry | null): TerritoryVersion {
  const value: TerritoryVersion = {
    ...common(worldTerritoryId(row), row.name, row.start, row.end),
    kind: 'territory',
    entityId: worldEntityId(row.name),
    interpretationId: 'interpretation:cliopatria-v021',
    scopeId: `scope:cliopatria-world-r${row.index}`,
    boundary: 'approximate',
    geometry,
    geometryReason: geometry ? null : (row.withheld ?? 'SOURCE_GEOMETRY_NOT_LOADED'),
    extentType: 'full-area',
    politicalStatus: 'unknown',
    counterpartEntityIds: [],
    borderPrecision: {
      classification: 'reconstructed',
      toleranceKm: null,
      description:
        'Cliopatria kaynak rekonstrüksiyonu; kesin/ölçülmüş sınır veya fiilî egemenlik iddiası değildir. Özgün bileşenler ve dönem korunur; başkent, nüfus ve vasallık çıkarılmaz.',
    },
    evidence: evidence(row, geometry !== null),
  };
  applyCountryReview(value, row);
  return value;
}
