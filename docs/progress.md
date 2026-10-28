# Tarih Atlası — İlerleme kaydı

**28 Ekim 2026 — TA-6 Sahne atmosferi: IMPLEMENTED (web); Android UNVERIFIED.**

Küre dışı sahne: saf CSS mürekkep gradient + deterministik canvas yıldız alanı
(kendi MIT kodumuz; üçüncü parti uzay/gece Earth asset yok). MapLibre `sky`
`atmosphere-blend` ile hafif küre halo; kum/mürekkep token glow. Reduced-motion
yıldız drift’ini kapatır. Kara/deniz/siyasi boyalar değişmedi. Dal
`cursor/sahne-atmosfer-eac8` (main @ 780f71db); açık PR #1–#4’e karışılmadı.

**Doğrulama:** native/web strict TS PASS; ilgili unit + lint/prettier PASS;
`web:export` PASS (4 rota, 16102 şehir). Playwright ile uzak/açılış/reduced/
mobil ekran kanıtı alındı. Android cihaz **UNVERIFIED**. Tam `npm run check` ve
86 E2E bu turda koşulmadı. Yayın NO-GO sürer.
Plan: store `docs/sahne-atmosfer.md`.

**22 Ekim 2026 — Release ilk açılış nedenleri: IMPLEMENTED; uzak kabul bekleniyor.**

Son uzak run 39664079314, ae2b990d: kod/veri/lisans check ve web export PASS;
83 E2E PASS / 3 FAIL, paket/Docker/Release SKIPPED; Releases listesi boş.
Renderer load öncesi kamera bildirimi ve aynı konumu geri yükleme onayı
regresyonla yeniden üretilip düzeltildi (önce 1 FAIL, sonra 24/24 PASS).
Ülke testi gerçek katman readiness'ini bekler. Kurulu GeoNames şehir satırı
eşleşmesiz Wikipedia beklentisi yerine kendi doğrulanmış kaynağıyla sınanır.
Bir cache testinin kota dışı bozuk gövde enjeksiyonu deterministik hale getirildi;
17 cache testi PASS. Tarih/geometri/lisans ve bağımlılıklar değiştirilmedi.

Web export, şehir hashleri, release:stage ve release:verify PASS. Yeni browser
strict TS PASS. Yerel Chromium EPERM ile BLOCKED; Docker ve Android bu tur
NOT TESTED / UNVERIFIED ON DEVICE. Tam yerel npm run check PASS: 418 ana + 5
worker, lint, native/web strict typecheck, veri/lisans/hash ve formatter.
Workflow değişikliği main'e ulaştığında yeni run otomatik başlar; ilk açılış
ön kontrolünden sonra tüm 86 E2E zorunludur. Summary her kapıyı açıklar.
Henüz yeni Release veya başarılı uzak kabul iddiası yoktur; kararlı NO-GO sürer.
[Nedenler ve kanıt](reports/release-camera-readiness.md).

**21 Ekim 2026 — Release tarayıcı tekrarı: PARTIAL; 17/86 senaryo hatası kaldı.**

Uzak Release run 39645152356 (commit bae95731) kalite kapısı ve web export
PASS; gerçek kullanıcı akışlarında 17 FAIL / 69 PASS oldu, yayın adımları
çalışmadı. Sende ülke adları ve şehirlerin göründüğü bilgisi alındı. Kod
incelemesinde ülke listesinin kısa ad kuralını atladığı doğrulandı ve hizalandı.
Kartın dış “ek bilgi” kontrolü ile iç kaynak ayrıntısı artık ayrı erişilebilir
ad taşır. Atatürk nokta odağı zoom 3’te kalır; şehir katmanı zoom 4 istediği
için örtüşme E2E’si bir kontrollü yakınlaştırma ekler. E2E yıl yardımcıları
yükleme tamamlanmasını ve gerçekten istenen yılı bekler.

Ülke etiketi ve açılış şehir rozeti CI’da hâlâ eksik raporlanıyor. Tanı eki artık
başlangıç kamera yakınlığını ve ülke/şehir/kişi/olay işaretçilerinin toplam ve
görünür adetlerini içeriyor; GitHub’da yeni çalıştırma olmadan neden
doğrulanamaz. Gerçek browser bu çalışma ortamında Chromium’un sandbox başlatma
çağrısındaki EPERM engeline takılıyor. Sende görünmeleri bu uzak runner farkını
tek başına açıklamıyor.

**Yerel doğrulama:** lint ve native/web strict typecheck PASS; web export 4
route ve 16.102 şehir paketi/645.992.949 byte PASS; 86 browser senaryosu
listeleniyor. npm run check yerel kopyada 415/417 ana testte durdu: Expo
kurulumundaki bundledNativeModules.json yok ve geçici ETL fixture’ı prettier
paketini çözemiyor. Bu iki kurulum/test-fixture hatası test beklentileri
gevşetilerek gizlenmedi. Android ve Docker bu tur test edilmedi. Değişiklikler
henüz GitHub’a gönderilmedi; Release yok ve NO-GO sürüyor.

**21 Ekim 2026 — Release tarayıcı hataları: PARTIAL; hedefli düzeltmeler IMPLEMENTED.**

06fa7efb ile format engeli kapandı; uzak npm check ve web export PASS.
39635270143 Release çalıştırması gerçek tarayıcıda 43 FAIL / 41 PASS ile durdu.
Action web seçili durumu, kompakt Wikipedia etiketi, panel/arama test yardımcıları
ve güncel katalogla uyuşmayan test sabitleri düzeltildi. Aynı yılın kimlik/kişi/
olay arşiv taramaları birleştirildi; bütün eski sonuç ve kanıtlarla eşdeğerlik
regresyonu eklendi. Veri, geometri, lisans ve dış bağımlılık değişmedi.

**Yerel PASS:** npm run check; 417 ana + 5 worker, lint, strict native/web TS,
veri/lisans/hash/formatter. Web export 4 route + 16.102 şehir paketinde PASS.
Yeni browser tanılarının strict TS kontrolü ve
86 E2E senaryosunun listelenmesi PASS; bu browser çalıştırma değildir.
HTTP bind ve Chromium launch ortam engeli nedeniyle yeni E2E **BLOCKED**.
Yıl/renderer, ülke/şehir etiketi ve not silme kabulü hâlâ açık; Docker/Android
bu tur NOT TESTED. Release oluşturulmadı; kararlı yayın NO-GO sürer.
Yerel gönderim kopyasında kod düzeltmesi `07eb9ba8` commit'iyle hazırlandı;
uzak depoya bu ortamdan push yapılmadı. Komut logları ayrıca kayıt altındadır.
[Bulgular ve doğrulama sınırları](reports/release-e2e-ci.md).

**21 Ekim 2026 — Release biçim kapısı: yerelde IMPLEMENTED; uzak Release BLOCKED.**

39632750777 çalıştırmasının c27dd1fc commit'inde lint, native/web tip kontrolü,
414 ana + 5 worker ve veri/lisans/hash kapıları geçti. Son formatter yalnız
src/app/index.tsx için başarısız oldu; build/E2E/Docker/paket adımları atlandı.
Önceki verilen route kodunun biçimi hatalıydı. Yerel route kesin uzak sürümün
Prettier çıktısına eşitlendi; uzak dosyaya göre yalnız whitespace değişir.
Hata tekrar üretildi; birebir formatter çıktısı, hedefli lint/format ve native/web
strict typecheck PASS. Browser, Docker ve Android bu tur NOT TESTED.
Uzak gönderim yapılmadı; Releases boş. Yeni ürün fazına geçilmedi.
[Hata kanıtı ve gönderim adımları](reports/release-format-ci.md).

**21 Ekim 2026 — İlk GitHub CI / Releases takibi: CSS düzeltmesi yerelde IMPLEMENTED; gönderim 403 nedeniyle BLOCKED; Release henüz yok.**

Kullanıcının push işlemi doğrulandı (0129efeb). GitHub'da Node 24.22.0 + npm
12.2.0 temiz kurulum ve 414 ana test başarılı. Kalite işi, üretilmiş expo-env.d.ts
olmadan web CSS importlarını çözemediği için TS2882 ile durdu. Expo'nun kendi
asset/CSS bildirimleri src/types/expo.d.ts üzerinden kalıcı olarak referanslandı.
Üretilmiş dosyalar bulunmayan snapshot'ta hata yeniden üretildi; düzeltmeyle native
ve web strict typecheck, hedefli lint ve formatter geçti. Veri/lisans/dependency
ve ürün davranışı değişmedi; yeni faz başlatılmadı.

Release akışı workflow_dispatch ile manueldir; push yalnız altyapı kontrollerini
başlatmıştır. Mevcut Releases listesi boş; release-preview çalıştırması yok.
Actions → Teknik önizleme paketleri → Run workflow (main, 0.1.0-preview.1)
kontrolleri geçerse taslak önizleme hazırlar. Taslak herkese görünmez; mevcut
NO-GO ve cihaz/ağ/güvenlik kabul kayıtları devam eder.
[CI kaydı ve yeniden üretim](reports/release-first-ci.md).

**21 Ekim 2026 — GitHub / Docker yayın hazırlığı: IMPLEMENTED; uzak yükleme ve container kabulü BLOCKED.**

README tanıtım/kurulum odaklı yeniden yazıldı; özgün SVG banner, katkı ve geliştirme
rehberi eklendi. Docker/Compose, statik HTTP sunucusu, SHA256 dosya manifesti,
web tar.gz ve draft prerelease workflow'u hazır. Gerekli şehir/tarih verileri,
incelenmiş ETL girdileri, test ve atıflar korundu. Ham indirmeler/cache/derlemeler
kaynak yayınından ayrıldı; yalnız eksik dist-android ve test durumu silindi.
Eski expansion kontrolünün güncel toplu registry yerine 144 beklemesi düzeltildi;
220 eşleşme / 594 bekleyen dahil tam özet ve orijinal 29 kişilik paketin kontrolleri korunur.

**PASS:** npm run check (tam lint, native/web strict TS, 414 ana + 5 worker,
veri/lisans/hash ve formatter), web export (4 route, 16.102 şehir paketi),
18.474 dosyanın dağıtım manifesti, 189 MiB tar.gz/SHA256 ve arşiv açma doğrulaması,
Compose config ve shell/YAML sözdizimi. Temiz Git snapshot ayrıca mevcut bağımlılıklar
geçici bağlanarak 414/414 test geçti; bu yeni npm ci değildir. Push gerçekten denendi,
DNS nedeniyle exit128; henüz GitHub dosya yüklemesi veya Release yoktur.
**BLOCKED:** terminal GitHub DNS/gh auth, Docker socket, localhost bind/browser
E2E ve yeni npm audit DNS. Gerçek container çalışması/screenshot yok; Windows
çalıştırma ve fiziksel Android **NOT TESTED / UNVERIFIED ON DEVICE**. APK yok.
Kaynak Git kopyası .publish/repository; yerel web paketi .release/out altında.
**Kararlı ürün yayını NO-GO sürer.** Yeni ürün fazına geçilmedi.
[Dosyalar, komutlar, loglar ve yükleme adımları](reports/github-preparation.md),
[dağıtım kararı](adr/0020-preview-distribution.md), [kurulum](docker.md).

**21 Ekim 2026 — İndirilen kişi/olay kaynaklarının kabulü: IMPLEMENTED; genel dünya kapsamı PARTIAL.**

4.273 JSON + makbuz dosyası kimlik/revizyon/origin/request/byte/SHA256 ve CC0
kontrolünden geçti. 2.969 yeni kişi + 1.084 olay uygulamaya bağlandı; toplam
3.203 kişi / 1.120 olay. 46 yeni doğum yılı noktası (toplam 193) ve 35 yaklaşık
muharebe noktası. Konum atanmayan 2.923 kişi / 1.049 olay arama veya destekli
yıl listesinde bulunur. 51 eski kayıt korunur, 123 adsız, 12 ek kurgu/efsane
incelemesi, 34 insan olmayan/uygun olay olmayan aday paketlenmez. Hamlar silinmedi.

338 parça/32.177.954 byte, yalnız küçük ad/tarih indeksi açılıştadır. Mevcut
800/1.000 sınırları gevşetilmedi; lazy source/detail/year adaptörleri eklendi.
Cache 8, gerçek okuma 2; bunlar test sınırlarıdır, cihaz ölçümü değildir.
Kaynak kalitesi medium; orijinal takvim/qualifier/references ve doğrudan API
sitelinkleri korunur. Yeni dependency, makale, portre, modern/historic ülke
poligonu veya uydurma kişi konumu eklenmedi. Önceki179 isim eşleşmesinde kayıp 0;
823 istekten 220 eşleşmiş / 594 bekleyen / 9 belirsiz atlanan kayıt var.

[Dosyalar, kaynak kapsamı ve test kanıtları](reports/history-import-2026-10-21.md),
[sayısal özet](reports/history-import-2026-10-21/summary.json),
[mimari karar](adr/0019-indexed-history-catalog.md).
Browser E2E preview EPERM nedeniyle BLOCKED; ekran görüntüsü yok. Android JS
export tamamlanmadı/durduruldu exit130; gerçek cihaz **UNVERIFIED ON DEVICE**.
**PASS:** 408/408 ana test (10 yeni arşiv testi dahil), 5/5 worker, tam depo lint,
native/web strict typecheck, değişen kod/metadata/README formatter, 338 paketin
orijinal kaynak/yer/sitelink karşılaştırması ve web export. Komut/exit/loglar
raporda; sonraki faza geçilmedi.

**20 Ekim 2026 — Geniş dünya tarihi içeriği: PARTIAL; doğrulanmış ek paket IMPLEMENTED.**

Wikidata CC0 olgularıyla 56 yeni kişi ve 23 savaş/olay uygulamaya bağlandı.
36 yıllık doğum noktası, 10 biyografik bağlantı ve 10 konumsuz profil; olaylarda
7 yaklaşık muharebe noktası, 16 konumsuz yıl/aralık kaydı. Kaynak revizyonları,
takvim metni, belirsizlik ve checksum kapıları korunur. 79 yeni doğrulanmış
Türkçe sitelink, kısa Türkçe açıklamalar; makale/portre kopyası yok.
Toplam **234 kişi / 36 olay**; doğum sürümlerinde **233 profil / 147 yıllık
nokta / 47 biyografik / 39 konumsuz**. İstenen 823 addan 179’u eşleşti;
635 bekleyen, 9 belirsiz atlanan kayıt. Bir adayda sabit revizyon doğrulanamadı.

Nobel/TIME, bilim insanı, filozof, ruhban, siyasetçi ve savaş/olay grupları için
kontrollü staging toplayıcısı eklendi. Üretime otomatik kabul yok. Tüm Nobel/TIME
ve dünya tarihi tamamlanmadı: terminal API erişimi EAI_AGAIN; Nobel güncel API
koşulları sayfası 403. Mevcut extension 710/800 kayıt; büyük büyüme için metadata/
arama/zaman indekslerini de kademeli yükleme gerekir, limitler gevşetilmedi.

[Kullanım ve daha geniş alım komutları](history-expansion.md),
[dosyalar, testler ve platform sınırları](reports/broad-history-2026-10-20.md),
[kayıt bazında kapsam](reports/broad-history-2026-10-20/coverage.json).

**PASS:** 398/398 ana + 5/5 worker test; 8/8 içerik/toplayıcı testi; tam depo
lint (yinelenen test importları düzeltildi), native/web typecheck, değişen kodda
formatter, kaynak/hash check, web export ve toplu kişi denetimi. Android JS
export tamamlanma kanıtı alınamadı; INCOMPLETE. Browser E2E preview EPERM nedeniyle BLOCKED;
Android gerçek cihaz **UNVERIFIED ON DEVICE**. Sonraki faza geçilmedi.

