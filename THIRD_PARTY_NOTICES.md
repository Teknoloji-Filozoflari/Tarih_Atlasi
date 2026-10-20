# Üçüncü taraf kod ve varlıklar

## GitHub / Docker preview distribution — 21 October 2026

Project source and the original promotional SVG banner are MIT licensed.
English-Desk was reviewed as an installation UX reference; no GPL application
code or visual assets were copied. Data licenses below remain separate.
The Node/Debian base image retains its own notices and licenses.
Web packages copy existing data notices and available locked npm root notices
under `/licenses/`, with package versions, license declarations and source
tarball/integrity metadata. This inventory does not replace the outstanding
independent license/security review or approve a stable release.

## Contemporary roads — OpenFreeMap / OpenStreetMap / OpenMapTiles

Online vector tiles: https://tiles.openfreemap.org/planet/latest/{z}/{x}/{y}.pbf
Data © OpenStreetMap contributors, ODbL-1.0:
https://www.openstreetmap.org/copyright
OpenMapTiles schema © OpenMapTiles, CC BY 4.0:
https://openmaptiles.org/docs/schema/
Hosted by OpenFreeMap: https://openfreemap.org/ (service code MIT).
Our custom layers draw current roads, landcover, water and buildings; omit modern
political boundaries/labels. No hosted style, fonts, sprites or screenshot assets
copied. No tile data is bundled or offered as an offline download.
Reviewed 2026-10-18: https://openfreemap.org/tos/
[Implementation and verification](docs/reports/atlas-colors-roads.md).

## Installed GeoNames world places — 18 October 2026

