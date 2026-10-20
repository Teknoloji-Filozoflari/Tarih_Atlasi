/** Trusted project policy, not upstream metadata. Approvals bind a reviewed extraction. */
export const licenseManifest = {
  version: '1.3.1',
  reviewedAt: '2026-10-17',
  rules: [
    {
      sourceKey: 'nara-treaty-facts',
      decision: 'manual-review',
      licenses: ['CC0-1.0'],
      url: 'https://www.archives.gov/global-pages/privacy.html#copyright',
      reason:
        'Yalnız incelenmiş federal antlaşma olguları ve projeye ait türetim; NARA arşivindeki tüm eserler için genel izin değildir.',
    },
    {
      sourceKey: 'natural-earth',
      decision: 'allow',
      licenses: ['LicenseRef-NaturalEarth-PublicDomain'],
      url: 'https://www.naturalearthdata.com/about/terms-of-use/',
      reason: 'Yalnız doğrulanmış fiziksel veri; tarihî sınır kanıtı değildir.',
    },
    {
      sourceKey: 'wikidata',
      decision: 'allow',
      licenses: ['CC0-1.0'],
      url: 'https://www.wikidata.org/wiki/Wikidata:Licensing',
      reason: 'Yalnız yapılandırılmış veri; Wikimedia makale/görsellerini kapsamaz.',
    },
    {
      sourceKey: 'openhistoricalmap',
      decision: 'manual-review',
      licenses: ['CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0'],
      url: 'https://www.openhistoricalmap.org/copyright',
      reason: 'Nesne license=* ve tüm üye/üst kaynak hakları revizyon bazında incelenmeli.',
    },
    {
      sourceKey: 'cliopatria',
      decision: 'manual-review',
      licenses: ['CC-BY-4.0'],
      url: 'https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md',
      reason: 'Seçilen geometri, üst kaynak zinciri, atıf ve değişiklik bildirimi incelenmeli.',
    },
    {
      sourceKey: 'pleiades',
      decision: 'manual-review',
      licenses: ['CC-BY-3.0'],
      url: 'https://pleiades.stoa.org/downloads',
      reason: 'Sürüm, nesne hakları ve atıf incelemesi gerekli.',
    },
    {
      sourceKey: 'whg',
      decision: 'manual-review',
      licenses: ['CC-BY-4.0'],
      url: 'https://whgazetteer.org/licenses/',
      reason: 'Derleme lisansı tek başına bağlı veri setlerini onaylamaz.',
    },
    {
      sourceKey: 'historical-basemaps',
      decision: 'disallowed',
      licenses: [],
      url: 'https://github.com/aourednik/historical-basemaps/blob/master/LICENSE',
      reason: 'BLOCKED FOR REDISTRIBUTION: GPL kod deposu geometrilerin hak zincirini çözmez.',
    },
    {
      sourceKey: 'cshapes',
      decision: 'disallowed',
      licenses: [],
      url: 'https://icr.ethz.ch/data/cshapes/',
      reason: 'NC koşulu ilk açık katalog politikasına uygun değil.',
    },
    {
      sourceKey: 'euratlas',
      decision: 'disallowed',
      licenses: [],
      url: 'https://www.euratlas.net/shop/licences/licence_gis_gb.pdf',
      reason: 'Ham geometri yeniden dağıtımı onaylanmadı.',
    },
    {
      sourceKey: 'seshat-general',
      decision: 'disallowed',
      licenses: [],
      url: 'https://www.seshat-db.com/terms/current/',
      reason: 'Doğrudan veri/sürüm hakları doğrulanmadı; Cliopatria ile aynı karar değil.',
    },
  ],
} as const;

export interface ManualApproval {
  sourceId: string;
  revision: string;
  sha256: string;
  licenseId: string;
  reviewedBy: string;
  reviewedAt: string;
  obligations: string;
}
// Raw input cannot approve itself; this approval covers only the factual extraction (not site images/GIS).
export const manualApprovals: readonly ManualApproval[] = [
  {
    sourceId: 'source:cliopatria-v021-world',
    revision: 'v0.2.1-world-source-reconstruction-2',
    sha256: 'e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4',
    licenseId: 'CC-BY-4.0',
    reviewedBy:
      'Codex — pinned publisher data grant and automated source-fidelity/topology audit; not independent historical verification',
    reviewedAt: '2026-10-17',
    obligations:
      'Only Cliopatria v0.2.1 archive SHA above, CC BY 4.0 author/source/license/change notices in assets and cards. Separate world manifest and hash-checked asset protocol; low-confidence source reconstructions, original nonzero FromYear/ToYear, quarantined invalid rows, no inferred QID/Wikipedia links or sovereignty. No other Seshat/Historical Basemaps data grant. See docs/world-coverage-implementation.md and machine import report.',
  },
  {
    sourceId: 'source:cliopatria-v021-reviewed-rows',
    revision: 'v0.2.1-selected-rows-1',
    sha256: '813065d39006337ea2e759b84c42caba5f7b02b4063e4648b39e4e622216a583',
    licenseId: 'CC-BY-4.0',
    reviewedBy:
      'Codex — 16 explicit source rows, CC BY data grant and geometry/source-fidelity review; no independent historical boundary verification',
    reviewedAt: '2026-10-16T20:31:52.000Z',
    obligations:
      'Only pinned 16-row extraction from ZIP e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4. Credit Cliopatria/Seshat/Bennett et al.; CC BY 4.0 link and winding/component change notice. Low confidence/documented approximate, original FromYear/ToYear only; no 2024+ extrapolation, no imported Wikipedia guesses/QIDs or inferred sovereignty/capital/population. See docs/atlas-data-integration.md.',
  },
  {
    sourceId: 'source:nara-alaska-1867',
    revision: 'NARA-RG11-1867-03-30-page-reviewed-2024-03-28-extract-1',
    sha256: 'cbf1c3025bee36012e7fa1b3015ffb25d766a55b54c78aaaafdc3544a01cdf62',
    licenseId: 'CC0-1.0',
    reviewedBy: 'Codex — official treaty transcription and NARA rights-policy review',
    reviewedAt: '2026-10-15T18:40:11.000Z',
    obligations:
      'Kaynak URL/RG11/madde ve editöryal çıkarım yöntemi korunur; 141°W ideal çizgisi yalnız 65–68°N kesiti ve 1867-06-20 snapshot olarak sunulur. Fotoğraf/tam polygon/ölçülmüş WGS84 sınır yok; modern veya fiilî egemenlik iddiası yok.',
  },
];
