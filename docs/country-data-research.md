# Ülke haritası için veri araştırması — 17 Ekim 2026

Mevcut ülke çizimini düzeltmek için iki ayrı iş gerekir: siyasi poligon
dolgusunu kaldırmak ve ülke/yıl verisini düzeltmek. Daha büyük bir kara dosyası
indirmek, yanlış ülke adı veya eksik tarih kaydını düzeltmez. Fiziksel Natural
Earth 10m tabanı zaten mevcut. Mevcut 3D küre, kamera, kıyı/göl/akarsu tabanı
bu çalışmada korunur.

## MS 2000'de ne yanlış çıktı?

192 kaynak `POLITY` satırının tamamı isim, aralık, kaynak kimliği ve çizilebilirlik
bakımından envanterlendi. Bunlar 192 bağımsız ülke değildir: kaynak bileşik
alanlar, bağlı topraklar ve farklı siyasi oluşumlar da içerir. Tümünün bağımsız
tarihî doğruluğu onaylandı denmez.

- **Yunanistan:** kaynakta `Feature[13502]`, `Third Hellenic Republic`,
  1992–2023 aralığı var. 21 bileşenli, toplam 287 konumlu kaynak geometri çok
  genelleştirilmiş. Bir bileşendeki iki ayrı iç-halka çifti yalnız birer noktada
  temas ediyor. Bizim doğrulayıcı bu temasları yanlışlıkla `RING_INTERSECTION`
  sayıyordu. [JTS/Simple Features kuralları](https://locationtech.github.io/jts/javadoc/org/locationtech/jts/geom/Polygon.html)
  koşullu teğet temasa izin verir. Yalnız izole çiftlerde tek ve tam eşit ortak
  köşe kabul edildi; geçiş, ortak kenar, iç içe halka, çoklu temas ve temas ağı
  reddedilmeye devam eder. Kaynak koordinatları eklenmedi/taşınmadı. Yunanistan
  MS 2000 siyasi sorgusuna ve arama/odaklama akışına geri döndü. Bu, sınırın
  ayrıntılı veya bağımsız tarihçilerce doğrulanmış olduğu anlamına gelmez.
- **Ürdün Krallığı:** kaynak `Feature[13443]`, 1987–2005. Eğer kullanıcının
  gördüğü ad buysa krallık ifadesi MS 2000 için hata değildir. Kral II. Abdullah'ın
  1999'da tahta geçtiği [Ürdün devlet tarih kaydında](https://jordan.gov.jo/EN/Pages/Hashemite_Monarchs_of_Jordan),
  monarşi sistemi [Kraliyet Divanı sayfasında](https://www.rhc.jo/en/jordans-governing-system)
  açıklanır. Bu kayıt korunur; geometrisine bağımsız doğruluk onayı verilmez.
- **Gerçek ad/dönem hataları:** aşağıdaki kaynak satırları adı dönem boyunca
  yanlış taşıyor veya doğru dönem ayrımı yapmıyor. İsimler keyfî olarak
  değiştirilmedi; bütün çelişkili kaynak satırı incelemeye alındı. Ülkelerin o
  tarihlerde var olmadığı iddia edilmiyor. Geometri/isim incelemesi tamamlanmadan
  yeni bir dönem veya sınır üretilmiyor.

| Kaynak adı | Sorunlu kaynak indeksleri | Kontrol / birincil dayanak |
| --- | --- | --- |
| `Kingdom of Bahrain` | 13327 | 1973–2023 aralığı 2002'deki krallık düzenlemesini geriye taşır. [Bahreyn resmî mevzuat kaydı](https://www.lloc.gov.bh/en/Legislation/id/ConstitMemo), [WIPO Lex](https://www.wipo.int/wipolex/en/legislation/details/19650). |
| `Eswatini` | 13315, 13324, 13400 | Ad 1969/1973/1976'ya taşınmış; BM 2018 ad değişikliğini kaydeder. [BM ülke kaydı](https://www.un.org/en/about-us/member-states/eswatini). |
| `Serbia-Montenegro` | 13496, 13539, 13565 | Ad 1992'den başlatılmış; Yugoslavya'nın yeniden adlandırılması 2003'tedir. [BM mahkemesi tarihçesi](https://www.icty.org/en/about/what-former-yugoslavia), [BM protokol kaydı](https://digitallibrary.un.org/record/1129731?ln=en). |
| `Federal Republic of Somalia` | 13215 | 1960–2023'ün tamamına federal cumhuriyet unvanı verilmiş. [BM'nin 2012 geçiş açıklaması](https://www.un.org/sg/en/content/former-secretary-general/statements/2012-08-20/statement-attributable-the-spokesperson-for-the-secretary-general-somalia). |
| `People's Republic of Angola` | 13369, 13659 | Eski unvan 2023/2024'e uzatılmış; 2000'deki resmî temsilcilik metni `Republic of Angola` kullanır. [Dönemin BM açıklaması](https://www.un.org/womenwatch/daw/followup/beijing%2B5stat/statments/angola5.htm). Bu delilden kesin ad değiştirme günü türetilmedi. |
| `Libyan Arab Republic` | 13370, 13580 | Eski unvan 1976–2013'e taşınıyor; 1977'nin doğrudan belgeleri farklı ad kullanır. [BM antlaşma kaydı](https://treaties.un.org/pages/showDetails.aspx?objid=08000002800f4be6), [1977 BM kaydı](https://www.un.org/unispal/document/auto-insert-204115/). |

Önceden askıdaki `Kingdom of Great Britain`, `Mali Federation`, `Estado Novo`
ve diğer kimlik/kapsam kayıtları bu çalışmada yeniden açılmadı.
Yeni altı ad sorunu 12 kaynak satırını etkiliyor; bunların altısı MS 2000'e denk
geliyor. Ayrı 2024 Bahreyn/Esvatini/Somali kayıtları bu ad gerekçesiyle
dışlanmaz. Bozuk bir aralığın içindeki doğru alt yılları otomatik tahmin etmek
yerine bütün o kaynak satırı korunarak askıda tutulur.

Yeni sayım: MS 2000 **192 kaynak siyasi kayıt / 179 çizilebilir / 13 incelemede**.
179 sayısı bağımsız ülke sayısı veya eksiksizlik ölçüsü değildir. MS 2024:
195/186/9. MS 2025–2026 kaynakta desteklenmez. Tüm dönemlerde izole teğet
halka kontrolüyle 91 kaynak satırı geri kazanıldı; 12 yeni ad/dönem satırı askıya
alındı. 13379 geçerli metaveri satırının 12933'ü yeni dünya hattında, 16'sı eski
kimlikleri korunan pilotta çizilebilir; 430'u incelemede. 385 `RELATION`, 27
uygulama tarih aralığı dışı ve 6 bozuk/yıl-sıfır metaveri ayrıca kaydedilir.

[192 satırın tekrarlanabilir envanteri](reports/country-data-audit/ms2000.json),
[ham içe alma ve geometri kontrol raporu](reports/world-coverage/import-report.json).
`npm run world:audit-2000` envanteri yeniden üretir.

## Kaynak karşılaştırması

| Kaynak | Zaman / coğrafya / format | Lisans | Bu proje için karar |
| --- | --- | --- | --- |
| [CShapes 2.0 — ETH Zürich](https://icr.ethz.ch/data/cshapes/) | Dünya, 1886–2019; devlet ve bağlı toprak dönemleri; GeoJSON, Shapefile, CSV. MS 2000 için araştırılanlar arasında doğrudan uygun aday. Avrupa 1816 sürümü ayrı üründür. | **CC BY-NC-SA 4.0**; R paketinin GPL lisansı veri lisansı yerine geçmez. | Önce araştırma/karşılaştırma. NC ve SA yükümlülükleri nedeniyle üretim allowlist'ine otomatik eklenmedi. Eski çağları kapsamaz. |
| [Natural Earth 10m Admin 0](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/) | Çağdaş siyasi coğrafya; gün/yıl bazlı tarih kataloğu değil. Countries, sovereign states ve map units ayrı kavramlar. | [Kamu malı](https://www.naturalearthdata.com/about/terms-of-use/). | Çağdaş referans için uygun; 2000 sınırı diye yeniden tarihlenemez. Resmî sayfa countries için 5.1.1 / 4,7MB ZIP listeler; fiziksel tabanın 5.1.2 sürümüyle karıştırılmaz. |
| [geoBoundaries gbOpen](https://www.geoboundaries.org/api.html) | Ayrıntılı ADM0–alt idari katmanlar; zaman metadata'sı dosya bazında. GeoJSON/TopoJSON/Shapefile. | gbOpen CC BY 4.0; başka ürünlerinin lisansı ayrıca incelenir. | Çağdaş veya tam kaynak yılı doğrulanmış kayıtlar için uygun. `current` endpoint'i MS 2000 API'si değildir. |
| [OpenHistoricalMap](https://www.openhistoricalmap.org/copyright) | Nesne bazında tarihli ve değişken kapsama; OSM XML/PBF/Overpass JSON. | Genel CC0; `license=*` ile CC BY/SA istisnaları var. | Belirli eksikleri kaynaklı olarak tamamlayabilir; tüm dünya/yıl eksiksizliği doğrulanmadı. Relation ve üyelerin lisans, zaman, source etiketleri birlikte incelenmeli. |
| [Cliopatria 0.2.1](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1) | MÖ 3400–MS 2024; farklı zaman adımlı siyasi rekonstrüksiyonlar; GeoJSON. Yerelde mevcut. | CC BY 4.0. | Eski dönemler için aday/pilot, bağımsız ülke-yıl kontrolü şart. Yeniden indirmek mevcut ad ve geometri sorunlarını düzeltmez. |
| Historical Basemaps / referans atlasların ekranları | Heterojen tarih atlasları / siteye özgü kapsam. | Proje sicilinde Historical Basemaps veri hakları belirsiz; site görüntüsü açık veri izni değildir. | **BLOCKED FOR REDISTRIBUTION** sürer; çizim veya web ekranı kazınıp üretim coğrafyası yapılmaz. |

CShapes'in [resmî codebook'u](https://icr.ethz.ch/data/cshapes/CShapes-2.0_Codebook.pdf)
de jure kodlama, bazı küçük değişimlerin dışlanması ve bazı tarihlerde varsayılan
gün kullanılması gibi sınırlamalar bildirir. Araştırma sayfasının kapsamı 2019'a
uzanırken bu codebook taslağı 2017'den söz eder; indirilen sürümün gerçek
başlangıç/bitişi dosyadan kontrol edilecek. Bu veri de savaş içi bütün fiilî
kontrol değişikliklerini veya parsel hassasiyetini vaat etmez.

Somut bir karşılaştırma: [geoBoundaries Yunanistan ADM0 metadata'sı](https://www.geoboundaries.org/api/current/gbOpen/GRC/ADM0/)
2016 kaynak yılını, CC BY 4.0 lisansını ve 27567 köşeyi bildiriyor. Cliopatria'daki
287 konuma göre daha ayrıntılı görünse de yalnız ayrıntılı olması onun 2000'e
ait sınır kanıtı olduğu anlamına gelmez. Bu dosya indirilip 2000'e sessizce
yerleştirilmedi.

## Önerilen veri kararı

Mevcut küre motoru kalmalı. Veriler çağ/dönem ve veri türü bazında ayrılmalı:
yakın dönem için tarihli devlet/bağlı toprak kayıtları; antik/Orta Çağ için
ayrıca incelenmiş rekonstrüksiyonlar; çağdaş fiziksel taban ve çağdaş siyasi
referans ayrı. Bir veri setinin boşluğu farklı tarihteki sınırla doldurulmamalı.

Her kayıt için kalıcı kimlik, tarihli ad, bağımsız/bağlı/bileşik oluşum ayrımı,
kaynak tarih aralığı, doğrudan kaynak, lisans ve coğrafi hassasiyet gerekir.
Sadece `POLITY` etiketi bağımsız ülke onayı değildir. Örtüşen iddiaları tek
ülkeymiş gibi eritmek yerine ilişkileriyle modellemek gerekir. Ortak kara
sınırlarının komşular arasında tutarlılığı ve siyasi kıyıyla fiziksel kıyının
genelleştirme farkı ayrıca sınanmalı.

MS 2000 altın kontrolü Yunanistan/Ürdün varlığını, Yugoslavya'nın dönem adını,
Svaziland'ın dönem adını, 2002 öncesi Bahreyn unvanını; çoklu adalar, bağımlı
topraklar ve ihtilafları içermeli. Kaynak yıl içindeki bir değişimi içeriyorsa
gün hassasiyetini gizlememeli; yıllık arayüzde tek kesin durum uydurulmamalı.

Bu araştırmada **tek indirmeyle MÖ 2000–günümüzün tamamını doğru, ayrıntılı ve
sınırsız yeniden dağıtımla sağlayan bir kaynak doğrulanmadı**. CShapes yakın
dönem için daha uygun adaydır; lisansı ve tanımları ayrı değerlendirilmelidir.

## Şimdi ne indirilebilir?

Mevcut görünüm düzeltmesini görmek için indirme gerekmez. MS 2000'i daha sağlam
bir ülke kaynağıyla karşılaştırmak için en yararlı ek dosya:

1. [ETH Zürich CShapes sayfasını](https://icr.ethz.ch/data/cshapes/) açın.
2. **CShapes 2.0** satırındaki **GeoJSON** seçeneğini indirin; Avrupa-only veya
   uzaklık tablosunu seçmeyin. Yanındaki codebook'u da saklayın.
3. Dosyaları orijinal adlarıyla `data/staging/country-review/` klasörüne koyun.
   Bu klasör Git dışında bırakıldı. Henüz uygulamaya paketlenmez.

Klasörü oluşturmak ve mevcut uygulamayı açmak için:

```sh
cd ~/Belgeler/Tarih_Atlası
mkdir -p data/staging/country-review
npm run web -- --clear
```

R veya Python kurulumu gerekmez; resmî site ham coğrafya dosyası sunar.
İndirilen dosyanın salt incelemesi için yeni komut:

```sh
npm run cshapes:inspect
```

Varsayılan klasörde tek GeoJSON veya adı CShapes ile başlayan JSON/ZIP olmalı.
Dosya başka yerdeyse gerçek adını `--file` ile verin:

```sh
npm run cshapes:inspect -- --file "/tam/yol/indirilen-dosya.geojson" --year 2000
```

ZIP içinde tek GeoJSON/JSON otomatik seçilir; birden çok varsa `--member`
ile tam arşiv üyesi seçilir. ZIP için sistemde `unzip` gerekir; diske açılmaz.
Komut yalnız Git dışında kalan inceleme klasörüne checksum, gözlenen tarih
kapsamı ve aday kayıt raporu yazar; koordinat veya üretim paketi üretmez.
`INSPECTED_NOT_APPROVED` lisans/tarihî doğruluk onayı değildir. Bilinmeyen
alan adları tahmin edilmez, `SCHEMA_REVIEW_REQUIRED` ile raporlanır.
Güncel inceleyiciv2, yerelde gerçekten gözlenen `cntry_name` ve ayrı
`gwsyear/gwsmonth/gwsday`–`gweyear/gwemonth/gweday` profilini de tanır.
Eksik siyasi statü ve saat dilimsiz export tarihleri `DATA_REVIEW_REQUIRED`
ile ayrı uyarılır; takvim alanları araştırma adayı oluşturur, kesin üretim
geçerliliği vermez. Eski rapor silinmeden yeni `review-v2-*.json` yazılır.
[Komut sınırları ve bu turdaki doğrulama](reports/cshapes-preflight.md).

Terminal resmî siteyi DNS kısıtı nedeniyle indirememişti; kullanıcı dosyayı
sağladı.26344671byte/SHA384b1ea9…f9989d42 olan gerçek dosyada710satır,
1886–2019gözlenen uçlar veMS2000'de179dönem adayı bulundu.176geometri
kapıdan geçti,3incelemede;177ayrı kod bütün dünya ülkeleri demek değildir.
Dosya adı yayıncı sürümünü/kökenini doğrulamaz; kaynak kimliği ve lisans
incelemesi sürer. [Gerçek bulgular ve sınırlar](reports/cshapes-schema-review.md).
Mevcut ülke verisi üzerine otomatik yazılmaz.

**CShapes'in NC/SA koşulu somut bir kullanım kısıtıdır:**
[lisans](https://creativecommons.org/licenses/by-nc-sa/4.0/) ticari kullanım
izni vermez, türetilmiş veri için aynı lisans ve atıf ister. Ücretsiz uygulama
olmak her kullanımın otomatik olarak uygun olduğu anlamına gelmez. Veriyi MIT
diye dağıtmayacağız. Koşulsuz ticari yeniden kullanımı da korumak istenirse daha
uygun haklarla ayrı izin veya nesne bazında izinli alternatif veri gerekir.
Bu turda CShapes üretime alınmadı; uygulanan düzeltmeler mevcut izinli dosyalarla
sınırlı. Büyük dosyayı yeniden indirme veya ücretli servis kullanma zorunluluğu yok.
