import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountRenderer } from '../../src/map/globe/renderer.ts';
import { PILOT_ID, PILOT_VERSION } from '../../src/data/pilot-contract.ts';
import { culturalFixture } from '../fixtures/cultures.mjs';
import { createHistoricalDataProvider } from '../../src/data/provider.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createHistoricalFeatureLoader, historicalFeatures } from '../../src/data/pilot.ts';

// Injected MapLibre/DOM doubles exercise our real lifecycle code. No WebGL/GPU proof.
const syntheticLand = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    },
  ],
};
function harness(
  t,
  {
    markerThrows = false,
    dataErrors = false,
    deferredApply = false,
    loadFeatures,
    selectionPages = false,
    project = false,
    placesProvider,
  } = {},
) {
  const calls = {
    removed: 0,
    markerCreated: 0,
    markerOptions: null,
    markerRemoved: 0,
    disconnected: 0,
    revoked: [],
    errors: [],
    dataErrors: [],
    ready: 0,
    cameras: [],
    initializationEvents: [],
    selected: 0,
    modernCities: [],
    placesStatus: [],
    jumps: 0,
    flights: [],
    clusterZooms: [],
    boundFlights: [],
    jumpCameras: [],
    featureStates: [],
    zoom: 1,
    history: [],
    historicalSelected: [],
    renderedMatches: [],
    applied: [],
    applyResolvers: [],
    selectionPages: [],
    queriedLayers: [],
  };
  const elements = [];
  function globalValue(key, value) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    });
  }
  class Element extends EventTarget {
    children = [];
    appendChild(child) {
      this.children.push(child);
      return child;
    }
    dataset = {};
    style = {
      setProperty(name, value) {
        this[name] = value;
      },
    };
    classes = new Set();
    classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
      contains: (name) => this.classes.has(name),
    };
    setAttribute() {}
  }
  let map;
  class MapDouble {
    listeners = new Map();
    canvas = new Element();
    constructor(options) {
      map = this;
      this.options = options;
      if (project) this.project = ([lng, lat]) => ({ x: lng + 180, y: 90 - lat });
    }
    on(name, listener) {
      if (!this.listeners.has(name)) this.listeners.set(name, new Set());
      this.listeners.get(name).add(listener);
      return this;
    }
    off(name, listener) {
      this.listeners.get(name)?.delete(listener);
      return this;
    }
    emit(name, event = {}) {
      for (const listener of [...(this.listeners.get(name) ?? [])]) listener(event);
    }
    getCanvas() {
      return this.canvas;
    }
    getCenter() {
      return { lng: 0, lat: 0 };
    }
    getZoom() {
      return calls.zoom;
    }
    getBearing() {
      return 0;
    }
    getPitch() {
      return 0;
    }
    getProjection() {
      return { type: this.projection ?? 'globe' };
    }
    setProjection(value) {
      this.projection = value.type;
    }
    jumpTo(options) {
      calls.jumps++;
      calls.jumpCameras.push(options);
      if (options.zoom !== undefined) calls.zoom = options.zoom;
    }
    fitBounds(bounds, options) {
      calls.boundFlights.push({ bounds, options });
      return this;
    }
    flyTo(options) {
      calls.flights.push(options);
    }
    easeTo(options) {
      calls.clusterZooms.push(options);
    }
    setFeatureState(target, state) {
      calls.featureStates.push({ target, state });
    }
    removeFeatureState() {
      calls.featureStates.push(null);
    }
    getSource() {
      return {
        setData: (value) => {
          calls.history.push(value);
          if (deferredApply && value.features.length)
            return new Promise((resolve) => calls.applyResolvers.push(resolve));
          return Promise.resolve();
        },
      };
    }
    queryRenderedFeatures(_point, options) {
      calls.queriedLayers = options.layers;
      return calls.renderedMatches;
    }
    resize() {}
    remove() {
      calls.removed++;
    }
  }
  class MarkerDouble {
    constructor(options) {
      calls.markerCreated++;
      calls.markerOptions = options;
    }
    setLngLat() {
      return this;
    }
    addTo() {
      if (markerThrows) throw new Error('marker installation failed');
      return this;
    }
    remove() {
      calls.markerRemoved++;
    }
  }
  globalValue('window', { devicePixelRatio: 3 });
  globalValue('document', {
    createElement() {
      const element = new Element();
      elements.push(element);
      return element;
    },
  });
  globalValue(
    'ResizeObserver',
    class {
      constructor(callback) {
        calls.resized = callback;
      }
      observe() {}
      disconnect() {
        calls.disconnected++;
      }
    },
  );
  t.mock.method(URL, 'createObjectURL', () => 'blob:synthetic-worker-test');
  t.mock.method(URL, 'revokeObjectURL', (url) => calls.revoked.push(url));
  const container = new Element();
  container.clientWidth = 360;
  container.clientHeight = 180;
  const instance = mountRenderer(
    { Map: MapDouble, Marker: MarkerDouble, setWorkerUrl() {}, setWorkerCount() {} },
    container,
    syntheticLand,
    '// SYNTHETIC worker fixture; never shipped',
    {
      ...(dataErrors ? { dataError: (revision) => calls.dataErrors.push(revision) } : {}),
      ready() {
        calls.ready++;
        calls.initializationEvents.push('ready');
      },
      camera(value) {
        calls.cameras.push(value);
        calls.initializationEvents.push('camera');
      },
      modernCitySelected(id) {
        calls.modernCities.push(id);
      },
      modernPlacesStatus(state, loaded) {
        calls.placesStatus.push({ state, loaded });
      },
      selected() {
        calls.selected++;
      },
      historicalSelected(id) {
        calls.historicalSelected.push(id);
      },
      catalogApplied(payload) {
        calls.applied.push(payload);
      },
      error(code) {
        calls.errors.push(code);
      },
      ...(selectionPages ? { selectionChanged: (page) => calls.selectionPages.push(page) } : {}),
    },
    { loadFeatures, ...(placesProvider ? { placesProvider } : {}) },
  );
  t.after(instance.dispose);
  return { instance, map, calls, elements, container };
}

