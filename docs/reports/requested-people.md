# Geniş kişi listesi: değişiklik ve doğrulama raporu

18 Ekim 2026. **Uygulama ve küçük kaynaklı ek katalog IMPLEMENTED; listenin
tamamını kaynaklı profil ve harita noktası olarak ekleme PARTIAL / kaynak
edinimi BLOCKED.** Bir sonraki ürün fazına geçilmedi.

`git status --short` exit128: bu dizinde `.git` bulunmuyor. Repo başlatılmadı,
reset/checkout veya kullanıcı kaynaklarını silme yapılmadı. Yeni dış bağımlılık
eklenmedi; paket sürümleri ve kilit dosyası korunur.

## İstenen liste ve gerçek yayın kapsamı

| Durum | Adet | Anlamı |
|---|---:|---|
| Kullanıcı metnindeki ad geçişi | 952 | Tekrarlar, parantezler ve kategori bağlamı saklı |
| Birleştirmeden sonraki ayrı istek | 823 | Doğrulanmış kişi veya harita işareti sayısı değil |
| Yeni listeden yayımlanmış profile eşleşen istek | 111 | 82 önceki profil + bu görevde eklenen29 |
| Kaynak incelemesi bekleyen kişi | 698 | Haritada yeni profil/nokta olarak yayımlanmadı |
| Müzik grubu isteği | 5 | Kişi doğum kaydı yapılmadı; açıkça verilen üyeler ayrı |
| Kullanıcı isteğiyle atlanan belirsiz ad | 9 | Yayımlanan/pending aramaya veya toplama kuyruğuna eklenmez |

111+698+5+9=823. Ana katalogda önceki listeden korunmuş başka kişiler de
bulunur: Van Gogh dahil toplam **141 kişi profili**. Bütün katalogdaki kaynaklı
yaklaşık doğum noktası **92**: önceki66 + yeni26. Bu sayılar seçili yılda aynı
anda gösterilen kişi sayısı değildir; doğum noktası yalnız kendi doğum yılında
ve kullanıcının açık yaklaşık-konum tercihiyle görünür.

Yeni29profil: Osman Gazi, II. Mehmed, I. Süleyman, İsmet İnönü, Celâl Bayar,
Bülent Ecevit, Recep Tayyip Erdoğan, Nikola Tesla, Cahit Arf, Niels Bohr,
Alan Turing, Stephen Hawking, Lionel Messi, Cristiano Ronaldo, Michael Jordan,
Steve Jobs, Bill Gates, Linus Torvalds, Yuri Gagarin, Neil Armstrong, Mark Twain,
Wolfgang Amadeus Mozart, Frédéric Chopin, Franz Kafka, Tom Hanks, Charlie Chaplin,
Alfred Hitchcock, Steven Spielberg ve **Elealı Zenon**.

Osman Gazi ve Elealı Zenon yalnız biyografik yer ilişkileridir; geleneksel/
yaklaşık kronolojiden rastgele yıllık nokta üretilmedi. İsmet İnönü kaynağındaki
doğum yapısının koordinatı alınamadı; İzmir merkezine tahminî nokta konmadı.
Diğer26kayıt kaynaklı doğum-yılı snapshot'ıdır. [823isteğin her biri ve yeni
kişilerin kaynak revizyonları](requested-people-coverage.md).

## Kullanıcı netleştirmesi ve isim işleme

