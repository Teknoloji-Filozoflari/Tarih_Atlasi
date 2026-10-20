// SYNTHETIC ONLY: imaginary records/coordinates/dates, never imported by the app or bundled.
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const rawText = '{"synthetic":true,"notice":"TEST ONLY; no historical claims"}\n';
export const rawSha256 = createHash('sha256').update(rawText).digest('hex');
export function extent(start = -2, end = 2) {
  return {
    start: { kind: 'known', date: { year: start, month: null, day: null } },
    end: { kind: 'known', date: { year: end, month: null, day: null } },
    precision: 'year',
    uncertain: true,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: 'SYNTHETIC test interval; not history',
      calendar: 'unknown-test-calendar',
      yearNumbering: 'unknown-test-convention',
    },
    basis: 'observed',
    reviewStatus: 'unverified',
  };
}
export const polygon = () => ({
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
      [0, 0],
    ],
  ],
});
export function metadata(id) {
  return {
    id,
    names: [{ language: 'tr', value: `SENTETİK TEST ${id}` }],
    alternativeNames: [{ language: 'en', value: `SYNTHETIC TEST ${id}` }],
    wikidataId: null,
    temporal: extent(),
    confidence: {
      level: 'unknown',
      rationale: 'SYNTHETIC TEST; no factual confidence',
      spatialAccuracyKm: null,
    },
    licenseId: 'CC0-1.0',
    attribution: 'SYNTHETIC TEST FIXTURE — not Wikidata data',
    reviewStatus: 'unverified',
    synthetic: true,
  };
}
export function evidence() {
  return [
    {
      sourceId: 'test:source',
      sourceRevision: 'synthetic-rev-1',
      rawInputId: 'test:raw',
      locator: 'SYNTHETIC TEST fixture row; no real source',
      claims: ['identity', 'temporal', 'geometry', 'location', 'coverage'],
      licenseId: 'CC0-1.0',
      attribution: metadata('test:any').attribution,
      basis: 'observed',
      transformationIds: [],
    },
  ];
}
export function record(id, fields) {
  return { ...metadata(id), evidence: evidence(), ...fields };
}
export function fixtureCatalog() {
  const types = ['POLITY', 'KINGDOM', 'EMPIRE', 'CULTURE', 'PERSON', 'BATTLE', 'EVENT', 'PLACE'];
  return {
    schemaVersion: 2,
    catalogVersion: '0.0.0-synthetic',
    createdAt: '2026-10-15T00:00:00.000Z',
    sources: [
      {
        ...metadata('test:source'),
        kind: 'source',
        sourceKey: 'wikidata',
        url: 'https://example.invalid/synthetic-only',
        revision: 'synthetic-rev-1',
        retrievedAt: '2026-10-15T00:00:00.000Z',
        rawInputId: 'test:raw',
        upstreamIds: [],
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        licenseScope: 'data',
        objectLicense: null,
        membersReviewed: false,
      },
    ],
    inputs: [
      {
        id: 'test:raw',
        relativePath: 'fixture.json',
        sha256: rawSha256,
        bytes: Buffer.byteLength(rawText),
        sourceId: 'test:source',
        sourceRevision: 'synthetic-rev-1',
      },
    ],
    transformations: [],
    records: [
      ...types.map((entityType) =>
        record(`test:entity-${entityType}`, { kind: 'entity', entityType }),
      ),
      record('test:territory', {
        kind: 'territory',
        scopeId: 'test:scope',
        extentType: 'full-area',
        politicalStatus: 'unknown',
        counterpartEntityIds: [],
        borderPrecision: {
          classification: 'unknown',
          toleranceKm: null,
          description: 'SYNTHETIC TEST precision',
        },
        entityId: 'test:entity-POLITY',
        interpretationId: 'test:interpretation',
        boundary: 'approximate',
        geometry: polygon(),
        geometryReason: null,
      }),
      record('test:culture', {
        kind: 'cultural-region',
        entityId: 'test:entity-CULTURE',
        semantics: 'cultural-interaction',
        geometry: polygon(),
        geometryReason: null,
        culturalContext: {
          interpretationId: 'test:cultural-interpretation',
          description: 'SYNTHETIC culture only',
          geographicContext: 'SYNTHETIC test grid; no historical region',
          uncertainties: ['SYNTHETIC geometry and dates; not real culture'],
        },
      }),
      record('test:person', {
        kind: 'person',
        entityId: 'test:entity-PERSON',
        profile: {
          birth: extent(-2, -2),
          death: extent(2, 2),
          descriptions: [{ language: 'tr', value: 'SENTETİK kişi açıklaması' }],
          occupations: [],
          wikipedia: [],
          image: null,
        },
      }),
      record('test:presence', {
        kind: 'person-location',
        personId: 'test:person',
        placeId: 'test:place',
        locationType: 'timed-presence',
        relationship: 'presence',
        relationshipType: 'DOCUMENTED_EVENT',
        spatialContext: {
          scale: 'site',
          coordinateRole: 'documented-site',
          description: 'SYNTHETIC TEST coordinate',
        },
        geometry: { type: 'Point', coordinates: [1, 1] },
        geometryReason: null,
      }),
      record('test:biography', {
        kind: 'person-location',
        personId: 'test:person',
        placeId: 'test:place',
        locationType: 'biographical',
        relationship: 'associated',
        relationshipType: 'WORK',
        spatialContext: {
          scale: 'site',
          coordinateRole: 'documented-site',
          description: 'SYNTHETIC TEST coordinate',
        },
        geometry: { type: 'Point', coordinates: [1, 1] },
        geometryReason: null,
      }),
      record('test:event', {
        kind: 'event',
        entityId: 'test:entity-EVENT',
        eventType: 'OTHER',
        details: {
          placeId: null,
          description: [{ language: 'tr', value: 'SENTETİK olay açıklaması' }],
          locationPrecision: {
            classification: 'approximate-point',
            toleranceKm: null,
            explanation: 'SYNTHETIC TEST point only',
          },
          wikipediaSitelinks: [],
          alternativeDates: [],
        },
        participantIds: ['test:entity-PERSON'],
        locationSemantics: 'representative',
        geometry: { type: 'Point', coordinates: [2, 2] },
        geometryReason: null,
      }),
      record('test:battle', {
        kind: 'event',
        entityId: 'test:entity-BATTLE',
        eventType: 'BATTLE',
        details: {
          placeId: null,
          description: [{ language: 'tr', value: 'SENTETİK muharebe açıklaması' }],
          locationPrecision: {
            classification: 'unknown',
            toleranceKm: null,
            explanation: 'SYNTHETIC TEST unknown',
          },
          wikipediaSitelinks: [],
          alternativeDates: [],
        },
        participantIds: [],
        locationSemantics: 'unknown',
        geometry: null,
        geometryReason: 'SYNTHETIC: missing geometry',
      }),
      record('test:place', {
        kind: 'place',
        entityId: 'test:entity-PLACE',
        geometry: { type: 'Point', coordinates: [1, 1] },
        geometryReason: null,
      }),
      record('test:coverage', {
        kind: 'coverage',
        layer: 'event',
        region: [-10, -10, 10, 10],
        status: 'partial',
        recordCount: 1,
        recordIds: ['test:event'],
        description: 'SYNTHETIC TEST coverage, not historical data',
      }),
    ],
  };
}
// Isolated policy simulation only. Never written to repository/production or shown as real data.
export function simulateReviewed(catalog) {
  const copy = structuredClone(catalog);
  for (const entry of [...copy.sources, ...copy.records]) {
    entry.synthetic = false;
    entry.reviewStatus = 'verified';
    entry.temporal.reviewStatus = 'verified';
    if (entry.profile) {
      entry.profile.birth.reviewStatus = 'verified';
      entry.profile.death.reviewStatus = 'verified';
    }
  }
  return copy;
}
