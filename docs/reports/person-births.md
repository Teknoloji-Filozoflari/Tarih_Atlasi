# İstenen kişilerin doğum kayıtları — 18 Ekim 2026

**Uygulama IMPLEMENTED; içerik PARTIAL.** Kullanıcının113kişilik listesi
incelendi. Wrightkardeşler ayrı,EdwarddeVere/Shakespeare ayrı kimliklerdir.
Yeni faza geçilmedi. `git status --short` exit128: dizinde`.git`yok;
repo başlatma/reset/checkout veya kullanıcı kaynaklarını silme yapılmadı.
Yeni bağımlılık/anahtar/hesap/portre/makale metni yok; package-lock korunur.

## Gerçek kapsam

| Durum | Adet | Harita davranışı |
|---|---:|---|
| Kaynak revizyonuyla yayımlanan profil | 111 | Arama ve kısa bilgi/Wikipedia/kaynak kartı |
| Kaynaklı doğum yılı + yaklaşık yer noktası | 66 | Yalnız doğum yılı, açık yaklaşık tercihinde |
| Yalnız biyografik doğum yeri | 20 | Kartın biyografik bağlantılarında; yıllık marker yok |
| Doğum geometrisi yayımlanamayan profil | 25 | Arama/kart; nokta veya şehir merkezi uydurulmaz |
| Kaynak revizyonu alınamayan kimlik | 2 | James Watt/Arşimet ayrı inceleme listesi; production kişi/nokta yok |

Alt satırların toplamı66+20+25+2=113;111profil üst toplamdır. Önceki VanGogh
korunur: uygulama toplam112profil. Yeni doğum extension'ı308kayıt/208source ID
(111kişi+83yer+14editöryalinceleme),14boundedkatalog. Her paketin en büyüğü
92131byte; toplam JSON1166801byte. Pilot425675byte/106kayıt korunur;
22kimlik/işaret eskiIDile değişir, birleşik yerel kayıt392. Dünya374paket,
şehir hattı, eski ikamet/ölüm/savaş/kültür/arama/yerimi akışları kaldırılmadı.
[113isim için doğrudan revizyon/yer/karar tablosu](person-birth-coverage.md).

## Kaynak incelemesi ve iddia sınırı

`data/people/raw/browser-review.json`, resmî Wikidata varlık sayfalarının
araştırma tarayıcısında incelenen **seçili yapılandırılmış olgularının editöryal
çıkarımıdır**; API payload'ı, bütün statements dökümü veya tarihsel doğruluk
sertifikası değildir. P569/P570/P19 doğum/ölüm/yer; bağlantıdaki P19 QID'si ile
ayrıca P625 kaynak koordinatı. Sayfanın gerçek oldid revizyonu alınmadan kaynak
üretim kapısından geçmez. Çıkarımdaki qualifier/alternatifler ve elle yapılan
temkinli kararlar ayrı hamdosya/notlarda korunur. Bazı Wikidata iddiaları
Wikipedia ithaline, bazıları başvuru eserine dayanır; sıfır referanslı veya
geleneksel/dinî bilgi bağımsız fiziksel bulunma kanıtı sayılmaz. Orta güven ve
temsilî konumlar “kesin GPS” gösterimine yükseltilmedi.

