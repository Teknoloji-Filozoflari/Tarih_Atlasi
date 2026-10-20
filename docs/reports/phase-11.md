# Faz 11 — Savaşlar, anlaşmalar ve tarihî olaylar

2026-10-16 · **CODE / SMALL SOURCED PILOT / AUTOMATED CHECKS / JS EXPORT PASS**.
Gerçek web kabulü **BLOCKED**; Android **UNVERIFIED ON DEVICE**.

AGENTS.md, README, docs/progress.md, önceki Faz 10 raporu ve model/ETL/renderer
incelendi. Küçük plan ADR-0012'de koddan önce yazıldı: olay modeli/kanıt → ortak
zaman ve bağımsız katmanlar → sınırlı marker/alan ve yıl listesi/kart → dar pilot,
negatif testler ve rapor. Yalnız kullanıcının Faz 11 kapsamı uygulandı. Faz 12 yok.

## Tamamlanan işler ve kabul matrisi

| İstek / kabul | Sonuç |
| --- | --- |
| 1. Yedi olay türü | PASS — BATTLE/WAR/TREATY/FOUNDATION/DISSOLUTION/CULTURAL_EVENT/OTHER; savaş ve muharebe aynı tür değil, çok yıllı aralık korunur |
| 2. Kaynaklı olay modeli | PASS — id/names/temporal/participantIds/evidence ortak kanonik zarf; details açıklama/placeId/locationPrecision/sitelink/alternatif tarih taşır; title/dateExtent/participants/sources salt okunur projeksiyon. Üretimde details zorunlu |
| 3. Yıl kesişimi | PASS — başlangıç/bitiş dahil; çok yıllı ve kesintili dönemler; savaş/antlaşma tek türe veya tek koordinata çevrilmez |
| 4. Bilinen tarih, eksik yer | PASS — geometrisiz olay yıl listesinde; placeId bile otomatik nokta üretmez |
| 5. Yaklaşık/tartışmalı tarih | PASS — precision/uncertain/sourceDate/calendar ve evidence indeksli alternatifler. Alternatif ana yıl indeksine otomatik eklenmez; kaynak anlamı çözülmüş gibi sunulmaz |
| 6. İkon/küme/yoğunluk | PASS — ⚑/⚔/§/✦; bounded DOM küme, yakın kişi+olay/alan hitlerini birleştiren sayfalı seçim; alan dolgu bütçesi. Gerçek GPU/erişilebilirlik kabulü açık |
| 7. Olay kartı | PASS — tür/dönem/konum/güven/açıklama/source/atıf/locator; kaynaklı katılımcı çözümü ve yalnız raw eşleşmeli sitelink. Gerçek pilotta sitelink/katılımcılar ayrıca doğrulanmadığından boş; uydurulmadı |
| 8. Katman bağımsızlığı | PASS — WAR/BATTLE savaş anahtarı, kalan beş tür olay anahtarı. Kapatma karşı katmanı kapatmaz |
| 9. Farklı çağ küçük pilot | PASS — dört dar incelenmiş Wikidata olgusu: MÖ 431–404 savaş,1066 muharebe,1648 antlaşma,1989–1990 süreç. Yalnız1066 yaklaşık geometri. Bağımsız üst kaynak/gün-takvim doğrulaması eksikleri açık |
| 10. Regresyon / offline | PASS — MÖ/MS, yıl0 reddi, aralık/boşluk, konumsuz/tarihsiz, alternatif kaynak, yoğun listeler/kümeler, offline statik sorgu, geometri/provenance/hak/sitelink ve stale seçim/cleanup testleri |
| Seçili yılda uygun olay | Veri→timeline→feature→renderer double/seçim ve yıl listesi kodu/test/export PASS; gerçek tarayıcı **BLOCKED**, fiziksel cihaz **UNVERIFIED ON DEVICE** |
| Konum kanıtı yokken yanlış nokta yok | PASS — üç gerçek geometrisiz kayıt yalnız listede; Point/alan/sourcePrecision uyuşmazlığı ve WAR-as-Point üretimden geçmez |

[Olay geliştirici/kullanım rehberi](../events.md), [ADR-0012](../adr/0012-event-layers.md).

## Veri ve bilimsel sınırlar

Katalog **0.4.0-pilot/schema2**, ETL **1.5.0**, policy **1.1.0**: **19 kayıt /
7 SourceRecord**. Önceki11 kayıt korunur;4 olay +4 kimlik eklenir. Yeni olay
geometrisi yalnız 1 yaklaşık Point; tam savaş/ülke/kültür polygonu eklenmedi.
Geometrisiz olaylar için eventCoverageIndex bbox null'dır; bu bilinmeyen konum
tüm dünya veya ülke merkezi sayılmaz. Katalog 53.582 byte, events.geojson206 byte.
Boyutlar açılmış dosya boyutudur; APK veya gerçek bellek ölçümü değildir.

