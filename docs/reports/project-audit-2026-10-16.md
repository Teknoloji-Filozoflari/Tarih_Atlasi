# Proje geneli inceleme — 2026-10-16

**Sonraki düzeltme kaydı:** Bu belge inceleme anını saklar. AUD-01–07 daha sonra
[yerinde ürün iyileştirmesinde](product-rework.md) regresyonlarla düzeltildi.
Güncel genel yayın kararı hâlâ NO-GO; aşağıdaki eski açık bulgular tek başına
güncel uygulama durumu sayılmaz.

**Sonuç: NO-GO. Yedi tekrar üretilen hata; mevcut platform/güvenlik/hak kapıları açık.**
Kullanıcının proje analizi isteği kapsamında inceleme yapıldı. Uygulama, ETL veya
test kaynakları düzeltilmedi; yeni bağımlılık/veri eklenmedi, Faz17 başlatılmadı.
Bu rapor önceki Faz16 denetimine ek bulgular içerir; önceki otomatik PASS bunları
kapatmaz. Öncelik: P1 yayın/veri doğruluğu için önce, P2 işlev/veri hattı düzeltmesi.

İnceleme alanları: native/web adaptörleri, ortak renderer ve bridge, zaman/frame/
oynatma, tüm katman repository'leri, domain/geometry/provenance/license şemaları,
ETL/manifest/chunk/cache, arama/link/bookmark/preference akışları, responsive/
a11y kaynakları, gizlilik, CI/kurulum ve faz/kapsam belgeleri. Generated veri
hash/şema araçlarıyla; worker AST ve ilgili taşıma koduyla incelendi. Bütün
transitif kod satırlarının veya fiziksel cihazın denetlendiği iddiası yoktur.

## Tekrar üretme kanıtı

[Salt inceleme betiği](project-audit-2026-10-16-probes.txt) proje kökünden:

```sh
node --input-type=module < docs/reports/project-audit-2026-10-16-probes.txt
```

[Gerçek çıktı](project-audit-2026-10-16-probes.log). Betik dosya/ağ yazması yapmaz;
sentetik fixture'ları veya gerçek katalog kopyasını yalnız bellekte değiştirir.
`simulateReviewed` yalnız test şemasını sınamak içindir; gerçek tarih/hak onayı
üretilmez. Çıktılar gözlem/repro'dur, yeni başarılı ürün kabul testleri değildir.

## AUD-01 · P1 · Yaklaşık kişi konumu kesin filtreden geçiyor

