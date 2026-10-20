# Dünya şehirleri ve idari birimler

18 Ekim 2026. Altı sabit şehirle sınırlı eski referans katmanını genişletir.
Mevcut React Native/Expo uygulaması, tek MapLibre küre ve tarihî veriler korunur.

**Güncel durum, 18 Ekim 2026: kaynak kurulu, web paketleme düzeltildi.**
248 ülke/bölge kaydı, 4.999.482 yerleşim, 446.399 idari birim ve 170.872 yerleşim
bölümü; toplam5.616.753kayıt,16.102paket/645.992.949byte. Türkiye için52.786
yerleşim/2.614idari kayıt/1.720yerleşim bölümü; bunlar sadece il/ilçe veya
eksiksiz resmî envanter sayıları değildir. Kaynak edinme tarihi18Ekim2026.

Web artık native16.102asset/gzipmodül listesini import etmez. Metro geliştirme
sunucusu aynı origin `/data/places/<sha256>.atlas` yolundan yalnız manifestte
onaylı dosyayı sunar. Üretim `npm run web:export` sonrasında aynı veri dosyaları
ve NOTICE `dist/data/places` altına kopyalanır. Bu klasör dağıtıma dahildir;
`npx expo export --platform web` tek başına veri kopyalama adımını çalıştırmaz.
Native/DOM yerel dosya yolu ve güvenlik izinleri korunur; büyük native paketleme
ve fiziksel cihaz performansı ayrıca doğrulanmalıdır.

Boş açılış2024ve önceki/tarihî veriler korunur. [Son hata/test raporu](reports/metro-places.md).

**Önceki kontrol kaydı:** dünya manifesti `version:null`, sıfır paket ve
sıfır idari kayıt. Staging/Downloads içinde kaynak dosyası bulunamadı.
`places:download --verify` SOURCE_NOT_DOWNLOADED, gerçek indirme denemesi
EAI_AGAIN ile durdu. Dünya şehir/ilçe verisi henüz uygulamaya eklenmiş değildir.
Eksik pakette ülke arama/sayfalama denetimleri artık gösterilmez; açık yüklenmedi
mesajı kalır. Açılış yılı MS2024'tür; bu güncel şehir kataloğuna tarihsel
geçerlilik atamaz. [Son değişiklik ve test raporu](reports/opening-year-places.md).

## Kurulum

Web sunucusunu Ctrl+C ile durdur. Proje kökünde:

```sh
npm run places:download -- --timeout-seconds 7200
npm run places:download -- --verify
npm run places:prepare
npm run places:check
npm run check
npm run web -- --clear
```

İlk komut GeoNames `readme.txt`, `countryInfo.txt`, `admin1CodesASCII.txt`,
`admin2Codes.txt` ve `allCountries.zip` dosyalarını seri indirir. Resmî dizin
18 Ekim incelemesinde ZIP'i yaklaşık **403 MiB** gösteriyordu; günlük boyut değişir.
`cities500.zip` seçilmedi: küçük yerleşimler/idari birimler için yeterli değildir.
Ham ZIP, ara dosyalar, çıktı ve eski sürüm yedekleri için birkaç GB boş alan ayır.
Kesin çıktı boyutu/kayıt sayıları yalnız `places:prepare` bitince raporlanır.
Gerçek büyük veri üzerinde dönüşüm süresi ve bellek bu ortamda ölçülmedi.

`7200` saniye her deneme için iki saatlik üst sınırdır; bu kadar süreceği
anlamına gelmez. GeoNames için bu sınır desteklenir, diğer harita kaynaklarının
30 dakikalık üst sınırı korunur. Bayt/retry/eşzamanlılık kotaları değişmez.

Yeni npm paketi, hesap veya API anahtarı gerekmez. Sistem `unzip` kullanılır;
bu ortamda `/usr/bin/unzip` mevcut. CachyOS'ta yoksa
`sudo pacman -S --needed unzip`. Hiçbir SDK ayarı değiştirilmez.

