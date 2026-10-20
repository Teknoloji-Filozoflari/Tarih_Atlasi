import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isLocalNote,
  parseNotes,
  notesAtYear,
  createNoteRepository,
} from '../../src/annotations/model.ts';
import { parseMessage, encode } from '../../src/map-contract/protocol.ts';
import { defaultPreferences } from '../../src/preferences/model.ts';
import { peopleCatalogs, peopleManifest } from '../../src/people/generated/index.ts';
import {
  peopleCatalogs as globalCatalogs,
  peopleManifest as globalManifest,
} from '../../src/people/global/index.ts';
import { buildGlobal } from '../../scripts/people/global.mjs';
import { createPeopleExtension } from '../../src/people/extension.ts';
import { pilotProvider, createHistoricalFeatureLoader } from '../../src/data/pilot.ts';
import { createTimelineEngine } from '../../src/timeline/engine.ts';
import { createEventRepository } from '../../src/events/repository.ts';
import { createSitelinkResolver } from '../../src/sources/sitelinks.ts';
import { reviewedSitelinks, sitelinkManifest } from '../../src/sources/generated/sitelinks.ts';
const note = (patch = {}) => ({
  id: 'local:synthetic-test',
  kind: 'person',
  title: 'SENTETİK TEST',
  description: 'Gerçek kişi değildir',
  source: 'Test only',
  start: -1,
  end: 1,
  lng: 35,
  lat: 39,
  reviewStatus: 'unverified',
  ...patch,
});
test('local unverified notes reject zero, invalid coordinates, implicit approval, duplicate IDs and excessive UTF8', () => {
  assert.ok(isLocalNote(note()));
  for (const patch of [
    { start: 0 },
    { end: 0 },
    { lng: 181 },
    { lat: NaN },
    { reviewStatus: 'verified' },
    { end: -2 },
    { title: '' },
    { secret: 'no' },
  ])
    assert.equal(isLocalNote(note(patch)), false);
  assert.deepEqual(notesAtYear([note()], -1), [note()]);
  assert.deepEqual(notesAtYear([note()], 2), []);
  const raw = (records) => JSON.stringify({ version: 1, records });
  assert.throws(() => parseNotes(raw([note(), note()])));
  assert.throws(
    () =>
      parseNotes(
        raw(
          Array.from({ length: 50 }, (_, i) =>
            note({ id: `local:${i}`, description: '界'.repeat(500), source: '界'.repeat(300) }),
          ),
        ),
      ),
    /NOTES_SIZE/,
  );
});
test('notes persist across recreation, serialize writes, isolate mutations and preserve corrupt storage', async () => {
  let raw = null;
  let fail = false;
  const storage = {
    read: async () => raw,
    write: async (v) => {
      if (fail) throw Error('disk full');
      raw = v;
    },
  };
  const repo = createNoteRepository(storage);
  await assert.rejects(repo.save(note()));
  await repo.load();
  const draft = note();
  const pending = repo.save(draft);
  draft.title = 'mutated';
  await pending;
  await Promise.all([repo.save(note({ id: 'local:b' })), repo.save(note({ id: 'local:c' }))]);
  const loaded = await createNoteRepository(storage).load();
  assert.equal(loaded.length, 3);
  assert.equal(loaded[0].title, 'SENTETİK TEST');
  loaded[0].title = 'another mutation';
  fail = true;
  await assert.rejects(repo.remove('local:b'));
  fail = false;
  const remaining = await repo.remove('local:c');
  assert.equal(remaining.length, 2);
  assert.equal(remaining[0].title, 'SENTETİK TEST');
  raw = '{broken';
  const broken = createNoteRepository(storage);
  await assert.rejects(broken.load());
  await assert.rejects(broken.save(note()));
  assert.equal(raw, '{broken');
});
test('local note bridge excludes private text and source URLs, limits markers and respects direction', () => {
  const payload = {
    year: 1881,
    polity: true,
    culture: true,
    focusPilot: false,
    notes: [{ id: 'local:synthetic-test', kind: 'person', lng: 35, lat: 39 }],
  };
  const command = (p) =>
    JSON.stringify({
      version: 1,
      type: 'catalog.view',
      requestId: 'test',
      sessionId: 'test',
      payload: p,
    });
  assert.ok(parseMessage(command(payload), 'command', 'test'));
  assert.equal(
    parseMessage(
      command({ ...payload, notes: [{ ...payload.notes[0], title: 'private' }] }),
      'command',
      'test',
    ),
    null,
  );
  assert.equal(
    parseMessage(
      command({
        ...payload,
        notes: Array.from({ length: 9 }, (_, i) => ({ ...payload.notes[0], id: `local:${i}` })),
      }),
      'command',
      'test',
    ),
    null,
  );
  const selected = encode({
    version: 1,
    type: 'note.selected',
    payload: { id: 'local:synthetic-test' },
    requestId: 'test',
    sessionId: 'test',
  });
  assert.ok(parseMessage(selected, 'event', 'test'));
  assert.equal(parseMessage(selected, 'command', 'test'), null);
});
test('default approximate birth visibility shows Atatürk only in the source birth year, never throughout his life', async () => {
  assert.equal(defaultPreferences.includeApproximatePersons, true);
  const ext = createPeopleExtension(peopleCatalogs, peopleManifest);
  const timeline = createTimelineEngine(ext.withProvider(pilotProvider));
  const load = createHistoricalFeatureLoader(timeline);
  const options = {
    polity: false,
    culture: false,
    person: true,
    includeApproximatePersons: defaultPreferences.includeApproximatePersons,
  };
  const a = await load({ ...options, year: 1881 }, 4);
  const b = await load({ ...options, year: 1882 }, 4);
  assert.ok(a.features.some((f) => f.id === 'births:location-q5152'));
  assert.equal(
    b.features.some((f) => f.id === 'births:location-q5152'),
    false,
  );
});
test('new global pack is deterministic, uncertainty stays biographical, and event cards use the same year provider', async () => {
  assert.deepEqual((await buildGlobal()).packs, globalCatalogs);
  const ext = createPeopleExtension(globalCatalogs, globalManifest);
  const provider = ext.withProvider(pilotProvider);
  const timeline = createTimelineEngine(provider);
  const events = createEventRepository(provider, timeline);
  assert.equal(globalManifest.annualBirths, 2);
  assert.equal(globalManifest.biographicalOnly, 2);
  for (const q of ['q46795', 'q455072']) {
    const location = ext.records.find((r) => r.id === `births:location-${q}`);
    assert.equal(location.locationType, 'biographical');
    assert.equal(location.temporal.start.kind, 'unknown');
  }
  const ayacucho = await events.detail('global:event-q934157', 1824);
  assert.ok(ayacucho.mapSupported);
  assert.equal((await events.detail('global:event-q934157', 1825)).mapSupported, false);
  assert.equal(
    (await events.atYear(1824, { battle: false, event: true })).records.some(
      (h) => h.record.id === 'global:event-q934157',
    ),
    false,
  );
  const resolver = createSitelinkResolver(sitelinkManifest.version, reviewedSitelinks);
  assert.equal(
    resolver.resolve('Q5152').url,
    'https://tr.wikipedia.org/wiki/Mustafa_Kemal_Atat%C3%BCrk',
  );
  assert.equal(resolver.resolve('Q934157').kind, 'enwiki');
});

