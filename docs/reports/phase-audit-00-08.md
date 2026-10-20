# Faz 00–08 kabul ve kod denetimi

2026-10-16 · Kullanıcının “tüm fazları gözden geçir” isteğiyle yapıldı.
Yeni faz değildir. Faz 09–17 başlatılmadı. Bu tur ürün kodu, bağımlılık, veri,
hak onayı veya test beklentileri değiştirilmedi; rapor ve progress güncellendi.

**Sonuç: eksikler var.** Kurulu ortamda kalite ve JS export geçiyor; bu, bütün
fazların kabul edildiği anlamına gelmiyor. Dört somut kod/CI açığı aşağıda;
ayrıca önceki gerçek polygon, cihaz, tarayıcı, güvenlik ve dağıtım kapıları açık.
Mevcut 1867 pilotunun verisi bu denetimde hatalı bulunmadı. Yeni veriyle ortaya
çıkabilecek tutarsızlıklar yalnız açık etiketli sentetik karşı örneklerle üretildi.

## Yeni bulgular — öncelik sırasıyla

### A-01 · Yüksek — varlık dönemiyle çelişen sınır üretimden geçebiliyor

İlgili fazlar: **04 / 06 / 08**.
`src/domain/validate.ts:289` territory'nin siyasi entity referansının türünü
kontrol ediyor; entity'nin belgelenmiş dönemleriyle tarih çelişkisini kontrol
etmiyor. `src/timeline/engine.ts:311` kendi tarihini sağlayan territory'yi döndürüyor;
`src/politics/repository.ts:78` onu destekli sayıyor.

Sentetik tekrar: POLITY kimliği MÖ 2–MÖ 1, ona bağlı continuous territory
MÖ 2–MS 2 olsun. Her iki kayıt/source verified olarak yalnız testte simüle edildi.
`validateCatalog(catalog, 'production').ok === true`; MS 1 sorgusunda ilgili
entity sayısı **0**, territory sayısı **1**; kart repository sonucu
`supported: true, classes: []`. Bu, varlık başlangıç/bitişinin bağlı coğrafyayla
tutarlı olması koşulundaki boşluğu gösterir. [Gerçek çıktı](phase-audit-00-08-repro.txt).

Kapanış: bilinen entity tarihleri/dönem boşluklarıyla çelişen TerritoryVersion
reddedilmeli; bilinmeyen üst tarihle çelişen bilinen üst tarih ayrı ele alınmalı.
Timeline/coverage/repository aynı kararı vermeli. Varlık bitişi, başlangıcı,
kesintili dönem boşluğu ve geçerli örtüşme için gerçek karşı örnek testleri eklenmeli.
Mevcut NARA kaydının entity/territory tarihleri eşleşiyor; bug bugün bu pilotta
yanlış sınır gösterildiği iddiası değildir. **OPEN — NOT FIXED**.

### A-02 · Yüksek — temiz CI unit işi bağımlılık kurmadan başlıyor

İlgili fazlar: **01 / 08**.
`.github/workflows/checks.yml:15–23` bağımsız unit işinde checkout/setup-node sonrası
doğrudan `node tests/run.mjs` çalıştırıyor. `tests/unit/politics.test.mjs` artık
`@maplibre/maplibre-gl-style-spec` import ediyor; bu paket temiz runner'da yok.
Diğer job'daki npm ci ayrı runner'ın diskini paylaşmaz.

Gerçek tekrar: src/scripts/tests/package.json/assets/data geçici bir `/tmp`
dizinine node_modules olmadan kopyalandı; aynı Node komutu **exit 1 /
ERR_MODULE_NOT_FOUND: @maplibre/maplibre-gl-style-spec** verdi.
[Stack](phase-audit-00-08-repro.txt). GitHub Actions kendisi bu ortamda çalıştırılmadı;
kanıt temiz yerel dizinde aynı job komutunun tekrarından gelir.

Kapanış: unit job'a kilitli npm kurulumu/gerçek gerekli hazırlık ekleme veya
kurulumlu job altında çalıştırma; temiz Node 24 CI koşusunu doğrulama. Yereldeki
node_modules ile npm test'in yeşil olması bu hatayı yakalamıyor. **OPEN — NOT FIXED**.

### A-03 · Orta — başka bölgeye özgü ilişki seçili bölgenin kartında görünüyor

İlgili faz: **08**.
`src/politics/repository.ts:79–85`, territoryIds dolu ve seçili ID'yi içermese de
from/to entity eşleşmesiyle ilişkiyi karta alıyor. Siyasi stil modeli ise dolu
territoryIds listesini bölgesel kapsam olarak kullanıyor. `PolityCard.tsx:113`
bu kapsamı ayrıca göstermeden ilişkiyi listeliyor; kart ve çizim yorumu ayrışıyor.

Bağımsız sentetik tekrar: aynı entity'nin A/B bölgeleri ve yalnız B'ye bağlı
shared-control ilişkisi; A kartının relations listesi B ilişkisinin ID'sini içeriyor.
Logdaki **A03 independent control** satırı bunu doğrular. İlk ortak denemede
önceki örnekten kalan entity tarih kısıtı ilişkiyi gizledi; bağımsız kontrol
iki varlığın da sorgu yılında destekli olduğu yeni fixture ile yapıldı.

