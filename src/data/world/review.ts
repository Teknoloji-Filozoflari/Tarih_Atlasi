import type { AreaGeometry, BBox } from '../../domain/types.ts';
import type { WorldRow } from './types.ts';
import { sha256 } from '../chunks/hash.ts';
import { normalizeWorldGeometry } from './geometry.ts';
import { worldTerritory } from './records.ts';
import { countryReviewJson } from './generated/country-review.ts';
import { WORLD_ARCHIVE_SHA } from './types.ts';

const countryReviewSha = '04ac9985540cc510c834c42118a40af0a6adb7da4b1b43819b3030de6bb88aec';
if (sha256(countryReviewJson) !== countryReviewSha) throw new Error('COUNTRY_REVIEW_PIN');
const countries = JSON.parse(countryReviewJson) as {
  version: string;
  archiveSha256: string;
  license: string;
  rows: {
    index: number;
    name: string;
    start: number;
    end: number;
    qid: string;
    geometrySha256: string;
    geometry: AreaGeometry;
    bbox: BBox;
    reason: string;
    isolatedShellTangencies: boolean;
    reviewedQid: string;
    label: string;
    identityName: string;
    partialArea: boolean;
    note: string;
  }[];
};
if (
  countries.version !== '2.0.0' ||
  countries.archiveSha256 !== WORLD_ARCHIVE_SHA ||
  countries.license !== 'CC-BY-4.0' ||
  countries.rows.length !== 12
)
  throw new Error('COUNTRY_REVIEW_SCOPE');
const countryRows = new Map(
  countries.rows.map((row) => {
    if (sha256(JSON.stringify(row.geometry)) !== row.geometrySha256)
      throw new Error('COUNTRY_REVIEW_GEOMETRY');
    normalizeWorldGeometry(row.geometry, true, {
      isolatedShellTangencies: row.isolatedShellTangencies,
    });
    return [row.index, row] as const;
  }),
);
// Identity-only corrections, verified against the linked Wikidata items on 2026-10-19.
// Scoped to pinned 2024 rows: no border or date inference, no changes to raw QIDs.
const identity2024 = new Map([
  [
    13643,
    {
      name: 'Republic of Korea',
      original: 'Q423',
      qid: 'Q884',
      key: 'a32c3d64d6935138761258fc2e5743b6269a65e59adc0b100fc485cca226be12',
    },
  ],
  [
    13717,
    {
      name: 'Republic of China',
      original: 'Q148',
      qid: 'Q865',
      key: '5c17589a5a2c75629ef335aa136d21bfdf34e76a0bc7dda356d36e1935824591',
    },
  ],
  [
    13738,
    {
      name: 'Republic of the Congo',
      original: 'Q974',
      qid: 'Q971',
      key: 'b2b6590c8d1acf21d15cf53ad242a1955cb21668cd4a7c9f0c8f7a2184cf5a0f',
    },
  ],
  [
    13769,
    {
      name: 'Guinea',
      original: 'Q983',
      qid: 'Q1006',
      key: 'f552a0592171bf7c1497e644ef649ec6b0b0131f091546390fe18dd1ebab54f7',
    },
  ],
]);
export const hasWorldGeometry = (row: WorldRow) => row.pack !== null || !!row.reviewedGeometryKey;
export function reviewedSupplementGeometry(row: WorldRow): AreaGeometry | null {
  const extra = countryRows.get(row.index);
  return extra && row.reviewedGeometryKey === extra.geometrySha256 ? extra.geometry : null;
}

/** Review overlay over authenticated source bytes; never edits the upstream catalog.
 * France's source row includes Algeria, former occupations and dependencies over
 * 1961–2023. Retain only the two reviewed metropolitan components as partial area.
 * See docs/reports/application-review-2010.md for sources and limitations.
 */
export const worldSpatialReviewVersion = '1.1.0';
export const FRANCE_PARTIAL_ROW = 13247;
const franceKey = 'ba77ae4917239336786f40c490b2799d8ee5eb12fc26ded120f13a6150a2c824';
const franceParts = [
  [5, '45215622b5db18a04dbab8851a37bcce3a6df380837f65f3895bb7eb25571ab8'],
  [6, '7b32b21c725ddfe784d20600e6b03fa87269c3bd84f589be683fd1d9b07f4f9a'],
] as const;

