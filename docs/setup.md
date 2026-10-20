# Faz 01 — Ortam ve sürüm kararı

Tarih: 2026-10-15 · Durum: **BLOCKED — bağımlılık kurulumu ve platform doğrulaması**.
Bu faz kullanıcı tarafından yetkilendirildi; kullanıcı registry erişimi sorusuna
“Mevcut ortamla ilerle; engelleri raporla” yanıtını verdi. Bu yanıt başarılı kurulum
veya test kanıtı değildir. Bu Faz 01 kaydı tarihîdir; kullanıcı daha sonra Faz 02 kaynak çalışmasını yetkilendirdi. Faz 01 kurulum kapısı kapanmadı; güncel durum progress.md içindedir.

## Resmi sürüm dayanağı

Expo'nun [kurulum kılavuzu](https://docs.expo.dev/get-started/create-a-project/)
Node LTS ve Linux'u destekler. [SDK matrisi](https://docs.expo.dev/versions/latest/)
bu okumada kararlı SDK 57 ailesini gösterdi. Faz 00'daki sürüm numaraları kör
kopyalanmadı; şu iki resmi dosya yeniden açıldı:

- [SDK 57 varsayılan şablon manifesti](https://github.com/expo/expo/blob/sdk-57/templates/expo-template-default/package.json): Expo `~57.0.29`, Router `~57.0.27`, React/DOM 19.2.3, RN 0.86.3, RN Web `~0.21.0`, TS `~6.0.3`.
- [SDK 57 bundledNativeModules](https://github.com/expo/expo/blob/sdk-57/packages/expo/bundledNativeModules.json): Router `~57.0.28`, constants `~57.0.22`, linking `~57.0.13`, metro-runtime `~57.0.17`, status-bar `~57.0.1`, system-ui `~57.0.4`, safe-area `~5.7.0`, screens `~4.26.0`.

İki dosyadaki Router yama farkı aynı `~57.0.x` ailesindedir; eşleme dosyasının
57.0.28 hedefi alındı. [Router paket manifesti](https://github.com/expo/expo/blob/sdk-57/packages/expo-router/package.json)
bu sürümü ve SDK 57 modülleriyle peer ilişkilerini gösteriyor. `main` olarak
`expo-router/entry`, Router config plugin'i ve typed routes, resmi
[kurulum akışına](https://docs.expo.dev/router/installation/) göre eklendi.

React Native Web 0.21.2, React tipleri 19.2.18, Prettier 3.9.9 ve Playwright 1.63.0
sürümlerinin yerel npm cache/araç metadata'sı görüldü; bunlar canlı registry'nin
“en son” sürüm kanıtı sayılmadı. RN Web seçimi resmi `~0.21.0` aralığı içinde.
[ESLint Expo manifesti](https://github.com/expo/expo/blob/sdk-57/packages/eslint-config-expo/package.json)
57.0.2, MIT lisansı, flat config ve ESLint 9.18 uyum dayanağı olarak incelendi.

Manifestteki hedefler tam sürümdür. Ancak npm registry sorgusu ve lock üretimi
`EAI_AGAIN` ile başarısız oldu. **Yayınlanmış tam paketlerin varlığı, transitif
çözüm, bütün peer uyumu ve npm ci sonucu henüz doğrulanmadı.** Resmi hareketli
SDK branch'i bir registry lock dosyası yerine geçmez. Kurulum sonrası önce
`npx expo install --check` yapılmalı; farklı sürüm gerekiyorsa resmi eşleme ile
manifest ve lock birlikte güncellenmelidir. SDK düşürme, legacy peer bypass veya
başka projenin kurulu paketlerini bu projeye aktarma yapılmadı.

## Repo ve araç seçimi

[ADR-0004](adr/0004-project-foundation.md): tek uygulama ve tek npm manifesti.
`src/domain`, `src/data`, `src/map-contract` sınırları ayrı tutuldu; workspace
paketleri, ikinci bundler veya monorepo görev koşucusu eklenmedi.

Npm 12.2.0 bu ortamda mevcut. Tek package-lock.json hedefleniyor; bu dosya
oluşmadığı için tekrar üretilebilir kurulum kabulü **BLOCKED**. Node 24 LTS geliştirici
ve CI tabanı; mevcut ortam Node 26.11.1. İki major da manifestte izinli; Node 24
CI'ı bu oturumda çalıştırılmadı.

Unit test için Node'un yerleşik `node:test` API'si seçildi; bir dosyada beş isimli
senaryo var ve aynı süreçte çalıştırılıyor. Bu ortamın alt süreç kısıtlarıyla
yalnız dosya düzeyinde sonuç veren izolasyonlu koşum yerine doğrudan named test
sonuçları alındı. Jest/React renderer kurulmuş gibi gösterilmedi. Web smoke için
Playwright seçildi; gerçek Expo sunucusu şarttır. Hedef paket ve sunucu yokken
statik bir HTML ile testi yeşile çevirme yapılmadı.

## Ortam denetimi ve mevcut engeller

| Kontrol | Gözlem | Kapanış kanıtı |
| --- | --- | --- |
| Node / npm | v26.11.1 / 12.2.0 komutları çalışıyor | Node 24 tabanında da kurulumu/testleri çalıştır |
| Registry | npm view ve lock üretiminde `EAI_AGAIN`; eksik Router/ESLint cache'i | Resmi registry erişimi, gerçek `npm install`/`npm ci`, üretilmiş lock |
| Kurulu hedef paketler | 0/19; mevcut cache paketleri hedef projeye aktarılmadı | [Bağımlılık raporunun](reports/dependency-report.json) tam sürüm eşlemesi ve transitif inceleme |
| Java | PATH üzerinde bulunamadı | Seçilen SDK/RN için uygun JDK ve Gradle build |
| Android SDK / adb | SDK belirlenemedi, adb yok | SDK Manager, ANDROID_HOME/PATH, adb yetkili cihaz kaydı |
| Web | Expo/Router olmadığı için start komutu çalışmadı | Tarayıcıda başlangıç ve Playwright smoke + web export |
| Android | JS export/Gradle/APK/gerçek cihaz yok | Android JS export, prebuild, assembleDebug ve fiziksel cihaz açılış kaydı |

Kaynak kodu doğrulanmış bağımsız araç kopyalarıyla kısmen denetlendi: TypeScript
6.0.3 ile yalnız i18n/tema/boş katalog ve negatif çeviri tipi testleri; Prettier
3.9.9 ile biçim. Bu araçlar `/tmp/tarih-atlasi-tools` altında mevcut yerel araç
kurulumundan alındı. Ürün bağımlılığı gibi node_modules içine konmadı ve lock
yerine kullanılmadı. Tam UI/Router tip kontrolü veya lint başarısı sayılmadı.

## Android komutlarının doğrulama sınırı

README'deki `expo run:android --device`, `expo prebuild --platform android --no-install`
ve export komutları resmi [Expo yerel derleme](https://docs.expo.dev/guides/local-app-development/)
ve [CLI](https://docs.expo.dev/more/expo-cli/) belgelerine dayanır. Bu projenin hedef
CLI paketleri kurulamadığından çalıştırılabilir sürüm uyumu **henüz test edilmedi**.
JDK 17 önerisi [React Native ortam belgesinden](https://reactnative.dev/docs/set-up-your-environment),
SDK API 36 hedefi Expo SDK 57 tablosundandır; üretilmiş Gradle ayarlarıyla henüz
karşılaştırılmadı. CachyOS'a otomatik sistem paketi/udev veya kullanıcı ayarı yazılmadı.

Android JS export, native APK değildir; adb'de cihaz görünmesi de uygulamanın açılması
değildir. Cihaz kabul kaydı en az cihaz/OS bilgisi, uygulama sürümü, kurulum ve
açılış adımları, ekran görüntüsü ve hata çıktısını içermelidir. Bu fazda böyle
bir kayıt yoktur; performans iddiası yapılmaz.

## Public ve secret sınırı

Şu an hiçbir environment değeri veya API anahtarı gerekli değil. `env.example`
yalnız açıklama içerir. `EXPO_PUBLIC_*` bundle'a gömülür; config `extra` da public
olabilir. Secret'lar app.json, React kodu veya loglara yazılmaz. İleride ETL/CI
secret'ı gerekiyorsa yalnız işlem ortamında kalır; statik katalog veya web/native
çıktısına aktarılmaz. [Expo environment belgesi](https://docs.expo.dev/guides/environment-variables/).

CI tanımı `contents: read` ve `pull_request` kullanır; yayın, deployment veya mesaj
gönderimi içermez. Lock dosyası yokluğunda kalite işi başarısız olur. CI yüklenip
çalıştırılmadı; yalnız yapılandırma dosyası hazırlandı.
