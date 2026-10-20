# İndirilen dünya referanslarının incelemesi — 19 Ekim 2026

## Sonuç ve kapsam

**IMPLEMENTED:** Altı dosyanın receipt/URL/sürüm/SHA kontrolü geçti. Önceki
terminal DNS engeli kullanıcının indirmesiyle aşıldı; yeniden indirme gerekmez.
Natural Earth Countries **258**, Map Units **298** özellik içerir. Bunlar
bağımsız ülke sayısı değildir; bağımlı, ihtilaflı ve farklı harita birimleri vardır.
İki gerçek GeoJSON toplam **26.813.673 byte**; önceki 9,5 MB tahmini yanlıştı.

Denetim artık yalnız merkez noktası kullanmaz. Her özelliğin en büyük en fazla
8 bileşeni için bir temsil noktası ve 5×5 bbox ızgarasının poligon içinde kalan
noktaları incelenir; en fazla 208 iç nokta/özellik. Delikler dışlanır, giriş
geometrisi değiştirilmez. Kimlik karşılaştırması güvenilen kaydın QID'siyle
yapılır. QID farklılığı otomatik yanlış egemenlik kararı değildir.

| Referans | Özellik | İç örnek | Hiçbir kaynak poligonunda olmayan örnek | Farklı QID'li poligona denk gelen örnek |
| --- | ---: | ---: | ---: | ---: |
| Countries | 258 | 13.787 | 7.130 | 1.617 |
| Map Units | 298 | 14.853 | 7.912 | 2.047 |

Countries içinde 176, Map Units içinde 205 özellikte en az bir boş örnek var.
**Bu sayılar eksik ülke sayısı veya yüzölçümü yüzdesi değildir.** Küçük adalar,
iki kaynağın farklı kıyı genelleştirmeleri, semantik farklılıklar, denizaşırı
alanlar ve ihtilaflar sonuçlara etki eder. Aynı QID eşleşmesi de 2024 tarihini
doğrulamaz. 8 bileşen sınırı nedeniyle küçük parçaların tamamı örneklenmez.

[Özet envanter](world-data-audit/reference-summary.json),
[koordinat ve eşleşme kanıtları](world-data-audit/audit.json),
[indirilen dosyaların hash kontrolü](world-data-audit/download-verify.log).

## Somut bulgular

- **Suriye:** 16 iç örneğin 5'inde kaynak poligonu yok. Örneğin
  `[40.3810499, 36.8237196]` ve `[41.7118073, 36.8237196]` (lon/lat)
  Natural Earth Suriye alanı içinde, uygulamanın 2024 katmanında boş.
  Bir güney örneği Ürdün kaydına denk geliyor; sınıra yakın uyumsuzluk ayrıca
  incelenmeli. İlk yalnız merkez kontrolü bu kısmi alan sorununu kaçırıyordu.
- **Angola:** 43 örneğin 8'i boş; Cabinda temsil noktası
  `[12.2721832, -5.077323]` boşluk örneklerinden biri. Anakara kaydı var.
- **San Marino / Vatikan:** ayrı referans poligonlarındaki sırasıyla 20 ve
  24 iç örnek uygulamada İtalya poligonuna denk geliyor. Boşluk taraması tek
  başına yeterli değil; ayrı kimlik ve geometri incelemesi gerekiyor.
- **Lihtenştayn:** 17 örneğin 6'sı boş; diğerlerinde İsviçre/Avusturya
  kayıtları var. Yakın ölçekte kaynak sınırlarının ayrıntısı yetersiz.
- **Türkiye:** ana temsil noktaları mevcut; 6 bileşendeki 101 örneğin 60'ı
  boş. Bu oran ülkenin yüzde 60'ı eksik demek değildir; küçük ada ve kıyı
  bileşenleri de aynı örnekleme bütçesini alır.

