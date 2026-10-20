# Kültürel alanlar ve ortak coğrafya seçimi

2026-10-16 · Faz 09 kodu. Gerçek kültür pilotu **BLOCKED**; mevcut üretim kataloğu
yalnız 1867 NARA siyasi antlaşma kesitidir. [Kaynak incelemesi](reports/phase-09-source-review.md).

## Alan modeli

CULTURE, CIVILIZATION ve CULTURAL_REGION siyasi olmayan HistoricalEntity
türleridir. CulturalRegion onlara kaynaklı ayrı bir coğrafi kayıtla bağlanır.
Semantik `cultural-interaction` veya `cultural-distribution`; kontrol/egemenlik
değildir. Her kayıt aynı kalıcı ID, kaynak/evidence/locator, lisans/atıf, kalite,
TemporalExtent ve geometry/geometryReason alanlarına bağlıdır.

Yeni kültürel üretim kaydında `culturalContext` zorunludur: interpretationId,
description, geographicContext ve en az bir uncertainties açıklaması. Eski
staging kayıtları bu alan olmadan incelenebilir; üretim kapısı reddeder. Bir
belirsizliğin gerçek büyüklüğü bilinmiyorsa sayısal tolerans uydurulmaz.
Şema 2 additive tipleri kullanır; eski v2 okuyucu tanımadığı yeni alan/türleri
reddeder. Yeni gerçek veri yayını için katalog sürümü artırılmalıdır.

CulturalRelationship ayrı sourced record'dur. `interaction`, `influence`,
`affiliation`, `related-tradition`; iki farklı kültürel kimlik ve isteğe bağlı
regionIds kapsamı taşır. Siyasi entity taraf olamaz. Bölge listesi doluysa yalnız
o bölgenin kartında gösterilir; boşsa ilgili kimliklere ait ilişki olarak sunulur.
Bu ilişki siyasi vasallık veya yönetim iddiası oluşturmaz.

Birbirinden ayrı kültür kayıtlarının polygonları örtüşebilir; bu kayıtlar
birleştirilmez, birbirinden çıkarılmaz veya topoloji hatası sayılmaz. Tek bir
geometrinin kendi kendini kesmesi/örtüşen MultiPolygon parçaları hâlâ geçersizdir.
Geometri aynı CRS84 lon/lat ve bütçeli antimeridyen/topoloji kapısından geçer.

Tarih kaynağı/support'u olmayan veya unknown tarihli alan çizilmez. Snapshot yalnız
kaynak yılına aittir; continuous sadece belgeli aralıkta geçerlidir. Kültürel
alanlar her zaman documented approximate modundadır. Bağlı kimliğin bilinen
dönemi veya dönem boşluğu ile çelişen siyasi/kültürel coğrafya reddedilir. Bilinmeyen
üst tarih sonsuz geçerlilik diye doldurulmaz; çelişki kontrolü bilinen kanıtla
sınırlıdır. Motor, özel sağlayıcıda da bilinen parent çelişkisini filtreler.

## Veri ve zaman API'leri

`TimelineEngine.getCulturesAtYear` ve dışa aktarılan helper, aynı indeks/cache'i
kullanır. Coverage, siyasi/kültürel görünürlük ve nearest snapshot önizlemesi
aynı yıl bağlamındadır. `createCulturalRepository(provider, timeline)` kartın
kaynaklı kaydını, kültürel entity'sini, dönemine/kapsamına uygun ilişkileri ve
atıfları getirir. İlişki cache'i 32 yıl, sayfa 100, en fazla 10 sayfa; katalog
limiti hâlâ 1000 kayıttır. Yeni backend veya indirme katmanı yok.

`createHistoricalFeatureLoader` aynı engine'den siyasi/kültürel GeoJSON üretir;
uygulama yalnız doğrulanmış pilot provider'ını kullanır. Testler ayrı sentetik
provider'ı dependency injection ile verir; fixture uygulamaya import edilmez.

## Görsel ayrım ve okunabilirlik

Siyaset `▱` ve kendi kaynaklı çizgi/alan stili; kültür `≈`, düşük dolgu,
yumuşak kenar ve noktalı çizgiyle sunulur. Seçili kültürde de noktalı vurgu vardır;
kesin egemenlik kenarı yaratılmaz. Kültürel palet kimlik ID'sine göre kararlıdır;
renk tek başına anlam taşımaz. Kartlar ve seçeneklerde tür adı da yazılıdır.

Kültür dolgusu N kayıt için `min(.1, 1 - .7^(1/N))`: hepsi aynı pikselde çakışsa
bile bileşik dolgu en fazla .30 olur. Bu küresel, tutucu bir yoğunluk stratejisidir;
farklı yerlerdeki çok kayıt da incelir. 32'den fazla alanda bunun açıklaması görünür.
Veri silinmez; ayrıntı ve bütün kayıtlara liste/sayfalama ile ulaşılır. Çizgi ve
gerçek GPU maliyeti için cihaz ölçümü ayrıca gerekir; alpha sınırı FPS kanıtı değildir.