**20 Ekim 2026 — Uzak görünümde küçük işaretler: IMPLEMENTED.**

Kişi/olay ve kişisel notların boyalı yüzeyi 48 px dokunma hedefinden ayrıldı.
Tek işaret uzakta 8 px, yakında en fazla 24 px; küme 20–28 px. Uzakta etiket
gizlenir; seçim çerçevesi de yalnız küçük yüzeye uygulanır. Zoom hareketinde
aynı DOM öğeleri güncellenir; veri/köprü ve marker yeniden üretimi eklenmez.
Kaynak, yıl ve katman davranışı değişmedi. Yeni veri/bağımlılık/lisans yok.
**PASS:** 390/390 test, tam depo lint, native/web typecheck, formatter ve
web export. Browser görsel kontrolü Chromium izin hatasıyla BLOCKED;
Android gerçek cihaz UNVERIFIED ON DEVICE.

[Değişen dosyalar, test kanıtı ve görsel/Android doğrulama sınırları](reports/marker-scale-2026-10-20.md).


**20 Ekim 2026 — Şehir kartı metin hatası ve 1881 kişi/nokta seçimi: IMPLEMENTED; browser/Android doğrulaması açık.**

Kullanıcının üç görüntüsü incelendi. Boş GeoNames admin2/modifiedAt alanı
React Native Web View altında boş string üretiyordu; gerçek RN Web render'ında
hata yeniden üretildi, boolean koşullarla giderildi. Şehir kartı açıkken kişi
seçimini engelleyen panel kuralı ortaklaştırıldı; gecikmiş şehir okuması yeni
seçimde iptal edilir. Nokta seçerken diğer harita kayıtları akışı kesmez.
Yakınlaşınca işaret altında kaynaklı ad var; şehir dokunma alanı kişi/olayı
kaplamaz. Arama kartının eksik ayrıntı/1881 odağı bağlantısı da düzeltildi.

Toplu kişi denetimi: **177 profil / 111 yıllık doğum noktası / 0 hata**;
37 biyografik, 29 konumsuz kayıt ayrı kalır. Atatürk 1881 Selanik var;
yıllık işaretler zoom1/4/8'de kontrol edildi, komşu yıllara taşınmadı.
Bu, bütün isteklerin yayımlandığı veya tüm noktaların cihazda görüldüğü iddiası değil.

**PASS:** 389/389 ana test, toplu görünürlük denetimi, tam depo lint, native/web
typecheck ve web export (4 rota + statik şehir paketleri). Browser E2E localhost
EPERM nedeniyle BLOCKED; 4 senaryonun listesi testin çalıştığı anlamına gelmez.
Gerçek Android UNVERIFIED ON DEVICE. Yeni veri/bağımlılık/lisans değişikliği yok.
[Ayrıntılı hata, dosya, test ve kullanım raporu](reports/map-card-fixes-2026-10-20.md).


**19 Ekim 2026 — Kısa kişi/olay kartları, doğum görünürlüğü ve kişisel noktalar: IMPLEMENTED; dünya içerik kapsamı PARTIAL.**

Atatürk 1881 Selanik doğum noktası katalogda var; yaklaşık kişi filtresi yeni
kurulumda açık. Eski gizleyen tercihler için yıl bağlamında eylem, kartta açık
doğum yılı/konuma odaklanma var. 1882 veya bütün yaşam süresine konum taşınmaz.
Kısa kart + Wikipedia; kaynak/konum/alternatif tarihler bilgi simgesinde korunur.
Sağ alt kamera tanı düğmesi kaldırıldı. Keşfet üzerinden nokta seçip kişi/savaş/
olay notu ekleme, düzenleme ve silme yerel/kalıcı/daima unverified. 50 kayıt,
60 KB, yıl+katman filtresi, en fazla 8 marker; özel notlar yayın/paylaşıma girmez.

Yeni CC0 ek: 4 kişi (2 yıllık doğum noktası, 2 biyografik bağ), 2 olay;
7 yeni sabit sitelink. Birleşik katalog 178 kişi / 13 olay; istek listesindeki
823 addan 146 eşleşmiş, 668 bekleyen, 9 belirsiz atlanmış. Her ülke tamam değil.
Batı Sahra mevcut siyasi katalogda yok; Keşfet boşluk açıklaması eklendi,
geometri uydurulmadı veya başka ülkeye atfedilmedi. Sınır tamamlama BLOCKED.

**PASS:** 384/384 ana + 5/5 worker; tam depo lint, native/web typecheck; değişen dosyalarda
formatter, global kaynak/hash ve sitelink check; web export (4 rota ve statik
şehir verisi doğrulaması). **BLOCKED:** browser E2E localhost EPERM/45s exit124,
görsel kanıt yok. Android JS export bu denemede tamamlanamadı, durduruldu;
fiziksel cihaz **UNVERIFIED ON DEVICE**. Yeni dış bağımlılık yok.

[Ayrıntılı dosya/kapsam/test ve kullanım raporu](reports/people-notes-2026-10-19.md).
Önkoşullar: gerçek browser ve Android doğrulaması; dönemli Batı Sahra geometri
incelemesi ve daha geniş kişi/olay kaynak taraması. Yeni faz başlatılmadı.


**19 Ekim 2026 — İndirilen dünya referansları: denetim IMPLEMENTED, sınır tamamlama PARTIAL.**

Kullanıcının indirdiği altı dosya receipt/SHA kontrolünden geçti; önceki DNS
engeli bu girdiler için kalktı. Gerçek iki GeoJSON toplamı 26.813.673 byte;
önceki 9,5 MB tahmini düzeltildi. 258 ülke/bölge özelliği ve 298 harita birimi
bağımsız referansla karşılaştırıldı. Denetim, yalnız merkez yerine sınırlı
iç nokta ızgarası ve QID karşılaştırması kullanır; alan/egemenlik yüzdesi üretmez.

Cabinda ve Suriye kuzeydoğusu boşluğu, San Marino/Vatikan'ın İtalya alanıyla
örtülmesi ve küçük ada/kıyı eksikleri raporlu. Hollanda 2024 mükerrer 13741
hash/ad/yıl kontrolüyle kapatıldı, esas 13771 korundu: **195 / 189 / 6**
(kaynak satırı / çizilebilir / kapalı). Modern referans geçmişe taşınmadı.

**Çalıştırılan:** `npm test` **378/378 PASS**; native/web typecheck PASS;
değişen kodda ESLint PASS; `world:check` 374 paket PASS; referans verify ve
genişletilmiş `world:audit` PASS. Yeni bağımlılık yok. Web görsel/E2E/export
**NOT TESTED**, gerçek Android **UNVERIFIED ON DEVICE**.

[Bulgular, lisans kararları, değişen dosyalar ve kanıtlar](reports/world-reference-review.md).
Yeni toplu indirme gerekmiyor. Suriye/Angola'nın yeni üretim geometrisi ve
1453 Bizans için dönem/kaynak incelemesi sürüyor; tüm boşluklar giderilmedi.

**19 Ekim 2026 — Dünya / Suriye 2024 / İstanbul 1453 denetimi: PARTIAL.**

13.797 ham satır, 13.379 siyasi kayıt, 4.026 seçilebilir yıl ve 2024'teki
195 kaynak satırı tarandı. Bunlar bütün bağımsız ülkelerin veya tarihsel
sınırların uzman doğrulaması değildir. 2024'te 190 satır çizilebilir, 5 kapalı;
Angola/Cabinda ve Suriye çevresinde kaynak geometri boşlukları sürer.
Bizans 1440–1467 kaydının tarih incelemesi nedeniyle tümden kapatılması,
1452'de de eksik temsil oluşturuyor; 1453 yıl içi değişimi ayrıca ele alınmalı.

**IMPLEMENTED:** Suriye'nin yanlış Asur QID'si ve Güney Kore, Tayvan,
Kongo Cumhuriyeti, Gine'nin yanlış kimlikleri yalnız hash/ad/yıl korumalı
2024 kayıtlarında düzeltildi. Suriye kısmi alan notu eklendi. Geometri ve
kaynak tarihlerine müdahale edilmedi. Tekrarlanabilir dünya denetimi ve
üretime yazmayan küçük referans indirme/karşılaştırma komutları hazır.

**Test kanıtı:** `npm test` 376/376 PASS; `npm run typecheck` native/web PASS;
değişen kodda ESLint PASS; `npm run world:check` 374 paket / 120.664.555 byte
PASS; `npm run world:audit` PASS. Yeni bağımlılık yok.
**BLOCKED:** gerçek referans indirmesi terminal DNS `EAI_AGAIN`; bağımsız
dünya referans karşılaştırması henüz çalışmadı. `--list` çalıştı;
`--verify` dosya yokken beklendiği gibi başarısız. Görsel/E2E, web export ve
tam depo lint bu tur yeniden çalıştırılmadı. Android **UNVERIFIED ON DEVICE**.

[Ayrıntılı bulgular, kaynak/lisans karşılaştırması, değişen dosyalar ve indirme komutları](reports/world-data-audit.md).
Kalan önkoşul: referans dosyalarını edinip tarih/lisans/eksik bileşen incelemesini
tamamlamak; yeni tarihî sınırları kanıtsız üretime almamak. Yeni faz başlatılmadı.

**18 Ekim 2026 — Tarih araçları ve Çad/Angola/Mali/Tunus: IMPLEMENTED; görsel/cihaz doğrulaması PARTIAL.**

Tam boy tarih yan paneli yerine en fazla 520 px genişlikte, içeriğe göre
boyutlanan, kısa ekranda kaydırılabilen araç penceresi: seçili yıl, ±10/±100,
başlangıç/bitiş, ölçek ve hız ayrı gruplarda. Diğer kartlar ve zaman motoru korunur.
Dokuz kaynak satırı incelenerek mevcut üç satırlık ülke eki v2 / 12 satıra çıktı.
Mali 1960 federasyonu sonraki Q912 ülke kimliğinden ayrıldı; Angola 2024
Cabinda eksikliği kartta kısmi alan olarak açık. Kaynak koordinatları/aralıkları
korunur; geometri uydurulmadı. 2024: 195 kaynak satırından 190 çizilebilir,
5 çelişkili satır kapalı; ülke sayısı veya eksiksizlik iddiası değildir.

**Çalıştırılan:** 372/372 test PASS; son renderer regresyonu 19/19 PASS;
full ESLint ve hedefli ESLint PASS; native + web typecheck PASS;
12 satırlık deterministik çıkarım, NOTICE/hash ve 374 dünya paket kontrolü PASS.
Web export PASS: 4 rota ve 16.102 yer paketi / 645.992.949 byte.
Chromium başlatma EPERM nedeniyle BLOCKED; yeni görsel/E2E senaryoları hazır,
çalışmış sayılmadı. Android **UNVERIFIED ON DEVICE**. Yeni bağımlılık/indirme yok.

[Değişen dosyalar, kaynak kararları, kalan boşluklar ve komut kanıtları](reports/timeline-countries.md).
Yeni faz başlatılmadı. Sonraki kontrol: kullanıcı web'de 2024 ülke seçimi ve
küçük ekran tarih araçlarını; gerçek Android'de dokunma/geri/TalkBack'i doğrulamalı.


**18 Ekim 2026 — Tek atıf paneli: IMPLEMENTED.**

Sol alttaki DOM lisans kutusu tamamen kaldırıldı. Sağ üst © düğmesi mevcut
AttributionPanel'i açar; güncel yol anahtarı, yükleme/hata durumu ve OSM/OMT/
OpenFreeMap bağlantıları bu panelin başındadır. Veri, lisans veya atıf silinmedi.
Yolların kontrolü AtlasScreen'de tutulur; web ve Android için mevcut sürümlü
köprüde isteğe bağlı modernRoads boolean ve sıkı enum roads.status kullanılır.
Yıl/kamera bilgisi korunur. Yeni bağımlılık veya izin eklenmedi.

Dosyalar: GlobeView, AttributionPanel, AtlasScreen, useGlobeHost, viewport/protocol,
modern-roads tipi, mevcut browser testi ve yol köprü unit testi; README/yol raporu.
368 unit test PASS; native + web typecheck ve değişen dosyalarda ESLint PASS.
Görsel browser/E2E bu turda
çalıştırılmadı; Android **UNVERIFIED ON DEVICE**. Yeni faz yok.


**18 Ekim 2026 — Güncel yollar kontrolünü daraltma: IMPLEMENTED.**

Ayrı sağ alt yol kutusu kaldırıldı. Yol aç/kapat düğmesi, yükleme/hata bilgisi
ve sağlayıcı atıfları mevcut **Harita lisansları ve atıflar** açılır bölümünde,
başlığın hemen altında. Bölüm kapalıyken ek kutu yer kaplamaz; yolların açık
olması bölümün açık olmasına bağlı değildir. Kaynak, lisans, veri ve ağ politikası
aynı kaldı. README ve yol raporundaki kullanım yolu güncellendi.

Değişen kod: `src/map/globe/GlobeView.tsx`; mevcut browser senaryosu
`tests/web/modern-roads.spec.ts` önce kapalı olmayı, sonra bölümden açmayı denetler.
ESLint, native + web typecheck ve 3 yol birim testi PASS.
Görsel/E2E bu değişiklikte çalıştırılmadı; Android **UNVERIFIED ON DEVICE**.
Yeni faz başlatılmadı.


**18 Ekim 2026 — Referans renkler / güncel yollar: IMPLEMENTED, canlı web/Android PARTIAL.**

Açık deniz/kara, kararlı pastel ülke dolguları, koyu küçük etiketler ve kültür
kontrastı düzenlendi. Küre ve tarihî veri korunur. Kullanıcının açık talebiyle
bugünkü yollar OpenFreeMap üretim vektör servisinden ayrı, açılıp kapatılabilir
katmana bağlandı; yıl filtresinden bağımsız, modern siyasi sınır/etiket içermez.
Zoom 6–16, yol/arazi/su/bina ayrıntısı; şehir sorgusu mevcut en yüksek LOD'yi
kullanır. Atıf/gizlilik/CSP/URL politikası ve hata/temizlik eklendi. Toplu indirme,
API anahtarı, yeni bağımlılık veya offline tile dağıtımı yok.

367 ana + 5 worker test PASS; son 55 stil/renderer regresyonu PASS;
native+web typecheck ve lint PASS; web export 4 rota ve tüm
şehir paketlerini üretir. Yeni zoom sınırı testleri eski negatif örnekleri
17'ye taşıdı; kontrast/güvenlik beklentileri gevşetilmedi. Canlı tile erişimi DNS,
Chromium sandbox EPERM nedeniyle BLOCKED; ekran görüntüsü/GPU/E2E NOT TESTED.
Android UNVERIFIED ON DEVICE; yayın NO-GO devam eder.
[Dosyalar, komutlar, lisans kaynakları ve gerçek loglar](reports/atlas-colors-roads.md).

**18 Ekim 2026 — entry.js %99 / gerçek dünya şehir verisi: web düzeltmesi IMPLEMENTED, tarayıcı/Android PARTIAL.**

Kullanıcı dünya verisini kurmuş:248ülke/bölge,5.616.753yerleşim/idari/bölüm
kaydı,16.102paket/645.992.949byte. Önceki boş katalog durumu geçersizdir.
Webreader'ın16.102nativeasset/gzipmodülüne bağımlılığı kaldırıldı;145.040.220byte
gzipJSmetni artık browsergrafiğinde yoktur. Metro sadece onaylıhashten statik
veri sunar; webexport tüm doğrulanmışveri/NOTICE'ı `dist/data/places` içine
kopyalar. RawZIP/receipt/asılpaket/gzipdeğerleri korunur; yeniden indirme/ETLyok.