İndirme yarıda kalırsa ilk komutu tekrarla: tamamlanmış receipt/hash kontrolü
geçen dosya yeniden alınmaz. Sahipsiz/bozuk kullanıcı dosyası silinmez;
`*_PRESERVED` hatasında dosya ve `.receipt.json` kaydını incele. Yeni snapshot
için eski staging klasörünü başka bir adla arşivleyip tekrar indir. Manifest
her dosyanın ayrı edinme tarihini/SHA256'sını saklar; aynı güne ait olduklarını
iddia etmez. Farklı günlerin dosyalarını bilinçsizce karıştırma.

Hazırlayıcı bütün girdileri/lisansı kontrol eder, izole klasörde dönüştürür;
doğrulanan çıktı `assets/places` ve `src/places/generated/world` altına kurulur.
Önceki generated klasörler `data/staging/geonames/previous-*` altında korunur.
Ham girdiler, altı önceki Wikidata şehri ve tarihî katalog değiştirilmez.
Kurulumda sunucuyu kapat; üretim dosyalarını elle düzenleme.

## Kullanım

- **Katmanlar → Güncel şehirler ve idari birimler** bağımsız açılıp kapanır.
- Zoom4 büyük yerleşim/birinci idari düzey; zoom6 ikinci idari düzey ve küçük
  merkezler; zoom8 küçük yerleşim/bölümleri ve üçüncü/dördüncü idari düzey.
  İdari kayıt `◇`, yerleşim `·` ile ayrılır; en fazla32 çakışmasız etiket.
- **Ülkelere göre şehir ve ilçe kayıtlarını gez**: kaynak ülke adı veya `TR`,
  `DE`, `EG` koduyla ülke seç. Yerleşim/idari kayıt ayrı, en fazla40 kayıtlık
  sayfalardır. Bir sayfa en fazla8 paket tarar. Boş ara sayfa kapsam yokluğu
  değildir; devam imleci varsa sonraki sayfa açılır. Bu ekran dünya çapında
  şehir adıyla arama değildir; mevcut tarihî arama korunur.
- Kartta ad/tür/ülke, kaynakta çözülen üst birimler, kaynak tarihi, yaklaşık
  nokta, ayrıntı ve GeoNames bağlantısı; **Bu güncel noktaya odaklan** yılı
  değiştirmeden kamerayı değiştirir. Kaynak adları korunur; makine çevirisi yok.
- GeoNames kaydından Wikipedia başlığı/URL'si tahmin edilmez. Doğrulanmış QID
  eşlemesi olmayan yeni kayıtta gerçek GeoNames bağlantısı ve eksik eşleme
  durumu gösterilir. Önceki altı QID'nin Wikipedia akışı sürer.

## Kaynak ve doğruluk

