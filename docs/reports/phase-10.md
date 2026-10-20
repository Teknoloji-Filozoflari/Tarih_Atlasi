# Faz 10 — Tarihî kişiler ve belgelenmiş konum ilişkileri

2026-10-16 · **IMPLEMENTED / AUTOMATED CHECKS PASS; WEB RUNTIME ACCEPTANCE BLOCKED; UNVERIFIED ON DEVICE**.

Yalnız kullanıcının Faz 10 kapsamı uygulandı. AGENTS.md, README, ilerleme kaydı,
Faz 09 raporu/ADR ve mevcut domain/timeline/renderer/ETL incelendi. Küçük plan:
kişi profili/kanıt şemasını genişlet → ayrı sorgular ve katmanı bağla → kaynaklı
dar pilot/manuel review hattı → yanlış kesinlik regresyonları → kalite/export/rapor.
Önceki çalışan NARA çizgisi, kültür modeli, zaman/oynatma ve WebGL fallback korundu.
Faz 11 başlatılmadı.

## Sonuç ve kabul durumu

Kişi profili, ayrı yaşam/konum sorguları, kişi araması, kanıt sınıfına göre
marker/küme ve kaynak kartı eklendi. Gerçek katalogda **1 kişi / 1 konum ilişkisi**
var: Vincent van Gogh — Maison Van Gogh, **1879-08–1880-10**. Kaynak:
[Wikidata Q5582 rev2556738621](https://www.wikidata.org/w/index.php?title=Q5582&oldid=2556738621),
[Q3280282 rev2460715196](https://www.wikidata.org/w/index.php?title=Q3280282&oldid=2460715196).
Ay hassasiyeti ve güncel yapı koordinatı korunur; bağlı müze referansı bağımsız
alınamadığından orta güven / yaklaşık tercih gerekir. Kaydı kesinleştiren gün,
ölçülmüş tarihî kişi GPS'si veya hareket rotası üretilmedi.

| İstenen iş / kabul | Durum / kanıt |
| --- | --- |
| 1. HistoricalPerson profili | PASS — kimlik/QID/ad/alternatifler ortak zarf; ayrı doğum/ölüm TemporalExtent, dil etiketli açıklama/meslek, kaynaklar ve sitelinkler. Nullable görsel hak alanı; medya üretim kapısı ayrı |
| 2. PersonLocation ilişkileri | PASS — 6 relationshipType, person/place ID, geometry, temporal/source/confidence; validFrom/validTo/precision kanonik TemporalExtent projeksiyonu; alan çelişkisi reddi |
| 3. Yaşam ve belgelenmiş bulunma | PASS — ayrı PERSON_ALIVE_AT_YEAR / PERSON_DOCUMENTED_AT_LOCATION_AT_YEAR; yaşamdan koordinat üretilmedi |
| 4. Kesin/yaklaşık/biyografik ayrımı | PASS — varsayılan yüksek güvenli yıl+tesis kanıtı; yaklaşık açık tercih; genel bağlantı ayrı açılır liste, haritada yok |
| 5. Wikidata özellik doğrulaması | PASS — P19/P20/P551/P937, P580/P582/P625 resmî sayfaları ve API parametreleri incelendi; özellik varlığı otomatik yıllık bulunma sayılmaz. [Kaynak tablosu](../persons.md) |
| 6. Yer/koordinat hassasiyeti | PASS — site/city/region/kingdom/unknown ve coordinateRole; bölge/krallık Point reddi; şehir ankrajı yalnız yaklaşık; güncel bina noktası kesin GPS değil |
| 7. Küme/popup/çoklu yer/zoom | PASS — kod+DOM double ve bütçe testleri; 1.000 ID/64 küme, 8'li seçim/kart sayfaları, zoom+ekran/arka yüz süzgeci; gerçek GPU/touch kabulü BLOCKED |
| 8. Kişi kartı | PASS — yaşam/dönem/kaynak/hassasiyet/ilişki/güven/atıf; lisansı incelenmiş dosya yokken resim yok. Gerçek web/Android kart kabulü BLOCKED |
| 9. Konumsuz kişi araması | PASS — kişi araması yaşam/konum filtresinden bağımsız; alternatif ad, dil fallback, 8'li sayfa; no-location regresyonu |
| 10. Kaynaksız rota/animasyon yok | PASS — kaynaklı hareket verisi pilotta yok; rota/otomatik kişi animasyonu üretilmez. Açık kamera odağı tarihi değiştirmez |
| 11. Kontrollü Türkçe fallback | PASS — Türkçe tercih, kaynak dilini/çeviri yapılmadığını açık belirtme; projeye ait Türkçe kısa olgusal özet |
| 12. Pilot importer ve review | PASS — CLI/UA/maxlag/timeout/byte/retry/cache ve unverified review çıktıları; gerçek API transferi DNS nedeniyle BLOCKED; tarayıcıyla incelenen ayrı editöryal pilot mevcut |
| 13. Yanlış kesinliği engelleyen testler | PASS — yıllık/life/unknown/biography/approx/source/rights/spatial/cluster/raw sitelink ve stale filtre/ACK regresyonları |
| Haritada kaynaklı kişi açılması | Veri→timeline→feature→renderer/seçim köprüsü→kart kodu/export otomatik doğrulandı; gerçek tarayıcı denemesi EPERM ve Android cihaz yokluğu nedeniyle **BLOCKED / UNVERIFIED ON DEVICE**. Tam platform kabulü iddia edilmez |

## Değişiklik alanları

- `src/domain`: PersonProfile/HistoricalPerson/PersonRelationship, strict şemalar,
  kişi yaşam/provenance/ölçek/atıf ve medya kapıları.
- `src/persons`: kanıt seviyesi, iki ayrı sorgu, arama/detail, finite indeks ve
  ekran uzayı kümeleri. `src/timeline`: kişi kapsaması, yaklaşık tercih revizyonu,
  ortak frame ve stale ACK koruması; yaşam ve görünür nokta sayıları ayrı.
- `src/map*`: aynı web/Android çekirdeğinde yerel kişi Marker'ları, overlap
  adayları/8'li bridge sayfaları, kaynak temizliği, optional boolean komut alanları.
- `src/atlas`: PersonRecords/PersonCard, katman tercihi/lejant, açık odak ve pilot
  akışı. Bütün yeni ürün kontrolleri `tr` katalogdan; sistem glifleri kullanılır.
- `scripts/etl`, `scripts/pilot`, `data/pilot`, generated modül: kontrollü
  geliştirme CLI'sı, aday review dosyaları, dar gerçek CC0 pilot, deterministik
  konum GeoJSON/kapsama/NOTICE/checksum. ETL1.4.0, katalog0.3.0-pilot.
- README/env/gitignore ve geliştirici/ADR/kapsam/lisans/kalite/risk/progress
  belgeleri; eski boş arama beklentisi güncellendi, yeni unit ve web senaryoları.

[Tam dosya listesi](phase-10-files.txt), [kişi geliştirici rehberi](../persons.md),
[ADR-0011](../adr/0011-person-location-evidence.md).

## Doğrulama

| Komut / deney | Sonuç / sınır |
| --- | --- |
| `npm run check` | PASS — sıfır uyarılı lint, web/native strict typecheck, **131/131 ana test**, **4/4 worker**, fiziksel asset hash, pilot deterministik hak/hash kontrolü ve formatter. [Log](phase-10-validation.txt) |
| `npm run pilot:prepare` | PASS — 11 kayıt / 3 SourceRecord, 1 siyasi çizgi + 1 kişi noktası; source/rights kapısından sonra çıktı. [Log](phase-10-pilot-prepare.txt) |
| `npm run web:export` | PASS — 4 statik rota ve gerçek MapLibre assetleri. GPU veya ekranda çalışma kanıtı değil. [Log](phase-10-web-export.txt) |
| `npm run android:bundle` | PASS — Hermes + aynı DOM renderer JS exportu. APK/AAB/Gradle veya gerçek cihaz testi değil. [Log](phase-10-android-export.txt) |
| `npm run test:web -- --list` | PASS — **38 senaryo / 6 dosya**, desktop+narrow; yalnız listeleme. [Log](phase-10-browser-list.txt) |
| `timeout 25s … test:web … persons.spec.ts --project=desktop --workers=1` | BLOCKED — `connect EPERM 127.0.0.1:8081`; süre sınırı exit124, testler başlayamadı. PASS/skip veya görsel baseline iddiası yok. [Log](phase-10-browser.txt) |
| `npm run environment:check` | Node26.11.1/npm12.2.0/lock PASS; Java, adb, Android SDK yok: BLOCKED. [Log](phase-10-environment.txt) |
| `npm run dependencies:report` | PASS — 23/23 tam sürüm; yeni dış bağımlılık yok. [Log](phase-10-dependencies.txt) |
| Gerçek Wikidata entity JSON alımı | Terminal `curl --max-time 12 --retry 0 …Q5582.json` exit6 DNS; büyük veri indirilmedi. Browser resmî sayfa/olgu incelemesi yapılabildi, özgün JSON olduğu iddia edilmedi |
| GitHub CI / fiziksel Android / ekran okuyucu / performans | Çalıştırılmadı; **UNVERIFIED ON DEVICE**. Önceki gerçek screenshot baseline ve Android kapıları açık |

131 ana testte önceki 107 korunur; kişi modülünde 22, renderer'da 1, oynatma/store'da
1 yeni test vardır. Kaynaklı pilot data testleri ve DOM doubles gerçek GPU kanıtı
değildir. Negatif testlerdeki uydurma kişi/yerler açık sentetik fixture'dır,
uygulamaya veya gerçek üretim kataloğuna import edilmez.

## Kaynak / lisans / kapsam

Yeni olgu çıkarımı ham SHA ve üretim checksumları
[manifestte](../../data/pilot/production/manifest.json) saklıdır. Kaynak dosyası
**editorial-fact-extraction-not-http-response** etiketlidir; iki input aynı
çıkarım dosyasına kendi kaynak revizyonlarıyla bağlanır. Builder incelenmiş SHA'yı
sabitler; kaynak/kanıt/atıf/lisans veya ham eşleşmesiz Wikipedia geçemez.

Wikidata'nın [yapılandırılmış veri lisansı CC0](https://www.wikidata.org/wiki/Wikidata:Licensing)
ile makale ve [Commons dosya lisansı](https://commons.wikimedia.org/wiki/Commons:Licensing)
ayrıdır. P18 görsel izni değildir. Pilotun özgün sitelink JSON'u yok; Wikipedia
alanı boş. Bu, gerçek dünyada maddesi olmadığı iddiası değildir. Görsel yok;
ayrı dosya hak/asset manifesti olmadan üretim görseli reddedilir. Bildirimler
[Wikidata NOTICE](../../assets/licenses/Wikidata-person-NOTICE.txt) ve üretim
NOTICE'ta birleştirilir. Historical Basemaps **BLOCKED FOR REDISTRIBUTION** sürer.

Katalog toplamı 11: önceki 6 NARA kaydı + 2 entity + 1 person + 1 place +
1 person-location. Tam devlet poligonu/kültür alanı/diğer kişi/rota yoktur.
Modern siyasi sınır/etiket eklenmedi; fiziksel Natural Earth tabanı değişmedi.
Önceki 1867 NARA ham/geometri hashleri korunur. Kişinin konumu 1879/1880'de yalnız
belgelenen aylık ilişki kapsamında; başka yıllara yayılmaz.

## Açık riskler ve sonraki faz önkoşulları

1. Gerçek tarayıcıda `npm run web` → **Kişi pilotu: 1880 (yaklaşık kayıtları aç)**
   → ≈ marker → ilişki/kaynak/ay/güven kartı; yıl1881 → marker yok. Kesin varsayılan,
   bağımsız kişi katmanı, arka yüz, küme sayfaları ve haritasız kişi araması kabulü.
2. Fiziksel Android'de aynı DOM köprüsü, touch/pinch, context kaybı, ekran dönüşü,
   safe-area/geri/IME, TalkBack, remount ve bellek/FPS/latency ölçümü. Export sonucu
   bu kabulü kapatmaz. En az önceki Faz 02 cihaz matrisiyle birlikte raporlanmalı.
3. Özgün Wikidata JSON ve bağımsız birincil yer/dönem kaynağını edinip kaynak
   çelişkilerini inceleme; gerekirse yeni sürüm/hash, güven ve sitelink review.
4. Medya gösterimi için gerçek dosya lisansı/atıf/asset manifesti ayrı incelenmeli;
   kaynaklı hareket verisi olmadan kişi rotası eklenmemeli.
5. Önceki A-03 siyasi ilişki kapsamı, A-04 screenshot baseline, Expo ham taşıma,
   origin/CSP, tam transitif NOTICE, güncel audit ve Node24/GitHub CI kapıları
   açık. Bu fazda çözülmüş veya yeniden ölçülmüş sayılmadı.

Faz 10 kod/veri/test teslimi hazırdır; platform kabul kriterleri açıkça BLOCKED
kaydedildi. Kullanıcının yeni onayı olmadan Faz 11'e geçilmez.
