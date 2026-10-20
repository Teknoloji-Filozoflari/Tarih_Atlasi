# Tarih araçları ve dört ülke kaydı — 18 Ekim 2026

## Sonuç ve sınırlar

**IMPLEMENTED:** `…` menüsü, tam yükseklikteki yan panel yerine en fazla 520 px
genişlikte, içeriğe göre boyutlanan, kısa ekranlarda kaydırılabilen pencere oldu.
Seçili yıl / yıl seçme, eşleşen geri–ileri 10 ve 100 yıl düğmeleri,
başlangıç–bitiş, çizelge ölçeği ve oynatma hızı ayrı gruplarda. 48 px dokunma
hedefleri, klavye odağı, modal geri/kapatma, Türkçe katalog ve mevcut zaman
motoru korunur. Diğer bilgi panellerinin düzeni değişmedi.

**IMPLEMENTED:** Çad, Angola, Mali ve Tunus'un kaynakta bulunan kayıtları
incelendi. Üretime sentetik veya yeni çizilmiş geometri eklenmedi. Kaynak
aralıkları dışına taşıma yok; 2025 ve sonrası için bu sınırlar gösterilmez.
**PARTIAL:** Angola 2024 yalnız kaynakta bulunan anakara poligonudur; Cabinda
yoktur. Kartta kısmi alan uyarısı ve kaynak ayrıntısında açık not bulunur.

## Kayıt bazında karar

Girdi: Cliopatria v0.2.1, `cliopatria_polities_only_v021.geojson`, 0 tabanlı
Feature indeksleri. Arşiv SHA-256:
`e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4`.
CC BY 4.0; mevcut lisans metni de hash ile doğrulandı.

| Ülke | Yeni incelenen satırlar / kaynak dönemi | Sorun ve işlem |
| --- | --- | --- |
| Çad | 13613 / 2024 | İzole dış/iç halka teması; önceki 13239 incelemesi bu snapshot'ı kapsamıyordu. Kenarlar ve iki delik aynen korunur. |
| Tunus | 13199 / 1958–1962; 13254 / 1963–1972; 13374 / 1976–2023; 13605 / 2024 | İzole halka teması; yalnız bu sabit geometri hash'leri için kontrollü teğet doğrulaması. Zaten geçerli 13343 / 1973–1975 değişmedi. |
| Angola | 13369 / 1976–2023; 13659 / 2024 | Kaynak eski rejim başlığını bütün aralığa yaymış. Q916 ülke kimliği ve kısa Angola etiketi; eski başlık provenance içinde. 2024 Cabinda eksik: partial-area. |
| Mali | 13234 / 1961–2023; 13773 / 2024 | Kaynak yanlışlıkla Mali Federation / Q216632 kullanıyor. Ülke kimliği Q912; kaynak adı/QID hata notunda korunur. 13206 / 1960 federasyon kaydı ve kimliği ayrı kalır. |

Mali için yeni ülke entity kimliği kullanılır; satır/territory kimlikleri
değişmez. Önceden federasyona kaydedilmiş yer imi federasyon olarak kalır;
sessizce güncel Mali'ye çevrilmez. Angola/Çad/Tunus entity kimlikleri korunur.

Çıkarıcı bütün kaynak kenarlarını yön bağımsız karşılaştırır; koordinat,
delik veya bileşen silmez/eklemez, yalnız halka yönünü normalize eder.
Teğet izni genel geometri doğrulayıcısına uygulanmaz; kesişme, ortak kenar,
dışarıdaki delik ve temas ağı hâlâ reddedilir. Ham manifest ve 374 paket
değişmedi; v2 inceleme ekinde mevcut üç satırla birlikte 12 satır vardır.

## Kimlik kanıtı ve belirsizlik