Kapanış: bölgeye ait ve bütün entity'ye ait ilişkileri açık kapsamla ayırma;
territoryIds doluysa başka bölge ilişkisini seçili alanın ilişkisi gibi sunmama.
Eğer kartta tüm devlet ilişkileri isteniyorsa bölge adını/kapsamını açıkça yazma.
İki bölge, ortak yönetim, vasallık ve dispute için regresyon testi gerekir.
Gerçek pilot yalnız tek bölge/cession içeriyor. **OPEN — NOT FIXED**.

### A-04 · Orta — görsel testler için incelenmiş baseline yok

İlgili fazlar: **01 / 03**.
`tests/web/atlas.spec.ts:76` üç viewport'ta toHaveScreenshot kullanıyor;
desktop+narrow için beklenen altı PNG karşılaştırma dosyası depoda yok.
Playwright config baseline üretimini/incelemesini tamamlamıyor. Kurulu Playwright
matcher'ının `handleMissing` uygulaması da normal koşuda bunu başarılı bir
karşılaştırma saymıyor (`node_modules/playwright/lib/matchers/expect.js`).

Bu yüzden localhost/GPU engeli kalksa bile mevcut CI'nin görsel kabulü için
ek iş gerekiyor. Bu denetimde tarayıcıya ulaşılamadığı için screenshot adımının
gerçek koşusu yapılmadı; bulgu test tanımı + eksik dosyalar + kurulu matcher
kuralına dayanıyor. Kapanış: hedef ortamda görüntüleri üretme, insan incelemesi,
uygun baseline'ları sürümleme ve normal CI koşusunu geçirme. Karşılaştırmayı
atlamak/otomatik her koşuda onaylamak kabulü kapatmaz. **OPEN — NOT FIXED**.

## Önceden bilinen fakat kapanmamış kapılar

| Kapı | Gerçek durum | Kapatmak için gereken |
| --- | --- | --- |
| Faz 01/02 Android derleme ve gerçek globe | JS export PASS; Java/adb/SDK yok, APK/Gradle/cihaz denemesi yapılmadı. **UNVERIFIED ON DEVICE** | Fiziksel cihazda debug/release, gerçek 3D, touch/pinch, native köprü, context loss, dönme/geri, offline ve bellek/frame ölçümleri |
| Faz 03 responsive/erişilebilirlik | Bileşenler ve bazı saf testler var; gerçek yeni UI/screenshot/TalkBack/büyük metin/klavye kabulü açık | Küçük/yatay/geniş ekran, odak/modal, IME/safe-area ve ekran okuyucu matrisi |
| Faz 05/08 gerçek siyasi alan | Katalogda **6 teknik kayıt, 1 LineString, 0 siyasi polygon**; tek snapshot 1867-06-20. Kullanıcının eski çizgi/kart/yıl gidiş-dönüş testi var | Küçük gerçek alan verisini ham sürüm/hash/kanıt/lisans/belirsizlik incelemesi ve ETL ile almak; iki platformda çizip seçmek |
| Kaynak erişimi | Önceki OHM DNS ve Cliopatria dosya/API engelleri raporlu; bu tur yeniden büyük veri alımı yapılmadı | Ağ erişimli ortam ve kayıt incelemesi. Önceki 403 bu tur yeniden ölçülmüş uptime sonucu değildir |
| Faz 06/07 yeni timeline/preview runtime | Parser/yıl/store/iptal/ACK testleri yeşil; tarayıcı çalıştırması EPERM | Gerçek slider/oynatma/son seçim/kamera/preview kaynağı testi; Android touch/TalkBack |
| Güvenlik | Son başarılı saklı npm audit **29 paket kaydı (10 moderate,19 high)**; bu sayı güncel audit gibi sunulamaz. Bu tur tekrar **EAI_AGAIN/exit 1** | Uyumluluk korunarak bağımlılık yolu/yama incelemesi ve ağ erişimli fresh audit. Force fix yapılmadı |
| Yayın hakları/güvenlik | HB dağıtım engeli sürer. Fiziksel asset/NARA/worker bildirimleri kontrol ediliyor; bütün transitif release NOTICE/CSP/native-origin/raw Expo taşıma testleri tamamlanmadı | Dosya/paket bazında hak envanteri ve gerçek yayın/release testleri |

Kültür/kişi/savaş/olay verisinin sıfır olması, bu tur bütün sonraki fazların
uygulanacağı anlamına gelmez. Faz 09–17 henüz yetkilendirilip uygulanmadı.
Gerçek arama ve doğrulanmış Wikipedia sitelink akışı da henüz aktif değil;
mevcut boş arama açıklaması ve kaynak bağlantıları bunların tamamlandığı iddiasını
taşımıyor. Bunlar daha sonraki kullanıcı kapsamı/önkoşullarıyla ele alınmalı.

## Faz bazında durum

