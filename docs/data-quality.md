# Veri kalite ve kapsam raporu

## 21 Ekim — İndirilen kayıtların kaynak denetimi

2.969 yeni kişi/1.084 olay, toplam 3.203 / 1.120. Yeni 46 doğum ve 35 muharebe
noktası yaklaşık; 2.923 yeni kişi ve 1.049 olaya nokta atanmadı. 1.865 kişinin
yaşam aralığında en az bir uç eksik/belirsiz; 332 olayda yıl/aralık çözümlenemiyor.
Bu kayıtlar tarihsel yokluk diye yorumlanmaz; kaynak yıl/konum uydurulmaz.
Şema/provenance/lisans incelemesi akademik doğrulama değildir; confidence medium.

51 eski kayıt değiştirilmedi; 123 uygun tr/en ad yok, 12 kurgu/efsane/P1441
bağlamı ek incelemede, 34 insan/uygun olay değil. Özgün JSON, tüm statement/
qualifier/reference/rank ve hash'leri korunur. Düşük hassasiyetli tarih veya
çelişki rastgele yıl yapılmadı; Julian yıl kesin Gregorian doğum yılı sayılmaz.
Doğrudan P31 ile 3 muharebe ve 1 antlaşma türü ayrıldı. Önceki179 isim eşleşmesinde
kayıp 0; istek listesi 220/823. Bütün önemli insanlar/savaşlar tamam değil.
[Tüm nedenler ve test kanıtları](reports/history-import-2026-10-21.md).

## 20 Ekim — Geniş içerik incelemesi

Yeni paket 56 kişi/23 olay: 36 yaklaşık doğum yılı noktası, 10 biyografik bağ,
10 konumsuz kişi; 7 yaklaşık muharebe noktası/16 konumsuz olay. Kaynak orta
güvendir; Wikidata'da referansı bulunmayan/ithal edilmiş iddia bağımsız kurum
doğrulaması gibi sunulmaz. Özgün revision/locator ve tarih metni saklanır.
Bir aday (Jean-Paul Sartre) için sabit revision alınamadı, paketlenmedi.

- Gettysburg 1863: görsel bağlamındaki 1887 olay tarihi yapılmadı.
- Osmanlı–Kutsal İttifak savaşları 1683–1699 ve Otuz Yıl Savaşı 1618–1648:
  sayfa/referans bağlamındaki 2022/2017 değerleri elendi.
- Versay 1919 imzası ile 1920 yürürlüğe girişi ayrıldı.
- Yüz Yıl Savaşı ana filtre 1337–1453; P582 latest-date 1455 alternatif
  niteleyicisi ayrı saklandı. Fransız Devrimi'nin 1789 başlangıç olayları ve
  Amerikan Devrimi'nin kapsam tercihi açık belirsizlikle korunur.
- Kore 1950–1953 çatışma aralığı nihai barış tarihi değildir. Savaşın tüm
  alanına tek koordinat üretilmedi. MÖ 218–201 İkinci Pön Savaşı sıfırsızdır.
- Pisagor ve eski çağ doğumları, çelişkili doğum yerleri ve tarihî yapı evreleri
  çözülmeden biyografik kalır; ada/bölge merkezi kişi koordinatı yapılmadı.

Toplam 234 kişi/36 olay. Doğum sürümlerinde 233 profil/147 yıllık nokta/
47 biyografik/39 konumsuz; Van Gogh eski pilotu bu doğum sayımlarından ayrıdır.
Eski 823 istekten 179 eşleşme/635 bekleyen/9 atlanan belirsiz ad; kapsam dünya,
dil ve dönem açısından dengesizdir. Nobel/TIME etiketlerinin tam envanteri yok.
Yeni yollar, modern siyasi sınır veya tarihî kültür polygonu eklenmedi.

[Kayıt bazında kapsam](reports/broad-history-2026-10-20/coverage.json),
[test ve sınırlamalar](reports/broad-history-2026-10-20.md).

## 20 Ekim — Yayımlanmış kişi görünürlüğü denetimi

`npm run qa:people-visibility`: dört sabit doğum sürümünün 177 profili, 111 yıllık doğum noktası, 37 biyografik bağ ve 29 konumsuz profili kontrol edildi; 0 hata. Marker geometrisi/adı ve yıl bağlamı, komşu yıllarda yokluk ve yaklaşık/kesin ayrımı sınanır. Bu, tüm 823 isteğin veya tarihsel kaynakların bağımsız uzman denetimi değildir. Şehir kartındaki boş idari alan ve şehir/kişi seçim akışı hataları düzeltildi; [rapor](reports/map-card-fixes-2026-10-20.md), [makine çıktısı](reports/people-visibility-audit.json).


## 19 Ekim 2026 — Doğum görünürlüğü ve dünya eki

Atatürk 1881 Selanik kaydı vardır; yaklaşık kişi filtresi nedeniyle gizlenebiliyordu. Yeni kurulumda yaklaşık kaynaklı noktalar açık, eski tercihi açmak için yıl bağlamında eylem sunulur. Yaşam süresi konum kanıtı olarak kullanılmaz.

Yeni dört profilden Maathai (Nyeri near) ve Sheppard (1847/1848 ihtilafı) yalnız biyografik konum taşır. San Martín 1778 / Tagore 1861 yaklaşık şehir doğum noktalarıdır. Ayacucho 1824 ve Berlin 1989 yaklaşık olay temsil noktaları; üst kaynak zinciri tam doğrulanmış değildir, güven medium. Gün hassasiyeti uydurulmaz. Toplam birleşik katalog: 178 kişi profili, 13 olay; bu her ülkede yeterli içerik demek değildir. Kullanıcı listesi 823 / eşleşmiş 146 / bekleyen 668 / belirsiz atlanan 9.

