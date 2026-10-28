/**
 * Docker-free web package smoke: serves a staged `.release/web` tree (or ATLAS_SMOKE_DIR)
 * on a loopback port and runs the same HTTP/CSP assertions as container smoke.
 * This does not replace Docker image build/run acceptance.
 */
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const directory = resolve(process.env.ATLAS_SMOKE_DIR ?? '.release/web');
const host = '127.0.0.1';
const port = String(process.env.ATLAS_SMOKE_PORT ?? '18081');
if (!/^\d{1,5}$/u.test(port) || Number(port) < 1 || Number(port) > 65535) {
  throw new Error('ATLAS_SMOKE_PORT must be between 1 and 65535');
}

await access(resolve(directory, 'scripts/server.mjs'));
await access(resolve(directory, 'dist/index.html'));

const server = spawn(process.execPath, ['scripts/server.mjs'], {
  cwd: directory,
  env: {
    ...process.env,
    ATLAS_HOST: host,
    ATLAS_PORT: port,
    NODE_ENV: 'production',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let settled = false;
const fail = (message) => {
  if (settled) return;
  settled = true;
  console.error(message);
  server.kill('SIGTERM');
  process.exitCode = 1;
};

server.stderr.on('data', (chunk) => process.stderr.write(chunk));
server.on('error', (error) => fail(`Web smoke server failed to start: ${error.message}`));
server.on('exit', (code, signal) => {
  if (!settled && (code || signal)) fail(`Web smoke server exited early (${signal ?? code})`);
});

try {
  const smoke = spawn(process.execPath, [resolve(root, 'scripts/distribution/smoke.mjs')], {
    cwd: root,
    env: {
      ...process.env,
      ATLAS_SMOKE_BASE: `http://${host}:${port}`,
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const code = await new Promise((resolveExit) => smoke.on('exit', resolveExit));
  settled = true;
  server.kill('SIGTERM');
  await new Promise((resolveClose) => server.on('close', resolveClose));
  if (code !== 0) process.exitCode = code ?? 1;
  else
    console.log(
      'PASS: docker-free staged web package smoke. Container image build/run remains a separate gate.',
    );
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
