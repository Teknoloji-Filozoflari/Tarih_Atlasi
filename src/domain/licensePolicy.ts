import { licenseManifest, manualApprovals } from '../data/source-manifest.ts';
import type { RawInput, SourceRecord } from './types.ts';

export interface LicenseDecision {
  decision: 'allow' | 'manual-review' | 'disallowed';
  reason: string;
  policyVersion: string;
}
export function licensePolicy(source: SourceRecord, input: RawInput | undefined): LicenseDecision {
  const result = (decision: LicenseDecision['decision'], reason: string): LicenseDecision => ({
    decision,
    reason,
    policyVersion: licenseManifest.version,
  });
  const rule = licenseManifest.rules.find((entry) => entry.sourceKey === source.sourceKey);
  if (!rule || rule.decision === 'disallowed')
    return result('disallowed', rule?.reason ?? 'Bilinmeyen kaynak: varsayılan ret.');
  if (source.synthetic || source.licenseScope !== 'data')
    return result('disallowed', 'Sentetik kayıt veya veri dışı hak alanı üretime alınmaz.');
  if (!(rule.licenses as readonly string[]).includes(source.licenseId))
    return result('disallowed', 'Kaynak için izinli olmayan/bilinmeyen veri lisansı.');
  if (
    !source.attribution.trim() ||
    source.reviewStatus !== 'verified' ||
    !input ||
    input.sourceId !== source.id ||
    input.sourceRevision !== source.revision
  )
    return result('disallowed', 'Atıf, inceleme, ham girdi veya revizyon eksik/uyumsuz.');
  if (
    source.sourceKey === 'openhistoricalmap' &&
    (!source.membersReviewed || !source.objectLicense || source.objectLicense !== source.licenseId)
  )
    return result('manual-review', 'OHM nesne license=* ve üye hakları açıkça doğrulanmalı.');
  if (rule.decision === 'allow') return result('allow', rule.reason);
  const approval = manualApprovals.find(
    (entry) =>
      entry.sourceId === source.id &&
      entry.revision === source.revision &&
      entry.sha256 === input.sha256 &&
      entry.licenseId === source.licenseId,
  );
  if (
    !approval ||
    !approval.reviewedBy.trim() ||
    !approval.obligations.trim() ||
    !Number.isFinite(Date.parse(approval.reviewedAt))
  )
    return result('manual-review', rule.reason);
  return result(
    'allow',
    `${rule.reason} İnceleyen: ${approval.reviewedBy}; yükümlülükler: ${approval.obligations}`,
  );
}
