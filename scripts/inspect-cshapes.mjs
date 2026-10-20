// Research-only CLI. Never writes assets, runtime catalogs, approvals or source files.
import { readdir, mkdir, readFile, writeFile, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { inspectCShapesFile } from './etl/cshapes-review.mjs';
const directory = new URL('../data/staging/country-review/', import.meta.url);
try {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log(
      'npm run cshapes:inspect -- [--file /tam/yol/CShapes.geojson|zip] [--year 2000] [--member arşiv/dosya.geojson]\nDosya yoksa https://icr.ethz.ch/data/cshapes/ sayfasından CShapes 2.0 → GeoJSON indirin; data/staging/country-review/ içine koyun. Çıktı yalnız bu ignored inceleme klasörüne yazılır.',
    );
  } else {
    let file,
      year = 2000,
      member;
    const seen = new Set();
    for (let i = 0; i < args.length; i += 2) {
      const option = args[i],
        value = args[i + 1];
      if (!['--file', '--year', '--member'].includes(option) || !value || seen.has(option))
        throw new Error('CSHAPES_ARGUMENTS');
      seen.add(option);
      if (option === '--file') file = value;
      else if (option === '--member') member = value;
      else {
        if (!/^[1-9]\d{3}$/.test(value)) throw new Error('CSHAPES_YEAR');
        year = Number(value);
      }
    }
    if (!file) {
      const files = (await readdir(directory)).filter(
        (n) =>
          !n.startsWith('review-') && (/\.geojson$/i.test(n) || /^cshapes.*\.(json|zip)$/i.test(n)),
      );
      if (files.length !== 1)
        throw new Error(files.length ? 'CSHAPES_SELECT_FILE' : 'CSHAPES_SOURCE_NOT_FOUND');
      file = fileURLToPath(new URL(encodeURIComponent(files[0]), directory));
    }
    const report = await inspectCShapesFile(file, { year, member });
    const identity = createHash('sha256')
      .update(
        JSON.stringify({
          file: report.input.file,
          inspectionVersion: report.inspectionVersion,
          sha: report.input.sha256,
          member: report.input.member,
          year,
        }),
      )
      .digest('hex');
    await mkdir(directory, { recursive: true });
    const directoryInfo = await lstat(directory);
    if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink())
      throw new Error('CSHAPES_REPORT_DIRECTORY');
    const target = new URL(`review-v${report.inspectionVersion}-${identity}.json`, directory),
      text = JSON.stringify(report, null, 2) + '\n';
    try {
      await writeFile(target, text, { flag: 'wx' });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const info = await lstat(target);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.size > 4 * 1024 * 1024 ||
        (await readFile(target, 'utf8')) !== text
      )
        throw new Error('CSHAPES_EXISTING_REPORT_PRESERVED');
    }
    console.log(
      JSON.stringify(
        {
          status: report.status,
          productionAllowed: false,
          input: report.input,
          summary: report.summary,
          observedDateRange: report.observedDateRange,
          report: fileURLToPath(target),
        },
        null,
        2,
      ),
    );
  }
} catch (error) {
  console.error(
    JSON.stringify({
      status: 'BLOCKED',
      code: error.code ?? error.message,
      message:
        'Kaynak incelemesi tamamlanmadı; üretim verisi değiştirilmedi. Dosyayı data/staging/country-review/ içine koyun veya --file ile tam yol belirtin. Şema/lisans onayı bu komutla verilmez.',
    }),
  );
  process.exitCode = 2;
}
