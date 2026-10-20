# ADR-0001 — Tek MapLibre GL JS globe çekirdeği

Tarih: 2026-10-15 · Durum: **PROPOSED — ANDROID DEVICE VALIDATION PENDING**.

## Bağlam

Android ve web'de gerçek döndürülebilir küre gerekiyor. İki ayrı renderer sınır/kültür semantiğinin, stilin ve seçim davranışının farklılaşma riskini artırır. Kurulu bir uygulama veya ölçüm yok. Resmi [MapLibre globe örneği](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/) yeteneği gösterir; Expo entegrasyonu veya hedef Android GPU başarısını kanıtlamaz.

## Önerilen karar

Web'de doğrudan MapLibre GL JS; Android'de tek Expo DOM harita bileşeni içinde **aynı sürüm ve aynı globe modülü**. DOM wrapper/asset sorunu olursa aynı modül tek açık `react-native-webview` adaptörüne taşınabilir. SDK 56+ varsayılan wrapper'ı `@expo/dom-webview` olduğu için DOM = react-native-webview eşitliği kurulmaz. [Expo DOM belgesi](https://docs.expo.dev/guides/dom-components/).

MapLibre 6.14.0 araştırılmış adaydır. v6'nın ESM/worker/WebGL2 şartları [mimari matriste](../architecture.md) kayıtlıdır. Kesin paket/sürüm seçimi, boyut ve release prototipi kapıları geçilince yapılır. Üç boyutlu görünümde antimeridyen, arka yarımküreye tıklama, kutup çevresi, zoom geçişleri ve yaklaşık sınır stili sınanır; Merkatör'e yakın zoom geçişleri varsa kullanıcıya yanlış küre temsili yaratmamalıdır.

## Alternatifler ve göç maliyeti

Aşağıdaki maliyetler göreli mühendislik tahminidir; süre, APK boyutu veya FPS ölçümü değildir.

| Seçenek | Hangi sorunda değerlendirilecek | Yeniden kullanılacak / değişecek | Maliyet ve kabul engeli |
| --- | --- | --- | --- |
| Expo DOM → açık react-native-webview | Wrapper lifecycle, origin veya export sorunu; GPU yeterli | Globe, alan modeli ve stiller korunabilir; paketleme/bridge/lifecycle yeniden yazılır | **Düşük–orta**; aynı GPU/WebGL2 eksikliğini çözmesi beklenmez; yerel asset/release testi şart |
| MapLibre Native + React Native wrapper | WebView renderer/GL sürücüsü kaynaklı sorunlar; native grafik yolu avantaj sağlayabilir | Alan modeli/katalog ve kimi stiller; kamera/seçim/katman adaptörleri ve testleri değişir | **Yüksek**; ikinci renderer oluşur. Seçilecek native sürümde gerçek globe desteği bu fazda doğrulanmadı, destek varsa bile GL JS eşdeğerliği varsayılmaz; globe kanıtlanmadan uygun alternatif sayılmaz |
| CesiumJS aynı DOM/WebView içinde | MapLibre'ye özgü globe özelliği/renderer sorunu | Katalog/alan modeli; stil, geometri işleme, seçim ve kamera yeniden uyarlanır | **Yüksek**; gerçek 3D globe var, fakat yine tarayıcı/GPU kullanır; genel WebGL arızasını otomatik çözmez. İyon hesabı/verisi zorunlu yapılmaz; bağımsız izinli asset planı şart |
| Expo GLView + özel 3D globe renderer | WebView yolu başarısız, native GL yolu prototipte başarılı | Veri/kanıt modeli; globe mesh, picking, geodesic polygon, yazı ve zoom yaklaşımı yeniden kurulur | **Çok yüksek**; web renderer paylaşımı azalabilir. Alan modelini koruyarak yeni ADR, lisans/boyut ve cihaz araştırması gerekir; hazır atlas altyapısı sayılmaz |
| Haritasız liste / açıklama | Desteklenmeyen cihaz veya geçici bağlam kaybı | Katalog, kaynaklar ve erişilebilir UI korunur | **Düşük**; hata deneyimidir. 3D küre kabulünü tamamlamaz; düz 2D harita ürün şartının yerine geçirilmez |