test('camera is acknowledged after readiness and same-position restoration without repeating year-only changes', (t) => {
  const { map, instance, calls } = harness(t);
  calls.zoom = 4;
  map.emit('moveend');
  assert.equal(calls.cameras.length, 0, 'pre-load resize must not publish an unready camera');
  map.emit('load');
  assert.deepEqual(calls.initializationEvents, ['ready', 'camera']);
  assert.equal(calls.cameras[0].zoom, 4);
  map.emit('moveend');
  assert.equal(calls.cameras.length, 1, 'ordinary unchanged movement stays coalesced');
  instance.command({
    type: 'catalog.view',
    payload: {
      year: 2024,
      polity: false,
      culture: false,
      focusPilot: false,
      camera: calls.cameras[0],
    },
  });
  assert.equal(calls.cameras.length, 2, 'explicit restoration acknowledges even the same position');
  assert.deepEqual(calls.cameras[1], calls.cameras[0]);
  instance.command({
    type: 'catalog.view',
    payload: { year: 2000, polity: false, culture: false, focusPilot: false },
  });
  map.emit('moveend');
  assert.equal(calls.cameras.length, 2, 'a year change never republishes or moves the camera');
  instance.dispose();
  map.emit('moveend');
  assert.equal(calls.cameras.length, 2);
});

test('fresh camera and reset focus Turkey; explicit camera restoration takes precedence', (t) => {
  const { map, instance, calls } = harness(t);
  assert.deepEqual(map.options.center, [35, 39]);
  assert.equal(map.options.zoom, 4);
  map.emit('load');
  const camera = { center: { lng: 12, lat: 48 }, zoom: 6, bearing: 15, pitch: 10 };
  instance.command({
    type: 'catalog.view',
    payload: { year: 2000, polity: false, culture: false, focusPilot: false, camera },
  });
  assert.deepEqual(calls.jumpCameras.at(-1), { center: [12, 48], zoom: 6, bearing: 15, pitch: 10 });
  instance.command({ type: 'camera.reset', payload: {} });
  assert.deepEqual(calls.jumpCameras.at(-1), { center: [35, 39], zoom: 4, bearing: 0, pitch: 0 });
});

test('modern city markers survive empty historical years, respect their independent toggle, covered state and disposal', async (t) => {
  const { map, instance, calls, elements, container } = harness(t, {
    project: true,
    loadFeatures: async () => ({ type: 'FeatureCollection', features: [] }),
  });
  calls.zoom = 4;
  container.clientHeight = 360;
  container.clientWidth = 720;
  map.emit('load');
  const view = (enabled) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year: 1,
        polity: false,
        culture: false,
        focusPilot: false,
        labels: false,
        modernCities: enabled,
      },
    });
  view(true);
  await new Promise((r) => setImmediate(r));
  map.emit('moveend');
  const cities = elements.filter((e) => e.classList.contains('atlas-modern-city'));
  assert.ok(cities.length > 0);
  const button = cities[0];
  button.classList.add('maplibregl-marker-covered');
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.modernCities.length, 0);
  button.classList.remove('maplibregl-marker-covered');
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.modernCities.length, 1);
  assert.equal(container.dataset.historicalCount, '0');
  view(false);
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.modernCities.length, 1);
  view(true);
  instance.dispose();
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.modernCities.length, 1);
  assert.equal(calls.markerCreated, calls.markerRemoved);
  assert.equal(map.listeners.get('dragstart').size, 0);
});

