# ADR-0017 — Tarihsel doğruluk ve yayın kapıları

2026-10-16 · Faz16 · Koddan önce küçük uygulama planı.

1. Mevcut üretim kataloğu ve üç çağ örneğini kaynak/revizyon/atıf/hak zinciriyle
   denetle; bağımsız doğrulanamayanı doğrulandı sayma. Yeni geometri üretme.
2. Bütün seçilebilir yıllar ve katmanlar için sayısal kapsam raporu üret;
   tarihsiz yer, biyografi, belirsiz sınır ve boş bölgeleri açık say.
3. URL/navigasyon, XSS/ham Expo bridge, CSP, secret ve bağımlılık yüzeylerini
   incele. Güvenli küçük düzeltmeleri regresyon testleriyle uygula; framework
   değiştirme veya doğrulanmamış native köprü yaması yapma.
4. Lisans/atıf envanteri ve gerçek uygulama davranışından gizlilik politikasını
   yaz. Web/Android E2E, accessibility ve cihaz testlerini çalışabildiği ölçüde
   raporla; mock/listelenen test ile runtime kanıtını ayır.
5. Release-blockers ve kanıtlı GO/NO-GO oluştur. Kritik kaynak, güvenlik, hak veya
   cihaz kapısı açıkken yayın NO-GO. Faz17'ye geçme, yayınlama yapma.
