import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
let blocked = false;
function record(label, ok, detail) {
  console.log(`${ok ? 'PASS' : 'BLOCKED'}: ${label} — ${detail}`);
  blocked ||= !ok;
}
const major = Number(process.versions.node.split('.')[0]);
record('Node', [24, 26].includes(major), process.version);
const npmAgentVersion = process.env.npm_config_user_agent?.match(/^npm\/([^ ]+)/)?.[1];
const npm = npmAgentVersion ? null : spawnSync('npm', ['--version'], { encoding: 'utf8' });
const npmVersion = npmAgentVersion ?? npm?.stdout?.trim();
record(
  'npm',
  npmVersion === manifest.packageManager.split('@')[1],
  npmVersion || `komut denetlenemedi: ${npm?.error?.code ?? 'bilinmeyen hata'}`,
);
record(
  'Kilit dosyası',
  existsSync(new URL('../package-lock.json', import.meta.url)),
  'Tekrarlanabilir kurulum için package-lock.json gerekli',
);
for (const [command, args] of [
  ['java', ['-version']],
  ['adb', ['version']],
]) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  record(
    command,
    result.status === 0 && !result.error,
    result.error
      ? `komut çalıştırılamadı: ${result.error.code}`
      : result.status === 0
        ? 'komut çalışıyor'
        : 'komut başarısız oldu',
  );
}
const sdk = process.env.ANDROID_HOME;
record(
  'Android SDK',
  Boolean(sdk && existsSync(sdk)),
  'ANDROID_HOME mevcut ve erişilebilir olmalı',
);
process.exitCode = blocked ? 1 : 0;
