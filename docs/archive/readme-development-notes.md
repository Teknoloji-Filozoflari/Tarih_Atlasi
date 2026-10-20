# Tarih Atlası

## 21 Ekim: indirdiğin tarih kayıtları uygulamaya bağlandı

4.273 kaynak kaydından 2.969 yeni kişi ve 1.084 savaş/olay eklendi.
Toplam 3.203 kişi / 1.120 olay var. 46 yeni yaklaşık doğum noktası ve 35
muharebe referans noktası kaynaklı yıllarında görünür; diğer kayıtlar arama/
yıl listesinde bulunur. Bütün dünya/Nobel/TIME kapsamı tamamlandı iddiası yok.

Yeniden indirme gerekmez: `npm run web -- --clear`.
Aramada Aziz Sancar, Svante Pääbo, Novšiće veya nobel deneyebilirsin.
`npm run history:check` üretim paketlerini; `node scripts/history/check.mjs
--with-raw` orijinal yanıt ve sitelink eşleşmelerini de denetler.
[Kabul edilmeyenler, kaynaklar ve platform/test kanıtları](docs/reports/history-import-2026-10-21.md).

## 20 Ekim: genişletilmiş kişi, savaş ve olay kataloğu

56 yeni kişi ve 23 savaş/olay eklendi; toplam 234 kişi ve 36 olay var.
Richard Feynman, Orhan Pamuk, İbn Rüşd, Dalay Lama, Waterloo veya Kore Savaşı’nı
ara. Yeni içerik için indirme gerekmez: `npm run web -- --clear`.
Kişi noktaları yalnız kaynaklı yılda görünür; konumsuz kayıtlar arama/yıl
listesinde kalır. Bütün Nobel/TIME sahipleri veya dünya tarihi tamamlanmadı.
[Kapsam, kaynak incelemesi ve büyük toplama komutları](docs/history-expansion.md).
`npm run people:broad:check` yeni paketin kaynak/lisans/hash kontrolleridir.

## 20 Ekim: şehir/kişi/nokta seçimi düzeltmesi

Boş ilçe bilgisinin tetiklediği React Native Web hata ekranı düzeltildi. Şehir kartı açıkken kişi/olay seçilebilir; kişisel nokta seçimi başka işaretle kesilmez. Yakınlaşınca kişi/olay işaretinin yanında adı görünür. Arama kartında ⓘ ayrıntıları açar; Atatürk doğum yılı eylemi 1881 Selanik'e odaklar.

`npm run qa:people-visibility` yayımlanmış profilleri topluca denetler; tek tek kontrol etmen gerekmez. Sonuç: 177 profil / 111 yıllık doğum noktası / 0 hata. [Düzeltme ve doğrulama sınırları](docs/reports/map-card-fixes-2026-10-20.md).

## 19 Ekim: kişiler ve kişisel harita kayıtları

- Atatürk: arama → Atatürk → kart başlığındaki bilgi simgesi → doğum yılına git. Yalnız 1881 Selanik doğum ilişkisi gösterilir; nokta yaklaşık yer temsilidir.
- Kişi/olay kartları kısa açılır; kaynak, belirsizlik ve odaklama işlemleri bilgi simgesindedir.
- Keşfet → Haritada nokta belirle ve kayıt ekle → küreyi kaydır → Bu noktayı kullan. Kendi kayıtlarım bölümünde düzenleme/silme bulunur. Notlar doğrulanmamıştır, yalnız cihazda saklanır; paylaşılmaz/yedeklenmez. 50 kayıt ve aynı yılda 8 işaret sınırı vardır.
- Yeni dünya içeriği: Tagore, San Martín, Maathai, Sheppard; Ayacucho 1824 ve Berlin 1989. Belirsiz biyografik bağlar yıllık noktaya çevrilmez. Dünya/kişi kapsamı eksiksiz değildir.
- `npm run people:global:check` incelenmiş yeni paketi kaynak hashleriyle kontrol eder. Normal çalıştırma için ek indirme gerekmez.

[Ayrıntılı kapsam ve test raporu](docs/reports/people-notes-2026-10-19.md).

**Dünya referansları indirildi ve denetlendi.** Hollanda'nın 2024'te iki kez
çizilmesi düzeltildi. Suriye/Cabinda ve küçük devlet/ada eksikleri hâlâ
kaynak incelemesinde; bütün dünya tamamlanmış değil.
[İndirme sonrası sonuçlar ve 378 testin kanıtı](docs/reports/world-reference-review.md).
Mevcut dosyaları yeniden indirmen gerekmez.

**19 Ekim — Dünya sınırları denetimi:** Suriye 2024 ve Angola/Cabinda'daki
boşluklar kaynak geometri eksikliğidir; boş alan ülkesiz demek değildir.
Bizans 1453 kaydı tarih incelemesinde. Beş yanlış 2024 ülke kimliği düzeltildi;
bütün ülkelerin sınırları tamamlanmış sayılmaz.
[Bulgular, kaynak seçenekleri ve test kanıtları](docs/reports/world-data-audit.md).
Yeni ortamda yaklaşık 26,8 MB karşılaştırma verisini indirip denetlemek için:

```sh
npm run world:audit:download -- --timeout-seconds 1800
npm run world:audit:download -- --verify
npm run world:audit
```

Dosyalar `data/staging/world-audit/` içine gelir. Bu işlem haritayı otomatik
değiştirmez; güncel referans sınırı tarihî yıllara taşınmaz. Sonuçlar
`docs/reports/world-data-audit/audit.json` içindedir. Mevcut dünya/şehir
arşivlerini yeniden indirmen gerekmez.

**Güncel yollar ve açık atlas renkleri:** küre açık mavi deniz, açık kara ve
pastel ülke renkleri kullanır. **Sağ üst © → Güncel yollar** açıkken yakınlaşınca
OpenFreeMap/OSM yol ve arazi ayrıntısı gelir; seçili tarih yılından bağımsızdır.
Ek indirme/kurulum yok; internet gerekir. Kamera artık 16 zoom'a kadar yaklaşır.
[Kaynaklar, yapılan değişiklikler ve doğrulama sınırları](docs/reports/atlas-colors-roads.md).

**Açılış yılı MS 2024.** Paylaşım bağlantısı veya yer imiyle açılan tarih önceliklidir;
takvimde günümüz yılına kadar seçim yapılabilir. Dünya şehir/idari yer paketi
artık kurulu: 248 ülke/bölge, 5.616.753 kayıt, 16.102 veri parçası. Bunlar
eksiksiz resmî şehir/ilçe envanteri veya tarihî yerleşim kanıtı değildir.

**`entry.js %99` düzeltmesi:** şehir verisinin web'de dev JavaScript paketine
gömülmesi kaldırıldı. Mevcut sunucuyu Ctrl+C ile durdurup:

```sh
npm run web -- --clear
```

İndirilen veri korunur. **Katmanlar → Ülkelere göre şehir ve ilçe kayıtlarını
gez → TR → İdari birimler / ilçeler** yolundan inceleyebilirsin.
Web üretim çıktısı için `npm run web:export` kullan; doğrulanmış veri dosyaları
ve atıf `dist/data/places` içine de aktarılır.
[Paketleme teşhisi, gerçek veride testler ve sınırlar](docs/reports/metro-places.md).

