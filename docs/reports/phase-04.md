# Faz 04 — Tarihî veri şeması ve kaynak kataloğu

2026-10-15 · **COMPLETE — DOMAIN / ETL SCOPE**.
Kullanıcı son Faz 04 promptuyla çalışmayı açıkça yetkilendirdi. Eski yol haritası
03/04 başlıkları bu tanımla uyumlu hale getirildi; önceki fazların açık Android/
erişilebilirlik/runtime kapıları kapatılmadı. Faz 05 başlatılmadı.

## Sonuç ve kabul kriterleri

| Kabul | Kanıt |
| --- | --- |
| İzin verilmeyen/atıfsız kayıt üretime giremez | `tests/unit/etl.test.mjs`: sentetik, atıfsız, Historical Basemaps, izin dışı hak ve incelemesiz adaylarda CLI build reddedilir, üretim dizini yok |
| Kaynak ve tarih belirsizliği kaybolmaz | `tests/unit/domain.test.mjs`, `etl.test.mjs`: sourceDate/takvim/numaralama/uncertain, locator, source revision, raw SHA, observed/derived ve dönüşümler aynen korunur |
| Ortak şemalar ve doğrulayıcılar | 11 istenen domain tipi, GeoJSON türleri, runtime yapısal/semantik/referans/temporal kontroller; native/web strict TS ve negatif tip testleri |
| Üretim olmayan hipotezler | Unverified/staging kayıt üretime alınmaz; staging validate çıktısı productionApproved=false |
| Büyük veri indirilmemesi | Yeni ağ/ETL fetch yolu yok; yalnız resmi belgeler okundu. Gerçek tarihî üretim kaydı 0, uygulama kataloğu değişmedi |

## Uygulananlar

- Kalıcı kimlik, dil kodlu adlar/alternatifler, QID, atıf/lisans, validity/precision,
  kaynak tarihi, kalite/review ve evidence zinciri olan ortak tipler.
- Siyaset/kültür ve yaşam yeri/tarihli kişi bulunması ayrı sınıflar. Tarih sıfırı,
  takvim günü, incelemesiz kesinlik, aynı yorumda çakışan sınır sürümleri kontrolü.
- CRS84 `[lon,lat]`, Point/LineString/Polygon/MultiPolygon/FeatureCollection;
  halkalar/delikler/örtüşme/antimeridyen ve detay bütçesi için hata raporları.
- Varsayılan ret lisans politikası; allowlist, manual-review, disallowed kaynaklar;
  onaylı üst kaynak zinciri, OHM license=* ve Wikimedia hak alanı ayrımı. Conditional
  manualApprovals boş, Historical Basemaps **BLOCKED FOR REDISTRIBUTION**.
- Ham/staging/üretim ayrımı; değişmez raw byte/SHA, sürümlü dönüşüm, canonical JSON
  ve sürüm/hash manifesti. Yerel bounded CLI atomik dosya yazar; veri indirmez ve
  ürüne otomatik import/yayın yapmaz. Doğrulanan aday async okumadan önce kopyalanır;
  çağıranın sonradan mutasyonu üretim kontrolünü aşamaz.
- HistoricalDataProvider: getById/getSource/query; zaman ve grid/bbox indeksleri,
  belirsizlik etiketi, biyografik yerlerin yıllık konum filtresinden ayrı tutulması,
  sayfalama, değişmez snapshot ve hash doğrulamalı yükleme giriş noktası.
- Yeni dış paket yok; TypeScript/Node yerleşik araçları kullanıldı. Node kripto ve
  dosya işlemleri ETL ile sınırlı; ortak sağlayıcı TextEncoder varsayımı yapmaz.

## Çalıştırılan doğrulamalar

| Kontrol | Sonuç |
| --- | --- |
| `npm run check` | **PASS**: lint 0 uyarı, native/web strict typecheck, **35/35** ana + **4/4** worker, asset/NOTICE bütünlüğü, format |
| Domain/ETL yeni senaryolar | **16 yeni test**; önceki 19 ana test de PASS. MÖ/MS, geometri ve bütçe, hak/semantik/provenance, indeks, UTF-8/hash, dosya sınırı, atomik/deterministik CLI |
| `npm run etl -- validate --input data/staging/catalog.json` | PASS — valid-staging-only, productionApproved=false, 0 kayıt |
| `npm run etl -- build --input data/staging/catalog.json --output /tmp/tarih-atlasi-phase04-empty` | PASS — 0 kayıt, `0.0.0-empty-ff156b9283c3/`; manifest SHA tam katalog byte'larıyla eşleşiyor |
| `npm run web:export` | PASS — 4 statik rota, entry ~2 MB, MapLibre ~1.1 MB, marker CSS 83 byte. Yeni domain UI'ye bağlanmadı; önceki globe bundle korunuyor |
| `npm run android:bundle` | PASS — Android Hermes ~2.8 MB, DOM/CSS/worker paketleri. **JS/asset export**, APK/Gradle/cihaz testi değil |
| Playwright/live tarayıcı | Bu fazda tekrar çalıştırılmadı; önceki ortam sandbox/socket engeli açık. Yeni UI testi eklenmedi |
| Fiziksel Android / GPU / bellek / touch | **UNVERIFIED ON DEVICE**; başarı/performance iddiası yok |

[Kalite komut kaydı](phase-04-validation.txt). Expo export boyutları CLI yuvarlamasıdır;
gzip/indirme/APK ölçümü değildir. Node 26.11.1/npm 12.2.0 ile çalıştırıldı;
CI'nin Node 24 işi GitHub üzerinde çalıştırılmadı. Mevcut unit/quality CI yeni
testleri `tests/run.mjs` üzerinden otomatik kapsar; yeşil GitHub CI iddiası yoktur.

## Dosyalar ve lisans

[Değişen dosya listesi](phase-04-files.txt). Başlıca modüller src/domain, provider/
source-manifest, scripts/etl; raw/staging/production dizinleri; sentetik fixture ve
domain/ETL/tip testleri; package.json etl komutu, README, model/ADR/ilerleme/yol
haritası ve kaynak/lisans/risk belgeleri. Lock ve mevcut globe/UI değiştirilmedi.
Bu fazda dış veri/kod/font/görsel/tile kopyalanmadı. Kaynak lisans manifesti
araştırma/politika metadata'sıdır, geometrilerin dağıtım onayı değildir.

## Riskler ve sonraki faz önkoşulları

- Şema ve checksum bilimsel doğruluk/özgünlük kanıtı değildir. Gerçek pilot için
  yayıncı/revizyon/ham dosya, locator ve hak zinciri insan tarafından doğrulanmalı.
- Topoloji konservatif, bounded ve düzlemseldir; sferik/kutup/büyük detay için ileri
  doğrulama gerekebilir. Kendiliğinden coğrafya/tarih düzeltmesi yapılmaz.
- Farklı lisans yükümlülükleri v1'de otomatik birleştirilmez; conditional onaylar
  boş. Historical Basemaps ve mevcut audit açıkları devam eder.
- Sağlayıcı küçük statik katalog içindir; grid bbox aday filtresidir. Büyük veri/
  shard/cache/backend, takvim adaptörleri ve gerçek içerik bu fazda uygulanmadı.
- Önceki Android debug/release, offline, WebGL/touch/back/rotation/performans ve
  Faz 03 erişilebilirlik kabulü açık kalır; bu faz bunların yerine geçmez.

[Geliştirici rehberi](../data-model.md), [ADR-0005](../adr/0005-historical-catalog-schema.md),
[güncel durum](../progress.md). Sonraki faz ancak kullanıcı talebiyle başlar.
