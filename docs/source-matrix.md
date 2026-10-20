# Veri kaynağı matrisi

## 21 Ekim — Kullanıcının indirdiği dünya tarihi kayıtları

| Kaynak/temsil | Kapsam | Lisans ve kalite |
| --- | --- | --- |
| Wikidata özgün wbgetentities JSON + makbuz | 4.273 benzersiz aday; 4.053 yeni normalize kişi/olay | CC0; ID/revision/request/byte/SHA + schema/rights kontrolü. Bağımsız tarihsel doğrulama tamam değil |
| Wikidata sınıf/ödül keşif sorguları | Nobel1032, TIME50, filozof2000, ruhban50, muharebe500, savaş500, olay500; gruplar örtüşür | Makbuzlu SPARQL; “en önemli” veya eksiksiz resmî liste değildir. Sorgu sonucu konum kanıtı değildir |
| Kaynak P569/P19 + önceki incelenmiş şehir P625 | 46 yeni yalnız doğum yılına özel yaklaşık nokta | İki referanslı assertion, tek tarih/yer, Gregorian yıl; bağımsız yaşam/ikamet çıkarımı yok |
| Kaynak olay P625 ve P580/P582/P585 | 35 yaklaşık muharebe noktası; diğer olaylar konumsuz | Savaş/antlaşmaya centroid atanmadı; bilinmeyen yıl başlıktan doldurulmadı |
| Mevcut API trwiki/enwiki sitelinkleri | Paket bazında lazy ve checksum ile doğrulanır | CC0 bağlantı olgusu; Wikipedia makale/görsel lisansı değil |

[Kayıt envanteri](reports/history-import-2026-10-21/input-audit.json),
[kapsam ve dışlamalar](reports/history-import-2026-10-21.md).

## 20 Ekim 2026 — Geniş kişi/olay eki

| Kaynak | Kapsam | Hak/temsil ve sınırlama |
| --- | --- | --- |
| Wikidata, kişi ve doğum yeri revizyonları | 56 ek kişi; 36 yıllık yaklaşık doğum noktası, 10 biyografik bağ, 10 konumsuz profil | CC0 yapılandırılmış olgu çıkarımı; gün/orijinal takvim metni korunur, yıllık filtre. Bağımsız kaynak doğrulaması eksiksiz değil |
| Wikidata P580/P582/P585/P625 | 23 ek olay: 7 yaklaşık muharebe noktası, 16 konumsuz savaş/olay/antlaşma | CC0; ana statement'lar görsel/referans niteleyicilerinden ayrıldı. Savaşlara uydurma merkez koordinatı yok |
| Wikidata mevcut trwiki sitelinkleri | 79 ek kimlik/başlık/URL eşleşmesi | CC0 bağlantı olguları; Wikipedia metni/görseli kopyası değil |
| Nobel API, TIME seçkisi, geniş WD sınıf taramaları | Toplu edinim kapsamı tamamlanmadı | Nobel koşul sayfası 403, terminal JSON erişimi EAI_AGAIN. Nobel/TIME/meslek keşfi staging komutları üretim onayı vermez |

[Her kayıt için ID, kaynak revizyonu ve belirsizlik](reports/broad-history-2026-10-20/coverage.json),
[toplama sorguları ve yanlılıklar](history-expansion.md). “Bütün önemli insanlar”
veya “bütün savaşlar” kapsamı iddia edilmiyor. TIME, New York Times olarak
etiketlenmedi. İnsan olmayan Nobel/TIME sonuçları kişi olarak dönüştürülemez.

## 19 Ekim 2026 — Referanslar edinildi

Natural Earth v5.1.2 Countries 258 / Map Units 298 özellik; iki GeoJSON
26.813.673 byte. Altı dosya receipt/SHA kontrolü geçti; karşılaştırma tamam.
geoBoundaries dört metadata dosyası önceki temsil yılı/lisans alanlarını
doğruladı; ayrıntılı geometri indirilmedi. Çağdaş kaynaklar 2024/yıllık tarih
sertifikası değildir. [Envanter, bulgular ve kaynak sınırları](reports/world-reference-review.md).

## 19 Ekim 2026 — Bağımsız ülke karşılaştırma adayları

Natural Earth v5.1.2 Admin-0 Countries ve Map Units: public domain, yalnız
çağdaş karşılaştırma; 2024 doğrulaması veya yıllık tarih serisi değildir.
geoBoundaries AGO/SYR/TUR metadata: ülke başına temsil yılı ve özgün lisans
incelemesi gerekir. CShapes 2.0 yerelde mevcut, 1886–2019; 2.1 beta 2023'e
kadar, ikisi de 1453/2024 boşluklarının doğrudan çözümü değil. OHM yalnız
nesne/tarih/lisans incelemesiyle aday; 1453 İstanbul geometrisi doğrulanmadı.
[Resmî bağlantılar, lisans ayrıntıları ve kapsam tablosu](reports/world-data-audit.md).

