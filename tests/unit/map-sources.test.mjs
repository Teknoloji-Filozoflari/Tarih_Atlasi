// Synthetic acquisition responses only, isolated temp files; never app/catalog geometry.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  acquireMapSource,
  mapSources,
  downloadTimeoutMs,
  parseDownloadArgs,
} from '../../scripts/map-sources.mjs';
const spec = mapSources[0];
async function isolated(run) {
  const root = await mkdtemp(join(tmpdir(), 'atlas-source-synthetic-'));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
test('source acquisition is pinned, serial-compatible and never implies historical/production verification', async () => {
  assert.equal(mapSources.length, 6);
  for (const s of mapSources) {
    assert.equal(new URL(s.url).protocol, 'https:');
    assert.equal(new URL(s.url).hostname, 'raw.githubusercontent.com');
    assert.match(s.url, /\/(v5\.1\.2|v0\.2\.1)\//);
    assert.ok(s.maxBytes <= 64 * 1024 * 1024);
    assert.equal(Object.isFrozen(s), true);
  }
  await isolated(async (root) => {
    let calls = 0;
    const fetcher = async (url, options) => {
      calls++;
      assert.equal(url, spec.url);
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal);
      return new Response('SYNTHETIC RAW ACQUISITION ONLY');
    };
    const acquired = await acquireMapSource(spec, root, { fetcher });
    assert.equal(acquired.status, 'downloaded-unreviewed');
    assert.match(acquired.sha256, /^[a-f0-9]{64}$/);
    const receipt = JSON.parse(await readFile(join(root, `${spec.file}.receipt.json`), 'utf8'));
    assert.equal(receipt.source, spec.url);
    assert.equal(receipt.license, spec.license);
    assert.equal(receipt.status, 'downloaded-unreviewed');
    assert.equal(
      (await acquireMapSource(spec, root, { fetcher, verifyOnly: true })).status,
      'cached-unreviewed',
    );
    assert.equal(calls, 1);
    await writeFile(join(root, spec.file), 'CORRUPT SYNTHETIC CACHE');
    await assert.rejects(
      acquireMapSource(spec, root, { fetcher }),
      /SOURCE_CHECKSUM_OR_RECEIPT_PRESERVED/,
    );
    assert.equal(calls, 1);
    assert.equal(await readFile(join(root, spec.file), 'utf8'), 'CORRUPT SYNTHETIC CACHE');
  });
});
test('source downloader refuses unknown/missing/orphan inputs and preserves existing files', async () => {
  await isolated(async (root) => {
    const fetcher = () => {
      throw new Error('MUST_NOT_FETCH');
    };
    await assert.rejects(
      acquireMapSource({ ...spec, url: 'https://example.invalid' }, root, { fetcher }),
      /SOURCE_NOT_ALLOWLISTED/,
    );
    await assert.rejects(
      acquireMapSource(spec, root, { fetcher, verifyOnly: true }),
      /SOURCE_NOT_DOWNLOADED/,
    );
    await writeFile(join(root, spec.file), 'KEEP USER FILE');
    await assert.rejects(acquireMapSource(spec, root, { fetcher }), /SOURCE_UNTRACKED_PRESERVED/);
    assert.equal(await readFile(join(root, spec.file), 'utf8'), 'KEEP USER FILE');
  });
});
test('source download respects HTTP and byte limits, cleans partials, bounds retries and Retry-After', async () => {
  await isolated(async (root) => {
    for (const response of [
      new Response('not found', { status: 404 }),
      new Response('', { headers: { 'content-length': String(spec.maxBytes + 1) } }),
      new Response(''),
    ]) {
      let calls = 0;
      await assert.rejects(
        acquireMapSource(spec, root, {
          fetcher: async () => {
            calls++;
            return response;
          },
        }),
        /SOURCE_HTTP_404|SOURCE_DOWNLOAD_BUDGET|SOURCE_EMPTY/,
      );
      assert.equal(calls, 1);
      assert.deepEqual(await readdir(root), []);
    }
    await assert.rejects(
      acquireMapSource(spec, root, {
        fetcher: async () => ({
          ok: true,
          headers: new Headers(),
          body: (async function* () {
            yield new Uint8Array(spec.maxBytes + 1);
          })(),
        }),
      }),
      /SOURCE_DOWNLOAD_BUDGET/,
    );
    assert.deepEqual(await readdir(root), []);
    let calls = 0;
    const waits = [];
    const ok = await acquireMapSource(spec, root, {
      fetcher: async () =>
        ++calls === 1
          ? new Response('', { status: 429, headers: { 'retry-after': '2' } })
          : new Response('SYNTHETIC RETRY'),
      wait: async (ms) => {
        waits.push(ms);
      },
    });
    assert.equal(ok.status, 'downloaded-unreviewed');
    assert.equal(calls, 2);
    assert.deepEqual(waits, [2000]);
  });
  await isolated(async (root) => {
    let calls = 0;
    await assert.rejects(
      acquireMapSource(spec, root, {
        fetcher: async () => {
          calls++;
          return new Response('', { status: 429, headers: { 'retry-after': '120' } });
        },
        wait: async () => {
          throw new Error('MUST_DEFER');
        },
      }),
      /SOURCE_RETRY_DEFER/,
    );
    assert.equal(calls, 1);
    assert.deepEqual(await readdir(root), []);
  });
  await isolated(async (root) => {
    let calls = 0;
    const waits = [];
    await assert.rejects(
      acquireMapSource(spec, root, {
        fetcher: async () => {
          calls++;
          throw new TypeError('fetch failed');
        },
        wait: async (ms) => {
          waits.push(ms);
        },
      }),
      /fetch failed/,
    );
    assert.equal(calls, 2);
    assert.deepEqual(waits, [1000]);
    assert.deepEqual(await readdir(root), []);
  });
});

test('large archive gets 15 minutes; bounded override and CLI validation never remove size/rights controls', async (t) => {
  const zip = mapSources.find((s) => s.file.endsWith('.zip'));
  assert.equal(downloadTimeoutMs(zip), 900000);
  assert.equal(downloadTimeoutMs(spec), 120000);
  assert.deepEqual(parseDownloadArgs([]), {});
  assert.deepEqual(parseDownloadArgs(['--verify']), { mode: '--verify' });
  assert.deepEqual(parseDownloadArgs(['--list']), { mode: '--list' });
  assert.deepEqual(parseDownloadArgs(['--timeout-seconds', '1800']), { timeoutMs: 1800000 });
  for (const args of [
    ['--timeout-seconds', '0'],
    ['--timeout-seconds', '1801'],
    ['--timeout-seconds', '1.5'],
    ['--timeout-seconds', 'Infinity'],
    ['--verify', '--timeout-seconds', '900'],
    ['--unexpected'],
  ])
    assert.throws(() => parseDownloadArgs(args));
  for (const value of [0, -1, Infinity, NaN, 1800001, '900000'])
    assert.throws(() => downloadTimeoutMs(zip, value), /SOURCE_TIMEOUT_BUDGET/);
  const limits = [];
  t.mock.method(AbortSignal, 'timeout', (ms) => {
    limits.push(ms);
    return new AbortController().signal;
  });
  await isolated(async (root) => {
    await acquireMapSource(zip, root, {
      fetcher: async () => new Response('SYNTHETIC ZIP ACQUISITION'),
    });
    assert.equal(limits.at(-1), 900000);
    await acquireMapSource(zip, root, {
      fetcher: () => {
        throw new Error('CACHE MUST SKIP FETCH');
      },
    });
    assert.equal(limits.length, 1);
  });
  await isolated(async (root) => {
    await acquireMapSource(zip, root, {
      timeoutMs: 1800000,
      fetcher: async () => new Response('SYNTHETIC OVERRIDE'),
    });
    assert.equal(limits.at(-1), 1800000);
  });
});

test('interrupted body never becomes a completed source; retry restarts cleanly and reports bytes', async () => {
  await isolated(async (root) => {
    let calls = 0;
    const progress = [],
      waits = [];
    const result = await acquireMapSource(spec, root, {
      fetcher: async () =>
        ++calls === 1
          ? {
              ok: true,
              headers: new Headers(),
              body: (async function* () {
                yield new TextEncoder().encode('SYNTHETIC INCOMPLETE');
                throw new DOMException('Test body timeout', 'AbortError');
              })(),
            }
          : new Response('SYNTHETIC COMPLETE'),
      wait: async (ms) => {
        waits.push(ms);
      },
      onProgress: (value) => progress.push(value),
    });
    assert.equal(calls, 2);
    assert.deepEqual(waits, [1000]);
    assert.equal(result.status, 'downloaded-unreviewed');
    assert.equal(await readFile(join(root, spec.file), 'utf8'), 'SYNTHETIC COMPLETE');
    assert.ok(progress.some((p) => p.attempt === 1 && p.bytes > 0));
    assert.ok(progress.some((p) => p.attempt === 2 && p.bytes > 0));
    assert.deepEqual((await readdir(root)).sort(), [spec.file, `${spec.file}.receipt.json`].sort());
    assert.equal(
      (await acquireMapSource(spec, root, { verifyOnly: true })).status,
      'cached-unreviewed',
    );
  });
  await isolated(async (root) => {
    await assert.rejects(
      acquireMapSource(spec, root, {
        fetcher: async () => ({
          ok: true,
          headers: new Headers(),
          body: (async function* () {
            yield new TextEncoder().encode('SYNTHETIC INCOMPLETE');
            throw new DOMException('Test timeout', 'TimeoutError');
          })(),
        }),
        wait: async () => {},
      }),
      /Test timeout/,
    );
    assert.deepEqual(await readdir(root), []);
  });
});
