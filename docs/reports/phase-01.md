# Faz 01 raporu — Expo altyapısı, ortam ve repo düzeni

Tarih: 2026-10-15 · Sonuç: **BLOCKED — INSTALLATION AND PLATFORM VALIDATION**.
Bu faz tamamlandı olarak kapatılmadı. Faz 02 başlatılmadı.

## Başlangıç ve kapsam

AGENTS.md, progress ve Faz 00 raporu/PRD/mimari/ADR/kaynak/lisans/risk/kapsam
belgeleri incelendi. Önceden ürün kodu, README veya package.json yoktu. Mevcut
kurallar ve Faz 00 raporları korundu; eski ürün kodu silinmedi. Git metadata'sı
başlangıçtaki gibi kullanılabilir değil; Git başlatılmadı ve commit yapılmadı.

Önce resmi belgeler ve ortam incelendi, ardından tek npm projesi için küçük plan
paylaşıldı. Registry erişimi engelinde kullanıcı “Mevcut ortamla ilerle; engelleri
raporla” dedi. Hazırlanabilen kaynaklar ve bağımsız kontroller tamamlandı;
kurulum veya cihaz başarısı varsayılmadı.

## Yapılan işler

| Görev | Sonuç |
| --- | --- |
| 1. Expo/Router/RN/RN Web/strict TS | Resmi SDK 57 şablonu ve bundledNativeModules yeniden doğrulandı; tam hedef sürümler manifestte. Router/TS/config kaynakları hazır; kurulum **BLOCKED** |
| 2. Paket yöneticisi ve lock | Npm 12.2.0 gerekçelendirildi, engines/packageManager/.npmrc eklendi. Gerçek lock üretilemedi; npm ci ve tekrar üretilebilir kurulum **BLOCKED** |
| 3. Anlaşılır repo düzeni | Tek src tabanlı uygulama; domain/data/map-contract ve scripts/etl sınırları. Workspace paketleri eklenmedi; ADR-0004 |
| 4. UI temeli | Başlangıç/bilgi/not-found, Router hata sınırı, loading/empty/error ortak bileşenleri, koyu tema, sistem tipografisi/glif ikonları; kaynak hazır, render doğrulanmadı |
| 5. MapViewport adaptörleri | .web.tsx ve .native.tsx girişleri, ortak “harita henüz hazır değil” görünümü. Gerçek/sahte küre veya WebView yok |
| 6. Kalite ve CI | ESLint/Prettier/iki platform TS config, Node unit ve tip testleri, Playwright smoke, CI dosyası hazır. Unit/core tip/biçim geçiyor; tam lint/typecheck/web kontrolleri engelli; CI çalıştırılmadı |
| 7. Environment | Anahtarsız env.example, .env ignore ve public/secret belgeleri. İstemci environment değeri okumuyor |
| 8. README/Linux/Android | Kurulum, npm ci hedefi, SDK/JDK/USB/udev, web, native komutlar ve sorun giderme belgeli. Komutlar resmi akışa dayanıyor; hedef CLI/native çalışma doğrulaması engelli |
| 9. Türkçe/i18n | tr kataloğu, MessageKey/MessageCatalog; eksik/yanlış anahtar için negatif tip testleri. İngilizce ürün metni veya dil seçici eklenmedi |

## Kabul kriterleri ve engeller

| Kriter | Durum | Kanıt |
| --- | --- | --- |
| lint/typecheck/test çalışıyor | **PARTIAL / BLOCKED** | Beş unit testi geçiyor; core strict kontrolü geçiyor. Tam npm lint ve typecheck komutları araç eksikliği nedeniyle 127 |
| Web geliştirme ekranı açılıyor | **BLOCKED** | npm run web, Expo kurulu olmadığından 127. Tarayıcıda çalışan başlangıç ekranı veya başarılı web smoke yok |
| Android derlemeye hazır / cihaz durumu raporlu | **BLOCKED** | Config ve adaptör kaynakları hazır; Java/SDK/adb, paketler ve Gradle/APK kanıtı yok. Gerçek cihazda açılmadı |
| Sıradaki fazdan önce kritik build hatası kalmaması | **NOT MET — BLOCKED** | Native/web build çalıştırılmadan hata olmadığı söylenemez; Faz 02'ye geçilmiyor |
| Tekrarlanabilir kurulum ve lock | **BLOCKED** | npm install --package-lock-only --ignore-scripts, registry EAI_AGAIN ile durdu; package-lock.json yok |

Engel **F01-ENV-01**: registry/DNS ve eksik cache. Yerel cache'de eski bir SDK 57
yaması bulunması, güncel hedef paket setinin kurulduğu anlamına gelmez. Router ve
ESLint tarball'ları da yoktu. Başka projenin lock/node_modules'u taşınmadı, lisans
ve integrity alanları uydurulmadı.

