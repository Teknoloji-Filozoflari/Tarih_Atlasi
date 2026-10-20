# Faz 02 — Kullanıcı kurulumu sonrası inceleme

2026-10-15 · Kullanıcı npm install ile 844 paket kurdu ve 31 güvenlik bulgusu
bildirdi (2 low, 10 moderate, 19 high). Bu sayılar **kullanıcının ilk kurulum
çıktısıdır**, değişen lock için yeniden doğrulanmış audit sonucu değildir.
Faz 04 açılmadı. Android **UNVERIFIED ON DEVICE**.
[Komut/derleme kaydı](phase-02-post-install-validation.txt).

## Somut hatalar ve düzeltmeler

- Expo 57.0.29'un kurulu bundledNativeModules.json dosyası Reanimated **4.5.1** ve
  Worklets **0.10.1** bekliyor. npm'nin otomatik seçtiği **4.7.1 / 0.13.0**,
  expo-modules-core@57.0.23 peer aralığıyla çelişiyor. İki paket doğrudan tam
  sürümle sabitlendi. `npm install ... --package-lock-only --offline --ignore-scripts
  --no-audit` gerçek npm çözücüsüyle lock'u üretti; elle lock düzenlenmedi.
  Lock üstünde npm ls exit 0 ve bütün peer yolları bu çifte çözülüyor.
  **Kurulu node_modules hâlâ eski native çifti içeriyor; npm ci gerekli.**
- Önceden seçilen ESLint 9.18.0, Expo config'in `eslint/config` import'unu açamıyor.
  Önbellekte gerçekten bulunan **9.39.5** npm ile kurulup lock'a işlendi; lint
  çalıştı. JSON'lar JS lint kapsamından çıkarıldı (format ve TS config kontrolü
  korunur), Buffer import'u ve type-only View import'u düzeltildi. React ref
  atamaları effect'e, yeniden deneme yükleme durumu kullanıcı olayına taşındı.
  ESLint 9.39.5 için de bakım/deprecation uyarısı **sürüyor**. Major 10'a zorlanmadı:
  kurulu eslint-plugin-react@7.37.5 peer aralığı 10'u kapsamıyor, Expo plugin'i
  9 serisine bağımlı. Bu bir lint çalışma düzeltmesidir, bütün bakım/audit kapısı değil.
- Expo'nun web koşullu tip export'u DOMProps sunmadığı için web typecheck
  başarısızdı. Kontrollü DOM yapılandırması RN WebView'in public WebViewProps
  tipinden türetildi; source/injection/message kontrol alanları dışlandı.
  Her iki platform çözümlemesinde **tam typecheck artık PASS**.
- Gerçek MapLibre 6.14.0 worker'ında iki dinamik import var: isteğe bağlı RTL/custom
  plugin yükleyicileri. Önceki tüm import'ları reddeden hazırlık bu gerçek dağıtımı
  durduruyordu. Fiziksel-only prototipte kullanılmayan dinamik import çağrıları
  AST ile kontrollü hata üreten Promise'e çevriliyor; zorunlu statik bağımlılık
  varsa işlem yine durur. Telif yorumları korunuyor, dönüşüm/orijinal ve çıktı
  hash/byte sayıları manifestte tutuluyor. Bu genel bir worker güvenlik sandbox'ı
  değil; modül import çağrılarının kapatılmasıdır. RTL/plugin özelliği açılmadı.

## Doğrulanan sonuçlar

| Kontrol | Sonuç |
| --- | --- |
| npm run check | **PASS**: lint 0 uyarı, native+web strict typecheck, 18 ana test + 4 worker testi, format |
| npm run config:check | **PASS**, Android/web ve Router yapılandırması okunuyor |
| Expo web export | **PASS**, gerçek Metro/static render; bu görüntünün tarayıcıda açıldığı anlamına gelmez |
| Expo Android + DOM JS export | **PASS**, Hermes ve paketli DOM/HTML/CSS dosyaları oluştu; APK veya cihaz sonucu değil |
| Kilitli peer ağacı | **PASS**, npm ls --package-lock-only; Reanimated 4.5.1 / Worklets 0.10.1 |
| Kurulu paket eşlemesi | **21/23 tam sürüm**; iki native paket hedefe henüz indirilmedi |
| Gerçek worker AST | **PASS**, orijinal 508314 byte → 654885 byte; iki dinamik import kapatıldı |
| Natural Earth alımı | **BLOCKED**, fetch failed; generated veri/worker/Notice hâlâ null |
| Tarayıcı/live smoke | **BLOCKED**, bu sandbox socket açmaya izin vermiyor; yerel HTTP sunucusu EPERM |
| npm audit | **BLOCKED**, bulk endpoint DNS EAI_AGAIN; güncel rapor/çözüm sayısı yok |
| Android cihaz / APK | **UNVERIFIED ON DEVICE**, Java/SDK/adb/cihaz kanıtı yok |

