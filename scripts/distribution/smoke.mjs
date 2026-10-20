import assert from 'node:assert/strict';
let ready = false;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const response = await fetch('http://127.0.0.1:8081/healthz', {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok && (await response.text()) === 'ok\n') {
      ready = true;
      break;
    }
  } catch {
    /* A starting container may not yet accept a connection. */
  }
  await new Promise((r) => setTimeout(r, 1000));
}
assert.ok(ready, 'Container did not become ready');
const page = await fetch('http://127.0.0.1:8081/');
assert.equal(page.status, 200);
assert.match(page.headers.get('content-security-policy'), /sha256-/u);
assert.doesNotMatch(page.headers.get('content-security-policy'), /unsafe-eval/u);
assert.match(await page.text(), /<html/u);
assert.equal((await fetch('http://127.0.0.1:8081/missing.js')).status, 404);
assert.equal((await fetch('http://127.0.0.1:8081/', { method: 'POST' })).status, 405);
console.log(
  'PASS: container HTTP readiness, actual HTML, CSP, 404 and method policy. GPU/device performance not measured.',
);
