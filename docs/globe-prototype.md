# Faz 02 — Küre prototipi ve köprü

2026-10-15 · **BLOCKED — RUNTIME VALIDATION**. Bu belge kaynak kodundaki tasarımı
anlatır; web/Android başarı veya performans kanıtı değildir. [Faz raporu](reports/phase-02.md).

## Ortak renderer

Web adaptörü doğrudan `globe/GlobeView.tsx` kullanır. Native adaptörün tek Expo DOM
bileşeni aynı görünümü ve `renderer.ts` modülünü kullanır. MapLibre yalnız DOM
ortamında dinamik import edilir; Hermes'te ikinci bir harita motoru yoktur.
Stilde `projection: { type: 'globe' }` ve yükleme sonrasında `setProjection` vardır.
Düz harita alternatifi çizilmez. Zoom 0–4, pitch 0–60; prototipte DPR en çok 2,
worker sayısı 1, antialias kapalıdır. Bunlar ölçülmüş optimum değerler değildir.

`dragPan`, `dragRotate`, `touchZoomRotate`, `touchPitch`, `scrollZoom`, klavye açık;
kamera sıfırlama uygulama tarafındaki düğmeden komutla gider. Pusula bu isteğe
bağlı aşamada eklenmedi. Kaydırma/touch çatışması ve kutup/antimeridyen/arka yüz
seçimi gerçek cihaz test kapısıdır. Küre görünümü ekran görüntüsüyle de incelenmeli;
sadece `data-projection` test işareti geometrik doğruluk kanıtı değildir.

## Fiziksel taban ve hazırlama