Gerçek manifestte TS2590unionçıkarımı giderildi: JSONveri okuması ve aynı
runtimeşema/lisans/SHAkontrolü. Yalnız safgeneratedgzipstringiçeriği lintAST'si
yerine mevcut decodedşema/SHAkapısında incelenir; uygulama/loaderlint'i sürer.
NativeUI/DOMyerel adaptörü ve WebViewizinleri/bridge değişmez; büyük native
paketleme/cihaz ölçümü açık risk. Yeni bağımlılık veya faz yok.

Son tam `npm run check`: **363ana+5worker PASS**, lint/native+web strictTS,
gerçek16.102pakette kaynak/hak/row/hash/DOMkopyası ve diğer kaynak/format kapıları.
Ek21yer testi ve son middlewarelint'i PASS. İlk web1808modül/21849ms;
tekrar1808modül/2497ms (sıcak cache),4rota +tüm statikdataexport PASS.
Webentry12481155byte; bunlar FPS/GPU/başlangıç süresi iddiası değildir.
Gerçek TRidari kayıtları8paketokumasıyla kaynak/route/SHAüzerinden doğrulandı;
browserçıktısında şehirgzipJSmodülü0. Devserver/socketdenemesi EPERM/portnull
nedeniyle BLOCKED; tarayıcı/GPU/screenshot/E2E NOT TESTED. Yeni Androidexport
çalıştırılmadı, **UNVERIFIED ON DEVICE**. YayınNO-GO sürer.

Kullanıcı komutu: mevcut sunucuyu Ctrl+C, ardından `npm run web -- --clear`.
[Teşhis, dosyalar, gerçek loglar, kapsam ve sınırlar](reports/metro-places.md).

**18 Ekim 2026 — Açılış2024 / şehir-ilçe teşhisi: IMPLEMENTED / veri kurulumu BLOCKED.**

Boş açılış MS2024; paylaşım URL'si ve yer imi tarihi öncelikli, takvim üst sınırı
günümüz olarak kaldı. Eksik dünya şehir paketinde işlevsiz ülke arama/listesi ve
sayfalama kaldırıldı; gerçek yüklenmedi mesajı gösterilir. Altı referans şehir,
tarihî ülkeler ve kişi akışları korunur.

Dünya manifesti versionnull/0ülke/0paket/0kayıt; `assets/places` yok.
`places:download --verify` SOURCE_NOT_DOWNLOADED; gerçek10snindirme denemesi
EAI_AGAIN. GeoNames dosyaları kurulmadı, tam şehir/ilçe kapsamı iddiası yok.
Kullanıcıda kurulum komutları README/modern-places belgesine alındı. Büyük dosya
için yalnız GeoNames indirmesine kontrollü7200snsınırı eklendi; diğer harita
indirmelerinde30dkve tüm bayt/retry/tekistek kotaları korunur. Yeni bağımlılık
veya yeniden dağıtılan kaynak yok; resmî GeoNames README/CCBY4.0 tekrar incelendi.

Ana359/worker5test PASS; lint/native+web strictTS, web4rota ve AndroidHermes+DOM
JSexport PASS. Exported HTML içinde MS2024 doğrulandı; GPU testi değildir.
Güncellenen34browser senaryosu yalnız listelendi; Chromium shutdownEPERM,
görselE2E/screenshot BLOCKED. Android **UNVERIFIED ON DEVICE**, ölçülmeyen
performans iddiası yok. Önceki yayınNO-GO sürer, yeni faz başlatılmadı.
[Dosyalar, komutlar, gerçek sonuçlar ve kurulum](reports/opening-year-places.md).

**18 Ekim 2026 — Kişi listesine devam / Osmanlı grubu: IMPLEMENTED; tüm liste PARTIAL.**

33 yeni profil, 22 kaynaklı doğum-yılı noktası, 8 yalnız biyografik yer ilişkisi,
3 noktasız profil eklendi. Önceki üç kişiyle kullanıcı listesindeki **36 Osmanlı
padişahının tamamı** aramada kaynaklı profil olarak bulunur; saltanat/ikamet
rotası çıkarılmadı. Küre, ülkeler, şehirler ve önceki kişi ID'leri korunur.

Üç ayrı release: 1.0.1-births / 1.1.1-births / 1.2.0-births. İlk iki sürümde
P569 circa/disputed/presumably niteleyicilerinin yıllık nokta kararına taşınması
düzeltildi; Kanuni 1494/1496 kaynak ayrışması biyografik tutuldu. Beş eski
yıllık doğum noktası biyografik sınıfa geçti; profiller silinmedi.
Toplam **174 profil /109 yaklaşık doğum-yılı noktası**; bu sayı aynı anda
haritada 109 kişi veya kişinin bütün yaşamı boyunca konumu demek değildir.

823 isteğin 144'ü kaynaklı profile eşleşir; **665 kişi** incelemede, 5 müzik
grubu kişi değildir; kullanıcı isteğiyle 9 belirsiz kimlik atlanır. Elealı
Zenon kararı korunur. Terminal DNS EAI_AGAIN sürüyor; yeni staging indirmesi
yok. Resmî Wikidata sayfalarından 33 kişi revizyonu incelendi. CC0 olgular,
TDV çapraz kontrolü, Wikipedia makale metni ve görsel hakları ayrı tutulur.

`npm run check`: **358 ana +5 worker PASS**, lint ve native/web strictTS,
kaynak/hak/SHA/sürüm/format kapıları PASS. Web dört rota ve Android Hermes+DOM
JS export PASS; APK veya gerçek GPU doğrulaması değildir. Yeni dört Playwright
senaryosu yalnız listelendi. Chromium sandbox shutdown EPERM: ekran görüntüsü
ve görsel E2E **BLOCKED**. Android **UNVERIFIED ON DEVICE**, performans ölçülmedi.
Önceki yayın **NO-GO** sürer. Yeni faz başlatılmadı.

[Kaynak/karar tablosu](reports/ottoman-people-coverage.md),
[değişen dosyalar, loglar ve doğrulama sınırları](reports/ottoman-people.md).
Aşağıdaki sayılar önceki çalışma anlarının kayıtlarıdır.

**18 Ekim 2026 — Geniş kişi isteği: IMPLEMENTED / tam içerik PARTIAL.**

952 ad geçişi ve kategori/parantez bağlamı saklandı; 823 ayrı istek. Yeni
listeden 111 kaynaklı profile eşleşme (82 önceki +29 yeni), 698 kişi kaynak
incelemesinde, 5 müzik grubu kişi doğumu değildir. Son kullanıcı yanıtıyla
Zenon=Elealı Zenon; diğer 9 belirsiz ad atlandı, arama/toplama/üretim dışında.

Yeni1.1.0-births: 29 profil, 26 doğum-yılı noktası, 2 yalnız biyografik ilişki,
1 noktasız profil; 86 domain kayıt, 61 source ID, 4 paket, 334671 byte JSON.
Öncekilerle Van Gogh dahil 141 profil, 92 doğum noktası. Eski ID'ler ve ülke/
şehir/olay/diğer akışlar korunur. Ham SHA, revizyon, hak/atıf/NOTICE,
256KiBpaket/512KiBpilot/64girdi ve 1000timeline bütçeleri korunur. Bilinmeyen
ölüm için sahte tarih yok; kaynaklı tek doğum yılı yalnız o yıl desteklenir.
Kullanıcı yazımları sadece arama ipucudur.

Toplu kişi/yer collector TR/EN/insan kimliği/cache/resume/SHA/receipt/429backoff
ve kotalı tek istekle staging üretir; productionApproved=false. Terminal DNS
**EAI_AGAIN**: 698 kişi bu ortamda indirilmedi veya üretime alınmadı. Büyük
üretim kapsamı için kaynak incelemesi ve chunk/indeks işi açık; 823 harita
kişisi iddiası yok. [Kullanıcı komutları](people-expansion.md),
[her istek için durum](reports/requested-people-coverage.md),
[dosyalar, kaynaklar ve loglar](reports/requested-people.md).

Son `npm run check` exit0: **352ana+5worker PASS**, lint/native+web strictTS,
kaynak/hash/hak/format ve ayrı yeni release kapısı. Web4rota/AndroidHermes+DOM
JSexport PASS; APK değildir. Yeni6browser senaryosu yalnız listelendi;
Chromium shutdownEPERM nedeniyle screenshot0/görselE2E **BLOCKED**.
Java/adb/SDK yok, Android **UNVERIFIED ON DEVICE**; FPS/RAM/pil ölçülmedi.
Önceki yayın NO-GO sürer. Yeni faza geçilmedi; aşağıdakiler önceki kayıtlardır.

**18 Ekim 2026 — 113 isim için kaynaklı doğum incelemesi: IMPLEMENTED / içerik PARTIAL.**

113 ayrı kimlik (Wrightkardeşler ayrı):111kaynak revizyonlu profil;66yalnız
doğum-yılında yaklaşık nokta,20yalnız biyografik yer,25geometrisiz profil.
JamesWatt/Arşimet kaynak revizyonu alınamadığı için ayrı bekleyen listede;
tarihlerinin tarihte bilinmediği iddia edilmez. Kaynaksız yıl/yer, yaşamdan
ikamet veya rota çıkarımı yok. Atatürk1881Selanik;19Mayıs kesin gün sayılmaz.
Newton1643Gregoriyen. Belirsiz/geleneksel kronolojiler korunur; bölge/krallık
şehir merkezi yapılmaz.66noktanın her biri önceki/sonraki yıl için sınandı.

Kaynaklıdoğumrelease1.0.0-births:14ayrıkatalog,308kayıt/208sourceID,
1166801byteJSON; enbüyük92131byte. Kodda iki onaylıhamSHA, paketSHA/sürüm,
lisans/atıf/NOTICE ve kotalıimmutableprovider.512KiBpilot/64girdi/256KiBpaket
sınırları yükseltilmedi. Eski10kişi/NewtonEinsteinişaretIDleri korunur;
VanGogh dahil112profil, birleşikyerelkayıt392. Dünya/şehir/olay/diğer akışlar
korunur. Yeni bağımlılık veya görsel/makale ithali yok.

Arama/kişikartı/küre ortakveride; **Doğum yılına git ve yaklaşık konumu aç**
ile açık yıl/tercih seçimi. Varsayılan yaklaşık kapalı; diğer filtreler korunur.
Kamera isteğe bağlı odaklanır. Yeniindirmegerekmez: `npm run people:check`,
`npm run web -- --clear`. [113kişinin kaynak/karar tablosu](reports/person-birth-coverage.md),
[değişen dosyalar, komutlar ve gerçek loglar](reports/person-births.md).

Son ana test344/worker5PASS; lint/native+webstrictTS ve source/rights/hash
kapıları raporlandı. Web4rota/AndroidHermes+DOMJSexportPASS;APKdeğil.
Yeni6browser senaryosu yalnız listelendi; Chromium shutdownEPERM nedeniyle
görsel/E2E **BLOCKED**,screenshot0. Android **UNVERIFIED ON DEVICE**;
Java/adb/SDK yok,FPS/RAM/pilölçülmedi. Önceki yayınNO-GO/güvenlik/cihaz
kapıları sürer. Sonraki faza geçilmedi. Aşağıdakiler önceki görev kayıtlarıdır.

**18 Ekim 2026 — Dünya şehirleri ve ilçe düzeyindeki kayıtlar: PARTIAL.**

Altı şehir sınırını kaldıracak GeoNames dünya dump indiricisi/streamETL, kaynak
manifesti, bbox+LOD hash paketleri, web/native okuyucu ve ülke bazında sayfalı
yerleşim/idari birim listesi eklendi. Aynı küre korunur; modern referans tarihî
yıldan ayrı. Haritada32etiket; zoom4/6/8, seçme ve yıl değiştirmeyen kamera odağı.
Kaynakta üst ad yoksa tahmin yok; idari nokta ilçe poligonu değildir. GeoNames
CC BY4.0 ayrı atıf/NOTICE. Yeni npm bağımlılığı yok. Ham/tarihî/eski altışehir korunur.

**BLOCKED gerçek veri edinimi:** terminal DNS `EAI_AGAIN`; dünya manifesti
versionnull,0yeni ülke/kayıt/paket. Mevcut6referans gerçek kapsam olarak açık
etiketli. Kullanıcının terminalinde `places:download → places:prepare → places:check`
komutlarıyla kurulur. Gerçek büyük veri ETL/kapsam/bundle ölçümü henüz yok.
[Kurulum ve sınırlar](modern-places.md). Son `npm run check` exit0: lint,
native/web strictTS,335ana+5worker ve hash/lisans/format gate'leri PASS.
Web4rota/AndroidHermes+DOMJS export PASS; APK değil.52browser senaryosu sadece
listelendi; Chromium EPERM nedeniyle0screenshot/E2E BLOCKED. Java/adb/SDK yok,
Android **UNVERIFIED ON DEVICE**. [Komut/log ve dosya kanıtları](reports/modern-places.md).
Önceki yayın NO-GO kapıları sürer; yeni faz yok.

**18 Ekim 2026 — Türkiye açılışı ve kaynaklı keşif kartları: IMPLEMENTED / içerik PARTIAL.**

Türkiye kamera35D39K/zoom4; ilk yıl2000, URL/yerimi/odaklama önceliği korundu.
Kısa kişi/olay kartları, gerçek sitelink hizmetiyle Wikipedia; uzun kaynak ve
ayrıntılar açılır. Kişi+olay ortak yuvarlak kümeler, sınır hücre komşuluk
kontrolü ve48px dokunma hedefleri. Altı ayrı güncel şehir referansı zoom4+;
yılla tarihî gerçeklik iddiası üretilmez, tercih yerelde kalır.

Verilen10kişi aramada. Beş yaklaşık yer ilişkisi kaynaklı: Muhammed622–632
Medine ikameti; Newton1643/Einstein1879doğum; Gutenberg1468/Kolomb1506ölüm.
Varsayılan yıl haritasında yaklaşık kişi konumları kapalıdır; opt-in gerekir.
Diğer kişilere konum uydurulmadı; Buda kronolojisi bilinmiyor, diğer tarih
alternatifleri korunur. Yeni7savaş/harekât kaydı; toplam11olay. Bunlar bütün
büyük savaşlar değildir. Dört ek nokta; Sakarya ve dünya savaşları listede.

Katalog0.7.0-discovery:106kayıt/35kaynak,425675byte;86LOD/44chunk.
Yalnız katalog toplaminput sınırı32→64,65ret testi;512KiB/256KiB/per-chunk32
sınırları sürer. Dünya374paket/ham kaynaklar değişmedi. Libya/Çad inceleme
geometrisinin renderer yolundaki eksik inline tanıması da regresyonla giderildi.
Yeni bağımlılık, tile, portre/makale metni veya belirsiz lisanslı veri alınmadı.

318 ana + 5 worker testi, lint ve native/web strict typecheck PASS. Web dört
rota ve Android Hermes/DOM JavaScript export PASS; APK değildir. Yeni altı
browser senaryosu / production toplam 50 senaryo yalnız listelendi.
[Test sonuçları, dosyalar, kaynak revizyonları ve kullanıcı denemesi](reports/turkey-discovery.md).
Gerçek browser ChromiumEPERM: görsel/E2E ve screenshot **BLOCKED**, Android
**UNVERIFIED ON DEVICE**. Tüm savaş/şehir kapsamı ve yayın NO-GO kapıları açık.
Yeni ürün fazına geçilmedi; aşağıdaki sonuçlar önceki çalışmalara aittir.


