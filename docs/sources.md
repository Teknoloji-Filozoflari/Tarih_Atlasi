# Wikidata bağlantıları ve denetlenebilir kaynak kartları

2026-10-16 · Faz 12 · [ADR-0013](adr/0013-source-cards.md).

## Kullanım ve kapsam

Kişi/devlet/kültür/olay kartında **Kaynakları gör** ve **Veri belirsizliği**
aynı panel içinde açılır. Yeni ekran rotası veya WebView oluşturulmaz. Kaynak
listesi, seçilen kaydın ve açıkça ilişkili kayıtların kimliklerini ayrı yazar;
bir genel Wikipedia maddesi, belirli tarih/konum iddiasının kanıtı sayılmaz.
Kişi konumunun Evidence locator'ı profilin yaşam bilgisinden ayrıdır.

`sourceLinks.resolve(wikidataId)` sırası:

1. İncelenmiş snapshot'ta açık `trwiki` URL'si varsa **Wikipedia’da aç (TR)**.
2. Türkçe yok, `enwiki` varsa **Wikipedia’da aç (EN)**; özgün dil etiketi.
3. İki dil de snapshot'ta yoksa Wikidata kayıt sayfası ve ilgili açıklama.
4. QID var ama bu kataloğun incelemesinde yoksa **bağlantı doğrulanmadı** denir;
   maddenin var olmadığı iddia edilmez. Wikidata fallback kullanılabilir.
5. Doğrulanmış QID yoksa kimlik eksikliği açıklanır; isimden URL türetilmez.

Gerçek link pilotu **1.0.0: iki QID, dört sitelink** (her biri TR+EN). Her iki
kayıtta TR seçilir. Diğer üç olay QID'si Wikidata fallback kullanır. Mevcut
siyasi pilotun QID'leri null; kültür alanı üretim kaydı yok. İngilizce ve
iki dilin de yokluğu davranışları açık sentetik unit fixture'larla doğrulanır;
bu durumları göstermek için gerçek sitelink silinmedi veya sahte veri eklenmedi.

