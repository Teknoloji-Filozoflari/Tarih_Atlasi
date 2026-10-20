# Savaş, antlaşma ve tarihî olay sözleşmesi

2026-10-16 · Faz 11 · [ADR-0012](adr/0012-event-layers.md).

## Model ve zaman sorgusu

`HistoricalEvent.eventType` tam olarak BATTLE, WAR, TREATY, FOUNDATION,
DISSOLUTION, CULTURAL_EVENT, OTHER olabilir. Eski genel EVENT türü sessizce
başka anlama çevrilmez; fixture'lar açıkça OTHER'a taşındı. Kimlik entity türü
muharebede BATTLE, diğer olaylarda EVENT'tir; bu alan ayrıntılı eventType'ı
kaybettirmez. Üretimde `details` zorunlu, profilsiz eski kayıt yalnız staging
geçişinde kabul edilir. Yeni katalog0.4.0-pilot / schema2 / ETL1.5.0 kullanılır.

| İstenen alan | Kanonik temsil |
| --- | --- |
| id / title | Kalıcı `id`; dil etiketli `names`, Türkçe tercih eden `eventTitle()` |
| eventType | Yedi türden biri; savaş/muharebe/antlaşma farklı kalır |
| dateExtent | Tek tarih otoritesi `temporal: TemporalExtent`; `eventProjection().dateExtent` salt okunur projeksiyon |
| placeId | `details.placeId`, kaynaklı yer referansı veya null; yerin koordinatı olaya kendiliğinden kopyalanmaz |
| point/region geometry | Point/Polygon/MultiPolygon veya null; LineString reddedilir; boşlukta gerekçe zorunlu |
| locationPrecision | `details.locationPrecision`: site / approximate-point / documented-region / unknown, nullable kaynak toleransı ve açıklama |
| participants | Kanonik `participantIds`; repository yalnız var olan kaynaklı entity'leri çözer; projeksiyonda `participants` |
| description | `details.description`, kaynak dilini koruyan kısa metin; Türkçe tercih |
| sources | Ortak `evidence` source/revision/raw/locator/claims/rights/transform bağlantıları; projeksiyonda `sources` |
| wikipediaSitelinks | `details.wikipediaSitelinks`; yalnız ham checksumlu Wikidata sitelink eşleşmesi |
| reviewStatus | Ortak kayıt ve tarih inceleme durumu; üretim yalnız verified |
| alternatif tarih | `details.alternativeDates`: ayrı TemporalExtent, açıklama ve temporal iddialı `evidenceIndices` |

Birbirinin kopyası iki değiştirilebilir başlık/tarih/kaynak alanı tutulmaz.
Alternatif tarih taşıyan canonical kayıt `uncertain=true` olmalıdır. Alternatif
kaynaklar aynı evidence/source/rights kapılarından geçer; indeksin dışını veya
identity-only kanıtı işaretleyemez. Doğrulanmamış alternatif tarih üretime girmez.
Alternatifler kendiliğinden ana olay dönemiyle birleştirilmez veya haritayı başka
yıla taşımaz; kartta kaynak iddiası olarak kalır. Bu ilk sürümde yıl indeksi
kanonik belgeli aralığa aittir; alternatif tarihlerden ayrıca yıl sonuçları
üretilmez. Bu sınırlama bağımsız çelişki çözümünün yapıldığı iddiasını engeller.

`getEventsAtYear(year)` incelenmiş, tarihi bilinen olayların kanonik döneminin
yıl ile kesişimini döndürür; kaynaklı başlangıç/bitiş dahil, yıl sıfırı yoktur.
MÖ1/MS1 geçişi mevcut astronomik dönüşümü kullanır. Savaş birçok yıla yayılabilir;
muharebe tek gün veya belgeli bir aralık olabilir. Kesintili dönemler mevcut
TemporalExtent.periods ile boşlukları korur. Tarihsiz kayıt hiçbir yıla dağıtılmaz.
Olay dönemi bağlı kimlik dönemiyle çelişirse validator reddeder, motor da göstermez.

`createEventRepository(provider,timeline)` backend bağımsızdır:
`atYear(year,{battle,event,offset})` 8'li sayfalı liste; `detail(id,year)` ayrı
supported/mapSupported, katılımcılar, kaynaklar ve canonical projeksiyonu verir.
Liste kaynak zamanı ile eşleşen fakat geometrisi olmayan olayı da taşır. Önceki
sonuçların yeni yıla yazılmasını engelleyen ortak frame/store/AbortSignal/revision
ve renderer ACK mekanizması korunur.

## Geometri ve katmanlar

WAR/BATTLE `battle` anahtarına, diğer beş tür `event` anahtarına bağlıdır.
UI'daki **Savaş** ve **Olay** bağımsızdır: savaşı kapatmak antlaşmayı gizlemez.
Antlaşmalar ayrı § işareti taşır; ayrıca üçüncü kontrol eklenmedi.

