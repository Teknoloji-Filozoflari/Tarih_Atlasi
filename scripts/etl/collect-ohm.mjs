import { mkdir, writeFile } from 'node:fs/promises';
import { fetchOHM, auditOHM } from './ohm.mjs';
import { sha256, readBounded } from './pipeline.mjs';

try {
  if (
    process.argv.length !== 4 ||
    process.argv[2] !== '--relation' ||
    !/^[1-9]\d{0,11}$/.test(process.argv[3])
  )
    throw new Error(
      'Usage: npm run ohm:collect -- --relation ID; quarantined raw only, no production import',
    );
  const id = Number(process.argv[3]);
  const root = new URL('../../data/raw/', import.meta.url);
  const file = new URL(`ohm-relation-${id}.json`, root),
    manifestFile = new URL(`ohm-relation-${id}.manifest.json`, root);
  try {
    const manifest = JSON.parse((await readBounded(manifestFile, 65536)).toString('utf8'));
    const raw = await readBounded(file, 4 * 1024 * 1024);
    if (sha256(raw) !== manifest.sha256) throw new Error('OHM_CACHE_CHECKSUM');
    const audit = auditOHM(JSON.parse(raw.toString('utf8')), id);
    process.stdout.write(
      `Cached relation ${id} v${audit.root.version}: manual review required; no production geometry.\n`,
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const result = await fetchOHM(id);
    await mkdir(root, { recursive: true });
    await writeFile(file, result.raw, { flag: 'wx' });
    await writeFile(
      new URL(`ohm-relation-${id}.audit.json`, root),
      JSON.stringify(result.audit, null, 2),
      { flag: 'wx' },
    );
    await writeFile(
      manifestFile,
      JSON.stringify(
        {
          version: 1,
          source: result.url,
          retrievedAt: new Date().toISOString(),
          bytes: result.raw.byteLength,
          sha256: sha256(result.raw),
          relationVersion: result.audit.root.version,
          status: 'quarantined-manual-review',
        },
        null,
        2,
      ),
      { flag: 'wx' },
    );
    process.stdout.write(
      `Collected relation ${id}: ${result.audit.records.length} elements, all tags/versions retained. Manual review required; not packaged.\n`,
    );
  }
} catch (error) {
  process.stderr.write(`${error.cause?.code ?? error.message}\n`);
  process.exitCode = 1;
}