13.797 ham satır/4.026 yıl taraması ve tüm 195 adet 2024 kaynak kaydının
envanteri hazır. Referans indirmesi DNS engelli; bağımsız dünya eksiksizlik
karşılaştırması **PARTIAL**. Beş ülkenin QID düzeltmeleri Wikidata CC0 kimlik
olgularıdır; Wikipedia metni/görseli alınmadı.

## 18 Ekim 2026 — Dört ülkenin eksik kayıtları

Cliopatria v0.2.1'in aynı CC BY 4.0 arşivinden 9 satır daha incelendi;
önceki 3 ile toplam 12. Kaynak dönemleri ve bütün geometri kenarları korunur.
Mali'nin federasyon kimliği ile sonraki ülke kimliği ayrıdır; Angola 2024'te
Cabinda kaynakta yoktur. 2024 toplam 195 siyasi kaynak satırı: 190 çizilebilir,
5 kapalı; 2025'e uzatma yok. [Satırlar, birincil kaynaklar ve sınırlar](reports/timeline-countries.md).


## Güncel yollar — 18 Ekim 2026

| Kaynak | Kapsam | Hak | Kullanım |
| --- | --- | --- | --- |
| OpenFreeMap üzerinden OpenStreetMap | Sağlayıcının son yayımladığı dünya yol/arazi/su/bina vektör tile'ları; eksiksizlik/anlık güncellik garantisi yok | ODbL-1.0; OpenMapTiles şeması CC BY 4.0 | Çevrimiçi, görünür atıf; tarih filtresinden bağımsız |

Modern ülke etiketleri/sınırları alınmaz. Canlı endpoint DNS nedeniyle bu ortamda
kontrol edilemedi; şema ve endpoint resmî belgelerden doğrulandı.
[Birincil kaynaklar ve sınırlar](reports/atlas-colors-roads.md).

## 18 Ekim 2026 — Dünya şehir/idari verisi kuruldu

GeoNames beş girdi receipt'i ve kaynak hash'leriyle kurulu:248ülke/bölge,
4.999.482yerleşim/446.399idari kayıt/170.872yerleşim bölümü.16.102paket,
645.992.949byte. Türkiye52.786yerleşim/2.614idari/1.720bölüm kaydı içerir;
idari kayıtlar yalnız ilçe sayısı olarak yorumlanmaz. Tarihî yerleşim/sınır,
kuruluş yılı veya Wikipediaeşlemesi çıkarılmadı. As-is/CCBY4.0ve kaynaktaki
coğrafi/idari düzey farkları korunur. Bu tur yeni kaynak indirilmedi; kullanıcının
hazırladığı gerçek paketler doğrulandı, websunum JSgrafiğinden ayrıldı.
[Kapsam, kaynak ve gerçek testler](reports/metro-places.md).

## 18 Ekim 2026 — Osmanlı kişilerinde güncel kapsam

33 ek Wikidata kişi revizyonu ve 12 kullanılan yer revizyonu: CC0, yıl
hassasiyetli P569/P570/P19 ve yaklaşık P625 yer temsili. Kullanıcı listesindeki
36 padişahın tamamı kaynaklı profil; tüm uygulamada 174 profil ve 109 yaklaşık
doğum-yılı noktası. Yıllık konum, saltanat veya hareket aralığı değildir.
33 yeni profilden 22'si doğum yılında nokta, 8'i biyografik, 3'ü noktasızdır.

Orhan/Bayezid II kronolojisi, I. Mustafa yer iddiası, erken dönem tarihleri,
atıfsız I. Mahmud doğum iddiası ve saray yapı evreleri ihtiyatla tutulur.
Kanuni ve dört eski P569 belirsizlik niteleyicisi için yıllık nokta kaldırıldı.
[Değişmez kaynaklar ve kararlar](reports/ottoman-people-coverage.md).

823 istekten 144 kaynaklı eşleşme; 665 kişi incelemede, 5 grup ve 9 atlanan
belirsiz kimlik. Terminal API erişimi DNS engelli; kaynak bulunamaması tarihsel
bilginin bulunmadığı anlamına gelmez. Aşağıdaki kapsam sayıları önceki anlara aittir.

## 18 Ekim 2026 — genişletilmiş isim isteği

952ad geçişi→823ayrı istek;111'i mevcut+yeni onaylı profile eşleşir.
698kişi source-review-required;5grup kişi değildir; kullanıcı isteğiyle9belirsiz
ad atlandı. Yeni29kişi/26doğum noktası ayrı kaynak release'idir; ElealıZenon
yaklaşıkMÖ490/425veVelia bağlantısı biyografik kalır. Kullanıcının ElealıZenon
seçimi tarih/yer kanıtı yerine geçmez.

