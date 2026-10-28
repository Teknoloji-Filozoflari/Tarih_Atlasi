# Katmanlar, filtreler, lejant ve ayarlar — Faz 14

**Faz16 güncel:** kişi pilot noktası kaynak incelemesi nedeniyle yaklaşık
tercihte de görünmez; profil/kaynaklar erişilebilir. Ayarlar ve Hakkında'ya
[gizlilik politikası](privacy-policy.md) eklendi. [Faz16](reports/phase-16.md).
Aşağıdaki model/filtre davranışı değişmedi; eski kişi geometri örneği askıdadır.

**TA-3 (28 Ekim 2026):** `atlas.layers.help` ve `atlas.attribution.status` güncel
katalog kapsamına hizalandı. Yardım metni artık diğer katmanları “boş” saymaz;
Devlet’te kaynaklı dünya siyasi rekonstrüksiyonları + antlaşma kesiti, kişi ve
savaş/olayda kaynaklı (çoğu konumsuz) katalog, kültür alanında doğrulanmış veri
yokluğu ve güncel şehirlerin tarihî kanıt olmadığı açıkça belirtilir. Sayı
uydurulmaz.

Katmanlar panelinde Devlet, Kültür, Kişi, Savaş, Olay ve Tarihî yer / isimler ayrı
anahtarlardır. İlk beşinin geometrisi bağımsızdır. Ad etiketleri ilgili siyasi/
kültürel katmanın da açık olmasını ister; etiketleri kapatmak geometriyi kapatmaz.
Yer katmanı yalnız kendi tarih ve coğrafya kanıtı olan `place` kayıtlarını kabul
eder. Üretim pilotunda **yıllık destekli yer etiketi 0**: Maison Van Gogh'nun
modern bina koordinatı veya adı tarih boyunca geçerli bir yer adına çevrilmez.

Katman veya filtre değişimi seçilen yılı/kamerayı değiştirmez. Yıl değiştiğinde
aynı tercihler uygulanır; kaynak snapshot başka yıla taşınmaz. Önizleme ancak açık
istekle ve filtreye uyan kaynak yılı sürekli görünerek çalışır. Arama katalog
çapındadır; bir kaydın aranabilir olması mevcut filtrede haritada çizildiği
anlamına gelmez. Filtreye uymayan arama sonucunda odak kapalıdır. Uyan sonuca
bilinçli odak isteği ilgili ana katmanı açabilir; yaklaşık kişi seçeneği ayrıca
etiketli bir tercihtir. Kaynak/atıf paneli tüm katmanlar kapalıyken de açıktır.

## Filtre anlamları

| Filtre | Davranış |
| --- | --- |
| Yalnız kesin destekli coğrafya | Mevcut engine `exact verified` değerlendirmesi; yaklaşık geometri/tarih, kültür alanı ve daha düşük kayıt güvenini kesinleştirmez, gizler. Kapalı olması doğrulanmamış veri izni değildir |
| Kayıt güveni | `all/high/medium/low/unknown`, eşitlik; claim/kayıt düzeyidir, kaynak kurumunun bütünü için puan değildir |
| Siyasi oluşum türü | `all/POLITY/KINGDOM/EMPIRE`; tarihli, kaynaklı sınıflandırma. Bir kaydın birden çok sınıfı varsa tek geometrisi ilgili sınıflarla eşleşir |
| Kişi–yer ilişkisi | Doğum, ölüm, ikamet, faaliyet, hükümranlık, belgelenmiş olay; sadece kişi konumu kaydına uygulanır. Biyografik ilişkiyi yıllık kanıta dönüştürmez |
| Olay türü | Muharebe, savaş, antlaşma, kuruluş, dağılma, kültürel olay, diğer; yalnız olay kayıtlarına uygulanır. Savaş katmanı kapalıyken diğer olaylar korunur |

Varsayılan tüm doğrulanmış tür/güven düzeyleri, altı katman açık, yaklaşık kişi
opt-in kapalı. Filtre açmak yeni veri getirmez. Mevcut gerçek pilotun coğrafi
örnekleri yaklaşık olduğundan kesin destek seçimi bunları gizleyebilir. Konumsuz
olaylar uygun filtreyle yıl listesinde kalır; haritaya nokta eklenmez.

## Ortak sorgu ve tutarlılık

`preferences/model.ts` strict `HistoricalFilters` ve version1 tercih şemasını
barındırır. CoverageOptions, snapshot seçimi, coverage ve renderer feature loader
aynı `matchesHistoricalFilters` kuralını kullanır. Zaman frame olay listesini de
aynı kuralla daraltır. Ana kişi kartı görünür konum kimliklerini frame'den alır;
filtrelenen ilişkiler kaynak bilgisiyle ayrı listede kalır ve haritada oldukları
iddia edilmez. Kültür/siyaset/seçim listesi coverage'dan türetilir.

