# Risk ve belirsizlik kaydı

**Faz16 yayın kararı NO-GO:** [güncel kapanış kanıtları](release-blockers.md)
ve [güvenlik denetimi](security-audit.md) bağlayıcı güncel kayıttır. Kişi coğrafyası
askıya alınarak yanlış konum riski azaltıldı; içerik incelemesi bitmedi. Ham Expo
parse/dispatch, worker eval, origin/CSP, audit/transitif NOTICE, gerçek browser/
Android/TalkBack ve siyasi/kültürel pilot kapıları açık. Aşağıda önceki risk
kayıtları korunur; eski kurulum/“sonraki faz başlamadı” ifadeleri güncel kabul
kararı yerine geçmez.

## Faz 13 güncel kapıları — 2026-10-16

- **BLOCKED — gerçek platform:** arama/odak/yer imi/share browser senaryoları
  keşfedildi; localhost8081 EPERM nedeniyle çalışmadı. Android **UNVERIFIED ON
  DEVICE**: yeniden açılışta yerel dosya, cold/warm link, geri/rotasyon/TalkBack,
  arka plan remount kamera ve gerçek büyük/antimeridyen bbox görünümü ölçülmedi.
- **OPEN — depolama:** web origin/profil temizliği ve kota; çoklu sekmelerde
  transaction yok, son yazma kazanır. Android aynı dizinde temp+rename, seri
  commit; elektrik kesintisine karşı fsync/flash dayanıklılığı iddiası yok.
  App data silme/uninstall yer imlerini siler. Android allowBackup false olsa da
  üretim merged manifest/OS taşıma davranışı release cihazda incelenmeli.
- **OPEN — link:** yalnız root custom scheme; verified HTTPS App Links için
  üretim domain/assetlinks/sertifika yok. Başka uygulama aynı scheme'i sahiplenebilir.
  Browser Web Share desteği değişir; seçilebilir URL fallback var. Kamera
  koordinatı kullanıcı GPS konumu değildir; sorgu/bookmark adı URL'ye yazılmaz.
- **OPEN — arama ölçeği:**1000 kayıt/220ms/8 sayfa/128 yıl adayı, snapshot kopyası;
  çok büyük katalogda bellek/parçalama ve p95 ölçülmeden genişletilmez. Gerçek
  kültür/full polity polygon yok; sentetik test gerçek pilot yerine geçmez.
- **OPEN — bağımlılık:** kurulu SDK57 FileSystem57.0.7 MIT doğrudan sabitlendi;
  legacy API gelecekte SDK yükseltmesinde yeniden kontrol edilir. Offline lock
  "0 vulnerabilities" güncel audit değildir. Eski audit/transitif NOTICE, A-04,
  Expo raw bridge/origin/CSP, gerçek CI ve önceki veri kabul kapıları sürer.


## Faz 12 güncel kapıları — 2026-10-16

- **A-03 FIXED (CODE / REGRESSION PASS):** bölgeye özgü siyasi ilişki ve onun
  kaynağı diğer bölgenin kartına taşınmaz. Genel entity ilişkisi korunur.
  [Önce FAIL](reports/phase-12-a03-before.txt), [sonra PASS](reports/phase-12-a03-after.txt).
- **OPEN — güncellik/kimlik:** iki QID'nin snapshot'ı canlı servis değildir;
  ileride taşıma/merge yeniden review ister. Cache sürümlü ve bounded; harita
  hareketi HTTP üretmez. Raw API erişimi DNS engelli, resmî sayfa çıkarımı açık
  etiketli ve hash bağlıdır; özgün yanıt veya bağımsız tarihî doğruluk sayılmaz.
- **BLOCKED — gerçek browser:** localhost EPERM; yeni kaynak, fallback ve dış
  sekme senaryoları keşfedildi ama çalışmadı. Popup engeli null dönüşten güvenle
  saptanamaz; ilk hedef allowlist kontrolü dış tarayıcının sonraki redirect'lerini
  denetlemez. Ağ yokken yerel kaynak okunur, dış sayfa internet gerektirir.
- **UNVERIFIED ON DEVICE:** dış işleyiciden geri dönme, kamera/yıl, TalkBack,
  GPU, rotasyon ve işlem ölümü. AppState yalnız oynatmayı durdurur; kalıcı
  process-death oturum geri yüklemesi eklenmedi. Native HTTPS işleyicisini OS seçer.
