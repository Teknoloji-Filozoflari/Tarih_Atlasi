# Lisans ve atıf sicili

## 21 Ekim — İndirilmiş Wikidata JSON kayıtları

**ALLOW — yalnız pinlenmiş 1.0.0-history normalize sürümü:** 2.969 kişi +
1.084 olay; kaynak Wikidata structured data, CC0-1.0. API kimlik/revizyonu,
makbuzdaki URL/request/byte/SHA, domain lisans kapısı ve sitelink eşleşmesi
denetlendi. Envanter ve manifest pinleri `src/history/policy.ts`; ham makbuzlar
`productionApproved:false` kalır. Yeni indirme otomatik üretim onayı vermez.

Bildirim `assets/licenses/Wikidata-history-NOTICE.txt`; kaynak kartlarında
orijinal entity JSON path/hash/revizyon/atıf ve dönüşüm görünür. Doğum yeri
olarak yalnız önceki pinlenmiş şehir olguları kullanıldı. Makale metni/portre,
Nobel API motivasyonu, Commons görseli ve tile kopyası yok. Proje MIT kodu,
CC0 verisi ve diğer mevcut GeoNames/NE/OHM/tile hakları ayrı tutulur.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** sürer.
[Hak ve kalite sınırları](reports/history-import-2026-10-21.md).

## 20 Ekim — Geniş kişi/olay eki

**ALLOW (dar incelenmiş olgu çıkarımı):** `1.4.0-births`, 56 kişi/23 olay,
Wikidata katkıda bulunanlar, CC0-1.0. `data/people/broad-raw/` açıkça editoryal
yapılandırılmış olgu çıkarımıdır; API yanıtı veya bağımsız tarihsel sertifika
değildir. Girdi SHA256'ları `src/people/policy.ts`, çıktı hash/byte/revizyonları
`data/people/broad-production/manifest.json` içinde. Bildirim:
`assets/licenses/Wikidata-broad-content-NOTICE.txt`. Mevcut uygulama Wikidata
atıfları ve kaynak kartları bu kayıtların kaynaklarını da gösterir.

Sitelink sürümü 1.2.0, 79 yeni eşleşme; 88 snapshot. Ayrı bildirim
`Wikidata-sitelink-NOTICE.txt`. Wikipedia makale metni/portre, Nobel API metni,
ödül motivasyonu, Commons görseli veya yeni geometri alınmadı. CC0 bunların
haklarını kapsamaz. `data/staging/history/` her zaman incelenmemiş ve üretime
kapalıdır; kaynak indirmek yeniden dağıtım izni/konum onayı sayılmaz.

Nobel güncel API koşulları erişimi 403; Nobel API verisi için yeni dağıtım
onayı verilmedi. Historical Basemaps **BLOCKED FOR REDISTRIBUTION**, OHM nesne
lisansı kontrolü ve diğer mevcut kaynak sınırlamaları korunur.
[Kaynak erişimi ve kabul süreci](history-expansion.md).

## 20 Ekim — Kart/seçim hata düzeltmesi

Yeni veri, geometri, makale metni, görsel veya dış bağımlılık alınmadı. Mevcut lisans/atıf kayıtları korunur. Kullanıcı ekran görüntüleri yalnız teşhis için okundu; uygulama asset'i yapılmadı. Kişi görünürlük denetimi mevcut CC0 sürümlerine dayanır, yeni tarihsel iddia üretmez.


## 19 Ekim 2026 — Dünya kişi/olay eki ve kişisel notlar

`data/people/global-raw`, `src/people/global`: Wikidata CC0-1.0 yapılandırılmış olgu çıkarımı, sürüm 1.3.0-births. 4 kişi/4 yer/2 olay revizyonları ve giriş SHA'ları sabit; NOTICE: `assets/licenses/Wikidata-global-content-NOTICE.txt`. Wikipedia makale metni, Commons görseli ve yeni siyasi geometri alınmadı. Sitelink manifesti 1.1.0 toplam 9 doğrulanmış eşleşme; bağımsız NOTICE korunur. Kişisel notlar kullanıcının yerel ve doğrulanmamış içeriğidir; uygulama onları CC0 veya yayın hakkı verilmiş saymaz, dağıtıma eklemez. Batı Sahra için yeni tarihî geometri yayımlanmadı. Yeni dış bağımlılık yok.


## 19 Ekim 2026 — Referans karşılaştırması tamamlandı

Natural Earth public domain Countries/Map Units yalnız inceleme dizininde;
258/298 özellik üzerinde türetilmiş tanısal rapor üretildi. Üretime geometri
eklenmedi. geoBoundaries metadata edinildi, özgün lisans çelişkileri için
MANUAL REVIEW sürer. Cliopatria CC BY 4.0 mevcut atfıyla, aynı geometriyi
çizen 2024 Hollanda satırı 13741 gizlendi; 13771 ve ham kaynak korundu.
Değişiklik bildirimi ve kaynak/hash kanıtı
[referans inceleme raporunda](reports/world-reference-review.md).

## 19 Ekim 2026 — Dünya denetimi ve kimlik düzeltmeleri

Üretim geometrisi eklenmedi/değişmedi: mevcut Cliopatria CC BY 4.0 atıf ve
kaynak hash'leri korunur. Suriye, Güney Kore, Tayvan, Kongo Cumhuriyeti ve
Gine'nin yalnız 2024 kimlik düzeltmeleri Wikidata CC0 olgularına dayanır;
özgün QID kaynak notlarında, değişiklik bildirimi inceleme raporunda tutulur.
Wikipedia/Commons içeriği veya yeni tile/font eklenmedi.