GeoNames contributors, CC BY4.0. Installed248country/territory entries and
5,616,753 contemporary settlement/admin/section records,16,102hash-validated
packs (645,992,949bytes). Original attribution, receipts and source dates remain
in `src/places/generated/world/{catalog.ts,NOTICE.txt}`. Web distribution copies
the licensed data and NOTICE into `dist/data/places`; it does not include
Wikipedia prose or Commons images. This packaging fix adds no external source
and asserts no complete official district inventory or historical validity.
[License](https://creativecommons.org/licenses/by/4.0/),
[source and validation report](docs/reports/metro-places.md).

## Ottoman people — 18 October 2026

Wikidata contributors, CC0-1.0 structured facts. Release 1.2.0-births contains
33 additional profiles, 22 approximate birth-year points, 8 biographical-only
place associations and 3 unlocated profiles. 33 person /12 used place /5
editorial source IDs are pinned to reviewed inputs and immutable revisions.
No Wikipedia/Commons/TDV prose, images or geometry redistributed. TDV entries
are research cross-checks; their text is not relicensed as CC0.
[NOTICE](assets/licenses/Wikidata-ottoman-people-NOTICE.txt),
[reviewed sources](docs/reports/ottoman-people-coverage.md).

Earlier catalogs are now 1.0.1-births (62 annual births/24 biographical) and
1.1.1-births (25 annual births/3 biographical). Five former annual points remain
accessible as biographical associations after uncertainty review. Counts below
describe the earlier releases at their original review time.

## Expanded requested people — 18 October 2026

Wikidata contributors, CC0-1.0, structured facts only. Additional29person
sources,28place sources and4editorial review sources, pinned release1.1.0-births.
26birth-year-only approximate points; EleaticZeno andOsmanIbiographical only;
one additional profile without birth geometry. No Wikipedia prose/Commons
portraits; unknown death is not replaced by an invented year. User request
spellings are search hints, separate from historical source assertions.
[License](https://www.wikidata.org/wiki/Wikidata:Licensing),
[NOTICE](assets/licenses/Wikidata-expanded-people-NOTICE.txt),
[per-request status and source review](docs/reports/requested-people-coverage.md).

## Wikidata reviewed birth facts — 18 October 2026

Wikidata contributors, **CC0-1.0**, structured facts only. 111 requested person
profiles and 83 distinct coordinate sources; 14 separate editorial review
sources. Each source has its actual pinned revision. 66 birth-year-only
approximate points, 20 biographical place associations; no arbitrary substitute
year or place. The browser editorial extraction is not an API response or an
independent historical certificate. Turkish review notes are authored here;
no Wikipedia article prose or Commons portraits copied. The Turkish Ministry
of Culture biography was used only to cross-check Atatürk's year/place facts;
its page or images are not redistributed. [License](https://www.wikidata.org/wiki/Wikidata:Licensing),
[NOTICE](assets/licenses/Wikidata-births-NOTICE.txt),
[per-person sources and decisions](docs/reports/person-birth-coverage.md).

## GeoNames optional global settlement/admin catalog — 18 October 2026

GeoNames contributors, **CC BY4.0**, separate from MIT code and Wikidata CC0.
The global dump is **not installed yet** in this workspace (terminal DNS failure).
The pipeline selects contemporary P and ADM1–4 points, joins administrative names
by source codes and splits cell/LOD packs; preserves source names/coordinates.
No historical validity, district polygons or guessed Wikipedia URLs. Source data
has no completeness/accuracy/timeliness warranty. [NOTICE](assets/licenses/GeoNames-NOTICE.txt),
[source README](https://download.geonames.org/export/dump/readme.txt),
[license](https://creativecommons.org/licenses/by/4.0/). Once prepared, exact
receipts, hashes, dates, coverage and snapshot NOTICE live in
`src/places/generated/world`; `places:check` verifies them. Attribution is always
accessible in-app. No new code/tile/media dependency.

## Wikidata discovery facts — 18 October 2026

Structured facts for10requested people,7additional events/campaigns,6modern
settlement references and4linked place records: CC0-1.0, Wikidata contributors.
Snapshot source revisions and raw digest retained; editorial extraction, not
an API response. No Wikipedia prose/Commons images copied. Turkish short
summaries authored by Tarih Atlası. Modern city coordinates are references,
not past-year place evidence. See [NOTICE](assets/licenses/Wikidata-discovery-NOTICE.txt)
and [source-by-source review](docs/reports/turkey-discovery.md).

**18 Ekim 2026 — Çad/Libya incelemesi:** Cliopatria / Seshat Global History
Databankv0.2.1(Bennett et al.), CC BY4.0; yalnız13239/13370/13580kaynak satırları.
[Kaynak](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1),
[lisans](https://creativecommons.org/licenses/by/4.0/),
[değişiklik/atıf/hash bildirimi](assets/licenses/country-review-NOTICE.txt).
Dönem/kenar/delikler korunur; halka yönü normalleşti, Çad'ın tek noktalı halka
teması doğrulandı. Libya kısa ülke adıyla sunulur; eski rejim başlığının bütün
döneme uygunluğu iddia edilmez. Atıf ©/kaynak ayrıntılarında erişilebilir.
CShapes, yeni dış bağımlılık veya makale/görsel kopyası alınmadı.

**17 Ekim 2026 — kaynak kimliği dizini ve kısmi alan incelemesi.**
Cliopatria / Seshat Global History Databank v0.2.1 (Bennett et al.),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
[kaynak](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1).
13375kaynak Wikidata kimliği mevcut arşivden çıkarıldı; başlık tahmini,
makale metni veya görsel yok. [Tam bildirim ve hash'ler](assets/licenses/Cliopatria-identity-NOTICE.txt).
Fransa kaynağının yalnız değiştirilmeyen anakara/Korsika parçaları kısmi alan
olarak tutuldu; aynı Hollanda geometrisinin ikinci çizimi çıkarıldı. Kaynak
paketleri/atıfları korunur; efektif431askı kaydı vardır. Bu, bağımsız tarihî
doğrulama değildir.

Kullanıcı tıklamasıyla çözülen Wikidata sitelink olguları ayrıca **CC0**;
Wikipedia/Commons metin ve görsel hakları kapsam dışıdır. Chronas verisi,
geometrisi veya kodu alınmadı. CShapes yalnız yerel araştırma girdisi,
üretim onayı yok. Yeni npm/native/font/tile bağımlılığı yok.
[Güncel lisans ve atıf sicili](docs/license-register.md),
[MS2010 kaynak ve değişiklik raporu](docs/reports/application-review-2010.md).
Aşağıdaki notlar kendi sürümlerinin envanteridir.

**17 Ekim 2026 — ülke verisi ikinci incelemesi:** Cliopatria/Seshat0.2.1
CC BY4.0 dünya paketlerinin kaynak atfı `assets/world/NOTICE.txt` ve paketlerin
kendi içindedir. Kaynak koordinatları korunur; izole teğet halka doğrulaması
düzeltildi,12ad/dönem kaydı incelemeye ayrıldı.430satır askıdadır; bağımsız
tarihî doğruluk onayı değildir. CShapes/geoBoundaries/başka atlas geometrisi
paketlenmedi; yeni dış npm/native bağımlılık yok.
[Güncel lisans sicili](docs/license-register.md),
[araştırma ve doğrudan kaynaklar](docs/country-data-research.md).

**17 Ekim 2026 — ülke çizimi/ad sunumu:** GeaCron yalnız görsel yön için
referanstır; kendisinden veri, geometri, kod, font, renk değeri veya görsel
alınmadı. Yeni üçüncü taraf varlık/paket yok; mevcut veri atıfları korunur.
[Değişiklik ve doğrulama kaydı](docs/reports/political-map-presentation.md).

**16 Ekim 2026 — yeni veri bildirimleri:**

- Natural Earthv5.1.2 10m land/lakes/rivers, **public domain**.
  Made with Natural Earth. [Koşullar](https://www.naturalearthdata.com/about/terms-of-use/).
  Ad/özellikler çıkarıldı; boş bir river feature atlandı. Çağdaş referanstır.
- Cliopatria / Seshat Global History Databank v0.2.1 (Bennett et al.),
  **CC BY4.0**, yalnız açık seçilmiş16kaynak satırı.
  [Kaynak veri](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1),
  [lisans](https://creativecommons.org/licenses/by/4.0/),
  [özgün lisans kopyası](assets/licenses/cliopatria-v021-LICENSE.md).
  Dönüşümler: halka yönü, gerektiğinde bütün özgün bileşenlerin ayrı Polygon
  kayıtları yapılması; kimlik ve Türkçe gösterim adları. Koordinatlar korunur.
  Yaklaşık rekonstrüksiyon; bağımsız tarihî doğrulama iddiası yok.
  Atıf/lisans/değişiklik notu pilotNOTICE/chunk/kart içinde de korunur.

Yeni npm/native bağımlılığı, tile, makale metni veya medya yok.
[Detaylı sicil](docs/license-register.md), [provenance](assets/licenses/physical-detail-provenance.json).
Aşağıdaki eski “paketlenmedi” notları kendi tarihlerine aittir.

**Faz16 güncel:** yeni dış paket/görsel/tile/makale eklenmedi.
[Atıf denetimi](docs/attribution-audit.md) kullanılan kod/veri/font haklarını
ayırır; [873lock girdisi envanteri](docs/reports/phase-16-dependency-licenses.json)
tam NOTICE onayı değildir. Kişi konum coğrafyası inceleme nedeniyle askıda;
özgün Wikidata atfı/provenance korunur. `public/data/chunks/NOTICE.txt` yayın
incelemesi1.0.0 kaydını taşır; eski konum chunk'ı manifest/public/generated
fallback'ten çıkarıldı. Aşağıdaki tarihî kurulum notları önceki fazlara aittir.

Bu projenin kendi kodu/belgeleri kökteki MIT lisansına tabidir. Harici kod ve veri
kendi lisanslarını korur. Faz 01'de hedef paketlerin kurulumu engellidir; bu dosya
tamamlanmış transitif bildirim envanteri veya uygulama dağıtım onayı değildir.

| Bileşen                       | Upstream lisans / kanıt                                                                                                                                                                    | Durum                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Expo, Router ve SDK modülleri | [MIT](https://github.com/expo/expo/blob/main/LICENSE)                                                                                                                                      | Hedef sürüm dosyaları/transitifler kurulum sonrası incelenecek                         |
| React / React DOM             | [MIT](https://github.com/facebook/react/blob/main/LICENSE)                                                                                                                                 | Aynı sürüm eşlemesi; paketler kurulu değil                                             |
| React Native                  | [MIT](https://github.com/facebook/react-native/blob/main/LICENSE)                                                                                                                          | Native bileşenler/Gradle bağımlılıkları ayrıca incelenecek                             |
| React Native Web              | [MIT](https://github.com/necolas/react-native-web/blob/master/LICENSE)                                                                                                                     | Web export boyutu henüz yok                                                            |
| Safe Area Context / Screens   | [Safe Area MIT](https://github.com/AppAndFlow/react-native-safe-area-context/blob/main/LICENSE), [Screens MIT](https://github.com/software-mansion/react-native-screens/blob/main/LICENSE) | Tam dosya ve native bildirim kontrolü bekliyor                                         |
| ESLint / eslint-config-expo   | [ESLint MIT](https://github.com/eslint/eslint/blob/main/LICENSE), Expo MIT                                                                                                                 | Henüz kurulmadı; tam lint çalışmadı                                                    |
| TypeScript                    | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt)                                                                                                                | 6.0.3 mevcut araç kopyasıyla sınırlı core tip/sözdizimi denetimi; projeye kurulu değil |
| Prettier                      | [MIT](https://github.com/prettier/prettier/blob/main/LICENSE)                                                                                                                              | 3.9.9 mevcut araç kopyasıyla format kontrolü; projeye kurulu değil                     |
| Playwright                    | [Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE)                                                                                                                    | Smoke senaryosu hazır, gerçek uygulama testi çalışmadı                                 |
| React TypeScript tipleri      | [DefinitelyTyped MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)                                                                                              | Hedef sürüm dosyaları incelenecek                                                      |

Paketler kurulunca `npm run dependencies:report` doğrudan sürüm, lisans etiketi ve
paketin kendi kurulu dosya boyutunu kaydeder. Bu boyut transitif toplam, gzip,
bundle veya APK boyutu değildir. Betik bütün LICENSE/NOTICE dosyalarını incelemenin
yerini almaz. Dağıtımdan önce transitif envanter ve gerekli bildirimler tamamlanır.

Faz 01 UI ikonları sistem metin glifleriyle yazıldı; ikon fontu/harici SVG veya
görsel kopyalanmadı. Harita/tile/glyph/font/veri dağıtılmadı. Historical Basemaps
ve diğer kaynak engelleri [lisans sicilinde](docs/license-register.md) korunuyor.

## Faz 02 harita prototipi

- **MapLibre GL JS 6.14.0**, [BSD-3-Clause](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/LICENSE.txt).
  Renderer/worker/CSS hedefi; kurulu değil. Tam dağıtım bildirimi hazırlık sırasında
  korunur, iki platformdaki lisans ayrıntılarına gömülür; transitif hak incelemesi bekliyor.
- **react-native-webview 13.16.1**, [MIT](https://github.com/react-native-webview/react-native-webview/blob/v13.16.1/LICENSE).
  Expo DOM'un kontrollü native wrapper hedefi; native/transitif lisans incelemesi bekliyor.
- **Natural Earth v5.1.2 ne_110m_land (1:110m)**,
  [public domain](https://www.naturalearthdata.com/about/terms-of-use/).
  “Made with Natural Earth.” Fiziksel kaynak; henüz indirilmedi/paketlenmedi.
  Hazırlık gerçek hash/byte ve dönüşümü `assets/licenses/globe-provenance.json` içine
  yazar. Çağdaş kıyılar geçmiş coğrafyasını temsil etmez.
- Koyu düz renk stili ve sentetik ◎ işaret projeye ait kod; dış tile/font/glyph
  kullanılmaz. Test fixture geometrileri ürünün kaynak verisi değildir.

Bu aşamada generated modüller null; bu dosya indirilmemiş MapLibre dağıtımının tam
LICENSE/NOTICE metni yerine geçmez. [Faz 02 sicil kaydı](docs/license-register.md).

Faz 03: yeni üçüncü taraf UI paketi, ikon/font/görsel veya veri eklenmedi. Atlas
bileşenleri ve sembol/renk eşlemesi proje MIT kodudur; Geographic History varlığı
kopyalanmadı. Önceki kurulum/transitif lisans engelleri devam eder.

Kurulum sonrası ek kayıt: Router'ın Android export'unda
@expo-google-fonts/material-symbols **0.4.50 / MaterialSymbols_400Regular.ttf**
bulunuyor. Wrapper MIT, font Apache-2.0; tam metinler
[wrapper bildirimi](assets/licenses/MaterialSymbols-WRAPPER-LICENSE.txt) ve
[font lisansı](assets/licenses/MaterialSymbols-FONT-LICENSE.txt) içinde korunur.
Projeye ait UI sistem fontu kullansa da transitif toplamda harici font vardır.
Tam release NOTICE denetimi tamamlanmadı.

Reanimated **4.5.1** ve Worklets **0.10.1**, MIT lisanslı SDK uyum hedefleridir;
manifest/lock sabit, gerçek hedef kurulumu bekliyor. Worker'ın MapLibre BSD metni
ve türev dönüşüm kaydı globe:prepare sırasında korunur. [Güncel rapor](docs/reports/phase-02-post-install.md).

Gerçek hazırlama tamamlandı: Natural Earth v5.1.2 ve MapLibre 6.14.0 dosyalarının
[provenance/hash kaydı](assets/licenses/globe-provenance.json) mevcut. Tam MapLibre,
Natural Earth atıf ve Material Symbols font/wrapper metinleri yerel lisans dosyaları
ile generated uygulama bildirimine eklendi. `npm run globe:check` bunları doğrular.
Tam transitif release incelemesi ve audit riskleri yine açıktır.

Faz 04: domain/şema/topoloji/ETL/indeks kodu projeye aittir (MIT); yeni dış paket
veya kaynak veri kopyası alınmadı. Kaynak lisans manifesti hak kararı/atıf metadata'sı
taşır; aday geometrileri dağıtmaz. Sentetik fixture'lar yalnız test içindir.
[Üretim lisans kapısı](docs/data-model.md), [sicil](docs/license-register.md).

Faz 05: **NARA 1867 Alaska antlaşması olgu çıkarımı / idealize meridyen kesiti,
CC0 1.0**. Görsel veya hazır GIS kopyası yok. Dar kapsam, kaynak ve türetim
[bildirimde](assets/licenses/NARA-pilot-NOTICE.txt),
[kalite raporunda](docs/data-quality.md) ve SHA/revizyon bağlı onayda korunur.
Bu bildirim iki platformun generated NOTICE modülüne ve pilot üretim paketine
eklendi. NARA arşivindeki bütün eserler için genel izin değildir.
Yeni npm bağımlılığı veya tile servisi eklenmedi; OHM/Historical Basemaps verisi alınmadı.

Faz 10: Wikidata Q5582/Q3280282 yapılandırılmış olgu pilotu **CC0-1.0**;
[Wikidata kişi NOTICE](assets/licenses/Wikidata-person-NOTICE.txt).
Tarayıcıdan incelenmiş editöryal çıkarım; özgün API JSON veya makale/görsel
kopyası değildir. Kişi/konum lisansı MapLibre/Natural Earth/font/kod
lisanslarından ayrıdır. Yeni dış bağımlılık veya görsel paketi yok.

Faz 11: dört Wikidata yapılandırılmış olay olgu kaydı **CC0-1.0**;
[olay NOTICE](assets/licenses/Wikidata-event-NOTICE.txt). Açık etiketli editöryal
çıkarım; özgün API/makale/görsel/polygon kopyası değildir. Yalnız Hastings
yaklaşık referans noktası dönüştürüldü. Historic England metni/geometrisi bu
pakete alınmadı. Yeni dış bağımlılık/görsel/font yok; önceki hak ayrımları sürer.

## Faz 12 — kimlik bağlantıları

Wikidata yapılandırılmış sitelink olguları CC0-1.0; Q5582/Q83224,
[ayrı NOTICE](assets/licenses/Wikidata-sitelink-NOTICE.txt). İki kaynak revizyonu
ve açık etiketli çıkarımın hash'i korunur. Wikipedia makalesi veya Commons görseli
kopyalanmadı; bu haklar CC0 kapsamında varsayılmaz. Natural Earth/OHM/Wikidata/
Wikipedia/Commons ve tile/style durumu atıf ekranında ayrıdır. Yeni npm paketi
veya render/font varlığı yok. Önceki tam transitif release NOTICE kapısı açık.

## Faz 13 — Expo FileSystem

**Expo FileSystem57.0.7**, MIT, copyright650 Industries. Önceden transitif kurulu
paket SDK57 uyum kaydıyla doğrudan sabitlendi. [Tam lisans](assets/licenses/Expo-FileSystem-LICENSE.txt)
atıf ekranına da eklendi. Legacy API bu sürümün resmî SDK57 yüzeyidir. Yerel
bookmark depo kodu projeye aittir; gerçek tarihî veri, tile veya görsel eklenmedi.
Tam transitif release NOTICE ve native build denetimi açık kalır.

Faz14: yeni üçüncü taraf paket/veri/servis/medya eklenmedi. Yerel katman/filtre
tercihleri aynı Expo FileSystem57.0.7 MIT bildirimi kapsamındaki adaptörü yeniden
kullanır. Natural Earth/Wikidata/NARA/sitelink atıfları tüm katmanlar kapalıyken
de erişilebilir. Lisans manifestleri ve üretim veri/asset hash'leri değişmedi.
Tam transitif NOTICE ve dağıtım inceleme kapıları açık kalır.

Faz15: mevcut izinli pilotun≤256KiB katalog parçaları ve LOD manifesti eklendi;
`public/data/chunks/NOTICE.txt` NARA/Wikidata atıflarını ve düşük zoom değişikliğini
taşır. Yeni dış paket, kaynak veri, görsel, makale veya tile servisi eklenmedi.
FileSystem57.0.7 MIT bildirimi korunur. Cache izni veri lisansını genişletmez;
üretim hak kapısından geçmeyen içerik otomatik offline pakete dahil edilmez.
