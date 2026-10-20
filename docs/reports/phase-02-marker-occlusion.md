# Faz 02 — Arka yüz işareti düzeltmesi ve kullanıcı web denemesi

2026-10-15 · **SOURCE / QUALITY / JS EXPORT PASS**.
**Faz 02 kabulü BLOCKED; Android UNVERIFIED ON DEVICE.** Yeni faz başlatılmadı.

## Gözlem ve neden

Kullanıcı küre sürükleme, kamera sıfırlama ve sentetik işaret seçildiğinde bilgi
panelinin açılmasını çalışır bildirdi. Web platformu konuşma bağlamından alınmıştır;
tarayıcı/OS/sürüm, ekran görüntüsü ve performans ölçümü paylaşılmadı. Bu üç kullanıcı
denemesi bağımsız otomatik test veya fiziksel Android kanıtı sayılmadı.
Sonraki kullanıcı denemesi: “test ettim bro işaret kayboluyor”. Düzeltme sonrası
arka yüzde gizlenme **USER-REPORTED PASS**; öne dönüşte seçim, odak ve erişilebilirlik
kontrolleri bu bildirimden çıkarılmadı.

Arka yüzde işaret görünmesi: kurulu MapLibre GL JS 6.14.0 `Marker` varsayılan
`opacityWhenCovered` değeri **0.2**. Kütüphane küre arkasındaki DOM marker'ını
tamamen kaldırmak yerine saydam gösteriyor. Bu davranış atlas için uygun değil.
Kurulu `node_modules/maplibre-gl/src/ui/marker.ts` ile
[resmi marker CSS sınıfı belgesi](https://maplibre.org/maplibre-gl-js/docs/API/classes/Marker/#css-classes)
karşılaştırıldı; `maplibregl-marker-covered` belgeli sınıftır.

## Değişiklik

- Ortak renderer'da `opacityWhenCovered: 0` ve atlas marker sınıfı eklendi.
- Ortak CSS covered işarette `visibility: hidden` / `pointer-events: none` uygular;
  yalnız opacity 0 ile görünmez ama odaklanabilir/tıklanabilir düğme bırakılmaz.
- Seçim handler'ı covered işaretin fare/klavye/programatik click mesajını reddeder.
- Görünür yüze dönünce aynı işaret tekrar seçilebilir. Ek observer/dinleyici yok;
  mevcut unmount temizliği korunur. Özel MapLibre API'si veya yaklaşık konum hesabı yok.

Değişen kaynaklar: `src/map/globe/renderer.ts`, `GlobeView.tsx`, yeni `markers.css`;
`tests/unit/renderer.test.mjs`, `tests/web/app.spec.ts`; README,
`docs/progress.md`, `docs/globe-prototype.md`, cihaz raporu ve bu rapor.
Yeni bağımlılık, veri, görsel, font veya tile eklenmedi; mevcut lisans/atıflar ve
provenance değişmedi. Historical Basemaps **BLOCKED FOR REDISTRIBUTION** sürer.

## Harita ayrıntısı ve kapsam

Stil yalnız `ocean` ve `physical-land` katmanlarından oluşur. Kaynak Natural Earth
v5.1.2 `ne_110m_land`: **1:110 milyon**, 127 fiziksel feature, 5143 koordinat.
Kara kenarları kıyı çizgisidir; siyasi ülke sınırı/adı yoktur. Küçük adalar/kıyılar
genelleştirilmiştir. [Resmi fiziksel kara kaynağı](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/),
[yerel manifest](../../assets/licenses/globe-provenance.json).

Bu prototip tabanı nihai harita ayrıntısını belirlemez. Motor, stil ve veri ayrıdır;
daha ayrıntılı lisansı uygun fiziksel veri ve kaynaklı tarihî siyasi/kültürel
katmanlar kendi yetkili fazlarında eklenebilir. Şu an tarihî katalog **0**; yıl
seçimi tarihî sınır yüklemez. Güncel kıyı tabanı geçmiş kıyı rekonstrüksiyonu değildir.
MÖ 2000–günümüz tam dünya/yıllık tarihî sınır kapsamı taahhüt edilmez.

## Doğrulama

| Kontrol | Sonuç / sınır |
| --- | --- |
| Yeni covered-marker regresyonu, düzeltmeden önce | FAIL: gizli işaret iki ek seçim mesajı gönderiyordu (`3 !== 1`) |
| `npm run check` | PASS: lint 0 uyarı, native + web strict TS, **19/19** ana test, **4/4** worker testi, asset/NOTICE hash ve format |
| Marker unit testi | Gerçek mountRenderer; enjekte DOM/MapLibre test double'ları. Görünür → covered → görünür seçimleri ve dispose sonrası listener kontrolü; gerçek GPU/occlusion hesabı kanıtı değil |
| `npm run web:export` | PASS: 815 web modülü; yeni marker CSS **83 byte** üretim çıktısına dahil |
| `npm run android:bundle` | PASS: 1289 Android / 152 DOM modülü, aynı **83 byte** marker CSS DOM çıktısına dahil. APK/cihaz kanıtı değil |
| `npm run test:web -- --list` | PASS: iki proje için toplam 16 senaryo keşfedildi; çalıştırılmış test sayılmaz |
| Hedefli web regresyonunu çalıştırma | `timeout 30s npm run test:web -- tests/web/app.spec.ts --grep 'küre arkasında kalan' --project desktop` → exit **124**, sonuç yok. Önceki sandbox Chromium/socket engelleri de açık; **BLOCKED**, başarı iddiası yok |
| Kullanıcının web denemeleri | Sürükleme, reset, işaret → panel ve düzeltme sonrası arka yüzde gizlenme kullanıcı beyanıyla PASS; öne dönüşte tekrar seçim/odak henüz doğrulanmadı |
| Fiziksel Android | **UNVERIFIED ON DEVICE**; dokunma/rotation/back/context/offline/bellek/gecikme test edilmedi |

Yeni gerçek tarayıcı senaryosu haritayı sürükleyerek marker'ı arka yüze taşır;
örtülme sınıfı/gizlenme/odak dışı kalma ve reset sonrası tekrar seçimi kontrol eder.
Testin yazılmış olması geçtiği anlamına gelmez. Kullanıcı düzeltme sonrası arka
yüzde gizlenmeyi doğruladı. Öne döndürme/reset sonrası tekrar seçim ve klavye/odak
kontrolleri ayrıca doğrulanmalı. Kod/CSS değiştiği için `globe:prepare` veya yeniden
`npm ci` gerekmez.

Sonraki kabul önkoşulları: kalan web/manual ve otomatik smoke, Android
debug/release gerçek cihaz matrisi; mevcut audit risklerinin takibi. Faz 04'e geçilmez.
