# Faz15 — Önbellek, yükleme, büyük veri ve performans

2026-10-16 · **CODE / LICENSE GATES / AUTOMATED TESTS / HOST MEASUREMENTS /
WEB+ANDROID JS EXPORT PASS**. Kısıtlı ağda gerçek web kabulü **BLOCKED**;
Android performans/lifecycle kabulü **UNVERIFIED ON DEVICE**.

AGENTS.md, README, docs/progress.md, Faz14 raporu/ADR, kaynak manifestleri,
provider/timeline/globe/bridge ve mevcut depolar incelendi. Koddan önce
[ADR-0016](../adr/0016-bounded-data-loading.md) yazıldı. Kullanıcının Faz15 promptu
önceki roadmap önerisinin yerine geçti; Faz16 başlamadı. Yeni dış paket veya
büyük veri indirmesi yapılmadı.

## Teslim ve kabul matrisi

| İstek | Sonuç / sınır |
| --- | --- |
| 1. Bölge/yıl/LOD keşfi | PASS: bbox/temporal/record/LOD/release manifestinden6 girdi,4 küçük içerik; başlangıç yılı destek istemiyorsa parça açılmaz. Native yeni API servisi kurulmadı; izinli paketli pilot ve cache kullanılır |
| 2. Büyük geometriyi belleğe yığmama | Pilot için bounded parçalama/parse/cache PASS; senkron19 kayıtlı bootstrap96KiB kapısıyla korunur. Tam büyük dünya metadata sağlayıcısına göç **BLOCKED / GELECEK ÖNKOŞUL**. Genel polygon/vector tile sadeleştirmesi uygulanmadı; doğruluk riskleri rehberde |
| 3. Ayrı hak/cache politikaları | PASS: tarih katalog, incelenmiş CC0 açıklama/sitelink, paketli fiziksel stil/worker ve devre dışı dış tile ayrı. Makale/Commons/tile otomatik indirilmez |
| 4. HTTP/native kota/LRU | CODE/UNIT PASS: hash URL immutable, manifest no-cache örneği; web CacheStorage, native özel cache dosyası;2MiB/32 disk ve512KiB/8 raw bellek. Tek runtime seri LRU, restart yaklaşık disk erişim sırası. Gerçek host header/disk baskısı ve çok sekmeli ortak transaction kabulü açık |
| 5. Eski yanıt iptali | PASS: AbortController, timeout, sınırlı kuyruk, en güncel revision/requestId ve ACK; eski veri yeni yıla uygulanmaz. İptal edilmiş ama doğrulanmış immutable cache yazısı kalabilir |
| 6. Offline yüklenmiş izinli veri | CORE/HOST TEST PASS: cache kaynak/sürüm bildirimi, bozuk içerik onarımı, paketli fallback. Gerçek browser/Android uçak modu kabulü BLOCKED. Service Worker/cold web offline ve native HTTP origin yok; tamamen offline iddiası yok |
| 7. Profiling | CODE/HOST CPU PASS: bounded local counters, render/setData, marker/label CPU/rebuild, React render/bridge ve cache/DOM sayıları. Gerçek render loop/FPS/GPU heap **BLOCKED**; uydurma sayı verilmedi |
| 8. Bridge trafiği | PASS: geometri/manifest cache gövdeleri native bridge'den geçmez. Aynı kamera callback'i elenir; mevcut8 event kuyruğu/coalescing/4KiB şema sürer. Veri hatası ve retry küçük version1 zarflarıdır |
| 9. Android gerçek cihaz senaryoları | **UNVERIFIED ON DEVICE**: adb/java/SDK yok; [cihaz notları](phase-15-device.md) ve read-only ölçüm scripti hazır, snapshot[] boş |
| 10. Web tekrar ölçümü | Script/export boyut ölçümü PASS; gerçek başlangıç/globe-ready/layer gecikmesi/1Mbps ağı **BLOCKED**: localhost4173 EPERM. [Web raporunda](phase-15-web-benchmark.json) measurements[] boş |
| 11. Pil/ısı/background | CODE/UNIT PASS: odağı kaybedince sorgu+oynatma iptali, DOM görünmezken stop/abort/cache clear, native mevcut unmount; gerçek pil/ısı ölçümü **UNVERIFIED ON DEVICE** |
| 12. Kurtarma | PASS: read/quota/hash/schema/license/version hatası, temp temizliği, revokasyon/manifest dışı cache purge, retry. Bir geometri parçası başarısızsa görünüm atomik reddedilir; başarılı parçalar cache'de kalır ve fiziksel küre kullanılabilir |
| 13. Bilinmeyen hakları engelleme | PASS: üretim validateCatalog/atıf/source+input+revision+manuel onay, sonra trusted manifest/hash gate. Historical Basemaps ve bilinmeyen lisans cache/üretimden reddedilir |
| Kısıtlı ağda temel ekran kullanılabilir | Kontrollü ağ hata/timeout/fallback testleri PASS; gerçek ağ/GPU kabulü **BLOCKED** |
| Cache kaynak bilgisi okunur | CODE/UNIT PASS; UI kaynak türü+katalog sürümü, kaynak kartları doğrudan provenance taşır; gerçek browser/device kontrolü açık |
| Biriken bellek/perf için ölçüm ve iyileştirme | Host6 tur heap/RSS/cache,1000 sentetik yoğunluk CPU ve marker cleanup/regresyon PASS. Gerçek Android sızıntı/GPU kabulü **BLOCKED**; sınırsız bellek artışı yok diye genellenmez |

