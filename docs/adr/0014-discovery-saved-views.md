# ADR-0014 — Ortak yerel arama, açık tarih geçişi ve kayıtlı görünümler

2026-10-16 · Faz 13 · Koddan önce küçük uygulama planı.

1. Doğrulanmış katalogdan beş türde canonical arama girdisi ve kaynaklı geometri
   adayları; Türkçe/aksan normalleştirme, bounded sayfalama/debounce/AbortSignal.
2. Sonuç kartında seçili yılda kal / ilgili tarihe git seçenekleri. Kişi yaşamı
   konum kanıtı sayılmaz; harita odağı yalnız kaynaklı ve o yıl destekli geometri.
3. Ortak kamera planı: nokta, antimeridyen duyarlı polygon bbox, çok büyük alan
   için küre genel görünümü. Kamera/yıl ayrı; hareket yalnız açık kullanıcı isteği.
4. Yerel sürümlü en çok50 yer imi; web localStorage, Android uygulama özel
   documents dosyası. Şema, boyut sınırı, seri yazma, başarısız kaydı başarı diye
   göstermeme, bozuk/eski sürümü sessizce ezmeme ve kaybolmuş kayıt kimliği durumu.
5. year/entityId/lat/lon/zoom whitelist URL ve native scheme girişi; gelen
   bağlantı mevcut oturumu kendiliğinden değiştirmeden önizleme/uygula. Web Share
   veya seçilebilir URL; Android RN Share. Arama/yer imi adları URL'ye konmaz.
6. Unit/renderer/browser senaryoları, platform exportları, lisans ve faz raporu.

SDK yükseltilmez. Kurulu expo-file-system57.0.7, Expo57 bundledNativeModules
~57.0.7 ile eşleşiyor; MIT metni yerel paketten incelenir. Doğrudan bağımlılık
olarak tam sürüme sabitlenir; yeni transitif paket indirilmez. Sürümlü resmî
SDK57 FileSystem dokümanı ve kurulu tipler esas alınır; latest SDK58 API'si
varsayılmaz. İç uygulama dosyası için harici depolama izni istenmez.

Kamera konumu tarihî coğrafya kanıtı değildir. Kaydedilen entityId bulunamazsa
kullanıcı kayıt yılı/kamerasını geri alabilir; silinen varlık için marker veya
tarih üretilmez. Paylaşılan URL katalog/layer/approximation onayı değildir;
destekli geometri ayrıca çözülür. Gerçek Android cold/warm link, kalıcılık ve
geri/rotasyon/GPU kabulü cihazda ölçülmeden PASS sayılmaz. Faz14'e geçilmez.

## Uygulama sonucu ve sürüm ayrıntısı

Ortak indekste8 gerçek canonical sonuç; yerel50 kayıt/64KiB sınırı ve platform
adaptörleri hazır. Kamera restorasyonu optional strict camera alanıyla mevcut
catalog.view içinde atomik taşınır. Kurulu modern File tipi platform çözümünde
üyeleri sunmadığından SDK57 resmî `/legacy` API'si seçildi; type assertion ile
zorlanmadı. Paket zaten transitif kurulu ve lock'ta integrity kaydı vardı; ilk
metadata ENOTCACHED sonrası aynı kayıt root dependency'ye taşındı ve offline lock
validation/install dry-run geçti. Android geniş harici depolama izinleri blocked,
allowBackup false. Introspect manifest incelemesi gerçek Gradle/cihaz kanıtı değildir.
[Rehber](../discovery.md), [test ve platform raporu](../reports/phase-13.md).