| Kaynak / revizyon | Pilot kararı |
| --- | --- |
| [Q33745 / 2551218271](https://www.wikidata.org/w/index.php?title=Q33745&oldid=2551218271) | MÖ 431–404 WAR, yalnız yıl; tarih statement doğrudan referansı eksik; bağımsız kaynak araştırması tamamlanmadı. Savaş geometrisi alınmadı |
| [Q83224 / 2517858800](https://www.wikidata.org/w/index.php?title=Q83224&oldid=2517858800) | Hastings 1066 BATTLE; kaynak gün metni korunur, gün/takvim dönüşümü doğrulanmadığından normalize yıl. DMS nokta approximate-point; tam muharebe alanı/konum hata payı değil |
| [Q150995 / 2539526538](https://www.wikidata.org/w/index.php?title=Q150995&oldid=2539526538) |24 Ekim1648 Gregorian TREATY; birden çok yer ilişkisi tek nokta yapılmadı |
| [Q56039 / 2474841502](https://www.wikidata.org/w/index.php?title=Q56039&oldid=2474841502) |1989–1990 süreç OTHER; aynı revizyonda1991 P585 iddiası da var. Anlamı bağımsız çözümlenmedi, uncertain ve ayrı alternatif; geometri yok |

Tümü medium confidence. `verified` dar yapılandırılmış değerlerin incelendiğini
ifade eder; üst kaynak/antik takvim/çelişki bağımsız arşiv doğrulaması değildir.
Alternatif 1991 kartta korunur, canonical süreç aralığının yerine veya sonuna
kendiliğinden eklenmez. Tarihsiz hiçbir olay yıllara dağıtılmaz. Kaynaklı
katılımcılar, Wikipedia ham sitelinkleri, görseller veya polygonlar ayrıca
alınmadığı için alanları boş bırakıldı; gerçek dünyada olmadıkları iddia edilmez.

`wikidata-event-facts.json` **editorial-fact-extraction-not-http-response** olarak
saklı; özgün JSON/GUID veya HTTP yanıtı taklidi yapılmadı. Dört source/input
revizyonu aynı açık etiketli çıkarım dosyasına bağlanır. Builder incelenmiş
ham SHA'yı sabitler; üretim katalog/GeoJSON/NOTICE ve kapsam manifesti
[checksumlarla](../../data/pilot/production/manifest.json) deterministik üretilir.

[Wikidata yapılandırılmış veri lisansı CC0](https://www.wikidata.org/wiki/Wikidata:Licensing)
uygulanır. Makale/Commons dosyaları ve fiziksel taban/renderer/font/kod hakları
ayrıdır. [Olay NOTICE](../../assets/licenses/Wikidata-event-NOTICE.txt) üretim ve
uygulama atıf paneline eklendi. Historic England araştırma referansı incelendi;
metni/geometrisi paketlenmedi. **Historical Basemaps BLOCKED FOR REDISTRIBUTION**
sürer; yeni dış npm bağımlılığı veya genel kaynak lisans onayı eklenmedi.

NARA ham SHA `cbf1c3025bee36012e7fa1b3015ffb25d766a55b54c78aaaafdc3544a01cdf62`,
kişi ham SHA `7219e4518af7de0153e49ece5196ab97dffa6496c87ed6a35ee0d9295bddc902`
korundu; önceki çizgi ve kişi GeoJSON içeriği değişmedi. NARA testlerindeki
kaynak/ham input `array[0]` varsayımı ID aramasıyla düzeltildi: katalog sıralaması
kaynak politikası anlamına gelmez, NARA'ya dar hash onayı kontrolü korunur.

## Değişiklikler

- Domain strict şema, EventDetails/EventType, geometri/konum/alternatif/provenance
  üretim kapıları ve ETL1.5.0 raw sitelink kontrolü.
- `src/events` kanıt, kanonik projeksiyon ve yıl/detail repository; timeline
  katman eşlemesi/frame/indeks; viewport ve bridge battle/event tercihlerinin
  aynı4KiB zarfında doğrulanması.
- Ortak DOM Marker yaşam döngüsünün olay presentation adaptörü; olay alan stili,
  kişi/olay/alan overlap adayları; seçim ve odak için current revision guard.
- EventRecords/EventCard, bağımsız toggles/lejant,1066 pilot düğmesi, Türkçe
  metinler, loading/error/unsupported ve dış bağlantı hata deneyimi.
- Hash-bound küçük gerçek pilot, olay GeoJSON/manifest/NOTICE/generated bundle;
  sentetik fixture ve eski EVENT testlerinin açık OTHER geçişi; README ve
  ADR/model/kapsam/lisans/kalite/risk/roadmap/progress belgeleri.

[Tam dosya listesi](phase-11-files.txt).

## Doğrulama sonuçları

| Kontrol | Sonuç / sınır |
| --- | --- |
| `npm run check` | PASS — lint 0 uyarı, strict native+web TypeScript, **152/152 ana test**, **4/4 worker**, globe/pilot hak/hash ve formatter. [Log](phase-11-validation.txt) |
| `npm run pilot:prepare` | PASS — deterministik katalog 19 / 7 kaynak, olay 4/nokta1, önceki 1 sınır/1 kişi ilişkisi korunur. [Log](phase-11-pilot-prepare.txt) |
| `npm run web:export` | PASS — 4 statik rota; gerçek assetlerle bundle, WebGL/GPU çalışma kanıtı değil. [Log](phase-11-web-export.txt) |
| `npm run android:bundle` | PASS — Hermes ve ortak DOM JS exportu; APK/AAB/Gradle ve cihaz testi değil. [Log](phase-11-android-export.txt) |
| `npm run test:web -- --list` | PASS — **44 senaryo  / 7 dosya**, desktop+narrow; yalnız listeleme. [Log](phase-11-browser-list.txt) |
| Events Playwright desktop, 25 s sınır | **BLOCKED** — localhost8081 `connect EPERM`, exit124; tarayıcı senaryoları başlayamadı. Görsel/screenshot baseline veya skip/PASS iddiası yok. [Log](phase-11-browser.txt) |
| `npm run environment:check` | Node26.11.1/npm12.2.0/lock PASS; java/adb/SDK yok, exit1. [Log](phase-11-environment.txt) |
| `npm run dependencies:report` | PASS — 23/23 tam sürüm, yeni dış bağımlılık yok. [Log](phase-11-dependencies.txt) |
| Küçük özgün Wikidata entity isteği | **BLOCKED** — curl exit6 DNS; büyük veri indirilmedi. Browser dar structured fact incelemesi ayrı yapılabildi. [Log](phase-11-source-fetch.txt) |
| Fiziksel Android / uçak modu / TalkBack / GPU performansı | Çalıştırılmadı — **UNVERIFIED ON DEVICE**. JS export gerçek cihaz performansı değildir |
| Gerçek GitHub CI/Node24 | Çalıştırılmadı; yerel Node26/npm12 kontrolü yerine genellenmez |

152 ana test: önceki 131 + olay modülünde20 + renderer'da1 yeni test. Üç yeni
browser senaryosu desktop+narrow ile6 senaryo ekler. Sentetik geometri/yoğunluk/
katılımcı verisi yalnız testte; uygulama kataloglarına import edilmez. Offline
fetch-fail testi statik sorgunun ağ istemediğini gösterir; Android uçak modu
asset/worker yüklemesinin kanıtı değildir.

## Manuel kabul ve sonraki faz önkoşulları

1. `npm run web` → **1066 muharebe örneğini göster** → ⚔ → kaynak/dönem/
   yaklaşık konum kartı;1067'de marker yok. **Savaş** kapalıyken **Olay** tercihi
   değişmemeli. Savaşı yeniden açınca kayıt geri gelmeli.
2. Yıl1648 → **Bu yılın savaş ve olayları** → § Vestfalya kartı; kaynaklı gün
   görünür, marker/odak yok. MÖ 420 → çok yıllı savaş yalnız listede;1990 → süreç
   kartındaki alternatif 1991 ve belirsizlik açıklaması. Offline yerel liste/kart.
3. Gerçek web/device: marker cluster+kişi örtüşmesi, bütün aday sayfaları,
   klavye/ekran okuyucu, arka yüz, kamera/touch, dönme/resize/geri/background ve
   unmount/remount. İki marker grubu ayrı 64 bütçe taşır; toplam128+alan etiketleri
   için gerçek PSS/FPS/p95 touch ölçümü gerekli.
4. Bağımsız üst kaynak araştırması, antik/Orta Çağ takvim dönüşümü ve modern
   tarih farkı çözümü; varsa doğru raw sitelink JSON'unu revizyon/hash ile
   edinme; kaynak yokken geometri/katılımcı/URL eklememe. Yeni tarih veya geometri
   yeni sürüm ve inceleme ister.
5. Önceki Faz 02 cihaz kapısı, tam siyasi/kültürel polygon pilotu, A-03 siyasi
   ilişki kartı, A-04 gerçek screenshot baseline, Expo ham taşıma/origin/CSP,
   güncel audit/transitif NOTICE ve gerçek CI kapıları açık kalır.

Kod/test/veri teslimi yapıldı; karşılanamayan gerçek platform kabulü açıkça
**BLOCKED** kaydedildi. Kullanıcı onayı olmadan Faz 12'ye geçilmez.
