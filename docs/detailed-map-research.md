# Ayrıntılı dünya ve tarihî ülkeler — 16 Ekim 2026

## Küçük çalışma planı

1. Ana haritadaki fiziksel kara/ölçek yazısını kaldır; bilimsel kaynak/atıf
   erişimini koru. Kullanıcının indirdiği mevcut50m dosyalarını değiştirme.
2. Ayrıntılı fiziksel coğrafya ve tarihli siyasi alanları ayrı kaynaklarla
   araştır; sürümlü dosya, hak bildirimi ve kapsamı belirle.
3. Kullanıcının ağında çalışacak, yalnız staging'e indiren sınırlı Node CLI
   hazırla. Cache/hash/izinli URL/boyut/timeout/backoff uygula. Büyük tarih
   arşivini uygulama belleğine alma veya üretime otomatik bağlama.
4. Lint/strictTS/unit/hash ve web export doğrula; gerçek browser/Android
   yapılmayan kabulünü NOT TESTED olarak raporla. README/progress/sicil güncelle.

Bu iş araştırma/edinme hazırlığıdır; yeni ülke katmanının tamamlandığı iddiası
değildir. Dosyalar alındığında kayıt/geometry/zaman/hak incelemesi ve parçalı
üretim adaptörüyle haritaya bağlama gerekir.

## Bulunan kaynaklar ve öneri

Öneri iki parçalıdır: **Natural Earth 10m fiziksel vektörleri + Cliopatria 0.2.1
tarihli siyasi alanları**. Yalnız kıyı çözünürlüğünü artırmak temel ülke eksiğini
kapatmaz. Yeni dosyalar henüz render'a bağlanmadığından bugünkü ürünün bu
kapsama ulaştığı söylenemez.

