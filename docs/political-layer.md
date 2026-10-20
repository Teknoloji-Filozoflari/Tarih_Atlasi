# Siyasi katman — Faz 08

2026-10-16. Kod, sentetik geometri testleri ve mevcut gerçek sınır kesitiyle
entegrasyon hazır. **Tam tarihî devlet polygonu 0**; polygonla görsel kabul
**BLOCKED — VERIFIED POLYGON ACQUISITION / RECORD REVIEW**.
[Kaynak araştırması](reports/phase-08-source-review.md), [ADR-0009](adr/0009-political-layer.md).

## Kimlik ve tarihli iddialar

Tek HistoricalEntity ID'si korunur. `entityType` geriye uyumlu birincil türdür;
POLITY, siyasi varlıkların ortak sınıfıdır. Opsiyonel `politicalProfile` aynı
varlıkta eşzamanlı KINGDOM/EMPIRE sınıflarını tutabilir; ayrı devlet geometrileri
veya yinelenmiş kimlikler üretilmez. Bu sınıflandırma tarihsel bir iddiadır;
profil varsa yalnız o yıl geçerli, incelenmiş sınıflar kullanılır. Hiçbiri o yıl
desteklenmiyorsa imparatorluk/krallık etiketi taşınmaz; POLITY şemsiyesi kalır.

Profilde `classifications`, dil kodlu/tarihli `names` (preferred/alternative),
`descriptions` ve kaynaklı yer referanslı `capitals` listeleri vardır. Her öğe
benzersiz `id`, `TemporalExtent`, sahibi entity'nin `evidence` listesine bağlanan
`evidenceIndices` taşır. Kanıt indeksleri ETL sırasında yeniden sıralanmamalıdır.
Kimlik+tarih aynı locator'da, başkent için ayrıca yer+tarih kanıtı gerekir.
Derived iddia sürümlü dönüşüme bağlı derived evidence ister. Üretimde tarih
incelemesi zorunludur; üst kaydın kaynak/hak/atıf kapısı ayrıca uygulanır.
İddia aralığı varlığın destekli dönemlerinden taşamaz, kesintiyi dolduramaz.
Başkent yeri de sorgu yılında doğrulanmış olmalıdır. Bu yapısal kontroller insan
tarafından kaynağın gerçekten incelenmesinin yerine geçmez.

Ad seçiminde geçerli tarihli Türkçe ad, ardından preferred ve sabit ID sırası
kullanılır. Tarihli profil yoksa kaydın kaynaklı ana adı kullanılır. Bu geri dönüş
genel katalog adıdır; dönemsel yeni bir ad iddiası değildir. Kaynakta olmayan
Türkçe çeviri üretilmez. Desteksiz alternatif adlar yeni yıla taşınmaz.

PoliticalRelationship mevcut kaynak/temporal/kalite haklarını taşır.
`vassalage` from=vasal, to=üst varlık; shared-control ve rakip iddialar iki taraflı
gösterilir. İlişkinin territoryIds listesi doluysa yalnız o bölgelere stil uygulanır.
Yeni opsiyonel ilişki değerleri: predecessor-of (from→ardıl), split-from
(from→bölündüğü varlık), merged-into (from→birleştiği varlık), founded-from
(from→oluştuğu varlık), name-continuity (from→ilişkili varlık).
Bir kuruluş ilişkisi kendiliğinden kuruluş yılı, soy veya aynı sınır anlamına
gelmez; hiçbir varlık için bu alanlar zorunlu değildir.

## Sunum ve seçme

`src/politics` modeli/repository/geometri/seçim hesaplarını ortak TypeScript
olarak içerir. Repository yılı filtrelenmiş entity/ilişkileri en çok 1000 kayıt,
100'lük sayfalar ve 32 yıllık LRU promise cache ile alır. Kart aynı timeline
motorunu kullanır; snapshot, continuous ve kesintiler önceki kurallara bağlıdır.
RequestedYear/sourceYear ayrıdır. Açık nearest önizlemesi dışında kayıt başka
yıla taşınmaz. Desteksiz kart kaynak ve dönemini korur, güncel kaynak yılı veya
geçerli başkent/ilişki iddiası göstermez. Eski async yanıt yeni kartı ezemez.

MapLibre fill ve line katmanları tek `historical` GeoJSON kaynağını kullanır.
Entity ID hash'i tema paletinden kararlı renk seçer; renkler tek başına kimlik
belirtmez, ad/çizgi biçimi/kart da vardır. Farklı ID'ler aynı palette rengine
denk gelebilir; palet sonsuz benzersizlik iddia etmez. Seçili alanda hafif dolgu
ve açık outline vardır. Ölçülmüş/documented çizgi düz; approximate kesikli;
disputed noktalı, shared uzun-kısa kesikli, vassal farklı kesikli ve düşük dolgudur.
Birden çok durum varsa görsel öncelik disputed→shared→vassal→approximate→documented;
kart kaynaklı ilişkileri ayrı listeler, düşük öncelikli iddia kaybolmaz.