Batı Sahra mevcut tarihî siyasi katalogda yok; modern Natural Earth referansında olması geçmiş yıllarda geometri desteği sağlamaz. Başka ülkeye doldurulmadı. [Kaynak ve test raporu](reports/people-notes-2026-10-19.md).


## 19 Ekim 2026 — İndirilen referansla karşılaştırma

258 Natural Earth ülke/bölge özelliği ve 298 harita birimi sınırlı iç nokta
örneklemesiyle karşılaştırıldı. Merkez kapsanırken kuzeydoğusu boş kalan
Suriye tespit ediliyor; San Marino/Vatikan örneklerinde İtalya kimliğinin
çıkması ayrı egemenlik incelemesi gerektiriyor. Örnek sayısı alan yüzdesi değil.
2024 Hollanda'nın aynı dönem/hash'li 13741 mükerreri kapatıldı; 13771 korundu.
2024 **195/189/6**, bütün katalogda **420 kapalı satır**. Ham veri değişmedi.
[Sayısal sonuçlar, sınırlamalar ve regresyon kanıtı](reports/world-reference-review.md).

## 19 Ekim 2026 — Sistematik dünya / tarih denetimi

2024'te 195 kaynak satırının 190'ı çizilebilir; bu sayı bağımsız ülke sayısı
değildir. Suriye'nin kuzey/doğu kaynak boşluğu, Angola/Cabinda eksikliği,
Tayvan/ABD/Avustralya/Ukrayna bileşen sayısı değişimleri, Hollanda'nın aynı
geometriyi iki kez çizmesi ve Rusya kayıtlarındaki semantik örtüşmeler
inceleme listesinde. Bileşen sayısı düşüşü tek başına hata/egemenlik kanıtı değil.
Suriye ve dört ülkenin yanlış QID'leri sabit 2024 satırlarında düzeltildi;
Suriye kısmi alan olarak işaretlendi, koordinatlar değiştirilmedi.

Bizans 1440–1467 kaydının tamamının tarih incelemesinde olması 1452'de de
boşluk yaratıyor. 1453 yıl seçimi fetih öncesi/sonrası ayrımı yapmaz. Kayıt
aralığını kırpmak veya modern sınırla doldurmak kaynak doğrulaması değildir.
4.026 yıl sayımı, ham kaynak ve 374 paket kontrolü hazır; bağımsız ülke
referansı henüz indirilemedi. [Sayısal bulgular ve doğrulama sınırları](reports/world-data-audit.md).

## 18 Ekim 2026 — Çad, Angola, Mali ve Tunus incelemesi

Çad'ın yalnız önceki dönemi incelendiği için 2024 snapshot'ı eksikti; Tunus'un
4 satırı izole dış/iç halka teması nedeniyle kapalıydı. Kaynak koordinatları
korunarak dar kapsamlı teğet doğrulamasından geçirildi. Angola'nın eski rejim
başlığı kısa ülke etiketiyle ayrıldı; Mali'nin 1961 sonrası yanlış federasyon
adı/QID'si Q912 ülke kimliğiyle düzeltildi, 1960 federasyonu değiştirilmedi.
Özgün adlar/kimlikler kaynak notlarında kalır. **Angola 2024 kısmi anakara:**
Cabinda eksik; 2023'ten geometri taşınmadı. Yaklaşık/düşük güven sınıfları aynı.
2024'te kalan 5 kapalı satır ve 6 tarihsiz ham kayıt gizlice tamamlanmadı.
[Kanıt, kapsam tablosu ve testler](reports/timeline-countries.md).


## 18 Ekim 2026 — keşif verisi ve renderer bağlantı denetimi

[Kaynak başına tarih/konum kararları](reports/turkey-discovery.md).
Buda için çelişkili kronolojiden tek yıl aralığı çıkarılmadı. İsa/Paul/CaiLun/
Konfüçyüs/Gutenberg/Kolomb alternatifleri notta/TemporalExtent'te saklı.
Newton1643Gregoryen yıl/1642Jülyen ayrımı korunur. Beş yaklaşık kişi ilişkisi
bütün yaşama yayılmaz. Konfüçyüs'ün Lu ölçekli ölüm yeri şehir noktasına
çevrilmedi. Kaynaklı olsa da modern temsil noktası ölçülmüş tarihî nokta sayılmaz.

Üç yeni konumsuz savaş/muharebe listede; DünyaSavaşları tek ülke/şehir noktası
değil. Çanakkale yalnız kara harekâtı dönemidir. Her P625 noktasının kaynak
referans zayıflıkları ve tolerans yokluğu açık kalır. Altı modern şehir için
kuruluş/nüfus/yıllık ad tahmini yapılmaz. Geçmişte aynı isimle varlık iddiası yok.

Libya/Çad incelenmiş supplementinin renderer.inline izni eksikti: artık trusted
repository.hasWorldGeometry kullanır; eski .atlas dosyası uydurulmaz. Gerçek
2010geometrili regresyon pozitif ve varsayılan CHUNK_GEOMETRY ret negatif testli.
Modern şehirler tarihî feature/kapsam sayılarını artırmaz. Kültür geometri0,
ülke boşlukları ve eski yayınNO-GO gerekçeleri hâlâ açıktır.


