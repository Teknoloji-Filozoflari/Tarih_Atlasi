// Explicit SYNTHETIC geometry in an isolated temporary project. Never writes app assets.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, cp, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
test('manual physical import preserves hashes/rights, strips names, and rejects tampering/invalid input', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-detail-synthetic-'));
  try {
    for (const file of [
      'scripts/prepare-detail-land.mjs',
      'src/map/globe/provider.ts',
      'src/map/globe/land.ts',
      'src/map/globe/generated/detail-land.ts',
      'src/map/globe/generated/detail-status.ts',
    ]) {
      await mkdir(dirname(join(dir, file)), { recursive: true });
      await cp(resolve(file), join(dir, file));
    }
    await symlink(resolve('node_modules'), join(dir, 'node_modules'), 'dir');
    // Ensure this test is independent of whether the user has downloaded real detail already.
    await writeFile(
      join(dir, 'src/map/globe/generated/detail-land.ts'),
      'export const detailLand = null;\n',
    );
    const input = join(dir, 'SYNTHETIC-TEST-ONLY.geojson');
    const fixture = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'SYNTHETIC — NEVER PRODUCTION' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
      ],
    };
    await writeFile(input, JSON.stringify(fixture));
    const run = (args) =>
      spawnSync(process.execPath, ['scripts/prepare-detail-land.mjs', ...args], {
        cwd: dir,
        encoding: 'utf8',
        timeout: 15000,
      });
    const prepared = run(['--input', input]);
    assert.equal(prepared.status, 0, prepared.stderr);
    const manifestPath = join(dir, 'assets/licenses/detail-land-provenance.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    assert.equal(manifest.license, 'public domain');
    assert.equal(manifest.acquisition, 'user-supplied-file-from-documented-source');
    assert.match(manifest.downloadedSha256, /^[a-f0-9]{64}$/);
    const outputPath = join(dir, 'src/map/globe/generated/detail-land.ts');
    const output = await readFile(outputPath, 'utf8');
    assert.doesNotMatch(output, /SYNTHETIC — NEVER PRODUCTION/);
    assert.equal(run(['--check']).status, 0);
    await writeFile(
      join(dir, 'src/map/globe/generated/natural-earth-v5.1.2-50m-land.geojson'),
      '{}',
    );
    assert.equal(run(['--check']).status, 1);
    await writeFile(input, '{broken');
    assert.equal(run(['--input', input]).status, 1);
    assert.equal(run(['--input', join(dir, 'missing.geojson')]).status, 1);
    assert.equal(run(['--unexpected']).status, 1);
    const unsafe = structuredClone(fixture);
    unsafe.features[0].geometry.coordinates[0][0] = [181, 0];
    await writeFile(input, JSON.stringify(unsafe));
    assert.equal(run(['--input', input]).status, 1);
    assert.equal(await readFile(outputPath, 'utf8'), output);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
