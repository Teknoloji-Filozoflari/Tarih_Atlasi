import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile } from 'node:fs/promises';
const exec = promisify(execFile),
  out = process.argv[2] ?? 'docs/reports/phase-15-android-measurement.json';
const report = {
  measuredAt: new Date().toISOString(),
  status: 'UNVERIFIED ON DEVICE',
  package: 'org.tarihatlasi.app',
  snapshots: [],
  note: 'Read-only adb snapshots; these do not establish long-playback, battery drain or temperature acceptance.',
};
try {
  const { stdout } = await exec('adb', ['devices'], { timeout: 5000, maxBuffer: 65536 });
  const devices = stdout.split('\n').filter((line) => /^\S+\s+device$/.test(line));
  if (devices.length !== 1)
    throw new Error(
      'Exactly one authorized adb device required; device identifiers are not saved.',
    );
  const commands = [
    ['application', 'pidof', 'org.tarihatlasi.app'],
    ['memory', 'dumpsys', 'meminfo', 'org.tarihatlasi.app'],
    ['frames', 'dumpsys', 'gfxinfo', 'org.tarihatlasi.app'],
    ['battery', 'dumpsys', 'battery'],
    ['thermal', 'dumpsys', 'thermalservice'],
  ];
  for (const [kind, ...args] of commands) {
    try {
      const result = await exec('adb', ['shell', ...args], { timeout: 10000, maxBuffer: 262144 });
      report.snapshots.push({ kind, stdout: result.stdout });
    } catch (e) {
      report.snapshots.push({ kind, status: 'UNVERIFIED', reason: e.code ?? e.name });
    }
  }
  report.status = report.snapshots.some((s) => s.status === 'UNVERIFIED')
    ? 'PARTIAL DEVICE SNAPSHOTS'
    : 'DEVICE SNAPSHOTS ONLY — MANUAL SCENARIOS STILL UNVERIFIED';
} catch (e) {
  report.reason = `${e.code ?? e.name}: ${e.message}`;
  process.exitCode = 1;
}
await writeFile(out, JSON.stringify(report, null, 2) + '\n');
console.log(`${report.status}: ${out}`);
