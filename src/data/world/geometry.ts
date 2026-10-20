import type { AreaGeometry, BBox, Position } from '../../domain/types.ts';
// A separate large-source protocol. The small catalog validator is intentionally unchanged.
export const WORLD_GEOMETRY_LIMITS = Object.freeze({
  positions: 100000,
  rings: 4096,
  components: 2048,
  work: 5000000,
});
const same = (a: Position, b: Position) => a[0] === b[0] && a[1] === b[1];
const cross = (a: Position, b: Position, c: Position) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const on = (a: Position, b: Position, p: Position) =>
  Math.abs(cross(a, b, p)) < 1e-12 &&
  p[0] >= Math.min(a[0], b[0]) &&
  p[0] <= Math.max(a[0], b[0]) &&
  p[1] >= Math.min(a[1], b[1]) &&
  p[1] <= Math.max(a[1], b[1]);
function inside(p: Position, ring: Position[], step: () => void) {
  let result = false;
  for (let i = 1; i < ring.length; i++) {
    step();
    const a = ring[i - 1]!,
      b = ring[i]!;
    if (on(a, b, p)) return false;
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      result = !result;
  }
  return result;
}
interface Segment {
  a: Position;
  b: Position;
  ring: number;
  index: number;
  length: number;
  west: number;
  east: number;
  south: number;
  north: number;
}
/** Sweep candidate edges by x; reject crossings and shared edges. Disjoint pairs
 * of holes may kiss at a single exact vertex, as permitted by Simple Features.
 * Shell contacts are conservatively withheld by default. A separately pinned
 * source review can accept isolated shell-hole vertex tangencies; crossings,
 * shared edges, two contact points and touching-hole chains still fail.
 * Separate source MultiPolygon components may touch; they remain separate source areas.
 * Full topology is run at preparation; runtime authenticates its hash and bounded structure.
 */
