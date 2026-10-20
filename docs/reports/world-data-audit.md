# Dünya ve tarih kapsamı denetimi — 19 Ekim 2026

**İndirme sonrası güncelleme:** Referanslar artık mevcut ve karşılaştırıldı;
Hollanda mükerreri kapatıldı, 2024 sayıları 195/189/6 oldu. Aşağıdaki ilk
incelemenin indirme engeli/sayıları tarihsel kayıttır.
[Güncel sonuçlar, kaynak hakları ve 378 test](world-reference-review.md).

## Karar

Mevcut Cliopatria rekonstrüksiyonları tek başına ayrıntılı, eksiksiz bir dünya
tarih atlası için yeterli değil. Sorun renderer renginden ibaret değil:
eksik/seyrek geometri, yanlış kimlikler, dönem çelişkileri, mükerrer alanlar ve
yalnız yıl seçen arayüzün yıl içi değişimleri ayıramaması birlikte etkili.
**Tam tarihsel doğruluk iddiasıyla yayın: NO-GO.** Araştırma atlası kapsamı ve
belirsizlikleri açık tutulmalı. 3D küre veya çalışan akışlar değiştirilmedi.

## Gerçekte neler incelendi?

- Hash doğrulanmış arşivin **13.797 ham satırının tamamı**, 13.379 uygulama
  siyasi satırı; bütün ad/QID eşleştirmelerinde tekrar envanteri.
- MÖ 2000–MS 2026 arasındaki **4.026 seçilebilir yılın** kayıt/kapsama sayımı;
  yıl sıfır yok. Bu, her yılın bütün sınırlarının uzman doğrulaması değildir.
- **2024'teki 195 kaynak satırının tamamı:** çizilebilirlik, kapatma gerekçesi,
  kaynak/effective QID, bileşen/koordinat sayısı, 2023 geometrisiyle değişim,
  temsil noktasında çakışma ve kısmi alan durumu.
- Bütün **374 üretim geometri paketi** hash/yapı/topoloji denetimi.
- 1440, 1452, 1453, 1454, 2010, 2023 ve 2024'te İstanbul, Suriye ve Cabinda
  inceleme noktaları. Koordinatlar analitik problardır; uygulamaya tarihî yer
  veya egemenlik kanıtı olarak eklenmedi.

[Makine raporu](world-data-audit/audit.json),
[her yılın sayımı](world-data-audit/yearly-counts.json).
Mevcut 195 satır dünyanın tüm bağımsız ülkelerinin referans listesi değildir.
Bağımsız referansla eksiksizlik kontrolü **PARTIAL / indirme bekliyor**.

## 2024 Suriye çevresindeki boşluk

Suriye satırı **13749**, kaynak yıl 2024; paket yüklü, zaman filtresinde açık.
Kaynak bbox'ının kuzeyi **36.674877°**, doğusu **40.989033°**. Örneğin
`[41,37]`, `[38,36.8]` ve `[39,36]` lon/lat inceleme noktalarını hiçbir
2024 kaynak siyasi poligonu kapsamıyor. Bu boşlukların bir kısmı ülke adının
gizlenmesi değil, geometri yokluğu. Kullanıcının ekrandaki tam koordinatı
verilmediğinden her görülen boşluğu tek tek eşlediğimiz iddia edilmez.

