# Parçalı veri, önbellek ve performans — Faz15

**Faz16 güncel:** inceleme politikası1.0.0 kişi coğrafyasını askıya aldı; aktif
manifest4LOD girdisi/3benzersiz chunk'tır. Faz15'teki6/4ölçümü önceki içerik
sürümünün kanıtıdır. Yeni browser ölçümü EPERM ile BLOCKED, Android UNVERIFIED
ON DEVICE. [Faz16 raporu](reports/phase-16.md); aşağıda eski ölçüm ve yöntemler korunur.

Faz15 mevcut küçük doğrulanmış pilotu kullanır. Dünya çapında yeni veri veya
kaynak eklenmez. Büyük veri çalışabilirliği, gerçek tarayıcı ve fiziksel Android
ölçümleri tamamlanmadan doğrulandı sayılmaz.

## Yükleme ve kapsam

`npm run chunks:prepare` üretim şema/lisans kapısından geçmiş katalogdan kaynak
bağımlılıkları kapalı katalog parçaları üretir. Kök kayıt, kişi/varlık/yer
referansları, kaynaklar, ham input hash/revizyonları ve transformation girdileri
birlikte tutulur. Manifestte version1, catalogVersion/catalogSha256,
recordId/temporal/bbox/LOD, byte/hash/atıf/lisans/sourceIds vardır. Katalog SHA'sı
mevcut üretim manifestiyle eşleşir. Geçerli üretim kataloğu değişmedi.

Üç destekli coğrafya kökü için6 coarse/fine girdi,4 benzersiz içerik dosyası:
NARA1867 meridyen kesiti, Gogh1879–1880 yaklaşık kişi konumu, Hastings1066 yaklaşık
nokta. Nokta LOD'leri aynı hash'e gider. Tarihi bilinmeyen Maison yer geometrisi
bağımsız harita kaydı olarak keşfedilmez. Manifestten yıl/bbox/recordId/LOD seçimi
kaynak destek aralığını korur; snapshot sadece kendi yılına gelir. Önizleme
engine'in açık kaynak yılıyla yapılır; eksik yılda en yakın dosya sessiz açılmaz.

Başlangıç yılı destekli coğrafya istemiyorsa parça açılmaz. Küçük19 kayıtlı
bootstrap indeks, arama ve kaynak kartlarının mevcut protokolü için paket içinde
kalır; **96KiB UTF-8 build/runtime kapısı** daha büyük dünya arşivinin buraya
konmasını reddeder. Bu indeks birkaç küçük geometriyi hâlâ içerir; tüm metadata
ve geometriyi akışlı büyük dünya sağlayıcısına dönüştürdüğümüz iddia edilmez.
Yeni geometri manifest parçalarında olmalı; engine1000 kayıt üst sınırı ve
başlangıç metadata protokolü büyük kapsam öncesi ayrıca yeniden ele alınmalı.

Web'de content-hash URL'den yalnız aynı origin `/data/chunks/<sha>.json` istenir;
credentials omit, redirects error, streaming byte sınırı. Ana katalog uzaktan
kendini onaylayamaz; güven kökü derlenmiş manifesttir. Yol/basePath değişen hostta
endpoint erişilemezse izinli bundle'a dönülür; canlı kaynak/lisans onayı yapılmaz.
Android ana UI aynı parçaları mevcut FileSystem adaptörüyle private cache'e alır;
onaylanmış üretim API origin'i olmadığı için yeni native indirme servisi yoktur.
Ortak DOM renderer FileSystem import etmez; HTTP origin varsa web yükleyicisi,
file origin'de izinli paketli fallback kullanır. Ayrı çalışma ortamlarının cache
kotaları ayrı uygulanır; native cache büyük polygonu bridge üzerinden taşımaz.

Web async import fallback parçaları ayrı export dosyalarıdır. Native Hermes/DOM
exportları bu küçük yedeği paketleyebilir; bytecode'un Metro module cache'inden
boşaltıldığı iddia edilmez. Büyük gelecekteki paketler bu otomatik fallback
listesine eklenmemeli; hak/manifest incelemesi ve native indirme endpoint kararı
önce gerekir. İlk kez indirilmeyen büyük veri offline varmış gibi gösterilmez.

## Kota ve ayrı cache politikaları

