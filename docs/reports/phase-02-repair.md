# Faz 02 düzeltme incelemesi

2026-10-15 · Kullanıcı: “faz 2 de olan sorunu incele ve çözmeye çalış”.
Sonuç: **renderer/worker kontrolündeki yeniden üretilen hatalar düzeltildi;
platform kabulü hâlâ BLOCKED**. Android **UNVERIFIED ON DEVICE**.
Yeni faz veya ürün özelliği başlatılmadı; Faz 03 arayüzü korundu.

## Ayrıştırılan nedenler ve yapılan değişiklik

AGENTS, progress, önceki faz raporları, README, renderer/DOM/köprü ve asset hazırlama
kodu okundu. Küçük plan: önce ortamın erişimini tekrar dene, sonra kaynak hatalarını
regresyonla üret/düzelt, bağımsız test ve mevcut kalite komutlarını çalıştır, sonuçları
ayrı kaydet. Paket/GPU sorunları aynı hata sayılmadı.

1. **Ortam / hâlâ engelli:** npm registry DNS EAI_AGAIN sürüyor. DNS'i kullanmayan
   sabit IP/TLS doğrulamalı bağlantı da exit 7 ile başarısız oldu. Bu görev ortamından
   sunucuya erişilemiyor; kullanıcının tüm host ağının bozuk olduğu sonucu çıkarılmadı.
   Sistem DNS/TLS ayarları değiştirilmedi; Java/SDK/adb yok, paketler/lock eksik.
2. **Renderer / düzeltildi:** dış constructor try/catch'i, sonradan çalışan `load`
   handler'ındaki marker kurulum hatasını yakalamıyordu. Hata panele gitmeden dışarı
   taşabiliyor, kısmen kurulan marker/dinleyici kalabiliyordu. Handler şimdi hata
   yoluna giriyor; marker temizliği `addTo` öncesinde kaydediliyor. Scope map, marker,
   observer, dinleyici ve worker URL'yi bırakıyor; hata bir kez bildiriliyor.
3. **Renderer / düzeltildi:** yinelenen load ikinci marker kurabiliyordu.
   Tek başlangıç koruması eklendi. Dispose sonrası komut ve olaylar etkisiz.
4. **Renderer / düzeltildi:** context/error'da temizliğin yalnız üst React
   koordinatörüne bırakılması renderer'ın bağımsız kullanımında kaynak ve yinelenen
   hata bırakıyordu. Renderer kendi scope'unu bırakır; üst koordinatörün dispose'u
   idempotent kalır. Resize ve kamera komutu hataları da aynı yola girer.
5. **Worker hazırlığı / düzeltildi:** regex, yorum/string içindeki `import` sözcüğünü
   dış bağımlılık sayabiliyor; yorumla ayrılmış gerçek import'u kaçırabiliyordu.
   Mevcut TypeScript toolchain'iyle JavaScript AST kontrolüne geçildi: syntax hatası,
   boş kod, gerçek statik/dinamik import ve dış re-export reddedilir; yorum/metin
   kabul edilir. Bu bir güvenilmeyen kod sandbox'ı veya bütün ağ API'leri analizi
   değildir. Gerçek MapLibre worker baytları henüz alınamadı.

Renderer/style modüllerinin yerel TS import yolları `.ts` ile açık yazıldı; Node
kendi type stripping'iyle gerçek kaynak fonksiyonunu test edebiliyor. Sahte MapLibre
paketi node_modules'a eklenmedi, dependency stub'ıyla typecheck yeşile çevrilmedi.
Testlerde enjekte edilen Map/DOM doubles yalnız lifecycle sözleşmesini çalıştırır.

## Önce / sonra kanıtı

[Geçerli regresyonlarla düzeltme öncesi çıktı](phase-02-repair-before.txt):
marker kurulumunda `marker installation failed` yakalanmadı; iki load'da 2 marker;
context kaybı iki kez bildirildi. Üç test de başarısızdı.
[Son komutlar ve exit kodları](phase-02-repair-validation.txt):