test('personal marker removes GPU marker/listeners, rejects drag/covered clicks, and does not rebuild unchanged data', async (t) => {
  const { noteMarkers } = await import('../../src/map/globe/note-markers.ts');
  const buttons = [],
    listeners = new Map();
  let made = 0,
    removed = 0;
  const chosen = [];
  const prior = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement() {
        const events = new Map();
        const b = {
          style: {
            setProperty(name, value) {
              this[name] = value;
            },
          },
          classList: { contains: () => false },
          setAttribute() {},
          addEventListener: (n, f) => events.set(n, f),
          removeEventListener: (n) => events.delete(n),
          events,
        };
        buttons.push(b);
        return b;
      },
    },
  });
  t.after(() =>
    prior ? Object.defineProperty(globalThis, 'document', prior) : delete globalThis.document,
  );
  class Marker {
    constructor() {
      made++;
    }
    setLngLat() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {
      removed++;
    }
  }
  let zoom = 5;
  const map = {
    getZoom: () => zoom,
    on: (n, f) => listeners.set(n, f),
    off: (n) => listeners.delete(n),
  };
  const host = noteMarkers({ Marker }, map, (id) => chosen.push(id));
  const item = { id: 'local:synthetic-test', kind: 'person', lng: 1, lat: 1 };
  host.set([item]);
  host.set([item]);
  assert.equal(made, 1);
  assert.equal(buttons[0].style['--atlas-marker-size'], '24px');
  zoom = 0;
  listeners.get('zoom')();
  assert.equal(buttons[0].style['--atlas-marker-size'], '8px');
  assert.equal(made, 1, 'zoom only resizes the existing marker');
  const b = buttons[0],
    click = { detail: 1, stopPropagation() {} };
  b.events.get('pointerdown')();
  listeners.get('dragstart')();
  b.events.get('click')(click);
  assert.deepEqual(chosen, []);
  b.events.get('pointerdown')();
  b.events.get('click')(click);
  assert.deepEqual(chosen, [item.id]);
  b.classList.contains = () => true;
  b.events.get('click')({ ...click, detail: 0 });
  assert.equal(chosen.length, 1);
  host.set([]);
  assert.equal(removed, 1);
  assert.equal(b.events.size, 0);
  host.dispose();
  assert.equal(listeners.size, 0);
});
