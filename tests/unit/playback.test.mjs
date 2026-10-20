import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  parseYearInput,
  jumpYear,
  sliderWindow,
  yearFraction,
  fractionYear,
  keyboardYear,
} from '../../src/timeline/interaction.ts';
import { createTimelineStore } from '../../src/timeline/store.ts';
import { timelineFrameLoader } from '../../src/timeline/frame.ts';
import { pilotTimeline } from '../../src/data/pilot.ts';
import { parseMessage, encode } from '../../src/map-contract/protocol.ts';
import { PILOT_VERSION } from '../../src/data/pilot-contract.ts';
const settle = () => new Promise((resolve) => setImmediate(resolve));
// SYNTHETIC ONLY: these empty frames carry no historical data or geography.
function frame(year) {
  return {
    requestedYear: year,
    contextYear: year,
    entities: [],
    territories: [],
    persons: [],
    events: [],
    coverage: {
      catalogVersion: PILOT_VERSION,
      selectedYear: year,
      sourceYear: null,
      isPreview: false,
      mode: 'no supported historical geography',
      selectedYearMode: 'no supported historical geography',
      records: [],
      coverageRecords: [],
      unresolvedTemporalRecords: 0,
      partial: true,
    },
  };
}
function fakeClock() {
  let now = 0,
    id = 0;
  const pending = new Map();
  return {
    set(callback, ms) {
      const token = ++id;
      pending.set(token, { at: now + ms, callback });
      return token;
    },
    clear(token) {
      pending.delete(token);
    },
    tick(ms) {
      const end = now + ms;
      for (;;) {
        const first = [...pending].sort((a, b) => a[1].at - b[1].at)[0];
        if (!first || first[1].at > end) break;
        now = first[1].at;
        pending.delete(first[0]);
        first[1].callback();
      }
      now = end;
    },
    count: () => pending.size,
  };
}

test('doğrudan MÖ/MS metin girişi, yıl sıfırı ve belirsiz sözdizimi', () => {
  for (const [input, year] of [
    ['MÖ 44', -44],
    ['mö 1', -1],
    ['MS 1867', 1867],
    ['1867 ms', 1867],
    ['1', 1],
    ['2000 MÖ', -2000],
  ])
    assert.equal(parseYearInput(input, 2026), year);
  for (const text of [
    'MÖ 0',
    'MS 0',
    '0',
    '-1',
    'MÖ 2001',
    'MS 2027',
    '1.2',
    '1e3',
    'MÖ 2 MS',
    'MS',
    'MS -1',
    'MS 20 abc',
    '',
    'MS 0000001',
  ])
    assert.equal(parseYearInput(text, 2026), null, text);
});

test('sürükleme ve hızlı atlama astronomik sırayı kullanır; MÖ/MS boşluğu veya yıl 0 yok', () => {
  assert.equal(jumpYear(-1, 10, 2026), 10);
  assert.equal(jumpYear(1, -10, 2026), -10);
  assert.equal(jumpYear(-1950, -100, 2026), -2000);
  assert.equal(jumpYear(2000, 100, 2026), 2026);
  assert.equal(fractionYear(0.5, -1, 1), 1);
  for (const year of [-2000, -1, 1, 1867, 2026])
    assert.equal(fractionYear(yearFraction(year, -2000, 2026), -2000, 2026), year);
  assert.deepEqual(sliderWindow(1, 2026, 20), { minYear: -10, maxYear: 11 });
  assert.equal(keyboardYear('ArrowRight', -1, 2026), 1);
  assert.equal(keyboardYear('ArrowLeft', 1, 2026), -1);
  assert.equal(keyboardYear('Home', 1867, 2026), -2000);
  assert.equal(keyboardYear('End', -1, 2026), 2026);
  assert.equal(keyboardYear('PageUp', -1, 2026), 100);
  assert.equal(keyboardYear('Tab', 1, 2026), null);
});