Konum: [engine.ts:146](../../src/timeline/engine.ts#L146),
[person model:10](../../src/persons/model.ts#L10),
[filters:66](../../src/preferences/model.ts#L66).

`recordCoverageMode` kişi için `spatialContext.coordinateRole` veya
`personLocationLevel` sonucunu dikkate almıyor. Yıl hassasiyetli, high güvenli
ama temsili şehir noktası `personLocationLevel=approximate` iken ortak motorda
`exact verified` oluyor. Yaklaşık kişi tercihi açık ve `exactOnly:true` olduğunda
`test:presence` hâlâ dönüyor, kapsam da kesin diye etiketleniyor.

Bu üretim şemasını geçen **sentetik** kayıtta doğrulandı; mevcut askıdaki Gogh
markerının geri açıldığı iddiası değildir. Etki: sonraki uygun veri kaydıyla
kesin/temsilî konum ayrımı ve güven filtresi yanıltıcı olabilir. Düzeltme:
ortak kesinlik hesaplaması kişi kanıt sınıflandırmasını kullansın; renderer,
coverage ve exactOnly aynı sonucu paylaşsın. Regresyon: site/documented-site,
city/representative-place ve approximate+exactOnly kombinasyonları.

## AUD-02 · P1 · Geri çekme politikası genel üretim ETL çıktısına uygulanmıyor

Konum: [pipeline.mjs:95](../../scripts/etl/pipeline.mjs#L95),
[publication-policy.ts:1](../../src/data/publication-policy.ts#L1),
[pilot CLI:5](../../scripts/pilot/cli.mjs#L5).

`prepareBundle(preparedPilot, 'data/pilot/raw')` bellekte çalıştırıldığında
`mode:production/status:accepted` döndürüyor; iki askıdaki kayıtta geometri ve
`reviewStatus:verified` kalıyor. Genel manifestte `publicationPolicyVersion`
yok. Harita motoru ve aktif chunk manifesti geri çekmeyi uyguluyor; dolayısıyla
**canlı haritada yanlış marker görülüyor demiyoruz**. Eksik olan genel dağıtım
kapısıdır: dışa aktarılan üretim kataloğunun tek başına tüketicisi askıyı bilemez.
Pilot CLI da hâlâ eski approximate opt-in konum mesajını yazıyor.

Özgün ham iddia arşivde korunabilir; bunun açık arşiv/review statüsü olmalıdır.
Düzeltme: arşiv ile yayın çıktısını ayır; üretim ETL kapısına ortak publication
policy uygula veya açıkça bloke et. Askı/review metadata'sını sürüm/hash'le
manifestte taşı. Regresyon, yalnız renderer'ı değil gerçek production export
ve review-report durumunu da sınamalıdır.

## AUD-03 · P2 · Kaynak kimliği/revizyon kontrolü oldid kaldırılarak atlanıyor

Konum: [source-url.ts:8](../../src/domain/source-url.ts#L8),
[validate.ts:65](../../src/domain/validate.ts#L65).

Kontrol yalnız URL'de `oldid` varsa çalışıyor; yoksa doğrudan true dönüyor.
Gerçek katalog **kopyasında** Hastings kaynağına `wikidataId:Q83224`,
`revision:2517858800` korunarak URL `https://www.wikidata.org/wiki/Q1`
verildiğinde üretim validator `ok:true/issues:[]` döndü. Mevcut kaynağın
fiilen yanlış URL taşıdığı iddiası değildir; yeni doğrulayıcının kaçırdığı
olumsuz girdidir. HTTP/API ham hash kontrolü URL kimliğiyle bağı kurmuyor.

Etki: kaynak kartı aynı iddia için başka bir Wikidata varlığına veya mutable
sayfaya yönlenebilir. Düzeltme: Wikidata kaynak kimliği ve revizyonunun URL/
upstream kayıtla bağını seçilen kaynak adres biçimine göre zorunlu denetle;
`oldid` parametresinin bulunması bu denetimi etkinleştiren isteğe bağlı şart
olmasın. Regresyon: oldid'siz yanlış QID, doğru QID ama pinned olmayan URL,
metadata QID null ve yinelenen parametreler.

## AUD-04 · P2 · Üst kaynaklı geçerli katalog parçalanamıyor

Konum: [chunks.mjs:54](../../scripts/chunks.mjs#L54).

Chunk bağımlılıkları doğrudan record evidence ve transform input'larından
seçiliyor. `SourceRecord.upstreamIds` zinciri ile üst kaynakların ham girdileri
closure'a alınmıyor. Üretim şemasını geçen sentetik child→upstream katalog,
`buildChunks` içinde `SOURCE_REFERENCE: Üst kaynak eksik` hatası veriyor.

Etki: gerçek provenance zinciri eklenen veri paketi hazırlanamaz; üst kaynakları
silmek çözüm değildir. Düzeltme: kaynak/upstream/input bağımlılıklarını bounded,
döngü kontrollü biçimde transitif topla. Regresyon: iki/üç seviyeli zincir,
ortak üst kaynak, upstream dönüşüm girdisi ve lisans reddi.

## AUD-05 · P2 · Kesintili dönem kaydı aktif olduğu yıllarda paketlenmeyebiliyor

Konum: [chunks.mjs:22](../../scripts/chunks.mjs#L22),
[runtime-core.ts:36](../../src/data/chunks/runtime-core.ts#L36).

Candidate kontrolü yalnız `temporal.start.date.year` yılında sorgulanıyor.
Dış zarf MÖ2–MS2, belgeli `periods` MÖ1 veMS1 olan geçerli sentetik territory
MÖ1 sorgusunda dönüyor; fakat zarf başlangıcında etkin olmadığından manifestte
**0girdi** oluşuyor. Test canonical JSON ile yapıldı; property sırasına bağlı
bir karşılaştırma problemiyle karıştırılmadı.

Etki: motorun desteklediği kayıt renderer'a yüklenirken
`CHUNK_COVERAGE_MISMATCH` doğurabilir. Mevcut dar pilotta bu period biçimi yok.
Düzeltme: gerçek desteklenen dönem/snapshot başlangıçlarını kullan; manifest
ile motor kapsamını karşılaştır. Regresyon: zarf başında boşluk, kesintili
snapshot/continuous ve MÖ/MS geçişi.

## AUD-06 · P2 · Kalıcı bozuk yer imi dosyası uygulama içinden kurtarılamıyor

Konum: [bookmarks.ts:62](../../src/discovery/bookmarks.ts#L62),
[BookmarksPanel.tsx:94](../../src/atlas/BookmarksPanel.tsx#L94).

Saklanan metin `{broken` olduğunda list/save/remove üçü de `SyntaxError`
veriyor; hiçbir yazma gerçekleşmiyor. UI'deki retry aynı dosyayı tekrar okur;
repo yalnız list/save/remove sunar. Ağ/depo geçici hatasının yeniden denemeyle
düzelmesi ayrı bir senaryodur. Kalıcı bozulmada kullanıcı site/uygulama verisini
sistemden temizlemek zorunda kalır; bu diğer tercihleri de silebilir.

Düzeltme: sessiz veri kaybı yaratmadan ham içeriği koruma/dışa alma ve kullanıcı
seçimli **yalnız yer imlerini** sıfırlama/kurtarma yolu. Regresyon: bozuk JSON,
bilinmeyen sürüm, şema uyuşmazlığı ve geçici okuma hatasını ayrı ele al.

## AUD-07 · P2 · Semantik olarak aynı tarihin JSON alan sırası üretimi bozuyor

Konum: [manifest.ts:84](../../src/data/chunks/manifest.ts#L84),
[chunks.mjs:74](../../scripts/chunks.mjs#L74).

`validateChunk` tarih nesnesini `JSON.stringify(record.temporal) ===
JSON.stringify(entry.temporal)` ile karşılaştırıyor. Chunk gövdesi canonicalJSON
ile anahtarları sıralarken manifest temporal nesnesi girdinin sırasını koruyor.
Gerçek katalog **kopyasında** Alaska tarihinin yalnız `end` anahtarı başa alındı;
hiçbir değer değişmedi. Önce4girdi üreten `buildChunks`, sonra
`CHUNK_VERSION_OR_SCOPE` ile başarısız oldu. Bu hash bozukluğu değildir; yeni
chunk'ın hash'i kendi canonical gövdesiyle eşleşiyor.

Düzeltme: karşılaştırmadan önce ortak canonical temsil veya doğrulanmış alanlar
üzerinden semantik tarih karşılaştırması kullan. İçeriği değiştiren tarih/scope
uyuşmazlıklarını reddetmeye devam et. Regresyon: yeniden sıralanmış TemporalExtent,
sourceDate, bound ve periods nesneleri; gerçekten farklı değerle ret.

## Önceden açık olan ve süren sorunlar

| Alan | Güncel bulgu / kanıt | Etki |
| --- | --- | --- |
| Ham Android bridge | Kurulu Expo wrapper uygulama4KiB şemasından önce JSON.parse/dispatch yapıyor; [scan](project-audit-2026-10-16-security.json) | Uygulama zarfının bütün framework taşımasını koruduğu söylenemez; kontrollü taşıma/upstream incelemesi ve native kötü mesaj testleri gerekiyor |
| Worker / CSP / origin |1globalThis.eval AST çağrısı; public/_headers yalnız cache talimatı; file allowlist tüm uygun HTML dosya adlarını kabul ediyor | Exploit kanıtlanmadı; eval erişimi, tek bootstrap pinleme ve gerçek enforced CSP doğrulanmadan yayın kapısı açık |
| Bağımlılık güvenliği | Bu tur online npm audit yine EAI_AGAIN; [yanıt](project-audit-2026-10-16-npm.json) | Önceki29düğüm/4GHSA açık kalır; bunlar güncel taramanın sonucu veya29ayrı exploit değildir |
| Transitif lisans / native NOTICE | [Önceki envanter](phase-16-dependency-licenses.json):873lock/837kurulu;56kurulu paket bu taramada kök lisans dosyası taşımıyor | Lisanssız paket hükmü değil; dağıtılan dosyalarla tam NOTICE/hak incelemesi eksik |
| İçerik kapsamı | Aynı hash'li19kayıt/7kaynak;1066/1867 coğrafyası; tam siyasi polygon0/kültür0/aktif kişi noktası0 | Dünya atlası kapsamı henüz dar teknik pilot. Gerçek kültür örtüşmesi ve tam siyasi alan kabulü yapılamıyor |
| Gerçek web / a11y |78senaryo keşfediliyor; Chromium launch sandbox_host_linux.cc Operation not permitted ile kapanıyor; [log](project-audit-2026-10-16-browser-launch.log) | E2E, focus/TalkBack, büyük yazı, gerçek composited kontrast ve görsel baseline onaylanmadı |
| Android / performans | [Ortam](project-audit-2026-10-16-environment.log):Java/adb/SDK yok | APK, WebView/GPU, pinch/back/rotation, düşük bellek/ısı/pil ve harici tarayıcı dönüşü **UNVERIFIED ON DEVICE** |
| Gizlilik / hosting | Uygulama metni var; gerçek host log politikası/sorumlu ve release ağ incelemesi yok | Yayın gizlilik kapısı açık |
| Git / CI | Dizin geçerli Git repo olarak tanınmıyor; temiz CI koşusu kanıtı yok | Geçmiş/diff/commit ve gerçek CI sonucu doğrulanamadı; repo otomatik başlatılmadı |

CI action sürümleri hata olarak işaretlenmedi: resmi
[checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) ve
[setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0)
release sayfaları erişilebilir. Bu, workflow'un çalıştırıldığı anlamına gelmez.

## Doğrulamalar ve ölçüm sınırı

| Kontrol | Bu turdaki sonuç |
| --- | --- |
| npm run check | **PASS / exit0**; [log](project-audit-2026-10-16-check.log):lint0uyarı, strict native+web TS,238ana+4worker, asset/pilot/sitelink/chunk hak/hash,formatter |
| Tekrar üretme betiği |7davranış gözlendi; [log](project-audit-2026-10-16-probes.log). Sorunlar giderilmiş sayılmaz |
| Doğrudan bağımlılıklar |24/24tam sürüm eşleşmesi; [snapshot](project-audit-2026-10-16-dependencies.json). Lisans veya zafiyet onayı değildir |
| Security scope scan |197dosya/0pattern-hit,2önceden açık gate; [log](project-audit-2026-10-16-security.log). Secret/XSS yokluğu sertifikası değil |
| Playwright --list |78senaryo/12dosya; [liste](project-audit-2026-10-16-browser-list.log). Çalıştırılmış test değildir |
| Chromium / Android / npm audit |Sırasıyla launch EPERM, araç eksikliği, registry DNS; yukarıdaki loglar. Aşılmamış ortama başarı yazılmadı |
| Export / GPU ölçümü |Kaynak değişmediği için bu analizde export/benchmark tekrarlanmadı; önceki Faz16 JS export PASS yalnız tarihî kanıt. Yeni FPS/süre veya Android başarı iddiası yok |

Regresyon boşlukları özellikle kişi kanıt düzeyinin exactOnly'ye yansıması,
production ETL review politikası, mutable kaynak adresi, üst kaynak closure'ı,
period envelope ile chunk eşleşmesi, JSON anahtar sırasından bağımsızlık ve
kalıcı yer imi bozulmasıdır. Başarılı
mevcut test sayısı bu kombinasyonların doğruluğunu kanıtlamaz.

Ayrıca responsive kaynaklarda çok sayıda pilot/diagnostic kontrol var;
AtlasScreen800satır ve footer wrapping, 650pxüstü ekranda sınırlı scroll ile
birleşiyor. Bu bir **görsel inceleme adayıdır**; browser/gerçek Android olmadan
“telefon ekranı kesin bozuk” diye sınıflandırılmadı. Arka yüz label collision,
çok sekmeli cache ve tek command state'inde aynı commit'te komut birleşmesi de
ayrı runtime/stress testi ister; bu rapordaki yedi kanıtlı hataya eklenmedi.

## Öncelik sırası

Önce AUD-01/AUD-02 ve ham bridge/origin/CSP güvenlik kapıları; sonra AUD-03/04/05
ve AUD-07 veri hattı tutarlılığı, AUD-06 kurtarma UX'i. Yeni veri hacmi ve kapsam büyümeden
bu negatif regresyonlar eklenmeli. Ardından gerçek web/Android/a11y/temiz CI ve
transitif dağıtım hakları kanıtlanmalıdır. Bu tur yalnız analiz/dokümantasyon
yapıldı; çözüm uygulaması veya sıradaki faz otomatik başlatılmadı.
