# Faz 07 — Tarih çizelgesi ve oynatma

2026-10-16 (Europe/Istanbul) · **SOURCE / INTERACTION TESTS PASS**.
Gerçek web/Android etkileşim kabulü **BLOCKED — ENVIRONMENT / DEVICE**.
Kullanıcının Faz 07 promptu eski yol haritasındaki siyasi veri başlığının yerine
geçer. Yalnız bu faz uygulandı; Faz 08 başlatılmadı. Önceki Android, erişilebilirlik
ve audit kapıları bu raporla kapanmaz. Ham araç logları UTC tarih/saat kullanabilir.

## Sonuç

Kürenin altındaki dekoratif çizgi gerçek yıl slider'ı, üç ölçek ve oynatmaya
çevrildi. Web yerleşik range, Android RN responder/adjustable kontrolü kullanır.
Tek store requestedYear / renderedSourceYear / coverageStatus'u ayırır; kaynak
tarihi ile istenen tarih bir tutulmaz. Yeni veri veya bağımlılık yoktur.
[Kullanım/state rehberi](../playback.md), [ADR-0008](../adr/0008-timeline-playback-state.md).

## Kabul kriterleri

| Kriter | Sonuç |
| --- | --- |
| MÖ/MS kullanışlı yıl seçimi | Kaynak uygulandı; parser/atlama/slider/klavye matematiği **PASS**. Gerçek pointer/touch/TalkBack yerleşimi **BLOCKED** |
| Destekli yıl uygun katmanlara yansır | Ortak frame/engine ve renderer ACK/iptal testleri **PASS**; gerçek yeni UI/WebView kabulü **BLOCKED** |
| Veri olmayan dönemde açık mesaj | Üç Faz 06 modu, loading/error ayrımı ve tek source bağlamı korunur; mağdur yılın sınırı doldurulmaz. Unit/derleme **PASS**, yeni gerçek UI senaryoları **BLOCKED** |

Bu faz “web + fiziksel Android tam doğrulandı” veya ölçülmüş performans iddiası
ile kapatılmadı. Kod/test teslimi hazır, açık platform kabulü aşağıda kayıtlıdır.

## Tamamlanan işler

- TimelineBar: web draggable range ve native tek elle slider, önceki/sonraki,
  ±10/100, MÖ 2000/günümüz, yıl paneline git; tüm tarih/200/20 yıl ölçeği.
  Dar ekranda ek komutlar yatay kayar; alt safe-area mevcut AtlasScreen'de korunur.
- YearInput: MÖ 44 / MS 1867 / 1867 MS, yalnız sayı için seçili MÖ/MS düğmesi;
  sıfır, hatalı biçim ve aralık dışında Türkçe hata. Ay/gün veya kaynak tarihi
  uydurulmaz; MÖ 1 ve MS 1 slider'da komşudur.
- PlaybackControls: duruk başlangıç, oynat/durdur, 1/10/100 yıl/adım. Normal
  500 ms, reduced motion 1000 ms. Son yılda durur; sonda yeniden Oynat başlangıca
  döner. Her aradaki yılı ayrı ayrı sorgulamaz; global kamera FPS'si kısıtlanmaz.
- Manuel zaman girdisi/slider/panel/atlama/önizleme oynatmayı durdurur. Panel
  açma, ekranı terk etme ve arka plan da durdurur; otomatik devam yok. Haritayı
  kamerayla sürüklemek zaman girdisi sayılmaz; kamera ve zaman bağımsızdır.
- Zaman veya preview değişiminde kamera korunur. Pilot yıl düğmesi artık kamerayı
  taşımaz. İsteğe bağlı **Kaynaklı örneğe odaklan** ve eski kamera reseti ayrı
  açık kullanıcı eylemleridir. Önceki web pilot testi yeni akışa taşınmadı.
- Kaynak işaretleri gerçek snapshot API'sinden; yoğun aralıkta mobil 24/web 64
  gerçek yıl seçilir, seyreltme açıklanır. Bin-merkezi sahte yıl veya arada sürekli
  sınır oluşturulmaz. Şu an tek snapshot 1867, diğer dönemler desteksizdir.
- Tek external store ve useSyncExternalStore; coverage ve bütün varlık grupları
  tek contextYear için birlikte yayımlanır. Önizlemede bütün sorgular kaynak yılına
  ait olurken requestedYear ve onun destek yok modu korunur. Henüz boş kişi/olay
  katmanlarına sahte marker/record eklenmedi.
- 80 ms sürükleme birleştirme, bırakma/blur/termination ile flush, AbortSignal ve
  revision koruması. Geç eski başarı/hata, unmount sonrası sonuç ve eski ACK yeni
  bağlamı değiştiremez. İn-memory senkron döngü yarıda kesilmez; bekleyiş/commit
  iptal edilir. Sonraki ağ adaptörü signal'ı gerçek I/O'ya iletmelidir.
- Bridge v1'de optional revision/suspendHistory ve catalog.applied: küçük payload,
  tam anahtar/tür/session/yıl/katalog kontrolü, 4 KiB sınırı. MapLibre'nin kurulu
  setData Promise'i await edilir; yalnız güncel kaynağa ACK verilir. Bu fiziksel
  GPU rasterizasyonunun kanıtı değildir. Geometri native bridge'e taşınmaz.
- Scrub serisinde tek clear + son apply; yavaş köprüde kamera/ACK son değerle
  birleşir, kuyruk 8 olayla sınırlıdır. Var olan indeks/cache/harita/WebView yeniden
  kurulmaz. Snapshot işaretleri tick başına yeniden indirilmez/sorgulanmaz.
