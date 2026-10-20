import { readBounded, sha256 } from '../etl/pipeline.mjs';
import { parse } from '../../src/domain/schema.ts';
import { geometrySchema, geometryBounds } from '../../src/domain/geometry.ts';
export const CLIO_SOURCE = 'source:cliopatria-v021-reviewed-rows';
export const CLIO_REVISION = 'v0.2.1-selected-rows-1';
export const CLIO_ATTRIBUTION =
  'Cliopatria / Seshat Global History Databank, v0.2.1 (Bennett et al.); CC BY 4.0. Seçilmiş kaynak rekonstrüksiyonu; halka yönü ve parça ayrımı dönüştürüldü.';
/** Reverse winding only; preserve every source vertex and every disconnected component. */
export function normalizedPolityParts(geometry) {
  const value = structuredClone(geometry);
  const polygons =
    value.type === 'Polygon'
      ? [value.coordinates]
      : value.type === 'MultiPolygon'
        ? value.coordinates
        : null;
  if (!polygons) throw new Error('CLIO_GEOMETRY_TYPE');
  for (const polygon of polygons)
    for (const [i, ring] of polygon.entries()) {
      let area = 0;
      for (let k = 0; k < ring.length - 1; k++)
        area += ring[k][0] * ring[k + 1][1] - ring[k + 1][0] * ring[k][1];
      if (i === 0 ? area < 0 : area > 0) ring.reverse();
    }
  // Chunk discovery has a bounded eight-box index. Keep every component when splitting.
  if (parse(geometrySchema, value).ok && geometryBounds(value).length <= 8) return [value];
  const parts = polygons.map((coordinates) => ({ type: 'Polygon', coordinates }));
  for (const part of parts) {
    const r = parse(geometrySchema, part);
    if (!r.ok) throw new Error(`CLIO_GEOMETRY_REVIEW:${JSON.stringify(r.issues)}`);
  }
  return parts;
}
export async function appendPolitiesPilot(catalog, rawRoot) {
  const raw = await readBounded(new URL('cliopatria-reviewed-rows.json', rawRoot), 256 * 1024);
  const facts = JSON.parse(raw);
  if (
    facts.rows.length !== 16 ||
    facts.archiveSha256 !== 'e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4'
  )
    throw new Error('CLIO_REVIEW_SCOPE');
  const inputId = 'input:cliopatria-reviewed-rows';
  const transformId = 'transform:cliopatria-reviewed-parts-v1';
  const temporal = (from, to) => ({
    start: { kind: 'known', date: { year: from, month: null, day: null } },
    end: { kind: 'known', date: { year: to, month: null, day: null } },
    precision: 'range',
    uncertain: true,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: `Cliopatria v0.2.1: FromYear=${from}, ToYear=${to}; kaynak aralığı dahil. Gün/ay ve yıl bazında bağımsız ölçüm yok.`,
      calendar: 'source integer years',
      yearNumbering: 'negative BCE, positive CE; no zero',
    },
    basis: 'derived',
    reviewStatus: 'verified',
    support: {
      kind: 'continuous',
      note: 'Yalnız yayımlanan FromYear–ToYear aralığındaki rekonstrüksiyon; kesin/ölçülmüş sınır veya bu tarihlerde bağımsız gözlem değildir.',
    },
  });
  const metadata = (id, name, extent) => ({
    id,
    names: [{ language: 'tr', value: name }],
    alternativeNames: [],
    wikidataId: null,
    temporal: extent,
    confidence: {
      level: 'low',
      rationale:
        'Kaynak satırı/hak/geometri uyumu incelendi; tarihî egemenliğin bağımsız doğrulaması değildir. Yaklaşık yayımlanmış rekonstrüksiyon.',
      spatialAccuracyKm: null,
    },
    licenseId: 'CC-BY-4.0',
    attribution: CLIO_ATTRIBUTION,
    reviewStatus: 'verified',
    synthetic: false,
  });
  catalog.sources.push({
    ...metadata(CLIO_SOURCE, 'Cliopatria 0.2.1 — seçilmiş siyasi alanlar', temporal(-500, 2023)),
    kind: 'source',
    sourceKey: 'cliopatria',
    url: facts.archiveSource,
    revision: CLIO_REVISION,
    retrievedAt: facts.reviewedAt,
    rawInputId: inputId,
    upstreamIds: [],
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    licenseScope: 'data',
    objectLicense: null,
    membersReviewed: false,
  });
  catalog.inputs.push({
    id: inputId,
    relativePath: 'cliopatria-reviewed-rows.json',
    sha256: sha256(raw),
    bytes: raw.length,
    sourceId: CLIO_SOURCE,
    sourceRevision: CLIO_REVISION,
  });
  catalog.transformations.push({
    id: transformId,
    version: '1.0.0',
    description: `Sabit arşiv ${facts.archiveSha256}, üye ${facts.member};16 açık seçilmiş0-bazlısatır. Koordinatlar değiştirilmez; dış/delik halka yönünü normalleştir, gerekirse özgün MultiPolygon bileşenlerini ayrı Polygon kayıtları yap. QID/Wikipedia adayları kullanılmaz, orijinal özellikler raw içinde kalır.`,
    inputIds: [inputId],
  });
  let count = 0;
  for (const row of facts.rows) {
    const p = row.feature.properties;
    if (
      p.Type !== 'POLITY' ||
      !Number.isInteger(p.FromYear) ||
      !Number.isInteger(p.ToYear) ||
      !p.FromYear ||
      !p.ToYear ||
      p.FromYear > p.ToYear
    )
      throw new Error('CLIO_DATE_OR_TYPE');
    const extent = temporal(p.FromYear, p.ToYear);
    const entityId = `atlas:clio-r${row.index}`;
    const evidence = (claims) => [
      {
        sourceId: CLIO_SOURCE,
        sourceRevision: CLIO_REVISION,
        rawInputId: inputId,
        locator: `${facts.member}; Feature[${row.index}] (0-based); Name=${p.Name}; FromYear=${p.FromYear}; ToYear=${p.ToYear}`,
        claims,
        licenseId: 'CC-BY-4.0',
        attribution: CLIO_ATTRIBUTION,
        basis: 'derived',
        transformationIds: [transformId],
      },
    ];
    catalog.records.push({
      ...metadata(entityId, row.displayName, extent),
      kind: 'entity',
      entityType: 'POLITY',
      alternativeNames: [{ language: 'en', value: p.Name }],
      evidence: evidence(['identity', 'temporal']),
    });
    const parts = normalizedPolityParts(row.feature.geometry);
    for (const [part, geometry] of parts.entries()) {
      catalog.records.push({
        ...metadata(`${entityId}-area-${part}`, row.displayName, extent),
        kind: 'territory',
        entityId,
        interpretationId: 'interpretation:cliopatria-v021',
        scopeId: `scope:clio-r${row.index}-part${part}`,
        boundary: 'approximate',
        extentType: parts.length === 1 ? 'full-area' : 'partial-area',
        politicalStatus: 'unknown',
        counterpartEntityIds: [],
        geometry,
        geometryReason: null,
        borderPrecision: {
          classification: 'reconstructed',
          toleranceKm: null,
          description: `Cliopatria kaynak rekonstrüksiyonu; kesin sınır/fiilî egemenlik iddiası yok. ${parts.length > 1 ? `Özgün ülke geometrisinin ${part + 1}/${parts.length} bileşeni.` : 'Kaynak alan geometrisi korunur.'} Kaynak döneminin her yılı bağımsız ölçülmedi; bağımlılık/ortak yönetim ilişkileri bu pilotta çıkarılmadı.`,
        },
        evidence: evidence(['identity', 'temporal', 'geometry']),
      });
      count++;
    }
  }
  return count;
}
