import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { validateCatalog } from '../../src/domain/validate.ts';
import { inspectCatalog } from '../etl/pipeline.mjs';
import { reviewedPeopleInputs } from '../../src/people/policy.ts';

export const PEOPLE_VERSION = '1.0.1-births';
export const peopleNotice =
  'Wikidata contributors · CC0-1.0 · https://www.wikidata.org/wiki/Wikidata:Licensing\nEditorial extraction of source birth/life/place assertions; not an API response or independent historical certificate. Representative place points, not exact birth sites. No fabricated dates/locations, portrait/article copy or inferred travel. Traditional/ambiguous statements kept biographical; original calendar/uncertainty retained.\n';
const sha = (v) => createHash('sha256').update(v).digest('hex');
export function sourceYear(text) {
  if (typeof text !== 'string') return null;
  // Accept only an actual date/year value, never reference IDs/URLs or a century midpoint.
  const value = text.replace(/\^\{[^}]*\}/gu, '').trim();
  if (/^(?:\d+\.\s*(?:century|millennium)|\d+s BCE)/u.test(value)) return null;
  const m =
    /^(?:(?:\d{1,2} )?(?:January|February|March|April|May|June|July|August|September|October|November|December) )?(\d{1,4})(?: (BCE|CE))?$/u.exec(
      value,
    );
  return m && Number(m[1]) !== 0 ? Number(m[1]) * (m[2] === 'BCE' ? -1 : 1) : null;
}
export function sourceCoordinate(lines = []) {
  for (const text of lines) {
    const m =
      /^(\d+(?:\.\d+)?)°(?:(\d+(?:\.\d+)?)')?(?:(\d+(?:\.\d+)?)")?([NS]), (\d+(?:\.\d+)?)°(?:(\d+(?:\.\d+)?)')?(?:(\d+(?:\.\d+)?)")?([EW])$/u.exec(
        text,
      );
    if (!m) continue;
    const parts = [1, 5].map((offset) => [
      Number(m[offset]),
      Number(m[offset + 1] ?? 0),
      Number(m[offset + 2] ?? 0),
    ]);
    if (parts.some((p) => p[1] >= 60 || p[2] >= 60)) throw new Error('PEOPLE_DMS');
    const lat = (parts[0][0] + parts[0][1] / 60 + parts[0][2] / 3600) * (m[4] === 'S' ? -1 : 1);
    const lng = (parts[1][0] + parts[1][1] / 60 + parts[1][2] / 3600) * (m[8] === 'W' ? -1 : 1);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('PEOPLE_COORDINATE');
    return { coordinates: [lng, lat], sourceText: text };
  }
  return null;
}
const bound = (year) =>
  year === null
    ? { kind: 'unknown', date: null }
    : { kind: 'known', date: { year, month: null, day: null } };
function extent(start, end, text, uncertain = false, snapshot = false) {
  return {
    start: bound(start),
    end: bound(end),
    precision: start === null || end === null ? 'unknown' : 'year',
    uncertain: uncertain || start === null || end === null,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: text.slice(0, 900).trim(),
      calendar: 'Source calendar retained in text; no unverified day conversion',
      yearNumbering: 'historical-no-zero',
    },
    basis: 'derived',
    reviewStatus: 'verified',
    ...(snapshot
      ? {
          support: {
            kind: 'snapshot',
            note: 'Yalnız kaynaklı doğum yılı. Yaşam/ikamet aralığı veya seyahat çıkarımı değildir.',
          },
        }
      : {}),
  };
}
const unknown = () =>
  extent(
    null,
    null,
    'Temporal validity unspecified. Source retrieval/modification is not historical validity.',
  );
const attribution =
  'Wikidata katkıda bulunanlar · CC0-1.0 · kaynaklı yapılandırılmış olgu çıkarımı.';
