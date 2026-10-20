# Atıf ve lisans denetimi — Faz 16

## 21 Ekim — Lisanslı JSON kataloğu

Yeni 4.053 kişi/olay kaydı Wikidata CC0 olgularıdır; özgün API JSON/revizyon/
makbuz/hash/transform korunur. Atıf paneli ve kaynak kartları erişilebilir.
`Wikidata-history-NOTICE.txt` yeni sürümü tanımlar; mevcut doğum/sitelink
bildirimleri yerinde kalır. Wikipedia metni/Commons portresi/Nobel API eseri
paketlenmedi; raw staging otomatik dağıtım onayı almadı. Bu dar veri kabulü
bütün uygulama için genel yayın onayı değildir.
[Kayıt bazındaki hak ve kalite kapıları](reports/history-import-2026-10-21.md).

## 20 Ekim 2026 — Dar kişi/olay eki

Yeni `1.4.0-births` için Wikidata yapılandırılmış olguları CC0: 56 kişi/23 olay,
79 yeni doğrulanmış sitelink. `Wikidata-broad-content-NOTICE.txt` ve sitelink
bildirimi ayrı; doğum kaynağı/revizyon/ham checksum ve kararlar korunur.
Wikipedia metni, Commons görseli veya Nobel API içeriği alınmadı. Staging
ham API yanıtları otomatik paketlenmez; yeni dış bağımlılık yok.
[Lisans sicili](license-register.md), [kanıt/kapsam](reports/broad-history-2026-10-20.md).
Bu dar veri izni genel yayın onayı değildir. Aşağıdaki tablo Faz16 anındaki
durumdur; sonraki dünya/şehir/yol paketlerinin sicili ayrıca korunur.

2026-10-16 · Veri hak kapıları **PASS**; tam uygulama dağıtımı **BLOCKED**.
Yeni dış bağımlılık, tile, görsel veya makale eklenmedi. Envanter hazırlanması
bütün transitif hakların incelendiği anlamına gelmez.

| Hak alanı | Kapsam / bildirim | Sonuç |
| --- | --- | --- |
| Proje kod/belgeleri | Kökte MIT LICENSE | Kaynak hakkı ayrı; dış veriye MIT uygulanmaz |
| MapLibre6.14.0 | BSD-3-Clause; assets/licenses + generated Notice; worker değişiklik/provenance/hash | globe:check PASS; kalan eval güvenlik kapısı lisans izninden bağımsız |
| Natural Earth5.1.2 /110m land | [Resmi kamu malı şartı](https://www.naturalearthdata.com/about/terms-of-use/); Made with Natural Earth;127 fiziksel feature/5143 konum | Taban uygun; tarihî kıyı, modern ülke veya tüm yıllarda siyasi sınır iddiası yok |
| NARA dar treaty olguları/türev çizgi | `NARA-pilot-NOTICE.txt`, kaynak revizyonu ve ham hash'e bağlı manual review | [NARA hak politikası](https://www.archives.gov/global-pages/privacy.html#copyright) kendi federal eserleri ve üçüncü taraf holdinglerini ayırır. Karar bu dar olgu çıkarımı içindir; bütün arşiv görselleri/GIS için izin değildir |
| Wikidata yapılandırılmış kişi/yer/olay/sitelink | Kişi/yer, olay ve sitelink için ayrı NOTICE; CC0 olgular; sabit kaynak revizyonları | [Resmi Copyright ayrımı](https://www.wikidata.org/wiki/Wikidata:Copyright) structured data kapsamındadır. Kişi coğrafyası review nedeniyle askıda; kaynak/atıf saklı. CC0 tarihsel doğruluk garantisi değildir |
| Wikipedia metni / Commons medyası | Makale/görsel kopyası0; yalnız incelenmiş sitelinkler | Wikidata CC0 makale veya görsele aktarılmaz; dosya/revizyon/artist/lisans/atıf tamamlanmadan paketleme kapalı |
| OHM | Üretim nesnesi0; nesne/member `license=*` ve atıf review kapısı | CONDITIONAL; otomatik offline pakete alınmaz |
| Historical Basemaps | Üretim dosyası0 | **BLOCKED FOR REDISTRIBUTION**; depo GPL metni özgün veri hak zincirini kendiliğinden çözmez |
| Uzak tile/style servisi | Runtime servis0; yerel atlas stili proje MIT kodu | Demo endpoint üretim bağımlılığı değil; bilinmeyen tile cache'i kapalı |
| Material Symbols0.4.50 | Router transitifi; wrapperMIT / fontApache-2.0 metinleri assets/licenses içinde | Kendi UI sistem fontu kullanıyor olsa da export dış font içerir; yok denemez |
| Expo FileSystem57.0.7 | MIT tam metni uygulama atfında | Mevcut cache/bookmark/preference adaptörü; yeni paket yok |
| Diğer npm/native bağımlılıklar | Aşağıdaki metadata ve dosya hash envanteri | Tam runtime/native dağıtım NOTICE/koşul incelemesi bitmedi |

`npm run qa:licenses` sınırlı8dosyalık batch ve256KiB lisans dosyası üst sınırıyla
lock metadata'sını ve paket kökündeki LICENSE/NOTICE/COPYING dosyalarının hash'lerini
çıkarır. [JSON kanıtı](reports/phase-16-dependency-licenses.json):873lock girdisi,
837kurulu sürüm eşleşmesi,873lisans etiketi,781kök bildirim dosyası bulunan paket.
92girdide bu kapsamda kök dosya yok:56kurulu paket,36kurulu eşleşmesi olmayan
platform/opsiyonel girdiler. Bu sayılar “92lisanssız paket” demek değildir;
iç alt dizin, farklı isim, upstream dağıtım ve native Maven/Gradle öğeleri ayrıca
incelenmelidir. `distributionApproved:false` bilinçlidir.

Üretim validator kaynaksız/atıfsız/izin verilmeyen, hash'i bozuk ve incelenmemiş
kayıtları reddeder; negatif domain/ETL/chunk testleri PASS. Atıf paneli katmanlar
kapalıyken de ulaşılabilir; gerçek ekran okuyucu kabulü henüz yok. Tam release
artifact'iyle eşleşen transitif NOTICE tamamlanmadan dağıtım onayı verilmez.
Yeni source research metinleri rapora kısa olgu özeti/bağlantı olarak girdi;
kurumsal makale, ekran görseli veya geometri bundle'a kopyalanmadı.
