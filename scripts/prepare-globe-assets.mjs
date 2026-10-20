import { physicalProvider } from '../src/map/globe/provider.ts';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { preparePhysicalWorker } from './globe/validate-worker.mjs';
import { validateLand } from '../src/map/globe/land.ts';

const version = '6.14.0';
const source = physicalProvider.sources.coarse.url;
const generated = new URL('../src/map/globe/generated/', import.meta.url);
const licenses = new URL('../assets/licenses/', import.meta.url);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const maxBytes = 4 * 1024 * 1024;
// Tek istek, en çok 3 deneme, timeout ve kısa exponential backoff. Çalışırken concurrency=1.
async function download() {
  for (let attempt = 0; attempt < 3; attempt++) {
    let delay = 500 * 2 ** attempt;
    try {
      const response = await fetch(source, {
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter && (response.status === 429 || response.status === 503)) {
          const wait = /^\d+$/.test(retryAfter)
            ? Number(retryAfter) * 1000
            : Date.parse(retryAfter) - Date.now();
          if (!Number.isFinite(wait) || wait > 10000)
            throw new TypeError('Rate limited: retry later; no early retry');
          delay = Math.max(delay, wait);
        }
        if (response.status === 429 || response.status >= 500)
          throw new Error(`Temporary HTTP ${response.status}`);
        throw new TypeError(`HTTP ${response.status}`);
      }
      let bytes = 0;
      const chunks = [];
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new TypeError('Land download exceeds 4 MiB');
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      if (error instanceof TypeError && error.message !== 'fetch failed') throw error;
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Download failed');
}

try {
  const pkg = JSON.parse(
    await readFile(new URL('../node_modules/maplibre-gl/package.json', import.meta.url), 'utf8'),
  );
  if (pkg.version !== version || pkg.license !== 'BSD-3-Clause')
    throw new Error('MapLibre version/license mismatch');
  const originalWorker = await readFile(
    new URL('../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url),
    'utf8',
  );
  if (Buffer.byteLength(originalWorker) > 8 * 1024 * 1024)
    throw new Error('Worker exceeds preparation limit');
  // Parse the installed distribution: comments/text must not look like imports.
  const ts = await import('typescript');
  const {
    code: worker,
    disabledImports,
    disabledEvaluations,
  } = preparePhysicalWorker(ts, originalWorker);
  if (Buffer.byteLength(worker) > 8 * 1024 * 1024) throw new Error('Prepared worker exceeds limit');
  const notice = await readFile(
    new URL('../node_modules/maplibre-gl/LICENSE.txt', import.meta.url),
    'utf8',
  );
  const prettier = await import('prettier');
  const formatOptions = await prettier.resolveConfig(
    fileURLToPath(new URL('../package.json', import.meta.url)),
  );
  const formatTS = (code) => prettier.format(code, { ...formatOptions, parser: 'typescript' });
  const fontRoot = new URL('../node_modules/@expo-google-fonts/material-symbols/', import.meta.url);
  const fontPackage = JSON.parse(await readFile(new URL('package.json', fontRoot), 'utf8'));
  if (fontPackage.version !== '0.4.50' || fontPackage.license !== 'MIT AND Apache-2.0') {
    throw new Error('Material Symbols version/license changed; review rights before preparation');
  }
  const fontLicense = await readFile(new URL('LICENSE_FONT', fontRoot), 'utf8');
  const fontWrapperLicense = await readFile(new URL('LICENSE', fontRoot), 'utf8');
  const notices =
    notice +
    '\nMade with Natural Earth v5.1.2. Public domain.\nhttps://www.naturalearthdata.com/about/terms-of-use/\n' +
    '\nMaterial Symbols — font license:\n' +
    fontLicense +
    '\nMaterial Symbols — wrapper license:\n' +
    fontWrapperLicense;
  let bytes;
  const cache = new URL('natural-earth-v5.1.2-land.geojson', generated);
  try {
    if ((await stat(cache)).size > maxBytes) throw new Error('Cached land exceeds limit');
    bytes = await readFile(cache);
    const provenance = JSON.parse(
      await readFile(new URL('globe-provenance.json', licenses), 'utf8'),
    );
    if (provenance.source !== source || provenance.downloadedSha256 !== hash(bytes))
      throw new Error('Cache provenance mismatch; review/remove cache explicitly');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    bytes = await download();
  }
  if (bytes.length > maxBytes) throw new Error('Cached land exceeds limit');
  const land = validateLand(JSON.parse(bytes.toString('utf8')));
  await mkdir(generated, { recursive: true });
  await mkdir(licenses, { recursive: true });
  await writeFile(cache, bytes);
  await writeFile(
    new URL('physical-land.ts', generated),
    await formatTS(
      `import type { LandCollection } from '../land';\n// Generated from Natural Earth v5.1.2; public domain. See assets/licenses/globe-provenance.json.\nexport const physicalLand: LandCollection | null = ${JSON.stringify(land)};\n`,
    ),
  );
  await writeFile(
    new URL('worker-source.ts', generated),
    await formatTS(
      `// MapLibre ${version}; BSD-3-Clause; see assets/licenses/MapLibre-LICENSE.txt.\nexport const workerSource: string | null = ${JSON.stringify(worker)};\n`,
    ),
  );
  await writeFile(
    new URL('notices.ts', generated),
    await formatTS(
      `// Full notices embedded in both platform bundles.\nexport const globeNotices: string | null = ${JSON.stringify(notices)};\n`,
    ),
  );
  await writeFile(new URL('MapLibre-LICENSE.txt', licenses), notice);
  await writeFile(new URL('MaterialSymbols-FONT-LICENSE.txt', licenses), fontLicense);
  await writeFile(new URL('MaterialSymbols-WRAPPER-LICENSE.txt', licenses), fontWrapperLicense);
  await writeFile(
    new URL('Natural-Earth-NOTICE.txt', licenses),
    'Made with Natural Earth. Physical land v5.1.2 (1:110m), public domain.\nhttps://www.naturalearthdata.com/about/terms-of-use/\nContemporary coastline, not ancient geography. No political labels.\n',
  );
  await writeFile(
    new URL('globe-provenance.json', licenses),
    JSON.stringify(
      {
        source,
        dataVersion: '5.1.2',
        dataLicense: 'public domain',
        terms: 'https://www.naturalearthdata.com/about/terms-of-use/',
        downloadedSha256: hash(bytes),
        downloadedBytes: bytes.length,
        transformedSha256: hash(JSON.stringify(land)),
        transformation: 'validate polygon coordinates; remove all feature properties',
        rendererVersion: version,
        workerBytes: Buffer.byteLength(worker),
        workerSha256: hash(worker),
        originalWorkerSha256: hash(originalWorker),
        originalWorkerBytes: Buffer.byteLength(originalWorker),
        workerTransformation:
          'Disable optional dynamic plugin imports and eval fallback; preserve copyright notices',
        disabledImports,
        disabledEvaluations,
        rendererLicense: 'BSD-3-Clause',
        noticesSha256: hash(notices),
        fontPackageVersion: fontPackage.version,
        fontLicense: 'Apache-2.0',
        fontWrapperLicense: 'MIT',
        preparedAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    'Globe assets prepared. Review provenance + licenses; run formatter, typecheck, exports and GPU tests.',
  );
} catch (error) {
  console.error('BLOCKED — globe assets were not prepared:', error.message);
  process.exitCode = 1;
}