| Faz | Denetim sonucu |
| --- | --- |
| 00 — araştırma/lisans | İstenen belge seti ve kaynak/hak kararları var; belge kapsamı tamam. Güncel kurulum ve runtime başarısı yerine geçmez |
| 01 — altyapı | Lock, strict TS, tema/i18n/adaptör/kalite/export var; **A-02 CI eksiği** ve Android APK/cihaz kabulü açık |
| 02 — globe/Android kanıt | Ortak gerçek MapLibre globe ve kullanıcının web etkileşim kanıtı var; tam runtime, Android ve offline/performance kabulü açık |
| 03 — responsive UI | İstenen bileşenler var; **A-04 baseline** ve gerçek erişilebilirlik/yerleşim kabulü açık |
| 04 — domain/ETL | Üretim lisans/atıf/provenance/topoloji kapıları ve testler var; **A-01 tarih semantiği nedeniyle kusursuz/tam kapanmış sayılamaz** |
| 05 — veri/paketler | İzinli fiziksel taban ve dar gerçek sınır kesiti mevcut; veri derinliği düşük, gerçek tam alan yok, cihaz kapısı açık |
| 06 — zaman motoru | MÖ/MS, snapshot ve cache/iptal testleri geçiyor; **A-01 bağlı varlık/sınır tutarlılığı** ve runtime kabulü açık |
| 07 — çizelge/oynatma | Kod/saf etkileşim testleri var; gerçek web/Android etkileşim kabulü açık |
| 08 — siyasi katman | Model/kart/stil/etiket/seçim kodu var; **A-01/A-03**, gerçek polygon ve iki platform kabulü açık |
| 09–17 | Başlatılmadı; bu fazların uygulanmamış özellikleri mevcut fazlarda yapılmış gibi sayılmıyor |

## Bu tur çalıştırılan kontroller

| Kontrol | Sonuç / kanıt |
| --- | --- |
| `npm run check` | **PASS**: lint, native/web strict TS, **92 ana + 4 worker**, format, globe/pilot hash ve yeniden üretim. [Log](phase-audit-00-08-check.txt) |
| Temiz dizinde CI unit komutu | **FAIL / exit 1**, eksik harici import. [Karşı örnekler](phase-audit-00-08-repro.txt) |
| Üretim domain + timeline + political repository karşı örnekleri | A-01/A-03 eksikleri doğrulandı; yalnız sentetik fixture, üretime yazılmadı |
| `npm run config:check` | **PASS**. [Log](phase-audit-00-08-config.txt) |
| `node scripts/dependency-report.mjs /tmp/tarih-atlasi-audit-dependencies.json` | **PASS,23/23** doğrudan sürüm eşleşmesi; tam transitif hak/boyut kanıtı değil. [Rapor](phase-audit-00-08-dependencies.json) |
| `npm run web:export` / `npm run android:bundle` | **PASS / PASS**; JS export, cihaz/ekran kabulü değil. [Web](phase-audit-00-08-web-export.txt), [Android](phase-audit-00-08-android-export.txt) |
| `npm run test:web -- --list` | **30 senaryo / 4 dosya**, keşif. [Liste](phase-audit-00-08-browser-list.txt) |
| `DEBUG=pw:webserver timeout 25s npm run test:web -- tests/web/politics.spec.ts --project desktop` | **BLOCKED / exit 124**, connect EPERM 127.0.0.1:8081; test gövdesine ulaşılmadı. [Log](phase-audit-00-08-browser.txt) |
| `npm run environment:check` | **exit 1**, Java/adb ENOENT, Android SDK yok. [Log](phase-audit-00-08-environment.txt) |
| `timeout 20s npm audit --json --fetch-retries=0 --fetch-timeout=10000` | **BLOCKED / exit 1**, registry EAI_AGAIN; başarılı/güncel güvenlik taraması değil. [Yanıt](phase-audit-00-08-security.json), [stderr](phase-audit-00-08-security-stderr.txt) |

Kontroller Node 26.11.1/npm 12.2.0 ile; Node 24 ve gerçek GitHub Actions
çalıştırılmadı. Paket kurulumu ve geometri/hak onayları değiştirilmedi.

## Önerilen kapatma sırası

1. A-01 domain/zaman tutarlılığı ve A-02 temiz CI kurulumu; hedefli regresyonlar.
2. A-03 bölgesel ilişki kartı kapsamı; yeni veri gelmeden testleri kapatma.
3. Gerçek web senaryoları ve A-04 incelenmiş snapshot baseline'ları.
4. Android SDK/JDK/adb, debug/release APK ve fiziksel cihaz teknik kanıtı.
5. Küçük lisanslı gerçek siyasi polygon ve kaynak/ETL/tarih/seçim kabulü.
6. Güncel audit, transitif bildirim ve gerçek dağıtım politikası incelemesi.

Bu liste düzeltmelerin yapıldığı anlamına gelmez. Denetimde ürün koduna düzeltme
uygulanmadı; bulgular ve açık kabul durumu progress'e işlendi. Sonraki faz açılmadı.
