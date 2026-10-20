import assert from 'node:assert/strict';
import { test } from 'node:test';
import { access, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { inspectCatalog, prepareBundle, readBounded, sha256 } from '../../scripts/etl/pipeline.mjs';
import { main } from '../../scripts/etl/cli.mjs';
import { fixtureCatalog, rawText, rawSha256, simulateReviewed } from '../fixtures/historical.mjs';

async function workspace(t) {
  const root = await mkdtemp(join(tmpdir(), 'tarih-phase04-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'fixture.json'), rawText);
  return root;
}
test('ETL ham dosyayı değiştirmez; checksum/revizyon ve belirsizlik izini korur', async (t) => {
  const root = await workspace(t);
  const input = simulateReviewed(fixtureCatalog());
  input.records[0].temporal.basis = 'derived';
  input.records[0].evidence[0].basis = 'derived';
  input.records[0].evidence[0].transformationIds = ['test:transform'];
  input.transformations.push({
    id: 'test:transform',
    version: '1.0.0-test',
    description: 'SYNTHETIC date convention normalization; not a real historical derivation',
    inputIds: ['test:raw'],
  });
  const bundle = await prepareBundle(input, root);
  const output = JSON.parse(bundle.catalogText);
  assert.deepEqual(
    output.records.find((record) => record.id === input.records[0].id),
    input.records[0],
  );
  assert.deepEqual(
    output.records.find((record) => record.id === input.records[0].id).temporal.sourceDate,
    input.records[0].temporal.sourceDate,
  );
  assert.equal(sha256(await readFile(join(root, 'fixture.json'))), rawSha256);
  assert.equal(JSON.parse(bundle.manifestText).sha256, sha256(bundle.catalogText));
  const reverseKeys = (value) =>
    Array.isArray(value)
      ? value.map(reverseKeys)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value)
              .reverse()
              .map(([key, item]) => [key, reverseKeys(item)]),
          )
        : value;
  const reverse = reverseKeys(input);
  reverse.records.reverse();
  const second = await prepareBundle(reverse, root);
  assert.equal(second.catalogText, bundle.catalogText);
  assert.equal(second.manifestText, bundle.manifestText);
  assert.equal(second.reportText, bundle.reportText);
});
test('ETL ham dosya değişikliği, eksik dosya, symlink kaçışı ve boyut aşımını reddeder', async (t) => {
  const root = await workspace(t);
  const catalog = fixtureCatalog();
  await inspectCatalog(catalog, root, 'staging');
  await writeFile(join(root, 'fixture.json'), `${rawText}changed`);
  await assert.rejects(inspectCatalog(catalog, root, 'staging'), (error) =>
    error.issues.some((issue) => issue.code === 'RAW_INPUT_REJECTED'),
  );
  await rm(join(root, 'fixture.json'));
  await assert.rejects(inspectCatalog(catalog, root, 'staging'));
  const outside = await mkdtemp(join(tmpdir(), 'tarih-phase04-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(join(outside, 'raw.json'), rawText);
  await symlink(join(outside, 'raw.json'), join(root, 'fixture.json'));
  await assert.rejects(inspectCatalog(catalog, root, 'staging'), (error) =>
    error.issues[0].message.includes('escapes'),
  );
  await assert.rejects(readBounded(join(outside, 'raw.json'), 1), /INPUT_SIZE/);
});

test('ETL doğrulama sonrası çağıranın mutasyonu üretim kapısını aşamaz', async (t) => {
  const root = await workspace(t);
  const candidate = simulateReviewed(fixtureCatalog());
  const pending = prepareBundle(candidate, root);
  candidate.sources[0].sourceKey = 'historical-basemaps';
  candidate.records[0].reviewStatus = 'unverified';
  const output = JSON.parse((await pending).catalogText);
  assert.equal(output.sources[0].sourceKey, 'wikidata');
  assert.equal(
    output.records.find((record) => record.id === candidate.records[0].id).reviewStatus,
    'verified',
  );
});
test('ETL CLI atıfsız/yasak/sentetik/incelemesiz kayıt için üretim dizini bile oluşturmaz', async (t) => {
  const root = await workspace(t);
  const file = join(root, 'candidate.json');
  const destination = join(root, 'production');
  const cases = [fixtureCatalog()];
  for (const mutate of [
    (x) => {
      x.sources[0].sourceKey = 'historical-basemaps';
    },
    (x) => {
      x.records[0].attribution = '';
    },
    (x) => {
      x.records[0].reviewStatus = 'unverified';
    },
    (x) => {
      x.records[0].evidence[0].licenseId = 'unapproved';
    },
    (x) => {
      x.sources[0].sourceKey = 'openhistoricalmap';
    },
  ]) {
    const copy = simulateReviewed(fixtureCatalog());
    mutate(copy);
    cases.push(copy);
  }
  for (const candidate of cases) {
    await writeFile(file, JSON.stringify(candidate));
    await assert.rejects(
      main(['build', '--input', file, '--raw-root', root, '--output', destination]),
    );
    await assert.rejects(access(destination), { code: 'ENOENT' });
  }
});
test('ETL CLI boş kataloğu atomik/sürümlü yazar; tekrar deterministik ve değiştirilmiş çıktı reddedilir', async (t) => {
  const root = await workspace(t);
  const file = join(root, 'empty.json'),
    destination = join(root, 'production');
  const empty = { ...fixtureCatalog(), sources: [], records: [], inputs: [], transformations: [] };
  await writeFile(file, JSON.stringify(empty));
  const lines = [];
  t.mock.method(process.stdout, 'write', (value) => {
    lines.push(value);
    return true;
  });
  const args = ['build', '--input', file, '--raw-root', root, '--output', destination];
  await main(args);
  await main(args);
  assert.equal(lines.length, 2);
  const output = JSON.parse(lines[0]).directory;
  assert.deepEqual(await readdir(destination), [output.slice(destination.length + 1)]);
  const catalogBytes = await readFile(join(output, 'catalog.json'));
  const manifest = JSON.parse(await readFile(join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.recordCount, 0);
  assert.equal(manifest.sha256, sha256(catalogBytes));
  await writeFile(join(output, 'catalog.json'), 'tampered');
  await assert.rejects(main(args), /Immutable version conflict/);
  assert.equal((await readdir(destination)).length, 1);
  await assert.rejects(main(['build', '--input', file, '--bogus', 'x']));
});
