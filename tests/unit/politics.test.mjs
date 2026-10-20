import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateStyleMin, createExpression } from '@maplibre/maplibre-gl-style-spec';
import { theme } from '../../src/theme/tokens.ts';
import {
  fixtureCatalog,
  extent,
  polygon,
  record,
  simulateReviewed,
} from '../fixtures/historical.mjs';
import { validateCatalog } from '../../src/domain/validate.ts';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import {
  politicalClasses,
  politicalNames,
  politicalCapitals,
  politicalAppearance,
  polityColor,
} from '../../src/politics/model.ts';
import {
  politicalAnchor,
  politicalCamera,
  containsPoliticalPoint,
} from '../../src/politics/geometry.ts';
import { rankPoliticalHits, choosePoliticalLabels } from '../../src/politics/selection.ts';
import { createPoliticalRepository } from '../../src/politics/repository.ts';
import { physicalStyle } from '../../src/map/globe/style.ts';
import { pilotPolitics, historicalFeatures } from '../../src/data/pilot.ts';
import { PILOT_ID, PILOT_VERSION } from '../../src/data/pilot-contract.ts';
import { parseMessage } from '../../src/map-contract/protocol.ts';
import { politicalLabels } from '../../src/map/globe/political-labels.ts';

// Entirely synthetic policy/geometry fixtures, never imported by production code.
function reviewedExtent(start = -2, end = 2) {
  return {
    ...extent(start, end),
    reviewStatus: 'verified',
    support: { kind: 'continuous', note: 'SYNTHETIC TEST only' },
  };
}
function fixture() {
  const catalog = simulateReviewed(fixtureCatalog());
  const entity = catalog.records.find((r) => r.id === 'test:entity-POLITY');
  const claim = (id, fields) => ({
    id: `test:claim-${id}`,
    temporal: reviewedExtent(),
    evidenceIndices: [0],
    ...fields,
  });
  entity.politicalProfile = {
    classifications: [claim('kingdom', { value: 'KINGDOM' }), claim('empire', { value: 'EMPIRE' })],
    names: [
      claim('name-en', {
        name: { language: 'en', value: 'SYNTHETIC KINGDOM' },
        usage: 'preferred',
      }),
      claim('name-tr', { name: { language: 'tr', value: 'SENTETİK KRALLIK' }, usage: 'preferred' }),
      claim('old', {
        temporal: reviewedExtent(-2, -1),
        name: { language: 'tr', value: 'SENTETİK ESKİ AD' },
        usage: 'alternative',
      }),
    ],
    descriptions: [
      claim('description', { language: 'tr', text: 'SYNTHETIC description; no history' }),
    ],
    capitals: [claim('capital', { placeId: 'test:place' })],
  };
  for (const r of catalog.records) r.temporal = reviewedExtent();
  return { catalog, entity, territory: catalog.records.find((r) => r.id === 'test:territory') };
}
function fails(catalog, code, mode = 'production') {
  const result = validateCatalog(catalog, mode);
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some((i) => i.code === code),
    JSON.stringify(result.issues),
  );
}

