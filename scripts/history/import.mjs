import { readFile, readdir, mkdir, writeFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { normalizeEntity, HISTORY_VERSION, HISTORY_POLICY, ATTRIBUTION } from './normalize.mjs';
import { discoveryQuery, discoveredIds } from './collect.mjs';
import { validateCatalog } from '../../src/domain/validate.ts';
import { peopleCatalogs as a } from '../../src/people/generated/index.ts';
import { peopleCatalogs as b } from '../../src/people/expanded/index.ts';
import { peopleCatalogs as c } from '../../src/people/ottoman/index.ts';
import { peopleCatalogs as d } from '../../src/people/global/index.ts';
import { peopleCatalogs as e } from '../../src/people/broad/index.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { reviewedCities, addReviewedBirth } from './births.mjs';
import { readBounded } from '../etl/pipeline.mjs';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const root = 'data/staging/history';
const receiptOptions = (query) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/sparql-results+json',
  },
  body: new URLSearchParams({ query, format: 'json' }).toString(),
});
export async function checkedRaw(path, expectedUrl, requestHash) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 4 * 1024 * 1024)
    throw Error('HISTORY_RAW_FILE');
  const receiptPath = path.replace(/\.json$/, '.receipt.json');
  const receiptInfo = await lstat(receiptPath);
  if (!receiptInfo.isFile() || receiptInfo.isSymbolicLink())
    throw Error('HISTORY_RAW_RECEIPT_FILE');
  const bytes = await readBounded(path, 4 * 1024 * 1024),
    receipt = JSON.parse(await readBounded(receiptPath, 8192));
  if (
    receipt.bytes !== bytes.length ||
    receipt.sha256 !== hash(bytes) ||
    receipt.licenseId !== 'CC0-1.0' ||
    receipt.productionApproved !== false ||
    receipt.url !== expectedUrl ||
    receipt.requestHash !== requestHash ||
    !Number.isFinite(Date.parse(receipt.fetchedAt))
  )
    throw Error('HISTORY_RAW_RECEIPT');
  return { value: JSON.parse(bytes), receipt };
}
export async function auditHistory() {
  const files = (await readdir(root)).sort(),
    memberships = new Map(),
    queryInputs = [];
  for (const file of files) {
    const match = /^query-([a-z]+)-(start|Q[1-9]\d*)-(\d+)\.json$/.exec(file);
    if (!match) continue;
    const query = discoveryQuery(
      match[1],
      match[2] === 'start' ? null : match[2],
      Math.min(50, Number(match[3])),
    );
    const raw = await checkedRaw(
      `${root}/${file}`,
      'https://query.wikidata.org/sparql',
      hash(JSON.stringify(receiptOptions(query))),
    );
    queryInputs.push({ file, sha256: raw.receipt.sha256 });
    for (const id of discoveredIds(raw.value)) {
      const groups = memberships.get(id) ?? new Set();
      groups.add(match[1]);
      memberships.set(id, groups);
    }
  }
  const inventory = [],
    failures = [];
  for (let offset = 0; offset < files.length; offset += 8)
    await Promise.all(
      files
        .slice(offset, offset + 8)
        .filter((f) => /^entity-Q[1-9]\d*\.json$/.test(f))
        .map(async (file) => {
          try {
            const id = file.slice(7, -5),
              url = new URL('https://www.wikidata.org/w/api.php');
            url.search = new URLSearchParams({
              action: 'wbgetentities',
              ids: id,
              props: 'info|labels|aliases|descriptions|claims|sitelinks/urls',
              languages: 'tr|en',
              format: 'json',
              maxlag: '5',
            }).toString();
            const raw = await checkedRaw(`${root}/${file}`, url.href, hash('{}')),
              entity = raw.value.entities?.[id];
            if (
              entity?.id !== id ||
              entity.type !== 'item' ||
              !Number.isSafeInteger(entity.lastrevid) ||
              entity.lastrevid < 1 ||
              !entity.claims ||
              raw.value.error
            )
              throw Error('HISTORY_RAW_IDENTITY');
            inventory.push({
              qid: id,
              revision: entity.lastrevid,
              sha256: raw.receipt.sha256,
              bytes: raw.receipt.bytes,
              fetchedAt: raw.receipt.fetchedAt,
              groups: [...(memberships.get(id) ?? [])].sort(),
            });
          } catch (error) {
            failures.push({ file, reason: error.message });
          }
        }),
    );
  inventory.sort((a, b) => a.qid.localeCompare(b.qid, 'en'));
  failures.sort((a, b) => a.file.localeCompare(b.file, 'en'));
  return {
    policy: HISTORY_POLICY,
    inventory,
    queryInputs,
    failures,
    fingerprint: hash(JSON.stringify({ policy: HISTORY_POLICY, inventory, queryInputs })),
  };
}
export async function prepareHistory({ auditOnly = false } = {}) {
  const audit = await auditHistory();
  await mkdir('docs/reports/history-import-2026-10-21', { recursive: true });
  await writeFile(
    'docs/reports/history-import-2026-10-21/input-audit.json',
    JSON.stringify(audit, null, 2) + '\n',
  );
  if (auditOnly) return audit;
  const { HISTORY_INPUT_SHA } = await import('../../src/history/policy.ts');
  if (audit.fingerprint !== HISTORY_INPUT_SHA || audit.failures.length)
    throw Error('HISTORY_EDITORIAL_REVIEW_REQUIRED');
  const existing = new Set(
    [...preparedPilot.records, ...[...a, ...b, ...c, ...d, ...e].flatMap((p) => p.records)]
      .filter((r) => ['person', 'event'].includes(r.kind))
      .map((r) => r.wikidataId)
      .filter(Boolean),
  );
  const units = [],
    skipped = [],
    places = await reviewedCities();
  let createdAt = '';
  for (const item of audit.inventory) {
    const raw = JSON.parse(await readFile(`${root}/entity-${item.qid}.json`, 'utf8'));
    const entity = raw.entities[item.qid],
      unit = normalizeEntity(entity, item, item.groups, { existing });
    if (!unit.record) {
      skipped.push({ qid: item.qid, reason: unit.reason });
      continue;
    }
    addReviewedBirth(unit, entity, places);
    createdAt = item.fetchedAt > createdAt ? item.fetchedAt : createdAt;
    units.push(unit);
  }
  const packs = [],
    rows = [],
    sourcePacks = {};
  await mkdir('assets/history', { recursive: true });
  await mkdir('src/history/generated', { recursive: true });
  await mkdir('data/history', { recursive: true });
  for (let offset = 0; offset < units.length; offset += 12) {
    const group = units.slice(offset, offset + 12),
      index = packs.length;
    const sources = [
      ...new Map(
        group
          .flatMap((u) => [u.source, ...(u.placeSource ? [u.placeSource] : [])])
          .map((s) => [s.id, s]),
      ).values(),
    ];
    const inputs = [
      ...new Map(
        group
          .flatMap((u) => [
            { ...u.input, relativePath: `data/staging/history/${u.input.relativePath}` },
            ...(u.placeInput ? [u.placeInput] : []),
          ])
          .map((s) => [s.id, s]),
      ).values(),
    ];
    const catalog = {
      schemaVersion: 2,
      catalogVersion: HISTORY_VERSION,
      createdAt,
      sources,
      records: group.flatMap((u) => [
        u.identity,
        u.record,
        ...(u.birthLocation ? [u.birthLocation] : []),
      ]),
      inputs,
      transformations: [
        {
          id: 'transform:history-normalize',
          version: HISTORY_POLICY,
          description:
            'Pinned Wikidata JSON; original claims/qualifiers/references retained by input checksum. Conservative year-only projection; uncertain or conflicting dates stay unknown. Birth points require single referenced P569/P19 and previously reviewed city; no inferred residence, war centroid, copied article or media.',
          inputIds: inputs.map((u) => u.id),
        },
      ],
    };
    const valid = validateCatalog(catalog);
    if (!valid.ok) throw Error(JSON.stringify(valid.issues.slice(0, 8)));
    const text = JSON.stringify(catalog),
      bytes = Buffer.byteLength(text);
    if (bytes > 256 * 1024) throw Error('HISTORY_PACK_BUDGET');
    const sha256 = hash(text);
    await writeFile(`assets/history/${sha256}.atlas`, text);
    await writeFile(
      `src/history/generated/dom-${sha256}.ts`,
      `// Lossless data only; bounded decompression and hash/schema validation required.\nexport default '${gzipSync(text, { level: 9, mtime: 0 }).toString('base64')}';\n`,
    );
    packs.push({ sha256, bytes, records: catalog.records.length });
    for (const unit of group) {
      const r = unit.record,
        t = r.temporal;
      let start = t.start.kind === 'known' ? t.start.date.year : null,
        end = t.end.kind === 'known' ? t.end.date.year : null;
      if (
        r.kind === 'person' &&
        (start === null || end === null) &&
        unit.birth.start.kind === 'known' &&
        !unit.birth.uncertain
      )
        start = end = unit.birth.start.date.year;
      const point = unit.birthLocation?.geometry ?? (r.kind === 'event' ? r.geometry : null);
      rows.push({
        id: r.id,
        qid: r.wikidataId,
        kind: r.kind,
        type: r.kind === 'person' ? 'PERSON' : r.eventType,
        group: unit.group,
        name: r.names[0].value,
        language: r.names[0].language,
        aliases: [...new Set([...r.names, ...r.alternativeNames].map((n) => n.value))],
        start: t.start.kind === 'known' ? t.start.date.year : null,
        end: t.end.kind === 'known' ? t.end.date.year : null,
        activeStart: start,
        activeEnd: end,
        uncertain: t.uncertain,
        pack: index,
        geometry: (r.kind === 'event' && !!r.geometry) || !!unit.birthLocation,
        geometryYear: unit.birthLocation ? unit.birth.start.date.year : null,
        bbox: point ? [...point.coordinates, ...point.coordinates] : null,
        groups: unit.groups,
      });
      sourcePacks[unit.source.id] = index;
      if (unit.placeSource) sourcePacks[unit.placeSource.id] = index;
    }
  }
  const manifest = {
    version: HISTORY_VERSION,
    inputSha256: audit.fingerprint,
    policy: HISTORY_POLICY,
    createdAt,
    packs,
    rows,
    sourcePacks,
    counts: {
      downloaded: audit.inventory.length,
      people: rows.filter((r) => r.kind === 'person').length,
      events: rows.filter((r) => r.kind === 'event').length,
      points: rows.filter((r) => r.geometry).length,
      birthPoints: rows.filter((r) => r.kind === 'person' && r.geometry).length,
      skipped: skipped.length,
    },
    skipped,
  };
  const json = JSON.stringify(manifest),
    manifestSha = hash(json);
  await writeFile('data/history/manifest.json', json + '\n');
  await writeFile(
    'src/history/generated/manifest.ts',
    await format(
      `import type {HistoryManifest} from '../types';\nexport const historyManifest:HistoryManifest=${json};\nexport const historyManifestSha='${manifestSha}';\n`,
      { parser: 'typescript', singleQuote: true, printWidth: 100 },
    ),
  );
  await writeFile(
    'src/history/generated/assets.ts',
    `/* eslint-disable @typescript-eslint/no-require-imports -- Expo literal static asset references. */\nexport function historyAsset(index:number):number|string {switch(index){\n${packs.map((p, i) => `case ${i}:return require('../../../assets/history/${p.sha256}.atlas');`).join('\n')}\ndefault:throw Error('HISTORY_ASSET_INDEX');}}\n`,
  );
  await writeFile(
    'src/history/generated/dom.ts',
    `export async function historyDOM(index:number):Promise<string>{switch(index){\n${packs.map((p, i) => `case ${i}:return (await import('./dom-${p.sha256}')).default;`).join('\n')}\ndefault:throw Error('HISTORY_ASSET_INDEX');}}\n`,
  );
  await writeFile(
    'assets/licenses/Wikidata-history-NOTICE.txt',
    `${ATTRIBUTION}\nhttps://www.wikidata.org/wiki/Wikidata:Licensing\nRelease ${HISTORY_VERSION}; input inventory SHA256 ${audit.fingerprint}; manifest SHA256 ${manifestSha}.\nOriginal entity JSON is retained in staging with checksums, revisions, qualifiers and references; production packs contain conservative normalized source assertions, not independent historical certificates. Year precision only; no invented midpoint, lifetime presence or war centroid. Existing reviewed entities preserved. No Wikipedia prose, portraits, third-party geometry or Nobel API material copied.\n`,
  );
  await writeFile(
    'docs/reports/history-import-2026-10-21/coverage.json',
    JSON.stringify(
      {
        version: manifest.version,
        counts: manifest.counts,
        skipped,
        groups: Object.fromEntries(
          [...new Set(rows.flatMap((r) => r.groups))]
            .sort()
            .map((g) => [g, rows.filter((r) => r.groups.includes(g)).length]),
        ),
        unknownDates: rows.filter((r) => r.start === null || r.end === null).length,
        trNames: rows.filter((r) => r.language === 'tr').length,
        bytes: packs.reduce((n, p) => n + p.bytes, 0),
        packs: packs.length,
      },
      null,
      2,
    ) + '\n',
  );
  return manifest;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await prepareHistory({ auditOnly: process.argv.includes('--audit') });
  console.log(
    JSON.stringify(
      result.counts ?? {
        verifiedInputs: result.inventory.length,
        failures: result.failures.length,
        fingerprint: result.fingerprint,
      },
    ),
  );
}
