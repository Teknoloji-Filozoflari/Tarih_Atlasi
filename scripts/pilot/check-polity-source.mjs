// Optional local audit of the original archive; never approves or rewrites reviewed rows.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { Transform } from 'node:stream';
import { acquireMapSource, mapSources } from '../map-sources.mjs';
const staging = new URL('../../data/staging/map-sources/', import.meta.url);
const ledger = JSON.parse(
  await readFile(
    new URL('../../data/pilot/raw/cliopatria-reviewed-rows.json', import.meta.url),
    'utf8',
  ),
);
for (const [index, expected] of [
  [3, ledger.archiveSha256],
  [4, ledger.licenseSha256],
  [5, ledger.readmeSha256],
]) {
  const spec = mapSources[index];
  const receipt = await acquireMapSource(spec, fileURLToPath(staging), { verifyOnly: true });
  assert.equal(receipt.sha256, expected);
}
const file = new URL(mapSources[3].file, staging);
assert.equal((await lstat(file)).size, ledger.archiveBytes);
// Hash independently of receipt before decompressing any input.
const digest = createHash('sha256');
for await (const chunk of createReadStream(file)) digest.update(chunk);
assert.equal(digest.digest('hex'), ledger.archiveSha256);
const child = spawn('unzip', ['-p', fileURLToPath(file), ledger.member], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stderrBytes = 0,
  bytes = 0,
  lineBytes = 0;
child.stderr.on('data', (c) => {
  stderrBytes += c.length;
  if (stderrBytes > 8192) child.kill();
});
const closed = new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ZIP_EXIT_${code}`))));
});
// Attach rejection immediately; still await it below so a failed CRC cannot pass.
void closed.catch(() => {});
const timer = setTimeout(() => child.kill(), 60000);
const bounded = new Transform({
  transform(chunk, encoding, callback) {
    bytes += chunk.length;
    for (const byte of chunk) {
      lineBytes = byte === 10 ? 0 : lineBytes + 1;
      if (lineBytes > 8 * 1024 * 1024) return callback(new Error('ZIP_LINE_BUDGET'));
    }
    if (bytes > 180 * 1024 * 1024) return callback(new Error('ZIP_BYTE_BUDGET'));
    callback(null, chunk);
  },
});
child.stdout.pipe(bounded);
let count = 0;
const selected = new Map(ledger.rows.map((row) => [row.index, row.feature]));
const found = new Set();
try {
  for await (const line of createInterface({ input: bounded, crlfDelay: Infinity })) {
    if (!line.startsWith('{ "type": "Feature"')) continue;
    if (count > 15000) throw new Error('ZIP_ROW_BUDGET');
    if (selected.has(count)) {
      assert.deepEqual(
        JSON.parse(line.replace(/,\s*$/, '')),
        selected.get(count),
        `Source row ${count}`,
      );
      found.add(count);
    }
    count++;
  }
  await closed;
  assert.equal(bytes, ledger.memberBytes);
  assert.equal(count, ledger.totalRows);
  assert.equal(found.size, 16);
  console.log(
    `PASS: ${count} rows streamed, ${bytes} uncompressed bytes, all 16 selected rows unchanged; ZIP CRC and source/license/README SHA match. No writes or new approval.`,
  );
} finally {
  clearTimeout(timer);
  child.kill();
}