| Kontrol | Sonuç / sınır |
| --- | --- |
| npm test | **PASS 18/18**, önceki 15 + 3 gerçek renderer fonksiyonu/double regresyonu |
| Worker AST regresyonları | **PASS 3/3**, mevcut TS 6.0.3 araç kopyasına CLI yolu verilerek; kurulu proje paketi değil |
| Bağımsız core strict tip kontrolü | **PASS**, önceki pure modüller; renderer/UI/MapLibre semantik tipleri dahil değil |
| Mevcut Prettier 3.9.9 | **PASS**; bütün uygulamanın kurulduğu anlamına gelmez |
| npm run lint / typecheck | **BLOCKED**, exit 127, paketler yok |
| globe:prepare | **BLOCKED**, kurulu MapLibre manifesti yok; gerçek GeoJSON/worker/Notice null |
| Web test/export ve Android JS export | **BLOCKED**, exit 127; Expo/Playwright yok |
| APK / fiziksel Android / GPU / offline | **NOT RUN — UNVERIFIED ON DEVICE** |

Worker testleri `npm run test:worker` olarak `npm run check` içine eklendi. Normal
kurulumda sabit TypeScript sürümünü çözer; bu ortamda `node tests/unit/worker.test.mjs
/tmp/tarih-atlasi-tools/typescript/lib/typescript.js` ile mevcut gerçek parser kullanıldı.
Olağan npm test bağımsız çalışmaya devam eder. Görsel snapshot veya GPU çıktısı
üretilmedi. Bu düzeltme native raw Expo zarfının parse öncesi sınırını sağlamaz;
önceki [köprü güven sınırı](../globe-prototype.md) açık kalır.

## Değişen dosyalar

- src/map/globe/renderer.ts — init/hata/cleanup ve açık yerel importlar.
- src/map/globe/style.ts — Node regresyonu için açık yerel import yolu.
- scripts/globe/validate-worker.mjs, scripts/prepare-globe-assets.mjs — gerçek AST.
- tests/unit/renderer.test.mjs, tests/unit/worker.test.mjs, tests/run.mjs — regresyonlar.
- package.json — worker test komutu/kalite kapısı; dependency sürümü değişmedi.
- README, progress, globe-prototype, ADR-0001, license-register, risks ve bu üç
  repair raporu — güncel kanıt ve kalan engeller. Önceki raporlar tarihî tutuldu.

Yeni bağımlılık/veri lisansı eklenmedi. TypeScript mevcut Apache-2.0 geliştirme
aracıdır; AST kullanımı istemci bundle'ına parser eklemez. Belirsiz lisanslı veri
paketlenmedi; HB-REDIST-01 **BLOCKED FOR REDISTRIBUTION** sürer. Sentetik test
poligonu ve worker metni yalnız fixture, ürün verisi değildir.

## Kalan engeli kapatma sırası

Registry erişimi olan normal proje terminalinde önce `npm install --package-lock-only
--ignore-scripts`, gerçek lock/transitif lisans incelemesi, `npm ci`,
`npx expo install --check`. Ardından `npm run globe:prepare`, provenance/Notice
incelemesi, `npm run format`, `npm run check`, `npm run web:export`,
`npm run android:bundle` ve `npm run test:web`. Hazırlama geliştirme TypeScript
paketini kullanır; `--omit=dev` ile yapılmaz. Lock elle yazılmaz.

Web ESM/Metro/CSS/Blob worker export başarısı görülmeden “küre çalışıyor” denmez.
Android için JDK/SDK/adb + gerçek debug/release cihaz deneyleri ayrıca gerekir.
JavaScript export veya 18+3 unit testi APK/GPU kanıtı değildir. Cihaz matrisi
[phase-02-device.md](phase-02-device.md) hâlâ açık; sonraki faza geçilmedi.

Resmi kaynaklar tekrar kontrol edildi: [MapLibre v6 ESM/worker kurulumu](https://maplibre.org/maplibre-gl-js/docs/),
[MapLibre 6.14.0 Map lifecycle kaynağı](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/src/ui/map.ts),
[Expo SDK57 wrapper / dış JSON parse sınırı](https://github.com/expo/expo/blob/sdk-57/packages/expo/src/dom/webview-wrapper.tsx).
Bunlar API/kaynak kanıtı; hedef paketlerin yerel kurulum veya gerçek cihaz kanıtı değildir.
