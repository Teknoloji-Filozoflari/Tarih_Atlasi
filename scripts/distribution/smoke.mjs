import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function smokeBase(raw = process.env.ATLAS_SMOKE_BASE ?? 'http://127.0.0.1:8081') {
  const base = String(raw).replace(/\/$/u, '');
  if (!/^https?:\/\/127\.0\.0\.1(?::\d+)?$/u.test(base)) {
    throw new Error('ATLAS_SMOKE_BASE must be a loopback http(s) origin');
  }
  return base;
}

export async function smokeHttp(base = smokeBase()) {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(`${base}/healthz`, {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok && (await response.text()) === 'ok\n') {
        ready = true;
        break;
      }
    } catch {
      /* A starting server or container may not yet accept a connection. */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.ok(ready, 'HTTP target did not become ready');
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /sha256-/u);
  assert.doesNotMatch(page.headers.get('content-security-policy'), /unsafe-eval/u);
  assert.match(await page.text(), /<html/u);
  assert.equal((await fetch(`${base}/missing.js`)).status, 404);
  assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
  return {
    status: 'PASS',
    scope:
      'HTTP readiness, actual HTML, CSP, 404 and method policy. GPU/device performance not measured.',
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = await smokeHttp();
  console.log(`PASS: ${result.scope}`);
}
