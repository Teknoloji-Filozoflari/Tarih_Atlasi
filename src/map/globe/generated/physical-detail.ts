// DOM-only lazy physical data. No geometry crosses the native message bridge.
import type { PhysicalDetail } from '../physical-detail';
import { raw as land } from './physical-land-10m';
import { raw as lakes } from './physical-lakes-10m';
import { raw as rivers } from './physical-rivers-10m';
export function loadPhysicalDetail(): PhysicalDetail {
  return { land: JSON.parse(land), lakes: JSON.parse(lakes), rivers: JSON.parse(rivers) };
}
