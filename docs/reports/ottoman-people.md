# Kişi listesine devam — Osmanlı grubu ve belirsizlik denetimi

18 Ekim 2026. Kullanıcının mevcut kişi ekleme isteğine devam edildi; yeni faz
başlatılmadı. Repo yerinde korundu. Dizin `.git` içermediği için git diff/status
elde edilemiyor; repo başlatılmadı, reset/checkout veya geniş silme yapılmadı.
Yeni npm bağımlılığı, API anahtarı, hesap, makale metni veya portre eklenmedi.

## Sonuç ve gerçek kapsam

| İş | Durum | Kanıt / sınır |
|---|---|---|
| 33 ek kaynaklı Osmanlı profili | IMPLEMENTED | [Kişi/yer revizyonları ve kararlar](ottoman-people-coverage.md) |
| Kullanıcı listesindeki 36 padişahın tamamının aranması | IMPLEMENTED | 36 ayrı kalıcı ID, üretimde eşleşen kimlikler; otomatik testte denetlendi |
| 22 ek doğum-yılı noktası | IMPLEMENTED | Yalnız kaynaklı yıl ve açık yaklaşık konum tercihi; önceki/sonraki yıl negatif testleri |
| 8 biyografik ilişki, 3 noktasız profil | IMPLEMENTED | Yıl/yer uydurulmadı; biyografik ilişki yıllık fiziksel bulunma değildir |
| Beş önceki doğum noktasının belirsizlik düzeltmesi | IMPLEMENTED | Kanuni, Büyük Konstantin, Luther, Beethoven, II. Urban; profil/ID korunur |
| Geniş kullanıcı listesinin tamamı | PARTIAL | 823 istekten 144 kaynaklı eşleşme; 665 kişi incelemede, 5 grup kişi değil, 9 ad kullanıcı kararıyla atlandı |
| Gerçek tarayıcı/GPU/görsel E2E | BLOCKED | Chromium sandbox shutdown EPERM, screenshot **0** |
| Gerçek Android / TalkBack / dokunma / pil / ısı | NOT TESTED | **UNVERIFIED ON DEVICE**; Java/adb/SDK yok |

Uygulama Van Gogh dahil **174 kişi profili**, **109 yaklaşık doğum-yılı noktası**
içerir. 22 yeni nokta eklenirken beş eski nokta biyografik sınıfa geçti. Aynı
yılda bütün 109 kişinin görünmesi, güncel konumları veya yaşamları boyunca
aynı yerde bulunmaları iddia edilmez. Doğumdan saltanat, başkent, meslek,
ikamet veya sefer rotası üretilmedi. Modern şehir/ülke verisi değiştirilmedi.

## Kaynak incelemesi ve düzeltmenin nedeni

Resmî Wikidata sayfalarındaki P569/P570/P19 ve yerlerin P625 alanları gerçek
revizyonlarla incelendi. Kaynak seçkisi editöryal olgu çıkarımıdır; tam API
yanıtı veya bütün alternatif iddiaların bağımsız tarihsel onayı değildir.
Ham seçki ve kararlar ayrı SHA'larla onaylanır. Sadece kullanıcı listesinde
yer almak, kimlik veya tarih/konum doğrulaması sayılmaz.

Kaynak P569 içinde **circa**, **disputed**, **presumably** bulunduğunda eski
üretici zamanın belirsizliğini işaretliyor fakat yıllık nokta kararına bunu
her zaman taşımıyordu. Bu tutarsızlık düzeltildi. Söz konusu dört kişi
biyografik sınıfa alındı; kesin gün/ay veya rastgele yıl üretilmedi. Bu karar,
kaynak doğum yılının kesin yanlış olduğu iddiası değildir; kaynak niteleyicisi
korunmadan kesin yıllık nokta sunulmasını engeller.

