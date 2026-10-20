# Ortak arama, kamera, yer imleri ve paylaşım

2026-10-16 · Faz 13 · [ADR-0014](adr/0014-discovery-saved-views.md).

## Arama ve tarih seçimi

Üstteki arama alanından devlet, kültür, kişi, savaş/muharebe ve olay/antlaşma
bulunabilir. Arama panelinde aynı sorgu düzenlenebilir; sonuçlar beş grupta
sekizer kayıt olarak gösterilir. Kaynak adları, alternatif yazımlar, dönem ve
kapsam uyarısı korunur. Eş adlı kayıtlar birleştirilmez; kimlikleri ve dönemleri
ayrıdır. Arama sonucu seçmek **yılı veya kamerayı değiştirmez**.

**Seçili yılda kal** mevcut yılı korur ve oynatmayı durdurur. **İlgili tarihe
git** yalnız kullanıcı basınca kaynaklı dönemin uygun yılına geçer. Kamera ayrıca
**Kaynaklı coğrafyaya odaklan** ile hareket eder. Gösterilebilir konum yoksa
odak yoktur; tarihli ama konumsuz olayın kartına yine ulaşılır. Katman kapalıysa
odak isteği ilgili katmanı açar ve doğru yılın frame/renderer ACK'sini bekler.
Yeni yıl eski bekleyen odağı geçersiz kılar; gecikmiş bir sonuç başka yıla uçamaz.

Kişi yaşam dönemi konum kanıtı değildir. Van Gogh araması1885'te yaşam kaydını
bulur fakat nokta üretmez. İlgili kaynaklı konum dönemi1879–1880'dir;2026/1885'ten
önerilen yıl1880 olur. Bu tarihe geçiş yaklaşık kayıtları açacağını açıkça söyler.
Diğer biyografik veya tarihsiz bağlantılar yıllık konum adayına çevrilmez.
Konumsuz Vestfalya antlaşması1648'e götürülebilir, ama haritada nokta yoktur.
Hastings yalnız1066'da kaynaklı yaklaşık referans noktası taşır;1067'ye yayılmaz.

`src/discovery/search.ts` katalog sürümüne bağlı yerel indekstir. En çok1000
kayıt; canonical kişi ve olay kimlikleri kullanılır, onların yardımcı entity
kayıtları yinelenmez. Her giriş id/group/type, Türkçe tercihli/özgün ad/dil,
alternatifler, TemporalExtent, QID, coğrafi aday ID'leri ve kaynak bbox'larını taşır.
Geometri adları da bulunabilir; örneğin Alaska antlaşma kesiti ilgili siyasi
kimliğe eriştirir. Bu, tüm ülkeye kaynaklı geometri sağlandığı anlamına gelmez.

Normalleştirme İ/I/ı → i, NFKD ve combining mark kaldırma, küçük harf ve sözcük
ayırma uygular; Ş/ş,Ğ/ğ ve aksanlı aramalar eşleşir. Özgün adlar değiştirilmez,
transliterasyon/çeviri veya yeni tarihî eşanlamlı uydurulmaz. Farklı alfabeler
kendiliğinden Latinleştirilmez. Bütün sorgu sözcükleri eşleşir; beş grup, exact
name ve stable ID ile sıralama yapılır. Sorgu120 karakter, sayfa8, debounce220ms.
AbortController timer'ı ve devam eden sonuç yayınını iptal eder; eski başarı ve
hata yeni sorgunun üstüne yazamaz. Katalog indeksinin kurulması bounded bir kopya
alır; büyük katalog için sonraki ölçümden önce parçalama/bellek stratejisi gerekir.

İlgili yıl için bütün4000 yıl taranmaz: kayıtların belgeli dönem/snapshot
adaylarından en yakın128 yıl incelenir. MÖ/MS uzaklığı astronomik yıl dönüşümüyle
hesaplanır; yıl0 üretilmez. Son coğrafya kararı mevcut TimelineEngine'den gelir;
snapshot başka yıllara taşınmaz. Bilinmeyen tarih öneri üretmez. Kesintili
dönemler ve örtüşen kültürler önceki motor kurallarıyla korunur.

## Kamera

`focusPlan` bir sunum hesabıdır, tarihî konum veya başkent iddiası değildir.
Kaynak Point için o noktaya zoom3; polygon/MultiPolygon için bounding box,
MapLibre `fitBounds` ve viewport padding uygulanır. Aynı kaynak parçasının
sürekli boylam aralığı korunur; yalnız köşelere bakıp geniş alanın küçük
tümleyenine odaklanılmaz. Antimeridyende bölünmüş parçalar için en kısa kapsayan
arc bulunur:170..180 ve-180..-170 → kamera bbox170..190. Kaynak geometri
koordinatları değiştirilmez;190 yalnız sunum bounds değeridir.