## 18 Ekim 2026 — Libya/Çad ve kısa adlar

İnceleme1.1.0: Çad13239(1961–2023), Libya13370(1976–2005)/13580(2006–2013)
CC BY4.0 kaynağına bağlı ek çıkarımdan görünür. Bütün kenar/delikler korunur;
Çad'ın tek dış/iç halka köşe teğeti dar seçenekle doğrulanır. Genel geometri
kapısı aynı. Libya eski rejim adı/tarihQID'si kaynakta saklı; sunum genel ülke
alanı/Q1016 olarak incelendi. Yaklaşık/düşük güven; tüm dönemde aynı resmî
ad/fiilî kontrol iddiası yok. Kısa adlar kaynak ID/tarih/uzun adları silmez.

2000:192kaynak/180çizilebilir/12askı;2010:191/180/11. Her iki yılda Libya ve
Çad feature çıktısında var. Küresel etkin12951çizilebilir/428askı; ham manifest
ve374asset aynı.2024Çad ayrıca askıda;2025/26sınır uzatma yok.
[Kaynaklar, kenar/hash kanıtı ve sınırlar](reports/compact-country-map.md).
Aşağıdaki değerler önceki inceleme sürümlerinin kayıtlarıdır.

## 17 Ekim 2026 — MS2010 mekânsal inceleme v1.0.0

Siyasi mat dolgular açık; aşağıdaki eski “dolgu kapalı” notu geçmiş sürümdür.
Fransa13247kaynağındaki19bileşenin yalnız anakara/Korsika olan5/6'sı özgün
koordinatlarıyla **partial-area** olarak tutuldu. Dönem1961–2023aynı; Cezayir,
eski işgal/diğer denizaşırı alanların aynı dönemde tek kapsam yapılması
önlendi. Çıkarılan bütün parçaların her yılda yanlış olduğu iddia edilmez;
tam Fransa coğrafyası değildir. Hollanda13116/13120aynıQ55/dönem/geometri
kopyalarından13120çizilir;13116metadata/kaynak olarak gerekçeli kalır.

2010:191kaynak siyasi satırı/178çizilebilir/13askıda.286KuzeyAfrika örnek
noktasında37hamörtüşme→0; dünya topolojisi veya görsel/piksel uyum kanıtı
değildir. Libya13580ad/dönem, Çad13239/Tunus13374halka kesişimi ve diğer
gerekçeli boşluklar sürer. Veri yokluğu tarihsel yokluk değildir. Farklı kaynak
ölçeklerinden kıyı uyuşmazlığı modern sınırla kapatılmadı.

Ham manifest13379/12949çizilebilir/430askıda olarak değişmez; inceleme sonrası
etkin12948/431.2000:192/178/14;2024:195/186/9.4026seçilebilir yıldan4024'ünde
en az bir siyasi alan olması bütün dünya kapsamı değildir.2025/26desteksizdir.
Kaynak QID'lerinin13375'i ayrıca korunur; upstream kimlik adayı ≠ bağımsız
tarihî doğrulama. Wikipedia URL'si ancak mevcut Wikidata sitelinkinden gelir.