Atatürk1881/Selanik bilgisi ayrıca
[Kültür ve Turizm Bakanlığı biyografisi](https://www.ktb.gov.tr/TR-96300/ataturk39un-hayati.html)
ile karşılaştırıldı.19Mayıs kesin doğum günü yapılmadı; gün/aynull.
Newton1643Gregoriyen; Julian1642takvim açıklaması kaybolmaz. Gutenberg için
1393–1406kaynak penceresinden rastgele1400seçilmez. Musa/Buda/LaoTzu/Homeros
çelişkili/geleneksel kronolojilerinde uydurma kesin yıl yok. Öklid'in faaliyet
yeri doğum yeri sayılmaz. Washington/JohnDalton/Charlemagne gibi bölge ölçeği
şehir merkezine konmaz. Menes/Keops MÖ2000'e taşınmaz. Belirsiz tarih/koordinat
erişimi üretim yokluğudur; tarihte kişi/şehir bulunmadığı iddiası değildir.

Temsil noktaları güncel yer/kazı alanına aittir; tarihî sahil/şehir merkezi veya
doğum evinin hassas koordinatı iddiası taşımaz. Gün/ay doğruluğu kanıtlanmadan
aktarılmaz; yıl hassasiyetinde üretim. Tam yaşamdan ikamet veya hareket rotası
çıkarılmaz. Yeni66işaret sadece kendi doğum snapshot'ında görünür. Yaklaşık
kişi konumları varsayılan kapalı; kullanıcı eylemi açar. Eski MuhammedMedine
ikameti/GutenbergveKolombölüm ilişkileri kaynak dönemleriyle korunur.

Wikidata yapılandırılmış verisi[CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
Wikipedia/Commons metin/görsel hakları ayrı; burada hiçbiri alınmadı.
Kaynak kartları hamgirdi+revizyon+lisans+atıfı gösterir. Wikipedia bağlantıları
başlık tahminiyle yapılmaz; mevcut hizmetin gerçek TR→EN→Wikidata çözümü
kullanıcı eyleminde çalışır. Yeni profil metinleri editöryal kısa olgu notudur;
biyografilerin ayrıntılı makale özeti değildir.

## Değişen dosyalar

- `data/people/raw/{requests,browser-review,decisions}.json` ve
  `data/people/production/manifest.json`:113kimlik, kaynak ve karar, SHA/sürüm.
- `scripts/people/{build,prepare,check}.mjs`: deterministik üretim, kaynağın
  DMS→lonlat dönüşümü; yıl sıfırı/uydurma yüzyıl ortası reddi; yeniden üretim ve hak kapısı.
- `src/people/{policy,extension,runtime,discovery}.ts`,
  `src/people/generated/{index,catalog-0..13}.ts`: onaylı girdi pinleri, katalog
  başına production doğrulaması, immutable metadata, kotalıproviderbirleşimi.
- `src/data/{application,application-core,application-runtime}.ts`,
  `src/map/globe/application-loader.ts`: gerçek uygulama arama/timeline/source/
  kişi ve inlinegeometri akışı. Pilot/bridge sürüm bağlamı korunur; doğum
  extension'ı kendi1.0.0-birthsmanifestiyle sürümlüdür.
- `src/atlas/{PersonRecords,PersonCard,SearchResults,SearchTargetPanel,
  PendingPeople,AtlasScreen,AttributionPanel}.tsx`, `src/i18n/tr.ts`:
  doğum-yılı eylemi, kapsam, kaynak/eksik-konum notları, ayrı bekleyen kimlikler.
- `tests/unit/person-births.test.mjs`, `tests/web/person-births.spec.ts`,
  `tests/run.mjs`, `package.json`, `.prettierignore`: regresyon ve CI gate.
- `assets/licenses/Wikidata-births-NOTICE.txt`, `THIRD_PARTY_NOTICES.md`,
  `README.md`, `docs/{persons,architecture,license-register,source-matrix,
  release-blockers,progress}.md`, bu rapor ve kaynak tablosu.

## Komutlar ve doğrulama

Son komut sonuçları aşağıdaki kanıt kayıtlarında yer alır. Listelenen browser
testi çalışmış test sayılmaz. Android export APK/cihaz testi değildir.

- `npm run check`: lint, native+web strictTS, tüm ana ve worker testleri,
  fiziksel/pilot/attribution/sitelink/chunk/world/review/identity/places/people
  ve formatter kapıları. [Log](person-births-evidence/check.log),
  [exit](person-births-evidence/check.exit).
  Son ana test **344 PASS**, worker **5 PASS**; yeni doğum testleri9adet.
- `node tests/unit/person-births.test.mjs`:9test; kaynak/kimlik,66birthsnapshot
  ve önceki/sonraki yıl, MÖ/sıfır/parser, takvim/Atatürk, geleneksel/bölgesel
  ret, gerçek uygulama/world/sources entegrasyonu, derin immutableveri,
  hash/atıf/lisansret ve renderer kapısı. [Log](person-births-evidence/person-unit.log).
- `npm run people:prepare` / `npm run people:check`:14ayrıüretimkataloğu,
  onaylıhamSHA, çıktı/hash/sürüm/NOTICE. Kontrol hamveri değiştirilince otomatik
  onay vermez; inceleme+pin değişikliği gerekir.
- `npm run web:export`:4statikrota.
  [Log](person-births-evidence/web-export.log),[exit](person-births-evidence/web-export.exit).
  Export logunda webentry8.2MB, MapLibre1.1MB, ayrıphysical-detail20MB görünür;
  bunlar logdaki yuvarlatılmış dosya boyutlarıdır, indirme süresi/FPS ölçümü değil.
- `npm run android:bundle`:Hermes+ExpoDOMJavaScriptexport;APKdeğil.
  [Log](person-births-evidence/android-export.log),[exit](person-births-evidence/android-export.exit).
  LogdaHermesentry13MB; aynıDOMçekirdeği paketlendi. Gerçek cihazda bellek
  veya başlangıç süresi doğrulandığı anlamına gelmez.
- `npx playwright test tests/web/person-births.spec.ts --list`:6senaryo
  (desktop/narrow). [Liste](person-births-evidence/browser-list.log).
- Chromiumheadlessaçılışı:**BLOCKED**,sandbox shutdownEPERM/SIGTRAP.
  [Gerçek hata](person-births-evidence/browser-launch.log),
  [exit](person-births-evidence/browser-launch.exit). Yeni screenshot0;
  canlıharita/touch/a11y/WikipediaCORS/popup**NOT TESTED**.
- `node scripts/check-environment.mjs`:Java/adbENOENT,ANDROID_HOMEyok;
  **UNVERIFIED ON DEVICE**,FPS/RAM/ısı/pilölçülmedi.
  [Ortam](person-births-evidence/environment.log).

Test geliştirme sırasında bir nottaki `19Mayıs` yazımı ve testin yanlış kaynak
repository yöntem adı düzeltildi; üretim doğruluk şartları gevşetilmedi.
Yeni testler mevcut Node doğrudan import koşucusuna eklendi; `node --test`
alt süreçli denemesi ortamda ayrıntısız başarısız olduğundan PASS sayılmaz.

## Kullanıcı denemesi ve kalanlar

`npm run web -- --clear` →Arama→Atatürk→**Doğum yılına git ve yaklaşık konumu aç**
→1881Selanik. Kartın konuma odaklanması isteğe bağlı; yılı1882yapınca doğum
işareti kaybolmalıdır. Newton1643,Einstein1879,Curie1867 ve AristotelesMÖ384
denenebilir. Bölgesel/açık belirsiz profilde bu düğme yok. Siyasi sınırlar aynı
yılın kaynak kapsamından gelir; yeni kişi noktası eksik ülke geometrisi üretmez.

JamesWattQ9041 ve ArşimetQ8739 için tarayıcı birden fazla resmî URL'de erişim
hatası verdi. Terminalde kaynak edinimi DNS yüzünden engelli. Kullanıcı isterse
gerçek iletişim adresi içeren `WIKIDATA_USER_AGENT` ile mevcut stagingkomutunu
çalıştırabilir: `npm run persons:collect -- Q9041 Q8739`.
Sonuçlar `data/staging/wikidata-persons` altında **UNVERIFIED** kalır; production'a
otomatik alınmaz. İndirip rastgele yere koymak yerine kaynak revizyonu/P19/P625
ve zaman iddiası incelenmelidir. Kalan25profilin her birinin gerekçesi tabloda;
bazıları gerçek bölgesel/bilinmeyen doğum yeri, bazıları bu çıkarımda çözülemeyen
yer/revizyon/koordinat erişimidir. Yeni büyük indirme gerekmiyor.

Önceki güvenlik/CSP/origin/a11y/cihaz ve bağımlılık yayın engelleri sürer;
bu çalışma yayın onayı değildir. Bir sonraki faza başlanmadı.