test('oynatma kontrollü kadansla ilerler; hız yıl adımıdır, manuel seçim durdurur', async () => {
  const clock = fakeClock();
  let loads = 0;
  const store = createTimelineStore(
    -1,
    2026,
    async (year) => {
      loads++;
      return frame(year);
    },
    clock,
  );
  store.start();
  await settle();
  store.setReducedMotion(false);
  store.play();
  clock.tick(499);
  assert.equal(store.getSnapshot().requestedYear, -1);
  clock.tick(1);
  await settle();
  assert.equal(store.getSnapshot().requestedYear, 1);
  store.setSpeed(100);
  clock.tick(500);
  await settle();
  assert.equal(store.getSnapshot().requestedYear, 101);
  store.selectYear(-44);
  await settle();
  assert.equal(store.getSnapshot().playing, false);
  const count = loads;
  clock.tick(5000);
  await settle();
  assert.equal(loads, count);
  assert.equal(store.getSnapshot().requestedYear, -44);
  store.dispose();
  assert.equal(clock.count(), 0);
});

test('azaltılmış hareket, üst sınıra varınca durma ve yeniden oynatma davranışı belirli', async () => {
  const clock = fakeClock();
  const store = createTimelineStore(2025, 2026, async (y) => frame(y), clock);
  store.start();
  await settle();
  store.play();
  clock.tick(999);
  assert.equal(store.getSnapshot().requestedYear, 2025);
  clock.tick(1);
  await settle();
  assert.equal(store.getSnapshot().requestedYear, 2026);
  assert.equal(store.getSnapshot().playing, false);
  store.play();
  await settle();
  assert.equal(store.getSnapshot().requestedYear, -2000);
  store.pause();
  store.dispose();
  assert.equal(clock.count(), 0);
});

test('hızlı sürüklemede tek son sorgu; eski istek iptal olur ve eski sonuç/hata yayımlanmaz', async () => {
  const clock = fakeClock();
  const pending = [];
  const store = createTimelineStore(
    1867,
    2026,
    (year, options) =>
      new Promise((resolve, reject) => pending.push({ year, options, resolve, reject })),
    clock,
  );
  store.start();
  await settle();
  assert.equal(pending.length, 1);
  for (let year = 1800; year <= 1900; year++) store.selectYear(year, true);
  assert.equal(pending[0].options.signal.aborted, true);
  assert.equal(store.getSnapshot().requestedYear, 1900);
  clock.tick(80);
  await settle();
  assert.equal(pending.length, 2);
  assert.equal(pending[1].year, 1900);
  pending[1].resolve(frame(1900));
  await settle();
  pending[0].reject(new Error('STALE'));
  await settle();
  assert.equal(store.getSnapshot().frame.requestedYear, 1900);
  assert.notEqual(store.getSnapshot().coverageStatus, 'error');
  store.selectYear(1901, true);
  store.flush();
  await settle();
  assert.equal(pending[2].year, 1901);
  store.dispose();
  pending[2].resolve(frame(1901));
  await settle();
  assert.equal(clock.count(), 0);
});

test('katmanlar tek yıl çerçevesiyle atomik yayımlanır; güncel hata boş veri sayılmaz', async () => {
  const controller = new AbortController();
  const calls = [];
  let release;
  const engine = {
    getDataCoverage: async (year) => frame(year).coverage,
    getEntitiesAtYear: async (year) => {
      calls.push(['entities', year]);
      return [];
    },
    getTerritoriesAtYear: async (year) => {
      calls.push(['territories', year]);
      return [];
    },
    getPersonsAtYear: async (year) => {
      calls.push(['persons', year]);
      return [];
    },
    getEventsAtYear: (year) => {
      calls.push(['events', year]);
      return new Promise((resolve) => {
        release = resolve;
      });
    },
  };
  const store = createTimelineStore(-44, 2026, timelineFrameLoader(engine));
  store.start();
  await settle();
  assert.equal(store.getSnapshot().frame, null);
  release([]);
  await settle();
  assert.deepEqual(
    calls.map((c) => c[1]),
    [-44, -44, -44, -44],
  );
  assert.equal(store.getSnapshot().frame.requestedYear, -44);
  store.dispose();
  const broken = createTimelineStore(1867, 2026, async () => {
    throw new Error('CURRENT');
  });
  broken.start();
  await settle();
  assert.equal(broken.getSnapshot().coverageStatus, 'error');
  assert.equal(broken.getSnapshot().frame, null);
  broken.dispose();
  controller.abort();
});

