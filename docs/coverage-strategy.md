# İçerik kapsamı ve kaynak doğrulama stratejisi

## 21 Ekim — İndirilmiş kaynaklar

Mevcut birleşik uygulama 3.203 kişi / 1.120 olay içerir. Yeni 4.053 kayıtta81 yaklaşık
nokta (46 doğum, 35 muharebe); toplam yıllık doğum noktası 193. Diğer kayıtların
arama/yıl listesinde bulunması aynı yılda harita konumu kanıtı değildir.
Nobel/TIME ve dönem/coğrafya kapsamı eksiksiz değil; sınıf sorguları örtüşür,
QID sıralaması önem sıralaması değildir. Kıyı/siyasi/kültür geometri kapsamı
bu ekle genişlemedi. [Yeni kapsam ve dışlamalar](reports/history-import-2026-10-21.md).

## 20 Ekim 2026 — Kişi/olay genişletmesi

Mevcut birleşik uygulama 234 kişi ve 36 olay içerir. Beş doğum sürümünde
233 profil/147 yıllık doğum noktası/47 biyografik bağ/39 konumsuz kayıt;
Van Gogh eski pilotu ayrıdır. 56 yeni kişi/23 olay eklendi, bütün Nobel/TIME
ve dünya tarihi tamamlanmadı. Tarih seçilebilirliği veri tamlığı değildir.
Geniş kapsam alma ve kademeli indeks önkoşulları
[içerik toplama belgesinde](history-expansion.md); kayıt bazında
[yeni kapsam](reports/broad-history-2026-10-20/coverage.json).
Siyasi dünya/kaynak boşlukları için [dünya denetimi](reports/world-data-audit.md)
ve [referans sonuçları](reports/world-reference-review.md) esas alınır;
bu kişi/olay eki ülke veya kültür geometrisini tamamlamaz.
Aşağıdaki Faz16 ve önceki faz sayımları o fazın tarihli snapshot'ıdır.

**Faz16'nın tarihli sayısal kapsamı:** 4026seçilebilir yıl(MÖ2000–MS2026); yalnız1066
ve1867 coğrafya içerir,4024yılda destekli pilot coğrafyası yok. Yaklaşık kişi
tercihi bunu artırmaz; kişi konumu incelemede. Olay kaydı olan yıl32, yaşam
kaydı olan yıl38, konumsuz olay3; bunlar coğrafya kapsamı değildir. Tam siyasi
polygon0/kültür geometrisi0, bağımsız yer etiketi0. 30° örnekleme72hücrenin2'si
bir pilotu keser/70'i kesmez; alan yüzdesi veya dünya kapsaması değildir.
[Makine raporu](reports/phase-16-coverage.json), [doğruluk](historical-accuracy-audit.md).
Aşağıdaki önceki faz sayıları tarihî kayıttır.

Faz 09: kültür/medeniyet katman kodu ve testleri veri kapsamını genişletmedi.
Gerçek kültür alanı **0**; farklı dönem pilotu hak/kanıt incelemesi **BLOCKED**.
[Kaynak sonucu](reports/phase-09-source-review.md). Sentetik örtüşmeler ve 400
kayıtlı yük yalnız testtedir. Siyasi çizgiyi veya temsilî noktayı kültür alanına
çevirme yok; mevcut gerçek içerik yine tek 1867 antlaşma kesitidir.

Faz 08 — 2026-10-16: siyasi katman kodu veri kapsamını artırmadı. Aynı 1867
antlaşma kesiti/6 kayıt; tam siyasi alan 0, diğer dönemlerde destek yok.
[Polygon edinme/inceleme engeli](reports/phase-08-source-review.md) çözülmeden
tam devlet alanı yayınlanmaz. Tarihli siyasi sınıf/ad/kart desteği bütün dünya
ve bütün yıllar için siyasi coğrafya bulunduğu anlamına gelmez.

Tarih: 2026-10-15 · Faz 00 stratejisi ve Faz 05/06 güncellemesi. İlk öneriler
mevcut veri varlığı değildir. Güncel gerçek içerik 1 sınır kesiti / 6 katalog kaydıdır.

## İlk sürüm için gerçekçi taahhüt