| Kaynak                                                                                                     | Doğrulanan içerik/hak                                                                                                                                                                                                                     | Projede önerilen kullanım / sınır                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Natural Earth fiziksel 10m](https://www.naturalearthdata.com/downloads/10m-physical-vectors/)             | Kara, göl, akarsu ayrı veri; [public-domain şartı](https://www.naturalearthdata.com/about/terms-of-use/)                                                                                                                                  | Daha ayrıntılı kıyı/adalar ve hidroloji. Modern fiziksel referanstır; geçmişteki sahil/nehir/göl durumu iddiası veya sokak çözünürlüğü değil. Güncel yapay göller tarihî veri gibi yorumlanamaz.                                        |
| [Cliopatria 0.2.1](https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1)       | Yayıncı kapsamı MÖ 3400–MS 2024, 1600'den fazla siyasi varlık; yaklaşık 14 bin satır; [açık veri lisansı CC BY 4.0](https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/v0.2.1/LICENSE.md)                        | Tarihli dünya siyasi poligonları için seçilen inceleme adayı. Coğrafi/zamansal belirsizlik ve kaynak yorumu korunmalı; tam dünya/her yıl doğruluk garantisi yok. 2025–2026'ya uzatılmaz. Gerçek dosya henüz incelenmedi.                |
| [OpenFreeMap](https://openfreemap.org/)                                                                    | OSM tabanlı vector tiles; ücretsiz/key gerektirmeyen public hizmet veya self-host. [Kod/style/font/data hakları ayrı](https://github.com/hyperknot/openfreemap/blob/main/LICENSE.md); OSM [ODbL](https://www.openstreetmap.org/copyright) | Yakın zoomda daha çok fiziksel ayrıntı için alternatif. Hazır stil modern ülke/şehir/yol etiketleriyle alınamaz; tarihsel semantiğe uygun yerel stil, source allowlist, CORS/CSP/WebView ve atıf incelemesi gerekir. Etkinleştirilmedi. |
| [Natural Earth II raster](https://www.naturalearthdata.com/downloads/10m-raster-data/10m-natural-earth-2/) | Fiziksel renk/doku/gölgelendirme; farklı büyük paketler                                                                                                                                                                                   | Dağ/deniz tabanı dokusu için ek aday; yüzlerce MB rasterı tek texture olarak Android'e koymak uygun değil. Tile/LOD/bellek hazırlığı gerekir. Şimdilik kullanıcıya bu büyük indirme yüklenmedi.                                         |
| [OpenHistoricalMap](https://www.openhistoricalmap.org/copyright)                                           | CC0 varsayılanı, nesne lisans istisnaları                                                                                                                                                                                                 | Bölgesel eksikleri kaynaklı tamamlamak için. Her nesne/üyenin lisans/tarih/geometri denetimi gerekir; planet dump veya render edilmiş harita kopyası alınmaz.                                                                           |
| [Historical Basemaps](https://github.com/aourednik/historical-basemaps)                                    | Önceki sicilde GPL depo/veri hak zinciri belirsiz                                                                                                                                                                                         | **BLOCKED FOR REDISTRIBUTION** devam eder; yeni kaynak adıyla pakete taşınmaz.                                                                                                                                                          |

OpenFreeMap'in 14 Ekim 2026 tarihli [hizmet koşulları](https://openfreemap.org/tos/)
çevrimdışı bölge indirmesini 3000 tile veya 50 MB, en fazla 4 istek ve uygulamayı
tanıtan User-Agent ile sınırlar. Public hizmetin SLA'sı yoktur. Bunlar OSM
standart sunucusunun koşullarıyla aynı sayılmaz. Burada bu hizmete bağımlılık,
tile cache veya otomatik indirme eklenmedi; bütün planet indirme gerekmiyor.

### Sürümler, dosyalar ve boyut kanıtı

Cliopatria'nın [release listesinde](https://github.com/Seshat-Global-History-Databank/cliopatria/releases)
0.2.1 görüldü; sabit tag seçildi, hareketli main/latest indirilmez. Eski Zenodo
bağlantısı 0.0.1'e gidebildiğinden yanlış sürüm arşivi yerine tag'in yalnız veri
ZIP'i kullanılır. Tüm repo, görüntü/notebook arşivi veya Python ortamı gerekmez.

- [Cliopatria veri ZIP](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/v0.2.1/cliopatria.geojson.zip): GitHub metadata 43.9 MB.
- [10m kara](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_land.geojson): metadata 9.69 MB.
- [10m göller](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_lakes.geojson): metadata 4.81 MB.
- [10m akarsular](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_rivers_lake_centerlines.geojson): metadata 6.97 MB.
- Aynı Cliopatria tag'inden README ve LICENSE küçük metadata dosyaları.

Toplam yaklaşık 65–70 MB beklenir; bu sunucu metadata tahminidir, bu ortamda
ölçülmüş aktarım veya açılmış GeoJSON boyutu değildir. ZIP açıldıktan sonraki
boyut/geometri sayısı henüz bilinmez; uygulamaya ham bütün-zaman veri yüklenmez.
Metadata ile dosyanın aynı olduğu yerel SHA ve edinme kaydıyla takip edilir;
SHA tek başına yayıncı imzası veya bilimsel kaynak doğrulaması değildir.

## Kullanıcının yapacağı işlem

Yeni kütüphane, Python, API anahtarı veya hesap gerekmiyor. Var olan 50m tabanı
silmek veya tekrar indirmek gerekmiyor. Terminalde:

```sh
cd "/home/s-oktay/Belgeler/Tarih_Atlası"
npm run data:download
```

İşlem başarıyla biterse:

```sh
npm run data:download -- --verify
```

Dosyalar `data/staging/map-sources/` altında bulunur. Komut 6 dosyayı sırayla
indirir, her dosyanın kaynak/sürüm/hak/byte/SHA ve `downloaded-unreviewed`
durumunu ayrı receipt'e yazar. En fazla 1 aktif istek, 2 deneme; ZIP için15dakika,
diğer dosyalar için120s request süresi,
Retry-After ve byte sınırı vardır. İndirilmiş dosya aynı SHA'daysa yeniden
indirilmez. Bozuk veya receipt'siz dosya sessizce silinmez/değiştirilmez.
Dosyalar Git/formatter/lint üretim kapsamından ayrıdır. ZIP otomatik açılmaz;
arşiv içinde komut çalıştırılmaz, import veya yayınlama yapılmaz.

Yavaş bağlantıda ZIP süre aşımı için `npm run data:download -- --timeout-seconds 1800`
en fazla30dakika/deneme tanır. İlerleme yaklaşık10s arayla yazılır. Tamamlanan
dosyalar yeniden indirilmez; kesilen dosyada byteoffset'ten devam uygulanmaz.
[Zaman aşımı düzeltmesi](reports/map-download-timeout.md).

`Tamam: data/staging/map-sources...` çıktısını ve verify sonucunu kullanıcı
iletebilir. Bundan sonraki gerekli iş, benim tarafımda veriyi inceleyip mevcut
domain/timeline/katalog ve küreye bağlayan üretim adaptörünü tamamlamaktır.
**Bu indirme komutu tek başına ülkeleri ekranda göstermeyecek.** Kullanıcıdan
sınır çizmesi, lisans yorumu yapması veya uygulama kodunu yazması istenmiyor.

Bağlantı hatası olursa `npm run data:download -- --list` sabit indirme URL'lerini
gösterir. Tarayıcıdan indirilecek dosya adları yukarıdadır. Elle dosya konursa
receipt üretilmeden otomatik kabul edilmez; o durumda dosya yolunu bildirmek
yeterlidir, kontrollü yerel edinme kaydı ayrıca hazırlanmalıdır.

## Haritaya bağlama için somut teknik sıra

1. ZIP'i path traversal/symlink/entry sayısı/sıkıştırılmış-açılmış byte limitleri
   ile aç; GeoJSON'u sınırlı batch/akışla incele. Mevcut downloader açma yapmaz.
2. [Sabit veri açıklamasına](https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/v0.2.1/README.md)
   göre POLITY/RELATION ayrımını, dahil FromYear/ToYear tarihlerini ve BCE
   işaretini normalize et. Kaynak aralığı bildirir; her yıl yeni ölçüm sayma.
   Dönüşüm/takvim/uncertainty ve kaynak satırı kimliği kaybolmasın.
3. Alan/topoloji/antimeridyen, küçük ve çok parçalı geometri; aynı yıl overlap ve
   üst siyasi ilişkiyi kontrol et. RELATION birleşik alanını yeni kesin ülke
   diye yığma. Kayıt/revizyon/ham SHA ve örneklem kaynak denetimini bağla.
4. CC BY atıf/lisans/değişiklik notu ve kayıt bazlı inceleme; otomatik
   `reviewStatus:verified` atama yok. Genel yayıncı lisansı biliniyor; belirli
   geometriyi kesin veya yayıma onaylı kabul etmek ayrı karardır.
5. Yıl/bölge/LOD parçaları ve mevcut zaman motoruyla siyasi çizim/seçim/etiket.
   1453 gibi yıl için dosyada gerçekten destekli kayıt varsa göster; yoksa yokluğu
   açık bırak. 2024 verisini 2025–2026'ya taşıma.
6. 10m fiziksel geometriyi ayrı LOD ile işle; tüm feature properties/adları alınmaz.
   Akarsu/göl katmanı bugünkü fiziksel referans olarak kalır. Mevcut 50m/110m
   düşük zoom yedeği ve tek MapLibre/Küre korunur; yeni GL SDK gerekmiyor.
7. QID'yi doğrula, Wikipedia başlığından URL üretme; mevcut sitelink kolektörü.
   Yeni pilot için kaynak kartı, sayısal kapsam ve gerçek web/Android ölçümü.

Bu sıra uygulandıktan sonra siyasi katmanın gerçek kabulü ölçülebilir. Şu anki
boş ülke katmanı bir UI ayar sorunu değildir; uygulamanın ana veri entegrasyonu
eksiğidir. Araştırma ve indirme hazırlığı bu eksikliğin kapandığı sayılmaz.

## Erişim ve kanıt sınırları

Resmî README/lisans/release metadata'sı tarayıcı araştırma aracıyla okundu.
Nature makalesi `10.1038/s41597-025-04516-9` bu koşuda yönlendirme hatasıyla
açılamadı; makale yeniden okunmuş sayılmadı. Gerçek ZIP/10m GeoJSON içeriği
bu ortamda DNS engeli nedeniyle alınamadı; satır veya geometriler gözlemlenmedi.
2025–2026 kapsamı, her yıl dünya tamlığı veya doğruluk yüzdesi vaat edilmez.

Araştırma tarihi/sabit sürüm seçimi bu dokümana kaydedildi. Yeni dış paket,
uzaktan tile, görsel, tarihî üretim verisi veya kaynak onayı eklenmedi.

## Teslim ve doğrulama kaydı

| İş                                    | Durum / gerçek kanıt                                                                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ana ekran ölçek yazısı                | **IMPLEMENTED**: harita üstü rozet kaldırıldı; Keşfet'te ölçek metni yok. Atıf ve güncel fiziksel referans açıklaması korunur.                                             |
| Mevcut50m paket                       | **PRESERVED / CHECK PASS**:1420feature; kurulu source/generated/manifest, lock ve katalog SHA'ları değişmedi. [Bütünlük](reports/map-research/preserved-user-assets.json). |
| Kaynak karşılaştırması ve indirme CLI | **IMPLEMENTED**: sabit sürümler, six-file edinme planı, bounded/stream/receipt/cache. Gerçek dosya payload incelemesi değildir.                                            |
| `npm run check`                       | **exit0**:260ana+5worker, lint/strict native+webTS, asset/data/hash/formatter. [Log](reports/map-research/check.log).                                                      |
| `npm run web:export`                  | **exit0**; gerçek browser açılışı değildir. [Log](reports/map-research/web-export.log).                                                                                    |
| `npm run android:bundle`              | **exit0**; Hermes+DOM JavaScript; APK/cihaz değil. [Log](reports/map-research/android-export.log).                                                                         |
| `npm run data:download`               | **BLOCKED / exit1**: EAI_AGAIN ilk10mkara isteği; raw dosya/ZIP alınamadı. [Log](reports/map-research/download-attempt.log).                                               |
| `npm run data:download -- --list`     | **exit0**;6sabit kaynak ve sınır listelendi. [Log](reports/map-research/source-list.log).                                                                                  |
| `npm run test:web -- --list`          | **exit0**;104senaryo/15dosya yalnız liste; PASSbrowser sayısı değil. [Log](reports/map-research/browser-list.log).                                                         |
| Üretim E2E                            | **BLOCKED / exit1**: previewsunucusu başlayamadı; gerçek görüntü0. [Log](reports/map-research/browser-run.log).                                                            |
| Android gerçek cihaz                  | **UNVERIFIED ON DEVICE**:Java/adb/SDKyok. [Ortam](reports/map-research/environment.log).                                                                                   |
| Yeni ayrıntılı harita / ülke katmanı  | **PARTIAL / veri bekleniyor**: indirme hazırlığı bitti; render/üretim adaptörü bu araştırmanın teslimi değildir.                                                           |

Yeni3unit testi; sabit kaynak/version/rights, gerçek geçici dosyada SHA/cache,
receipt'siz/bozuk veriyi koruma, HTTP404, yanıltıcı Content-Length ve gerçek
streambyte taşması, boş cevap,2deneme ve Retry-After/defer davranışını sentetik
cevaplarla doğrular. Gerçek dosya indirildi veya ülke gösterildi iddiası yok.

Değişen dosyalar: `src/atlas/AtlasScreen.tsx`, `src/i18n/tr.ts`, yeni
`scripts/map-sources.mjs`, yeni `tests/unit/map-sources.test.mjs`, `tests/run.mjs`,
`package.json` scripti, `.gitignore`, `.prettierignore`, `eslint.config.mjs`,
README/progress/source-matrix/license-register ve bu araştırma raporu.
`git status --short` yine exit128; .git bu ortamda görünmedi. Kullanıcı verileri
silinmedi, yeni dependency kurulmadı. Lisans onayı belirsiz hiçbir şey üretime
alınmadı. Yayın NO-GO ve önceki güvenlik/platform kapıları sürer.