- **Önceki kapılar:** A-04 gerçek görsel baseline, tam siyasi/kültürel polygon,
  bağımsız tarih/konum araştırması, Expo raw bridge/origin/CSP, güncel npm audit,
  tam transitif NOTICE ve gerçek Node24/GitHub CI sürer. Commons medyası hâlâ
  üretimden reddedilir. Aşağıdaki kayıtlar önceki fazların tarihî durumudur.


Faz 09 güncel takip: A-01 bağlı siyasi/kültürel tarih çelişkisi validator ve
motor filtresiyle giderildi, regresyonları PASS. A-02 unit job npm ci içeriyor;
temiz GitHub/Node24 koşusu ayrıca bekliyor. A-03 siyasi kart kapsamı ve A-04
snapshot baseline açık kalır. Aşağıdaki denetim özeti önceki durumu kaydeder.

Kültür riskleri: **BLOCKED — gerçek alan/iddia/lisans incelemesi** (üretimde 0);
yoruma dayalı kültür sınıflandırmasını egemenlik sanma; yoğun geometride GPU,
etiket ve erişilebilirlik ölçümü; global alpha azaltımının seyrek alanları da
inceltmesi; sitelink kanıtı için güvenilen ETL/release ve insan incelemesi.
Sayfa/ID/revizyon bütçeleri çalışma zamanı güvenliğine katkıdır, Expo raw taşıma
ve fiziksel cihaz kabulünün yerine geçmez. [Faz 09](reports/phase-09.md).

2026-10-16 fazlar arası denetim: [dört yeni açık ve kanıtları](reports/phase-audit-00-08.md).
Entity–territory tarih çelişkisi üretim kapısında yakalanmıyor (**yüksek**);
temiz CI unit işi bağımlılık kurmuyor (**yüksek**); siyasi kart bölgesel ilişki
kapsamını ayırmıyor (**orta**); görsel test baseline'ları yok (**orta**).
Bu tur düzeltme yapılmadı. Mevcut NARA pilotunda tarih/kapsam çelişkisi
bulunmadı; veri modeli açıkları sentetik karşı örneklerle gösterildi.

## Faz 08 güncel siyasi katman kapıları

- **BLOCKER — VERIFIED POLYGON ACQUISITION / RECORD REVIEW:** mevcut gerçek
  katalog yalnız NARA sınır kesiti; tam siyasi alan 0. Cliopatria dosya alımı
  DNS, Seshat API 403. Geometriyi tahmin etme/modern sınırla doldurma yok.
  [Kanıt ve kapanış koşulları](reports/phase-08-source-review.md).
- **OPEN — sınıflandırma ve başkent iddiası:** politicalProfile'ın her alt
  iddiasında temporal/evidenceIndices ve production review kontrolü, başkentte
  zaman/yer kanıtı; bu otomatik bilimsel doğrulama değildir. İnceleyici locator'ın
  gerçekten iddiayı desteklediğini ayrıca doğrulamalı.
- **OPEN — örtüşme ve küçük alan:** bounded etiket collision/priority ve 8 aday
  seçimi, ad/çizgi biçimi/kart; palet hash çakışmaları mümkündür. Gerçek yoğun
  polygonlar, küre arkası DOM etiketleri ve TalkBack/GPU performansı ölçülmedi.
- **OPEN — geometri sınırı:** düzlemsel sunum ankrajı/kamera büyük bileşene gider;
  kutupsal/sferik tam fit ve istatistiksel yüzölçümü iddiası yok. Lisanslı gerçek
  antimeridyen/küçük/örtüşen pilotlarla cihaz kabulü gerekir.
- **BLOCKED — yeni UI runtime:** yerel tarayıcı bağlantısı EPERM; fiziksel
  Android **UNVERIFIED ON DEVICE**. JS export veya injected lifecycle testleri
  bu kapıları kapatmaz. Önceki audit bulguları bu fazda giderilmedi.

Tarih: 2026-10-15 · Faz 00. Olasılık/etki nitel proje değerlendirmesidir, ölçülmüş istatistik değildir. Sorumlular atanmış kişi değil, gelecek fazlardaki görev rolleridir. **OPEN** kapanış kanıtı yok; **BLOCKED** belirtilen varlığın ilerleyemediği anlamındadır.