240°'den geniş boylam veya150°'den yüksek enlem kapsamı küre genel görünümüne
zoom0 gider. İnce çizgi bbox merkezine odaklanır; bu tüm siyasi alan değildir.
Çok parçalı kaynakların bütünü kapsanır; boş/aşırı detay hesabı sınırlandırılır.
Reduced motion açıkken uçuş süresi0, diğerinde700ms. Gerçek polar/sferik bbox
görünümü ve touch/GPU performansı **UNVERIFIED ON DEVICE**.

Kamera state'i merkez/zoom/bearing/pitch olarak AtlasScreen'de tutulur. Native
arka plana geçince WebView yeniden kurulabilir; son kamera yeni oturuma verilir.
`catalog.view` zarfına isteğe bağlı strict `camera` eklendi; kamera ve tarih
komutlarının React batching ile birbirini ezmesi önlenir. Mesaj hâlâ version1,
4KiB, mevcut isCamera limitleri ve oturum/requestId doğrulamasını kullanır.
Geometri, serbest URL veya JavaScript köprüden geçmez. Normal yıl değişimi kamera
alanı taşımaz. Renderer focus güncel revizyon ve görünür destekli kayıt ister;
unmount sonrası dinleyici/kaynak temizliği korunur.

## Yer imleri ve kalıcılık

**Yer imleri** panelinden yıl, seçili canonical varlık veya kamera görünümü
kaydedilir. Yıl yer imi yalnız yıl; varlık yer imi yıl+kimlik; kamera yer imi
yıl+center/zoom/bearing/pitch taşır. Geçerli kamera bildirimi yokken kamera
kaydetme kapalıdır. Varlık yokken varlık kaydı kapalıdır. Açmak önce önizleme
gösterir; **Bu görünümü uygula** tarihi ve varsa kamerayı değiştirir.

Kayıt şeması `{version:1,entries:[{id,kind,view:{year,entityId,camera}}]}`.
En çok50 yer imi,64KiB UTF-8 ve sekizer kayıt/sayfa. Yıl0, bozuk kamera, ek alan,
tekrarlı kimlik ve bilinmeyen sürüm reddedilir. Yazmalar seri yürür; disk/izin/
kota hatasında henüz yazılmamış veri başarı gibi sunulmaz. Hata sonrası önceki
committed liste korunur. Bozuk/farklı sürümde depo sessizce sıfırlanmaz; kullanıcı
yerel depoyu haricen düzeltip yeniden deneyebilir. Şema v1 için migration gerekmez;
gelecek sürüm migration'ı eski veriyi açıkça koruyarak tasarlanmalıdır.

Web `localStorage['tarihatlasi.bookmarks.v1']` kullanır. Origin/tarayıcı profili
değişirse kayıtlar paylaşılmaz; site verilerini silmek kayıtları siler. Gizli
sekme/engellenmiş depolama/kota için hata gösterilir. Birden fazla açık sekme
arasında transaction/lock yok; eşzamanlı farklı sekme yazmasında son yazma kazanır.

Android uygulamaya özel `documentDirectory/atlas-bookmarks-v1.json` kullanır;
önce `.tmp` yazılır sonra aynı dizinde rename. Orijinal dosya önceden
truncate edilmez. Rename başarısızsa eski kayıt korunur, yeni kayıt commit olmaz.
Host disk testleri bu adaptörü yeniden repository açarak test eder; bu test
Android flash/OS davranışı kanıtı değildir. Uygulama kaldırma/veri temizleme
kayıtları siler; hesap/sunucu senkronu yok. Android `allowBackup:false` ayarlandı;
işletim sistemi ve cihaz taşıma davranışı gerçek release cihazda ayrıca incelenir.

Kaydedilmiş entityId yeni katalogda yoksa **kayıt bulunamadı** açıklaması çıkar;
aynı adlı başka varlığa otomatik bağlanmaz. Kullanıcı yer imi yılını/kamerasını
yine uygulayabilir; kayıp varlık için marker veya kaynak uydurulmaz. Kayıtlı yıl,
desteklenen coğrafya veya yaklaşık katman tercihi anlamına gelmez.

## Paylaşım ve deep link

Web URL yalnız `year`, `entityId`, `lat`, `lon`, `zoom` taşır. `year` zorunlu;
entity isteğe bağlı canonical kimlik; kamera alanları ya üçü birden ya hiçbiri.
Bearing/pitch paylaşımda0'a döner, yer imlerinde korunur. Sayılar finite ve
sınırlı, yıl MÖ2000–sistem yılı/yıl0 yok; koordinatlar6 ondalıkla yazılır.
Tekrarlı/ek alan, kısmi kamera, bozuk encoding, NaN/Infinity/numeric tricks ve
geçersiz kimlik reddedilir. Web raw query kontrolü router normalleştirmeden
önce tekrarlı alanları yakalar. Gizli token, sorgu metni, bookmark adı veya
keyfî redirect alanı URL'ye taşınmaz; mevcut query/hash temizlenir.

