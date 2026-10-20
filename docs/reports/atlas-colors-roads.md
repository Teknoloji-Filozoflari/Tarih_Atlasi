# Açık atlas renkleri ve güncel yollar — 18 Ekim 2026

**Son yerleşim güncellemesi:** Sol alttaki lisans kutusu kaldırıldı. Sağ üst ©
paneli hem atıfları hem güncel yollar anahtarını/durumunu içerir. Yollar, sürümlü
köprüde doğrulanan modernRoads boolean ile yönetilir; roads.status yalnız beş
izinli durum taşır. Harita üzerinde ikinci lisans/yol kutusu yoktur.


## Kapsam ve durum

**IMPLEMENTED:** Referans görseller yerel dosyalardan incelendi. Harita açık mavi
deniz, kırık beyaz kara, kimliğe göre kararlı pastel ülke dolguları ve koyu küçük
etiketlere geçirildi. Koyu uygulama panelleri ve gerçek MapLibre globe korunur.
Kaynak geometrileri, yıllar ve siyasi kimlikler değiştirilmedi. Kültürler kesik,
yarı saydam katmanda kalır; kültür renkleri açık zeminde kontrast için koyulaştı.

**IMPLEMENTED / canlı doğrulama PARTIAL:** Güncel yol katmanı, mevcut globe'a
OpenFreeMap'in üretim XYZ vektör servisinden eklenir. Kullanıcı açıkça bugünkü
yolları istedi: katman tarih çizelgesinden bağımsızdır, tarihî yol kanıtı değildir.
Sağlayıcının yayımladığı son veri kullanılır; anlık veya eksiksiz güncellik iddiası yok.
Katman ilk açılışta açık, zoom 6'dan itibaren görünür; düğmeyle kapatılabilir.
Güncel arazi örtüsü, su ve zoom 13'ten itibaren bina izleri de aynı kaynaktan gelir.
Modern siyasi sınırlar/ülke isimleri çizilmez; şehir etiketleri mevcut GeoNames
kataloğundan gelir. Hazır harita stili, ekran görüntüsü veya font kopyalanmadı.

Kamera üst sınırı 8 → 16 oldu. Köprü, paylaşım ve yer imleri aynı `isCamera`
sınırını kullanır; 16 üstü/NaN/geçersiz koordinat reddi korunur. Şehir sorgusunun
LOD değeri en çok 8'e sabitlenir, gerçek viewport daralmaya devam eder. Bu sayede
sokak ölçeğine yakınlaşmak şehir sorgusunu `PLACES_VIEWPORT` hatasına düşürmez.

## Kaynak ve lisans incelemesi

18 Ekim 2026'da birincil sayfalar okundu:

