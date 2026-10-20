# Faz 12 — Wikidata / Wikipedia ve doğrulanabilir kaynak kartları

2026-10-16 · **CODE / SMALL REVIEWED LINK CATALOG / AUTOMATED CHECKS / JS EXPORT PASS**.
Gerçek browser kabulü **BLOCKED**; fiziksel Android **UNVERIFIED ON DEVICE**.

AGENTS.md, README, progress ve önceki Faz 11 çıktıları/model/kart/ETL/bridge
incelendi. Koddan önce [ADR-0013](../adr/0013-source-cards.md) planı yazıldı:
QID/reviewed link kataloğu → ortak güvenli dış bağlantı → kaynak/belirsizlik
kartları → sınırlı ETL/cache, negatif testler ve rapor. Yalnız Faz 12 uygulandı;
Faz 13 başlatılmadı. Yeni dış npm bağımlılığı yok.

## Tamamlanan işler ve kabul matrisi

| İstek / kabul | Sonuç |
| --- | --- |
| 1. TR → EN → Wikidata | PASS — QID tabanlı versioned snapshot, sıradan bağımsız Türkçe önceliği; kontrollü EN/eksik dil/incelemesiz QID/kimlik yokluğu ayrı durumlar |
| 2. Başlık URL'si tahmini yok | PASS — yalnız resmî Wikidata sitelink bölümünde incelenen explicit site/title/hedefler. Slug üretimi yok. Yalnız doğrulanmış QID için Wikidata record URL'si kurulabilir |
| 3. Ortak kart alanları | PASS — kişi, siyasi bölge, kültür, olay ve eski pilot kartında SourceActions; Kaynakları gör ve Veri belirsizliği; uygun kayıtta Wikipedia’da aç |
| 4. Güvenli harici açma ve dönüş | CODE / UNIT PASS — web noopener+noreferrer, native HTTPS Linking; harita köprüsünde URL komutu yok. Kaynak ekranı mevcut sheet içinde, store/route değiştirmez. Gerçek browser/Android dönüşte kamera/yıl kabulü **BLOCKED / UNVERIFIED ON DEVICE** |
| 5. Açıklama metinleri | PASS — mevcut lisanslı olgu pilotlarının kısa proje açıklamaları korundu; yeni makale metni alınmadı. Dil fallback metni makine çevirisi iddiası taşımaz |
| 6. Commons görsel hakları | PASS — görsel kullanılmıyor; mevcut PERSON_MEDIA_RIGHTS üretim reddi ve regresyonları korunur. Sanatçı/kaynak/lisans/değişiklik/atıf incelemesi olmadan bu kapı açılmaz |
| 7. Hata/timeout/429/kimlik değişimi | PASS — uygulama offline snapshot/fallback; UI'da ham hata yok. ETL bounded timeout/retry/Retry-After/maxlag, eksik/değişmiş QID ve geçersiz URL reddi. Ağ hatası üretim snapshot'ını değiştirmez |
| 8. Doğrudan kaynak | PASS — Evidence locator/claim kapsamı → SourceRecord revision → RawInput SHA ve transformation izlenebilirliği; eşleşmezse kaynak URL'si gizlenir. Kimlik maddesi tarih/konum kanıtı yerine geçirilmez |
| 9. Cache ve kullanım şartları | PASS —128 girişlik sürümlü immutable LRU; developer GET collect en çok5 QID/tek concurrency/en az1s aralık/24saat receipt-bound cache/3 deneme/256KiB/15s. WDQS veya harita hareketi başına HTTP yok |
| 10. URL/domain/WebView politikası | PASS — HTTPS, exact host, protokol/credential/port/control/traversal reddi; kaynak domainleri ayrı allowlist. Native WebView dış hedeflere yönlenemez; mevcut navigation testleri korunur |
| 11. Ayrı atıflar | PASS — Natural Earth, OHM (kullanılmıyor), Wikidata, Wikipedia (yalnız link), Commons (görsel yok), yerel style/MapLibre ve tile sağlayıcısı yokluğu ayrı. NARA/font/worker bildirimleri korunur |
| Türkçe mevcutsa Türkçe açma | REAL REVIEWED LINKS + UNIT PASS — Van Gogh ve Hastings TR hedefi; gerçek browser tıklama kabulü ortam nedeniyle **BLOCKED** |
| Eksik bağlantıda dürüst durum | PASS — bilinmeyen QID sitelinki için "doğrulanmadı"; doğrulanmış boş TR/EN için ayrı yokluk; QID null iken tahmini URL veya uydurma QID yok |

[Geliştirici/kullanım, kaynaklar, cache ve güvenlik rehberi](../sources.md).

## Kaynak ve lisans kapsamı

Yeni **sitelink kataloğu1.0.0**: **2 QID / 4 explicit link**, her kayıtta TR ve EN.
Q5582 rev2556738621 (Van Gogh), Q83224 rev2517858800 (Hastings). Resmî Wikidata
sayfasının Wikipedia sitelink hedefleri tarayıcı araştırmasıyla doğrudan
incelendi ve tıklandı; metinden URL tahmin edilmedi. Tarihî modeldeki `wikipedia`
alanları değiştirilmedi; yeni ortak UI ayrı sürümlü kimlik kataloğunu kullanır.

