# Tarih Atlası — yerinde ürün iyileştirmesi

16 Ekim 2026 · **IMPLEMENTED / PARTIAL · yayın NO-GO.**
Mevcut Expo uygulaması yerinde değiştirildi. Yeni proje, ikinci harita SDK'sı,
ücretli hizmet, hesap, tarihî veri çizimi veya yayınlama yapılmadı. Kullanıcının
bu görev için verdiği yetkiyle alt adımlar arasında rutin onay beklenmedi.
AGENTS ürün/veri/lisans kuralları korundu.

## Kabul matrisi

| Alan | Durum | Somut sonuç / kanıt |
| --- | --- | --- |
| AUD-01–07 | IMPLEMENTED |7gerçek hata için negatif regresyon: yaklaşık kişi kesin sayılmaz; genel ETL askıyı uygular; yanlış/live Wikidata URL reddi; üst kaynak+ham input closure; kesintili dönem; bozuk yer imi inceleme/onayı; JSON anahtar sırasından bağımsız chunk kapsamı. `tests/unit/rework.test.mjs`. |
| Atlas/Küre | IMPLEMENTED; runtime PARTIAL | Tek MapLibre örneğinde mercator/globe, zoom0–8. Kamera/tarih/katman korunması ve tekrar veri almama renderer testinde; Atlas horizon seçimi/küre arka yüzü ayrı. Web/native aynı çekirdeği kullanır. Gerçek GPU kabulü yapılmadı. |
| Fiziksel ayrıntı | PARTIAL / download BLOCKED |110m kıyı/kara korunur ve ölçek açıklanır. 50m için sabit public-domain kaynak,12MiB/5000feature/200000koordinat, SHA/provenance ve lazy DOM modülü hazır. DNS/EAI_AGAIN;50m paketlenmedi. Ayrıntılı sokak/uydu haritası iddiası yok. |
| Bilgi mimarisi | IMPLEMENTED; görsel NOT TESTED | Üstte arama/Keşfet/katman; harita ana alan; küçük zoom/reset/info/atıf, Atlas/Küre; altta kapsam/yıl. Katalog/paylaşım/yer imi/ayarlar Keşfet'te. Geniş ekranda sağ panel, telefonda sheet. Kamera debug metni kapalı bilgi kontrolünde; sentetik marker opt-in. |
| Kullanıcı akışları | IMPLEMENTED; E2E BLOCKED | Yerel arama, açık tarih tercihi ve odak,6bağımsız katman, kaynak/sitelink, paylaşım, yer imleri korunur. Yeni kayıtta projection; eski kayıt/URL okunur. Kurtarma sessiz veri silmez, inceleme+onay ve eşzamanlı değişiklik kontrolü var. [Akış protokolü](../product-rework-flows.md). |
| Tarihsel doğruluk | IMPLEMENTED sınırlar; içerik PARTIAL |0.4.1-pilot/ETL1.6.0,19kayıt/7kaynak. İki askıdaki geometry artık üretimde null; ham çıkarımlar/ID'ler/kanıt korunur. Kapsam4026yıl; coğrafya1066/1867, desteklenmeyen4024. Tam siyasi polygon0/kültür0; kesin geometri yılı0. [Sayım](product-rework-coverage.json). |
| Güvenlik | PARTIAL / NO-GO | Worker opsiyonel eval fallback AST ile kapatıldı; parser/hash/NOTICE ve yürütme negatif testi. [Taramada](product-rework-security.json) doğrudan dynamic sink0. Ham Expo DOM parse/dispatch, gerçek CSP/origin ve bağımlılık kapıları açık. |
| Responsive/a11y | PARTIAL / gerçek platform NOT TESTED |48birim isimli simgeler, görünür odak/selected state, Türkçe katalog, safe area, kısa landscape düzeni, daraltılabilir tarih araçları, reduced motion yolu korundu. Büyük yazı/TalkBack/gerçek klavye odağı/kontrast görsel kabulü yok. |
| Lisans | PARTIAL / dağıtım onayı yok | Yeni dış bağımlılık veya belirsiz veri yok; Natural Earth/MapLibre/font/kişi NOTICE güncel. Historical Basemaps BLOCKED FOR REDISTRIBUTION; OHM hak onaysız dışarıda. [873lock kaydı envanteri](product-rework-dependency-licenses.json) tam transitif dağıtım onayı değildir. |

