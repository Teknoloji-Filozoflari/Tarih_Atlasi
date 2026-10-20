import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildPilot } from './build.mjs';
import { discoveryNotice } from './discovery.mjs';
import { canonicalJSON, sha256 } from '../etl/pipeline.mjs';
import { preparedPilot, pilotManifest, pilotNotices } from '../../src/data/generated/pilot.ts';
try {
  const expected = await buildPilot();
  assert.equal(
    await readFile(
      new URL('../../assets/licenses/Wikidata-discovery-NOTICE.txt', import.meta.url),
      'utf8',
    ),
    discoveryNotice,
  );
  assert.equal(
    await readFile(new URL('../../src/places/generated/modern-cities.ts', import.meta.url), 'utf8'),
    expected.cityModule,
  );
  assert.equal(pilotNotices, expected.notices);
  assert.equal(
    canonicalJSON(preparedPilot),
    canonicalJSON(expected.catalog),
    'Generated catalog differs from reviewed derivation',
  );
  assert.equal(canonicalJSON(pilotManifest), canonicalJSON(expected.manifest));
  const root = new URL('../../data/pilot/production/', import.meta.url);
  for (const entry of expected.manifest.artifacts) {
    const bytes = await readFile(new URL(entry.file, root));
    assert.equal(bytes.length, entry.bytes);
    assert.equal(sha256(bytes), entry.sha256);
    assert.equal(bytes.toString('utf8'), expected.artifacts[entry.file]);
  }
  assert.equal(
    await readFile(new URL('manifest.json', root), 'utf8'),
    `${canonicalJSON(expected.manifest)}\n`,
  );
  assert.equal(await readFile(new URL('review-report.json', root), 'utf8'), expected.reportText);
  process.stdout.write(
    'PASS — reviewed raw SHA, catalog, GeoJSON LODs, coverage/rights manifest and generated module match. No browser/device claim.\n',
  );
} catch (error) {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
}
