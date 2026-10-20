import { lstat, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

async function fileBytes(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink() || entry.name === 'node_modules') continue;
    total += entry.isDirectory() ? await fileBytes(path) : (await lstat(path)).size;
  }
  return total;
}

const packages = [];
for (const [scope, deps] of Object.entries({
  runtime: manifest.dependencies,
  development: manifest.devDependencies,
})) {
  for (const [name, requested] of Object.entries(deps)) {
    const directory = join(root, 'node_modules', name);
    try {
      const installed = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
      packages.push({
        name,
        scope,
        requested,
        installed: installed.version,
        exactMatch: installed.version === requested,
        license: installed.license ?? 'REVIEW REQUIRED',
        ownInstalledFileBytes: await fileBytes(directory),
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      packages.push({
        name,
        scope,
        requested,
        installed: null,
        exactMatch: false,
        license: 'NOT INSPECTED',
        ownInstalledFileBytes: null,
      });
    }
  }
}
const report = {
  metric:
    'Own installed files only; excludes nested node_modules. Not bundle, gzip, APK or total dependency tree size.',
  note: 'Package license labels are evidence, not automatic rights approval. Inspect LICENSE/NOTICE and transitive dependencies before distribution.',
  complete: packages.every((pkg) => pkg.exactMatch),
  packages,
};
await writeFile(
  process.argv[2] ?? join(root, 'docs/reports/dependency-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(
  `Bağımlılık raporu: ${packages.filter((pkg) => pkg.exactMatch).length}/${packages.length} tam sürüm kurulu.`,
);
process.exitCode = report.complete ? 0 : 1;
