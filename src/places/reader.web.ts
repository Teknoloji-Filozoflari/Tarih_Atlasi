import { readHTTPPlace } from './http';
import type { PlaceReader } from './repository';
// No native asset registry or gzip JS imports in the browser dependency graph.
export const readPlaceAsset: PlaceReader = async (_index, pack, signal) =>
  readHTTPPlace(pack, signal, location.href, process.env.EXPO_BASE_URL ?? '');