Harita için incelenmiş tarih+geometriyi birlikte destekleyen aynı evidence,
açık snapshot/continuous desteği, medium/high confidence ve uygun
locationPrecision gerekir. Sadece tarih, placeId, devlet merkezi, başkent veya
rastgele şehir konumu harita geometrisi sayılmaz. `WAR_AS_POINT` bir savaşın
kapsamını Point'e indirgemeyi reddeder. Savaş için kaynaklı alan veya konumsuz
liste kaydı kullanılır. `unknown` anlamı geometrisiz olmalı; alan/nokta
sınıflandırması geometriyle çelişemez. Modern ülke sınırı ikame edilmez.

Noktalar yerel DOM Marker; olay alanları düşük dolgu/kesik kenarla ayrı GeoJSON
katmanındadır. Alan etiket ankrajı yalnız sunum içindir; Point geometrisi veya
kesin olay merkezi üretilmez. Dolgu bütçesi bütün olay alanları için tutucu
0.3 toplam alpha / kayıt sayısı ile sınırlandırılır; alanlar siyasi egemenlik
olarak gösterilmez. Mevcut topoloji/antimeridyen/sınır boyutu kapıları sürer.

| İşaret | Anlam |
| --- | --- |
| ⚑ | Kaynaklı savaş alanı veya listedeki savaş kaydı |
| ⚔ | Muharebe; nokta tam muharebe alanı değildir |
| § | Antlaşma / barış anlaşmaları |
| ✦ | Kuruluş, dağılma, kültürel veya diğer olay |

Kişi marker yaşam döngüsü küçük presentation adaptörüyle paylaşılır; farklı
anlam/renk/semantik etiket kullanılır. En fazla1.000 kayıt ve 64 DOM küme / marker
grubu; zooma göre hücre, ekran dışı/arka yüz süzgeci ve MapLibre covered sınıfı.
Küme farklı olay türleri içerebilir; baştaki ikon yalnız ankrajın türüdür,
yanındaki sayı kayıt sayısıdır. Bütün adaylar 8'li seçim sayfalarıyla erişilir.
Aynı ekranda kişi+olay+alan örtüşmesinde yakın DOM ankrajları ve çizili alanların
hitleri birleştirilir; alttaki kimlik silinmez. Tüm katmanlar aynı anda açıkken
kişi ve olay gruplarının ayrı 64 sınırı vardır; birleşik 128 DOM küme + sınırlı
alan etiketleri bütçesi gerçek cihazda ölçülmelidir.

Yıl/layer/preview değişince eski seçimler temizlenir. Drag ve örtülmüş marker
seçim üretmez; remount/unmount/context hata yollarında listener ve Marker'lar
kaldırılır. Kamera yıl değişiminde korunur; karttan açık odak isteği yılı
değiştirmez ve reduced motion halinde geçiş 0 ms'dir. Yeni WebView/glyph/font/tile
servisi veya dış npm paketi yok. Statik katalog ve fiziksel taban offline
çalışabilecek şekilde paketlenir; dış kaynak/Wikipedia için ağ gerekir.

## Kullanım ve kart

**1066 muharebe örneğini göster** yılı ve savaş katmanını seçer; kamerayı
kendiliğinden hareket ettirmez. ⚔ marker veya **Bu yılın savaş ve olayları**
listesi Hastings kartını açar. 1067'de kayıt/marker yoktur. Katmanlar panelinden
savaşı kapatmak olay tercihini değiştirmez. Yılı1648 yapıp aynı listeyi açınca
Vestfalya Barışı yalnız listede görünür; nokta/odak düğmesi yoktur.

Kart olay adı/türü, istenen ve kullanılan bağlam yılı, canonical dönem,
hassasiyet/uncertain/sourceDate/sourceCalendar, açıklama, konum sınıfı ve gerekçe,
varsa kaynak toleransı/katılımcılar, bütün source/locator/atıflar ve doğrulanmış
sitelinkleri sunar. Alternatif iddialar ana tarih yerine geçirilmez. Etkin yılda
veya kapalı katmanda desteklenmiyorsa açık mesaj gösterilir. Liste8'li sayfalıdır;
geometri yokluğu tarihî olay yokluğu değildir. Veri yükleme hata ve loading ayrıdır.

## Dar gerçek pilot — kaynak ve kalite