test('istenen yıl ve haritanın uyguladığı kaynak yılı ayrı; eski/sapmış ACK reddedilir', async () => {
  const store = createTimelineStore(1867, 2026, timelineFrameLoader(pilotTimeline));
  store.start();
  await settle();
  const state = store.getSnapshot();
  assert.equal(state.renderedSourceYear, null);
  const applied = {
    revision: state.revision,
    year: 1867,
    sourceYear: 1867,
    coverageStatus: 'documented approximate',
    catalogVersion: PILOT_VERSION,
  };
  store.acknowledge({ ...applied, revision: state.revision - 1 });
  assert.equal(store.getSnapshot().renderedSourceYear, null);
  store.acknowledge({ ...applied, sourceYear: 1866 });
  assert.equal(store.getSnapshot().renderedSourceYear, null);
  store.acknowledge(applied);
  assert.equal(store.getSnapshot().renderedSourceYear, 1867);
  store.selectYear(1868);
  await settle();
  assert.equal(store.getSnapshot().renderedSourceYear, null);
  store.acknowledge(applied);
  assert.equal(store.getSnapshot().renderedSourceYear, null);
  store.setPreview(true);
  await settle();
  const preview = store.getSnapshot();
  store.acknowledge({ ...applied, revision: preview.revision, year: 1868 });
  assert.equal(store.getSnapshot().requestedYear, 1868);
  assert.equal(store.getSnapshot().renderedSourceYear, 1867);
  assert.equal(store.getSnapshot().coverageStatus, 'no supported historical geography');
  store.selectYear(1869);
  await settle();
  assert.equal(store.getSnapshot().preview, false);
  store.dispose();
});

test('köprü ACK ve yeni kontrol alanları şema/sürüm/yıl doğrulamasından geçer', () => {
  const payload = {
    revision: 2,
    year: 1868,
    sourceYear: 1867,
    coverageStatus: 'documented approximate',
    catalogVersion: PILOT_VERSION,
  };
  const message = {
    version: 1,
    sessionId: 'test',
    requestId: 'event-1',
    type: 'catalog.applied',
    payload,
  };
  assert.ok(parseMessage(encode(message), 'event', 'test'));
  for (const changed of [
    { revision: -1 },
    { year: 0 },
    { sourceYear: 0 },
    { coverageStatus: 'loading' },
    { catalogVersion: 'old' },
    { extra: true },
  ])
    assert.equal(
      parseMessage(encode({ ...message, payload: { ...payload, ...changed } }), 'event', 'test'),
      null,
    );
  const command = {
    ...message,
    requestId: 'command-1',
    type: 'catalog.view',
    payload: {
      year: 1867,
      polity: true,
      culture: true,
      focusPilot: false,
      revision: 2,
      suspendHistory: true,
    },
  };
  assert.ok(parseMessage(encode(command), 'command', 'test'));
  assert.equal(
    parseMessage(
      encode({ ...command, payload: { ...command.payload, suspendHistory: 'yes' } }),
      'command',
      'test',
    ),
    null,
  );
});

test('dar MÖ penceresinde klavye doğru uca ulaşır; yoğun snapshot işaretleri bütçelidir', async () => {
  const { snapshotMarkers } = await import('../../src/timeline/interaction.ts');
  assert.equal(keyboardYear('ArrowRight', -1991, -1990), -1990);
  const years = Array.from({ length: 1900 }, (_, index) => -2000 + index);
  const ticks = snapshotMarkers(years, -2000, -101, 24);
  assert.equal(ticks.length, 24);
  assert.equal(ticks[0], -2000);
  assert.equal(ticks.at(-1), -101);
  assert.ok(ticks.every((year) => years.includes(year)));
});