test('modern global chunks cannot overwrite a newer camera, paint after disable/pause, or retain listeners after unmount', async (t) => {
  const pending = [];
  // Explicitly SYNTHETIC injected provider; never app data or geographical claims.
  const placesProvider = {
    manifest: { version: 'SYNTHETIC-test-version' },
    query(view, signal) {
      return new Promise((resolve) => pending.push({ view, signal, resolve }));
    },
  };
  const { instance, map, calls, elements } = harness(t, {
    project: true,
    placesProvider,
    loadFeatures: async () => ({ type: 'FeatureCollection', features: [] }),
  });
  calls.zoom = 4;
  map.emit('load');
  const view = (show) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year: 1,
        polity: false,
        culture: false,
        focusPilot: false,
        modernCities: show,
      },
    });
  const city = (id) => ({ id, name: 'SYNTHETIC ' + id, coordinate: [2, 1], packIndex: 0 });
  const finish = async (request, id) => {
    request.resolve({ cities: [city(id)], limited: false, failedPacks: 0 });
    await new Promise((r) => setImmediate(r));
  };
  view(true);
  await new Promise((r) => setImmediate(r));
  assert.equal(pending.length, 1);
  calls.zoom = 14;
  map.emit('moveend');
  assert.equal(pending.length, 2);
  assert.equal(pending[1].view.zoom, 8, 'street-scale camera keeps the highest existing city LOD');
  assert.equal(pending[0].signal.aborted, true);
  await finish(pending[1], 'geonames:2');
  const chosen = elements.filter((e) => e.classList.contains('atlas-modern-city'));
  assert.equal(chosen.length, 1);
  chosen[0].dispatchEvent(new Event('click'));
  assert.deepEqual(calls.modernCities, ['geonames:2']);
  await finish(pending[0], 'geonames:1');
  assert.equal(elements.filter((e) => e.classList.contains('atlas-modern-city')).length, 1);
  assert.deepEqual(calls.placesStatus.at(-1), { state: 'ready', loaded: 1 });
  instance.pause();
  chosen[0].dispatchEvent(new Event('click'));
  assert.equal(calls.modernCities.length, 1);
  instance.resume();
  assert.equal(pending.length, 3);
  view(false);
  assert.equal(pending[2].signal.aborted, true);
  await finish(pending[2], 'geonames:3');
  assert.equal(elements.filter((e) => e.classList.contains('atlas-modern-city')).length, 1);
  view(true);
  const last = pending.at(-1);
  instance.dispose();
  assert.equal(last.signal.aborted, true);
  await finish(last, 'geonames:4');
  assert.equal(calls.markerCreated, calls.markerRemoved);
  assert.equal(map.listeners.get('dragstart').size, 0);
});

test('küre arkasındaki işaret seçim göndermez; öne dönünce tekrar seçilir', (t) => {
  const { map, calls, instance } = harness(t);
  map.emit('load');
  const button = calls.markerOptions.element;
  const click = (detail) => {
    const event = new Event('click');
    Object.defineProperty(event, 'detail', { value: detail });
    button.dispatchEvent(event);
  };
  click(1);
  assert.equal(calls.selected, 1);
  button.classList.add('maplibregl-marker-covered');
  click(1);
  click(0); // Klavye / programatik seçim de kapalı olmalı.
  assert.equal(calls.selected, 1);
  assert.equal(calls.markerOptions.opacityWhenCovered, 0);
  button.classList.remove('maplibregl-marker-covered');
  click(0);
  assert.equal(calls.selected, 2);
  instance.dispose();
  click(1);
  assert.equal(calls.selected, 2);
});

test('gerçek renderer kodunda iki kültür+siyaset fill seçimi, tüm aday sayfaları ve yıl/katman temizliği', async (t) => {
  const catalog = culturalFixture(17);
  // Provider/catalog version matches this installed prototype bridge, not real-world data.
  catalog.catalogVersion = PILOT_VERSION;
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  const load = createHistoricalFeatureLoader(engine);
  const { map, calls, instance, container } = harness(t, {
    loadFeatures: load,
    selectionPages: true,
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const view = (year, revision, culture = true) =>
    instance.command({
      type: 'catalog.view',
      payload: { year, revision, polity: true, culture, labels: false, focusPilot: false },
    });
  map.emit('load');
  view(1, 4);
  await settle();
  assert.equal(container.dataset.historicalCount, '18');
  const features = await load({ year: 1, polity: true, culture: true }, 3);
  calls.renderedMatches = features.features.map((feature) => ({ properties: feature.properties }));
  map.emit('mousedown');
  map.emit('click', { point: { x: 10, y: 10 } });
  assert.ok(calls.queriedLayers.includes('culture-area'));
  assert.ok(calls.queriedLayers.includes('polity-area'));
  const first = calls.selectionPages[0];
  assert.equal(first.total, 18);
  assert.equal(first.candidateIds.length, 8);
  const seen = [...first.candidateIds];
  for (const offset of [8, 16]) {
    instance.command({
      type: 'selection.page',
      payload: { selectionId: first.selectionId, revision: 4, offset },
    });
    seen.push(...calls.selectionPages.at(-1).candidateIds);
  }
  assert.equal(new Set(seen).size, 18);
  assert.ok(seen.includes('test:territory'));
  assert.ok(seen.includes('test:culture-area-16'));
  view(1, 5, false);
  await settle();
  assert.equal(container.dataset.historicalCount, '1');
  const pagesBefore = calls.selectionPages.length;
  instance.command({
    type: 'selection.page',
    payload: { selectionId: first.selectionId, revision: 4, offset: 8 },
  });
  assert.equal(calls.selectionPages.length, pagesBefore);
  view(3, 6);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  instance.dispose();
  map.emit('click', { point: { x: 10, y: 10 } });
  assert.equal(calls.selectionPages.length, pagesBefore);
});

test('renderer load sırasında marker hatasını yakalar ve kaynakları bırakır', (t) => {
  const { map, calls } = harness(t, { markerThrows: true });
  assert.doesNotThrow(() => map.emit('load'));
  assert.deepEqual(calls.errors, ['renderer']);
  assert.equal(calls.ready, 0);
  assert.equal(calls.removed, 1);
  assert.equal(calls.markerRemoved, 1);
  assert.equal(calls.disconnected, 1);
  assert.equal(calls.revoked.length, 1);
});

test('yinelenen load tek marker kurar; dispose sonrası listener/komut çalışmaz', (t) => {
  const { map, instance, calls, container } = harness(t);
  map.emit('load');
  map.emit('load');
  assert.equal(calls.markerCreated, 1);
  assert.equal(calls.ready, 1);
  assert.equal(container.dataset.projection, 'globe');
  instance.dispose();
  instance.dispose();
  assert.equal(calls.removed, 1);
  assert.equal(calls.markerRemoved, 1);
  assert.equal(container.dataset.projection, undefined);
  assert.equal(
    [...map.listeners.values()].reduce((count, listeners) => count + listeners.size, 0),
    0,
  );
  instance.command({ type: 'camera.reset', payload: {} });
  map.emit('load');
  assert.equal(calls.jumps, 0);
  assert.equal(calls.markerCreated, 1);
});

test('context kaybı bir kez bildirilir; map/worker/dinleyiciler bırakılır', (t) => {
  const { map, calls } = harness(t);
  map.emit('load');
  map.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  map.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  assert.deepEqual(calls.errors, ['context-lost']);
  assert.equal(calls.removed, 1);
  assert.equal(calls.revoked.length, 1);
});

test('kaynaklı pilot renderer → host seçilir; drag, eski sürüm ve kapalı katman seçimi reddedilir', async (t) => {
  const { map, calls, instance, container } = harness(t);
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  map.emit('load');
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, polity: true, culture: true, focusPilot: true },
  });
  await settle();
  assert.equal(container.dataset.historicalCount, '1');
  assert.equal(calls.history.at(-1).features[0].geometry.coordinates.length, 7);
  calls.renderedMatches = [{ properties: { recordId: PILOT_ID, catalogVersion: PILOT_VERSION } }];
  map.emit('mousedown');
  map.emit('click', { point: { x: 0, y: 0 } });
  assert.deepEqual(calls.historicalSelected, [PILOT_ID]);
  map.emit('dragstart');
  map.emit('click', { point: { x: 0, y: 0 } });
  assert.equal(calls.historicalSelected.length, 1);
  map.emit('mousedown');
  calls.renderedMatches[0].properties.catalogVersion = 'old';
  map.emit('click', { point: { x: 0, y: 0 } });
  assert.equal(calls.historicalSelected.length, 1);
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, polity: false, culture: true, focusPilot: false },
  });
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  map.emit('click', { point: { x: 0, y: 0 } });
  assert.equal(calls.historicalSelected.length, 1);
  instance.dispose();
  const before = calls.history.length;
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, polity: true, culture: true, focusPilot: false },
  });
  await settle();
  assert.equal(calls.history.length, before);
});

