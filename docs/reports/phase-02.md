# Faz 02 raporu — Gerçek 3D küre ve Android teknik kanıt

Tarih: **2026-10-15** · Sonuç: **BLOCKED — RUNTIME / DEVICE PROOF**.
Android: **UNVERIFIED ON DEVICE**. Faz 03 başlatılmadı.

## Kapsam ve küçük uygulama planı

AGENTS.md, progress, README ve Faz 00/01 karar/raporları okundu. Kullanıcı Faz 02'yi
ayrıca istedi; önceki “Mevcut ortamla ilerle; engelleri raporla” yönlendirmesi geçerli.
Faz 01'in başarısı varsayılmadı. Bu fazın planı: (1) resmi API/lisans ve ortamı
kontrol et, (2) ortak globe + küçük tipli köprü/adaptörler, (3) izinli fiziksel
hazırlık ve fallback/cleanup, (4) bağımsız testler, gerçek platform smoke tanımı,
cihaz/ADR/lisans/ilerleme raporu. Tarihî veri veya kapsamlı UI eklenmedi.

## Hazırlanan kaynaklar

- Aynı MapLibre 6.14.0 renderer, fiziksel koyu stil `projection:globe`, yüklemede
  setProjection, fare/touch/pinch/wheel/klavye, kamera reset; DPR≤2, tek worker.
  Web doğrudan DOM; Android Expo DOM + RN WebView 13.16.1. **Çalıştırılmadı**.
- `CameraState` ve v1 `version/type/requestId/sessionId/payload` zarfı; iki yön için
  ayrı izinli türler, strict runtime şema, 4096-byte limit, eski oturum/event reddi.
  Hatalı komutlarda native işlev/eval/URL çalıştırma yok. Küçük bounded olay kuyruğu.
- 0,0'da ◎ sentetik, klavyeden seçilebilir demo marker; callback host metnine gider.
  Gerçek web veya native teslimi **gösterilemedi**; şema testleri bunun yerine sayılmadı.
- WebGL2 probe, yükleniyor, asset eksikliği/context loss/timeout ve renderer hata
  açıklamaları; haritasız açıklama ve retry. Bu fallback küre başarısı değildir.
- Marker/dinleyici/observer/map/worker URL temizliği; blur/background unmount,
  process kaybında kullanıcı retry ve yeni session. Gerçek GPU sızıntısı testi yok.
- Natural Earth kamu malı fiziksel kara için sürümlü, boyut/koordinat kontrollü
  hazırlama betiği; cache hash, kaynak/dönüşüm manifesti ve gerçek paket bildirimini
  bundle'a gömme. **Dosya alınamadı**; generated modüller null. Elle geometri yok.
  Modern ülke etiketi/sınırı, tile/demo sunucusu, harici font ve glyph kullanılmadı.
- Gerçek uygulamaya yönelik Playwright smoke/fault senaryoları, unit ve negatif tip
  testleri, asset hazırlama adımlı CI. CI GitHub'da çalıştırılmadı; lock kapısı açık.

## Doğrulama

[Ham komut kaydı](phase-02-validation.txt), [kaynak kanıtı](phase-02-source-validation.txt),
[cihaz matrisi](phase-02-device.md).

| Kontrol | Sonuç / sınır |
| --- | --- |
| npm test | **PASS, 11/11**, 0 skip; eski boş katalog/Türkçe/kontrast testleri de geçti |
| Bağımsız strict core TS 6.0.3 | **PASS**; kamera/protokol, URL, fiziksel validator, lifecycle, i18n/tema/katalog + negatif tip testleri. İlk fixture directive konumu düzeltildikten sonra 0 tanı; UI/Expo/MapLibre tipleri dahil değil |
| TS/TSX syntax-only | **PASS**, 34 dosya / 0 tanı; dependency stub yok. Semantik typecheck değildir |
| Biçim | **PASS**, mevcut Prettier 3.9.9 aracıyla; paket kurulum başarısı değil |
| npm run lint / typecheck | **BLOCKED**, exit 127: eslint/tsc kurulu değil |
| npm run globe:prepare | **BLOCKED**, exit 1: kurulu MapLibre manifesti yok; worker/veri/Notice üretilmedi |
| Registry / Natural Earth shell erişimi | **BLOCKED**, EAI_AGAIN / curl DNS exit 6 |
| Web başlatma / export / config | **BLOCKED**, exit 127: expo bulunamadı |
| Playwright gerçek globe/fallback/context-loss | **BLOCKED**, exit 127: playwright bulunamadı; test varlığı çalışma kanıtı değil |
| Android JS export | **BLOCKED**, exit 127; zaten APK/cihaz kanıtı yerine geçmez |
| APK/debug/release/gerçek Android | **NOT RUN — UNVERIFIED ON DEVICE**; Java/SDK/adb yok |
| Yeni bağımlılık bakım/lisans/boyut | Resmi sürüm/API/lisans kaynakları incelendi; [0/21 kurulu](phase-02-dependency-report.json), gerçek/transitif/bundle/gzip/APK boyutları ve audit **BLOCKED** |

