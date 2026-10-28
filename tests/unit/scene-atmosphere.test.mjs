import assert from 'node:assert/strict';
import { test } from 'node:test';

import { physicalStyle, assertHistoricalMapStyle } from '../../src/map/globe/style.ts';
import {
  createStarField,
  sceneCssVariables,
  sceneSkySpecification,
} from '../../src/map/globe/scene-atmosphere.ts';
import { theme } from '../../src/theme/tokens.ts';

test('scene star field is deterministic and bounded', () => {
  const a = createStarField(48, 0xabcdd00d);
  const b = createStarField(48, 0xabcdd00d);
  const c = createStarField(48, 0x12345678);
  assert.equal(a.length, 48);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  for (const star of a) {
    assert.ok(star.x >= 0 && star.x <= 1);
    assert.ok(star.y >= 0 && star.y <= 1);
    assert.ok(star.r > 0 && star.r < 2);
    assert.ok(star.a > 0 && star.a <= 1);
  }
});

test('physical style keeps map paints and adds mild sky atmosphere', () => {
  const land = { type: 'FeatureCollection', features: [] };
  const style = physicalStyle(land);
  assert.doesNotThrow(() => assertHistoricalMapStyle(style));
  assert.equal(
    style.layers.find((layer) => layer.id === 'ocean')?.paint['background-color'],
    theme.colors.ocean,
  );
  assert.equal(
    style.layers.find((layer) => layer.id === 'physical-land')?.paint['fill-color'],
    theme.colors.land,
  );
  const sky = style.sky ?? sceneSkySpecification();
  assert.ok(Array.isArray(sky['atmosphere-blend']));
  assert.equal(sky['atmosphere-blend'][4], theme.scene.atmosphereBlendFar);
  assert.equal(sky['atmosphere-blend'][8], theme.scene.atmosphereBlendNear);
  assert.ok(theme.scene.atmosphereBlendFar <= 0.6);
  assert.equal(theme.scene.atmosphereBlendNear, 0);
});

test('scene CSS variables stay in the ink/sand product language', () => {
  const vars = sceneCssVariables();
  assert.equal(vars['--atlas-scene-mid'], theme.colors.background);
  assert.match(vars['--atlas-scene-glow-sand'], /228,\s*194,\s*139/);
  assert.doesNotMatch(vars['--atlas-scene-glow-sand'], /purple|#[89a-fA-F]{2}[0-4]{2}[c-fC-F]{2}/);
  assert.ok(!Object.values(vars).some((value) => /#(?:7c3aed|a855f7|8b5cf6)/i.test(value)));
});
