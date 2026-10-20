# Faz 09 — Kültürler, medeniyetler ve belirsiz etki alanları

2026-10-16 · **SOURCE / TEST / JS EXPORT PASS**.
**VERIFIED CULTURE PILOT / RUNTIME ACCEPTANCE BLOCKED**.
Yalnız kullanıcının Faz 09 promptu uygulandı; Faz 10 başlatılmadı. AGENTS,
progress, önceki raporlar ve denetim açıkları okunup [ADR-0010](../adr/0010-cultural-layer.md)
planı oluşturuldu. Önceki siyasi polygon/Android/güvenlik kapıları kapanmadı.

## Tamamlanan işler

- Siyasi olmayan CULTURE/CIVILIZATION/CULTURAL_REGION kimlikleri; kaynaklı,
  tarihli ve güven bilgili CulturalRegion ve ayrı CulturalRelationship kayıtları.
  Üretim kültürü için coğrafi bağlam, yorum ve belirsizlik açıklamaları zorunlu.
- Aynı yerde aynı zamanda birden çok kültür ve siyasi coğrafya ayrı kayıtlar
  olarak döner. Birbirinin alanından çıkarma, siyasi sınırı kültüre çevirme yok.
- ≈ işaretli kültür etiketi/kartı, siyasi ▱ ayrımı; düşük yarı saydam dolgu,
  yumuşak/noktalı kenar ve seçiliyken de noktalı vurgu. Türkçe lejant kültürel
  alanın egemenlik sınırı olmadığını anlatır; renk tek başına anlam taşımaz.
- 32'den fazla alanda açık yoğunluk açıklaması; global alpha bütçesiyle N kültürün
  bileşik dolgusu en fazla .30. Etiketler 8/20/32 bütçeli, kayıtlar silinmez.
- Kültür kartı: ad/tür, dönem ve özgün tarih metni, seçilen/kaynak yılı ayrımı,
  coğrafi bağlam, belirsizlik, güven düzeyi/gerekçesi, ilişkiler ve atıf/locator.
  Desteksiz yılda uyarı; güncel kaynak/ilişki iddiası taşınmaz.
- Çağdaş fiziksel tabanın tarihî kıyı/nehir/göl koşullarını kanıtlamadığı uyarısı
  kart, lejant ve atıf panelinde. Devlet/kültür görünürlüğü bağımsız kaldı.
- Ortak hit testi kültür fill/çizgilerini ve siyasi alanları birlikte sorgular.
  8 aday artık tek sayfadır; 1000 adaylık hit kümesinin tümü sayfalanabilir.
  Çoklu seçim paneli ve karttan diğer adaylara erişim; kültür yılı listesi de
  klavye/haritasız kullanımda sayfalıdır. Tek gerçek siyasi pilot akışı korunur.
- Bridge v1 selection.page/selection.changed: session/katalog/revision/ID,
  offset/total/sayfa uzunluğu/4 KiB kontrolü; eski hit kümesi reddedilir, GeoJSON
  taşınmaz. Sayfa isteği tarih komutunu ezmez. Marker/listener kaynakları temizlenir.
- Opsiyonel Wikipedia bağlantısı isimden/QID'den üretilmez. Source/revision/
  rawInputId/QID/site/title/url bağı ve checksum'u doğrulanmış ham Wikidata
  sitelinki ETL'de bire bir karşılaştırılır; girdi bir kez parse edilir.
  Mevcut katalogda sitelink yoktur, Wikipedia düğmesi gösterilmez.

[Uygulama/model sözleşmeleri ve sınırlar](../cultural-layer.md),
[değişen dosyalar](phase-09-files.txt).

## Kabul matrisi

