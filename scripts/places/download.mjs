import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { acquireAllowedSource, parseDownloadArgs } from '../map-sources.mjs';

export const placesRaw = fileURLToPath(new URL('../../data/staging/geonames/', import.meta.url));
export const placeSources = Object.freeze(
  [
    ['readme.txt', 64 * 1024],
    ['countryInfo.txt', 128 * 1024],
    ['admin1CodesASCII.txt', 1024 * 1024],
    ['admin2Codes.txt', 16 * 1024 * 1024],
    ['allCountries.zip', 768 * 1024 * 1024],
  ].map(([file, maxBytes]) =>
    Object.freeze({
      file,
      maxBytes,
      maxTimeoutMs: 2 * 60 * 60 * 1000,
      url: `https://download.geonames.org/export/dump/${file}`,
      version: 'daily-snapshot',
      role: 'contemporary-settlement-administrative-reference',
      license: 'CC-BY-4.0',
      licenseURL: 'https://creativecommons.org/licenses/by/4.0/',
    }),
  ),
);
export const acquirePlaceSource = (spec, root = placesRaw, options = {}) =>
  acquireAllowedSource(spec, root, options, placeSources);

async function main() {
  const { mode, timeoutMs } = parseDownloadArgs(process.argv.slice(2), placeSources[0]);
  if (mode === '--list') {
    for (const s of placeSources)
      console.log(`${s.file}: ${s.url} · ${s.license} · azami ${s.maxBytes} byte`);
    console.log(
      'Dünya yerleşimleri + ADM1–4; sokak veya ilçe sınırı geometrisi içermez. Ham dosyalar staging içinde korunur.',
    );
    return;
  }
  for (const spec of placeSources) {
    console.log(`${mode === '--verify' ? 'Kontrol' : 'İndirme'}: ${spec.file}`);
    const result = await acquirePlaceSource(spec, placesRaw, {
      verifyOnly: mode === '--verify',
      ...(timeoutMs ? { timeoutMs } : {}),
      onProgress: ({ bytes, attempt }) =>
        console.log(`  ${attempt}. deneme · ${(bytes / 1048576).toFixed(1)} MiB`),
    });
    console.log(`  ${result.bytes} byte · ${result.status} · SHA256 ${result.sha256}`);
  }
  console.log('Kaynaklar alındı; haritaya eklemek için: npm run places:prepare');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch((e) => {
    console.error(`Şehir verisi indirilemedi: ${e.cause?.code ?? e.message}`);
    console.error(
      'Tamamlanan dosyalar korunur. Yeniden dene: npm run places:download -- --timeout-seconds 7200',
    );
    process.exitCode = 1;
  });
}
