import type { AreaGeometry, Geometry, Position } from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';
/** Presentation calculations only: no capital, surveyed position or statistical area claim. */
function onSegment(p: Position, a: Position, b: Position) {
  return (
    Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) < 1e-9 &&
    p[0] >= Math.min(a[0], b[0]) - 1e-9 &&
    p[0] <= Math.max(a[0], b[0]) + 1e-9 &&
    p[1] >= Math.min(a[1], b[1]) - 1e-9 &&
    p[1] <= Math.max(a[1], b[1]) + 1e-9
  );
}
function inRing(point: Position, ring: Position[]) {
  let inside = false;
  for (let i = 1; i < ring.length; i++) {
    const a = ring[i - 1]!,
      b = ring[i]!;
    if (onSegment(point, a, b)) return true;
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
export function containsPoliticalPoint(geometry: AreaGeometry, point: Position) {
  const pieces = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  // ±180° are the same meridian; split source pieces stay split.
  const points: Position[] = Math.abs(point[0]) === 180 ? [point, [-point[0], point[1]]] : [point];
  return points.some((p) =>
    pieces.some((rings) => inRing(p, rings[0]!) && !rings.slice(1).some((hole) => inRing(p, hole))),
  );
}
function ringScore(ring: DeepReadonly<Position[]>) {
  let area = 0;
  for (let i = 1; i < ring.length; i++)
    area += ring[i - 1]![0] * ring[i]![1] - ring[i]![0] * ring[i - 1]![1];
  return Math.abs(area) / 2;
}
export function visualSize(geometry: DeepReadonly<Geometry>): number {
  if (geometry.type === 'Point' || geometry.type === 'LineString') return 0;
  return (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).reduce(
    (sum, rings) =>
      sum +
      Math.max(0, ringScore(rings[0]!) - rings.slice(1).reduce((n, r) => n + ringScore(r), 0)),
    0,
  );
}
export function politicalAnchor(geometry: Geometry): Position | null {
  if (geometry.type === 'Point') return [...geometry.coordinates];
  if (geometry.type === 'LineString') {
    const middle = (geometry.coordinates.length - 1) / 2,
      a = geometry.coordinates[Math.floor(middle)]!,
      b = geometry.coordinates[Math.ceil(middle)]!;
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  }
  const pieces = [
    ...(geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates),
  ].sort((a, b) => ringScore(b[0]!) - ringScore(a[0]!));
  for (const rings of pieces) {
    const outer = rings[0]!,
      ys = outer.map((p) => p[1]),
      south = Math.min(...ys),
      north = Math.max(...ys);
    // Bounded scanline interior point: avoids a concave polygon's outside centroid and holes.
    for (let sample = 0; sample < 17; sample++) {
      const y = south + (north - south) * (sample === 0 ? 0.5 : (sample - 0.5) / 16);
      const crossings: number[] = [];
      for (const ring of rings)
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1]!,
            b = ring[i]!;
          if (a[1] > y !== b[1] > y)
            crossings.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
        }
      crossings.sort((a, b) => a - b);
      let best: Position | null = null,
        width = 0;
      for (let i = 1; i < crossings.length; i += 2) {
        const left = crossings[i - 1]!,
          right = crossings[i]!;
        const point: Position = [(left + right) / 2, y];
        if (
          right - left > width &&
          containsPoliticalPoint({ type: 'Polygon', coordinates: rings }, point)
        ) {
          best = point;
          width = right - left;
        }
      }
      if (best) return best;
    }
  }
  return null;
}
export function politicalCamera(geometry: Geometry) {
  const center = politicalAnchor(geometry);
  if (!center) return null;
  const size = visualSize(geometry);
  return {
    center,
    zoom: Math.max(0, Math.min(4, size > 0 ? Math.log2(180 / Math.max(1, Math.sqrt(size))) : 3)),
  };
}
