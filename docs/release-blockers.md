# Yayın engelleri — güncel kalite kapısı

## 28 Ekim 2026 — Yayın kapıları temizliği (TA-7)

**Kararlı ürün yayını NO-GO sürer.** Bu turda kapatılabilen kapılar yeşile çekildi;
Docker imajı, Android cihaz, Expo major güvenlik düzeltmeleri ve yayın host
politikası hâlâ açık. UI PR’larına dokunulmadı; `main` @ `780f71db` tabanı.

| Kapı | Bu ortam | Not |
| --- | --- | --- |
| `npm run check` parçaları (lint, native/web TS, 419 unit, 5 worker) | **PASS** | Tam `npm run check` veri/lisans/hash zinciri ayrıca önceki yeşil kayıtlarla uyumlu; bu turda lint+typecheck+unit+worker ölçüldü |
| `npm run web:export` | **PASS** | 4 route; 16.102 şehir paketi / 645.992.949 byte |
| Production E2E (`test:web:production`) | **PASS** | **86/86** (önceki uzak 83 PASS / 3 FAIL kalıntısı bu commit’te yeniden üretilmedi) |
| `release:stage` + `release:verify` | **PASS** | 18.474 dosya / 890.120.304 byte |
| Docker’suz web paket HTTP/CSP smoke (`release:smoke-web`) | **PASS** | Gerçek `Content-Security-Policy` (sha256, no `unsafe-eval`), `/healthz`, 404, POST 405 |
| Docker Engine imaj build/run/container smoke | **BLOCKED** | `docker` binary yok; workflow Docker adımı bu ortamda koşulamaz |
| `npm audit` | **PARTIAL** | Ağ erişimiyle alındı: güvenli `npm audit fix` sonrası **11** açık (5 low / 3 moderate / 3 high). `node-forge` 1.4.2’ye çıktı. Kalan high’lar Expo 57→54 force downgrade ister; uygulanmadı |
| SEC-RAW-DOM / native file-origin CSP | **BLOCKED** | Expo ham WebView parse sırası ve native file-origin deneyi yok |
| ANDROID | **UNVERIFIED ON DEVICE** | APK/cihaz smoke yok; performans iddiası yok |
| A11Y / PRIVACY-HOST / CI uzak yeşil Release | **BLOCKED / OPEN** | TalkBack, hosting politikası ve taslak Release bu turda üretilmedi |
| DATA-* / WIKI-LIVE / LICENSE-TRANSITIVE | önceki durum | Bu tur içerik veya lisans kapsamı genişletmedi |

Kanıt: [reports/release-gates-2026-10-28/](reports/release-gates-2026-10-28/),
ürün store raporu `docs/yayin-kapilari.md`. Faz 17 başlatılmadı.

## 22 Ekim 2026 — Son Release çalışmasının durumu

Son uzak run 39664079314: ae2b990d üzerinde npm check/web export PASS,
83 E2E PASS / 3 FAIL. Paket/Docker/Release adımları çalışmadı. İlk kamera
hazırlığı ve ülke/şehir kaynak testi düzeltmeleri yerelde uygulandı; yeni
gerçek tarayıcı sonucu beklenir. Kararlı yayın NO-GO devam eder. Taslak teknik
önizleme de bütün web ve Docker kapıları geçmeden oluşturulmaz.
[Güncel nedenler ve doğrulama sınırları](reports/release-camera-readiness.md).

## 21 Ekim 2026 — Release CI gerçek tarayıcı sonucu