| Kimlik | Risk / olasılık / etki | Durum ve tetikleyici | Azaltım ve kapanış kanıtı | Sorumlu rol |
| --- | --- | --- | --- | --- |
| R-01 | Android WebGL2/GPU uyumsuzluğu / orta / kritik | OPEN; boş küre, constructor hatası, context loss | Minimal yük ve doğru GPU ayarıyla hata ayrıştır; V-02/V-05'i iki fiziksel GPU ailesinde geç; aksi halde ADR alternatif araştırması | Renderer |
| R-02 | Expo/Metro ESM worker/CSS export sorunu / orta / yüksek | OPEN; geliştirmede çalışan harita release veya offline'da açılmıyor | Aynı sürüm worker/çekirdek, MIME/URL/CSP kontrolü, temiz release/uçak modu; DOM wrapper ve açık WebView'i ayır | Platform |
| R-03 | Çok WebView, büyük geometri, JS/texture bellek artışı / yüksek / yüksek | OPEN; PSS veya frame bütçesi aşımı | Tek aktif WebView, veri bölme, sınırlı cache/LOD/DPR, V-04/V-08; heap ile toplam PSS'yi karıştırma | Performans |
| R-04 | Bridge şeması veya lifecycle güvenliği / orta / yüksek | OPEN; bozuk/büyük/stale mesaj veya dış sayfanın native erişimi | Versiyon+oturum+allowlist, runtime schema, payload limiti, iptal/ack; V-06 kötü mesaj ve yeniden mount deneyi | Platform/güvenlik |
| R-05 | Historical Basemaps geometri hak zinciri belirsiz / yüksek / kritik | **BLOCKED FOR REDISTRIBUTION**, HB-REDIST-01 | Dosya/nesne ve özgün kaynak hakları açıklığa kavuşmadan dağıtım yok; sicildeki kapanış kanıtları gerekir | Veri/lisans |
| R-06 | OHM karışık nesne/üye lisansları / yüksek / yüksek | OPEN; relation veya üyede istisna/çelişki | Nesne revizyonu+kaynak+license/attribution taraması; uygun atıf/SA planı veya dışlama; çözümlenmemiş kayıt manifesti geçemez | Veri/lisans |
| R-07 | Kültürel alanı devlet sınırı sanma / yüksek / kritik | OPEN; tek lejant/tek polygon sınıfı | Ayrı tip/lejant; örtüşmeye izin; S-01/S-02 editör incelemesi; siyasi polygonu kültüre çevirme reddedilir | Alan modeli/editör |
| R-08 | Seçilebilir yılı eksiksiz tarihî kapsama sanma / yüksek / yüksek | OPEN; snapshot arası taşıma veya boşluğu yokluk diye anlatma | Bölge/zaman/katman kapsamı ve görünür eksiklik; kaynak olmayan ara yıl interpolasyonu yok | Ürün/veri |
| R-09 | Kişiye uydurma tarihli konum atama / yüksek / kritik | OPEN; doğum yeri/ikamet/başkent tüm yaşama yayılıyor | Kaynaklı zaman-konum iddiası zorunlu; genel biyografik yerler ayrı sınıf; PR-07 olumsuz testleri | Alan modeli/editör |
| R-10 | MÖ, takvim, yıl sıfırı ve aralık uçları / orta / yüksek | OPEN; ±1 yıl veya gün uydurma | Ham tarih+takvim+hassasiyet koru, kaynak adaptörü başına sınır testleri; MÖ 1/MS 1 ve inclusive/half-open testleri | Veri modeli |
| R-11 | Günümüz kıyısı/etiketleriyle anakronizm / yüksek / yüksek | OPEN; modern ülke yazısı veya eski çağ kıyısı iddiası | Fiziksel stil allowlist, siyasi label kaynağı hiç alma; tabanın günümüz referansı olduğuna dair açıklama; ekran görüntüsü denetimi | Kartografya |
| R-12 | Wikimedia metin/medya lisansını CC0 sanma / orta / yüksek | OPEN; sitelink veya image URL ile otomatik metin/görsel alma | İlk sürüm dış bağlantı; medya/metin için ayrı hak kaydı; kaynak gösterimi ve lisans metni denetimi | Veri/lisans |
| R-13 | API rate limit / CORS / CSP / çevrimdışı origin / yüksek / yüksek | OPEN; 429, worker/font hatası, kontrolsüz sorgu | Statik katalog, bounded concurrency/backoff/cache, HTTPS ve aynı origin asset, V-03; CORS/güvenlik ayarını topluca kapatma yok | Platform/veri |
| R-14 | Demo servis kesintisi veya hosting kotası / orta / yüksek | OPEN; harita demosu üretimden çağrılıyor | İzinli düşük boyutlu tabanı kendi sürümlü assetlerinden sun; hizmet koşulları/egress ayrı değerlendir; dış demo URL'sini build kapısında denetle | Yayın/platform |
| R-15 | Font/glyph/sprite ve tile hakları eksik / orta / yüksek | **BLOCKED FOR REDISTRIBUTION**; henüz seçilmemiş varlık | Yazısız fiziksel tabanla başlayabilir; seçilen her dosya ve türev glyph hakkı sicile girmeden paketleme yok | Kartografya/lisans |
| R-16 | Bağımlılık boyutu, transitive haklar ve sürüm kayması / orta / yüksek | OPEN; adayın bundle/APK maliyeti bilinmiyor | Tam sürüm lockfile, release boyut farkı ve bildirim envanteri; [mimari bütçeleri](architecture.md) aşılırsa yeniden karar | Platform |
| R-17 | Kaynak sitesi erişimi / eski ve yeni beyanların çelişkisi / orta / yüksek | OPEN; Seshat şartları 403, WHG eski genel lisans sayfası | Erişilmeyeni doğrulanmış sayma; güncel kaynak bazlı şartı esas al; yayın öncesi metin/sürüm kaydı | Araştırma/lisans |
| R-18 | Az içerik veya editör darboğazı / yüksek / orta | OPEN; pilotların lisans/kanıt kapısı kapanmıyor | Sayı kotasıyla geometri uydurma yok; az ama kaynaklı kayıt; boş katman ve bekleyen inceleme dürüst raporlanır | Ürün/editör |
| R-19 | Erişilebilirlik / native panel ve DOM odak çatışması / orta / yüksek | OPEN; TalkBack veya klavye işlemi tamamlanamıyor | Harita dışında erişilebilir kayıt/tarih/katman/kaynak yolları; V-07; etiket ve desen yalnız renge bağlı değil | UI |
| R-20 | Projenin kendi kod lisans metni olmaması / kesin / orta | **CLOSED — OWN CODE/DOCS**, Faz 01 LICENSE eklendi | Kod/belgeler MIT; dış bağımlılık ve veri bildirimi R-16/L-13 kapsamındaki açık kapıları korur | Proje/yayın |
| R-21 | Registry DNS/eksik cache nedeniyle kurulum ve lock üretilememesi / gerçekleşti / kritik | **BLOCKED**, npm EAI_AGAIN; Router/ESLint cache'i eksik | Resmi registry erişimiyle sürüm/peer teyidi, gerçek package-lock, npm ci, tam lint/typecheck/export/smoke; yalnız doğrudan sürüm sabitlemek yeterli değil | Ortam/platform |
| R-22 | Java/Android SDK/adb ve native build kanıtı eksikliği / gerçekleşti / kritik | **BLOCKED**, Faz 01 ortamında araçlar yok | JDK/SDK kurulumu, prebuild/Gradle derlemesi ve gerçek cihaz açılışı; JS export veya config dosyasını APK başarısı sayma | Ortam/platform |

