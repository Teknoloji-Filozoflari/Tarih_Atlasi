import { readBounded, sha256 } from '../etl/pipeline.mjs';

/** Small reviewed editorial extraction. Never disguise it as the original Wikidata JSON. */
export async function appendPersonPilot(catalog, rawRoot) {
  const raw = await readBounded(new URL('wikidata-person-facts.json', rawRoot), 65536);
  const facts = JSON.parse(raw.toString('utf8'));
  if (
    facts.representation !== 'editorial-fact-extraction-not-http-response' ||
    facts.synthetic !== false ||
    sha256(raw) !== '7219e4518af7de0153e49ece5196ab97dffa6496c87ed6a35ee0d9295bddc902' ||
    facts.person.revision !== '2556738621' ||
    facts.place.revision !== '2460715196' ||
    facts.person.location.start !== '1879-08' ||
    facts.person.location.end !== '1880-10'
  )
    throw new Error('Unreviewed person extraction');
  const date = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return { kind: 'known', date: { year, month: month ?? null, day: day ?? null } };
  };
  const temporal = (start, end, precision = 'day', support = false) => ({
    start: date(start),
    end: date(end),
    precision,
    uncertain: false,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: `${start} / ${end}`,
      calendar: 'Gregorian (Wikidata)',
      yearNumbering: 'historical-no-zero',
    },
    basis: 'observed',
    reviewStatus: 'verified',
    ...(support
      ? {
          support: {
            kind: 'continuous',
            note: 'P551 statement with P580/P582 month qualifiers; presence within the stated period, not every day of each year.',
          },
        }
      : {}),
  });
  catalog.createdAt = facts.reviewedAt;
  const life = temporal(facts.person.birth, facts.person.death);
  const residence = temporal(facts.person.location.start, facts.person.location.end, 'month', true);
  const meta = (id, name, t = life, qid = null) => ({
    id,
    names: [{ language: 'und', value: name }],
    alternativeNames: [],
    wikidataId: qid,
    temporal: structuredClone(t),
    confidence: {
      level: 'medium',
      rationale:
        'Wikidata yapılandırılmış kayıt incelemesi; bağlı müze kaynağı bağımsız alınamadı, gün ve ölçüm doğruluğu çıkarılmadı.',
      spatialAccuracyKm: null,
    },
    licenseId: 'CC0-1.0',
    attribution:
      'Wikidata contributors · CC0-1.0 · editöryal olgu çıkarımı, özgün HTTP yanıtı değildir.',
    reviewStatus: 'verified',
    synthetic: false,
  });
  const inputId = 'input:wikidata-person-facts';
  const sourceId = (scope) => `source:wikidata-${facts[scope].id.toLowerCase()}`;
  const evidence = (scope, claims, locator) => ({
    sourceId: sourceId(scope),
    sourceRevision: facts[scope].revision,
    rawInputId: scope === 'place' ? 'input:wikidata-place-facts' : inputId,
    locator,
    claims,
    licenseId: 'CC0-1.0',
    attribution: meta('unused:id', 'unused').attribution,
    basis: 'derived',
    transformationIds: ['transform:wikidata-person-editorial-v1'],
  });
  // Both source revisions refer to the same explicitly labelled editorial extraction bytes.
  catalog.inputs.push({
    id: inputId,
    relativePath: 'wikidata-person-facts.json',
    sha256: sha256(raw),
    bytes: raw.length,
    sourceId: sourceId('person'),
    sourceRevision: facts.person.revision,
  });
  catalog.inputs.push({
    id: 'input:wikidata-place-facts',
    relativePath: 'wikidata-person-facts.json',
    sha256: sha256(raw),
    bytes: raw.length,
    sourceId: sourceId('place'),
    sourceRevision: facts.place.revision,
  });
  for (const scope of ['person', 'place'])
    catalog.sources.push({
      ...meta(sourceId(scope), `Wikidata ${facts[scope].id} — incelenmiş yapılandırılmış olgular`),
      // A person's lifetime is not the publication or validity period of a source page.
      temporal: {
        ...life,
        start: { kind: 'unknown', date: null },
        end: { kind: 'unknown', date: null },
        precision: 'unknown',
        uncertain: true,
        sourceDate: {
          text: 'Source page validity unspecified; use revision/retrievedAt, not person lifetime.',
          calendar: 'not-applicable',
          yearNumbering: 'not-applicable',
        },
      },
      kind: 'source',
      sourceKey: 'wikidata',
      url: facts[scope].url,
      revision: facts[scope].revision,
      retrievedAt: facts.reviewedAt,
      rawInputId: scope === 'place' ? 'input:wikidata-place-facts' : inputId,
      upstreamIds: scope === 'person' ? [sourceId('place')] : [],
      licenseUrl: facts.rights.url,
      licenseScope: 'data',
      objectLicense: null,
      membersReviewed: false,
    });
  catalog.transformations.push({
    id: 'transform:wikidata-person-editorial-v1',
    version: '1.0.0',
    description:
      'Açık etiketli editöryal olgu çıkarımı; ay hassasiyetini koru, P625 DMS koordinatını lon-lat dereceye çevir; yaşamı genel konum kanıtına dönüştürme.',
    inputIds: [inputId, 'input:wikidata-place-facts'],
  });
  const identity = [
    evidence(
      'person',
      ['identity', 'temporal'],
      'Q5582; name; P569; P570; occupation/description painter',
    ),
  ];
  const placeEvidence = [
    evidence(
      'place',
      ['identity', 'geometry', 'location'],
      'Q3280282 P625; modern house point; no historical coordinate accuracy; place validity limited by the associated P551 period',
    ),
    evidence(
      'person',
      ['temporal', 'location'],
      'Q5582 P551=Q3280282; P580=1879-08; P582=1880-10; linked museum reference not independently fetched',
    ),
  ];
  const dms = (parts) => parts[0] + parts[1] / 60 + parts[2] / 3600;
  const geometry = {
    type: 'Point',
    coordinates: [dms(facts.place.longitudeDMS), dms(facts.place.latitudeDMS)],
  };
  catalog.records.push(
    {
      ...meta('atlas:person-vincent-van-gogh', 'Vincent van Gogh', life, 'Q5582'),
      kind: 'entity',
      entityType: 'PERSON',
      evidence: identity,
    },
    {
      ...meta('atlas:van-gogh', 'Vincent van Gogh', life, 'Q5582'),
      kind: 'person',
      entityId: 'atlas:person-vincent-van-gogh',
      evidence: identity,
      profile: {
        birth: temporal(facts.person.birth, facts.person.birth),
        death: temporal(facts.person.death, facts.person.death),
        descriptions: [
          {
            language: 'tr',
            value:
              'Ressam. Pilot katalogda yalnız Maison Van Gogh ile belgelenmiş dönem ilişkisi işlenmiştir.',
          },
        ],
        occupations: [{ language: 'tr', value: 'Ressam' }],
        wikipedia: [],
        image: null,
      },
    },
    {
      ...meta('atlas:place-maison-van-gogh', 'Maison Van Gogh', residence, 'Q3280282'),
      kind: 'entity',
      entityType: 'PLACE',
      evidence: placeEvidence,
    },
    {
      ...meta('atlas:maison-van-gogh', 'Maison Van Gogh', residence, 'Q3280282'),
      kind: 'place',
      entityId: 'atlas:place-maison-van-gogh',
      geometry,
      geometryReason: null,
      evidence: placeEvidence,
    },
    {
      ...meta(
        'atlas:van-gogh-maison-residence',
        'Maison Van Gogh — dönemli ikamet ilişkisi',
        residence,
      ),
      kind: 'person-location',
      personId: 'atlas:van-gogh',
      placeId: 'atlas:maison-van-gogh',
      locationType: 'timed-presence',
      relationship: 'presence',
      relationshipType: 'RESIDENCE',
      spatialContext: {
        scale: 'site',
        coordinateRole: 'documented-site',
        description:
          'Bugünkü müze/yapı noktası. Tarihî oda veya kişinin kesin koordinatı değildir. Kaynak DMS gösterimi saniye düzeyinde; ölçüm hata payı bilinmiyor.',
      },
      geometry,
      geometryReason: null,
      evidence: [placeEvidence[1], placeEvidence[0]],
    },
  );
}