const metadata = (id, name, temporal, qid = null, note = '') => ({
  id,
  names: [{ language: 'tr', value: name }],
  alternativeNames: [],
  wikidataId: qid,
  temporal,
  confidence: {
    level: 'medium',
    spatialAccuracyKm: null,
    rationale: note || 'Kaynak iddiası incelendi; bağımsız tarihsel doğrulamanın tamamı değildir.',
  },
  licenseId: 'CC0-1.0',
  attribution,
  reviewStatus: 'verified',
  synthetic: false,
});
export async function buildPeople(options = {}) {
  const root = new URL('../../', import.meta.url),
    rawRoot = new URL(options.rawDirectory ?? 'data/people/raw/', root);
  const approvedInputs = options.approvedInputs ?? reviewedPeopleInputs;
  const namespace = options.namespace ?? 'births';
  const reviewBytes = await readFile(new URL('browser-review.json', rawRoot));
  const decisionsBytes = await readFile(new URL('decisions.json', rawRoot));
  if (
    sha(reviewBytes) !== approvedInputs.browserReview ||
    sha(decisionsBytes) !== approvedInputs.decisions
  )
    throw new Error('PEOPLE_REVIEW_REQUIRED');
  const review = JSON.parse(reviewBytes),
    decisions = JSON.parse(decisionsBytes);
  if (
    reviewBytes.length > 512 * 1024 ||
    decisionsBytes.length > 65536 ||
    review.synthetic !== false ||
    review.licenseId !== 'CC0-1.0' ||
    review.representation !== 'browser-editorial-structured-fact-extraction-not-api-response' ||
    review.requests.length !== (options.requestCount ?? 113)
  )
    throw new Error('PEOPLE_RAW_CONTRACT');
  const previous = JSON.parse(await readFile(new URL('data/pilot/raw/discovery-facts.json', root)));
  const oldByQid = new Map(previous.people.map((p) => [p.qid, p]));
  const places = new Map(review.places.map((p) => [p.qid, p]));
  const selected = [],
    pending = [],
    packs = [];
  const rows = review.requests
    .map((request) => {
      const person = review.people.find((p) => p.qid === request.candidateWikidataId);
      if (!person?.revision || !/^[1-9]\d+$/u.test(person.revision)) {
        pending.push({
          name: request.name,
          aliases: request.aliases,
          wikidataId: request.candidateWikidataId,
          reason: 'immutable-source-revision-unavailable',
        });
        return null;
      }
      const old = oldByQid.get(person.qid);
      const id = old?.id ?? `births:person-${person.qid.toLowerCase()}`;
      const birthText =
        (person.props?.['date of birth'] ?? []).join(' · ') ||
        'Doğum tarihi bu çıkarımda doğrulanmadı.';
      const deathText =
        (person.props?.['date of death'] ?? []).join(' · ') ||
        'Ölüm tarihi bu çıkarımda doğrulanmadı.';
      const by = sourceYear(person.props?.['date of birth']?.[0]),
        dy = sourceYear(person.props?.['date of death']?.[0]);
      const birth = Object.hasOwn(decisions.birthWindows, person.qid)
        ? decisions.birthWindows[person.qid]
        : by === null
          ? null
          : [by, by];
      const death = Object.hasOwn(decisions.deathWindows, person.qid)
        ? decisions.deathWindows[person.qid]
        : dy === null
          ? null
          : [dy, dy];
      const place = places.get(person.birthPlaceQid),
        coordinate = place?.revision
          ? sourceCoordinate(place.props?.['coordinate location'])
          : null;
      const regional = decisions.regionPlaces.includes(place?.qid);
      const biography =
        decisions.biographicalOnly.includes(person.qid) ||
        /circa|presumably|disputed|uncertain/u.test(birthText) ||
        birth === null ||
        birth[0] !== birth[1];
      const geom =
        coordinate && !regional ? { type: 'Point', coordinates: coordinate.coordinates } : null;
      const note =
        decisions.notes[person.qid] ??
        (regional
          ? 'Kaynak doğum yerini geniş bir bölge olarak bildiriyor; şehir merkezine veya başka tahminî noktaya yerleştirilmedi.'
          : !geom
            ? 'Doğum yeri veya yer koordinatının kaynak incelemesi tamamlanmadı; bu kayda harita noktası atanmadı. Tarihsel bilginin hiç bulunmadığı anlamına gelmez.'
            : biography
              ? 'Doğum zamanı belirsiz veya geleneksel; yer ilişkisi yalnız biyografik bilgidir. Rastgele yıl seçilip yıllık haritaya taşınmadı.'
              : 'Kaynaklı doğum yeri ilişkisi; nokta yerin yaklaşık temsilidir, doğum evinin veya kişinin tam koordinatı değildir.');
      const row = {
        request,
        person,
        old,
        id,
        birth,
        death,
        birthText,
        deathText,
        note,
        place,
        coordinate,
        biography,
        geom,
      };
      selected.push({
        id,
        qid: person.qid,
        name: request.name,
        birth,
        death,
        sourceRevision: person.revision,
        place: person.props?.['place of birth']?.[0] ?? null,
        placeQid: person.birthPlaceQid ?? null,
        geometryAvailable: !!geom,
        annualBirth: !!geom && !biography && !!birth,
        reason: !geom
          ? regional
            ? 'region-not-a-point'
            : 'place-or-coordinate-not-verified'
          : biography
            ? 'biographical-only-no-arbitrary-year'
            : 'supported-birth-year-only',
        note,
      });
      return row;
    })
    .filter(Boolean);
  for (let offset = 0; offset < rows.length; offset += 8) {
    const group = rows.slice(offset, offset + 8),
      pack = {
        schemaVersion: 2,
        catalogVersion: options.version ?? PEOPLE_VERSION,
        createdAt: review.reviewedAt,
        sources: [],
        records: [],
        inputs: [],
        transformations: [],
      };
    const sourceIndex = new Map();
    const source = (fact) => {
      const sourceId = `source:${namespace}-${fact.qid.toLowerCase()}`,
        inputId = `input:${namespace}-${fact.qid.toLowerCase()}`;
      if (sourceIndex.has(sourceId)) return sourceIndex.get(sourceId);
      pack.sources.push({
        ...metadata(sourceId, `Wikidata ${fact.qid}`, unknown(), fact.qid),
        kind: 'source',
        sourceKey: 'wikidata',
        url: `https://www.wikidata.org/w/index.php?title=${fact.qid}&oldid=${fact.revision}`,
        revision: fact.revision,
        retrievedAt: review.reviewedAt,
        rawInputId: inputId,
        upstreamIds: [],
        licenseUrl: review.licenseUrl,
        licenseScope: 'data',
        objectLicense: null,
        membersReviewed: false,
      });
      pack.inputs.push({
        id: inputId,
        relativePath: 'browser-review.json',
        sha256: sha(reviewBytes),
        bytes: reviewBytes.length,
        sourceId,
        sourceRevision: fact.revision,
      });
      const value = { sourceId, inputId, revision: fact.revision };
      sourceIndex.set(sourceId, value);
      return value;
    };
    const transformId = `transform:${namespace}-${offset / 8}`;
    const evidence = (fact, locator, claims) => {
      const s = source(fact);
      return {
        sourceId: s.sourceId,
        sourceRevision: s.revision,
        rawInputId: s.inputId,
        locator,
        claims,
        licenseId: 'CC0-1.0',
        attribution,
        basis: 'derived',
        transformationIds: [transformId],
      };
    };
    for (const row of group) {
      const {
        request,
        person,
        old,
        id,
        birth,
        death,
        birthText,
        deathText,
        note,
        place,
        coordinate,
        biography,
        geom,
      } = row;
      const birthExtent = extent(
        birth?.[0] ?? null,
        birth?.[1] ?? null,
        birthText,
        biography || /circa|presumably|disputed/u.test(birthText),
      );
      const deathExtent = extent(
        death?.[0] ?? null,
        death?.[1] ?? null,
        deathText,
        death === null || death[0] !== death[1] || decisions.uncertainDeaths?.includes(person.qid),
      );
      const life = extent(
        birth?.[0] ?? null,
        death?.[1] ?? null,
        `P569: ${birthText}; P570: ${deathText}. ${note}`,
        birthExtent.uncertain || deathExtent.uncertain,
      );
      const ev = [evidence(person, `P569/P570/P19; ${note}`, ['identity', 'temporal'])];
      pack.records.push(
        {
          ...metadata(`${id}-identity`, request.name, life, person.qid, note),
          kind: 'entity',
          entityType: 'PERSON',
          evidence: ev,
        },
        {
          ...metadata(id, request.name, life, person.qid, note),
          alternativeNames: [
            ...new Set([...request.aliases, person.title, ...(old?.aliases ?? [])]),
          ]
            .filter((n) => n && n !== request.name)
            .map((value) => ({ language: 'und', value })),
          kind: 'person',
          entityId: `${id}-identity`,
          evidence: ev,
          profile: {
            birth: birthExtent,
            death: deathExtent,
            descriptions: [
              {
                language: 'tr',
                value:
                  decisions.descriptionOverrides?.[person.qid] ??
                  old?.description ??
                  (person.props?.['place of birth']?.[0] &&
                  !['unknown value', 'no value'].includes(person.props['place of birth'][0])
                    ? `${request.name} için kaynakta belirtilen doğum yeri: ${person.props['place of birth'][0]}.`
                    : `${request.name} için doğum yeri bu kaynak incelemesinde doğrulanmadı.`),
              },
            ],
            occupations: [],
            wikipedia: [],
            image: null,
          },
        },
      );
      if (geom) {
        const locationId =
          { Q935: 'atlas:newton-birth', Q937: 'atlas:einstein-birth' }[person.qid] ??
          `births:location-${person.qid.toLowerCase()}`;
        pack.records.push({
          ...metadata(
            locationId,
            `${request.name} · ${place.name}`,
            biography
              ? unknown()
              : extent(
                  birth[0],
                  birth[1],
                  `P569 + P19: ${birthText}; ${note}`,
                  birthExtent.uncertain,
                  true,
                ),
            null,
            note,
          ),
          kind: 'person-location',
          personId: id,
          placeId: null,
          locationType: biography ? 'biographical' : 'timed-presence',
          relationship: biography ? 'birth' : 'presence',
          relationshipType: 'BIRTH',
          spatialContext: {
            scale: place.scale ?? 'city',
            coordinateRole: 'representative-place',
            description: `${place.name}: kaynağın yaklaşık yer temsil noktası; kişinin veya doğum evinin tam koordinatı değildir. ${note}`,
          },
          geometry: geom,
          geometryReason: null,
          evidence: [
            evidence(person, `P569:${birthText}; P19:${place.name}(${place.qid}). ${note}`, [
              'identity',
              'temporal',
              'location',
            ]),
            evidence(
              place,
              `P625:${coordinate.sourceText}; yer temsil noktası, tarihî kişi koordinatı değil.`,
              ['geometry', 'location'],
            ),
          ],
        });
      }
    }
    // Bind editorial choices as an explicit transformation input with an already reviewed source.
    const first = pack.sources[0];
    const decisionNamespace = options.namespace ? `${namespace}-decisions` : 'birth-decisions';
    const decisionInputId = `input:${decisionNamespace}-${offset / 8}`;
    const decisionSourceId = `source:${decisionNamespace}-${offset / 8}`;
    pack.sources.push({ ...first, id: decisionSourceId, rawInputId: decisionInputId });
    pack.inputs.push({
      id: decisionInputId,
      relativePath: 'decisions.json',
      sha256: sha(decisionsBytes),
      bytes: decisionsBytes.length,
      sourceId: decisionSourceId,
      sourceRevision: first.revision,
    });
    pack.transformations.push({
      id: transformId,
      version: '1.0.0',
      description:
        'Pinned editorial birth facts. Year precision only; source DMS->lon-lat. No lifetime->location inference, invented midpoint or residence fallback. Traditional, uncertain multi-year or regional claims remain non-annual.',
      inputIds: pack.inputs.map((s) => s.id),
    });
    const validation = validateCatalog(pack);
    if (!validation.ok) throw new Error(JSON.stringify(validation.issues.slice(0, 6)));
    await inspectCatalog(pack, fileURLToPath(rawRoot));
    const bytes = Buffer.byteLength(JSON.stringify(pack));
    if (bytes > 256 * 1024) throw new Error('PEOPLE_PACK_BUDGET');
    packs.push(pack);
  }
  return {
    packs,
    selected,
    pending,
    reviewedAt: review.reviewedAt,
    inputs: { browserReview: sha(reviewBytes), decisions: sha(decisionsBytes) },
  };
}
export async function writePeople(result, options = {}) {
  const root = new URL('../../', import.meta.url),
    dir = new URL(options.outputDirectory ?? 'src/people/generated/', root);
  await mkdir(dir, { recursive: true });
  const formatConfig = await prettier.resolveConfig(fileURLToPath(new URL('index.ts', dir)));
  const entries = [];
  for (const [index, catalog] of result.packs.entries()) {
    const raw = JSON.stringify(catalog),
      sha256 = sha(raw);
    const name = `catalog-${index}.ts`;
    await writeFile(
      new URL(name, dir),
      await prettier.format(
        `import type { Catalog } from '../../domain/types';\nexport const catalog: Catalog = ${raw};\n`,
        { ...formatConfig, parser: 'typescript' },
      ),
    );
    entries.push({ index, sha256, bytes: Buffer.byteLength(raw), records: catalog.records.length });
  }
  const manifest = {
    version: options.version ?? PEOPLE_VERSION,
    reviewedAt: result.reviewedAt,
    inputs: result.inputs,
    entries,
    requested: result.selected.length + result.pending.length,
    published: result.selected.length,
    annualBirths: result.selected.filter((p) => p.annualBirth).length,
    biographicalOnly: result.selected.filter((p) => p.geometryAvailable && !p.annualBirth).length,
    pending: result.pending,
    selected: result.selected,
  };
  const imports = result.packs
    .map((_, i) => `import { catalog as c${i} } from './catalog-${i}.ts';`)
    .join('\n');
  await writeFile(
    new URL('index.ts', dir),
    await prettier.format(
      `${imports}\nexport const peopleCatalogs = [${result.packs.map((_, i) => `c${i}`).join(',')}];\nexport const peopleManifest = ${JSON.stringify(manifest)} as const;\n`,
      { ...formatConfig, parser: 'typescript' },
    ),
  );
  const production = new URL(options.productionDirectory ?? 'data/people/production/', root);
  await mkdir(production, { recursive: true });
  await writeFile(new URL('manifest.json', production), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(new URL('assets/licenses/Wikidata-births-NOTICE.txt', root), peopleNotice);
  return manifest;
}
