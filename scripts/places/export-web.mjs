import { readFile, mkdir, copyFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { placesManifest } from '../../src/places/generated/catalog.ts';
import { assertPlacesManifest, validatePlacePack } from '../../src/places/catalog.ts';

export async function exportWebPlaces(manifest, source, destination, noticePath) {
  assertPlacesManifest(manifest);
  if (!manifest.version) return { packs: 0, bytes: 0 };
  const notice = await readFile(noticePath, 'utf8');
  for (const required of [
    'GeoNames',
    'https://creativecommons.org/licenses/by/4.0/',
    manifest.version,
    'Changes:',
  ])
    if (!notice.includes(required)) throw new Error('PLACES_NOTICE');
  await mkdir(destination, { recursive: true });
  if ((await lstat(source)).isSymbolicLink() || (await lstat(destination)).isSymbolicLink())
    throw new Error('PLACES_EXPORT_DIRECTORY');
  let bytes = 0;
  for (const pack of manifest.packs) {
    const name = pack.sha256 + '.atlas',
      from = join(source, name),
      to = join(destination, name);
    const info = await lstat(from);
    if (!info.isFile() || info.isSymbolicLink() || info.size !== pack.bytes)
      throw new Error('PLACES_EXPORT_FILE');
    const raw = await readFile(from, 'utf8');
    validatePlacePack(raw, pack, manifest);
    const existing = await lstat(to).catch((e) => {
      if (e.code === 'ENOENT') return null;
      throw e;
    });
    if (existing) {
      if (
        !existing.isFile() ||
        existing.isSymbolicLink() ||
        existing.size !== pack.bytes ||
        createHash('sha256')
          .update(await readFile(to))
          .digest('hex') !== pack.sha256
      )
        throw new Error('PLACES_EXPORT_EXISTING_PRESERVED');
    } else await copyFile(from, to, constants.COPYFILE_EXCL | constants.COPYFILE_FICLONE);
    bytes += pack.bytes;
  }
  await copyFile(noticePath, join(destination, 'NOTICE.txt'));
  return { packs: manifest.packs.length, bytes };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../../', import.meta.url);
  const result = await exportWebPlaces(
    placesManifest,
    fileURLToPath(new URL('assets/places/', root)),
    fileURLToPath(new URL('dist/data/places/', root)),
    fileURLToPath(new URL('src/places/generated/world/NOTICE.txt', root)),
  );
  console.log(
    JSON.stringify({
      status: 'PASS',
      scope: 'hash-validated static web data, outside JavaScript bundles',
      ...result,
    }),
  );
}