| İçerik | Politika |
| --- | --- |
| İncelenmiş tarih katalog parçaları | Parça≤256KiB, disk≤2MiB/32 içerik, bellek≤512KiB/8 raw içerik;2 eşzamanlı yükleme,≤32 bekleyen iş. App çağıranı2'li batch ile kuyruğu doldurmaz |
| Wikimedia açıklaması/sitelink | Yalnız mevcut incelenmiş CC0 açıklama ve sürümlü sitelink bundle'ı. Makale/Commons indirme-cache yok; ETL24h cache ve resolver'ın bounded politikası ayrı kalır |
| Fiziksel stil/kara/worker | Sürümlü paketli yerel varlık, mevcut hash ve lisans kontrolü; modern siyasi ad ve uzak style/glyph/sprite yok |
| Dış tile | Sağlayıcı/yetki yok: devre dışı. Demo veya lisansı bilinmeyen tile offline pakete giremez |
| Kullanıcı tercihleri/yer imleri | Önceki ayrı documents/localStorage depoları; LRU tarafından silinmez |

Byte kotaları **UTF-8 payload muhasebesidir**, process RSS/GPU belleği üst sınırı
iddiası değildir. Aktif parse edilen en çok2 parça ve dönüşüm sonuçları ayrıca
bellek kullanır. Web CacheStorage adı `tarihatlasi-historical-v1`; native özel
`cacheDirectory/atlas-historical-v1/` altında sabit hash isimleri. Seri yazma,
native temp+rename, açılışta stale temp temizliği, LRU benzeri en eski erişim
silme; restart sonrası disk zamanları yaklaşık erişim sırasıdır. Yeni release
allowlist'inde olmayan hash'ler cache erişiminde temizlenir. Bozuk boyut/hash/
version/provenance/lisans kaydı kullanılmaz; doğrulanmış yedekle onarılır.

CacheStorage/file sistemi kapalı veya kota doluysa uygulama izinli bundle/memory
ile devam eder ve saklama uyarısı gösterir. Bellekten tekrar okumak başarısız
kalıcı yazmayı başarı diye gizlemez. OS cache'i silebilir; hesapsız cache kalıcı
arşiv garantisi değildir. Birden çok browser context'in aynı namespace'e
çakışan yazımları için tarayıcı genelinde transaction kilidi yok; bu küçük
pilotun dışına çıkmadan IndexedDB transaction veya sürüm başına tek writer
incelemesi gerekir. Mevcut kurallar tek runtime içinde kota garantisidir.

`public/_headers` yalnız bilinen hash dosyalarında `public,max-age=31536000,immutable`,
manifestte `no-cache` üretir. HTML ve manifest immutable olmaz. Dosyanın host
sağlayıcısınca uygulanacağı varsayılmaz: deploy öncesi curl/Network ile header
kanıtı gerekir. HTTP cache ve CacheStorage farklıdır; fetch sonucu ağdan veya
HTTP cache'den gelebilir, UI bunu aynı yayın kaynağı olarak açıklar. HTTP cache
boyutu browser yönetimindedir; uygulamanın2MiB kotasına dahil diye sunulmaz.
Service Worker/app shell precache eklenmedi; offline cold-start garantisi yoktur.

## İptal, hata ve çevrimdışı sınır

Network denemesi en çok2, her biri4s timeout; bounded150ms backoff.429/5xx
Retry-After≤2s ise beklenir; daha uzun/deşifre edilemeyen talepte ağ yeniden
zorlanmaz ve bundle denenir.404 tekrar edilmez. Geç gelen response iptal sinyali
ve revision/ACK kontrolünü aşamaz. İptal sırasında tamamlanan geçerli immutable
cache yazısı kalabilir; eski yıl UI'ya uygulanmaz.

Timeline tek frame/konfigürasyon revision'ı kullanır. Çizim için gerekli bir
parça hâlâ yüklenemezse **o görünüm atomik reddedilir**, bütün parçalar başarılı
imiş gibi kısmi coğrafya ACK edilmez. Doğru hash'li diğer parçalar cache'de
kalır ve retry'da yeniden kullanılabilir. Ana fiziksel küre, kaynak kartları ve
uygun konumsuz olay listesi altyapısı korunur; Türkçe hata/retry vardır. Son
bilinen başka yılın geometrisi sessizce ekranda bırakılmaz. Sürüm uyuşmazlığında
eski cache'i yeni katalog etiketi altında gösterme yoktur.

UI `Veri yükleme kaynağı` ile bu oturum/cache/ağ-HTTP-cache/paketli pilot ayrımı
ve katalog sürümünü gösterir. Bu gösterge ana veri doğrulama katmanına aittir;
Android DOM renderer'ın ayrı cache'iyle aynı fiziksel depoyu kullandığı anlamına
gelmez. Kaynağın doğrudan kayıt/revizyon/lisans/atıf bilgisi kartlarda korunur.
Yalnız daha önce yüklenen **izinli ve mevcut manifestle eşleşen** parçalar cache'den
kullanılır. Paketli pilot yeni kurulumda da vardır; Wikipedia dış bağlantısı,
ilk web JS/asset yüklemesi ve daha önce edinilmemiş veri ağ isteyebilir.

## Renderer ve arka plan işi