**Hollanda düzeltildi:** 2024 satırları 13741 ve 13771 aynı dönem ve aynı
`5d295ca52bee1461cf46adf17daa61f86b57f690d64e17d624b94ce5915b8a4a`
geometri hash'ini taşıyor. 13741 mükerrer olarak çizimden çıkarıldı;
13771 ve kaynak arşivi korundu. Yanlışlıkla bütün Hollanda kaldırılmadı.
Bu değişiklik yalnız aynı geometriyi iki kez boyamayı engeller; kıyı boşluklarını
çözmez. 2024 artık **195 kaynak satırı / 189 çizilebilir / 6 kapalı**.
Tüm tarih kataloğunda kapalı satır sayısı 420; önceki rapor 419'du.

## Kaynak ve lisans kararları

Natural Earth v5.1.2 public domain: iki dosya karşılaştırma için kullanıldı,
üretim veri paketine eklenmedi. Kaynaklar mevcut indirme allowlist'inde:
[Admin-0 belgeleri](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/),
[kullanım hakkı](https://www.naturalearthdata.com/about/terms-of-use/).
Sürüm numarası bir 2024 geçerlilik tarihi değildir.

İndirilen geoBoundaries metadata önceki araştırmayı doğruluyor:

| Dosya | Temsil yılı | Özgün lisans alanı | Üretim durumu |
| --- | --- | --- | --- |
| AGO gbOpen ADM0 | 2021 | CC BY-SA 2.0; OSM kökeni | MANUAL REVIEW |
| SYR gbOpen ADM0 | 2017 | ODbL 1.0 | MANUAL REVIEW |
| TUR gbOpen ADM0 | 2021 | CC BY-SA 2.0; OSM kökeni | MANUAL REVIEW |
| SYR gbHumanitarian ADM0 | 2021 | CC BY 3.0 IGO; UNCS/UNOCHA/HDX | MANUAL REVIEW |

Bu dört dosya **metadata**, ayrıntılı geometrinin kendisi değil. Genel site
lisansı ile özgün kaynak alanları eşitlenmedi. Mevcut dosyalar dünya taraması
için yeterli; kullanıcıya yeni toplu indirme önerilmiyor. Suriye/Angola için
2024'e ait ulusal çevre kanıtı ve kaynak koşulları incelenmeden geçmiş yıl
alanları taşınmaz. 1453 Bizans için bu çağdaş referanslar çözüm değildir;
önceki rapordaki dönem/bileşen doğrulama gereksinimi sürer.

## Değişiklikler ve doğrulama

- `src/data/world/review.ts`: hash/ad/yıl kontrollü 2024 Hollanda tekilleştirmesi.
- `scripts/world/compare-reference.mjs`: sınırlı iç örnekleme, QID karşılaştırması.
- `scripts/world/audit-global.mjs`: audit v2 ve küçük özet envanter çıktısı.
- `tests/unit/world-audit.test.mjs`: merkez kapsanırken eksik iç alan, farklı
  kimlik, deterministik sonuç ve nokta bütçesi regresyonu.
- `tests/unit/country-compact.test.mjs`: gerçek mükerrer/kalan geometri ve
  değişmiş kaynağı reddetme testi; `world.test.mjs` kapsam sayıları **bir
  kanıtlı mükerrer çıkarıldığı için** 189'a güncellendi, koşullar gevşetilmedi.
- README, progress, veri kalite/kaynak/lisans sicilleri güncellendi.

`npm test`: **378/378 PASS**, sıfır atlanan test. Native/web typecheck,
değişen kodda ESLint, `world:check` (374 paket), referans verify ve
`world:audit` **PASS**. Test sonuçları ve komut logları
`world-data-audit/*after-download.log` dosyalarında.
Yeni bağımlılık veya üretim sınırı indirilmedi. Görsel/E2E ve web export bu tur
**NOT TESTED**; Android **UNVERIFIED ON DEVICE**. Fiziksel küre, timeline ve
harita stili değiştirilmedi. `.git` bulunmadığından git diff/status yok.

**PARTIAL:** Verilerin karşılaştırılması ve mükerrer çizim düzeltmesi tamam;
Suriye/Cabinda ve küçük devlet sınırlarının üretimde tamamlanması, yıl ve
semantik incelemesi gerektiriyor. Bütün dünya sınırları düzeldi iddiası yok.