Dünya çapında döndürülebilir küre ve fiziksel yön bulma tabanı; MÖ 2000–2026 tarih seçimi; denetlenmiş birkaç pilot dışında görünür eksik veri bildirimi. “Seçilen yıl” ile “o yılın haritası eksiksiz” farklı kavramlardır. Mevcut kayıtlara dayanarak bölge başına toplam beklenen tarihî varlık sayısı bilinmediğinden dünya kapsaması için yüzde verilmez.

İlk içerik çalışma bütçesi **önerisi**: üç pilot senaryo, toplam en fazla 60 yayımlanabilir kayıt; 10 siyasi geometri, 5 kültürel alan iddiası, 30 olay/savaş, 15 kişi/yaşam yeri kaydı üst sınırı. Bunlar doldurulacak kota veya mevcut kayıt sayısı değildir. Hak veya kanıt yetersizse daha az içerik yayımlanır; özellikle kültür geometrileri ve kişilerin tarihli konumları için sıfır kayıt kabul edilebilir, eksiklik açık kalır. Uygun kaynak bulunmadan çizimle sayı tamamlanmaz.

Önerilen pilot araştırma pencereleri:

| Pilot | Araştırılacak pencere ve bölge | Derinlik hedefi | Bugünkü durum |
| --- | --- | --- | --- |
| P-01 | Eski çağ, Orta Anadolu; MÖ 1600–1200 araştırma filtresi | Hitit dönemi kültürel etkileşim kanıtı ve antik yer kayıtları; kültür/siyaset ayrımı | Aday pencere; kültürel geometri doğrulanmadı |
| P-02 | Orta Çağ, Anadolu–Ege; MS 1200 snapshot'ı | Seçilmiş siyasi varlığın kaynaklı yaklaşık sınırı; rekonstrüksiyonların karşılaştırılması | Aday; kayıt/nesne ve lisans kararı bekliyor |
| P-03 | Yakın dönem, Ankara; 1923 ve çevresindeki seçilmiş olaylar | Gün hassasiyetinde doğrulanmış olay, kaynak ve gerekirse temsilî konum | Bir tarih/yer kaynağı görüldü; katalog/konum/sitelink henüz üretilmedi |

Bu pencereler kültürün veya devletin kuruluş/bitiş tarihleri hakkında beyan değildir. Pilotların yer ve zaman tercihleri onaylanmış tarihî veri yerine geçmez. Derin içerik yayınından önce aşağıdaki doğrulama dosyaları tamamlanacaktır.

## Üç kaynak doğrulama senaryosu

### S-01 — Eski çağ kültürel alanı

Soru: “Seçilen dönemde Orta Anadolu'daki Hitit kültürel etkileşim alanı hakkında hangi kaynaklı mekânsal iddiayı gösterebiliriz?”

Başlangıç kanıtı: British Museum'un [Anatolia and Urartu galerisi](https://www.britishmuseum.org/collection/galleries/anatolia-and-urartu-7000-300-bc) Hitit dönemine ait nesneleri ele alıyor. Bu sayfa kültür sınırı veya lisanslı polygon verisi sağlamaz. Yer/konum/tarih ayrımı için [Pleiades modeli](https://pleiades.stoa.org/help/conceptual-overview) ve CC BY 3.0 bildirimi bulunan [Pleiades veri indirmeleri](https://pleiades.stoa.org/downloads) araştırılabilir.

İşlem: Önce belirli yer/nesne kaydı, kaynak sayfası, dönem hassasiyeti ve hak kapsamı bulunur. Nesnenin üretim yeri, buluntu yeri ve bugünkü sergileme yeri birbirinden ayrılır. Müze fotoğrafı/metni serbest veri varsayılmaz; kopyalanmaz. Bir kültürel alan geometrisi için ayrıca alanın tanımını ve kapsamını destekleyen bilimsel kaynak ve yeniden dağıtım izni gerekir. Yer noktalarının çevresine buffer/convex hull çizip bunu gerçek kültürel sınır diye sunmak yasaktır.

Kabul: Alan varsa etkileşim/örtüşme/çıkarım ve yaklaşık kapsam açık; siyasi egemenlik lejantı kullanılmıyor; kaynak/tarih/lisans izlenebilir. Kaynak yalnız yer noktalarını destekliyorsa alan **BLOCKED — GEOMETRY NOT VERIFIED**, izinli yer kaydı ayrı sunulabilir. Historical Basemaps veya modern Türkiye poligonunu kültür alanı olarak kullanma testi başarısız olmalıdır. Bugünkü sonuç: senaryo tanımlı, gerçek kültür geometrisi doğrulanmadı.

