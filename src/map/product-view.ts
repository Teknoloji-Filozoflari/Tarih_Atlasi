import type { SavedView } from '../discovery/view.ts';
/** Product policy: legacy Mercator links remain readable, but always open on the globe. */
export const PRODUCT_PROJECTION = 'globe' as const;
export function globeView(view: SavedView): SavedView {
  return { ...view, projection: PRODUCT_PROJECTION };
}