[Uygulama, politika, ölçüm komutları ve ayrıntılı sınırlar](../performance.md).

## Otomatik doğrulama ve platformlar

- `npm run check`: **233/233 ana +4/4 worker**, lint0 uyarı, strict native+web TS,
  formatter; physical land/worker, pilot/LOD/kapsama, sitelink ve yeni
  chunk manifest/hash/lisans kontrolleri PASS. [Çıktı](phase-15-validation.log).
-19 ek test: SHA256 standart/UTF8/boundary karşılaştırması, bölge/yıl/LOD/snapshot,
  deterministic provenance bağımlılıkları, lisans/atıf/review/version reddi,
  LRU/kota/corruption/reopen, native adaptör gerçek host disk, web CacheStorage
  double, bounded concurrency/abort/timeout/429/404, eski release purge, offline
  kaynak/sürüm, gerçek DOM feature LOD, data retry, marker cleanup ve background
  latest-year. Bu double/host testleri GPU veya Android cihaz kanıtı değildir.
- Web export4 route PASS. [Log](phase-15-web-export.log).
- Android Hermes + ortak DOM export PASS; Gradle/APK değildir.
  [Log](phase-15-android-export.log).
- Playwright **74 senaryo /11 dosya** listelendi;3 yeni yükleme/cache/stale
  etkileşimi desktop+narrow. [Liste](phase-15-browser-list.log).
 20s çalışma denemesi exit124; etkileşim testleri başlayamadı, PASS yok.
  [Deneme](phase-15-browser-run.log). Production benchmark anında
  `listen EPERM 127.0.0.1:4173`: [makine raporu](phase-15-web-benchmark.json).
- Node26.11.1/npm12.2.0/lock PASS; java/adb ENOENT ve SDK yok.
  [Ortam](phase-15-environment.log). Android ölçüm komutu exit1, snapshot[] boş:
  [makine durumu](phase-15-android-measurement.json).

İlk turda Node erasable TS parametre özelliği, explicit `.ts` dynamic import ve
eski test double'ın kamera metotları giderildi; aynı etiket refresh'inin yeniden
marker kurmasını bekleyen test yeni davranışı sınayacak şekilde değişti. Bunlar
son geçerli test/export turunda açık hata değildir.

## Ölçülmüş sonuçlar

Aşağıdaki host ve boyut tabloları ham JSON'lardan üretilir; mobil FPS/süre hedefi
olarak kullanılamaz. Raporun sonunda gerçek sayı ve inceleme eşikleri vardır.

## Veri/hak ve değişiklik kapsamı

Ana tarihî katalog **0.4.0-pilot /19 kayıt /7 kaynak /aynı SHA**; link1.0.0 ve
Natural Earth fiziksel127 feature/5143 koordinat değişmedi. Yeni kaynak tarihi,
kişi konumu, polygon/kültür alanı veya yer etiketi yok. Dört dosya mevcut üç
harita kökünün bağımlılıklarıyla yeniden paketlenmesidir. Açık olmayan veri/tile
indirilmedi. NARA manuel olgu onayı ve Wikidata CC0; kendi provenance/atıfları
parçada, tam bildirim `public/data/chunks/NOTICE.txt` içinde. Historical Basemaps
**BLOCKED FOR REDISTRIBUTION**. FileSystem57.0.7 MIT tekrar kullanıldı; yeni
bağımlılık yok. [Sicil](../license-register.md).