Son yanıt: Zenon **Elealı olan**; diğer belirsizler uygun kaynakla
eşleştirilemiyorsa atlanacak. Zenon, kaynak Q132157 ile çözüldü. Kaynak
Wikidata/MacTutor iddiası yaklaşık MÖ490doğum/MÖ425ölümdür; farklı kronolojiler
ve yaklaşık nitelik nedeniyle bu kişiye kesin yıl/konum işareti eklenmez.
Wikipedia da yaşam bilgilerinin belirsizliğini belirtir; makale metni ithal
edilmez. [Wikidata](https://www.wikidata.org/w/index.php?title=Q132157&oldid=2546705658),
[Wikipedia karşılaştırması](https://en.wikipedia.org/wiki/Zeno_of_Elea).

Atlananlar: Sargon, Hattuşili, Mursili, Nebukadnezar, Dicle-Pileser,
Kılıç Arslan, Ptolemaios, Kral Faysal, Millî Salih Demirel. Bu kişilerin tarihte
veya Wikipedia'da bulunmadığı iddia edilmez; hangi kimliğin kastedildiği
çözülmedi. “Millî Salih Demirel” sessizce Süleyman Demirel yapılmadı.

Newton/Sir Isaac Newton, Gutenberg yazımları, Mendeleyev/Mendeleev,
Gottlieb Daimler, Galile/Galileo gibi tekrarlar temkinli eşlenir. Roma rakamları
silinmez; I. Murad/II. Murad gibi farklı kişiler ayrı kalır. İstek metni
başlıklandırıldı; birleşik görünen Tim Berners-Lee/Thales ve Binali Yıldırım/
Sargon sınırları ayrıldı. İç parantezdeki Beatles üyeleri ve Wright kardeşler
ayrı kayıttır. “Antonio Antonio Vivaldi” yazımı arama ipucu olarak saklıdır.
Kullanıcı yazımları doğrulanmış tarihî alternatif ad diye domain kayıtlarına
eklenmez; yalnız yerel arama terimlerini zenginleştirir.

## Veri ve kaynak sınırları

Yeni1.1.0-birthsrelease: **29kişi +28yer +4editöryal =61source ID**,
**86domain kayıt**,4bağımsız katalog. ToplamJSON334671byte; en büyük93139byte.
Her katalogda aynı production şeması/lisans/atıf/raw-hash incelemesi vardır.
Eski1.0.0-births ve0.7.0-discovery doğrulamaları korunur. İki doğum release'i
birleşince394extension kaydı; bootstrap ile tekilleştirilmiş yerel alan
modeli478kayıttır. Domain/512KiBpilot/256KiBpaket/64girdi/1000timeline sınırları
yükseltilmedi. Tam698kişi üretim genişletmesi bu sınırların içinde tamamlanmış
sayılmaz; ek chunk/indeks düzeni gereklidir.

Ham snapshot'lar resmî Wikidata sayfalarından seçilen yapılandırılmış olguların
**editöryal çıkarımıdır**; API JSON'u veya tüm alternatif statements dökümü
gibi sunulmaz. P569/P570/P19 ve ayrı yer P625'i gerçek oldid ile saklanır.
Kaynak bilgisi kopyalanan bir şehir/ev noktasının kişinin hassas GPS konumu
olduğu anlamına gelmez. Modern ülke etiketleri veya sınırları kişi katmanına
eklenmedi. Mark Twain'in Florida'sı Missouri yerleşimi Q537803, Florida eyaleti
Q812 değildir; Tom Hanks'in Concord'u Kaliforniya Q490441 olarak kaynağa bağlıdır.

Ölüm/yaşam sonu bilinmiyorsa, kaynaklı tek doğum yılı kanıtı yine gösterilebilir.
Timeline bu kişinin yalnız bilinen doğum yılına sınırlı destek ekler; sonraki
yıllarda hayatta olduğu veya aynı yerde yaşadığı sonucunu çıkarmaz. Yaşamın
bilinmeyen sonuna2026, sonsuz tarih veya uydurma ölüm yılı yazılmaz. Bu davranış
Messi/Ronaldo/Gates/Torvalds gibi kayıtlarla regresyon testindedir.

[Wikidata yapılandırılmış verisi CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
Wikipedia/Commons metin ve görselleri ayrı haklara tabidir; makale/portre
ithali yoktur. [Yeni NOTICE](../../assets/licenses/Wikidata-expanded-people-NOTICE.txt).
Yeni source-hash onayı kodda sabittir; collector indirmesi otomatik yayın izni
vermez. Eski ülke/tile/geometri lisans kararları değişmedi.

## Bütün kalan liste için toplama

`people:requests:collect` kişi başına TR/EN arama, tam ad/alias eşleşmesi,
P31=human, kaynak revizyonu, P19yer JSON'u ve checksum receipt toplar.
Mahalle/grup/makale gibi ad benzerleri kişi kabul edilmez. İlk sonuç otomatik
doğru kişi sayılmaz. Kaynakların qualifiers, references, rank ve sitelinkleri
ham JSON'da korunur; kişi ve yer receipt'leriyle tekrar inceleme yapılabilir.
Çıktı **UNVERIFIED / productionApproved=false**, geometri null'dır.
Üretime alma ayrı tarih/yer/hak incelemesi gerektirir.

Terminal API erişimi **EAI_AGAIN**: [gerçek bağlantı logu](requested-people-evidence/network.log),
[exit](requested-people-evidence/network.exit). Bu698kişinin kaynakları bu
ortamda toplanamadı; 823harita profili veya ülke çapında kişi kapsamı iddiası yok.
[Kullanıcının terminalinde komutlar ve devam koşulları](../people-expansion.md).
Yeni29kişiyi görmek için ek indirme/kurulum gerekmiyor.

## Değişen dosyalar

- `data/people/raw/expanded-request.txt`, `data/people/production/requests.json`:
  bütün liste, tekrarlar/kategoriler, yayın/pending/atlanan durumu.
- `data/people/expanded-raw/{browser-review,decisions}.json`,
  `data/people/expanded-production/manifest.json`: yeni kaynak/karar/SHA/sürüm.
- `scripts/people/{requests,collect-requests,expansion,check-expansion}.mjs`;
  `build.mjs`: bounded toplama, cache/resume, deterministik ayrı release.
- `src/people/{policy,extension,runtime,discovery,request-search}.ts`,
  `src/people/expanded/{index,catalog-0..3}.ts`,
  `src/people/generated/requests.ts`: pinler, immutable birleşim, arama ipuçları.
- `src/timeline/engine.ts`: bilinmeyen yaşam sonundan bağımsız, yalnız kanıtlı
  doğum yılına sınırlı kişi desteği.
- `src/data/application-core.ts`,
  `src/atlas/{PendingPeople,PersonRecords,SearchResults}.tsx`, `src/i18n/tr.ts`:
  gerçek uygulama araması, yayın/inceleme ayrımı,8satırlık sayfalama, grup notu.
- `tests/unit/requested-people.test.mjs`, `tests/web/requested-people.spec.ts`,
  `tests/run.mjs`, `package.json`, `.gitignore`, `.prettierignore`: CI/fixture gate.
- `assets/licenses/Wikidata-expanded-people-NOTICE.txt`, `THIRD_PARTY_NOTICES.md`,
  `README.md`, `docs/{people-expansion,persons,architecture,source-matrix,
  license-register,progress,release-blockers,privacy-policy}.md` ve bu rapor.

## Gerçek doğrulama kanıtları

Son bütünleşik kontrol **352 ana test +5 worker PASS**, lint ve native/web
strict typecheck PASS; web ve Android JavaScript export exit0. Yeni uygulama
testi sayısı8'dir. Aramada önce metin girişi ve yayımlanan sonuçlar, ardından
sayfalı inceleme kayıtları gösterilir; yüzlerce talep girişi arama kutusunun
önüne yığılmaz.

Export logundaki webentry8.8MB, Hermesentry13MB ve ayrı physical-detail20MB
yuvarlatılmış dosya boyutlarıdır; bunlardan başlangıç süresi/FPS/RAM çıkarılmaz.
Yeni istek metadata modülü256519byte kaynak TS'dir. Yeni29kişinin ayrı kaynak
katalogları334671byteJSON'dur. Cihazda ilk yük ve bellek ölçümü henüz yoktur.

| Komut / kontrol | Sonuç / kapsam | Kanıt |
|---|---|---|
| `npm run check` | lint, native/web strictTS, ana/worker testleri ve tüm kaynak/hash/format kapıları | [log](requested-people-evidence/check.log), [exit](requested-people-evidence/check.exit) |
| Yeni unit grubu |8test; isim muhasebesi, gruplar/atlananlar, kaynak/homonym, canlı kişi varsayımı reddi, yıl filtreleri, sentetik HTTP/cache/429/resume/corruption | [log](requested-people-evidence/unit.log) |
| `people:check` + `people:expanded:check` | Eski ve yeni ayrı release'lerin tekrar üretim/hak/SHA/atıf/NOTICE kapısı | checklog içinde |
| `npm run web:export` |4statikrota; gerçek GPU/görsel kabulü değil | [log](requested-people-evidence/web-export.log), [exit](requested-people-evidence/web-export.exit) |
| `npm run android:bundle` | Hermes+ExpoDOM JavaScript export; APK değil | [log](requested-people-evidence/android-export.log), [exit](requested-people-evidence/android-export.exit) |
| Yeni Playwright dosyasının `--list` kontrolü |6senaryo; listeleme çalışmış test sayılmaz | [liste](requested-people-evidence/browser-list.log) |
| Chromium açılışı |**BLOCKED**: sandbox shutdownEPERM/SIGTRAP; screenshot0 | [gerçek hata](requested-people-evidence/browser-launch.log), [exit](requested-people-evidence/browser-launch.exit) |
| Ortam kontrolü | Java/adb/AndroidSDK yok; npm subprocess EPERM'e karşın gerçek npm kontrolleri yukarıda çalıştı | [log](requested-people-evidence/environment.log) |

Gerçek Android **UNVERIFIED ON DEVICE**. GPU/FPS/RAM/pil/ısı, TalkBack,
gerçek dokunma ve harici tarayıcıya gidip dönme **NOT TESTED**. Canlı CORS ve
Wikipedia açılması yeni veride **NOT TESTED**; mevcut sitelink/URL guard
testleri korunur. Ülke/şehir/eski kişi/savaş/kültür işlevleri kaldırılmadı.

Önceki yayın engelleri ve NO-GO sürer. Tam698kişinin kaynak edinimi ve üretim
incelemesi, büyük liste için bounded indeks/chunk genişletmesi ve gerçek cihaz/
tarayıcı kabulü kalan önkoşullardır. Sonraki faz başlatılmadı.
