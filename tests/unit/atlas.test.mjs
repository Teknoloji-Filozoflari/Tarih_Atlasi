import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  initialLayers,
  layers,
  layoutMode,
  parseYear,
  stepYear,
} from '../../src/atlas/presentation.ts';
import { tr } from '../../src/i18n/tr.ts';
import { theme } from '../../src/theme/tokens.ts';

test('yıl seçimi MÖ 2000/günümüz uçlarını korur; sıfır ve hatalı girdiyi reddeder', () => {
  assert.equal(parseYear('2000', true, 2026), -2000);
  assert.equal(parseYear('2026', false, 2026), 2026);
  for (const text of ['0', '-1', '1.5', '1e3', '', '99999', 'abc'])
    assert.equal(parseYear(text, false, 2026), null);
  assert.equal(parseYear('2001', true, 2026), null);
  assert.equal(parseYear('2027', false, 2026), null);
  assert.equal(stepYear(-1, 1, 2026), 1);
  assert.equal(stepYear(1, -1, 2026), -1);
  assert.equal(stepYear(-2000, -1, 2026), -2000);
  assert.equal(stepYear(2026, 1, 2026), 2026);
});
test('küçük/yatay telefon ve büyük metin kompakt düzene döner', () => {
  for (const size of [
    [320, 568, 1],
    [360, 800, 1],
    [800, 360, 1],
    [1920, 1080, 2],
  ])
    assert.equal(layoutMode(...size), 'compact');
  assert.equal(layoutMode(1440, 900, 1), 'wide');
  assert.equal(layoutMode(2560, 1440, 1), 'wide');
});
test('altı bağımsız katman renk dışında benzersiz biçim ve Türkçe ada sahiptir', () => {
  assert.equal(layers.length, 6);
  assert.equal(new Set(layers.map((layer) => layer.symbol)).size, 6);
  assert.equal(new Set(layers.map((layer) => tr[layer.label])).size, 6);
  const visibility = { ...initialLayers, culture: false };
  assert.ok(visibility.state && visibility.person && visibility.war && visibility.event);
  assert.equal(initialLayers.culture, true);
});
function luminance(hex) {
  const c = hex
    .slice(1)
    .match(/../g)
    .map((part) => {
      const x = parseInt(part, 16) / 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
test('katman işaretleri panel zemini üzerinde 4.5:1 kontrastı korur', () => {
  for (const layer of layers)
    assert.ok(
      (luminance(layer.color) + 0.05) / (luminance(theme.colors.surface) + 0.05) >= 4.5,
      layer.id,
    );
});
test('katman yardım ve atıf kapsam metinleri güncel katalogla dürüst kalır', () => {
  const help = tr['atlas.layers.help'];
  const status = tr['atlas.attribution.status'];
  assert.doesNotMatch(help, /diğer katmanlar henüz boş|tek bir antlaşma kesiti pilotu/);
  assert.match(help, /siyasi rekonstrüksiyon/);
  assert.match(help, /Kişi/);
  assert.match(help, /savaş\/olay|olay/);
  assert.match(help, /Kültür alanı doğrulanmış değildir/);
  assert.match(help, /konumsuz/);
  assert.match(help, /Güncel şehirler/);
  assert.doesNotMatch(help, /\d[\d.\s]*kişi|\d[\d.\s]*olay/);
  assert.match(status, /kişi ve olay/);
  assert.match(status, /Kültür alanı yok/);
  assert.equal(tr['atlas.search.empty'], tr['search.empty']);
});
