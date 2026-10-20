# Tarihî kişiler ve belgelenmiş konum ilişkileri

## 18 Ekim 2026 — Güncel Osmanlı ve doğum kapsamı

33 ek profille kullanıcı listesindeki 36 Osmanlı padişahının tamamı aramada
bulunur. Bu hükümdarlık, sefer veya sürekli ikamet katmanı değildir. Yeni
22 kaynaklı doğum-yılı noktası, 8 biyografik bağ, 3 noktasız profil vardır.
Toplam 174 profil /109 yaklaşık doğum-yılı noktası; 665 kişi kaynak incelemesinde.

Kanuni 1494/1496 ve önceki dört P569 niteleyicisi (circa/disputed/presumably)
yıllık nokta olarak sunulmaz. Kartlar ve ID'ler korunur; kaynak belirsizliği
açık gösterilir. Biyografik ilişkiye rastgele yıl atayarak haritaya koyma yoktur.
[Kaynaklar ve kararlar](reports/ottoman-people-coverage.md).
Aşağıdaki sayılar önceki inceleme anlarına aittir.

## 18 Ekim 2026 — Genişletilmiş istek listesi

952 ad geçişi 823 ayrı isteğe dönüştürüldü; 111'i yeni/önceki kaynaklı profille
eşleşir. 29 yeni profil, 26 yeni doğum noktası; bütün katalog 141 profil ve 92
yaklaşık doğum noktasıdır. Bu rakamlar eksiksiz biyografi veya aynı yıl konum
kapsamı değildir. 698 kişi kaynak incelemesinde; 5 grup kişi değildir. Kullanıcı
Zenon'u Elealı olarak belirtti; yaklaşık kronolojisi biyografik kalır. Diğer
9 belirsiz ad atlandı. [İstek başına durum ve kaynak](reports/requested-people-coverage.md).

Ölüm bilinmiyorsa yıl uydurulmaz. Belgelendirilmiş tek doğum yılına sınırlı
kişi desteği, kaynaklı BIRTH snapshot'ının gösterilmesini sağlar; diğer yıllar
için hayatta olma veya ikamet çıkarımı yapmaz. Belirsiz doğum aralığı ve genel
biyografik bağlar yıllık nokta değildir. Kullanıcı kategorilerinden hükümdarlık/
başbakanlık dönemi veya meslek iddiası üretilmez.
[Toplama, kaynak onayı ve büyük katalog sınırı](people-expansion.md).

## 18 Ekim 2026 — 113 isimlik doğum incelemesi

`data/people/raw/{requests,browser-review,decisions}.json` istenen adları,
resmî Wikidata sayfalarından incelenen olguları ve ayrı editöryal kararları saklar.
Bu bir API yanıtı veya bağımsız tarihsel doğruluk sertifikası değildir. QID ve
sayfanın gerçek revizyonu kaynak bağlantısında sabitlenir; P569/P570/P19 ve yerin
P625 koordinatı ayrı kanıttır. Wikipedia makalesi/portre içe aktarılmadı.

111 profil, 66 yıllık yaklaşık doğum noktası, yalnız biyografik 20 yer ilişkisi,
doğum geometrisi olmayan 25 profil vardır. Kaynak revizyonu alınamayan James Watt
ve Arşimet iki ayrı bekleyen kayıttır; bu durum biyografilerinin bilinmediği
anlamına gelmez. Önceki Van Gogh ile uygulama toplam 112 kişi profili sunar.
[Her isim için tarih/yer/karar/kaynak](reports/person-birth-coverage.md).

Arama tüm dönemlerde; karttaki açık doğum-yılı düğmesi yılı değiştirir ve yaklaşık
konum tercihini açar. Kaynak filtresi korunur; kamera isteğe bağlı odaklanır.
66 nokta yalnız ilgili doğum yılında `BIRTH` snapshot'ıdır; gün/ay eklenmez,
yaşam aralığından ikamet veya rota üretilmez. Koordinat modern/kazı yeri temsilidir;
doğum evinin veya kişinin hassas GPS konumu iddiası yoktur. Bölge/krallık doğum
yerlerine şehir merkezi atanmaz. Gutenberg, Konfüçyüs vb. aralıkların ortasından
yıl seçilmez; Musa/Buda/Homeros gibi tartışmalı kronolojiler kesin tarihe çevrilmez.
Menes/Keops UI alt sınırına taşınmaz. Newton kaynak takvim farkıyla 1643;
Atatürk 1881/Selanik, 19 Mayıs kesin doğum günü sayılmaz.