**18 Ekim 2026 — kısa adlar, Libya/Çad ve kompakt timeline: IMPLEMENTED.**
108kaynak başlığı için kısa etiket eşleştirmesi: Yunanistan/Türkiye/Fransa gibi
adlar harita/kart/arama/listede sadeleşti. Ham/resmî adlar, eski kimlikler ve
uzun adla arama korunur; Roma Cumhuriyeti/ikiKongo gibi ayrımlar silinmez.
Kalıcı kaynak/counter/cache satırları Keşfet'e, kartın uzun dökümü kapalı
kaynak/belirsizlik ayrıntılarına taşındı. ©atfı erişilebilir. Timeline kompakt;
ölçek/cetvel/hız/atlama ayrı açılır panelde. Önizleme/hata uyarıları korunur.

Mevcut CC BY4.0 arşivinden Çad13239 ve Libya13370/13580 kaynakları incelendi.
Çad'ın tek shell-hole teğeti bütün kenarlar/iki delik korunarak doğrulandı.
Libya genel ülke alanı olarak gösterilir; kaynak Q17435890 saklı/ülke makalesi
Q1016. Kaynak dönemleri aynı; yaklaşık/düşük güven, yıllık gözlem veya fiilî
kontrol iddiası yok. CShapes alınmadı.2000:192/180/12;2010:191/180/11;iki yılda
Libya/Çad feature çıktısında var. Etkin12951çizilebilir/428askı;2024Çad ve diğer
boşluklar açık. Yeni veri indirme veya bağımlılık gerekmiyor.

307ana+5worker, lint, native/webstrictTS, format ve hash/lisans/NOTICE kapıları
PASS. Web4rota/AndroidHermes+DOMJS export PASS; APK değildir. Yeni6browser ve
production44yalnız listelendi. ChromiumEPERM, screenshot0; Android
**UNVERIFIED ON DEVICE**, GPU/FPS ölçülmedi. Gerçek görsel/canlı ağ ve önceki
yayınNO-GO kapıları sürer. [Dosyalar, kaynaklar, testler ve çalıştırma](reports/compact-country-map.md).
Yeni faza geçilmedi; aşağıdaki kapsamlar önceki çalışmalara aittir.

**17 Ekim 2026 — proje incelemesi, MS 2010 ve makale/timeline akışları.**
Kullanıcının belirttiği 2010 yılı gerçek kaynak geometrileriyle incelendi.
Fransa kaydındaki Sahra/eski işgal/denizaşırı parçalar aynı kaynak döneminde
birleşiyordu; yalnız değiştirilmeyen anakara/Korsika bileşenleri kısmi alan
olarak tutuldu. Yinelenen Hollanda geometrisinin ikinci çizimi çıkarıldı.
Kaynak kayıtları/ham ZIP/374 immutable asset korundu; koordinat uydurulmadı.
Kuzey Afrika'daki 286 örnek noktada 37 ham örtüşme → 0; tam dünya veya görsel
uyum sertifikası değildir. 2010:191 kaynak satırı /178 çizilebilir /13 askıda;
Libya, Çad, Tunus ve diğer gerekçeli boşluklar hâlâ **PARTIAL**.

Kaynak QID'leri lisanslı, hash'li çıkarımda korunur. Ülke adı kullanıcı eylemiyle
gerçek Wikidata TR/EN sitelinkini, alan seçimi kaynak kartını açar. URL tahmini
yok; ağ/cache/timeout/şema/origin sınırları var. Timeline belirgin yıl ve
tüm dönem/200/20 yıl ölçeğiyle güncellendi; MÖ/MS ve mevcut akışlar korundu.
Kimlik/atıf/gizlilik belgeleri birlikte güncellendi; yeni bağımlılık yok.

Başlangıç295+5 → son **304 ana +5 worker PASS**; lint, native/web strict TS,
format, kaynak/hash/lisans kapıları PASS. Web4rota ve AndroidHermes+DOM JS
export PASS; APK değildir. Yeni4browser senaryosu yalnız listelendi;
Chromium sandbox EPERM nedeniyle görsel/E2E **BLOCKED**, screenshot0.
Canlı Wikidata terminal DNS engelli; gerçek CORS/pop-up **NOT TESTED**.
Java/adb/SDK yok; Android **UNVERIFIED ON DEVICE**, GPU/FPS/RAM ölçülmedi.
Güncel npm audit EAI_AGAIN; lisans/ham DOM/CSP/a11y/yayın **NO-GO** sürer.
CShapes2010 incelemesi180aday/177geometri geçer/3incelemede, üretim onayı yok.

[Değişen dosyalar, komutlar, kaynaklar ve kullanıcı adımları](reports/application-review-2010.md).
Etkin dünya sayımı12948çizilebilir/431askıda; önceki12949/430 ham manifest
değeridir. 4024yılda en az bir alan ≠ eksiksiz dünya tarihi. Yeni faza geçilmedi;
sonraki önkoşul kaynak boşluklarının hak/iddia incelemesi ve gerçek platform
kabulüdür. Aşağıdaki kayıtlar önceki sürümlerin sonuçlarını korur.

**17 Ekim 2026 — siyasi alanları renklerle ayırma: IMPLEMENTED; görsel kabul açık.**
Kullanıcı yıl geçişlerinde sınırları takip edebilmek için farklı ülke renkleri
istedi. Önceki dolgusuz sunum bu yeni istekle değiştirildi: sabit varlık
kimliğinden mat renk, normal 0,72 / seçili 0,80 opaklık, daha belirgin ince
sınırlar. Aynı kaydın adaları ve yıllar arasındaki rengi korunur. Renk siyasi
kimliğin görsel ayrımıdır; bayrak, ittifak veya kesin egemenlik kanıtı değildir.
Kaynak belirsizliği için farklı çizgi desenleri ve daha düşük dolgu opaklıkları
sürer. Göl/akarsu katmanları siyasi dolgudan sonra çizilir. Lejant Türkçe
katalogdan açıklama verir; veri olmayan alanlara renk uydurulmaz.

295 ana + 5 worker testi, lint, native/web strict typecheck, format ve mevcut
dünya paketlerinin hash/lisans kapısı PASS. Yeni testler aynı kimliğin gerçek
2000/2001 görünümlerinde rengini, parçalı adaları ve kontrastı doğrular. İlk
eklenen testin yanlış katman anahtarları düzeltildi; eşik/test kaldırılmadı.
MapLibre stil/ifade değerlendirmesi PASS. 2520 renk kombinasyonu ve fallback
için tek dolgu üstünde minimum metin kontrastı normal 5,06:1 / seçili 4,79:1;
minimum sınır kontrastı 3,27:1. Bu hesap gerçek ekran/örtüşme testi değildir.
Web 4 rota ve Android Hermes+DOM JavaScript export PASS; APK değildir.
Chromium sandbox izin hatası nedeniyle görsel/E2E BLOCKED, screenshot 0.
Android **UNVERIFIED ON DEVICE**; FPS/bellek ölçümü yapılmadı.

Yeni bağımlılık, veri, lisans onayı veya harita motoru değişikliği yok.
CShapes üretime alınmadı; mevcut tarihî kapsam ve yayın NO-GO kararı sürer.
[Değişen dosyalar, test logları ve kontrol adımları](reports/political-area-colors.md).
Sonraki önkoşul kullanıcının desteklenen yıllarda görünümü ve gerçek cihazı
kontrol etmesidir; yeni ürün fazına geçilmedi. Aşağıdaki dolgu kaldırma
kayıtları önceki isteğe göre uygulanmış tarihî çalışma kayıtlarıdır.

**17 Ekim 2026 — CShapes gerçek dosya şeması düzeltildi: IMPLEMENTED; üretim BLOCKED.**
Kullanıcının indirdiği `CShapes-2.0.geojson` artık mevcut:26344671byte,
SHA384b1ea9…f9989d42. İnceleyici yalnız codebook profilini beklediği için
710satırın tamamını desteklenmeyen şema sayıyordu. Dosyada gözlenen
`cntry_name` + `gws/gwe yıl-ay-gün` için açık araştırma profili eklendi;
bilinmeyen/karışık alanlar hâlâ reddedilir. Orijinal gün alanları ve saat
dilimsiz tarih metinleri ayrı saklanır; gün/saat dilimi tahmin edilmez.

Gerçek sonuç:710tanınan/0desteklenmeyen satır;1886-01-01–2019-12-31 gözlenen
uçlar;MS2000'de179dönem satırı/177ayrı kaynak kodu. Bunlar bağımsız ülke
sayısı veya eksiksizlik kanıtı değildir.176aday mevcut geometri kapısını
geçti;İsrail/Vietnam/Avustralya satırları halka kesişimi gerekçesiyle incelemede.
Sağlanan siyasi statü alanı yok;710satırda eksik olduğu açık raporlanır.
Saat dilimsiz export tarihleri710satırda ayrıca semantik inceleme ister.
2026sorgusunda0aday;nearest/çağdaş sınır ekleme yok. Yeni sonuç
`DATA_REVIEW_REQUIRED`;boş/sıfır ülke anlamına gelmez. Raporv2eski v1'i ezmez.

293ana+5worker PASS;lint,strictnative/webTS,format ve mevcut374dünya paketinin
hash/lisans kontrolü PASS. Gerçek dosya SHA'sı kullanıcının verdiğiyle aynı;
CLI tekrar sonucu deterministik,eski rapor korunur. Yeni iki regresyon testi
açık sentetik kayıtlarla tarih kayması/kısmi yıl/eksikstatü/karışık şemayı sınar.
Yeni bağımlılık,renderer/UI veya üretim veri değişikliği yok. Web/Android
build/görsel/cihaz bu turda NOT TESTED;Android **UNVERIFIED ON DEVICE**.
NC/SA lisans kararı ve yayınNO-GO sürer;haritaya yeni CShapes kaydı eklenmedi.
[Rapor, dosyalar ve önkoşullar](reports/cshapes-schema-review.md),
[komut kanıtı](reports/cshapes-schema-review/commands.json).
Aşağıdaki dosya-yok ve eski sayılar önceki denemelerin kayıtlarıdır.

**17 Ekim 2026 — ülke verisi incelemesine devam: araç IMPLEMENTED, gerçek girdi BLOCKED.**
CShapes yerel GeoJSON/ZIP inceleyicisi eklendi: `npm run cshapes:inspect`.
Streaming okuma, boyut/zaman/geometri sınırları, ham SHA, tarih/schema/CRS
envanteri ve MS2000 aday kesişimleri; koordinat veya üretim paketi yazılmaz.
NC/SA veri kararı **CONDITIONAL / üretim onayı yok**; bütün raporlarda
`productionAllowed:false` ve kökenin doğrulanmadığı açıkça bulunur. R/Python
veya yeni npm bağımlılığı yok. Mevcut küre/arayüz/üretim verisi değişmedi.

İnceleme ve İndirilenler klasöründe gerçek CShapes dosyası bulunamadı;
terminalde resmî site DNS hatası verdi. Gerçek kapsam/satır sayısı/şema veya
MS2000 karşılaştırması doğrulanmadı. Eksik dosya komutu beklenen exit2
`CSHAPES_SOURCE_NOT_FOUND` verir; boş başarılı rapor üretmez.

Son kaynakla **291ana+5worker PASS**, lint, strict native/web typecheck,
format kontrolü ve13379satır/374paket dünya hash/lisans kapısı PASS.
Beş yeni test yalnız açık etiketli sentetik veridir; gerçek CShapes onayı
sayılmaz. Ayrı sentetik CLI denemesi rapor yazımı, deterministik tekrar ve
girdi değişmezliğini doğruladı; kendi geçici girdisi/raporu temizlendi.
İlk lintteki açık Buffer importu eksikliği düzeltildi; test gevşetilmedi.
Bu turda web/Android export ve görsel/E2E tekrar çalıştırılmadı;
Android **UNVERIFIED ON DEVICE**, screenshot0. Yayın NO-GO kararı sürer.
[Dosyalar, kullanım ve sınırlar](reports/cshapes-preflight.md),
[gerçek komut logları](reports/cshapes-preflight/commands.json).
Sonraki önkoşul kaynak dosyası, ardından gerçek şema/kapsam ve lisans incelemesi.
Yeni ürün fazına geçilmedi. Aşağıdaki değerler önceki çalışmaların kayıtlarıdır.

**17 Ekim 2026 — saydam siyasi dolgu, Yunanistan ve ülke/yıl veri denetimi.**
Dolgu bütün siyasi seçim durumlarında0; alan seçimi, ince sınır/ad çizimi ve
mevcut3DKüre/fiziksel taban korunur. Yunanistan'ın21bileşenli kaynağındaki iki
izole iç-halka teğet çifti yanlış reddediliyordu; doğrulayıcı düzeltildi.
287pozisyon ve kaynak kenar/köşe çokluklarının aynılığı ayrıca doğrulandı.
Kesişme/ortak kenar/iç içelik/temas ağı hâlâ reddedilir. Ürdün monarşisi resmî
kayıttan kontrol edilip korunur; kullanıcıdaki adın Ürdün olduğu kesin varsayılmadı.

MS2000'in192kaynakPOLITY satırı envanterlendi:179çizilebilir/13incelemede;
bağımsız ülke sayısı veya her satırın bağımsız tarihî onayı değildir. Bahreyn,
Esvatini, Sırbistan-Karadağ, Somali, Angola, Libya ad/dönem sorunları12kaynak
satırında gerekçeli askıda;6'sı2000'i etkiler. Çizilmeme tarihsel yokluk diye
sunulmaz. Dünya revizyon2:12933yeni+16eski çizilebilir satır/430incelemede.
91satır teğet-halka düzeltmesiyle geri kazanıldı.374paket/120664555byte;
metadataSHA00242054…84e2fc8, politika1.3.1. HamZIP/altıstaging dosyası değişmedi.
NARA kapsama indeksinin kaynak-sırası bağımlılığı da evidence kaynağıyla düzeltildi.

286ana+5worker, lint, strictnative/webTS, formatter, dünya hash/kaynak yeniden
üretim,192satır audit, eski pilot/chunk ve6hamdosya kontrolü PASS.
Web4rota ve AndroidHermes+DOM JavaScript export PASS; APK değildir.
Chromium sandbox izni nedeniyle görsel/E2E BLOCKED, screenshot0;
Android **UNVERIFIED ON DEVICE**. Ölçülmeyen FPS/RAM başarısı iddia edilmedi.

CShapes2.0, Natural Earth siyasiAdmin0, geoBoundaries ve OHM birincil kaynaklarla
karşılaştırıldı. CShapes1886–2019 yakın dönem adayı; **CC BY-NC-SA4.0 / üretim
onayı yok**. GeoJSON indirme ve ignoredinceleme klasörü adımları hazır; terminal
DNS engelli, yeni dosya indirilmedi. Çağdaş veri2000'e taşınmadı; başka faza
geçilmedi. Kapsam/tarihî doğruluk **PARTIAL**, önceki yayınNO-GO kararı sürer.
[Araştırma ve indirme](country-data-research.md),
[değişen dosyalar ve gerçek komut logları](reports/country-data-audit.md),
[192satır envanteri](reports/country-data-audit/ms2000.json).
Aşağıdaki dolgu ve eski kapsam değerleri önceki sürüm kayıtlarıdır.

