import type { TerritoryVersion } from '../domain/types.ts';
import type { DeepReadonly } from '../data/provider.ts';
import { visualSize } from './geometry.ts';
import { theme } from '../theme/tokens.ts';

/** One list entry per split source geometry; independent interpretations remain selectable. */
export function politicalRepresentatives(records: readonly DeepReadonly<TerritoryVersion>[]) {
  const groups = new Map<string, DeepReadonly<TerritoryVersion>>();
  for (const record of records) {
    const evidence = record.evidence[0];
    const key =
      record.extentType === 'partial-area' && evidence?.locator
        ? JSON.stringify([
            record.entityId,
            record.interpretationId,
            evidence.sourceId,
            evidence.locator,
          ])
        : record.id;
    const previous = groups.get(key);
    if (
      !previous ||
      (record.geometry &&
        visualSize(record.geometry) > (previous.geometry ? visualSize(previous.geometry) : 0))
    )
      groups.set(key, record);
  }
  return [...groups.values()];
}

export interface SelectionCandidate {
  recordId: string;
  priority: number;
  selected?: boolean;
}
export function rankPoliticalHits(
  candidates: readonly SelectionCandidate[],
  visible: ReadonlySet<string>,
  limit = 8,
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new RangeError('Hit budget');
  const unique = new Map<string, SelectionCandidate>();
  for (const candidate of candidates)
    if (visible.has(candidate.recordId) && Number.isFinite(candidate.priority))
      unique.set(candidate.recordId, candidate);
  return [...unique.values()]
    .sort(
      (a, b) =>
        Number(b.selected ?? false) - Number(a.selected ?? false) ||
        b.priority - a.priority ||
        a.recordId.localeCompare(b.recordId, 'en'),
    )
    .slice(0, limit)
    .map((item) => item.recordId);
}
export interface LabelCandidate {
  id: string;
  text: string;
  x: number;
  y: number;
  priority: number;
  small: boolean;
  selected: boolean;
  compact?: boolean;
}
/** Small cartographic text inside a full touch target; shared with collision layout. */
export function politicalLabelLayout(text: string, zoom: number) {
  const sizes = theme.politicalMap.labelFontSize;
  const fontSize = zoom < 2 ? sizes.distant : zoom < 4.5 ? sizes.normal : sizes.close;
  return {
    fontSize,
    width: Math.min(
      theme.politicalMap.labelMaxWidth,
      Math.max(theme.layout.minTouchTarget, [...text].length * fontSize * 0.65 + 8),
    ),
    height: theme.layout.minTouchTarget,
  };
}
export function choosePoliticalLabels(
  candidates: readonly LabelCandidate[],
  width: number,
  height: number,
  zoom: number,
) {
  const accepted: LabelCandidate[] = [],
    boxes: { x: number; y: number; width: number; height: number }[] = [];
  const budget = zoom < 2 ? 8 : zoom < 3 ? 20 : 32;
  for (const item of [...candidates].sort(
    (a, b) =>
      Number(b.selected) - Number(a.selected) ||
      b.priority - a.priority ||
      a.id.localeCompare(b.id, 'en'),
  )) {
    if (
      ![item.x, item.y].every(Number.isFinite) ||
      item.x < 0 ||
      item.y < 0 ||
      item.x > width ||
      item.y > height
    )
      continue;
    if (zoom < 2 && item.small && !item.selected) continue;
    const size = item.compact
      ? politicalLabelLayout(item.text, zoom)
      : { width: Math.min(220, Math.max(48, item.text.length * 7)), height: 48 };
    const box = {
      x: item.x - size.width / 2,
      y: item.y - size.height / 2,
      width: size.width,
      height: size.height,
    };
    if (
      !item.selected &&
      boxes.some(
        (other) =>
          box.x < other.x + other.width &&
          box.x + box.width > other.x &&
          box.y < other.y + other.height &&
          box.y + box.height > other.y,
      )
    )
      continue;
    accepted.push(item);
    boxes.push(box);
    if (accepted.length >= budget) break;
  }
  return accepted;
}