`people:prepare` onaylı hash'lerden 14 ayrı üretim kataloğu çıkarır;
`people:check` tekrar üretim, lisans, revizyon, atıf, giriş/çıktı SHA ve NOTICE'ı
denetler. Otomatik koleksiyon onay vermez. Her katalog 256 KiB altında; mevcut
512 KiB pilot ve 64 girdi sınırı yükseltilmedi. `PeopleExtension` ayrı doğrulanmış
katalogları ortak provider/timeline/search/source/marker hattına bağlar. Yerel
bootstrap/bridge sürümü 0.7.0-discovery; ayrı doğum sürümü 1.0.0-births ve hash
manifestidir. Protokol şekli değişmedi; büyük veri WebView köprüsünden gönderilmez.
Eski on kişi ve Newton/Einstein işaret kimlikleri korunur, önceki kaynaklı ikamet/
ölüm ilişkileri silinmez. [Komut/kanıt raporu](reports/person-births.md).

Aşağıdaki metinler önceki fazların tarihli kayıtlarıdır.

**Faz16 güncel:** Gogh profili aramada ve kartta korunur; pilot konum coğrafyası
inceleme nedeniyle kapatıldı. “Kişi incelemesi:1880(konum askıda)” yalnız yıl/kanıt
bağlamını açar, marker üretmez. Kart uyarısı/kurumsal kaynak bağlantısı görünür.
Aşağıdaki Faz10 modeli korunur; eski pilot marker yönergesi geçerli değildir.
[İnceleme ve geri açma koşulu](historical-accuracy-audit.md).

2026-10-16 · Faz 10 · [ADR-0011](adr/0011-person-location-evidence.md).

## Model ve iddia sınırı

`HistoricalPerson`, ortak `Person` kaydına zorunlu `PersonProfile` ekleyen tiptir:
kalıcı ID, QID, adlar/alternatifler, kaynak/lisans/atıf/inceleme ortak zarftadır;
profil ayrı doğum/ölüm `TemporalExtent`, dil etiketli açıklamalar ve meslekler,
doğrulanmış Wikipedia sitelinkleri, nullable görsel hak metadata'sı taşır.
Yaşam zarfı `person.temporal` kaynaklıdır; doğum/ölüm profiliyle çelişirse üretim
reddedilir. Eski profilsiz şema yalnız staging geçişinde kabul edilir; üretimde
`PERSON_PROFILE` engelidir. Belirsiz doğum/ölüm aralıkları gün bilgisine çevrilmez.

`PersonLocation` kişinin ID'si, nullable yer referansı, Point veya açık eksik
geometri gerekçesi, kanıt ve kalite zarfıyla ayrı kayıttır. `relationshipType`:
BIRTH, DEATH, RESIDENCE, WORK, REIGN, DOCUMENTED_EVENT. İlişkinin türü ile kanıtın
sınıfı farklıdır: `locationType=timed-presence|biographical`. Eski `relationship`
alanı v2 uyumu için korunur; yeni türle çelişemez. `personLocationDates()`
`validFrom`, `validTo`, `precision` alanlarını kanonik `temporal`dan döndürür;
aynı tarihi iki değiştirilebilir yerde saklamaz. Kaynak `Evidence` bağlantısı,
`Confidence` ve gün/ay/yıl bilinmezliği kaybolmaz.

`spatialContext` tesis/şehir/bölge/krallık/bilinmeyen ölçeğini ve koordinatın
belgelenmiş tesis mi temsilî yer mi olduğunu açıklar. Bölge/krallık/bilinmeyen
ölçek için Point üretim ve staging doğrulamasından geçmez. Yer geometrisi
kişi kaydına kendiliğinden kopyalanmaz. Şehir ankrajı ancak açık yaklaşık tercih
ile gösterilir; kişinin o şehir merkezindeki GPS koordinatı sayılmaz.

