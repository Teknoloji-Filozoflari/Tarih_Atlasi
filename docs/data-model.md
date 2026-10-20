# Tarihî veri modeli ve veri hazırlama — şema v2

Faz 09 güncellemesi: CULTURE/CIVILIZATION/CULTURAL_REGION, kaynaklı kültürel
ilişkiler, üretimde zorunlu culturalContext ve opsiyonel ham Wikidata kanıtlı
sitelink; [sözleşmeler](cultural-layer.md). Bilinen entity dönemi/dönem boşluğuyla
çelişen siyasi/kültürel coğrafya artık reddedilir. ETL **1.3.0**, mevcut gerçek
katalog **0.2.0-pilot**, hak politikası **1.1.0**. Gerçek kültür alanı 0.

2026-10-15 · Faz 04 temeli, Faz 05 v2 ve Faz 06 zaman güncellemesi. Tarihî üretim pilotu artık
**1 antlaşma sınır kesiti / 6 toplam kayıt**; mevcut fiziksel Natural Earth tabanı
ayrı kalır. [Güncel kalite/kapsam](data-quality.md). Aşağıdaki v1 kararları,
sondaki v2 değişiklikleriyle birlikte okunmalıdır; eski faz raporları tarihîdir.

## Dosyalar ve sözleşmeler

| Alan | Giriş |
| --- | --- |
| Platform ortak tipler | `src/domain/types.ts`, dışa aktarımlar `src/domain/index.ts` |
| Çalışma zamanı şemaları | `src/domain/schema.ts`, `schemas.ts`, `temporal.ts`, `geometry.ts` |
| Katalog referans/semantik/üretim kontrolü | `src/domain/validate.ts` |
| Güvenilen kaynak/hak kuralları | `src/data/source-manifest.ts`, `src/domain/licensePolicy.ts` |
| Asenkron sağlayıcı ve indeksler | `src/data/provider.ts` |
| Node ETL | `scripts/etl/cli.mjs`, `pipeline.mjs` |
| Ayrı veri alanları | `data/raw`, `data/staging`, `data/production` |
| Sentetik testler | `tests/fixtures/historical.mjs`, `tests/unit/domain.test.mjs`, `etl.test.mjs` |

Yeni dış bağımlılık yok. Küçük, katı çalışma zamanı şema bileşenleri TypeScript ile
yazıldı; JSON Schema/Zod uyumluluğu iddiası yok. Bilinmeyen alanlar silinmez,
reddedilir. `parse(schema, unknown)` ve `validateCatalog(unknown, mode)` başarıda
tipli değer; hatada `code/path/message` listesi döndürür. En çok 100 hata kaydedilir.
HTTP/ağ veya dosya erişimi platform ortak domain/provider modüllerine girmez.

## Kimlik, kanıt ve semantik

Kayıt ve kaynakta kalıcı `namespace:id`, dil kodlu `names`, `alternativeNames`,
varsa QID, `temporal`, `confidence`, `reviewStatus`, `licenseId`, `attribution`,
`synthetic` bulunur. ID, ada/yıl filtresine göre yeniden üretilmez. Katalog genelinde
ID yinelenemez. `confidence` sayısal kesinlik puanı uydurmaz: high/medium/low/unknown,
gerekçe ve varsa kaynaklı mekânsal hata km değeri taşır. `unverified` varsayılan
hipotez durumudur; üretim için kayıt ve tarih ayrı ayrı `verified` olmalı.

`HistoricalEntity` kimlik türleri POLITY/KINGDOM/EMPIRE/CULTURE/PERSON/BATTLE/EVENT/PLACE.
Geometri ve tarihli iddialar kimlik kaydından ayrıdır:

| Kayıt | Ayrım / bağlantı |
| --- | --- |
| TerritoryVersion | Siyasi entity, interpretationId, zaman sürümü, alan geometrisi, documented/approximate/disputed sınır |
| CulturalRegion | Yalnız CULTURE entity; cultural-interaction/distribution, siyasi egemenlik değil |
| Person | PERSON entity; yaşam bilgisi, kendi başına bulunma iddiası değil |
| PersonLocation | Person ve isteğe bağlı HistoricalPlace; timed-presence veya biographical |
| HistoricalEvent | EVENT/BATTLE entity, katılımcı kimlikleri; documented/representative/unknown konum |
| HistoricalPlace | PLACE entity ve kaynaklı nokta/alan; merkezden kişi konumu üretilmez |
| DataCoverage | Katman + tarih + bbox + açık recordIds/count; partial/no-verified-data/license-blocked/outside-pilot |