**17 Ekim 2026 — ülke sınırları ve adları: IMPLEMENTED; görsel kabul açık.**
Kullanıcının isteğiyle yalnız siyasi sunum düzenlendi: mat renk paleti,
0,65–1,2px normal/yaklaşık sınır, kutusuz 10–12px ülke adı, 48px dokunma
alanı, klavye odağı ve eşleşen lejant. Yaklaşık/ihtilaflı çizgi desenleri korunur.
Mevcut küre projeksiyonu/kamera/fiziksel taban/veri kapsamı değişmedi.
GeaCron ana sayfası/gömülü harita adresi araştırıldı; canlı harita görsel olarak
açılamadı. Kendisine ait geometri, kod, font, görsel veya renk değeri alınmadı.
Yeni bağımlılık/indirme yok; mevcut kaynak atıfları korundu.

Son kaynakla lint, strict native/web typecheck, 283ana+5worker test,
değişen7kaynak dosyasında formatter, MapLibre stil/etiket/kontrast probe ve
web4rota / AndroidHermes+DOM JavaScript export PASS.
Tek dolgu üstünde en düşük metin kontrastı normal5,17:1 / seçili4,57:1;
çakışan katmanların veya gerçek ekranın tüm kontrastını doğrulamaz.
Chromium sandbox izni nedeniyle görsel/E2E BLOCKED, screenshot0.
Android **UNVERIFIED ON DEVICE**; export APK/cihaz başarısı değildir.
[Dosyalar, komut logları, sınırlamalar ve kullanıcı kontrolü](reports/political-map-presentation.md).
Yeni faza geçilmedi; aşağıdaki kayıtlar önceki çalışmaların durumudur.

**17 Ekim 2026 — yerelde çalıştırma kontrolü.** Kullanıcının çalıştırma isteği
için `npm run web -- --clear` ve açık portla `npm run web -- --clear --port 8082`
denendi. Bu görev ortamında doğrudan `127.0.0.1:8082` dinleme denemesi `EPERM`
verdi; Expo'nun port dolu bildirimi çalışan bir uygulamanın kanıtı değildir.
Sunucu burada başlatılamadı; kullanıcı kendi terminalinde standart web komutunu
çalıştırmalı. Tarayıcı açılışı ve Android cihaz doğrulaması bu denemede yapılmadı.

Dünya sağlayıcısındaki snapshot listesinin readonly dönüşü ortak arayüzle
uyumlu düzeltildi. `npm run typecheck` ve `npm test` (283/283),
`npm run test:worker` (5/5), `npm run lint` ve `npm run world:check`
(13379 kaynak satırı / 369 paketin hash ve lisans kapısı) gerçekten çalıştırılıp
geçti. Değişen iki dosyanın Prettier kontrolü de geçti.
Bu sonuçlar görsel/GPU doğrulaması veya bütün dünya tarihinin eksiksizliği
anlamına gelmez. Önceki plan ve 16 satırlık kapsam aşağıda tarihî kayıttır;
dünya aktarımı uygulama/kalite kontrolü hâlen PARTIAL durumundadır.

**Güncel kullanıcı hedefi — tüm dünya ülkeleri: aktarım henüz PARTIAL.**
Önceki16satırlık pilot hedefi karşılamıyor. Kullanıcının mevcut ZIP'i yeniden
salt okunur tarandı:13797satır/1637farklıName; MS2000için192POLITY,
MS1453için135POLITY+5RELATION, MS2024için195POLITY, MS2026için0.
MS2000geometri kapısı181kabul/11ilave işlem; bu tarihî doğruluk onayı değildir.
Dünya verisinin ana dosyası zaten mevcut; şu an yeni indirme gerekmez.
[Somut genişleme sırası ve engeller](world-coverage-plan.md),
[gerçek dosya sayımı](reports/world-coverage/source-readiness.json).
Bu tur yalnız inceleme/plan: ürün katalogu ve çalışan akışlar değişmedi;
uygulama testleri tekrar koşmadı, dünya entegrasyonu tamamlandı denmedi.

**Güncel — indirilen fiziksel ve siyasi verinin entegrasyonu: IMPLEMENTED / PARTIAL.**
Natural Earthv5.1.2 10m11kara/1355göl/1454dolu akarsu feature'ı DOM'da tembel
yükleniyor; modern sınır/etiket ve servis anahtarı yok.1452indeksli boş akarsu
atlanıp provenance'a yazıldı. Kullanıcının6staging dosyası ve receipt'leri ile
50m varlıkları korunur. Ölçek rozeti geri gelmedi; ürün yalnız gerçek3DKüre.

Cliopatria0.2.1'in13797satırının16'sı açık seçildi:16siyasi kimlik/32alan parçası;
67toplam kayıt/8kaynak, katalog0.5.0-polity-pilot.14alan kaydı tam kaynak
geometrisi,18kayıt iki ayrılmış kaynağın özgün parçaları; kesin egemenlik iddiası
yok. Kaynak zamanları, CC BY4.0 atfı, halka yönü/parça değişiklik bildirimi,
düşük güven ve yaklaşık rekonstrüksiyon korunur. İçe alınan QID/Wikipedia
adayları kullanılmaz; bağımsız tarihî sınır doğrulaması yapılmış sayılmaz.

İlk yıl2000;9ülke/22parça.1453:5varlık/8parça; MÖ500:2varlık/2alan.
4026seçilebilir yılın150'si kaynak destekli,3876'sı desteklenmiyor;
kültür0/askıdaki kişi coğrafyası2değişmedi.68manifest girdisi/35benzersiz
lisanslı chunk; bootstrap298611byte, üst sınır512KiB. Büyük ZIP runtime'a girmez.

269ana+5worker, lint, strictnative/webTS, hash/lisans/sitelink/format PASS;
web4rota ve AndroidHermes+DOM JS export PASS, APK değildir.106browser testi
listelendi; gerçekE2E previewEPERM yüzünden BLOCKED, screenshot0.
Java/adb/SDK yok: **UNVERIFIED ON DEVICE**. Yeni dependency yok; yayın NO-GO.
[Faz raporu ve komut kanıtları](atlas-data-integration.md).
Aşağıdaki indirme engeli ve0tam ülke notları artık tarihî kayıttır.

**Güncel — Cliopatria indirme timeout düzeltmesi.** Kullanıcının üç10mfiziksel
dosyası doğrulanmışcache olarak mevcut; ZIP120s sınırında tamamlanamamış.
ZIP15dakika/deneme, küçük kaynak120s, opsiyonel override en fazla30dakika ve
ilerleme çıktısı uygulandı. Cache/receipt/URL/byte/Retry-After korundu; üç dosya
yeniden indirilmez/silinmez. Byteoffsetresume yok; eksikZIP baştan denenir.
[Değişiklik ve test kaydı](reports/map-download-timeout.md).
Üretim katalogu/lisans kararı değişmedi; ülke dosyası henüz bekleniyor.
262ana+5worker ve lint/strictTS/hash/format kontrolü raporlandı; üçkaynak+
üçreceipt SHA'sı değişmedi. GerçekZIP yeni süreyle aktarım ve Android cihaz
doğrulaması NOT TESTED; CLI düzeltmesi için yeni UIözelliği eklenmedi.

**Güncel — ölçek yazısı kaldırıldı; ayrıntılı dünya/ülke araştırması teslim edildi.**
Ana haritada50m/110m fiziksel ölçek rozeti yok; kaynak/atıf erişimi korunur.
Kullanıcının indirdiği gerçek50m paket bulundu ve1420feature/hash kontrolü geçti;
bu dosyalar yeniden yazılmadı. Önceki aşağıdaki “50myok” kayıtları artık tarihîdir.

Öneri: Natural Earth10m kara/göl/akarsu + Cliopatria0.2.1 tarihli siyasi
poligonları; lisans ve sürümler resmi kaynaklardan incelendi. OpenFreeMap ve
Natural EarthII alternatifleri hak/bağlantı/bellek koşullarıyla karşılaştırıldı.
Yeni `data:download` komutu6sabit dosyayı yalnız ignoredstaging'e indirir:
concurrency1,2deneme,timeout/Retry-After,streambyte limiti,exclusive dosya ve
SHA/edinme receipt. Üretim import'u veya otomatik doğruluk onayı yok.

**260ana+5worker**,lint/strictTS/hash/format PASS. Web/AndroidJSexport ve diğer
gerçek komut sonuçları [araştırma raporunda](detailed-map-research.md).
Burada gerçek10m/ülke ZIP indirme EAI_AGAIN; dosyalar henüz incelenmedi veya
haritaya bağlanmadı. Tam tarihî ülke poligonu hâlâ0; ürünün ana içerik kabulü
**BLOCKED / PARTIAL**. Kullanıcıya indirme/verify komutları ve somut entegrasyon
sırası verildi; kodu kullanıcıdan yazması istenmedi. Yeni dependency yok;
lock/ham katalog ve50m varlıklar korundu. Gerçek browser/Android cihaz kabulü
NOT TESTED / UNVERIFIED ON DEVICE; yayın NO-GO sürer.

**Güncel kullanıcı isteği — yalnız Küre / fiziksel ayrıntı: IMPLEMENTED / PARTIAL.**
2Dgeçiş kontrolleri kaldırıldı; ürün projeksiyonu sabitglobe. Eski tercih/link/
yer imi biçimleri bozulmadan okunur; yıl/kamera/katman korunur.50mhazırlayıcıya
sınırlandırılmış `--input` dosya yolu ve edinme kaydı eklendi; hash/geometri/
atıf kapıları korundu. Üretime sentetik veya yeni tarihî geometri eklenmedi.
Fiziksel veri indirme burada EAI_AGAIN: ayrıntı artışı **BLOCKED**,110mdevam.
Tam ülke poligonu0; ülke bilgisi geometri sayılmaz. Kullanıcının terminalde
çalıştıracağı komutlar [Küre rehberinde](globe-only.md).

257ana+5worker, lint/strictTS/hash/format PASS. Web ve AndroidJSexport logları
rehberde; APK/gerçek Android **UNVERIFIED ON DEVICE**.104browser senaryosu
yalnız listelendi; gerçek E2E portEPERM nedeniyle BLOCKED, screenshot yok.
Yeni dependency yok; eski renderer Mercator sözleşmesi yalnız geriye uyumluluk
ve iç testler için korunur, ürün ekranında2Dyok. Yayın NO-GO; sonraki veri/
platform adımları tamamlanmış sayılmaz. Önceki aşağıdaki kayıtlar tarihîdir.

**V3 kullanıcı görevi — uygulanabilir işler teslim edildi; PARTIAL / yayın NO-GO.**
[Faz0 baseline](ui-map-audit/baseline.md), [plan](ui-map-audit/implementation-plan.md),
[Faz0–16 kabul matrisi ve sonuç](ui-map-audit/ui-and-map-redesign.md),
[yedi audit kontrolü](ui-map-audit/probe-remediation.md),
[kalan kapılar](ui-map-audit/known-limitations.md).

Kompakt üst bar, tek timeline dock, workspace içinde nonmodal varlık paneli ve
mobil genişletilebilir sheet; production/dev ayrımı, kalıcı Atlas/Küre,
altı grupta yerel arama, doğru yer→labels görünürlüğü, açık bookmark kurtarma,
web paylaşım sonucu ve kaynak teknik izlerini açma uygulandı. Ortak MapLibre
korundu; cluster zoom/reduced-motion ve desktop hover kaynak yılı eklendi.
Provider yapılandırması merkezî, yerel CSP önizlemesi ve gerçek A–F/sekiz boyut
testleri hazır. Yeni dış bağımlılık, tarihî veri veya yayın yok.

Başlangıç250+5; son **255 ana +5 worker PASS**. Lint/strict native+web TS,
hak/hash/format ve web4rota/Android Hermes+DOM JS export PASS; APK değildir.
104browser senaryosu/15dosya yalnız listelendi. Üretim E2E exit1 (preview
listen EPERM), Chromium başlangıcı engelli: gerçek ekran görüntüsü0, viewport
piksel ölçümü yok. Java/adb/SDK yok; **UNVERIFIED ON DEVICE**. 50m indirme ve
güncel npm audit EAI_AGAIN. Host CPU/cache ve export byte/gzip/brotli ölçüldü;
FPS/GPU/Android sonucu yok. Ham DOM/CSP, doğrudan kaynak, transitif NOTICE,
ayrıntılı coğrafya ve gerçek platform kabulü açık. Kanıtlar
[son komutlar](ui-map-audit/evidence/final/commands.json) ve
[kaynak farkları](ui-map-audit/evidence/final/changed-files.json).

285başlangıç kaynak hash'i koruma için referans alındı; `.git` görünmediği için
git status exit128, diff/commit yok. Kilit ve ham girdiler değiştirilmedi.
Girdi `geliştirme.md` bütün uygulanabilir fazlarda rutin onay beklememeyi açıkça
ister. Son kullanıcıya hazır kabulü **tamamlanmadı**; açık maddeler BLOCKED /
NOT TESTED olarak raporlandı. Aşağıdaki kayıtlar önceki anları korur.


**Proje iyileştirme çalışması — 2026-10-16: IMPLEMENTED / PARTIAL; yayın NO-GO.**
[Kanıtlı sonuç raporu](reports/product-rework.md), [ADR-0018](adr/0018-atlas-product-rework.md),
[referans incelemesi](reference-review.md), [kullanıcı akışları](product-rework-flows.md).
AUD-01–07 düzeltildi. Üretim0.4.1-pilot/ETL1.6.0 iki askıdaki geometriyi çıkarır,
ham kaynaklar/ID'ler korunur. Aynı renderer'da Atlas/Küre, zoom0–8, opt-in sentetik
marker, harita odaklı üst bar/Keşfet ve kompakt timeline; görünüm türü paylaşıma/
yer imine eklenirken eski biçimler korunur. Worker eval kapalı.249ana+5worker,
lint/strictTS/hash/formatter PASS; web4rota/Android Hermes+DOM export PASS.
84browser senaryosu listelendi; gerçek koşu exit124, loopback/Chromium EPERM;
ekran görüntüsü üretilmedi. Android cihaz UNVERIFIED ON DEVICE.50m indirme ve
güncel npm audit EAI_AGAIN; taban110m ve ölçek uyarısı. Ham Expo DOM, CSP,
transitif lisans, gerçek erişilebilirlik/platform ve gerçek siyasi/kültür
pilot kapıları açık. Yeni tarihî veri/bağımlılık/yayın yok; alt adımlar kullanıcı
isteğiyle rutin onay beklenmeden yürütüldü. Aşağıdaki kayıtlar önceki faz/inceleme
anlarını korur.


Son güncelleme: **2026-10-16**. Güncel faz: [Faz16 — tarihsel doğruluk, QA ve güvenlik](reports/phase-16.md).

**Proje geneli ek inceleme — 2026-10-16:** Kullanıcının analiz isteğiyle7somut hata
tekrar üretildi: yaklaşık kişinin kesin sayılması, genel production ETL'de
askı politikasının eksikliği, oldid'siz yanlış kaynak URL'sinin kabulü,
üst kaynak closure'ı, kesintili dönem/JSON alan sırası chunk hataları, bozuk yer imi kurtarma
eksikliği. **Düzeltme uygulanmadı**; yalnız rapor/kanıt ve durum kaydı eklendi.
Mevcut238+4test/lint/strictTS/hash/format yeniden PASS;78browser senaryosu
listelendi, gerçek Chromium açılışı EPERM; Android araçları yok ve güncel audit
EAI_AGAIN. [Bulgular ve öncelik](reports/project-audit-2026-10-16.md),
[tekrar üretme çıktısı](reports/project-audit-2026-10-16-probes.log).
Yayın NO-GO sürer; Faz17 başlamadı.


