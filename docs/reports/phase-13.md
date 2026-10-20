# Faz 13 — Arama, kamera odaklama, yer imleri ve paylaşım

2026-10-16 · **CODE / LOCAL PERSISTENCE TESTS / AUTOMATED CHECKS / JS EXPORT PASS**.
Gerçek tarayıcı kabulü **BLOCKED**; Android **UNVERIFIED ON DEVICE**.

AGENTS.md, README, docs/progress.md ve Faz 12 çıktıları; mevcut arama, timeline,
renderer/bridge, domain/katalog ve kaynak kartları incelendi. Koddan önce
[ADR-0014](../adr/0014-discovery-saved-views.md) yazıldı: ortak yerel indeks → açık
tarih/odak seçimi → kalıcı yer imleri → strict paylaşım/native ingress → test ve
rapor. Kullanıcının Faz 13 promptu yol haritasının önceki öneri başlığının yerine
geçer. Yalnız bu faz uygulandı; Faz 14 başlamadı.

## Tamamlanan işler ve kabul matrisi

| İstek / kabul | Sonuç |
| --- | --- |
| 1. Ortak indeks | PASS — canonical id, beş grup/tür, Türkçe tercihli ve özgün ad/dil, alternatifler, TemporalExtent, QID, kaynak geometri ID/bbox ve normalleştirilmiş terimler |
| 2. Türkçe/aksan/eş adlı kayıtlar | PASS — İ/I/ı,Ş/ş,Ğ/ğ ve combining aksan normalleştirmesi; özgün ad korunur, uydurma çeviri/yazım yok. Aynı ad farklı ID/dönemlerle ayrıdır |
| 3. Debounce/iptal/gizlilik | PASS —220ms,120 karakter, sayfa8/1000 kayıt bütçesi; timer+AbortSignal ve stale başarı/hata engeli. Arama metni ağ, analytics, sunucu veya URL'ye gönderilmez |
| 4. Beş bölüm ve kapsam | PASS — devlet/kültür/kişi/savaş/olay ikonlu gruplar, kaynak dönem ve coğrafya uyarısı; konumsuz/tarihsiz kayıt aranabilir, marker uydurulmaz |
| 5. Kullanıcı seçimiyle yıl | PASS — sonuç seçimi state'i değiştirmez; Seçili yılda kal / İlgili tarihe git. Yaklaşık kişi kaydını açan tercih açık etiketli; kamera ayrıca seçilir |
| 6. Kamera | PASS — Point, polygon fitBounds, antimeridyen parçalarının170..190 sunum bbox'ı, büyük/polar alan için genel görünüm; kaynak geometri değiştirilmez. Renderer current revision/visible source gerektirir; reduced motion destekli |
| 7. Yer imleri | CORE / HOST PERSISTENCE PASS — yıl, varlık, kamera;50 kayıt/64KiB/version1; web localStorage, Android uygulama özel document dosyası. Kaybolan kimlik güvenli önizleme; eski/bozuk depo sessiz silinmez. Gerçek cihaz yeniden açma **UNVERIFIED ON DEVICE** |
| 8. Web URL paylaşımı | PASS — yalnız year/entityId/lat/lon/zoom, raw duplicate/unknown/bozuk/kısmi değer reddi. Seçilebilir adres ve destekli tarayıcıda Web Share. Incoming görünüm önce incele/uygula |
| 9. Android paylaşım/deep link | CODE / CONFIG PASS — RN0.86 text Share, mevcut tarihatlasi custom scheme, root strict native-intent. Expo introspect VIEW/DEFAULT/BROWSABLE/singleTask filtresi ve permission removals gösterdi; Gradle/release build ve OS cold/warm kabulü **BLOCKED** |
| 10. Klavye/geri/boş/offline/eksik katalog | Unit/controller/engine hata ve stale/unmount PASS; browser senaryoları eklendi. Gerçek klavye/back/odak/TalkBack/rotasyon **BLOCKED / UNVERIFIED ON DEVICE** |
| Bir kayıt ismiyle bulunup tarih/konumuna ulaşılır | Veri→arama→destination→timeline geometri ve renderer double PASS; gerçek Hastings/Gogh/Alaska/Vestfalya sorguları doğrulandı. Gerçek browser tıklama kabulü **BLOCKED** |
| İlgili yıla geçiş bilinçli tercih | CODE / UNIT-DATA PASS;6 yeni browser akışının etkileşim kabulü ortamda başlayamadı |
| Yeniden açılışta yer imi korunur | Aynı adaptörle host disk ve web-storage repository yeniden açma PASS; gerçek browser reload/Android reopen kabulü **BLOCKED / UNVERIFIED ON DEVICE** |

