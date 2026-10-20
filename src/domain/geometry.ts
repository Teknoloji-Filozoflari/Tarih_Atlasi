import type {
  AreaGeometry,
  BBox,
  FeatureCollection,
  Geometry,
  GeoFeature,
  LineString,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from './types.ts';
import {
  array,
  enumeration,
  idSchema,
  issue,
  numeric,
  object,
  parse,
  refine,
  type Schema,
  type ValidationIssue,
} from './schema.ts';

export const GEOMETRY_LIMITS = Object.freeze({
  positions: 1024,
  comparisons: 100000,
  features: 1000,
});
export const positionSchema: Schema<Position> = {
  check(value, path, issues) {
    if (!Array.isArray(value) || value.length !== 2) {
      issue(issues, path, 'POSITION', 'CRS84 iki koordinat ister: [boylam, enlem].');
      return;
    }
    numeric(-180, 180).check(value[0], `${path}[0]`, issues);
    numeric(-90, 90).check(value[1], `${path}[1]`, issues);
  },
};
export const bboxSchema: Schema<BBox> = {
  check(value, path, issues) {
    if (!Array.isArray(value) || value.length !== 4) {
      issue(issues, path, 'BBOX', '[west,south,east,north] gerekli.');
      return;
    }
    positionSchema.check([value[0], value[1]], path, issues);
    positionSchema.check([value[2], value[3]], path, issues);
    if (typeof value[1] === 'number' && typeof value[3] === 'number' && value[1] > value[3])
      issue(issues, path, 'BBOX_ORDER', 'South north değerinden büyük olamaz.');
    // west > east explicitly represents a dateline-crossing query/coverage box.
  },
};
const ringSchema = array(positionSchema, 4, 512);
const polygonCoordinates = array(ringSchema, 1, 16);
const shapes = {
  Point: object<Point>({ type: enumeration(['Point'] as const), coordinates: positionSchema }),
  LineString: object<LineString>({
    type: enumeration(['LineString'] as const),
    coordinates: array(positionSchema, 2, 1024),
  }),
  Polygon: object<Polygon>({
    type: enumeration(['Polygon'] as const),
    coordinates: polygonCoordinates,
  }),
  MultiPolygon: object<MultiPolygon>({
    type: enumeration(['MultiPolygon'] as const),
    coordinates: array(polygonCoordinates, 1, 16),
  }),
};
const equal = (a: Position, b: Position) => a[0] === b[0] && a[1] === b[1];
const cross = (a: Position, b: Position, c: Position) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function onSegment(a: Position, b: Position, p: Position) {
  return (
    Math.abs(cross(a, b, p)) < 1e-12 &&
    p[0] >= Math.min(a[0], b[0]) &&
    p[0] <= Math.max(a[0], b[0]) &&
    p[1] >= Math.min(a[1], b[1]) &&
    p[1] <= Math.max(a[1], b[1])
  );
}
function intersects(a: Position, b: Position, c: Position, d: Position) {
  const abC = cross(a, b, c),
    abD = cross(a, b, d),
    cdA = cross(c, d, a),
    cdB = cross(c, d, b);
  return (
    (((abC > 0 && abD < 0) || (abC < 0 && abD > 0)) &&
      ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))) ||
    onSegment(a, b, c) ||
    onSegment(a, b, d) ||
    onSegment(c, d, a) ||
    onSegment(c, d, b)
  );
}
function inRing(point: Position, ring: Position[]) {
  let inside = false;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i]!,
      b = ring[i + 1]!;
    if (onSegment(a, b, point)) return false;
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
function inPolygon(point: Position, rings: Position[][]) {
  return inRing(point, rings[0]!) && !rings.slice(1).some((hole) => inRing(point, hole));
}
export function positions(geometry: Geometry): Position[] {
  switch (geometry.type) {
    case 'Point':
      return [geometry.coordinates];
    case 'LineString':
      return geometry.coordinates;
    case 'Polygon':
      return geometry.coordinates.flat();
    case 'MultiPolygon':
      return geometry.coordinates.flat(2);
  }
}
function topology(geometry: Geometry, path: string, issues: ValidationIssue[]) {
  if (positions(geometry).length > GEOMETRY_LIMITS.positions) {
    issue(
      issues,
      path,
      'EXCESSIVE_DETAIL',
      'Geometri 1024 konumu aşıyor; sessiz sadeleştirme yok.',
    );
    return;
  }
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];
  const rings = polygons.flat();
  const lines = geometry.type === 'LineString' ? [geometry.coordinates] : rings;
  const before = issues.length;
  for (const [index, line] of lines.entries()) {
    for (let i = 1; i < line.length; i++) {
      if (equal(line[i - 1]!, line[i]!))
        issue(issues, path, 'ZERO_EDGE', 'Ardışık aynı konum geçersiz.');
      if (Math.abs(line[i]![0] - line[i - 1]![0]) > 180)
        issue(
          issues,
          path,
          'ANTIMERIDIAN_UNSPLIT',
          '180° üzerinden geçen kenar önce kaynaklı dönüşümle bölünmeli.',
        );
    }
    if (geometry.type !== 'LineString' && !equal(line[0]!, line.at(-1)!))
      issue(issues, `${path}.ring[${index}]`, 'UNCLOSED_RING', 'Halka kapalı olmalı.');
  }
  if (issues.length !== before) return;
  for (const polygon of polygons) {
    for (const [index, ring] of polygon.entries()) {
      let area = 0;
      for (let i = 0; i < ring.length - 1; i++)
        area += ring[i]![0] * ring[i + 1]![1] - ring[i + 1]![0] * ring[i]![1];
      if (Math.abs(area) < 1e-12)
        issue(issues, path, 'ZERO_AREA', 'Sıfır veya doğrulayıcı toleransının altında alan.');
      else if (index === 0 ? area < 0 : area > 0)
        issue(
          issues,
          path,
          'RING_WINDING',
          'Dış halka saat yönünün tersine, delikler saat yönünde olmalı.',
        );
    }
  }
  let comparisons = 0;
  // Conservative planar pilot checks; reject touching components instead of silently repairing.
  for (let r = 0; r < lines.length; r++) {
    const first = lines[r]!;
    for (let s = r; s < lines.length; s++) {
      const second = lines[s]!;
      for (let i = 0; i < first.length - 1; i++)
        for (let j = r === s ? i + 1 : 0; j < second.length - 1; j++) {
          if (++comparisons > GEOMETRY_LIMITS.comparisons) {
            issue(
              issues,
              path,
              'TOPOLOGY_BUDGET',
              'Topoloji karşılaştırma bütçesi aşıldı; inceleme/parçalama gerekli.',
            );
            return;
          }
          const a = first[i]!,
            b = first[i + 1]!,
            c = second[j]!,
            d = second[j + 1]!;
          if (
            r === s &&
            (j === i + 1 || (geometry.type !== 'LineString' && i === 0 && j === first.length - 2))
          ) {
            const shared = equal(b, c) ? b : a;
            const outerA = equal(shared, a) ? b : a;
            const outerB = equal(shared, c) ? d : c;
            if (onSegment(shared, outerA, outerB) || onSegment(shared, outerB, outerA))
              issue(issues, path, 'TOPOLOGY_OVERLAP', 'Komşu kenarlar geriye katlanıyor.');
            continue;
          }
          if (intersects(a, b, c, d)) {
            issue(
              issues,
              path,
              'TOPOLOGY_INTERSECTION',
              'Kesişen/temas eden kenarlar; otomatik onarım yok.',
            );
            return;
          }
        }
    }
  }
  for (const polygon of polygons) {
    for (let h = 1; h < polygon.length; h++) {
      if (!inRing(polygon[h]![0]!, polygon[0]!))
        issue(issues, path, 'HOLE_OUTSIDE', 'Delik dış halkanın içinde olmalı.');
      for (let k = 1; k < h; k++)
        if (inRing(polygon[h]![0]!, polygon[k]!) || inRing(polygon[k]![0]!, polygon[h]!))
          issue(issues, path, 'HOLE_OVERLAP', 'Delikler örtüşemez veya iç içe olamaz.');
    }
  }
  for (let p = 0; p < polygons.length; p++)
    for (let q = 0; q < p; q++)
      if (
        inPolygon(polygons[p]![0]![0]!, polygons[q]!) ||
        inPolygon(polygons[q]![0]![0]!, polygons[p]!)
      )
        issue(issues, path, 'MULTIPOLYGON_OVERLAP', 'MultiPolygon bileşenlerinin içi örtüşüyor.');
}
export const geometrySchema: Schema<Geometry> = {
  check(value, path, issues) {
    const type = value && typeof value === 'object' && 'type' in value ? value.type : null;
    if (typeof type !== 'string' || !Object.hasOwn(shapes, type)) {
      issue(
        issues,
        path,
        'GEOMETRY_TYPE',
        'Point/LineString/Polygon/MultiPolygon gerekli; boş geometri geçersiz.',
      );
      return;
    }
    const result = parse(shapes[type as keyof typeof shapes] as Schema<Geometry>, value);
    if (!result.ok)
      for (const entry of result.issues)
        issue(issues, path + entry.path.slice(1), entry.code, entry.message);
    else topology(result.value, path, issues);
  },
};
export const areaGeometrySchema: Schema<AreaGeometry> = refine(
  geometrySchema,
  (value, path, issues) => {
    if (!['Polygon', 'MultiPolygon'].includes(value.type))
      issue(issues, path, 'AREA_REQUIRED', 'Alan geometrisi gerekli.');
  },
) as Schema<AreaGeometry>;
export const pointSchema: Schema<Point> = refine(geometrySchema, (value, path, issues) => {
  if (value.type !== 'Point') issue(issues, path, 'POINT_REQUIRED', 'Nokta geometrisi gerekli.');
}) as Schema<Point>;
export const placeGeometrySchema: Schema<Point | AreaGeometry> = refine(
  geometrySchema,
  (value, path, issues) => {
    if (value.type === 'LineString')
      issue(issues, path, 'PLACE_GEOMETRY', 'Yer için nokta veya alan gerekli.');
  },
) as Schema<Point | AreaGeometry>;
export const featureCollectionSchema: Schema<FeatureCollection> = refine(
  object<FeatureCollection>({
    type: enumeration(['FeatureCollection'] as const),
    features: array(
      object<GeoFeature>({
        type: enumeration(['Feature'] as const),
        id: idSchema,
        properties: object({ recordId: idSchema }),
        geometry: geometrySchema,
      }),
      0,
      GEOMETRY_LIMITS.features,
    ),
  }),
  (value, path, issues) => {
    const ids = new Set<string>();
    for (const feature of value.features) {
      if (ids.has(feature.id)) issue(issues, path, 'DUPLICATE_FEATURE', 'Feature ID yineleniyor.');
      ids.add(feature.id);
      if (feature.properties.recordId !== feature.id)
        issue(issues, path, 'FEATURE_RECORD_ID', 'Feature ve kayıt kimliği aynı olmalı.');
    }
  },
);
export function geometryBounds(geometry: Geometry): BBox[] {
  if (geometry.type === 'MultiPolygon')
    return geometry.coordinates.flatMap((coordinates) =>
      geometryBounds({ type: 'Polygon', coordinates }),
    );
  const coords = positions(geometry);
  return [
    [
      Math.min(...coords.map((p) => p[0])),
      Math.min(...coords.map((p) => p[1])),
      Math.max(...coords.map((p) => p[0])),
      Math.max(...coords.map((p) => p[1])),
    ],
  ];
}
export function splitBBox(box: BBox): BBox[] {
  const parts: BBox[] =
    box[0] <= box[2]
      ? [box]
      : [
          [box[0], box[1], 180, box[3]],
          [-180, box[1], box[2], box[3]],
        ];
  const seam: BBox[] = [];
  for (const part of parts) {
    if (part[0] === -180) seam.push([180, part[1], 180, part[3]]);
    if (part[2] === 180) seam.push([-180, part[1], -180, part[3]]);
  }
  return [...parts, ...seam];
}
export function boxesIntersect(a: BBox, b: BBox): boolean {
  return splitBBox(a).some((x) =>
    splitBBox(b).some((y) => x[0] <= y[2] && y[0] <= x[2] && x[1] <= y[3] && y[1] <= x[3]),
  );
}
