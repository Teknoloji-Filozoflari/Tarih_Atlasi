# Türkiye açılışı, keşif kartları ve güncel şehirler

18 Ekim 2026 (Europe/Istanbul). Mevcut React Native/Expo/MapLibre Küre iyileştirildi.
AGENTS.md, README, progress ve önceki kompakt ülke raporu okundu. Yerel dört
JPEG yalnız işlevsel referans olarak incelendi; ekran/görsel/veri kopyalanmadı.
Git kökü bulunamadı (status exit128); Git başlatılmadı veya dosyalar sıfırlanmadı.

## Kapsam ve durum

| Alan | Durum | Sonuç |
| --- | --- | --- |
| Açılış / sıfırla | IMPLEMENTED | Türkiye merkezli35°D39°K,zoom4. Bu bir kamera tercihi; ülke merkezi/başkent iddiası değildir. URL/yer imi ve açık odaklama kameraları öncelikli. İlk yıl2000korundu. |
| Kısa kişi/olay kartı | IMPLEMENTED | Ad, yaşam/olay zamanı, kısa özgün Türkçe bilgi, konum kanıtı/eksikliği ve Wikipedia işlemi. Uzun metinler Ayrıntıları göster/Kaynakları gör/Veri belirsizliği altında. |
| Kişiler | PARTIAL | Kullanıcının10kişisi arama/katalogda. Beşinin ayrı dönemli yer ilişkisi var; yaklaşık tercihiyle görünür. Diğer beşine nokta uydurulmadı. |
| Savaşlar | PARTIAL | 7ek olay/harekât; önceki4ile11olay. Tüm büyük savaşlar kapsamı sağlanmadı. Dört ek harita noktası; konumsuz üçü listede/aramada. |
| Kümeler | IMPLEMENTED | Kişi+olay aynı ekransal kümeye girebilir; yuvarlak sayı,48px hedef, seçili halka, kapalı/arka yüz/drag koruması, yakınlaşma ve8li seçim sayfası.1000girdi/64DOMküme sınırı sürer. |
| Güncel şehir | PARTIAL | İstanbul,Ankara,İzmir,Antalya,Bursa,Medine. Zoom4+ bağımsız tercih; tarihî kapsama dahil edilmez. Küçük güncel etiketi ve ayrı kart; canlı nüfus/haber/kuruluş tarihi yok. |
| Görseller | BLOCKED FOR MEDIA IMPORT | Portre/tabloların dosya lisansı ayrı incelenmedi; görseller eklenmedi. Kişi simgesi projeye ait basit SVG; innerHTML yok. |
| Libya/Çad | IMPLEMENTED | Kaynak incelemesiyle gelen pack:null geometri, doğrulanmış repository üzerinden renderer yükleme yolunda tanındı. Paket/koordinat/ülke dönemi değiştirilmedi. |
| Gerçek web/Android | NOT TESTED / UNVERIFIED ON DEVICE | Aşağıdaki gerçek komut loglarına bakın; export bir GPU/cihaz sertifikası veya APK değildir. |

## On kişinin kaynakları

Bütün kaynaklar aynı JSON içinde açıkça etiketli editöryal olgu çıkarımıdır;
özgün API yanıtı gibi sunulmaz. Revizyon/locator/ham SHA/dönüşüm/CC0 korunur.
Wikipedia başlığı/URL'si yazılmadı; mevcut güvenli çözümleyici yalnız kullanıcı
eyleminde gerçek Wikidata sitelinkini çözer (TR→EN→Wikidata).

