import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectCatalog, prepareBundle, readBounded, MAX_JSON_BYTES } from './pipeline.mjs';
import { licensePolicy } from '../../src/domain/licensePolicy.ts';

export async function main(args) {
  const [command, ...flags] = args;
  if (command === '--help') {
    process.stdout.write(
      'etl validate|build --input FILE [--raw-root DIR] [--output DIR]\nvalidate: staging schema/provenance/raw hash; build: production gates + atomic versioned bundle. No downloads.\n',
    );
    return;
  }
  if (!['validate', 'build'].includes(command) || flags.length % 2)
    throw new Error('Use etl --help');
  const options = new Map();
  for (let i = 0; i < flags.length; i += 2) {
    if (
      !['--input', '--raw-root', '--output'].includes(flags[i]) ||
      options.has(flags[i]) ||
      flags[i + 1].startsWith('--')
    )
      throw new Error('Unknown/duplicate option');
    options.set(flags[i], flags[i + 1]);
  }
  if (!options.has('--input')) throw new Error('--input required');
  const rawRoot = resolve(options.get('--raw-root') ?? 'data/raw');
  const bytes = await readBounded(resolve(options.get('--input')), MAX_JSON_BYTES);
  const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (command === 'validate') {
    const catalog = await inspectCatalog(value, rawRoot, 'staging');
    process.stdout.write(
      `${JSON.stringify({
        status: 'valid-staging-only',
        productionApproved: false,
        recordCount: catalog.records.length,
        sourceDecisions: catalog.sources.map((source) => ({
          id: source.id,
          ...licensePolicy(
            source,
            catalog.inputs.find((input) => input.id === source.rawInputId),
          ),
        })),
      })}\n`,
    );
    return;
  }
  // All gates and checksums run before any production directory/file is created.
  const bundle = await prepareBundle(value, rawRoot);
  const root = resolve(options.get('--output') ?? 'data/production');
  const destination = join(root, bundle.directory);
  const files = {
    'catalog.json': bundle.catalogText,
    'manifest.json': bundle.manifestText,
    'review-report.json': bundle.reportText,
  };
  await mkdir(root, { recursive: true });
  const temporary = await mkdtemp(join(root, '.etl-'));
  try {
    for (const [name, content] of Object.entries(files))
      await writeFile(join(temporary, name), content, { flag: 'wx' });
    try {
      await rename(temporary, destination);
    } catch (error) {
      if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error;
      for (const [name, content] of Object.entries(files))
        if ((await readFile(join(destination, name), 'utf8')) !== content)
          throw new Error('Immutable version conflict; bump catalog version');
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  process.stdout.write(`${JSON.stringify({ status: 'built', directory: destination })}\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ status: 'rejected', issues: error.issues ?? [{ code: 'ETL_ERROR', path: '$', message: error.message }] })}\n`,
    );
    process.exitCode = 1;
  }
}