Her iddiada Evidence listesi vardır: sourceId, revision, rawInputId, locator
(sayfa/statement/nesne), desteklenen claim türleri, lisans, atıf, observed/derived
ve transformationIds. Identity ve temporal iddialarının kaynağı zorunludur;
geometri varsa geometry, kişi konumunda location kanıtı ayrıca gerekir. Kaynak
üst zincirleri `upstreamIds` ile korunur; eksik zincir ve döngü reddedilir.
Engelli bir üst kaynak, izinli bir derleme ismi altında gizlenemez.

Kaynak SourceRecord kendi URL/revizyon/erişim zamanı/ham dosya/hak alanını taşır;
ayrıca kayıtların bütün ortak kalite/tarih alanları vardır. Kaynak tarih aralığı,
veri/iddia kapsamıdır; erişim zamanı `retrievedAt` ile ayrıdır. Makale/görsel/kod/
tile hak alanı veri lisansı yerine geçmez. QID kimliği Wikipedia adresi üretmez;
sitelink doğrulaması bu fazda yapılmaz ve Wikipedia URL alanı eklenmez.

## Zaman ve belirsizlik

- İç yıl işareti tarihî numaralamadır: -1=MÖ 1, ardından +1=MS 1; yıl 0 reddedilir.
  Genel model ±10000 yıl kabul eder; ürünün MÖ 2000–günümüz seçimi genişletilmez.
- Normalleştirilmiş takvim proleptic-gregorian; kaynak takvimi ve numaralaması
  `sourceDate.text/calendar/yearNumbering` içinde özgün metniyle saklanır. CLI
  takvim dönüşümü tahmin etmez. Julian/astronomik tarih için kaynak adaptörü,
  açık sürümlü dönüşüm ve inceleme gerekir; eksi yıl kör çevrilmez.
- Start/end dahil uçlardır. Bilinen tarihte year zorunlu, month/day hassasiyete
  göre null kalır; 29 Şubat gibi günler doğrulanır. Farklı uç hassasiyetleri v1'de
  tek `precision` ile temsil edilemiyorsa sessiz yuvarlama yapılmaz, staging'de
  model geliştirmesi/inceleme beklenir.
- `known`, `unknown`, `unbounded` ayrıdır. Unknown belirsizdir; sonsuz geçerlilik
  iddiasına dönüştürülmez. Sorguda olası aday olarak ancak includeUncertain ile gelir.
- Precision day/month/year/decade/century/unknown; uncertain, sourceDate,
  observed/derived ve reviewStatus bağımsız alanlardır. Kaba/bilinmeyen hassasiyet
  uncertain gerektirir. Derived tarih, temporal claim ve sürümlü dönüşüm gerektirir.
- Sorgu yıl penceresini kesişim için genişletir; kayda ay/gün eklemez. `dateKey`
  yalnız sıralama anahtarıdır, geçen gün veya süre hesabı için kullanılamaz.
- Aynı entity + interpretation için çakışan TerritoryVersion aralıkları reddedilir;
  rakip yorumlar ayrı interpretationId taşır, son sınır boş yıllara uzatılmaz.
- Timed-presence kaynaklı, bilinen iki tarih ucu ve zaman/konumu birlikte
  destekleyen en az bir Evidence locator'ı ister. Yaşam tarihleri ile bağımsız
  genel yer kaydı birleştirilerek bulunma iddiası üretilemez. Genel yaşam yeri bu
  sınıfa çevrilemez; bilinen yaşam aralığının dışına taşan timed-presence reddedilir.
  Biographical kaydın da yaşam aralığıyla bütünüyle çelişmesi reddedilir.
  Katılımcı listesi kişilerin olay mekânında bulunduğunu kanıtlamaz.

## GeoJSON ve topoloji

