import { readBounded, sha256 } from '../etl/pipeline.mjs';
/** Explicit, hash-bound editorial extraction of structured CC0 facts; never an API response. */
export async function appendEventPilot(catalog, rawRoot) {
  const bytes = await readBounded(new URL('wikidata-event-facts.json', rawRoot), 65536);
  if (sha256(bytes) !== 'fba37100d6ccc4393eb0c54102bd8c9dac0c5b464f8e7a65dced18d1b96bece9')
    throw new Error('Unreviewed event fact extraction');
  const facts = JSON.parse(bytes.toString('utf8'));
  if (
    facts.representation !== 'editorial-fact-extraction-not-http-response' ||
    facts.synthetic !== false ||
    facts.events.length !== 4
  )
    throw new Error('Event input representation');
  catalog.createdAt = facts.reviewedAt;
  const attribution =
    'Wikidata contributors · CC0-1.0 · olay olguları editöryal çıkarımı; özgün API yanıtı değildir.';
  const unknown = {
    start: { kind: 'unknown', date: null },
    end: { kind: 'unknown', date: null },
    precision: 'unknown',
    uncertain: true,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: 'Source page validity unknown; revision/retrievedAt are separate.',
      calendar: 'not-applicable',
      yearNumbering: 'not-applicable',
    },
    basis: 'observed',
    reviewStatus: 'verified',
  };
  const meta = (id, name, temporal, qid = null) => ({
    id,
    names: [{ language: 'tr', value: name }],
    alternativeNames: [],
    wikidataId: qid,
    temporal,
    confidence: {
      level: 'medium',
      rationale:
        'İncelenmiş Wikidata yapılandırılmış olgusu; bağlı arşiv/başvuru kaynaklarının tamamı bağımsız incelenmedi, kaynak eksiklikleri kartta korunur.',
      spatialAccuracyKm: null,
    },
    licenseId: facts.licenseId,
    attribution,
    reviewStatus: 'verified',
    synthetic: false,
  });
  const inputIds = [];
  for (const fact of facts.events) {
    const sourceId = `source:event-${fact.wikidataId.toLowerCase()}`,
      inputId = `input:event-${fact.wikidataId.toLowerCase()}`;
    inputIds.push(inputId);
    const temporal = {
      start: { kind: 'known', date: fact.start },
      end: { kind: 'known', date: fact.end },
      precision: fact.precision,
      uncertain: fact.uncertain,
      calendar: 'proleptic-gregorian',
      yearNumbering: 'historical-no-zero',
      sourceDate: {
        text: fact.sourceDate,
        calendar: fact.sourceCalendar,
        yearNumbering: 'historical-no-zero (source display)',
      },
      basis: 'derived',
      reviewStatus: 'verified',
      support: {
        kind: fact.start.year === fact.end.year ? 'snapshot' : 'continuous',
        note: 'Only reviewed event date/period; not continuous territorial control or daily point presence.',
      },
    };
    const evidence = [
      {
        sourceId,
        sourceRevision: fact.revision,
        rawInputId: inputId,
        locator: fact.locator,
        claims: ['identity', 'temporal', ...(fact.coordinateDMS ? ['geometry', 'location'] : [])],
        licenseId: facts.licenseId,
        attribution,
        basis: 'derived',
        transformationIds: ['transform:wikidata-event-editorial-v1'],
      },
    ];
    catalog.inputs.push({
      id: inputId,
      relativePath: 'wikidata-event-facts.json',
      sha256: sha256(bytes),
      bytes: bytes.length,
      sourceId,
      sourceRevision: fact.revision,
    });
    catalog.sources.push({
      ...meta(sourceId, `Wikidata ${fact.wikidataId} — olay olguları`, structuredClone(unknown)),
      kind: 'source',
      sourceKey: 'wikidata',
      url: `https://www.wikidata.org/w/index.php?title=${fact.wikidataId}&oldid=${fact.revision}`,
      revision: fact.revision,
      retrievedAt: facts.reviewedAt,
      rawInputId: inputId,
      upstreamIds: [],
      licenseUrl: facts.licenseUrl,
      licenseScope: 'data',
      objectLicense: null,
      membersReviewed: false,
    });
    const geometry = fact.coordinateDMS
      ? {
          type: 'Point',
          coordinates: [fact.coordinateDMS.longitude, fact.coordinateDMS.latitude].map(
            ([d, m, s]) => d + m / 60 + s / 3600,
          ),
        }
      : null;
    const entityId = `${fact.id}-identity`;
    catalog.records.push({
      ...meta(entityId, fact.name, temporal, fact.wikidataId),
      kind: 'entity',
      entityType: fact.eventType === 'BATTLE' ? 'BATTLE' : 'EVENT',
      evidence,
    });
    const alternativeDates = fact.alternative
      ? [
          {
            temporal: {
              ...structuredClone(temporal),
              start: { kind: 'known', date: fact.alternative },
              end: { kind: 'known', date: fact.alternative },
              support: {
                kind: 'snapshot',
                note: 'Alternative milestone from same source revision; no date adjudication.',
              },
            },
            evidenceIndices: [0],
            explanation:
              'Aynı Wikidata revizyonundaki P585 15 Mart 1991 iddiası süreç aralığından farklıdır. Anlamı bağımsız çözümlenmedi; ana aralığın yerine geçirilmez.',
          },
        ]
      : [];
    catalog.records.push({
      ...meta(fact.id, fact.name, temporal, fact.wikidataId),
      kind: 'event',
      entityId,
      eventType: fact.eventType,
      participantIds: [],
      locationSemantics: geometry ? 'representative' : 'unknown',
      geometry,
      geometryReason: geometry ? null : fact.locationExplanation,
      evidence,
      details: {
        placeId: null,
        description: [{ language: 'tr', value: fact.description }],
        locationPrecision: {
          classification: geometry ? 'approximate-point' : 'unknown',
          toleranceKm: null,
          explanation: fact.locationExplanation,
        },
        wikipediaSitelinks: [],
        alternativeDates,
      },
    });
  }
  catalog.transformations.push({
    id: 'transform:wikidata-event-editorial-v1',
    version: '1.0.0',
    description:
      'Browser-reviewed structured CC0 facts; preserve source dates/calendars, retain only years for unverified ancient/medieval day conversions, DMS point conversion only for Hastings; no invented geometry/participants/sitelinks.',
    inputIds,
  });
}
