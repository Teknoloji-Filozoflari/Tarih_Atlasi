import { modernCitySnapshot } from './generated/modern-cities.ts';
import type { PlaceRow, PlacesManifest } from './catalog.ts';
export interface ModernCity {
  readonly id: string;
  readonly name: string;
  readonly wikidataId?: string;
  readonly coordinate: readonly [number, number];
  readonly sourceUrl: string;
  readonly revision: string;
  readonly reviewedAt: string;
  readonly licenseId: 'CC0-1.0' | 'CC-BY-4.0';
  readonly locator: string;
  readonly featureCode?: PlaceRow[4];
  readonly countryCode?: string;
  readonly countryName?: string;
  readonly admin1?: string;
  readonly admin2?: string;
  readonly adminCodes?: readonly string[];
  readonly modifiedAt?: string;
  readonly packIndex?: number;
  readonly labelPriority?: number;
}
export const MODERN_CITY_MIN_ZOOM = 4;
// Deliberately independent of HistoricalPlace/TemporalExtent and historical coverage.
export const modernCities: readonly ModernCity[] = Object.freeze(
  modernCitySnapshot.cities.map((c) =>
    Object.freeze({
      id: c.id,
      name: c.name,
      wikidataId: c.qid,
      revision: c.revision,
      coordinate: Object.freeze([
        c.longitude[0] + c.longitude[1] / 60 + c.longitude[2] / 3600,
        c.latitude[0] + c.latitude[1] / 60 + c.latitude[2] / 3600,
      ]) as readonly [number, number],
      sourceUrl: `https://www.wikidata.org/w/index.php?title=${c.qid}&oldid=${c.revision}`,
      reviewedAt: modernCitySnapshot.reviewedAt,
      licenseId: modernCitySnapshot.licenseId,
      locator: c.locator,
    }),
  ),
);
export const getModernCity = (id: string) => modernCities.find((c) => c.id === id) ?? null;

export function geoNameCity(
  row: PlaceRow,
  manifest: PlacesManifest,
  packIndex: number,
): ModernCity {
  return Object.freeze({
    id: `geonames:${row[0]}`,
    name: row[1],
    coordinate: Object.freeze([row[2], row[3]]) as readonly [number, number],
    sourceUrl: `https://www.geonames.org/${row[0]}/`,
    revision: manifest.version!,
    reviewedAt: manifest.downloadedAt!,
    licenseId: 'CC-BY-4.0',
    locator: `GeoNames ${row[0]} · ${row[4]}`,
    featureCode: row[4],
    countryCode: row[5],
    countryName: manifest.countries.find((c) => c.code === row[5])!.name,
    admin1: row[7],
    admin2: row[9],
    adminCodes: Object.freeze([row[6], row[8], row[10], row[11]]),
    modifiedAt: row[12],
    packIndex,
    labelPriority: (row[4].startsWith('ADM') ? 0 : 20) + Math.log10(Math.max(1, row[13])),
  });
}
