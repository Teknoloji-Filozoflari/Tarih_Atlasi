import { normalizeWorldGeometry } from '../../src/data/world/geometry.ts';
import {
  containsPoliticalPoint,
  politicalAnchor,
  visualSize,
} from '../../src/politics/geometry.ts';
import { polityWikidataId } from '../../src/sources/polity-identity.ts';

// Fixed, deterministic budget: at most 8 * (1 + 25) interior probes per feature.
// Not an area percentage, boundary reconstruction, or sovereignty decision.
function interiorSamples(part) {
  const anchor = politicalAnchor(part);
  const points = anchor ? [anchor] : [];
  const { bbox: b } = normalizeWorldGeometry(part, false);
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++) {
      const p = [b[0] + ((x + 0.5) / 5) * (b[2] - b[0]), b[1] + ((y + 0.5) / 5) * (b[3] - b[1])];
      if (containsPoliticalPoint(part, p) && !points.some((v) => v[0] === p[0] && v[1] === p[1]))
        points.push(p);
    }
  return points;
}

/** Diagnostic only. Contemporary references cannot establish a past boundary/date. */
export function compareReference(collection, records) {
  if (
    collection?.type !== 'FeatureCollection' ||
    !Array.isArray(collection.features) ||
    collection.features.length > 512 ||
    records.length > 300
  )
    throw Error('REFERENCE_BUDGET_OR_SCHEMA');
  const indexed = records.map((r) => ({ r, bbox: normalizeWorldGeometry(r.geometry, false).bbox }));
  return collection.features.map((f, i) => {
    const name = String(f?.properties?.NAME ?? f?.properties?.ADMIN ?? i).slice(0, 160);
    try {
      const { geometry } = normalizeWorldGeometry(f.geometry, false);
      const components = (
        geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
      )
        .map((coordinates) => ({ type: 'Polygon', coordinates }))
        .sort((a, b) => visualSize(b) - visualSize(a));
      const probe = (point, component, sample) => {
        const hits = point
          ? indexed
              .filter(
                ({ r, bbox: b }) =>
                  point[0] >= b[0] &&
                  point[0] <= b[2] &&
                  point[1] >= b[1] &&
                  point[1] <= b[3] &&
                  containsPoliticalPoint(r.geometry, point),
              )
              .map(({ r }) => ({
                id: r.id,
                name: r.names[0]?.value ?? r.id,
                qid: polityWikidataId(r),
              }))
          : [];
        return {
          point,
          component,
          sample,
          hits,
          status: point
            ? hits.length
              ? 'COVERED_NOT_IDENTITY_VERIFIED'
              : 'NO_SOURCE_POLYGON_AT_REFERENCE_POINT'
            : 'NO_ANCHOR',
          identityComparison:
            !point || !/^Q[1-9][0-9]*$/.test(f.properties?.WIKIDATAID ?? '')
              ? 'NOT_COMPARABLE'
              : hits.length === 0
                ? 'NO_POLYGON'
                : hits.some((h) => h.qid === f.properties.WIKIDATAID)
                  ? 'SAME_QID_NOT_HISTORICALLY_CERTIFIED'
                  : hits.some((h) => h.qid)
                    ? 'DIFFERENT_QID_REVIEW_REQUIRED'
                    : 'MISSING_SOURCE_IDENTITY',
        };
      };
      const sampled = components.slice(0, 8);
      const probes = sampled.map((part, i) => probe(politicalAnchor(part), i, 'anchor'));
      const interiorProbes = sampled.flatMap((part, i) =>
        interiorSamples(part).map((p) => probe(p, i, 'interior-grid')),
      );
      return {
        index: i,
        name,
        sourceQid: f.properties?.WIKIDATAID ?? null,
        sourceIso: f.properties?.ADM0_A3 ?? null,
        componentCount: components.length,
        sampledComponents: probes.length,
        probes,
        interiorProbes,
        independentHistoricalCertification: false,
      };
    } catch (error) {
      return {
        index: i,
        name,
        status: 'REFERENCE_GEOMETRY_REVIEW_REQUIRED',
        reason: error.message,
      };
    }
  });
}
