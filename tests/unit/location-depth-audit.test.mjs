import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classifyReviewedPlace,
  parseHistoryManifestGeometry,
  documentedCoverageSnapshot,
  summarizePlaces,
} from '../../scripts/history/location-depth-audit.mjs';
import { BIRTH_CITY_ALLOWLIST } from '../../scripts/history/birth-city-allowlist.mjs';

test('allowlisted places stay allowlisted; hospitals are excluded', () => {
  assert.equal(
    classifyReviewedPlace({ name: 'Paris', hasCoordinate: true, inAllowlist: true }),
    'allowlisted',
  );
  assert.equal(
    classifyReviewedPlace({
      name: "St. Mary's Hospital",
      hasCoordinate: true,
      inAllowlist: false,
    }),
    'excluded-non-settlement',
  );
  assert.equal(
    classifyReviewedPlace({ name: 'Edinburgh', hasCoordinate: true, inAllowlist: false }),
    'settlement-candidate',
  );
  assert.equal(
    classifyReviewedPlace({ name: 'Cairo', hasCoordinate: false, inAllowlist: false }),
    'missing-coordinate',
  );
});

test('manifest geometry parser counts person/event flags without inventing rows', () => {
  const sample = `
    { id: 'history:q1', kind: 'person', geometry: false },
    { id: 'history:q2', kind: 'person', geometry: true },
    { id: 'history:q3', kind: 'event', geometry: true },
    { id: 'history:q4', kind: 'event', geometry: false },
  `;
  const parsed = parseHistoryManifestGeometry(sample);
  assert.equal(parsed.total, 4);
  assert.equal(parsed.withGeometry, 2);
  assert.equal(parsed.byKind.person.withGeometry, 1);
  assert.equal(parsed.byKind.person.withoutGeometry, 1);
  assert.equal(parsed.byKind.event.withGeometry, 1);
});

test('coverage snapshot keeps culture blocked and does not invent location counts', () => {
  const coverage = documentedCoverageSnapshot({
    byKind: {
      person: { withGeometry: 46, withoutGeometry: 2923 },
      event: { withGeometry: 35, withoutGeometry: 1049 },
    },
  });
  assert.equal(coverage.historyPeopleWithMapGeometry, 46);
  assert.equal(coverage.historyEventsWithMapGeometry, 35);
  assert.equal(coverage.ratios.historyPeopleLocated, 0.0155);
  assert.ok(BIRTH_CITY_ALLOWLIST.includes('Istanbul'));
});

test('place summary never marks candidates as production-approved', () => {
  const summary = summarizePlaces([
    {
      qid: 'Q23436',
      name: 'Edinburgh',
      hasCoordinate: true,
      inAllowlist: false,
      classification: 'settlement-candidate',
      revision: 1,
      reviewDirectory: 'broad-raw',
    },
  ]);
  assert.equal(summary.byClassification['settlement-candidate'], 1);
  assert.equal(summary.settlementCandidates[0].qid, 'Q23436');
  assert.equal(summary.settlementCandidates[0].productionApproved, undefined);
});
