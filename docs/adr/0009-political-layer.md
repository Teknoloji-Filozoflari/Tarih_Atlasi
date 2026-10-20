# ADR-0009 — Kaynaklı siyasi katman, çoklu sınıf ve seçim

2026-10-16 · ACCEPTED — CODE SCOPE; POLYGON / RUNTIME ACCEPTANCE BLOCKED — Faz 08.

Plan: geriye uyumlu opsiyonel PoliticalProfile ile aynı entity üzerinde tarihli
POLITY/KINGDOM/EMPIRE sınıfları, adlar, açıklamalar ve başkent referansları taşı.
Her ek iddia temporal/evidence ister; bilinmeyen bilgi ekranda doldurulmaz.
Siyasi ilişkiler mevcut kayıt modelinde kuruluş/bölünme/birleşme/ardıllık/ad-soy
ilişkileriyle opsiyonel genişletilir. Bunlar kimlik veya aynı sınır demek değildir.

Önce gerçek veri kapısı: mevcut NARA 1867 kaydı yalnız LineString kesitidir.
Cliopatria'nın resmî veri lisansı CC BY 4.0, README FromYear/ToYear dahil aralığı
belgeler. Bu, tek başına incelenmemiş geometriyi onaylamaz. Terminal ham dosya
alımı DNS (curl exit 6), Seshat API web erişimi 403/erişilemez; gerçek polygon
alınmadı. OHM/Historical Basemaps önceki hak/kaynak engelleri korunur. Modern ülke
poligonu veya çizgiden kapatılmış alan tarihî veri diye kullanılmaz.

Uygulama: kararlı entity renkleri, düşük dolgu/ayrı outline, kaynaklı siyasi
ilişkilere göre çizgi/şeffaflık; deterministik örtüşme sırası ve aday seçimi.
Harita symbol/glyph endpointi yerine yerel DOM/system-font etiketleri, bounded
collision/priority ve küçük alan işaretleri kullanılır. Çizim ankrajı yalnız
sunum türetimidir, başkent/olay/kişi konumu değildir. Antimeridyen için kaynakta
bölünmüş geometriler korunur; sahte düzeltme veya alan/büyüklük iddiası yapılmaz.

Seçim ve kamera komutları ID/revision ile doğrulanır, yalnız o anda destekli
kayıtlara uygulanır. Tarih değişirse kart kaynağını kaybetmez, açık unsupported
uyarısı verir; haritada eski vurgu/etiket kalmaz. Kamera geçişi yalnız açık kart
kontrolüyle; reduced motion tercihi uygulanır. Wikipedia linki slug/QID'den
türetilmez; doğrulanmış sitelink yoksa yalnız kaynak dış bağlantısı gösterilir.

Test planı: çoklu sınıf tek kimlik; tarihli ad önceliği; kaynaksız profil retleri;
kararlı renk ve ilişki semantiği; büyük/küçük/delikli/antimeridyen geometry hit ve
ankraj; örtüşmede deterministik sıra; etiket collision/bütçe; seçili zaman
geçersizleşmesi, stale revision/focus, kamera tarihe dokunmaz; önceki regresyonlar.
Sentetik alanlar yalnız tests fixture'larında; gerçek uygulamaya import edilmez.

Yeni bağımlılık/harici font veya veri lisans onayı yok. Gerçek polygon kabulü
BLOCKED; gerçek web/Android kabulü de ayrıca ölçülene kadar açık kalır.

[Uygulanan sözleşmeler ve sınırlar](../political-layer.md),
[doğrulama sonuçları](../reports/phase-08.md). Şema v2'ye opsiyonel alan eklenmesi
eski pilotu değiştirmez; yeni alan içeren katalog eski strict okuyucuda reddedilir,
sessizce kanıt atılmaz. Yeni profil yayınlanırsa katalog sürümü artırılmalıdır.
