import type { DeepReadonly } from '../data/provider.ts';
import type { Geometry, Position } from '../domain/types.ts';
import type { CameraState } from '../map-contract/protocol.ts';
export interface FocusPlan {
  kind: 'point' | 'bounds' | 'global';
  camera: CameraState;
  /** Camera-only unwrapped east may exceed180. Never a historical coordinate. */
  bounds: [Position, Position] | null;
}
const wrap = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180;
/** Minimum covering longitude arc, not a country's center/capital or geographic claim. */
export function focusPlan(geometry: DeepReadonly<Geometry>): FocusPlan {
  if (geometry.type === 'Point')
    return {
      kind: 'point',
      bounds: null,
      camera: {
        center: { lng: geometry.coordinates[0], lat: geometry.coordinates[1] },
        zoom: 3,
        bearing: 0,
        pitch: 0,
      },
    };
  const points =
    geometry.type === 'LineString'
      ? geometry.coordinates
      : geometry.type === 'Polygon'
        ? geometry.coordinates[0]!
        : geometry.coordinates.flatMap((p) => p[0]!);
  if (!points.length || points.length > 100000) throw new Error('CAMERA_GEOMETRY_BUDGET');
  // Cover continuous source pieces, not just vertices: a wide polygon must not
  // accidentally focus on its small complement. Validated antimeridian pieces stay split.
  const pieces =
    geometry.type === 'LineString'
      ? [geometry.coordinates]
      : geometry.type === 'Polygon'
        ? [geometry.coordinates[0]!]
        : geometry.coordinates.map((p) => p[0]!);
  const intervals = pieces
    .map((piece) => {
      let lo = 180,
        hi = -180;
      for (const p of piece) {
        lo = Math.min(lo, p[0]);
        hi = Math.max(hi, p[0]);
      }
      return [lo, hi] as [number, number];
    })
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const interval of intervals) {
    const previous = merged.at(-1);
    if (previous && interval[0] <= previous[1]) previous[1] = Math.max(previous[1], interval[1]);
    else merged.push([...interval]);
  }
  let gap = -1,
    west = merged[0]![0];
  for (let i = 0; i < merged.length; i++) {
    const next = i === merged.length - 1 ? merged[0]![0] + 360 : merged[i + 1]![0];
    if (next - merged[i]![1] > gap) {
      gap = next - merged[i]![1];
      west = next;
    }
  }
  const width = 360 - gap;
  west = wrap(west);
  let south = 90,
    north = -90;
  for (const p of points) {
    south = Math.min(south, p[1]);
    north = Math.max(north, p[1]);
  }
  const global = width > 240 || north - south > 150;
  return {
    kind: global ? 'global' : 'bounds',
    bounds: global
      ? null
      : [
          [west, south],
          [west + width, north],
        ],
    camera: {
      center: {
        lng: wrap(west + width / 2),
        lat: Math.max(-80, Math.min(80, (south + north) / 2)),
      },
      zoom: global
        ? 0
        : Math.max(0, Math.min(4, Math.log2(180 / Math.max(1, width, north - south)))),
      bearing: 0,
      pitch: 0,
    },
  };
}