Terminal raw API erişimi curl exit6 DNS nedeniyle engelli. Bu yüzden küçük ham
dosya `editorial-sitelink-extraction-not-http-response` olarak etiketlendi;
özgün API/HTTP/GUID veya gerçek zamanlı en son revizyon olduğu söylenmez.
ADR-0013 bu doğrudan resmî sayfa incelemesi yolunu açıkça tanımlar. Önceki
kayıt içi VerifiedSitelink için raw JSON eşleşme kapısı kaldırılmadı.
Üretim link kapısı reviewed dosyanın sabit hash'i, katı şema, kaynak revizyonu,
site/title/URL ve generated/NOTICE birebir eşleşmesidir. Yeni adaylar kendiliğinden
yayımlanmaz. [Raw çıkarım](../../data/sitelinks/reviewed.json),
[NOTICE](../../assets/licenses/Wikidata-sitelink-NOTICE.txt).

Wikidata yapılandırılmış olgu hakları [resmî lisans metninden](https://www.wikidata.org/wiki/Wikidata:Licensing)
doğrulandı; Wikipedia makaleleri ve Commons görselleri bu izne katılmadı.
API parametreleri [resmî wbgetentities yardımından](https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities),
istek politikası [veri erişimi](https://www.wikidata.org/wiki/Wikidata:Data_access)
ve [User-Agent koşullarından](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy)
kontrol edildi. Gerçek iletişim bilgisi olmadan geliştirici toplayıcısı başlamaz;
bu ortamda canlı collect başarılı diye sunulmaz. Uygulama için API anahtarı,
hesap veya runtime API gerekmiyor. Historical Basemaps **BLOCKED FOR REDISTRIBUTION**.

| Dosya / paket | Boyut / checksum |
| --- | --- |
| `data/sitelinks/reviewed.json` |1.599 byte; SHA-256 `ef29aaba13501b53e45ddf7fd2eddbf3c05d5b87fb6f0031ad8a6f2caf5c9cd7` |
| generated link modülü / NOTICE |2.658 /690 byte; check birebir denetler |
| Tarihî katalog0.4.0-pilot/schema2 |19 kayıt /7 SourceRecord; SHA `bf31bb3298029baa45da87bcc875368e183f56bbe6c59fb2f8b4fe8d0031a6e0` korundu |

Yeni tarih/geometri/büyük veri indirilmedi. Mevcut1 sınır kesiti,1 kişi ilişkisi,
4 olay/1 yaklaşık olay noktası ve doğal fiziksel taban değişmedi. Gerçek siyasi
ve kültürel tam polygon eksikliği sürer. Link sayısı tarihî yıl kapsamı değildir.
Üç başka olay QID'sinde incelemesiz dil fallback; siyasi QID'ler boş ve kültür
üretim pilotu0. EN/no-language dalları yalnız açık sentetik test verisiyle
doğrulanır; ürünün gerçek verisi gibi sunulmaz.

## Kaynak doğruluğuyla ilgili A-03 düzeltmesi

Önceki denetimdeki A-03, bölgesel ilişkinin ve kaynağının yanlış bölge kartına
geçmesine neden oluyordu. Dolu `territoryIds` artık yalnız seçili bölgeyi
içeriyorsa alınır; genel entity ilişkisi liste boşken korunur. Sentetik A/B
bölgeleri ve yalnız B'ye ait bağımsız kaynakla karşı örnek, düzeltmeden önce
**1 !==0 FAIL**, sonra **PASS**. Genel ilişki her iki kartta doğru kalır.
[Önce](phase-12-a03-before.txt), [sonra](phase-12-a03-after.txt).
Bu, yeni özellik değil kaynak kartının doğru kapsamı için mevcut akış düzeltmesidir.

## Değişen dosyalar

- `src/sources`: katı snapshot/URL politikası, bounded resolver/cache, exact
  evidence repository'si ve web/native dış bağlantı adaptörleri.
- `src/atlas`: SourceActions/SourceDetails/UncertaintyDetails, beş mevcut kartın
  entegrasyonu ve ayrı kaynak atıfları; Türkçe katalog ve pilot source repository.
- `scripts/sitelinks.mjs`, bounded ETL/CLI, reviewed raw/generated/NOTICE,
  package scripts ve CI hash kapısı; staging gitignore. Yeni bağımlılık yok.
- Siyasi repository A-03 kapsam düzeltmesi;18 yeni kaynak unit testi +1 siyasi
  regresyon,3 yeni browser senaryosu ve önceki kişi testinin yeni TR bağlantısına
  uyarlanması. README/ADR/mimari/model/kapsam/kalite/hak/risk/progress belgeleri.

[Tam dosya listesi](phase-12-files.txt). Bu ortamda dizin Git deposu olarak
okunamadığından liste iş kapsamında yazılan dosyalardan tutuldu; commit/push yok.

## Doğrulama sonuçları

| Kontrol | Sonuç / sınır |
| --- | --- |
| `npm run check` | **PASS** — lint0 uyarı, strict native+web TS, **171/171 ana test**, **4/4 worker**, globe/pilot/sitelink hash/rights ve formatter. [Log](phase-12-validation.txt) |
| Son belge/env düzenlemesi sonrası formatter | **PASS** — [son kontrol](phase-12-final-format.txt) |
| `npm run web:export` | **PASS** —4 statik rota; gerçek runtime/GPU kabulü değildir. [Log](phase-12-web-export.txt) |
| `npm run android:bundle` | **PASS** — Hermes ve ortak DOM JS exportu; APK/AAB/Gradle veya cihaz açılışı değildir. [Log](phase-12-android-export.txt) |
| `npm run test:web -- --list` | **PASS / DISCOVERY ONLY** —50 senaryo /8 dosya, desktop+narrow. [Liste](phase-12-browser-list.txt) |
| Yeni source Playwright, desktop/tek worker/25s | **BLOCKED** — localhost8081 `connect EPERM`, exit124; testler başlayamadı. [Log](phase-12-browser.txt) |
| `npm run environment:check` | **BLOCKED** — Node26.11.1/npm12.2.0/lock var; java/adb/Android SDK yok. [Log](phase-12-environment.txt) |
| `npm run dependencies:report` | **PASS** —23/23 tam sürüm; yeni paket yok. [Log](phase-12-dependencies.txt) |
| Özgün küçük Wikidata isteği | **BLOCKED** — curl DNS exit6. Resmî sayfa/sitelink araştırması web aracıyla ayrı yapıldı. [Log](phase-12-source-fetch.txt) |
| Gerçek Android / dış tarayıcıdan dönüş / TalkBack / GPU | Çalıştırılmadı — **UNVERIFIED ON DEVICE** |
| Temiz GitHub CI/Node24, güncel audit, screenshot baseline | Çalıştırılmadı / açık; mevcut yerel kalite koşusu bunların yerine geçmez |

171 test = önceki152 +18 kaynak testi +1 A-03 regresyon. Enjeksiyonlu fetch/opener
testleri gerçek OS tarayıcısı veya ağ denemesi değildir. App cache testi snapshot
immutable/LRU/sürüm ayrımını; ETL testi contact UA, raw SHA/revision/cache kimliği,
TTL, timeout,429/maxlag/Retry-After, boyut ve QID değişimi reddini kanıtlar.
Medya hakları ve eski ham sitelink eşleşme reddi önceki regresyonlarla korunur.

## Manuel kabul, riskler ve sonraki faz önkoşulları

1. `npm run web` → Gogh ara → kişi kartı → **Wikipedia’da aç (TR)**: doğru
   Türkçe madde ayrı sekmede açılmalı. **Kaynakları gör**: P551/kimlik/yaşam
   kanıtları ve lisans/revizyon/SHA ayrı okunmalı. **Veri belirsizliği** kaynak
   hassasiyeti ve bağlı müze araştırması eksikliğini korumalı.
2. 1066 Hastings kartı → TR bağlantı;1648 Vestfalya → doğrulanmamış dil açıklaması
   ve Q150995 Wikidata fallback. NARA siyasi kayıtta QID yokluğu; isimden link yok.
   Yıl/panel açma/kapama Wikimedia API isteği üretmemeli. Çevrimdışıyken yerel
   ayrıntı okunmalı; dış sayfanın internet gerektirdiği açıklanmalı.
3. Android'de önce yılı/kamerayı değiştirip dış bağlantıya gidin; geri dönüşte
   yıl/kamera/panel, oynatmanın durması, odak/TalkBack, rotasyon ve arka plana
   alma test edilmeli. HTTPS işleyicisini OS seçer. İşlem ölümü için kalıcı
   oturum geri yükleme eklenmedi; böyle bir koruma iddiası yoktur.
4. Native/WebView origin/raw taşıma/CSP, A-04 görsel baseline, tam polygon
   pilotları, bağımsız kaynak/takvim incelemesi, gerçek CI ve transitif lisans/
   güncel audit kapıları korunur. Dış tarayıcı sonraki redirect'leri kontrol
   edilmez; web popup engeli noopener null dönüşünden güvenle saptanamaz.
5. Yeni link/source/media yayınlamadan resmî kayıt/kimlik/revizyon/hak incelemesi,
   yeni sürüm/hash/NOTICE ve regresyonlar gerekir. Yeni kaynağın domain'i ayrıca
   gözden geçirilir. Bu fazda sıradaki faza geçiş veya yayın yapılmadı.

Kod ve otomatik doğrulama teslim edildi; karşılanamayan gerçek platform kabulü
açıkça **BLOCKED**. Kullanıcı onayı olmadan Faz 13'e geçilmez.