test('hızlı yıl değişiminde eski kaynak yanıtı çizilmez; unmount geç yüklemeyi durdurur', async (t) => {
  const { map, calls, instance, container } = harness(t);
  map.emit('load');
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, polity: true, culture: true, focusPilot: false },
  });
  instance.command({
    type: 'catalog.view',
    payload: { year: 1868, polity: true, culture: true, focusPilot: false },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(container.dataset.historicalCount, '0');
  assert.equal(container.dataset.historicalYear, '1868');
  assert.equal(calls.history.at(-1).features.length, 0);
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, polity: true, culture: true, focusPilot: false },
  });
  instance.dispose();
  const before = calls.history.length;
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.history.length, before);
});

test('snapshot önizlemesi kaynak yılını korur; kapatma ve hızlı yıl değişimi kaynak çizgisini temizler', async (t) => {
  const { map, calls, instance, container } = harness(t);
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  map.emit('load');
  const command = (year, previewSnapshot) =>
    instance.command({
      type: 'catalog.view',
      payload: { year, previewSnapshot, polity: true, culture: true, focusPilot: false },
    });
  command(1868, false);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  command(1868, true);
  await settle();
  assert.equal(container.dataset.historicalYear, '1868');
  assert.equal(container.dataset.historicalSourceYear, '1867');
  assert.equal(container.dataset.historicalPreview, 'true');
  assert.equal(calls.history.at(-1).features.length, 1);
  command(1868, false);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  assert.equal(container.dataset.historicalSourceYear, undefined);
  assert.equal(container.dataset.historicalPreview, 'false');
  command(1868, true);
  command(1869, false);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  assert.equal(container.dataset.historicalYear, '1869');
  instance.dispose();
  assert.equal(container.dataset.historicalSourceYear, undefined);
});

test('kaynak ACK setData tamamlanmasını bekler; eski apply reddedilir, zaman kamerayı değiştirmez', async (t) => {
  const { map, calls, instance, container } = harness(t, { deferredApply: true });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const command = (year, revision, suspendHistory = false, focusPilot = false) =>
    instance.command({
      type: 'catalog.view',
      payload: { year, revision, suspendHistory, focusPilot, polity: true, culture: true },
    });
  map.emit('load');
  command(1867, 1);
  await settle();
  assert.equal(calls.applyResolvers.length, 1);
  assert.equal(
    calls.applied.some((a) => a.revision === 1),
    false,
  );
  command(1868, 2, true);
  await settle();
  assert.equal(calls.applied.at(-1).coverageStatus, 'loading');
  calls.applyResolvers.shift()();
  await settle();
  assert.equal(
    calls.applied.some((a) => a.revision === 1),
    false,
  );
  command(1868, 2);
  await settle();
  assert.equal(calls.applied.at(-1).year, 1868);
  assert.equal(calls.applied.at(-1).sourceYear, null);
  assert.equal(container.dataset.historicalCount, '0');
  assert.equal(calls.jumps, 0);
  command(1867, 3, false, true);
  await settle();
  assert.equal(calls.jumps, 1);
  calls.applyResolvers.shift()();
  await settle();
  assert.equal(calls.applied.at(-1).sourceYear, 1867);
});