[Doğrudan kaynaklar, hash'ler ve sınırlar](reports/application-review-2010.md),
[2010 teşhis çıktısı](reports/application-review-2010/map-scene-2010.json).
Aşağıdaki ham sayımlar ve eski pilot-only kapsamlar tarihî kayıttır.

## 17 Ekim 2026 — MS2000 ülke denetimi

Saydam siyasi dolgu kapalı; kültür/olay katmanları bağımsız kalır. Yunanistan'ın
21parçalı kaynak geometrisi iki izole teğet iç-halka çifti yüzünden yanlış
reddediliyordu; geometriyi yeniden çizmeden doğrulayıcı düzeltildi. Kesişme,
ortak kenar, iç içe halka ve temas ağı hâlâ reddedilir. Yeni bağımlılık yok.

MS2000'in192POLITY satırı envanterlendi:179çizilebilir/13incelemede. Bu,
179bağımsız ülke veya179uzman doğrulaması değildir. Ürdün Krallığı korunur;
Bahreyn, Esvatini, Sırbistan-Karadağ, Somali, Angola ve Libya ad/dönem sorunları
birincil kaynaklarla kaydedildi.12çelişkili satırın6'sı2000'e denk gelir;
bütün ilgili satır askıdadır, doğru olabilecek alt yıllar uydurularak bölünmez.
Kaynak adları/tarihleri arama ve inceleme kartında korunur; bu ülkelerin
seçili yılda yokluğu iddia edilmez.

Dünya revizyon2:13379metaveri,12933yeni çizilebilir kaynak satırı+16eski pilot,
430incelemede. Teğet-halka düzeltmesi91satırı geri kazandırdı. MS2024:195/186/9;
2025/26'ya sınır uzatılmaz. Kaynak koordinatları, özgün ZIP ve fiziksel katmanlar
korunur. QID/Wikipedia adayları hâlâ doğrudan bağlantı kaynağı sayılmaz.

Denetimde eski NARA kesitinin kapsama indeksinin ilk sıradaki başka kaynak
kimliğini kullanabildiği de bulundu; indeks artık kaydın kendi evidence kaynağı
ve revizyonundan üretilir, regresyon testi eklendi. Asıl kayıt/provenance,
geometri ve kimlik değişmedi. Politika1.3.1 için türetilmiş pilot manifesti
yenilendi; eski pilot ve chunk denetimleri tekrar çalıştırıldı.

[Ayrıntılı bulgular ve veri seçimi](country-data-research.md),
[192satır envanteri](reports/country-data-audit/ms2000.json),
[doğrulama raporu](reports/country-data-audit.md).
Aşağıdaki16satırla sınırlı önceki kapsam açıklamaları tarihîdir.

## Güncel — gerçek dosya incelemesi ve sınırlı aktarım

CliopatriaZIP:13797kayıt,1637farklı ad,13412POLITY/385RELATION. Bütün kayıtlar
onaylanmadı. Yanlış/tartışmalı adaylar: MÖ500RomanKingdom; Byzantium1440–1467;
RepublicofChina satırı13111Q148 ve Japan13355Q188712. Bu örnekler dışarıda;
kalan kayıtlar da otomatik doğru sayılmıyor. Seçilen16satırın tüm QID/Wikipedia
adayları raw'da korunup normalize kimliklerden çıkarıldı.

Osmanlı satırı7267temas eden MultiPolygon bileşenleri nedeniyle4Polygon'a;
İspanya13377sekizbbox indeks sınırı nedeniyle14Polygon'a ayrıldı. Hiçbir
ada/koordinat silinmedi, çizilmedi veya sadeleştirilmedi; yalnız halka yönü
değişti. Topoloji/1024pozisyon/512halka/karşılaştırma sınırları gevşetilmedi.
Bileşenler ayrı coğrafi scope taşır; bağımsız tarihî yorumlar gizlenmez.
Liste aynı özgün satırın parçalarını tek temsilciyle gösterir; haritada hepsi seçilir.

Kaynak FromYear/ToYear dahil aralıkları uncertain/range/derived/düşük güvenle
korunur; source-fidelity reviewStatusverified bağımsız egemenlik doğrulaması
anlamına gelmez. Kullanıcı kapsamı **documented approximate** görür.
67kayıt/8kaynak;33yaklaşık sınır kaydı, kültür0.150destekli/3876desteksiz yıl.
[Sayısal audit](reports/atlas-data-integration/coverage.json).

Natural Earth akarsu1452indeksi boş MultiLineString (Loire); uydurma çizgiyle
doldurulmadan atlandı. Diğer1454akarsu,1355göl ve11kara feature'ı korundu.
Kaynak isimleri tamamen atılır. Güncel göl/baraj/nehir/kıyı geçmişin birebir
haritası olarak sunulmaz. [Lisans/karma/fiziksel çıktı kaydı](../assets/licenses/physical-detail-provenance.json).

**V3 güncel durum:** [Kalite notu](#v3-kalite-notu--16-ekim-2026) ve
[son kapsam sayımı](ui-map-audit/evidence/final/coverage.json). Yeni tarihî veri
eklenmedi; yer aramasının açılması konum askısını kaldırmaz.

**2026-10-16 üretim düzeltmesi:** katalog0.4.1-pilot, ETL1.6.0.
İncelemedeki Van Gogh ev/ikamet geometrileri genel üretim ETL'sinde null ve
WITHHELD açıklaması taşır; kaynaklı ham çıkarımlar değiştirilmez. Kaynak
bağlantısı/revizyon bağı güçlendi; kesintili zaman ve üst kaynak closure'ı
chunk üretiminde korunur. Kaynaklı coğrafya hâlâ yalnız1066/1867; yeni kültür
veya tam siyasi polygon eklenmedi. Yaklaşık kişi noktası exactOnly'den geçmez.
Aşağıdaki eski sürüm kayıtları değişiklik geçmişidir.


**Faz16 güncel düzeltme:** katalog0.4.0-pilot/19kayıt/7kaynak değişmedi;
person-location ve ilişkili yer coğrafyası publication review1.0.0 ile askıda.
Geriye kalan aktif coğrafya1sınır kesiti ve1yaklaşık olay noktasıdır. Özgün
çıkarımdaki yer tarihi bilinmiyor değil, bağımsız olarak desteklenmiyordur.
[İddia/çağ incelemesi](historical-accuracy-audit.md), [kapsam](reports/phase-16-coverage.json).
Aşağıdaki eski faz teslimleri tarihî kayıttır; konum yayın onayı değildir.

Faz 09: gerçek kültürel alan eklenmedi; kültür/siyasi tam alan sayısı 0.
NARA raw/katalog/LOD geometri/NOTICE aynı byte/hash'tedir. ETL doğrulama kuralları
**1.3.0** olduğundan üretim manifesti ve generated modülün ETL metadata'sı yeniden
üretildi; katalog **0.2.0-pilot**, policy **1.1.0**. Bilinen bağlı varlık dönemiyle
çelişen siyasi/kültürel coğrafya artık reddedilir. [Rehber](cultural-layer.md),
[kaynak incelemesi](reports/phase-09-source-review.md).

Faz 08 — 2026-10-16: gerçek katalog/geometri değişmedi, tam siyasi polygon 0.
Siyasi seçim/kart/stil kodu mevcut 1867 kesiti üzerinde çalışır; yeni alan
verisiyle kabul BLOCKED. [Kaynak erişimi/inceleme](reports/phase-08-source-review.md),
[siyasi sunum ve kaynak kuralları](political-layer.md). Sentetik alanlar yalnız testtedir.

2026-10-15 · Faz 05 pilotu / Faz 06 zaman motoru · **1 kaynaklı sınır kesiti; 0 tam devlet poligonu; 0 kültür alanı**.
Katalog toplamı 6 teknik/alan kaydıdır: 3 taraf kimliği, 1 sınır, 1 devir ilişkisi,
1 kapsam kaydı. Bu sayılar altı ayrı coğrafi sınır veya altı doğrulanmış dönem değildir.
Pilot çizgisi/kaynak kartı ve yıl filtresi gidiş/dönüşü USER-REPORTED PASS;
otomatik tarayıcı kapısı açık, Android UNVERIFIED ON DEVICE.

## Yayına uygun dar veri seçimi

Kaynak: NARA, RG 11, 1867 Alaska devir antlaşması, md. I/IV ve onay bildirimi.
[Resmî transkript](https://www.archives.gov/milestone-documents/check-for-the-purchase-of-alaska).
Belge 141° batı meridyenini kuzeye uzanan sınır tanımında kullanır; onay
belgelerinin değişimi 20 Haziran 1867 olarak verilir. Md. IV hukuki devri bu
değişime bağlar. Bu, daha sonraki fiilî teslim veya arazide denetim tarihiyle aynı
iddia değildir.

Pilot **yalnız 1867-06-20 tarihli belge/sınır tanımı snapshot'ı**dır. Yıl filtresinde
1867 penceresiyle kesişir; bu geometri bütün 1867 yılı veya 1868–2026 boyunca
geçerlidir denmez. Başlangıç/bitiş aynı bilinen gündür. Başka yıllarda kaynaklı
kayıt gösterilmez. Bu dar aralık gerçek sınırın yalnız bir gün var olduğu iddiası
değil, kataloğun doğruladığı belge anının sınırıdır.

Geometri hazır GIS kopyası değildir. Kaynak tanımından **141°B ideal meridyeni**
üzerinde, projece seçilen **65–68°K görüntüleme penceresi** türetilir. Kesit uçları
tarihî sınır uçları değildir. İleri LOD 0.5° aralıkla 7, genel LOD 2 konumdur;
ikisi aynı ideal meridyen kesitini gösterir. Gerçek arazi ölçümü, WGS84 datumuna
uyarlanmış antlaşma hattı veya tüm Alaska/ABD alanı üretilmez.

Hak kapsamı: yapılandırılmış antlaşma olguları ve projeye ait idealize çizgi
türetimi, **CC0 1.0**. [NARA federal eser kullanım beyanı](https://www.archives.gov/global-pages/privacy.html#copyright)
her arşiv eserine genel izin vermez; bu çalışmada fotoğraf, tarama, mühür veya
üçüncü taraf GIS alınmadı. Dar karar kaynak ID/revizyon/çıkarım SHA'sına bağlıdır;
NARA'dan gelecekte gelecek başka veri otomatik onaylanmaz. [Tam paket bildirimi](../assets/licenses/NARA-pilot-NOTICE.txt).

## Gerçek kaynak farklılıkları ve çözümler

| Bulgu | Tehlike | Uygulanan karar |
| --- | --- | --- |
| NARA sayfa başlığı ödeme çeki nedeniyle **1868**, içindeki antlaşma **1867** | Başlığı geometri tarihi sanmak | Antlaşmanın 1867-06-20 onay değişimi esas alındı; kaynak başlığı raw olgu kaydında aynen tutuldu |
| Belge 1825 sınır hükmünü 1867 antlaşması içinde aktarıyor | Kaynak baskısı, eski hüküm ve geçerliliği birleştirmek | Aktarılan md. I bağlamı locator'da; geometri 1825'e veya bütün sonraki yıllara yayılmadı |
| Antlaşma 141° meridyeni söyler, modern WGS84 ölçüm doğruluğu vermez | Kesin/ölçülmüş çizgi sanmak | boundary=approximate, precision=treaty-idealized, confidence=medium, toleranceKm=null; kesikli çizgi ve açıklama |
| 65/68°K kesim değerleri kaynakta sınır uçları olarak yazmıyor | Proje görüntüleme penceresini tarihî uç sanmak | Raw derivation, scopeId, extentType=boundary-segment ve kartta açık kesit açıklaması |
| Antlaşma taraflarının toprak devri tanımı bütün fiilî denetim ve Yerli haklarını anlatmıyor | Tekil/münhasır siyasi egemenlik çıkarmak | politicalStatus=treaty-delimitation; ayrı cession ilişkisi; alan doldurulmaz, Yerli hakları hakkında çıkarım yapılmaz |
| Terminal veri ağı DNS `EAI_AGAIN`; tam NARA HTTP payload'ı arşivlenmedi | Editöryal dosyanın hash'ini upstream HTTP hash'i sanmak | Raw temsil türü editorial-fact-extraction-not-http-response; SHA yalnız bu çıkarım dosyasını doğrular. Kaynak URL/madde/belge ve erişim zamanı saklı |
| OHM San Marino relation 2692735, incelenen web görünümünde v16, 1463-06-27–1699 | Eski örneklerdeki “1463–present” adını güncel kapsam sanmak | Gerçek metadata ile eski issue örneği ayrıldı; üretime alınmadı |
| Aynı San Marino kaydında `fixme:s = needs source for boundary lines`; 13 üye tam indirilemedi | CC0 varsayımıyla doğrulanmamış polygon dağıtmak | Kaynak/geometri/üye hakları BLOCKED; tek vertex bile ürün geometrisine kopyalanmadı |
| OHM `end_date` artık doğru olmayan ilk gündür; domain sonu dahildir | Bitişi bir gün/yıl yanlış uzatmak | Audit exclusive-source-date-not-normalized olarak tutar; otomatik üretim normalizasyonu yok |
| OHM ISO yıl 0000 = MÖ 1, -0001 = MÖ 2 | Domain tarihî yıl sisteminde ±1 kayma | Astronomik → tarihî yıl dönüşümü, ham metin ve belirsizlik/EDTF korunur; unit testli |
| Natural Earth 1:110 milyon güncel genelleştirilmiş kara | Kaba kıyıyı tarihî kıyı veya ülke sınırı sanmak | Fiziksel referans ayrı kaynak; isim/siyasi sınır yok; geçmiş kıyı rekonstrüksiyonu iddiası yok |

OHM kanıtları: [incelenen San Marino kaydı](https://www.openhistoricalmap.org/relation/2692735),
[başlangıç tarihi](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Tags/Key/start_date),
[bitiş tarihi](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Tags/Key/end_date),
[nesne lisansı](https://www.openhistoricalmap.org/copyright).
Web görünümü/crawl zamanıyla canlı API revizyonu aynı kabul edilmez; API verisi
alınamadığı için bu metadata bir üretim SourceRecord'u yapılmadı.

## OHM alımı ve karantina

```sh
npm run ohm:collect -- --relation 2692735
```

Bu ortamda komut **EAI_AGAIN** ile başarısız oldu; OHM coğrafi verisi eklenmedi.
Araç resmî Overpass endpointine tek relation + tüm alt üyeler için `out meta`
isteği hazırlar. Concurrency 1, en çok 3 deneme, 10 sn timeout, sınırlı backoff,
429/503 Retry-After'a uyma, 4 MiB yanıt ve 2000 element sınırı vardır. Uzun
Retry-After'da erken yeniden deneme yapmaz, işi erteler. Redirect reddedilir.
[Resmî yöntem](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Overpass).

Başarılı yanıt ham byte'larla Git dışındaki data/raw'a alınır; SHA/revizyonlu
cache manifesti ve ayrı audit oluşturulur. Tüm etiketler (source/attribution/
license/EDTF dahil), nesne sürümleri ve üyeler korunur. Eksik üye raporlanır.
Cache hash'i bozuksa geçilmez. Audit her durumda productionApproved=false
döndürür; relation'ın lisansı alt üyeyi yeniden lisanslamaz. Etiketsiz öğede
OHM varsayılan CC0 beyanı not edilir, fakat üst kaynak/istisna denetimi atlanmaz.

Zaman etiketi eksikliği `unknown`dur; bütün yıllara veya sonsuz geleceğe
çevrilmez. Yaklaşık/EDTF bilgi sessizce kesin güne indirgenmez. Topoloji kurup
GeoJSON'a dönüştürme ve hak onayı otomatik değildir; eksiksiz üye/kaynak denetimi
sonrası ayrı incelenmiş dönüşüm gerekir. Sırf haritada görünüyor diye kayıt alınmaz.

## Paket, LOD ve kalite kapıları

[Manifest](../data/pilot/production/manifest.json): schema=2, catalog=0.2.0-pilot,
ETL=1.2.0, policy=1.1.0; kaynak revizyonu/raw SHA, tarih/bbox/precision/confidence,
GeoJSON/catalog/NOTICE byte/SHA ve LOD eşikleri. `pilot:check` ham girdiden tekrar
türetir ve generated TS dahil bütün paketle karşılaştırır. Değişen raw SHA dar
hak onayını geçersiz kılar; hazır geometri bu kapının etrafından alınamaz.

| Artefakt | Açılmış byte | İçerik |
| --- | ---: | --- |
| Raw editöryal olgu çıkarımı | 2119 | Resmî belge locator'ı + açık türetim/izin/sınırlama |
| catalog.json | 14034 | 6 kayıt, tam kaynak ve dönüşüm zinciri |
| boundaries-fine.geojson | 287 | 1 LineString, 7 konum, zoom ≥2.5 |
| boundaries-coarse.geojson | 231 | 1 LineString, 2 konum, zoom <2.5 |
| NOTICE.txt | 1270 | Kaynak/hak/türetim açıklaması |

Bu byte'lar gzip/aktarım/APK ölçümü değildir. Paket küçük olduğundan vector tile,
uzak sunucu, font/glyph/terrain kaynağı eklenmedi. Üretim tabanı Natural Earth
v5.1.2 127 kara feature/5143 koordinat; modern etiket içermez. Göl/akarsu gibi
yeni içsu ayrıntısı alınmadı; bu faz daha ayrıntılı taban vaat etmez.

Konumlar CRS84 [boylam,enlem]. Domain v2 GeoJSON, bounded topoloji, hak ve temporal
denetiminden geçer. LineString siyasi alan olarak doldurulmaz. Düz çizgi için
iki LOD aynı ideal meridyeni korur; karmaşık polygon otomatik sadeleştirilmez.
Kesin/belgeli çizgi, kesikli yaklaşık sınır ve düşük opaklıklı/noktalı kültür
alanı stil hazırlığı ayrıdır. **Kültür alanı verisi yoktur**; stile bakarak veri
varlığı veya siyasi egemenlik çıkarılamaz.

## Eksikler ve kabul

Farklı çağ/coğrafyalardan tam devlet ve kültür geometrileri bu fazda
doğrulanamadı; sayıyı doldurmak için polygon çizilmedi. Historical Basemaps
**BLOCKED FOR REDISTRIBUTION** sürer; GPL depo metni yalnız araştırma referansı
olarak okundu, veri/tile/türev geometri pakete alınmadı.

Yeni gerçek pilotun web/GPU görünümü ve kaynak paneli için Playwright senaryosu
vardır; ortam engeli nedeniyle bağımsız otomatik doğrulama **BLOCKED**. Kullanıcı
çizgiye dokunarak kaynak kartını okuduğunu, başka yılda kaybolup kaynak tarihine
dönünce geri geldiğini bildirdi: **USER-REPORTED PASS**. Platform önceki web denemesi
bağlamından alınmıştır; cihaz bilgisi verilmedi. Ortak renderer
enjekte test double'larıyla sınandı; gerçek cihaz veya GPU başarısı değildir.
Web'de “1867 sınır örneğini göster” ile tek kesit, kesikli çizgi, 20.6.1867 bilgisi,
devlet katmanı kapatılınca gizlenme ve 1868'e geçince boş kaynak kontrol edilmeli.
Android **UNVERIFIED ON DEVICE**. [Faz raporu](reports/phase-05.md).

## Faz 06 zaman kapsamı

Pilot 0.2.0-pilot, mevcut snapshot beyanını TemporalExtent.support alanında
açık taşır. Ham kaynak/geometri/atıf/lisans değişmedi; yeni tarihî kayıt yok.
Yalnız 1867 belgelenmiş yaklaşık modunda, komşu yıllar destek yok modundadır.
Açıkça seçilen önizleme seçili yılı değiştirmez; kaynak yılı sürekli etiketlenir.
[Makine okunur kapsam](reports/phase-06-coverage.json), [zaman sözleşmesi](timeline.md).
Faz 05 raporundaki eski sürüm/hash/boyut o fazın tarihî kanıtıdır.

## Faz 10 — kişi pilotu kalite kaydı

| Konu | İncelenen durum / alınan önlem |
| --- | --- |
| Kaynak düzeyi | Q5582 tarih niteleyicili P551; bağlı müze kaynağı bağımsız alınamadı. Medium confidence, documented approximate; varsayılan kesin marker yok |
| Çapraz kayıt | P937 aynı yer/ay aralığını tekrarlar; bağımsız ikinci kaynak veya ek bulunma kaydı sayılmadı |
| Gün belirsizliği | Ağustos 1879 / Ekim 1880, gün null. Başlangıç/bitiş günleri ve bütün yıl boyunca fiziksel bulunma uydurulmadı |
| Koordinat | Q3280282 mevcut müze yapı noktası; şehir/krallık centroidi kullanılmadı. DMS → derece deterministik; GPS/ölçüm hata payı bilinmiyor |
| Yaşam / yer | Doğum/ölüm ayrı; yalnız yaşıyor olmak veya genel P19/P20/P551/P937 niteliği yıllık konum oluşturmaz |
| Ham temsil | Tarayıcıyla incelenmiş olgular açık etiketli editöryal çıkarım; terminal JSON DNS ile engelli. Özgün HTTP yanıtı olduğu iddia edilmez |
| Sitelink / görsel | Özgün sitelink JSON'u ve dosya hak hattı yok; URL/görsel üretilmedi. Maddesi/görseli yoktur iddiası yapılmaz |
| Kapsam | 1 kişi, 1 ilişki, 1879-08–1880-10; global, yıllık veya bütün Van Gogh hareketleri kataloğu değil |

Yeni pilotla katalog 11 kayıt / 3 SourceRecord oldu. Önceki NARA geometri ve ham
hash değişmedi. Yeni noktaya `person-locations.geojson`, hash/byte/kapsama indeksi
eklenir. Kaynak çelişkisi veya daha iyi birincil belge edinildiğinde revizyonlu
yeniden inceleme gerekir; mevcut medium kayıt kesinleştirilmez.
[Denetim/ETL adımları](persons.md), [Faz 10 kanıtları](reports/phase-10.md).

## Faz 11 — olay kalite güncellemesi

Dört gerçek olay kaydı eklendi; yalnız Hastings kaynaklı yaklaşık referans
noktası taşır. [Kaynak revizyonları ve kayıt bazında tablo](events.md).

- Peloponnesos başlangıç/bitişinin kaynak gösterim yılları kullanıldı; antik
  gün/takvim doğrulanmadığı için MÖ 431/MÖ 404 dışında gün uydurulmadı. Doğrudan
  referans eksikliği medium güven gerekçesinde ve locator'da saklı; bağımsız
  kaynak doğrulaması tamamlandı denmez. Geniş savaş tek noktaya indirgenmedi.
- Hastings kaynak gün metni korunur, normalize tarih yalnız 1066; Julian/proleptik
  gün dönüşümü kesinmiş gibi gösterilmez. DMS P625 noktası muharebe polygonu veya
  mevzi konumu değildir; toleranceKm null, konum yaklaşık.
- Vestfalya 1648 kaba yıl ile 24 Ekim1648 Gregorian değerleri uyumlu; çok yerli
  barış kaydı için tek imza koordinatı atanmadı.
- Yeniden birleşme süreç aralığı 1989–1990 ve aynı revizyondaki1991 tarih iddiası
  ayrı tutuldu; anlam/çelişki bağımsız çözümlenmedi, uncertain=true. Alternatif
  tarih ana aralığa eklenmez; yalnız kartta kaynak iddiası olarak görünür.
- Katılımcılar, Wikipedia JSON'u, tam savaş alanları, olay görselleri ayrıca
  incelenmediği için boş bırakıldı. Boşluk tarihî yokluk anlamına gelmez.

Ham `wikidata-event-facts.json` açık editöryal çıkarımdır; özgün HTTP yanıtı
değildir. Katalog 19 / 7 kaynak, olay 4/geometri 1; `events.geojson` ve ayrı eventCoverageIndex
null bbox dahil üretilir. NARA ve kişi ham/geometri hashleri korunur. Sentetik
bölge/yoğunluk/örtüşme kayıtları yalnız testte; üretime import edilmez.

## Faz 12 — kimlik bağlantısı kalite sınırları

Sitelink incelemesi iki QID ile sınırlı. Resmî sayfadaki mevcut site/title/hedef
URL incelendi; sayfa revizyonu ve inceleme zamanı kaydedildi. Canlı en son
revizyon veya gelecekte değişmeyeceği garantisi yoktur. İncelenmemiş QID'de
"Wikipedia yok" denmez. Bir maddenin kimlik eşleşmesi tarih/konum iddiasını
kanıtlamaz. Terminal API DNS engelli; açık etiketli olgu çıkarımı kullanıldı.
A-03 siyasi ilişki kapsamı düzeltildi: dolu territoryIds yalnız o bölgelerde
geçerli; genel entity ilişkisi territoryIds boşken kullanılabilir. Bölgesel
kaynak başka bölge kartına geçmez; karşı örnek/regresyon raporda. Yeni sınır,
konum, olay tarihi, makale metni veya görsel eklenmedi. [Ayrıntı](sources.md).

## Faz 13 — arama ve odak doğruluğu

Arama kaydı ile gösterilebilir source-year geometri ayrıdır. Snapshot yalnız
belgeli yılda, aralık yalnız belgeli support'ta çözülür; bilinmeyen tarih aramada
kart olarak kalabilir ama ilgili yıl uydurulmaz. Kişi yaşamından konum türetme
ve konumsuz antlaşmayı şehir merkezine yerleştirme regresyonları eklendi.
MÖ/MS aday uzaklığı yıl0 içermeyen astronomik dönüşümle hesaplanır. Polygon
bbox/merkez sadece kamera sunumudur; orijinal geometri ve belirsizlik değişmedi.
Kayıp bookmark entityId başka aynı adlı varlığa bağlanmaz. Yeni gerçek veri yok.
[Kaynaklı akış ve sınırlar](discovery.md).

## Faz 14 — filtreler ve tarihî etiketler

Üretim katalog0.4.0-pilot /19 kayıt /7 kaynak, link kataloğu1.0.0 değişmedi.
Kayıt güveni filtresi claim düzeyidir; kaynak kurumunu topluca derecelendirmez.
Kesin destek seçimi yaklaşık kaydı yükseltmez; gizler. Olay türü kişi/siyasi
kayıtlarını filtrelemez; konumsuz olay nokta uydurulmadan listede kalır.
Yer/isim etiketi temporal+geometry kanıtına tabidir; Maison Van Gogh modern yapı
noktası ve bilinmeyen tarihli yer adı bu katmanda hiçbir yıla taşınmaz. Gerçek
yıllık destekli place0; tam siyasi polygon/kültür alanı0. Sentetik katman/
40 kültür/çoklu snapshot testleri uygulama verisine dahil edilmez.
[Kalite ve platform kanıtı](reports/phase-14.md).

## Faz15 — parçalama yeni tarihî kanıt değildir

Katalog0.4.0-pilot /19 kayıt /7 kaynak, aynı orijinal SHA ve link1.0.0 korunur.
Üç harita kökü için6 LOD girdi /4 hash dosyası kaynak bağımlılıklarıyla çıkarıldı.
Source/input/transform, temporal precision/uncertain/support, confidence, license
ve attribution korunur; hiçbir kaynak yılı uzatılmadı. Unknown yer adı/parça
snapshot'ı her tarihte geçerli sayılmaz. Aynı kapsamın yeniden paketlenmesi veri
çeşitliliği artışı değildir. No geometry olan3 olay haritada nokta kazanmadı;
tam siyasi polygon/kültür alanı ve yıllık bağımsız yer etiketi0 kalır.

## V3 kalite notu — 16 Ekim 2026

Bu görevde tarihî katalog genişletilmedi. Katalog0.4.1-pilot:19kayıt/7kaynak;
4026seçilebilir yılın2'sinde yaklaşık coğrafya (1066/1867),4024yılda destekli
geometri yok. Tam siyasi polygon0, kültürel geometri0, bağımsız yıllık yer
etiketi0; konumsuz olay3. [Yeniden çalışan sayım](ui-map-audit/evidence/final/coverage.json).

Aramaya altıncı grup olarak yer eklendi. Maison kaydı bulunabilir ama askıdaki
konumu null olduğundan yıllık hit, harita odağı veya marker üretmez. Kişinin
yaşam dönemi konum kanıtı değildir. Ham editöryal çıkarımlar yeniden HTTP/API
yanıtı diye etiketlenmedi; üretimden askıya alınan koordinatlar geri açılmadı.
1453kabul senaryosu verisizliği doğrular, İstanbul poligonu uydurmaz.

110m basemap ayrıntısı viewport probleminden bağımsızdır. 50m indirme engelli;
nehir/göl/relief ve fiziksel ad kaynağı eklenmedi. Modern fiziksel kıyılar geçmiş
yılların gerçek kıyısı gibi sunulmaz. [V3 sınırlar](ui-map-audit/known-limitations.md).