Kaynak ayrıca “Syria” için **Q41137** vermiş; bu kimlik
[Asur İmparatorluğu](https://www.wikidata.org/wiki/Q41137).
[Suriye Q858](https://www.wikidata.org/wiki/Q858) ile kaynaklı kimlik düzeltmesi
yapıldı. **IMPLEMENTED:** 2024 kartı artık `partial-area`, açık eksiklik notu ve
doğru ülke kimliği taşır. Geometri/hash/2024 tarihi aynen korundu; boşluk yeni
bir sınır çizilerek doldurulmadı. Bu alanların ülkesiz olduğu veya boşluğun
belgelenmiş bir kontrol bölgesi olduğu söylenemez.

## İstanbul ve Bizans — 1453

**7187** numaralı ham Bizans satırı **1440–1467**. Uygulamadaki
`HISTORICAL_DATE_REQUIRES_INDEPENDENT_REVIEW` kapısı bu aralığı tamamen
kapattığı için **1440–1452'de de** Bizans görünmüyor. Bu, Bizans'ın o yıllarda
var olmadığı anlamına gelmez; kaydın kapatılması uygulamada eksik temsil yaratıyor.

Ham geometri 7 bileşen içeriyor; Mora, ada parçaları, Karadeniz'de uzak küçük
bir parça ve İstanbul çevresindeki bileşen birlikte. Tek bitiş yılını 1453
yapıp bütün bileşenleri doğru saymak güvenilir çözüm değil. İnceleme noktası
`[28.8,41.1]` ham Bizans poligonunda; 1452 uygulamasında boş, 1453'te Osmanlı
pilot parçasında. `[28.98,41.01]` kıyı noktası ise ham Bizans ve Osmanlı
1453 geometrilerinde de dışarıda: kaynak çizgisinin güncel fiziksel kıyıyla
uyuşmaması da yakın ölçekte boşluk yaratıyor.

İstanbul'un alınması **29 Mayıs 1453**: belediye müzesinin
[resmî tarih anlatımı](https://panoramikmuze.com/Home/Hakkimizda).
Yalnız `1453` seçimi fetih öncesini/sonrasını belirlemez. Mevcut Osmanlı
1453–1458 kaydı yıl çözünürlüğünde bir kaynak rekonstrüksiyonudur; 1 Ocak
1453'te şehir o sınırdaydı diye yorumlanmamalı.

Gerekli çözüm: İstanbul bölgesi için lisanslı, kaynaklı fetih öncesi/sonrası
geometri; bileşen başına dönem incelemesi; yıl içi değişim göstergesi veya
açık “fetih öncesi / sonrası” seçimi. Sadece gün/ay seçici eklemek eksik
geometriyi üretmez. **BLOCKED: yeni tarihî sınır eklenmedi.**

## Dünya taramasında bulunan diğer sorunlar

### Bileşen kaybı adayları

| Aynı kaynak varlığı | 2023 bileşen | 2024 bileşen | Yorum |
| --- | ---: | ---: | --- |
| Angola | 2 | 1 | Cabinda kaynakta eksik; önceki kısmi alan uyarısı sürer |
| Republic of China / Tayvan | 7 | 1 | Büyük değişim; yalnız aday, henüz ada bazında bağımsız onay yok |
| ABD | 42 | 41 | Eksik ada / farklı kaynak genelleştirmesi adayı |
| Avustralya | 12 | 8 | Bileşen bazlı referans karşılaştırması gerekli |
| Ukrayna | 3 | 2 | İhtilaf/kontrol/sınır semantiği ayrıca incelenmeli; otomatik birleştirme yapılmaz |

Sayım düşüşü otomatik veri hatası veya gerçek toprak kaybı değildir. Şekil
bileşenleri coğrafi ada sayısı değildir. Planar alan oranı sadece karşılaştırma
teşhisidir, ülke yüzölçümü/istatistiği değildir.

2024 Hollanda iki adla, **aynı geometri hash'iyle** çiziliyor: 13741
`(Netherlands)` ve 13771 `Netherlands`. 2010'a özel önceki düzeltme 2024'e
genellenmemiş. Rusya, birleşik kaynak alanı ve işgal alanı kayıtlarında da
temsil noktası çakışmaları var; bunlar birbirinin eş anlamlısı veya eşit
egemenlik iddiası sayılamaz. Bu tur söz konusu kayıtlar değiştirilmedi.

### Kimlik eşleştirmeleri

Tüm kaynakta **141 QID** birden çok farklı adla kullanılmış: bunlar hata
sayısı değil, inceleme adaylarıdır. Aynı ülkenin farklı adları meşru olabilir.
2024'te aşağıdaki somut yanlış eşleştirmeler kaynakla doğrulanıp düzeltildi:

| Satır | Kaynak adı | Ham QID | İncelenen QID |
| --- | --- | --- | --- |
| 13749 | Syria | Q41137 | [Q858](https://www.wikidata.org/wiki/Q858) |
| 13643 | Republic of Korea | Q423 | [Q884](https://www.wikidata.org/wiki/Q884) |
| 13717 | Republic of China | Q148 | [Q865](https://www.wikidata.org/wiki/Q865) |
| 13738 | Republic of the Congo | Q974 | [Q971](https://www.wikidata.org/wiki/Q971) |
| 13769 | Guinea | Q983 | [Q1006](https://www.wikidata.org/wiki/Q1006) |

**IMPLEMENTED:** yalnız bu sabit satır/ad/yıl/geometri hash'leri. Eski QID
ham dosyada ve kartın kaynak notunda tutulur. Wikipedia URL başlığı
üretilmez; mevcut sitelink çözümleyici düzeltilen kimlikle çalışır.
Diğer dönemlerde aynı hata bulunabileceği için bütün eski satırlara kontrolsüz
isim/QID değişimi uygulanmadı. Bu beş kontrol, 195 kimliğin tamamının
bağımsız doğrulandığı anlamına gelmez.

## Tarih aralığı boyunca kapsam

| Yıl | Kaynak siyasi satırı | Çizilebilir | Kapalı |
| --- | ---: | ---: | ---: |
| MÖ 2000 | 4 | 4 | 0 |
| MÖ 500 | 48 | 46 | 2 |
| MS 1 | 45 | 45 | 0 |
| 1000 | 132 | 129 | 3 |
| 1400 | 157 | 155 | 2 |
| 1452 | 133 | 129 | 4 |
| 1453 | 135 | 130 | 5 |
| 1800 | 130 | 129 | 1 |
| 1900 | 88 | 86 | 2 |
| 2000 | 192 | 183 | 9 |
| 2024 | 195 | 190 | 5 |
| 2025 / 2026 | 0 | 0 | 0 |

MÖ 2000'de 4 kayıt olması o tarihte dünyada dört siyasi topluluk olduğu
anlamına gelmez. Tüm katalogda **419 satır** kapalı; 383'ü halka kesişmesi,
11'i açık/boş halka, 2'si sıfır alan, 2'si temas ağı, 2'si tarih incelemesi,
18'i kimlik/ad-dönem incelemesi, 1'i mükerrer kayıt. Altı ham satırın tarihi
geçersiz/bilinmiyor. Geometri kapısını topluca gevşetmek çözüm değildir.

## Daha iyi veri seçenekleri — resmî kaynak araştırması

| Kaynak | Ne için uygun? | Hak / tarih sınırı | Karar |
| --- | --- | --- | --- |
| [Natural Earth Admin-0 Countries / Map Units](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/) | Dünya ülke/denizaşırı parça karşılaştırması, fiziksel tabanla daha tutarlı çağdaş çizgi | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/); tarih motoru yok; varsayılan de facto bakış; paket sürümü tarihî geçerlilik değildir | Şimdi indirilecek küçük referans; 2024'e veya 1453'e otomatik uygulanmaz |
| [geoBoundaries API](https://www.geoboundaries.org/api.html) | Ülke bazında daha ayrıntılı ADM0–ADM2 | Yıl ve özgün kaynak lisansı ülke başına incelenmeli | Önce metadata; genel CC BY 4.0 sayfası tek başına yeterli değil |
| [CShapes 2.0](https://icr.ethz.ch/data/cshapes/) | 1886–2019 dünya; Avrupa ayrı seride 1816'dan | CC BY-NC-SA 4.0, kaynak gün/ay dönemleri; R yazılım lisansı veri hakkından ayrı | Yerel dosya zaten var; yeniden indirme gerekmiyor, üretim incelemesi bekliyor |
| [CShapes 2.1 beta](https://icr.ethz.ch/data/cshapes/beta.html) | 1886–2023 için daha yeni aday | Beta / CC BY-NC-SA 4.0; 2024 veya 1453 çözümü değil | Öncelikli indirme değil |
| [Cliopatria v0.2.1](https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1) | Geniş tarih aralığının yaklaşık çatısı | CC BY 4.0; “frame years” sınırlaması ve yayıncı düzeltme notları | Zaten kurulu; aynı dosyayı yeniden indirmek mevcut boşluğu çözmez |
| [OpenHistoricalMap](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/License) | İstanbul gibi belirli dönem/bölge için aday | CC0 varsayılan, `license=*` istisnaları; relation üyeleri/kaynak/tarih tek tek incelenmeli | Küçük bbox ve tarih aralığıyla edinme; dünya planet dosyası gereksiz |
| [Historical Basemaps](https://github.com/aourednik/historical-basemaps) | Seyrek dönemlerin araştırma karşılaştırması | Repo GPL-3.0; proje kuralındaki veri lisansı/kaynak zinciri belirsizliği çözülmedi | **BLOCKED FOR REDISTRIBUTION** |
| [Pleiades](https://pleiades.stoa.org/) | Antik yer adları ve yer ilişkileri | Açık atıflı gazetteer; ülke sınırı serisi değil | İstanbul/Bizans sınırlarını veya modern ülke boşluklarını tek başına çözmez |

**geoBoundaries özel bulguları:**

- [AGO gbOpen](https://www.geoboundaries.org/api/current/gbOpen/AGO/ADM0/):
  temsil yılı **2021**, 47.140 köşe, özgün lisans alanı **CC BY-SA 2.0**,
  OpenStreetMap kökeni. Genel site lisansı ile özgün alan arasındaki durum
  incelenmeden “CC BY 4.0, 2024 Angola” diye paketlenemez.
- [SYR gbOpen](https://www.geoboundaries.org/api/current/gbOpen/SYR/ADM0/):
  **2017**, 10.729 köşe, **ODbL 1.0**. Fiilî kontrol haritası değildir.
- [TUR gbOpen](https://www.geoboundaries.org/api/current/gbOpen/TUR/ADM0/):
  **2021**, 256.608 köşe, özgün alan **CC BY-SA 2.0**. Daha çok köşe
  daha iyi tarihsel kanıt değildir; mevcut tek-geometri bütçesini aşar.
- [SYR gbHumanitarian](https://www.geoboundaries.org/api/current/gbHumanitarian/SYR/ADM0/):
  **2021**, UNCS/UNOCHA/HDX, **CC BY 3.0 IGO**, 5.247 köşe. Uluslararası
  ülke çevresi için incelenmeye değer alternatif; doğrudan HDX sayfası
  bu ortamda açılamadı. Paket/özgün lisans doğrulanmadan üretime alınmadı.

Bu incelemede 2024'ün bütün ülkelerini ve MÖ 2000–günümüzün her yılını birlikte
eksiksiz ve açık lisansla çözen bir kaynak doğrulanamadı. Bir kaynağın güncel
olması, o geometriyi bütün tarihî yıllara taşıma izni/kanıtı sağlamaz.

## Kullanıcının çalıştıracağı indirme

Proje kökünde:

```sh
npm run world:audit:download -- --timeout-seconds 1800
npm run world:audit:download -- --verify
npm run world:audit
```

İki Natural Earth GeoJSON ölçülmüş toplam **26.813.673 byte**; ayrıca dört küçük geoBoundaries
metadata dosyası. Ücretli hesap, API anahtarı veya R/Python kurulumu gerekmez.
Kayıt yeri `data/staging/world-audit/`; checksum/URL/sürüm receipt'i tutulur.
Seri indirme, boyut limiti, timeout, en fazla iki deneme ve doğrulanmış cache
kullanılır; mevcut dosya/receipt çelişirse üzerine yazılmaz.

**Bu komut haritayı değiştirmez.** İndirme sonrası audit, bütün referans
özelliklerini envantere alır; her birinde en büyük en fazla 8 bileşenin iç
noktasını 2024 poligonlarıyla karşılaştırır. Hiçbir kaydın kapatılmasını veya
bir ülkeye alan atanmasını otomatik yapmaz. Bir noktada başka ülke poligonu
bulunması kimlik doğrulaması değildir; tam kıyı/alan farkı analizi ayrıca gerekir.
`audit.json` içindeki `referenceChecks` yeni sonuçları içerir. İndirme yoksa
`BLOCKED_NOT_DOWNLOADED` açıkça yazılır; bozuk receipt/hash raporu durdurur.

Bu ortamda gerçek indirme **EAI_AGAIN** DNS hatasıyla durdu. Web araştırması
ile veri indirme ağı farklı olduğundan sayfaları incelemek indirmenin başarılı
olduğu anlamına gelmez. [İndirme çıktısı](world-data-audit/download.log).

## Uygulama sırası ve kalan engeller

1. Çağdaş ülke karşılaştırmasını tamamla: eksik anakaralar/eksklavlar/adalar,
   aynı geometriyi çizen mükerrer varlıklar, yanlış QID'ler. Her ülkenin
   bağımsızlık/bağımlılık/tartışmalı alan durumunu ayrı tut.
2. 2024 için yeni ulusal çevrelerin tarih ve lisansını doğrula; iddia edilen
   ülke alanı ile iç savaş/işgal kontrol alanlarını farklı semantikte sakla.
   Suriye/Cabinda'yı kaynağı belirsiz çizgiyle kapatma.
3. 1886–2019/2023 dönemini CShapes ile karşılaştır; NC/SA koşulları ve yerel
   dosyanın kökeni çözülmeden yeniden dağıtma. Sadece ücretsiz olmak yeterli
   bir veri lisans değerlendirmesi değil.
4. 1453 İstanbul için OHM/uzman tarih atlası kaynaklı küçük bir inceleme yap;
   fetih öncesi/sonrası ve bileşen dönemlerini modelle. Modern İstanbul ili
   veya güncel ülke sınırı kullanma.
5. Aynı kalite kapısını veri ithalinde çalıştır: kimlik çakışması, parça kaybı,
   tarih kırılması ve referans boşluğu raporları manuel kullanıcı keşfine
   bırakılmasın. Tarihsel anlamda doğrulama hâlâ kaynak/uzman incelemesi ister.

## Kod, test, platform durumu

Değişenler: `scripts/world/{audit-global,compare-reference,download-audit-sources}.mjs`,
`src/data/world/review.ts`, `tests/unit/{world-audit,country-compact}.test.mjs`,
`tests/run.mjs`, `package.json`, `.gitignore`; README/progress/veri/lisans belgeleri.
Yeni npm bağımlılığı, kilit dosyası değişimi veya üretim geometrisi yok.

Komut logları [kanıt dizininde](world-data-audit/). Unit, native/web typecheck,
değişen kodda lint ve dünya paket kontrolleri çalıştırıldı:

| Komut / kontrol | Gerçek sonuç |
| --- | --- |
| `npm test` | **PASS: 376/376**, sıfır atlanan test |
| `npm run typecheck` | **PASS**, native ve web |
| Değişen kodda ESLint | **PASS**; tüm depo lint bu tur tekrarlanmadı |
| `npm run world:check` | **PASS**, 374 paket / 120.664.555 byte |
| `npm run world:audit` | **PASS**, yerel kaynak envanteri; bağımsız referans eksik |
| Referans indirme | **BLOCKED**, `EAI_AGAIN`; `--verify`: dosya yok |
| Web görsel/E2E ve export | **NOT TESTED**, bu tur yeniden çalıştırılmadı |
| Gerçek Android cihaz | **UNVERIFIED ON DEVICE** |

İlk lint koşusunda eksik `node:buffer` importu
bulundu ve düzeltildi. Görsel/E2E/web export bu araştırma turunda yeniden
çalıştırılmadı. Android **UNVERIFIED ON DEVICE**. Git status exit128:
bu çalışma dizininde `.git` yok; kullanıcı verisi silinmedi.
