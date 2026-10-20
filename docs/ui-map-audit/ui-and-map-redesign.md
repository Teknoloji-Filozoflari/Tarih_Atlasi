# V3 — harita ve son kullanıcı akışları teslim raporu

16 Ekim 2026 · **IMPLEMENTED / PARTIAL · yayın NO-GO.**
Girdi: kullanıcının `geliştirme.md` dosyası. Mevcut Expo/RN/TypeScript uygulaması
yerinde değiştirildi; yeni örnek proje, ikinci renderer, hesap, ücretli hizmet,
tarihî geometri veya bağımlılık eklenmedi. Eski faz17 yayını başlatılmadı.

## Sorun ve uygulanan değişiklik

[Başlangıç incelemesi](baseline.md) viewport yüksekliği, kaynak geometrisinin
ayrıntısı ve UI hiyerarşisini ayrı teşhis eder. 110m kara kaynağını büyütmek
nehir veya tarihî sınır üretmez. Tarih seçilebilirliği4026yıl olsa da kaynaklı
coğrafya yalnız1066/1867'de vardır; boş yıl tarihsel yokluk değildir.

Üst bar tek satır marka/arama/Atlas–Küre/katman/yer imi/paylaşım/Keşfet düzenidir.
Dar ekranda marka ve üç ana simge kalır; arama klavyeye uygun ayrı panelden
açılır, görünüm seçimi haritada erişilir. Üst bar ile tek timeline dock arasında
esneyen harita kalır. Bilgi ve lisans araçları harita üzerindedir. Örnek yıl,
sentetik marker ve kamera/köprü tanıları `__DEV__` ile geliştiriciye ayrıldı;
üretim menüsü gerçek katalog kayıtlarıyla keşif başlatır.

Seçili varlık geniş ekranda sağda380birim panel, mobilde peek/genişletilebilir
alt panel açar. Bu detay paneli workspace içinde yer alır; üst bar/timeline
örtülmez, panel dışındaki harita etkileşimi devam eder. Arama/ayar/katman gibi
işlem panelleri Modal kalır. Escape/native geri ve odak dönüşü uygulandı;
nonmodal panelde haritaya klavyeyle erişim engellenmez.

Atlas ve Küre aynı MapLibre GL JS6.14.0 nesnesinde projeksiyon değiştirir;
domain/tarih/katman/seçim ortak, yıl değişimi kamerayı sıfırlamaz. Görünüm tercihi
geriye uyumlu version1tercihte saklanır; eski yer imi ve URL biçimleri okunur.
Zoom0–8; Atlas antimeridyen işaretinde yakın dünya kopyası, Küre'de arka yüz
gizleme korunur. Küme tıklaması aday listesini erişilebilir tutarken yakınlaşır;
reduced-motion ile süre0olur. Desktop hover metni kaynak yılını MÖ/MS gösterir.

Arama artık altı gruptur: devlet, kültür, kişi, savaş, olay, yer. Yer kaydı
bulunabilmesi yıllık konum kanıtı sayılmaz; askıdaki Maison konumu null kalır.
Arama odağı kapalı katmanı doğru preference anahtarıyla açar; tarih ancak açık
kullanıcı seçimiyle değişir. Kaynak teknik SHA/yol/ID alanları açılır izlenebilirlik
bölümünde; atıf, lisans, tarih ve belirsizlik kullanıcıya doğrudan açıktır.
Paylaşımda Web Share yoksa clipboard denenir; başarısızlık sessiz değildir.
Bozuk yer iminde kontrollü hata, ham kaydı inceleme ve açık sıfırlama sonrası
yeniden save vardır; otomatik veri kaybı yoktur.

[Referans araştırması](../reference-review.md): Chronas harita yoğunluğu,
GeaCron zaman/coğrafya ve çoklu kayıt türleri, Geographic History arama/timeline
ve sade gezinme için incelendi. Chronas SPA'nın canlı davranışı bu ortamda
doğrulanamadı. Kod, stil, veri, marka veya ekran kopyalanmadı. Sefer/rota için
ayrı kaynaklı veri türü gelecekte değerlendirilebilir; bu göreve ek ürün yapılmadı.