Temel kanıt ve teknik kaynaklar [mimaride](architecture.md), veri/hak kanıtları [kaynak matrisinde](source-matrix.md) ve [lisans sicilinde](license-register.md). Riskin belgelenmesi riskin çözüldüğü anlamına gelmez. Özellikle R-01–R-04'ün emülatör veya masaüstü sonuçlarıyla fiziksel Android adına kapatılması yasaktır.

Varsayımlar: tek aktif haritanın yeterli olacağı, küçük pilot kataloğunun statik dağıtılabileceği ve hedef cihazların bir bölümünde WebGL2'nin çalışacağı henüz test edilmemiştir. İlk iki renderer deneyi bu varsayımları sınar; olumlu sonuç alınmazsa derin veri/arayüz kapsamı büyütülmez.

## Faz 02 açık kapıları

| Kimlik | Risk / gerçek durum | Azaltım ve kapanış kanıtı |
| --- | --- | --- |
| R-23 | **BLOCKER**: MapLibre 6 ESM/import.meta + Metro, CSS ve Blob worker; paketler yokken derlenebilirlik bilinmiyor | Aynı sürüm self-contained worker; web/native export, gerçek release offline deneyi. File izinlerini sessiz genişletme. R-01/R-02 kapanmadı |
| R-24 | **BLOCKER / UNVERIFIED ON DEVICE**: GPU, touch-parent ScrollView, dönme, geri, bellek ve context cleanup | DPR≤2, tek worker/WebView, blur/background unmount kaynakta; iki fiziksel GPU ailesi + V-01–V-08 ölçümleri. Hiçbir performans metriği doğrulanmadı |
| R-25 | **OPEN / RAW TRANSPORT VALIDATION BLOCKED**: Expo framework dış JSON'u app boyut sınırından önce parse eder | Yalnız paketli DOM, URL politikası; ham bozuk/büyük zarf testini yap; gerekiyorsa açık WebView'de parse öncesi limit. Uygulama şeması geçmesi tam taşıma güvenliği değildir |
| R-26 | **BLOCKER**: fiziksel veri/worker/Notice null; lisans uygunluğu dosyanın indirildiği anlamına gelmez | Ağ+kurulum sonrası globe:prepare, provenance/hash/lisans ve boyut incelemesi; fallback küre kabulü sayılmaz |
| R-27 | **OPEN**: Hosting CSP/native file politikası gerçek export'ta sınanmadı; önerilen CSP Expo inline bootstrap'ı engelleyebilir | Gerçek hosting header/hash/nonce ve native export ayrı test; development HTTP origin release'e taşınmasın |

