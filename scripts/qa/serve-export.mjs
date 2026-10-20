import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createExportResolver, startExportServer } from '../distribution/server.mjs';
export { exportCSP } from '../distribution/server.mjs';

const resolveExport = createExportResolver('dist');
export async function exportResponse(raw) {
  const resource = await resolveExport(raw);
  return {
    status: resource.status,
    headers: resource.headers,
    body: await readFile(resource.path),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  await startExportServer();
