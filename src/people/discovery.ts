import { normalizeSearch } from '../discovery/search.ts';
import { peopleManifest } from './generated/index.ts';
import { peopleManifest as expandedManifest } from './expanded/index.ts';
import { peopleManifest as ottomanManifest } from './ottoman/index.ts';
import { peopleManifest as globalManifest } from './global/index.ts';
import { peopleManifest as broadManifest } from './broad/index.ts';
import { requestedPeople } from './generated/requests.ts';
import { historyManifest } from '../history/generated/manifest.ts';
export const birthReview = (qid: string | null) => {
  const old =
    peopleManifest.selected.find((p) => p.qid === qid) ??
    expandedManifest.selected.find((p) => p.qid === qid) ??
    ottomanManifest.selected.find((p) => p.qid === qid) ??
    globalManifest.selected.find((p) => p.qid === qid) ??
    broadManifest.selected.find((p) => p.qid === qid) ??
    null;
  if (old) return old;
  const row = historyManifest.rows.find((r) => r.kind === 'person' && r.qid === qid);
  return row
    ? {
        id: row.id,
        qid: row.qid,
        name: row.name,
        birth: row.start === null ? null : [row.start, row.start],
        death: row.end === null ? null : [row.end, row.end],
        placeQid: null,
        annualBirth: row.geometryYear !== null,
        geometryAvailable: row.geometry,
        note:
          row.geometryYear !== null
            ? 'Kaynaklı doğum yılı ve daha önce incelenmiş yaklaşık şehir temsil noktası; yaşam boyunca ikamet değildir.'
            : 'Doğum yeri koordinatı ayrıca doğrulanmadı; haritada tahminî nokta oluşturulmadı.',
      }
    : null;
};
export const peopleCoverage = Object.freeze({
  requested: requestedPeople.summary.uniqueRequests,
  availableRequested: requestedPeople.summary.published,
  profiles:
    peopleManifest.published +
    expandedManifest.published +
    ottomanManifest.published +
    globalManifest.published +
    broadManifest.published +
    historyManifest.counts.people,
  annualBirths:
    peopleManifest.annualBirths +
    expandedManifest.annualBirths +
    ottomanManifest.annualBirths +
    globalManifest.annualBirths +
    broadManifest.annualBirths +
    historyManifest.counts.birthPoints,
});
export interface PendingPersonRequest {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly wikidataId: string | null;
  readonly kind: 'person' | 'group' | 'ambiguous';
}
export function pendingPeople(query: string) {
  const terms = normalizeSearch(query).split(' ').filter(Boolean);
  const pending: PendingPersonRequest[] = requestedPeople.records.filter(
    (p) => p.status === 'source-review-required',
  );
  for (const p of [...peopleManifest.pending, ...broadManifest.pending])
    if (
      !birthReview(p.wikidataId) &&
      !pending.some(
        (r) => r.wikidataId === p.wikidataId || normalizeSearch(r.name) === normalizeSearch(p.name),
      )
    )
      pending.push({ id: 'pending:' + p.wikidataId, ...p, kind: 'person' });
  return pending.filter((p) => {
    const text = normalizeSearch([p.name, ...p.aliases, p.wikidataId ?? ''].join(' '));
    return terms.every((term) => text.includes(term));
  });
}
