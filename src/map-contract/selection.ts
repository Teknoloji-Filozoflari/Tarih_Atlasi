export const SELECTION_PAGE_SIZE = 8;
export interface HistoricalSelectionPage {
  catalogVersion: string;
  revision: number;
  selectionId: number;
  offset: number;
  total: number;
  recordId: string;
  candidateIds: string[];
}
export interface SelectionPageRequest {
  selectionId: number;
  revision: number;
  offset: number;
}
export function isHistoricalSelectionPage(value: unknown): value is HistoricalSelectionPage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  const fields = [
    'catalogVersion',
    'revision',
    'selectionId',
    'offset',
    'total',
    'recordId',
    'candidateIds',
  ];
  const id = (v: unknown): v is string =>
    typeof v === 'string' && v.length <= 160 && /^[a-z][a-z0-9-]*:[A-Za-z0-9._:-]+$/u.test(v);
  const integer = (v: unknown, min: number, max: number): v is number =>
    typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
  return (
    Object.keys(p).length === fields.length &&
    fields.every((key) => Object.hasOwn(p, key)) &&
    typeof p.catalogVersion === 'string' &&
    integer(p.revision, 0, 1e9) &&
    integer(p.selectionId, 1, 1e9) &&
    integer(p.total, 1, 1000) &&
    integer(p.offset, 0, 999) &&
    p.offset % 8 === 0 &&
    p.offset < p.total &&
    id(p.recordId) &&
    Array.isArray(p.candidateIds) &&
    p.candidateIds.length === Math.min(8, p.total - p.offset) &&
    p.candidateIds.every(id) &&
    new Set(p.candidateIds).size === p.candidateIds.length
  );
}
/** One bounded hit set, invalidated on every new view/context. No geometry crosses the bridge. */
export function createHitSelection(catalogVersion: string) {
  let ids: string[] = [],
    revision = -1,
    serial = 0,
    selected = '';
  function page(offset: number): HistoricalSelectionPage | null {
    if (
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset % SELECTION_PAGE_SIZE !== 0 ||
      offset >= ids.length
    )
      return null;
    return {
      catalogVersion,
      revision,
      selectionId: serial,
      offset,
      total: ids.length,
      recordId: selected,
      candidateIds: ids.slice(offset, offset + SELECTION_PAGE_SIZE),
    };
  }
  return {
    clear() {
      ids = [];
      revision = -1;
      serial++;
    },
    begin(values: readonly string[], version: number) {
      if (values.length > 1000) throw new RangeError('Hit selection budget');
      ids = [...new Set(values)];
      revision = version;
      serial++;
      selected = ids[0] ?? '';
      return page(0);
    },
    page(request: SelectionPageRequest) {
      return request.selectionId === serial && request.revision === revision
        ? page(request.offset)
        : null;
    },
  };
}