**NO-GO sürer.** Kaynak push ve 06fa7efb format düzeltmesi doğrulandı. Son
Release job'ında npm check ve web export PASS; browser E2E 43 FAIL / 41 PASS.
Docker/paket/Release adımları çalışmadı. Yerel Action/kart/ortak arşiv okuma ve
test akışı düzeltmeleri 417+5 unit kontrolünden geçer; yeni gerçek browser
sonucu alınmadığı için 43 hata çözülmüş sayılmaz. Yıl-renderer eşleşmesi,
ilk ülke/şehir etiketleri ve kişisel not silme kabulü açık kalır. Android CI
ayrıca runner shutdown sırasında iptal oldu; fiziksel cihaz kabulü yoktur.
[Hata kanıtı, uygulanan değişiklikler ve kalan doğrulama](reports/release-e2e-ci.md).

## 21 Ekim 2026 — GitHub / Docker hazırlığı

**Kararlı ürün yayını NO-GO sürer.** Kaynak yayınına uygun temizleme, README,
Docker/Compose ve web Release paketleme uygulanmıştır. Web export ve paket
checksum doğrulaması gerçek komutlarla sınanır. Docker Engine soketi bu görev
ortamında erişilemiyor; imaj build/run ve gerçek container smoke **BLOCKED**.
Yerel HTTP sunucusu bind EPERM; browser E2E/görsel kabul **BLOCKED**, ekran
görüntüsü üretilmedi. Fiziksel Android **UNVERIFIED ON DEVICE**; APK yoktur.
Güncel npm audit registry DNS nedeniyle alınamadı; eski açık güvenlik/lisans
bulguları kapatılmadı. Bu sebeplerle workflow yalnız taslak teknik önizleme
hazırlar; otomatik kararlı yayın yapmaz.

GitHub bağlantısından hedef deponun mevcut olduğu okunabildi. Terminal
GitHub DNS erişimi ve geçersiz gh oturumu nedeniyle Git push / Release upload
ayrı ortam engelidir. Kaynak paketini hazırlamak yükleme yapılmış sayılmaz.
[Komutlar, sonuçlar ve temizleme kapsamı](reports/github-preparation.md).

## 18 Ekim 2026 — Güncel yol katmanı doğrulaması

**NO-GO devam ediyor.** Renk/yol kodu ve birim testler tamamlandı. Gerçek tile
HTTP/CORS/GPU testi DNS/sandbox nedeniyle BLOCKED; referans görselle browser
karşılaştırması NOT TESTED. Native file-origin HTTPS, pinch 16 zoom, arka plan,
ağ kesintisi ve atıf linkinden dönüş UNVERIFIED ON DEVICE. Public tile hizmetinin
SLA'sı yok; offline fallback yerel küreyle sınırlı. Canlı görünüm ve performans
kabul edilmeden yayın için doğrulandı denemez.
[Kanıtlar](reports/atlas-colors-roads.md).

**18 Ekim 2026 — Büyük şehir verisiyle web paketleme: düzeltildi; yayın NO-GO.**

Dünya şehir verisi artık kuruludur. Web 16.102gzipveri JS modülünden ayrıldı;
tip çıkarım sınırı TS2590 giderildi. Gerçek veride kaynak/hash/atıf kontrolü,
statik web exportu ve TRidari kayıt okuması raporlandı.
Geliştirme sunucusuna soket erişimi bu ortamda EPERM/portçözüm engelli;
tarayıcı/GPU kabulü tamamlanmadı. Native/DOM eski yerel veri yolu korundu fakat
16.102paketin native dağıtım boyutu/derleme süresi ve fiziksel cihaz testi açık
risk olmaya devam eder; yeni Android export veya cihaz başarısı iddiası yok.
[Dosyalar, ölçülen derleme ve doğrulama](reports/metro-places.md).

**18 Ekim 2026 — Osmanlı kişi grubuna devam: içerik PARTIAL, yayın NO-GO.**

33 ek kaynaklı profil, 22 yeni doğum-yılı noktası; 36 Osmanlı padişahı profil
olarak erişilebilir. Beş eski yıllık doğum noktası belirsizlik nedeniyle
biyografik sınıfa düzeltildi. Toplam 174 profil/109 doğum-yılı noktası, 665
kişi hâlâ incelemede; 5 grup kişi değil, 9 belirsiz kimlik atlandı.

