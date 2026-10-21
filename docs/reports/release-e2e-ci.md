# Release tarayıcı kapısı — 21 Ekim 2026

## Gerçek hata kaydı

[Release çalıştırması 39635270143](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/runs/39635270143),
commit `06fa7efb501be5b41865e18009fb0c955193d964`, job `119343930340`.
Önceki format sorunu çözülmüştür: `npm ci`, `npm run check`, web export ve
Chromium kurulumu PASS. Gerçek web kullanıcı akışları **43 FAIL / 41 PASS**;
Release ve Docker adımları SKIPPED. Bu bir Git push veya sürüm etiketi hatası değildir.

Aynı commit'in [altyapı çalıştırmasında](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/runs/39635208421)
unit işi PASS; kalite işi Android JS export sırasında runner shutdown sinyaliyle
kesildi. Nedeni logdan kesin belirlenemedi; Android derlemesi başarılı sayılmaz.

## Uygulanan değişiklikler

- **IMPLEMENTED:** React Native Web 0.21.2, Action bileşenindeki eski
  accessibilityState.selected alanını DOM'a taşımıyordu. Gerçek Pressable
  çıktısında `aria-pressed` kullanıldı; seçili/seçili değil durumları gerçek
  React + React Native Web server render ile test edildi. Native state korundu.
- **IMPLEMENTED:** Kompakt kişi/olay kaynak düğmesi tutarlı `Wikipedia’da aç`
  etiketi taşır. Doğrulanmış dil ve fallback açıklaması ayrıca korunur; URL,
  sitelink doğrulaması veya güvenli harici açma politikası değiştirilmedi.
- **IMPLEMENTED:** Aynı yılın kimlik/kişi/olay projeksiyonları arşivden ortak
  taramayla toplanır. En son tek yılın projeksiyonu tutulur; ham paket LRU'su
  hâlâ 8, gerçek okuma paralelliği 2. Bağımsız eski sorgu yöntemiyle bütün
  sonuçlar/kanıt/konum ilişkileri deepEqual karşılaştırıldı. Cache clear yeniden
  okuma gerektirir. Yeni dependency veya veri eklenmedi.
- **IMPLEMENTED:** Test yardımcıları açık panel içindeki eylemi seçer; ikinci
  arama açık arama alanında düzenlenir. Kapalı panel altındaki arama düğmesine
  tıklayıp pointer interception bekleme hatası giderildi. Zaman araçları Modal
  portalı içinde aranır. Kompakt kartın gerçek ayrıntı kontrolü sınanır.
- **IMPLEMENTED:** Altı tarihî katman kontrolü ayrı kapsamda test edilir;
  yedinci güncel şehir kontrolünün bağımsız kapanıp yeniden açılışta korunması
  da sınanır. Kontrol veya bağımsız katman kaldırılmadı.
- **IMPLEMENTED:** Eski sabitlerin gerekçeli güncellemesi: gizlilik sürümü
  2026-10-19; incelenmiş güncel katalogda MS 2000 feature sayısı 196,
  MS 2024 snapshot önizlemesi 189. Bunlar devlet sayısı değildir. Gerçek
  feature üreticisinde 2000=196, 1453=134, 2025 önizlemesi=189, 2026=0
  ayrıca çalıştırıldı. Hiçbir geometri bu sayıların tutması için değiştirilmedi.
- **IMPLEMENTED:** Hannah Arendt artık yayımlanmış kaynaklı profil olduğundan
  ayrı pozitif E2E eklendi. Belgesiz kayıt için Rod Laver testi aynı sahte
  biyografi/koordinat/Wikipedia yasağını korur. Eski negatif senaryo silinmedi.
- **IMPLEMENTED:** Offline kaynak kartı testi yıl düğmesinin aynı kaldığını
  denetler; tüm timeline metniyle değişebilen yükleme durumunu eşitlemez.
- **IMPLEMENTED:** CI'da bir browser worker kullanılır; bütün senaryo,
  assertion, retry ve süre limitleri korunur. Yazılım GPU/CPU yükü için
  tekrarlanabilirlik önlemidir; cihaz FPS/bellek performansı iddiası değildir.
- **IMPLEMENTED:** Hatalı tarayıcı testleri sınırlı console/network/script ve
  harita/tarih durumunu loga/JSON eki olarak bırakır. Ham URL query/fragment
  kaydedilmez. Uygulama yalnız güvenli sembolik veri hata kodlarını geliştirici
  konsoluna yazar; UI'ya ham hata konmaz. Analytics veya kullanıcı telemetrisi
  eklenmedi. 631.443.134 byte eski trace artifact'i connector'un 512 MiB sınırını
  aştığı için ayrıca küçük error-context/JSON artifact'i hazırlanır.