test('siyasi vurgu ve açık kamera odağı güncel revizyon ister, tarihi değiştirmez ve azaltılmış harekete uyar', async (t) => {
  const { map, calls, instance, container } = harness(t);
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  map.emit('load');
  const view = (year, revision) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year,
        revision,
        polity: true,
        culture: true,
        focusPilot: false,
        selectedId: PILOT_ID,
      },
    });
  view(1867, 8);
  await settle();
  assert.deepEqual(calls.featureStates.at(-1), {
    target: { source: 'historical', id: PILOT_ID },
    state: { selected: true },
  });
  const focus = (recordId, revision, reducedMotion) =>
    instance.command({ type: 'polity.focus', payload: { recordId, revision, reducedMotion } });
  focus('test:missing', 8, false);
  focus(PILOT_ID, 7, false);
  assert.equal(calls.flights.length, 0);
  focus(PILOT_ID, 8, false);
  assert.equal(calls.flights.at(-1).duration, 700);
  focus(PILOT_ID, 8, true);
  assert.equal(calls.flights.at(-1).duration, 0);
  assert.equal(container.dataset.historicalYear, '1867');
  assert.equal(calls.jumps, 0);
  instance.command({ type: 'polity.select', payload: { recordId: null, revision: 8 } });
  assert.equal(calls.featureStates.at(-1), null);
  view(1868, 9);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  focus(PILOT_ID, 9, false);
  assert.equal(calls.flights.length, 2);
  instance.dispose();
  focus(PILOT_ID, 9, false);
  assert.equal(calls.flights.length, 2);
});

test('kişi kümesi tüm adayları köprüye taşır; arka yüz/drag reddi ve yıl/layer/unmount temizliği', async (t) => {
  // Explicitly synthetic renderer input; never clone a disputed real-world location.
  const base = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [1, 1] },
    properties: {
      kind: 'person-location',
      boundary: 'approximate',
      politicalStatus: 'not-sovereignty',
      catalogVersion: PILOT_VERSION,
      sourceYear: 1880,
      preview: false,
      coverageMode: 'documented approximate',
      entityId: 'test:person',
      color: '#ffffff',
      lineStyle: 'person',
      fillOpacity: 0,
      priority: 40,
      small: true,
      anchorLng: 1,
      anchorLat: 1,
      classification: 'DOCUMENTED_EVENT',
    },
  };
  const synthetic = {
    type: 'FeatureCollection',
    features: Array.from({ length: 20 }, (_, i) => {
      const feature = structuredClone(base);
      feature.id = `test:person-location-${i}`;
      feature.properties.recordId = feature.id;
      feature.properties.label = 'SYNTHETIC TEST PERSON';
      return feature;
    }),
  };
  const { map, calls, instance, elements, container } = harness(t, {
    project: true,
    selectionPages: true,
    loadFeatures: async (view) =>
      view.year === 1880 && view.person ? synthetic : { type: 'FeatureCollection', features: [] },
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const view = (year, person, revision) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year,
        person,
        revision,
        polity: false,
        culture: false,
        includeApproximatePersons: true,
        focusPilot: false,
      },
    });
  map.emit('load');
  view(1880, true, 1);
  await settle();
  assert.equal(container.dataset.historicalCount, '20');
  let button = elements.filter((e) => e.classList.contains('atlas-person-marker')).at(-1);
  const click = () => {
    const event = new Event('click');
    Object.defineProperty(event, 'detail', { value: 1 });
    button.dispatchEvent(event);
  };
  button.classList.add('maplibregl-marker-covered');
  click();
  assert.equal(calls.selectionPages.length, 0);
  assert.equal(calls.clusterZooms.length, 0);
  button.classList.remove('maplibregl-marker-covered');
  map.emit('dragstart');
  click();
  assert.equal(calls.selectionPages.length, 0);
  button.dispatchEvent(new Event('pointerdown'));
  click();
  assert.equal(calls.selectionPages.at(-1).total, 20);
  assert.deepEqual(calls.clusterZooms, [
    { center: [1, 1], zoom: 2, duration: 0, essential: false },
  ]);
  const first = calls.selectionPages.at(-1),
    ids = [...first.candidateIds];
  for (const offset of [8, 16]) {
    instance.command({
      type: 'selection.page',
      payload: { selectionId: first.selectionId, revision: 1, offset },
    });
    ids.push(...calls.selectionPages.at(-1).candidateIds);
  }
  assert.equal(new Set(ids).size, 20);
  assert.equal(calls.jumps, 0);
  const beforeResize = calls.selectionPages.length;
  container.clientWidth = 120;
  calls.resized();
  click();
  assert.equal(calls.selectionPages.length, beforeResize, 'resized marker listener removed');
  container.clientWidth = 360;
  calls.resized();
  button = elements.filter((e) => e.classList.contains('atlas-person-marker')).at(-1);
  instance.command({
    type: 'polity.focus',
    payload: { recordId: synthetic.features[0].id, revision: 1, reducedMotion: true },
  });
  assert.equal(calls.flights.at(-1).duration, 0);
  assert.equal(container.dataset.historicalYear, '1880');
  view(1881, true, 2);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  const count = calls.selectionPages.length;
  click();
  assert.equal(calls.selectionPages.length, count);
  instance.command({
    type: 'selection.page',
    payload: { selectionId: first.selectionId, revision: 1, offset: 8 },
  });
  assert.equal(calls.selectionPages.length, count);
  view(1880, false, 3);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  view(1880, true, 4);
  await settle();
  button = elements.filter((e) => e.classList.contains('atlas-person-marker')).at(-1);
  instance.dispose();
  const zooms = calls.clusterZooms.length;
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.selectionPages.length, count);
  assert.equal(calls.clusterZooms.length, zooms);
  assert.equal(calls.markerCreated, calls.markerRemoved);
  assert.equal(calls.errors.length, 0);
});

