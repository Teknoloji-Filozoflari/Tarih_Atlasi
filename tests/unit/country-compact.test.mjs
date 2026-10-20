import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { shortCountryName } from '../../src/politics/short-names.ts';
import { politicalNames } from '../../src/politics/model.ts';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { countryReviewJson } from '../../src/data/world/generated/country-review.ts';
import { normalizeWorldGeometry } from '../../src/data/world/geometry.ts';
import { createWorldRepository } from '../../src/data/world/repository.ts';
import { containsPoliticalPoint } from '../../src/politics/geometry.ts';
import { polityWikidataId } from '../../src/sources/polity-identity.ts';
import { worldEntityId } from '../../src/data/world/records.ts';
import { reviewedWorldRow } from '../../src/data/world/review.ts';
const facts = JSON.parse(countryReviewJson);
const repo = createWorldRepository(worldManifest, (i, p) =>
  readFile(new URL(`../../assets/world/${p.sha256}.atlas`, import.meta.url), 'utf8'),
);
test('reviewed 2024 identity collisions do not route to the other Korea, China, Guinea or Congo', async () => {
  for (const [index, qid, original] of [
    [13643, 'Q884', 'Q423'],
    [13717, 'Q865', 'Q148'],
    [13738, 'Q971', 'Q974'],
    [13769, 'Q1006', 'Q983'],
  ]) {
    const record = await repo.getById(`world:clio-r${index}`);
    assert.equal(polityWikidataId(record), qid);
    assert.ok(record.temporal.sourceDate.text.includes(original));
    assert.ok(record.geometry);
    const raw = worldManifest.rows.find((r) => r.index === index);
    assert.throws(
      () => reviewedWorldRow({ ...raw, end: 2025 }),
      /COUNTRY_2024_IDENTITY_REVIEW_MISMATCH/,
    );
  }
});
test('Syria 2024 links to Syria, preserves the source identity error and marks missing geography without filling it', async () => {
  const record = await repo.getById('world:clio-r13749');
  assert.equal(polityWikidataId(record), 'Q858');
  assert.equal(record.extentType, 'partial-area');
  assert.match(record.temporal.sourceDate.text, /Q41137/);
  assert.match(record.borderPrecision.description, /ülkesiz bölge anlamına gelmez/);
  assert.ok(!containsPoliticalPoint(record.geometry, [41, 37]));
  assert.ok(!containsPoliticalPoint(record.geometry, [38, 36.8]));
  const raw = worldManifest.rows.find((r) => r.index === 13749);
  assert.equal(raw.key, '40fdfc157bc7c7bdd57507ba3d6660ff7034334e1d06b6b683737291c3fe01aa');
  assert.throws(() => reviewedWorldRow({ ...raw, end: 2025 }), /SYRIA_2024_REVIEW_MISMATCH/);
});
test('2024 Chad, Angola, Mali and Tunisia are selectable source polygons with correct identities and year limits', async () => {
  const rows = await repo.territories(2024);
  for (const [index, label, qid, point] of [
    [13613, 'Çad', 'Q657', [18, 15]],
    [13659, 'Angola', 'Q916', [17, -12]],
    [13773, 'Mali', 'Q912', [-5, 18]],
    [13605, 'Tunus', 'Q948', [9, 34]],
  ]) {
    const record = rows.find((r) => r.id === `world:clio-r${index}`);
    assert.ok(record);
    assert.ok(containsPoliticalPoint(record.geometry, point));
    assert.equal(polityWikidataId(record), qid);
    assert.equal(politicalNames(repo.entities.get(record.entityId), 2024).name, label);
    assert.equal(record.temporal.start.date.year, 2024);
    assert.equal(record.temporal.end.date.year, 2024);
    assert.equal(record.temporal.uncertain, true);
    assert.equal(record.boundary, 'approximate');
  }
  assert.deepEqual(repo.summary(2024), {
    total: 195,
    drawn: 189,
    withheld: 6,
    unknownDateRows: 6,
    sourceEndYear: 2024,
  });
  assert.equal(
    (await repo.territories(2025)).length,
    0,
    'no automatic extension beyond source dates',
  );
});
test('2024 Netherlands exact duplicate is withheld while the canonical geometry and earlier dates remain available', async () => {
  const duplicate = worldManifest.rows.find((r) => r.index === 13741);
  const canonical = worldManifest.rows.find((r) => r.index === 13771);
  assert.equal(duplicate.key, canonical.key);
  assert.equal(duplicate.start, canonical.start);
  assert.equal(duplicate.end, canonical.end);
  const rows = await repo.territories(2024);
  assert.ok(!rows.some((r) => r.id === 'world:clio-r13741'));
  assert.ok(rows.some((r) => r.id === 'world:clio-r13771'));
  assert.equal((await repo.getById('world:clio-r13741')).geometry, null);
  assert.match(reviewedWorldRow(duplicate).withheld, /CANONICAL_13771/);
  for (const change of [{ start: 2023 }, { key: 'different' }, { name: 'different' }])
    assert.throws(
      () => reviewedWorldRow({ ...duplicate, ...change }),
      /WORLD_SPATIAL_REVIEW_MISMATCH/,
    );
  assert.ok((await repo.territories(2023)).some((r) => r.id === 'world:clio-r13120'));
});
test('Mali post-1960 correction keeps federation identity and source error independently traceable', async () => {
  const old = await repo.getById('world:clio-r13206');
  const current = await repo.getById('world:clio-r13773');
  assert.equal(old.entityId, worldEntityId('Mali Federation'));
  assert.equal(current.entityId, worldEntityId('Mali'));
  assert.notEqual(old.entityId, current.entityId);
  assert.equal(polityWikidataId(old), 'Q216632');
  assert.equal(polityWikidataId(current), 'Q912');
  assert.match(current.evidence[0].locator, /Name=Mali Federation/);
  assert.match(current.temporal.sourceDate.text, /Q216632/);
  assert.match(current.temporal.sourceDate.text, /ml1960ind/);
  assert.equal(repo.entities.get(current.entityId).temporal.start.date.year, 1961);
  assert.ok(!(await repo.territories(1960)).some((r) => r.entityId === current.entityId));
});
test('Angola 2024 explicitly excludes missing Cabinda rather than recycling a previous polygon', async () => {
  const current = await repo.getById('world:clio-r13659');
  const previous = await repo.getById('world:clio-r13369');
  assert.equal(current.extentType, 'partial-area');
  assert.match(current.borderPrecision.description, /Cabinda/);
  assert.equal(current.geometry.type, 'Polygon');
  assert.equal(previous.geometry.type, 'MultiPolygon');
  assert.ok(containsPoliticalPoint(previous.geometry, [12.3, -5.5]));
  assert.ok(!containsPoliticalPoint(current.geometry, [12.3, -5.5]));
});
test('country review cannot silently apply to altered source names, dates, reasons or geometry keys', () => {
  for (const index of [13613, 13659, 13773, 13605]) {
    const raw = worldManifest.rows.find((r) => r.index === index);
    for (const change of [
      { name: 'SYNTHETIC TEST' },
      { end: 2025 },
      { withheld: null },
      { key: 'modified' },
      { pack: 1 },
    ]) {
      assert.throws(() => reviewedWorldRow({ ...raw, ...change }), /COUNTRY_REVIEW_ROW_MISMATCH/);
    }
  }
});
test('short country labels retain official source names, historical distinctions and stable IDs', async () => {
  for (const [formal, short] of [
    ['Yunanistan Cumhuriyeti', 'Yunanistan'],
    ['Türkiye Cumhuriyeti', 'Türkiye'],
    ['Fransa Beşinci Cumhuriyeti', 'Fransa'],
    ['Almanya Federal Cumhuriyeti', 'Almanya'],
    ['Ürdün Krallığı', 'Ürdün'],
  ])
    assert.equal(shortCountryName(formal), short);
  for (const historical of [
    'Roma Cumhuriyeti',
    'Fransa Krallığı',
    'Osmanlı İmparatorluğu',
    'Kongo Cumhuriyeti',
    'Kongo Demokratik Cumhuriyeti',
    'Dominik Cumhuriyeti',
    'Çin Cumhuriyeti',
  ])
    assert.equal(shortCountryName(historical), historical);
  const row = worldManifest.rows.find((r) => r.index === 13502);
  const entity = repo.entities.get((await repo.getById('world:clio-r13502')).entityId);
  const before = JSON.stringify(entity);
  const result = politicalNames(entity, 2010);
  assert.equal(result.name, 'Yunanistan');
  assert.ok(result.alternatives.includes('Yunanistan Cumhuriyeti'));
  assert.ok(result.alternatives.includes(row.name));
  assert.equal(JSON.stringify(entity), before);
});
test('scoped topology review accepts isolated shell-hole tangency, but still rejects crossing, shared edges, outside holes and contact networks', () => {
  // SYNTHETIC TEST ONLY; not a historical country geometry.
  const shell = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];
  const hole = [
    [0, 0],
    [3, 1],
    [1, 3],
    [0, 0],
  ];
  const geometry = { type: 'Polygon', coordinates: [shell, hole] };
  assert.throws(() => normalizeWorldGeometry(geometry), /RING_INTERSECTION/);
  const reviewed = normalizeWorldGeometry(geometry, true, { isolatedShellTangencies: true });
  assert.equal(reviewed.points, 9);
  for (const bad of [
    [
      [0, 0],
      [3, 0],
      [1, 3],
      [0, 0],
    ], // shared shell edge
    [
      [0, 0],
      [12, 1],
      [1, 3],
      [0, 0],
    ], // crossing
    [
      [0, 0],
      [-3, -1],
      [-1, -3],
      [0, 0],
    ], // outside
    [
      [0, 0],
      [5, 1],
      [10, 0],
      [5, 3],
      [0, 0],
    ], // two contacts
  ])
    assert.throws(() =>
      normalizeWorldGeometry({ type: 'Polygon', coordinates: [shell, bad] }, true, {
        isolatedShellTangencies: true,
      }),
    );
  assert.throws(
    () =>
      normalizeWorldGeometry(
        {
          type: 'Polygon',
          coordinates: [
            shell,
            hole,
            [
              [3, 1],
              [5, 1],
              [4, 2],
              [3, 1],
            ],
          ],
        },
        true,
        { isolatedShellTangencies: true },
      ),
    /CONTACT_NETWORK/,
  );
});
test('licensed country review preserves every source edge, hole, dates and provenance, and appears only inside declared periods', async () => {
  const edgeMultiset = (geometry) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    return polygons
      .flatMap((p) =>
        p.flatMap((r) =>
          r.slice(1).map((b, i) => [JSON.stringify(r[i]), JSON.stringify(b)].sort().join('|')),
        ),
      )
      .sort();
  };
  for (const fact of facts.rows) {
    const record = await repo.getById(`world:clio-r${fact.index}`);
    assert.deepEqual(edgeMultiset(record.geometry), edgeMultiset(fact.geometry));
    assert.equal(record.geometry.coordinates.length, fact.geometry.coordinates.length);
    assert.equal(record.temporal.start.date.year, fact.start);
    assert.equal(record.temporal.end.date.year, fact.end);
    assert.equal(record.licenseId, 'CC-BY-4.0');
    assert.equal(record.boundary, 'approximate');
    assert.equal(record.temporal.uncertain, true);
    assert.ok(record.evidence[0].locator.includes(`Feature[${fact.index}]`));
    assert.ok(
      record.evidence[0].transformationIds.includes('transform:cliopatria-country-review-v2'),
    );
    for (const year of [fact.start - 1, fact.start, 2010, fact.end, fact.end + 1]) {
      const values = await repo.territories(year);
      assert.equal(
        values.some((r) => r.id === record.id),
        year >= fact.start && year <= fact.end,
      );
    }
  }
  const chad = await repo.getById('world:clio-r13239'),
    libya = await repo.getById('world:clio-r13580');
  assert.equal(chad.geometry.coordinates.length, 3, 'both source holes retained');
  assert.equal(libya.geometry.coordinates.length, 2, 'source hole retained');
  assert.ok(containsPoliticalPoint(chad.geometry, [18, 15]));
  assert.ok(containsPoliticalPoint(libya.geometry, [18, 28]));
  assert.equal(polityWikidataId(chad), 'Q657');
  assert.equal(
    polityWikidataId(libya),
    'Q1016',
    'country article replaces source regime-history identity',
  );
  assert.equal(
    facts.rows.find((r) => r.index === 13580).qid,
    'Q17435890',
    'original source identity retained separately',
  );
  assert.equal(repo.summary(2010).drawn, 183);
  assert.equal(repo.summary(2010).withheld, 8);
});