[Geliştirici/kullanım, depolama, URL ve SDK rehberi](../discovery.md).

## Gerçek veri ve kaynak sınırları

Üretim ortak indeksi **8 canonical sonuç**:3 siyasi kimlik,1 kişi,2 savaş/muharebe,
2 olay/antlaşma. Kişi ve olay yardımcı entity'leri ikinci arama sonucu yapılmaz.
Gerçek kültür alanı0; kültür/çakışma/yoğunluk/eş ad fixture'ları açık etiketli
sentetik testtir, ürün kataloğuna alınmadı.

- Hastings2026'da aramadan bulunur; mevcut yılda nokta yok; açık seçimle1066'ya
  geçince kaynaklı yaklaşık referans noktası adaydır.1067'ye sınır/olay taşınmaz.
- Gogh1885'te yaşıyor olabilir, bu konum kanıtı sayılmaz; ilgili kaynak ilişkisi
  için1880 önerilir. Yaklaşık konumları açma tercihi kullanıcıya söylenir.
- Vestfalya1648 kaynaklı tarihli ama geometrisizdir; arama/kart/yıl geçişi vardır,
  uydurma Münster/şehir merkezi yoktur. Tarihsiz sentetik olayda ilgili yıl yok.
- Alaska araması kaynak sınır kesitini ilgili siyasi kimliğe bağlar; bu kesit
  kapalı ülke poligonu, tüm egemenlik alanı veya modern sınırın yerine geçmez.

Tarihî katalog **0.4.0-pilot/schema2 /19 kayıt /7 SourceRecord**, sitelink
kataloğu1.0.0/2 QID/4 link olarak korunur. Tarihî katalog SHA:
`bf31bb3298029baa45da87bcc875368e183f56bbe6c59fb2f8b4fe8d0031a6e0`.
Yeni olay tarihi, kişi konumu, sınır, makale veya görsel indirilmedi. Kamera bbox
ve paylaşılan koordinatlar yalnız görünüm; kaynak hassasiyetini yükseltmez.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION**, OHM nesne/üye lisans şartı,
medya hakları kapısı ve bağımsız kaynak/takvim eksikleri sürer.

## Bağımlılık, lisans ve Android yapılandırması

Expo57.0.29/RN0.86.3/Router57.0.28 korunur. Önceden transitif kurulu
**expo-file-system57.0.7**, Expo57 bundledNativeModules `~57.0.7` ve
[resmî SDK57 legacy dokümanıyla](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem-legacy/)
karşılaştırılıp doğrudan tam sürüme sabitlendi. Modern File tipi bu projenin
platform suffix çözümünde gerekli üyeleri sunmadı; mevcut sürümde belgeli
`expo-file-system/legacy` API'si seçildi. Gelecek SDK göçünde tekrar incelenmeli.
Latest dokümanı SDK58 önerdiği için onun sürüm/API'si buraya kopyalanmadı.

Kurulu paketin MIT tam metni [asset](../../assets/licenses/Expo-FileSystem-LICENSE.txt),
atıf ekranı ve [lisans sicilinde](../license-register.md); test bunları kurulu
lisansla karşılaştırır. Kurulu kendi dosyaları **7.822.856 byte**; toplam transitif,
APK artışı, gerçek download veya bellek ölçümü değildir. Yeni transitif paket
sürümü eklenmedi/indirilmedi. Doğrudan paket envanteri24/24 tam sürüm.

İlk offline metadata alımı **ENOTCACHED**: [ilk log](phase-13-dependency-install.txt).
Var olan lock'taki57.0.7 resolved/integrity kaydı ve kurulu paket doğrulanarak
root dependency güncellendi. [Offline lock doğrulaması](phase-13-lock-validation.txt)
ve [npm ci dry-run](phase-13-install-dry-run.txt) PASS. Gerçek temiz npm ci veya
online audit çalıştırıldığı söylenmez. Offline "0 vulnerabilities" yeni güvenlik
kanıtı değildir; önceki audit riskleri kapanmadı.

