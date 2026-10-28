# Geliştirme ortamı

## Web: Linux / CachyOS / Windows

Node 24 LTS ve npm 12.2.0; doğrudan sürümler `package.json`, transitif sürümler
`package-lock.json` ile sabittir. Nvm varsa `nvm install` / `nvm use` kullanılabilir.
Node 26 da desteklenir; başka major sürüm Expo'ya zorlanmaz.

```sh
npm install --global npm@12.2.0
npm ci
npm run web -- --host localhost --port 8081
```

WebGL2 destekli güncel tarayıcıda http://localhost:8081 açılır. WebGL erişilemezse
hata/fallback görünümü vardır; bu görünüm başarılı 3D renderer doğrulaması sayılmaz.
API anahtarı veya hesap gerekmez. npm ci DNS/registry hatası verirse erişimi düzeltin;
TLS denetimini kapatmayın, `npm audit fix --force` ile Expo SDK uyumunu bozmayın.

Kilit dosyasını farklı paket yöneticisiyle değiştirmeyin. `npm run globe:check`
incelenmiş motor/worker/coğrafya dosyalarını kontrol eder. Bunları normal kurulumda
yeniden üretmek gerekmez. Bir asset gerçekten değişirse ilgili hazırlama betiği,
checksum, kaynak/lisans ve regresyon incelemesi birlikte yapılır.

## Android

Android Studio SDK Manager ve JDK 17 başlangıç ortamıdır. Bu repository'deki
RN 0.86.3 Gradle sürüm kataloğundan okunan gereksinimler:

| Bileşen | Mevcut kilitli sürümün gereksinimi |
| --- | --- |
| Android SDK Platform | API 36 |
| Android SDK Build-Tools | 36.0.0 |
| Android SDK Platform-Tools | `adb` için |
| NDK (Side by side) | 27.1.12297006 |
| Minimum cihaz API | 24; bu değer gerçek cihaz başarısı garantisi değildir |

Kaynak: `node_modules/react-native/gradle/libs.versions.toml`. Sürüm yükseltildiğinde
bu tabloyu tahminen kullanmayın; yeniden üretilen Gradle ayarlarıyla karşılaştırın.
Emülatör isteyenler Emulator ve uygun system image da kurabilir. Fiziksel cihazda
USB debugging'i açın ve RSA onayını telefondan verin.

Bash:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
java -version
adb devices -l
npm run environment:check
npm run android:device
```

Fish:

```fish
set -gx ANDROID_HOME "$HOME/Android/Sdk"
fish_add_path "$ANDROID_HOME/platform-tools" "$ANDROID_HOME/emulator"
adb devices -l
npm run android:device
```

`android/` Expo'nun yerel ürettiği dizindir; Git'e eklenmez. `app.json` kaynak
konfigürasyonudur. EAS/Expo hesabı yerel derleme için zorunlu değildir.

```sh
npx expo prebuild --platform android --no-install
cd android
./gradlew assembleDebug
```

Bu bir debug APK akışıdır; imzalı mağaza sürümü değildir. `npm run android:bundle`
yalnız JavaScript/asset export eder. Güncel büyük şehir arşivinin native paket
boyutu ve gerçek cihaz GPU/dokunma/geri tuşu/ağ kesintisi kabulü hâlâ açıktır.
“Derlemeye başladı” veya `adb devices` sonucu, cihazda çalıştığının kanıtı değildir.

## Kontroller ve veri bakım işleri

```sh
npm run check
npm run web:export
npx playwright install chromium
npm run test:web:production
```

CI (`Altyapı kontrolleri`) Expo `start --web` kullanmaz; `web:export` sonrası
`ATLAS_TEST_PRODUCTION=1` ile tam `npm run test:web` (`web:preview`) koşar.
Android job, GH runner Metro OOM’unu önlemek için 16 102 GeoNames `.atlas`
`require` grafiğini stub’lar (Hermes/JS hard gate); tam `npm run android:bundle`
yerel veya daha büyük runner doğrulamasıdır — `continue-on-error` yok.
Yerelde geliştirme sunucusu için `npm run test:web` (CI unset) hâlâ Expo web’i açar.

Kaynak/lisans kapıları offline çalışabilir; yeni ham edinim internete ihtiyaç duyar.
`history:collect`, `places:download`, `data:download` gibi komutlar ilk kurulum için
zorunlu değildir. İndirilen dosyalar `data/staging/` altında kalır; inceleme ve
hak/zaman/konum doğrulaması olmadan uygulamaya paketlenmez.

Wikidata ETL kimliği yalnız geliştirici komutları içindir. Fish'te örnek:

```fish
read -P "İletişim URL veya e-posta: " ATLAS_WIKIDATA_CONTACT
set -gx WIKIDATA_USER_AGENT "TarihAtlasi/0.1.0 ($ATLAS_WIKIDATA_CONTACT)"
```

Gerçek iletişim bilgisi `.env`, README, istemci veya Git'e eklenmez.
`EXPO_PUBLIC_*` istemciye gömülür; secret alanı değildir. `env.example` açıklama
şablonudur. Ürün davranışı ve bağlantılar için [gizlilik politikası](privacy-policy.md).

## Sorun giderme

- Port dolu: `npm run web -- --host localhost --port 8082`.
- Metro eski cache: `npm run web -- --clear --host localhost --port 8081`.
- Entry %99'da: önce CLI hata çıktısını inceleyin; tüm şehir JSON'larını JS'e
  tekrar dahil etmeyin. Mevcut web veri yolu `/data/places/` olarak ayrılmıştır.
- Kürede boş bölge: önce seçili yıl ve kaynak kapsamına bakın. Güncel ülke sınırını
  eski tarihe taşımayın. Sorunu yıl/bölge/kaynakla issue olarak bildirin.
- Android unauthorized: telefon RSA onayı, USB modu/kablo ve dağıtım udev kurallarını kontrol edin.
- Docker socket erişimi: Docker Engine'in kendi kullanıcı erişim kurulumunu tamamlayın;
  uygulama için `chmod 666 /var/run/docker.sock` önerilmez.

Resmi kılavuzlar: [Expo Android ortamı](https://docs.expo.dev/workflow/android-studio-emulator/),
[React Native ortamı](https://reactnative.dev/docs/set-up-your-environment),
[USB cihaz](https://developer.android.com/studio/run/device),
[Expo ortam değişkenleri](https://docs.expo.dev/guides/environment-variables/).
