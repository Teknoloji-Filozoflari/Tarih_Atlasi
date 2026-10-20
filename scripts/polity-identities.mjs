import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { format } from 'prettier';
import { readGeoJSONFeatures } from './etl/geojson-stream.mjs';
import { worldManifest } from '../src/data/world/generated/manifest.ts';
import { assertWorldManifest } from '../src/data/world/manifest.ts';
import { WORLD_ARCHIVE_SHA } from '../src/data/world/types.ts';

// QIDs are source-provided identity candidates, never Wikipedia title guesses.
// Actual links must still be resolved and validated from Wikidata sitelinks.
assertWorldManifest(worldManifest);
const archive = 'data/staging/map-sources/cliopatria-v0.2.1.geojson.zip';
const hash = createHash('sha256');
for await (const bytes of createReadStream(archive)) hash.update(bytes);
if (hash.digest('hex') !== WORLD_ARCHIVE_SHA) throw new Error('SOURCE_ARCHIVE_HASH');
const expected = new Map(worldManifest.rows.map((row) => [row.index, row]));
const child = spawn('unzip', ['-p', archive, 'cliopatria_polities_only_v021.geojson'], {
  stdio: ['ignore', 'pipe', 'ignore'],
});
const done = new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error('SOURCE_ZIP_EXIT'))));
});
void done.catch(() => {});
const timer = setTimeout(() => child.kill(), 120000);
const ids = {};
let index = 0;
try {
  for await (const feature of readGeoJSONFeatures(child.stdout)) {
    const row = expected.get(index),
      p = feature.properties;
    if (row) {
      if (
        p?.Name !== row.name ||
        p.FromYear !== row.start ||
        p.ToYear !== row.end ||
        p.Type !== 'POLITY'
      )
        throw new Error('IDENTITY_SOURCE_METADATA');
      if (typeof p.Wikidata === 'string' && /^Q[1-9]\d{0,15}$/.test(p.Wikidata))
        ids[index] = p.Wikidata;
      expected.delete(index);
    }
    index++;
  }
  await done;
} finally {
  clearTimeout(timer);
  child.stdout.destroy();
  child.kill();
}
if (expected.size || index !== worldManifest.sourceRows) throw new Error('IDENTITY_SOURCE_ROWS');
const json = JSON.stringify(ids),
  sha = createHash('sha256').update(json).digest('hex');
const output = await format(
  `// Generated from authenticated Cliopatria v0.2.1; CC BY 4.0. QIDs are source identity candidates, not verified Wikipedia links.\nexport const polityIdentityArchive = '${WORLD_ARCHIVE_SHA}';\nexport const polityIdentitySha = '${sha}';\nexport const polityIdentityIds: Readonly<Record<string, string>> = JSON.parse(${JSON.stringify(json)});\n`,
  { parser: 'typescript', singleQuote: true, printWidth: 100 },
);
const target = 'src/sources/generated/polity-identities.ts';
const noticePath = 'assets/licenses/Cliopatria-identity-NOTICE.txt';
const notice = `Cliopatria / Seshat Global History Databank v0.2.1 (Bennett et al.)\nSource identity metadata: CC BY 4.0\nhttps://creativecommons.org/licenses/by/4.0/\nhttps://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1\nArchive SHA-256 ${WORLD_ARCHIVE_SHA}\nExtract SHA-256 ${sha}\nSource Feature index to Wikidata ID only. No article URL guessed, no article text or image copied.\nIdentity candidates are not independent verification of historical borders or sovereignty.\nRuntime Wikipedia links are resolved from Wikidata structured sitelinks, separately CC0.\n`;
if (process.argv.includes('--check')) {
  if ((await readFile(target, 'utf8')) !== output) throw new Error('IDENTITY_INDEX_STALE');
  if ((await readFile(noticePath, 'utf8')) !== notice) throw new Error('IDENTITY_NOTICE_STALE');
} else {
  await writeFile(target, output);
  await writeFile(noticePath, notice);
}
console.log(
  JSON.stringify(
    {
      status: 'PASS',
      rows: Object.keys(ids).length,
      sha256: sha,
      archiveSha256: WORLD_ARCHIVE_SHA,
      scope: 'source QID extraction only; no Wikipedia URL or geometry',
    },
    null,
    2,
  ),
);