Natural Earth Admin-0 için **ALLOW — public domain**, ancak edinilecek dosya
önce inceleme dizinine yazılır; tarih/geometri incelemesi olmadan üretim
izni sayılmaz. geoBoundaries metadata **MANUAL REVIEW**: AGO/TUR gbOpen
özgün lisans alanı CC BY-SA 2.0, SYR gbOpen ODbL 1.0, SYR gbHumanitarian
CC BY 3.0 IGO; genel site lisansı özgün alanların yerine geçirilmedi.
Bu geometriler indirilmedi/dağıtılmadı. CShapes NC/SA incelemesi açık,
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** kalır.
[Kaynak URL'leri, temsil yılları ve gerekçeler](reports/world-data-audit.md).

## 18 Ekim 2026 — Ülke inceleme eki v2

**ALLOW, yalnız sabit Cliopatria v0.2.1 / CC BY 4.0 arşivi.** Önceki üç satırlık
incelemeye dokuz satır eklendi: Çad 2024, Tunus dört dönem, Angola ve Mali iki
kaynak dönemi. Toplam 12 satır. Çıkarım SHA-256:
`04ac9985540cc510c834c42118a40af0a6adb7da4b1b43819b3030de6bb88aec`.
[Atıf ve değişiklik bildirimi](../assets/licenses/country-review-NOTICE.txt)
güncellendi ve pinlendi. Ham manifest/paketler aynı kalır. Kayıpsız halka yönü,
izole teğet incelemesi, Mali kimliği düzeltmesi ve Angola kısmi alanı
[açıkça belgeli](reports/timeline-countries.md). Wikipedia metni/görseli,
BM geometrisi, yeni font veya bağımlılık eklenmedi; CC0 kimlik olguları ayrı.
Tarihsel doğruluk bağımsız onaylanmış sayılmaz.


## Güncel yollar — 18 Ekim 2026

**ALLOW: yalnız çevrimiçi atıflı gösterim.** OSM veri lisansı ODbL-1.0;
OpenMapTiles şema tasarımı CC BY 4.0; OpenFreeMap hizmet kodu MIT. Bu lisanslar
birbirinin yerine geçmez. Kendi stil katmanlarımız kullanılır; hazır Liberty/
Bright stili, font veya sprite kopyalanmadı. Haritada görünür OSM/OMT atfı ve
lisans bağlantısı var. Tile offline paketi/ETL yeniden dağıtımı yok.
[Okunan lisans/şart metinleri ve karar](reports/atlas-colors-roads.md).

## 18 Ekim 2026 — Kurulan GeoNames dünya paketi / web dağıtımı

Önceki ALLOW:CCBY4.0kararı değişmedi. Gerçek edinilmiş beş girdi receipt'i,
paket SHA'ları ve atıf kontrol edildi. Kurulu version:
`c0972addaf25d13ab7c1fa1b1ade254f2c3c7ca50003be9c78c964df98f03d29`.
248ülke/bölge,5.616.753kayıt,16.102paket/645.992.949byte.
KodMIT; GeoNames olguları CCBY4.0; Wikipedia/Commons hakları ayrı kalır.
Kaynak kapsamı modernP/ADM1–4temsil noktalarıdır, tarihî sınır veya resmî ilçe
envanteri değildir. Veri/snapshot/provenance değiştirilmedi; web sunum biçimi
düzeltildi. `web:export` yalnız hak/şema/SHAkontrolü geçen paketleri ve mevcut
GeoNames NOTICE'ını `dist/data/places` içine aktarır. Simgesel bağlantı, bozuk
paket, bilinmeyen lisans veya eksik NOTICE otomatik dağıtıma alınmaz.
[Güncel kanıtlar](reports/metro-places.md).

## 18 Ekim 2026 — Osmanlı kişi paketi ve belirsizlik düzeltmesi

**ALLOW: 1.2.0-births incelenmiş yapılandırılmış olgular**, Wikidata CC0-1.0.
33 kişi, üretimde kullanılan 12 farklı yer ve 5 editöryal karar source ID'si;
50 source ID, 5 ayrı katalog, 369289 byte JSON. 22 yıllık yaklaşık doğum
noktası, 8 biyografik bağ, 3 noktasız profil. Kaynak ve karar SHA'ları kodda
sabitlenir; staging çıktısı kendi kendini onaylayamaz.
[Ayrı NOTICE](../assets/licenses/Wikidata-ottoman-people-NOTICE.txt),
[kişi/yer revizyonları](reports/ottoman-people-coverage.md).

TDV Orhan / Bayezid I / Bayezid II / Süleyman I maddeleri kronoloji ayrışması
için araştırma referansıdır; metin, resim, PDF veya geometri yeniden
dağıtılmadı. Wikidata CC0 bu makalelere uygulanmaz. Wikipedia/Commons görseli
ithal edilmedi. Önceki release'ler 1.0.1 ve 1.1.1'e güncellendi; belirsiz
beş doğum noktası biyografik sınıfa geçti. Önceki sicil satırlarının sayıları
o çalışma anına aittir. Sınır, tile, OHM ve Historical Basemaps kararları değişmez.

## 18 Ekim 2026 — geniş kişi listesi

**ALLOW yalnız incelenmiş1.1.0-birthsçıkarımı:**29kişi/28yer/4editöryal kaynak,
[Wikidata CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
[AyrıNOTICE](../assets/licenses/Wikidata-expanded-people-NOTICE.txt),
[kaynak/karar tablosu](reports/requested-people-coverage.md).29yeni profil,
26yaklaşık doğum noktası ve2yalnız biyografik bağ;1profilyer noktasızdır.
Wikimedia makale metni/portre ithali yok. İstekmetni ve yazım eşleştirmesi
kullanıcının arama ipucudur; kaynaklı tarihî ad/yer iddiası sayılmaz.

698bekleyen kişi için toplama çıktısı **UNVERIFIED** staging; doğum/yer ve
hak onayı değildir. Grup/ayrıştırılamayan adlar kişi doğum verisi yapılmaz.
HamSHApinleri/revizyon/atıf/production gate'leri korunur; eski sınır/tile/medya
kararları değişmez. [İşleme ve sınırlar](people-expansion.md).

## 18 Ekim 2026 — Kaynaklı doğum incelemesi: ALLOW, kapsamı sınırlı

Wikidata katkıda bulunanların yapılandırılmış olguları **CC0-1.0**:
[hak metni](https://www.wikidata.org/wiki/Wikidata:Licensing).
111 kişi, 83 farklı koordinat kaynağı ve 14 editöryal karar kaydı; toplam 208
ayrı source ID. [Revizyon bağlantıları ve kapsam](reports/person-birth-coverage.md),
[ayrı NOTICE](../assets/licenses/Wikidata-births-NOTICE.txt). Kaynak sayfalarından
seçilmiş olgular editöryal çıkarımdır; API yanıtı gibi sunulmaz. Kısa Türkçe
özetler/inceleme notları projeye aittir. KTB sayfası Atatürk için ek çapraz
kontroldür, sayfa metni veya görseli paketlenmedi.

`src/people/policy.ts` onaylı iki ham SHA'yı sabitler; üretim manifesti her
kataloğun sürüm/hash/boyutunu taşır. Domain lisans, atıf ve revizyon kapıları
her kataloğa ayrıca uygulanır. Ham dosyayı değiştirmek otomatik onay değildir.
Wikipedia makale metinleri ve Commons görselleri CC0 kapsamına alınmadı; portre/
makale ithali yok. Sitelinkler mevcut güvenli hizmetle kullanıcı eyleminde
doğrulanır. Tarihî sınır/tile/medya hakları ve önceki BLOCKED kararları değişmez.

## 18 Ekim 2026 — GeoNames şehir/idari nokta kataloğu

**Kaynak lisansı ALLOW: CC BY4.0; dünya paketi NOT INSTALLED.**
[Resmî README](https://download.geonames.org/export/dump/readme.txt) ve
[hak metni](https://creativecommons.org/licenses/by/4.0/legalcode.en) incelendi.
Atıf/değişiklik belirtme koşuluyla güncel yerleşim/ADM1–4 noktalarının türevi
dağıtılabilir. Beş sabit girdi allowlist; README lisansı değişirse ETL durur;
receipt/hash/sürüm/lisans ve NOTICE kapısı. [NOTICE](../assets/licenses/GeoNames-NOTICE.txt),
[politika](modern-places.md). GeoNames hakları MIT/WikidataCC0/WikipediaCommons
haklarından ayrı. İlçe sınırı, makale/görsel veya belirsiz lisanslı veri eklenmedi.
Önceki HistoricalBasemaps/CShapes/OHM kararları değişmez.

## 18 Ekim 2026 — discovery CC0 olgu çıkarımı

data/pilot/raw/discovery-facts.json:10kişi/7olay/6güncelşehir ve4bağlıyer
kaynağı, kaynak revizyonları sabit editöryalstructureddata.27yeniWikidata
kaynağı; önceki8ile35. CC0-1.0, yalnız yapılandırılmış olgular ve projeye ait
kısa Türkçe özetler. Wikipedia makalesi/portre/tablo/payloadResponse kopyası yok.
[Wikidata hak metni](https://www.wikidata.org/wiki/Wikidata:Licensing),
[ayrı NOTICE](../assets/licenses/Wikidata-discovery-NOTICE.txt),
[tek tek kaynaklar](reports/turkey-discovery.md).
Pilot üretimmanifesti hamSHA/revizyon/dönüşüm/atıfı; pilot:check yeni şehir
modülünü ve NOTICE'ı yeniden üretimle kontrol eder. Hak gate gevşetilmedi.
CShapes/HistoricalBasemaps/OHM kararları değişmez. ReferansJPEGler paketlenmedi.


## 18 Ekim 2026 — üç satırlık ülke coğrafyası incelemesi

Cliopatria/Seshatv0.2.1 **CC BY4.0**, yalnız13239/13370/13580kaynak satırları
ve sabit arşivSHA için inceleme: **ALLOW**. Yeni geometri çizilmedi; dış sınır
ithali yok. Çad teğeti doğrulaması ve Libya eski rejim başlığı/kimliğinin genel
ülke alanından ayrılması açık değişiklik notudur. Dönem/kenar/delikler korunur.
İzin bağımsız tarihî doğrulama değildir; çıktı yaklaşık kaynak coğrafyasıdır.

ÇıkarımSHA `e9c65f7bbc68000f6e9705c3a337d4611c3cc6555311c1e5cbb38cf0eedfa402`;
[zorunlu ayrı bildirim](../assets/licenses/country-review-NOTICE.txt),
[kaynak/lisans](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1).
CI `world:review:check` çıkarım/geometri ve NOTICE hash'ini doğrular. Kullanıcı
atıflara ©/kapalı ayrıntılardan erişir; hak kaydı silinmez.108kısa ad eşleştirmesi
proje editöryal gösterimidir; özgün adlar saklı.

CShapes **CONDITIONAL / üretim onayı yok**, Historical Basemaps **BLOCKED FOR
REDISTRIBUTION**, OHM nesne/üye kapısı sürer. Wikidata olguları ile Wikipedia/
Commons hakları ayrı; makale/metin/görsel ithali yok. Yeni npm/native/font/tile
bağımlılığı yok. [Tam rapor](reports/compact-country-map.md).

## 17 Ekim 2026 — kimlik çıkarımı ve MS2010 incelemesi

**Cliopatria/Seshat v0.2.1 kaynak kimliği metaverisi: CC BY 4.0, ALLOW yalnız
bu sabit çıkarım için.** Yeni geometri/medya hakkı verilmedi. Mevcut onaylı
arşivden13375kaynak QID'si, satır/ad/dönem eşleşmesiyle korunur; Wikipedia
başlıkları/URL'leri kopyalanmaz. ÇıkarımSHA
`ed0da9156a1b5fabc6e3f6016ccf3537a8a8fafd5ebcd13a6fdf92dbbbeef92b`;
arşivSHA `e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4`.
[Kaynak/sürüm](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1),
[özgün lisans](../assets/licenses/cliopatria-v021-LICENSE.md),
[ayrı atıf ve değişiklik kaydı](../assets/licenses/Cliopatria-identity-NOTICE.txt).
Kimlik adayları bağımsız tarihî doğruluk onayı değildir. CI çıkarım ve NOTICE
hash'ini kontrol eder; tam yeniden üretim ham ZIP'ten yapılır.

Fransa13247kaydı yalnız özgün anakara/Korsika parçalarıyla kısmi alan olarak
gösterilir; Hollanda13116yinelenen çizimden çıkarılır. Koordinat ekleme,
sadeleştirme veya başka kaynaktan sınır yapıştırma yok. Ham374paket ve kaynak
lisansları korunur; yeni inceleme sürümü1.0.0. Etkin431askı sayısı önceki430'a
bir yinelenen kaydın eklenmesidir. Değişiklikler kart/Atıflar'da belirtilir.

Kullanıcı isteğiyle alınan **Wikidata yapılandırılmış sitelink olguları CC0**:
yalnız QID/revizyon ve mevcut TR/EN URL'si oturum cache'ine alınır. Wikipedia
makale metni, makale görseli veya Commons dosyası kopyalanmaz; onların lisansı
CC0 sayılmaz. Chronas yalnız işlevsel referans; verisi/kodu/varlığı alınmadı.

CShapes2010araştırması180aday/177geometri geçer/3inceleme; **CC BY-NC-SA4.0,
CONDITIONAL / üretim onayı yok**. Yerel köken/tarih/statü kontrolü sürer.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION**, OHM nesne/member kapısı
değişmedi. Yeni bağımlılık veya tile/font servisi yok. [Tam inceleme](reports/application-review-2010.md).
Aşağıdaki sayımlar eski sürümlerin veya ham manifestin kayıtlarıdır.

## 17 Ekim 2026 — kullanıcı isteğiyle siyasi alan renkleri

Mat siyasi renk üretimi ve stil düzeni projenin kendi MIT kodudur. Yeni font,
görsel, servis, bağımlılık veya veri alınmadı. Kaynak dosyaları/üretim
paketleri/atıflar değişmedi. Renklerin tarihî bayrak, siyasi ittifak veya
kesin egemenlik anlamı olmadığı lejantta belirtilir. Mevcut Cliopatria hakları,
CShapes için üretim onayı verilmemesi ve Historical Basemaps dağıtım engeli
aynen sürer. [Rapor](reports/political-area-colors.md).

## 17 Ekim 2026 — dünya kaynağı ikinci inceleme ve alternatif ülke verileri

Mevcut üretim dünya protokolü Cliopatria0.2.1 arşiv SHA'sı
`e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4`
ve `v0.2.1-world-source-reconstruction-2` revizyonuyla sınırlı **CC BY4.0**
onayı taşır. Politika1.3.1, metadataSHA
`0024205491e753f88c12046841b4f19083514a4d9988aa9e75906817384e2fc8`.
12933 yeni dünya satırı ve eski16pilot kaynak satırı ayrı protokollerle
çizilebilir;430satır incelemede. Yayıncı izni ve kaynak/geometri sadakati,
bağımsız tarihî doğruluk veya egemenlik onayı değildir. Tam atıf her `.atlas`
paketinde ve uygulamada korunur. Yeni koordinat çizimi/ithali yok; izole iç-halka
teğet temaslarına ilişkin doğrulayıcı düzeltmesi ve12ad/dönem dışlaması var.

[CShapes2.0](https://icr.ethz.ch/data/cshapes/) veri lisansı
[CC BY-NC-SA4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/):
**CONDITIONAL / üretim onayı yok**. R kodunun GPL lisansı veriye izin sayılmaz.
Atıf, ticari olmayan kullanım ve türetilmiş veride aynı lisans koşulu var;
MIT projenin veri lisansına dönüştürülemez. İndirme önerisi araştırma/karşılaştırma
içindir; ham inceleme klasörü Git dışında ve uygulama assetlerinden ayrıdır.
Yerel `cshapes:inspect` aracı yalnız şema/tarih/geometri aday envanteri üretir;
her raporda `productionAllowed: false` ve `UNVERIFIED_LOCAL_INPUT` bulunur.
Gerçek CShapes dosyası artık yerelde incelendi:26344671byte,
SHA384b1ea90b9419f30a858d7ec237c85a22c60d1b35b5f85f215a1204f9989d42.
710satır veMS2000'de179dönem adayı envanterlendi; koordinatlar üretime veya
rapor dokümanlarına kopyalanmadı. **Üretim onayı verilmedi.**
Yayıncı referansının raporda
bulunması yerel dosyanın kökenini veya yeniden dağıtım hakkını doğrulamaz.
Yeni Node inceleme kodu proje kodudur; yeni npm bağımlılığı veya veri lisans
onayı eklenmedi. Mevcut sistem `unzip` yalnız yerel araştırma aracıdır,
uygulama paketine eklenmez. [İnceleme raporu](reports/cshapes-preflight.md).
[Gerçek dosya şeması ve mevcut dağıtım engelleri](reports/cshapes-schema-review.md).

Natural Earth siyasi Admin0 kamu malı; çağdaş dosya tarihî2000kaydı sayılmaz.
geoBoundaries **gbOpen** CC BY4.0; dosya bazında kaynak yılı/lisansı ayrıca
doğrulanır. Yunanistan gbOpenAPI şu incelemede2016bildirir;2000'e taşınmadı.
OHM nesne/üye `license=*` kapısı ve Historical Basemaps
**BLOCKED FOR REDISTRIBUTION** kararı sürer. Bu alternatiflerden üretime yeni
veri alınmadı. Birincil ülke adı kontrolleri yalnız atıf/proje yazımı tespitlerdir;
resmî sayfa/PDF'lerin makale metinleri veya görselleri kopyalanmadı.
[Kaynak araştırması ve indirme adımları](country-data-research.md).
Aşağıdaki16satırla sınırlı eski karar önceki kapsamın tarihî kaydıdır.

## 17 Ekim 2026 — siyasi çizim ve ülke adı sunumu

[GeaCron](https://geacron.com/home-en/) yalnız kullanıcının istediği görsel
referans olarak incelendi. Canlı harita bu ortamda görsel olarak açılamadı;
birebir eşleşme iddiası yok. GeaCron verisi/geometrisi/kodu/fontu/görseli veya
renk değerleri yeniden dağıtılmıyor. Mat palet, ince sınır ve kutusuz ad
uygulaması projenin kendi MIT kodudur; mevcut kaynak lisans kararları değişmedi.
Yeni dış bağımlılık veya varlık yok.
[Uygulama ve doğrulama raporu](reports/political-map-presentation.md).

## 16 Ekim 2026 — seçilmiş üretim verisi kararı

Natural Earthv5.1.2 10m kara/göl/akarsu: **ALLOW**, kamu malı
[resmî koşullar](https://www.naturalearthdata.com/about/terms-of-use/).
Ham SHA, çıktı SHA/byte ve boş kayıt dışlama kaydı
`assets/licenses/physical-detail-provenance.json` içinde. Bütün isim/özellikler
atıldı; fiziksel geometri siyasi katman veya tarihî kıyı kanıtı değildir.

Cliopatria0.2.1: veri için açık [CC BY4.0 lisansı](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/v0.2.1/LICENSE.md)
doğrulandı. **CONDITIONAL → yalnız sabit16satırlık çıkarım için izin**;
`manualApprovals` kaynakID/revizyon/rawSHA üçlüsünü bağlar. Diğer13781satır
onaylı değildir. ProjeMIT lisansı bu verinin CC BYyükümlülüklerini değiştirmez.
Yazar/kaynak/sürüm/lisans bağlantısı ve halka yönü/parça ayırma değişiklikleri
pilotNOTICE, kart ve chunk içinde. Orijinal404byte lisans
`assets/licenses/cliopatria-v021-LICENSE.md` dosyasında aynen korunur.
İnceleme yayıncı veri lisansı ve seçili satır/geometri sadakatini kapsar;
bütün tarihî iddiaların uzmanlarca bağımsız doğrulanması veya upstream
bibliyografyanın tamamının yeniden incelenmesi değildir. Genişletme yeni inceleme ister.

Historical Basemaps **BLOCKED FOR REDISTRIBUTION** kalır; OHM nesne/member
kapısı değişmedi. Yeni tile/font/görsel/makale/bağımlılık yok. WikidataCC0,
Wikipedia/Commons lisansları birbirine karıştırılmaz. [İnceleme günlüğü](atlas-data-integration.md).
Aşağıdaki üretim onayı yok ifadeleri önceki kapsamı anlatır.

## 16 Ekim 2026 — ayrıntılı kaynak edinme planı

Doğrulanan yeni sürüm seçimi: Cliopatria0.2.1
[veri lisansı CC BY4.0](https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/v0.2.1/LICENSE.md).
**CONDITIONAL — inceleme amacıyla edinme uygun; üretim dağıtım onayı verilmedi.**
Atıf/yazar-kaynak/lisans/değişiklik notu ve seçilen kayıtların upstream/tarih/
geometri denetimi korunacak. Wikipedia başlık alanı URL tahmini için kullanılmaz.
Tüm repo/notebook/referans görsel hakları veri lisansı sayılmaz; yalnız veri ZIP
ve README/LICENSE inceleme kopyaları alınır. Önceki L-05kararı sürer.

Natural Earthv5.1.2 10m kara/göl/akarsu public-domain
[koşulları](https://www.naturalearthdata.com/about/terms-of-use/) yeniden okundu.
Mevcut50m dosyalarını kullanıcı edinmiş; source/license/hash kontrolü geçti.
Yeni10m dosyalar burada indirilmedi. `data:download` URL/version/license/SHA/
byte/edinme zamanını unreviewedreceipt'e yazar; üretime veya offline dağıtım
paketine taşımaz. Kod/doküman MIT; yeni dış dependency yok.

OpenFreeMap yalnız alternatif: MIT altyapı ≠ OSMODbL veri ≠ style/font hakları.
Hizmetin güncel offline kotası ve atıf gerekliliği
[araştırmada](detailed-map-research.md); tile/style alınmadı. Natural EarthII
raster da indirilmedi. Historical Basemaps **BLOCKED FOR REDISTRIBUTION**,
OHM nesne/member inceleme kapısı değişmedi.

## Yalnız Küre güncellemesi

Yeni dış veri/dependency/hak eklenmedi. Sabit Natural Earthv5.1.2/50m fiziksel
kara dosyası public-domain aday olarak aynı kaynaktan edinilir. CLI manuel
`--input` yolunda kullanıcı tarafından indirilen dosyayı aynı hak/sürüm kaydına
bağlar; edinme yöntemi ve raw/transformed SHA manifesttedir. Boyut/kapalı
poligon kontrolü kaynak otantisitesinin kanıtı değildir; başka veri bu adla
etiketlenmemelidir. Burada indirme EAI_AGAIN ve gerçek50m paketlenmedi.
Ülke/tarihî poligon hakkı çıkarılmadı; Historical Basemaps **BLOCKED FOR
REDISTRIBUTION**, OHM nesne/member denetimi ve transitif NOTICE engeli sürer.
[Komut ve kaynak açıklaması](globe-only.md).

## V3 — hak değişikliği yok

Yeni dış paket, harita verisi, makale metni, görsel, font veya tile alınmadı;
package-lock aynı kaldı. Provider yapılandırması yalnız mevcut Natural Earth
v5.1.2 public-domain kara/kıyı URL'lerini ve yerel cache politikasını toplar.
50m indirme tekrar EAI_AGAIN: veri/atıf/provenance paketi oluşturulmadı.
110m fiziksel taban tarihî kıyı veya siyasi egemenlik kanıtı değildir.

Production/dev UI ayrımı ve teknik kaynak izlerini açılır bölüme taşıma,
atıf erişimini kaldırmaz;©kontrolü ve ayrı Natural Earth/MapLibre/font/katalog
bildirimleri katmanlar kapalıyken de korunur. Yeni UI/araç/test/doküman kodu
projenin MIT lisansındadır. [Son873lock girdisi envanteri](ui-map-audit/evidence/final/licenses.json)
tam transitif/native dağıtım onayı değildir. Historical Basemaps **BLOCKED FOR
REDISTRIBUTION**, OHM nesne/üye review kapısı sürer. Wikimedia makale/Commons
hakları Wikidata CC0'dan türetilmez.

## 2026-10-16 iyileştirme ek kaydı

Yeni tarihî veri, dış paket, tile/görsel/makale lisansı eklenmedi.
Natural Earth50m fiziksel kara adayı public domain: [resmi koşullar](https://www.naturalearthdata.com/about/terms-of-use/).
`basemap:prepare` sabit v5.1.2/50m URL,12MiB/5000feature/200000koordinat kapısı,
provenance+checksum üretir; burada DNS engeli nedeniyle veri **PAKETLENMEDİ**.
110m public-domain taban korunur. MapLibreBSD bildirimi ve font bildirimleri
korunarak worker opsiyonel eval/import yolları kapatıldı; yeni hash sicilde.
Kişi NOTICE'ına coğrafya askısı açık eklendi, üretim0.4.1/ETL1.6.0.
Historical Basemaps BLOCKED FOR REDISTRIBUTION, OHM öğe hak incelemesi ve
transitif dağıtım lisansı kapısı aynen geçerlidir.


**Faz16 güncel denetim:** [ayrı hak/atıf incelemesi](attribution-audit.md) ve
[873kilit girdilik metadata/bildirim hash envanteri](reports/phase-16-dependency-licenses.json)
oluşturuldu.837kurulu eşleşme;56kurulu pakette kök lisans dosyası bu taramada yok.
Bu hak yokluğu kararı değildir; tam transitif/native NOTICE incelemesi BLOCKED.
Yeni dependency/veri/medya/tile hakkı verilmedi. Natural Earth/Wikidata/NARA dar
kapsamı korunur; kişi coğrafyası hak sorunu nedeniyle değil doğruluk incelemesiyle
askıda. Historical Basemaps BLOCKED FOR REDISTRIBUTION ve OHM nesne kapısı sürer.
Aşağıdaki eski faz durumları tarihî kayıt olarak okunmalıdır.

Faz 09 — 2026-10-16: yeni gerçek kültür verisi/hak onayı/dependency/görsel/font/
tile yok. [Kaynak incelemesi](reports/phase-09-source-review.md): D-PLACE NC
bildirimi nedeniyle seçilmedi; Pleiades yer/temsilî nokta verisi kültür sınırı
sayılmadı; OHM nesne/üye incelemesi ve Historical Basemaps dağıtım engeli sürer.
Wikipedia yalnız kaynaklı ham Wikidata sitelink eşleşmesiyle dış bağlantı olabilir;
metin/görsel hakları alınmadı. Yeni kod/stil MIT, mevcut asset bildirimleri aynı.
ETL 1.3.0 metadata'sı yeniden üretildi; katalog/geometri/hak kapsamı değişmedi.

Faz 08 — 2026-10-16: yeni dependency, font/görsel, tile, gerçek geometri veya
manual approval eklenmedi. Yeni siyasi stil/palet/etiket/kart/model proje kodu
olarak MIT; mevcut dış veri/worker bildirimleri aynı. Cliopatria'nın açık veri
lisansı yeniden [resmî metinden](https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/main/LICENSE.md)
doğrulandı; bu belirli bir polygonun inceleme onayı değildir. **CONDITIONAL**
kararı sürer; erişim ve kayıt incelemesi [Faz 08 araştırmasında](reports/phase-08-source-review.md)
engelli. Historical Basemaps **BLOCKED FOR REDISTRIBUTION**; OHM hak kapısı açık.

Denetim tarihi: 2026-10-15 · Faz 00 araştırması, Faz 01 kod lisansı güncellemesi. Bu sicil hak sahiplerinin yayınlarını ve proje paketleme kararını kaydeder. Bir lisansın genel şartlarını görmek, henüz seçilmemiş bütün nesne ve dosyaları onaylamaz. Dış kod/veri/görsel/font/tile ürün olarak **paketlenmedi**; hedef npm kurulumu engellidir.

## Karar anlamları

- **ELIGIBLE:** İlgili hak bildirimi uygun bir başlangıç sağlar; gerçek dosya/sürüm/hash, değişiklikler ve atıf kaydedilmeden paket alınmaz.
- **CONDITIONAL:** Kayıt/asset bazında inceleme ve yükümlülüklerin karşılanması gerekir.
- **BLOCKED FOR REDISTRIBUTION:** Belirsiz veya bu kullanım için yetersiz hak; bundle, tile üretimi, dönüştürülmüş GeoJSON, sadeleştirilmiş geometri, cache dağıtımı ve CDN yayınına girmez.
- **NOT SELECTED:** Alternatif; ürün bağımlılığı veya paketleme izni kararı verilmedi.

Bu durumlar hukuki kesinlik iddiası değildir; belirsiz verinin dağıtımını durduran proje kararlarıdır.

## Varlık bazında sicil

| Kimlik | Varlık / hak alanı | Doğrulanan metin ve yükümlülük | Karar / yeniden dağıtım önkoşulu |
| --- | --- | --- | --- |
| L-01 | Natural Earth raster/vektör veri | Yayıncı kamu malı beyanı; atıf zorunlu değil. [Şartlar](https://www.naturalearthdata.com/about/terms-of-use/) | **ELIGIBLE** — ilk seçim 110m land; sürüm/hash ve dönüşüm günlüğü alınacak. Gönüllü kısa atıf: “Made with Natural Earth.” |
| L-02 | Wikidata yapılandırılmış kayıt | CC0; diğer namespace metinleri aynı lisans değil. [Wikidata lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing), [CC0 metni](https://creativecommons.org/publicdomain/zero/1.0/legalcode) | **ELIGIBLE** — QID/revizyon/statement ve kaynak izleri korunur; dışarı bağlantı verilen içeriğe hak aktarmıyor |
| L-03 | OHM veri nesneleri | Varsayılan CC0, copyright içeren nesnelerde `license=*` ile istisna; CC BY/SA görülebilir. [Hak bildirimi](https://www.openhistoricalmap.org/copyright) | **CONDITIONAL** — aşağıdaki nesne/üye incelemesi bitmeden altküme yok; uygun atıf kaynak nesnesiyle bağlanır |
| L-04 | Historical Basemaps depo ve geometrileri | Depoda [GPL-3.0 LICENSE](https://github.com/aourednik/historical-basemaps/blob/master/LICENSE) var; [README kaynak açıklaması](https://github.com/aourednik/historical-basemaps#credits) farklı kaynaklardan derlemeyi belirtiyor | **BLOCKED FOR REDISTRIBUTION** — bu kayıt, GPL'nin kullanılamaz olduğu iddiasına değil, özgün geometrilerin lisans kapsamı ve hak zinciri açıklığının eksikliğine dayanır |
| L-05 | Cliopatria veri dosyası | Açık [CC BY 4.0 veri bildirimi](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md); atıf, lisans bağlantısı, değişiklik bildirimi. [Lisans tam metni](https://creativecommons.org/licenses/by/4.0/legalcode) | **CONDITIONAL** — belirli release ve seçilen geometrilerin kaynak/türetim denetimi; genel Seshat portalına veya makale lisansına dayanarak hak çıkarılmaz |
| L-06 | CShapes 2.0 veri | [ETH](https://beta.icr.ethz.ch/data/cshapes/) CC BY-NC-SA 4.0 diyor. [NC-SA metni](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode) | **NOT SELECTED** — ticari kullanımı sınırlı veri özgür kod lisansına çevrilmez; uygulamanın ücretsiz olması tüm yeniden kullanımların noncommercial olduğunu kanıtlamaz |
| L-07 | Pleiades verileri | [İndirme sayfası](https://pleiades.stoa.org/downloads) CC BY 3.0 bildirimi; [tam metin](https://creativecommons.org/licenses/by/3.0/legalcode) | **CONDITIONAL** — seçilen release'in bildirimi ve kayıt atıfları korunacak, değişiklikler belirtilecek |
| L-08 | WHG derleme ve iç kaynaklar | [Güncel lisans listesi](https://whgazetteer.org/licenses/) WHG CC BY 4.0 yanında her kaynak/veri seti koşulunu ayrı tutuyor | **CONDITIONAL** — yanıttaki kaynak/namespace/dataset atıflarını koru; NC, academic-only veya yeniden dağıtılamaz kaynaklar otomatik dışlanır |
| L-09 | Seshat genel Public Data | İndeks CC BY-SA 4.0 bildiriyor; [canlı şartlar](https://www.seshat-db.com/terms/current/) 403 ile alınamadı | **BLOCKED FOR REDISTRIBUTION** — canlı metin/edisyon kapsamı doğrulanacak; Cliopatria'nın ayrı lisans kaydı bu engelden bağımsız |
| L-10 | Euratlas vektör ve harita görselleri | [Simple License PDF](https://www.euratlas.net/shop/licences/licence_gis_gb.pdf), md. 6/8 ham veriyi dağıtmayı; md. 9 atlasın yeniden kurulmasını sınırlandırıyor | **BLOCKED FOR REDISTRIBUTION** — mevcut koşullarla ürün vektörüne/kültür sınırına dönüştürme yok; satın alma açık yeniden dağıtım sağlamaz |
| L-11 | Wikipedia makale metni | Wikimedia [Terms of Use §7](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use#7._Licensing_of_Content) metin yeniden kullanım şartlarını belirler; CC BY-SA 4.0 ve ilgili istisnalar ayrı incelenir | **NOT SELECTED** — ilk sürüm doğrulanmış dış bağlantı kullanır. İleride metin kopyalanırsa revizyon/atıf/lisans/değişiklik şartları ayrıca karşılanacak |
| L-12 | Wikimedia Commons ve Wikipedia görselleri | Dosya başına haklar; Wikidata `image` bağlantısı CC0 görsel lisansı sağlamaz. [Commons yeniden kullanım kılavuzu](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) | **CONDITIONAL** — dosya sayfası, eser sahibi, lisans sürümü, seçilen lisans, değişiklik ve varsa diğer haklar incelenmeden medya alınmaz; yerel Wikipedia fair-use içeriği otomatik kullanılmaz |
| L-13 | Expo, React Native, React Native Web, react-native-webview kodu | Her biri MIT bildirimi: [Expo](https://github.com/expo/expo/blob/main/LICENSE), [RN](https://github.com/facebook/react-native/blob/main/LICENSE), [RN Web](https://github.com/necolas/react-native-web/blob/master/LICENSE), [WebView](https://github.com/react-native-webview/react-native-webview/blob/master/LICENSE); telif/lisans bildirimi korunur | **CONDITIONAL** — seçilen tam paketlerin transitif lisansları ve notice dosyaları Faz 01'de envantere alınır; kurulu paket yok |
| L-14 | MapLibre GL JS kodu | [LICENSE.txt](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt): BSD-3-Clause; dosyada iç bileşen bildirimleri de var | **CONDITIONAL** — sabit release için bütün bildirimler dağıtımda korunur; bu izin tile/glyph/font verisini kapsamıyor |
| L-15 | Uygulamaya özgü koyu stil tasarımı | Henüz üretilmedi, dış stil kopyalanmadı | **NOT SELECTED** — proje üretimi planlanıyor; proje kod lisansı kararıyla açıkça ilişkilendirilecek |
| L-16 | Protomaps alternatif stil/kod/tileset | [Stil deposu lisansı](https://github.com/protomaps/basemaps/blob/main/LICENSE.md): kod BSD-3-Clause, görsel tasarım CC0, bazı asset/schema bildirimleri ayrıca. [Tileset](https://docs.protomaps.com/basemaps/downloads) ODbL Produced Work olarak tanımlanıyor | **NOT SELECTED** — stil tasarımının CC0 olması tile verisini CC0 yapmaz. Tile atıf/yeniden dağıtım/cache koşulları ayrı kalır |
| L-17 | Tile, terrain ve barındırma hizmetleri | Bu fazda sağlayıcı seçilmedi; demo endpointi, CDN ve önizleme barındırması üretim izni sayılmadı | **BLOCKED FOR REDISTRIBUTION** — seçilmeyen üçüncü taraf tile'ı indirme/paketleme yok. Kendi izinli statik dosyalarının HTTPS hosting'i öneriliyor |
| L-18 | Font, glyph, sprite, ikon, fotoğraf | Hiçbiri seçilmedi veya paketlenmedi; uygulama kodu lisansından bağımsız | **BLOCKED FOR REDISTRIBUTION** — dosya başına açık izin ve gerekirse türev glyph üretim hakkı doğrulanacak |
| L-19 | Alternatif renderer kodları | [CesiumJS Apache 2.0 ve iç bildirimler](https://github.com/CesiumGS/cesium/blob/main/LICENSE.md); [MapLibre Native BSD-2-Clause](https://github.com/maplibre/maplibre-native/blob/main/LICENSE.md) | **NOT SELECTED** — alternatif seçilirse wrapper, veri, asset, boyut ve lisans denetimi yeniden yapılır |
| L-20 | Projenin kendi kod/doküman lisansı | Açık kaynak hedefi ve Faz 00 MIT önerisi Faz 01'de [LICENSE](../LICENSE) ile somutlaştırıldı | **ACCEPTED — OWN CODE/DOCS ONLY**; dış veri, font/görsel/tile ve üçüncü taraf kodu kendi haklarını korur |

ShareAlike, bir dosyanın veya uyarlanan veri tabanının yükümlülüğünü uygulamanın bütün bağımsız koduna otomatik yaydığı şeklinde yorumlanmaz. Karışımın koleksiyon mu uyarlama mı olduğu somut üründe incelenir. [CC BY-SA 4.0 tam metin](https://creativecommons.org/licenses/by-sa/4.0/legalcode). Aynı şekilde GPL'nin yalnız bir depo etiketi olması üçüncü taraf hak sorunlarını gidermez veya bütün verinin yasak olduğu sonucunu doğurmaz.

## Historical Basemaps engel kaydı

Engel kimliği **HB-REDIST-01**; durum **BLOCKED FOR REDISTRIBUTION**; sorumlu rol: veri/lisans inceleyicisi. İncelenen artefaktlar README, GPL-3.0 metni ve geometri içermeyen indeks metadata'sıdır. Özgün veri kaynakları ve türetilmiş geometriler için açık kapsam/izin eşlemesi elde edilmedi. Engel aşağıdaki kanıtlar olmadan kapanmaz:

1. Kullanılacak belirli release/commit ve dosya/nesne listesi.
2. Bu geometrilere ilişkin hak sahibinin açık veri lisansı/kapsam beyanı ve kaynak zinciri; yalnız “GitHub'da açık” açıklaması yeterli değil.
3. Her upstream kısıtının çözümü; GPL kapsamına giren türevler için kaynak/bildirim/uyumluluk yükümlülüklerinin somut dağıtım planı.
4. Atıf, dönüşüm ve hash manifesti; yeni kararın sicile yazılması.

Bu engeli kaldırmak için kimseyle iletişim kurulmadı. Kullanıcı adına mesaj gönderilmez. Başka projedeki dönüştürülmüş kopya veya lisans etiketi bu kaydı atlatamaz.

## OHM nesne bazlı lisans stratejisi

Resmi [OHM etiket kılavuzu](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Tags#Sources_and_licenses) kaynak ve gerekiyorsa lisans/atıf bilgisini feature üzerinde bekler; geometrinin parçaları ayrı kaynaklanabilir.

1. Pilot sorgusu ile node/way/relation kimliği, sürüm, zaman damgası, tüm etiketler ve üye kimlikleri birlikte incelenir. Yalnız render edilmiş tile veya düzleştirilmiş poligon alınmaz.
2. `license`, `license:*`, `source`, `source:*`, `attribution` ve bunların ilgili üye/üst relation bağlamı korunur. Kayıt kaynak sayfası ve lisans metnine bağlanır. Eksik üyeyle multipolygon yayımlanmaz.
3. Açık lisans etiketi varsa tam sürüm/URL ve yükümlülük eşleştirilir. Belirsiz kısaltma, çelişki veya izin dışı kaynakta kayıt incelemeye alınır. Bir relation'ın izinli görünmesi kısıtlı üyesini yeniden lisanslamaz.
4. Lisans etiketi yokluğu, OHM'nin varsayılan CC0 beyanı çerçevesinde değerlendirilir; her etiketsiz vertex ayrı lisans eksikliği sayılmaz. Buna karşılık bilinen üçüncü taraf kaynak veya çelişkili hak izi varsa CC0 varsayımıyla sessizce geçilmez.
5. CC0/public-domain ve şartları karşılanabilen açık atıf kayıtları ayrı paketlerde tutulabilir. SA içeren uyarlamanın yükümlülükleri ayrıca çözülür; çözülemiyorsa paketlenmez. NC, ND, bilinmeyen veya çelişkili haklar yayın listesinden dışlanır.
6. Karar nesne ve üye revizyonları/hash'lerine bağlanır. Sonraki indirmede değişen kaydın eski kararı otomatik taşınmaz. Son kullanıcı atfı seçilen feature'dan hak siciline kadar izlenebilir.

## Yayına giriş manifesti ve atıf

Gelecek katalogda her dış artefakt için kimlik, tür (kod/veri/font/görsel/stil/tile), hak sahibi, asıl kaynak URL'si, lisans adı+sürümü+metin URL'si, veri sürümü/revizyonu, erişim tarihi, dosya hash'i, değiştirme notu, önerilen/zorunlu atıf, yeniden dağıtım/cache kapsamı, inceleyici ve karar tarihi tutulacak. Bu fazda dosya indirilmediği için hash alanlarına uydurma değer yazılmadı.

Varsayılan yayın politikası izin verilen kimliklerin açık listesi olacaktır. `BLOCKED FOR REDISTRIBUTION`, `OPEN` veya çözümlenmemiş `CONDITIONAL` durum manifestte varsa üretim engellenir. İnceleme kaydı, kaynağın tarihî doğruluğuna dair ayrı editör kararını da gerektirir. İlk uygulamada atıflar hem harita/kaynak panelinden hem ağsız paket içinden ulaşılabilir olmalıdır; kaynak atfı yalnız README'ye gömülmez.

## Faz 01 bağımlılık kaydı

Yeni hedef araç ve UI bağımlılıkları, lisans bağlantıları ve eksik incelemeler
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) içindedir. Tam paket/transitif
LICENSE/NOTICE envanteri kurulum engeli nedeniyle tamamlanmadı.
[Makine okunur rapor](reports/dependency-report.json) 0/19 hedef paket kurulu diyor;
null boyutlar sıfır maliyet demek değildir. Registry, peer uyumu ve boyut kapısı
geçilmeden uygulama dağıtım onayı yoktur. Hiçbir tarihî veri engeli kaldırılmadı.

## Faz 02 seçimi ve dağıtım sınırı

| Kimlik | Artefakt ve doğrulanabilen kanıt | Karar ve mevcut içerik |
| --- | --- | --- |
| L-21 | MapLibre GL JS 6.14.0, [manifest](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/package.json), [BSD-3-Clause metni](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/LICENSE.txt) | **SELECTED FOR PROTOTYPE — PACKAGE AUDIT BLOCKED**. npm hedefi eklendi, paket/worker/CSS indirilmedi; upstream kod ürüne kopyalanmadı. Hazırlama gerçek LICENSE'i korur ve görünür bundle bildirimi üretir; transitif inceleme şart |
| L-22 | react-native-webview 13.16.1, [MIT manifest](https://github.com/react-native-webview/react-native-webview/blob/v13.16.1/package.json), [LICENSE](https://github.com/react-native-webview/react-native-webview/blob/v13.16.1/LICENSE) | **SELECTED FOR PROTOTYPE — INSTALLATION BLOCKED**. Native/Gradle/transitif bildirim ve boyut incelemesi yapılmadı |
| L-23 | Natural Earth v5.1.2, [ne_110m_land](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson), [resmi public-domain beyanı](https://www.naturalearthdata.com/about/terms-of-use/) | **RIGHTS SUITABLE — BYTES NOT ACQUIRED**. Yalnız fiziksel kara; feature özellikleri atılacak. Şimdiki ürün kaynağı null, 0 gerçek geometri. İndirme/dönüşüm hash ve gerçek boyut hazırlık sonrası; güncel kıyı referansı açıklaması zorunlu |
| L-24 | Projeye ait koyu renk stili, ◎ sentetik marker, köprü ve hazırlık kodu | **ACCEPTED — OWN MIT CODE**. Dış stil, tile, font/glyph, sprite veya ikon dosyası yok; sentetik marker tarihî katalog değildir |

Doğrudan hedef paket raporu bu fazda [0/21](reports/phase-02-dependency-report.json).
Boyutlar **null/ölçülmedi**; kurulu paket, gzip/worker, DOM/Metro bundle ve APK farkı
bütçeleri geçilmedi. L-15 artık projeye ait prototip stil için L-24 ile somutlaştı;
dış tile/asset izinleri açılmadı. Hazırlama betiği yalnız açıkça seçilen L-21/L-23'ü
alabilir; belirsiz lisanslı kaynak için genel indirme yolu eklenmedi.

Historical Basemaps **HB-REDIST-01 / BLOCKED FOR REDISTRIBUTION** aynen sürer.
OHM, Wikidata, Wikimedia, tarihî sınır ve olay verisi paketlenmedi. Wikimedia
metin/medya hakları Wikidata CC0'dan ayrı kalır. Tam Notice/lock/transitif kayıtları
incelenmeden release dağıtım onayı yoktur.

## Faz 03 UI hak kaydı

Özgün düzen, bileşenler, renk/biçim tokenları ve Türkçe metinler proje MIT kodudur.
Yeni dış paket/görsel/font/ikon/harita/veri kopyalanmadı; Geographic History'den
asset/ekran/metin alınmadı. Sistem metin glifleri cihaz fontuyla çizilir.
MapLibre/Natural Earth sicili ve HB-REDIST-01 aynen geçerli; generated kaynaklar
null kaldı. AttributionPanel tam upstream NOTICE varsa özgün dilinde gösterir;
hukuki metin ürün çevirisi diye değiştirilmez. Yeni transitif bağımlılık yok,
önceki lisans/boyut denetimi engeli kapanmadı.

Faz 02 onarımı (2026-10-15): worker kontrolü mevcut TypeScript 6.0.3 geliştirme
aracının Apache-2.0 parser API'sini kullanır; yeni paket/istemci parser/asset/veri
kopyası yok. Synthetic lifecycle fixture'ları kaynak veri değildir. [Onarım raporu](reports/phase-02-repair.md).
L-21–L-23 kurulum/gerçek byte/transitif hak kapıları ve HB-REDIST-01 kapanmadı.

## Kurulum sonrası gerçek varlık incelemesi

Faz 02 takip raporu artık [21/23 kurulu sürümü](reports/phase-02-installed-dependencies.json)
ölçüyor. Seçilen Reanimated 4.5.1 / Worklets 0.10.1 (MIT) Expo native peer uyumu içindir;
kilit dosyası üretildi, bu iki hedefin gerçek arşiv/bildirim kontrolü henüz tamamlanmadı.
ESLint 9.39.5 kuruldu; bakım/deprecation uyarısı sürer, güvenlik audit'i yeşil değildir.

Gerçek Android JS export'ta Router transitifi @expo-google-fonts/material-symbols
0.4.50'nin 400Regular TTF'i bulunuyor (~971KB). Wrapper MIT, font Apache-2.0;
gerçek bildirimler assets/licenses/MaterialSymbols-WRAPPER-LICENSE.txt ve
MaterialSymbols-FONT-LICENSE.txt içinde korundu. Projeye ait UI sistem fontları
kullansa da toplam uygulamada dış font yok denemez. Yerel export bir yayın onayı
değildir; tam transitif NOTICE/app içi dağıtım incelemesi hâlâ gerekli.
Worker türevi, isteğe bağlı dinamik plugin import'larını kapatır; kaynak/çıktı hash
ve dönüşüm notu hazırlama manifestinde korunur. Natural Earth henüz alınmadı,
HB-REDIST-01 **BLOCKED FOR REDISTRIBUTION** sürer.

## Hazırlanmış gerçek varlıklar — 2026-10-15

L-21 ve L-23 artık alındı: MapLibre 6.14.0 worker/NOTICE, Natural Earth v5.1.2 kara
127 fiziksel feature/5143 koordinat; [kaynak ve hash manifesti](../assets/licenses/globe-provenance.json).
Ham veri 138160 byte, hazır worker 654885 byte. Kara özellikleri atıldı; geçmiş
kıyı veya siyasi katman iddiası yok. Telif/atıf dosyaları assets/licenses altında;
MapLibre BSD + Natural Earth atfı + Material Symbols font Apache-2.0 ve wrapper
MIT tam metinleri generated notices modülüne gömülür. `globe:check` kaynak/türev/
worker/bildirim hash ve mevcut teliflerin gömülmesini kontrol eder.

Doğrudan sürümler [23/23](reports/phase-02-prepared-dependencies.json); bu tam
transitif/dağıtım lisans onayı değildir. Tarihî katalog 0. Historical Basemaps
**BLOCKED FOR REDISTRIBUTION** sürer. Önceki indirilmedi/null kayıtları tarihîdir.

## Faz 04 — makine tarafından uygulanan üretim politikası

`src/data/source-manifest.ts` kaynak/hak alanı bazında allow/manual-review/disallowed
kurallarını; `src/domain/licensePolicy.ts` varsayılan ret ve revizyon/hash'e bağlı
inceleme kapısını uygular. Conditional onay listesi boştur. Ham JSON kendi kararını
onaylayamaz. OHM nesne/üye license=* incelemesi, HB-REDIST-01 ve Wikimedia içerik/
Wikidata ayrımı korunur. Üst kaynağı engelli kayıt da üretimden reddedilir.

Kaynak atfı Evidence ve kayıt düzeyinde korunur; kodun MIT lisansı dış veriyi
kapsamaz. Atıfsız/yasak/sentetik kayıt için üretim dizini oluşmadığı ETL testinde
denetlenir. Yeni kütüphane/veri/görsel/tile/font indirilmedi; kaynak manifesti
metadata/politika kaydıdır, aday veri dosyalarının lisans onayı değildir.
[Hak kapısı ve güven sınırı](data-model.md), [faz raporu](reports/phase-04.md).

## Faz 05 — dar NARA olgu/çizgi pilotu

**L-24 — NARA RG 11, 1867 Alaska Antlaşması olguları.**
[Resmî transkript](https://www.archives.gov/milestone-documents/check-for-the-purchase-of-alaska),
[kurumun federal eser/CC0 beyanı ve istisnaları](https://www.archives.gov/global-pages/privacy.html#copyright).
Yalnız yapılandırılmış olgu çıkarımı ve projece türetilen idealize meridyen kesiti
**CC0 1.0** olarak seçildi. Fotoğraf, tarama, mühür ve üçüncü taraf GIS geometri
alınmadı; arşivin tüm materyalleri için genel izin çıkarılmadı.

Karar source:nara-alaska-1867, revision
NARA-RG11-1867-03-30-page-reviewed-2024-03-28-extract-1 ve SHA
`cbf1c3025bee36012e7fa1b3015ffb25d766a55b54c78aaaafdc3544a01cdf62` ile bağlıdır.
Policy **1.1.0**; manual-review kuralı ve yalnız bu girdiye uyan tek editöryal onay.
Onay kaynak metninin bilimsel/kartografik tamlığını garanti etmez; kesit/ölçek/
snapshot belirsizliği [kalite raporunda](data-quality.md). Raw dosya tam HTTP
yanıtı değildir; SHA editöryal çıkarımı kapsar, upstream sayfa hash'i diye sunulmaz.

[NARA-pilot-NOTICE](../assets/licenses/NARA-pilot-NOTICE.txt) üretim NOTICE ve ortak
generated modüle gömülür; web/native kaynak panelinde korunur. `pilot:check` atıf
dahil tekrar üretimi karşılaştırır. OHM ve diğer conditional kaynaklara yeni onay
verilmedi; Historical Basemaps ve diğer yeniden dağıtım engelleri sürer.

## Faz 06 lisans farkı

Yeni dış bağımlılık, veri kaynağı, medya veya geometri alınmadı. NARA ham çıkarım
SHA ve dar kaynak onayı, iki GeoJSON LOD ve CC0 NOTICE aynıdır. Pilot 0.2.0-pilot
yalnız açık snapshot zaman annotation'ı içerir; ETL 1.2.0 ile yeniden üretildi.
Kod MIT, veri CC0, MapLibre/WebView/NE hakları ayrı tutulur. Historical Basemaps
**BLOCKED FOR REDISTRIBUTION** sürer. Yeni support/continuous beyanı kaynak hak
onayı yerine geçmez. [Faz 06](reports/phase-06.md).

## Faz 07 lisans farkı — 2026-10-16

Yeni bağımlılık, görsel/font/ikon dosyası, tile servisi veya tarihî kayıt alınmadı.
Yerleşik web range ve RN responder/adjustable API'leri, mevcut React/Expo/RN
lisans kapsamındadır. Proje kodu MIT; mevcut NARA CC0 pilotu, Natural Earth
fiziksel tabanı ve bunların ham/üretim hash/NOTICE'ları değişmedi. Historical
Basemaps BLOCKED FOR REDISTRIBUTION sürer. [Faz 07](reports/phase-07.md).

## Faz 10 — Wikidata kişi pilotu

**ALLOW — yalnız yapılandırılmış CC0 olgular:** Q5582 rev2556738621 ve Q3280282
rev2460715196. Mevcut `wikidata` allowlist kuralı geçerli; yeni paket/lisans
muafiyeti veya otomatik OHM/Historical Basemaps onayı yok.
`data/pilot/raw/wikidata-person-facts.json` açıkça editöryal çıkarımdır; kaynak
sayfasının makale metni/görseli veya özgün API yanıtı değildir. Türkçe kısa
açıklama proje olgusal özetidir. Katalog 0.3.0-pilot, ETL1.4.0, policy1.1.0.
İki ayrı source/input kimliği aynı çıkarım dosyasını ve kendi revizyonlarını
işaretler; manifest ham ve üretim checksumlarını saklar.

[Wikidata hak metni](https://www.wikidata.org/wiki/Wikidata:Licensing),
[NOTICE](../assets/licenses/Wikidata-person-NOTICE.txt), [kişi veri rehberi](persons.md).
Wikimedia makale ve Commons dosyalarının lisansı ayrıdır. P18 veya dosya adı
lisans kanıtı değildir; ayrı onaylı medya asset hattı olmadığı için üretim
görseli `PERSON_MEDIA_RIGHTS` ile reddedilir. Ham Wikidata sitelink JSON'u
olmadan Wikipedia URL'si paketlenmedi. Yeni dış bağımlılık ve görsel/font yok.

## Faz 11 — olay olguları ve hak ayrımı

**ALLOW — yalnız yapılandırılmış CC0 olgular**, mevcut wikidata policy1.1.0:
Q33745/2551218271, Q83224/2517858800, Q150995/2539526538, Q56039/2474841502.
[Wikidata lisans metni](https://www.wikidata.org/wiki/Wikidata:Licensing),
[olay NOTICE](../assets/licenses/Wikidata-event-NOTICE.txt), [kaynak ve yöntem](events.md).
Ham dosya açık editöryal çıkarım, orijinal API veya makale metni değildir.
Türkçe ad/açıklamalar projeye ait kısa olgusal özetlerdir. Historic England
metni/geometrisi, bağlı ansiklopedi/müze makaleleri ve Commons görselleri bu
CC0 iznine dahil edilmedi; dosya/geometri yeniden dağıtılmadı. Ham sitelink JSON'u
yoksa Wikipedia URL'si yok; verilirse genel ETL eşleşmesini geçmek zorunda.
Yeni dış bağımlılık yok; font/renderer/physical-data hakları önceki gibi ayrı.
Katalog0.4.0-pilot ve ETL1.5.0 manifesti tüm ham/üretim checksumlarını korur.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** ve OHM nesne/üye kontrolleri sürer.

## Faz 12 — sitelink olguları

**ALLOW — dar yapılandırılmış CC0 kimlik/sitelink olguları**: Q5582 ve Q83224,
[iki revizyon ve explicit hedefler](sources.md),
[NOTICE](../assets/licenses/Wikidata-sitelink-NOTICE.txt). Ayrı link kataloğu1.0.0
ve SHA-bound editöryal çıkarım; özgün HTTP/JSON olduğu iddia edilmez.
ADR-0013, önceki yalnız özgün JSON kuralını resmî sayfada doğrudan doğrulanan ve
hash/review ile yayımlanan bu kimlik çıkarımı için açıkça genişletir. Genel
ETL'nin kayıt içi raw sitelink eşleşmesi kaldırılmadı. Makale, Commons dosyası,
Wikipedia/Commons'ın diğer lisansları ve kaynak coğrafyası bu izne dahil değildir.
Görsel yok; eksik medya hakları üretimden reddedilir. Natural Earth, OHM
(kullanılmıyor), Wikidata, Wikipedia/Commons ve yerel tile/style durumu atıf
panelinde ayrı gösterilir. Historical Basemaps **BLOCKED FOR REDISTRIBUTION**.
Yeni dış paket veya yeniden dağıtılan makale/görsel eklenmedi.

## Faz 13 — yerel dosya deposu

**ALLOW — kod / MIT:** Expo FileSystem **57.0.7**, Expo57 bundledNativeModules
~57.0.7 ve SDK57 resmî legacy API ile eşleşir. Önceden transitif kurulu paket
aynı resolved/integrity ile doğrudan tam sürüme sabitlendi; yeni kaynak veri veya
transitif sürüm indirilmedi. [Tam MIT metni](../assets/licenses/Expo-FileSystem-LICENSE.txt)
uygulama atıflarına da eklendi; test kurulu metinle eşleşmeyi denetler. Kendi kurulu
dosyaları7.822.856 byte; APK/bellek veya ek download ölçümü değildir. Kurulu
modern File tipinin platform çözümü yetersizdi; belgeli `/legacy` seçildi, gelecek
SDK göçünde yeniden incelenir. [Resmî SDK57 kaynak](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem-legacy/),
[karar ve kurulum kanıtları](reports/phase-13.md). RN Share ve Expo Router/Linking
zaten mevcut paketlerdir; farklı share/clipboard/arama servisi eklenmedi.
Tarihî veri ve görsel/tile/kod hak ayrımı, OHM object license ve Historical
Basemaps **BLOCKED FOR REDISTRIBUTION** korunur.

## Faz 14 — tercihler ve stil guard

Yeni paket, dış servis, veri/görsel/font/tile veya makale metni eklenmedi.
Küçük yerel tercih dosyası mevcut Expo FileSystem57.0.7 MIT adaptörünü kullanır;
aynı tam bildirim uygulama atfında yer imlerinden bağımsız erişilebilir.
Natural Earth/Wikidata/NARA ve link katalog hak kapıları değişmedi. Stil guard
uzak tile/glyph/sprite/modern siyasi kaynak ve yazıları reddeder. Historical
Basemaps **BLOCKED FOR REDISTRIBUTION**, OHM object license inceleme zorunluluğu
korunur. [Faz14 raporu](reports/phase-14.md).

## Faz15 — cache ve yeniden paketleme

**ALLOW — mevcut incelenmiş pilotun türetilmiş paketleri:**6 LOD manifest girdisi,
4 benzersiz küçük katalog; önce production validateCatalog ve kaynak bağımlılık
kapanışı, sonra SHA/byte/sürüm kontrolü. NARA federal olgu çıkarımının manuel
onayı ve yalnız meridyen kesiti koşulu aynen taşınır; düşük zoom ara noktaları
kaldırır. Wikidata yapılandırılmış CC0 olguları makale/Commons lisansı sayılmaz.
Doğrudan kaynak locator/revizyon/input hash/transform ve atıflar katalog
parçalarının içinde; `public/data/chunks/NOTICE.txt` mevcut tam pilot bildirimini
ve LOD değişikliğini taşır. Cache yalnız trusted release hash'lerini tutar;
lisans doğrulamasını geçemeyen içerik cache'e yazılamaz.

Yeni dış bağımlılık/servis/tile/makale/görsel indirmesi yok. FileSystem57.0.7 MIT
adaptörü tekrar kullanılır; küçük SHA-256/budget/loader proje kodu MIT kapsamıdır,
yeni kriptografi paketi eklenmedi. Portable integrity testi Node ve standart
vektörlerle karşılaştırılır; hash uzak manifestin kimliğini doğrulama yerine
geçmez, manifest güven kökü derlenmiş sürümdür. Dış tile cache devre dışı;
Historical Basemaps **BLOCKED FOR REDISTRIBUTION**, OHM nesne hak kapısı sürer.
## 21 Ekim 2026 — GitHub / Docker önizleme dağıtımı

Uygulama kodunun MIT lisansı değişmedi. Yeni banner `docs/media/tarih-atlasi-banner.svg`
bu projede yazılan özgün SVG tanıtım çizimidir; MIT kapsamında, ekran görüntüsü değildir.
English-Desk yalnız kurulum deneyimi referansıdır; GPL kod/görsel alınmadı.
Yeni veri/portre/Wikipedia makalesi veya offline tile eklenmedi. Üretimdeki mevcut
Natural Earth, Cliopatria, Wikidata ve GeoNames hak/atıf kayıtları aynen korunur.

`release:stage`, veri NOTICE'larını ve kurulu kilitli npm paketlerindeki mevcut kök
license/notice metinlerini `dist/licenses/` altına kopyalar; sürüm, SPDX beyanı,
kaynak tarball URL'si/integrity ve geliştirme bağımlılığı bilgisini `npm-index.json`
ile kaydeder. Eksik opsiyonel başka-platform paketleri dağıtıma alınmış sayılmaz.
Bu işlem bağımsız lisans onayı değildir; açık audit kalemlerini otomatik kapatmaz.
Docker Node/Debian tabanının kendi lisansları imajda korunur; bütün imajın yalnız
MIT olduğu iddia edilmez. Kararlı yayın NO-GO kaydı sürer.
[Karar](adr/0020-preview-distribution.md), [rapor](reports/github-preparation.md).