Tek veri adayı, Natural Earth **v5.1.2, ne_110m_land.geojson**, 1:110m fiziksel kara
poligonudur. [Resmi kullanım koşulları](https://www.naturalearthdata.com/about/terms-of-use/)
public domain beyan eder. Kaynak:
[maintainer deposunda sürümlü dosya](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson).
Bu oturumda dosyanın baytları indirilemedi. Kıyıların geçmişteki konumu veya yüksek
zoom doğruluğu iddia edilmez; bu taban çağdaş fiziksel referanstır, tarihî katman değildir.

Kurulum tamamlanınca `npm run globe:prepare`:

1. MapLibre 6.14.0 sürüm/lisans etiketini ve gerçek LICENSE dosyasını okur.
2. Dağıtımdaki worker'ın dış import içermeyen tek dosya olmasını kontrol eder;
   değişirse işlemi durdurur. Metro'ya Vite `?worker&url` söz dizimi eklenmez.
3. Sabit HTTPS kaynağını concurrency=1, 10 sn timeout, en çok 3 deneme, 0.5/1 sn
   backoff ve 4 MiB sınırıyla alır. Retry-After varsa bekler; 10 sn üzeri
   bekleme istenirse erken tekrar yerine işi durdurur. Redirect reddedilir; HTTP 429/5xx sınırlı denenir.
4. En çok 1.000 feature/100.000 koordinat, kapalı Polygon/MultiPolygon halkaları,
   sonlu koordinat/aralık denetimi yapar; bütün feature özelliklerini atar.
5. Tiplendirilmiş yerel TS veri/worker/NOTICE modülleri ile `assets/licenses/`
   altına SHA-256, kaynak, sürüm, byte, dönüşüm ve tam bildirim kaydını yazar.
   Cache yalnız önceki provenance hash'i eşleşirse kullanılır; hash güvenilir
   kaynağın ilk indirmesini bağımsız olarak doğrulamaz. Üretilen dosyalar incelenir.

Şimdiki üç generated modül `null` döndürür. Hazırlama başarısızlığı boşa kara şekli
üretmez. Hiçbir gerçek dünya geometrisi elle çizilmedi; sentetik üçgen yalnız unit
fixture'ıdır. Katalog hâlâ 0 tarihî kayıt içerir.

Stil projeye ait düz koyu renklerdir. Ülke/bölge adı, devlet sınırı, tile sağlayıcı,
sprite veya glyph endpoint'i yoktur. MapLibre CSS npm paketinden gelir. Harita
kaynaklarının URL istekleri `transformRequest` tarafından reddedilir. Marker 0,0'da
`synthetic-demo` kimlikli ◎ düğmesidir; tarihî iddia taşımaz. Haritada klavyeyle de
seçilebilir. Doğrulanmış seçim uygulama/React tarafındaki ayrı metni günceller.
Tam MapLibre bildirimi hazırlanırsa iki platform bundle'ına ve harita lisans
ayrıntılarına eklenir. Üretim tile veya CDN bağımlılığı yoktur.

## Köprü v1

`src/map-contract/protocol.ts` bağımsız runtime şemasıdır; ek validator paketi yoktur.
Örnek (kamera sırası boylam/enlem):

```json
{"version":1,"type":"camera.set","requestId":"command-1","sessionId":"globe-oturum","payload":{"center":{"lng":0,"lat":0},"zoom":1,"bearing":0,"pitch":0}}
```

`CameraState`: `center.lng [-180,180]`, `center.lat [-90,90]`, `zoom [0,4]`,
`bearing [-180,180]`, `pitch [0,60]`; tüm değerler sonlu sayı. Longitude ve bearing
renderer çıkışında normalize edilir. NaN/Infinity, ek alan ve yanlış tip reddedilir.

| Yön | İzinli mesaj | Payload |
| --- | --- | --- |
| Uygulama → DOM | camera.reset | boş nesne |
| Uygulama → DOM | camera.set | CameraState |
| DOM → uygulama | renderer.ready | projection: globe |
| DOM → uygulama | camera.changed | CameraState, yalnız moveend |
| DOM → uygulama | demo.selected | id: synthetic-demo, synthetic: true |
| DOM → uygulama | renderer.error | sınırlı hata kodu |

Tam zarf anahtarları `version/type/requestId/sessionId/payload`; bilinmeyen sürüm,
tür/yön, ek anahtar, yanlış oturum, geçersiz JSON veya **4096 UTF-8 byte** üzeri metin
uygulama decoder'ında reddedilir. ID'ler 80 ASCII karakterle sınırlıdır. Native
alıcı artan event sıra numarasını kontrol eder; eski oturum ve eski event uygulanmaz.
DOM aynı komutu tekrar uygulamaz. Başarısız mesaj native API çağırmaz; eval,
HTML, URL açma, konum izni, geometri veya secret taşıyan komut yoktur.

Uygulama komutu prop, DOM olayı üst seviyede async `onEvent(string)` action'ıdır;
Expo'nun dahili `onMessage` işleyicisi değiştirilmez. Action Promise dönüşü taşıma
sonucudur; bağımsız komut ACK/yeniden gönderim protokolü bu prototipte yoktur.
Kamera sonuç mesajıyla gözlenir. Olay kuyruğu 8 bekleyen öğeyle sınırlıdır;
kamera birleşir, taşmada yeni olay düşer. Hata olayı kuyruğu beklemez. Yeniden
mount yeni oturum oluşturur; kaybolan olay otomatik tekrar oynatılmaz.

**Taşıma sınırı:** Expo, dış mesaj zarfını bizim decoder'dan önce JSON.parse eder.
4096 byte sınırı Expo'nun kendi dış çerçevesini parse etmeden sınırlamaz.
Bu yüzden keyfi/uzak HTML'ye karşı tam ham köprü izolasyonu iddia edilmiyor.
Büyük raw WebView mesajı ve bozuk Expo zarfı saldırı testi **BLOCKED**; gerekirse
aynı renderer açık WebView'e taşınarak parse öncesi sınır konmalı. Güvenilir
paketli kod dışında DOM yüklenmez; `unstable_useExpoModulesBridge` açılmaz.

## Navigasyon, asset, CSP ve bağlantı politikası

Expo DOM içinde `useExpoDOMWebView:false` ile SDK eşlemesindeki RN WebView 13.16.1
seçilir. Kaynak URI'sini Expo üretir; `overrideUri`, kullanıcı URL'si veya dış HTML
kabul edilmez. Release yalnız `file:///android_asset/www.bundle/` altındaki belge;
geliştirmede yalnız `__DEV__` + Constants hostUri'den türeyen tam origin ve
`/_expo/@dom/` yolu kabul edilir. Traversal/encoded separator, credentials,
http(s) dış origin, data:, javascript: ve intent: reddedilir.

`originWhitelist:['*']`, RN WebView'in whitelist dışı URL'yi otomatik Linking ile
açmasını engellemek için bütün kararları `onShouldStartLoadWithRequest`'e bırakır.
Yeni pencere, otomatik popup ve mixed content kapalı; dosyalar arası/universal
file erişimi, cookie paylaşımı, third-party cookie ve DOM storage kapalıdır.
Android ilk yüklemede onShould çağrılmayabileceği için ilk kaynak güveni Expo'nun
paketli URI üretimine dayanır. Bunlar uygulanan prop seçimleri; işletim sistemi
seviyesinde doğrulanmış güvenlik sonucu değildir. Donanım katmanı istenir,
release WebView debug kapatılır. Geri tuşu Router'a aittir; haritada web geçmişi
gezintisi/BackHandler tuzağı oluşturulmaz.

Worker kaynak metninden yerel `blob:` URL üretilir; dış ağ/relative worker import
beklenmez. Byte'ları TS modülüne gömmek iki platformun aynı asset'i taşımasını
hedefler; Android release `file:` + Blob worker/ESM ve kapalı file erişim bayrakları
henüz **doğrulanmadı**. Main ESM'nin Metro/import.meta dönüşümü de export testine
bağlıdır. Sorunda izinleri genişleterek veya HTTP/CDN yükleyerek sessiz geçiş yoktur.

Web yayınında CSP HTTP header'ı hosting'de ayarlanmalı. Asgari başlangıç önerisi:
`default-src 'self'; script-src 'self'; worker-src 'self' blob:; img-src 'self' data: blob:;
style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`.
Bu, dev Metro HMR için aynen uygulanmaz. Expo web export'un inline bootstrap'ı
varsa hash/nonce ile ayrıca çözülür; üretim header'ı burada test edilmedi veya
sunucu yapılandırması olarak kurulmadı. WebView'in file dokümanı için HTTP header
geçerli değildir; native CSP/export enjeksiyonu ayrıca doğrulanacak. Uzak resource
ve güvenilmeyen HTML yasağı, CSP testinin yerine tamamlanmış sayılmaz.

## Lifecycle ve hatalar

20 sn zaman aşımı; yükleme, WebGL2 yok, eksik asset, context loss ve renderer
hataları ayrı Türkçe açıklamalar. Fallback gerçek harita değildir; kayıt yokluğu,
Atlas hakkında bağlantısı ve yeniden deneme kullanılabilir. Context restore'a
sessiz başarı vermek yerine kaynaklar bırakılıp kullanıcı yeniden başlatır.

Scope; marker ve click dinleyicisini, map olaylarını, canvas context dinleyicisini,
ResizeObserver'ı, map.remove ile harita/worker kaynaklarını ve Blob URL'yi ters
sırada bırakır. Geç async import kapanmış ekrana renderer oluşturmaz. Router blur
ve Android background tek DOM ağacını unmount eder; ekran dönüşü yeni oturumdur.
WebView process kaybında otomatik reload döngüsü yerine hata + kullanıcı retry
vardır. PSS/GPU/context sızıntısı olmadığı **ölçülmedi**; unit cleanup testi yalnız
kaynak kayıt sırasını sınar. Gerçek testler [cihaz raporunda](reports/phase-02-device.md).

## Faz 02 düzeltmesi

2026-10-15 incelemesinde load handler'ı hata yakalama/tek başlangıç koruması aldı;
marker temizliği kurulumdan önce kaydedilir. Renderer context/error/resize/komut
hatasında kendi kaynaklarını idempotent bırakır; yalnız React üstüne bağımlı değil.
Worker'ın dış import kontrolü regex yerine mevcut TypeScript JavaScript AST'sini
kullanır; yorum/string yanlış pozitifleri giderildi. Hazırlama dev araç paketlerini
gerektirir; bu parser uygulama bundle'ına girmez. [18+3 test ve kalan platform engelleri](reports/phase-02-repair.md).
Bu düzeltmeler ESM/worker/file-origin/native GPU doğrulamasının yerini almaz.

Kurulum sonrası güncelleme: gerçek 6.14.0 worker'ı opsiyonel plugin'ler için iki
dynamic import içeriyor. Hazırlayıcı bunları AST ile kontrollü hata veren Promise'e
dönüştürür, sonra import kontrolünü uygular; statik bağımlılık yine reddedilir.
Orijinal/çıktı worker SHA/byte ve dönüşüm sayısı manifeste eklenir. Bu bütün worker
ağ/eval API'lerini kaldıran bir sandbox değildir; plugin özelliği kullanılmaz.
Metro web/Android+DOM export artık PASS, fakat asset alımı ve gerçek runtime hâlâ
açık. [Güncel rapor](reports/phase-02-post-install.md).

Hazırlanmış varlıklar güncellemesi: generated modüller artık null değil; Natural
Earth 127 fiziksel feature/5143 koordinat, worker ve tam harita/font bildirimleri
mevcut. `npm run globe:check` gerçek kaynak/derlenmiş modül/worker/bildirim hash'lerini
kontrol eder. Hazırlama Prettier'i doğru dosya yoluyla (Türkçe yol dahil) kullanır.
Native/file-origin/WebGL davranışı bu kontrollerden çıkarılamaz.
[Son sonuç](reports/phase-02-prepared.md).

## Arka yüzdeki işaret görünürlüğü

MapLibre 6.14.0 varsayılan olarak kürenin arkasındaki marker'ı %20 opaklıkla
gösterir. Atlas prototipinde `opacityWhenCovered: 0` kullanılır. Belgeli
`maplibregl-marker-covered` sınıfı, yalnız atlas demo işaretinde `visibility: hidden`
ve `pointer-events: none` uygular; düğme klavye/erişilebilirlik ağacından da gizlenir.
Seçim handler'ı covered durumunu ayrıca reddeder. Kütüphanenin kendi küre
örtülme hesabı kullanılır; yaklaşık kamera mesafesi veya özel MapLibre API'si yoktur.
Ortak CSS hem web hem Expo DOM girişine dahildir. Öne dönünce aynı marker tekrar
seçilebilir; ilave observer veya frame dinleyicisi eklenmez.

Fiziksel taban yalnız Natural Earth v5.1.2 `ne_110m_land` geometrisidir. 1:110 milyon
veride küçük adalar/kıyılar genelleştirilir. Ülke sınırı/adı, tarihî sınır veya
seçilen yıla ait kıyı çizgisi içermez. Motor/stil/veri ayrı olduğundan daha ayrıntılı
lisansı uygun fiziksel kaynak ve kaynaklı tarihî katmanlar kendi yetkili fazlarında
eklenebilir; bu düzeltmede yeni geometri/veri/bağımlılık yoktur.

[Kullanıcı web denemesi, regresyon ve açık cihaz kapısı](reports/phase-02-marker-occlusion.md).
Resmi kaynaklar: [MapLibre marker CSS sınıfı](https://maplibre.org/maplibre-gl-js/docs/API/classes/Marker/#css-classes),
[Natural Earth 110m fiziksel kara](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/).

## Faz 05 — yerel tarihî pilot katmanı

Yazısız fiziksel kaynak aynı kalır. Ek historical GeoJSON source yalnız doğrulanmış
statik katalogdan yıl + bağımsız polity/culture sorgusuyla beslenir. Sınır çizgisi
alan dolgusu gibi yorumlanmaz. Kaynaklı tek örnek NARA 1867 antlaşmasının idealize
meridyen kesitidir; tam siyasi/kültür alanı yoktur. Kesin/belgeli, kesikli yaklaşık,
noktalı/düşük opak kültür stilleri hazır; modern siyasi ad/etiket katmanı yoktur.

Köprü v1 catalog.view {year,polity,culture,focusPilot}, entity.selected
{recordId,catalogVersion} türlerini de doğrular. Yalnız pilot ID/sürümü kabul edilir;
geometri taşınmaz. Kamera/seçim önceki kaynak cleanup akışını kullanır. Hızlı yıl
değişiminde eski provider yanıtı revision ile atılır, unmount sonrası uygulanmaz.
Seçim yalnız görünen source ID/sürümü ve queryRenderedFeatures eşleşmesiyle yapılır;
drag hareketi kart açmaz. Veri yoksa eski yılın geometrisi korunmaz.

Pilotun kaynak kartı/fallback erişimi ve tam NOTICE iki adaptörde ortaktır.
Gerçek yeni pilotun web/native görüntüsü henüz doğrulanmadı; API origin/Worker/
CSP/cihaz kapıları açık. [Kaynak ve kalite sınırları](data-quality.md),
[güncel test raporu](reports/phase-05.md).

## Faz 07 köprü güncellemesi

catalog.view v1 optional revision/suspendHistory alanlarını boolean/sınırlı tam
sayı olarak kabul eder. catalog.applied event'i revision/year/sourceYear/
coverageStatus/catalogVersion taşır; session/requestId/yön/4 KiB kapısı korunur.
MapLibre setData Promise'i await edilir; bu GPU veya ekran görüntüsü kanıtı değildir.
Eski revision ACK'i yeni yıla yazılmaz. Yavaş köprüde camera/applied olayları
son değerle birleşir; geometri ve yürütülebilir kod taşınmaz. Aynı tek DOM/WebView
çekirdeği korunur. [Ayrıntılı state/ACK sözleşmesi](playback.md).