**AUDIT DELIVERED / AUTOMATED PASS / RELEASE NO-GO.** 238ana+4worker test,
lint/strict web+native TS/formatter ve asset/pilot/sitelink/chunk kontrolleri PASS;
web4rota ve Android Hermes+DOM JavaScript export PASS (APK/GPU kanıtı değil).
78browser senaryosu/12dosya listelendi; gerçek koşu35s/exit124, loopbackEPERM.
Java/adb/SDK yok; **UNVERIFIED ON DEVICE**. Güncel npm audit EAI_AGAIN; önceki
29paket düğümü/dört GHSA açık. [Yayın engelleri](release-blockers.md).

Kişi coğrafyası bağımsız kaynak incelemesi sonrası askıya alındı; profil/kanıt
arşivi ve özgün SHA korunur. Publication policy1.0.0 hem zaman motoru/kişi sınıfı
hem manifestte uygulanır; yaklaşık/nearest/arama odağı ve eski cache yolları
konumu geri açamaz. Katalog19/7 aynı; aktif4LOD girdisi/3parça. Gizlilik metni
ayarlar/Hakkında'da; kurumsal inceleme bağlantısı kaynak kartında.
4026yıl içinde coğrafyalı yıl2(1066/1867), boş4024, kesin geometri yılı0,
tam siyasi polygon0/kültür alanı0. [Sayısal rapor](reports/phase-16-coverage.json).
873npm lock girdisinin lisans metadata/dosya hash envanteri çıkarıldı; tam
transitif/native NOTICE incelemesi açık. Ham Expo parse/dispatch, worker eval,
origin/CSP, platform/erişilebilirlik ve kaynak zinciri kapıları kapanmadı.
Faz17 **NOT STARTED**. Aşağıdaki faz kayıtları tarihî sonuçları korur.

**Faz15 güncel:**6 bölge/yıl/LOD manifest girdisi /4 benzersiz izinli pilot
parçası üretildi; trusted hash+production hak kontrolü,2 eşzamanlı/bounded queue,
timeout/backoff/AbortController, web CacheStorage ve native özel LRU cache hazır.
Disk2MiB/32, raw bellek512KiB/8; yeni release dışı/bozuk içerik temizliği,
paketli yedek, görünür kaynak/sürüm ve hata/retry eklendi. Ana fiziksel küre veri
hatasında kapanmaz. Arka plan sorgu/oynatma iptali ve aynı görünümde marker/
etiket/bridge tekrarının azaltılması test edildi. Küçük19 kayıtlı bootstrap
korundu ve96KiB kapısı kondu; büyük dünya sağlayıcısına tam göç iddiası yoktur.

**233 ana +4 worker**, lint/strict native+web TS/formatter ve tüm asset/pilot/
sitelink/chunk hak/hash kontrolleri PASS. Web/Android JS export PASS (APK değil).
Host CPU/heap/cache ve export byte/gzip/brotli ölçümleri dosyalandı. Browser74
senaryo/11 dosya listelendi; gerçek benchmark localhost:4173 EPERM nedeniyle
**BLOCKED**, süre/FPS üretilmedi. Java/adb/SDK yok; fiziksel cihaz/ısı/pil/GPU
**UNVERIFIED ON DEVICE**. [Rehber](performance.md), [rapor](reports/phase-15.md),
[cihaz notları](reports/phase-15-device.md), [dosyalar](reports/phase-15-files.txt).

**Önceki Faz14 kaydı:**6 bağımsız kontrol, ortak kesin/güven/siyasi tür/kişi ilişkisi/
olay türü filtreleri, LegendPanel ve kalıcı version1/4KiB tercihler uygulandı.
Coverage/frame/snapshot/renderer aynı filtreyi kullanır; yıl/kamera korunur.
Koyu/TR sabit, sistem veya azaltılmış hareket, seyrek ad modu ve gizlilik/hata
metinleri hazır. Atıf tüm katmanlar kapalıyken erişilebilir. Modern siyasi ad/
kaynak enjeksiyonunu reddeden stil guard çalışır. Yeni paket/veri yok;19 kayıt/
7 kaynak ve link kataloğu aynı. Bağımsız yıllık destekli yer etiketi0.

**214 ana +4 worker**, lint/strict native+web TS/formatter ve hak/hash kontrolleri
PASS. Web/Android JS export PASS; APK değildir. Browser68 senaryo/10 dosya yalnız
listelendi;45s başlatma sınırı ve localhost EPERM nedeniyle gerçek etkileşim
kabulü **BLOCKED**. Host disk/web adaptör kalıcılığı PASS; Android yeniden açma/
TalkBack/rotasyon/geri/GPU **UNVERIFIED ON DEVICE**. [Rehber](layers-settings.md),
[rapor](reports/phase-14.md), [dosyalar](reports/phase-14-files.txt).

**Önceki Faz 13 kaydı:** beş gruplu yerel arama indeksi (8 gerçek canonical sonuç),
Türkçe/aksan normalleştirme,220ms debounce/iptal, açık yıl geçişi ve kaynaklı
kamera odağı eklendi.50 yer imi/64KiB şemalı kalıcı depo, yıl/varlık/kamera
kayıtları, kayıp kimlik önizlemesi, whitelist web paylaşımı ve Android text-share/
root custom deep link hazır. Kamera restorasyonu/tarih aynı doğrulanan zarfla
iletilir; normal yıl değişimi kamerayı sıfırlamaz. SDK57 korunur; önceden kurulu
expo-file-system57.0.7 doğrudan sürüme sabitlendi, MIT metni atıflara eklendi.
Tarihî katalog **0.4.0-pilot /19 kayıt /7 kaynak** ve link kataloğu1.0.0 değişmedi.

**197 ana +4 worker**, lint/strict native+web TS/formatter ve hak/hash kontrolleri
PASS. Web/Android JS export PASS. Manifest introspection custom scheme/blocked
permissions/allowBackup false gösteriyor; gerçek native build değildir. Browser
**62 senaryo /9 dosya** yalnız listelendi; localhost EPERM nedeniyle çalışma
**BLOCKED**. Kalıcılık host disk ve web-storage adaptörü testlerinde PASS; gerçek
Android cold/warm link, yeniden açılış/kalıcılık, kamera/geri/TalkBack kabulü
**UNVERIFIED ON DEVICE**. [Rehber](discovery.md), [rapor](reports/phase-13.md),
[dosyalar](reports/phase-13-files.txt).

Faz00–16 açık kullanıcı istekleriyle yetkilendirildi; **Faz17 NOT STARTED**.
A-01/A-03 düzeltildi; A-04 gerçek görsel baseline, tam siyasi/kültürel polygon,
bağımsız olay üst kaynak/takvim incelemesi, Expo raw bridge/origin/CSP, temiz CI,
güncel online audit ve tam transitif NOTICE kapıları sürer. Aşağıdaki eski faz
sonuçları tarihî kayıttır; yeni cihaz kabulü veya eksiksiz veri iddiası değildir.

**Önceki denetim özeti — düzeltmelerden önce:** [00–08 denetim raporu](reports/phase-audit-00-08.md).
Kalite/JS export tekrar PASS; fakat dört açık bulundu: entity–territory tarih
çelişkisi üretimden geçebiliyor, temiz CI unit işi bağımlılık kurmuyor, bölgeye
özel siyasi ilişki başka bölgenin kartına taşınabiliyor, görsel baseline yok.
Denetim turunda düzeltme uygulanmamıştı. Özellikle Faz 04/06'nın önceki COMPLETE ifadesi
tarihsel test kapsamıdır; yeni semantik açık kapanmadan tam kabul sayılmaz.
Android/polygon/runtime ve güvenlik kapıları sürer. Yeni faz başlatılmadı.

Kilitli kurulum **23/23**, fiziksel kara/worker/bildirimler ve hash kontrolü hazır.
Tam lint/typecheck/test ve gerçek asset ile web/Android JS export **PASS**.
Kullanıcı küre sürükleme, kamera sıfırlama ve sentetik işaret → bilgi panelini
çalışır bildirdi; düzeltme sonrası arka yüzde işaretin kaybolduğunu da doğruladı.
Otomatik tarayıcı/gerçek cihaz ve audit riskleri açık; önceki alt bölüm sonuçları tarihîdir.
Faz 00–11 kullanıcının açık istekleriyle
yetkilendirildi. **Faz 02 kabulü BLOCKED; Android UNVERIFIED ON DEVICE.**
Faz 03 kaynak arayüzü uygulandı; platform/erişilebilirlik kabulü BLOCKED.
Faz 04 alan modeli/ETL kapsamı tamamlandı; Faz 05'te **1 kaynaklı antlaşma sınır
kesiti / 6 toplam katalog kaydı** eklendi. Tam devlet poligonu ve kültür alanı 0.
Faz 05 kaynak/veri hattı hazır; pilot çizgisi → kaynak kartı ve yıl değiştirip geri
dönme akışı **USER-REPORTED PASS**. Otomatik tarayıcı ve Android kapıları açık.
Faz 06 açık kullanıcı promptuyla yetkilendirildi. Zaman motoru ve altın testler
tamamlandı; önceki fazların cihaz kapıları açık. Faz 07 son kullanıcı promptuyla
yetkilendirildi ve uygulandı. Faz 08 siyasi katman kodu ve testleri hazır;
gerçek polygon edinme/inceleme ve runtime kabulü BLOCKED. Faz 09 son kullanıcı
promptuyla yetkilendirildi; kültürel kod/test teslimi ve açık kapılar aşağıdadır.

| Faz | Durum | Kanıt / kapı |
| --- | --- | --- |
| 00 — Araştırma/lisans/uygulanabilirlik | COMPLETE — DOCUMENTATION SCOPE | [Tarihî Faz 00 raporu](reports/phase-00.md) |
| 01 — Expo altyapısı/ortam/repo | INSTALL / QUALITY / JS EXPORT PASS; DEVICE GATE OPEN | [Güncel takip](reports/phase-02-marker-occlusion.md); web açılışı kullanıcı beyanı, Android henüz doğrulanmadı |
| 02 — Gerçek küre/Android teknik kanıt | USER-REPORTED WEB INTERACTIONS PASS; **BLOCKED — FULL RUNTIME / DEVICE PROOF** | [İşaret düzeltmesi](reports/phase-02-marker-occlusion.md), [cihaz kapısı](reports/phase-02-device.md) |
| 03 — Özgün responsive arayüz | SOURCE IMPLEMENTED; **ACCEPTANCE BLOCKED** | [Faz 03 raporu](reports/phase-03.md), [UI akışları](interface.md) |
| 04 — Tarihî şema/kaynak kataloğu | SOURCE / TEST PASS; A-01 FIXED IN PHASE 09 | [Faz 09](reports/phase-09.md), [tarihî denetim](reports/phase-audit-00-08.md), [model](data-model.md) |
| 05 — Doğrulanmış sınırlar/taban/paketler | SOURCE / DATA PIPELINE PASS; **USER-REPORTED PILOT PASS** | [Faz 05 raporu](reports/phase-05.md), [veri kalitesi](data-quality.md); çizgi/kart/yıl dönüşü kullanıcı testi, otomatik tarayıcı ve Android kapıları açık |
| 06 — Zaman motoru/MÖ-MS/kapsam | SOURCE / TEST PASS; A-01 FIXED; RUNTIME OPEN | [Faz 09](reports/phase-09.md), [zaman rehberi](timeline.md), [tarihî faz raporu](reports/phase-06.md) |
| 07 — Tarih çizelgesi/oynatma | SOURCE / INTERACTION TESTS PASS; RUNTIME ACCEPTANCE BLOCKED | [Rehber](playback.md), [rapor](reports/phase-07.md); yeni veri yok |
| 08 — Devlet/krallık/imparatorluk | CODE / TEST / JS EXPORT PASS; **POLYGON / RUNTIME ACCEPTANCE BLOCKED** | [Faz 08](reports/phase-08.md), [siyasi katman](political-layer.md); yeni gerçek polygon yok, Android UNVERIFIED ON DEVICE |
| 09 — Kültür/medeniyet/etki alanı | CODE / TEST / JS EXPORT PASS; **CULTURE PILOT / RUNTIME BLOCKED** | [Faz 09](reports/phase-09.md), [rehber](cultural-layer.md); gerçek kültür geometrisi yok, Android UNVERIFIED ON DEVICE |
| 10 — Tarihî kişiler / belgelenmiş konum | PROFILE/CODE/TEST PASS; **LOCATION WITHHELD IN PHASE16 / RUNTIME BLOCKED** | [Faz 10 raporu](reports/phase-10.md), [model/ETL](persons.md) |
| 11 — Savaşlar / antlaşmalar / tarihî olaylar | CODE / SMALL SOURCED PILOT / AUTOMATED / JS EXPORT PASS; RUNTIME ACCEPTANCE BLOCKED; UNVERIFIED ON DEVICE | [Faz 11 raporu](reports/phase-11.md), [model/kullanım](events.md) |
| 12 — Kaynak kartları / sitelink | CODE / TEST / JS EXPORT PASS; RUNTIME / DEVICE OPEN | [Faz12 raporu](reports/phase-12.md) |
| 13 — Arama / yer imi / paylaşım | CODE / HOST PERSISTENCE / TEST / JS EXPORT PASS; RUNTIME / DEVICE OPEN | [Faz13 raporu](reports/phase-13.md) |
| 14 — Katman / filtre / lejant / ayar | CODE / TEST / HOST PERSISTENCE / JS EXPORT PASS; **RUNTIME BLOCKED / UNVERIFIED ON DEVICE** | [Faz14 raporu](reports/phase-14.md), [rehber](layers-settings.md) |
| 15 — Önbellek / yükleme / performans | CODE / TEST / HOST MEASUREMENT / JS EXPORT PASS; **WEB PERFORMANCE BLOCKED / UNVERIFIED ON DEVICE** | [Faz15 raporu](reports/phase-15.md) |
| 16 — Tarihsel doğruluk / QA / güvenlik | AUDIT DELIVERED / AUTOMATED PASS; **RELEASE NO-GO** | [Faz16 raporu](reports/phase-16.md), [engeller](release-blockers.md) |
| 17 | NOT STARTED | [18 fazlı yol haritası](roadmap.md); kullanıcı isteği yok |

## Faz 02 sonucu

Ortak MapLibre GL JS globe kodu, doğrudan web adaptörü, Expo DOM + RN WebView native
prototipi; kamera ve v1 doğrulanan köprü, sentetik marker, reset, hata/fallback,
cleanup ve izinli Natural Earth fiziksel asset hazırlama adımı yazıldı. Bu kod
çalışan web/Android gösterimi sayılmadı. Generated veri/worker/Notice modülleri
**null**; tarihî katalog **0**. Hiçbir uydurma gerçek dünya geometrisi eklenmedi.

- **PASS**: npm test 11/11 (geriye dönük temel testler dahil); bağımsız strict core
  tip ve negatif tip testleri; 34 dosyada syntax-only; mevcut araçla biçim kontrolü.
- **BLOCKED**: tam lint/typecheck, asset hazırlığı, Expo config/web başlangıç/export,
  Playwright, Android JS export. [Komut/exit kanıtı](reports/phase-02-validation.txt).
- **UNVERIFIED ON DEVICE**: APK/Gradle, WebGL2, gerçek touch/rotation/back, marker→native,
  offline release, GPU/bellek/latency. Java/SDK/adb ve kurulu hedef paketler yok.
- **BLOCKED**: package-lock/npm ci, transitif lisans ve gerçek boyut; registry
  EAI_AGAIN, ham GitHub DNS hatası. [0/21 bağımlılık raporu](reports/phase-02-dependency-report.json).

