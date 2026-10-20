import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  INITIAL_CAMERA,
  MAX_MESSAGE_BYTES,
  encode,
  isCamera,
  parseMessage,
} from '../../src/map-contract/protocol.ts';
import { developmentOrigin, isAllowedNavigation } from '../../src/map-contract/navigation.ts';
import { validateLand } from '../../src/map/globe/land.ts';
import { resourceScope } from '../../src/map/globe/lifecycle.ts';

const sessionId = 'test-session';
const envelope = (type, payload) => ({
  version: 1,
  type,
  requestId: 'command-1',
  sessionId,
  payload,
});
test('kamera sözleşmesi kutupları kabul eder; sonlu ve sınırlı değerler ister', () => {
  assert.ok(isCamera(INITIAL_CAMERA));
  assert.ok(isCamera({ ...INITIAL_CAMERA, center: { lng: 180, lat: -90 } }));
  for (const camera of [
    { ...INITIAL_CAMERA, zoom: NaN },
    { ...INITIAL_CAMERA, pitch: Infinity },
    { ...INITIAL_CAMERA, zoom: 17 },
    { ...INITIAL_CAMERA, bearing: 181 },
    { ...INITIAL_CAMERA, center: { lng: -181, lat: 0 } },
    { ...INITIAL_CAMERA, center: { lng: 0, lat: 91 } },
    { ...INITIAL_CAMERA, extra: true },
  ])
    assert.equal(isCamera(camera), false);
});
test('köprü reset/set komutlarını ve sentetik işareti yönlerine göre doğrular', () => {
  for (const command of [envelope('camera.reset', {}), envelope('camera.set', INITIAL_CAMERA)]) {
    assert.deepEqual(parseMessage(encode(command), 'command', sessionId), command);
    assert.equal(parseMessage(encode(command), 'event', sessionId), null);
  }
  const selected = envelope('demo.selected', { id: 'synthetic-demo', synthetic: true });
  assert.deepEqual(parseMessage(encode(selected), 'event', sessionId), selected);
  assert.equal(
    parseMessage(
      encode({ ...selected, payload: { ...selected.payload, synthetic: false } }),
      'event',
      sessionId,
    ),
    null,
  );
});
test('köprü hatalı JSON, sürüm, oturum, ek anahtar, kod ve büyük UTF-8 yüklerini reddeder', () => {
  const command = envelope('camera.reset', {});
  for (const raw of [
    null,
    command,
    '[',
    'null',
    '[]',
    '"hello"',
    encode({ ...command, version: 2 }),
    encode({ ...command, sessionId: 'old-session' }),
    encode({ ...command, requestId: 'x'.repeat(81) }),
    encode({ ...command, type: 'eval' }),
    encode({ ...command, payload: { script: 'alert(1)' } }),
    encode({ ...command, extra: true }),
    encode({ ...command, payload: { text: 'a'.repeat(MAX_MESSAGE_BYTES) } }),
    encode({ ...command, requestId: 'ı'.repeat(1500) }),
    '{"version":1,"type":"camera.reset","requestId":"x","sessionId":"test-session","payload":{"__proto__":{}}}',
  ])
    assert.equal(parseMessage(raw, 'command', sessionId), null);
  assert.equal(
    parseMessage(encode(envelope('renderer.error', { code: 'injected' })), 'event', sessionId),
    null,
  );
  assert.equal(
    parseMessage(
      encode(envelope('renderer.error', { code: { toString: null } })),
      'event',
      sessionId,
    ),
    null,
  );
});
test('navigasyon yalnız Expo bootstrap dosyası veya geliştirme DOM origin/path kabul eder', () => {
  const origin = developmentOrigin('192.168.1.20:8081', true);
  assert.equal(origin, 'http://192.168.1.20:8081');
  assert.equal(developmentOrigin('192.168.1.20:8081', false), null);
  assert.equal(developmentOrigin('user:password@example.com', true), null);
  assert.ok(isAllowedNavigation('file:///android_asset/www.bundle/dom.html', null));
  assert.ok(isAllowedNavigation(`${origin}/_expo/@dom/entry.bundle?platform=web`, origin));
  for (const url of [
    'https://example.com',
    'javascript:alert(1)',
    'data:text/html,hello',
    'intent://example',
    'file:///etc/passwd',
    'file://evil/android_asset/www.bundle/map.html',
    'file:///android_asset/www.bundle/../private',
    'file:///android_asset/www.bundle/%2e%2e/private',
    `${origin}/other.html`,
    `${origin}/_expo/@dom/../../private`,
    'http://192.168.1.21:8081/_expo/@dom/map.html',
  ])
    assert.equal(isAllowedNavigation(url, origin), false, url);
  assert.equal(isAllowedNavigation(`${origin}/_expo/@dom/map.html`, null), false);
});
// Yalnız validator fixture'ı: hiçbir ürün dosyasına/coğrafya kaynağına aktarılmaz.
const syntheticLand = () => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'SYNTHETIC TEST ONLY' },
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
});
test('fiziksel veri hazırlığı özellikleri atar; yanlış geometrileri ve sınırsız yükü reddeder', () => {
  const input = syntheticLand();
  assert.deepEqual(validateLand(input).features[0].properties, {});
  assert.equal(input.features[0].properties.name, 'SYNTHETIC TEST ONLY');
  for (const value of [null, {}, { type: 'FeatureCollection', features: [] }])
    assert.throws(() => validateLand(value));
  const open = syntheticLand();
  open.features[0].geometry.coordinates[0].pop();
  assert.throws(() => validateLand(open));
  const outOfRange = syntheticLand();
  outOfRange.features[0].geometry.coordinates[0][0][0] = 181;
  assert.throws(() => validateLand(outOfRange));
  const point = syntheticLand();
  point.features[0].geometry = { type: 'Point', coordinates: [0, 0] };
  assert.throws(() => validateLand(point));
  assert.throws(() =>
    validateLand({
      type: 'FeatureCollection',
      features: Array(1001).fill(syntheticLand().features[0]),
    }),
  );
});
test('unmount temizliği bir kez, ters sırayla çalışır; geç async kaynak ve hata diğer temizliği engellemez', () => {
  const scope = resourceScope();
  const cleaned = [];
  scope.add(() => cleaned.push('worker-url'));
  scope.add(() => cleaned.push('map-remove'));
  scope.add(() => {
    throw new Error('context already gone');
  });
  scope.add(() => cleaned.push('observer'));
  scope.dispose();
  scope.dispose();
  scope.add(() => cleaned.push('late-import'));
  assert.deepEqual(cleaned, ['observer', 'map-remove', 'worker-url', 'late-import']);
  assert.equal(scope.disposed, true);
});
