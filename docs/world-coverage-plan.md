# Tüm dünyaya genişleme — gerçek kapsam ve sonraki uygulama sınırı

Kullanıcı hedefi birkaç ülke pilotu değil, dünya çapında siyasi keşiftir.
16satırlık mevcut seçki bu hedefi karşılamaz. Kullanıcının indirdiği kaynak
zaten küreseldir; bu inceleme yeni indirme veya paket kurulumu gerektirmedi.
Bu belge ve sayım **araştırma/plan** çıktısıdır; bütün ülkeler haritaya
bağlandı veya bütün tarihî iddialar doğrulandı anlamına gelmez.

## Mevcut gerçek dosya

`data/staging/map-sources/cliopatria-v0.2.1.geojson.zip`:46005176byte;
SHA256`e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4`.
Açılmış teküye172854269byte. Salt okunur akış yeniden tarandı; unzip exit0.
13797satır/1637farklıName; kaynak yıllarıMÖ3400–MS2024. Farklı ad sayısı,
1637güncel bağımsız ülke veya1637kesin ayrık kimlik demek değildir.

|Yıl|KaynakPOLITYsatırı|AyrıRELATIONsatırı|
|---|---:|---:|
|MÖ2000|4|0|
|MÖ500|48|0|
|MS1|45|1|
|MS500|58|4|
|MS1000|132|1|
|MS1453|135|5|
|MS1800|130|0|
|MS1900|88|0|
|MS2000|192|0|
|MS2024|195|0|
|MS2026|0|0|

Bu sayılar kaynaktaki satırları sayar. UNüyeliği/bağımsız devlet tamlığı,
tarihsel doğruluk veya bütün dünya topraklarının örtüldüğü hakkında sonuç
vermez. Özellikle eski çağda veri boşlukları büyüktür.2025/2026için2024
geometrisi kendiliğinden uzatılamaz; bu yıllar ayrı güncel kaynak incelemesi ister.

## Niçin yalnız16kayıt görünüyor?

`scripts/pilot/polities.mjs` izinli çıkarımı tam16satırla sınırlar;
`src/data/source-manifest.ts` lisans onayı yalnız o çıkarımın SHA'sına bağlıdır.
Diğer satırlar source-fidelity/kimlik/geometri incelemesinden geçip üretime
bağlanmış değildir. Harita motorunun yeteneği16ülkeyle sınırlı değildir.

Salt okunur MS2000örneklemi:192POLITYsatırının181'i mevcut geometri kapısından
özgün bileşenleri korunarak geçebiliyor;11'i ilave işlem gerektiriyor. Bu181
kaydı otomatik tarihsel olarak onaylamaz. Büyük örnekler:

|Kaynak adı|En uzun halka pozisyonu|Mevcut kapı|
|---|---:|---|
|United States of America|701|Aşılıyor|
|Canada|1767|Aşılıyor|
|Russian Federation|2021|Aşılıyor|
|People's Republic of China|711|Aşılıyor|

Mevcut halka sınırı512, geometri1024pozisyon, karşılaştırma100000;
MultiPolygon16bileşen ve manifest8bbox. Hatalı topoloji ayrıca reddedilir.
1000kayıtlık katalog/timeline ve512KiBbootstrap/512manifest girdi sınırları da
küresel tüm-zaman kataloğunu doğrudan gömmeye uygun değildir. Limitleri silmek
veya ülkeleri sessizce eksiltmek dünya kapsamı çözümü sayılmaz.

## Küçük uygulanabilir genişletme sırası

1. Mevcut MapLibreKüre, nativeDOM köprüsü, domain/provenance/hak kapıları,
   pilotID'leri ve yerel tercih/yerimleri korunacak. Önce dünya kataloğu için
   metaveri indeksi ile geometri yüklemesi ayrılmalı; yıl/bölgeye göre bounded
   paketler mevcutprovider sözleşmesine bağlanmalı. Tüm ZIP açılış belleğine girmez.
2. Kaynak taraması tüm13797satırda zaman/kimlik/tür/boşluk/topoloji/antimeridyen
   durumlarını raporlamalı. POLITY ile RELATION ayrı kalmalı. Hatalı adaylar
   otomatikverified yapılmamalı; ithal Wikipedia başlıklarından URL yapılmamalı.
3. Büyük geometriler için CPU/bellek bütçeli ölçeklenebilir doğrulama ve
   bileşen/LOD stratejisi uygulanmalı. Kaynak koordinatları arşivde kalmalı;
   gösterim dönüşümü, sapma ölçümü ve ada/delik kaybı kontrolleri bulunmalı.
   Kaynak hatası düzeltilmiş gibi geometri uydurulamaz.
4. Kaynakta desteklenen bütün siyasi varlıklar hedeflenmeli; kabul sayısı ve
   dışarıda kalanların nedenleri yıl bazında ekranda/raporda görünmeli.
   Metaverisi var fakat geometrisi onaylanmamış varlık listelenebilir; rastgele
   nokta veya modern sınırla doldurulamaz. Kaynak destekli rekonstrüksiyon,
   bağımsız uzman doğrulamasıyla aynı etiket altında sunulmamalı.
5. Ülke bilgileri için Wikidata kimlikleri ayrıca eşleştirilmeli; açıklamalar,
   dönemsel adlar ve mevcut Wikipedia sitelinkleri doğrulanmalı. Lisanslı
   sınır verisi kendiliğinden nüfus/başkent/hükümdar kanıtı sağlamaz.
6. Otomatik regresyonlar ve gerçek web/Android kabulü; beklenen kaynak
   sayısından eksilme ve özellikle ABD/Kanada/Rusya/Çin kaybı izlenmeli.
   Her yıl eksiksiz dünya tarihi vaadi verilmemeli.

Bu sırada yeni ücretli hesap veya dışharita motoru gereksinimi tespit edilmedi.
İlk genişleme için kullanıcıya yeni indirme komutu verilmez. Mevcut kaynaktaki
boşluklar belirlendikçe ilave kaynak, belirli kapsam ve lisansla önerilmelidir;
örneğin güncel sınır verisi bütün tarihî yıllara uygulanamaz.

## Doğrulama ve durum

[Ham satır sayımı ve192kayıtlık geometri örneklemi](reports/world-coverage/source-readiness.json).
Salt okunur Node/unzip taraması exit0; kaynak/üretim/UI değiştirilmedi.
Bu incelemede lint/typecheck/unit/export yeniden çalıştırılmadı: uygulama kodu
veya üretim kataloğu değişmedi. Önceki269ana+5worker ve export sonuçları önceki
entegrasyonun kanıtıdır. Gerçek Android **UNVERIFIED ON DEVICE**.
`git status --short` exit128: çalışma ağacı tanınmıyor; reset/silme yapılmadı.

Dünya aktarımı **NOT IMPLEMENTED / PARTIAL**; mevcut haritada hâlâ16satırlık
pilot vardır. Araştırma/indirme ihtiyacı yanıtlandı; dünya kapsamı hedefi bu
belgeyle tamamlanmış sayılmaz.
