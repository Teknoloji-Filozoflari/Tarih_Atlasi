import { execFileSync } from 'node:child_process';
import { constants, openSync, closeSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile, lstat, cp } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function prepareSource(root = process.cwd()) {
  const publish = join(root, '.publish'),
    output = join(publish, 'repository');
  await mkdir(publish, { recursive: true });
  if (
    await lstat(output).catch((e) => {
      if (e.code !== 'ENOENT') throw e;
    })
  )
    throw new Error('.publish/repository zaten var; mevcut Git çalışmasını korumak için duruldu.');
  // A separate metadata directory respects a read-only/absent workspace .git.
  const filter = join(publish, 'filter.git');
  // Write large inventories to disk, avoiding child stdout pipe limits in restricted hosts.
  const capture = join(publish, 'git-command-output.txt');
  const git = (args) => {
    const fd = openSync(capture, 'w');
    try {
      execFileSync('git', args, { cwd: root, stdio: ['ignore', fd, fd] });
    } finally {
      closeSync(fd);
    }
    return readFileSync(capture, 'utf8');
  };
  git(['init', '--bare', '--initial-branch=main', filter]);
  const files = git([
    `--git-dir=${filter}`,
    `--work-tree=${root}`,
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
  ])
    .split('\0')
    .filter(Boolean)
    .sort();
  if (files.length > 50_000 || !files.includes('src/app/index.tsx'))
    throw new Error('SOURCE_INVENTORY');
  let bytes = 0;
  const rejected = [];
  for (const file of files) {
    const info = await lstat(join(root, file));
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.size >= 95 * 1024 * 1024 ||
      /(?:^|\/)\.env(?:\.|$)|\.(?:jks|keystore|pem|key)$/u.test(file)
    )
      rejected.push(file);
    bytes += info.size;
    if (info.size <= 2 * 1024 * 1024) {
      const text = await readFile(join(root, file), 'utf8');
      if (
        /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bAKIA[A-Z0-9]{16}\b/u.test(
          text,
        )
      )
        rejected.push(file);
    }
  }
  if (rejected.length)
    throw new Error('Yayın öncesi incelenmesi gereken dosyalar: ' + rejected.join(', '));
  await mkdir(output);
  for (const file of files) {
    await mkdir(join(output, file, '..'), { recursive: true });
    await cp(join(root, file), join(output, file), { mode: constants.COPYFILE_FICLONE });
  }
  const inRepo = (args) => git(['-C', output, ...args]);
  inRepo(['init', '--initial-branch=main']);
  inRepo(['config', 'user.name', 'Teknoloji-Filozoflari']);
  inRepo(['config', 'user.email', '330387329+Teknoloji-Filozoflari@users.noreply.github.com']);
  inRepo(['config', 'core.autocrlf', 'false']);
  inRepo(['remote', 'add', 'origin', 'https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi.git']);
  inRepo(['add', '--all']);
  inRepo(['commit', '-m', 'feat: publish Tarih Atlası source and preview distribution']);
  const commit = inRepo(['rev-parse', 'HEAD']).trim();
  const report = {
    status: 'PREPARED_NOT_PUSHED',
    directory: output,
    files: files.length,
    bytes,
    commit,
    rejected,
    ignored: [
      'node_modules',
      '.expo',
      'dist',
      'dist-android',
      'android',
      'data/staging',
      '.env',
      '.release',
      '.publish',
      '*.log',
    ],
    preserved:
      'Reviewed runtime data, curated source inputs, tests, license texts and audit documentation.',
  };
  await writeFile(join(publish, 'source-inventory.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  console.log(JSON.stringify(await prepareSource(), null, 2));