test('olay kümeleri kişiyle örtüşmede bütün adayları açar; kapalı savaş ve eski seçim kaynakları temizlenir', async (t) => {
  const base = await historicalFeatures(
    { year: 1066, polity: false, culture: false, battle: true, event: true },
    3,
  );
  const synthetic = {
    type: 'FeatureCollection',
    features: Array.from({ length: 20 }, (_, i) => {
      const f = structuredClone(base.features[0]);
      f.id = `test:event-${i}`;
      f.properties.recordId = f.id;
      f.properties.label = 'SYNTHETIC TEST EVENT';
      return f;
    }),
  };
  const person = structuredClone(synthetic.features[0]);
  person.id = 'test:person-overlap';
  person.properties = {
    ...person.properties,
    recordId: person.id,
    kind: 'person-location',
    lineStyle: 'person-exact',
    label: 'SYNTHETIC TEST PERSON',
  };
  synthetic.features.push(person);
  const { map, calls, instance, elements, container } = harness(t, {
    project: true,
    selectionPages: true,
    loadFeatures: async (view) =>
      view.year === 1066 && view.battle ? synthetic : { type: 'FeatureCollection', features: [] },
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const view = (year, battle, revision) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year,
        battle,
        event: true,
        person: true,
        revision,
        polity: false,
        culture: false,
        focusPilot: false,
      },
    });
  map.emit('load');
  view(1066, true, 1);
  await settle();
  const button = elements.filter((e) => e.classList.contains('atlas-event-marker')).at(-1);
  assert.ok(button);
  assert.equal(button.textContent, '21'); // 20 events + one person share a single count.
  button.classList.add('maplibregl-marker-covered');
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.selectionPages.length, 0);
  button.classList.remove('maplibregl-marker-covered');
  button.dispatchEvent(new Event('click'));
  const first = calls.selectionPages.at(-1);
  assert.equal(first.total, 21);
  const ids = [...first.candidateIds];
  for (const offset of [8, 16]) {
    instance.command({
      type: 'selection.page',
      payload: { selectionId: first.selectionId, revision: 1, offset },
    });
    ids.push(...calls.selectionPages.at(-1).candidateIds);
  }
  assert.equal(new Set(ids).size, 21);
  assert.ok(ids.includes(person.id));
  assert.equal(calls.jumps, 0);
  instance.command({
    type: 'polity.focus',
    payload: { recordId: synthetic.features[0].id, revision: 1, reducedMotion: true },
  });
  assert.equal(calls.flights.at(-1).duration, 0);
  assert.equal(container.dataset.historicalYear, '1066');
  view(1066, false, 2);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  const count = calls.selectionPages.length;
  button.dispatchEvent(new Event('click'));
  assert.equal(calls.selectionPages.length, count);
  instance.command({
    type: 'selection.page',
    payload: { selectionId: first.selectionId, revision: 1, offset: 8 },
  });
  assert.equal(calls.selectionPages.length, count);
  view(1067, true, 3);
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  instance.dispose();
  assert.equal(calls.markerCreated, calls.markerRemoved);
  assert.equal(calls.errors.length, 0);
});

test('kültür polygon odağı bbox ile yapılır; eski revizyon ve dispose yeni uçuş üretmez', async (t) => {
  const catalog = culturalFixture(2),
    timeline = createTimelineEngine(createHistoricalDataProvider(catalog));
  const features = await createHistoricalFeatureLoader(timeline)(
    { year: 1, polity: false, culture: true },
    1,
  );
  assert.equal(features.features.length, 2);
  const { map, calls, instance, container } = harness(t, { loadFeatures: async () => features });
  map.emit('load');
  instance.command({
    type: 'catalog.view',
    payload: { year: 1, revision: 10, polity: false, culture: true, focusPilot: false },
  });
  await new Promise((resolve) => setImmediate(resolve));
  const id = features.features[0].id;
  instance.command({
    type: 'polity.focus',
    payload: { recordId: id, revision: 10, reducedMotion: true },
  });
  assert.equal(calls.boundFlights.length, 1);
  assert.equal(calls.boundFlights[0].options.duration, 0);
  assert.deepEqual(calls.boundFlights[0].bounds, [
    [0, 0],
    [4, 4],
  ]);
  assert.equal(container.dataset.historicalYear, '1');
  instance.command({
    type: 'polity.focus',
    payload: { recordId: id, revision: 9, reducedMotion: false },
  });
  assert.equal(calls.boundFlights.length, 1);
  instance.dispose();
  instance.command({
    type: 'polity.focus',
    payload: { recordId: id, revision: 10, reducedMotion: false },
  });
  assert.equal(calls.boundFlights.length, 1);
});