### S-02 — Orta Çağ siyasi sınırı

Soru: “MS 1200 Anadolu–Ege pilotunda seçilecek siyasi varlığın o tarihteki sınırını hangi rekonstrüksiyon destekliyor?”

Başlangıç adayları: [Cliopatria veri açıklaması](https://github.com/Seshat-Global-History-Databank/cliopatria) ve açık [CC BY 4.0 bildirimi](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md); OHM'nin [kaynak/tarih/sınır modelleme kuralları](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Tags). Belirli bir 1200 kaydının varlığı/kalitesi bu fazda doğrulanmadı. [Euratlas lisansı](https://www.euratlas.net/shop/licences/licence_gis_gb.pdf) izinli bir ham vektör kaynağı sağlamadığı için buradan geometri kopyalanmaz veya izlenerek yeniden çizilmez.

İşlem: Önce selected release/kayıt kimliği, FromYear/ToYear semantiği, kaynakça ve geometri lisansı kontrol edilir. OHM kullanılırsa relation ve üye hakları incelenir. Rekonstrüksiyon, mümkünse farklı ve bağımsız kaynak zincirinden ikinci akademik kanıtla karşılaştırılır. Aynı üst kaynaktan türeyen iki veri seti iki bağımsız kanıt sayılmaz. İmparatorluk iddiası, fiilî denetim, vasallık ve kültürel yayılma ayrı tanımlanır; tek renkte birleştirilmez.

Kabul: Zaman doğruluğu yıl hassasiyetini aşmıyor; yaklaşık sınır ve anlaşmazlıklar açıklanmış; geçersiz/eksik üyeli polygon reddediliyor; 1200 snapshot'ı kanıt olmadan 1199/1201'e taşınmıyor. Lisans uyumsuzluğu veya ikinci kanıt bulunamaması durumunda ilgili sınır yayımlanmaz; “inceleme bekliyor” gösterilir. Bugünkü sonuç: senaryo tanımlı, yayınlanabilir sınır **BLOCKED — RECORD REVIEW PENDING**.

### S-03 — Yakın dönem tarihî olay

Soru: “Cumhuriyetin ilanı hangi gün ve hangi olay mekânı sınıfıyla gösterilebilir?”

Doğrulanan başlangıç kanıtı: [TBMM Kurtuluş Savaşı Müzesi sayfası](https://tbmm.gov.tr/Sayfa/KurtulusSavasiMuzesi), 29 Ekim 1923'te Cumhuriyetin ilanının I. TBMM çatısı altında onaylandığını anlatıyor. Bu kanıt günü ve olay mekânının kimliğini destekler; sayfa için serbest metin/görsel yeniden dağıtım izni varsayılmaz.

İşlem: Olay kimliği ve Wikidata sitelinkleri doğrulanır; tarih/gün hassasiyeti ve bağımsız tarih kaynağı kayda bağlanır. Koordinat için ayrıca izinli ve kaynaklı bina konumu gerekir. Ankara şehir merkezi bina koordinatı diye kullanılmaz. Yalnız şehir düzeyi kanıt varsa “Ankara, şehir düzeyinde temsilî konum” açıklamasıyla, doğrulanmış şehir geometrisine dayanarak sunulabilir; şehir koordinatı da bu fazda üretilmedi. Dış kaynak metni/fotoğrafı kopyalanmadan özgün kısa olgusal açıklama yazılır.

Kabul: 29 Ekim 1923 gününe ait olay kaydı desteklenmiş, kesin koordinat uydurulmamış, sitelink eksikse Wikipedia bağlantısı gizlenmiş. Olaydan hareketle ilişkili kişinin o gün orada bulunduğu sonucu otomatik üretilmiyor. Bugünkü sonuç: tarih/olay mekânı için resmi başlangıç kaynağı doğrulandı; koordinat, yayın kaydı ve sitelink incelemesi **PENDING**.

## Eksik veri durumlarının sunumu

| Durum | Önerilen kullanıcı metni | Anlamı |
| --- | --- | --- |
| available | “Bu dönem ve bölgede doğrulanmış kayıtlar” | Görünen kayıtlar denetlendi; bütün varlıklar listelenmiş değil |
| partial | “Bu katmanın verileri kısmi” | Bazı zaman/yer/nesne kanıtı var; boş alanlar tarihî yokluk ifade etmiyor |
| no-verified-data | “Bu yıl ve bölgede doğrulanmış verimiz yok” | Katalogda kabul edilmiş kayıt yok |
| license-blocked | “Bu veri kullanım izni incelemesi nedeniyle sunulamıyor” | Bilinen aday kaynak var; dağıtım onayı yok; bu durum otomatik olarak geometri içermez |
| outside-pilot | “Bu bölge henüz ayrıntılı olarak incelenmedi” | Editöryal kapsam dışı |
| load-error | “Veriler yüklenemedi. Yeniden deneyin” | Ağ/asset/sürüm hatası; tarihî veri yokluğu değil |
| layer-hidden | “Katman kapalı” | Kullanıcının görünürlük seçimi |

“Burada devlet/kültür/insan yoktu” gibi boşluktan tarihî sonuç çıkarılmaz. `available`, tüm dünyanın dolu olduğu anlamına gelen genel bir rozet olmaz. Fiziksel taban üzerinde “Günümüz fiziksel referansı; tarihî kıyılar farklı olabilir” açıklaması gerekir.

## Kapsamın ölçülmesi

Her katalog sürümünde bölge tanımı × katman × kanıtlı zaman aralığı, snapshot sayısı, kayıt sayısı, en erken/en geç kaynaklı tarih, tarih/mekân belirsizliği, hak nedeniyle dışlanan sayısı ve editöryal inceleme durumu raporlanır. Pilot listesinin sınırları da yayınlanır. Sayım, yalnız indeksin varlığından türetilmez; ithalatın ve incelemenin sonucu olmalıdır.

“Kayıtların %100'ü kaynaklı” için payda yayımlanan kayıtlardır; “dünya tarihinin %X'i” için bilinen bir payda yoktur ve böyle bir oran verilmez. 2025/2026 için kanıt yoksa 2024 sınırları otomatik uzatılmaz. Çelişen yorumlar kaynaklarıyla tutulur; kaynak sürümü değişince kapsam/atıf tekrar değerlendirilir.

## Faz 05 gerçek pilot güncellemesi

Yukarıdaki P-01–P-03 araştırma senaryoları doğrulanmış coğrafya olarak tamamlanmadı.
Kaynak/hak sınırları nedeniyle ilk gerçek coğrafi pilot farklı ve daha dar seçildi:
NARA 1867 antlaşmasında tanımlı 141°B meridyeninin proje penceresi 65–68°K kesiti,
yalnız 1867-06-20 snapshot. **1 geometri**, 6 teknik kayıt; 0 kültür, 0 tam devlet
poligonu. Diğer çağ/coğrafyalar henüz doğrulanmadı. Dünya kapsama yüzdesi verilmez.
İdealleştirilmiş çizgi, modern ölçüm veya fiilî/yerli egemenlik alanı değildir.
[Seçim ve kaynaktaki farklılıklar](data-quality.md), [paket kapsam indeksi](../data/pilot/production/manifest.json).

## Faz 06 — seçim ile kanıtlı zamanın ayrılması

Seçim üst sınırı artık sistemin güncel yılıdır; bu otomatik katalog güncellemesi
değildir. Motor exact verified / documented approximate / no supported historical
geography modlarını ayırır. 1867 pilotu yaklaşık, diğer yıllar desteksizdir.
Sadece açık kullanıcı seçimiyle en yakın snapshot önizlenir; seçili yıl ve
kaynak yılı ayrı kalır. Tarih/coğrafya/katman sorguları kısmi kapsamı açık tutar;
boşluk ve kayıt sayısı dünya kapsama yüzdesine çevrilmez.
[Zaman sözleşmesi](timeline.md), [kapsam raporu](reports/phase-06-coverage.json).

## Faz 10 güncel kişi kapsamı

**1 kişi / 1 kaynaklı konum ilişkisi:** Van Gogh — Maison Van Gogh, 1879-08–1880-10.
Bu alan varsayılan kesin konum filtresine girmez; açık yaklaşık tercihle görünür.
1879/1880 yalnız kaynak ayları için destek sağlar; 1881'de kişi hayatta olsa da
nokta görünmez. Arama yaşam/yer filtresinden bağımsızdır. Tarihsiz biyografik bağ
yalnız ayrı listede, düşük/bilinmeyen kanıt harita dışında kalır. Tam siyasi
polygon ve kültür alanı 0; kalan yerküre/çağlar için boşluk dürüstçe korunur.
Seçilebilir tarih aralığı veri kapsamı değildir. [Kişi rehberi](persons.md).

## Faz 11 güncel olay kapsamı

**4 olay / 1 yaklaşık geometri**: MÖ 431–404 WAR,1066 BATTLE,1648 TREATY,
1989–1990 OTHER süreç kaydı. Üç geometrisiz kayıt yalnız yıl listesinde;
alternatif 1991 iddiası kartta, canonical yıl indeksine kendiliğinden katılmaz.
Dünya çapında her yılda olay veya savaş alanı kapsamı yoktur. Haritadaki boşluk
olayın olmadığı anlamına gelmez. Tarihsiz olay hiçbir yıla dağıtılmaz.
Seçilebilir tarih aralığı değişmedi; veri kapsamından bağımsızdır.
Toplam19 kayıt  / 7 kaynak; kişi 1/konum 1, NARA sınır 1, tam polity/culture polygon 0.
[Kaynak/kapsam tablosu](events.md), [Faz 11 raporu](reports/phase-11.md).

## Faz 12 — link kapsamı tarihî kapsam değildir

Sitelink kataloğu1.0.0 iki QID/dört dil bağlantısı taşır: Van Gogh ve Hastings.
Tarihî katalog0.4.0-pilot19 kayıt/7 kaynak olarak kaldı. Üç diğer olay için güvenli
Wikidata fallback vardır; siyasi QID eksikliği açık, gerçek kültür alanı hâlâ0.
Wikipedia bağlantısı eklemek desteklenen coğrafi yılları genişletmez ve kaynak
hassasiyetini yükseltmez. EN/no-language dalları yalnız açık sentetik testte
sınanır; gerçek bağlantı yokluğu gibi pazarlanmaz. [Kaynak rehberi](sources.md).

## Faz 13 — aranabilir kimlik coğrafi kapsam değildir

Gerçek ortak indekste8 canonical sonuç:3 siyasi kimlik,1 kişi,2 savaş/muharebe,
2 olay. Kültür üretim alanı hâlâ0; beşli kültür/çakışma/homonym testleri açık
sentetik fixture kullanır. Tarihî katalog0.4.0-pilot19 kayıt/7 kaynak ve link1.0.0
korundu. Kayıt aramada bulunabilirken o yılda kaynaklı coğrafyası olmayabilir.
Yaşam, tarihsiz biyografik yer, marker kümesi veya kayıtlı kamera coğrafi kanıt
sayılmaz. Arama/yer imi/URL desteklenmeyen snapshot yılını doldurmaz.
[Rehber](discovery.md).

## Faz 14 — filtrelenmiş kapsam kaynak kapsamının yerine geçmez

Katman/filtre coverage sorgusunu daraltır; kesin destek veya yüksek kayıt güveni
seçiminde mevcut yaklaşık pilot tamamen gizlenebilir. Bu sonuç tarihî varlıkların
yokluğu veya kaynağın tümü için güven puanı değildir. Önizleme yalnız filtreye
uyan snapshot'tan ve görünür kaynak yılıyla gelir. Siyasi sınıf her snapshot'ın
kendi yılında değerlendirilir; disjoint kayıt ilk yıl sınıfına sabitlenmez.
Modern bina koordinatı yıllık tarihî yer etiketi üretmez: mevcut place pilotunun
tarihi belirsiz olduğundan bağımsız yer etiketi sayısı0. Yeni kültür/polygon veya
tarih kapsamı eklenmedi. [Filtre anlamları](layers-settings.md).

## Faz15 — cache mevcut kapsamı genişletmez

Chunk manifesti yıl/bbox/LOD/recordId ile keşfedilir; kullanılan sourceYear ayrı
kalır. Cache'den gelmek kaydı daha kesin veya daha güncel yapmaz. Yeni manifest
hash'ine uymayan/izinli olmayan gövde reddedilir; veri hatasında başka yılın alanı
sessiz gösterilmez. Bir parça başarısızsa görünüm atomik reddedilir ve retry
sunulur; başarılı cache parçaları saklanabilir. Başlangıçta destekli yıl yoksa
geometri paketi açılmaz. [Ağ/offline sınırları](performance.md).
