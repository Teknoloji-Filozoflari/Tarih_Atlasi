import { physicalProvider } from '../src/map/globe/provider.ts';
// Fixed public-domain physical land only; never countries, names, tiles or unknown imports.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { format } from 'prettier';
import { validateLand } from '../src/map/globe/land.ts';
import { detailLand } from '../src/map/globe/generated/detail-land.ts';
const source = physicalProvider.sources.detail.url;
const terms = 'https://www.naturalearthdata.com/about/terms-of-use/';
const rawFile = new URL(
  '../src/map/globe/generated/natural-earth-v5.1.2-50m-land.geojson',
  import.meta.url,
);
const manifestFile = new URL('../assets/licenses/detail-land-provenance.json', import.meta.url);
const output = new URL('../src/map/globe/generated/detail-land.ts', import.meta.url);
const hash = (b) => createHash('sha256').update(b).digest('hex');
const limit = 12 * 1024 * 1024;
async function download() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(source, {
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        if (response.status === 429) throw new TypeError('RATE_LIMIT_DEFER');
        if (response.status < 500) throw new TypeError(`HTTP_${response.status}`);
        throw new Error(`HTTP_${response.status}`);
      }
      const chunks = [];
      let bytes = 0;
      for await (const part of response.body) {
        bytes += part.length;
        if (bytes > limit) throw new TypeError('DETAIL_SIZE');
        chunks.push(part);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      if ((error instanceof TypeError && error.message !== 'fetch failed') || attempt === 2)
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}
try {
  const check = process.argv.includes('--check');
  const args = process.argv.slice(2);
  const input = args[0] === '--input' && args.length === 2 ? args[1] : null;
  assert.ok(
    args.length === 0 || (args.length === 1 && check) || (input && !input.startsWith('--')),
    'Usage: basemap:prepare [--input /path/to/ne_50m_land.geojson] | --check',
  );
  if (check && detailLand === null) {
    assert.match(
      await readFile(
        new URL('../src/map/globe/generated/detail-status.ts', import.meta.url),
        'utf8',
      ),
      /hasDetailLand: boolean = false/,
    );
    console.log(
      'PARTIAL — optional 50m detail is absent; 110m remains explicitly labeled. No fabricated detail.',
    );
    process.exit(0);
  }
  let bytes, manifest;
  try {
    if (input) {
      const info = await lstat(input);
      assert.ok(info.isFile() && !info.isSymbolicLink() && info.size > 0 && info.size <= limit);
      bytes = await readFile(input);
    } else {
      manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
      const info = await import('node:fs/promises').then((fs) => fs.stat(rawFile));
      assert.ok(info.size <= limit);
      bytes = await readFile(rawFile);
      assert.equal(manifest.source, source);
      assert.equal(manifest.downloadedSha256, hash(bytes));
      assert.equal(manifest.license, 'public domain');
      assert.equal(manifest.terms, terms);
    }
  } catch (error) {
    if (input || error.code !== 'ENOENT' || check) throw error;
    bytes = await download();
  }
  assert.ok(bytes.length <= limit);
  const land = validateLand(JSON.parse(bytes), { maxFeatures: 5000, maxPoints: 200000 });
  if (check) {
    assert.equal(hash(JSON.stringify(land)), manifest.transformedSha256);
    assert.deepEqual(detailLand, land);
    const status = await readFile(
      new URL('../src/map/globe/generated/detail-status.ts', import.meta.url),
      'utf8',
    );
    assert.match(status, /hasDetailLand: boolean = true/);
    console.log(`PASS — ${land.features.length} physical 50m features; source/license/hash match.`);
  } else {
    await mkdir(new URL('../assets/licenses/', import.meta.url), { recursive: true });
    await writeFile(rawFile, bytes);
    await writeFile(
      manifestFile,
      JSON.stringify(
        {
          source,
          terms,
          license: 'public domain',
          version: '5.1.2',
          scale: '1:50000000',
          acquisition: input
            ? 'user-supplied-file-from-documented-source'
            : (manifest?.acquisition ?? 'download-or-verified-local-archive'),
          downloadedSha256: hash(bytes),
          downloadedBytes: bytes.length,
          transformedSha256: hash(JSON.stringify(land)),
          transformation:
            'Validate bounded physical polygons; strip every property. Contemporary geography, not historical boundaries.',
        },
        null,
        2,
      ) + '\n',
    );
    await writeFile(
      output,
      await format(
        `import type {LandCollection} from '../land';\n// Natural Earth v5.1.2 50m; public domain; assets/licenses/detail-land-provenance.json\nexport const detailLand:LandCollection|null=${JSON.stringify(land)};\n`,
        { parser: 'typescript', singleQuote: true, printWidth: 95 },
      ),
    );
    await writeFile(
      new URL('../src/map/globe/generated/detail-status.ts', import.meta.url),
      '// Generated presence metadata only. Geometry never enters the native UI bridge.\nexport const hasDetailLand: boolean = true;\n',
    );
    console.log(
      'Prepared verified physical 50m detail. Run basemap:check, exports and GPU/device measurements.',
    );
  }
} catch (error) {
  console.error('BLOCKED — 50m physical detail not prepared:', error.cause?.code ?? error.message);
  process.exitCode = 1;
}
