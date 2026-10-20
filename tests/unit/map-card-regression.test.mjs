import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import ts from 'typescript';
import { renderCityCard } from '../helpers/render-native-web.mjs';
import { canSelectMapRecord, opensOverlapChooser } from '../../src/atlas/map-interaction.ts';
import { invalidatesPlaceSelection } from '../../src/map/selection-requests.ts';
import { auditPeopleVisibility } from '../../scripts/qa/people-visibility.mjs';
const city = {
  id: 'synthetic:city',
  name: 'SENTETİK — gerçek yer değil',
  admin1: 'TEST',
  admin2: '',
  countryName: 'TEST',
  countryCode: 'XX',
  featureCode: 'PPLA',
  coordinate: [0, 0],
  reviewedAt: '2026-10-19',
  modifiedAt: '',
  licenseId: 'CC-BY-4.0',
  revision: 'test',
  locator: 'SYNTHETIC',
  sourceUrl: 'https://www.geonames.org/1/',
};
test('real React Native Web city card accepts missing/empty administrative data without raw View text', async () => {
  for (const variant of [
    city,
    { ...city, admin1: '', admin2: '' },
    { ...city, featureCode: '', countryName: '', modifiedAt: '' },
    { ...city, admin1: undefined, admin2: undefined, modifiedAt: undefined },
  ]) {
    const result = await renderCityCard(variant);
    assert.deepEqual(result.errors, []);
    assert.match(result.html, /SENTETİK/);
  }
});
test('city details never lock out historical markers; point picking and modal tools cannot be hijacked', () => {
  for (const panel of [
    null,
    'modern-city',
    'modern-places',
    'person',
    'event',
    'polity',
    'selection',
  ])
    assert.equal(canSelectMapRecord(panel, false), true, panel);
  for (const panel of [null, 'modern-city', 'person', 'notes'])
    assert.equal(canSelectMapRecord(panel, true), false);
  for (const panel of ['notes', 'layers', 'year', 'search', 'attribution'])
    assert.equal(canSelectMapRecord(panel, false), false, panel);
  assert.equal(opensOverlapChooser('person-location', 4), false);
  assert.equal(opensOverlapChooser('event', 3), false);
  assert.equal(opensOverlapChooser('territory', 2), true);
  assert.equal(opensOverlapChooser('cultural-region', 2), true);
});
test('late city lookup cannot replace a more recent person, event, article or personal-note choice', async () => {
  for (const type of [
    'selection.changed',
    'entity.selected',
    'entity.article',
    'note.selected',
    'demo.selected',
    'place.selected',
    'city.selected',
    'renderer.error',
  ]) {
    const controller = new AbortController();
    let release;
    const lookup = new Promise((r) => {
      release = r;
    });
    const displayed = [];
    const completion = lookup.then((city) => {
      if (!controller.signal.aborted) displayed.push(city);
    });
    if (invalidatesPlaceSelection(type)) controller.abort();
    displayed.push(type);
    release('old city');
    await completion;
    assert.deepEqual(displayed, [type]);
  }
  for (const type of ['camera.changed', 'places.status', 'catalog.applied'])
    assert.equal(invalidatesPlaceSelection(type), false);
});
test('all reviewed birth releases render at their supported year and zoom without spreading into adjacent years', async () => {
  const result = await auditPeopleVisibility();
  assert.equal(result.profiles, 233);
  assert.equal(result.annualBirths, 147);
  assert.deepEqual(
    result.entries.filter((r) => r.failures.length),
    [],
  );
});
test('native layout containers across source tree never contain literal text children, including explicit whitespace', async () => {
  const failures = [];
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) {
        if (entry.name !== 'generated') await visit(path);
      } else if (path.endsWith('.tsx')) {
        const source = await readFile(path, 'utf8');
        const ast = ts.createSourceFile(
          path,
          source,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TSX,
        );
        const walk = (n) => {
          if (
            ts.isJsxElement(n) &&
            ['View', 'ScrollView', 'SafeAreaView', 'Pressable'].includes(
              n.openingElement.tagName.getText(ast),
            )
          )
            for (const c of n.children)
              if (
                (ts.isJsxText(c) && c.text.trim()) ||
                (ts.isJsxExpression(c) && c.expression && ts.isStringLiteral(c.expression))
              )
                failures.push(path + ':' + (ast.getLineAndCharacterOfPosition(c.pos).line + 1));
          ts.forEachChild(n, walk);
        };
        walk(ast);
      }
    }
  }
  await visit('src');
  assert.deepEqual(failures, []);
});