[Değişen dosya listesi](phase-15-files.txt): chunk model/build/generated/public,
platform cache ve runtime/loader, ortak DOM LOD, timeline yükleme/background,
renderer/marker/bridge/küçük UI hata+durum, ölçüm scriptleri, testler/TR ve docs.
Git metadata bu ortamda repository sunmuyor; commit/diff üretilemedi.

## Açık kapılar ve sonraki faz önkoşulları

Bu fazdaki kaynak teslimi kabulün gerçek ağ/cihaz kısmını kapatmaz. Gerçek
Chromium/WebGL ile benchmark, host HTTP header kontrolü, Android cihaz/ısı/pil/
PSS/lifecycle testleri, büyük geometri için metadata sağlayıcı ve çok client
cache kilidi gerekir. A-04 screenshot baseline, raw Expo taşıma/origin/CSP,
temiz CI/Node24, güncel online audit ve tam transitif NOTICE açık kalır.
Önceki29 audit bulgusu yeni online taramayla kapanmış sayılmadı. Yeni faz için
kullanıcı isteği gerekir; **Faz16'ya otomatik geçilmedi**.

## Host CPU baseline ve inceleme hedefi

Ölçüm: `2026-10-16T10:49:45.843Z`, v26.11.1 / linux-x64 / AMD Ryzen 7 8845HS w/ Radeon 780M Graphics. `--expose-gc`;30 cold,200 warm,1000 zaman sorgusu,100 yoğunluk tekrar.

| İş yükü | Medyan ms | p95 ms | Aynı hostta inceleme eşiği (2×p95) ms |
| --- | --- | --- | --- |
| Paketli parça doğrulama+parse (cold, bellek adaptörü) | 1.0597 | 1.2910 | 2.5819 |
| Açık bellekte parça doğrulama+parse | 0.3804 | 0.6516 | 1.3032 |
| Zaman sorgusu (8 seçili yıl) | 0.0050 | 0.0112 | 0.0224 |
| Tarihî feature oluşturma | 0.0169 | 0.0361 | 0.0721 |
| SENTETİK1000 marker kümeleme CPU | 0.2545 | 0.4105 | 0.8209 |
| SENTETİK1000 etiket collision CPU | 0.0637 | 0.1720 | 0.3439 |

Altı tur GC sonrası heap 11,632,552→11,680,552 byte; RSS 122,544,128→138,268,672 byte. Kalan raw chunk bellek 42,263 byte /4 içerik, timeline LRU32, diagnostics ring120 örnek. Virgüller binlik ayırıcıdır.

Bu kısa koşuda cache girişleri sınırda kaldı; RSS artışı da raporlandı. Altı örnek heap/RSS, sızıntı yoktur kanıtı değildir. Eşikler yalnız aynı makine/koşul karşılaştırması için inceleme tetikleyicisidir; cihaz veya web hedefi olarak doğrulanmadı. Gerçek FPS/GPU/PSS/pil/ısı sayısı yoktur. [Ham JSON](phase-15-host-benchmark.json).

## Son export dosya boyutları

Ölçüm: `2026-10-16T10:51:36.893Z`; yerel dosya ve yerel gzip/brotli, gerçek ağ transferi veya APK boyutu değildir.

| Çıktı | Dosya | Toplam byte |
| --- | --- | --- |
| dist | 39 | 3,709,782 |
| dist-android | 45 | 7,214,246 |
| public/data/chunks | 6 | 52,723 |

Web ana entry 2,325,912 byte; yerel gzip 615,993, brotli 479,823 byte. MapLibre ayrı async export olarak kalır; küçük fallback parçaları da ayrı web dosyalarıdır. Bunlar ilk görüntünün mutlaka bu kadar transfer ettiği iddiası değildir; [dosya listesi](phase-15-package-sizes.json) her hash ve ölçümü taşır.

Web/Android boyutu metadata/güvenlik/cache koduyla artabilir; bu fazda runtime hızlandı sonucuna bundle byte ölçümünden gidilmez. Başlangıç süresi ve katman gecikmesi benchmarkı EPERM nedeniyle ölçülemedi.