Alternatiflere ilişkin resmi başlangıç kanıtları: [MapLibre RN wrapper README](https://github.com/maplibre/maplibre-react-native), [MapLibre Native](https://maplibre.org/maplibre-native/docs/book/), [CesiumJS ürün/yetenek açıklaması](https://cesium.com/platform/cesiumjs/), [Expo GLView](https://docs.expo.dev/versions/latest/sdk/gl-view/). Bu kaynaklar bütün kombinasyonlar için cihaz uyumluluk garantisi vermez. Kod lisansları [sicilde](../license-register.md) ayrı; alternatiflerin tam bağımlılık/boyut incelemesi yapılmadı.

## Sonuç ve kararın kapanma şartı

Öneri tek harita kodunun bakım yükünü azaltmayı hedefler; Android'de ek DOM JS ortamı, bridge ve bellek maliyetini kabul eder. Aynı ekranda çok WebView tasarımı seçilmez. Büyük veriyi bridge'de çoğaltmama, bir harita lifecycle'ı ve küçük izinli fiziksel taban tasarımın parçasıdır.

[V-01–V-08 deneyleri](../architecture.md) release koşullarında, en az iki fiziksel Android GPU ailesinde ve web'de tamamlanmadan bu ADR **ACCEPTED** olamaz. Donanım sorunlarında önce minimal yük/DPR/özellik azaltımı ve hata ayrıştırması yapılır; başarısızlık sürerse alternatif için yeni kanıt toplanır. Kullanıcıdan yeni faz onayı olmadan hiçbir alternatif uygulanmaz.

## Faz 02 kaynak kararı — 2026-10-15

Durum **IMPLEMENTED IN SOURCE, RUNTIME BLOCKED; UNVERIFIED ON DEVICE**.
ADR genel kabulü hâlâ PROPOSED. Kullanıcı Faz 02'yi açıkça istedi; önceki kurulum
engelleri çözülmüş varsayılmadan kaynak çalışması yapıldı. [Rapor](../reports/phase-02.md).

Web `MapViewport.web` doğrudan ortak GlobeView; Android tek `'use dom'` GlobeDOM
sarmalayıcısı üzerinden aynı modül. Hedef MapLibre **6.14.0** (BSD-3-Clause,
[resmi sürüm manifesti](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/package.json));
RN WebView **13.16.1** [SDK 57 eşlemesinden](https://github.com/expo/expo/blob/sdk-57/packages/expo/bundledNativeModules.json).
MapLibre'nin [v6 kurulumu](https://maplibre.org/maplibre-gl-js/docs/) worker'ın ayrıca
paketlenmesini gerektirir. Tek dosyalı worker doğrulanıp TS kaynak metnine gömülerek
Blob URL ile başlatılacak. Bu Metro/native release için deney tasarımıdır, denenmiş
bundler uyumluluğu değildir. Paketler kurulmadığı için boyut ve transitif hak
incelemesi **BLOCKED**; sürüm sabitlemek lisans/boyut kapısını kapatmaz.

Expo DOM varsayılan `@expo/dom-webview` yerine `dom.useExpoDOMWebView:false`
seçildi. Expo'nun [DOM belgesi](https://docs.expo.dev/guides/dom-components/) bu yolu
sunuyor. Varsayılan wrapper kaynak tiplerinde navigasyon/origin props'larının
bir bölümü unsupported; RN WebView [Reference](https://github.com/react-native-webview/react-native-webview/blob/v13.16.1/docs/Reference.md)
açık navigasyon ve mixed-content kontrolü veriyor. Karşılaştırma doküman/kaynak
üzerindedir; iki wrapper'ı cihazda çalıştırarak ölçtüğümüz anlamına gelmez.

| Seçenek | Karar / gerekçe | Ek maliyet ve açık nokta |
| --- | --- | --- |
| Expo DOM + varsayılan wrapper | Şimdilik seçilmedi; gereken navigasyon prop kontrolü yetersiz | Daha az özel bağımlılık; aynı GPU riskleri; yetenek/semantik ayrıca doğrulanmalı |
| Expo DOM + RN WebView | Kaynak prototipinde seçildi; ortak bundler/action akışı ve navigasyon callback'i | Ek native bağımlılık; Expo dış zarfı uygulama doğrulamasından önce parse eder; tam raw güvenlik kontrolü yok |
| Bağımsız RN WebView | Yedek deney; ham mesajı parse öncesi sınırlamak veya DOM export sorununu ayırmak için | Aynı renderer korunur; HTML/ESM/worker paketleme ve transport adapter yeniden yazılır; düşük/orta maliyet, GPU eksikliğini çözmez |

Kamera/mesaj sınırları, URL allowlist, dosya erişim bayrakları, CSP önerisi,
worker/provenance hazırlığı ve lifecycle [prototip belgesinde](../globe-prototype.md).
Ekranda birden fazla WebView oluşturulmaz; about/background'da renderer unmount
olur. Her WebView ayrı DOM runtime/GL kaynakları taşıyabildiği için çoklu WebView
PSS ve context baskısını artırabilir; ölçüm yapılmadı. [Cihaz kapısı](../reports/phase-02-device.md)
kapanmadan kapsamlı UI veya sonraki faz başlatılmaz.

2026-10-15 Faz 02 onarımında aynı engine/adaptör seçimi korundu. Renderer'ın load
hata/tek marker/context temizliği regresyonları ve worker parser kontrolü düzeltildi.
[18+3 bağımsız test](../reports/phase-02-repair.md) gerçek web/Android kanıtı değildir;
ADR hâlâ **PROPOSED / UNVERIFIED ON DEVICE**. Alternatif renderer'a geçilmedi.

Kullanıcı kurulumu sonrası gerçek Metro web ve Android/DOM export geçti.
MapLibre 6.14.0 worker'ında iki opsiyonel plugin dynamic import'u görüldü;
fiziksel-only hazırlık bunları AST ile devre dışı bırakıp kalan zorunlu import'u
reddeder. Telif/dönüşüm/hash kayıtları korunur. DOMProps web tipi RN WebView public
sözleşmesinden türetildi. Cihaz ve gerçek küre görüntüsü hâlâ doğrulanmadı; ADR
kabulü değişmedi. [Kurulum sonrası kanıt](../reports/phase-02-post-install.md).

Gerçek asset hazırlandıktan sonra web ve Android/DOM export tekrar PASS;
23/23 kurulu doğrudan sürüm ve kaynak/worker/atıf hash kontrolü PASS. Fiziksel
cihaz/tarayıcı görüntüsü hâlâ yok (Chromium sandbox EPERM). Karar **PROPOSED /
UNVERIFIED ON DEVICE** kalır. [Hazırlanmış varlık kanıtı](../reports/phase-02-prepared.md).
