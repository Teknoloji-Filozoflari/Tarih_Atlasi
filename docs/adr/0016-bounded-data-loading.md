# ADR-0016 — Manifest parçaları, sınırlı önbellek ve ölçüm

2026-10-16 · Faz15 · Koddan önce uygulama planı.

1. İncelenmiş pilotu kaynak bağımlılıklarını koruyan küçük katalog parçalarına
   ayır; manifestte yıl/bbox/LOD/kök kayıt/byte/hash/sürüm/hak bilgisi olsun.
   Büyük veri indirme. Mevcut19 kayıt başlangıç indeksi sınırını açık tut;
   gelecekte büyük geometriyi bu senkron indekse eklemeyi bütçeyle reddet.
2. Ortak cache: manifest+SHA+production license doğrulaması, bounded concurrency,
   iptal/timeout/backoff, byte/entry LRU. Web CacheStorage, native özel cache
   dizini; bozuk/sürümü farklı içerik silinir, izinli paketli fallback kullanılır.
3. Timeline ve ortak DOM renderer yalnız gerekli parçaları doğrular/yükler.
   Başarısızlık ana fiziksel küreyi düşürmez; Türkçe durum ve retry olur. Eski
   talepler commit edemez. Kapsama ve kaynak yılı değişmez; kısmi hata gizlenmez.
4. Render tarafında gereksiz marker rebuild ve resize/camera eventlerini azalt;
   büyük geometri köprüden geçmez. İsteğe bağlı sınırlı yerel ölçüm sayaçları,
   CPU/cache/memory ve web ağ/başlangıç/katman benchmark scriptleri oluştur.
5. Gerçek test/ölçümü raporla. FPS/GPU/PSS/pil/ısı ve Android lifecycle ölçümü
   cihaz yoksa UNVERIFIED ON DEVICE; browser localhost engeli varsa BLOCKED.

Yeni bağımlılık, dış tile sağlayıcısı, tarihî kaynak veya servis eklenmez.
Wikimedia açıklama, uygulama verisi, fiziksel stil ve dış tile ayrı politikalardır;
makale/görsel/tile otomatik cache yoktur. HTTP immutable yalnız hash adlı dosyada;
manifest revalidate, üretim sunucusunda ayrıca header doğrulaması gerekir.