Yer imi Android uygulama özel dosyasındadır. Geniş READ/WRITE_EXTERNAL_STORAGE
izinleri app.json blockedPermissions'a eklendi, allowBackup false ayarlandı.
Expo introspect manifest **tarihatlasi VIEW + DEFAULT + BROWSABLE**, singleTask,
permission remove ve allowBackup=false gösterir. Bu uygulama manifest mod
çıktısıdır; Gradle merged manifest/APK üzerinde çalışmış cihaz kanıtı değildir.
[JSON](phase-13-introspect.json), [CLI log](phase-13-introspect-errors.txt).

[Expo linking](https://docs.expo.dev/linking/into-your-app/),
[native-intent](https://docs.expo.dev/router/advanced/native-intent/),
[RN0.86 Share](https://reactnative.dev/docs/0.86/share) ve
[Android deep link](https://developer.android.com/training/app-links/create-deeplinks)
resmî kaynakları kontrol edildi. Android paylaşımı URL'yi message içinde taşır;
ek runtime izin istemez. Custom scheme doğrulanmış HTTPS App Link değildir;
üretim domain/assetlinks/sertifika olmadığı için autoVerify iddiası yoktur.

## Değişen dosyalar

- `src/discovery`: yerel indeks/iptal, kamera planı, SavedView/URL/ingress,
  serialized bookmark repository, file/web storage, web/native sharing/incoming,
  MIT bildirim modülü.
- `src/atlas`: ortak arama/sonuç tarih kartı, yer imleri, paylaşım ve görünüm
  önizlemesi; AtlasScreen entegrasyonu, Türkçe metinler ve atıf paneli.
- `src/map-contract`, `useGlobeHost` ve renderer: optional strict atomik kamera,
  üstte tutulan son kamera, kültür/polygon fitBounds ve revizyon koruması.
- `src/app/+native-intent.tsx`, app.json permission/backup ayarları;
  package.json/lock, FileSystem tam MIT metni; pilot search binding.
- 24 yeni discovery unit +2 renderer regresyonu;6 browser akışı ve eski arama
  beklentileri; README/ADR/mimari/UI/kapsam/kalite/hak/risk/progress ve faz raporu.

[Tam dosya listesi](phase-13-files.txt). Bu ortamda Git deposu metadata'sı
okunamadı; liste bu fazda yazılan yollardan tutulur. Commit/push/yayın yapılmadı.

## Doğrulama sonuçları

| Kontrol | Sonuç / kanıt |
| --- | --- |
| `npm run check` | **PASS** — lint0 uyarı, strict native+web TS, **197/197 ana**, **4/4 worker**, fiziksel/pilot/sitelink hak/hash ve formatter. [Log](phase-13-validation.txt) |
| Son belge düzenlemesi sonrası formatter | **PASS** — [log](phase-13-final-format.txt) |
| `npm run web:export` | **PASS** —4 statik rota, web entry yaklaşık2.3MB+MapLibre1.1MB. Uncompressed build raporu; GPU/runtime testi değil. [Log](phase-13-web-export.txt) |
| `npm run android:bundle` | **PASS** — Hermes entry yaklaşık3.2MB + ortak DOM JS/asset exportu. APK/AAB/Gradle veya cihaz açılışı değil. [Log](phase-13-android-export.txt) |
| `npm run config:check` / `expo config --type introspect` | **PASS** — config/manifest mod çıktısı, yukarıdaki sınırlarla. [Config](phase-13-config.txt), [introspect](phase-13-introspect.json) |
| `npm run test:web -- --list` | **PASS / DISCOVERY ONLY** —62 senaryo /9 dosya, desktop+narrow. [Liste](phase-13-browser-list.txt) |
| discovery Playwright desktop,25s/1 worker | **BLOCKED** — localhost8081 `connect EPERM`, exit124; senaryolar başlayamadı. [Log](phase-13-browser.txt) |
| `npm run dependencies:report` | **PASS** —24/24 kurulu tam sürüm. [Log](phase-13-dependencies.txt), [envanter](dependency-report.json) |
| `npm run environment:check` | **BLOCKED** — Node26.11.1/npm12.2.0/lock var; java/adb/Android SDK yok. [Log](phase-13-environment.txt) |
| Offline lock / install dry-run | **PASS**, temiz install/online audit değil; yukarıdaki iki log |
| Fiziksel Android reopen/storage/deep link/geri/TalkBack/GPU | Çalıştırılmadı — **UNVERIFIED ON DEVICE** |
| Temiz GitHub CI/Node24, online audit, görsel baseline | Çalıştırılmadı / açık; yerel kalite çıktısı bu kapıları kapatmaz |

197 ana = önceki171 +24 discovery +2 renderer. Kalıcılık testi gerçek host
dosyası üzerinde aynı temp-write/rename adaptörüyle farklı repository açar;
Android native modülü yerine host IO adaptörü enjekte edilir. Web storage
adaptörü yeniden açma, izin/kota ve kayıt bozulması testlidir.50 kayıt sınırı,
seri paralel save, write/rename hatasında önceki veri, caller mutation,
geçersiz sürüm/kimlik/tarih/kamera/URL ve çok büyük payload testleri vardır.
Browser reload ve gerçek OS davranışı bu testlerden genellenmez.

## Manuel kabul ve sonraki faz önkoşulları

1. `npm ci` → `npm run check` → `npm run web`. **Hastings** ara; Enter ile sonucu
   açınca yıl değişmemeli. **İlgili tarihe git (MS1066)**, ardından kaynak odağı;
   kamera noktaya yaklaşmalı. **Arama sonuçlarına dön** sorguyu korumalı.
   İ/ı/Ş/ş ve aksan, boş/çok hızlı sorgu, Escape/geri/klavye odağı denenmeli.
2. **Gogh**1885'te konum göstermemeli;1880'e yaklaşık tercih bildirimiyle gidilmeli.
   **Vestfalya**1648'e götürür ama nokta üretmez; **Alaska** yalnız kaynak kesitidir.
   Katman kapalıyken açık odak ilgili katmanı açmalı; normal yıl değişimi kamera
   korumalı. Antimeridyen ve çok büyük polygon gerçek lisanslı pilotla ölçülmeli.
3. Yıl/varlık/kamera yer imi kaydet; uygulamayı tamamen kapat/aç veya web reload.
   Liste korunmalı, açmak önce önizlemeli; açık uygulamada kaydedilmiş kamera
   geri yüklenmeli. Kayıp kimlik ve bozuk depo güvenli mesaj vermeli; yanlış
   varlığa bağlanmamalı. Android permissions ve private file/reinstall sınırını doğrula.
4. Web URL'de yalnız whitelist alanları;0/NaN/future year/duplicate/extra param
   reddi. Link açmak yılı sessizce değiştirmemeli; incele/uygula gerekir. Android
   development/release build'de aşağıdaki cold ve warm komutlarını deneyin:

   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d 'tarihatlasi:///?year=1066&entityId=atlas%3Ahastings-1066&lat=50.911944&lon=0.4875&zoom=3' org.tarihatlasi.app
   adb shell am start -W -a android.intent.action.VIEW -d 'tarihatlasi:///?year=0&redirect=https%3A%2F%2Fexample.invalid' org.tarihatlasi.app
   ```

5. Gerçek Web Share/native Share, iptal/dış uygulamadan dönüş, kamera/yıl,
   Android donanım geri/TalkBack/rotation ve offline yerel arama/yer imi denenmeli.
   Custom scheme'in başka cihazda uygulama gerektirdiği, HTTPS App Link olmadığı
   korunmalı; üretim host/assetlinks/sertifika olmadan link sahipliği onayı yok.
6. Önceki Faz02 gerçek cihaz, full polity/culture polygon, A-04 görsel baseline,
   bağımsız tarih/konum kaynağı, raw bridge/origin/CSP, tam transitif NOTICE,
   güncel online audit ve temiz CI kapıları açık. Web çoklu sekmede son yazma
   kazanır; Android rename/fsync/OS taşıma fiziksel ölçüm ister. Sessiz oturum
   process-death restorasyonu eklenmedi; kayıtlı görünüm bilinçli uygulanır.

Kod ve otomatik doğrulama teslimi hazır; gerçek platform kabulü açıkça
**BLOCKED**. Kullanıcı onayı olmadan Faz14'e geçilmez.
