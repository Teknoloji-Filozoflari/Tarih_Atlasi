# Faz 08 — Devletler, krallıklar ve imparatorluklar

2026-10-16 (Europe/Istanbul). **CODE / TEST / JS EXPORT PASS**;
**ACCEPTANCE BLOCKED — VERIFIED POLYGON / RUNTIME / DEVICE**.
Yalnız Faz 08 uygulandı, Faz 09 başlatılmadı. Önce AGENTS, progress, önceki
faz raporları/model/kaynak/lisans/stil incelendi; küçük plan [ADR-0009](../adr/0009-political-layer.md)
ile kaydedildi. Kullanıcının son Faz 08 promptu yol haritasının eski kültür
başlığına göre önceliklidir. Önceki cihaz/güvenlik kapıları açık kalır.

## Teslim edilenler

- Tek political entity üzerinde birden çok tarihli sınıf, Türkçe tercihli
  kaynaklı ad/alternatif/açıklama ve ayrı kaynaklı başkent referansı.
  Kimlik çoğaltılmaz; POLITY şemsiyesi ve KINGDOM/EMPIRE iddiaları ayrılır.
- Alt iddialar için kalıcı ID, evidenceIndices, TemporalExtent, türetim ve
  üretim incelemesi; lisans/atıf/provenance kapısı korunur. Kaynaksız kuruluş
  yılı, nüfus, yüzölçümü, hükümdar ve bayrak eklenmedi.
- İsteğe bağlı siyasi ardıllık, kuruluş, bölünme, birleşme ve ad/soy ilişkileri.
  Vasallık, shared, dispute ve approximate stilleri ayrı biçim/şeffaflıkla;
  ilişki teritoryaya özgüyse diğer bölgelere yayılmaz.
- Kararlı tema renkleri, hafif fill ve seçili outline; aynı MapLibre globe,
  web/native adaptörler ve GeoJSON kaynağı. Modern ülke alanı/etiketi yok.
- Sistem fontlu, çakışma/öncelik kontrollü 8/20/32 yerel DOM etiketi; küçük
  alana elmas işaret, iç alan ankrajı. Harita hit testi fill ve siyasi çizgileri
  kapsar, 8 aday/tekilleştirme/seçili-küçük-ID sırası uygular.
- PolityCard: istenen/source yıl, belge dönemi/asıl tarih metni, kaynak locator,
  lisans/atıf, belirsizlik ve varsa kaynaklı açıklama/başkent/ilişkiler. Yalnız
  kaynak dış bağlantısı; doğrulanmış sitelink olmadan Wikipedia URL üretilmez.
- Aynı kayıtlar için klavye/fallback listesi. Desteksiz yılda kart uyarı verir,
  eski sınır/başkent/ilişki yeni yıla taşınmaz. Önizlemede kaynak yılı etiketlidir.
- Revizyon/session/ID/alan/4 KiB kontrollü seçim/odak köprüsü. Karttan açık
  700 ms flyTo, reduced motion'da 0 ms; tarih korunur, zaman kamerayı taşımaz.
  Stale/görünmeyen kayıt reddedilir. Marker ve listener temizliği testlidir.

[Model, kullanım ve teknik sınırlar](../political-layer.md),
[değişen dosyalar](phase-08-files.txt).

## Kabul matrisi

| İstenen davranış | Sonuç / pratik sınır |
| --- | --- |
| POLITY/KINGDOM/EMPIRE tutarlı çoklu sınıf | **PASS — model/unit**; tarihli, tek kimlik; gerçek yeni sınıf iddiası eklenmedi |
| Doğrulanmış pilot siyasi polygonları çizme/seçme | **BLOCKED**: gerçek tam/partial siyasi alan 0, yalnız eski LineString; fill/outline kodu ve sentetik geometri testleri gerçek veri kabulü değildir |
| İlişki/belirsizlik çizgi ve şeffaflığı | **PASS — model/style doğrulayıcı**; çoklu iddialar kartta korunur, gerçek yoğun örtüşen alan görünümü ölçülmedi |
| Dönemsel ad/alternatif, Türkçe tercihi | **PASS — model/unit**; kaynaklı genel ada geri dönüş, keyfî çeviri yok |
| Zoom/collision/küçük alan etiketleri | **PASS — seçim/DOM unit**; gerçek web/Android görsel/erişilebilirlik **BLOCKED** |
| Kartta dönem/kaynak/belirsizlik/kanıtlı bilgiler | **PASS — repository/strict export**; gerçek UI çalıştırması **BLOCKED**, önceki kullanıcı kart testi bu yeni kartı onaylamaz |
| Kaynaksız bilgi göstermeme | **PASS — schema/policy/negative tests**; mevcut pilotta başkent vb. yok, uydurulmadı |
| Açık kamera odağı, tarih koruma | **PASS — renderer double**; gerçek flyTo/touch/reduced-motion kabulü **BLOCKED** |
| Seçilen varlık yeni yılda desteksiz | **PASS — repository/unit**; uyarı ve kaynak korunur, geometry/style temizlenir; gerçek UI kabulü açık |
| Büyük/küçük/delikli/içbükey/antimeridyen/örtüşme | **PASS — sentetik birim**; MapLibre raster hit accuracy, antimeridyen GPU görünümü ve fiziksel touch **BLOCKED** |
| Opsiyonel ad/soy/kuruluş/bölünme/birleşme/ardıllık | **PASS — domain/runtime şema/negatif test**; gerçek ilişki verisi eklenmedi |

Faz kabulü tam karşılanmadı: en az bir incelenmiş gerçek siyasi **alan** kaydı
ve iki platformda runtime kanıtı eksiktir. Hazır kod varlığı bu kapıyı kapatmaz.