Serialization **CRS84/WGS84, [boylam, enlem]**, ondalık derecedir. EPSG:4326 datum
referansı kullanılsa da otorite eksen sırasındaki lat/lon GeoJSON'a uygulanmaz.
RFC 7946 GeoJSON içinde eski `crs` alanı kabul edilmez; başka CRS önce açık kaynaklı
dönüşümle çevrilmelidir. [RFC 7946, koordinatlar ve geometri](https://www.rfc-editor.org/rfc/rfc7946).

Point, LineString, Polygon, MultiPolygon ve bunları içeren FeatureCollection
doğrulanır. Üçüncü koordinat/yükseklik, GeometryCollection ve diğer türler v1
kapsamında değildir. Feature id/properties.recordId aynı kalıcı ID olmalıdır;
FeatureCollection boş olabilir. Null geometri yalnız alan kaydında açık
geometryReason ile kabul edilir; boş koordinat dizisi geçmez.

Kontroller: sonlu/aralıkta koordinat, en az nokta/halka, kapanma, sıfır kenar/alan,
saat yönü (dış CCW, delik CW), kendini kesme, komşu kenarın geri katlanması,
halkaların teması/kesişmesi, dışarıdaki/iç içe delikler, MultiPolygon örtüşmesi.
180 dereceden fazla boylam sıçrayan kenar `ANTIMERIDIAN_UNSPLIT` verir. Doğru
bölünmüş MultiPolygon kabul edilir; bölme/sadeleştirme/halka ters çevirme otomatik
yapılmaz. Kaynak ve dönüşüm kaydı olmadan geometri onarılmaz.

Bu, küçük pilotlar için **sınırlı düzlemsel** denetimdir; GEOS veya küresel/sferik
topoloji doğrulaması değildir. Kutup/sarmalama, temas eden geçerli bileşenler,
kapalı/kendini kesen çizgiler ve çok ayrıntılı şekiller konservatif olarak
reddedilebilir; ek inceleme gerekir. Alan toleransı 1e-12 derece² düzeyindedir;
metre cinsinden ölçülmüş doğruluk anlamına gelmez. En çok 1024 konum/geometri,
512 nokta/halka, 16 halka/polygon, 16 polygon ve 100000 kenar çifti karşılaştırması.
Bütçe aşımı hata verir; doğrulamadan geçmiş sayılmaz. Katalog/FeatureCollection
en çok 1000 kayıt; bu limitler ürün performansı ölçümü değildir.

## Lisans kapısı ve güven sınırı

`licensePolicy` allow/manual-review/disallowed döndürür. Varsayılan **ret**.
Natural Earth public-domain fiziksel veri ve Wikidata CC0 yapılandırılmış veri
izinli başlangıçlardır; bu bir kaydın gerçekliğini veya tarihsel doğruluğunu kanıtlamaz.
Atıf, revizyon, ham girdi ve verified inceleme ayrıca zorunludur. Her Evidence'in
lisans/atıf alanı SourceRecord ile eşleşmeli; kayıt atfı kaynak atfını korumalı.
V1 karışık kaynak lisanslarını tek kayıtta otomatik birleştirmez, uyuşmazlık verir.

OHM license=* nesne ve üyeleri ayrı incelenir. `objectLicense` ve membersReviewed
işareti bile tek başına onay vermez. CC BY/SA adayları dahil conditional kaynaklar
güvenilen `manualApprovals` listesinde kaynak ID + revision + ham SHA + licenseId
eşleşen, inceleyen/tarih/yükümlülük içeren bir onay olmadan üretime girmez.
Faz 04'te boş olan listede artık yalnız NARA olgu çıkarımına bağlı **1 dar onay**
vardır; OHM ve diğer conditional kaynaklar hâlâ onaysızdır. Onay kod incelemesiyle sicile eklenebilir;
girdi JSON'u kendini onaylayamaz. Kaynak/kural değişince policy version artırılmalı,
hak atıfları güncellenmeli ve testler tekrar çalıştırılmalıdır.

Historical Basemaps **BLOCKED FOR REDISTRIBUTION**; upstream kopyası da engellidir.
Wikimedia makale metni ve görselleri Wikidata CC0 kapsamında değildir. Bu manifest
lisans tam metinlerinin yerine geçmez ve aday kaynakların hepsi indirilmiş değildir.
[Lisans sicili](license-register.md), [veri matrisi](source-matrix.md).

Verified/basis/sourceKey alanları editöryal beyanlardır; doğrulayıcı yanlış beyanı,
sahte upstream kimliğini veya kaynağın tarihî doğruluğunu internetten teyit edemez.
SHA bütünlük sağlar; checksum ile dosya aynı güvenilmeyen yerden alınırsa özgünlük
kanıtı olmaz. Yayıncı incelemesi ve güvenilen release manifesti şarttır. Burada
imza altyapısı veya otomatik bilimsel doğrulama iddiası yoktur.

## ETL kullanımı ve denetlenebilir değişiklik

```sh
npm run etl -- --help
npm run etl -- validate --input data/staging/catalog.json
npm run etl -- build --input data/staging/catalog.json --output /tmp/tarih-atlasi-phase04-empty
```

Gösterilen staging dosyası boş v2 zarftır; varsayımsal tarihî kayıt içermez.
Gerçek pilot için önce kaynağın hakkı/revizyonu incelenir; ham dosya `data/raw`
altında değiştirilmeden tutulur. Staging zarfında sources, records, inputs ve
transformations hazırlanır. Her input göreli dosya yolu, byte, SHA-256 ve tam
kaynak/revizyon taşır. Aynı kimlikler Evidence ve dönüşümlerde referans edilir.
Eski ham dosya/dönüşüm/revizyon üzerine yazmak yerine yeni revizyon/hash kaydedilir.

`validate` sadece staging yapısını/referansları/ham dosya hash'lerini kontrol eder;
çıktıda productionApproved=false ve ayrı hak kararları vardır. Lisans engelli
kayıtlar staging'de kalabilir, fakat burası dağıtım alanı değildir.
`build` üretim hak/inceleme/sentetik kapıları dahil hepsini uygular. Tek hata varsa
bütün aday paket reddedilir; kısmi veri sessizce süzülmez ve üretim dizini açılmaz.
Hata JSON'u stderr'de `status: rejected`, issues ve exit 1 ile raporlanır.

Sınırlar: JSON 4 MiB, en fazla 32 ham dosya, dosya başına 8 MiB, sıralı okuma
(concurrency 1). Traversal ve raw-root dışına çıkan symlink reddedilir; dosya
okuma boyutu ve SHA kontrol edilir. Ağ/indirme işi yoktur; backoff/rate-limit yeni
bir ağ adaptörü eklenirse ayrıca uygulanacaktır. Dosyalar Git dışındadır; lisans
çözülmeden ham/ara veri dağıtımı yapılamaz. Bütün ham kaynaklar bellekte birikmez.

Normalizasyon nesne anahtarlarını ve ID ile üst seviye listeleri sıralar. Adlar,
kanıt listeleri, kaynak tarihi/koordinatları ve dönüşüm geçmişi değiştirilmez.
Yeni bilimsel dönüşüm varsa explicit Transformation eklenir. Girdi `createdAt`
değeri korunur, çalışma saatinden timestamp veya rastgele ID üretilmez. Aynı
girdi/ETL/politika ile aynı byte/hash alınır. Çıktı `VERSION-SHA/` altında geçici
dizin + rename ile atomiktir; mevcut aynı çıktı idempotent, farklı içerik reddedilir.
Bir version altında içerik hash'i değişirse farklı klasör oluşur; sürüm politikasında
yayıncı ayrıca katalog sürümünü artırmalıdır. CLI yayınlama veya uygulamaya import yapmaz.

Üç dosya: catalog.json (tüm provenance), manifest.json (schema/catalog/ETL/policy
sürümleri, kaynak revizyonları, raw/türev hash/byte, dönüşümler ve sayılar),
review-report.json (izin kararları). Gelecek gözden geçirmede önce bu manifest,
sonra raw SHA ve iddia locator'ı karşılaştırılır. İnceleme kaynağın yayıncı
lisansından bilimsel iddiaya ve çıktı hash'ine kadar izlenebilir olmalıdır.

## HistoricalDataProvider

`createHistoricalDataProvider(catalog)` üretim doğrulamasını tekrar uygular;
staging modu yalnız laboratuvar/test içindir. Sağlayıcı snapshot'ın kendi kopyasını
dondurur. getById/getSource/query asenkrondur; gelecekte statik shard veya backend
adaptörü aynı arayüzü uygulayabilir. Bugün tek küçük, bellekte statik katalogdur;
ağ cache/shard/server uygulanmadı. Faz 05'te harita yalnız küçük onaylı pilot için
bu sağlayıcıya bağlandı; genel katalog araması henüz etkin değildir.

Sorgu startYear/endYear, bbox, kinds, includeUncertain, includeBiographical,
offset/limit alır. ID map, sıralı zaman başlangıçları + prefix-max bitiş indeksi
ve 30° mekânsal grid kullanılır. Mekân son filtresi **bbox kesişimidir**, kesin
polygon/point-in-polygon araması değildir. Geometrisiz kimlik kayıtları bbox
sorgusunda görünmez; kişi konumunda yerin merkezine koordinat uydurulmaz.
Antimeridyen sorgusu west>east ile desteklenir; ±180° kenar eşdeğerdir.

Belirsiz tarih kayıtları varsayılan gizli; istenirse `temporalMatch: possible`
ile gelir. Biographical kayıt varsayılan tarih sorgusundan çıkar; açıkça istenince
`biographical` etiketiyle gelir, yıllık bulunma sonucu sayılmaz. En çok 100 sonuç/
sayfa, deterministik ID sırası, total/nextOffset. Kapsam yüzdesi uydurulmaz.

`loadHistoricalDataProvider(catalogText, expectedSHA, digestAdapter)` byte sınırı,
checksum ve üretim şemasından önce sağlayıcı oluşturmaz. Expected SHA güvenilen
release manifestinden gelmelidir. Digest adaptörü platformca sağlanır; Node crypto
native pakete girmez. İmzalı manifest/native crypto adaptörü bu fazın kapsamında değil.

## Testler ve sınırlar

`npm run check` domain/ETL/pilot testlerini ve önceki renderer/UI/köprü regresyonlarını
içerir. Sentetik kaynak/geometri/tarih yalnız test fixture'ında açıkça etiketlidir;
testler bazı policy pozitif yollarını izole simülasyonla inceler, bunu gerçek
Wikidata kaydı veya yayın verisi saymaz. Başarılı dolu ETL testleri yalnız geçici
test dizinlerinde; CLI kabul smoke'u gerçek dünya verisi olmayan **boş katalog** ile yapılır.
Web/Android strict typecheck ortak modülleri kontrol eder; fiziksel cihaz ölçümü
değildir. [Faz 04 kanıtı](reports/phase-04.md), [açık cihaz kapısı](reports/phase-02-device.md).

## V2 değişiklikleri ve migration

schemaVersion artık **2**. V1 otomatik kabul edilmez; boş örnekte sürüm değiştirilir,
dolu kayıtta yeni alanlar editöryal kaynakla doldurulmadan geçiş yapılmaz.
TerritoryVersion.geometry artık alan veya LineString olabilir. scopeId, extentType
(full-area/partial-area/boundary-segment), politicalStatus, counterpartEntityIds ve
borderPrecision zorunludur. Çizgi yalnız boundary-segment ile eşleşebilir; idealize
antlaşma hattı documented/kesin ölçüm gibi gösterilemez. borderPrecision sınıf,
gerekçe ve bilinmiyorsa null kalan toleranceKm taşır; Confidence ayrı kalır.

PoliticalRelationship yeni türdür; iki siyasi entity, isteğe bağlı territory
referansları, kaynaklı tarih/evidence ve vassalage/overlapping-claim/disputed-control/
shared-control/cession ilişkisi taşır. Kişi veya kültür entity'si siyasi taraf diye
bağlanamaz. Aynı entity/yorumun ayrı scope'ları çakışabilir; aynı scope'ta iki
eşzamanlı sürüm hâlâ reddedilir. Arayüz bu ilişkilerden tek egemenlik poligonu üretmez.

OHM alımı karantinadır; end_date source-exclusive olarak saklanır, dahil domain
ucuna kendiliğinden çevrilmez. ISO yıl sıfırı tarihî -1'e çevrilir; kaynak metni,
EDTF ve bütün üye etiketleri saklıdır. Zamanı eksik kayıt bütün yıllarda geçerli
sayılmaz. [ADR-0006](adr/0006-pilot-boundary-semantics.md), [kalite ve paket](data-quality.md).

## Faz 06 — kaynaklı zamansal sorgular

TemporalExtent v2 geriye uyumlu support/periods alanları ve range hassasiyeti
aldı. Support bulunmayan geometri motor tarafından yıllara yayılmaz; eski
provider possible sonuçları kesin coğrafya sayılmaz. Kesintili dönemler hem
provider hem yeni indeksin içinde korunur. Kişi yaşamı ile konum ayrı sorgulanır.
[API, modlar, cache ve migration](timeline.md), [ADR-0007](adr/0007-temporal-query-engine.md).
Pilot 0.2.0-pilot ve ETL 1.2.0: aynı kaynak/geometri/hak; açık snapshot annotation.

## Faz 08 — siyasi profil ve ilişkiler

Şema v2'de opsiyonel PoliticalProfile; tarihli çoklu POLITY/KINGDOM/EMPIRE,
ad/açıklama/başkent iddiaları ve entity evidenceIndices bağlantısı eklendi.
Kaynak, lisans, üretim incelemesi ve kesintili dönem kontrolleri bu alt iddialara
da uygulanır. İsteğe bağlı kuruluş/bölünme/birleşme/ardıllık/ad bağlantıları
PoliticalRelationship içinde kaynaklı ayrı kayıtlardır. Hiçbiri zorunlu değildir.
[Sözleşmeler, tarihli sorgular ve kaynak sınırları](political-layer.md).
Eski pilot aynı byte/hash ile geçer; gerçek yeni alan kaydı yoktur. Yeni alan
içeren katalog eski strict okuyucuda reddedilir; yayın öncesi katalog sürümü
artırılır, evidence dizisi indeksleri dönüşüm sırasında korunur.

## Faz 10 — kişi profili ve konum kanıtı

`HistoricalPerson = Person & {profile: PersonProfile}`; staging uyumu için opsiyonel
profil üretimde zorunludur. Doğum/ölüm aralıkları, kaynak dilli açıklama/meslek,
sitelink ve ayrı medya hak metadata'sı eklenmiştir. PersonLocation'da ilişki
türü, yer ölçeği ve koordinat rolü ayrı tutulur. validFrom/validTo/precision
kanonik TemporalExtent'in salt okunur projeksiyonudur. Üretim varsayılanında
profil/ilişki/koordinat bağlamı, yaşam tutarlılığı ve ayrı zaman+yer kanıtı gerekir.
Bölgeyi kişi noktasına dönüştürme, yaşam aralığına doğum/ölüm yeri yayma,
incelemesiz medya ve ham eşleşmesiz kişi sitelinki reddedilir. ETL **1.4.0**.
[Kişi sözleşmeleri ve içe aktarma](persons.md), [ADR-0011](adr/0011-person-location-evidence.md).

## Faz 11 — olay türleri ve konum hassasiyeti

HistoricalEvent artık BATTLE/WAR/TREATY/FOUNDATION/DISSOLUTION/CULTURAL_EVENT/OTHER
türlerini taşır; eski genel EVENT test verisi açıkça OTHER'a taşındı. Üretimde
details zorunlu: placeId, dil etiketli açıklama, locationPrecision, kaynaklı
alternatif tarihler ve raw Wikidata ile eşleşen sitelinkler. dateExtent/title/
participants/sources tek kanonik temporal/names/participantIds/evidence alanlarının
salt okunur projeksiyonudur. Geometri Point/Polygon/MultiPolygon/null olabilir;
WAR tek nokta olamaz. Zaman+geometri aynı evidence ile desteklenmeli; bilinmeyen
yer, takvim dönüşümü ve tarih belirsizliği saklanır. ETL1.5.0, katalog0.4.0-pilot.
[Olay sözleşmesi](events.md), [ADR-0012](adr/0012-event-layers.md).

## Faz 12 — ayrı doğrulanmış sitelink manifesti

Tarihî schema2/katalog0.4.0-pilot ve tüm geometriler korunur. Kimlik bağlantıları
`data/sitelinks/reviewed.json` / `src/sources/generated/sitelinks.ts` içinde ayrı
1.0.0 release taşır. Snapshot QID, revision/sourceUrl, verifiedAt, reviewStatus,
representation, licenseId/attribution ve explicit site/title/URL içerir. Review ve
ham çıkarım SHA kapısı kaynak doğruluğunun teknik koşuludur; tarih/konum kanıtı
sayılmaz. Eski kayıt içi VerifiedSitelink ETL kapıları kaldırılmadı; yeni ortak
UI link kataloğunu kullanır, kayıt içi alanlar otomatik terfi ettirilmez.
Kaynak repository'si claim/locator/revision/input/transform zincirini korur.
[Şema ve yenileme yöntemi](sources.md).