Yerel sistem fontlu DOM marker etiketleri glyph/sprite hizmeti gerektirmez.
Çakışma kutuları, zooma göre 8/20/32 görünür etiket bütçesi ve seçili önceliği
kullanılır. Küçük alanlarda yakın zoomda elmas işaretli etiket vardır; düşük zoomda
yalnız seçili küçük alan korunur. Görünür küre arkasındaki marker CSS ile gizlenir,
seçim handler'ı covered durumunu reddeder. Gerçek marker occlusion/klavye testi
ayrıca tarayıcı/cihazda yapılmalıdır. Her yenilemede eski marker ve click/pointer
dinleyicileri, unmount'ta map drag dinleyicisi de kaldırılır.

Ankraj, büyük bileşenin içindeki sınırlı scanline noktasıdır; delik/içbükey alanda
dış merkez kullanılmaz. LineString ankrajı kesitin ortasıdır. **Ankraj başkent,
belgeli yer veya kişi konumu değildir**; açıklaması etikette bulunur. Derece²
görsel boyut yalnız öncelik/kamera hesabıdır; istatistiksel yüzölçümü gösterilmez.
Kaynağı antimeridyende bölünmüş MultiPolygon korunur, kamera büyük bileşene
odaklanır. Bu yöntem kutupsal/küresel GIS topolojisi veya bütün devlete tam fit
garantisi sağlamaz. Çok ayrıntılı geometri önce mevcut bütçe/ETL kapısından geçer.

Harita hit testi polygon fill ve siyasi çizgileri sorgular. Görünür/katalog
sürümlü ID'ler tekilleştirilir; seçili, küçük alan önceliği, sabit ID sırası ve
en çok 8 aday uygulanır. Aynı noktadaki diğer adaylar kaynaklı adlarıyla karttan
seçilebilir. Genel arama eklenmedi. Haritasız/klavye erişiminde **Bu yılın siyasi
kayıtları** listesi aynı filtrelenmiş kayıtlara erişir.

## Köprü ve kamera

Bridge v1'e `polity.select {recordId,revision}` ve `polity.focus
{recordId,revision,reducedMotion}`; catalog.view'e opsiyonel selectedId eklendi.
Genişletilmiş entity.selected, revision ve 1–8 benzersiz candidateIds taşır.
Mevcut tek pilotun eski seçim zarfı geriye uyumlu parse edilir; yeni renderer
revizyonlu zarfı kullanır. Ek anahtar/kötü ID/session/version, 4 KiB üstü zarf
reddedilir. Renderer yalnız o an görünen territory ve güncel revision için işlem
yapar; host da güncel frame/katalog kaydını doğrular. GeoJSON, HTML veya URL
köprüden geçirilmez. Origin/navigation politikaları değişmedi.

Karttaki açık odak eylemi 700 ms flyTo, reduced motion'da 0 ms kullanır.
Tarih değiştirmez. Zaman güncellemesi kamerayı hareket ettirmez. Stale revision,
kapalı katman veya görünmeyen kayda odak reddedilir. Var olan pilot kamera
kısayolu ve kamera sıfırlama korunur.

Kart kaynak adını, atfı/lisansı, evidence locator'ını, asıl kaynak tarih metnini,
dönemi ve belirsizliği gösterir. Kaynaklı kısa açıklama/başkent/ilişki varsa ekler.
Nüfus, istatistiksel alan, hükümdar, bayrak ve kuruluş tarihi eklenmedi. Wikipedia
slug/QID bağlantısı üretilmez; mevcut pilotun doğrulanmış sitelinki yoktur,
yalnız resmî kaynak URL'si açılır.

## Doğrulama ve gerçek veri önkoşulu

`tests/unit/politics.test.mjs`: çoklu sınıf/ad, kaynak/başkent/üretim retleri,
kesintili dönem, ilişki stili, küçük/büyük/delikli/içbükey/antimeridyen alan,
seçim/etiket bütçesi, kaynaklı gerçek çizginin kapsamı ve köprü sınırları.
Renderer testi seçme/vurgu/odak/revision/cleanup'ı double ile doğrular;
**GPU kanıtı değildir**. Sentetik alanlar yalnız tests altındadır.
Gerçek UI senaryoları `tests/web/politics.spec.ts`; platform sonuçları
[faz raporunda](reports/phase-08.md).

Tam polygon kabulü için küçük, açıkça sürümlü bir gerçek kayıt indirilip ham
SHA/kimlik/tarih/lisans/atıf/üst kaynak/belirsizlik incelenmeli; manual approval
ve staging→production ETL geçirilmelidir. İncelenmiş kayıt en az bir gerçek web
ve fiziksel Android oturumunda çizilip seçilmelidir. NARA kesitini kapatmak veya
modern ülke alanı kullanmak bu kabulü karşılamaz. Faz 09'a geçiş yapılmadı.
