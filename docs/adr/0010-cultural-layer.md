# ADR-0010 — Kültürel alanlar ve ortak seçim

2026-10-16 · ACCEPTED — CODE / TEST SCOPE; PILOT / RUNTIME ACCEPTANCE BLOCKED — Faz 09.

Plan: CULTURE/CIVILIZATION/CULTURAL_REGION kimlikleri, ayrı kültürel ilişki
kayıtları; CulturalRegion'da kaynaklı coğrafi bağlam ve belirsizlik açıklaması.
Siyasi egemenlik ilişkisi veya polygonu kültür kanıtına çevrilmez. Aynı yerde
aynı yılda farklı kültürel kayıtlar ayrı ID/yorumlarla geçerli olabilir.

Mevcut tek 1867 NARA kaydı kültür alanı değildir. D-PLACE resmî indirme sayfası
NC koşulu bildiriyor; projenin açık yeniden kullanım politikasında seçilmez.
Pleiades yer/nokta/bbox verisi kendi başına kültür yayılımı kanıtı değildir.
OHM nesne+üye lisans ve zaman incelemesi şartı sürer; HB dağıtım engeli kalkmadı.
Gerçek pilot geometri doğrulanamazsa BLOCKED kaydı tutulur, test alanları uygulamaya
taşınmaz. Yeni kaynak hakkı veya veri onayı otomatik verilmez.

Sunum: siyasi katmandan farklı ≈ işareti, düşük dolgu ve yumuşak/noktalı kenar;
Türkçe lejant ve çağdaş fiziksel kıyı/su tabanının tarihî olmadığı uyarısı.
Yoğun veride bileşik dolgu bütçesi, etiket sınırı ve açık yoğunluk açıklaması.
Harita hit testinde her iki alan katmanı sorgulanır; 8 aday/sayfa ve sürümlü
revizyonlu selection.page/selection.changed köprüsüyle altta kalan kayıtlar
erişilir. En fazla katalog limiti kadar ID renderer'da tutulur; geometri köprüye
girmez. Bütün yıl kayıtları ayrıca klavye/haritasız listeden erişilebilir.

Kültür kartı kaynak, belge dönemi, kullanılan yıl, yorum/bağlam ve belirsizlikleri
gösterir. Wikipedia yalnız ham Wikidata sitelinkiyle eşleşen ve ETL'de incelenmiş
bağdan açılır; mevcut katalogda böyle bağ yoksa link gösterilmez.

Testler: aynı yerde eşzamanlı iki kültür+siyaset; tür/ilişki semantiği; tarihsiz
alanın görünmemesi; bağlı kimlik dönemiyle çelişki; katman bağımsızlığı; 8'den fazla
örtüşmede tüm adaylara erişim/stale sayfa reddi; dolgu/kontrast ve marker cleanup.
Önceki CI unit kurulum eksiği yeni testler için npm ci eklenerek kaynakta giderildi;
GitHub/Node 24 çalıştırması henüz doğrulanmadı. A-01 bağlı tarih açığı ortak alan
doğrulaması ve motor filtresiyle giderildi, regresyonları geçti. A-03 siyasi kart ve
A-04 gerçek screenshot baseline bu faz kapsamında çözülmüş sayılmadı.

Yeni dış bağımlılık seçilmiyor. Web/Android JS export gerçek GPU/cihaz kanıtı
değildir; fiziksel Android ölçülene kadar UNVERIFIED ON DEVICE kalır.

ETL doğrulama kuralları 1.3.0 oldu; aynı gerçek katalog ve geometri korunarak
pilot manifesti/generated modülü yeni ETL metadata'sıyla yeniden üretildi.
[Uygulama sözleşmeleri](../cultural-layer.md), [faz sonucu](../reports/phase-09.md).
