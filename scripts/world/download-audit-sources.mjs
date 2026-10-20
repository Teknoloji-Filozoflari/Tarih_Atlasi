// Review-only download, never a production importer. No large world/OSM planet download.
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { acquireAllowedSource, parseDownloadArgs } from '../map-sources.mjs';
const ne = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson';
export const auditSources = Object.freeze([
  ...['countries', 'map_units'].map((layer) =>
    Object.freeze({
      file: `ne_10m_admin_0_${layer}.geojson`,
      url: `${ne}/ne_10m_admin_0_${layer}.geojson`,
      version: '5.1.2',
      role: 'contemporary-reference-not-2024-certified',
      license: 'public-domain',
      licenseURL: 'https://www.naturalearthdata.com/about/terms-of-use/',
      maxBytes: 32 * 1024 * 1024,
    }),
  ),
  ...['AGO', 'SYR', 'TUR'].map((iso) =>
    Object.freeze({
      file: `geoboundaries-${iso}-ADM0-metadata.json`,
      url: `https://www.geoboundaries.org/api/current/gbOpen/${iso}/ADM0/`,
      version: 'current-unreviewed-metadata',
      role: 'license-and-date-review-only',
      license: 'manual-review-per-record',
      licenseURL: 'https://www.geoboundaries.org/api.html',
      maxBytes: 64 * 1024,
    }),
  ),
  Object.freeze({
    file: 'geoboundaries-SYR-humanitarian-ADM0-metadata.json',
    url: 'https://www.geoboundaries.org/api/current/gbHumanitarian/SYR/ADM0/',
    version: 'current-unreviewed-metadata',
    role: 'license-and-date-review-only',
    license: 'manual-review-per-record',
    licenseURL: 'https://www.geoboundaries.org/api.html',
    maxBytes: 64 * 1024,
  }),
]);
async function main() {
  const { mode, timeoutMs } = parseDownloadArgs(process.argv.slice(2));
  if (mode === '--list') {
    for (const s of auditSources) console.log(`${s.file}\n${s.url}\n${s.role}; ${s.license}`);
    return;
  }
  const root = fileURLToPath(new URL('../../data/staging/world-audit/', import.meta.url));
  for (const spec of auditSources) {
    console.log(`${mode === '--verify' ? 'Kontrol' : 'İndirme'}: ${spec.file}`);
    const result = await acquireAllowedSource(
      spec,
      root,
      { verifyOnly: mode === '--verify', timeoutMs },
      auditSources,
    );
    console.log(`${result.bytes} byte; ${result.status}; SHA256 ${result.sha256}`);
  }
  console.log(
    'Tamam: data/staging/world-audit. Üretime bağlanmadı; tarih/lisans incelemesi gerekir.',
  );
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch((e) => {
    console.error(`İndirme/kontrol tamamlanamadı: ${e.cause?.code ?? e.message}`);
    process.exitCode = 1;
  });
}
