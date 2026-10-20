export type Position = [number, number];
export interface LandFeature {
  type: 'Feature';
  properties: Record<string, never>;
  geometry:
    | { type: 'Polygon'; coordinates: Position[][] }
    | { type: 'MultiPolygon'; coordinates: Position[][][] };
}
export interface LandCollection {
  type: 'FeatureCollection';
  features: LandFeature[];
}
// Yalnız fiziksel poligon; etiket/ülke özelliklerini atar. Kaynak güveni ayrıca sicilde tutulur.
export function validateLand(
  value: unknown,
  limits: { maxFeatures: number; maxPoints: number } = { maxFeatures: 1000, maxPoints: 100000 },
): LandCollection {
  if (
    !Number.isInteger(limits.maxFeatures) ||
    limits.maxFeatures < 1 ||
    limits.maxFeatures > 5000 ||
    !Number.isInteger(limits.maxPoints) ||
    limits.maxPoints < 1 ||
    limits.maxPoints > 200000
  )
    throw new Error('Invalid land budget');
  if (
    typeof value !== 'object' ||
    value === null ||
    !('type' in value) ||
    value.type !== 'FeatureCollection' ||
    !('features' in value) ||
    !Array.isArray(value.features) ||
    value.features.length === 0 ||
    value.features.length > limits.maxFeatures
  )
    throw new Error('Invalid land collection');
  let points = 0;
  const ring = (candidate: unknown): Position[] => {
    if (!Array.isArray(candidate) || candidate.length < 4) throw new Error('Invalid ring');
    const result = candidate.map((point: unknown): Position => {
      if (
        ++points > limits.maxPoints ||
        !Array.isArray(point) ||
        point.length !== 2 ||
        !point.every(
          (coordinate: unknown) => typeof coordinate === 'number' && Number.isFinite(coordinate),
        ) ||
        Math.abs(point[0] as number) > 180 ||
        Math.abs(point[1] as number) > 90
      )
        throw new Error('Invalid coordinate');
      return [point[0] as number, point[1] as number];
    });
    if (JSON.stringify(result[0]) !== JSON.stringify(result.at(-1)))
      throw new Error('Unclosed ring');
    return result;
  };
  const polygon = (candidate: unknown): Position[][] => {
    if (!Array.isArray(candidate) || candidate.length === 0) throw new Error('Invalid polygon');
    return candidate.map(ring);
  };
  return {
    type: 'FeatureCollection',
    features: value.features.map((feature: unknown): LandFeature => {
      if (
        typeof feature !== 'object' ||
        feature === null ||
        !('type' in feature) ||
        feature.type !== 'Feature' ||
        !('geometry' in feature) ||
        typeof feature.geometry !== 'object' ||
        feature.geometry === null ||
        !('type' in feature.geometry) ||
        !('coordinates' in feature.geometry)
      )
        throw new Error('Invalid feature');
      const geometry = feature.geometry;
      if (geometry.type === 'Polygon')
        return {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: polygon(geometry.coordinates) },
        };
      if (
        geometry.type === 'MultiPolygon' &&
        Array.isArray(geometry.coordinates) &&
        geometry.coordinates.length > 0
      ) {
        return {
          type: 'Feature',
          properties: {},
          geometry: { type: 'MultiPolygon', coordinates: geometry.coordinates.map(polygon) },
        };
      }
      throw new Error('Only physical polygons allowed');
    }),
  };
}
