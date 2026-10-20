# Faz 05 — Kaynaklı sınır pilotu, taban ve veri paketleri

2026-10-15 · **SOURCE / DATA PIPELINE PASS — USER-REPORTED PILOT PASS**.
Otomatik tarayıcı ve fiziksel Android kapıları açık.
Kullanıcı bu fazı açıkça yetkilendirdi; Faz 06 başlatılmadı. Önceki Android/GPU ve
Faz 03 erişilebilirlik kabulü kapanmış sayılmadı.

## Sonuç

Küçük yayınlanabilir veri adayı: **NARA 1867 Alaska Antlaşması'ndaki 141°B
meridyeninin 65–68°K idealize görüntüleme kesiti**, yalnız **1867-06-20 snapshot**.
Hazır GIS polygon kopyalanmadı; resmî metinde açık koordinat tanımı kaynak alındı,
proje kesme penceresi ve türetim kaydedildi. Bu, tam Alaska/ABD alanı veya ölçülmüş
WGS84 sınırı değildir. 1 görüntülenebilir sınır, 6 toplam alan/teknik kayıt;
0 tam devlet poligonu, 0 kültür alanı. Başka çağ/coğrafyalar doğrulanamadığı için
veri sayısı geometri çizerek tamamlanmadı.

[Resmî kaynak](https://www.archives.gov/milestone-documents/check-for-the-purchase-of-alaska),
[dar hak kapsamının dayanağı](https://www.archives.gov/global-pages/privacy.html#copyright).
Katalog/GeoJSON CC0 1.0; proje kodu MIT ayrı. Kaynak ID/revizyon/çıkarım SHA'sına
bağlı tek manuel inceleme onayı var; diğer NARA materyalleri otomatik onaylı değil.
Raw dosya tam HTTP yanıtı değil, açık etiketli editöryal olgu çıkarımıdır.

## Kabul kriterleri

| Kriter | Sonuç |
| --- | --- |
| Haritada en az bir lisansı uygun doğrulanmış örnek | **USER-REPORTED PASS**: kullanıcı çizgiye dokunup kaynak kartını okudu; başka yılda kaybolma ve kaynak tarihine dönünce geri gelme doğrulandı. Bağımsız otomatik tarayıcı/GPU ölçümü yok; fiziksel Android doğrulanmadı |
| Kaynak tarihi ve sınır belirsizliği korunuyor | **PASS**: 20.6.1867 tek gün, derived tarih/geometri, yaklaşık sınır, idealized precision, medium güven/null tolerans, kaynak locator/revizyon ve kesme açıklaması |
| Lisansı belirsiz veri üretimde yok | **PASS**: dar NARA onayı; kaynak/HB/atıf/sentetik ret testleri. OHM/Historical Basemaps geometrisi paketlenmedi |

## Uygulama

- Natural Earth v5.1.2 fiziksel kara/deniz tabanı korundu. Modern ülke adı/sınırı,
  font/glyph/tile/demo endpointi eklenmedi. Yeni göl/akarsu veya daha ayrıntılı kıyı
  verisi alınmadı; taban güncel kaba fiziksel referans, antik kıyı modeli değil.
- Domain **v2**: alan/çizgi kesiti, scope, siyasi yorum ve borderPrecision; ayrı
  PoliticalRelationship (vassalage, overlapping-claim, disputed/shared-control,
  cession). Kaynaklı devir ilişkisi var, diğer ilişki türleri yalnız model/test
  desteği. V1 veri sessizce dönüştürülmez; önceki boş staging zarfı v2 yapıldı.
- ETL **1.1.0**, hak politikası **1.1.0**, pilot katalog **0.1.0-pilot**.
  Canonical katalog, iki GeoJSON LOD, coverage/time/bbox/precision/confidence
  indeksi, kaynak/transform/byte/SHA ve tam NOTICE üretiliyor.
- `pilot:prepare` ağ kullanmadan dar onaylı ham çıkarımdan tekrar üretir;
  `pilot:check` raw SHA, hak/şema/topoloji, paket ve generated modülü karşılaştırır.
- Ortak web/Expo DOM renderer yıl/katman sağlayıcı sorgusunu kullanır. Sınır
  kesik çizgiyle çizilir; çizgiden alan türetilmez. Kesin/belgeli ve kültürel
  belirsiz alan stilleri ayrıca hazırlanmıştır; kültür verisi varmış gibi gösterilmez.
- “1867 sınır örneğini göster” yıl/kamera kısayolu, gerçek feature seçimi ve kaynak
  kartı; klavye/fallback için aynı karta ayrı erişim. Genel arama geliştirilmedi.
- Köprü v1'e yalnız dar catalog.view ve ID/sürüm doğrulanan entity.selected eklendi;
  geometri köprüye konmadı. Eski async yıl yanıtı/retry/unmount işleri reddedilir;
  drag, gizli katman veya eski katalog sürümü bilgi paneli açmaz.
- OHM alımı ayrı Node karantina/cache/audit aracıdır: sınırlı GET/response/retry,
  tüm meta/üye/lisans/tarih/EDTF etiketleri. OHM yıl sıfırı ve exclusive end_date
  ayrımı korunur; bilinmeyen tarihe sonsuz geçerlilik atanmaz. Otomatik üretim
  geometri dönüşümü veya toplu dünya indirmesi yoktur.

## Gerçek kalite bulguları

NARA başlığı **1868 ödeme çeki**, iç antlaşma **1867**; ödeme tarihi geometriye
atanmadı. 141°B eski hüküm ile modern WGS84 ölçümü aynı sayılmadı. Kesme uçları
proje seçimi olarak belirtildi. Antlaşma taraflarının siyasi tanımı Yerli/fiilî
egemenlik alanına çevrilmedi. Kimlik kayıtlarının tek günlük temporal kapsamı,
devletlerin kuruluş/yıkılış tarihleri olarak yorumlanmamalıdır.

OHM San Marino adayı relation 2692735 web görünümünde 1463-06-27–1699/v16 ve sınır
kaynağı fixme içeriyor. Eski örnekteki “present” adı kopyalanmadı. API EAI_AGAIN,
13 üye/hak zinciri doğrulanamadı; geometri alınmadı. Historical Basemaps GPL
deposu araştırma referansı kaldı; **BLOCKED FOR REDISTRIBUTION** sürer.
[Ayrıntılı veri kalite raporu](../data-quality.md).

## Testler ve platform kanıtı

| Kontrol | Sonuç |
| --- | --- |
| `npm run check` | **PASS**: lint 0 uyarı; native/web strict TS; **45/45** ana + **4/4** worker testi; fiziksel asset/NOTICE ve pilot bütünlüğü; format |
| Yeni test kapsamı | 10 yeni ana test; eski 35 ana test mevcut davranış/değişen gerçek katalog durumuna uyarlanarak geçti. Gerçek pilot hash/metadata/LOD; hak scope/hash/revizyon; yıl/layer; siyasi ayrım; köprü; OHM meta/tarih/backoff; renderer seçim/stale/unmount |
| Kurulu MapLibre style-spec `validateStyleMin(physicalStyle(...))` | PASS — `styleValidationIssues: []`; shader/GPU görüntüsü kanıtı değil |
| `npm run pilot:prepare`, `pilot:check` | PASS — aynı raw girdiden deterministik üretim; generated veri, canonical paket ve NOTICE eşleşiyor |
| `npm run web:export` | PASS; 4 statik rota, gerçek pilot yerel JS kaynağında. [Log](phase-05-web-export.txt) |
| `npm run android:bundle` | PASS; Android Hermes + aynı DOM/CSS/worker/pilot. APK/Gradle/cihaz kanıtı değil. [Log](phase-05-android-export.txt) |
| `npm run test:web -- --list` | PASS — 18 senaryo keşfedildi, çalıştırılmış sayılmaz. [Liste](phase-05-browser-list.txt) |
| Hedefli gerçek pilot Playwright | `timeout 25s npm run test:web -- --grep 'kaynaklı 1867' --project desktop` → **exit 124**, test sonucu yok. **BLOCKED**. [Log](phase-05-browser.txt) |
| Gerçek OHM alımı | `npm run ohm:collect -- --relation 2692735` → **exit 1, EAI_AGAIN**. [Kayıt](phase-05-ohm-validation.txt) |
| Ortam kontrolü / fiziksel Android | Java/adb ENOENT ve Android SDK erişimi yok. **UNVERIFIED ON DEVICE**. [Ortam](phase-05-environment.txt) |

[Kalite komut kaydı](phase-05-validation.txt). Bu ortamın önceki Chromium/socket
sandbox engeli açıktır; son timeout tek başına GPU veya renderer hatası olarak
yorumlanmadı. Yeni gerçek pilot için ekran görüntüsü/GPU/touch/performans başarısı
üretilmedi. Kullanıcının daha önce doğruladığı globe/demo bu yeni geometri kabulü
yerine sayılmadı. GitHub Actions çalıştırılmadı; mevcut CI kalite işine pilot
hazırlığı/check eklendi, yeşil CI iddiası yoktur.

## Artefaktlar ve değişiklikler

[Dosya listesi](phase-05-files.txt). Ana alanlar: domain v2, kaynak/lisans manifesti,
pilot generator/check ve gerçek raw/üretim paketi; OHM karantina aracı; mevcut
renderer/protokol/host ve AtlasScreen kaynak kartı; Türkçe katalog, regresyonlar,
CI/README ve kaynak/lisans/kapsam/kalite/ADR/ilerleme kayıtları. Yeni dış bağımlılık
yok, lock değişmedi. Mevcut MapLibre/WebView/NE lisansları korunur.

Katalog SHA-256: `aa82bbbb80c717788aef752e8f1bd0d24bbab02bd1980166c2a26aebf9499bbc`.
catalog.json **13061 byte**; fine GeoJSON **287**, coarse **231**, NOTICE **1270**;
raw çıkarım **2119**. [Tam kapsam/hash manifesti](../../data/pilot/production/manifest.json).
Byte'lar açık dosya boyutudur; APK veya gzip ölçümü değildir. GeoJSON çok küçük
olduğu için vector tile/servis eklenmedi. Paket hazırlama deploy/yayın değildir.

## Kapanış ve sonraki faz önkoşulları

Önce web'de aşağıdaki kısa kabul akışı uygulanmalı:

1. `npm run web -- --host localhost --port 8081` ile açılan uygulamada
   **1867 sınır örneğini göster** düğmesine basın. Yıl 1867, kamera Alaska
   yakınında olmalı; kesikli çizgi görünmeli.
2. Çizgiye tıklayın. Kartta **20.6.1867**, yaklaşık/ideal meridyen açıklaması,
   orta konumsal güven ve NARA atfı bulunmalı. Resmî kaynak bağlantısı açılmalı.
3. Kartı kapatın; Katmanlar içinde **Devlet** katmanını kapatın. Çizgi kaybolmalı,
   kapsam notu katmanın kapalı olduğunu söylemeli.
4. Örnek düğmesiyle tekrar gösterin; **Sonraki yıl** ile 1868'e geçin. Çizgi
   kaybolmalı ve veri eksikliği açıklanmalı.
5. Kamerayı sıfırlayın; önceki küre sürükleme ve sentetik işaret seçim akışını
   tekrar kontrol edin. Sentetik işaret tarihî kaydın yerine sayılmamalı.

Otomatik senaryo
gerçek canvas, kaynak sayısı, kamera, çizgi tıklaması ve paneli sınar; screenshot
insan incelemesi de gerekir. Kullanıcı çizgi seçimi/kaynak kartı ve yıl filtresinde
gidiş/dönüş sonucunu başarılı bildirdi; aşağıdaki güncel kayıt geçerlidir.
Ardından fiziksel Android debug/release/offline, WebView bridge, touch/back/
rotation/context/bellek testleri; önceki erişilebilirlik ve audit kapıları açıktır.

Farklı çağ/bölge ve kültür pilotu için somut kayıt/üye/geometri hakkı ve bilimsel
kaynak denetimi gerekir. Bunlar yoksa kapsam genişletilmez. Yeni faza otomatik
geçilmedi; bu rapor mevcut fazın açık görsel kabulünü saklamaz.

## Son devam kontrolü

Son kaynaklarla `npm run check`, `npm run web:export` ve `npm run android:bundle`
yeniden başarılı tamamlandı; kalite ve export logları güncellendi. Dosya listesinde
**73/73** dosya mevcut; bu dosyalardaki yerel Markdown bağlantılarında eksik hedef
bulunmadı. Bu kontroller gerçek tarayıcı veya fiziksel cihaz kabulünü değiştirmez.

## Kullanıcının pilot doğrulaması — güncel

Kullanıcı bildirimi: “sınır çizgisine dokundum kaynak kartını okudum, yılı
değişince çizgi kayboldu, o tarihe gelince geri geldi”. Çizginin görünmesi,
gerçek geometri üzerinden seçim → kaynak kartı ve yıl filtresinin her iki yönde
çalışması **USER-REPORTED PASS** olarak kaydedildi. Platform önceki web denemesi
bağlamından alınmıştır; cihaz/tarayıcı sürümü veya ekran görüntüsü verilmedi.

Bu sonuç pilot için önceki görsel kanıt eksikliğini bu senaryolar kapsamında
kapatır. Katman anahtarı, kaynak bağlantısının açılması, otomatik tarayıcı paketi,
ekran okuyucu ve GPU/bellek/performans ölçümü doğrulanmış sayılmaz. Fiziksel Android
**UNVERIFIED ON DEVICE** ve önceki cihaz kapıları sürer; Faz 06 başlatılmadı.
Yalnız belgeler güncellendi; kod/veri/lisans değişmediği için otomatik testler
yeniden çalıştırılmadı. Önceki 45+4 test ve kalite/export sonuçları korunur.
