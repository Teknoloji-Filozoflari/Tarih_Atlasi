import { readFile, readdir, lstat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import ts from 'typescript';
import { workerSource } from '../../src/map/globe/generated/worker-source.ts';
const findings = [],
  files = [];
async function walk(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const p = join(root, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) await walk(p);
    else if (/\.(?:tsx?|mjs|cjs|json|ya?ml)$/.test(entry.name)) {
      const info = await lstat(p);
      if (info.size <= 2 * 1024 * 1024) files.push(p);
    }
  }
}
await walk('src');
await walk('scripts');
await walk('.github');
files.push('app.json', 'env.example', 'package.json', 'package-lock.json');
const hits = [];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const flags = [];
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9]{30,}\b/.test(
      text,
    )
  )
    flags.push('POTENTIAL_SECRET');
  if (
    file.startsWith('src/') &&
    /dangerouslySetInnerHTML|\.innerHTML\s*=|document\.write\s*\(/.test(text)
  )
    flags.push('HTML_INJECTION_SINK');
  if (flags.length) hits.push({ file, flags });
}
const wrapper = await readFile('node_modules/expo/src/dom/webview-wrapper.tsx', 'utf8');
findings.push({
  id: 'SEC-RAW-DOM',
  severity: 'high',
  status: 'OPEN_RELEASE_BLOCKER',
  evidence: {
    file: 'node_modules/expo/src/dom/webview-wrapper.tsx',
    parseBeforeApplicationLimit: wrapper.includes('JSON.parse(event.nativeEvent.data)'),
    applicationCallbackAfterParse: true,
  },
  note: 'Installed Expo transport parses and dispatches before application 4KiB schema. No patched native transport/device test.',
});
const ast = ts.createSourceFile(
    'worker',
    workerSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  ),
  dynamic = [];
function visit(n) {
  if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
    const e = n.expression.getText(ast);
    if (['eval', 'globalThis.eval', 'self.eval', 'Function', 'importScripts'].includes(e))
      dynamic.push({ expression: e, line: ast.getLineAndCharacterOfPosition(n.pos).line + 1 });
  }
  ts.forEachChild(n, visit);
}
visit(ast);
findings.push({
  id: 'SEC-WORKER-DYNAMIC',
  severity: 'high',
  status: dynamic.length ? 'OPEN_RELEASE_BLOCKER' : 'NO_DIRECT_SINK_FOUND',
  calls: dynamic,
  note: 'Optional plugin imports and eval fallback are disabled through AST preparation. No direct sink does not prove full CSP/GPU compatibility; never enable unsafe-eval to hide failures.',
});
const report = {
  generatedAt: new Date().toISOString(),
  filesScanned: files.length,
  patternHits: hits,
  findings,
  limits: [
    'Pattern scan does not prove absence of secrets or XSS. Values are never printed.',
    'Application/ETL scope only; no exhaustive transitive security analysis.',
    'Release CSP headers/native raw bridge require actual platform proof.',
  ],
};
await writeFile(
  process.argv[2] ?? 'docs/reports/phase-16-security-scan.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  `Scanned ${files.length} scoped files; ${hits.length} pattern-hit files; ${findings.filter((f) => f.status === 'OPEN_RELEASE_BLOCKER').length} explicit security blockers.`,
);