export function normalizeWorldGeometry(
  value: unknown,
  topology = true,
  options: { isolatedShellTangencies?: boolean } = {},
): {
  geometry: AreaGeometry;
  bbox: BBox;
  points: number;
  removedDuplicatePositions: number;
  tangentHolePairs: number;
} {
  if (
    !value ||
    typeof value !== 'object' ||
    !('type' in value) ||
    !('coordinates' in value) ||
    !['Polygon', 'MultiPolygon'].includes(String(value.type))
  )
    throw new Error('WORLD_GEOMETRY_TYPE');
  const raw = value.type === 'Polygon' ? [value.coordinates] : value.coordinates;
  if (!Array.isArray(raw) || !raw.length || raw.length > WORLD_GEOMETRY_LIMITS.components)
    throw new Error('WORLD_COMPONENT_BUDGET');
  let points = 0,
    rings = 0,
    removedDuplicatePositions = 0,
    tangentHolePairs = 0,
    work = 0;
  const step = () => {
    if (++work > WORLD_GEOMETRY_LIMITS.work) throw new Error('WORLD_TOPOLOGY_WORK_BUDGET');
  };
  const bbox: BBox = [180, 90, -180, -90];
  const polygons: Position[][][] = raw.map((candidate: unknown) => {
    if (!Array.isArray(candidate) || !candidate.length || candidate.length > 256)
      throw new Error('WORLD_POLYGON');
    const polygon: Position[][] = candidate.map((r: unknown, ringIndex: number) => {
      if (++rings > WORLD_GEOMETRY_LIMITS.rings || !Array.isArray(r) || r.length < 4)
        throw new Error('WORLD_RING');
      const ring: Position[] = [];
      for (const v of r) {
        if (
          ++points > WORLD_GEOMETRY_LIMITS.positions ||
          !Array.isArray(v) ||
          v.length !== 2 ||
          !v.every((n: unknown) => typeof n === 'number' && Number.isFinite(n)) ||
          Math.abs(v[0] as number) > 180 ||
          Math.abs(v[1] as number) > 90
        )
          throw new Error('WORLD_POSITION');
        const p: Position = [v[0] as number, v[1] as number];
        bbox[0] = Math.min(bbox[0], p[0]);
        bbox[1] = Math.min(bbox[1], p[1]);
        bbox[2] = Math.max(bbox[2], p[0]);
        bbox[3] = Math.max(bbox[3], p[1]);
        if (ring.length && same(ring.at(-1)!, p)) {
          removedDuplicatePositions++;
          continue;
        }
        ring.push(p);
      }
      if (ring.length < 4 || !same(ring[0]!, ring.at(-1)!))
        throw new Error('WORLD_UNCLOSED_OR_EMPTY_RING');
      let area = 0;
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1]!,
          b = ring[i]!;
        if (Math.abs(b[0] - a[0]) > 180) throw new Error('WORLD_ANTIMERIDIAN_UNSPLIT');
        area += a[0] * b[1] - b[0] * a[1];
      }
      if (Math.abs(area) < 1e-14) throw new Error('WORLD_ZERO_AREA');
      if (ringIndex === 0 ? area < 0 : area > 0) ring.reverse();
      return ring;
    });
    if (topology) {
      const segments: Segment[] = [];
      polygon.forEach((ring, ri) => {
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1]!,
            b = ring[i]!;
          segments.push({
            a,
            b,
            ring: ri,
            index: i - 1,
            length: ring.length - 1,
            west: Math.min(a[0], b[0]),
            east: Math.max(a[0], b[0]),
            south: Math.min(a[1], b[1]),
            north: Math.max(a[1], b[1]),
          });
        }
      });
      segments.sort((a, b) => a.west - b.west || a.south - b.south);
      const contacts = new Map<string, Position>();
      const partners = new Map<number, number>();
      let active: Segment[] = [];
      for (const s of segments) {
        active = active.filter((t) => t.east >= s.west);
        for (const t of active) {
          step();
          if (t.north < s.south || s.north < t.south) continue;
          if (
            t.ring === s.ring &&
            (Math.abs(t.index - s.index) === 1 || Math.abs(t.index - s.index) === s.length - 1)
          )
            continue;
          const abC = cross(s.a, s.b, t.a),
            abD = cross(s.a, s.b, t.b),
            cdA = cross(t.a, t.b, s.a),
            cdB = cross(t.a, t.b, s.b);
          const crossing =
            ((abC > 0 && abD < 0) || (abC < 0 && abD > 0)) &&
            ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0));
          if (
            crossing ||
            on(s.a, s.b, t.a) ||
            on(s.a, s.b, t.b) ||
            on(t.a, t.b, s.a) ||
            on(t.a, t.b, s.b)
          ) {
            const shared = [s.a, s.b].filter((p) => same(p, t.a) || same(p, t.b));
            if (
              crossing ||
              s.ring === t.ring ||
              ((!s.ring || !t.ring) && !options.isolatedShellTangencies) ||
              shared.length !== 1
            )
              throw new Error('WORLD_RING_INTERSECTION');
            const point = shared[0]!;
            const sOther = same(s.a, point) ? s.b : s.a;
            const tOther = same(t.a, point) ? t.b : t.a;
            if (on(s.a, s.b, tOther) || on(t.a, t.b, sOther))
              throw new Error('WORLD_RING_INTERSECTION');
            const key = [s.ring, t.ring].sort((a, b) => a - b).join('/');
            const previous = contacts.get(key);
            if (previous && !same(previous, point)) throw new Error('WORLD_MULTIPLE_HOLE_CONTACTS');
            if (
              (s.ring !== 0 && partners.has(s.ring) && partners.get(s.ring) !== t.ring) ||
              (t.ring !== 0 && partners.has(t.ring) && partners.get(t.ring) !== s.ring)
            )
              throw new Error('WORLD_HOLE_CONTACT_NETWORK_REVIEW');
            contacts.set(key, point);
            if (s.ring !== 0) partners.set(s.ring, t.ring);
            if (t.ring !== 0) partners.set(t.ring, s.ring);
          }
        }
        active.push(s);
      }
      for (let i = 1; i < polygon.length; i++) {
        const shellContact = contacts.get(`0/${i}`);
        const holePoint = shellContact
          ? polygon[i]!.find((p) => !same(p, shellContact))!
          : polygon[i]![0]!;
        if (!inside(holePoint, polygon[0]!, step)) throw new Error('WORLD_HOLE_OUTSIDE');
        for (let j = 1; j < i; j++) {
          const contact = contacts.get(`${j}/${i}`);
          // At a tangent, use a non-contact vertex to detect nested/overlapping holes.
          const a = contact ? polygon[i]!.find((p) => !same(p, contact))! : polygon[i]![0]!;
          const b = contact ? polygon[j]!.find((p) => !same(p, contact))! : polygon[j]![0]!;
          if (inside(a, polygon[j]!, step) || inside(b, polygon[i]!, step))
            throw new Error('WORLD_NESTED_HOLES');
        }
      }
      tangentHolePairs += contacts.size;
    }
    return polygon;
  });
  return {
    geometry:
      value.type === 'Polygon'
        ? { type: 'Polygon', coordinates: polygons[0]! }
        : { type: 'MultiPolygon', coordinates: polygons },
    bbox,
    points,
    removedDuplicatePositions,
    tangentHolePairs,
  };
}