Engel **F01-ENV-02**: Android JDK/SDK/adb ve fiziksel cihaz çalışma kanıtı eksik.
Gerçek cihaz performansı için “doğrulandı” ifadesi kullanılmadı. İskeletin kaynak
düzeni ile derlenmiş uygulama birbirinden ayrı raporlandı.

## Test ve doğrulama sonuçları

Komutların gerçek stdout/exit kodları [phase-01-validation.txt](phase-01-validation.txt)
içindedir. Ek kaynak sözdizimi ve dosya kontrolleri
[phase-01-source-validation.txt](phase-01-source-validation.txt) içindedir.

- **PASS:** npm test, 5 isimli Node unit senaryosu; Türkçe katalog, sıfır gerçek
  kayıt, durum metinleri ve temel metin kontrastı. Bu, TalkBack/gerçek UI testi değil.
- **PASS:** mevcut TS 6.0.3 aracıyla bağımsız i18n/tema/data strict kontrolü ve
  yanlış/eksik çeviri anahtarı negatif tip testleri. Router/UI import ve native/web
  tip çözümlemesi bu sınırlı kontrolün kapsamı değil.
- **PASS:** mevcut Prettier 3.9.9 aracıyla kaynak/README/config biçimi. Projeye
  kurulmuş formatter olduğu iddia edilmedi; eski faz dokümanları otomatik formatlanmadı.
- **BLOCKED:** tam lint, tam typecheck, Expo config/export, web sunucusu ve
  Playwright smoke. Komutlar eksik executable veya kurulmamış paket nedeniyle çalışmıyor.
- **NOT RUN:** Android prebuild/Gradle/APK/cihaz, Node 24 CI ve GitHub Actions.
- **BLOCKED:** hedef bağımlılık kurulu boyutu/transitif lisans ve web/native bundle
  ölçümü. [Bağımlılık raporu](dependency-report.json) null ve 0/19 ile eksikliği gösterir.

Node testler bu ortamın alt süreç kısıtlarından etkilenmemek için aynı süreçte
çalıştırıldı. Tip ve biçim araç kopyaları yalnız geçici `/tmp` alanında kullanıldı;
ürün bağımlılıklarının yerine konmadı. Paket kurulum komutunun npm cache logu
registry `@expo/metro-runtime` isteğinde EAI_AGAIN gösterdi. Ağ/SDK engellerini
testleri atlayıp yeşil raporlama yoluyla kapatma yapılmadı.

## Değişen dosyalar

Tam liste: [phase-01-files.txt](phase-01-files.txt). Ana gruplar:

- Kökte package.json, app.json, native/web tsconfig, expo-env, ESLint/Prettier,
  npm/Node/editor/Git ignore ayarları, env.example, README, LICENSE ve üçüncü taraf kaydı.
- src/app: _layout, +html, index, about, +not-found.
- src/ui, theme ve i18n: küçük bileşenler, tokenlar ve Türkçe katalog.
- src/map, map-contract, data, domain ve scripts/etl: platform girişleri ve boş sınırlar.
- tests/unit, tests/types, tests/web; Playwright config ve .github/workflows/checks.yml.
- scripts/check-environment.mjs ve dependency-report.mjs.
- docs/setup.md, ADR-0004, bu rapor/loglar; progress, architecture, roadmap, risks ve lisans sicili güncellemeleri.

AGENTS.md değiştirilmedi. Fiziksel/siyasi geometri, tarihî kayıt, görsel, font,
tile veya API anahtarı eklenmedi. Projenin kendi kod/belgeleri MIT; dış kaynak ve
paket hakları ayrı. [Üçüncü taraf kayıtları](../../THIRD_PARTY_NOTICES.md).

## Faz 01'i kapatmak için kalan işler

Registry erişimli ortamda resmi hedef sürümleri/peer uyumunu kontrol et, gerçek
lock üret ve npm ci'ı çalıştır. Bütün doğrudan/transitif lisans/NOTICE ve gerekli
paket/bundle boyutlarını kayıt altına al. Tam lint/typecheck/test/format, Expo config,
web/Android export ve web smoke'u tamamla; çıkan derleme/tip hatalarını aynı fazda düzelt.

Ardından uygun JDK/SDK/adb ile native debug APK derle ve fiziksel cihaz açılışını
raporla. Kaynak hazır olması bu kalan işleri kaldırmaz. **Bu adımlar Faz 01'in
devamıdır; Faz 02'ye otomatik geçiş yapılmayacak.**