test('üst yıl değişimi ve StrictMode yeniden kurulumu geçersiz ara yıl yayımlamaz', async () => {
  const clock = fakeClock();
  const store = createTimelineStore(2026, 2026, async (y) => frame(y), clock);
  const snapshots = [];
  store.start();
  await settle();
  const unsubscribe = store.subscribe(() => snapshots.push(store.getSnapshot()));
  store.setMaxYear(2025);
  await settle();
  assert.equal(store.getSnapshot().requestedYear, 2025);
  assert.ok(snapshots.every((s) => s.requestedYear <= s.maxYear));
  unsubscribe();
  store.dispose();
  store.start();
  await settle();
  assert.equal(store.getSnapshot().frame.requestedYear, 2025);
  store.dispose();
  assert.equal(clock.count(), 0);
});

test('native thumb merkezi dokunma koordinatında iki uca ve MÖ/MS geçişine doğru eşlenir', async () => {
  const { sliderPositionYear } = await import('../../src/timeline/interaction.ts');
  assert.equal(sliderPositionYear(12, 240, -2000, 2026), -2000);
  assert.equal(sliderPositionYear(228, 240, -2000, 2026), 2026);
  assert.equal(sliderPositionYear(12, 240, -1, 1), -1);
  assert.equal(sliderPositionYear(228, 240, -1, 1), 1);
  assert.equal(sliderPositionYear(-50, 240, -1, 1), -1);
  assert.equal(sliderPositionYear(999, 240, -1, 1), 1);
});

test('yaklaşık kişi tercihi revizyonu değiştirir, eski yıl ve kanıt filtresi ACKsi reddedilir', async (t) => {
  const requests = [];
  const store = createTimelineStore(
    1880,
    2026,
    (year, options) => new Promise((resolve) => requests.push({ year, options, resolve })),
  );
  t.after(() => store.dispose());
  store.start();
  await settle();
  store.setApproximatePersons(true);
  await settle();
  assert.equal(requests[0].options.signal.aborted, true);
  assert.equal(requests[1].options.includeApproximatePersons, true);
  const revision = store.getSnapshot().revision;
  requests[1].resolve(frame(1880));
  await settle();
  store.setApproximatePersons(false);
  await settle();
  requests[0].resolve(frame(1880));
  await settle();
  assert.equal(store.getSnapshot().frame, null);
  store.acknowledge({
    revision,
    year: 1880,
    sourceYear: null,
    coverageStatus: 'no supported historical geography',
    catalogVersion: PILOT_VERSION,
  });
  assert.notEqual(store.getSnapshot().renderStatus, 'applied');
  assert.equal(requests[2].options.includeApproximatePersons, false);
  requests[2].resolve(frame(1880));
  await settle();
  assert.equal(store.getSnapshot().includeApproximatePersons, false);
  assert.equal(store.getSnapshot().requestedYear, 1880);
});

test('Faz15 background stops pending load/playback and foreground retries latest year only', async () => {
  const { timelineFrameLoader } = await import('../../src/timeline/frame.ts');
  const { pilotTimeline } = await import('../../src/data/pilot.ts');
  const { createTimelineStore } = await import('../../src/timeline/store.ts');
  const calls = [];
  const store = createTimelineStore(1867, 2026, async (year, options) => {
    calls.push({ year, signal: options.signal });
    return timelineFrameLoader(pilotTimeline)(year, options);
  });
  store.start();
  await new Promise((r) => setImmediate(r));
  store.play();
  store.setForeground(false);
  store.selectYear(1880);
  await new Promise((r) => setImmediate(r));
  assert.equal(store.getSnapshot().playing, false);
  assert.equal(calls.length, 1);
  store.setForeground(true);
  await new Promise((r) => setImmediate(r));
  assert.equal(calls.at(-1).year, 1880);
  assert.equal(store.getSnapshot().frame.requestedYear, 1880);
  store.dispose();
});