R-21/R-22 kurulum/SDK engelleri sürer. Yeni platform bağımlılıkları için
[0/21 raporu](reports/phase-02-dependency-report.json); boyut/transitif hak kapısı
BLOCKED. [Cihaz raporu](reports/phase-02-device.md) başarılı test yerine plan yazar.

## Faz 03 arayüz kabulü

| Kimlik | Risk / durum | Kapanış kanıtı |
| --- | --- | --- |
| R-28 | **BLOCKED**: gerçek web/native layout, küçük/yatay ekran ve fontScale≥2 | Kurulum sonrası gerçek ekran ölçümü, 320×568/800×360/geniş monitör snapshot'ı + insan incelemesi; Android çentik/navbar/IME |
| R-29 | **BLOCKED**: modal odak/restore, TalkBack, WebView arkada touch alması | Kaynaktaki Modal/odak/pointer önlemleri yetmez; keyboard-only/Escape/geri/TalkBack ve pan/pinch deneyi |
| R-30 | **OPEN**: sistem gliflerinin görünüm farkı ve UI önizlemesini gerçek veri sanma | Biçim+etiket+kontrast testi; cihazda glif kontrolü; görünür boş katalog/yıl önizleme açıklaması |

Faz 03 kaynak çalışması kullanıcının açık talebiyle yapıldı; R-21–R-27 ve gerçek
Faz 02 küre kapısı kapanmadı. Ayrıntılar [raporda](reports/phase-03.md).

Faz 02 onarım takibi: kaynakta load handler hatası/yinelenen marker/context
cleanup eksikliği üç başarısız regresyonla üretildi ve düzeltildi. Worker regex
kontrolünün yorum/string yanlış pozitifleri AST ile giderildi. Bunlar R-01/R-02/
R-21–R-27 platform risklerini kapatmaz: registry DNS ve doğrudan bağlantı hâlâ
erişilemiyor, gerçek worker/asset/MapLibre kurulumu ve native cihaz yok.
[Önce/sonra kanıtı](reports/phase-02-repair.md).

Kurulum sonrası: R-02 için web ve Android/DOM **export** kanıtı var; runtime/file
origin/GPU kapısı kapanmadı. R-21 paket kurulum engeli kısmen aşıldı, tam check PASS;
yeni kilitli native çiftin kurulumu hâlâ bekliyor. R-26 kara fetch'i ve browser
socket EPERM açık. Kullanıcının 31 audit bulgusu için ayrıntı alınamadı, kapatılmadı.
ESLint çalışma hatası 9.39.5 ile giderildi; 9 serisinin bakım uyarısı sürüyor.
[Somut sonuçlar](reports/phase-02-post-install.md).

Hazırlama sonrası güncelleme: kilitli bağımlılıklar **23/23**, fiziksel kara/worker/
NOTICE hash kontrolü ve tam kalite kapısı PASS. R-26'nın null-varlık/indirme engeli
kalktı; aynı riskin runtime/offline kısmı doğrulanmadı. Chromium launch sandbox
EPERM ve fiziksel Android yokluğu nedeniyle R-01/R-02/R-24 açık.
Gerçek audit'teki 29 paket kaydı dört temel GHSA üzerinden geliyor; güvenlik
kapanışı yapılmadı. [İnceleme](security-review.md), [güncel kanıt](reports/phase-02-prepared.md).

## Faz 04 veri modeli riskleri