| Kişi | Revizyonlu kaynak | Tarih/konum kararı |
| --- | --- | --- |
| Hz. Muhammed | [Q9458](https://www.wikidata.org/w/index.php?title=Q9458&oldid=2557655631) | P569:570,latest580; alternative571; P570:632. Doğum yılı kesinleştirilmedi; takvim/gün dönüşümü yapılmadı. |
| Isaac Newton | [Q935](https://www.wikidata.org/w/index.php?title=Q935&oldid=2556999905) | P569:4Jan1643 Gregorian /25Dec1642 Julian; P570:31Mar1727 Gregorian /20Mar1727 Julian. Yalnız Gregoryen yıllar alınır. |
| Hz. İsa | [Q302](https://www.wikidata.org/w/index.php?title=Q302&oldid=2556284316) | P569 alternatifleri7BCE,2BCE,circa5BCE(earliest6/latest4); P570:30CE/33CE. Uçlar alternatiflerin zarfıdır, kesin yaşam veya konum kanıtı değildir. |
| Buda | [Q9441](https://www.wikidata.org/w/index.php?title=Q9441&oldid=2555622813) | P569:623BCE/563BCE/1stmillenniumBCE; P570:543BCE/483BCE ve başka tahminler. Çelişen kronolojilerden tek yaşam aralığı seçilmedi; tarihler bilinmiyor. |
| Konfüçyüs | [Q4604](https://www.wikidata.org/w/index.php?title=Q4604&oldid=2553435754) | P569:552BCE/551BCE,circa; P570:479BCE. Antik takvim gün dönüşümü yapılmadı. |
| Aziz Paul | [Q9200](https://www.wikidata.org/w/index.php?title=Q9200&oldid=2549174360) | P569:circa5CE; P570:circa66CE,earliest64/latest67. Yaklaşık yaşam, yıllık konum kanıtı değildir. |
| Cai Lun | [Q229235](https://www.wikidata.org/w/index.php?title=Q229235&oldid=2530393820) | P569:48/50/62CE alternatifleri; P570:121. Doğum aralığı alternatif zarfı; gün üretilmedi. |
| Johannes Gutenberg | [Q8958](https://www.wikidata.org/w/index.php?title=Q8958&oldid=2538954737) | P569:circa1400,earliest1393/latest1406; P570:1468. 3Feb1468 iddiası deprecated/fabrication olduğundan gün alınmadı. |
| Kristof Kolomb | [Q7322](https://www.wikidata.org/w/index.php?title=Q7322&oldid=2556620244) | P569:1450/1451 alternatifleri; P570:19/20/21May1506. Günler arasında karar verilmedi; yalnız yıl korunur. |
| Albert Einstein | [Q937](https://www.wikidata.org/w/index.php?title=Q937&oldid=2557626532) | P569:14Mar1879 Gregorian; P570:18Apr1955. Yıl hassasiyetine indirildi; yaşam konum kanıtı değildir. |

Buda için tek yaşam kronolojisi seçilmedi: tarih bilinmiyor; aramada bulunabilir,
yıl filtresinde yaşadığı/konumda olduğu iddia edilmez. Newton'da1643Gregoryen
yıl,1642Jülyen kaydıyla kaynak notunda ayrılır; sessiz yıl dönüşümü yapılmaz.
Gutenberg'in deprecated ölüm günü kullanılmaz. Kolomb'un ölüm günleri arasında
karar verilmez. Yaklaşık yaşam zarfı bir yıllık mevcudiyet kanıtı değildir.

### Haritada gösterilebilir kişi ilişkileri

| Kişi / ilişki | Destek | Konum kaynağı | Sınırlama |
| --- | --- | --- |
| Hz. Muhammed · RESIDENCE | 622–632 | [Q35484](https://www.wikidata.org/w/index.php?title=Q35484&oldid=2557628444) | Yalnız P551 dönemli ikamet; günlük mevcudiyet değil. Modern yer temsil noktası; ölçülmüş tarihî koordinat/rota değil. |
| Isaac Newton · BIRTH | 1643–1643 | [Q3316008](https://www.wikidata.org/w/index.php?title=Q3316008&oldid=2491613171) | Yalnız doğum/ölüm yılının snapshotı. Modern yer temsil noktası; ölçülmüş tarihî koordinat/rota değil. |
| Albert Einstein · BIRTH | 1879–1879 | [Q3012](https://www.wikidata.org/w/index.php?title=Q3012&oldid=2550428227) | Yalnız doğum/ölüm yılının snapshotı. Modern yer temsil noktası; ölçülmüş tarihî koordinat/rota değil. |
| Johannes Gutenberg · DEATH | 1468–1468 | [Q1720](https://www.wikidata.org/w/index.php?title=Q1720&oldid=2550420128) | Yalnız doğum/ölüm yılının snapshotı. Modern yer temsil noktası; ölçülmüş tarihî koordinat/rota değil. |
| Kristof Kolomb · DEATH | 1506–1506 | [Q8356](https://www.wikidata.org/w/index.php?title=Q8356&oldid=2550851135) | Yalnız doğum/ölüm yılının snapshotı. Modern yer temsil noktası; ölçülmüş tarihî koordinat/rota değil. |

Hepsi medium güven/representative-place: varsayılan kapalı yaklaşık kişi
konumu seçeneği gerekir. Kaynağın yıl ve yer iddiası birlikte incelendi.
Konfüçyüs'ün ölüm yeri Lu devlet/bölge ölçeğinde: Qufu merkeze taşınmadı.
Eski VanGogh/Cuesmes tek ev konumu askısı aynen sürer; yeni Einstein1879
snapshotı bunu yeniden onaylamaz. Açık nearest önizleme1878/1880talebinde
1879kaynağını gösterebilir; istek yılı/kaynak yılı ayrı ve uyarı sürekli kalır.

## Ek savaş/olay kaynakları

| Kayıt | Kaynak | Yıl | Harita |
| --- | --- | --- |
| Malazgirt Muharebesi · BATTLE | [Q200032](https://www.wikidata.org/w/index.php?title=Q200032&oldid=2517526052) | 1071–1071 | Kaynağın yaklaşık temsil noktası; cephe/bütün savaş alanı değil. |
| İstanbul’un Fethi · BATTLE | [Q160077](https://www.wikidata.org/w/index.php?title=Q160077&oldid=2541630922) | 1453–1453 | Kaynağın yaklaşık temsil noktası; cephe/bütün savaş alanı değil. |
| Mohaç Muharebesi · BATTLE | [Q178510](https://www.wikidata.org/w/index.php?title=Q178510&oldid=2538088482) | 1526–1526 | Kaynağın yaklaşık temsil noktası; cephe/bütün savaş alanı değil. |
| Çanakkale Kara Harekâtı · CAMPAIGN | [Q164983](https://www.wikidata.org/w/index.php?title=Q164983&oldid=2546713430) | 1915–1916 | Kaynağın yaklaşık temsil noktası; cephe/bütün savaş alanı değil. |
| Sakarya Meydan Muharebesi · BATTLE | [Q594015](https://www.wikidata.org/w/index.php?title=Q594015&oldid=2497463762) | 1921–1921 | Geometri yok; arama/yıl listesinde. Nokta türetilmedi. |
| I. Dünya Savaşı · WAR | [Q361](https://www.wikidata.org/w/index.php?title=Q361&oldid=2547414580) | 1914–1918 | Geometri yok; arama/yıl listesinde. Nokta türetilmedi. |
| II. Dünya Savaşı · WAR | [Q362](https://www.wikidata.org/w/index.php?title=Q362&oldid=2553978185) | 1939–1945 | Geometri yok; arama/yıl listesinde. Nokta türetilmedi. |

CAMPAIGN askeri harekâtı BATTLE/WAR'dan ayırır; savaş katmanı/filtrelerine
uyumludur. Çanakkale kaydı yalnız25Nisan1915–9Ocak1916kara harekâtı
kapsamıdır;18Martdeniz harekâtının tümü gibi sunulmaz. Dünya savaşları bir
şehir/ülke merkezine sabitlenmedi. Kaynakların eksik doğrudan referansları ve
bağımsız doğrulama sınırı locator'da açık kalır; structured veri incelemesi
kesin tarihsel hakikat sertifikası değildir.

## Şehirler ve haklar

- İstanbul: [Q406](https://www.wikidata.org/w/index.php?title=Q406&oldid=2556807961) P625; modern temsil noktası.
- Ankara: [Q3640](https://www.wikidata.org/w/index.php?title=Q3640&oldid=2550350736) P625; modern temsil noktası.
- İzmir: [Q35997](https://www.wikidata.org/w/index.php?title=Q35997&oldid=2544620007) P625; modern temsil noktası.
- Antalya: [Q6487](https://www.wikidata.org/w/index.php?title=Q6487&oldid=2548521984) P625; modern temsil noktası.
- Bursa: [Q40738](https://www.wikidata.org/w/index.php?title=Q40738&oldid=2555061844) P625; modern temsil noktası.
- Medine: [Q35484](https://www.wikidata.org/w/index.php?title=Q35484&oldid=2557628444) P625; modern temsil noktası.

Şehirler HistoricalPlace/TemporalExtent'e dönüştürülmez. Üstündeki tarih
tarihî katmanları değiştirir; şehir adı geçmişte aynı adla/ölçekte var olma
iddiası değildir. Güncel siyasi ülke/ad/egemenlik katmanı eklenmedi.
Kaynak toplama tarihi snapshot incelemesidir; canlı şehir verisi değildir.
Veri CC0: [Wikidata lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing).
Makale/görsel lisansı ayrıdır; yalnız dış makale bağlantısı var.

## Mimari ve sınırlar

Tek MapLibre6.14globe, web doğrudan/Android tekExpoDOM korunur. Modern şehir
seçimi küçük version1 city.selected zarfında yalnız katalog ID taşır; şema
bilinmeyen ID/alan/URL'yi reddeder. Modern şehir tercihi geriye uyumlu
isteğe bağlı boolean; eski yer imi/URL/tercihler silinmez. Geometri köprüden
taşınmaz. HTML şablonu/uzak font/tile/harita SDK'sı eklenmedi.

Katalog0.7.0-discovery:106kayıt/35kaynak/35girdi,425675UTF8byte;512KiB
bootstrap bütçesi sürer. Meşru kaynak artışı nedeniyle yalnız toplam input
şema üst sınırı32→64;65girdi ret testi var. Dönüşüm input32 ve chunk
kaynak kapanışı32,256KiBchunk,1000kayıt,512manifest sınırları korunur.
86LODmanifest girdisi/44farklı hashli chunk. Ülke374immutable.atlas/ham
manifest/araştırmaCShapes değişmez; tarihî dünya tamlığı iddiası eklenmez.

## Değişen dosyalar

- Kamera/köprü: src/map-contract/protocol.ts, viewport.ts, src/map/useGlobeHost.ts, src/map/ViewportFrame.tsx.
- Renderer: src/map/globe/renderer.ts, person-markers.ts, modern-city-markers.ts, markers.css, GlobeView.tsx; src/persons/clustering.ts.
- Libya/Çad renderer düzeltmesi: src/map/globe/application-loader.ts, data-loader.ts.
- Kartlar/UI: src/atlas/PersonCard.tsx, EventCard.tsx, RecordDetails.tsx, ArticleAction.tsx, ModernCityCard.tsx, AtlasScreen.tsx, LayersDrawer.tsx, LegendPanel.tsx, AttributionPanel.tsx.
- Model/tercih: src/domain/types.ts, schemas.ts, src/events/model.ts, src/preferences/model.ts, src/theme/tokens.ts, src/i18n/tr.ts, src/privacy/policy.ts.
- Kaynak/derleme: data/pilot/raw/discovery-facts.json, scripts/pilot/discovery.mjs, build.mjs, check.mjs, cli.mjs; src/data/pilot-contract.ts; src/places/modern.ts, generated/modern-cities.ts.
- Üretilen katalog: src/data/generated/pilot.ts, data/pilot/production/{catalog.json,manifest.json,review-report.json,NOTICE.txt,events.geojson,person-locations.geojson,boundaries-*.geojson}; src/data/chunks/generated/*, public/data/chunks/* (yalnız üretilen hashli dosyalar).
- Atıf: assets/licenses/Wikidata-discovery-NOTICE.txt; README, THIRD_PARTY_NOTICES.md; docs/progress.md, architecture.md, product-requirements.md, license-register.md, source-matrix.md, data-quality.md, release-blockers.md, privacy-policy.md; data/pilot/README.md.
- Test: tests/unit/discovery-content.test.mjs, renderer.test.mjs, world.test.mjs; kaynak kapsamı değişen foundation/persons/events/sources/release-audit testleri; tests/run.mjs.
- Browser: tests/web/discovery-content.spec.ts ve değişen kaynak/kart/versiyon beklentili product-flows/sources/events/persons/loading/release-audit testleri; package.json test:web:production yeni6senaryoyu içerir. Bağımlılık/lockfile değişmedi.

## Kullanıcı denemesi

1. Çalışan sunucuyu Ctrl+C ile durdur; npm run web -- --clear. Yeni indirme/kurulum gerekmiyor.
2. İlk açılış2000/Türkiye; zoom4+ şehir adına bas: güncel kart ve Wikipedia. Katmanlar → Güncel şehirler ile bağımsız kapat/aç.
3. Arama → IsaacNewton/Buda/vb: kısa bilgi ve Wikipedia. Newton için1643yılı + Katmanlar → yaklaşık kişi konumları; yalnız doğum ilişkisi. Einstein1879, Gutenberg1468, Kolomb1506.
4. Hz.Muhammed622–632, aynı yaklaşık tercih; Medine dönemli ilişki. Diğer yaşam yıllarına nokta taşınmaz.
5.1453İstanbul,1071Malazgirt,1526Mohaç,1915–1916Çanakkale: Savaş katmanı açıkken marker. Sakarya1921 ve dünya savaşları arama/yıl listesinde, geometri yok.
6. Kaynakları gör/Veri belirsizliği/Ayrıntıları göster erişilebilir; ©atfı kalıcı.

## Doğrulama kanıtı

Son komutlar ve durumlar aşağıda tamamlanır; önceki başarısız koşular ayrı
loglarda korunur. Unit testler CPU/DOM çiftleri ve gerçek yerel veri kullanır;
WebGL/FPS/gerçek browser veya Android dokunma kanıtı sayılmaz.

| Kontrol | Gerçek sonuç | Kanıt |
| --- | --- | --- |
| Ana unit / regresyon | 318 PASS, 0 FAIL | check.log |
| Worker | 5 PASS, 0 FAIL | check.log |
| Lint / native+web strict TS | PASS | check.log |
| Globe/basemap/physical/pilot/sitelinks/chunks/world/review/identity | PASS | check.log |
| Web export | PASS, 4 rota | web-export.log |
| Android export | PASS, Hermes+DOM JS; APK/cihaz testi değildir | android-export.log |
| Yeni browser senaryoları | 6 yalnız listelendi; production 50 senaryo/7 dosya listesi | production-list.log |
| Chromium launch | BLOCKED, exit 2, EPERM | browser-launch.log |
| Görsel/screenshot | NOT TESTED, 0 screenshot | Chromium başlatılamadı |
| Java/adb/Android SDK | BLOCKED, exit 1, ENOENT | environment.log |
| Gerçek Android GPU/pinch/TalkBack/performans | UNVERIFIED ON DEVICE | Cihaz bağlantısı/yapılandırma yok |
| Kapsam / gerçek kaynak geometrisi | PASS, host denetimi; tarihsel hakikat/GPU sertifikası değil | scene-proof.json, catalog-coverage.json |

İlk koşularda eski katalog/sayım beklentileri, ayrı event küme sayısı ve
renderer'da kalan events adı düzeltildi; testler silinmedi veya kapsam eşikleri
düşürülmedi. Kaynaklı Einstein 1879 snapshotı eklenince eski 'bütün 1879 kişi
coğrafyası boş' beklentisi geçersiz oldu: şimdi doğum snapshotı açıkça beklenir,
1878/1880 direkt sorguda 0, yalnız bilinçli nearest önizlemede kaynak 1879
etiketiyle gelir. Van Gogh IDleri yine yayımlanmaz. Girdi 32 sınırı 35 gerçek
kaynakta ret verdi; 64 bounded kararı ve 65 ret testiyle çözülür.
İlk check zinciri yalnız son formatter'da data/pilot/README.md için exit 1
verdi; dosya formatlandı, son tam check koşusu ayrıca tutulur.

Yeni bağımlılık/indirme yok; npm audit bu tur yeniden çalıştırılmadı. Canlı
Wikidata/CORS/pop-up/native tarayıcıya dönüş ve gerçek görüntü/dokunma
bu ortamda NOT TESTED. Genel yayın NO-GO sürer. Sonraki ürün fazına geçilmedi;
önkoşullar gerçek platform kabulü, daha geniş içerik için yeni kaynak inceleme
partileri ve portreler için dosya bazında medya lisansıdır.

Son tam `npm run check`: **exit 0**; tüm kapılar ve formatter PASS.
[Komut durumları, loglar ve SHA-256 kanıtları](turkey-discovery/commands.json).
