// Acquisition only. No extraction, GeoJSON import or writes to production/generated assets.
import { createReadStream } from 'node:fs';
import { mkdir, lstat, open, readFile, link, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const mib = 1024 * 1024;
const ne = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson';
const clio = 'https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/v0.2.1';
export const mapSources = Object.freeze(
  [
    ...['land', 'lakes', 'rivers_lake_centerlines'].map((layer) => ({
      file: `ne_10m_${layer}.geojson`,
      url: `${ne}/ne_10m_${layer}.geojson`,
      version: '5.1.2',
      role: 'contemporary-physical-reference',
      license: 'public-domain',
      licenseURL: 'https://www.naturalearthdata.com/about/terms-of-use/',
      maxBytes: 32 * mib,
    })),
    {
      file: 'cliopatria-v0.2.1.geojson.zip',
      url: `${clio}/cliopatria.geojson.zip`,
      version: '0.2.1',
      role: 'historical-polity-candidate',
      license: 'CC-BY-4.0',
      licenseURL: `${clio}/LICENSE.md`,
      maxBytes: 64 * mib,
    },
    ...['LICENSE.md', 'README.md'].map((name) => ({
      file: `cliopatria-v0.2.1-${name}`,
      url: `${clio}/${name}`,
      version: '0.2.1',
      role: 'source-documentation',
      license: 'review-source-document',
      licenseURL: `${clio}/LICENSE.md`,
      maxBytes: 128 * 1024,
    })),
  ].map(Object.freeze),
);
const options = { highWaterMark: 65536 };
export function downloadTimeoutMs(spec, override) {
  const value = override ?? (spec.file.endsWith('.zip') ? 15 * 60 * 1000 : 120000);
  const ceiling = spec.maxTimeoutMs ?? 30 * 60 * 1000;
  if (
    !Number.isInteger(ceiling) ||
    ceiling < 1000 ||
    ceiling > 2 * 60 * 60 * 1000 ||
    !Number.isInteger(value) ||
    value < 1000 ||
    value > ceiling
  )
    throw new Error('SOURCE_TIMEOUT_BUDGET');
  return value;
}
export function parseDownloadArgs(args, spec = mapSources[0]) {
  if (!args.length) return {};
  if (args.length === 1 && ['--list', '--verify'].includes(args[0])) return { mode: args[0] };
  if (args.length === 2 && args[0] === '--timeout-seconds' && /^[1-9]\d{0,3}$/.test(args[1]))
    return { timeoutMs: downloadTimeoutMs(spec, Number(args[1]) * 1000) };
  throw new Error('Usage: npm run data:download [-- --list|--verify|--timeout-seconds 1800]');
}
async function exists(file) {
  try {
    return await lstat(file);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}
async function hashFile(file, maxBytes) {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size === 0 || info.size > maxBytes)
    throw new Error('SOURCE_FILE_BUDGET');
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(file, options)) {
    bytes += chunk.length;
    if (bytes > maxBytes) throw new Error('SOURCE_FILE_BUDGET');
    hash.update(chunk);
  }
  return { bytes, sha256: hash.digest('hex') };
}
export async function acquireMapSource(spec, root, options = {}) {
  return acquireAllowedSource(spec, root, options, mapSources);
}
// Shared bounded transport. Each CLI owns its fixed, reviewed source allowlist.
export async function acquireAllowedSource(
  spec,
  root,
  {
    fetcher = fetch,
    wait = (ms) => new Promise((r) => setTimeout(r, ms)),
    verifyOnly = false,
    timeoutMs,
    onProgress = () => {},
  } = {},
  allowlist,
) {
  if (!allowlist?.includes(spec)) throw new Error('SOURCE_NOT_ALLOWLISTED');
  const requestTimeout = downloadTimeoutMs(spec, timeoutMs);
  await mkdir(root, { recursive: true });
  if ((await lstat(root)).isSymbolicLink()) throw new Error('SOURCE_DIRECTORY');
  const file = join(root, spec.file),
    receipt = join(root, `${spec.file}.receipt.json`);
  const current = await exists(file),
    tracked = await exists(receipt);
  if (current || tracked) {
    if (
      !current ||
      !tracked ||
      !tracked.isFile() ||
      tracked.isSymbolicLink() ||
      tracked.size > 16384
    )
      throw new Error('SOURCE_UNTRACKED_PRESERVED');
    const meta = JSON.parse(await readFile(receipt, 'utf8'));
    const actual = await hashFile(file, spec.maxBytes);
    if (
      meta.source !== spec.url ||
      meta.version !== spec.version ||
      meta.license !== spec.license ||
      meta.licenseURL !== spec.licenseURL ||
      meta.bytes !== actual.bytes ||
      meta.sha256 !== actual.sha256 ||
      meta.status !== 'downloaded-unreviewed'
    )
      throw new Error('SOURCE_CHECKSUM_OR_RECEIPT_PRESERVED');
    return { ...actual, status: 'cached-unreviewed' };
  }
  if (verifyOnly) throw new Error('SOURCE_NOT_DOWNLOADED');
  for (let attempt = 0; attempt < 2; attempt++) {
    const temp = join(root, `.${spec.file}.${randomUUID()}.partial`);
    const tempReceipt = `${temp}.receipt`;
    let handle,
      transferred = false,
      retryDelay = 1000;
    try {
      const response = await fetcher(spec.url, {
        redirect: 'error',
        signal: AbortSignal.timeout(requestTimeout),
        headers: {
          'User-Agent':
            'TarihAtlasi-SourceAcquisition/1.0 (local review, no runtime tile requests)',
        },
      });
      if (!response.ok) {
        if (response.status !== 429 && response.status < 500)
          throw new Error(`SOURCE_HTTP_${response.status}`);
        const retry = response.headers.get('retry-after');
        if (retry) {
          const seconds = /^\d+$/.test(retry)
            ? Number(retry)
            : Math.max(0, (Date.parse(retry) - Date.now()) / 1000);
          if (!Number.isFinite(seconds) || seconds > 30) throw new Error('SOURCE_RETRY_DEFER');
          retryDelay = Math.max(1000, seconds * 1000);
        }
        throw new Error('SOURCE_TRANSIENT');
      }
      if (!response.body || Number(response.headers.get('content-length') ?? 0) > spec.maxBytes)
        throw new Error('SOURCE_DOWNLOAD_BUDGET');
      handle = await open(temp, 'wx', 0o600);
      let bytes = 0;
      let lastProgress = 0;
      const hash = createHash('sha256');
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > spec.maxBytes) throw new Error('SOURCE_DOWNLOAD_BUDGET');
        hash.update(chunk);
        await handle.writeFile(chunk);
        if (Date.now() - lastProgress >= 10000) {
          lastProgress = Date.now();
          onProgress({ bytes, attempt: attempt + 1 });
        }
      }
      if (!bytes) throw new Error('SOURCE_EMPTY');
      await handle.close();
      handle = null;
      const meta = {
        source: spec.url,
        version: spec.version,
        role: spec.role,
        license: spec.license,
        licenseURL: spec.licenseURL,
        bytes,
        sha256: hash.digest('hex'),
        downloadedAt: new Date().toISOString(),
        status: 'downloaded-unreviewed',
      };
      const receiptHandle = await open(tempReceipt, 'wx', 0o600);
      try {
        await receiptHandle.writeFile(JSON.stringify(meta, null, 2) + '\n');
      } finally {
        await receiptHandle.close();
      }
      // Exclusive hard links avoid replacing another process/user's files.
      await link(temp, file);
      transferred = true;
      await link(tempReceipt, receipt);
      return { bytes, sha256: meta.sha256, status: meta.status };
    } catch (error) {
      if (
        transferred ||
        attempt === 1 ||
        (!['fetch failed', 'SOURCE_TRANSIENT'].includes(error.message) &&
          !['AbortError', 'TimeoutError'].includes(error.name))
      )
        throw error;
      await wait(retryDelay);
    } finally {
      await handle?.close();
      await unlink(temp).catch(() => {});
      await unlink(tempReceipt).catch(() => {});
    }
  }
}
async function main() {
  const { mode, timeoutMs } = parseDownloadArgs(process.argv.slice(2));
  if (mode === '--list') {
    for (const s of mapSources)
      console.log(`${s.file}\n  ${s.url}\n  ${s.license}; max ${s.maxBytes} bytes`);
    console.log('Staging only; this command does not change production map assets.');
    return;
  }
  const root = fileURLToPath(new URL('../data/staging/map-sources/', import.meta.url));
  // Serial acquisition: never more than one request/download in progress.
  for (const spec of mapSources) {
    console.log(`${mode === '--verify' ? 'Kontrol' : 'İndirme'}: ${spec.file}`);
    if (mode !== '--verify')
      console.log(
        `  Süre sınırı: ${downloadTimeoutMs(spec, timeoutMs) / 1000} saniye/deneme; doğrulanmış cache yeniden indirilmez.`,
      );
    const result = await acquireMapSource(spec, root, {
      verifyOnly: mode === '--verify',
      timeoutMs,
      onProgress: ({ bytes, attempt }) =>
        console.log(`  ${attempt}. deneme: ${(bytes / mib).toFixed(1)} MiB alındı…`),
    });
    console.log(`  ${result.bytes} byte; ${result.status}; SHA256 ${result.sha256}`);
  }
  console.log(
    'Tamam: data/staging/map-sources. Edinme kontrolü tamamlandı; bu komut üretim haritasını değiştirmez.',
  );
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch((error) => {
    console.error(`İndirme/kontrol tamamlanamadı: ${error.cause?.code ?? error.message}`);
    if (['TimeoutError', 'AbortError'].includes(error.name))
      console.error(
        'Süre doldu. Önceki tamamlanmış dosyalar korunur. Daha uzun sınır: npm run data:download -- --timeout-seconds 1800',
      );
    process.exitCode = 1;
  });
}