Önbellek kullanımı: kullanıcının npm cache'inden aynı sürümlere ait gerçek metadata/
archive'lar görev için yazılabilir /tmp cache'ine alındı. İçerik ve özgün vary
başlıkları korundu; güvenlik denetimi veya TLS kapatılmadı. Başka projenin lock veya
node_modules'u taşınmadı. Sadece ESLint kurulumu tamamlanabildi; native çiftin
arşivleri mevcut değildi. İlk başarısız cache denemeleri başarılı kurulum sayılmadı.

## Kullanıcı çıktısındaki diğer uyarılar

- uuid@7.0.3, `xcode@3.0.1 → @expo/config-plugins` üzerinden gelen transitif paket.
  Projeye uuid@latest eklemek bu yolu kendiliğinden düzeltmez.
- unrs-resolver@1.12.2 postinstall npm allowScripts politikasıyla engellendi.
  `require('unrs-resolver').ResolverFactory` mevcut ve lint çalışıyor; bu yüzden
  script'e otomatik onay verilmedi. Tüm install script'leri açılmadı.
- 31 bulgu otomatik olarak 31 ayrı kullanıcıya açık saldırı anlamına gelmez;
  kullanılan yol, advisory ve düzeltme sürümleri görülmeden önemleri azaltılamaz.
  `npm audit fix --force` uygulanmadı: uyumlu Expo ağacını major değişikliklerle
  bozma ihtimali var. Ayrıntılı audit raporu hâlâ gereklidir.

## Sonraki gerekli terminal adımı

Kullanıcının ağ erişimi olan proje terminalinde:

```sh
npm ci
npm run globe:prepare
npm audit --json > docs/reports/npm-audit.json
```

İlk komut lock'taki native çifti kurar; ikincisi izinli kara verisi ve worker/Notice
modüllerini hazırlar. Son komut güvenlik bulgusu varsa exit 1 dönebilir; JSON dosyası
inceleme için kullanılabilir. Sonra uyum/type/lint/test/export ve gerçek web
küre/Android cihaz kapısı yeniden kontrol edilir. Şimdiki export'lar **null asset ve
eski kurulu native çift** üzerinde alındı; nihai uyumlu release kanıtı değildir.

## Değişen dosyalar ve haklar

package.json + npm'nin ürettiği package-lock.json; eslint.config.mjs;
src/map/GlobeDOM.tsx, globe/GlobeView.tsx, useGlobeHost.ts, atlas/Action.tsx;
scripts/prepare-globe-assets.mjs ve globe/validate-worker.mjs, worker regresyon testi;
README/progress/ADR/prototip/lisans/risk/atıf kayıtları ve bu rapor.

Yeni doğrudan native çiftinin seçim gerekçesi keyfi animasyon özelliği değil,
Router'ın dolaylı olarak kurduğu runtime peer ağacını SDK setine sabitlemektir.
Mevcut metadata boyutları: Reanimated 4.5.1 paket own unpacked **4439847 byte**,
Worklets 0.10.1 **1031585 byte**; kurulu ölçüm değil, registry cache metadata'sı.
Kod lisansları MIT; gerçek paket/license/NOTICE kurulumdan sonra tamamlanmalı.
[Kurulu doğrudan paket ölçümleri](phase-02-installed-dependencies.json) bundle/APK
boyutu veya tam transitif denetim değildir.

Android export, Router transitifinden **MaterialSymbols_400Regular.ttf** (~971KB)
çıkarıyor. Önceki “dış font yok” ifadesi yalnız projeye ait UI seçimi içindi; toplam
bundle'da font olmadığı sonucu artık geçersiz. @expo-google-fonts/material-symbols
0.4.50: wrapper MIT, font Apache-2.0. Gerçek LICENSE/ LICENSE_FONT metinleri
assets/licenses/MaterialSymbols-{WRAPPER,FONT}-LICENSE.txt olarak korundu.
Tam transitif notice ve uygulama içi dağıtım incelemesi bitmiş sayılmaz.
Natural Earth/Historical Basemaps kayıtları değiştirilmedi; belirsiz geometri alınmadı.

Resmi destek kaynakları: [Expo SDK57 Reanimated](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/),
[Expo DOM](https://docs.expo.dev/guides/dom-components/),
[Expo ESLint](https://docs.expo.dev/guides/using-eslint/).
Kurulu tam sürümün kaynak/metadata kontrolü güncel web dokümanından ayrı yapıldı.