## Faz kabul durumu

| V3 fazı                   | Durum                              | Kanıt / sınır                                                                                                                                        |
| ------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0Baseline                 | **IMPLEMENTED / PARTIAL ölçüm**    | 285kaynak hash, gerçek paket/stil/katalog ve kontrol envanteri. Git ve piksel ölçümü engelli.                                                        |
| 1Bilgi mimarisi           | **IMPLEMENTED**                    | AppHeader, Keşfet, workspace detay paneli, TimelineDock; görsel kabul bekler.                                                                        |
| 2Mobil/tablet             | **IMPLEMENTED / PARTIAL**          | Kompakt header, arama klavyesi, nonmodal sheet, safe-area, kısa ekran/büyük yazı yolu; gerçek cihaz yok.                                             |
| 3Tasarım sistemi          | **IMPLEMENTED / PARTIAL**          | Merkezi renk/durum/spacing/type/radius/control/focus/motion tokenları; hover/pressed/disabled/selected/tooltip. Gerçek ekran incelemesi yok.         |
| 4Atlas/Küre ve ayrıntı    | **PARTIAL / BLOCKED veri**         | Ortak projeksiyon/kamera, seçme/küme/hover/cleanup kodu ve double testleri.50m indirme DNS engelli; nehir/göl/relief yok.                            |
| 5Arama/keşif              | **IMPLEMENTED / PARTIAL E2E**      | 9canonical kayıt/6grup; explicit tarih ve odak; yerin askısı korunur.                                                                                |
| 6Timeline                 | **IMPLEMENTED / PARTIAL E2E**      | Tek dock; yıl0yok, slider, adım/hız/playback, tarih girişi, gerçek ticks, requested/source ayrımı; mevcut store/iptal korunur.                       |
| 7Durumlar                 | **IMPLEMENTED / PARTIAL platform** | Loading/error/retry, WebGL fallback, kısmi cache/offline ve no-data; gerçek kısıtlı ağ testi yok.                                                    |
| 8Kaynak/belirsizlik       | **IMPLEMENTED / PARTIAL içerik**   | Türkçe semantik, doğrudan kaynak/atıf/sitelink; ham teknik ayrıntı isteğe bağlı. Kaynak zinciri bağımsız incelemesi açık.                            |
| 9Yedi probe               | **IMPLEMENTED**                    | Gerçek Node koşusu ve negatif assert testleri; [ayrı rapor](probe-remediation.md).                                                                   |
| 10Performans/dayanıklılık | **PARTIAL**                        | Sınırlı chunk/cache/concurrency/abort ve lifecycle testleri;6host işyükü; gerçek browser/GPU/Android ölçümü yok.                                     |
| 11Erişilebilirlik         | **PARTIAL**                        | 48hedef, isim/focus/tooltip, klavye/listeler, panel geri/odak, reduced-motion, renk oranı hesabı. TalkBack/gerçek focus/büyük yazı kabulü yapılmadı. |
| 12İlk açılış              | **IMPLEMENTED / PARTIAL görsel**   | Dev-only ayrımı, kapalı detay, gerçek keşif, yıl/coverage; görsel doğrulama engelli.                                                                 |
| 13A–Fakışları             | **PARTIAL / BLOCKED E2E**          | Gerçek katalogla6senaryo;1453için sahtepolygon yerine no-data; Cexplicit nearest; Façık kurtarma. Testler yazıldı/listelendi, çalışmış sayılmaz.     |
| 14Provider/lisans         | **IMPLEMENTED / PARTIAL yayın**    | Merkezi physicalProvider; local assets, sürüm/kaynak/lisans/cache/CORS/anahtar politikası; yeni remote servis yok. Transitif NOTICE kapısı açık.     |
| 15Görsel regresyon        | **BLOCKED / NOT TESTED**           | Sekiz boyutta gerçek canvas/bounds +main/panel PNG testi hazır; browser/port engeliyle görüntü yok.                                                  |
| 16Kalite kapısı           | **PARTIAL / NO-GO**                | Lint/strictTS/255+5/hash/web/AndroidJSexport geçti. Gerçek E2E, APK/cihaz, güvenlik ve içerik kapıları açık.                                         |

