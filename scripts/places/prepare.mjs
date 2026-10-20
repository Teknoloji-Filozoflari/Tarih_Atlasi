import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mkdtemp, readFile, mkdir, rename, rm, lstat, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import prettier from 'prettier';
import { acquirePlaceSource, placesRaw, placeSources } from './download.mjs';
import {
  buildPlaces,
  parseCountryNames,
  parseAdminNames,
  unzipGeoNames,
  writePlacesModules,
} from './build.mjs';
import { assertPlacesManifest, validatePlacePack } from '../../src/places/catalog.ts';
const root = fileURLToPath(new URL('../../', import.meta.url));

async function main() {
  if (process.argv.slice(2).length) throw new Error('Usage: npm run places:prepare');
  const receipts = [];
  for (const spec of placeSources) {
    await acquirePlaceSource(spec, placesRaw, { verifyOnly: true });
    const r = JSON.parse(await readFile(join(placesRaw, spec.file + '.receipt.json'), 'utf8'));
    receipts.push({
      file: spec.file,
      url: r.source,
      sha256: r.sha256,
      bytes: r.bytes,
      downloadedAt: r.downloadedAt,
    });
  }
  const readme = await readFile(join(placesRaw, 'readme.txt'), 'utf8');
  if (
    !/Creative Commons Attribution 4\.0 License/u.test(readme) ||
    !readme.includes('https://creativecommons.org/licenses/by/4.0/')
  )
    throw new Error('PLACES_LICENSE_REVIEW_REQUIRED');
  // Same filesystem as destinations, so installation uses atomic directory renames.
  const temporary = await mkdtemp(join(placesRaw, '.build-'));
  const assets = join(temporary, 'assets'),
    generated = join(temporary, 'generated');
  try {
    console.log(
      'Dünya yerleşimleri ve idari birimler akışla ayrılıyor. Kaynak ZIP ve eski uygulama verileri korunuyor.',
    );
    const manifest = await buildPlaces({
      lines: unzipGeoNames(join(placesRaw, 'allCountries.zip')),
      countries: parseCountryNames(await readFile(join(placesRaw, 'countryInfo.txt'), 'utf8')),
      admin1: parseAdminNames(await readFile(join(placesRaw, 'admin1CodesASCII.txt'), 'utf8'), 1),
      admin2: parseAdminNames(await readFile(join(placesRaw, 'admin2Codes.txt'), 'utf8'), 2),
      inputs: receipts,
      temporary,
      output: assets,
      synthetic: false,
      onProgress: ({ rows, counts }) =>
        console.log(
          `  ${rows} kaynak satırı · ${counts.settlements} yerleşim · ${counts.administrative} idari kayıt`,
        ),
    });
    assertPlacesManifest(manifest);
    for (const pack of manifest.packs)
      validatePlacePack(
        await readFile(join(assets, pack.sha256 + '.atlas'), 'utf8'),
        pack,
        manifest,
      );
    await writePlacesModules(manifest, assets, generated);
    const notice = `GeoNames geographical database — https://www.geonames.org/\nLicense: Creative Commons Attribution 4.0 — https://creativecommons.org/licenses/by/4.0/\nSource: https://download.geonames.org/export/dump/\nSource snapshot acquired: ${manifest.downloadedAt}\nCatalog version: ${manifest.version}\nChanges: filtered contemporary P features and ADM1–ADM4 points; WGS84 lon/lat preserved; joined admin names by source codes; split by 2-degree cells/LOD; omitted other features.\nOriginal source names retained; no machine translations, historical validity or district boundary polygons supplied.\nProvided as is, without completeness/accuracy/timeliness warranty. Population is only a label ranking hint.\nSource receipts and SHA256 values: see catalog.ts inputs.\n`;
    await writeFile(join(generated, 'NOTICE.txt'), notice);
    for (const name of ['catalog.ts', 'assets.ts', 'dom-bundled.ts']) {
      const file = join(generated, name);
      const formatConfig = await prettier.resolveConfig(
        join(root, 'src/places/generated/catalog.ts'),
      );
      await writeFile(
        file,
        await prettier.format(await readFile(file, 'utf8'), {
          ...formatConfig,
          parser: 'typescript',
        }),
      );
    }
    // Preserve the previous generated catalog before replacing it; never delete user data or raw inputs.
    const backup = join(placesRaw, 'previous-' + randomUUID());
    await mkdir(backup, { recursive: true });
    const destinations = [
      [assets, join(root, 'assets/places'), 'assets'],
      [generated, join(root, 'src/places/generated/world'), 'modules'],
    ];
    // The world modules have their own directory; existing curated six cities stay untouched.
    const installed = [];
    try {
      for (const [from, to, name] of destinations) {
        await mkdir(join(to, '..'), { recursive: true });
        const old = await lstat(to).catch((e) => {
          if (e.code === 'ENOENT') return null;
          throw e;
        });
        if (old?.isSymbolicLink()) throw new Error('PLACES_GENERATED_SYMLINK');
        const saved = join(backup, name);
        if (old) await rename(to, saved);
        try {
          await rename(from, to);
        } catch (e) {
          if (old) await rename(saved, to);
          throw e;
        }
        installed.push({ to, saved, old });
      }
    } catch (e) {
      for (const { to, saved, old } of installed.reverse()) {
        await rename(to, join(backup, 'failed-' + randomUUID()));
        if (old) await rename(saved, to);
      }
      throw e;
    }
    console.log(
      JSON.stringify(
        {
          status: 'INSTALLED',
          version: manifest.version,
          countries: manifest.countries.length,
          counts: manifest.counts,
          packs: manifest.packs.length,
          bytes: manifest.packs.reduce((s, p) => s + p.bytes, 0),
          previousGeneratedBackup: backup,
        },
        null,
        2,
      ),
    );
    console.log(
      'npm run places:check && npm run check; ardından web/Android için uygulamayı yeniden başlat. Eksiksiz resmî idari envanter iddiası yoktur.',
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
await main().catch((e) => {
  console.error(`Şehir kataloğu hazırlanamadı: ${e.cause?.code ?? e.message}`);
  console.error('Önce: npm run places:download -- --timeout-seconds 7200');
  process.exitCode = 1;
});