## Test ve komut kanıtı

Aşağıdaki loglar gerçekten çalıştırılan komutlardan kopyalanır; test listelemek
çalıştırmak sayılmaz. Son kaynak revizyonu için yenilenen toplu kapı esastır.

| Komut | Sonuç | Kanıt |
| --- | --- | --- |
| `npm run check` | PASS; lint0uyarı, strict native+web TS,249ana+5worker test, asset/pilot/sitelink/chunk/hash/formatter | [Toplu log](product-rework-check.log) |
| `npm run basemap:check` | Çıkış0 ama **PARTIAL**,50m yokluğu açık;110m hash kontrolü ayrı PASS | Toplu log |
| `npm run web:export` | PASS;4statik rota, MapLibre ve detail modülü split chunk | [Web export](product-rework-web-export.log) |
| `npm run android:bundle` | PASS; Hermes+DOM JavaScript; APK/native build değildir | [Android JS export](product-rework-android-export.log) |
| `npm run test:web -- --list` | PASS;84senaryo/13dosya listelendi; koşu başarısı değil | [Liste](product-rework-web-list.log) |
| `timeout 30s npm run test:web -- tests/web/product-rework.spec.ts --project=desktop --workers=1` | BLOCKED; exit124, sunucu/ortam başlangıcı;0tamamlanan browser senaryosu | [Koşu](product-rework-browser.log), [loopback EPERM](product-rework-loopback.log) |
| Gerçek `chromium.launch` | BLOCKED; sandbox_host_linux Operation not permitted | [Başlatma logu](product-rework-browser-launch.log) |
| `npm run environment:check` | Node26/npm12/lock PASS; Java/adb/SDK yok | [Ortam](product-rework-environment.log) |
| `npm run basemap:prepare` | BLOCKED; EAI_AGAIN;50m veri paketi üretilmedi | [İndirme](product-rework-basemap.log) |
| `npm audit --json` | BLOCKED; EAI_AGAIN; temiz audit iddiası yok | [JSON](product-rework-npm.json), [stderr](product-rework-npm.log) |
| `node scripts/qa/coverage.mjs ...` / `security.mjs ...` | PASS araç çalışması; sayım ve açık ham DOM engeli kaydedildi | Yukarıdaki JSON'lar; eksiksiz tarihsel doğruluk/güvenlik garantisi değil |
| `node --expose-gc scripts/performance/host.mjs ...` | PASS;6CPUişyükü,1000zaman sorgusu, cache sınırları kaydı | [Host ölçümü](product-rework-host.json) |
| `node scripts/performance/sizes.mjs ...` | Disk/gzip/brotli export ölçümü; gerçek aktarım/APK boyutu değil | [Boyutlar](product-rework-sizes.json) |

Host ölçümünde cache32girdi, chunk raw bellek27681byte, bounded metric120örnek;
bu ölçüm GPU sızıntısı yokluğu veya Android performansı anlamına gelmez. Browser
başlangıcı/FPS/dokunma gecikmesi/pil/ısı/PSS ölçülmedi.

**Ekran görüntüleri: NOT TESTED / üretilmedi.** Yeni `product-rework.spec.ts`
gerçek renderer ve320×568/800×360/1920×1080 görüntü ekleri alacak şekilde hazır;
engelli browser çalışmış gibi PNG/mockup üretilmedi. Mevcut snapshot kabul
beklentileri kaldırılmadı. Küçük landscape harita alt sınırı fiziksel alanla
uyumlu120, diğer dar düzen160; genişlik ve taşmama kontrolleri eklendi. Gerçek
piksel sonucu tarayıcı koşusuyla kabul edilmelidir.

## Değişen dosyalar

- Ürün: `src/atlas/AtlasScreen.tsx`, `AppHeader.tsx`, `Action.tsx`, `MapControls.tsx`,
  `TimelineBar.tsx`, `PlaybackControls.tsx`, `EntitySheet.tsx`, `BookmarksPanel.tsx`,
  `ViewPreview.tsx`; `src/i18n/tr.ts`.