## Test ve build kanıtları

Gerçek başlangıç ve son durum [baseline komutları](evidence/commands.json) ile
[son komut manifestinde](evidence/final/commands.json) ayrılır. Baseline250+5;
son255+5. Test silme veya başarısız beklentiyi gevşetme yapılmadı. Navigasyon
helper'ları yeni gerçek menülere taşındı; arama grup beklentisine yer eklendi.
Mevcut görsel snapshot beklentileri korunur; sahte baseline onayı verilmedi.

Mevcut GitHub Actions akışına üretim kullanıcı/görsel test adımı eklendi;
eski geliştirme test komutu korunur. Bu ortamda gerçek GitHub CI çalıştırılmadı;
workflow dosyasının varlığı veya yerel Node26 sonucu yeşil CI iddiası değildir.
Statik export yanıt fonksiyonu gerçek dist dosyaları üzerinde ayrıca çalıştı:
[yanıt kaydı](evidence/final/static-response.json). Bu HTTP/browser testi değildir.
[Token kontrast hesabı](evidence/final/contrast.json) bütün ekranın kontrast ve
focus kabulü sayılmaz.

| Komut                                       | Sonuç                                                                                   | Kanıt                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                             | exit0: lint0uyarı, native+web strictTS,255ana+5worker; hash/pilot/sitelink/chunk/format | [Log](evidence/final/check.log)                                                                                             |
| `npm run basemap:check`                     | exit0, **PARTIAL**:50myok;110mhash ayrı geçer                                           | Check log                                                                                                                   |
| `npm run web:export`                        | exit0;4statik rota;9web bundle                                                          | [Log](evidence/final/web-export.log)                                                                                        |
| `npm run android:bundle`                    | exit0; Hermes+DOM JS; **APK değil**                                                     | [Log](evidence/final/android-export.log)                                                                                    |
| `npm run test:web -- --list`                | exit0;104senaryo/15dosya listesi, koşu başarısı değil                                   | [Log](evidence/final/browser-list.log)                                                                                      |
| `timeout 30s npm run test:web:production`   | exit1; sunucu başlayamadı;0tamamlanan senaryo                                           | [Log](evidence/final/production-e2e.log)                                                                                    |
| `npm run web:preview` / `chromium.launch`   | exit1; listenEPERM / sandboxOperation not permitted                                     | [Preview](evidence/final/preview-start.log), [Chromium](evidence/final/chromium-launch.log)                                 |
| `node --input-type=module < …probes.txt`    | exit0;7kontrol çıktısı; beklentileri ayrıca unitassert doğrular                         | [Log](evidence/final/probes.log)                                                                                            |
| `qa:coverage`, `qa:security`, `qa:licenses` | exit0; rapor üretimi; tüm kapılar kapalı demek değil                                    | [Kapsam](evidence/final/coverage.json), [güvenlik](evidence/final/security.json), [lisanslar](evidence/final/licenses.json) |
| `npm audit --json`                          | exit1; EAI_AGAIN, güncel zafiyet sonucu alınamadı                                       | [Log](evidence/final/npm-audit.log)                                                                                         |
| `npm run basemap:prepare`                   | exit1; EAI_AGAIN,50mveri eklenmedi                                                      | [Log](evidence/final/basemap-download.log)                                                                                  |
| `npm run environment:check`                 | exit1; Node/npm/lockPASS, Java/adb/SDKyok                                               | [Log](evidence/final/environment.log)                                                                                       |
| Host benchmark / export size                | exit0; gerçek host CPU ve byte/gzip/brotli; browser/FPS/APK sonucu değil                | [CPU](evidence/final/host-benchmark.json), [boyutlar](evidence/final/sizes.json)                                            |
| Browser benchmark                           | exit1; measurementsboş, listenEPERM                                                     | [Rapor](evidence/final/web-benchmark.json)                                                                                  |

