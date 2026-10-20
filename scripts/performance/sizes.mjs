import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
async function walk(root) {
  const files = [];
  for (const e of await readdir(root, { withFileTypes: true })) {
    const path = join(root, e.name);
    if (e.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}
const output = process.argv[2] ?? 'docs/reports/phase-15-package-sizes.json';
const groups = [];
for (const root of ['dist', 'dist-android', 'public/data/chunks']) {
  try {
    const paths = await walk(root),
      files = [];
    for (const file of paths) {
      const bytes = await readFile(file);
      files.push({
        file,
        bytes: bytes.length,
        gzipBytes: gzipSync(bytes).length,
        brotliBytes: brotliCompressSync(bytes).length,
      });
    }
    groups.push({
      root,
      fileCount: files.length,
      totalBytes: files.reduce((n, f) => n + f.bytes, 0),
      files,
    });
  } catch (e) {
    groups.push({ root, status: 'BLOCKED', error: e.code });
  }
}
await writeFile(
  output,
  JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      node: process.version,
      scope:
        'Filesystem export sizes and local compression, not actual transferred bytes or APK size.',
      groups,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Sizes written to ${output}`);