- Bütün bilgi panellerinde istenen yıl, uygulanan kaynak yılı, kapsam durumu ve
  ortak sorgu yılı Türkçe okunabilir. Harita yoksa uygulanmış kaynak yılı null kalır.

## Test ve platform sonuçları

| Kontrol | Sonuç |
| --- | --- |
| `npm run check` | **PASS**: lint 0 uyarı, native/web strict TS, **77/77 ana + 4/4 worker**, format, globe/pilot hash/NOTICE. [Log](phase-07-validation.txt) |
| Yeni unit kapsamı | **12 yeni ana test**: 11 parser/slider/state/oynatma/iptal/frame/ACK testi, 1 ertelenmiş MapLibre setData/ACK/kamera regresyonu; önceki 65 test de geçti |
| `npm run web:export` | **PASS**, 4 statik rota; entry yaklaşık 2.1 MB ve MapLibre chunk yaklaşık 1.1 MB, logdaki açık/gzipsiz bundle etiketleri. [Log](phase-07-web-export.txt) |
| `npm run android:bundle` | **PASS**, Hermes + aynı Expo DOM çekirdeği. APK/Gradle/gerçek cihaz testi değildir. [Log](phase-07-android-export.txt) |
| `npm run test:web -- --list` | **PASS**, 26 senaryo / 3 dosya; keşif, icra değildir. [Liste](phase-07-browser-list.txt) |
| Hedefli çizelge Playwright | `DEBUG=pw:webserver timeout 35s npm run test:web -- tests/web/playback.spec.ts --project desktop` → **exit 124**, yerel sunucuya `connect EPERM 127.0.0.1:8081`. Test gövdesi çalışmadı; **BLOCKED**. [Log](phase-07-browser.txt) |
| `npm run environment:check` | **exit 1**, Java/adb ENOENT, Android SDK yok. [Ortam](phase-07-environment.txt) |

Native/web TS her iki YearSlider adaptörünü kontrol eder. Native responder, touch,
TalkBack, safe-area/IME/rotation/geri ve gerçek FPS/bellek henüz ölçülmedi:
**UNVERIFIED ON DEVICE**. Web görüntü/snapshot, pointer/klavye ve ekran okuyucu
senaryoları burada geçmedi; sahte GPU başarı kaydı yok. Mevcut screenshot baseline
bu ortamda üretilmedi. Node 26.11.1/npm 12.2.0 kullanıldı; GitHub Actions/Node 24
CI koşusu bu ortamda çalıştırılmadı.

## Dosyalar, veri ve lisans

[Dosya listesi](phase-07-files.txt). Ana alanlar: zaman store/frame/etkileşim,
YearSlider/YearInput/TimelineBar/PlaybackControls/TimelineDetails, AtlasScreen,
renderer/bridge/host ve Türkçe katalog; unit/web etkileşim senaryoları; README,
mimari, arayüz, ADR, lisans, risk ve ilerleme kayıtları.

Paket/lock, tarihî ham veri/üretim paketi, geometri ve lisans bildirimi değişmedi.
Yeni dependency/servis/font/görsel yok; repo kodu MIT. Katalog **0.2.0-pilot**, ETL
**1.2.0**, domain **2**, hak politikası **1.1.0**; NARA **1 sınır kesiti / 6 kayıt**,
CC0, aynı kaynak/çıkarım onayı ve checksum. Kültür/kişi/savaş/olay verisi 0.
Kaynak yetersizliğini zaman oynatmasıyla doldurma veya sınır interpolasyonu yok.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION**, OHM hak/üye/kaynak incelemesi
ve önceki audit bulguları açık kalır.

## Manuel kabul ve sonraki fazın önkoşulları

1. `npm run web` ile açın. Slider'ı sürükleyin; 200/20 yıl ölçeğinde tek yıl seçin.
   MÖ 1 → MS 1 ve geri geçişte yıl sıfırı görünmemeli. Yıl panelinde MÖ 44,
   MS 1867 ve geçersiz MÖ 0 deneyin.
2. Önceki/sonraki, ±10/100, başlangıç/günümüz uçları; slider okları, Home/End,
   PageUp/PageDown ve klavye odağı erişilebilir olmalı. Küçük telefonda ek alt
   kontroller yatay kaydırılabilmeli; kaynak yılı uyarısı kapanmamalı.
3. Oynat ve hızları değiştirin; manuel slider/yıl seçimi durdurmalı. Panel, başka
   ekran ve arka plana geçiş durdurmalı; dönünce otomatik başlamamalı.
4. **1867 sınır örneğini göster** kamera konumunu korumalı. Ayrı odaklanma düğmesi
   Alaska kesitine gitmeli; sonra yılı değiştirince aynı kamera korunmalı.
5. Kaynak kartı/kapsam panelinde istenen yıl ve haritaya uygulanan kaynak yılını
   ayırt edin. 1868 normalde boş; açık önizlemede requested 1868/source 1867,
   bütün ortak sorgular 1867 olmalı. Önizleme kapatılınca kaynak çizgisi kaybolmalı.
6. Fiziksel Android'de talkback increment/decrement, tek parmak, dönme/IME/back,
   debug/release/offline, bellek ve frame süreleri ayrı ölçülmeli.

Görsel/erişilebilirlik/cihaz kabulü tamamlanmadan bunlara PASS yazılmaz. Gelecek
veri fazı için de bilimsel kaynak/hak ve snapshot/sürekli geçerlilik incelemesi
önkoşuldur. Sonraki faz yalnız yeni kullanıcı isteğiyle başlar; Faz 08'e geçilmedi.