Kullanıcının “Mevcut ortamla ilerle; engelleri raporla” yönlendirmesiyle kaynaklar
hazırlandı; engeller çözülmüş veya gerçek cihaz başarısı var sayılmadı.
[ADR](adr/0001-globe-engine.md) koşullu; [köprü/asset/CSP sınırları](globe-prototype.md),
[lisans sicili](license-register.md) ve [riskler](risks.md) güncellendi.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** ve bütün tarihî veri kapıları sürer.

## Kapanış kapısı

Önce ağ erişimiyle gerçek lock/kurulum, expo uyum kontrolü, fiziksel asset ve lisans
manifesti; tam lint/typecheck/test/format/config ve web/Android export. Sonra gerçek
web görüntüsü/etkileşim/smoke; iki GPU ailesinde Android debug/release ve uçak modu,
marker köprüsü, context/touch/dönme/geri ve PSS/latency ölçümü. Expo ham taşıma ve
file-origin/worker/CSP açıkları da kapatılır. Sorunda [ADR alternatif planı](adr/0001-globe-engine.md)
için kanıt toplanır. Kullanıcının sonraki Faz 03 isteğiyle UI kaynakları eklendi; bu kapılar kapanmış
sayılmadı. Faz 04'e geçiş için ayrıca kullanıcı onayı gerekir. Önceki faz raporları tarihî kayıt olarak korunur.


## Faz 03 sonucu

Token tabanlı büyük harita düzeni, üst arama, araçlar, alt tarih şeridi ve masaüstü
sağ panel/telefon bottom sheet; 11 istenen bileşen, bağımsız katman tercihi,
sentetik marker kartı, boş arama, yıl önizleme ve modal odak/etkileşim önlemleri.
Yeni bağımlılık/veri/ikon dosyası yok; bütün yeni ürün metinleri Türkçe katalogda.

**PASS:** 15/15 unit (önceki 11 dahil), bağımsız pure TS, syntax-only 51 dosya,
mevcut araçla format. **BLOCKED:** tam lint/typecheck, Expo export, Playwright,
görsel snapshot baseline, gerçek web layout/klavye/ekran okuyucu. **UNVERIFIED ON
DEVICE:** Android safe-area/IME/dönme/geri/TalkBack/touch/performans.
[Kanıt](reports/phase-03-validation.txt), [dosya listesi](reports/phase-03-files.txt).

Faz 03 teslimi çalışan cihaz/sıfır erişilebilirlik sorunu olarak kabul edilmedi.
Önce kurulum + Faz 02 gerçek küre kanıtı, sonra UI web/görsel ve fiziksel Android
matrisi kapatılır. Faz 04'e otomatik geçilmez.

## Faz 02 düzeltme takibi — 2026-10-15

Kullanıcının Faz 02 sorununu incele/çöz isteğiyle mevcut renderer yeniden ele alındı.
Üç regresyon önce başarısız üretildi, sonra düzeltildi: load marker hatası,
yinelenen marker ve context kaybında bağımsız kaynak temizliği. Worker regex'i
mevcut TypeScript AST kontrolüyle değişti; yeni bağımlılık yok.
**PASS:** npm test 18/18 ve mevcut parser araç kopyasıyla worker testleri 3/3;
core strict TS ve format. **BLOCKED:** npm/DNS ve doğrudan ağ bağlantısı, lock/
kurulum, gerçek asset hazırlama, tam lint/typecheck, web/Android export/smoke.
**UNVERIFIED ON DEVICE** sürer. [İnceleme raporu](reports/phase-02-repair.md),
[önceki hata](reports/phase-02-repair-before.txt), [son kontrol](reports/phase-02-repair-validation.txt).
Faz 02 platform kabulü kapanmadı; Faz 04 başlatılmadı.


## Kullanıcı kurulumu sonrası — güncel

Paketler/lock geldi. ESLint API, DOMProps web tipi ve React hook lint sorunları
düzeltildi. **npm run check PASS: lint + tam native/web TS + 18/18 ve 4/4 test + format**.
Expo config ve gerçek Metro web/Android+DOM JS export PASS. Bu sonuçlar eski
kurulu Reanimated 4.7.1/Worklets 0.13.0 ve null fiziksel asset üzerindedir.

Expo uyumlu **4.5.1 / 0.10.1** manifest ve npm üretimi lock'ta; lock peer ağacı
PASS. Gerçek kurulum **21/23** eşleşiyor; kullanıcının ağ erişimli terminalinde
npm ci gerekiyor. Gerçek MapLibre worker'ının iki opsiyonel dinamik import'u
kapatılarak hazırlanabiliyor; kara alımı DNS yüzünden BLOCKED. Sandbox socket
EPERM yüzünden browser/live smoke da BLOCKED. Audit ayrıntısı alınamadı; kullanıcının
31 bulgusu kapanmış sayılmaz. Android **UNVERIFIED ON DEVICE** sürer.
[Detaylar](reports/phase-02-post-install.md). Faz 04 başlatılmadı.


## Kilitli kurulum + gerçek varlıklar — en güncel

Kullanıcı npm ci/globe:prepare tamamladı. Kurulu sürümler **23/23**, SDK peer
çakışması yok. Natural Earth v5.1.2: **127 fiziksel feature, 5143 koordinat**;
ham 138160 byte. Worker 654885 byte, iki opsiyonel import kapalı. Kaynak, türev,
worker ve bildirimin SHA-256 kontrolü **PASS**. Tarihî katalog **0**.

Hazırlama formatter'ı ve Türkçe yol çözümlemesi düzeltildi; **npm run check PASS**
(lint, tam web/native TS, 18+4 test, globe:check, format). Gerçek veriyle web ve
Android+DOM JS export PASS. Bu APK/GPU/ekran kanıtı değildir. Chromium sandbox
EPERM nedeniyle browser/live smoke **BLOCKED**, Android **UNVERIFIED ON DEVICE**.
29 audit paket kaydı/dört GHSA için [güvenlik kaydı](security-review.md) açık;
force downgrade/SDK göçü yapılmadı. [Rapor](reports/phase-02-prepared.md).
Faz 04'e geçilmedi.

## Kullanıcı web denemesi ve arka yüz işareti — güncel

Kullanıcı küre sürükleme, kamera sıfırlama ve sentetik işaretin bilgi panelini
açmasını çalışır bildirdi. Platformun web olduğu konuşma bağlamından alınmıştır;
tarayıcı/işletim sistemi, ekran kaydı ve ölçüm verilmedi. Android kanıtı sayılmaz.

MapLibre 6.14.0'ın varsayılan `opacityWhenCovered: 0.2` davranışı yüzünden arka
yüzde görünen sentetik işaret için ortak renderer'da opaklık 0 yapıldı; belgeli
covered sınıfı ile görünürlük/pointer kapatıldı, seçim handler'ı da kapatıldı.
Yeni regresyon düzeltmeden önce başarısız, sonra başarılı: ana testler **19/19**,
worker **4/4**; lint, native/web strict TS, asset/atıf ve format **PASS**.
Kullanıcı düzeltmeyi tekrar denedi ve arka yüzde işaretin kaybolduğunu bildirdi:
bu görünürlük senaryosu **USER-REPORTED PASS**. Öne dönüşte tekrar seçim ve
klavye/erişilebilirlik davranışı bu yeni mesajla doğrulanmış sayılmadı. Ayrıntılar ve export/
tarayıcı sonuçları [takip raporunda](reports/phase-02-marker-occlusion.md).

Mevcut Natural Earth 1:110 milyon fiziksel kara katmanı siyasi ülke sınırı içermez;
genelleştirilmiş güncel kıyı tabanıdır, nihai ayrıntı veya tarihî kıyı iddiası yoktur.
Veri/lisans/atıf değişmedi. Yeni faz veya yeni tarihî geometri eklenmedi.
Faz 02 cihaz kapısı **BLOCKED**, Android **UNVERIFIED ON DEVICE**; Faz 04 başlamadı.

## Faz 04 — tarihî veri şeması ve kaynak kataloğu

Kullanıcı Faz 04'ü açıkça yetkilendirdi; son prompttaki kapsam, eski yol haritası
başlığından önceliklidir. Önceki Android/renderer kabulü kapanmış sayılmadı.

Ortak HistoricalEntity/TerritoryVersion/CulturalRegion/Person/PersonLocation/
HistoricalEvent/HistoricalPlace/SourceRecord/TemporalExtent/Confidence/DataCoverage
tipleri ve runtime şemaları; GeoJSON/topoloji ve tarih çelişkisi raporları, kapalı
üretim lisans kapısı, kaynak/ham girdi/dönüşüm provenance zinciri, deterministik
yerel ETL ve tarih/coğrafya indeksli HistoricalDataProvider eklendi. Yeni dış
bağımlılık veya gerçek tarihî veri yok. Uygulama UI'si ve fiziksel tabanı değiştirilmedi.

**PASS:** lint, native/web strict typecheck; ana testler **35/35**, worker **4/4**;
asset/atıf hash ve format; boş katalog validate/build smoke; web ve Android+DOM JS
export. Atıfsız/yasak/sentetik/incelemesiz kayıtların üretim dizini açılmadan
reddedildiği test edildi. Kaynak tarihi/kalitesi/belirsizliği ve raw SHA korunuyor.
Tarayıcı otomasyonu bu fazda tekrar çalıştırılmadı; önceki ortam engeli açık.
Android **UNVERIFIED ON DEVICE**; JS export APK/GPU kanıtı değildir.

**COMPLETE — DOMAIN / ETL SCOPE.** Gelecek gerçek pilot için hak/iddia incelemesi,
karmaşık/sferik geometri için ek doğrulama ve mevcut cihaz kabulü gerekir.
[Faz raporu](reports/phase-04.md), [komut kanıtı](reports/phase-04-validation.txt),
[model/ETL rehberi](data-model.md), [ADR-0005](adr/0005-historical-catalog-schema.md).
Historical Basemaps engeli ve audit riskleri sürer. Faz 05'e geçilmedi.

## Faz 05 — kaynaklı pilot, taban ve paketler

Kullanıcı Faz 05'i açıkça yetkilendirdi. NARA 1867 antlaşma transkriptindeki 141°B
tanımından **65–68°K ideal meridyen kesiti**, yalnız **1867-06-20 snapshot** olarak
üretildi. Veri CC0, kaynak/hak onayı tek olgu çıkarımı ID/revizyon/SHA'sına bağlı;
diğer NARA eserlerine genel izin verilmedi. HTTP yanıtı yerine editöryal olgu
çıkarımı kullanıldığı açıkça kaydedildi. Kesit tam Alaska veya ölçülmüş WGS84 sınırı
değildir. **1 sınır / 6 teknik kayıt; 0 kültür / 0 tam devlet poligonu**.

Şema v2 sınır kesiti/alan ve siyasal ilişki ayrımı; LOD/byte/SHA/zaman/bbox manifesti,
coğrafya/tarih/lisans kontrolleri, tam bildirim ve yeniden üretim kontrolü eklendi.
Ortak küreye yıl/katman filtresi, pilot kamera kısayolu ve kaynak kartı bağlandı.
Geometri native köprüden taşınmaz. Kaynaksız diğer yıllara sınır uzatılmaz.
Natural Earth yazısız fiziksel taban korundu; yeni siyasi etiket/tile/dış paket yok.

OHM metadata/üye alımı, cache/audit ve astronomik yıl düzeltmesi yazıldı; canlı
alım **EAI_AGAIN**. San Marino adayında kaynak fixme'si de var; polygon alınmadı.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** sürer. Diğer çağ/coğrafya ve
kültür derinliği eksik bırakıldı. [Kalite raporu](data-quality.md).

Kalite/test/export kanıtları [faz raporunda](reports/phase-05.md). Yeni pilotun
gerçek tarayıcı/GPU görüntüsü **BLOCKED**; hedefli Playwright 25 sn sonunda sonuç
vermeden timeout oldu. Android **UNVERIFIED ON DEVICE**. Önceki kullanıcının web
globe/demo denemesi bu yeni pilotun görsel kabulü sayılmadı. Faz 06'ya geçilmedi.

Son devam kontrolünde lint, web/native strict TS, **45 ana + 4 worker testi**,
asset/pilot bütünlüğü ve format yeniden **PASS**. Son kaynaklarla web ve
Android+DOM JS export tekrar **PASS**; fazın 73 dosyası ve yerel belge bağlantıları
kontrol edildi. Yeni pilot için adım adım manuel kabul akışı faz raporuna eklendi.
Görsel kabul **BLOCKED**, fiziksel Android **UNVERIFIED ON DEVICE** kalır.

### Kullanıcı pilot testi — en güncel

Kullanıcı sınır çizgisine dokunarak kaynak kartını okuduğunu, yılı değiştirince
çizginin kaybolduğunu ve kaynak tarihine dönünce geri geldiğini bildirdi:
**USER-REPORTED PASS — çizgi görünümü/seçimi, kaynak kartı ve yıl filtresi gidiş/dönüş**.
Platform önceki web testinin devamı bağlamından alınmıştır; cihaz/tarayıcı sürümü
belirtilmedi. Bu kayıt yukarıdaki yeni pilot için görsel sonuç bekleniyor durumunu
bu senaryolar özelinde günceller. Katman anahtarı, dış kaynak bağlantısı, tam
otomatik smoke, erişilebilirlik ve performans bu bildirimle doğrulanmış sayılmaz.
Fiziksel Android **UNVERIFIED ON DEVICE**; Faz 06 başlatılmadı.
Yalnız belge güncellendi; kod/veri/lisans değişmedi, testler tekrar çalıştırılmadı.

## Faz 06 — zaman motoru, MÖ/MS ve kapsam

Kullanıcının açık Faz 06 promptuyla uygulandı; önce model ve altın testler
[ADR-0007](adr/0007-temporal-query-engine.md) içinde tanımlandı. Saf TS motor,
sıfırsız tarihî/astronomik yıl dönüşümü, kapalı kaynak aralıkları, ayrık periods,
snapshot/continuous support ve bilinmeyen/kaba tarih ayrımı eklendi. Yaşam bilgisi,
yıllık bulunma ve biyografik konum ayrı kalır; kültür/rakip iddialar korunur.

Üç kapsam modu, indeks/sınırlı cache, eski async yanıt/hata koruması ve açık
snapshot önizlemesi ortak web/native haritaya bağlandı. Önizlemede seçilen yıl
değişmez, kaynak yılı etiketlidir; yıl değişince/kapatınca eski çizgi temizlenir.
Yeni tarihî veri yok; aynı 1 kesit/6 kayıt. Pilot 0.2.0-pilot, ETL 1.2.0, aynı
raw/geometri/CC0 hak ve bildirim; yalnız açık zaman support annotation eklendi.

**PASS:** lint, native/web strict TS, **65 ana + 4 worker testi**, formatter,
asset/pilot SHA ve yeniden üretim; kapsam raporu; web ve Android+DOM JS export.
Playwright 20 senaryo keşfedildi; hedefli çalıştırma yerel bağlantıda EPERM ve
35 sn timeout (exit 124), gerçek yeni preview testi **BLOCKED**. Java/adb/SDK
yok; fiziksel Android **UNVERIFIED ON DEVICE**. Önceki kullanıcı pilot testi
yeni önizleme kontrolünün testi sayılmadı. Önceki audit/erişilebilirlik kapıları sürer.

**COMPLETE — TIME ENGINE / UNIT SCOPE**; yeni UI runtime kabulü açık.
[Faz raporu](reports/phase-06.md), [komut kaydı](reports/phase-06-validation.txt),
[kapsam JSON](reports/phase-06-coverage.json), [geliştirici rehberi](timeline.md).
Faz 07 başlatılmadı; sonraki çalışma için kullanıcı isteği ve rapordaki açık
platform/kaynak kapılarının değerlendirilmesi gerekir.