| QID / kaynak revizyonu | Resmî sayfada incelenen sitelink hedefleri |
| --- | --- |
| [Q5582 / 2556738621](https://www.wikidata.org/w/index.php?title=Q5582&oldid=2556738621) | [TR Vincent van Gogh](https://tr.wikipedia.org/wiki/Vincent_van_Gogh), [EN Vincent van Gogh](https://en.wikipedia.org/wiki/Vincent_van_Gogh) |
| [Q83224 / 2517858800](https://www.wikidata.org/w/index.php?title=Q83224&oldid=2517858800) | [TR Hastings Muharebesi](https://tr.wikipedia.org/wiki/Hastings_Muharebesi), [EN Battle of Hastings](https://en.wikipedia.org/wiki/Battle_of_Hastings) |

Resmî Wikidata sayfasının sitelink bölümündeki bağlantı doğrudan incelendi ve
tıklandı; başlık/slug tahmin edilmedi. Terminal özgün API isteği DNS nedeniyle
başarısız: [kanıt](reports/phase-12-source-fetch.txt). Bu nedenle
`data/sitelinks/reviewed.json` **editorial-sitelink-extraction-not-http-response**
olarak etiketlidir; özgün HTTP yanıtı, tam JSON veya canlı son revizyon iddiası
yoktur. İnceleme zamanı, QID, kaynak revizyonu, explicit site/title/URL, lisans
ve atıf korunur. İçerik hash'i:
`ef29aaba13501b53e45ddf7fd2eddbf3c05d5b87fb6f0031ad8a6f2caf5c9cd7`.
Tarihî katalog **0.4.0-pilot / 19 kayıt / 7 kaynak** ve geometrileri değişmedi.

## Yayın ve yenileme

`npm run sitelinks:prepare` incelenmiş dosyanın sabit SHA'sını, katı snapshot
şemasını ve kimlik/revizyon/site/title/URL eşleşmesini denetler; generated TS ve
NOTICE üretir. `npm run sitelinks:check` dosyaların birebir eşleşmesini denetler;
`npm run check` ve CI bu kapıyı içerir. Salt `reviewStatus` değiştirerek yeni
veri yayımlanamaz: reviewed dosya, hash pin, sürüm, kaynak araştırması ve ilgili
testler birlikte review edilmelidir. Üretim olmayan API adayları reddedilir.

Çalışma zamanı çözümü offline statik snapshot'tır. LRU en çok128 giriş;
anahtar `releaseVersion/QID/trwiki-enwiki-wikidata`. Girdi kopyalanır ve sonuç
dondurulur. Sürüm değişimi yeni resolver/cache oluşturur. Zamana bağlı canlı
güncellik iddiası yoktur; inceleme tarihi kaynak panelindedir. Harita hareketi,
yıl değişimi veya kart açma Wikimedia API/WDQS isteği üretmez. Eski ağ cevabının
yeni kimliği üzerine yazabileceği bir uygulama içi HTTP hattı yoktur.

Geliştirici ETL'si için gerçek iletişim içeren `WIKIDATA_USER_AGENT` sağlanır:

```bash
npm run sitelinks:collect -- Q5582 Q83224
```

Bu komut en çok5 farklı QID alır. Tek sıralı istek, QID'ler arasında en az1s;
`wbgetentities`, GET, `props=info|sitelinks/urls`, `sitefilter=trwiki|enwiki`,
`maxlag=5`, redirect reddi,15s timeout,256KiB stream sınırı kullanır. Açıklama,
makale veya görsel indirmez. API parametreleri [resmî yardım](https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities)
ile karşılaştırıldı; `languages` filtresinin yerine doğru `sitefilter` kullanılır.

Raw/receipt/review dosyaları gitignore altındaki
`data/staging/wikidata-sitelinks/QID.*` yoluna gider. Cache key `sitelinks-v1/QID/trwiki-enwiki`; receipt içinde exact endpoint/props/
sitefilter URL ve CC0 eşleşmesi de denetlenir. Sözleşme değişirse anahtar sürümü
de değiştirilir. TTL24saat; SHA-256, byte, QID ve kaynak revizyonu eşleşmelidir.
Süre dolunca yenileme denenir. Hata raw/receipt dosyasını ezmez ve üretim
snapshot'ına yazılmaz. Review JSON her zaman `unverified / productionApproved=false`.
API kaynaklı yeni yayın için raw JSON+receipt'i koruyarak explicit linkleri,
kimliği, olası QID redirect/merge'ünü ve lisansı yeniden inceleyin; ETL sonucu
doğrudan uygulamaya import etmeyin. QID değişimi otomatik eşleştirilmez.

En çok3 deneme. Ağ/timeout için1s/2s backoff;429/503 için `Retry-After` saniye
ve HTTP-date desteklenir.30s üzeri bekleme sonraki çalıştırmaya ertelenir;
maxlag için en az5s beklenir. Büyük/geçersiz JSON, HTTP hata veya kimlik kaybı
yayıma dönüşmez. JSON/body okuma hatası komutu sonlandırır; sonsuz retry yok.
İstekler [veri erişimi](https://www.wikidata.org/wiki/Wikidata:Data_access) ve
[User-Agent politikası](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy)
referans alınarak sınırlanır. Gerçek iletişim bilgisi uydurulmadığı için bu
ortamda canlı toplayıcı başarılı çalıştı iddiası yapılmaz.

## Güvenli dış bağlantı ve platform durumu

`src/sources/url-policy.ts` ilk URL için HTTPS + tam domain allowlist uygular.
Wikipedia yalnız tr/en `/wiki/` ve doğrulanmış explicit sitelink; Wikidata
record URL'si doğrulanmış QID ile kurulabilir. Kullanıcı adı/parola, açık port,
kontrol karakteri, traversal, protokol enjeksiyonu ve benzer domainler reddedilir.
Kaynak domainleri kodda ayrıdır; yeni kaynak için lisans/source review ve testle
genişletilir. Wikipedia başlığı elle birleştirilmez. Saf domain kontrolü kimlik
kanıtı yerine geçmez; ayrıca snapshot/review/hash kapısı vardır.

Web click içinde senkron `_blank` + `noopener,noreferrer`; native HTTPS
`Linking.openURL` ile uygulama dışı sistem işleyicisi (varsayılan tarayıcı veya
kullanıcının ilişkilendirdiği uygulama). Harita WebView'i dış URL'ye gitmez;
mevcut navigation policy korunur, URL köprü komutu eklenmez. İlk hedef
denetlenir; dış tarayıcının sonraki sunucu yönlendirmeleri uygulama tarafından
kontrol edilmez. Popup engelinde noopener nedeniyle null dönüş başarıdan
ayırt edilemez; sahte hata veya sahte açılış onayı gösterilmez. Açma exception'ı
yerelleştirilmiş hata olur, endpoint/stack UI'da gösterilmez.

Kaynak bölümü route/state değiştirmez. Android AppState arka plana geçince
mevcut store yalnız oynatmayı durdurur; yıl/kamera sıfırlama çağrısı yapılmaz.
Gerçek tarayıcı ve Android dönüş/işlem ölümü kabulü **BLOCKED / UNVERIFIED ON
DEVICE**; sistemin uygulamayı öldürdüğü durumda kalıcı oturum geri yükleme bu
fazda eklenmedi. Cihazda yıl/kamera, panel, geri tuşu, çevrimdışı açma hatası,
rotasyon ve klavye odağı ayrıca test edilmelidir.

## Haklar ve doğrudan kanıt

Wikidata yapılandırılmış veri [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
Wikipedia makaleleri ve Commons görselleri bu kapsama girmez. Mevcut kısa
açıklamalar önceki lisanslı yapılandırılmış olgu pilotlarının proje metinleridir;
yeni makale özeti kopyalanmadı. P18/image URL'si görsel kullanım izni sayılmaz.
Bu sürümde görsel yok; mevcut üretim kapısı bütün kişi medyasını
`PERSON_MEDIA_RIGHTS` ile reddetmeye devam eder. İleride dosya başına sanatçı,
kaynak, lisans sürümü/URL'si, atıf ve değişiklik kaydı sağlanmadan bu kapı
gevşetilmez. [Commons lisans rehberi](https://commons.wikimedia.org/wiki/Commons:Licensing).

Kaynak repository'si exact Evidence→SourceRecord→RawInput revizyon eşleşmesini
yapar; eşleşmeyen URL'yi vermez. Source locator, hangi claim'ler, attribution,
licenseId, revision, edinme tarihi, ham path/SHA ve transformation ID'leri
sekizer kanıt/sayfa gösterilir. Belirsizlik bölümü de sekizer kayıt/sayfa;
TemporalExtent sourceDate/precision/uncertain/support ve confidence korunur.
Sorgu en çok1000 kayıtla sınırlıdır; eksik ID boş sonuçtur, sınırsız yükleme yok.

Atıflarda Natural Earth fiziksel veri, OHM (kullanılmıyor), Wikidata olguları,
Wikipedia (yalnız link), Commons (görsel yok), yerel style/MapLibre ve tile
sağlayıcısı yokluğu ayrı belirtilir. Önceki NARA ve font NOTICE'ları korunur.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION** sürer.
