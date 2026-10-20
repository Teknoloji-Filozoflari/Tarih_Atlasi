# Faz 06 — Zaman motoru, MÖ/MS ve veri kapsamı

2026-10-15 · **COMPLETE — TIME ENGINE / UNIT SCOPE**.
Yeni snapshot önizlemesinin gerçek tarayıcı kabulü **BLOCKED — ENVIRONMENT**;
fiziksel Android **UNVERIFIED ON DEVICE**. Kullanıcı yalnız Faz 06'yı
istemiştir; Faz 07 başlatılmadı. Önceki cihaz, erişilebilirlik ve audit kapıları
bu teslimle kapanmış sayılmaz.

## Sonuç ve kabul

Tarihî yıl/geçerlilik modeli koddan önce [ADR-0007](../adr/0007-temporal-query-engine.md)
ve altın testlerle tanımlandı. Yeni `src/timeline` motoru, aynı kaynakları kullanan
web/native renderer'a bağlandı. Yeni tarihî veri, geometri, dış bağımlılık veya
lisans izni alınmadı. Üretim hâlâ 1 NARA sınır kesiti / 6 kayıt / 0 kültür / 0 tam
ülke poligonudur. Faz 05 kullanıcı testinin üzerine yeni önizleme başarısı yazılmadı.

| Kabul kriteri | Sonuç |
| --- | --- |
| Takvim geçişi ve sınır dahil etme/çıkarma | **PASS**: MÖ 2/MÖ 1/MS 1/MS 2, MÖ 2000, kapalı başlangıç/bitiş, dönem boşlukları, snapshot ve continuous ayrımı otomatik testli |
| Bilinmeyen yılı kesinmiş gibi göstermeme | **PASS**: bilinmeyen/incelemesiz tarih yıllık kesin sonuca girmez; kaba tarih gün alamaz; support'suz geometri aralığa yayılmaz; üç mod ayrı |
| Yeni önizlemenin gerçek web/GPU davranışı | **BLOCKED**: sandbox yerel bağlantıyı EPERM ile reddetti; kullanıcı testi henüz yok |
| Fiziksel Android | **UNVERIFIED ON DEVICE**: JDK/adb/SDK bulunmuyor; JS export cihaz kanıtı değil |

## Tamamlanan işler

- Kullanıcı yılı sıfırsız negatif MÖ / pozitif MS. Astronomik dönüştürücüler,
  yıl adımı, dahil yıl sayısı ve süre farkı ortak modülde. Aralık MÖ 2000 ile
  sistemin güncel yerel yılı; UI uygulamaya dönüşte ve periyodik kontrolde yenilenir.
- TemporalExtent v2 geriye uyumlu `support` (snapshot/continuous + kaynak notu),
  `periods` (en çok 64 ayrık aralık) ve range hassasiyeti aldı. Önceden geçerli
  kayıt okunabilir; yeni coğrafi geçerlilik tahmin edilmez. Ay/gün null korunur;
  sıralama anahtarları gerçek gün süresi gibi kullanılmaz.
- Provider ve semantik denetim dönem boşluklarını korur. Aynı yorum/scope içinde
  ayrık dönemlerdeki sınır sürümleri kabul edilir; aynı an çakışırsa ret sürer.
  Farklı kültürler, rakip siyasal iddialar ve vasallık tek poligona indirgenmez.
- getEntitiesAtYear, getTerritoriesAtYear, getPersonsAtYear, getEventsAtYear,
  getAvailableSnapshots, getDataCoverage: sağlayıcıdan bağımsız API ve named exports.
  Kişinin yaşamı, o yılki kaynaklı bulunması ve genel biyografik yerleri ayrıdır.
  Tarihli yer referansı bulunma kanıtı olabilir; kaynakta olmayan koordinat üretilmez.
- Üç açık mod: exact verified / documented approximate /
  no supported historical geography. Kısmi kapsam, kaynak metadata'sı, editöryal
  coverage kayıtları ve çözümlenmemiş tarih sayısı korunur. Yükleme hatası veri
  yokluğu sayılmaz. UI yalnız mevcut çizilebilir devlet/kültür katmanlarını sorgular.
- Açık seçilen nearest-snapshot önizlemesi, varsayılan kapalı; seçilen yılı
  değiştirmez. Kaynak yılı ve uyarı harita yanında/kaynak kartında kalır. Yıl
  değişikliği veya kapatma, önizleme geometrisini temizler. Eşit uzaklıkta eski
  kaynak yılı seçilir; MÖ/MS farkı astronomik sırada hesaplanır.
- Tek katalog kurulumu paylaşımlı, bounded sayfalama (10×100); sıralı zaman indeksi,
  binary search/prefix max-end ve sınırlı LRU (varsayılan 32, en çok 128 yıl).
  Renderer revision ve UI latest-query eski başarı/hataları reddeder; cleanup
  sonrası sonuç uygulanmaz. 1000 katalog kaydı/64000 dönem girdisi üst sınırı var.
- Köprü v1 geriye uyumlu optional boolean previewSnapshot ile genişledi;
  bilinmeyen tür/alan retleri, session/requestId ve 4 KiB sınırı korunuyor.
  SourceYear/preview çizim feature'ında; geometri native köprüden geçmiyor.
- `npm run timeline:coverage` gerçek katalog kapsamını raporlar.

## Testler ve platform doğrulamaları

