import type {
  CulturalRegion,
  HistoricalEntity,
  PersonLocation,
  TerritoryVersion,
} from '../../src/domain/types';

// Negative compile checks run in both platform typechecks; no runtime synthetic data.
const point: PersonLocation['geometry'] = { type: 'Point', coordinates: [0, 0] };
// @ts-expect-error Kişi konumuna siyasi polygon atanamaz.
const invalidLocation: PersonLocation['geometry'] = { type: 'Polygon', coordinates: [] };
// @ts-expect-error Kültür alanı siyasi territory kaydıyla aynı tür değildir.
const invalidCultureKind: CulturalRegion['kind'] = 'territory';
// @ts-expect-error Devlet sınırına Point atanamaz.
const invalidTerritory: TerritoryVersion['geometry'] = point;
// @ts-expect-error Tanımlanmamış katman/oyun türü kabul edilmez.
const invalidEntity: HistoricalEntity['entityType'] = 'QUEST';
void [invalidLocation, invalidCultureKind, invalidTerritory, invalidEntity];
