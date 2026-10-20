import { publicationPolicyVersion } from '../src/data/publication-policy.ts';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { format } from 'prettier';
import { preparedPilot, pilotManifest, pilotNotices } from '../src/data/generated/pilot.ts';
import { validateCatalog } from '../src/domain/validate.ts';
import { createHistoricalDataProvider } from '../src/data/provider.ts';
import { createTimelineEngine } from '../src/timeline/engine.ts';
import { geometryBounds } from '../src/domain/geometry.ts';
import { validateChunk, assertManifest } from '../src/data/chunks/manifest.ts';
import { canonicalJSON, sha256 } from './etl/pipeline.mjs';
export async function buildChunks(value = preparedPilot) {
  const validation = validateCatalog(value);
  assert.ok(validation.ok, 'No chunk may bypass production license/provenance review');
  assert.ok(
    new TextEncoder().encode(JSON.stringify(validation.value)).length <= 512 * 1024,
    'Bootstrap index exceeds budget; do not embed a growing geometry archive.',
  );
  const catalog = validation.value,
    engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  const candidates = [];
  for (const r of catalog.records) {
    if (!('geometry' in r) || !r.geometry || r.temporal.start.kind !== 'known') continue;
    const years = [
      ...new Set(r.temporal.periods?.map((p) => p.start.year) ?? [r.temporal.start.date.year]),
    ];
    for (const year of years) {
      const coverage = await engine.getDataCoverage(year, { includeApproximatePersons: true });
      if (coverage.records.some((h) => h.record.id === r.id)) {
        candidates.push(r);
        break;
      }
    }
  }
  const manifest = {
      version: 1,
      publicationPolicyVersion,
      catalogVersion: catalog.catalogVersion,
      catalogSha256: sha256(`${canonicalJSON(catalog)}\n`),
      entries: [],
    },
    artifacts = {};
  for (const record of candidates)
    for (const lod of ['coarse', 'fine']) {
      const included = new Set([record.id]),
        byId = new Map(catalog.records.map((r) => [r.id, r]));
      const collect = (v) => {
        if (typeof v === 'string' && byId.has(v) && !included.has(v)) {
          included.add(v);
          collect(byId.get(v));
        } else if (v && typeof v === 'object') Object.values(v).forEach(collect);
      };
      collect(record);
      const part = structuredClone(catalog);
      part.records = part.records.filter((r) => included.has(r.id));
      const transforms = new Set(
        part.records.flatMap((r) => r.evidence.flatMap((e) => e.transformationIds)),
      );
      part.transformations = part.transformations.filter((t) => transforms.has(t.id));
      const inputIds = new Set([
        ...part.records.flatMap((r) => r.evidence.map((e) => e.rawInputId)),
        ...part.transformations.flatMap((t) => t.inputIds),
      ]);
      part.inputs = part.inputs.filter((i) => inputIds.has(i.id));
      const sourceIds = new Set([
        ...part.records.flatMap((r) => r.evidence.map((e) => e.sourceId)),
        ...part.inputs.map((i) => i.sourceId),
      ]);
      const pending = [...sourceIds];
      for (let index = 0; index < pending.length; index++) {
        if (index >= 32) throw new Error('SOURCE_CLOSURE_BUDGET');
        const source = catalog.sources.find((s) => s.id === pending[index]);
        if (!source) throw new Error('SOURCE_CLOSURE_MISSING');
        inputIds.add(source.rawInputId);
        for (const id of source.upstreamIds)
          if (!sourceIds.has(id)) {
            sourceIds.add(id);
            pending.push(id);
          }
      }
      part.inputs = catalog.inputs.filter((i) => inputIds.has(i.id));
      part.sources = part.sources.filter((s) => sourceIds.has(s.id));
      // The only coarse derivation is the already-reviewed collinear treaty meridian; no polygon simplifier.
      const root = part.records.find((r) => r.id === record.id);
      if (lod === 'coarse' && root.id === 'atlas:alaska-treaty-segment-1867') {
        assert.equal(root.geometry.type, 'LineString');
        assert.ok(root.geometry.coordinates.every((p) => p[0] === -141));
        root.geometry.coordinates = [
          root.geometry.coordinates[0],
          root.geometry.coordinates.at(-1),
        ];
      }
      const raw = `${canonicalJSON(part)}\n`,
        hash = sha256(raw);
      const entry = {
        id: `${hash}-${lod}`,
        recordId: record.id,
        catalogVersion: catalog.catalogVersion,
        lod,
        bbox: geometryBounds(root.geometry),
        temporal: root.temporal,
        bytes: new TextEncoder().encode(raw).length,
        sha256: hash,
        file: `${hash}.json`,
        licenseIds: [...new Set(part.sources.map((s) => s.licenseId))].sort(),
        attribution: record.attribution,
        sourceIds: [...sourceIds].sort(),
      };
      const checked = validateCatalog(part);
      if (!checked.ok) throw new Error(JSON.stringify(checked.issues));
      validateChunk(raw, entry);
      manifest.entries.push(entry);
      artifacts[entry.file] = raw;
    }
  manifest.entries.sort(
    (a, b) => a.recordId.localeCompare(b.recordId, 'en') || a.lod.localeCompare(b.lod, 'en'),
  );
  assertManifest(manifest);
  return { manifest, artifacts };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const check = process.argv.includes('--check'),
    { manifest, artifacts } = await buildChunks();
  assert.equal(manifest.catalogSha256, pilotManifest.sha256);
  const root = new URL('../', import.meta.url);
  const generated = new URL('src/data/chunks/generated/', root),
    publicRoot = new URL('public/data/chunks/', root);
  const manifestSource = await format(
    `// Generated by scripts/chunks.mjs; only production-reviewed records.\nimport type { ChunkManifest } from '../manifest.ts';\nexport const chunkManifest: ChunkManifest = ${JSON.stringify(manifest)};\n`,
    { parser: 'typescript', singleQuote: true, printWidth: 100 },
  );
  const exports = Object.entries(artifacts).map(([file, raw]) => [
    file,
    raw,
    `chunk-${file.slice(0, -5)}.ts`,
  ]);
  const switchText = `// Generated lazy bundled fallback; no remote data can approve itself.\nexport async function bundledChunk(hash: string): Promise<string> {\nswitch (hash) {\n${exports.map(([file, , name]) => `case '${file.slice(0, -5)}': return (await import('./${name}')).raw;`).join('\n')}\ndefault: throw new Error('CHUNK_NOT_BUNDLED');\n}\n}\n`;
  const outputs = [
    [
      new URL('NOTICE.txt', publicRoot),
      pilotNotices +
        `\nPublication review ${publicationPolicyVersion}: Van Gogh residence and house geography withheld pending independent source review; original provenance retained in the archival catalog.\n` +
        '\nLOD: only the reviewed collinear NARA meridian is reduced to its endpoints at coarse zoom; other geometry is unchanged. No modern or full historical boundary claim.\n',
    ],
    [new URL('manifest.ts', generated), manifestSource],
    [
      new URL('bundled.ts', generated),
      await format(switchText, { parser: 'typescript', singleQuote: true, printWidth: 100 }),
    ],
    [new URL('manifest.json', publicRoot), `${canonicalJSON(manifest)}\n`],
    [
      new URL('public/_headers', root),
      Object.keys(artifacts)
        .map(
          (file) => `/data/chunks/${file}\n  Cache-Control: public, max-age=31536000, immutable\n`,
        )
        .join('') + '/data/chunks/manifest.json\n  Cache-Control: no-cache\n',
    ],
  ];
  for (const [file, raw, name] of exports) {
    outputs.push([new URL(file, publicRoot), raw]);
    outputs.push([
      new URL(name, generated),
      await format(
        `// Licensed reviewed fallback; source chain is inside the catalog.\nexport const raw = ${JSON.stringify(raw)};\n`,
        { parser: 'typescript', singleQuote: true, printWidth: 100 },
      ),
    ]);
  }
  if (!check) {
    await mkdir(generated, { recursive: true });
    await mkdir(publicRoot, { recursive: true });
  }
  for (const [url, text] of outputs) {
    if (check) assert.equal(await readFile(url, 'utf8'), text, url.pathname);
    else await writeFile(url, text);
  }
  if (!check) {
    for (const name of await readdir(publicRoot))
      if (/^[a-f0-9]{64}\.json$/.test(name) && !Object.hasOwn(artifacts, name))
        await rm(new URL(name, publicRoot));
    const included = new Set(exports.map((entry) => entry[2]));
    for (const name of await readdir(generated))
      if (/^chunk-[a-f0-9]{64}\.ts$/.test(name) && !included.has(name))
        await rm(new URL(name, generated));
  }
  if (check)
    assert.deepEqual(
      (await readdir(publicRoot)).sort(),
      ['NOTICE.txt', 'manifest.json', ...Object.keys(artifacts)].sort(),
      'Unexpected unreviewed public chunk',
    );
  console.log(
    `${check ? 'PASS' : 'Prepared'}: ${manifest.entries.length} manifest entries / ${Object.keys(artifacts).length} unique bounded licensed chunks.`,
  );
}
