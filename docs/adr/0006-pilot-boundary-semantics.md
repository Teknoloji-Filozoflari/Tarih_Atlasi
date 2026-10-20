# ADR-0006 — Tam egemenlik poligonu varsaymadan kaynaklı sınır kesiti

2026-10-15 · **ACCEPTED — DATA/MODEL SCOPE; USER-REPORTED PILOT PASS**.

OHM metadata ve lisans yaklaşımı araştırıldı; API EAI_AGAIN ve incelenen adayın
boundary source fixme/üye incelemesi nedeniyle buradan polygon alınmadı. Historical
Basemaps hak engeli korunur. Bunun yerine NARA 1867 antlaşmasındaki 141°B tanımının
küçük, açıkça idealize edilmiş bir meridyen kesiti seçildi. Bu, tam devlet veya
kültür alanı diye etiketlenmez. [Kaynak, hak ve kalite kararı](../data-quality.md).

Domain **v2**: TerritoryVersion LineString destekler; scopeId, extentType,
politicalStatus, counterparts ve borderPrecision zorunludur. Ayrı kaynaklı ve
tarihli PoliticalRelationship vassalage/overlapping-claim/disputed-control/
shared-control/cession saklar. Geometrilerin çakışması veya vasallık ilişkisi
otomatik tek bir egemenlik alanına indirgenmez. Çelişki kontrolü aynı entity +
interpretation + scope içinde yapılır. Kaynak/kanıt/hak alanları korunur.

V1'in yeni zorunlu alanları tahmin ederek v2 sayılması reddedilir. Önceki tarihî
üretim kataloğu boştu; boş staging örneği v2'ye geçirildi. Dolu eski v1 katalog
getirilirse editöryal migration gerekir; generic decoder eksikleri doldurmaz.
Renderer köprüsünün v1 zarfı ayrı protokoldür, sürümü değiştirilmez; dar yeni
catalog.view ve entity.selected türleri her uçta aynı şemayla doğrulanır.

Pilot yalnız kaynaklı 1867-06-20 snapshot'ıdır. Kaynakta modern geodetik datum veya
metre doğruluğu verilmediği için kesikli approx çizgi, medium güven ve null tolerans
kullanılır. Projece seçilmiş kesme uçları gerçek sınır ucu değildir. Antlaşma
taraflarının tanımı fiilî/yerli egemenlik veya bütün günümüz sınırı sayılamaz.

Harita, katalogdaki zaman/katman sorgusunu kullanır; geometri köprüden geçmez.
İki küçük inline GeoJSON LOD, worker/CSS ve bildirimler yerel paketlenir. Font,
tile veya demo servisi eklenmez. Veri yoksa fiziksel taban + açık kapsam kalır;
güncel siyasi adlar fiziksel stile karışmaz. Tarihî etiketler bu pilotta çizilmez.

Seçim ve kaynak kartı eklendi; kapsam yalnız pilotu bulup incelemeyi sağlayan
akıştır. Genel arama veya başka veri katmanı geliştirilmedi. Gerçek web/native
otomatik/native görsel ve performans kapısı açık kalır. Kullanıcı çizgi seçimi →
kaynak kartı ve yıl filtresi gidiş/dönüşünü başarılı bildirdi; platform önceki web
denemesi bağlamından alınmıştır. Android cihaz kanıtı sayılmaz.
Sonraki faz otomatik başlamaz.