`PERSON_ALIVE_AT_YEAR(year)` yalnız yaşam zarfını sorgular.
`PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR(year, includeApproximate=false)` yaşam
ve ayrı zamanlı konum kanıtını birlikte kontrol eder. Aynı locator zaman+yer
iddiasını desteklemeli; yaşam tarihi ile genel yer ayrı satırlardan birleştirilmez.
Doğum/ölüm ilişkisi yıllara yayılamaz: ayrı kaynaklı olay snapshot'ı ve ilgili
yaşam olayı aralığı gerekir. Kaynaklı hareket olayı yoksa rota/animasyon yoktur.
REIGN alanı da tek başına fiziksel bulunma kanıtı değildir.

## Görünürlük ve kullanım

| İşaret | Koşul / gösterim |
| --- | --- |
| ● Kesin yıl / belgelenmiş yer ilişkisi | İncelenmiş zaman+yer kanıtı, bilinen ve açıkça desteklenen dönem, yüksek güven, belirsiz olmayan gün/ay/yıl, belgelenmiş tesis noktası; varsayılan harita |
| ≈ Yaklaşık dönem/konum | Aynı kaynak ve yıl kontrolü; orta güven, belirsiz dönem veya temsilî şehir noktası; **Katmanlar → Yaklaşık dönemli kişi konumlarını haritada göster** açıkken |
| ◇ Biyografik bağlantı | Yıllık bulunma kanıtı değil; ayrı açılan kart listesi, haritada nokta yok |
| Desteklenmiyor | Düşük/bilinmeyen güven, tarihsiz bulunma, bilinmeyen yaşam veya noktasız yer referansı; yıllık marker yok |

Kesin yıl ilişkisi, kişinin yılın her gününde orada olduğu veya hassas GPS
koordinatının bilindiği iddiası değildir. Kart dönemi, hassasiyeti, kaynak metnini,
ilişkiyi, güven gerekçesini ve koordinat anlamını gösterir. Doğum/ölüm aralıkları
aralık olarak görünür. Arama yalnız kişi kataloğunda, bütün dönemlerde çalışır;
konumu olmayan kişi de bulunur. Arama sonucu seçili yılda yaşam/konum kanıtı değildir.
Ad/açıklamada Türkçe tercih edilir; başka dil gösterilirse kaynak dili ve çeviri
yapılmadığı belirtilir. Pilotun Türkçe kısa açıklaması projeye ait olgusal özettir.

`Kişi pilotu: 1880` düğmesi yılı ve açık yaklaşık tercihi seçer; kamera hareketi
yapmaz. Katalogdan **Vincent van Gogh** kartına girilebilir veya ≈ marker'a basılabilir.
Karttaki **Bu belgelenmiş konuma odaklan** isteğe bağlıdır ve tarihi değiştirmez;
azaltılmış harekette geçiş süresi sıfırdır. 1881'de konum kaybolur; kişi yaşam
sorgusunda bulunmaya devam eder. 1879/1880'in yalnız belgelenmiş ay aralığı desteklenir.

Kişi katmanı devlet ve kültürden bağımsızdır. Aynı `TimelineFrame`, kaynak yılı,
revizyon ve ACK kontrolünü kullanır. Yaklaşık tercih değişimi oynatmayı durdurur,
eski sorguyu iptal eder ve revizyonu yeniler. Geç ACK/selection sayfaları reddedilir.
Bilgi paneli açıkken harita etkileşimi mevcut modal koruması altında kalır.

Kişi noktaları ekran uzayında zooma göre 112/80/56 px hücrelerde kümelenir; 64
DOM küme bütçesi aşılırsa hücre büyür. Giriş en fazla 1.000 kayıttır; bütün ID'ler
küme seçiminde 8'li sayfalarla erişilir. Sayı kişi sayısı değil **konum ilişkisi**
sayısıdır; aynı kişinin birden çok noktası olabilir. Ankraj ilk gerçek kaynak
noktasından seçilir; ortak tarihî konum veya yeni koordinat türetilmez. Arka
yarımküre ve ekran dışı noktalar süzülür; MapLibre örtülme sınıfı da düğmeyi
klavye/işaretçi erişiminden kaldırır. Kamera sonlarında kümeler yeniden kurulur;
yeni WebView, sunucu glyph/font/tile kaynağı yoktur. Dinleyici ve Marker kaynakları
refresh/unmount sırasında kaldırılır. Bu bütçeler gerçek cihaz FPS ölçümü değildir.
Kart konum/diğer bağlantı listeleri de 8'li sayfalıdır; kanıt satırları açık
sayfalara aittir, kaynaklar ayrıca gösterilir.