| İstek | Sonuç |
| --- | --- |
| 1. Ayrı kültürel tür ve ilişki modeli | **PASS — domain/şema/unit**; siyasi taraf/yanlış tür reddedilir |
| 2. Eşzamanlı kültür örtüşmesi | **PASS — sentetik**; iki/üç kültür ve siyasi kayıt ayrı sonuçlar. Tek geometrinin iç topoloji hatası hâlâ reddedilir |
| 3. Dolgu/soft sınır/lejant | **PASS — stil şeması/kontrast/kod**; gerçek görüntü kabulü **BLOCKED** |
| 4. Zaman ve güven; tarihsiz alanı yaymama | **PASS — runtime şema/motor/unit**; destek yoksa çizilmez, snapshot komşu yıla taşınmaz |
| 5. Bağımsız anahtar ve yoğunluk stratejisi | **PASS — feature loader/unit**; yeni gerçek web/Android UI deneyi **BLOCKED** |
| 6. Kültür kartı/kanıtlı sitelink | **PASS — repository/ETL/raw negatif test/TS/export**; gerçek kart/sitelink verisi yok, runtime kart kabulü açık |
| 7. Küçük lisanslı doğrulanabilir kültür pilotu | **BLOCKED — VERIFIED CULTURAL AREA / SOURCE REVIEW**. Gerçek kültür geometrisi 0; veri uydurulmadı |
| 8. Alttaki kültür/siyasi kayda seçim erişimi | **PASS — gerçek renderer kodu + double, 18 aday/3 sayfa; saf 1000 aday/125 sayfa**. Gerçek GPU/touch kabulü **BLOCKED** |
| 9. Tarihî basemap değişkenliği uyarısı | Kaynakta kart/lejant/atıf alanlarına Türkçe eklendi; TS/export PASS, gerçek ekran kabulü açık |
| 10. Renk/overlap performans testleri | **PASS — renk kontrastı/alpha/400 kültür indeks-cache bütçesi**; fiziksel FPS/bellek ölçülmedi |

Ana kabulün model kısmı testlidir; kullanıcının gerçek ortamda siyasi/kültürel
anlamı ayırabildiği ve gerçek pilotla etkileştiği kabulü **BLOCKED** kalır.
Bu faz tam veri/cihaz kabulü tamamlandı olarak sunulmadı.

## Önceki denetimden zorunlu bağımlı işler

- **A-01 FIXED — CODE / REGRESSION:** kültür alanını da etkileyen bağlı kimlik
  tarih açığı ortak validator ve motor filtresiyle giderildi. Bilinen dış dönem
  ve dönem boşluğu reddedilir; bilinmeyen üst tarih kesinleştirilmez. Eski
  yüzyıl hassasiyet testindeki sentetik entity'nin dönemi kendi sınır kaydına
  uyacak biçimde düzeltildi; precision beklentisi azaltılmadı.
- **A-02 CONFIG FIXED / CI RUN UNVERIFIED:** yeni testler için bağımsız unit
  job'a npm 12.2.0 + npm ci eklendi. Temiz GitHub/Node24 koşusu çalıştırılmadı.
- **A-03 siyasi kart ilişki kapsamı** ve **A-04 incelenmiş screenshot baseline**
  bu fazda çözülmedi. Kültürel yeni repository bölgesel ilişki kapsamını doğru
  filtreler. Önceki denetim raporu tarihî kayıt olarak korunur.

## Testler ve platform kanıtları

| Kontrol | Sonuç |
| --- | --- |
| `npm run check` | **PASS**: lint 0 uyarı, native/web strict TS, **107/107 ana + 4/4 worker**, format, globe/pilot hash/atıf/yeniden üretim. [Log](phase-09-validation.txt) |
| Yeni testler | 14 kültürel domain/motor/repository/render-data/stil/renk/alpha/page/protocol/ETL/source testi + 1 renderer lifecycle/seçim testi. Önceki 92 test de geçti |
| `npm run pilot:prepare` | **PASS**, aynı 1 gerçek kesit/6 kayıt; ETL 1.3.0 metadata'sıyla deterministik üretim. [Log](phase-09-pilot-prepare.txt) |
| `npm run web:export` | **PASS**, 4 statik rota. [Log](phase-09-web-export.txt) |
| `npm run android:bundle` | **PASS**, Hermes + aynı DOM çekirdeği. APK/Gradle veya cihaz testi değildir. [Log](phase-09-android-export.txt) |
| `npm run test:web -- --list` | **PASS**, 34 senaryo/5 dosya; keşif, icra değil. [Liste](phase-09-browser-list.txt) |
| `DEBUG=pw:webserver timeout 25s npm run test:web -- tests/web/cultures.spec.ts --project desktop` | **BLOCKED / exit 124**, connect EPERM 127.0.0.1:8081; test gövdesine ulaşmadı. [Log](phase-09-browser.txt) |
| `npm run environment:check` | **exit 1**, Java/adb ENOENT, Android SDK yok. **UNVERIFIED ON DEVICE**. [Log](phase-09-environment.txt) |

