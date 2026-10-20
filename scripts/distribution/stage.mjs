import { constants, createReadStream } from 'node:fs';
import { cp, mkdir, readFile, readdir, lstat, writeFile, rename, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function fileHash(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

export async function listFiles(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink paketlenemez: ${path}`);
    if (entry.isDirectory()) result.push(...(await listFiles(root, path)));
    else if (entry.isFile()) result.push(path.replaceAll('\\', '/'));
    else throw new Error(`Özel dosya paketlenemez: ${path}`);
  }
  return result.sort();
}

async function copyNotices(root, target) {
  const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
  const index = [];
  for (const [path, meta] of Object.entries(lock.packages)) {
    if (!path) continue;
    if (!/^node_modules\/(?:[\w@.-]+\/)*[\w.-]+$/u.test(path))
      throw new Error('Beklenmeyen kilit dosyası yolu');
    const directory = join(root, path);
    let installed;
    try {
      installed = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT' || !meta.optional) throw error;
      index.push({
        package: path,
        version: meta.version,
        license: meta.license ?? null,
        installed: false,
        optional: true,
        sourceTarball: meta.resolved ?? null,
        integrity: meta.integrity ?? null,
        notices: [],
      });
      continue;
    }
    if (installed.version !== meta.version) throw new Error(`Paket sürümü uyuşmuyor: ${path}`);
    const notices = [];
    for (const name of await readdir(directory)) {
      if (!/^(?:licen[cs]e|copying|notice)(?:$|[.\-_])/iu.test(name)) continue;
      const file = join(directory, name),
        info = await lstat(file);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 1024 * 1024) continue;
      const destination = join('npm', path.slice('node_modules/'.length), name);
      await mkdir(join(target, destination, '..'), { recursive: true });
      await cp(file, join(target, destination));
      notices.push(destination);
    }
    index.push({
      package: installed.name,
      version: meta.version,
      license: meta.license ?? null,
      sourceTarball: meta.resolved ?? null,
      integrity: meta.integrity ?? null,
      developmentOnly: Boolean(meta.dev),
      notices,
    });
  }
  await writeFile(
    join(target, 'npm-index.json'),
    JSON.stringify(
      {
        scope:
          'Locked build dependencies and their available root notices. Presence is not independent legal approval. Dependency source tarballs and integrity retained; no npm runtime install required.',
        packages: index,
      },
      null,
      2,
    ) + '\n',
  );
}

export async function stageRelease({
  root = process.cwd(),
  version = process.env.ATLAS_RELEASE_VERSION ?? '0.1.0-preview.1',
  revision = process.env.ATLAS_RELEASE_REVISION ?? 'unknown',
} = {}) {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+-preview\.[1-9]\d*$/u.test(version) || !version.startsWith(pkg.version + '-'))
    throw new Error('Yalnız package.json sürümüyle eşleşen preview sürümü paketlenebilir');
  if (revision !== 'unknown' && !/^[a-f0-9]{40}$/u.test(revision)) throw new Error('REVISION');
  const output = join(root, '.release/web');
  const temporary = join(root, `.release/.web-building-${process.pid}`);
  await mkdir(temporary, { recursive: false });
  try {
    const copy = async (from, to) => {
      await mkdir(join(temporary, to, '..'), { recursive: true });
      await cp(join(root, from), join(temporary, to), {
        recursive: true,
        mode: constants.COPYFILE_FICLONE,
        filter: async (file) => {
          if ((await lstat(file)).isSymbolicLink()) throw new Error('SYMLINK');
          return true;
        },
      });
    };
    await copy('dist', 'dist');
    await copy('assets/licenses', 'dist/licenses/data');
    await copy('src/places/generated/world/NOTICE.txt', 'dist/licenses/GeoNames-NOTICE.txt');
    await copy('LICENSE', 'LICENSE');
    await copy('LICENSE', 'dist/licenses/PROJECT-LICENSE.txt');
    await copy('THIRD_PARTY_NOTICES.md', 'dist/licenses/THIRD_PARTY_NOTICES.md');
    await copy('docs/release-blockers.md', 'KNOWN-LIMITATIONS.md');
    await copy('docker/RELEASE-README.md', 'README.md');
    await copy('scripts/distribution/server.mjs', 'scripts/server.mjs');
    await copy('scripts/distribution/healthcheck.mjs', 'scripts/healthcheck.mjs');
    await copy('scripts/distribution/verify.mjs', 'scripts/verify.mjs');
    await copy('scripts/distribution/start.sh', 'Baslat.sh');
    await copy('scripts/distribution/start.cmd', 'Baslat.cmd');
    await copy('docker/Dockerfile.release', 'Dockerfile');
    await copyNotices(root, join(temporary, 'dist/licenses'));
    await writeFile(
      join(temporary, 'compose.yaml'),
      `name: tarih-atlasi\nservices:\n  atlas:\n    image: tarih-atlasi:${version}\n    ports:\n      - "127.0.0.1:\${ATLAS_PORT:-8081}:8081"\n    read_only: true\n    cap_drop: [ALL]\n    security_opt: ["no-new-privileges:true"]\n    init: true\n    restart: unless-stopped\n`,
    );
    const files = [];
    for (const path of await listFiles(temporary)) {
      const full = join(temporary, path),
        info = await lstat(full);
      files.push({ path, bytes: info.size, sha256: await fileHash(full) });
    }
    if (!files.some((f) => f.path === 'dist/index.html')) throw new Error('WEB_EXPORT_MISSING');
    const manifest = {
      format: 1,
      product: 'Tarih Atlası',
      version,
      revision,
      status: 'TECHNICAL_PREVIEW',
      files,
    };
    await writeFile(
      join(temporary, 'release-manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n',
    );
    const previous = await lstat(output).catch((e) => {
      if (e.code !== 'ENOENT') throw e;
    });
    if (previous) {
      if (!previous.isDirectory() || previous.isSymbolicLink()) throw new Error('OUTPUT_NOT_OWNED');
      const old = JSON.parse(await readFile(join(output, 'release-manifest.json'), 'utf8'));
      if (old.format !== 1 || old.product !== 'Tarih Atlası') throw new Error('OUTPUT_NOT_OWNED');
      await rm(output, { recursive: true });
    }
    await rename(temporary, output);
    return {
      output,
      files: files.length,
      bytes: files.reduce((sum, f) => sum + f.bytes, 0),
      version,
      revision,
    };
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await mkdir('.release', { recursive: true });
  console.log(JSON.stringify(await stageRelease(), null, 2));
}