358 ana/5 worker, lint, strictTS, kaynak/hak/hash kapıları ve iki platform
JS export PASS. Gerçek tarayıcı E2E/görsel kabulü Chromium EPERM nedeniyle
BLOCKED; Android UNVERIFIED ON DEVICE. Daha önceki güvenlik/CSP/origin/a11y
kapıları kapatılmadı. [Güncel kanıtlar](reports/ottoman-people.md).

**18 Ekim 2026 — Geniş kişi isteği: içerik PARTIAL, yayın NO-GO sürer.**

29 yeni profil ve 26 doğum noktası eklendi. Elealı Zenon biyografik olarak
çözüldü; 9 belirsiz ad kullanıcı isteğiyle atlandı. 823 isteğin 698 kişilik kısmı
kaynak edinimi/incelemesi bekler; terminal DNS EAI_AGAIN. Staging toplaması
otomatik yayın onayı değildir; büyük üretim indeks/chunk işi açık. Bütün 823
kişinin haritaya eklendiği söylenemez. [Kapsam ve gerçek loglar](reports/requested-people.md).
Gerçek browser/görsel kabulü Chromium EPERM nedeniyle **BLOCKED**; Android
**UNVERIFIED ON DEVICE**. Önceki güvenlik/CSP/origin/a11y/yayın kapıları sürer.

**18 Ekim 2026 — 113 kişilik doğum incelemesi: içerik PARTIAL, yayın NO-GO sürer.**

111 profil/66 yaklaşık doğum-yılı noktası;20yalnız biyografik yer,25geometrisiz
profil;JamesWatt/Arşimet kaynak revizyonu bekliyor. Eksik veri rastgele konumla
tamamlanmadı. Onaylırevizyon/SHA/lisans kapıları ayrı14katalogda korunur.
[Kapsam ve test raporu](reports/person-births.md). BrowserEPERM nedeniyle yeni
görsel/screenshot/E2E **BLOCKED**, Android **UNVERIFIED ON DEVICE**; APK yok.
Genişletme önceki güvenlik/CSP/origin/a11y/bağımlılık ve cihaz engellerini
kapatmaz. Yeni bir kapsam/faz başlatılmadı.

**18 Ekim 2026 — Türkiye/keşif güncellemesi: yayın NO-GO sürer.**

[Gerçek komutlar ve kapsam](reports/turkey-discovery.md). Kişi/olay kartı ve
modern şehir referansı uygulandı; tüm büyük savaşlar/şehirler **PARTIAL**.
Portre/makale metni ithali yok. Gerçek browser/GPU/görsel kabulü ChromiumEPERM
nedeniyle **BLOCKED**; fizikselAndroid **UNVERIFIED ON DEVICE**. Doğum/ölüm/
ikamet kanıtı, dönem ve yaklaşık konum ayrı; diğer kişilere nokta uydurulmadı.
RawExpoDOM/CSP/origin, bağımlılık güvenliği, erişilebilirlik/TalkBack ve cihaz
performansı için önceki kritik engeller kapatılmış sayılmaz.


**18 Ekim 2026 — kısa adlar/kompakt UI ve ülke incelemesi sonrası NO-GO sürer.**
307ana+5worker/lint/strictTS/hash/lisans/NOTICE ve web/AndroidJS export PASS.
2000/2010'da Libya ve Çad kaynaklı yaklaşık alan olarak görünür. Etkin12951/428;
2010:191/180/11. Kaynak metadata korunur, ana UI sadeleşir. Yeni6browser/
production44yalnız listelendi; ChromiumEPERM, screenshot0; Android
**UNVERIFIED ON DEVICE**. Üç kaynak alan sürümü, bağımsız yıllık tarihî
doğrulama veya tüm ülke/yıl kabulü değildir. [Son rapor](reports/compact-country-map.md).
Aşağıdaki17Ekim sayıları o incelemenin kaydıdır.
**17 Ekim 2026 — MS2010 incelemesi sonrası yayın NO-GO.**
304ana+5worker/lint/native+webstrictTS/asset kapıları ve web/Android JS export
PASS. İki kaynak kusuru giderildi: Fransa anakara/Korsika ile açık kısmi alan,
Hollanda yinelenen çizim askısı.2010:191kaynak/178çizilebilir/13askıda;
Libya/Çad/Tunus ve diğer kaynak sorunları sürer. Tarihî kaynak rekonstrüksiyonu
ve yayıncı lisansı bütün sınırların bağımsız tarihsel doğrulaması değildir.