Yapılandırılmış Wikidata olguları **CC0-1.0**; dört ayrı sabit revizyon
`data/pilot/raw/wikidata-event-facts.json` içinde açık etiketli editöryal olgu
çıkarımıdır. Dosya özgün API yanıtı, makale metni, görsel veya polygon değildir.
Dört SourceRecord/Input kendi kaynak revizyonuyla aynı bu çıkarım dosyasına
bağlanır; dört ayrı HTTP yanıtı olduğu iddia edilmez. Builder SHA'yı sabitler;
production catalog, events.geojson, NOTICE ve eventCoverageIndex byte/hash ile
üretilir. Önceki NARA ve Van Gogh girdileri değişmedi.

| Kayıt / sabit kaynak | Tarih / konum sınırı |
| --- | --- |
| [Peloponnesos Savaşı Q33745 rev2551218271](https://www.wikidata.org/w/index.php?title=Q33745&oldid=2551218271) | P580 MÖ 431 / P582 MÖ 404 kaynak gösterim yılları; antik gün/takvim dönüşümü doğrulanmadığı için yalnız yıl. Tarih statement'larında doğrudan referans yok; bağımsız tarih araştırması tamamlanmadı. Savaş alanı geometrisi yok; yalnız liste |
| [Hastings Q83224 rev2517858800](https://www.wikidata.org/w/index.php?title=Q83224&oldid=2517858800) | P585 kaynak metni 14 Ekim1066; Julian/proleptik gün dönüşümü doğrulanmadığından normalize tarih yalnız 1066. P625 DMS 50°54′43″K,0°29′15″D → lon-lat; approximate-point, hata payı bilinmiyor. Muharebe polygonu alınmadı |
| [Vestfalya Q150995 rev2539526538](https://www.wikidata.org/w/index.php?title=Q150995&oldid=2539526538) | P585 24 Ekim1648 Gregorian; ayrı1648 değerinin günle çelişkisi yok. Birden fazla yer ilişkisi tek nokta yapılmadı; geometri doğrulanmadı, yalnız liste |
| [Yeniden birleşme süreci Q56039 rev2474841502](https://www.wikidata.org/w/index.php?title=Q56039&oldid=2474841502) | P580 9 Kasım1989/P582 3 Ekim1990; ayrıca P585 15 Mart1991 iddiası aynı revizyonda var. Farklı süreç/aşama anlamı bağımsız çözümlenmedi, uncertain ve ayrı alternatif; kaynakta bulunması doğruluğunun bağımsız onayı değildir. Ülke/başkent noktası yok |

Dört kayıt medium confidence taşır. `verified`, dar yapılandırılmış olgunun
incelendiğini belirtir; bütün üst kaynakların veya tartışmalı tarihin bağımsız
arşiv doğrulaması demek değildir. Yalnız Hastings kaynaklı yaklaşık referans
noktası olarak çizilir. Diğer üçünde geometri eksiktir. Katılımcılar ayrıca
incelenmediği için boş bırakıldı; yok oldukları iddiası yapılmaz.
[Historic England Hastings kaydı](https://historicengland.org.uk/listing/the-list/list-entry/1000013)
araştırma referansı olarak incelendi; metni/alan polygonu veya lisansı bu CC0
pakete kopyalanmadı. English Heritage linki ve Berlin Duvarı adayı erişim hatası
verdi; edinilemeyen bilgilerden kayıt üretilmedi.

Resmî [Wikidata lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing)
yapılandırılmış veri içindir; makale ve Commons görsel hakları ayrıdır.
Özgün entity JSON terminalden DNS nedeniyle alınamadı; bu pilotta Wikipedia
sitelinkleri boş bırakıldı, isimden/QID'den URL üretilmedi. Genel ETL sitelink
alanı verilirse source/revision/raw kimliği ve ham entity sitelinki eşleşmeden
reddeder. Doğru eşleşmenin pozitif/negatif testi vardır. Pilotun maddesi veya
görseli yoktur iddiası yapılmaz. Yeni veri için birincil kaynak incelemesi ve
uygun lisans/atıf/temporal+geometri kanıtı tamamlanıp sürümlü katalog üretilmelidir.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** kalır.

## Test ve doğrulama sınırı

Birim testleri 7tür, MÖ/MS, çok yıllı/kesintili aralık temeli, konumsuz/tarihsiz
olay, tartışmalı tarih/evidence, yanlış geometri/kaynak/lisans, bağımsız katman,
8'li liste/yoğun kümeler, offline sabit katalog, ham sitelink ve gerçek pilotu
kontrol eder. Renderer double testi kişi+olay örtüşmesi, aday sayfaları, açık
odak, eski seçim ve unmount cleanup kontrolüdür; WebGL/GPU kanıtı değildir.

Gerçek tarayıcı denemesi localhost EPERM nedeniyle başlayamadı; Android
Java/adb/SDK bulunmadığından **UNVERIFIED ON DEVICE**. JS export gerçek cihaz
performansı/çalışması sayılmaz. [Faz raporu ve bütün loglar](reports/phase-11.md).