Kanuni'nin Wikidata 1494 iddiasına karşı [TDV Süleyman I](https://islamansiklopedisi.org.tr/suleyman-i)
maddesi 1496 alternatifini de aktarır; Trabzon ilişkisi biyografik tutuldu.
[TDV Orhan](https://islamansiklopedisi.org.tr/orhan) kronolojiyi tartışmalı
verir; [TDV Bayezid II](https://islamansiklopedisi.org.tr/bayezid-ii) 1448
bildirirken Wikidata 1447 iddiası taşır. Bu farklar tek kesin doğum yılına
indirgenmedi. I. Mustafa'da zaman/yer onayı tamamlanmadığından nokta yoktur.
I. Mahmud'un bu revizyondaki atıfsız P569/P19 iddiaları yıllık nokta değildir.
Çırağan'ın güncel bina evresi, 1844 doğum yılıyla eşitlenmedi. Beylerbeyi
Sarayı için doğrulanmayan P625, İstanbul merkezinden tamamlanmadı.

TDV araştırma/çapraz kontrol referansıdır. Sayfa/PDF, metin, resim veya
geometri yeniden dağıtılmadı. Wikidata olgularının CC0 statüsü TDV veya
Wikipedia makalelerine uygulanmaz. Mevcut TR→EN→Wikidata sitelink servisi
korundu; başlıktan Wikipedia URL'si oluşturulmadı. Yeni kişi kartlarında
gerçek ağ üzerinden Wikipedia açılışı bu ortamda doğrulanamadı.

## Mimari ve boyut

| Release | Profil | Yıllık / biyografik / noktasız | Katalog / domain kayıt / source ID | JSON byte |
|---|---:|---|---|---:|
| 1.0.1-births |111|62 /24 /25|14 /308 /208|1165504|
| 1.1.1-births |29|25 /3 /1|4 /86 /61|335744|
| 1.2.0-births |33|22 /8 /3|5 /96 /50|369289|

Yeni paketin en büyüğü92277byte. Her release için <=16katalog/512kayıt,
her paket <=256KiB, toplam extension <=800 ve timeline/arama <=1000kayıt
sınırları korunur; bütçeler yükseltilmedi. Şehir/site ölçeği ayrılır;
koordinat hâlâ yaklaşık yer temsilidir, doğum odası değildir. Eski kalıcı
kimlikler, Newton/Einstein işaretleri, Medine ikameti ve ayrı ülke/şehir/olay
akışları korunur. 665 kişinin tamamını bu bootstrap kataloğa sığdırmak için
limit yükseltilmeyecek; kaynak incelemesi ve chunk/indeks işi gerekecek.

Terminalde yeni staging indirmesi yok; Wikidata API isteği **EAI_AGAIN**
döndürdü. Bu, kişinin Wikipedia'da bulunmadığı anlamına gelmez. Mevcut bounded
collector ve [kalan kaynakları edinme komutları](../people-expansion.md) korunur;
indirme kendi kendine üretim onayı vermez.

## Değişen dosyalar

- `scripts/people/{build,expansion,requests,check-expansion}.mjs`: belirsizlik
  guard'ı, kısa editöryal açıklama, yer ölçeği ve üç release'in istek eşleşmesi.
- `scripts/people/{ottoman,check-ottoman,coverage-report}.mjs`: ayrı üretim,
  SHA/hak/NOTICE kapısı ve güncel kaynak tabloları.
- `data/people/ottoman-raw/{browser-review,decisions}.json`,
  `data/people/ottoman-production/manifest.json`,
  `src/people/ottoman/{index,catalog-0..4}.ts`: 33 profil ve kaynak/karar seçkisi.
- `data/people/expanded-raw/decisions.json`, önceki iki production manifesti ve
  `src/people/{generated,expanded}/{index,catalog-*}.ts`: sürümlü belirsizlik
  düzeltmesi; aynı kimliklerle tekrar üretim. Kaynak ham kayıtları silinmedi.
- `src/people/{policy,runtime,discovery}.ts`,
  `src/people/generated/requests.ts`, `data/people/production/requests.json`:
  kaynak pinleri, birleşik provider, kart ve arama kapsamı.
- `tests/unit/ottoman-people.test.mjs`, `tests/unit/requested-people.test.mjs`,
  `tests/web/ottoman-people.spec.ts`, `tests/run.mjs`, `package.json`,
  `.prettierignore`: altı yeni unit, dört listelenen tarayıcı senaryosu ve CI kapısı.
- `assets/licenses/Wikidata-{expanded,ottoman}-people-NOTICE.txt`,
  `THIRD_PARTY_NOTICES.md`, `README.md`, `docs/{progress,persons,architecture,
  license-register,source-matrix,release-blockers,people-expansion}.md` ve raporlar.

## Çalıştırılan doğrulamalar

| Komut | Gerçek sonuç | Kanıt |
|---|---|---|
| `npm run check` | **358 ana +5 worker PASS**, lint, web/native strictTS, tüm kaynak/hak/hash/sürüm/format kapıları | [log](ottoman-people-evidence/check.log), [exit0](ottoman-people-evidence/check.exit) |
| Sonradan eklenen kaynak-tablosu üreticisi | Dosyaya özel ESLint PASS; tablolar yeniden üretildiğinde hash'ler değişmedi. Ardından proje formatter kontrolü PASS | [lint](ottoman-people-evidence/report-lint.log), [tekrar üretim](ottoman-people-evidence/report-generation.log), [format](ottoman-people-evidence/final-format.log) |
| Yeni altı unit | 36 ayrı kimlik; 22 tek-yıl sınırı; kaynak/atıf eşleşmesi; çelişki; saray/site; aynı1642noktasında iki kişi; izinsiz pin/bozuk paket reddi | check logunda test adları |
| `npm run web:export` |4statikrota PASS; gerçek browser veya GPU testi değil | [log](ottoman-people-evidence/web-export.log), [exit0](ottoman-people-evidence/web-export.exit) |
| `npm run android:bundle` | Hermes+ExpoDOM JSexport PASS; APK/cihaz testi değil | [log](ottoman-people-evidence/android-export.log), [exit0](ottoman-people-evidence/android-export.exit) |
| `npx playwright test tests/web/ottoman-people.spec.ts --list` | Desktop+narrow4senaryo yalnız listelendi; **çalıştırılmış PASS sayılmaz** | [liste](ottoman-people-evidence/browser-list.log) |
| Chromium launch | **BLOCKED**, shutdownEPERM/SIGTRAP; screenshot0 | [hata](ottoman-people-evidence/browser-launch.log), [exit1](ottoman-people-evidence/browser-launch.exit) |
| Ortam | Java/adb ENOENT, AndroidSDK yok; npm subprocess EPERM'e rağmen gerçek npm kontrol ve export komutları üstte çalıştı | [ortam](ottoman-people-evidence/environment.log) |
| Wikidata API ulaşımı | **EAI_AGAIN**, yeni otomatik veri indirilmedi | [log](ottoman-people-evidence/network.log) |
| `git status --short` | exit128; bu dizin git repository değil | [log](ottoman-people-evidence/git-status.log) |

Export logunda webentry9.2MB ve Hermesentry14MB yuvarlatılmış dosya boyutlarıdır;
başlangıç süresi/FPS/RAM/pil ölçümü değildir. Android **UNVERIFIED ON DEVICE**;
TalkBack, gerçek dokunma, harici tarayıcıdan dönüş, pil/ısı ve yeni görsel kabul
**NOT TESTED**. Önceki güvenlik/CSP/origin/a11y engelleri ve yayın **NO-GO** sürer.

## Kullanıcıda açma

```sh
npm run people:ottoman:check
npm run web -- --clear
```

Arama → **II. Selim** → **Doğum yılına git ve yaklaşık konumu aç** → **MS1524**.
Kamera isteğe bağlı odaklanır. **Orhan Gazi** veya **Kanuni** kartında biyografik
bilgi ve belirsizlik görünür; kesin doğum yılına git düğmesi sunulmaz. Yeni npm
paketi veya veri indirmek bu ek 33 profil için gerekli değildir.
