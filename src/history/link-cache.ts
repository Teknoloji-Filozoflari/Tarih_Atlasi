import { createSitelinkResolver, type SitelinkSnapshot } from '../sources/sitelinks.ts';
const snapshots = new Map<string, SitelinkSnapshot>();
export function rememberHistoryLink(snapshot: SitelinkSnapshot) {
  createSitelinkResolver('history', [snapshot]);
  snapshots.delete(snapshot.wikidataId);
  snapshots.set(snapshot.wikidataId, snapshot);
  while (snapshots.size > 128) snapshots.delete(snapshots.keys().next().value!);
}
export function historyLink(qid: string | null) {
  const snapshot = qid ? snapshots.get(qid) : null;
  return snapshot ? createSitelinkResolver('history', [snapshot]).resolve(qid) : null;
}
