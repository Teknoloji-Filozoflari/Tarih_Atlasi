# ADR-0013 — Doğrulanmış sitelinkler ve ortak kaynak kartları

2026-10-16 · Faz 12 · Koddan önce küçük uygulama planı.

1. QID ile anahtarlanan, sürümlü ve hash denetimli küçük sitelink kataloğu;
   trwiki → enwiki → Wikidata sırası, bounded LRU ve negatif testler.
2. Platform adaptörlü HTTPS/domain kontrollü dış bağlantı servisi. Harita DOM
   köprüsüne URL komutu eklenmez; harici bağlantı yıl/kamera state'ini değiştirmez.
3. Mevcut kişi/devlet/kültür/olay kartlarında ortak kaynak ve belirsizlik bölümü;
   kaynak revizyonu, doğrudan locator, lisans/atıf, ham SHA ve dönüşüm izlenebilirliği.
4. İnceleme adayları için sınırlı ETL, hata/cache testleri, export ve faz raporu.

Yeni bağımlılık yok. Uygulama offline statik çözümleyici kullanır; WDQS veya
harita hareketi başına HTTP yok. Güncelleme geliştirici ETL/manuel review ve yeni
sitelink katalog sürümüyle yapılır. Tarihî katalog sürümü/geometrisi değişmez.

Önceki ADR-0012'nin yalnız özgün JSON ile link yayınlama kuralı bu ayrı kimlik
kataloğu için genişletilir: resmî Wikidata sayfasındaki mevcut sitelink hedefi,
QID ve sayfa revizyonu doğrudan incelenerek de küçük yapılandırılmış olgu
çıkarımı yapılabilir. Temsil açıkça `editorial-sitelink-extraction-not-http-response`
olarak işaretlenir; özgün HTTP/JSON/GUID taklidi yapılmaz. İki yol da review,
CC0 kapsamı, explicit URL/title/site eşleşmesi ve hash kapısından geçer.
Makale metni, Commons görseli, kaynak coğrafyası veya güncel tarihî doğruluk
onayı anlamına gelmez. İncelenmemiş QID için Wikipedia yok denmez; bağlantının
bu katalogda doğrulanmadığı söylenir ve güvenli Wikidata kaydı sunulur.

Yönlendirilmiş/değişmiş QID otomatik birleştirilmez; yeni kimlik eşlemesi review
ister. Yenileme başarısızsa bilinen snapshot korunur, yeni veri doğrulandı
iddiası yapılmaz. Kaynak ekranı aynı bilgi panelinin içinde açılır; yeni rota veya
WebView yaratılmaz. Android dönüş/kamera/işlem ölümü gerçek cihazda ayrıca ölçülür.

## Uygulama sonucu

İki reviewed QID/dört explicit sitelink, ayrı1.0.0 katalog ve NOTICE hazır.
Ortak kart kaynakları exact evidence/revision/raw SHA ile sayfalanır; dış
bağlantı güvenli adaptörden geçer. Kaynak doğruluğunu etkileyen önceki A-03
bölgesel ilişki sızıntısı negatif/pozitif testle düzeltildi. Tarihî katalog ve
geometriler korunur. [Faz 12 test/platform raporu](../reports/phase-12.md).
