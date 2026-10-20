import { readFile, readdir, writeFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const lock = JSON.parse(await readFile('package-lock.json', 'utf8')),
  entries = Object.entries(lock.packages).filter(([p]) => p.startsWith('node_modules/'));
const packages = [];
for (let offset = 0; offset < entries.length; offset += 8) {
  packages.push(
    ...(await Promise.all(
      entries.slice(offset, offset + 8).map(async ([path, meta]) => {
        const row = {
          path,
          name: meta.name ?? path.split('node_modules/').at(-1),
          version: meta.version,
          declaredLicense: meta.license ?? null,
          developmentOnly: Boolean(meta.dev),
          installed: false,
          licenseFiles: [],
          reviewStatus: 'MANUAL_REVIEW_REQUIRED',
        };
        try {
          const installed = JSON.parse(await readFile(join(path, 'package.json'), 'utf8'));
          row.installed = installed.version === meta.version;
          row.installedLicense = installed.license ?? null;
          for (const name of (await readdir(path)).filter((n) =>
            /^(?:licen[cs]e|copying|notice)(?:$|[.\-_])/i.test(n),
          )) {
            const p = join(path, name),
              info = await lstat(p);
            if (!info.isFile() || info.isSymbolicLink() || info.size > 262144) continue;
            const bytes = await readFile(p);
            row.licenseFiles.push({
              name,
              bytes: bytes.length,
              sha256: createHash('sha256').update(bytes).digest('hex'),
            });
          }
        } catch (e) {
          row.error = e.code ?? e.name;
        }
        return row;
      }),
    )),
  );
}
const report = {
  generatedAt: new Date().toISOString(),
  scope:
    'Locked npm packages metadata + root license/notice file hashes; not a completed human rights audit or runtime reachability analysis.',
  counts: {
    locked: packages.length,
    installedMatch: packages.filter((p) => p.installed).length,
    withDeclaredLicense: packages.filter((p) => p.declaredLicense).length,
    withRootLicenseFile: packages.filter((p) => p.licenseFiles.length).length,
    withoutRootLicenseFile: packages.filter((p) => !p.licenseFiles.length).length,
    installedWithoutRootLicenseFile: packages.filter((p) => p.installed && !p.licenseFiles.length)
      .length,
    notInstalledMatch: packages.filter((p) => !p.installed).length,
  },
  distributionApproved: false,
  packages,
};
await writeFile(
  process.argv[2] ?? 'docs/reports/phase-16-dependency-licenses.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  `Inspected ${packages.length} lock entries; ${report.counts.withRootLicenseFile} have root license/notice files. Distribution remains unapproved.`,
);
