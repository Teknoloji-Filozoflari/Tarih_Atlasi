import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { placesManifest as manifest } from '../../src/places/generated/catalog.ts';
import { assertPlacesManifest, validatePlacePack } from '../../src/places/catalog.ts';
import { createPlaceIdTracker } from './build.mjs';

assertPlacesManifest(manifest);
const root = fileURLToPath(new URL('../../', import.meta.url));
if (!manifest.version) {
  console.log(
    'PARTIAL: Dünya şehir/ilçe kataloğu indirilmedi. Üretimde sentetik dünya verisi yok; önceki altı referans korunur.',
  );
} else {
  const assets = join(root, 'assets/places'),
    modules = join(root, 'src/places/generated/world');
  const actual = (await readdir(assets)).filter((s) => s.endsWith('.atlas')).sort();
  const expected = manifest.packs.map((p) => p.sha256 + '.atlas').sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('PLACES_ASSET_SET');
  let bytes = 0;
  const trackId = createPlaceIdTracker(),
    counts = new Map();
  for (const p of manifest.packs) {
    const raw = await readFile(join(assets, p.sha256 + '.atlas'), 'utf8');
    const rows = validatePlacePack(raw, p, manifest);
    for (const row of rows) {
      trackId(row[0]);
      const kind = row[4].startsWith('ADM')
        ? 'administrative'
        : row[4] === 'PPLX'
          ? 'sections'
          : 'settlements';
      const key = `${row[5]}:${kind}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const gzipModule = await readFile(join(modules, `dom-${p.sha256}.ts`), 'utf8');
    const encoded = /^export const gzip = '([A-Za-z0-9+/=]+)';\n$/u.exec(gzipModule)?.[1];
    if (
      !encoded ||
      encoded.length > 1024 * 1024 ||
      gunzipSync(Buffer.from(encoded, 'base64'), { maxOutputLength: p.bytes }).toString('utf8') !==
        raw
    )
      throw new Error('PLACES_DOM_COPY');
    bytes += p.bytes;
  }
  for (const country of manifest.countries)
    for (const kind of ['settlements', 'administrative', 'sections'])
      if ((counts.get(`${country.code}:${kind}`) ?? 0) !== country[kind])
        throw new Error('PLACES_ACTUAL_COUNTRY_COUNTS');
  const references = await readFile(join(modules, 'assets.ts'), 'utf8'),
    dom = await readFile(join(modules, 'dom-bundled.ts'), 'utf8');
  if (
    (references.match(/case \d+:/gu) ?? []).length !== manifest.packs.length ||
    (dom.match(/case \d+:/gu) ?? []).length !== manifest.packs.length
  )
    throw new Error('PLACES_MODULE_COUNT');
  for (const p of manifest.packs)
    if (!references.includes(`assets/places/${p.sha256}.atlas`) || !dom.includes(`dom-${p.sha256}`))
      throw new Error('PLACES_MODULE_REFERENCE');
  const notice = await readFile(join(modules, 'NOTICE.txt'), 'utf8');
  for (const text of [
    'GeoNames',
    'https://www.geonames.org/',
    'https://creativecommons.org/licenses/by/4.0/',
    manifest.version,
    'Changes:',
    'without completeness/accuracy/timeliness warranty',
  ])
    if (!notice.includes(text)) throw new Error('PLACES_NOTICE');
  console.log(
    JSON.stringify(
      {
        status: 'PASS',
        scope:
          'GeoNames format, rights/provenance metadata, hashes and DOM copies; not historical or device verification',
        version: manifest.version,
        countries: manifest.countries.length,
        counts: manifest.counts,
        packs: manifest.packs.length,
        bytes,
      },
      null,
      2,
    ),
  );
}