Host ölçümü32girdilik timeline cache,27681byte raw chunk bellek ve120sınırlı
metric örneği gösterir. RSS/heap checkpoint'leri kaydedilir; sızıntı olmadığı
veya performansın iyileştiği iddia edilmez. Yeni/önceki ölçümler eşzamanlı farklı
iş yükleri içerdiğinden nedensel hız kıyası yapılmaz. Ağ aktarımı, FPS, GPU
belleği, pil, ısı ve fiziksel cihaz gecikmesi ölçülmedi.

## Görsel doğrulama

**NOT TESTED:**1280×720,1440×900,1920×1080,360×800,390×844,430×932,
768×1024portrait,1024×768landscape. `product-quality.spec.ts` gerçek renderer
ve canvas bekler, header/workspace/host/canvasCSS/bufferDPR/dock bounds ölçer,
yatay taşmayı ve harita yüksekliğini kontrol eder; ardından main/panel PNG ekler.
Fallback ekranını gerçek harita başarı kanıtı kabul etmez.

Başlangıçta kullanıcı ekran görüntüsü sağlanmadı; yeni gerçek browser da
başlayamadı. Bu yüzden eski/yeni piksel karşılaştırması, ölçülmüş harita yüzdesi
ve screenshot teslimi **BLOCKED**. CSS/source incelemesi görsel PASS değildir.
Ekran görüntüsü veya sonuç uydurulmadı. Yetkili ortamda:

```sh
npm run web:export
npm run test:web:production
# Eski geliştirici akışları ve mevcut snapshot testleri için:
npm run test:web
```

## Değişen dosyalar ve koruma

Dosya bazında SHA/byte ve eklenen/değişen listesi
[changed-files.json](evidence/final/changed-files.json) içindedir. `.git`
görünmediğinden bu kayıt Git diff değildir; yalnız V3 başlangıcına göre farktır.
Önceki oturumda yapılmış domain/ETL düzeltmeleri önceki raporda korunur.
Kaynak envanterinde36dosya değişti,8dosya eklendi,0dosya silindi; docs bu sayımın
dışındadır. Lock, ham girdiler ve üretilmiş katalog aynı SHA'dadır.

- UI: `src/atlas/AtlasScreen.tsx`, `AppHeader.tsx`, `EntitySheet.tsx`,
  `usePanelInteraction.ts`, `MapModeSwitch.tsx`, `TimelineDock.tsx`, `Action.tsx`,
  `SearchResults.tsx`, `SearchTargetPanel.tsx`, `SharePanel.tsx`,
  `SourceDetails.tsx`; `src/i18n/tr.ts`, `src/theme/tokens.ts`,
  `src/config/build.ts`, `src/map/ViewportFrame.tsx`.
- State/harita: `src/preferences/model.ts`, `src/discovery/search.ts`,
  `bookmarks.ts`, `sharing.web.ts`, `sharing.native.ts`,
  `src/map-contract/protocol.ts`, `src/map/useGlobeHost.ts`,
  `src/map/globe/renderer.ts`, `provider.ts`.
- Araçlar/test: `scripts/qa/serve-export.mjs`, fiziksel hazırlayıcılar,
  `scripts/performance/web.mjs`, npm scriptleri/Playwrightconfig,
  `.github/workflows/checks.yml`, unit rework/discovery/renderer ve web test/menu dosyaları.
- Belgeler: bu klasör, `README.md`, `docs/progress.md`, `architecture.md`,
  `license-register.md`, `data-quality.md`, `release-blockers.md`.

Yeni dış paket yok; lock, üretim katalog/hash ve ham veri korunur. Eski
özellikler dev paneline veya normal kullanıcı akışına taşındı. Synthetic
fixture'lar testte kalır. Historical Basemaps/OHM veya lisansı belirsiz tile
paketlenmedi. Kod/doküman MIT; veri/worker/font hakları ayrı sicildedir.

## Son karar

**Uygulanabilir kod ve otomatik doğrulama teslim edildi; son kullanıcıya hazır
kabulü karşılanmadı.** Ayrıntılı fiziksel veri, gerçek web/Android E2E ve görsel
kabul, ham DOM/CSP, güncel bağımlılık/NOTICE ve doğrudan kaynak incelemesi açık.
[Kalan sınırlamalar](known-limitations.md) kapanmadan READY veya yayın onayı yoktur.