| Kimlik | Risk / durum | Azaltım ve sınır |
| --- | --- | --- |
| R-31 | OPEN — beyan edilen kaynak/review flag'i gerçeklik kanıtı değil | Raw SHA/revizyon/locator ve upstream zinciri zorunlu; insan bilimsel/hak incelemesi gerekir. Checksum özgünlük sağlamaz; güvenilen release manifesti gerekir |
| R-32 | OPEN — bounded düzlemsel topoloji küresel/kutup/çok karmaşık geometrileri kapsamaz | Bütçe/antimeridyen/temas/sıfır alan hataları üretimi durdurur; sessiz onarım yok. Gerçek pilot öncesi ileri GIS incelemesi |
| R-33 | OPEN — küçük statik indeksi büyük dünya arşivine uygulama | 1000 kayıt, 4 MiB JSON, 1024 konum/geometri, 100 sonuç/sayfa; ilk pilot sınırları. Bbox eşleşmesi kesin polygon kesişimi değildir; sharding/performance henüz ölçülmedi |
| R-34 | OPEN — karışık lisans yükümlülüklerini tek kayda sıkıştırma | V1 farklı lisans/atıf bağını uyuşmazlık olarak reddeder. Conditional onay hash/revizyon bağlı; listenin başlangıcı boş. HB engeli üst kaynaklarda da geçerli |

Kaynak/tarih belirsizliği koruma ve üretim ret kapıları sentetik testlerle geçti;
gerçek pilot/veri lisansı onaylanmış sayılmaz. Android/GPU, runtime ve audit açık
kapıları korunur. [Faz 04](reports/phase-04.md), [model sınırları](data-model.md).

## Faz 05 pilot riskleri

| Kimlik | Durum / risk | Azaltım ve kapanış |
| --- | --- | --- |
| R-35 | OPEN — antlaşma meridyenini ölçülmüş güncel sınır sanma | 141°B ideal kesit, 65–68°K açık görüntüleme penceresi, approximate/medium/null tolerans; tam polygon veya fiilî egemenlik iddiası yok |
| R-36 | OPEN — tek snapshot'ı başka yıllara uzatma | 1867-06-20 dahil tek gün; yıl penceresi yalnız 1867'de eşleşir. 1866/1868/2026 ve katman kapama testleri; kaynak kartında gerçek gün |
| R-37 | BLOCKED — OHM canlı üye/geometri alımı ve kaynak incelemesi | EAI_AGAIN; San Marino'da boundary source fixme. Raw/audit karantina aracı hazır, otomatik üretim onayı yok |
| R-38 | OPEN — kaynak çıkarım SHA'sını upstream arşiv özgünlüğü sanma | Temsil türü editöryal çıkarım; kaynak URL/madde ve tarih korunur. Tam HTTP yanıtı/hash'i olmadığı açık; hak onayı yalnız bu dar SHA/revizyon |
| R-39 | BLOCKED — yeni pilotun gerçek görüntüsü ve native seçimi | Web/Android JS export ve injected renderer testleri yeterli değil. Gerçek web çizgi/kaynak/layer/yıl denemesi ve fiziksel Android offline/bridge/GPU gerekir |

Diğer çağ/kültür/geografya çeşitliliği kaynak yetmediği için eksik kaldı; geometri
uydurulmadı. R-05 Historical Basemaps ve önceki cihaz/audit kapıları korunur.
[Kalite raporu](data-quality.md), [faz sonucu](reports/phase-05.md).

## Faz 06 — zaman motoru riskleri

- Kaynak adaptörü support=continuous değerini yanlış atarsa sürekli sınır
  iddiası oluşabilir. Bilinen uçlar, kaynak açıklaması, aynı temporal+geometri
  kanıtı ve editöryal review gerekir; iki uç yıldan bu değer üretilmez.
- Astronomik/historik numaralama kayması ortak yardımcılar ve MÖ/MS altın
  testleriyle engellenir; gün anahtarı gerçek gün süresi değildir.
- Nearest snapshot kullanıcıyı yanıltabilir: varsayılan kapalı, açık düğme,
  kaynak yılı uyarısı, ayrı selectedYearMode ve yıl değişince kapanma uygulanır.
- Uzun örtüşen aralıklarda indeks en kötü O(n); katalog 1000 kayıt/64 dönem,
  cache 32 yıl ile sınırlıdır. Büyük dünya ölçeği ve Android performansı ölçülmedi.
- Sistem saati yanlışsa günümüz üst yılı da yanlış olabilir; statik katalog
  kapsamı bundan etkilenmez. Takvim değişiminde üst yıl yenilenir.
- Yeni önizleme UI'sinin gerçek tarayıcı/Android ve erişilebilirlik kabulü
  ayrıca gerekir; önceki Faz 05 kullanıcı testi bu yeni kontrolü doğrulamaz.

