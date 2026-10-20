# ADR-0015 — Ortak filtre sorgusu ve yerel katman tercihleri

2026-10-16 · Faz 14 · Koddan önce küçük uygulama planı.

1. Altı bağımsız görünürlük: siyasi varlık, kültür, kişi, savaş, diğer olay ve
   kaynaklı tarihî etiketler. Yer etiketi için de tarih/geometri kanıtı gerekir;
   modern bina koordinatı geçmişteki adı veya varlığı kanıtlamaz.
2. Kayıt güveni, kesin/yaklaşık destek, siyasi tür, kişi konum ilişkisi ve olay
   türünü tek şemalı filtrede tut. Zaman motoru, kart listeleri ve renderer aynı
   filtreyi kullanır. Filtre kaynağın doğrulama/lisans kapısını gevşetmez.
3. Tercihleri ayrı sürümlü yerel depoda sakla. Okuma/yazma hatasını görünür kıl;
   bozuk kaydı sessizce ezme. Tercih değişikliği yıl/kamera/dil değiştirmez.
4. Birleşik lejant, yoğunluk açıklaması, mevcut bounded clustering ve kültür
   sayısına bağlı dolgu; seyrek görünümde etiketleri azaltma. Kayıtları gizlice
   düşürme. Koyu tema sabit, sistem veya azaltılmış hareket; atıf her zaman açık.
5. Yerel fiziksel stil için modern siyasi kaynak/etiket enjeksiyonunu reddeden
   guard; regresyon, kalıcılık ve bridge sınırı testleri; web/Android JS export.

Yeni paket/veri/servis eklenmez. Tarihî katalog ve lisans kapıları korunur.
Gerçek cihaz doğrulaması yapılmadan Android kabulü tamamlandı sayılmaz.
