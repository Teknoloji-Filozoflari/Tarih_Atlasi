import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { historyManifest } from '../../src/history/generated/manifest.ts';
import {
  assertHistoryManifest,
  validateHistoryPack,
  createHistoryRepository,
} from '../../src/history/repository.ts';
import { inspectCatalog } from '../etl/pipeline.mjs';
import { auditHistory } from './import.mjs';
export async function checkHistory({ raw = false } = {}) {
  assertHistoryManifest(historyManifest);
  assert.deepEqual(
    historyManifest,
    JSON.parse(await readFile('data/history/manifest.json', 'utf8')),
  );
  const notice = await readFile('assets/licenses/Wikidata-history-NOTICE.txt', 'utf8');
  for (const value of [historyManifest.version, historyManifest.inputSha256, 'CC0-1.0', 'Wikidata'])
    assert.ok(notice.includes(value));
  if (raw) {
    const audit = await auditHistory();
    assert.equal(audit.fingerprint, historyManifest.inputSha256);
    assert.deepEqual(audit.failures, []);
  }
  const repo = createHistoryRepository(historyManifest, async (index, pack) =>
    readFile(`assets/history/${pack.sha256}.atlas`, 'utf8'),
  );
  let people = 0,
    events = 0,
    geometries = 0,
    birthPoints = 0;
  for (let index = 0; index < historyManifest.packs.length; index++) {
    const pack = historyManifest.packs[index],
      text = await readFile(`assets/history/${pack.sha256}.atlas`, 'utf8'),
      catalog = validateHistoryPack(text, index, historyManifest);
    const module = await readFile(`src/history/generated/dom-${pack.sha256}.ts`, 'utf8');
    const encoded = /export default '([A-Za-z0-9+/=]+)'/u.exec(module)?.[1];
    assert.ok(encoded);
    assert.equal(
      gunzipSync(Buffer.from(encoded, 'base64'), { maxOutputLength: pack.bytes }).toString('utf8'),
      text,
    );
    if (raw) await inspectCatalog(catalog, process.cwd());
    await repo.load(index); // Also validates each actual sitelink snapshot, not only its shape.
    for (const r of catalog.records) {
      if (r.kind === 'person') people++;
      if (r.kind === 'event') events++;
      if ('geometry' in r && r.geometry) {
        geometries++;
        if (r.kind === 'person-location') birthPoints++;
      }
    }
  }
  assert.equal(people, historyManifest.counts.people);
  assert.equal(events, historyManifest.counts.events);
  assert.equal(geometries, historyManifest.counts.points);
  assert.equal(birthPoints, historyManifest.counts.birthPoints);
  assert.ok(repo.stats().cachedPacks <= 8);
  return {
    status: 'PASS',
    sourceComparison: raw
      ? 'original raw inputs + exact API sitelinks + pinned hashes'
      : 'pinned normalized production only',
    people,
    events,
    geometries,
    birthPoints,
    packs: historyManifest.packs.length,
    bytes: historyManifest.packs.reduce((n, p) => n + p.bytes, 0),
    cache: repo.stats(),
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await checkHistory({ raw: process.argv.includes('--with-raw') })));
