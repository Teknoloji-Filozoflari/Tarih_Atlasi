import { readBounded, sha256 } from '../etl/pipeline.mjs';

export const discoveryNotice =
  'Wikidata contributors · CC0-1.0 · 18 October 2026 editorial structured-fact extraction. ' +
  '10 requested people, 7 events/campaigns, 6 modern settlement references; incomplete coverage. ' +
  'Turkish summaries by Tarih Atlası contributors. No article prose or images copied. ' +
  'Birth/death alternatives, unresolved chronology and representative point uncertainty retained. ' +
  'https://www.wikidata.org/wiki/Wikidata:Licensing\n';
export async function appendDiscoveryPilot(catalog, rawRoot) {
  const bytes = await readBounded(new URL('discovery-facts.json', rawRoot), 65536);
  const facts = JSON.parse(bytes.toString('utf8'));
  if (
    sha256(bytes) !== DISCOVERY_SHA ||
    facts.synthetic !== false ||
    facts.representation !== 'editorial-fact-extraction-not-http-response'
  )
    throw new Error('DISCOVERY_UNREVIEWED_INPUT');
  const attribution = 'Wikidata contributors · CC0-1.0 · incelenmiş yapılandırılmış olgu çıkarımı.';
  const bound = (year) =>
    year === null
      ? { kind: 'unknown', date: null }
      : { kind: 'known', date: { year, month: null, day: null } };
  const time = (start, end, text, uncertain = false, support = false) => ({
    start: bound(start),
    end: bound(end),
    precision: start === null || end === null ? 'unknown' : 'year',
    uncertain: uncertain || start === null || end === null,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text,
      calendar: 'Source years; no unverified day conversion',
      yearNumbering: 'historical-no-zero',
    },
    basis: 'derived',
    reviewStatus: 'verified',
    ...(support
      ? { support: { kind: start === end ? 'snapshot' : 'continuous', note: text } }
      : {}),
  });
  const unknown = () =>
    time(null, null, 'Source validity unspecified; revision and retrieval are separate.');
  const meta = (id, name, temporal, qid = null, uncertainty = '') => ({
    id,
    names: [{ language: 'tr', value: name }],
    alternativeNames: [],
    wikidataId: qid,
    temporal,
    confidence: {
      level: 'medium',
      spatialAccuracyKm: null,
      rationale:
        uncertainty ||
        'İncelenmiş Wikidata olgusu; bağımsız kaynak zincirinin tamamı doğrulanmadı.',
    },
    licenseId: 'CC0-1.0',
    attribution,
    reviewStatus: 'verified',
    synthetic: false,
  });
  const sourceIds = new Map();
  for (const f of [...facts.people, ...facts.events, ...facts.cities, ...facts.places]) {
    const sourceId = `source:discovery-${f.qid.toLowerCase()}`,
      inputId = `input:discovery-${f.qid.toLowerCase()}`;
    if (sourceIds.has(f.qid)) throw new Error('DISCOVERY_DUPLICATE_SOURCE');
    sourceIds.set(f.qid, { sourceId, inputId, revision: f.revision });
    catalog.inputs.push({
      id: inputId,
      relativePath: 'discovery-facts.json',
      sha256: sha256(bytes),
      bytes: bytes.length,
      sourceId,
      sourceRevision: f.revision,
    });
    catalog.sources.push({
      ...meta(sourceId, `Wikidata ${f.qid}`, unknown()),
      kind: 'source',
      sourceKey: 'wikidata',
      url: `https://www.wikidata.org/w/index.php?title=${f.qid}&oldid=${f.revision}`,
      revision: f.revision,
      retrievedAt: facts.reviewedAt,
      rawInputId: inputId,
      upstreamIds: [],
      licenseUrl: facts.licenseUrl,
      licenseScope: 'data',
      objectLicense: null,
      membersReviewed: false,
    });
  }
  const evidence = (f, claims, locator = f.locator) => {
    const s = sourceIds.get(f.qid);
    return {
      sourceId: s.sourceId,
      sourceRevision: s.revision,
      rawInputId: s.inputId,
      locator,
      claims,
      licenseId: 'CC0-1.0',
      attribution,
      basis: 'derived',
      transformationIds: ['transform:discovery-facts-v1'],
    };
  };
  const dms = ([d, m, s]) => d + m / 60 + s / 3600;
  for (const f of facts.people) {
    const birth = time(f.birth?.[0] ?? null, f.birth?.[1] ?? null, f.locator, f.uncertain),
      death = time(f.death?.[0] ?? null, f.death?.[1] ?? null, f.locator, f.uncertain),
      life = time(f.birth?.[0] ?? null, f.death?.[1] ?? null, f.locator, f.uncertain),
      entityId = `${f.id}-identity`,
      ev = [evidence(f, ['identity', 'temporal'])];
    catalog.records.push(
      {
        ...meta(entityId, f.name, life, f.qid),
        kind: 'entity',
        entityType: 'PERSON',
        evidence: ev,
      },
      {
        ...meta(f.id, f.name, life, f.qid, f.locator),
        kind: 'person',
        entityId,
        evidence: ev,
        alternativeNames: f.aliases.map((value) => ({ language: 'und', value })),
        profile: {
          birth,
          death,
          descriptions: [{ language: 'tr', value: f.description }],
          occupations: [],
          wikipedia: [],
          image: null,
        },
      },
    );
  }
  for (const f of facts.events) {
    const temporal = time(f.start, f.end, f.locator, false, true),
      geometry = f.longitude
        ? { type: 'Point', coordinates: [dms(f.longitude), dms(f.latitude)] }
        : null;
    const ev = [
        evidence(f, ['identity', 'temporal', ...(geometry ? ['geometry', 'location'] : [])]),
      ],
      entityId = `${f.id}-identity`;
    catalog.records.push(
      {
        ...meta(entityId, f.name, temporal, f.qid),
        kind: 'entity',
        entityType: f.eventType === 'BATTLE' ? 'BATTLE' : 'EVENT',
        evidence: ev,
      },
      {
        ...meta(f.id, f.name, temporal, f.qid),
        kind: 'event',
        entityId,
        eventType: f.eventType,
        participantIds: [],
        evidence: ev,
        geometry,
        geometryReason: geometry
          ? null
          : 'Kaynaklı olay/cephe geometrisi incelenmedi; temsil noktası uydurulmadı.',
        locationSemantics: geometry ? 'representative' : 'unknown',
        details: {
          placeId: null,
          description: [{ language: 'tr', value: f.description }],
          wikipediaSitelinks: [],
          alternativeDates: [],
          locationPrecision: {
            classification: geometry ? 'approximate-point' : 'unknown',
            toleranceKm: null,
            explanation: geometry
              ? 'Kaynağın yaklaşık temsil noktası; muharebe/cephe sınırı veya bütün olayın tek konumu değildir. Ölçüm hata payı bilinmiyor.'
              : 'Bu kaydın haritada gösterilebilir konumu yok; yıl listesinde sunulur.',
          },
        },
      },
    );
  }
  for (const f of facts.locations) {
    const person = facts.people.find((p) => p.id === f.personId),
      city = [...facts.cities, ...facts.places].find((c) => c.id === f.cityId);
    if (!person || !city) throw new Error('DISCOVERY_LOCATION_REFERENCE');
    const temporal = time(f.start, f.end, f.locator, false, true);
    catalog.records.push({
      ...meta(
        f.id,
        `${person.name} · ${city.name}`,
        temporal,
        null,
        'Kaynaklı doğum/ölüm veya dönemli ikamet ilişkisi; temsil noktası günlük mevcudiyet/ölçülmüş tarihî koordinat değildir.',
      ),
      kind: 'person-location',
      personId: person.id,
      placeId: null,
      locationType: 'timed-presence',
      relationship: 'presence',
      relationshipType: f.relationshipType,
      spatialContext: {
        scale: city.scale ?? 'city',
        coordinateRole: 'representative-place',
        description: `${city.name}: bugünkü yer temsil noktası; tarihî alan veya kişinin tam koordinatı değildir.`,
      },
      geometry: {
        type: 'Point',
        coordinates: [(city.longitudeSign ?? 1) * dms(city.longitude), dms(city.latitude)],
      },
      geometryReason: null,
      evidence: [
        evidence(person, ['identity', 'temporal', 'location'], f.locator),
        evidence(city, ['geometry', 'location'], city.locator),
      ],
    });
  }
  catalog.transformations.push({
    id: 'transform:discovery-facts-v1',
    version: '1.0.0',
    description:
      'Hash-bound CC0 editorial facts; preserve year ranges and unknown chronology, DMS to lon-lat for source points only. Modern cities are not historical places. No inferred travel, article URL, image or territory.',
    inputIds: [...sourceIds.values()].map((s) => s.inputId),
  });
  catalog.createdAt = facts.reviewedAt;
  return facts;
}
const DISCOVERY_SHA = 'df2bb8681702b23edd8b83d150bc70111786c4859d9234b71224983ecc27a71a';
