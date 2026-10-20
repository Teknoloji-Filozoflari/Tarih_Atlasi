import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { verifyRelease } from './verify.mjs';
import { fileHash } from './stage.mjs';

const verified = await verifyRelease('.release/web');
if (!/^\d+\.\d+\.\d+-preview\.[1-9]\d*$/u.test(verified.version)) throw new Error('VERSION');
await mkdir('.release/out', { recursive: true });
const name = `tarih-atlasi-web-${verified.version}.tar.gz`;
const output = join('.release/out', name);
execFileSync('tar', ['-C', '.release/web', '-czf', output, '.'], { stdio: 'inherit' });
const sha256 = await fileHash(output);
await writeFile(join('.release/out', 'SHA256SUMS'), `${sha256}  ${name}\n`);
console.log(JSON.stringify({ status: 'PACKAGED_NOT_PUBLISHED', path: output, sha256 }, null, 2));
