import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertStandaloneWorker,
  preparePhysicalWorker,
} from '../../scripts/globe/validate-worker.mjs';
import { runInNewContext } from 'node:vm';
// Optional CLI path lets an available TS tool copy test the real parser offline.
// Normal project/CI invocation resolves the pinned installed TypeScript package.
const ts = await import(process.argv[2] || 'typescript');

test('worker kontrolü import sözcüğü içeren yorum/metni dış bağımlılık sanmaz', () => {
  for (const source of [
    '// import missing from "somewhere";\nself.onmessage = () => {};',
    'const message = "import(\\"plugin\\") is disabled";',
    'const x = `import from upstream`; export {x};',
  ])
    assert.doesNotThrow(() => assertStandaloneWorker(ts, source));
});
test('worker kontrolü gerçek statik/dinamik import ve re-export işlemlerini reddeder', () => {
  for (const source of [
    'import "./shared.mjs";',
    'import { x } from "./shared.mjs";',
    'export { x } from "./shared.mjs";',
    'export * from "./shared.mjs";',
    'async function plugin() { return import("https://example.invalid/code.mjs"); }',
    'const load = () => import /* split tokens */ ("./shared.mjs");',
  ])
    assert.throws(() => assertStandaloneWorker(ts, source), /not self-contained/);
});
test('boş veya parse edilemeyen worker hazırlanmaz', () => {
  assert.throws(() => assertStandaloneWorker(ts, ''));
  assert.throws(() => assertStandaloneWorker(ts, 'const x = ;'));
});
test('fiziksel worker isteğe bağlı dış modül yüklemeyi kapatır, statik bağımlılığı reddeder', async () => {
  const prepared = preparePhysicalWorker(
    ts,
    '/* Fixture LICENSE notice */ async function plugin(url) { return import(url); } plugin("https://example.invalid/plugin.mjs");',
  );
  assert.equal(prepared.disabledImports, 1);
  assert.match(prepared.code, /Fixture LICENSE notice/);
  assert.doesNotThrow(() => assertStandaloneWorker(ts, prepared.code));
  await assert.rejects(runInNewContext(prepared.code), /External worker modules are disabled/);
  assert.throws(() => preparePhysicalWorker(ts, 'import "./required.mjs";'), /not self-contained/);
});

test('eval plugin fallback is disabled without evaluating user code; comments/licenses survive', () => {
  const prepared = preparePhysicalWorker(
    ts,
    '/* Fixture LICENSE */ globalThis.eval("SHOULD_NOT_RUN()");',
  );
  assert.equal(prepared.disabledEvaluations, 1);
  assert.match(prepared.code, /Fixture LICENSE/);
  assert.throws(() => runInNewContext(prepared.code), /External worker evaluation is disabled/);
  for (const code of ['eval("x")', 'new Function("x")', 'importScripts("https://example.invalid")'])
    assert.throws(() => assertStandaloneWorker(ts, code), /dynamic code execution/);
  assert.doesNotThrow(() =>
    assertStandaloneWorker(ts, 'const text="globalThis.eval(x)"; // eval(x)'),
  );
});
