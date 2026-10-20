export interface PersonScreenPoint {
  id: string;
  x: number;
  y: number;
}
/** At most 1,000 input records and 64 DOM clusters. IDs are never silently truncated. */
export function clusterPersonPoints(
  points: readonly PersonScreenPoint[],
  width: number,
  height: number,
  zoom: number,
) {
  if (
    points.length > 1000 ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(zoom)
  )
    throw new Error('Person cluster budget');
  const visible = points
    .filter(
      (p) =>
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= -24 &&
        p.y >= -24 &&
        p.x <= width + 24 &&
        p.y <= height + 24,
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  let size = zoom < 2 ? 112 : zoom < 3 ? 80 : 56;
  for (let pass = 0; pass < 20; pass++, size *= 2) {
    const cells = new Map<string, PersonScreenPoint[]>();
    for (const point of visible) {
      const key = `${Math.floor(point.x / size)}/${Math.floor(point.y / size)}`;
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key)!.push(point);
    }
    if (cells.size <= 64) {
      const groups = [...cells.values()].map((members) => ({
        anchor: members[0]!,
        ids: members.map((p) => p.id),
      }));
      // Adjacent grid cells must not leave two 48px touch targets on top of
      // each other. Compare at most 64 anchors; keep a real member as anchor.
      const merged: typeof groups = [];
      for (const group of groups) {
        const near = merged.find(
          (other) =>
            Math.hypot(other.anchor.x - group.anchor.x, other.anchor.y - group.anchor.y) < 56,
        );
        if (near) near.ids.push(...group.ids);
        else merged.push(group);
      }
      return merged;
    }
  }
  throw new Error('Person cluster extent');
}
export function facingGlobe(lng: number, lat: number, centerLng: number, centerLat: number) {
  const rad = Math.PI / 180;
  return (
    Math.sin(lat * rad) * Math.sin(centerLat * rad) +
      Math.cos(lat * rad) * Math.cos(centerLat * rad) * Math.cos((lng - centerLng) * rad) >
    0
  );
}
