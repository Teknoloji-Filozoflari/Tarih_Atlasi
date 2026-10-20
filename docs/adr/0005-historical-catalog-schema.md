# ADR-0005 — Şema v1, kanıt ve üretim kapısı

2026-10-15 · **ACCEPTED — PHASE 04 DOMAIN / TOOLING SCOPE**.
Renderer cihaz kabulü ve gerçek veri yayını için onay değildir.

Kullanıcının son Faz 04 talebi, eski yol haritasındaki faz başlığının yerine
geçer: büyük indirme yapılmadan şema, kaynak manifesti, ETL ve sağlayıcı kurulur.
Faz 01–03 açık kabul kapıları korunur; Faz 05 kendiliğinden başlamaz.

Tek Expo deposunda saf TypeScript tipleri ve küçük katı runtime doğrulayıcıları
seçildi. Yeni Zod/Ajv/topoloji bağımlılığı alınmadı. Domain/provider Node/React/
renderer'dan bağımsız, Node crypto/dosya işlemleri yalnız scripts/etl içinde kalır.
İleride JSON Schema üretimi veya GEOS kullanımı gerekirse ayrı uyumluluk/lisans/
boyut incelemesi yapılır. Özel şemaların bakım maliyeti vardır; negatif domain
testleri ve iki platform strict typecheck bunu sınırlar.

Siyasi/kültürel alan ve kişinin genel yaşam yeri/tarihli bulunması ayrı tiplerdir.
Kaynak, hak, zaman ve kalite ayrı kapılar taşır. Bilinmeyen tarih sonsuz geçerlilik
değildir; tarih kaynağı ve eski numaralama metni saklanır. Provenance source/revision/
raw SHA/locator/transform zincirinden oluşur. Lisans politikası bilinmeyeni reddeder;
conditional kaynak için güvenilen kodda hash/revizyona bağlı editöryal onay gerekir.

ETL yalnız yerel, sınırlı, sıralı ve deterministiktir. Hatalı aday bütün olarak
reddedilir; ham veri ve üretim ayrılır. Canonical JSON checksum'u yeniden üretimi
kolaylaştırır, özgünlük veya bilimsel doğruluk sağlamaz. Üretim review flags'i insan
incelemesinin kaydıdır; yanlış upstream beyanını otomatik teşhis ettiği iddia edilmez.

Topoloji küçük pilotlar için konservatif düzlemsel kontrol ve bütçe sınırıdır.
Bütçe aşan/sferik karmaşık geometri incelemeye gider; sessiz düzeltme yapılmaz.
Sağlayıcı ilk aşamada zaman indeksi ve grid/bbox indeksiyle küçük bir statik
kataloğu kullanır; asenkron arayüz ileriye dönük adaptör alanı bırakır.
Bu fazda uygulamaya gerçek tarihî veri veya yeni UI bağlanmaz.

[Ayrıntılı model, kararlar, CLI ve sınırlar](../data-model.md).