Node 26.11.1/npm 12.2.0. Native/web typecheck her iki adaptörü kontrol eder;
gerçek safe-area/IME/TalkBack/touch/rotation/back, görsel baseline, offline
release, GPU/FPS/bellek bu tur doğrulanmadı. Önceki kullanıcı web pilot testi
yeni kültür kartını veya sayfalı seçimi onaylamaz. Sentetik yük testi gerçek
cihaz performansı olarak sunulmadı. GitHub Actions/Node24 koşusu yapılmadı.

## Veri, lisans, sürümler

[Birincil kaynak incelemesi](phase-09-source-review.md). D-PLACE NC bildirimiyle
seçilmedi; Pleiades yer/temsilî nokta/bbox bilgisi kültürel yayılım kanıtı değildir.
OHM üyeleri/hak/zaman kapısı ve Historical Basemaps **BLOCKED FOR REDISTRIBUTION**
sürer. Terminal örnek isteği DNS/curl exit 6; kültür geometrisi alınmadı.
Bu eksiklik siyasi polygon veya nokta tamponuyla doldurulmadı.

Yeni dependency/font/görsel/tile/hak onayı yok. Kod/stil MIT; dış veri hakları
ayrı. Gerçek içerik yine **1 NARA LineString / 6 kayıt**, tek 1867-06-20
snapshot. Kültür, tam siyasi alan, kişi, savaş ve olay geometrisi **0**.
Sentetik kültürler yalnız tests/fixtures altında; uygulama bunları import etmez.

Yeni doğrulama kuralları **ETL 1.3.0** olarak sürümlendi. Pilot manifesti ve
generated modülün ETL metadata'sı yeniden üretildi. Katalog **0.2.0-pilot/schema2**,
policy **1.1.0**, raw/katalog/GeoJSON/NOTICE aynı içerik/hash'tedir. Katalog SHA:
`da8bc4c747668c9f35ac89d189a70622a7aafddca7ff4a3cfd69e8ac1ee88126`.
İlk gerçek kültür yayını yeni katalog sürümü ve tam inceleme gerektirir.

## Manuel kabul, riskler ve sonraki fazın önkoşulları

1. `npm run web`: **Bu yılın kültürel kayıtları** boş kültür kapsamını, lejantı,
   siyasi egemenlik ayrımını ve çağdaş taban uyarısını göstermeli. Gerçek kültür
   yokken şekil/isim/Wikipedia düğmesi oluşmamalı.
2. **Katmanlar**: kültürü kapatmak devleti kapatmamalı. 1867 siyasi örneği,
   yalnız kültür açıkken görünmemeli; siyasi kayıt kültür diye sunulmamalı.
3. Gerçek kültür pilotu alındığında aynı yer/yıl kültür+siyaset seçimi, bütün
   aday sayfaları, kart/atıf, tarih/preview değişimi, klavye ve yoğunluk kontrolü.
   Sayfa/etiket sırası hak veya egemenlik üstünlüğü değildir.
4. Alpha bütçesi bütün görünür kültür kayıtları üzerinden tutucudur; seyrek
   alanlar da incelir. Gerçek yoğun veride çizgi/DOM/GPU maliyetleri ve palet
   çakışmaları ayrıca ölçülmeli. Kutup/sferik GIS sınırları önceki gibi açıktır.
5. Küçük gerçek kültür kaynağını sürüm/geometri/yorum/zaman/kanıt/hak/atıf/ham
   hash ile inceleyip ETL'den geçirme; ardından gerçek web ve fiziksel Android
   iki kültür örtüşmesi ve siyasi ayrım kabulünü kapatma.
6. Önceki Android, screenshot, siyasi kart kapsamı, audit/transitif NOTICE,
   raw Expo taşıma ve dağıtım politikası kapıları değerlendirilmelidir.

Faz 10 ancak yeni kullanıcı isteğiyle başlar; bu çalışma otomatik geçiş yapmadı.