test('siyasi kimlik tek kalır: POLITY şemsiyesi, eşzamanlı krallık/imparatorluk ve tarihli adlar', () => {
  const { catalog, entity } = fixture();
  assert.equal(validateCatalog(catalog, 'production').ok, true);
  assert.deepEqual(politicalClasses(entity, 1), ['POLITY', 'KINGDOM', 'EMPIRE']);
  assert.deepEqual(politicalClasses(entity, 3), []);
  assert.equal(politicalNames(entity, -1).name, 'SENTETİK KRALLIK');
  assert.ok(politicalNames(entity, -1).alternatives.includes('SENTETİK ESKİ AD'));
  assert.ok(!politicalNames(entity, 1).alternatives.includes('SENTETİK ESKİ AD'));
  for (const c of entity.politicalProfile.classifications) c.temporal = reviewedExtent(-2, -1);
  assert.deepEqual(politicalClasses(entity, 1), ['POLITY']);
});
test('profil iddiaları kaynak, haklar, inceleme, benzersiz kimlik ve siyasi tür ister', () => {
  for (const [mutate, code] of [
    [
      (e) => {
        e.politicalProfile.names[0].evidenceIndices = [9];
      },
      'POLITICAL_CLAIM_SOURCE',
    ],
    [
      (e) => {
        e.politicalProfile.names[0].temporal.reviewStatus = 'unverified';
      },
      'POLITICAL_REVIEW',
    ],
    [
      (e) => {
        e.politicalProfile.names[0].id = e.id;
      },
      'DUPLICATE_ID',
    ],
    [
      (e) => {
        e.entityType = 'CULTURE';
      },
      'POLITICAL_PROFILE_KIND',
    ],
    [
      (e) => {
        e.evidence[0].attribution = 'unapproved change';
      },
      'RIGHTS_MISMATCH',
    ],
    [
      (e) => {
        e.evidence[0].claims = ['identity', 'geometry', 'coverage'];
      },
      'POLITICAL_CLAIM_SOURCE',
    ],
  ]) {
    const { catalog, entity } = fixture();
    mutate(entity);
    fails(catalog, code);
  }
  const { catalog } = fixture();
  catalog.sources[0].sourceKey = 'historical-basemaps';
  fails(catalog, 'LICENSE_DISALLOWED');
});
test('başkent bağımsız zaman/konum kanıtı ister; kaynak dışı alan ve varlık boşluğu reddedilir', () => {
  const { catalog, entity } = fixture();
  entity.evidence[0].claims = entity.evidence[0].claims.filter((c) => c !== 'location');
  fails(catalog, 'CAPITAL_SOURCE');
  entity.evidence[0].claims.push('location');
  entity.politicalProfile.capitals[0].placeId = 'test:missing';
  fails(catalog, 'SEMANTIC_REFERENCE');
  entity.politicalProfile.capitals = [];
  entity.politicalProfile.names[0].temporal = reviewedExtent(-3, 2);
  fails(catalog, 'POLITICAL_CLAIM_PERIOD');
  entity.politicalProfile.names[0].temporal = reviewedExtent();
  entity.temporal.periods = [
    { start: { year: -2, month: null, day: null }, end: { year: -1, month: null, day: null } },
    { start: { year: 2, month: null, day: null }, end: { year: 2, month: null, day: null } },
  ];
  fails(catalog, 'POLITICAL_CLAIM_PERIOD');
  assert.equal(
    politicalCapitals(
      { ...entity, politicalProfile: { ...entity.politicalProfile, capitals: [] } },
      1,
    ).length,
    0,
  );
});
test('siyasi ilişki ardıllık alanları isteğe bağlıdır, öz ilişki ve eksik referans kabul edilmez', () => {
  for (const relationship of [
    'predecessor-of',
    'split-from',
    'merged-into',
    'founded-from',
    'name-continuity',
  ]) {
    const { catalog } = fixture();
    const relation = record('test:relation', {
      kind: 'political-relationship',
      fromEntityId: 'test:entity-POLITY',
      toEntityId: 'test:entity-EMPIRE',
      relationship,
      territoryIds: [],
      description: 'SYNTHETIC relationship, no historical claim',
    });
    relation.temporal = reviewedExtent();
    relation.synthetic = false;
    relation.reviewStatus = 'verified';
    catalog.records.push(relation);
    assert.equal(validateCatalog(catalog, 'production').ok, true);
    relation.toEntityId = relation.fromEntityId;
    fails(catalog, 'POLITICAL_SELF_REFERENCE');
  }
});
test('vasallık yalnız vasala uygulanır; bölgeye özgü ilişki başka bölgeye taşınmaz', () => {
  const { territory } = fixture();
  territory.boundary = 'documented';
  territory.borderPrecision.classification = 'surveyed';
  const vassal = {
    fromEntityId: territory.entityId,
    toEntityId: 'test:overlord',
    territoryIds: [],
    relationship: 'vassalage',
  };
  assert.equal(politicalAppearance(territory, [vassal]).lineStyle, 'vassal');
  assert.equal(
    politicalAppearance({ ...territory, entityId: 'test:overlord' }, [vassal]).lineStyle,
    'documented',
  );
  assert.equal(
    politicalAppearance(territory, [{ ...vassal, territoryIds: ['test:other'] }]).lineStyle,
    'documented',
  );
  assert.equal(
    politicalAppearance({ ...territory, politicalStatus: 'shared' }, []).lineStyle,
    'shared',
  );
  assert.equal(
    politicalAppearance({ ...territory, boundary: 'disputed' }, [vassal]).lineStyle,
    'disputed',
  );
  assert.equal(
    politicalAppearance({ ...territory, boundary: 'approximate' }, []).lineStyle,
    'approximate',
  );
  assert.equal(polityColor('test:entity-POLITY'), polityColor(territory.entityId));
});
test('büyük/küçük alan isabeti, delik ve içbükey etiket çapası alanı başkent saymaz', () => {
  const big = polygon(),
    small = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0.001, 0],
          [0.001, 0.001],
          [0, 0.001],
          [0, 0],
        ],
      ],
    };
  for (const g of [big, small]) assert.ok(containsPoliticalPoint(g, politicalAnchor(g)));
  const hole = {
    type: 'Polygon',
    coordinates: [
      ...big.coordinates,
      [
        [1, 1],
        [1, 3],
        [3, 3],
        [3, 1],
        [1, 1],
      ],
    ],
  };
  assert.equal(containsPoliticalPoint(hole, [2, 2]), false);
  assert.ok(containsPoliticalPoint(hole, politicalAnchor(hole)));
  const concave = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [4, 0],
        [4, 1],
        [1, 1],
        [1, 4],
        [0, 4],
        [0, 0],
      ],
    ],
  };
  assert.ok(containsPoliticalPoint(concave, politicalAnchor(concave)));
  assert.equal(containsPoliticalPoint(concave, [2, 2]), false);
  assert.ok(politicalCamera(small).zoom <= 4);
  assert.deepEqual(Object.keys(politicalCamera(big)).sort(), ['center', 'zoom']);
});
test('antimeridyen bölünmüş MultiPolygon iki tarafta seçilir; kamera Greenwich’e atlamaz', () => {
  const g = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [170, 0],
          [180, 0],
          [180, 4],
          [170, 4],
          [170, 0],
        ],
      ],
      [
        [
          [-180, 0],
          [-170, 0],
          [-170, 4],
          [-180, 4],
          [-180, 0],
        ],
      ],
    ],
  };
  for (const p of [
    [175, 2],
    [-175, 2],
    [180, 2],
    [-180, 2],
  ])
    assert.ok(containsPoliticalPoint(g, p));
  assert.equal(containsPoliticalPoint(g, [0, 2]), false);
  assert.ok(Math.abs(politicalCamera(g).center[0]) >= 170);
});
test('örtüşen seçimde seçili varlık, küçük alan önceliği ve sabit ID sırası kullanılır; bütçe sekizdir', () => {
  const candidates = Array.from({ length: 20 }, (_, i) => ({
    recordId: `test:area-${i}`,
    priority: i,
  }));
  const visible = new Set(candidates.map((c) => c.recordId));
  candidates.push({ recordId: 'test:unknown', priority: 999 });
  candidates.push({ recordId: 'test:area-0', priority: 0, selected: true });
  const ranked = rankPoliticalHits(candidates, visible);
  assert.equal(ranked.length, 8);
  assert.equal(ranked[0], 'test:area-0');
  assert.equal(ranked[1], 'test:area-19');
  assert.ok(!ranked.includes('test:unknown'));
  assert.equal(new Set(ranked).size, ranked.length);
  assert.deepEqual(
    rankPoliticalHits(
      [
        { recordId: 'test:b', priority: 1 },
        { recordId: 'test:a', priority: 1 },
      ],
      new Set(['test:a', 'test:b']),
    ),
    ['test:a', 'test:b'],
  );
});
test('etiketler ekran çakışmasını ve düşük zoom kalabalığını sınırlar; küçük seçili varlık korunur', () => {
  const base = { text: 'SYNTHETIC', x: 100, y: 100, priority: 1, small: false, selected: false };
  const labels = [
    { ...base, id: 'test:a' },
    { ...base, id: 'test:b', priority: 2 },
    { ...base, id: 'test:small', small: true, x: 400 },
  ];
  assert.deepEqual(
    choosePoliticalLabels(labels, 600, 300, 1).map((l) => l.id),
    ['test:b'],
  );
  labels[2].selected = true;
  assert.deepEqual(
    choosePoliticalLabels(labels, 600, 300, 1).map((l) => l.id),
    ['test:small', 'test:b'],
  );
  const many = Array.from({ length: 80 }, (_, i) => ({
    ...base,
    id: `test:${i}`,
    x: i * 100,
    y: 100,
  }));
  assert.equal(choosePoliticalLabels(many, 10000, 300, 1).length, 8);
  assert.equal(choosePoliticalLabels(many, 10000, 300, 4).length, 32);
});
test('gerçek pilot kaynaklı kesit olarak kalır; 1868 kartı desteklenmez, başkent ve istatistik uydurulmaz', async () => {
  assert.ok(pilotPolitics);
  const detail = await pilotPolitics.detail(PILOT_ID, 1867);
  assert.equal(detail.supported, true);
  assert.equal(detail.territory.extentType, 'boundary-segment');
  assert.equal(detail.territory.geometry.type, 'LineString');
  assert.equal(detail.capitals.length, 0);
  assert.ok(detail.sources.every((s) => s.attribution && s.licenseId));
  assert.equal(detail.relations[0].record.relationship, 'cession');
  assert.equal('population' in detail, false);
  assert.equal('flag' in detail, false);
  const unsupported = await pilotPolitics.detail(PILOT_ID, 1868);
  assert.equal(unsupported.supported, false);
  assert.equal(unsupported.relations.length, 0);
  assert.equal((await pilotPolitics.detail(PILOT_ID, 1868, 1867)).sourceYear, 1867);
  const features = await historicalFeatures({ year: 1867, polity: true, culture: false }, 3);
  assert.equal(features.features[0].properties.entityId, detail.entity.id);
  assert.equal(features.features[0].properties.label, detail.territory.names[0].value);
  assert.equal(
    (await historicalFeatures({ year: 1868, polity: true, culture: false }, 3)).features.length,
    0,
  );
});
test('A-03: bölgesel ilişki ve kaynağı başka bölgenin kartına taşınmaz; genel ilişki korunur', async () => {
  const { catalog, territory, entity } = fixture();
  const other = { ...structuredClone(territory), id: 'test:territory-b', scopeId: 'test:scope-b' };
  catalog.records.push(other);
  const source = {
    ...structuredClone(catalog.sources[0]),
    id: 'test:scoped-source',
    rawInputId: 'test:scoped-input',
  };
  const input = {
    ...structuredClone(catalog.inputs[0]),
    id: source.rawInputId,
    sourceId: source.id,
  };
  catalog.sources.push(source);
  catalog.inputs.push(input);
  const scoped = record('test:scoped-relation', {
    kind: 'political-relationship',
    fromEntityId: entity.id,
    toEntityId: 'test:entity-EMPIRE',
    territoryIds: [other.id],
    relationship: 'shared-control',
    description: 'SYNTHETIC TEST: B only',
    synthetic: false,
    reviewStatus: 'verified',
    temporal: reviewedExtent(),
  });
  scoped.evidence[0].sourceId = source.id;
  scoped.evidence[0].rawInputId = input.id;
  catalog.records.push(scoped);
  const repo = createPoliticalRepository(createHistoricalDataProvider(catalog));
  const a = await repo.detail(territory.id, 1),
    b = await repo.detail(other.id, 1);
  assert.equal(a.relations.length, 0);
  assert.equal(
    a.sources.some((s) => s.id === source.id),
    false,
  );
  assert.equal(b.relations[0].record.id, scoped.id);
  assert.ok(b.sources.some((s) => s.id === source.id));
  scoped.territoryIds = [];
  const general = createPoliticalRepository(createHistoricalDataProvider(catalog));
  assert.equal((await general.detail(territory.id, 1)).relations[0].record.id, scoped.id);
  assert.equal((await general.detail(other.id, 1)).relations[0].record.id, scoped.id);
});
test('repository tarihsiz başkent çizmez, eşzamanlı ilişkileri korur ve zaman cache bütçelidir', async () => {
  const { catalog, entity } = fixture();
  const provider = createHistoricalDataProvider(catalog, 'production');
  const repo = createPoliticalRepository(provider);
  assert.equal((await repo.detail('test:territory', 1)).capitals.length, 1);
  assert.equal((await repo.detail('test:territory', 1)).uncertainProfile, true);
  const capitalSource = structuredClone(catalog.sources[0]);
  capitalSource.id = 'test:capital-source';
  capitalSource.rawInputId = 'test:capital-raw';
  const capitalInput = structuredClone(catalog.inputs[0]);
  capitalInput.id = capitalSource.rawInputId;
  capitalInput.sourceId = capitalSource.id;
  catalog.sources.push(capitalSource);
  catalog.inputs.push(capitalInput);
  const capitalRecord = catalog.records.find((r) => r.id === 'test:place');
  capitalRecord.evidence[0].sourceId = capitalSource.id;
  capitalRecord.evidence[0].rawInputId = capitalInput.id;
  const withCapitalSource = await createPoliticalRepository(
    createHistoricalDataProvider(catalog, 'production'),
  ).detail('test:territory', 1);
  assert.ok(withCapitalSource.sources.some((source) => source.id === capitalSource.id));
  assert.equal((await repo.detail('test:territory', 3)).supported, false);
  const place = catalog.records.find((r) => r.kind === 'place');
  place.temporal = reviewedExtent(-2, -1);
  assert.equal(
    (
      await createPoliticalRepository(createHistoricalDataProvider(catalog, 'production')).detail(
        'test:territory',
        1,
      )
    ).capitals.length,
    0,
  );
  entity.politicalProfile.capitals = [];
  const counts = { query: 0 };
  const counted = {
    ...provider,
    query: async (q) => {
      counts.query++;
      return provider.query(q);
    },
  };
  const cached = createPoliticalRepository(counted);
  await Promise.all([cached.context(1), cached.context(1)]);
  assert.equal(counts.query, 1);
  for (let year = 3; year < 36; year++) await cached.context(year);
  await cached.context(1);
  assert.equal(counts.query, 35);
});
test('siyasi stil MapLibre tarafından geçerli; seçili dolgu/outline ve belirsiz çizgiler ayrı', () => {
  const style = physicalStyle({ type: 'FeatureCollection', features: [] });
  assert.deepEqual(
    validateStyleMin(style).map((e) => e.message),
    [],
  );
  assert.equal(style.glyphs, undefined);
  assert.equal(style.sprite, undefined);
  assert.equal(style.projection.type, 'globe');
  const area = style.layers.find((layer) => layer.id === 'polity-area');
  const opacity = createExpression(area.paint['fill-opacity'], 'polity-area.paint.fill-opacity');
  assert.equal(opacity.result, 'success');
  const evaluate = (properties, selected = false) =>
    opacity.value.evaluate({ zoom: 2 }, { type: 'Polygon', properties }, { selected });
  assert.ok(evaluate({}) >= 0.65, 'country areas are visibly colored');
  assert.ok(evaluate({}, true) > evaluate({}), 'selection emphasizes the same area');
  for (const state of ['disputed', 'shared', 'vassal']) {
    const supplied = theme.politicalMap.fillOpacity[state];
    assert.equal(
      evaluate({ fillOpacity: supplied }),
      supplied,
      'claim-specific opacity is retained',
    );
    assert.ok(supplied > 0 && supplied < evaluate({}));
  }
  assert.equal(evaluate({ fillOpacity: 0 }), 0, 'explicit transparent source remains respected');
  assert.notEqual(area.layout?.visibility, 'none', 'polygon remains selectable');
  const index = (id) => style.layers.findIndex((layer) => layer.id === id);
  assert.ok(index('physical-lakes') > index('polity-area'), 'country fills do not cover lakes');
  assert.ok(index('physical-rivers') > index('polity-area'), 'rivers stay visible');
  assert.ok(index('polity-documented') > index('physical-lakes'), 'political borders stay on top');
  for (const id of [
    'polity-area',
    'polity-selected-outline',
    'polity-documented',
    'polity-approximate',
    'polity-disputed',
    'polity-shared',
    'polity-vassal',
  ])
    assert.ok(style.layers.some((l) => l.id === id));
  assert.notDeepEqual(
    style.layers.find((l) => l.id === 'polity-disputed').paint['line-dasharray'],
    style.layers.find((l) => l.id === 'polity-vassal').paint['line-dasharray'],
  );
});
test('political colors stay stable independently of ordering; varied matte fills retain small-label and boundary contrast', () => {
  const ids = Array.from({ length: 512 }, (_, i) => `test:SYNTHETIC-political-color-${i}`);
  const colors = new Map(ids.map((id) => [id, polityColor(id)]));
  for (const id of ids.toReversed()) assert.equal(polityColor(id), colors.get(id));
  assert.ok(
    new Set(colors.values()).size > 400,
    'color variation is wider than an eight-color cycle',
  );
  const rgb = (value) => {
    const expression = createExpression(['to-rgba', ['to-color', value]], 'political-color-test');
    assert.equal(expression.result, 'success', 'MapLibre accepts generated colors');
    return expression.value
      .evaluate({ zoom: 2 })
      .slice(0, 3)
      .map((c) => c / 255);
  };
  const blend = (foreground, background, opacity) =>
    foreground.map((v, i) => v * opacity + background[i] * (1 - opacity));
  const luminance = (value) =>
    value
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  const land = rgb(theme.colors.land),
    label = rgb(theme.politicalMap.label),
    border = rgb(theme.politicalMap.border);
  for (const color of [...colors.values(), theme.politicalMap.fallback]) {
    for (const opacity of Object.values(theme.politicalMap.fillOpacity)) {
      const surface = blend(rgb(color), land, opacity);
      assert.ok(contrast(label, surface) >= 4.5, 'small label contrast on a single fill');
      assert.ok(
        contrast(blend(border, surface, theme.politicalMap.borderOpacity), surface) >= 3,
        'boundary contrast on a single fill',
      );
    }
  }
});
test('siyasi köprü komutlarında ID/revizyon, azami aday ve sıkı alan kontrolü var', () => {
  const parse = (type, payload, direction = 'command') =>
    parseMessage(
      JSON.stringify({ version: 1, type, payload, sessionId: 'test', requestId: 'command-1' }),
      direction,
      'test',
    );
  assert.ok(parse('polity.focus', { recordId: PILOT_ID, revision: 4, reducedMotion: true }));
  assert.equal(
    parse('polity.focus', { recordId: PILOT_ID, revision: 4, reducedMotion: true, year: 1868 }),
    null,
  );
  assert.equal(
    parse('polity.focus', { recordId: 'javascript:alert(1)', revision: 4, reducedMotion: false }),
    null,
  );
  assert.equal(parse('polity.select', { recordId: PILOT_ID, revision: -1 }), null);
  assert.ok(parse('polity.select', { recordId: null, revision: 4 }));
  const event = {
    recordId: PILOT_ID,
    catalogVersion: PILOT_VERSION,
    revision: 4,
    candidateIds: [PILOT_ID],
  };
  assert.ok(parse('entity.selected', event, 'event'));
  assert.equal(
    parse('entity.selected', { ...event, candidateIds: Array(9).fill(PILOT_ID) }, 'event'),
    null,
  );
  assert.equal(parse('entity.selected', { ...event, candidateIds: ['test:other'] }, 'event'), null);
});

