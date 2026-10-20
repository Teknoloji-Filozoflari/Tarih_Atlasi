import { createReadStream } from 'node:fs';
import { readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function verifyRelease(directory) {
  const root = resolve(directory),
    manifestPath = join(root, 'release-manifest.json');
  const manifestInfo = await lstat(manifestPath);
  if (
    !manifestInfo.isFile() ||
    manifestInfo.isSymbolicLink() ||
    manifestInfo.size > 8 * 1024 * 1024
  )
    throw new Error('MANIFEST_SIZE');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (
    manifest.format !== 1 ||
    manifest.product !== 'Tarih Atlası' ||
    !Array.isArray(manifest.files) ||
    manifest.files.length > 30_000
  )
    throw new Error('MANIFEST');
  const expected = new Set(['release-manifest.json']);
  let bytes = 0;
  for (const file of manifest.files) {
    if (
      typeof file.path !== 'string' ||
      file.path.length > 512 ||
      !/^[\w./@+-]+$/u.test(file.path) ||
      file.path.split('/').some((p) => !p || p === '.' || p === '..') ||
      expected.has(file.path) ||
      !/^[a-f0-9]{64}$/u.test(file.sha256) ||
      !Number.isSafeInteger(file.bytes) ||
      file.bytes < 0
    )
      throw new Error('FILE_METADATA');
    expected.add(file.path);
    bytes += file.bytes;
    if (bytes > 2 * 1024 * 1024 * 1024) throw new Error('PACKAGE_SIZE');
  }
  // Check the complete path tree before reading any listed content, including parent symlinks.
  async function walk(prefix = '') {
    for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
      const path = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error('SYMLINK');
      if (entry.isDirectory()) await walk(path + '/');
      else if (!expected.delete(path)) throw new Error('UNEXPECTED_FILE');
    }
  }
  await walk();
  if (expected.size || !manifest.files.some((f) => f.path === 'dist/index.html'))
    throw new Error('MISSING_FILE');
  for (const file of manifest.files) {
    const path = join(root, file.path),
      info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size !== file.bytes)
      throw new Error('FILE_SIZE');
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    if (hash.digest('hex') !== file.sha256) throw new Error('FILE_HASH');
  }
  return { status: 'PASS', version: manifest.version, files: manifest.files.length, bytes };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  console.log(JSON.stringify(await verifyRelease(process.argv[2] ?? '.'), null, 2));
