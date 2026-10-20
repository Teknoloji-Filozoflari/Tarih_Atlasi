import type { MessageKey } from '../i18n/index.ts';
import { theme } from '../theme/tokens.ts';
import { stepDisplayYear, MIN_YEAR } from '../timeline/year.ts';

// Sunum kimlikleri; tarihî alan modeli veya veri kaydı değildir.
export const layers = [
  { id: 'state', label: 'atlas.layer.state', symbol: '▱', color: theme.colors.state },
  { id: 'culture', label: 'atlas.layer.culture', symbol: '◇', color: theme.colors.culture },
  { id: 'person', label: 'atlas.layer.person', symbol: '●', color: theme.colors.person },
  { id: 'war', label: 'atlas.layer.war', symbol: '⚔', color: theme.colors.war },
  { id: 'event', label: 'atlas.layer.event', symbol: '✦', color: theme.colors.event },
  { id: 'labels', label: 'layers.labels', symbol: '⌖', color: theme.colors.muted },
] as const satisfies readonly { id: string; label: MessageKey; symbol: string; color: string }[];
export type LayerId = (typeof layers)[number]['id'];
export type LayerVisibility = Record<LayerId, boolean>;
export const initialLayers: LayerVisibility = {
  state: true,
  culture: true,
  person: true,
  war: true,
  event: true,
  labels: true,
};
export { MIN_YEAR };
export function parseYear(text: string, beforeCommonEra: boolean, maxYear: number): number | null {
  if (!/^\d{1,4}$/.test(text.trim())) return null;
  const value = Number(text.trim()) * (beforeCommonEra ? -1 : 1);
  return value !== 0 && value >= MIN_YEAR && value <= maxYear ? value : null;
}
export function stepYear(year: number, direction: -1 | 1, maxYear: number): number {
  return stepDisplayYear(year, direction, maxYear);
}
export function layoutMode(width: number, height: number, fontScale: number): 'wide' | 'compact' {
  return width >= theme.layout.atlasBreakpoint && height >= 600 && fontScale < 1.6
    ? 'wide'
    : 'compact';
}