Ülke adıyla gerçek sitelink açma ve timeline ölçekleri uygulandı; yeni4browser
senaryosu yalnız listelendi. Chromium sandbox EPERM, screenshot0; canlı API
terminal DNS engelli. Gerçek Wikidata CORS/pop-up/native dönüş **NOT TESTED**.
Android Java/adb/SDK yok, **UNVERIFIED ON DEVICE**. Güncel npm audit EAI_AGAIN;
bağımlılık sayısı/NOTICE veya güvenlik kabulü uydurulmadı.
[Son rapor ve gerçek loglar](reports/application-review-2010.md).
Aşağıdaki tarihli sonuçlar eski kapı durumlarını korur; tablo güncel açıkları
özetler. Ürünün yeniden kurulması veya yeni bir faz başlatılması önerilmez.

**Güncel — fiziksel10m ve seçilmiş siyasi pilot eklendi; yayın NO-GO sürer.**
Katalog0.5.0-polity-pilot:67kayıt/8kaynak/16yeni siyasi kimlik/32alan parçası;
14tam kaynak alan kaydı ve iki kaynağın18parçası. Bu nedenle aşağıdaki
“tam siyasi polygon0” tespiti güncel değildir. Kültür geometrisi hâlâ0;
bütün dünya/tüm yıllar ve bağımsız tarihî sınır denetimi tamamlanmış sayılmaz.
269ana+5worker, lint/strictTS ve hash/format/export kontrolleri PASS;
106browser testi listelendi, gerçek koşu EPERM, screenshot0. Android
**UNVERIFIED ON DEVICE**; APK derlenmedi. SEC-RAW-DOM/CSP/bağımlılıkNOTICE/
platform/erişilebilirlik kapıları açıktır. [Güncel test/veri kanıtları](atlas-data-integration.md).
10m fiziksel paketin boyutu ve gerçek Android GPU maliyeti ayrıca kabul kapısıdır.

**V3 güncel kapı — NO-GO:** [Son rapor](ui-map-audit/ui-and-map-redesign.md),
[sınırlamalar](ui-map-audit/known-limitations.md).255ana+5worker, lint/strictTS,
hash/format ve web/Android JS export PASS.104browser senaryosu yalnız listelendi;
production preview EPERM nedeniyle E2E exit1, gerçek görüntü yok. Fiziksel
Android **UNVERIFIED ON DEVICE**.50m indirme ve npm audit EAI_AGAIN; ayrıntılı
Atlas ve tam siyasi/kültür pilot kabulü eksik. Aşağıdaki eski test sayıları
kendi rapor anlarını anlatır; ham DOM, gerçek CSP/origin, NOTICE, kaynak zinciri
ve platform/erişilebilirlik kapıları kapanmadı. Yerel önizleme CSP'si runtime
kanıtı değildir. Eski Faz17 yayını başlatılmadı.

2026-10-16 · [Güncel ürün iyileştirme raporu](reports/product-rework.md): AUD-01–07 kapandı; worker eval kodu kapatıldı, gerçek platform/CSP kanıtı açık.

