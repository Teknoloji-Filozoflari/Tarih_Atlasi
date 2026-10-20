import { useState } from 'react';
import { View } from 'react-native';
import type { SourceDetail } from '../sources/repository';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
import { sitelinkManifest } from '../sources/catalog';
import type { SitelinkResolution } from '../sources/sitelinks';
import type { ExternalPurpose } from '../sources/url-policy';
export function SourceDetails({
  detail,
  result,
  open,
}: {
  detail: SourceDetail;
  result: SitelinkResolution;
  open: (url: string, purpose: ExternalPurpose) => void;
}) {
  const [technical, setTechnical] = useState(false);
  const [page, setPage] = useState(0);
  return (
    <View style={s.stack} testID="source-details">
      <AppText accessibilityRole="header" variant="heading">
        {t('sources.show')}
      </AppText>
      <AppText>
        {t('sources.catalog')} {detail.catalogVersion}
      </AppText>
      <Action
        label={t('sources.technical')}
        selected={technical}
        onPress={() => setTechnical((v) => !v)}
      />
      {!detail.rows.length && <AppText>{t('sources.none')}</AppText>}
      {detail.rows.slice(page * 8, page * 8 + 8).map((row) => (
        <View style={s.stack} key={row.id}>
          {technical && <AppText variant="small">{row.recordId}</AppText>}
          <AppText>{row.evidence.locator}</AppText>
          <AppText>
            {t('sources.claims')}{' '}
            {row.evidence.claims.map((c) => t(`sources.claim.${c}`)).join(' · ')}
          </AppText>
          <AppText variant="small">
            {row.evidence.attribution} · {row.evidence.licenseId}
          </AppText>
          <AppText variant="small">
            {t('sources.revision')} {row.evidence.sourceRevision}
          </AppText>
          <AppText variant="small">
            {t('sources.basis')}{' '}
            {t(row.evidence.basis === 'observed' ? 'sources.observed' : 'sources.derived')}
          </AppText>
          {row.matched && row.source && row.input ? (
            <>
              <AppText variant="small">
                {t('sources.retrieved')} {row.source.retrievedAt}
              </AppText>
              {technical && (
                <AppText variant="small">
                  {t('sources.raw')} {row.input.relativePath} · SHA-256 {row.input.sha256}
                </AppText>
              )}
              <AppText variant="small">
                {t('sources.transforms')}{' '}
                {row.evidence.transformationIds.join(' · ') || t('sources.noTransform')}
              </AppText>
              <Action
                label={`${t('sources.direct')} — ${row.source.names[0]?.value ?? row.source.id}`}
                symbol="↗"
                onPress={() => open(row.source!.url, 'source')}
              />
            </>
          ) : (
            <AppText accessibilityRole="alert">{t('sources.mismatch')}</AppText>
          )}
        </View>
      ))}
      {detail.rows.length > 8 && (
        <View style={s.row}>
          <Action
            label={t('selection.previous')}
            disabled={page === 0}
            onPress={() => setPage(page - 1)}
          />
          <AppText>
            {page * 8 + 1}–{Math.min(detail.rows.length, page * 8 + 8)} / {detail.rows.length}
          </AppText>
          <Action
            label={t('selection.next')}
            disabled={(page + 1) * 8 >= detail.rows.length}
            onPress={() => setPage(page + 1)}
          />
        </View>
      )}
      {result.snapshot && (
        <View style={s.stack}>
          <AppText>
            {t('sources.linkEvidence')} {result.snapshot.wikidataId} · {result.snapshot.revision}
          </AppText>
          <AppText variant="small">
            {result.snapshot.attribution} · {result.snapshot.licenseId}
          </AppText>
          <AppText variant="small">
            {t('sources.verifiedAt')} {result.snapshot.verifiedAt}
          </AppText>
          <AppText variant="small">{t('sources.snapshotNotice')}</AppText>
          {technical && (
            <AppText variant="small">
              {t('sources.linkCatalog')} {sitelinkManifest.version} · SHA-256{' '}
              {sitelinkManifest.sha256}
            </AppText>
          )}
          <Action
            label={t('sources.linkSource')}
            symbol="↗"
            onPress={() => open(result.snapshot!.sourceUrl, 'source')}
          />
        </View>
      )}
    </View>
  );
}
