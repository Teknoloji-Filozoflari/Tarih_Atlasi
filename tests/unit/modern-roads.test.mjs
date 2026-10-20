import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import {
  modernRoads,
  roadLayers,
  roadSource,
  roadRequest,
  ROAD_SOURCE,
} from '../../src/map/globe/modern-roads.ts';
import { physicalStyle } from '../../src/map/globe/style.ts';

test('current roads accept only bounded approved HTTPS tiles while enabled', () => {
  const valid = 'https://tiles.openfreemap.org/planet/latest/6/38/24.pbf';
  assert.deepEqual(roadRequest(valid, true), {
    url: valid,
    credentials: 'same-origin',
    referrerPolicy: 'no-referrer',
  });
  assert.throws(() => roadRequest(valid, false));
  for (const bad of [
    valid + '?token=x',
    valid + '#x',
    valid.replace('https:', 'http:'),
    valid.replace('.org/', '.org.evil/'),
    valid.replace('/6/38/24', '/6/64/24'),
    valid.replace('/6/38/24', '/15/1/1'),
    valid.replace('/6/38/24', '/5/1/1'),
    valid.replace('/latest/', '/latest/../latest/'),
    'https://tiles.openfreemap.org/styles/liberty',
    'https://evil.test/tiles/6/38/24.pbf',
  ])
    assert.throws(() => roadRequest(bad, true));
});
test('road overlay uses valid vector style; no modern borders, country/place labels, sprites or glyphs', () => {
  const style = physicalStyle({ type: 'FeatureCollection', features: [] });
  style.sources[ROAD_SOURCE] = roadSource();
  const index = style.layers.findIndex((l) => l.id === 'polity-documented');
  style.layers.splice(index, 0, ...roadLayers());
  assert.deepEqual(
    validateStyleMin(style).map((e) => e.message),
    [],
  );
  assert.equal(style.projection.type, 'globe');
  assert.equal(style.glyphs, undefined);
  assert.equal(style.sprite, undefined);
  assert.ok(
    roadLayers().every(
      (l) =>
        !['boundary', 'place', 'transportation_name'].includes(l['source-layer']) &&
        l.type !== 'symbol',
    ),
  );
  assert.ok(style.layers.findIndex((l) => l.id === 'polity-area') < index);
  assert.equal(roadSource().maxzoom, 14);
});
test('road source is removable, failure is isolated, retry and disposal release listeners', () => {
  const sources = new Map(),
    layers = new Map(),
    events = new Map(),
    reports = [];
  let zoom = 4,
    loaded = false;
  const map = {
    on(n, fn) {
      events.set(n, fn);
    },
    off(n) {
      events.delete(n);
    },
    getZoom: () => zoom,
    isSourceLoaded: () => loaded,
    getSource: (id) => sources.get(id),
    getLayer: (id) => layers.get(id),
    addSource(id, s) {
      sources.set(id, s);
    },
    removeSource(id) {
      sources.delete(id);
    },
    addLayer(l, before) {
      assert.equal(before, 'polity-documented');
      layers.set(l.id, l);
    },
    removeLayer(id) {
      layers.delete(id);
    },
  };
  const roads = modernRoads(map, (s) => reports.push(s));
  assert.equal(roads.allowed(), false);
  assert.equal(sources.size, 0);
  roads.set(true);
  assert.equal(reports.at(-1), 'zoom');
  assert.equal(sources.size, 1);
  zoom = 12;
  events.get('moveend')();
  assert.equal(reports.at(-1), 'loading');
  loaded = true;
  events.get('sourcedata')({ sourceId: ROAD_SOURCE, isSourceLoaded: true });
  assert.equal(reports.at(-1), 'ready');
  roads.error();
  assert.equal(reports.at(-1), 'error');
  assert.equal(sources.size, 0);
  assert.equal(layers.size, 0);
  assert.equal(roads.allowed(), false);
  roads.set(true);
  assert.equal(reports.at(-1), 'ready');
  roads.set(false);
  assert.equal(reports.at(-1), 'off');
  assert.equal(sources.size, 0);
  roads.set(true);
  roads.dispose();
  assert.equal(events.size, 0);
  assert.equal(sources.size, 0);
  assert.equal(layers.size, 0);
  roads.set(true);
  assert.equal(sources.size, 0);
});

test('road controls and status travel through the versioned bridge with strict payloads', async () => {
  const { parseMessage } = await import('../../src/map-contract/protocol.ts');
  const message = (type, payload, direction = 'command') =>
    parseMessage(
      JSON.stringify({ version: 1, type, payload, sessionId: 'test', requestId: 'command-1' }),
      direction,
      'test',
    );
  const view = { year: 2024, polity: true, culture: true, focusPilot: false };
  for (const modernRoads of [true, false])
    assert.ok(message('catalog.view', { ...view, modernRoads }));
  for (const modernRoads of [null, 1, 'true', {}, []])
    assert.equal(message('catalog.view', { ...view, modernRoads }), null);
  for (const state of ['off', 'zoom', 'loading', 'ready', 'error'])
    assert.ok(message('roads.status', { state }, 'event'));
  for (const payload of [
    { state: 'unknown' },
    { state: ['ready'] },
    { state: 'ready', url: 'https://evil.invalid/' },
    {},
  ])
    assert.equal(message('roads.status', payload, 'event'), null);
  assert.equal(message('roads.status', { state: 'ready' }), null);
});