## Faz 07 — tarih çizelgesi ve oynatma

2026-10-16. Kullanıcı bu fazı açıkça istedi; eski yol haritasının siyasi veri
başlığı yerine çizelge/oynatma uygulandı. Önceki faz kapıları korunur.

Web range/native responder-adjustable YearSlider, tüm/200/20 yıl ölçeği, doğrudan
MÖ/MS YearInput, ±1/10/100 ve başlangıç/günümüz, üç hızda oynatma eklendi. Manuel
girdi ve panel/ekran/arka plan oynatmayı durdurur; reduced motion kadansı sınırlıdır.
Kamera zaman değişiminden etkilenmez; isteğe bağlı odaklanma ayrı düğmedir.
Gerçek snapshot işaretleri ve veri yok/kısmi/hata açıklamaları korunur.

Tek store requestedYear/renderedSourceYear/coverageStatus'u ayırır. Aynı
contextYear için atomik frame, AbortSignal/80 ms birleştirme/revision koruması;
MapLibre setData Promise'i sonrasında şema doğrulanan ACK eklendi. Önizlemede
bütün varlık grupları açıkça etiketli kaynak yılını paylaşır; seçili yıl değişmez.
Yeni veri/bağımlılık/lisans yok; aynı 1 kesit/6 kayıt ve aynı hash/NOTICE.

**PASS:** lint, native/web strict TS, **77 ana + 4 worker testi**, formatter,
globe/pilot bütünlüğü; son kaynaklarla web ve Android+DOM JS export. 26 web
senaryosu keşfedildi. Hedefli Playwright local bağlantıda EPERM nedeniyle test
gövdesine ulaşmadan 35 sn timeout/exit 124: yeni runtime kabulü **BLOCKED**.
Java/adb/SDK yok; Android **UNVERIFIED ON DEVICE**. Gerçek dokunma, TalkBack,
klavye/görsel ve FPS/bellek doğrulanmış sayılmadı; önceki pilot kullanıcı testi
bu yeni çizelgeyi onaylamaz. Önceki audit/erişilebilirlik kapıları sürer.

**SOURCE / INTERACTION TESTS PASS; RUNTIME ACCEPTANCE BLOCKED**.
[Faz raporu](reports/phase-07.md), [komut kaydı](reports/phase-07-validation.txt),
[kullanım ve state](playback.md), [ADR-0008](adr/0008-timeline-playback-state.md).
Faz 08 başlatılmadı; manuel web ve fiziksel Android kabulü raporda önkoşuldur.

## Faz 08 — siyasi varlıklar

Kullanıcının açık Faz 08 promptu ve devam istekleriyle uygulandı; eski yol
haritasındaki kültür başlığının yerine siyasi katman kapsamı geçer. Önceki
platform kapıları korunur; yeni faz başlatılmadı.

Tek entity üzerinde tarihli çoklu siyasi sınıf, kaynaklı ad/açıklama/başkent
iddiaları ve isteğe bağlı ardıllık/kuruluş/bölünme/birleşme bağlantıları eklendi.
Alt iddialar kaynak/temporal/hak/production review kapılarına bağlı; kaynaksız
istatistik/başkent/bayrak yok. Kararlı renk, dolgu/outline, ilişki ve belirsizlik
çizgileri, bounded yerel DOM etiketleri/çakışma, küçük alan işaretçisi ve 8 adaylı
deterministik seçim hazır. Ortak siyasi kart ve klavyeyle erişilen kayıt listesi,
revizyonlu seçim/odak köprüsü, açık kamera hareketi ve reduced motion uygulanır.

**PASS:** lint, strict native/web TS, **92 ana + 4 worker testi**, format,
globe/pilot SHA/atıf ve deterministik yeniden üretim; web ve Android+DOM JS
export. **30 web senaryosu keşfedildi**; hedefli siyasi UI çalıştırması yerel
bağlantıda EPERM, 35 sn timeout/exit 124: runtime **BLOCKED**. Java/adb/SDK yok;
fiziksel Android **UNVERIFIED ON DEVICE**, APK/GPU/performans ölçülmedi.

Gerçek veri **aynı 1 NARA antlaşma kesiti / 6 kayıt; tam siyasi polygon 0**.
Cliopatria veri lisansı birincil metinden incelendi; gerçek dosya DNS/API 403
nedeniyle alınamadı, seçili geometri/üst kaynak incelemesi yapılmadı. **BLOCKED —
VERIFIED POLYGON ACQUISITION / RECORD REVIEW**. Sentetik alanlar yalnız testtedir;
modern ülke alanı veya kapatılmış antlaşma çizgisi tarihî alan diye yayınlanmadı.
Yeni veri/hak onayı/dependency/font/tile yok; HB dağıtım engeli sürer.

[Faz raporu](reports/phase-08.md), [araştırma](reports/phase-08-source-review.md),
[ADR-0009](adr/0009-political-layer.md), [kullanım/model rehberi](political-layer.md).
Faz 08 tam kabulü kapanmadı. Önce incelenmiş gerçek polygonun ETL ile üretime
alınması, web/Android seçim/tarih/atıf kabulü ve mevcut cihaz kapıları gerekir.
Faz 09 için kullanıcı isteği alınmadan çalışmaya başlanmaz.

## Kullanıcının isteğiyle Faz 00–08 denetimi

2026-10-16. Dokümanlar, kabul ölçütleri, çalışma zamanı kodu, CI ve test tanımları
karşılaştırıldı. **92+4 test/lint/strict TS/format/hash/yeniden üretim PASS**;
Expo config ve web/Android JS export PASS, doğrudan paketler 23/23 eşleşiyor.
Temiz node_modules'suz dizinde CI komutu exit 1 MODULE_NOT_FOUND; sentetik
domain/repository karşı örnekleri tarih ve ilişki kapsamı açıklarını doğruladı.
Snapshot PNG baseline'ları yok. Bu eksikler ana testlerin yeşil olmasıyla kapanmaz.

30 web senaryosu keşfedildi; hedefli koşu EPERM/25 sn/exit 124. Android SDK/JDK/
adb yok: **UNVERIFIED ON DEVICE**. Güncel audit denemesi EAI_AGAIN/exit 1;
önceki 29 bulgu kapanmadı veya güncel yeniden ölçüm sayılmadı. Gerçek katalog
aynı 1 LineString/6 kayıt, 0 siyasi polygon. Faz 09–17 başlamadı.

[Bulgular, öncelikler ve ham kanıtlar](reports/phase-audit-00-08.md).
Denetimde ürün kodu, bağımlılık, veri ve hak kararları değiştirilmedi; düzeltme
ve kalan platform/veri kabulü ayrı takip işi olarak açık bırakıldı.

## Faz 09 — kültürler, medeniyetler ve belirsiz etki alanları

Kullanıcının açık Faz 09 promptuyla uygulandı. CULTURE/CIVILIZATION/CULTURAL_REGION
kimlikleri ve ayrı kültürel ilişki modeli; kaynaklı bağlam/belirsizlik, zaman ve
güven kapıları; ≈ işareti/düşük dolgu/yumuşak-noktalı sınır ve Türkçe lejant.
Kültür kartı, sayfalı yıl listesi ve çağdaş fiziksel taban uyarıları eklendi.
Bağımsız siyasi/kültürel katmanlar aynı yıl/preview bağlamındadır. Sitelink varsa
ETL ham Wikidata eşleşmesini doğrular; mevcut katalogda link yok.

Ortak hit testi, 8'li sayfalarla en fazla 1000 kültürel/siyasi adaya erişir;
alttaki alan liste dışı bırakılmaz. Bridge ID/revizyon/sayfa/katalog/4KiB kontrollü;
geometri taşınmaz. Yoğunlukta dolgu/etiket bütçesi açıkça anlatılır, kayıt silinmez.
A-01 bilinen entity dönemi/boşluğuyla çelişen siyasi/kültürel alan retleriyle
giderildi. A-02 unit CI'ya npm ci eklendi; gerçek CI koşusu yapılmadı. A-03/A-04 açık.

**PASS:** lint, strict native/web TS, **107 ana + 4 worker**, format, globe/pilot
SHA/atıf/yeniden üretim, web ve Android+DOM JS export. 34 web senaryosu keşfedildi;
hedefli kültür UI koşusu EPERM/25 sn timeout/exit124. Java/adb/SDK yok:
**UNVERIFIED ON DEVICE**. 400 kültür yükü ve 1000 aday sayfalaması sentetik
birim testidir; GPU/FPS/bellek ölçümü değildir.

**BLOCKED — VERIFIED CULTURAL AREA / SOURCE REVIEW:** gerçek kültür geometrisi 0.
D-PLACE NC koşuluyla seçilmedi, Pleiades yer/bbox/noktaları kültürel alana
çevrilmedi; örnek terminal isteği DNS exit6. HB ve OHM kapıları korunur. Yeni
veri/hak onayı/dependency yok. Aynı 1 NARA kesiti/6 kayıt; kültür/tam siyasi alan 0.
ETL **1.3.0** metadata'sı manifest/generated modülde yenilendi; katalog 0.2.0-pilot,
policy1.1.0, raw/katalog/geometri/NOTICE aynı hash'tedir.

[Faz raporu](reports/phase-09.md), [model/UI rehberi](cultural-layer.md),
[kaynak incelemesi](reports/phase-09-source-review.md), [ADR-0010](adr/0010-cultural-layer.md).
Faz tam veri/platform kabulüyle kapatılmadı. Gerçek pilot, web/Android örtüşme/
ayırt edilebilirlik/erişilebilirlik kabulü ve önceki açık kapılar gerekir.
Faz 10 başlatılmadı; kullanıcı isteği olmadan sonraki faza geçilmez.


## Faz 10 sonucu — 2026-10-16

HistoricalPerson profili ve 6 ilişki türü, ölçek/koordinat anlamı, kaynaklı
validFrom/validTo projeksiyonu, ayrı yaşam ve yıllık bulunma sorguları eklendi.
Varsayılan kesin marker ve açık yaklaşık tercih ayrılır; tarihsiz biyografik
ilişki yalnız açılabilir kart listesinde kalır. Bölge/krallık centroidi, yaşam
yılı, P19/P20/P551/P937 tek başına marker/rota üretmez. Kaynaksız medya ve ham
sitelink eşleşmesiz URL üretime giremez.

Kişi araması konumsuz kaydı da bulur; kart yaşam/yer/kanıt/hassasiyet/kaynak ve
dil fallback gösterir. Ekran uzayı kümeleri en çok 64 Marker ve bütün adaylara
8'li seçim sayfasıyla erişim sağlar; yıl/layer/filter değişiminde eski seçim
ve ACK reddedilir. Açık kamera odağı yılı değiştirmez; kaynak/dinleyici temizliği
ve yanlış kesinlik regresyonları testlidir. Yeni dış bağımlılık yok.

Küçük gerçek pilot Wikidata CC0 yapılandırılmış olgularından: 1 kişi, 1 yapı
noktası, 1879-08–1880-10 ilişki. Müze referansı bağımsız alınamadığı için orta
güven ve açık yaklaşık tercih gerekir. Özgün HTTP JSON'u olmayan editöryal
çıkarım açık etiketlenmiştir. Katalog11/3kaynak, ETL1.4.0; kişi GeoJSON/NOTICE/
kapsam/hash üretildi. Önceki NARA çizgi ham/geometri hashleri korunur.

**PASS:** 131/131 ana + 4/4 worker; lint/native+web strict TS/formatter, gerçek
asset/pilot hashleri, web 4 rota export, Android Hermes+DOM JS export, 23/23
kilitli doğrudan bağımlılık ve 38 browser senaryosunun listelenmesi.
**BLOCKED:** gerçek browser: connect EPERM 127.0.0.1:8081, 25s limit exit124;
özgün API transferi DNS, bağımsız müze referansı erişimi.
**UNVERIFIED ON DEVICE:** Java/adb/Android SDK yok; APK, fiziksel cihaz, touch/
dönme/geri/erişilebilirlik, GPU/FPS/bellek ölçülmedi. JS export bu kapıyı kapatmaz.

[Dosyalar](reports/phase-10-files.txt), [test/export/ortam logları ve kabul matrisi](reports/phase-10.md).
Önceki açık siyasi polygon/kültür pilotu, A-03/A-04, güvenlik/audit/CI kapıları
sürer. Gerçek web ve Android kişi akışı, bağımsız kaynak/JSON ve gerekiyorsa
medya hak hattı sonraki çalışmanın önkoşuludur. Faz 11'e otomatik geçilmedi.


## Faz 11 sonucu — 2026-10-16

WAR/BATTLE ile diğer beş olay türü ayrı katmanlara bağlandı; antlaşma§, savaş⚑,
muharebe⚔ ve diğer olay✦ ayrımı renk yanında simgelerle verilir. Olay modeli
konum hassasiyeti, kaynaklı alternatif tarihler ve ham Wikidata eşleşmeli
sitelinkler taşır. dateExtent/title/sources/participants kanonik alanlardan
projeksiyondur; iki çelişkili tarih deposu yok. Üretimde ayrıntı/kanıt/hak
zorunlu; savaş Point'e indirgenemez, tarihsiz olay yıllara dağıtılamaz.

Bilinen tarihteki geometrisiz olay yıl listesinde; kaynaklı alan/nokta varsa
shared renderer'a girer. 8'li liste/seçim, kişiyle örtüşen olay adayları,
64 küme/grup ve tutucu alan alpha bütçesi uygulanır. Yıl/layer/stale seçim ve
cleanup regresyonları geçer. Kamera yalnız açık odak isteğinde değişir.

Dört dar gerçek kayıt: Peloponnesos MÖ 431–404, Hastings 1066, Vestfalya 1648 ve
yeniden birleşme süreç 1989–1990. Yalnız Hastings yaklaşık nokta taşır. Antik/
Orta Çağ gün/takvim dönüşümü doğrulanmadığında yalnız yıl tutulur. Modern
örnekte alternatif 1991 aynı kaynak revizyonunda korunur; anlamı bağımsız
çözümlenmedi, ana yıl indeksine eklenmez. Tümü medium güven; dar structured
olgu incelemesi bağımsız üst kaynak doğrulaması olarak sunulmaz.

Ham editöryal çıkarım açık etiketli/sha sabitlidir, özgün API yanıtı değildir.
Wikidata CC0 hakları makale/görsellerden ayrıldı; hiçbir polygon veya guessed
Wikipedia linki alınmadı. Katalog 19 / 7 kaynak, olay 4/geometri 1; kişi/sınır korundu.
Yeni dış bağımlılık yok. Tarihî tam siyaset/kültür polygonu0.

**PASS:** 152/152 ana + 4/4 worker, sıfır uyarılı lint, strict native/web TS,
formatter, fiziksel/pilot hash ve deterministik üretim, web 4 rota ve Android
Hermes+DOM JS export, 23/23 tam bağımlılık; 44 browser senaryosu listelendi.
**BLOCKED:** gerçek Playwright localhost connect EPERM, 25s exit124; özgün entity
JSON terminal DNS/curl6. **UNVERIFIED ON DEVICE:** Java/adb/SDK yok; fiziksel
Android/geri/TalkBack/resize/context/PSS/FPS/latency/uçak modu ölçülmedi.

[ADR-0012](adr/0012-event-layers.md), [rapor/kabul matrisi ve test logları](reports/phase-11.md).
Sonraki iş önkoşulları: gerçek web/Android olay akışı ve kaynak üst zinciri/
takvim/alternatif anlam incelemesi; önceki açık riskler kapanmış sayılmadı.
Faz 12'ye otomatik geçilmedi.
