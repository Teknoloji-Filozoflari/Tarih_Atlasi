import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { WORLD_ARCHIVE_SHA } from '../../src/data/world/types.ts';
import { normalizeWorldGeometry } from '../../src/data/world/geometry.ts';
const root = new URL('../../', import.meta.url);
const sha = (value) => createHash('sha256').update(value).digest('hex');
const archive = new URL('data/staging/map-sources/cliopatria-v0.2.1.geojson.zip', root);
assert.equal((await stat(archive)).size, 46005176);
assert.equal(sha(await readFile(archive)), WORLD_ARCHIVE_SHA);
assert.equal(
  sha(await readFile(new URL('assets/licenses/cliopatria-v021-LICENSE.md', root))),
  '62ca7e92dee4ebe402372d5e64f87845de445a6c0e5d76fddb68b3e33739d1a6',
);
const scope = new Map([
  [13239, { name: 'Republic of Chad', start: 1961, end: 2023, qid: 'Q657' }],
  [13370, { name: 'Libyan Arab Republic', start: 1976, end: 2005, qid: 'Q17435890' }],
  [13580, { name: 'Libyan Arab Republic', start: 2006, end: 2013, qid: 'Q17435890' }],
  [13613, { name: 'Republic of Chad', start: 2024, end: 2024, qid: 'Q657' }],
  [13369, { name: "People's Republic of Angola", start: 1976, end: 2023, qid: 'Q916' }],
  [13659, { name: "People's Republic of Angola", start: 2024, end: 2024, qid: 'Q916' }],
  [13234, { name: 'Mali Federation', start: 1961, end: 2023, qid: 'Q216632' }],
  [13773, { name: 'Mali Federation', start: 2024, end: 2024, qid: 'Q216632' }],
  [13199, { name: 'Republic of Tunisia', start: 1958, end: 1962, qid: 'Q948' }],
  [13254, { name: 'Republic of Tunisia', start: 1963, end: 1972, qid: 'Q948' }],
  [13374, { name: 'Republic of Tunisia', start: 1976, end: 2023, qid: 'Q948' }],
  [13605, { name: 'Republic of Tunisia', start: 2024, end: 2024, qid: 'Q948' }],
]);
for (const [index, row] of scope) {
  const tangency = row.qid === 'Q657' || row.qid === 'Q948';
  Object.assign(row, {
    isolatedShellTangencies: tangency,
    reason: tangency
      ? 'WORLD_RING_INTERSECTION'
      : row.qid === 'Q216632'
        ? 'SOURCE_IDENTITY_DATE_OR_POLITY_SCOPE_REVIEW'
        : 'SOURCE_NAME_PERIOD_REQUIRES_REVIEW',
    reviewedQid: row.qid === 'Q216632' ? 'Q912' : row.qid === 'Q17435890' ? 'Q1016' : row.qid,
    label: { Q657: 'Çad', Q948: 'Tunus', Q916: 'Angola', Q216632: 'Mali', Q17435890: 'Libya' }[
      row.qid
    ],
    identityName: row.qid === 'Q216632' ? 'Mali' : row.name,
    partialArea: index === 13659,
    note: tangency
      ? 'İzole dış/iç halka teğetleri incelendi; bütün kaynak kenarları ve delikler korundu. Bu sabit rekonstrüksiyon dönem içi fiilî kontrol değişimlerini göstermez.'
      : row.qid === 'Q216632'
        ? 'Kaynak başlığı Mali Federation ve Q216632, 1961 sonrası için hatalıdır. Mali ülke kimliği Q912 olarak düzeltildi; 1960 federasyon kaydı ayrı tutulur. Kaynak geometrisi Senegal’i içermeyen Mali alanıdır; fiilî kontrol/cepheler çıkarılamaz. Kimlik incelemesi: https://mjp.univ-perp.fr/constit/ml1960ind.htm ve https://www.wikidata.org/wiki/Q912 .'
        : row.qid === 'Q916'
          ? "Kaynak eski People's Republic of Angola başlığını korur. Angola ülke alanı olarak gösterilir; eski rejim adının bütün dönemde geçerli olduğu iddia edilmez. https://provedordejustica.ao/historia/ ve https://www.wikidata.org/wiki/Q916 ."
          : 'Kaynakta eski Libyan Arab Republic adı ve Q17435890 eşleştirmesi var. Yalnız Libya ülkesinin yaklaşık coğrafyası gösterilir; rejim/fiilî hâkimiyet iddiası değildir. https://www.un.org/en/about-us/member-states/libya ve https://www.wikidata.org/wiki/Q1016 .',
  });
  if (row.partialArea)
    row.note +=
      ' 2024 kaynak poligonu yalnız anakara içerir; Cabinda bu kayıtta yoktur. Tam ülke alanı değildir; önceki yılın geometrisi taşınmadı.';
}
const child = spawn('unzip', [
  '-p',
  fileURLToPath(archive),
  'cliopatria_polities_only_v021.geojson',
]);
const done = new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ZIP_EXIT_${code}`))));
});
void done.catch(() => {});
child.stderr.resume();
const timer = setTimeout(() => child.kill(), 120000);
const rows = [];
let index = 0,
  bytes = 0;
try {
  for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
    bytes += line.length;
    if (line.length > 8 * 1024 * 1024 || bytes > 180 * 1024 * 1024) throw new Error('SOURCE_SIZE');
    if (!line.startsWith('{ "type": "Feature"')) continue;
    const rowIndex = index++;
    if (index > 15000) throw new Error('SOURCE_ROW_COUNT');
    const expected = scope.get(rowIndex);
    if (!expected) continue;
    const feature = JSON.parse(line.replace(/,\s*$/, ''));
    const p = feature.properties;
    assert.deepEqual(
      [p.Name, p.FromYear, p.ToYear, p.Wikidata, p.Type],
      [expected.name, expected.start, expected.end, expected.qid, 'POLITY'],
    );
    const result = normalizeWorldGeometry(feature.geometry, true, {
      isolatedShellTangencies: expected.isolatedShellTangencies,
    });
    const edges = (g) =>
      (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
        .flatMap((poly) =>
          poly.flatMap((ring) =>
            ring
              .slice(1)
              .map((b, i) => [JSON.stringify(ring[i]), JSON.stringify(b)].sort().join('|')),
          ),
        )
        .sort();
    assert.deepEqual(
      edges(feature.geometry),
      edges(result.geometry),
      'Every source edge is retained, up to winding',
    );
    assert.equal(result.removedDuplicatePositions, 0);
    rows.push({
      index: rowIndex,
      ...expected,
      originalGeometrySha256: sha(JSON.stringify(feature.geometry)),
      geometrySha256: sha(JSON.stringify(result.geometry)),
      geometry: result.geometry,
      bbox: result.bbox,
      positions: result.points,
    });
  }
  await done;
} finally {
  clearTimeout(timer);
  child.kill();
}
assert.equal(index, 13797);
assert.equal(rows.length, 12);
const json = JSON.stringify({
  version: '2.0.0',
  archiveSha256: WORLD_ARCHIVE_SHA,
  license: 'CC-BY-4.0',
  rows,
});
const hash = sha(json);
const module = await format(
  `// Cliopatria v0.2.1 / Bennett et al., CC BY 4.0. See country-review-NOTICE.txt.\nexport const countryReviewJson = ${JSON.stringify(json)};\n`,
  { parser: 'typescript', singleQuote: true, printWidth: 100 },
);
const notice = `Cliopatria / Seshat Global History Databank v0.2.1 (Bennett et al.)\nCC BY 4.0 — https://creativecommons.org/licenses/by/4.0/\nhttps://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1\nArchive SHA-256 ${WORLD_ARCHIVE_SHA}\nReview extraction SHA-256 ${hash}\nReviewed rows: ${rows.map((r) => `${r.index}: ${r.name} (${r.start}–${r.end})`).join('; ')}.\nChanges: ring winding normalized only; every source position/edge and hole retained. Chad and Tunisia isolated shell-hole point contacts validated.\nLibya and Angola are shown under short geographic country labels; the source's obsolete regime title remains quoted in provenance, not asserted as its official period name.\nMali post-1960 source identity Q216632 corrected to Q912; original name/QID retained, 1960 federation kept separate. Angola 2024 is partial mainland only: Cabinda absent in source.
Approximate source reconstruction, not annual observation, measured borders, independent historical certification or proof of effective control. No CShapes geometry used.\n`;
for (const [path, value] of [
  ['src/data/world/generated/country-review.ts', module],
  ['assets/licenses/country-review-NOTICE.txt', notice],
]) {
  const file = new URL(path, root);
  if (process.argv.includes('--check')) assert.equal(await readFile(file, 'utf8'), value);
  else await writeFile(file, value);
}
console.log(
  JSON.stringify({ status: 'PASS', hash, rows: rows.map(({ geometry, ...row }) => row) }, null, 2),
);