Yeni bir ortamda dünya verisi ilk kez kurulacaksa:

```sh
npm run places:download -- --timeout-seconds 7200
npm run places:download -- --verify
npm run places:prepare
npm run places:check
npm run web -- --clear
```

İndirme hata verirse kurulum tamamlanmış sayılmaz; çıktıyı incele. Birkaç GB
boş alan ve `unzip` gerekir. Kurulumdan sonra **Katmanlar → Güncel şehirler ve
idari birimler** açıkken yakınlaş; ülke listesinden `TR` seçip **İdari birimler /
ilçeler** bölümünü aç. Bunlar güncel temsil noktalarıdır; tarihî yılın yerleşim
kanıtı değildir. [Ayrıntılı kurulum ve kapsam](docs/modern-places.md).

**18 Ekim 2026 — Kişi listesine devam: Osmanlı grubu tamamlandı, tüm liste PARTIAL**

33 ek kaynaklı profille kullanıcı listesindeki **36 Osmanlı padişahının tamamı**
aramada bulunur. Yeni pakette22yaklaşıkdoğum noktası,8biyografik ilişki ve3noktasız
profil vardır. Doğum yılı/yerinde belirsizlik varsa rastgele nokta üretilmez.
Kanuni ve dört önceki kaydın belirsiz doğum noktaları biyografik sınıfa düzeltildi.
Uygulama VanGogh dahil toplam **174 profil /109 yaklaşık doğum-yılı noktası** içerir.
Bu, bütün kişilerin her yıl haritada bulunduğu anlamına gelmez.

823 ayrı isteğin144'ü kaynaklı profille eşleşir; kalan **665 kişi henüz üretime
eklenmedi**. Terminal API erişimi DNSengelli; araştırma tarayıcısında resmî kaynaklar
incelendi. ElealıZenon kararı ve9belirsiz adı atlama isteği korunur.5müzik grubu
kişi doğumu değildir; arama isteği doğrulanmış profil/konum sayılmaz.

```sh
npm run people:expanded:check
npm run people:ottoman:check
npm run web -- --clear
```

Arama→**II. Selim**→**Doğum yılına git ve yaklaşık konumu aç**→1524.
Kamera odağı isteğe bağlıdır. Kanuni gibi belirsiz doğum yılı olan profilde bu
düğme gösterilmez; biyografik bilgi ve kaynak/Wikipedia kartı erişilebilirdir.
[Yeni kaynaklar, düzeltmeler ve testler](docs/reports/ottoman-people.md),
[kalan kaynakları terminalden toplama](docs/people-expansion.md),
[823isteğin gerçek durumu](docs/reports/requested-people-coverage.md),
[testler/değişen dosyalar](docs/reports/requested-people.md).

Aşağıdaki kayıtlar önceki çalışma anlarını anlatır; güncel kapsam yukarıdadır.

**18 Ekim 2026 — İstenen tarihî kişilerin doğum kayıtları**

113 kişiden 111'i kaynaklı profille aramada; 66'sında doğum yılına özel yaklaşık
yer noktası var. 20 yer ilişkisi yalnız biyografik; 25 profilde yayımlanabilir
doğum geometrisi yok. James Watt ve Arşimet kaynak revizyonu incelemesinde ayrı
listelenir. Eksik kayıtlar rastgele yıl/konumla tamamlanmadı.

Yeni indirme veya npm paketi gerekmiyor:

```sh
npm run people:check
npm run web -- --clear
```

Arama → **Atatürk** → kişi kartı → **Doğum yılına git ve yaklaşık konumu aç**.
1881 yılına geçer; Selanik temsil noktası görünür. Newton 1643, Einstein 1879,
Marie Curie 1867 de denenebilir. Kamera kendiliğinden taşınmaz; kartın konuma
odaklanma işlemi isteğe bağlıdır. Yaklaşık konumlar varsayılan olarak kapalıdır;
bu düğme veya Katmanlar'daki açık tercih ile açılır. Kaynak güveni/ilişki gibi
ek filtreler kullanılıyorsa sonuç daralabilir. Doğum noktası kişinin tüm yaşamına
yayılmaz. [113 kişinin kaynak ve karar dökümü](docs/reports/person-birth-coverage.md),
[testler ve sınırlar](docs/reports/person-births.md).

**18 Ekim 2026 — Dünya şehirleri ve ilçe düzeyindeki kayıtlar**

Altı sabit şehirle sınırlı katmana GeoNames dünya verisi içe aktarma, bölgeye
göre yükleme ve ülke bazında liste eklendi. **Dünya dosyası artık indirilip
kuruldu; güncel kapsam en üsttedir.** Aşağıdaki komutlar yeni ortamın ilk
kurulumu içindir; mevcut kurulumda sunucuyu yeniden başlatmak yeterlidir:

```sh
npm run places:download -- --timeout-seconds 7200
npm run places:download -- --verify
npm run places:prepare
npm run places:check
npm run check
npm run web -- --clear
```

Yaklaşık403MiB kaynak ZIP (günlük boyut değişir), işleme için birkaç GB boş alan
ve `unzip` gerekir; yeni npm paketi/hesap/anahtar yok. Zoom4/6/8 ile ayrıntı artar.
**Katmanlar → Ülkelere göre şehir ve ilçe kayıtlarını gez** üzerinden ülke kodu
(`TR`, `EG`, `DE` vb.) seç; yerleşim/idari kayıt ayrı. Güncel nokta bilgileridir;
ilçe sınır poligonları veya geçmişteki yerleşim kanıtları değildir. Kaynakta
olmayan yer uydurulmaz; eksiksiz resmî ilçe envanteri iddiası yoktur.
[Kurulum, kapsam, lisans ve teknik sınırlar](docs/modern-places.md).

Aşağıdaki bölümler önceki görevlerin kayıtlarıdır; “yeni indirme gerekmiyor”
ifadeleri yeni dünya şehir paketi için geçerli değildir.

**18 Ekim 2026 — Türkiye açılışı, kişi/savaş kartları ve güncel şehirler**

Sunucuyu Ctrl+C ile durdurup proje kökünde `npm run web -- --clear` çalıştır.
Yeni indirme veya paket kurulumu gerekmiyor. Küre Türkiye'ye odaklı, zoom 4 ile
açılır; URL ve yer imi kameran önceliklidir. Verdiğin 10 kişi arama/katalogda,
kısa bilgi ve Wikipedia işlemiyle bulunur.

Beş kaynaklı yaklaşık kişi ilişkisi için Katmanlar'dan
`Yaklaşık dönemli kişi konumlarını haritada göster` seçeneğini aç: Newton 1643,
Einstein 1879, Gutenberg 1468, Kolomb 1506; Muhammed 622–632 Medine. Diğerlerine
konum uydurulmaz. 1453, 1071, 1526 ve 1915–1916 savaş noktaları;
Sakarya 1921 ve dünya savaşları listede bulunur. Yedi yeni kayıt bütün
savaşların kapsandığı anlamına gelmez.