2026-10-16 · **NO-GO — genel kullanıma yayın onayı verilmedi.**
Denetim ve güvenli küçük düzeltmeler teslim edildi; açık kabul kriterleri
BLOCKED durumundadır. Çalışan geliştirme önizlemesi yayın kabulü sayılmaz.
Faz 17 başlatılmadı. [Komut kanıtları ve kabul matrisi](reports/phase-16.md).

| ID | Önem / durum | Engel | Kapanış için gereken kanıt |
| --- | --- | --- | --- |
| SEC-RAW-DOM | Yüksek / BLOCKED | Expo'nun kurulu ham taşıması uygulamanın 4KiB şemasından önce JSON.parse ve framework dispatch çalıştırıyor | İncelenmiş sürüm/yama veya kontrollü taşıma kararı; parse öncesi byte/depth/schema sınırı, bozuk/büyük mesaj ve native action adversarial testleri; Android debug/release |
| SEC-WORKER-DYNAMIC | KOD DÜZELTİLDİ / runtime PARTIAL | Opsiyonel eval fallback AST ile kapatıldı;5worker testi, hash/NOTICE ve doğrudan sink0 taraması PASS | Gerçek worker/CSP/GPU deneyi açık. unsafe-eval ile kapatma yok |
| SEC-ORIGIN-CSP | Yüksek / PARTIAL | Staged web sunucusunda gerçek CSP response header kanıtı var (sha256, no unsafe-eval). File bootstrap pin / native file-origin / redirect-frame olumsuz testleri yok | Tek bootstrap URI/session bağı; native file-origin deneyi; seçilen public hostta header tekrarı |
| SEC-DEPS | Yüksek / PARTIAL | Audit alındı; güvenli fix ile node-forge/uuid yolu kapandı (15→11). Kalan 3 high Expo major force ister | Breaking olmayan uyumlu güncelleme veya bilinçli kabul kaydı; force downgrade yok |
| WEB-E2E | Yüksek / PASS (bu ortam) | Production 86/86 PASS; Chromium bu VM’de çalıştı. Uzak Release runner tekrarı henüz yok | Aynı lock ile CI/Release job yeşili; görsel baseline insan incelemesi ayrı |
| DATA-SOURCE | Yüksek / BLOCKED | Wikidata pilotları özgün API yanıtı yerine açık etiketli editöryal çıkarım; bütün statement referansları bağımsız doğrulanmadı | Sabit revizyonların özgün yanıtlarını hash ile arşivle; statement/ref/takvim/anlam incelemesini kayda geçir. Ulaşılmayanı doğrulanmış sayma |
| DATA-PERSON | Kritik yanlış konum / RENDER MITIGATION PASS; içerik BLOCKED | Van Gogh konum iddiası bağımsız incelemede desteklenmedi | İki kayıt coğrafyadan askıda; yaklaşık/nearest/cache/arama odak yolları testle kapalı. Geri açmak için doğrudan kaynaklı zaman–yer kanıtı ve yeni inceleme sürümü gerekli |
| DATA-POLYGONS | Ürün kapsamı / PARTIAL | Dünya siyasi rekonstrüksiyonları mevcut; etkin12951çizilebilir kaynak satırı/428askıda.2010'da180çizilebilir/11askı; Fransa kısmi. Çad2024ayrı kaydı ve kültür pilotu açık | Kaynak/kimlik/dönem/topoloji boşluklarını ayrı incele; bütün dünya tamlığı iddia etme. Gerçek web/Android seçme ve ayrı lisanslı kültür pilotu gerekli |
| WIKI-LIVE | Entegrasyon / NOT TESTED | Şemalı canlı sitelink istemcisi ve sentetik transport testleri PASS; gerçek API CORS/pop-up/referrer/native dönüş kanıtı yok | Ağ erişimli web ve fiziksel Android'de TR/EN/missing/timeout/429; gerçek hosting connect-src ve güvenli harici sekme testi |
| ANDROID | Kritik platform kabulü / UNVERIFIED ON DEVICE | Java/adb/SDK yok; native build/gerçek cihaz smoke yapılmadı | APK debug/release; fiziksel cihaz/GPU/WebView sürümü ile touch/pinch/rotation/back/offline/reopen/external browser dönüşü ve ölçümler |
| A11Y | Yüksek / BLOCKED | TalkBack, gerçek focus sırası, büyük yazı ve görsel kontrast incelemesi yok | [Erişilebilirlik matrisi](accessibility-audit.md) gerçek platformlarda tamamlanmalı |
| LICENSE-TRANSITIVE | Yüksek / BLOCKED | 873lockgirdisi/781kök lisans dosyalı; tüm release/native transitif NOTICE yükümlülükleri incelenmedi | Dağıtılan web/APK dosyalarıyla eşleşen lisans/NOTICE paketi; metadata veya kök dosya yokluğunu izin/ihlâl kanıtı saymadan kapsamlı incele |
| PRIVACY-HOST | Yayın önkoşulu / BLOCKED | Yayın sunucusu/CDN kayıt politikası, sorumlu/iletişim ve gerçek ağ incelemesi yok | Gerçek deployment davranışına göre politika; gereksiz telemetri/izin olmadığına dair release ağ/manifest kanıtı |
| CI-CLEAN | Doğrulama / OPEN | Workflow hazır; Node24 temiz CI koşusu burada yapılmadı | Aynı lock ve generated çıktılarla gerçek yeşil CI; yerel Node26 sonucu CI kanıtı değildir |