## Faz 07 — oynatma/çizelge riskleri

- Dar mobil slider'ın hassasiyeti: 20/200 yıl ölçeği ve doğrudan MÖ/MS girişi;
  TalkBack/dokunma/rotation/IME gerçek cihaz kabulü açık.
- Çok hızlı seçim: 80 ms birleştirme, AbortSignal ve revision; local senkron
  döngü kesilemez, geç sonuç atılır. Sonraki ağ adaptörü signal'ı I/O'ya bağlamalı.
- Tutarsız yıl: ortak contextYear/atomik frame, ayrı requested/source yıl ve
  setData sonrası doğrulanan ACK; bu fiziksel GPU/FPS kanıtı değildir.
- Oynatma veri boşluklarını doldurmaz; 100 yıl/adım tek yıllık snapshot'ı
  atlayabilir. Kaynak işaretleri ve açık kapsam mesajı korunur; otomatik snap yok.
- Çok kaynaklı çizelge: 24/64 gerçek-yıl işaret bütçesi, seyreltme açıklaması;
  marker seyreltmesi katalogdaki kayıtları silmez veya tarih interpolasyonu yapmaz.
- Yeni UI'nin web görsel/klavye ve Android bellek/FPS kabulü açık; önceki
  kullanıcının globe/pilot testi bu yeni oynatma deneyimini doğrulamaz.

## Faz 10 — kişi katmanı risk güncellemesi

- **R-PERSON-SOURCE / OPEN:** tek pilotun bağlı müze referansı bağımsız alınamadı.
  İncelenmiş Wikidata olgusu medium/approximately documented; kesin filtreye
  sokulmaz. Özgün JSON ve birincil belge edinme/yeniden inceleme gerekli.
- **R-PERSON-MEDIA / BLOCKED FOR PACKAGING:** P18/dosya linki hak izni değil. Ayrı
  medya asset manifesti yokken üretim görseli reddedilir; pilot görselsizdir.
- **R-PERSON-RUNTIME / BLOCKED:** 64 DOM küme ve projeksiyon/arka yüz süzgeci
  bütçe ve double testleriyle sınırlı; gerçek GPU/Android dokunma, döndürme,
  gizlenme, ekran okuyucu ve bellek/FPS ölçümü yapılmadı.
- **R-PERSON-IMPORT / OPEN:** mock cache/backoff/timeout testleri gerçek servis
  erişimi değildir. DNS kısıtı sürer; kotaya göre CLI ertelenebilir.
- A-03 siyasi ilişki kapsamı ve A-04 gerçek screenshot baseline açık kalır.
  Önceki Expo ham taşıma/origin/CSP, tam transitif NOTICE, güncel npm audit ve
  gerçek Node24/GitHub CI kapıları bu fazda kapanmış sayılmadı.

## Faz 11 — olay riskleri

- **R-EVENT-SOURCE / OPEN:** Dar Wikidata olgu incelemesi bağımsız üst kaynak
  doğrulaması değildir. Antik tarih referans eksikliği, Hastings gün/takvim
  dönüşümü ve modern süreç/aşama tarih farkı kart ve kalite kaydında açık.
- **R-EVENT-GEOGRAPHY / OPEN:** Dört kayıttan üçü geometrisiz. Savaş alanı veya
  çok yerli antlaşma tek ülke/şehir merkezine çevrilmez; yeni alan ancak kaynak/
  hak/topoloji/tarih incelemesiyle eklenir.
- **R-EVENT-RUNTIME / BLOCKED:** Birleşik kişi/olay marker grupları 128 DOM küme +
  sınırlı alan etiketleri potansiyeline sahiptir. Double/bütçe testleri gerçek
  Android PSS/FPS/touch/arka yüz veya erişilebilirlik ölçümü değildir.
- **R-EVENT-ALTERNATIVE / OPEN:** Alternatif iddialar kartta korunur; canonical
  indekse otomatik eklenmez ve bağımsız tarih uzlaştırması yapılmadı.
- **R-EVENT-OFFLINE / PARTIAL:** Statik veri/renderer ağsız sorgu testi geçti;
  gerçek Android uçak modu ve kalıcı asset yüklemesi henüz ölçülmedi. Dış kaynak
  bağlantısı ağ isteyebilir; yerel atıf/metin kalır.
- Önceki A-03/A-04, gerçek Node24/GitHub CI, Expo ham taşıma/origin/CSP, güncel
  audit/transitif NOTICE ve Faz 02 cihaz kapıları sürer.