Zoom 4 ve üzerinde İstanbul, Ankara, İzmir, Antalya, Bursa ve Medine ayrı güncel
referans katmanındadır; bağımsız kapatabilirsin. Geçmişte o ad veya ölçekte
var olma iddiası yok. Uzun kaynak ve ayrıntı açılınca görünür. Libya/Çad için
incelenmiş geometrinin haritaya yüklenmesindeki hata da düzeltildi.
[Kapsam, testler ve deneme adımları](docs/reports/turkey-discovery.md).

**Güncel — 18 Ekim 2026:** Ülke etiketleri Yunanistan, Türkiye, Fransa gibi kısa
adlarla gösterilir. Libya/Çad2000/2010 kaynak aralıklarında tekrar görünür;
bütün yılların eksiksizliği değildir. Kalıcı kaynak/sayaç metinleri ana ekrandan
kaldırıldı; ayrıntılar Keşfet, © ve kartın kaynak düğmelerinde. Timeline
kompakt; ölçek/hız/atlama araçları **⋯** ile açılır. Yeni indirme yok.
Çalışan sunucuyu Ctrl+C ile durdurup:

```sh
npm run web -- --clear
```

307ana+5worker/lint/strictTS/hash ve web/AndroidJS export PASS. Gerçek browser/
görsel ve fizikselAndroid kabulü açık. [Kaynaklar, dosyalar, testler ve sınırlar](docs/reports/compact-country-map.md).
Aşağıdaki tarihli bölümler önceki sürümlerin kayıtlarıdır.

**Güncel — MS 2010 incelemesi:** Fransa kaynağının Sahra'ya taşan kapsamı
anakara/Korsika ile sınırlı, açık etiketli kısmi alan olarak düzeltildi;
Hollanda'nın yinelenen çizimi kaldırıldı. Ülke **adına** tıklama Wikidata'dan
mevcut TR/EN Wikipedia bağlantısını çözer; **alanına** tıklama kaynak kartını
açar. Belirgin yıl ve tüm dönem/200/20 yıl ölçekleri eklendi. Küre korunur.
**Bu değişiklikler için yeni indirme gerekmez.**

```sh
npm run web -- --clear
# Kaynak/geometri teşhisini tekrar üretmek için:
npm run qa:map -- 2010
```

2010:191 kaynak siyasi satırı,178çizilebilir,13askıda; Fransa kısmi alandır.
Libya/Çad/Tunus gibi gerekçeli boşluklar tarihsel yokluk değildir. Etkin2000
sayımı192/178/14'tür; aşağıdaki192/179/13 ham manifest/eski sürüm sayımıdır.
304ana+5worker/lint/strictTS/asset kapıları ve web/Android JS export PASS;
canlı browser/Wikidata ve fizikselAndroid kabulü açık, yayın NO-GO.
[Tüm bulgular, test kanıtları ve yapmanız gerekenler](docs/reports/application-review-2010.md).
Aşağıdaki tarihli bölümler önceki sürümlerin kayıtlarıdır.

**Güncel — 17 Ekim 2026: ayırt edilebilir ülke renkleri.** Siyasi alanlar artık
mat renklerle ayrılır; aynı kayıt yıl değişiminde rengini korur. İnce, daha
belirgin sınırlar, küçük ülke adları ve alan içinden seçim korunur. Göller ve
nehirler ülke renklerinin üstünde görünür. Yeni indirme gerekmez.
[Uygulama ve doğrulama raporu](docs/reports/political-area-colors.md).

**MS2000 veri denetimi:**
Yunanistan'ın geçerli teğet halkalarını yanlış reddeden doğrulayıcı düzeltildi;
özgün kaynak geometrisi MS2000'de tekrar çizilir. Ürdün Krallığı o yıl için
geçerli bir addır; korundu. Gerçek ad/dönem çelişkileri kaynaklı inceleme
listesine alındı. Kapsam **PARTIAL**: MS2000'de192kaynak siyasi kayıt,
179çizilebilir,13incelemede; bunlar bağımsız ülke sayısı değildir.

```sh
npm run web -- --clear
npm run world:audit-2000
```

Görünüm düzeltmesi için yeniden indirme yok. MS2000'e daha uygun veri adayı,
lisans ayrımı ve indirilecek CShapes2.0GeoJSON için
[ayrıntılı araştırma](docs/country-data-research.md).
CShapes üretime otomatik alınmadı. Aşağıdaki16satırlık pilot ve önceki test
sonuçları eski sürümlerin tarihî kayıtlarıdır.

