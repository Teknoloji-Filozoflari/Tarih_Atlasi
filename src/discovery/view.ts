import { isCamera, type CameraState, type MapProjection } from '../map-contract/protocol.ts';
export interface SavedView {
  year: number;
  entityId: string | null;
  camera: CameraState | null;
  projection?: MapProjection;
}
export const isRecordId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 160 &&
  /^[a-z][a-z0-9-]*:[A-Za-z0-9._:-]+$/u.test(value);
export const isViewYear = (value: unknown, maxYear: number): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value !== 0 &&
  value >= -2000 &&
  value <= maxYear;
export function parseSavedView(raw: unknown, maxYear: number): SavedView | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const v = raw as Record<string, unknown>;
  if (
    !['camera,entityId,year', 'camera,entityId,projection,year'].includes(
      Object.keys(v).sort().join(','),
    ) ||
    !isViewYear(v.year, maxYear) ||
    (Object.hasOwn(v, 'projection') && !['globe', 'mercator'].includes(String(v.projection))) ||
    (v.entityId !== null && !isRecordId(v.entityId)) ||
    (v.camera !== null && !isCamera(v.camera))
  )
    return null;
  return JSON.parse(JSON.stringify(v)) as SavedView;
}
/** Accept exactly the public state whitelist, including duplicate rejection. */
export function parseShareQuery(query: string, maxYear: number): SavedView | null {
  if (query.length > 1200 || /%(?![0-9a-f]{2})/iu.test(query)) return null;
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const allowed = ['year', 'entityId', 'lat', 'lon', 'zoom', 'projection'];
  if ([...params.keys()].some((k) => !allowed.includes(k) || params.getAll(k).length !== 1))
    return null;
  const year = params.get('year');
  if (!year || !/^-?[1-9]\d{0,3}$/u.test(year) || !isViewYear(Number(year), maxYear)) return null;
  const entityId = params.get('entityId');
  if (entityId !== null && !isRecordId(entityId)) return null;
  const hasCamera = ['lat', 'lon', 'zoom'].map((k) => params.has(k));
  if (hasCamera.some(Boolean) && !hasCamera.every(Boolean)) return null;
  let camera: CameraState | null = null;
  if (hasCamera.every(Boolean)) {
    const values = ['lon', 'lat', 'zoom'].map((k) => params.get(k)!);
    if (values.some((v) => !/^-?(?:0|[1-9]\d{0,2})(?:\.\d{1,6})?$/u.test(v))) return null;
    camera = {
      center: { lng: Number(values[0]), lat: Number(values[1]) },
      zoom: Number(values[2]),
      bearing: 0,
      pitch: 0,
    };
    if (!isCamera(camera)) return null;
  }
  const projection = params.get('projection');
  if (projection !== null && !['globe', 'mercator'].includes(projection)) return null;
  return {
    year: Number(year),
    entityId,
    camera,
    ...(projection ? { projection: projection as MapProjection } : {}),
  };
}
export function shareQuery(view: SavedView, maxYear: number): string {
  const checked = parseSavedView(view, maxYear);
  if (!checked) throw new Error('SHARE_VIEW');
  const params = new URLSearchParams({ year: String(checked.year) });
  if (checked.projection) params.set('projection', checked.projection);
  if (checked.entityId) params.set('entityId', checked.entityId);
  if (checked.camera) {
    params.set('lat', String(Number(checked.camera.center.lat.toFixed(6))));
    params.set('lon', String(Number(checked.camera.center.lng.toFixed(6))));
    params.set('zoom', String(Number(checked.camera.zoom.toFixed(6))));
  }
  return params.toString();
}
export function webShareURL(base: string, view: SavedView, maxYear: number): string {
  const url = new URL(base);
  if (
    url.username ||
    url.password ||
    !(
      url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
    )
  )
    throw new Error('SHARE_ORIGIN');
  url.search = shareQuery(view, maxYear);
  url.hash = '';
  return url.href;
}
/** Expo Router native ingress: custom root only; arbitrary hosts/paths never become routes. */
export function nativeIntentPath(path: string, maxYear: number, initial = false): string {
  if (path === '/' || path === 'tarihatlasi:///' || path === 'tarihatlasi://') return '/';
  if (
    path.length > 1400 ||
    /[\\\u0000-\u0020\u007f]/u.test(path) ||
    /%2e|%2f|%5c|\/\.{1,2}(?:\/|$)/iu.test(path)
  )
    return '/?linkError=1';
  try {
    const url = new URL(path.startsWith('/') ? `tarihatlasi://${path}` : path);
    if (
      initial &&
      ['exp:', 'exps:'].includes(url.protocol) &&
      ['/', '/--/'].includes(url.pathname) &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    )
      return '/';
    if (
      url.protocol !== 'tarihatlasi:' ||
      url.hostname ||
      url.username ||
      url.password ||
      !['', '/'].includes(url.pathname) ||
      url.hash
    )
      return '/?linkError=1';
    const view = parseShareQuery(url.search, maxYear);
    return view ? `/?${shareQuery(view, maxYear)}` : '/?linkError=1';
  } catch {
    return '/?linkError=1';
  }
}
export function incomingView(
  params: Record<string, unknown>,
  maxYear: number,
): { status: 'none' | 'invalid'; view: null } | { status: 'ready'; view: SavedView } {
  const keys = Object.keys(params);
  if (!keys.length) return { status: 'none', view: null };
  if (keys.length > 6) return { status: 'invalid', view: null };
  const query = new URLSearchParams();
  for (const key of keys) {
    const value = params[key];
    if (typeof value !== 'string' || value.length > 240) return { status: 'invalid', view: null };
    query.set(key, value);
  }
  const view = parseShareQuery(query.toString(), maxYear);
  return view ? { status: 'ready', view } : { status: 'invalid', view: null };
}