## Doğrulama ve sınırlar

- **PASS:** `npm run check`: lint, native/web strict typecheck,
  **417/417 ana + 5/5 worker**, bütün veri/lisans/hash ve formatter kapıları.
- **PASS:** Yeni tanı fixture'ı ve test yardımcıları bağımsız strict TypeScript
  kontrolü; `npm run test:web:production -- --list`: **86 senaryo / 14 dosya**.
  Bu listeleme browser akışlarının çalıştırıldığı anlamına gelmez.
- **PASS:** Gerçek uygulama provider/frame ve veri runtime'ında 2024, 2000,
  1881, 2010, 2025 sorguları. Yanlış yıllara yeni geometri taşınmadı; 2025
  normal sorgusunda destekli coğrafya yok. Bu Node doğrulamasıdır, browser/GPU değildir.
- **BLOCKED:** Yerel HTTP bind EPERM; mevcut Chromium binary launch da ortam
  tarafından engellenir. Yeni E2E sonucu ve ekran görüntüsü yok.
- **NOT TESTED:** Docker runtime ve Android cihaz bu tur denenmedi.
- **PARTIAL:** Önceki 43 tarayıcı hatasının tamamı çözülmüş sayılmaz. Yılın
  renderer'a yansımaması, ilk ülke/şehir etiketleri ve yerel not silme akışının
  gerçek tarayıcıda yeni çalışma ile doğrulanması gerekir. Kontrollü hata
  kodları ve küçük artifact bu akışların kalan nedenini ayırmayı sağlar.

**PASS:** `npm run web:export`: 4 statik route ve 16.102 şehir paketi /
645.992.949 byte hash kontrolü tamamlandı. Bu, browser veya Docker kabulü değildir.
Komut logları ve kaynak sorgu örnekleri [kanıt klasöründedir](release-e2e-ci/).
Gönderilecek commit ilerleme kaydında raporlanır.

## En son uzak tekrar: run 39645152356

[Release workflow run](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/runs/39645152356)
bae95731 commit'inde npm run check, web export ve Chromium kurulumu PASS
oldu. Gerçek kullanıcı akışlarında 17 FAIL / 69 PASS; arşiv, Docker ve Release
adımları bu nedenle SKIPPED. preview-failure-diagnostics küçük artifact'i
hata durumunu kaydetti. Bu run'da ülke ve şehir marker sınıf adetleri henüz
tanıya dahil edilmedi; yeni yerel değişiklik bunları ve harita zoom düzeyini
ekliyor.

**Yeni kodda IMPLEMENTED:** ülke seçme listesindeki Türkçe görünen ad aynı
kısa ülke adı kuralından geçiyor; kaynak adı/kimliği değişmiyor. Bilgi kartının
genişletme düğmesi ile kaynak/kanıt ayrıntısı artık ayrı erişilebilir ad
kullanıyor. Atatürk’ün yaklaşık doğum noktası zoom 3 ile açıldığı, şehirler
zoom 4’te başladığı için örtüşme testi yalnız bu akışta kontrollü yakınlaştırma
yapıyor. Timeline E2E, yükleme ready durumunu ve istenen yılın gerçekten
uygulanmasını bekliyor. İki aynı adlı atıf kontrolü testi panel kapsamında
seçiliyor; iki erişim noktası da korunuyor.

**Yerel:** lint, native/web typecheck, web export PASS; browser senaryo listesi
86. npm run check 415/417 yerel ana testte, kurulumdaki eksik Expo
bundledNativeModules.json ve geçici ETL test kopyasının prettier
çözememesi nedeniyle durdu. Başarısız beklenti kaldırılmadı. Gerçek tarayıcı
başlatma bu ortamda EPERM yüzünden mümkün olmadı; Android/Docker test edilmedi.
Ülke/şehir etiketlerinin neden GitHub runner'da kaybolduğu henüz kanıtlanmış
değil. Tanı eki artık kamera zoom'u ile DOM marker sınıflarının adet ve görünürlük
durumunu yazacak. Değişiklikler gönderilmedi; run 39645152356 taslak Release
oluşturmadı.
Kod MIT; mevcut veri/tile/medya lisans sicili değişmedi. Kararlı yayın NO-GO
devam eder. Yeni ürün fazı başlatılmadı; tarayıcı testi atlanarak Release üretilmedi.

## Sonraki çalıştırma

Hazırlanan yerel Git commit'i kullanıcı tarafından `git push origin main` ile
gönderildikten sonra Teknik önizleme paketleri → yeni Run workflow → main →
0.1.0-preview.1. Eski run'ı Re-run yapmak eski commit'i kullanır. Başarıda
yalnız taslak prerelease oluşur; mevcut engeller otomatik kapanmaz.