Historical Basemaps **BLOCKED FOR REDISTRIBUTION** kalır; OHM nesne/üye hak
incelemesi tamamlanmadan üretime girmez. Bu kaynakların dışarıda tutulması
çalışan fiziksel tabanı engellemez; onları uygulamaya eklemek kapanış şartı değildir.

Kapanan küçük açıklar: revizyonu farklı immutable kaynak URL'si reddi,
HTTPS parser normalizasyon hilelerinin reddi ve yerel bootstrap query/hash
navigasyonunun reddi. Bunlar framework taşıması/CSP kapısını kapatmaz.


## Proje geneli ek inceleme — 2026-10-16

[Ek analiz](reports/project-audit-2026-10-16.md) iki P1 ve beş P2 hata ekledi;
inceleme anında çözümleri uygulanmamıştı. [Ürün iyileştirmesi](reports/product-rework.md) AUD-01–07 için testli düzeltmeleri ve üretim0.4.1/ETL1.6.0 çıktısını teslim etti. Aşağıdaki metin önceki tespiti anlatır; bu yedi hata artık açık değildir. AUD-01 kişi exactOnly sınıflandırması ve AUD-02 genel ETL
yayın/review kapısı tarihî doğruluk için önce kapanmalıdır. AUD-03 kaynak URL
bağı, AUD-04 üst kaynak closure'ı, AUD-05 dönem/chunk tutarlılığı ve AUD-06
kalıcı yer imi kurtarma ve AUD-07 JSON anahtar sırası bağımlılığı da kayıtlıdır. Harita tarafındaki mevcut konum askısı
çalışıyor; genel ETL çıktı kapısı bundan ayrı eksiktir. NO-GO korunur.

## Ürün düzeni sonrası kalan kapılar

-50m fiziksel detay indirme EAI_AGAIN;110m tabanla sınırlı. Ayrıntılı Atlas içerik kabulü PARTIAL.
-84browser senaryosu yalnız listelendi; gerçek koşu exit124, loopback/Chromium EPERM. Ekran görüntüsü yok.
-249ana+5worker ve web/Android JS export PASS, gerçek Android UNVERIFIED ON DEVICE.
-Katalog0.4.1-pilot:19kayıt/7kaynak,4026yılın2'sinde yaklaşık coğrafya; tam siyasi/kültürel polygon0.
-Güncel audit EAI_AGAIN; ham DOM/CSP/NOTICE/platform kapıları kapanmadı.