Aynı kamera/viewport/içerik/seçimde marker ve etiket refresh'i mevcut DOM
nesnelerini tutar; boş yere remove/create yapmaz. Kamera aynıysa yeni bridge
camera event'i üretmez. MapLibre render döngüsü zorla sürekli çalıştırılmaz;
özel autoplay camera animasyonu veya kişi rotası yoktur. Native arka planda tek
DOM/WebView unmount edilir. Web gizlenince map.stop, veri iptali ve raw cache
bellek temizliği; görünür olunca en yeni yıl tekrar yüklenir. Timeline AppState/
ekran odağını izleyerek oynatmayı ve bekleyen sorguyu durdurur. Unmount'ta
AbortController, worker URL, marker/dinleyici/map kaynakları bırakılır.

Profiling yalnız `globalThis.__ATLAS_PROFILE__=true` ölçüm ortamında açılır;
varsayılan kapalı. Renderer `__ATLAS_METRICS__()` ile en çok32 isim/120 örnekli
sayaçlar sunar: map render event sayısı, setData süresi, marker/label refresh
CPU süresi ve rebuild, bridge mesaj sayısı, React render sayacı, cache byte/
entry ve DOM marker/canvas sayısı. React concurrent deneme renderları sayılabilir;
commit süresi ölçülmez. GPU allocation API'si veya FPS ölçümü diye sunulmaz.
Profil verisi cihazda kalır; koordinat/arama/varlık adı toplanmaz, sunucuya gitmez.

## Geometri/LOD ve vector tile kararı

Mevcut coarse işlem yalnız önceden incelenmiş141°W düz meridyeninin ara
noktalarını kaldırır; uçlar ve kapsama değişmez. Diğer nokta geometrisi aynıdır.
Genel polygon sadeleştirme veya vector tile dönüşümü uygulanmadı. Yalnız
kaynağın ölçek/hassasiyetine uygun toleransla, antimeridyen/ada/delik/topoloji ve
çoklu iddiaları koruyan geri karşılaştırma yapıldıktan sonra eklenebilir.
Vector tile kesilmesi küçük alan/örtüşme/etiket isabeti, feature ID ve kaynak
ilişkisini kaybedebilir; offline tile üretmek hak kapsamını genişletmez. Yeni
bağımlılık/lisans/boyut ve ölçülmüş cihaz faydası olmadan pipeline seçilmez.

## Tekrarlanabilir ölçümler

```sh
npm run chunks:check
npm run benchmark:host
npm run web:export
npm run android:bundle
npm run benchmark:sizes
npm run benchmark:web
npm run benchmark:android
```

Host script Node `--expose-gc`,30 cold/200 warm chunk,1000 yıl sorgusu,200 feature,
100×1000 açık SENTETİK marker/label CPU örneği ve6×200 cache/yıl turu çalıştırır.
GC sonrası heap/RSS noktaları ve cache boyutu raporlanır. Zamanlar bu hosta ve
bu küçük yüke aittir; Android/FPS sonucu değildir. Aynı makinede bu baseline'ın
p95 değerlerinin2 katını aşan tekrar koşu inceleme eşiği olarak kullanılabilir;
CI zaman assertion'ı veya mobil ürün hedefi değildir. Gerçek cihaz/browser
hedefleri ilk gerçek benchmark sonrasında seçilmeli; şu an **BLOCKED**.

Web script yalnız hazır `dist` exportunu localhost:4173'te sunar; ayrı context'te
unthrottled ve kontrollü1Mbps/150ms ağ, navigation/resource/globe-ready,
10 katman aç-kapa uçtan uca otomasyon gecikmesi, diagnostics ve desteklenirse
Chrome JS heap örneği kaydeder. Sonra açık oturumda ağ kesintisi ve yüklenmiş
pilotu sınar. Automation gecikmesi kullanıcı dokunma latency/FPS değildir.
Browser cold offline restart veya release server cache header kabulünü ölçmez.
Sunucu/WebGL/browser yoksa status BLOCKED ve measurements[] boş kalır.

[Host gerçek ölçümler](reports/phase-15-host-benchmark.json),
[export byte/gzip/brotli ölçümleri](reports/phase-15-package-sizes.json),
[web engel raporu](reports/phase-15-web-benchmark.json),
[Android cihaz notları](reports/phase-15-device.md), [faz raporu](reports/phase-15.md).

Dayanak olarak sürümlü [Expo57 FileSystem legacy](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem-legacy/),
[CacheStorage API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage),
[HTTP cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) ve
[MapLibre Map API](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)
incelendi; kurulu FileSystem57.0.7 tipleri esas alındı. CacheStorage kullanılabilirliği,
OS cache silmesi ve map.stop davranışları platformda ayrıca ölçülmelidir.
