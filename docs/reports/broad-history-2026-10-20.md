# Dünya tarihi içerik genişletmesi — 20 Ekim 2026

**PARTIAL:** bütün önemli kişiler, savaşlar, Nobel sahipleri ve TIME seçkileri
tamamlanmadı. **IMPLEMENTED:** 56 yeni kişi + 23 savaş/olay gerçekten mevcut
üretim veri sağlayıcısına, aramaya, kişi/olay kartlarına ve yıl filtrelerine
bağlandı. Yeni indirme, hesap veya API anahtarı gerekmeden çalışırlar.

## Kanıt ve kapsam

| Sayım | Bu ek | Birleşik uygulama |
| --- | ---: | ---: |
| Kişi profili | 56 | 234 |
| Doğum yılına özel yaklaşık nokta | 36 | 147 |
| Doğum sürümlerindeki yalnız biyografik bağlantı | 10 | 47 |
| Doğum sürümlerindeki konumsuz profil | 10 | 39 |
| Savaş/olay kaydı | 23 | 36 |
| Ek olaylarda yaklaşık muharebe noktası / konumsuz kayıt | 7 / 16 | Önceki olaylar ayrıca korunur |
| Doğrulanmış statik sitelink snapshot | 79 | 88 |

233 doğum sürümü profiline önceki Van Gogh kişi pilotu eklenince 234 olur.
823 isimlik eski kullanıcı listesinden 179 eşleşmiş, 635 inceleme bekliyor,
9 belirsiz ad atlanmış durumda. Bu ekin bir adayı Jean-Paul Sartre için sabit
revizyon alınamadı; sahte kaynak veya tarih yazılarak yayımlanmadı.
Kayıt bazında ad/yıl/konum/karar/revizyonlar
[coverage.json](broad-history-2026-10-20/coverage.json) içindedir.

Örnekler: Richard Feynman, Schrödinger, Pauli, Born, Kant, Nietzsche, Zhu Xi,
İbn Rüşd, Gazzâlî, Mevlânâ, Dalay Lama, Rahibe Teresa, Malala, Desmond Tutu,
Orhan Pamuk, Toni Morrison, Gurnah, Pierre Curie, Barbara McClintock, Abdus Salam.
Waterloo 1815, Puvatya 732, İnebahtı 1571, Viyana 1529/1683, Gettysburg 1863,
İkinci Pön Savaşı MÖ 218–201, Kore/Vietnam savaşları, Fransız/Rus devrimleri,
Versay 1919 gibi kaynak kayıtları eklendi. Bütün lider, bilim insanı ve savaş
gruplarının eksiksiz envanteri olduğu iddia edilmiyor.

## Kaynak, tarih ve konum kararları

- Kaynak Wikidata'nın CC0 yapılandırılmış iddialarıdır; canlı sayfalarda insan/
  yer/olay kimliği, source revision, P569/P570/P19/P625 ve olay tarihleri
  incelendi. Ham dosya açıkça editoryal çıkarımdır; özgün API yanıtı değildir.
  Kısa Türkçe açıklamalar oluşturuldu; makale paragrafı veya portre alınmadı.
- Her kaynak sabit oldid URL'si, locator, input SHA256 ve dönüşüm kararıyla
  bağlanır. Toplu veri incelemesi bağımsız akademik kaynak onayı değildir;
  güven medium, yaklaşık noktalar opt-in filtresiyle uyumludur.
- Kaynaklı doğum yılı harita noktası yaşam boyunca ikamet anlamına gelmez.
  Pisagor gibi geleneksel/çelişkili tarihler, birden fazla doğum yeri veya
  tarihî yapı evresi çözülmemiş kişiler yıllık noktaya dönüştürülmedi.
  Ada/bölge merkezi şehir veya doğum evi gibi gösterilmedi.
- Gettysburg'un görsel bağlamındaki 1887, bazı sayfalardaki referans tarihi
  2017/2022 olay tarihi yapılmadı. Versay imzası 1919, yürürlük 1920; farklı
  kavramlar korundu. Yüz Yıl Savaşı'nın 1455 latest-date niteleyicisi ayrı
  alternatif tarihtir; ana filtre 1453'te biter. Kore silahlı çatışma aralığı
  nihai barış antlaşması değildir.