[Dump README](https://download.geonames.org/export/dump/readme.txt),
[alan kodları](https://www.geonames.org/export/codes.html),
[dizin](https://download.geonames.org/export/dump/),
[CC BY4.0](https://creativecommons.org/licenses/by/4.0/legalcode.en).
GeoNames atıf gerektirir; kod MIT ve Wikidata CC0 haklarından ayrıdır. README
lisansı değişirse **LICENSE_REVIEW_REQUIRED**. Paketlerde lisans/sürüm/sentetik
bayrağı; manifestte girdi URL/hash/byte/edinme tarihi, ülke/tür sayıları,
bbox/LOD bulunur. Generated NOTICE ve uygulama atfı yapılan değişiklikleri belirtir.

Güncel `P` yerleşim kodları ve `A.ADM1–ADM4` alınır. Eski/terk edilmiş/yıkılmış
yerler (`PPLH/PPLQ/PPLW/PPLCH`), tarihî idari kayıtlar, modern ülke sınırları,
sokak/binalar alınmaz. ADM5/ADMD bu sürümde kapsam dışı. Eksiksiz resmî ilçe
envanteri iddiası yok; kaynaksız yer oluşturulmaz. Sayılar dünya toplamı değildir.

**İlçe sınır poligonu çizilmez.** PPLA2 idari merkez yerleşimi; ADM2 idari
birimin temsil noktasıdır. Her ülkede ikinci düzey “Türkiye'deki ilçe” sayılmaz.
Üst ilişkiler yalnız kaynak ülke+admin koduyla bağlanır; en yakın şehre dayanan
üyelik tahmini yapılmaz. Çözülemeyen ad boş, özgün kod ayrıntılarda kalır.
ADM3/4 adları/kodları korunur; üst adlar yalnız admin1/admin2 tablosunun kapsamındadır.

Koordinatlar WGS84 boylam-enlemdir. Son değişiklik tarihi kuruluş veya seçili
yıl geçerliliği değildir. Nüfus sadece etiket sıralamasında, UI nüfus iddiası yok.
Modern katalog **HistoricalPlace/TemporalExtent ve tarihî yıl kapsamı dışındadır**.
MÖ/MS seçimi güncel şehri o tarihe ait kılmaz; katman/kart bunu açıklar.

## Ölçek, köprü ve güvenlik

Satır akışı, 2° hücre+LOD disk spool'u, en fazla16 açık dosya, 800satır/256KiB
paket. ZIP'ten sadece sabit `allCountries.txt` okunur; arşiv yolları açılmaz.
768MiB ZIP/8GiB açılmış akış/20milyon satır/30bin paket üst sınırı. Global
yinelenen kimlikler sınırlı bitset ile reddedilir. Sentetik varsayılan üretime
geçmez; testler geçici klasördedir.

Görünür bbox/LOD için en fazla64 paket, iki eşzamanlı iş; yaklaşık12bin aday
sonrasında yoğunluk raporu,32 etiket bütçesi. LRU sekiz chunk/2MiB serileştirilmiş
veri (JS nesne belleği ayrıca). İptal ve kamera generation'ı eski yanıtı
çizdirmez; katman kapatma/background/pause/unmount işi iptal eder. Hata küreyi
kaldırmaz; yeniden deneme vardır.

Web aynı origin Expo `.atlas` dosyalarını hash ile doğrular. Native UI yerel
dosyadan, DOM mevcut file-origin izinlerini gevşetmeden gzip modüllerinden okur.
Önceki dünya geometrisiyle ortak nativecache32MiB/128dosya ve refcount hold.
Tüm dünya veri paketi geldiğinde native boyutu ve sıkıştırılmış modül belleği
ayrıca ölçülmelidir; APK kabulü yoktur.

`place.selected` version1 zarfında yalnız `cityId/packIndex/catalogVersion`
taşır; host manifest ve hash kontrolünden geçen yerel paketten kimliği çözer.
Ad/koordinat/URL veya dünya listesi köprüden taşınmaz. Eski `city.selected`
altı küratörlü kimlik için korunur.4096byte/bilinmeyen alan ret kuralları sürer.
Harici GeoNames URL yalnız `https://www.geonames.org/<sayısal-id>/` olabilir.
Harita hareketinde GeoNames API/üçüncü tarafa arama/GPS isteği yoktur.

## Gerçek durum

**INSTALLED:** gerçek dünya paketi bu çalışma sırasında mevcut bulundu ve
bütün paketlerin hash/şema/atıf/DOM kopya kontrolleri çalıştırıldı. Web exportunda
şehir gzip JS modülü sayısı0;16.102asılpaket veri dosyası olarak korunur.
Gerçek Türkiye idari kayıtları kaynak/dosya yolundan okunarak doğrulandı.
Tarayıcı/GPU ve fiziksel Android için doğrulandı denmez.
[Güncel test/komut kanıtı](reports/metro-places.md); önceki veri edinimi engeli
[önceki raporda](reports/modern-places.md) tarihsel kayıt olarak saklanır.
