import assert from 'node:assert/strict';
import { test } from 'node:test';

import { catalogSummary } from '../../src/data/catalog.ts';
import { locale, t } from '../../src/i18n/index.ts';
import { tr } from '../../src/i18n/tr.ts';
import { theme } from '../../src/theme/tokens.ts';

test('başlangıç kataloğu kaynaklı geometri pilotunu teknik kayıt sayısından ayırır', () => {
  assert.equal(catalogSummary.state, 'partial');
  assert.equal(catalogSummary.recordCount, 33);
  assert.equal(catalogSummary.catalogRecordCount, 106);
  assert.throws(() => {
    catalogSummary.recordCount = 10;
  }, TypeError);
});

test('ilk dil Türkçedir; uygulama metinleri anahtar yerine görünür metin döndürür', () => {
  assert.equal(locale, 'tr');
  assert.equal(t('app.name'), 'Tarih Atlası');
  for (const [key, value] of Object.entries(tr)) {
    assert.equal(value.trim(), value, key);
    assert.ok(value.length > 0, key);
    assert.equal(t(key), value);
  }
});

test('prototip ve boş veri metinleri doğrulanmamış tarihî iddia taşımaz', () => {
  assert.match(t('globe.demo.detail'), /Sentetik test işareti/u);
  assert.match(t('globe.demo.detail'), /Tarihî kişi, olay veya yer kaydı değildir/u);
  assert.match(t('globe.fallback'), /Haritasız görünüm/u);
  assert.match(t('home.scope.description'), /eksiksiz tarihî veri iddiası yoktur/u);
  assert.match(t('state.empty.description'), /Bu seçim için/u);
});

test('hata, boş ve yükleme durumlarının farklı başlıkları vardır', () => {
  const titles = ['error', 'empty', 'loading'].map((state) => t(`state.${state}.title`));
  assert.equal(new Set(titles).size, 3);
  assert.equal(t('state.error.retry'), 'Yeniden dene');
});

function luminance(hex) {
  const linear = hex
    .slice(1)
    .match(/../g)
    .map((part) => {
      const value = Number.parseInt(part, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

test('tema metin ve düğme renkleri en az 4.5:1 kontrast sağlar', () => {
  const { colors } = theme;
  for (const [foreground, background] of [
    [colors.text, colors.background],
    [colors.text, colors.surface],
    [colors.muted, colors.background],
    [colors.muted, colors.surface],
    [colors.accent, colors.background],
    [colors.onAccent, colors.accent],
  ]) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)}`);
  }
  assert.ok(theme.layout.minTouchTarget >= 44);
});