DOM etiketleri zooma göre 8/20/32 ile sınırlıdır; marker ve click/pointer/drag
dinleyicileri yenilemede/unmount'ta temizlenir. Ankraja `≈` eklenmesi tarihî yer
veya başkent kanıtı değildir. Fiziksel taban genelleştirilmiş **güncel** kara/kıyıdır;
tarihî sahil/nehir/göl değişimleri kültür kartı, lejant ve atıf panelinde açıklanır.

## Örtüşen kayıtların seçimi

Hit testi siyasi fill/çizgi ve kültürel fill/çizgiyi birlikte sorgular. Görünür
ID'ler tekilleştirilip seçili/küçük alan önceliği ve sabit ID ile sıralanır. Sıra
kültürel veya siyasi hak üstünlüğü iddiası değildir. Sonuçlar en çok 1000 ID olarak
renderer'da tutulur. İlk 8 **ilk sayfadır**, listenin tamamı değildir.

Bridge v1 yeni sözleşmeleri:

- `selection.changed`: catalogVersion, revision, selectionId, offset, total,
  recordId ve en fazla 8 candidateIds. Başlangıç recordId'si sonraki sayfalarda
  görünmese de aynı hit kümesinin kimliğidir.
- `selection.page`: yalnız selectionId, revision, 8'in katı offset.
- Session, bilinen tür/alanlar, ID şekli, katalog, 4 KiB ve sayfa uzunluğu tam
  doğrulanır. Host güncel frame'deki kayıtlara karşı tekrar kontrol eder.
- Yeni tarih/katman/preview/suspend hit kümesini geçersiz kılar. Eski sayfa
  komutu/yanıtı uygulanmaz; sayfa isteği yeni catalog.view komutunu ezmez.

Birden fazla hit varsa **Bu noktadaki kayıtlar** paneli kültür/siyaset türlerini
birlikte sunar. Kart açıkken de sayfalama/seçenekler kalır; alttaki kayıt seçilebilir.
Tek hit doğrudan uygun kartı açar. Kültürel yıl listesi de 8'li sayfalanır, klavye
ve haritasız kullanımda açıktır. Siyasi liste ve önceki pilot akışları korunur.

## Kültür kartı ve Wikipedia

Ad, tür, yayılım/etkileşim anlamı, seçilen/source yıl, belge dönemi, özgün tarih
metni, coğrafi bağlam, belirsizlik listesi, güven düzeyi/gerekçesi, kaynak locator
ve lisans atıfları gösterilir. Desteksiz yılda uyarı ve eski belge bilgisi korunur;
güncel kaynak yılı veya geçerli ilişki/sitelink iddiası yapılmaz.

Opsiyonel wikipedia alanı bir **VerifiedSitelink** taşır: QID, site, başlık, açık
URL, Wikidata sourceId/revision/rawInputId ve verifiedAt. Kaydın QID ve identity
evidence'i bu kaynağa bağlanmalıdır. URL güvenli Wikipedia dil host'una/başlığına
uymalı; 2/3 harfli olağan dil site kodları ve alt varyantları desteklenir.
İsimden veya QID'den Wikipedia slug'ı oluşturulmaz.

ETL checksum doğrulanan ham Wikidata JSON'unu input başına bir kez parse eder;
`entities[QID].sitelinks[site].title/url` ile bire bir eşleşmeden üretim paketi
hazırlamaz. Provider bu internete yeniden bakmaz; güvenilen ETL/release manifesti
ve insan incelemesi güven sınırıdır. Şema/meta beyanı tek başına bilimsel kaynak
doğrulaması sayılmaz. Mevcut katalogda bu alan yok, Wikipedia düğmesi gösterilmez.
Wikipedia metni/görseli veya Commons dosyası kopyalanmaz; CC0 sitelink görsele hak vermez.

## Test ve kabul sınırları

`tests/unit/cultures.test.mjs` eşzamanlı kültür/siyaset, tür/bağlam/hak/zaman
retleri, ilişki kapsamı, bağımsız katmanlar, renk/alpha ve Wikidata ham eşleşmesini
doğrular. 1000 hit/125 sayfanın tamamı erişilir; 400 kültürlü sentetik katalogda
tekrar sorguları yeni indeks taraması yapmaz. Renderer double testi 17 kültür +
1 siyasi alanın sayfa seçim/yıl/katman/cleanup akışını gerçek renderer koduyla
çalıştırır. Bunlar gerçek harita görüntüsü veya Android performans ölçümü değildir.

[Faz raporu](reports/phase-09.md), [ADR](adr/0010-cultural-layer.md). Gerçek kültür
alanı/pilot, tarayıcı ekranları ve fiziksel Android kabulü tamamlanmadan bu fazın
tam runtime/veri kabulü kapanmaz. Faz 10'a otomatik geçilmez.