test('kaydedilen kamera catalog.view ile atomik uygulanır; sonraki normal yıl değişimi kamerayı sıfırlamaz', async (t) => {
  const { map, calls, instance } = harness(t);
  map.emit('load');
  const camera = { center: { lng: 170, lat: 30 }, zoom: 2, bearing: 35, pitch: 20 };
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, revision: 1, polity: true, culture: false, focusPilot: false, camera },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.jumps, 1);
  assert.deepEqual(calls.jumpCameras[0], { center: [170, 30], zoom: 2, bearing: 35, pitch: 20 });
  instance.command({
    type: 'catalog.view',
    payload: { year: 1868, revision: 2, polity: true, culture: false, focusPilot: false },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.jumps, 1);
  instance.dispose();
});

test('Faz14 renderer applies filters at same year without moving camera and cleans hidden label markers', async (t) => {
  const { defaultFilters } = await import('../../src/preferences/model.ts');
  const catalog = culturalFixture(2);
  catalog.catalogVersion = PILOT_VERSION;
  const engine = createTimelineEngine(createHistoricalDataProvider(catalog));
  const { map, calls, instance, container } = harness(t, {
    loadFeatures: createHistoricalFeatureLoader(engine),
    project: true,
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const view = (revision, patch = {}) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year: 1,
        revision,
        polity: true,
        culture: true,
        person: false,
        battle: false,
        event: false,
        labels: true,
        filters: { ...defaultFilters },
        focusPilot: false,
        ...patch,
      },
    });
  map.emit('load');
  view(1);
  await settle();
  assert.equal(container.dataset.historicalCount, '4');
  const camera = calls.jumps,
    removed = calls.markerRemoved;
  view(2, { labels: false });
  await settle();
  assert.equal(container.dataset.historicalCount, '3'); // Place layer removed; political/culture geometry remains.
  assert.ok(calls.markerRemoved > removed);
  assert.equal(calls.jumps, camera);
  view(3, { filters: { ...defaultFilters, confidence: 'high' } });
  await settle();
  assert.equal(container.dataset.historicalCount, '0');
  assert.equal(calls.applied.at(-1).year, 1);
  assert.equal(calls.applied.at(-1).revision, 3);
  assert.equal(calls.applied.at(-1).sourceYear, null);
  view(4);
  await settle();
  assert.equal(container.dataset.historicalCount, '4');
  assert.equal(calls.jumps, camera);
  instance.dispose();
  assert.equal(calls.markerCreated, calls.markerRemoved);
});

