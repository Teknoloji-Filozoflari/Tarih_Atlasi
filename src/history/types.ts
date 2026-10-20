import type { HistoricalEventType } from '../domain/types';
export interface HistoryPack {
  sha256: string;
  bytes: number;
  records: number;
}
export interface HistoryRow {
  type: 'PERSON' | HistoricalEventType;
  id: string;
  qid: string;
  kind: 'person' | 'event';
  group: 'person' | 'battle' | 'war' | 'event';
  name: string;
  language: string;
  aliases: string[];
  start: number | null;
  end: number | null;
  activeStart: number | null;
  activeEnd: number | null;
  uncertain: boolean;
  pack: number;
  geometry: boolean;
  groups: string[];
  geometryYear: number | null;
  bbox: [number, number, number, number] | null;
}
export interface HistoryManifest {
  version: string;
  inputSha256: string;
  policy: string;
  createdAt: string;
  packs: HistoryPack[];
  rows: HistoryRow[];
  sourcePacks: Record<string, number>;
  counts: {
    downloaded: number;
    people: number;
    events: number;
    points: number;
    birthPoints: number;
    skipped: number;
  };
  skipped: { qid: string; reason: string }[];
}
export type HistoryReader = (
  index: number,
  pack: HistoryPack,
  signal: AbortSignal,
) => Promise<string>;