export function reviewedWorldRow(row: WorldRow): WorldRow {
  const identity = identity2024.get(row.index);
  if (
    identity &&
    (row.name !== identity.name ||
      row.start !== 2024 ||
      row.end !== 2024 ||
      row.key !== identity.key)
  )
    throw new Error('COUNTRY_2024_IDENTITY_REVIEW_MISMATCH');
  if (
    row.index === 13749 &&
    (row.name !== 'Syria' ||
      row.start !== 2024 ||
      row.end !== 2024 ||
      row.key !== '40fdfc157bc7c7bdd57507ba3d6660ff7034334e1d06b6b683737291c3fe01aa')
  )
    throw new Error('SYRIA_2024_REVIEW_MISMATCH');
  const country = countryRows.get(row.index);
  if (country) {
    if (
      row.name !== country.name ||
      row.start !== country.start ||
      row.end !== country.end ||
      row.withheld !== country.reason ||
      row.pack !== null ||
      row.key !== null ||
      row.legacy
    )
      throw new Error('COUNTRY_REVIEW_ROW_MISMATCH');
    return {
      ...row,
      sourceName: row.name,
      name: country.identityName,
      reviewedLabel: country.label,
      reviewedQid: country.reviewedQid,
      reviewNote: country.note,
      bbox: country.bbox,
      withheld: null,
      reviewedGeometryKey: country.geometrySha256,
    };
  }
  if (row.index === 13116 || row.index === 13741) {
    const snapshot2024 = row.index === 13741;
    if (
      row.name !== '(Netherlands)' ||
      row.key !== '5d295ca52bee1461cf46adf17daa61f86b57f690d64e17d624b94ce5915b8a4a' ||
      row.start !== (snapshot2024 ? 2024 : 1950) ||
      row.end !== (snapshot2024 ? 2024 : 2023)
    )
      throw new Error('WORLD_SPATIAL_REVIEW_MISMATCH');
    return {
      ...row,
      pack: null,
      key: null,
      bbox: null,
      withheld: snapshot2024
        ? 'DUPLICATE_SOURCE_GEOMETRY_REVIEWED_CANONICAL_13771'
        : 'DUPLICATE_SOURCE_GEOMETRY_REVIEWED_CANONICAL_13120',
    };
  }
  if (row.index === FRANCE_PARTIAL_ROW) {
    if (
      row.name !== 'French Fifth Republic' ||
      row.key !== franceKey ||
      row.start !== 1961 ||
      row.end !== 2023
    )
      throw new Error('WORLD_SPATIAL_REVIEW_MISMATCH');
    // Derived bounds of the exact retained source components; not modern data.
    return {
      ...row,
      bbox: [-4.911745548248291, 41.32738494873047, 9.577608108520508, 51.17921447753906],
    };
  }
  return row;
}

export function reviewedWorldTerritory(row: WorldRow, sourceGeometry: AreaGeometry | null) {
  let geometry = sourceGeometry;
  if (row.index === FRANCE_PARTIAL_ROW && geometry) {
    if (
      row.key !== franceKey ||
      geometry.type !== 'MultiPolygon' ||
      sha256(JSON.stringify(geometry)) !== franceKey
    )
      throw new Error('WORLD_REVIEW_GEOMETRY_MISMATCH');
    const source = geometry;
    const coordinates = franceParts.map(([index, hash]) => {
      const part = source.coordinates[index];
      if (!part || sha256(JSON.stringify(part)) !== hash)
        throw new Error('WORLD_REVIEW_COMPONENT_MISMATCH');
      return part;
    });
    geometry = normalizeWorldGeometry({ type: 'MultiPolygon', coordinates }).geometry;
  }
  const territory = worldTerritory(row, geometry);
  const identity = identity2024.get(row.index);
  if (identity) {
    reviewedWorldRow(row);
    territory.wikidataId = identity.qid;
    territory.temporal.sourceDate.text += ` Kaynak kimliği ${identity.original} bu 2024 satırındaki ülkeyle eşleşmediği için ${identity.qid} olarak düzeltildi. Özgün eşleştirme ham kaynakta korunur; geometri/tarih bu kimlik düzeltmesinden türetilmez. Kimlik incelemesi: https://www.wikidata.org/wiki/${identity.qid} .`;
    territory.evidence[0]!.transformationIds.push('transform:country-2024-identity-review-v1');
  }
  if (row.index === 13749) {
    reviewedWorldRow(row);
    territory.wikidataId = 'Q858';
    territory.extentType = 'partial-area';
    const note =
      ' Kaynak Suriye geometrisi kuzey/kuzeydoğu inceleme noktalarını kapsamıyor; tam ülke alanı veya belgelenmiş fiilî kontrol haritası değildir. Boş alan ülkesiz bölge anlamına gelmez. Kaynaktaki Q41137 Asur İmparatorluğu kimliğidir; ülke bağlantısı Q858 Suriye olarak düzeltildi. Kimlik kaynakları: https://www.wikidata.org/wiki/Q41137 ve https://www.wikidata.org/wiki/Q858 .';
    territory.temporal.sourceDate.text += note;
    territory.borderPrecision.description += note;
    territory.evidence[0]!.transformationIds.push('transform:syria-2024-scope-review-v1');
  }
  if (row.reviewedGeometryKey) {
    const review = countryRows.get(row.index)!;
    territory.borderPrecision.description += ' ' + review.note;
    if (review.partialArea) territory.extentType = 'partial-area';
  }
  if (row.index === FRANCE_PARTIAL_ROW) {
    territory.extentType = 'partial-area';
    territory.borderPrecision.description +=
      ' Yalnız kaynak geometrisinin incelenmiş Avrupa anakarası ve Korsika bileşenleri gösterilir. Cezayir, eski işgal alanları ve diğer denizaşırı parçalar bu dönemle uyuşmadığı veya ayrıca incelenmediği için çıkarıldı. Bu, Fransa’nın tam alanı değildir.';
    territory.temporal.sourceDate.text += ` Mekânsal inceleme ${worldSpatialReviewVersion}: kaynak bileşenleri 5 ve 6, koordinatlar değiştirilmeden kısmi alan olarak ayrıldı.`;
    territory.evidence[0]!.transformationIds.push('transform:france-metropolitan-source-subset-v1');
  }
  return territory;
}
