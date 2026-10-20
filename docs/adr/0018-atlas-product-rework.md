# ADR-0018 — Atlas ve Küre ile harita odaklı ürün düzeni

2026-10-16. Kullanıcının proje geneli iyileştirme isteği bu çalışmanın alt
adımları arasında rutin faz onayı beklememe yetkisini verir. Önceki çalışma
kayıtları korunur; bu çalışma Faz17 yayın işlemi değildir.

Uygulanabilir plan:

1. Yedi kanıtlı doğruluk/ETL/yer imi hatasını negatif regresyonlarla düzelt;
   ham kaynakları ve önceki çalışan akışları koru.
2. Tek MapLibre çekirdeğinde Atlas(mercator) ve Küre(globe); kamera/tarih/katman
   sürekliliği, şemalı projection komutu, güvenli zoom sınırları. İzinli daha
   ayrıntılı fiziksel taban için bounded hazırlama ve provenance planı; ağ/asset
   erişimi olmazsa mevcut110m tabanı ayrıntılıymış gibi sunma.
3. Ana ekranı sabit üst bar + kalan alanın tamamında harita + kompakt timeline
   şeklinde düzenle. Keşif, kataloglar, yer imleri, paylaşım ve yardımcı
   kontroller panellere taşınır; işlevler silinmez. Desktop detay paneli ve
   mobil sheet; görünür Türkçe metinler katalogdan.
4. Arama/seçim/tarih/odak/katman/kaynak/yer imi/paylaşım akışları, boş/error/
   loading/fallback, klavye/touch ve küçük ekran regresyonları.
5. Lint/strictTS/unit/asset/hash/format, web/Android JS export ve gerçek browser/
   cihaz denemesi; kanıtlar ve IMPLEMENTED/PARTIAL/BLOCKED/NOT TESTED matrisi.
   Yayın engellerini gizleme; yıkıcı migration veya yayınlama yapma.

Yeni harita SDK'sı, ücretli servis veya hesap yok. Referanslar yalnız işlevsel
sentez için; kod/veri/görsel/marka kopyalanmaz. Kullanıcının modern siyasi
etiket yasağı ve belgelenmiş tarih/konum zorunluluğu değişmez.
