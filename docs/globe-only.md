# Yalnız Küre ve fiziksel ayrıntı

16 Ekim 2026. Kullanıcının yeni tercihi önceki Atlas/Küre ürün seçimini değiştirir.
Mevcut projeyi koruyarak küçük plan:

1. Ürün ekranını yalnız globe projeksiyonuna bağla; 2D geçiş kontrollerini kaldır.
   Eski URL/yer imi/tercihi okuyabil; tarih/kamera/katman kaybolmadan Küre'de aç.
2. Mevcut izinli Natural Earth50m kara/kıyı hazırlayıcısını dene; DNS engelliyse
   kullanıcıya otomatik ve yerel dosyadan kontrollü indirme komutlarını ver.
   Kaynak/sürüm/lisans/hash ve byte/geometri sınırları korunmalı.
3. Ülke bilgisi ile tarihli alan poligonunun farklı olduğunu açıkça belgele.
   Eksik siyasi veri yerine güncel ülke veya tahminî çizim ekleme.
4. Unit/regresyon, strictTS/lint, veri hash'leri, web/AndroidJSexport ve test
   listesi çalıştır. Gerçek tarayıcı/Android kabulü ayrı raporlanmalı.

Chronas verilen URL bu araştırma aracında açılmadı; canlı ayrıntı/etkileşim
incelendiği iddia edilmez. Resmi Natural Earth fiziksel veri kataloğu ve
[public-domain koşulları](https://www.naturalearthdata.com/about/terms-of-use/)
kontrol edildi.50m fiziksel taban ayrıntı artışıdır; sokak/şehir/tarihî devlet
sınırı veya tarihî kıyı verisi değildir. Yeni dış dependency yok.

## Kullanıcının terminalde yapacağı işlem

Önce çalışan Expo sürecini Ctrl+C ile durdurun. Yeni dependency veya Python
kurmak gerekmiyor. Proje dizininde:

```sh
cd "/home/s-oktay/Belgeler/Tarih_Atlası"
npm run basemap:prepare
```

`Prepared verified physical 50m detail` çıktısı varsa:

```sh
npm run basemap:check
npm run web -- --clear
```

Terminalde verilen adresi açın. `basemap:check` çıktısında **PASS / physical 50m**
görülmeli; **PARTIAL** hâlâ110m kullandığını belirtir. `50m`50metre değildir:
harita ölçeği1:50milyondur, önceki1:110milyon tabandan daha ayrıntılı kıyı/adalar
sağlar. Bu sokak haritası veya Chronas ile eşdeğer ayrıntı iddiası değildir.

Otomatik indirme ağ/Node erişim hatası verirse alternatif; yalnız aşağıdaki
sabit Natural Earthv5.1.2 fiziksel kara dosyasını indirin:

```sh
curl --fail --location --proto '=https' --max-time 60 \
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson' \
  -o /tmp/tarih-atlasi-ne-50m-land.geojson
npm run basemap:prepare -- --input /tmp/tarih-atlasi-ne-50m-land.geojson
npm run basemap:check
npm run web -- --clear
```

curl da DNS hatası verirse dosya indirilmemiştir; sonraki import'u çalıştırmayın.
Verilen HTTPS URL tarayıcıdan indirilebilir; `--input` sonrasında gerçek dosya
yolunu kullanın. Başka bir ülke/özel veri dosyasını bu fiziksel kaynak adına
yüklemeyin. Manuel yol kullanıcı tarafından bu kaynaktan indirilen dosyaya
güvenir; içeriğin hangi sunucudan geldiğini kriptografik olarak kanıtlamaz.
Boyut/geometri doğrulaması kaynak doğruluğunun yerine geçmez.

CLI12MiB/5000feature/200000konum sınırını ve kapalı/sonlu lon-lat fiziksel
poligon doğrulamasını uygular, bütün feature özelliklerini/adları çıkarır.
Kaynak/sürüm/lisans/edinme şekli ve orijinal/dönüştürülmüş SHA saklanır. Eksik,
bozuk veya aşırı geometri mevcut generated modülün yerine yazılmaz; kaynak
ülke/tarih katmanı olarak kabul edilmez. `--check` manifest/hash uyuşmazlığını
reddeder. Bu geometri/topoloji için eksiksiz bilimsel doğruluk onayı değildir.

Üretim önizlemesi istenirse dev sürecini durdurup `npm run web:export` ve
`npm run web:preview` çalıştırın. Bu durumda geliştirici örnek kontrolleri yoktur.

## Ülkeler neden görünmüyor?

Katalog19kayıt/7kaynak içerir; bazı siyasi varlıkların **bilgi kaydı** vardır.
Bu, ülkenin seçili yıldaki sınırlarını veren alan geometrisi değildir.
Mevcut siyasi geometri yalnız1867antlaşmasının141°Bmeridyenindeki sınır
kesitidir.1066'da yaklaşık muharebe noktası vardır. Tam ülke poligonu0,
kültür alanı0;4026seçilebilir yılın4024'ünde destekli harita geometrisi yoktur.

Bu eksiklik `npm install` veya kara verisi indirmekle düzelmez. Tarihli ülke
poligonlarını ayrıca kaynak/lisans/kapsam/iddia incelemesinden geçirerek ETL
kataloğuna eklemek gerekir; uygulama kodunun yapılacak veri çalışmasıdır.
Kullanıcının ayrıca yanlış bir ayar açması veya başka kütüphane kurması gerekmez.
Modern ülke sınırları geçmiş yıllara taşınmadı; Historical Basemaps dağıtım
engeli ve OHM nesne hak denetimi sürer. Bu görevde yeni tarihî veri eklenmedi.

## Sonuç ve testler

- **IMPLEMENTED:** Ürün yalnız3DKüre;2Dseçim yok. Eski mercator tercih/URL/yer
  imi okunur; yıl/kamera/katman korunarak Küre'ye uygulanır. Eski depoları topluca
  sıfırlama veya migration yok. Yeni paylaşım/yer iminde projectionglobe.
- **IMPLEMENTED:**50myerel dosya import'u; hak/provenance/hash ve boyut/geometri
  kapıları. Testler sentetik geçici projede çalışır, üretime fixture yazmaz.
- **PARTIAL / BLOCKED:** Gerçek50mindirme EAI_AGAIN; ayrıntı bu ortamda artmadı.
  Daha ayrıntılı nehir/göl/relief ve gerçek ülke alanları bu teslimde yoktur.
- `npm run check`: **exit0;257ana+5worker**,lint/strict native+webTS,
  asset/pilot/sitelink/chunk/hash/format. [Log](reports/globe-only/check.log).
- Web export ve Android Hermes+DOM JS export aşağıdaki loglarda; AndroidJS
  çıktısı APK veya fiziksel cihaz kanıtı değildir.
  [Web](reports/globe-only/web-export.log), [Android](reports/globe-only/android-export.log).
  İki export komutu da exit0. [Komut/exit kaydı](reports/globe-only/commands.json).
- [104browser testi listesi](reports/globe-only/browser-list.log) koşu başarısı
  değildir. Üretim E2E/gerçek screenshot ortamın listenEPERM engeli nedeniyle
  **BLOCKED**. [Koşu](reports/globe-only/browser-run.log).
- [Ortam](reports/globe-only/environment.log): Java/adb/SDKyok,
  **UNVERIFIED ON DEVICE**. GPU/FPS/dokunma/gerçek klavye ölçümü yapılmadı.
- [Gerçek indirme denemesi](reports/globe-only/detail-download.log): exit1,
  EAI_AGAIN. Yeni lisansı belirsiz paket veya tile servisi yok.
- [SHA karşılaştırması](reports/globe-only/integrity.json): V3sonrasına göre
  25lock/veri/generated katalog dosyası değişmedi. `git status` exit128;
  bu çalışma ortamında .git görünmediği için Git diff/commit yapılmadı.

Değişen başlıca dosyalar: `AtlasScreen.tsx`, `AppHeader.tsx`, `ViewPreview.tsx`,
`src/map/product-view.ts`, `src/preferences/model.ts`, `src/i18n/tr.ts`,
`scripts/prepare-detail-land.mjs`, benchmark/web akış testleri, unit rework ve
detail-import, `tests/run.mjs`, README/progress/mimari/lisans kayıtları.
Genel yayın kararı NO-GO sürer; ülke poligonları ve platform/güvenlik kabulü
kapanmış sayılmaz. Önkoşul: yetkili ağda fiziksel veri indirme + hash doğrulama,
gerçek web/Android incelemesi; siyasi veri için bağımsız kaynak/lisans incelemesi.