[Wikidata](https://www.wikidata.org/wiki/Wikidata:Licensing) CC0; her yeni
kişi/yer gerçek revizyonla. Ölümü bilinmeyende açık yaşam aralığı icat edilmez;
P569/P19yalnız doğum yılını destekler. API toplaması terminalDNSengelli,
staging adayları yayınlanmadı. [823satırlık kapsam](reports/requested-people-coverage.md),
[29kişinin kaynak/inceleme tablosu](reports/requested-people.md).

## 18 Ekim 2026 — 113 tarihî kişinin doğum kaydı

| Girdi | Gerçek kapsam | Sınır |
|---|---|---|
| Wikidata kişi revizyonları P569/P570/P19 | 111 profil, CC0 | Kaynak iddiası incelemesi; bütün alternatif iddiaların bağımsız tarihsel onayı değil |
| Yer revizyonları P625 | 83 farklı kaynak; 66 yıllık yaklaşık doğum noktası ve 20 yalnız biyografik yer ilişkisi | Kaynak temsil noktası, kişinin/doğum evinin hassas GPS konumu değil |
| Editöryal decisions.json | Takvim farkları, aralık/bilinmezlik, bölge reddi | Kaynaksız yıl/yer eklemez; ham olguyu silmez |
| KTB Atatürk biyografisi | 1881/Selanik çapraz kontrolü | 19 Mayıs kesin doğum günü yapılmadı; site metni/görseli ithal edilmedi |
| James Watt / Arşimet | Kaynak revizyonu incelemesi bekleyen 2 kimlik | Üretim kişi/nokta kaydı yok; ayrı listede mevcut sitelink hizmetiyle erişim |

25 profilde haritalanabilir doğum geometrisi yok. Yalnız kaynak yılı seçilmiş
yaklaşık noktalarda yıllık görünürlük; diğerleri biyografide/aramada kalır.
İlk listedeki Wright kardeşler ayrı kişiler; Edward de Vere ve Shakespeare
birleştirilmedi. [113 satırlık doğrudan kaynak/karar tablosu](reports/person-birth-coverage.md).
Kaynak lisansı [Wikidata](https://www.wikidata.org/wiki/Wikidata:Licensing);
[KTB](https://www.ktb.gov.tr/TR-96300/ataturk39un-hayati.html).

## 18 Ekim 2026 — Dünya şehir ve idari birim hattı

| Kaynak | Hedef / gerçek durum | Hak ve sınır |
|---|---|---|
| GeoNames allCountries.zip | Dünya yerleşimleri/ADM1–4; henüz indirilmedi,0 yeni üretim kaydı | CC BY4.0; günlük snapshot, eksiksiz resmî envanter veya tarihî geçerlilik değil |
| admin1/admin2/countryInfo | Kaynak kodlarıyla üst adlar/ülkeler | Aynı dumpCC BY4.0; yakınlıkla üst ilişki tahmini yok |
| readme.txt | Lisans/kolon sözleşmesi | Değişen hak metniyle üretim durur |
| Önceki6Wikidataşehri | Altı gerçek CC0fallback | Revizyon/Wikipedia akışı korunur |

[README](https://download.geonames.org/export/dump/readme.txt),
[semantik](https://www.geonames.org/export/codes.html), [tam kapsam](modern-places.md).
DNS EAI_AGAIN nedeniyle gerçek veri eklenmedi; sentetik üretim kaydı yok.
ADM5/ADMD, ilçe polygonları, tüm dünya şehir adıyla arama ve yeni Wikipedia
eşlemeleri bu sürümde yok. Tarihî ülke/savaş/kişi kapsamı değişmez.

## 18 Ekim 2026 — istenen kişi/savaş ve güncel şehir kayıtları

Yeni27Wikidatarevizyonu10kişi,7olay,6modernşehir,4ekyer içerir.
[Kaynak başına karar tablosu ve değişmez bağlantılar](reports/turkey-discovery.md).
Hepsi CC0 yapılandırılmış veri; terminal API DNS erişimi EAI_AGAIN olduğu için
resmî kayıt sayfaları araştırma tarayıcısıyla incelendi. Kaynak JSON/API yanıtı
gibi sunulmaz. Yeni portre/makale metni/ülke geometrisi yok. Dünya sınırı
kapsamı artmadı. Beş yaklaşık kişi ilişkisi ve dört ek olay noktası mevcut;
diğerleri arama/listededir. Bölge merkezi/yaşam zarfı üzerinden nokta üretilmez.


## 17 Ekim 2026 — güncel dünya incelemesi

Mevcut Cliopatria0.2.1 dünya revizyon2; kaynakCC BY4.0,
12933yeni çizilebilir kaynak satırı+16eski pilot/430incelemede.
MS2000:192kaynak siyasi kayıt/179çizilebilir/13incelemede; ülke sayısı değildir.
Yunanistan teğet-halka kontrolü düzeltildi;12ad/dönem çelişkisi askıya alındı.
Fiziksel Natural Earth10m ve önceki kaynak zincirleri korunur.

Yakın dönem için CShapes2.0 araştırma adayıdır:1886–2019, CC BY-NC-SA4.0;
üretim allowlist'ine eklenmedi. Çağdaş Natural Earth Admin0 veya geoBoundaries
dosyası kaynak yılı kontrol edilmeden2000'e taşınamaz. OHM nesne lisans/zaman
incelemesi, Historical Basemaps dağıtım engeli sürer.
[Karşılaştırma tablosu, birincil kanıtlar ve indirme adımları](country-data-research.md).
Aşağıdaki16satırla sınırlı uygulama tablosu önceki sürüm kaydıdır.

## Güncel uygulanan kaynaklar — 16 Ekim 2026

| Kaynak | Gerçekte kullanılan kapsam | Hak / belirsizlik |
|---|---|---|
| Natural Earth5.1.2 10m fiziksel |11kara,1355göl,1454akarsu; adlar çıkarıldı | Public domain; çağdaş referans; bir boş geometri dışarıda |
| Cliopatria0.2.1 |13797satırdan16satır;16siyasi kimlik/32parça | CC BY4.0; kesin sınır değil, düşük güvenli yaklaşık kaynak rekonstrüksiyonu |
| Mevcut NARA/Wikidata pilotları | Önceki kayıtlar ve kaynak zinciri korundu | Kişinin iki coğrafyası hâlâ askıda; kültür geometrisi yok |

[Satır bazlı seçim ve rapor](atlas-data-integration.md),
[4026yıl için sayım](reports/atlas-data-integration/coverage.json).
Kaynak arşivinin genel3400BCE–2024kapsamı uygulamanın kapsamı değildir;
bu alt katalog2024sonrasında siyasi alan göstermez. Başlık/QID adayları
bağlantı üretmek için kullanılmadı. Aşağıdaki staging kararları tarihîdir.

## 16 Ekim 2026 — ayrıntılı dünya ve siyasi alanlar

[Yeni araştırma ve dosya planı](detailed-map-research.md): Natural Earthv5.1.2
10m kara/göl/akarsu edinme adayı; mevcut kullanıcı50m paketi1420feature olarak
kontrol edildi. Cliopatria0.2.1 seçili inceleme sürümü; sabit README/CC BY4.0
veri lisansı/release ve43.9MBZIP metadata'sı doğrulandı. İndirme veya genel
yayıncı lisansı kayıt bazlı tarih/geometri/source doğrulaması değildir.
`POLITY/RELATION` ve dahil `FromYear/ToYear` korunacak;2025–2026uzatması yok.
Yeni stagingkolektörü üretim katalogunu değiştirmez. Tam siyasi polygon0kalır.
OpenFreeMap/OSM ve Natural EarthII alternatifleri aynı raporda; etkinleştirilmedi.
Aşağıdaki ilk faz “0kayıt/110milkaday” notları tarihî araştırma anıdır.

Faz 09 kültür pilotu sonucu: [kaynak incelemesi](reports/phase-09-source-review.md).
D-PLACE NC koşuluyla seçilmedi; Pleiades yer verisinden kültür alanı türetilmedi.
Üretim kültürü **0**; siyasi polygon veya nokta tamponu kültürel yayılım kanıtı
yerine kullanılmaz. OHM/HB kapıları korunur.

İnceleme tarihi: 2026-10-15 · Hedef seçim aralığı: MÖ 2000–2026.
Bu fazda yalnız belge, lisans ve metadata incelendi; geometri, tile, görsel veya veri paketi depoya alınmadı. “Aday” yayın onayı anlamına gelmez. Kesin paketleme kararları [lisans sicilindedir](license-register.md).

## Kapsam, format ve kalite

| Kaynak | Tarih kapsaması ve 2026 sınırı | Coğrafi / semantik kapsam | Format / erişim | Hak durumu | Doğruluk ve kullanım kararı |
| --- | --- | --- | --- | --- | --- |
| OpenHistoricalMap (OHM) | Nesnenin start/end tarihi kadar; antik çağdan yakın döneme kayıt bulunabilir, MÖ 2000–2026 boyunca sürekli/dengeli kapsama kanıtı yok | Küresel katkı platformu; sınır, yapı, yol ve farklı tarihî nesneler; yerel yoğunluk değişir | OSM node/way/relation; API/Overpass JSON/XML, GeoJSON dönüşümü gerekir | Varsayılan CC0, nesne bazında CC BY/CC BY-SA istisnaları | Nesne, üyeler, kaynak ve tarih denetimiyle pilot altküme; yalnız ekranda görünmesi doğrulama değil. [Telif sayfası](https://www.openhistoricalmap.org/copyright), [Overpass belgesi](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Overpass) |
| Natural Earth fiziksel veri | Güncel/genelleştirilmiş fiziksel referans; tarihî yıl serisi değildir | Küresel kara, kıyı, göl/akarsu; 1:110m / 1:50m / 1:10m kartografik ölçekler | Vektör ZIP ve rasterlar; kontrollü çevrimle GeoJSON üretilebilir | Kamu malı; temel coğrafya için uygun kaynak belirlendi | İlk tabanda 110m land; modern siyasi veriler alınmaz. 110m, 110 metre çözünürlük değildir; 1:110 milyon ölçektir. Eski çağ kıyısını kanıtlamaz. [Fiziksel katalog](https://www.naturalearthdata.com/downloads/110m-physical-vectors/), [kullanım şartı](https://www.naturalearthdata.com/about/terms-of-use/) |
| Wikidata yapılandırılmış veri | Öğeler ve iddialar kadar; zaman hassasiyeti ve qualifiers değişir; yaşam tarihleri yıllık bulunma kaydı değildir | Küresel kişi, olay, savaş, devlet/kültür kimliği ve yer bağlantıları; tam sınır kataloğu değil | Entity JSON / dump; WDQS SPARQL JSON/CSV | Yapılandırılmış veri CC0; makale metni ve medya ayrı hak alanları | Kimlik/sitelink ve kaynaklı iddialar için aday. Referansı olmayan/çelişen iddia kesin kabul edilmez. [Lisans](https://www.wikidata.org/wiki/Wikidata:Licensing), [JSON modeli](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_json.html) |
| Historical Basemaps — aourednik | İndekste MÖ 2000 snapshot'ı var; ayrıca daha eski kayıtlar var. İncelenen indeksin son kaydı 2010; 2026 yok. Aralar yıllık değil | Dünya/anakara ölçeği; siyasi ve kültürel alanlar aynı koleksiyonda | GeoJSON, türetilmiş SVG, yıl/dosya index.json | Depo GPL-3.0; tüm geometrilerin özgün kaynaklardan gelen hak zinciri açıklığa kavuşmadı | **BLOCKED FOR REDISTRIBUTION**. Kaynakları farklı, kaba ve tartışmalı sınırlar; indeks adı/etiketi doğruluk kanıtı değil. [README](https://github.com/aourednik/historical-basemaps), [indeks](https://github.com/aourednik/historical-basemaps/blob/master/index.json), [LICENSE](https://github.com/aourednik/historical-basemaps/blob/master/LICENSE) |
| Cliopatria (Seshat) | Yayıncı açıklaması MÖ 3400–MS 2024; değişken zaman adımları. Hedefimizin erken kısmıyla kesişir, 2025–2026 kanıtı sağlamaz | Küresel siyasi varlıklar; tek bir tarihsel yorum, kültür alanı verisi sayılmaz | ZIP içindeki GeoJSON; FromYear/ToYear dahil aralık, POLITY/RELATION ayrımı | Veri için açık CC BY 4.0 bildirimi var; genel Seshat portal koşulundan ayrı incelenir | Güçlü siyasi pilot adayı; seçilecek sürüm, kayıt kaynakları ve upstream hak zinciri denetlenmeden paketlenmez. Hazır Wikipedia alanı kullanılmaz, QID sitelinki yeniden doğrulanır. [README](https://github.com/Seshat-Global-History-Databank/cliopatria), [veri lisansı](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md) |
| CShapes 2.0 | Yayıncı sayfası 1886–2019 diyor; makale başlığı 1886–2017. Bu ayrım sürüm seçilerek çözülmeli; 2026 kapsamı yok | Küresel bağımsız devletler ve bağlı bölgeler; siyasi sınıflama kuralları var | CSV, GeoJSON, Shapefile, SQL, R | Veri CC BY-NC-SA 4.0; R paketinin GPL bildirimi veriyi açık ticari lisansa dönüştürmez | İlk sürüm paketine seçilmedi; NC koşulu özgür yeniden kullanım hedefi için kısıt. Yakın dönem karşılaştırma literatürü olabilir. [ETH yayıncı sayfası](https://beta.icr.ethz.ch/data/cshapes/), [R paketi](https://stat.ethz.ch/CRAN/web/packages/cshapes/index.html) |
| Pleiades | Antik yer adları ve konumların kendi dönemleri; yer kaydı otomatik olarak tüm antik yıllarda geçerli değil | Antik dünya yer gazetteer'i; yer, konum, ad ve bağlantı ayrılır; dünya çapında siyasi sınır serisi değil | Kapsamlı JSON dump, CSV GIS paketi, KML, RDF; sürümlü arşivler | CC BY 3.0 bildirimi; seçilen sürüm ve atıf kaydı gerekir | Antik konum/yer adı pilotu adayı; noktalardan kültür poligonu veya kişi rotası türetilmez. [İndirmeler](https://pleiades.stoa.org/downloads), [kavramsal model](https://pleiades.stoa.org/help/conceptual-overview) |
| World Historical Gazetteer (WHG) | Katkı veri setinin zaman kapsamı kadar; tarihsiz referans kaynakları da var | Küresel tarihî yer/ad uzlaştırma; her kaynak farklı kapsam/hak taşır | API, GeoJSON/bağlantılı yer verileri; şema ve API sürümü ayrıca sabitlenmeli | WHG derlemesi CC BY 4.0 yanında kaynak/veri seti hakları geçerli; tek genel lisans varsayılmaz | Kaynak keşfi adayı. Eski public_data sayfasındaki genel CC BY açıklaması güncel karma hak listesinin yerine alınmaz. [Lisanslar](https://whgazetteer.org/licenses/), [API ve atıf modeli](https://docs.whgazetteer.org/content/technical/apis.html) |
| Seshat genel değişkenleri | Seçilmiş polity/dönem kayıtları; bu oturumda tam min/max tarih veya yıllık tamlık doğrulanmadı | Siyasi/toplumsal değişkenler ve açıklamalar; kesintisiz dünya sınırı olarak yorumlanamaz | Genel değişken sayfasında CSV indirme bildirimi | Arama indeksinde CC BY-SA 4.0 Public Data koşulu görülüyor; canlı şart sayfası 403 verdi | **BLOCKED FOR REDISTRIBUTION**: doğrudan koşul/sürüm doğrulanmadan alınmaz. Cliopatria'nın kendi açık lisansından ayrıdır. [Değişkenler](https://seshat-db.com/general/generalvars/), [şart sayfası](https://www.seshat-db.com/terms/current/) |
| Euratlas | Periodis Web MS 1–2000 arasında 21 dönemsel harita sunuyor; yıllık seri değil, MÖ ve 2026 kapsamı yok. Satılan GIS edisyonunun dosya/tarih listesi ayrıca doğrulanmalı | Avrupa siyasi coğrafyası; dünya kataloğunun karşılığı değil | Satılan coğrafi vektörler; poligon verisi mevcut | Özel Simple License, açık veri lisansı değil; ham vektör dağıtımı kısıtlı | **BLOCKED FOR REDISTRIBUTION**. Görülebilir harita veya araştırma amacı kopyalama hakkı sağlamaz. [Periodis kapsamı](https://www.euratlas.net/history/europe/index.html), [GIS açıklaması](https://www.euratlas.net/history/europe/gis.html), [lisans PDF, md. 6/8/9](https://www.euratlas.net/shop/licences/licence_gis_gb.pdf) |

## Kanıt düzeyleri ve kapsam ayrımı

**Doğrulandı:** Yukarıdaki resmi teknik/lisans yayınlarının belirtilen içeriği. **Çıkarım:** Kaynakların proje için önerilen rolü. **Doğrulanmadı:** Henüz indirilmemiş kaydın geometrisi, tarih doğruluğu, kapsama oranı, boyutu ve cihaz performansı. “Küresel kaynak” ile “tüm dünya/tüm yıllar dolu” aynı şey değildir.

**Tarih seçilebilirliği** arayüzün MÖ 2000–2026 aralığında bir zaman penceresi kurabilmesidir. **Veri kapsamı** ise o pencere + bölge + katman için denetlenmiş kaydın bulunmasıdır. Seçilebilir tarih aralığının uzunluğu, veri kapsama yüzdesinin paydası olarak tek başına kullanılamaz. Kaynakların kapsaması ölçülmedi; katalogda şu an 0 kayıt vardır. [Kapsam hesaplama politikası](coverage-strategy.md).

OHM'nin kamuya açık haritasının tüm görünümü kopyalanmayacaktır: stilin hakları, altta kullanılan diğer veri kaynaklarının haklarından ayrıdır. Hazır bir tile içindeki nesne lisans metadata'sı kaybolabilir; tarihî altküme nesne düzeyinde incelenecektir. Nesne/üye denetimi [lisans sicilinde](license-register.md) tanımlıdır.

Cliopatria için yayıncı makalesi tarihî sınır rekonstrüksiyonunun ve kaynak kullanımının incelenmesine yardım eder; makalenin CC BY olması otomatik olarak bütün atıf yapılan haritaların haklarının çözüldüğü anlamına gelmez. Nature sayfasına erişilemedi, yazarın üniversite arşivindeki PDF'si okundu. [Bennett ve diğerleri, Scientific Data 12:247 (2025), yazar kopyası](https://escholarship.org/content/qt21t5k2gq/qt21t5k2gq.pdf). Seçilecek geometri için türetim/hak zinciri ayrıca kaydedilir; doğrudan Historical Basemaps kopyasını başka kaynak adıyla geçirmek kabul edilmez.

## Kaynak alım planı

Gelecek veri fazında tüm dünya sorgusu yerine pilot bölge/zaman/katman sorgusu yapılır. Önce hak metadata'sı, sonra izin verilen küçük veri parçası alınır. Tam dump zorunluysa sıkıştırılmış akış ve sınırlandırılmış yerel işleme kullanılır; belleğe tüm dünya yüklenmez.

WDQS belgesi 60 saniye sorgu süresi sınırı, istemci bütçeleri, 429 için `Retry-After` ve IP başına en fazla 5 paralel sorgu açıklar. Bunlar bu araştırmanın tarihindeki hizmet kurallarıdır. [Resmi hizmet kılavuzu](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Query_limits).

Proje başlangıç limitleri (henüz kodlanmadı): kaynak başına concurrency 1, toplam 2; sorgu başına en fazla 100 kayıt; toplam pilot üst sınırı 1.000 kayıt. Zaman aşımında işi küçült; 429/503'te `Retry-After`, yoksa jitter eklenmiş 1/2/4/8/16 saniye backoff; en fazla 5 yeniden deneme. Bir hatayı durmaksızın tekrar etme. QID/nesne revizyonu/sorgu hash'i ile cache ve checkpoint tut; kaynak kullanım şartlarını alım öncesi yeniden denetle. İstemci tanıtımı gereken hizmetlerde uygun User-Agent kullan. Servis anahtarları gerekiyorsa geliştirme alım sürecinde saklanır, statik kataloğa konmaz.

Çıktı listesi; alınan, tarih nedeniyle dışlanan, kaynak yetersizliğinden reddedilen, lisans engelli ve geometry hatalı kayıt sayılarını ayrı raporlar. Hak kararı verilmeyen satır bundle manifestine giremez. Kısıtlı/kimlik gerektiren veri API'si ürünün hesapsız çalışma koşuluna bağımlılık yapılamaz.

## Faz 02 alım durumu

Natural Earth 1:110m **v5.1.2 kara poligonu** fiziksel prototip için seçildi;
[nokta dosya kaynağı](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson).
Lisansı uygun; dosya DNS/kurulum engelleriyle alınamadı. Üründe geometri sayısı
**0**, tarihî kayıt **0**; dünya/yıl kapsama oranı ölçülmedi. Hazırlık betiği geometri
ve kaynak/hash sınırlarını kaydeder; siyasi property'leri taşımayı reddetmek yerine
hepsini kaldırır. Bu taban veri kapsamı/yıllık tarihî veri iddiası değildir.
Tarihî kaynakların hiçbirine bu fazda sorgu/indirme yapılmadı.

Hazırlama sonrası güncel durum: Natural Earth **v5.1.2 ne_110m_land** gerçekten
alındı, ham 138160 byte, **127 fiziksel feature / 5143 koordinat**. SHA ve dönüşüm
[manifestte](../assets/licenses/globe-provenance.json); bütün property'ler atıldı.
Uygulama güncel kaba fiziksel kara referansı kullanır; tarihî kıyı/polity verisi
üretmez. Gerçek tarihî kayıt sayısı **0**; siyasi/kültürel/kişi/olay kapsama oranı
artmış sayılmaz. [Son doğrulama](reports/phase-02-prepared.md).

Faz 04: tarihî kaynaklara yeni sorgu/indirme yapılmadı. Kaynak adaylarının hak
kararları `src/data/source-manifest.ts` politikasına taşındı; gerçek release ve
nesne SourceRecord'ları ancak raw checksum, kaynak revizyonu, atıf ve incelemeyle
ETL'ye alınabilir. Conditional adaylar otomatik paketlenmez. Üretim tarihî kayıt
sayısı **0**; bu şema çalışması kapsama eklemez. [Alım/denetim rehberi](data-model.md).

## Faz 05 — seçilen/elenen gerçek pilot adayları

| Kaynak / kayıt | Zaman ve coğrafya | Üretim kararı |
| --- | --- | --- |
| NARA RG11 1867 antlaşma transkripti, md. I/IV | Yalnız 1867-06-20 belge snapshot'ı; 141°B ideal meridyeni, proje seçimi 65–68°K | CC0 olgu çıkarımı + açık türetim; **1 sınır kesiti**, tam devlet/kültür alanı değil. URL/madde/revizyon/raw SHA/atıf korundu |
| OHM relation 2692735 San Marino | Web görünümü v16, start 1463-06-27, end 1699; 13 üye | `fixme:s` sınır kaynağı istiyor; canlı API EAI_AGAIN, üyeler/hak zinciri denetlenmedi. **ALINMADI** |
| Historical Basemaps | Daha önce incelenen snapshot indeksi | Hak zinciri çözülmedi; araştırma referansı olarak kaldı, geometri/tile paketlenmedi |

NARA: [belge](https://www.archives.gov/milestone-documents/check-for-the-purchase-of-alaska),
[hak kapsamı](https://www.archives.gov/global-pages/privacy.html#copyright).
OHM: [gerçek kayıt](https://www.openhistoricalmap.org/relation/2692735),
[alım yöntemi](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Overpass).
Diğer çağ/coğrafya ve kültür kapsaması doğrulanamadı; satır sayısı doldurulmadı.
Gerçek görüntülenebilir tarihî iddia **1**, teknik toplam **6**. [Kalite raporu](data-quality.md).

## Faz 10 — gerçek kişi pilotu (2026-10-16)

| Kaynak / revizyon | Kapsam / format | Hak / kalite / durum |
| --- | --- | --- |
| Wikidata Q5582 / 2556738621 | Bir kişinin yaşamı ve P551=Q3280282, P580 1879-08 / P582 1880-10 | Yapılandırılmış olgular CC0; tarayıcıda incelenmiş editöryal çıkarım, özgün JSON değil. Bağlı müze referansı bağımsız alınamadı; orta güven, yaklaşık opt-in |
| Wikidata Q3280282 / 2460715196 | Maison Van Gogh modern yapı P625 noktası; DMS → lon-lat | Yapılandırılmış olgular CC0; tarihî oda/ölçüm veya kişi GPS doğruluğu yok |

Toplam 1 kişi / 1 konum ilişkisi; 1879–1880 dışında bulunma çıkarılmaz. Tam
siyasi polygon/kültür pilotu hâlâ 0. Özgün entity JSON için terminal DNS/curl6;
Wikipedia alanı boş, görsel yok. [Sabit revizyonlar ve bütün resmî özellik/API
referansları](persons.md). Diğer kaynakların önceki dağıtım engelleri kalkmadı.

## Faz 11 — dört dar olay kaydı (2026-10-16)

| Yapılandırılmış kaynak | Kapsam / hak / sınır |
| --- | --- |
| Wikidata Q33745 rev2551218271 | Peloponnesos Savaşı, MÖ 431–404; yalnız yıl; geometri yok, date statement doğrudan referansları eksik; CC0 dar olgu çıkarımı, medium |
| Wikidata Q83224 rev2517858800 | Hastings 1066, yaklaşık P625 referans noktası; gün takvim dönüşümü yapılmadı; muharebe alanı polygonu değil; CC0, medium |
| Wikidata Q150995 rev2539526538 | Vestfalya 24 Ekim1648 Gregorian; çok yer ilişkisi tek noktaya çevrilmedi; geometri yok; CC0, medium |
| Wikidata Q56039 rev2474841502 | Süreç1989–1990; ayrıca 1991 tarih iddiası korunur, anlamı bağımsız çözümlenmedi; geometri yok; CC0, medium/uncertain |

[Revizyon URL'leri ve kaynak sınırlamaları](events.md). Dört Source/Input, aynı
açık etiketli editöryal çıkarım dosyasını revizyon bazında işaretler; özgün API
yanıtları olduğu iddia edilmez. JSON terminal alımı DNS/curl6. Historic England
araştırma referansı incelendi fakat metni/polygonu/lisansı kopyalanmadı.
Sitelink/görsel/katılımcı alanları ayrıca doğrulanmadığı için boş. Toplam katalog
19 kayıt / 7 kaynak; önceki 1 sınır ve 1 kişi ilişkisi korunur.

## Faz 12 — yalnız kimlik bağlantısı kapsamı

| Kaynak | Kullanılan kapsam | Temsil / lisans | Sınır |
| --- | --- | --- | --- |
| Wikidata Q5582 rev2556738621, Q83224 rev2517858800 | İkişer TR+EN sitelink, iki QID | Resmî sitelink bölümünden açık etiketli olgu çıkarımı / CC0 | Özgün API DNS engelli; makale, görsel, geometri veya yeni tarih iddiası yok |

[Hedefler ve resmî kaynak revizyonları](sources.md). Diğer üç olayda QID fallback;
siyasi kimliklerde QID yok, kültür üretim alanı yok. Tarihî katalog sayısı 19/7
olarak korunur; iki link snapshot'ı tarihî kayıt sayısına katılmaz. URL eşleşmesi
bilimsel bir olay/kişi konumu/sınır incelemesinin yerine geçmez.


## Faz16 — bağımsız örneklem incelemesi

[İddia tablosu](historical-accuracy-audit.md) antik/Orta Çağ/modern kaynak
bağlantılarını, erişilmeyen sabit Wikidata revizyonlarını ve inceleme
sınırlarını kaydeder. NARA transkripti dar meridyen/snapshot iddiasını destekler;
kurumsal kişi kaynağı eski konumun geri çekilmesine yol açtı. Kişi profili
korunur, konum üretim haritasında askıda. Tam siyasi/kültürel alan0; yeni
kurumsal metin veya geometri kopyası yok. Haklar [ayrı audit](attribution-audit.md)
içinde; kaynak görmek yeniden dağıtım izni değildir.