## Faz 14 — katman ve tercih riskleri

- **R-PREFS-DEVICE / UNVERIFIED ON DEVICE:** Host disk ve web-storage adaptör
  testleri gerçek Android FileSystem yeniden açma, süreç öldürme veya browser
  reload/çoklu profil kabulü değildir. Ayrı key/file ve4KiB strict şema hazır.
- **R-PREFS-CONCURRENT / OPEN:** Aynı profilde birden çok sekme son yazan tercihi
  saklar; canlı cross-tab senkronizasyon yok. Yazma hatası oturumda uygulanmış
  tercihi kalıcı diye göstermez; bozuk/eski sürüm explicit reset olmadan ezilmez.
- **R-FILTER-COVERAGE / MITIGATED:** Kesin veya güven filtresi boş haritaya neden
  olabilir. Ortak predicate/frame/renderer, kapsam/legend/kaynak metinleri bu
  sonucu tarihte varlık yok diye sunmayı önler; tam veri iddiası yapılmaz.
- **R-HISTORICAL-LABEL / GATED:** Modern yapı koordinatı/ismi bir tarihî yer adı
  değildir. Tarih/coğrafya kanıtı olmayan yer hiçbir yılda etiketlenmez. Fiziksel
  stil guard symbol/glyph/sprite/modern source injection reddeder; bilimsel
  geometri doğrulaması ayrıca gerekir.
- **R-DENSITY-DEVICE / OPEN:**64+64 marker kümesi,8/sayfa seçim, düşük kültür
  dolgusu ve8 seyrek etiket bütçesi gerçek FPS/PSS/ısı ölçümü değildir. Browser
  başlatma/localhost EPERM ve java/adb/SDK eksikliği nedeniyle runtime kabulü açık.
- A-04 baseline, önceki raw bridge/origin/CSP, temiz Node24/GitHub CI, online
  audit ve tam transitif NOTICE kapıları sürer. Faz15 başlamadı.

## Faz15 — performans ve cache kapıları

- **R-PERF-DEVICE / UNVERIFIED ON DEVICE:** Host CPU/GC/cache ölçümleri fiziksel
  Android WebView GPU/PSS/FPS/pil/ısı ve uzun oynatma kabulü değildir. Java/adb/SDK
  eksik; [cihaz tablosu](reports/phase-15-device.md) doldurulmadı.
- **R-PERF-WEB / BLOCKED:** Production-export web benchmark port4173 EPERM ile
  başlayamadı. Navigation/globe-ready/layer latency, kısıtlı ağ ve gerçek browser
  cache kabulü için ölçüm sonucu yok. JS export veya dosya gzip'i runtime kanıtı
  değildir; boş measurements[] raporu korunur.
- **R-BOOTSTRAP-LIMIT / OPEN:** Senkron19 kayıtlı katalog hâlâ birkaç küçük geometri
  içerir.96KiB UTF-8 build/runtime kapısı büyümeyi reddeder. Büyük dünya metadata
  protokolü ve1000 kayıt engine kapısı yeniden tasarlanmadan kapsam büyütülemez.
  Native bundle/module cache tüm büyük geometriyi evict ediyor iddiası yoktur.
- **R-CACHE-QUOTA / PARTIAL:** Tek runtime seri2MiB/32 ve512KiB/8 muhasebe vardır;
  HTTP cache/JS parse/GPU ve başka WebView belleğini kapsamaz. Çok sekmeli/iki
  sürümlü aynı CacheStorage namespace'i transaction lock olmadan yarışabilir;
  IndexedDB/single-writer incelemesi büyük paket önkoşuludur. Mevcut küçük pilot
  kotaların altındadır; gerçek browser disk baskısı henüz doğrulanmadı.
- **R-OFFLINE-BOOT / OPEN:** Paketli pilot/cache kaynakları kontrollü kullanılır;
  Service Worker/app shell offline cold start ve yeni native HTTP origin yok.
  OS cache'i silebilir; tamamen offline ürün veya kalıcı arşiv vaadi yoktur.
- **R-LOD-LOSS / GATED:** Sadece doğrulanmış düz meridyen coarse uçlara iner.
  Genel polygon/vector tile sadeleştirmesi topoloji/ada/delik/antimeridyen/kaynak
  ID/örtüşme regresyonu ve hak incelemesi olmadan devreye alınmaz.
- A-04 baseline, raw Expo bridge/origin/CSP, clean CI/online audit/tam transitif
  NOTICE kapıları sürer. Bu faz yayınlama veya Faz16 başlangıcı değildir.
