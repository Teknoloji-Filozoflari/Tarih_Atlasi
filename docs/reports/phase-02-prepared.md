# Faz 02 — Kilitli kurulum ve gerçek fiziksel varlıkların doğrulanması

Sonraki takip: [kullanıcının web etkileşim denemesi ve arka yüz işareti düzeltmesi](phase-02-marker-occlusion.md).
Aşağıdaki sonuçlar varlık hazırlama anının kaydıdır.

2026-10-15 · Kullanıcı `npm ci` ve `npm run globe:prepare` komutlarını host
terminalinde başarıyla çalıştırdı. **Kurulum, fiziksel asset ve statik derleme
kapıları ilerledi; gerçek web/küre ve Android cihaz kabulü hâlâ BLOCKED.**
Android **UNVERIFIED ON DEVICE**. Sonraki faz başlatılmadı.

## Tamamlananlar

- Kurulu Reanimated **4.5.1**, Worklets **0.10.1**; peer çakışması yok. Expo'nun
  offline install --check kontrolü “Dependencies are up to date” diyor; ağ tabanlı
  güncellik garantisi değil, kurulu SDK matrisiyle uyum kanıtı.
- [Doğrudan hedef paketler](phase-02-prepared-dependencies.json) **23/23 eşleşiyor**.
  Bu, bütün transitif lisans/güvenlik denetimi veya paket boyutu bütçesi değildir.
- Gerçek Natural Earth **v5.1.2 ne_110m_land** indirildi: **138160 byte**, 127
  fiziksel kara feature'ı, **5143 koordinat**. Özellikler atıldı; siyasi ad/sınır
  alınmadı. Güncel kaba kıyı referansı; MÖ kıyı rekonstrüksiyonu değil. Tarihî katalog 0.
- Gerçek MapLibre **6.14.0** worker'ı: orijinal **508314 byte**, hazırlanmış
  **654885 byte**; iki opsiyonel dynamic import kapatıldı. Statik bağımlılık ve
  kalan import şema/AST kontrolü sürer. GPU veya native file-origin kanıtı değildir.
- MapLibre BSD, Natural Earth public-domain atfı, Router transitif Material Symbols
  font Apache-2.0 + wrapper MIT metinleri hem yerel license dosyalarında hem iki
  platformun kullandığı generated NOTICE modülünde korunuyor.
- `globe:check` gerçek kaynak/çıktı/worker hash'lerini, kurulu renderer sürümünü,
  dönüşüm sayısını, kaynak geometrisinden üretilen bundle'ın eşleşmesini ve bildirimi
  denetler; genel check içine alındı. Veriyi güvenilir asıl kaynaktan bağımsız olarak
  tekrar imzalayan bir doğrulama değildir.

## Bu turdaki kod düzeltmesi

Hazırlama komutu üç TS modülünü biçimsiz yazdığı için formatter kapısı takıldı.
Mevcut Prettier aracı hazırlama adımına eklendi. Proje yolundaki Türkçe `ı` nedeniyle
URL.pathname ile config çözümleme doğru değildi; `fileURLToPath` kullanıldı.
Doğrulanmış yerel cache ile bu ortamda tekrar globe:prepare **PASS**, ardından
**tam npm run check PASS**. Yeni dış paket eklenmedi.

Kontroller: lint 0 uyarı, native+web strict typecheck, 18/18 ana + 4/4 worker testi,
asset/atıf bütünlüğü, format PASS. Gerçek asset ile Metro web ve Android+DOM JS
export'ları tekrar alındı. Bu çıktılar APK veya gerçek ekran gösterimi değildir.
[Komut kaydı](phase-02-prepared-validation.txt).

## Gerçek asset kaydı

[Provenance manifesti](../../assets/licenses/globe-provenance.json): kaynak URL'si,
sürüm, lisans, tarih, ham ve dönüştürülmüş SHA-256, worker dönüşümü, boyutlar ve
bildirim hash'i. Manifest kaynak/version ve cache hash'i eşleşmeden cache kullanılmaz.
Önceki “null / 0 fiziksel geometri” kayıtları tarihîdir; bugünkü generated modüller
gerçek veriyi içerir. Hiçbir tarihî olay/kişi/siyasi geometri eklenmedi.

## Açık işler

- Tarayıcı/live smoke: Chromium launch `sandbox_host_linux.cc` → `shutdown:
  Operation not permitted`; yerel sunucu socket'i de önceki kontrolde EPERM.
  **BLOCKED**. Ekran görüntüsü/snapshot veya gerçek WebGL küre başarısı üretilmedi.
- Android JDK/SDK/adb/fiziksel cihaz, dokunma/rotation/back/context/latency/PSS:
  **UNVERIFIED ON DEVICE**. JS export bunların yerine sayılmadı.
- Gerçek audit dosyası artık var: **29 etkilenen paket kaydı, dört temel advisory**.
  [Güvenlik incelemesi](../security-review.md). Hepsi açık; sayı düşürmek için
  Expo44/RN0.72'ye force downgrade uygulanmadı. Major SDK göçü başlatılmadı.
- Full transitif NOTICE, bundle gzip bütçeleri, APK boyutu ve üretim CSP/file-origin
  davranışı ayrıca incelenecek; bu kayıt dağıtım onayı değildir.

## Değişen dosyalar

scripts/prepare-globe-assets.mjs; yeni scripts/check-globe-assets.mjs;
package.json check komutu; src/map/globe/generated/{physical-land,worker-source,notices}.ts,
aynı dizindeki orijinal Natural Earth cache dosyası; assets/licenses provenance ve
MapLibre/Natural Earth/Material Symbols metinleri; docs/security-review.md,
ilerleme/lisans/kaynak/ADR/risk/prototip/README ve bu takip raporları.
Kullanıcının package-lock/npm-audit dosyaları korundu. Kaynak lisansları ayrı;
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** sürer.

Sonraki teknik adım kullanıcının normal terminalinde `npm run web` ile gerçek
küre, reset ve marker→panel davranışını görmek; ardından web smoke ve gerçek
Android matrisi. Bunun için yeni faz açılması gerekmez; mevcut Faz 02 kabulünü
kapatır. Faz 04 kullanıcı onayı olmadan başlamaz.
