import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Writable } from 'node:stream';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import {
  createExportResolver,
  createRequestHandler,
  startExportServer,
} from '../../scripts/distribution/server.mjs';
import { verifyRelease } from '../../scripts/distribution/verify.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'atlas-distribution-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'index.html'), '<html><script>/* SYNTHETIC TEST */</script></html>');
  await writeFile(join(root, '+not-found.html'), '<html>404 SYNTHETIC TEST</html>');
  await writeFile(join(root, 'about.html'), '<html>about SYNTHETIC TEST</html>');
  return root;
}
async function request(root, url, method = 'GET', headers = {}) {
  const chunks = [];
  const response = new Writable({
    write(chunk, _encoding, done) {
      chunks.push(chunk);
      done();
    },
  });
  response.writeHead = (status, values) => {
    response.status = status;
    response.headers = values;
    response.headersSent = true;
  };
  await createRequestHandler(root)({ url, method, headers }, response);
  return { status: response.status, headers: response.headers, body: Buffer.concat(chunks) };
}
test('distribution serves static Expo routes, actual 404s, pinned CSP and hashed-pack caching', async (t) => {
  const root = await fixture(t),
    resolve = createExportResolver(root);
  const page = await resolve('/?year=1881');
  assert.equal(page.status, 200);
  assert.match(page.headers['Content-Security-Policy'], /sha256-/u);
  assert.doesNotMatch(page.headers['Content-Security-Policy'], /unsafe-eval/u);
  assert.equal((await resolve('/about')).path, join(root, 'about.html'));
  assert.equal((await resolve('/missing')).status, 404);
  await assert.rejects(resolve('/missing.js'));
  const name = 'a'.repeat(64) + '.atlas';
  await writeFile(join(root, name), '{}');
  assert.match((await resolve('/' + name)).headers['Cache-Control'], /immutable/u);
  assert.equal(page.headers['Cache-Control'], 'no-cache');
});
test('distribution rejects encoded traversal, oversize URLs and symlinks outside the export', async (t) => {
  const root = await fixture(t),
    resolve = createExportResolver(root);
  for (const path of ['/../%2e%2e/private', '/%2fsecret', '/file\\hidden', '/' + 'a'.repeat(4096)])
    await assert.rejects(resolve(path), /PATH/u);
  const outside = await fixture(t);
  await symlink(outside, join(root, 'escape'));
  await assert.rejects(resolve('/escape/index.html'), /PATH/u);
});
test('distribution handles HEAD, conditional requests, health and read-only methods', async (t) => {
  const root = await fixture(t),
    first = await request(root, '/');
  assert.equal(first.status, 200);
  assert.match(first.body.toString(), /SYNTHETIC TEST/u);
  assert.equal((await request(root, '/', 'HEAD')).body.length, 0);
  assert.equal(
    (await request(root, '/', 'GET', { 'if-none-match': first.headers.ETag })).status,
    304,
  );
  assert.equal((await request(root, '/healthz')).body.toString(), 'ok\n');
  assert.equal((await request(root, '/healthz', 'HEAD')).body.length, 0);
  assert.equal((await request(root, '/', 'POST')).status, 405);
  assert.equal((await request(root, '/missing.js')).status, 404);
});
test('distribution streams gzip data without changing source bytes and validates listen configuration', async (t) => {
  const root = await fixture(t),
    text = 'SYNTHETIC TEST\n'.repeat(1000);
  await writeFile(join(root, 'data.atlas'), text);
  const response = await request(root, '/data.atlas', 'GET', { 'accept-encoding': 'br, gzip' });
  assert.equal(response.headers['Content-Encoding'], 'gzip');
  assert.equal(gunzipSync(response.body).toString(), text);
  for (const port of ['0', '65536', 'abc', '-1'])
    await assert.rejects(startExportServer({ directory: root, port }), /ATLAS_PORT/u);
});
test('release verification rejects corrupted, missing and extra files without accepting untracked content', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'dist'));
  const text = 'SYNTHETIC TEST';
  await writeFile(join(root, 'dist/index.html'), text);
  for (const name of ['index.html', '+not-found.html', 'about.html']) await rm(join(root, name));
  const manifest = {
    format: 1,
    product: 'Tarih Atlası',
    version: '0.1.0-preview.1',
    files: [
      {
        path: 'dist/index.html',
        bytes: text.length,
        sha256: createHash('sha256').update(text).digest('hex'),
      },
    ],
  };
  await writeFile(join(root, 'release-manifest.json'), JSON.stringify(manifest));
  assert.equal((await verifyRelease(root)).files, 1);
  await writeFile(join(root, 'dist/index.html'), 'SYNTHETIC FAIL');
  await assert.rejects(verifyRelease(root), /FILE_HASH/u);
  await writeFile(join(root, 'dist/index.html'), text);
  await writeFile(join(root, 'extra.json'), '{}');
  await assert.rejects(verifyRelease(root), /UNEXPECTED_FILE/u);
  await rm(join(root, 'extra.json'));
  await rm(join(root, 'dist/index.html'));
  await assert.rejects(verifyRelease(root));
});
test('release verification rejects traversal and symlinks, even for valid-looking manifest entries', async (t) => {
  const root = await fixture(t);
  await writeFile(
    join(root, 'release-manifest.json'),
    JSON.stringify({
      format: 1,
      product: 'Tarih Atlası',
      files: [{ path: '../secret', bytes: 0, sha256: '0'.repeat(64) }],
    }),
  );
  await assert.rejects(verifyRelease(root), /FILE_METADATA/u);
  await writeFile(
    join(root, 'release-manifest.json'),
    JSON.stringify({ format: 1, product: 'Tarih Atlası', files: [] }),
  );
  await symlink(join(root, 'index.html'), join(root, 'unexpected'));
  await assert.rejects(verifyRelease(root));
  await rm(join(root, 'unexpected'));
  const outside = await fixture(t);
  await symlink(outside, join(root, 'dist'));
  const text = '<html><script>/* SYNTHETIC TEST */</script></html>';
  await writeFile(
    join(root, 'release-manifest.json'),
    JSON.stringify({
      format: 1,
      product: 'Tarih Atlası',
      files: [
        {
          path: 'dist/index.html',
          bytes: Buffer.byteLength(text),
          sha256: createHash('sha256').update(text).digest('hex'),
        },
      ],
    }),
  );
  await assert.rejects(verifyRelease(root), /SYMLINK|UNEXPECTED_FILE/u);
});