test('Faz15 data failure preserves physical globe, supports same-year retry and cancels old requests', async (t) => {
  let fail = true,
    aborted = 0;
  const { map, calls, instance, container } = harness(t, {
    loadFeatures: async (view, zoom) => {
      view.signal.addEventListener(
        'abort',
        () => {
          aborted++;
        },
        { once: true },
      );
      if (fail) throw new Error('SYNTHETIC chunk unavailable');
      return historicalFeatures(view, zoom);
    },
    dataErrors: true,
  });
  map.emit('load');
  instance.command({
    type: 'catalog.view',
    payload: { year: 1867, revision: 1, polity: true, culture: false, focusPilot: false },
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(calls.removed, 0);
  assert.equal(calls.errors.length, 0);
  assert.equal(container.dataset.projection, 'globe');
  assert.ok(calls.dataErrors.includes(1));
  fail = false;
  instance.command({
    type: 'catalog.view',
    payload: {
      year: 1867,
      revision: 1,
      polity: true,
      culture: false,
      focusPilot: false,
      retryData: true,
    },
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(container.dataset.historicalCount, '1');
  assert.equal(calls.applied.at(-1).year, 1867);
  assert.ok(aborted > 0);
  instance.pause();
  const before = calls.history.length;
  instance.command({
    type: 'catalog.view',
    payload: { year: 1881, revision: 2, polity: true, culture: false, focusPilot: false },
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(calls.history.length, before);
  instance.resume();
  await new Promise((r) => setImmediate(r));
  assert.equal(container.dataset.historicalCount, '0');
  instance.dispose();
  assert.equal(calls.markerCreated, calls.markerRemoved);
});

test('Atlas/Küre transition keeps camera, selected year and loaded history without remount or refetch', async (t) => {
  let loads = 0;
  const { map, calls, instance, container } = harness(t, {
    loadFeatures: async (...args) => {
      loads++;
      return historicalFeatures(...args);
    },
  });
  map.emit('load');
  const view = (projection) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year: 1867,
        revision: 10,
        polity: true,
        culture: false,
        focusPilot: false,
        projection,
        showDemo: false,
      },
    });
  view('mercator');
  await new Promise((resolve) => setImmediate(resolve));
  const before = { jumps: calls.jumps, loads, removed: calls.removed };
  assert.equal(container.dataset.projection, 'mercator');
  assert.equal(container.dataset.historicalYear, '1867');
  assert.equal(container.dataset.historicalCount, '1');
  view('globe');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(container.dataset.projection, 'globe');
  assert.equal(container.dataset.historicalCount, '1');
  assert.deepEqual({ jumps: calls.jumps, loads, removed: calls.removed }, before);
  assert.equal(calls.markerOptions.element.hidden, true);
  view('mercator');
  assert.equal(container.dataset.projection, 'mercator');
  assert.deepEqual(calls.errors, []);
  instance.dispose();
  assert.equal(calls.removed, 1);
});

test('Atlas point selection does not apply the globe horizon; globe still rejects the far side', async (t) => {
  // SYNTHETIC overlay in memory only, not a real event coordinate.
  const collection = structuredClone(
    await historicalFeatures({ year: 1066, polity: false, culture: false, battle: true }, 3),
  );
  const feature = collection.features[0];
  feature.id = 'test:synthetic-point';
  feature.geometry = { type: 'Point', coordinates: [170, 0] };
  Object.assign(feature.properties, {
    recordId: feature.id,
    label: 'SYNTHETIC TEST ONLY',
    anchorLng: 170,
    anchorLat: 0,
  });
  const { map, calls, instance } = harness(t, {
    project: true,
    loadFeatures: async () => collection,
  });
  map.emit('load');
  const view = (projection) =>
    instance.command({
      type: 'catalog.view',
      payload: {
        year: 1066,
        revision: 1,
        polity: false,
        culture: false,
        battle: true,
        focusPilot: false,
        projection,
      },
    });
  view('globe');
  await new Promise((r) => setImmediate(r));
  map.emit('click', { point: { x: 350, y: 90 } });
  assert.deepEqual(calls.historicalSelected, []);
  view('mercator');
  await new Promise((r) => setImmediate(r));
  map.emit('click', { point: { x: 350, y: 90 } });
  assert.deepEqual(calls.historicalSelected, [feature.id]);
});

test('optional road tile failure never removes the historical globe', (t) => {
  const { instance, map, calls } = harness(t);
  map.emit('load');
  map.emit('error', {
    sourceId: 'modern-openfreemap',
    error: new Error('SYNTHETIC network outage'),
  });
  assert.equal(calls.removed, 0);
  assert.deepEqual(calls.errors, []);
  map.emit('error', { sourceId: 'historical', error: new Error('SYNTHETIC renderer failure') });
  assert.equal(calls.removed, 1);
  assert.deepEqual(calls.errors, ['renderer']);
  instance.dispose();
});

test('person and event paint shrinks with zoom, stays bounded and keeps accessible hit targets without rebuilding', async (t) => {
  const collection = {
    type: 'FeatureCollection',
    features: ['person-location', 'event'].map((kind, index) => ({
      type: 'Feature',
      id: `test:marker-size-${index}`,
      geometry: { type: 'Point', coordinates: [index ? 40 : -40, 1] },
      properties: {
        kind,
        recordId: `test:marker-size-${index}`,
        label: 'SYNTHETIC MARKER SIZE',
        catalogVersion: PILOT_VERSION,
        sourceYear: 1881,
        preview: false,
        coverageMode: 'documented approximate',
        entityId: 'test:entity',
        color: '#ffffff',
        lineStyle: 'person-approximate',
        fillOpacity: 0,
        priority: 40,
        small: true,
        anchorLng: index ? 40 : -40,
        anchorLat: 1,
        classification: index ? 'BATTLE' : 'BIRTH',
      },
    })),
  };
  const { map, instance, calls, elements } = harness(t, {
    project: true,
    selectionPages: true,
    loadFeatures: async () => collection,
  });
  calls.zoom = 5;
  map.emit('load');
  instance.command({
    type: 'catalog.view',
    payload: {
      year: 1881,
      person: true,
      battle: true,
      event: true,
      polity: false,
      culture: false,
      focusPilot: false,
      revision: 1,
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  const markers = elements.filter((e) => e.classes.has('atlas-discovery-marker'));
  assert.equal(markers.length, 2);
  const created = calls.markerCreated,
    loads = calls.history.length;
  const sizes = [];
  for (const zoom of [0, 1, 3, 5, 16]) {
    calls.zoom = zoom;
    map.emit('zoom');
    const diameter = parseInt(markers[0].style['--atlas-marker-size']);
    sizes.push(diameter);
    assert.ok(diameter >= 8 && diameter <= 24);
    for (const marker of markers) {
      assert.match(marker.style.cssText, /width:48px;height:48px/);
      assert.match(marker.style.cssText, /background:transparent/);
    }
    if (zoom < 4) assert.equal(markers[0].style['--atlas-marker-caption-display'], 'none');
  }
  assert.ok(sizes[0] < sizes[3]);
  assert.equal(sizes[3], sizes[4]);
  assert.equal(calls.markerCreated, created);
  assert.equal(calls.history.length, loads);
  calls.zoom = 0;
  map.emit('zoom');
  markers[0].dispatchEvent(new Event('click'));
  assert.equal(calls.selectionPages.at(-1).recordId, 'test:marker-size-0');
  instance.dispose();
  assert.equal(calls.markerCreated, calls.markerRemoved);
});