`TimelineStore.configure` katman/filtre/kişi opt-in değişimini tek revision ile
uygular, eski sorguyu iptal eder, oynatmayı durdurur. Hook konfigürasyonun henüz
uygulanmadığı render'da eski frame'i göstermeyip loading/suspend gönderir.
Renderer `catalog.view` zarfında optional strict `filters/labels/sparseLabels`
alır; v1 ve4096 UTF-8 byte sınırı korunur. Aynı revision/selectedYear/sourceYear/
coverageStatus/katalog ACK kapısı geçerlidir. Kamera komutu üretilmez. Gerçek
WebView raw taşıma boyutu/origin/CSP denetimi önceki açık kapıdır.

## Yoğunluk ve erişilebilirlik

Ortak LegendPanel düz/kesik siyasi sınır, yumuşak kültürel alan, savaş/antlaşma/
olay, kesin/yaklaşık kişi ve tarihsiz biyografik bağın farkını metin+biçimle
anlatır. Renk tek anlam değildir. Tam ölçülmüş sınır ile kaynakta belgelenmiş
sınır eşit sayılmaz; kayıt hassasiyeti ve kaynak kartı ayrıca okunmalıdır.

Kişi ve olaylar mevcut bounded clustering ile her biri en çok64 DOM kümede,
örtüşme seçimleri8/sayfa ve1000 ID üst sınırında kalır. Kültür dolgusu örtüşme
sayısına göre azalır; kültürler veri hatası diye elenmez. Seyrek etiket modu en
çok8 siyasi/kültürel/yer adı bırakır; geometriler ve marker kayıtları düşmez.
Kullanıcı katman/tür/güven filtresiyle yoğunluğu ayrıca azaltabilir. Bu bütçeler
Android FPS/bellek ölçümü değildir.

Kontroller48px minimum satır/Action, switch hitSlop, Türkçe erişilebilir ad ve
seçili/devre dışı durum taşır. Uzun metin sarılır; tema tokenları ve mevcut
4.5:1 katman simgesi kontrast testleri kullanılır. Panel mevcut modal/odak/Escape
ve SafeArea akışını korur. Sistem reduced motion her zaman üstündür; kullanıcı
isterse ayrıca azaltabilir. Koyu tema ve Türkçe sabit metindir; çalışmayan tema,
dil veya hata gönderme butonu yoktur. Gerçek TalkBack/dokunma/metin ölçeği kabulü
**UNVERIFIED ON DEVICE**; browser senaryoları çalıştırılmadan PASS sayılmaz.

## Depolama, gizlilik ve hata

Web anahtarı `tarihatlasi.preferences.v1`; Android uygulama özel documents dosyası
`atlas-preferences-v1.json`. Expo57'de önceden kurulu MIT FileSystem legacy
adaptörü yeniden kullanılır. Yer imlerinin anahtarı/dosyası ayrıdır. Tercih
şeması dil=`tr`, tema=`dark`,6 boolean, filtreler, yaklaşık kişi opt-in, motion ve
seyrek etiket içerir. **Yıl/kamera/arama/link/anahtar kaydedilmez**. Yer imleri ve
paylaşım sözleşmesi değişmez; tüm uygulama durumunu otomatik geri yükleme yoktur.

4096 UTF-8 byte sınırı, sabit dosya adı, strict alan/sürüm kontrolü, immutable
snapshot ve seri temp-write+rename kullanılır. Okuma tamamlanmadan değişiklik
kaydedilmez. Bozuk/eski sürüm kayıt korunur, kontroller kapanır; kullanıcı tekrar
okuyabilir veya yalnız tercihleri açıkça sıfırlayabilir. Yazma hatasında oturum
tercihi uygulanır ama saklanmadığı söylenir; retry aynı güncel tercihi yazar.
Sıfırlama yıl/kamera/yer imlerini silmez. Birden çok sekmenin eşzamanlı tercihi
son yazanla sonuçlanır; cross-tab senkronizasyon bu fazda yoktur. Uygulama verisi
silme/tarayıcı profili değiştirme tercihleri kaldırır; hesap/cloud yoktur.

Arama analitiği ve otomatik hata bildirimi yok. Ayarlar gerçek durum ve hata
bildirirken paylaşılabilecek sürüm/tekrarlama bilgilerini metinle açıklar.
Atıf kontrolü katmandan bağımsızdır. Harita stil guard'ı yalnız iki inline GeoJSON
kaynağı, açıkça izinli katman ID'leri ve yazısız fiziksel özellikleri kabul eder;
symbol/glyph/sprite/modern ülke kaynağı eklenirse hata verir. Kaynaklı tarihî
etiketler yerel DOM'dan gelir; dış tile/demo servisi yoktur. Guard geometrinin
tarihsel doğruluğunu tek başına kanıtlamaz; ETL/lisans/zaman kapıları ayrıca sürer.

[Faz raporu ve açık platform kapıları](reports/phase-14.md).