- Olaylarda yıl hassasiyeti; özgün gün/takvim metni korunur, doğrulanmamış gün
  dönüşümü yok. Yedi yaklaşık muharebe noktası dışında tek savaş merkezi veya
  bölge geometrisi uydurulmadı. Konumsuz olaylar yıl listesi/aramada bulunur.
- 79 Wikipedia hedefi doğrudan varlığın mevcut trwiki sitelinkinden izlendi;
  başlıktan URL uydurulmadı. Statik resolver ve URL güvenlik kuralları korundu.

Kaynak politikaları: [Wikidata lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing),
[veri erişimi](https://www.wikidata.org/wiki/Wikidata:Data_access).
“Yılın kişisi” için [TIME açıklaması](https://time.com/3626016/person-of-the-year-faq/)
esas alındı; New York Times'a ait bir liste varsayılmadı.

## Büyük alım ve açık engeller

**IMPLEMENTED:** `scripts/history/collect.mjs`: Nobel/TIME, bilim insanları,
filozoflar, siyasetçiler, ruhban, geniş insan keşfi, savaş/muharebe/tarihî olay
grupları. 50'lik sayfa, sıralı QID cursor, 1 concurrency, 1 saniye aralık,
timeout/backoff, Retry-After/maxlag, boyut ve toplam limitleri, hash makbuzlu
cache ve orijinal statement qualifier/reference/rank korunur. Sadece staging;
hiçbir toplama komutu productionApproved yapamaz.

**BLOCKED:** terminal Wikidata/Nobel JSON erişimi `EAI_AGAIN`. Nobel güncel API
koşulları sayfası 403; API motivasyon/metin/görselleri paketlenmedi.
HTML üzerinden kaynak incelemesiyle bu dar üretim eki hazırlanabildi; toplu
ham liste alınamadı. [Çalıştırma ve inceleme komutları](../history-expansion.md).

**PARTIAL / ölçek sınırı:** birleşik extension 710/800 kayıt. Yeni yedi parça
toplam 708.546 JSON byte; her biri 256 KiB altında. 512 kayıt/16 parça sürüm
limiti ve 1.000 kayıt temel zaman/arama kotası değiştirilmedi. Binlerce kişi
için sadece geometri değil metadata/arama/zaman indekslerini de manifestten
kademeli yüklemek gerekir. Collector'ın 10.000 sınırı runtime kapasitesi değildir.
“Önemli” ve ≥40 sitelink keşif ölçütü dil/coğrafya yanlılığı taşır.

## Değişen dosyalar

- `scripts/people/broad.mjs`, `scripts/history/collect.mjs`, `package.json`:
  kaynaklı üretim eki/check ve kontrollü staging komutları; yeni bağımlılık yok.
- `data/people/broad-raw/{browser-review,decisions}.json`,
  `data/people/broad-production/manifest.json`, `src/people/broad/*`:
  yedi küçük üretim parçası, ham fact/review, manifest ve checksum.
  `data/people/broad*-working.json` araştırma adaylarıdır, üretime import edilmez.
- `src/people/{policy,runtime,discovery}.ts`, `scripts/people/requests.mjs`,
  `src/people/generated/requests.ts`, istek kapsam raporları:
  beş sürümün birleştirilmesi, bekleyen listesi ve kaynak incelemesi.
- `data/sitelinks/reviewed.json`, `scripts/sitelinks.mjs`,
  `src/sources/generated/sitelinks.ts`, ilgili NOTICE:
  pinlenmiş 1.2.0 eşleşme ve formatter'ın repo genişliğiyle uyumu.
- `assets/licenses/Wikidata-broad-content-NOTICE.txt`; `.gitignore` ve
  `.prettierignore`: staging/ham checksum dosyalarını koruma.
- `scripts/qa/people-visibility.mjs`, `tests/unit/broad-history.test.mjs`,
  `tests/web/broad-history.spec.ts`, `tests/run.mjs`, dört mevcut kapsam/sitelink
  testi: yeni katalog sayımları ve regresyonlar. Önceki beklentiler veri artışına
  göre açık sayılarla güncellendi; test silinmedi/skip edilmedi.
- README, progress, source-matrix, license-register, data-quality, coverage-strategy, attribution-audit,
  `docs/history-expansion.md`, bu rapor ve kanıt klasörü güncellendi.

`git status --short` exit128: bu dizinde `.git` yok. Bu yüzden git diff listesi
üretilemedi. Çalışan kaynaklar yerinde düzenlendi; kullanıcı değişikliği/notu
silinmedi, reset/checkout/migration yapılmadı.

## Çalıştırılmış kontroller

| Komut | Sonuç | Kanıt |
| --- | --- | --- |
| `npm test` | PASS 398/398, skip 0 | [Log](broad-history-2026-10-20/tests-complete.log) |
| `npm run lint` | PASS, 0 uyarı; ilk yinelenen test importları düzeltildi | [Son log](broad-history-2026-10-20/lint-corrected.log) |
| `npm run typecheck` | PASS native + web | [Log](broad-history-2026-10-20/typecheck-complete.log) |
| `node tests/unit/broad-history.test.mjs` | PASS 8/8 | [Log](broad-history-2026-10-20/focused.log) |
| `npm run test:worker` | PASS 5/5 | [Log](broad-history-2026-10-20/worker.log) |
| `npm run people:broad:check` | PASS kaynak/hash/şema/lisans ve deterministik çıktı | [Log](broad-history-2026-10-20/broad-check.log) |
| `npm run sitelinks:check` | PASS 1.2.0 pin/şema/URL ve bildirim | [Log](broad-history-2026-10-20/sitelinks-check.log) |
| Değişen kod/üretilmiş dosyalarda `prettier --check` | PASS | [Log](broad-history-2026-10-20/format-final.log) |

Son komut durumları [checks.json](broad-history-2026-10-20/checks.json) ve aynı
klasördeki loglarda. Ana testler MÖ/MS, lisans/source/hash, yıl/katman, eski
Atatürk 1881, marker ölçeği, şehir verisi ve kişisel not regresyonlarını kapsar.
Yeni sekiz test üretim tekrarlanabilirliği, beş sürüm birleşimi, gerçek yerel
arama, konumsuz savaş, hatalı tarih bağlamı ve sentetik toplayıcı yanıtlarını
sınar. Sentetik yanıtlar yalnız testtedir.

- Web export: **PASS**; dört rota ve 16.102 statik şehir paketi hash kontrolü.
  [Log](broad-history-2026-10-20/web-export.log). Başlangıç JS entry çıktısı
  yaklaşık 13 MB, fiziksel ayrıntı ayrı 20 MB; bunlar paket boyutudur, yükleme
  süresi/FPS ölçümü değildir. Büyük katalog için yükleme mimarisi işi açık.
- Toplu doğum görünürlüğü: **PASS**, 233 profil/147 yıllık nokta/0 hata.
  [Log](broad-history-2026-10-20/visibility.log),
  [kayıt denetimi](people-visibility-audit.json). Zoom 1/4/8 ve komşu yıl
  sorguları kod düzeyindedir; tarayıcı/GPU screenshot kanıtı değildir.
- Browser E2E: **BLOCKED**. İki senaryo × masaüstü/dar ekran = 4 test listelendi;
  bu PASS sayılmaz. Üretim preview `EPERM` ile başlamadı, ekran görüntüsü
  alınamadı. [E2E log](broad-history-2026-10-20/browser.log),
  [sunucu nedeni](broad-history-2026-10-20/browser-server.log).
- Android JS export: **INCOMPLETE / NOT VERIFIED**. Metro başlangıcından sonra
  tamamlanma/exit kanıtı alınamadı; üretilmiş APK veya başarılı paketleme
  iddiası yok. [Kısmi log](broad-history-2026-10-20/android-incomplete.log).
  Strict native tip kontrolü gerçek Android çalıştırmasının yerine geçmez.
- Fiziksel Android dokunma/performans/GPU: **UNVERIFIED ON DEVICE**.

Sonraki veri büyümesinin önkoşulları: erişilebilir ham liste, ödül/kişi/olay
kimlik incelemesi, doğrudan kaynak ve qualifier seçimi, doğrulanmış sitelinkler,
kademeli metadata/arama/zaman indeksi ve gerçek cihaz kontrolü. Sonraki faza
otomatik geçilmedi; bu talebin geniş kapsamı PARTIAL olarak kalır.