- [OpenFreeMap](https://openfreemap.org/): public üretim servisi, API anahtarı veya
  hesap gerekmiyor; SLA yok. Bu endpoint demo sunucusu değildir.
- [Resmî depo ve XYZ yolu](https://github.com/hyperknot/openfreemap):
  `https://tiles.openfreemap.org/planet/latest/{z}/{x}/{y}.pbf`.
- [OSM copyright](https://www.openstreetmap.org/copyright): veri **ODbL-1.0**;
  haritada görünen OSM katkıcıları/lisans bağlantısı gerekir.
- [OpenMapTiles şeması](https://openmaptiles.org/docs/schema/): şema tasarımı
  **CC BY 4.0**, kod BSD; bu kaynaklara atıf gösterilir.
- [OpenFreeMap lisans sicili](https://github.com/hyperknot/openfreemap/blob/main/LICENSE.md):
  hizmet kodunun MIT lisansı, OSM verisinin lisansı yerine geçmez.
- [Kullanım şartları](https://openfreemap.org/tos/) (14 Ekim 2026 güncellemesi):
  offline indirme ayrı sınırlarla izinli; bu uygulama offline tile indirmesi,
  önceden toplu çekme veya tile yeniden dağıtımı yapmaz.
- [Gizlilik](https://openfreemap.org/privacy/): sağlayıcı/CDN erişimi uygulamanın
  gizlilik metnine eklendi. Tile koordinatları görünen bölgeyi açığa çıkarabilir.

Karar: **ALLOW — çevrimiçi görüntüleme, görünür atıfla.** Yeni tile verisi üretim
kataloğuna, ETL paketlerine veya native offline arşivine eklenmedi. Yeni npm
bağımlılığı, hesap, secret, API anahtarı veya toplu veri indirmesi yok.

## Güvenlik, hata ve kaynak yönetimi

- Harici stil JSON'u yüklenmez. `transportation`, `landcover`, `water`, `building`
  dışında yeni görsel kaynak katmanı yok; `boundary`, `place`, sembol/font yok.
- `transformRequest` yalnız HTTPS sabit host + `/planet/latest/z/x/y.pbf`,
  z 6–14 ve geçerli XYZ kabul eder. Query, auth, traversal, başka host reddedilir.
- MapLibre'nin `same-origin` credential seçeneği sabit **farklı** tile origin'ine
  çerez göndermez. `no-referrer` paylaşım URL'sindeki yılı/kimliği göndermez.
- Preview CSP yalnız `connect-src` için tile hostunu ekler. Script/font/image
  dış kaynak izinleri genişletilmez. Yayın sağlayıcısı aynı CSP'yi uygulamalı.
- Tile cache en çok 128 giriş; uygulamada kalıcı tile cache veya offline paket yok.
  Tarayıcı HTTP cache'i sağlayıcı başlıklarına uyar. Tile bayt/GPU tüketimi ölçülmedi.
- Yol kaynağındaki hata ana küreyi kapatmaz: source/layer temizlenir, Türkçe
  hata gösterilir. Kapatıp açma yeniden dener. Bekleyen yük için 20 sn zaman aşımı.
- Arka plana geçince kaynak kaldırılır; dönüşte önceki açık tercihi geri gelir.
  Unmount timer/source/layer/dinleyicileri temizler. Yıl değişimi yol kaynağını
  yeniden kurmaz ve seçilen tarih/kamerayı değiştirmez.
- Native navigasyon ve file-origin izinleri genişletilmedi. Android file-origin
  HTTPS/CORS ve dış atıf bağlantısı davranışı cihazda ayrıca doğrulanmalıdır.

## Değişen dosyalar

- `src/theme/tokens.ts`, `src/politics/model.ts`: açık palet/kararlı kimlik rengi.
- `src/map/globe/style.ts`, `political-labels.ts`, `modern-city-markers.ts`:
  kontrast, odak, şehir LOD ve etiket renkleri.
- `src/map/globe/modern-roads.ts`: sağlayıcı, dar URL politikası, vektör katmanları,
  aç/kapat, hata, yükleme ve kaynak temizliği.
- `src/map/globe/renderer.ts`, `GlobeView.tsx`: aynı web/DOM çekirdeğinde entegrasyon,
  bağımsız hata ve güncel yol kontrolü/görünür atıf.
- `src/map-contract/protocol.ts`: azami kamera zoom 16.
- `src/i18n/tr.ts`, `src/privacy/policy.ts`, `src/atlas/AttributionPanel.tsx`:
  Türkçe durum, gizlilik ve kaynak açıklamaları.
- `scripts/qa/serve-export.mjs`: CSP tile origin'i.
- `tests/unit/{modern-roads,renderer,rework,globe,discovery}.test.mjs`, `tests/run.mjs`:
  yaşam döngüsü/URL/kontrast ve yeni zoom sınırı regresyonları.
- `tests/web/modern-roads.spec.ts`: gerçek browser hata/toggle senaryosu (çalıştırılamadı).
- README, progress, architecture, source-matrix, license-register, privacy-policy,
  release-blockers ve THIRD_PARTY_NOTICES: yeni çevrimiçi katman kaydı.

## Doğrulama

[Log dizini](roads-evidence/).

- `npm test`: **367/367 PASS**. Siyasi yazı kontrastı ≥4.5, sınır kontrastı ≥3,
  kültür kontrastı ≥3 korunur; beklentiler gevşetilmedi. Eski 8 zoom üst sınırı
  negatif örnekleri yeni gerçek sözleşme için 17 oldu; 16.01 reddi ayrıca testli.
- `npm run typecheck`: native + web strict TypeScript **PASS**.
- `npm run lint`: **PASS**; son değişen 20 dosyada ayrıca ESLint **PASS**.
- `npm run test:worker`: **5/5 PASS**. Son stil/renderer/yol regresyonları
  **55/55 PASS** (`final-regressions.log`). Değişen kod/testlerde Prettier **PASS**.
- `npm run web:export`: **PASS**, 4 rota, şehir verisi yine JS dışında 16.102
  doğrulanmış statik paket. Son tekrar çıktısı `web-export.log` içinde.
- MapLibre style validator yeni yol katmanlarını kabul etti. Sentetik testte
  ağ hatası/aç-kapat/cleanup ve kaynak allowlist doğrulandı; gerçek tile kanıtı değildir.
- Canlı endpoint `curl --max-time 15`: **BLOCKED — DNS çözümleme hatası**.
- Chromium başlatma: **BLOCKED — sandbox shutdown EPERM**. Ekran görüntüsü,
  GPU, mobil görünüm veya canlı yol E2E **NOT TESTED**; çizilmiş gibi sunulmaz.
- Yeni Android paket derlemesi yapılmadı; **UNVERIFIED ON DEVICE**.
- Git status: dizinde `.git` yok; diff raporu üretilemez. Kullanıcı veri dosyaları
  silinmedi. Yeni faz veya yayın onayı verilmedi; önceki NO-GO devam eder.

## Kullanıcı doğrulaması

Mevcut sunucuyu Ctrl+C ile durdurup `npm run web -- --clear` çalıştır.
Dosya indirmen veya `npm install` çalıştırman gerekmiyor. İnternet gerekir.
Türkiye üzerinde birkaç kez `+` ile yakınlaş; yol çizgileri zoom 6'dan itibaren,
daha küçük yollar yakınlaştıkça görünür. Sağ üstteki **©** düğmesinden atıf panelini aç; **Güncel yollar** açık olmalı.
Görseldeki Rodos çevresi için paylaşım parametresi:
`/?year=2024&lat=36.2&lon=28&zoom=10`.

Kontrol et: 2024 → 1453 değişiminde ülke katmanı değişirken yollar güncel kalır;
yolu kapatınca yol/arazi örtüsü kaybolur, ülkeler ve şehirler kalır. Ağ kesilirse
hata mesajı görünür, ana küre kullanılabilir. Android'de pinch, dönüş, arka plan,
ağ kesme ve atıf linkinden geri dönüş ayrıca cihazda ölçülmeli.