test('DOM siyasi etiketi drag/arka yüz seçimini reddeder; yenileme ve dispose marker/dinleyiciyi temizler', (t) => {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const buttons = [],
    markers = [],
    selected = [],
    listeners = new Map();
  class Button extends EventTarget {
    style = {};
    classes = new Set();
    classList = {
      add: (name) => this.classes.add(name),
      contains: (name) => this.classes.has(name),
    };
    setAttribute() {}
  }
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement() {
        const button = new Button();
        buttons.push(button);
        return button;
      },
    },
  });
  t.after(() => {
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument);
    else delete globalThis.document;
  });
  class Marker {
    removed = 0;
    constructor() {
      markers.push(this);
    }
    setLngLat() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {
      this.removed++;
    }
  }
  const map = {
    on: (type, fn) => listeners.set(type, fn),
    off: (type) => listeners.delete(type),
    project: () => ({ x: 100, y: 100 }),
    getZoom: () => 3,
    getCenter: () => ({ lng: 0, lat: 0 }),
    getProjection: () => ({ type: 'globe' }),
    getBearing: () => 0,
    getPitch: () => 0,
  };
  const labels = politicalLabels({ Marker }, map, { clientWidth: 600, clientHeight: 300 }, (id) =>
    selected.push(id),
  );
  labels.set(
    [
      {
        id: 'test:area',
        properties: {
          kind: 'territory',
          anchorLng: 1,
          anchorLat: 1,
          label: 'SYNTHETIC TEST',
          priority: 1,
          small: true,
          color: '#ffffff',
        },
      },
    ],
    null,
  );
  labels.refresh();
  const click = (detail) => {
    const event = new Event('click');
    Object.defineProperty(event, 'detail', { value: detail });
    buttons[0].dispatchEvent(event);
  };
  buttons[0].dispatchEvent(new Event('pointerdown'));
  listeners.get('dragstart')();
  click(1);
  assert.equal(selected.length, 0);
  buttons[0].classes.add('maplibregl-marker-covered');
  click(0);
  assert.equal(selected.length, 0);
  buttons[0].classes.delete('maplibregl-marker-covered');
  click(0);
  assert.deepEqual(selected, ['test:area']);
  labels.refresh();
  assert.equal(markers.length, 1); // Same viewport/content keeps the existing marker.
  assert.equal(markers[0].removed, 0);
  labels.set([], null);
  labels.refresh();
  assert.equal(markers[0].removed, 1);
  click(0);
  assert.equal(selected.length, 1);
  labels.dispose();
  assert.ok(markers.every((marker) => marker.removed === 1));
  assert.equal(listeners.size, 0);
  buttons[0].dispatchEvent(new Event('click'));
  assert.equal(selected.length, 1);
});