Web paylaşımı o anki origin/path'i kullanır; üretim hostu uydurulmadı. HTTPS
ve yerel geliştirme için localhost/127.0.0.1 HTTP kabul edilir. Web Share varsa
sistem sheet açılır; yoksa seçilebilir adres kullanıcı tarafından kopyalanır.
Her iki durumda adres görünür. İptal/launch hatasında görünüm değişmez ve
Türkçe mesaj çıkar. HTTPS dağıtım ve hedef tarayıcı Web Share desteği ayrıca
test edilmeli; paylaş düğmesi başarı iddiası üretmez.

Android bağlantısı örneği:

```text
tarihatlasi:///?year=1066&entityId=atlas%3Ahastings-1066&lat=50.911944&lon=0.4875&zoom=3
```

Android'de [RN0.86 Share](https://reactnative.dev/docs/0.86/share) kullanılır;
link `message` alanındadır, iOS'a özgü `url` alanına güvenilmez. Text paylaşımı
için ekstra runtime izin veya dosya provider'ı gerekmez. Android Share Promise
sonucu gerçek alıcıya teslim kanıtı sayılmaz. Native scheme app.json'da mevcut
`tarihatlasi`; Expo Router `+native-intent` yalnız root+whitelist sorguyu kabul
eder. Keyfî host/path/protokol, traversal ve hash root hata durumuna dönüştürülür;
harita WebView'ine hiçbir deep link verilmez. İlk sade Expo Go girişine izin
verilir; gerçek paylaşım akışı custom scheme içeren development/release build
gerektirir. [Expo linking](https://docs.expo.dev/linking/into-your-app/),
[native intent](https://docs.expo.dev/router/advanced/native-intent/).

Gelen bağlantı veya yer imi önce **incele**, sonra **uygula** adımlarından geçer.
Warm link de mevcut yılı/kamerayı sessizce değiştirmez. Android custom scheme
başka uygulamalarca da kaydedilebilir; doğrulanmış HTTPS App Links değildir.
Üretim domaini/assetlinks.json/sertifika sağlanmadığı için universal HTTPS native
link veya `autoVerify` onayı uydurulmadı. Android12+ doğrulanmamış web bağlantısını
genellikle tarayıcı açar; [resmî deep-link rehberi](https://developer.android.com/training/app-links/create-deeplinks).

## Bağımlılık ve doğrulama sınırları

Expo SDK57.0.29 yükseltilmedi. Önceden transitif kurulu **expo-file-system57.0.7**
doğrudan tam sürüme sabitlendi; Expo57 `bundledNativeModules ~57.0.7` ve
[SDK57 resmî FileSystem legacy rehberi](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem-legacy/)
ile uyumlu. Kurulu modern File tipi platform suffix çözümünde gerekli üyeleri
sunmadığından bu sürümde belgelenmiş `/legacy` API'si kullanıldı; type assertion
ile bozuk API gizlenmedi. Legacy desteğinin gelecekteki SDK yükseltmesinde tekrar
incelenmesi gerekir. Lisans MIT; tam metin assets ve uygulama atıflarında saklı.
Kurulu kendi dosya toplamı7.822.856 byte; yeni APK/bundle artışı veya bellek
ölçümü değildir. Yeni transitif paket sürümü indirilmedi.

İlk offline install metadata cache eksikliğiyle ENOTCACHED verdi. Var olan
lock'taki aynı sürüm/resolved/integrity kaydı ve kurulu paket doğrulanarak root
manifest/lock bağımlılığı güncellendi; `npm install --package-lock-only --offline
--ignore-scripts` ve `npm ci --dry-run --offline --ignore-scripts` geçti. Bu temiz
kurulum veya güncel online güvenlik audit'i değildir; offline "0 vulnerabilities"
satırı önceki audit risklerini kapatmaz.

Kaynak tarihî katalog/şema/geometriler ve sitelink release'i değişmedi. Arama
üretimde8 canonical sonuç içerir:3 siyasi kimlik,1 kişi,2 savaş/muharebe,2 olay.
Gerçek kültür alanı hâlâ0; kültür/homonym/yoğunluk senaryoları açık sentetik testte.
Gerçek browser, Android yer imi kalıcılığı, warm/cold deep link, donanım geri,
rotation/TalkBack, sferik fit ve performans **BLOCKED / UNVERIFIED ON DEVICE**.
[Faz raporu ve test kanıtları](reports/phase-13.md).