## Küçük gerçek pilot ve sınırları

Katalog `0.3.0-pilot`, schema2, ETL1.4.0: toplam 11 kayıt / 3 SourceRecord.
Önceki 6 NARA kaydı korunur; 2 kimlik, 1 kişi, 1 yer ve 1 kişi-konum ilişkisi eklenir.
Kişi **1**, kişi konumu **1**, tam siyasi polygon **0**, kültür geometrisi **0**.
Fiziksel Natural Earth tabanı değişmedi. Savaş/olay/diğer kişiler eklenmedi.

[Q5582, revizyon 2556738621](https://www.wikidata.org/w/index.php?title=Q5582&oldid=2556738621)
üzerindeki P551=Q3280282 ilişkisi P580 Ağustos 1879 / P582 Ekim 1880 niteleyicileri
ve müze referansı taşır. Aynı dönem P937 altında da bulunur; bu bağımsız ikinci
kanıt değildir. Yaşam tarihleri ayrı P569/P570 kaydından, ressam bilgisi yapısal
kimlik/açıklamadan alınmıştır.
[Q3280282, revizyon 2460715196](https://www.wikidata.org/w/index.php?title=Q3280282&oldid=2460715196)
P625 yapı noktasının DMS gösterimi GeoJSON lon-lat dereceye dönüştürüldü.
Bu güncel yapı noktasıdır; tarihî oda/ölçüm doğruluğu/kişisel GPS değildir.

Tarayıcıyla incelenen yapılandırılmış olgular
`data/pilot/raw/wikidata-person-facts.json` içinde açıkça **editöryal çıkarım**
olarak saklıdır; özgün HTTP/API JSON değildir. Terminal JSON alımı DNS/curl6
nedeniyle, bağlı müze sayfasının bağımsız alınması da erişim nedeniyle başarısız.
Bu nedenle güven orta; inceleme durumu bu dar Wikidata olgularının incelenmesini
ifade eder, birincil arşiv doğrulamasını değil. Pilot varsayılan kesin filtresine
alınmaz. Daha güçlü kaynak gelirse yeni ham hash/revizyonla yeniden inceleme gerekir.

İki kaynak aynı açık etiketli çıkarım dosyasına ayrı kaynak/revizyon/input ID ile
bağlanır; iki ayrı özgün yanıt oldukları iddia edilmez. Builder ham SHA'yı sabit
incelenmiş değerle karşılaştırır. Katalog, kişi GeoJSON'u ve kapsama manifesti
ayrı hash/byte bilgileriyle deterministik üretilir.

Wikidata yapılandırılmış veri [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing)
kapsamındadır. Makale metni ve
[Commons dosya hakları](https://commons.wikimedia.org/wiki/Commons:Licensing)
ayrıdır; P18 bir görsel lisansı değildir. Ayrı onaylı medya asset hattı henüz yok:
üretim kaydında görsel metadata'sı verilirse `PERSON_MEDIA_RIGHTS` engeli oluşur;
pilotta görsel yok. Wikipedia URL'si ad/QID'den üretilmez; kişilerin sitelinkleri de
kaynak/revizyon/hash ve ham Wikidata sitelinkiyle ETL'de bire bir karşılaştırılır.
Bu pilotun özgün JSON'u alınmadığından Wikipedia alanı boş bırakıldı; bu, gerçek
dünyada maddesi olmadığı anlamına gelmez.

## Resmî özellik doğrulaması — 2026-10-16

| Özellik | Anlam / kullanım sınırı | Resmî kaynak |
| --- | --- | --- |
| P19 / P20 | Doğum/ölüm yeri, tek başına yıllık hareket/ikamet değil | [P19](https://www.wikidata.org/wiki/Property:P19), [P20](https://www.wikidata.org/wiki/Property:P20) |
| P551 | İkamet ilişkisi; zaman niteleyicisi ve kaynak incelemesi gerekir | [P551](https://www.wikidata.org/wiki/Property:P551) |
| P937 | Faaliyet/çalışma yeri; yıl veya şehir merkezinde fiziksel bulunma kendiliğinden çıkarılmaz | [P937](https://www.wikidata.org/wiki/Property:P937) |
| P580 / P582 | Başlangıç/bitiş niteleyicileri; rank, precision, takvim ve referansları korunur | [P580](https://www.wikidata.org/wiki/Property:P580), [P582](https://www.wikidata.org/wiki/Property:P582) |
| P625 | Dünya için WGS84 koordinatı; ölçek ve hata payını tek başına kanıtlamaz | [P625](https://www.wikidata.org/wiki/Property:P625) |

## Kontrollü içe aktarma / geliştirici akışı

Uygulama Wikidata'ya canlı sorgu göndermez. Geliştirici CLI'sı:

```sh
# Kendi gerçek iletişim URL/e-posta adresinizi kullanın; örneği kopyalayıp sahte iletişim vermeyin.
export WIKIDATA_USER_AGENT='TarihAtlasi/0.1 (<gerçek-iletişim-adresi>)'
npm run persons:collect -- Q5582
```

CLI en fazla 5 açık QID alır, concurrency1, tek QID/GET, tr/en etiket/açıklama,
15 sn timeout, 4 MiB açılmış JSON, 3 deneme, bounded backoff kullanır. `maxlag=5`,
anlamlı User-Agent, sıkıştırma ve Retry-After uygulanır; 30 saniyeyi aşan bekleme
isteğinde erken tekrar yerine ertelenme hatası verilir. Ham JSON+SHA/byte/revizyon
receipt'i 24 saat cache edilir; hash bozuksa reddedilir. Yönlendirme/farklı QID ve
beklenmeyen API yanıtı otomatik birleştirilmez. Bu sınırlar sağlayıcının bütün
gelecek kota koşullarının garantisi değildir; resmî [Data access](https://www.wikidata.org/wiki/Wikidata:Data_access),
[API etiquette](https://www.mediawiki.org/wiki/API:Etiquette) ve
[wbgetentities parametreleri](https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities)
ile karşılaştırıldı. Gerçek ağ alımı bu ortamda doğrulanamadı; fetch/cache/backoff
akışı mock HTTP yanıtlarıyla test edildi.

Çıktılar `data/staging/wikidata-persons/` altındadır ve uygulamaya import edilmez.
Review dosyası ham statement GUID/rank/niteleyici/referansları korur;
`reviewStatus=unverified`, `productionApproved=false`, `annualPresenceApproved=false`,
`mediaApproved=false`, `geometry=null` her zaman başlangıç değerleridir.

1. Ham receipt/hash/revizyonu ve insan kimliğini kontrol et; varsa çelişkili tarih/rankları listele.
2. Yaşam olaylarını konum iddiasından ayır. P19/P20/P551/P937 ile yaşam tarihini çarpma.
3. Aynı belgede dönem ve yer ilişkisini, takvim ve tarih hassasiyetini incele;
   niteleyici olmaması bütün yaşamda geçerlilik sayılmaz. P585 gibi olay anları
   otomatik dönüştürülmez, manuel incelemede değerlendirilir.
4. Yer ölçeği/koordinat rolünü ayrıca doğrula; krallık/şehir centroidi veya güncel
   idari temsil noktası gerçek kişi noktası olamaz. Gerekirse yalnız biyografik bağ bırak.
5. Kaynak/lisans/atıf ve sitelink ham eşleşmesini doğrula; görselleri ayrı hak hattına bırak.
6. Kişi/yer/ilişkiyi yeni sürümlü katalogda açık Evidence/Transformation/Input ile
   modelle; inceleme tamamlanmadan verified yapma. Genel ETL `inspect/prepare`
   kapısı, kaynak politikası, checksum ve yeni regresyonlarla yeniden üret.
7. `npm run pilot:prepare`, `npm run check`, web export ve Android JS export;
   gerçek tarayıcı/cihaz kabulünü ayrıca çalıştır. CLI aday dosyası Catalog değildir.

[Veri kalite kaydı](data-quality.md), [faz raporu](reports/phase-10.md).
