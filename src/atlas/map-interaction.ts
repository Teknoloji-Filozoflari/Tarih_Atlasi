/** Detail cards leave the map interactive; modal tools and point picking own input. */
export function isMapDetailPanel(panel: string | null) {
  return (
    panel !== null &&
    [
      'polity',
      'culture',
      'person',
      'event',
      'place',
      'modern-city',
      'modern-places',
      'selection',
    ].includes(panel)
  );
}
export function canSelectMapRecord(panel: string | null, pickingPoint: boolean) {
  return !pickingPoint && (panel === null || isMapDetailPanel(panel));
}
/** An explicit person/event marker opens its card; other overlaps keep the chooser. */
export function opensOverlapChooser(kind: string, count: number) {
  return count > 1 && kind !== 'person-location' && kind !== 'event';
}
