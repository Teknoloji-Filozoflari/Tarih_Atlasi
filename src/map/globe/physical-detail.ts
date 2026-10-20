import type { LandCollection, Position } from './land.ts';
export interface RiverCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: Record<string, never>;
    geometry: { type: 'MultiLineString'; coordinates: Position[][] };
  }[];
}
export interface PhysicalDetail {
  land: LandCollection;
  lakes: LandCollection;
  rivers: RiverCollection;
}
/** Separate physical budget: never used to approve historical geometry. Strips all names. */
export function normalizePhysical(value: unknown, kind: 'land' | 'lakes' | 'rivers') {
  const maxPoints = kind === 'land' ? 500000 : kind === 'lakes' ? 200000 : 300000;
  let points = 0;
  if (
    !value ||
    typeof value !== 'object' ||
    !('type' in value) ||
    value.type !== 'FeatureCollection' ||
    !('features' in value) ||
    !Array.isArray(value.features) ||
    !value.features.length ||
    value.features.length > 2000
  )
    throw new Error('PHYSICAL_COLLECTION');
  const position = (v: unknown): Position => {
    if (
      ++points > maxPoints ||
      !Array.isArray(v) ||
      v.length !== 2 ||
      !v.every((n: unknown) => typeof n === 'number' && Number.isFinite(n)) ||
      Math.abs(v[0] as number) > 180 ||
      Math.abs(v[1] as number) > 90
    )
      throw new Error('PHYSICAL_POSITION');
    return [v[0] as number, v[1] as number];
  };
  const line = (v: unknown, closed = false): Position[] => {
    if (!Array.isArray(v) || v.length < (closed ? 4 : 2)) throw new Error('PHYSICAL_LINE');
    const result = v.map(position);
    if (closed && (result[0]![0] !== result.at(-1)![0] || result[0]![1] !== result.at(-1)![1]))
      throw new Error('PHYSICAL_RING');
    return result;
  };
  const polygon = (v: unknown): Position[][] => {
    if (!Array.isArray(v) || !v.length) throw new Error('PHYSICAL_POLYGON');
    return v.map((r: unknown) => line(r, true));
  };
  return {
    type: 'FeatureCollection' as const,
    features: value.features.map((f: unknown) => {
      if (
        !f ||
        typeof f !== 'object' ||
        !('type' in f) ||
        f.type !== 'Feature' ||
        !('geometry' in f) ||
        !f.geometry ||
        typeof f.geometry !== 'object' ||
        !('type' in f.geometry) ||
        !('coordinates' in f.geometry)
      )
        throw new Error('PHYSICAL_FEATURE');
      const g = f.geometry;
      if (kind === 'rivers') {
        if (g.type !== 'MultiLineString' || !Array.isArray(g.coordinates) || !g.coordinates.length)
          throw new Error('PHYSICAL_RIVER');
        return {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'MultiLineString' as const,
            coordinates: g.coordinates.map((v: unknown) => line(v)),
          },
        };
      }
      if (g.type === 'Polygon')
        return {
          type: 'Feature' as const,
          properties: {},
          geometry: { type: 'Polygon' as const, coordinates: polygon(g.coordinates) },
        };
      if (g.type === 'MultiPolygon' && Array.isArray(g.coordinates) && g.coordinates.length)
        return {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'MultiPolygon' as const,
            coordinates: g.coordinates.map(polygon),
          },
        };
      throw new Error('PHYSICAL_GEOMETRY');
    }),
  };
}
