/** A newer deliberate map selection supersedes a pending city-pack lookup. */
export function invalidatesPlaceSelection(type: string) {
  return [
    'city.selected',
    'place.selected',
    'selection.changed',
    'entity.selected',
    'entity.article',
    'note.selected',
    'demo.selected',
    'renderer.error',
  ].includes(type);
}