| Kontrol | Sonuç / kanıt |
| --- | --- |
| Model öncesi altın test dosyası | İlk çalıştırma **exit 1**, giriş modülü henüz yoktu; testlerin hepsi çalışmış gibi sayılmadı. [Başlangıç kaydı](phase-06-before.txt) |
| `npm run check` | **PASS**, lint 0 uyarı, native/web strict TS, **65/65 ana + 4/4 worker** testi, globe/pilot hash/atıf ve formatter. [Log](phase-06-validation.txt) |
| Eklenen test kapsamı | **20 yeni ana test**: 18 zaman altın/kenar senaryosu + 1 renderer önizleme/temizleme + 1 bridge/gerçek pilot önizleme. Önceki 45 regresyon da geçti |
| `npm run pilot:prepare` | PASS; ham SHA/hak kapısından aynı küçük paket yeniden üretildi |
| `node scripts/timeline-coverage.mjs` | PASS; seçilebilir aralık -2000–2026, yalnız 1867 snapshot; 1868 normalde boş, açık önizlemede kaynak 1867. [JSON](phase-06-coverage.json) |
| `npm run web:export` | PASS; 4 statik rota, ortak zaman motoru + gerçek globe bundle. [Log](phase-06-web-export.txt) |
| `npm run android:bundle` | PASS; Android Hermes + Expo DOM ortak kaynakları. APK/Gradle veya fiziksel GPU testi değildir. [Log](phase-06-android-export.txt) |
| `npm run test:web -- --list` | PASS; 20 senaryo keşfi, test icrası değil. [Liste](phase-06-browser-list.txt) |
| Hedefli Playwright önizleme | `DEBUG=pw:webserver timeout 35s npm run test:web -- --grep 'zaman motoru' --project desktop`: **exit 124**; `connect EPERM 127.0.0.1:8081`. Test gövdesi çalışmadı; PASS sayılmaz. [Log](phase-06-browser.txt) |
| `npm run environment:check` | **exit 1**, Java/adb ENOENT, SDK yok. [Ortam](phase-06-environment.txt) |

Gerçek tarayıcı ekran görüntüsü, dokunma, TalkBack, bellek/latency veya Android
performans ölçümü yapılmadı. Mock renderer testleri gerçek WebGL sayılmadı.
GitHub Actions burada çalıştırılmadı; mevcut check iş akışı yeni testleri otomatik
alır. Node 26.11.1/npm 12.2.0 ortamı kullanıldı; Node 24 CI koşusu burada doğrulanmadı.

## Veri, lisans ve değişen dosyalar

[Dosya listesi](phase-06-files.txt). Ana alanlar: src/timeline, TemporalExtent/
provider/semantik denetim, pilot adapter/renderer/bridge, kapsam UI'si/Türkçe
katalog, generator/CLI/testler ve mimari/kapsam/lisans/ilerleme belgeleri.
Lock değişmedi; paket script'i dışında bağımlılık manifestinde değişiklik yok.

Katalog **0.2.0-pilot**, ETL **1.2.0**, domain **2**, hak politikası **1.1.0**.
Tek değişiklik açık snapshot annotation ve yeni sorgu sözleşmesidir. Aynı NARA raw
SHA/kimlik/revizyon onayı, aynı geometri ve CC0 atıf bildirimi geçerlidir.
`catalog.json`: **14034 byte**, SHA-256
`da8bc4c747668c9f35ac89d189a70622a7aafddca7ff4a3cfd69e8ac1ee88126`.
Fine/coarse GeoJSON **287/231**, NOTICE **1270**, raw **2119 byte** aynıdır;
hash'leri değişmedi. Bunlar gzip/APK ölçümü değildir. [Üretim manifesti](../../data/pilot/production/manifest.json).
Eski Faz 05 raporu kendi sürümünün tarihî hash/boyut/test kanıtını korur.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION**; OHM karantina/üye/hak kapısı açık.

## Manuel kabul akışı ve sonraki faz önkoşulları

1. Web'de **1867 sınır örneğini göster**: kesit ve belgelenmiş yaklaşık kapsam,
   çizgiden kaynak kartı ve önceki sürükleme/reset/işaret davranışları korunmalı.
2. **Sonraki yıl** ile 1868: çizgi kaybolmalı; desteklenen coğrafya yok açıklaması.
3. **En yakın kaynak yılını önizle**: timeline MS 1868 kalmalı; **kaynak yılı
   MS 1867** uyarısıyla çizgi görünmeli. Kaynak kartında da önizleme uyarısı olmalı.
4. **Kaynak yılı önizlemesini kapat**: kaynak çizgisi kaybolmalı. Yeniden önizleyip
   yılı değiştirince önizleme kendiliğinden kapanmalı; Devlet kapalıyken çizgi yok.
5. YearPicker'da MÖ 1; sonraki yıl MS 1, önceki yıl MÖ 1. Yıl 0 reddedilmeli.
   Küçük ekran/büyük metin/klavye ile kaynak yılı etiketi erişilebilir kalmalı.

Yeni önizleme için manuel web kanıtı ve gerçek Android bridge/offline/touch/back/
rotation/context/bellek testleri gerekir. Statik katalog büyütülmeden önce yeni
kaynağın dönem/sürekli geçerlilik, bilimsel dayanak ve hak incelemesi tamamlanmalı.
Zaman indeksi en kötü uzun örtüşmede O(n); dünya ölçeği performansı doğrulanmadı.
Sonraki faz yalnız açık kullanıcı isteğiyle başlar; Faz 07'ye geçilmedi.