- Harita: `src/map-contract/protocol.ts`, `viewport.ts`, `src/map/useGlobeHost.ts`,
  `ViewportFrame.tsx`, `src/map/globe/renderer.ts`, `person-markers.ts`,
  `political-labels.ts`, `GlobeView.tsx`, `land.ts`; generated `detail-land.ts`,
  `detail-status.ts`, `worker-source.ts`, `notices.ts` ve globe provenance/bildirimleri.
- Doğruluk/veri: `src/timeline/engine.ts`, `src/domain/source-url.ts`,
  `src/discovery/bookmarks.ts`, `view.ts`, `src/data/pilot-contract.ts`,
  `src/data/chunks/manifest.ts`, `src/data/generated/pilot.ts`; üretim
  `data/pilot/production/*`, `public/data/chunks/*`, hash adlı generated lazy
  chunk modülleri ve `public/_headers` yeniden üretildi.
- Hazırlama/QA: `scripts/etl/pipeline.mjs`, `scripts/pilot/build.mjs`, `cli.mjs`,
  `scripts/chunks.mjs`, `scripts/prepare-detail-land.mjs`, `prepare-globe-assets.mjs`,
  `check-globe-assets.mjs`, `scripts/globe/validate-worker.mjs`,
  `scripts/qa/security.mjs`, `package.json`; `assets/licenses/Wikidata-person-NOTICE.txt`.
- Test: `tests/run.mjs`, `tests/unit/rework.test.mjs`, `renderer.test.mjs`,
  `worker.test.mjs`, `globe.test.mjs`, `discovery.test.mjs`, `persons.test.mjs`,
  `politics.test.mjs`, `sources.test.mjs`, `release-audit.test.mjs`;
  `tests/web/menu.ts`, `product-rework.spec.ts` ve eski akışların yeni menü yolu/
  açık Küre seçimi/isteğe bağlı demo/gelişmiş timeline girişlerini kullanan
  web testleri. Beklentiler yeni gerçek davranışa göre güncellendi, testler silinmedi.
- Belgeler: `README.md`, `docs/progress.md`, `product-requirements.md`,
  `architecture.md`, `data-quality.md`, `license-register.md`, `release-blockers.md`,
  `reference-review.md`, `product-rework-flows.md`, `adr/0018-atlas-product-rework.md`,
  bu rapor ve bağlı kanıt dosyaları.

`git status` bu ortamda “not a git repository” dönüyor; bu nedenle Git diff,
commit veya kullanıcının değişikliklerinden Git düzeyinde ayrılmış değişiklik
listesi iddia edilmez. Var olan dosyalar yerinde incelenip hedefli düzenlendi;
ham veri, kilit dosyası, kaynak kimlikleri korunur. Sadece üreticiye ait hash
adlı chunk çıktıları yeni katalog sürümüyle yeniden üretildi. Geniş reset/silme
ve kullanıcı verisi migration'ı yapılmadı.

## Kalan yayın önkoşulları

1. Ağ erişiminde50m hazırlama/hash/export ve gerçek web/Android GPU/bellek incelemesi.
2.84browser senaryosu; gerçek görüntüler ve insan kontrollü baseline. TalkBack,
   büyük yazı, klavye/focus, landscape ve panel/map kullanımının kabulü.
3.Android fiziksel cihaz debug/release: pinch/rotate/back/arka plan/ağ kesintisi/
   dış tarayıcı dönüşü. **UNVERIFIED ON DEVICE.**
4.Ham Expo DOM taşımada parse öncesi limit/şema/dispatch güvencesi; yayın CSP ve
   file bootstrap origin/session kanıtı. Mimariyi bütünüyle değiştiren riskli
   taşıma göçü bu görevde sessizce yapılmadı.
5.Güncel ağlı bağımlılık audit'i ve tam web/APK NOTICE incelemesi; kaynak
   zincirinin özgün API revizyonları; lisanslı gerçek siyasi/kültür pilotları.

Bu koşullar sağlanmadan üretim onayı verilmez. [Yayın engelleri](../release-blockers.md).
