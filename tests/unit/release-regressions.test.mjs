import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createHistoryRepository } from '../../src/history/repository.ts';
import { historyManifest } from '../../src/history/generated/manifest.ts';
import { withHistoryTimeline } from '../../src/history/timeline.ts';
import { pilotTimeline } from '../../src/data/pilot.ts';
import { dataErrorCode } from '../../src/data/error-code.ts';

test('developer load diagnostics never expose raw source URLs, payloads or secret-like errors', () => {
  assert.equal(dataErrorCode(new Error('WORLD_ASSET_HTTP')), 'WORLD_ASSET_HTTP');
  for (const error of [
    new Error('https://invalid.example/?secret=SYNTHETIC'),
    new Error('SYNTHETIC key: value'),
    new Error('A'.repeat(81)),
    'RAW_RESPONSE',
  ])
    assert.equal(dataErrorCode(error), 'DATA_LOAD_FAILED');
});

test('web toggle action exposes its actual selected state through aria-pressed', async () => {
  const require = createRequire(import.meta.url);
  const native = require('react-native-web');
  const { theme } = await import('../../src/theme/tokens.ts');
  const source = await readFile('src/atlas/Action.tsx', 'utf8');
  const exports = {};
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const deps = {
    'react-native': native,
    '../theme/tokens': { theme },
    '../ui/AppText': {
      AppText: ({ children }) => React.createElement(native.Text, null, children),
    },
  };
  vm.runInNewContext(compiled, { exports, require: (id) => deps[id] ?? require(id) });
  for (const selected of [false, true]) {
    const html = renderToStaticMarkup(
      React.createElement(exports.Action, {
        label: 'SYNTHETIC TEST CONTROL',
        selected,
        onPress() {},
      }),
    );
    assert.match(html, new RegExp(`aria-pressed="${selected}"`));
    assert.match(html, /aria-label="SYNTHETIC TEST CONTROL"/u);
  }
});

test('concurrent archive frame projections preserve complete evidence and read each year pack once', async () => {
  const reads = new Map();
  const archive = createHistoryRepository(historyManifest, (index, pack) => {
    reads.set(index, (reads.get(index) ?? 0) + 1);
    return readFile(`assets/history/${pack.sha256}.atlas`, 'utf8');
  });
  const timeline = withHistoryTimeline(pilotTimeline, archive);
  const year = 2000;
  const [entities, persons, events] = await Promise.all([
    timeline.getEntitiesAtYear(year),
    timeline.getPersonsAtYear(year),
    timeline.getEventsAtYear(year),
  ]);
  assert.ok(reads.size > 8, 'exercise more packs than the unchanged eight-entry LRU');
  assert.ok([...reads.values()].every((count) => count === 1));
  const reference = createHistoryRepository(historyManifest, (_i, pack) =>
    readFile(`assets/history/${pack.sha256}.atlas`, 'utf8'),
  );
  const expected = {
    entities: [...(await pilotTimeline.getEntitiesAtYear(year))],
    persons: [...(await pilotTimeline.getPersonsAtYear(year))],
    events: [...(await pilotTimeline.getEventsAtYear(year))],
  };
  for (const kind of ['person', 'event']) {
    for await (const { engine } of reference.enginesAt(year, kind)) {
      expected.entities.push(...(await engine.getEntitiesAtYear(year)));
      if (kind === 'person') expected.persons.push(...(await engine.getPersonsAtYear(year)));
      else expected.events.push(...(await engine.getEventsAtYear(year)));
    }
  }
  const sorted = (values, person = false) =>
    [...values].sort((a, b) =>
      (person ? a.person.record.id : a.record.id).localeCompare(
        person ? b.person.record.id : b.record.id,
      ),
    );
  const uniqueEntities = [...new Map(expected.entities.map((h) => [h.record.id, h])).values()];
  assert.deepEqual(sorted(entities), sorted(uniqueEntities));
  assert.deepEqual(sorted(persons, true), sorted(expected.persons, true));
  assert.deepEqual(sorted(events), sorted(expected.events));
  await timeline.getPersonsAtYear(year);
  assert.ok([...reads.values()].every((count) => count === 1));
  assert.ok(archive.stats().cachedPacks <= 8);
  timeline.clearCache();
  await timeline.getPersonsAtYear(year);
  assert.ok(
    [...reads.values()].some((count) => count === 2),
    'clear invalidates the aggregate too',
  );
  archive.clear();
  reference.clear();
});