CShapes dosyası indirildikten sonra yerel inceleme: `npm run cshapes:inspect`.
Dosya yolu, ZIP seçimi ve üretimden ayrı tutulan rapor için
[inceleme yönergesi](docs/country-data-research.md#şimdi-ne-indirilebilir).
Bu komut yeni ülke sınırlarını uygulamaya otomatik eklemez.
İndirilen dosyanın gözlenen GW takvim şeması için inceleyiciv2 desteği eklendi;
yeniden indirme gerekmez.710satır tanınıyor,MS2000'de179dönem adayı var;
sonuç `DATA_REVIEW_REQUIRED` ise eksik statü/tarih/geometri uyarılarına bakılır.
[Gerçek dosya inceleme raporu](docs/reports/cshapes-schema-review.md).

**Güncel — 16 Ekim 2026: indirilen veriler Küre'ye bağlandı.**
Natural Earth10m kara/göl/akarsu ve16 kaynak satırından oluşan yaklaşık siyasi
pilot hazır. Yeniden indirme veya Python kurulumu gerekmez. Proje kökünde:

```sh
npm run web -- --clear
```

İlk yıl2000: Türkiye Cumhuriyeti, İspanya, İtalya, Portekiz, Mısır, Hindistan,
Brezilya, Güney Afrika ve Almanya. Yıl1453: Osmanlı, Memlûk, İngiltere, Portekiz
ve Fransa örnekleri; MÖ500: Roma Cumhuriyeti ve Kartaca. Arama veya
**Keşfet → Bu yılın siyasi kayıtları** ile kart/kaynak açılabilir; siyasi katman
kapalıysa Katmanlar'dan açın. Kesikli alanlar yaklaşık kaynak rekonstrüksiyonudur.
2024–günümüz bu seçilmiş katalogda coğrafya desteklemez; dönemler uzatılmaz.
Bu küçük pilot bütün dünya devletlerini veya bütün yılları kapsamaz.

269ana+5worker, lint, strictTS ve bütünlük/format kapıları PASS; web ve Android
JS export PASS. Gerçek browserE2E yerel sunucu EPERM nedeniyle BLOCKED;
fizikselAndroid **UNVERIFIED ON DEVICE**, yayın NO-GO. [Kapsam, lisans, ölçüm,
değişen dosyalar ve test kanıtları](docs/atlas-data-integration.md).
Aşağıdaki indirme bekleniyor/ülke alanı yok notları önceki sürümlerin kayıtlarıdır.

**Ayrıntılı dünya / ülke verisi araştırması:** Ana ekrandaki fiziksel kara/ölçek
yazısı kaldırıldı. Kullanıcının indirdiği50m taban korunur;1420kara parçasının
hash/lisans kontrolü geçti. Daha ayrıntılı kara, göl, akarsu ve tarihli ülke
alanları için sabit kaynak dosyalarını almak üzere:

```sh
npm run data:download
npm run data:download -- --verify
```

Komut yaklaşık65–70MB beklenen6dosyayı yalnız `data/staging/map-sources/`
klasörüne alır; henüz haritaya bağlamaz. Yeni Python/kütüphane/hesap gerekmez.
ZIP süre sınırı15dakika/denemedir; yavaş bağlantıda
`npm run data:download -- --timeout-seconds 1800` kullanılabilir. Tamamlanan
dosyalar cache/hash kontrolüyle atlanır; eksik dosya baştan alınır.
**Ülke alanlarının üretim entegrasyonu hâlâ eksiktir.**
[Kaynak karşılaştırması, lisans ve entegrasyon sırası](docs/detailed-map-research.md).
Bu ortamda indirme DNSengelli; kullanıcı komutu ağ erişimli terminalde çalıştırır.

**Güncel tercih — yalnız 3D Küre:** Atlas/2D geçişi kaldırıldı. Eski yer imleri
ve bağlantılar tarih/kamera bağlamıyla Küre'de açılır; kayıtlar silinmez.
Kara-kıyı ayrıntısını artırmak için `npm run basemap:prepare`, ardından
`npm run basemap:check` ve `npm run web -- --clear` çalıştırın.50m indirilemezse
mevcut110m taban kalır. [Adım adım indirme ve yerel dosya yolu](docs/globe-only.md).
Bu komut tarihî ülke sınırı eklemez: mevcut katalogda tam ülke poligonu yoktur.
257ana+5worker test PASS; gerçek web/Android cihaz kabulü açık, yayın NO-GO.
Aşağıdaki Atlas/Küre açıklamaları önceki sürüm kayıtlarıdır.

**V3 güncel durum — 16 Ekim 2026:** Kompakt üst bar, tek timeline dock ve
haritayla birlikte kullanılabilen sağ detay paneli/mobil alt panel uygulandı.
Atlas/Küre tercihi saklanır; arama altı türü kapsar. Üretimde örnek ve tanı
kontrolleri kapalıdır; geliştirme ortamında **Keşfet → Geliştirici araçları**
altında korunur. Bozuk yer imi açık inceleme/onayla kurtarılır; kaynak teknik
izleri açılabilir. Uygulama React Native + Expo + TypeScript'tir; Python
çalışma zamanı veya Python kurulumu gerekmez.

255 ana +5 worker testi, lint/strict typecheck ve web/Android JavaScript export
geçti. Gerçek tarayıcı, sekiz boyutta ekran görüntüsü ve fiziksel Android kabulü
bu görev ortamında engellidir. **Ayrıntılı Atlas PARTIAL, yayın NO-GO.**
[V3 sonuç ve dosyalar](docs/ui-map-audit/ui-and-map-redesign.md),
[kalan sınırlamalar](docs/ui-map-audit/known-limitations.md),
[yedi audit kontrolü](docs/ui-map-audit/probe-remediation.md).
Aşağıdaki eski faz sonuçları kendi tarihlerinin kayıtlarıdır.

Geliştirme görünümü:

```sh
npm run web -- --clear
```

Üretim davranışını yerelde incelemek için:

```sh
npm run web:export
npm run web:preview
# http://127.0.0.1:8081
```

Önizleme sunucusu yalnız loopback'te çalışır; yerel CSP başlıkları üretir,
yayınlama yapmaz. Terminal bu ortamda `EPERM` verirse port açma izni olan
geliştirme ortamında çalıştırın. Tarayıcı/GPU izinleri bulunan ortamda
`npm run test:web:production` gerçek üretim akışlarını ve sekiz ekran boyutunun
görüntü/bounds kontrollerini çalıştırır. `npm run test:web` eski geliştirme
akışlarını ve mevcut snapshot testlerini de içerir. İlk görsel baseline insan
tarafından incelenmeden topluca onaylanmamalıdır.

**2026-10-16 — yerinde ürün iyileştirmesi:** Aynı haritada **Atlas / Küre**,
zoom0–8, sade üst bar ve açılır Keşfet menüsü, kompakt tarih araçları.
Arama, kaynak, paylaşım, yer imi ve katman işlevleri korunur; sentetik işaret
isteğe bağlı teknik kontrol olarak kapalı başlar. Üretim katalog0.4.1-pilot,
ETL1.6.0; askıdaki kişi geometrileri ham arşiv korunarak üretimden çıkarılır.
[Ayrıntılı akışlar](docs/product-rework-flows.md), [kanıtlı kalite raporu](docs/reports/product-rework.md).
50m fiziksel detay hazırlayıcısı `npm run basemap:prepare`; burada DNS engeli
nedeniyle110m taban kullanılmaktadır. **Yayın NO-GO**; web/Android gerçek cihaz
ve görsel doğrulaması otomatik unit sonuçlarından çıkarılamaz.

**Faz 16 — denetim teslimi; yayın kararı NO-GO.** Kaynak/revizyon ve URL
kontrolleri sıkılaştırıldı; incelenen kişi coğrafyası askıya alındı. Gogh profili
ve kaynaklar aramada kalır, harita noktası gösterilmez. Gizlilik politikası
Ayarlar/Hakkında'da. Katalog19kayıt/7kaynak; yayın inceleme politikası1.0.0,
4LOD girdisi/3benzersiz parça. 4026seçilebilir yılın yalnız1066 ve1867'sinde
pilot coğrafyası var; tam siyasi/kültürel polygon0. [Denetim ve test raporu](docs/reports/phase-16.md),
[yayın engelleri](docs/release-blockers.md), [gizlilik](docs/privacy-policy.md).
Faz17 başlamadı; aşağıdaki önceki faz sonuçları tarihî kayıt olarak okunmalıdır.

Web önizlemesi: `npm run web` → terminalde gösterilen adres (genellikle
`http://localhost:8081`). Eski ekran için `npm run web -- --clear`.

Android ve web için Türkçe öncelikli, koyu temalı, ücretsiz ve hesapsız tarih atlası.
Kod ve projeye ait belgeler [MIT](LICENSE) lisanslıdır. Tarihî veri, harita, font,
ikon ve tile hakları bu lisansın kapsamında sayılmaz.

[Faz 00–08 denetimi](docs/reports/phase-audit-00-08.md) takibi: Faz 09'da bağlı
tarih çelişkisi giderildi, unit CI kurulumu eklendi; siyasi ilişki kapsamı (A-03) Faz 12 kaynak doğruluğu kapsamında düzeltildi;
görsel baseline ve gerçek platform/veri kabulü açık.
Güncel durum [ilerleme kaydındadır](docs/progress.md).

**Faz15: manifest parçaları, kota sınırlı önbellek ve ölçüm araçları hazır.**
Seçilen yıl/LOD için yalnız gerekli izinli pilot parçası açılır. Cache içeriği
hash/sürüm/atıf/lisans kontrolünden geçer; bozuk içerikte paketli yedek veya
Türkçe yeniden deneme sunulur. Veri yükleme kaynağı ve katalog sürümü görünür.
Arka planda oynatma/veri isteği durur; aynı görünümde marker/etiket kurulumu
tekrarlanmaz. Yeni tarihî veri veya paket yok. **233 ana+4 worker** ve JS export
PASS; gerçek web kısıtlı ağ ve Android performans kabulü **BLOCKED /
UNVERIFIED ON DEVICE**. Küçük pilot paketlidir; tamamen offline çalışma iddiası yok.
[Kullanım/cache/ölçüm komutları](docs/performance.md), [Faz15 raporu](docs/reports/phase-15.md),
[cihaz kontrol notları](docs/reports/phase-15-device.md). Faz16 güncel denetimi yukarıdadır.

**Faz 14: bağımsız katmanlar, ortak filtre/lejant ve kalıcı tercihler hazır.**
**Katmanlar** panelinde beş tarihî bilgi türünü ve tarihî yer/isim etiketlerini
ayrı yönetebilirsiniz. Kayıt güveni, kesin destek, siyasi tür, kişi–yer ilişkisi
ve olay türü filtreleri aynı yıl sorgusunda uygulanır. **Ayarlar ve gizlilik**
hareket azaltma, saklama hatası/retry ve yalnız tercihleri sıfırlamayı sunar;
yıl/kamera/yer imleri korunur. Kaynak/atıf tüm katmanlar kapalıyken de açıktır.
Mevcut pilotta yıllık destekli bağımsız yer etiketi yoktur; modern adlar eklenmedi.
Yeni veri/paket yok.214 ana+4 worker ve JS export PASS; gerçek browser/Android
kabulü açık. [Kullanım/tercihler](docs/layers-settings.md), [rapor](docs/reports/phase-14.md).
Faz15 genişletmesi yukarıdadır.

**Faz 13: ortak arama, açık tarih geçişi, yer imleri ve paylaşım hazır.**
Üstte **Hastings**, **Gogh**, **Alaska**, **Vestfalya** veya **İmparatorluğu**
arayın. Sonucu seçmek yılı/kamerayı değiştirmez; **İlgili tarihe git** ve ardından
**Kaynaklı coğrafyaya odaklan** kullanılır. Kaynak konumu olmayan kayda marker yok.
**Yer imleri** panelinden yıl, seçili varlık veya kamera kaydedilir; web yerel
profilde, Android uygulama özel dosyasında kalır. **Görünümü paylaş**, whitelist
parametreli URL veya Android `tarihatlasi:///` linki üretir; alıcı önce inceleyip
uygular. Yeni hesap, sunucu, arama API'si veya tarihî veri eklenmedi.
Expo SDK57 korunur; kurulu `expo-file-system57.0.7` doğrudan sabitlendi.
[Arama/yer imi/link rehberi](docs/discovery.md), [Faz 13 raporu](docs/reports/phase-13.md).
Gerçek browser/Android kabulü açık; **UNVERIFIED ON DEVICE**. Faz14 genişletmesi yukarıdadır.

**Faz 12: doğrulanmış Wikipedia bağlantıları ve ortak kaynak/belirsizlik panelleri hazır.**
Kişi kartında **Vincent van Gogh**, olay kartında **Hastings Muharebesi** için
**Wikipedia’da aç (TR)** görünür. **Kaynakları gör**, revizyon/atıf/lisans/ham SHA ve
iddia locator'larını; **Veri belirsizliği**, zaman ve güven açıklamalarını açar.
Dil seçimi TR → EN → Wikidata; incelenmemiş bağlantı ile dil yokluğu ayrıdır.
Harita/yıl değişimi canlı Wikimedia isteği yapmaz; sürümlü küçük offline katalog.
`npm run sitelinks:check` kalite kapısına eklendi. Yeni paket, makale veya görsel yok.
[Kaynak/yenileme ve güvenlik rehberi](docs/sources.md), [Faz 12 raporu](docs/reports/phase-12.md).
Gerçek browser/Android dönüş testi açık; **UNVERIFIED ON DEVICE**. Faz 13 arama/yer imi/paylaşım genişletmesi yukarıdadır.

**Faz 11: savaş, muharebe, antlaşma ve olay modeli; bağımsız katmanlar ve yıl listesi hazır.**
Dar pilotta **4 olay / 1 yaklaşık harita noktası** var. `npm run web` sonrasında
**1066 muharebe örneğini göster** → ⚔ işaretinden Hastings kaynak kartını açın.
**Bu yılın savaş ve olayları** listesi doğrulanmış geometrisi olmayan kayıtları
da gösterir: MÖ 431–404 savaş, 1648 antlaşma ve 1989–1990 süreç örneği.
Nokta bütün muharebe alanı değildir; gün/takvim hassasiyeti kaynakta korunur.
[Kullanım/model ve kaynaklar](docs/events.md), [Faz 11 raporu](docs/reports/phase-11.md).
Gerçek browser/Android kabulü açık; **UNVERIFIED ON DEVICE**. Faz 12 bağlantı/kaynak genişletmesi yukarıdadır.

**Faz 10: kişi profili, ayrı yaşam/konum sorguları, kişi araması/kartı ve kümelenen işaretler eklendi.**
Faz16 incelemesiyle bu pilotun konum iddiası haritadan askıya alındı.
`Gogh` araması veya **Kişi kataloğu** ile profili/kaynakları açın; inceleme uyarısı
ve kurumsal referans bağlantısı görünür. Yaklaşık tercih de markerı geri açmaz.
[Kişi modeli/ETL](docs/persons.md), [güncel kaynak incelemesi](docs/historical-accuracy-audit.md).
[Faz10 raporu](docs/reports/phase-10.md) önceki teslimin tarihî kaydıdır.

**Faz 09: ayrı kültür/medeniyet modeli, yumuşak katman/lejant ve kültür kartı hazır.**
Örtüşen kültür/siyasi kayıtların tümüne sayfalı seçimle erişim; bağımsız katmanlar,
belirsizlik ve çağdaş kıyı tabanı uyarısı eklendi. Gerçek kültür geometrisi **0**;
doğrulanmış pilot ve gerçek platform kabulü **BLOCKED**. Sentetik alanlar yalnız
testtedir. [Kültürel katman](docs/cultural-layer.md), [Faz 09 raporu](docs/reports/phase-09.md).

Faz 08: kaynaklı siyasi kart, sınıflandırma, seçim/vurgu ve kamera kodu hazır.
Tam tarihî devlet polygonu edinme/inceleme kabulü **BLOCKED**; katalog hâlâ
yalnız bir gerçek antlaşma sınır kesiti içerir. Yeni siyasi alan uydurulmadı.
[Siyasi katman rehberi](docs/political-layer.md), [Faz 08 raporu](docs/reports/phase-08.md).
Gerçek tarayıcı ve fiziksel Android doğrulaması açık; Faz 12 bağlantı/kaynak genişletmesi yukarıdadır.

Faz 07: sürüklenebilir tarih çizelgesi, MÖ/MS girişi ve oynatma hazır.
[Kullanım/state rehberi](docs/playback.md), [Faz 07 raporu](docs/reports/phase-07.md).
Yeni arayüzün gerçek tarayıcı ve fiziksel Android kabulü açık.

Faz 06 zaman motoru, MÖ/MS hesapları ve açık snapshot önizlemesi korunur.
[Zaman motoru rehberi](docs/timeline.md), [Faz 06 raporu](docs/reports/phase-06.md).
Seçilebilir aralık MÖ 2000–sistemin güncel yılıdır; gerçek kapsam ayrı raporlanır.
Kaynak yılı önizlemesi yalnız açık seçimle açılır ve başka yıla geçince kapanır.

Faz 05 pilotunun çizgi seçimi ve yıl filtresi USER-REPORTED PASS.
Kullanıcı çizgiden kaynak kartını açtı, başka yılda kaybolup kaynak tarihine dönünce
geri geldiğini bildirdi. Platform web denemesi bağlamından alınmıştır; otomatik
tarayıcı ve fiziksel Android kapıları açıktır.
**Faz 05 tesliminde 1 antlaşma sınır kesiti**, 6 toplam katalog kaydı (Faz 10 ile 11 kayıt / 1 kişi / 1 kişi konumu); tam devlet ve kültür poligonu 0.
Örnek NARA 1867 Alaska Antlaşması'nın 141°B ideal meridyen tanımından türetildi;
yalnız 20 Haziran 1867 snapshot'ı, ölçülmüş WGS84 sınırı değildir. Başka yıllara
uzatılmaz. [Veri kalitesi](docs/data-quality.md), [Faz 05 raporu](docs/reports/phase-05.md).
Ortak tipler/ETL artık şema v2; v1 sessizce çevrilmez.
[Model/ETL rehberi](docs/data-model.md), [önceki Faz 04](docs/reports/phase-04.md).
Faz 03 kaynak arayüz hazır — platform kabulü BLOCKED.
Harita odaklı responsive ana ekran, arama/katman/tarih kontrolleri ve modal bilgi
paneli eklendi. [Arayüz akışları](docs/interface.md), [Faz 03 raporu](docs/reports/phase-03.md).
Faz 02 web/Android çalışma kanıtı henüz tamamlanmadı.
Kilitli kurulum **23/23** eşleşiyor; fiziksel kara, worker ve lisans bildirimleri
hazır. Tam lint/typecheck, zaman motoru ve önceki regresyon testleri, asset bütünlüğü ve gerçek fiziksel veriyle web/Android
JavaScript dışa aktarımı geçti. Kullanıcı web'de sürükleme/reset/işaret → bilgi
panelini çalışır bildirdi; otomatik tarayıcı/Android cihaz kabulü ve güvenlik
audit bulguları açık. [Güncel takip](docs/reports/phase-02-marker-occlusion.md).

## Sürüm ve paket yöneticisi

Resmi [Expo kurulum](https://docs.expo.dev/get-started/create-a-project/) ve
[Router kurulum](https://docs.expo.dev/router/installation/) belgeleri incelendi.
Hedef set, resmi SDK 57 şablonu ve SDK eşleme dosyasına dayanır:

| Paket                           | Manifestte hedeflenen sürüm |
| ------------------------------- | --------------------------- |
| Expo / Router                   | 57.0.29 / 57.0.28           |
| React / React DOM               | 19.2.3 / 19.2.3             |
| React Native / React Native Web | 0.86.3 / 0.21.2             |
| TypeScript                      | 6.0.3, strict               |
| MapLibre GL JS / RN WebView     | 6.14.0 / 13.16.1            |

Kurulum sonrası bütün doğrudan hedefler yerel paketlerden doğrulandı; kurulu
Reanimated 4.5.1 / Worklets 0.10.1 SDK setiyle eşleşiyor.
[Sürüm kanıtı ve kalan kontroller](docs/setup.md). Bağımsız en son React Native
sürümü Expo'ya zorlanmaz; uyumlu SDK seti kullanılır.

**npm 12.2.0** seçildi: ortamda mevcut, tek uygulama için ek paket yöneticisi ve
workspace çözümü gerekmiyor. `packageManager`, `.npmrc` ve tam doğrudan sürümler
tanımlı. Tekrarlanabilir transitif kurulum için **package-lock.json zorunlu**;
sadece bu tam sürümler yeterli değil. Yarn/pnpm lock dosyası üretilmez.

Geliştirici ve CI tabanı Node **24 LTS** (`.nvmrc`); bu oturum Node 26.11.1 ve
npm 12.2.0 ile bağımsız kontroller yaptı. Node 24'te bu ortamda çalıştırılmadı.

## Kurulum

Linux/CachyOS desteklenir. Nvm zaten kuruluysa:

```sh
nvm install
nvm use
npm install --global npm@12.2.0
```

Nvm kullanmıyorsanız Node 24 LTS'yi kendi sürüm yöneticiniz veya resmi Node.js
dağıtımıyla kurun; CachyOS'un sistem Node paketi farklı major sürüm olabilir.
Sürüm değiştirdikten sonra `node --version` ve `npm --version` kontrol edin.

Kilit dosyası artık npm tarafından üretilmiştir. Registry erişimi olan ortamda
aşağıdaki komutlarla kilitli native sürümleri kurup kalan kapıları kontrol edin:

```sh
npm ci
npx expo install --check
npm run dependencies:report
npm run globe:prepare
npm run pilot:prepare
npm run timeline:coverage
npm run format
npm run check
npm run web:export
npm run android:bundle
```

MapLibre/WebView hedefleri için [resmi karar ve uyumluluk sınırları](docs/adr/0001-globe-engine.md)
ile [asset hazırlığı](docs/globe-prototype.md) okunmalı. `globe:prepare` yalnız izinli
Natural Earth ve kurulu worker/Notice dosyalarını hazırlar. Üretilen hash/lisans/boyut
kayıtlarını inceleyin; generated modüller artık doğrulanmış gerçek fiziksel varlıkları içeriyor.

Lock dosyası, test sonuçları ve hak kayıtları aynı değişikliğe eklenmeden Faz 01
kapatılmaz. Sonraki bütün geliştiriciler ve CI, kurulumda `npm ci` kullanır.
Kurulum başarısızlığında lock dosyası elle doldurulmaz; başka projenin lock veya
node_modules dizini bu projeye kopyalanmaz.

Ortam dosyası gerekmez. İsterseniz `cp env.example .env` ile açıklama şablonunu
alabilirsiniz; gerçek anahtar eklemeyin. `.env` dosyaları Git dışındadır.

## Web

Kurulum kapısı kapandıktan sonra:

```sh
npm run web -- --host localhost --port 8081
```

Tarayıcıda `http://localhost:8081` açılır. Hazırlama başarılıysa koyu fiziksel
kara-deniz tabanlı gerçek küre, 0,0'da açıkça sentetik ◎ işaret ve kamera sıfırlama
beklenir. Kaynaklar eksikse veya WebGL2 yoksa Türkçe açıklama/haritasız fallback
vardır; fallback küre kabulünü karşılamaz. Kullanıcı web açılışını ve
sürükleme/reset/işaret → paneli çalışır bildirdi; otomatik smoke henüz geçmedi.
İşaretin arka yüzde görünmesi düzeltildi; kullanıcı tekrar deneyerek gizlendiğini doğruladı.
Taban Natural Earth 1:110 milyon fiziksel kara/kıyıdır; ülke sınırı içermez ve
nihai harita ayrıntısı değildir. Bu güncel fiziksel referans tarihî kıyı iddiası taşımaz.

```sh
npm run web:export
npx playwright install chromium
npm run test:web
```

Web smoke testi iki ekran genişliğinde gerçek Expo geliştirme sunucusunu açar;
ayrı bir sahte HTML önizlemesi kullanmaz. Gerçek canvas/globe yüklenmesi,
marker→React, drag/wheel/reset, context loss/retry, WebGL yokluğu, yeniden mount,
Türkçe not-found ve taşma senaryoları vardır. Hazırlık ve paket kurulumu olmadan
başarı beklenmez; testler burada çalıştırılamadı. Android dokunma/geri/çevrimdışı
release testleri web testinin yerine geçirilmez.

## Android / Linux / CachyOS

Android Studio'nun resmi Linux dağıtımını kurun. SDK Manager'da seçilen Expo/RN
sürümünün gerektirdiği platform/build-tools ile platform-tools'u kurun. SDK 57
belgesindeki compile/target API **36**'dır; `expo prebuild` sonrasında üretilen
Gradle ayarlarını ayrıca kontrol edin. JDK **17**, resmi React Native ortam
kılavuzunun önerdiği başlangıçtır. Bu ortamda sistem paketleri yüklenmedi.

SDK'yi varsayılan dizine kurduysanız bash için aşağıdaki yolları kendi kurulumunuza
göre ayarlayın; mevcut sistem değişkenlerini farklı amaçlarla kullanmayın:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
java -version
adb version
npm run environment:check
```

Fiziksel cihazda geliştirici seçenekleri ve USB hata ayıklamayı açın, veri aktarabilen
USB kablosuyla bağlayın, telefondaki RSA yetkisini onaylayın:

```sh
adb devices -l
npm run android:device
```

`unauthorized` için telefondaki onayı kontrol edin; boş liste için kablo, USB modu
ve Linux udev/cihaz erişim kurallarını inceleyin. Normal geliştirmede `sudo adb`
çözümü kullanmayın. CachyOS/Arch sistem paketleri ve udev kuralları dağıtımın
güncel yönergelerine göre ayarlanmalı; bu projeye özel sistem yapılandırması
otomatik değiştirilmez. Emülatörde de `npm run android` kullanılabilir.

Yerel ilk APK derlemesi:

```sh
npx expo prebuild --platform android --no-install
cd android
./gradlew assembleDebug
```

`android/` Expo'nun ürettiği yerel çıktıdır ve Git dışında tutulur. Kaynak ayarlar
`app.json` ve config plugin'lerindedir. `npm run android:bundle` yalnız Android
JavaScript/asset export'udur; **APK, Gradle veya gerçek cihaz doğrulaması değildir**.
Yerel derleme veya Metro için Expo hesabı/EAS zorunlu değildir.

Resmi kaynaklar: [Expo Android ortamı](https://docs.expo.dev/workflow/android-studio-emulator/),
[React Native ortamı](https://reactnative.dev/docs/set-up-your-environment),
[USB cihaz kurulumu](https://developer.android.com/studio/run/device),
[Expo yerel derleme](https://docs.expo.dev/guides/local-app-development/).
Bu komutlar resmi CLI akışına göre yazıldı; hedef paketler kurulamadığı için
projedeki native derleme ve cihaz açılışı henüz doğrulanmadı.

## Kontroller

```sh
npm test
npm run lint
npm run typecheck
npm run format:check
npm run config:check
npm run qa:coverage
npm run qa:licenses
npm run qa:security
npm run check
```

`npm test`, Node'un yerleşik test runner'ıyla zaman motoru, oynatma ve önceki senaryolarda katalog/gerçek pilot, Türkçe katalog,
tema, kamera/köprü/navigasyon, fiziksel poligon validator, cleanup scope,
tarihî alan modeli, üretim lisans/provenance kapısı, topoloji, ETL ve veri indekslerini
denetler; npm paket kurulumu gerektirmez. Jest
eklenmedi. React Native bileşenleri için native test kapsamı henüz yoktur.
`typecheck`, native ve web modül çözümlemesini ayrı kontrol eder. Typed i18n negatif
testleri de typecheck kapsamındadır. ESLint ve formatter birbirinden bağımsızdır.
`docs/` ve `AGENTS.md` formatter dışında tutularak tarihî faz raporları korunur.

GitHub Actions'ta bağımsız unit işi ve lock → npm ci → lint/typecheck/test/format →
asset hazırlığı → web/Android JS export → web smoke işi hazırlandı. Lock eksikken kalite işi kasıtlı
olarak başarısız olur; yeşil CI iddiası yok. Workflow GitHub'da çalıştırılmadı.

## Repo düzeni

```text
src/app/            Expo Router yolları ve hata sınırı
src/ui/             Küçük ortak erişilebilir UI bileşenleri
src/atlas/          Responsive ana ekran, panel/katman/tarih sunumu
src/theme/          Koyu tema ve sistem tipografisi tokenları
src/i18n/           Türkçe katalog ve derleme zamanında anahtar kontrolü
src/domain/         Ortak kaynaklı tarihî alan modeli ve doğrulayıcılar
src/timeline/       Zaman motoru, oynatma store, yıl/slider hesapları ve iptal
src/data/           Kaynak politikası, statik pilot, ortak veri sağlayıcı ve indeksler
src/map/            MapViewport.web.tsx ve MapViewport.native.tsx
src/map-contract/   Tiplendirilmiş kamera, v1 mesaj şeması ve URL politikası
scripts/etl/        Gelecek veri hazırlama işlerinin ayrılmış alanı
tests/              Unit, tip ve web smoke kontrolleri
docs/               Araştırma, kararlar, lisanslar ve faz raporları
```

Tek uygulama/tek package.json var. `apps/expo` ve ayrı workspace paketlerinin
eklenmemesi bilinçli bir sadeleştirmedir; [ADR-0004](docs/adr/0004-project-foundation.md).

## Ortam değişkenleri ve veri hakları

Expo `EXPO_PUBLIC_*` değerlerini istemci bundle'ına gömer; public değer **gizli
değildir**. Secret'lar .env'de public prefix taşımamaları nedeniyle tek başına
güvende sayılmaz: app config `extra`, log, kaynak kodu veya istemciye dönen yanıt
üzerinden de sızabilirler. Secret'lar yalnız ileride gerekirse ETL/CI süreçlerinde,
secret deposunda tutulur ve istemciye aktarılmaz. `env.example` anahtar içermez.
[Resmi Expo açıklaması](https://docs.expo.dev/guides/environment-variables/).

Bu sürüm API anahtarı veya harici canlı tarih servisi kullanmaz; aynı yayın
kaynağındaki doğrulanmış veri parçalarını yükleyebilir. Natural Earth yalnız hazırlık
betiğinde alınır; runtime tile/CDN bağımlılığı yoktur. Harita worker/Notice/GeoJSON
yerel modülleri ve Expo DOM export'u release uçak modunda henüz sınanmadı. Kişi konumu
üretilmedi; tarihî geometri yalnız kaynaklı ideal antlaşma kesitidir. Diğer veri/lisans
engelleri [sicilde](docs/license-register.md) geçerlidir.
İkon sistemi metin glifleri, tipografi cihazın sistem fontudur; dış görsel/tile eklenmedi; Router'ın transitif Material Symbols fontu export'ta vardır. [Üçüncü taraf kayıtları](THIRD_PARTY_NOTICES.md).

## Sorun giderme

- `EAI_AGAIN` / `ENOTCACHED`: registry/DNS veya önbellek eksiktir. Önce erişimi
  düzeltin; TLS denetimini kapatmayın, farklı eski SDK'ya sessizce geçmeyin.
- `expo` / `eslint` / `tsc` bulunamıyor: paket kurulumu tamamlanmamıştır; bu durum
  uygulamanın test edildiği anlamına gelmez.
- Metro cache sorunu: kurulum sağlandıktan sonra `npm start -- --clear`.
- Port çakışması: `npm run web -- --port 8082`; web smoke varsayılan olarak 8081
  kullandığı için testten önce o portu serbest bırakın.
- Android SDK bulunamıyor: `ANDROID_HOME`, JDK ve PATH'i kontrol edin. `adb devices`
  çıktısı uygulamanın kurulduğunu/açıldığını kanıtlamaz; ikisini ayrı raporlayın.
- Küre kaynakları eksik: kurulumdan sonra `npm run globe:prepare`; hash/lisansları
  inceleyin. Null generated dosyaların yerini gerçek hazırlık çıktısı almalı.
- WebGL2/context/worker sorunu: hata açıklamasını kaydedin; cihaz/WebView/GPU ve
  release/dev ayrımını [test raporuna](docs/reports/phase-02-device.md) ekleyin.
  Renderer, file-origin veya worker sorununu CDN'le gizlemeyin.

Faz00–16 açık kullanıcı istekleriyle yetkilendirildi; önceki Android/UI kabul kapıları
korunur. Faz17 kullanıcı isteği olmadan başlatılmaz.
[Güncel durum](docs/progress.md), [köprü/URL/CSP sınırları](docs/globe-prototype.md).

Faz 03 UI/görsel senaryoları `tests/web/atlas.spec.ts` içindedir. Snapshot baseline
bu ortamda oluşturulmadı; kurulum sonrası `npm run test:web -- tests/web/atlas.spec.ts --update-snapshots` ile üretip insan incelemesinden geçirin ve ardından normal testi
çalıştırın. Yerel ortak arama etkindir. Devlet katmanında tek tarihli bir pilot
kesit vardır; gerçek kültür polygonu yoktur; kişi profili ve dört olay kaydı vardır. Yıl seçimi artık bu pilotu filtreler.

Faz 02 onarımı: renderer load/marker/context temizliği ve worker kontrolü için
[inceleme ve önce/sonra testleri](docs/reports/phase-02-repair.md) eklendi. Normal
kurulumda `npm run test:worker` gerçek TypeScript parser'ıyla ek üç regresyonu
çalıştırır; `npm run check` bunu içerir. Hazırlama için dev bağımlılıklar gerekir.
Bu eski incelemedeki kurulum engeli sonradan kullanıcı terminalinde aşıldı;
güncel web denemesi ve açık Android kapısı [son takipte](docs/reports/phase-02-marker-occlusion.md).

`npm run globe:check` ham kaynak ve bundle geometri/worker hash'lerini, sürümleri
ve paketlenen telif bildirimlerini kontrol eder; genel check içine dahildir.
Hazırlama TS dosyalarını otomatik biçimler. [Audit incelemesi](docs/security-review.md)
açık riskleri ve zorunlu olmayan SDK downgrade önerilerinin neden uygulanmadığını kaydeder.

## Yerel tarihî veri doğrulama

```sh
npm run etl -- validate --input data/staging/catalog.json
npm run etl -- build --input data/staging/catalog.json --output /tmp/tarih-atlasi-phase04-empty
```

Örnek zarf boştur; sentetik test verileri ürüne girmez. `validate` üretim onayı
vermez; `build` lisans/atıf/inceleme/ham hash kapılarını da uygular. Raw, staging ve
version/hash üretim dizinleri ayrıdır. CLI indirme, yayın veya uygulamaya otomatik
veri ekleme yapmaz. Hatalı aday bütün olarak reddedilir.
[Şema ve kaynak değişikliklerinin denetlenmesi](docs/data-model.md).

## Kaynaklı sınır pilotunu deneme

```sh
npm run pilot:prepare
npm run pilot:check
npm run web
```

“1867 sınır örneğini göster” yılı ve devlet görünürlüğünü seçer; kamera korunur.
“Kaynaklı örneğe odaklan” ayrı ve isteğe bağlı kamera eylemidir. Kesikli
çizgiye tıklayınca kaynak/snapshot/hassasiyet kartı açılmalı. “Pilotun kaynak ve
kapsamı” düğmesi aynı bilgiye haritasız erişim verir. Devlet katmanını kapatınca
kesit gizlenmeli; 1868 veya başka yılda çizilmemeli. Kullanıcı Faz 05 çizgi/kart/yıl geri dönüşünü başarılı bildirdi. Yeni Faz 07
çizelge/oynatma/ayrı odaklanma akışı bu eski testle doğrulanmış sayılmaz.

Paket data/pilot/production altında: 2/7 konumlu GeoJSON LOD, canonical katalog,
kapsam/byte/SHA/zaman manifesti ve NOTICE. `pilot:check` kaynak çıkarımı ve generated
modülü birlikte doğrular. Veri CC0, kod MIT ayrıdır. Fotoğraf/tam GIS polygon yok.

OHM için isteğe bağlı **karantina** alımı:

```sh
npm run ohm:collect -- --relation 2692735
```

Bu komut bütün üyelerin lisans/tarih etiketlerini korur, üretime geometri eklemez.
Bu ortamda EAI_AGAIN; örnek San Marino kaydının sınır kaynağı da inceleme bekliyor.
[Yöntem ve eksikler](docs/data-quality.md). Historical Basemaps dağıtım engeli sürer.

## Çizelge ve oynatma

Yıl düğmesi panelinde `MÖ 44` / `MS 1867` girin. Slider için tüm tarih, 200 ve
20 yıllık ölçekler; önceki/sonraki, ±10/100, başlangıç ve günümüz kontrolleri vardır.
Dar ekranda alt ek kontroller yatay kaydırılır. Oynatma 1/10/100 yıl/adım ve
manuel yıl hareketinde durma kuralına sahiptir. Reduced motion tercihinde
veri adımı saniyede bire iner; kamera tarih değişiminden etkilenmez.
Kaynak yılı/kapsam ve ortak katman sorgu yılı bilgi panellerinde ayrı gösterilir.

```sh
npm run test:web -- tests/web/playback.spec.ts
```

Buradaki otomasyon yerel socket EPERM nedeniyle çalışmadı; gerçek web/Android
etkileşim, TalkBack ve FPS/bellek doğrulaması yapılmış sayılmaz.
[Detaylı davranış ve test planı](docs/playback.md).