## Kabul kriterleri ve kilit engeller

| Kriter | Durum |
| --- | --- |
| Web'de gerçek döndürülebilir küre ve etkileşim gösterimi | **BLOCKED** — renderer kodu var, kurulum/asset/runtime kanıtı yok |
| Android'de aynı kodla gerçek küre | **BLOCKER — UNVERIFIED ON DEVICE** |
| İzinli modern siyasi etiketsiz fiziksel taban | Kaynak lisansı uygun; **BLOCKED** — kaynak baytları alınmadı |
| İki platformda demo marker seçiminin uygulamaya ulaştığı kanıtı | **BLOCKED** — şema ve host kodu var, gerçek teslim testi yok |
| Context loss, resize, dönme, touch gecikmesi, geri, mount/GPU temizliği | Bağımsız scope testi geçti; gerçek platform/donanım sonuçları **BLOCKED** |
| Bridge şeması/payload/navigasyon politikası | Uygulama şeması unit testleri **PASS**; native politika ve Expo dış raw taşıma testi **BLOCKED** |
| Belirsiz lisanslı veri paketlememe | **PASS — no data acquired**; HB-REDIST-01 aynen BLOCKED FOR REDISTRIBUTION |

Birinci blocker npm DNS/lock/kurulum; ikinci JDK/SDK/adb/gerçek cihaz erişimi.
Ağ/kurulum sonrası önce aynı Faz 02 içinde hazırlık ve export yapılmalı; ESM/
import.meta, CSS, Blob worker + file origin ve kapalı file erişim bayrakları
ayrıştırılmalı. Wrapper sorunu sürerse aynı renderer açık WebView ile karşılaştırılır;
GPU/WebGL2 yoksa bu geçişin sorunu çözdüğü varsayılmaz. ADR alternatifleri için
ayrı kanıt gerekir. Donanım yetersizliğinde düz dünya haritası 3D diye sunulmaz.

Expo outer zarfının uygulama boyut kontrolünden önce parse edilmesi nedeniyle
raw taşıma izolasyonu açık risk. Hosting CSP ve native offline politika da
henüz uygulanmış/doğrulanmış üretim sertleştirmesi sayılmaz. [Ayrıntılar](../globe-prototype.md).

## Değişen dosyalar

Tam liste: [phase-02-files.txt](phase-02-files.txt). Başlıca gruplar:

- `src/map/globe/*`, `src/map/GlobeDOM.tsx`, iki `MapViewport` adaptörü,
  `ViewportFrame.tsx`, `useGlobeHost.ts`: tek renderer ve platform lifecycle.
- `src/map-contract/*`, `src/app/index.tsx`, `src/i18n/tr.ts`, `src/ui/Button.tsx`:
  şema, odak, Türkçe prototip ve reset durumu.
- `scripts/prepare-globe-assets.mjs`, dependency-report opsiyonel çıktı yolu;
  package.json, formatter ignore ve CI; unit/type/web testleri.
- README/üçüncü taraf atıfları, ADR-0001, mimari, kaynak/lisans/risk/yol haritası,
  setup'taki tarihî yetki ifadesi, prototip/cihaz/faz raporları ve progress.

Kullanıcı kodu silinmedi; başka projenin paket/lock/verisi buraya taşınmadı. Kök
AGENTS.md zaten mevcut ve okundu, tekrar değiştirilmedi. Tarihî katalog boş kaldı.

## Sonraki fazın önkoşulları

Faz 01 kurulum ve lock engelini kapat; yeni bağımlılık/transitif hak ve gerçek
boyut envanteri; başarılı tam lint/typecheck/test/format/config/export; gerçek
web küre görüntüsü + marker/camera/fault/cleanup testleri; iki fiziksel GPU ailesinde
Android release/offline/gesture/geri/context/performans raporu. Kritik derleme
hatası kalmadığı henüz söylenemez. Bu kilit kanıt ve **ayrıca kullanıcı onayı**
olmadan Faz 03 veya kapsamlı UI geliştirmesine geçilmez.