## Testler ve platformlar

| Komut | Sonuç |
| --- | --- |
| `npm run check` | **PASS**, lint 0 uyarı, native/web strict TS, **92/92 ana + 4/4 worker**, formatter, asset/pilot SHA/NOTICE ve yeniden üretim. [Log](phase-08-validation.txt) |
| Yeni test kapsamı | 14 siyasi domain/repository/geometry/style/bridge/DOM testi + 1 renderer focus/revision/vurgu testi; önceki 77 regresyon da geçti |
| `npm run web:export` | **PASS**, 4 statik rota; entry ~2.1 MB, ayrı MapLibre ~1.1 MB. Bunlar logdaki açık bundle boyutlarıdır, ağ/gzip/heap ölçümü değildir. [Log](phase-08-web-export.txt) |
| `npm run android:bundle` | **PASS**, Hermes ~3 MB ve aynı DOM çekirdeği; APK/Gradle veya gerçek cihaz değildir. [Log](phase-08-android-export.txt) |
| `npm run test:web -- --list` | **PASS**, 30 senaryo / 4 dosya (desktop+narrow); keşif, icra değildir. [Liste](phase-08-browser-list.txt) |
| `DEBUG=pw:webserver timeout 35s npm run test:web -- tests/web/politics.spec.ts --project desktop` | **BLOCKED / exit 124**, localhost bağlantısı `EPERM 127.0.0.1:8081`; test gövdesine ulaşılmadı. [Log](phase-08-browser.txt) |
| `npm run environment:check` | **exit 1**; Java/adb ENOENT, Android SDK yok. **UNVERIFIED ON DEVICE**. [Log](phase-08-environment.txt) |

Node 26.11.1/npm 12.2.0 ile yerel kontroller; Node 24 CI bu ortamda çalıştırılmadı.
Gerçek ekran görüntüsü/snapshot baseline, GPU, Android touch/geri/dönme/TalkBack,
offline release, FPS/bellek ve fiziksel marker→native bu fazda doğrulanmadı.

## Veri, lisans ve engeller

Cliopatria resmî README/veri lisansı/yöntemi araştırıldı. Veri CC BY 4.0 metni
mevcut; bu bilgi seçili polygon/üst kaynak/record review yerine geçmez.
Terminal dosya erişimi DNS/curl exit 6, resmî API erişimi 403/erişilemez.
[Kaynak kanıtları ve çözüm yolu](phase-08-source-review.md). Bulk arşiv alınmadı,
hiçbir polygon kopyalanmadı; lisans onayı koduna yeni izin eklenmedi.

Mevcut **1 NARA antlaşma kesiti / 6 kayıt**, 1867-06-20 snapshot, katalog
0.2.0-pilot/schema 2/ETL 1.2.0/policy 1.1.0 aynıdır. Raw, üretim GeoJSON,
manifest ve NOTICE byte/hash'i değişmedi; pilot:check bunu yeniden doğruladı.
Kültür/kişi/savaş/olay ve tam siyasi alan sayısı 0. Natural Earth modern fiziksel
kara tabanı tarihî siyasi alan diye kullanılmadı. Sentetik polygonlar yalnız
tests altında, uygulamaya import edilmez. Yeni dependency/lock/font/görsel/tile
yok; proje kodu MIT, dış kaynak hakları ayrı. Historical Basemaps
**BLOCKED FOR REDISTRIBUTION**, OHM üye/hak/kaynak kapısı sürer.

Palet çakışabilir, etiket bütçesi bazı adları gizler; kayıt listesi/kart erişimi
kalır. Sunum ankrajı kaynaklı başkent değildir. Kamera büyük bileşene gider,
her çok parçalı alanı tam fit etme iddiası yoktur. Sferik/kutup topolojisi ve
dünya ölçeği performansı ölçülmedi. Önceki audit bulguları kapatılmadı.

## Manuel kabul ve sonraki fazın önkoşulları

1. `npm run web`: **1867 sınır örneğini göster**, ardından **Bu yılın siyasi
   kayıtları** → Alaska kesiti. Kartta antlaşma tarafı, belge dönemi, kaynak
   yılı 1867, devir ilişkisi, atıf/lisans ve tam alan olmadığı açıklaması görünmeli.
2. Karttan **Seçili siyasi coğrafyaya odaklan**: tarih 1867 kalmalı; kamera kesite
   gitmeli. Harita etiketi ve çizgi seçimi aynı kartı açmalı; drag panel açmamalı.
3. Kartı kapatın, 1868'e geçin: çizgi/etiket/vurgu kaybolmalı; kayıt listesi veri
   olmadığını söylemeli. 1867'ye dönünce geri gelmeli. Preview'da requested/source
   yılı ayrı kalmalı, kaynak yılı sürekli görünmeli. Kamera tarih değişiminde sabit.
4. Gerçek tarayıcıda küçük ekran/klavye/covered etiket, modal odağı ve azaltılmış
   hareket; fiziksel Android'de touch/WebView/rotation/back/TalkBack ve GPU ölçümü.
5. Ağ erişimli ortamdan küçük, sürümlü gerçek polygon edinme; ham SHA, upstream,
   tarih uçları, hak/atıf, belirsizlik ve geometri incelemesi; dar manual approval,
   ETL/production ve gerçek web+Android polygon seçim kabulü.

Bu önkoşullar çözülmeden Faz 08 tam tamamlandı denmez. Faz 09 için ayrıca kullanıcı
isteği gerekir; bu çalışma sonraki fazı başlatmaz.
