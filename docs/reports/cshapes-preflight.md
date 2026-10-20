# CShapes yerel inceleme hazırlığı — 17 Ekim 2026

**Güncelleme:** Bu rapor dosya gelmeden önceki hazırlığın kaydıdır. Kullanıcının
sağladığı gerçek dosya ve inceleyiciv2 düzeltmesi için
[güncel inceleme](cshapes-schema-review.md). Aşağıdaki gerçek-girdi BLOCKED
ifadesi eski koşuya aittir; üretim/lisans onayı hâlâ verilmedi.

**IMPLEMENTED:** üretime yazmayan yerel kaynak inceleyici ve testleri.
**BLOCKED:** gerçek CShapes dosyası, gerçek şema/kapsam incelemesi ve MS 2000
karşılaştırması. `data/staging/country-review/` ile kullanıcının İndirilenler
klasöründe CShapes adayı bulunmadı; Downloads klasörü yok. Terminalden resmî
siteye erişim DNS hatası verdi. Hiçbir gerçek CShapes satırı incelendi denmiyor.

## Kullanım

[Resmî ETH sayfasından](https://icr.ethz.ch/data/cshapes/) **CShapes 2.0 →
GeoJSON** indirilir; Avrupa sürümü ve uzaklık tablosu bu karşılaştırmanın
yerine geçmez. Kaynak dosyayı orijinal haliyle saklayın.

```sh
cd ~/Belgeler/Tarih_Atlası
mkdir -p data/staging/country-review
# İndirilen dosyayı bu klasöre koyduktan sonra:
npm run cshapes:inspect
# Alternatif: gerçek dosyanın tam yolunu verin:
npm run cshapes:inspect -- --file "/tam/yol/indirilen-dosya.geojson" --year 2000
npm run cshapes:inspect -- --help
```

ZIP de desteklenir; birden çok JSON/GeoJSON varsa `--member arşiv/dosya.geojson`
zorunludur. Shapefile/SQL/R içe aktarımı bu komutun kapsamı değildir. Kullanıcı
dosyası değiştirilmez. R/Python/yeni npm paketi gerekmez; ZIP için mevcut
sistem `unzip` komutu kullanılır. Doğrulanmamış doğrudan indirme URL'si eklenmedi.

## Üretim ve tarihî doğruluk sınırı

ETH sayfası küresel sürüm için 1886–2019 bildirir; [codebook taslağı](https://icr.ethz.ch/data/cshapes/CShapes-2.0_Codebook.pdf)
ve makale başlığında 2017 bulunur. Bunlar yayıncı beyanıdır; yerel dosyanın
gözlenen min/max tarihi dosyadan hesaplanmadan kesinleştirilemez. Hesaplanan
uç tarihler de aradaki her yıl/bölgede tamlık kanıtı değildir.

Veri [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) ile
yayımlanır. **CONDITIONAL / üretim onayı yok** kararı korunur. Araç yayıncı
atıf/lisans referansını raporda saklar; bunun yerel dosyanın gerçek kökenini
doğruladığını iddia etmez. Bütün sonuçlarda `productionAllowed: false`,
`originAuthenticity: UNVERIFIED_LOCAL_INPUT` bulunur. Koordinat dışa aktarımı,
asset/katalog/manifest değişikliği veya manual approval yoktur.

`statename/startdate/enddate/status` profilindeki alanlar codebook'a dayanır.
Gerçek export şeması henüz görülmedi: başka alan adları sessizce eşlenmez,
`SCHEMA_REVIEW_REQUIRED` raporlanır. Açık takvim tarihleri kabul edilir;
yerel tarih biçimi, bilinmeyen saat dilimi veya sayısal epoch tahmin edilmez.
Kaynak statüsü ve gün hassasiyeti korunur. Seçilen takvim yılıyla kesişen
kayıtlar yalnız adaydır; kısmi yıl bütün yıla yayılmaz. Bağımsız devlet ve bağlı
bölge tek ülke sayısına dönüştürülmez. Kaynak siyasi kodlama, tarihli ad,
komşu sınır uyumu, bağımlılık/egemenlik ve gün uçlarının dahil edilme anlamı
üretimden önce ayrıca incelenmelidir. Hiçbir geometri otomatik onaylanmaz.

## Kaynak sınırları ve hata davranışı

- GeoJSON: en fazla 512 MiB, 50.000 Feature, 8 MiB/Feature, 256 KiB/kök
  metadata değeri, 64 kök anahtar, 64 iç içelik. İşlem sırayla ve streaming
  yürür; tüm dünya FeatureCollection belleğe alınmaz.
- ZIP: en fazla 128 MiB arşiv, 256 üye/64 KiB liste, listeleme 10 saniye;
  açılan akış aynı GeoJSON sınırlarına tabidir. Sadece seçilen üye stdout'a
  açılır; dizine çıkarım, wildcard, yol aşımı ve symlink girdi reddedilir.
- İnceleme 120 saniye bütçeli; seçilen yılda en fazla 512 aday; ilk 100
  sorun saklanır. Bu sınırlar hedef performans ölçümü değildir.
- Mevcut siyasi geometri doğrulayıcısı aday yılda yeniden kullanılır:
  100.000 konum, 4.096 halka, 2.048 bileşen ve 5 milyon iş sınırı. OGC'nin
  tamamını veya bütün adayların tarihî gerçekliğini sertifikalandırmaz.
- Rapor sadece tüm dosya geçerli JSON olarak tüketilince yazılır; bozuk UTF-8,
  yarım JSON, çift kök anahtar, fazla içerik, limit aşımı ve bilinmeyen CRS
  sessizce başarılı sayılmaz. Kapsama dışı yıllar modern/nearest geometriyle
  doldurulmaz. Aynı inceleme deterministik isim/içerikle tekrarlanır; mevcut
  farklı raporun üzerine yazılmaz. SHA ve dosya değişim kontrolü kaynak
  dosyanın yayıncı tarafından imzalandığı anlamına gelmez.

## Doğrulama

Gerçek komut sonuçları ve loglar [kanıt klasöründedir](cshapes-preflight/commands.json).
Yeni 5 testteki bütün kayıt/geometriler **SYNTHETIC**, test klasöründe ve
ürün içeriğinden ayrıdır. Unicode/parça sınırı, bozuk ve limit aşan JSON,
şema/tarih/CRS/statü, kısmi yıl, kaynak hash/değişmezliği, ZIP seçimi ve
tehlikeli girdi reddi sınanır. Bu testler gerçek CShapes doğruluğu testi değildir.

Lint ilk koşuda açık `node:buffer` importu eksikliği bildirdi; importlar
düzeltildi. Test veya beklenti kaldırılmadı. Son sonuçlar kanıt kaydında.
Son koşu **291 ana test / 5 worker PASS**, lint, strict native/web TypeScript
ve format kontrolü PASS. Ayrı CLI denemesinde açık sentetik dosya ile rapor
yazımı, aynı girdide deterministik tekrar, değişmeyen ham SHA ve koordinat
dışa aktarılmaması doğrulandı; kendi geçici girdisi/raporu temizlendi.
İlk iki iç içe Node-process sarmalayıcısı ortamda `spawnSync EPERM` / boş
stdout verdi; bunlar başarı sayılmadı. CLI doğrudan terminal komutlarıyla
yeniden çalıştırılarak doğrulandı; başarısız deneme logları da saklandı.
Mevcut üretim dünya kapısı 13.379 siyasi kaynak satırı, 374 paket ve
120.664.555 byte için hash/lisans kontrolünü geçer; bağımsız tarihî sertifika
anlamına gelmez. Üretim verisine yeni kayıt eklenmedi.

Web ve Android UI değişmedi; bu turda build, görsel/E2E, TalkBack, GPU/FPS ve
gerçek cihaz testi **NOT TESTED**. Android **UNVERIFIED ON DEVICE**; screenshot0.
Önceki export/denetim sonuçları [önceki raporda](country-data-audit.md) ayrı
tarihî kanıttır. Önceki yayın NO-GO kararı devam eder.

## Değişen dosyalar ve sonraki önkoşul

Yeni: `scripts/etl/geojson-stream.mjs`, `scripts/etl/cshapes-review.mjs`,
`scripts/inspect-cshapes.mjs`, `tests/unit/cshapes-review.test.mjs` ve bu rapor/loglar.
Güncellenen: `package.json`, `tests/run.mjs`, `README.md`, `scripts/etl/README.md`,
`docs/country-data-research.md`, `docs/license-register.md`, `docs/progress.md`.
Yeni bağımlılık, lockfile değişikliği, renderer değişimi veya onaylı veri
değişikliği yoktur. Git çalışma ağacı bu ortamda görünmediği için Git diff
yerine dosya ve çalıştırılmış komut listesi verilir; reset/checkout yapılmadı.

Sonraki gerekli adım gerçek dosyanın sağlanmasıdır. Ardından gerçek şema/CRS,
kaynak revizyonu, lisans metni, gözlenen tarih kapsamı ve MS 2000 adayları
mevcut katalogla karşılaştırılır. NC/SA şartlarının dağıtım planıyla uyumu
çözülmeden hiçbir üretim paketi oluşturulmaz. Başka ürün fazına geçilmedi.