- [Mali 22 Eylül 1960 metinleri, Perpignan Üniversitesi](https://mjp.univ-perp.fr/constit/ml1960ind.htm)
  ve [Mali Q912](https://www.wikidata.org/wiki/Q912): federasyon ile sonraki
  Mali ülke kimliğinin ayrılması. Geometriyi bu metinlerden türetmedik.
- [Angola resmî Ombudsmanlık tarihçesi](https://provedordejustica.ao/historia/)
  ve [Angola Q916](https://www.wikidata.org/wiki/Q916): eski rejim adı ile
  ülke kimliğinin ayrılması. Başlık tek bir rejimin 2024'e kadar sürdüğü
  anlamında kullanılmaz.
- [Cliopatria kaynak ve lisansı](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1):
  bütün çizilen geometrilerin ve aralıklarının doğrudan kaynağı.

Resmî metinlerin arama motorunda sunulan içerikleri ve Wikidata kayıtları
incelendi. BM Mali harita sayfasının doğrudan açılması başarısız oldu;
bağımsız kartografik doğrulama yapılmış sayılmadı. Hiçbir BM harita geometrisi
kopyalanmadı. Bütün kayıtlar **yaklaşık, düşük güvenli kaynak rekonstrüksiyonu**
olarak kalır; inceleme yıllık sınır ölçümü veya fiilî kontrol doğrulaması değildir.
Mali kaynak geometrisinin Senegal'i içermemesi kimlik düzeltmesiyle tutarlıdır;
bu, sınırın her noktasını bağımsız doğrulamaz.

## Sayısal kapsam

| Yıl | Kaynak siyasi satırı | Önce çizilebilir / kapalı | Sonra çizilebilir / kapalı |
| --- | ---: | ---: | ---: |
| 2000 | 192 | 180 / 12 | 183 / 9 |
| 2010 | 191 | 180 / 11 | 183 / 8 |
| 2024 | 195 | 186 / 9 | 190 / 5 |

Sayılar ülke sayısı değildir. 2024'te hâlâ kapalı: 13622 Mujahideen,
13642 Netherlands Antilles, 13684 Kingdom of Great Britain, 13708 Commonwealth
of Nations ve 13753 Estado Novo. Kimlik/dönem/kapsam çelişkileri incelenmeden
bu satırların kapısı açılmadı. Altı tarihsiz ham satır da tarihe yayılamaz.

## Değişen dosyalar

- Arayüz: `src/atlas/TimelineBar.tsx`, `EntitySheet.tsx`, `src/i18n/tr.ts`.
- Veri: `src/data/world/{review,records,types,search}.ts`,
  `src/data/world/generated/country-review.ts`.
- Tekrarlanabilir çıkarım: `scripts/world/review-countries.mjs`,
  `check-country-review.mjs`, `assets/licenses/country-review-NOTICE.txt`.
- Testler: `tests/unit/{country-compact,world}.test.mjs`,
  `tests/web/application-review.spec.ts`.
- Belgeler: bu rapor, progress, data-quality, source-matrix ve license-register.

## Doğrulama

Gerçek komut çıktıları [kanıt dizininde](timeline-countries-evidence/).
Son test/derleme sonuçları aşağıdaki ilerleme kaydıyla birlikte okunmalıdır.

| Kontrol | Sonuç |
| --- | --- |
| `npm test` | PASS — 372/372, 0 başarısız |
| Son `node tests/unit/world.test.mjs` renderer regresyonu | PASS — 19/19; 2010 ve 2024 inline geometri kapısı dahil |
| Native + web typecheck | PASS |
| Tam repository lint / değişen dosyalarda lint | PASS |
| Deterministik çıkarım / inceleme hash / 374 dünya paketi | PASS |
| Web export | PASS — 4 rota; 16.102 yer paketi, 645.992.949 byte |
| Değişen kodda formatter kontrolü | PASS |
| Canlı web görünümü ve etkileşim E2E | BLOCKED — tarayıcı sandbox hatası |
| Fiziksel Android | NOT TESTED — UNVERIFIED ON DEVICE |

İlk test koşusu, eski kapsam sayıları ve artık açılan Tunus/Angola kayıtlarına
ilişkin eski kapalı-kayıt beklentileri nedeniyle başarısızdı. Bu beklentiler yeni
kaynak incelemesine göre açıkça güncellendi; kalan kapalı kaynak kontrolleri
korundu. Yeni Cabinda nokta testinin kaynak poligonu içindeki koordinatı
düzeltildi. Son tam koşuda başarısız test yoktur.

- `npm test`: tüm unit/domain/loader regresyonları; yeni testler dört ülkenin
  2024 seçimi, QID'leri, Mali ayrımı, Cabinda boşluğu ve değişmiş kaynağı reddetme.
- `npm run typecheck`: native ve web TypeScript.
- `npm run lint`: repository ESLint; ayrıca değişen dosyalarda hedefli lint.
- `node scripts/world/review-countries.mjs --check`: sabit arşivden yeniden
  çıkarım, 12 satır, bütün kenarlar/delikler ve byte eşitliği.
- `npm run world:review:check`, `npm run world:check`: inceleme hak/hash kapısı
  ve değişmeyen 374 dünya paketinin doğrulaması.
- `npm run web:export`: web derlemesi ve yer paketlerinin web sunumuna kopyalanması.

**BLOCKED / görsel E2E:** Chromium başlatma denemesi
`sandbox_host_linux.cc ... shutdown: Operation not permitted` ile durdu.
Ekran görüntüsü veya görsel PASS yok. Menü boyut/grup, ölçek, yıl atlama,
hız seçimi ve yıl girişi senaryoları Playwright dosyasında hazır.
**UNVERIFIED ON DEVICE:** gerçek Android dokunma/yerleşim/TalkBack doğrulanmadı.

Kullanıcı kontrolü: web'i yenile; 2024'te Çad/Angola/Mali/Tunus adlarını arayıp
haritaya odaklan, kaynak kartını aç. 2025'te bu kaynakların çizilmediğini kontrol
et. `…` menüsünde ±10/±100, ölçek ve hız seçimini; küçük ekranda kaydırma,
klavye ve kapatma davranışını dene. İndirme veya yeni paket kurulumu gerekmez.
