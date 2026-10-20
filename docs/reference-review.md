# İşlevsel referans incelemesi — 16 Ekim 2026

Bu inceleme telifli kod/veri/görsel aktarımı değildir. Resmi sayfalar okundu;
yerel browser engeli nedeniyle üç ürünün etkileşimli ekranı kullanılarak
karşılaştırmalı kullanılabilirlik testi yapılmadı. Aşağıdaki ayrım önemlidir:
ürünün kendi açıklaması, bizim tasarım çıkarımımız ve doğrulanmamış davranış.

| Referans / doğrudan kaynak | Görülen kanıt ve sınır | Tarih Atlası kararı |
| --- | --- | --- |
| [Chronas](https://www.chronas.org/), [istenen konum/yıl](https://www.chronas.org/?pos=36.994108%2C30.991082%2C4.25&year=2000) | Sayfa SPA kabuğu; araç okunabilir etkileşimli içerik sunmadı. Kullanıcının tarif ettiği harita yoğunluğu işlevsel hedef olarak alındı; canlı UX doğrulaması sayılmaz. | Harita ana alan; Atlas ile dünya/bölge gezinmesi ve Küre. Yoğun bilgi panellerde; sınır/isim/veri aktarılmaz. |
| [GeaCron](https://geacron.com/home-en/) | Resmi sayfa uzun zaman aralığı, krallık/muharebe/sefer ve karşılaştırmalı tarih türlerini tanımlıyor; hakları saklı. | Zaman ve coğrafya aynı bağlamda; savaş/diğer olay bağımsız; yıl aracı genişletilebilir. Yeni rota ürünü eklenmedi. |
| [Geographic History](https://geographichistory.app/) | Resmi sayfa tarih sürükleme/oynatma, harita nesnesi seçimi ve aramayı açıklıyor. Bunlar pazarlama beyanı; bağımsız performans kanıtı değil. | Küçük timeline, açık arama→tarih tercihi→odak akışı; haritayı kapatmayan temel kontroller. Oyunlar ve modern siyasi atlas katmanı alınmadı. |

Özgün düzen: arama/keşif/katman üst barı; kalan alanda tek renderer; harita üstünde
Atlas/Küre ve küçük kamera araçları; altta kapsam ve yıl. Masaüstünde sağ panel,
telefonda güvenli alanlı sheet. Renkler mevcut proje tokenları; UI metinleri
Türkçe katalog. Üç referansın ekranı/markası/harita verisi kullanılmadı.

## Fiziksel taban kararı

[Natural Earth koşulları](https://www.naturalearthdata.com/about/terms-of-use/)
fiziksel verinin yeniden kullanımına izin veren public-domain statüsünü açıklar.
Mevcut v5.1.2/110m veri korunur. Aynı sürümün yalnız **50m land** dosyasına sabit
URL'li, sınırlı hazırlayıcı eklendi; [50m kaynak dizini](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson).
İndirme DNS/EAI_AGAIN nedeniyle bu ortamda başarısız. 50m veri paketlenmiş değildir;
nullable modül ve açık 110m ölçek etiketi kullanılır. 50m bile sokak/uydu haritası
değildir; güncel kıyılar tarihî kıyı veya egemenlik kanıtı sayılmaz.

[MapLibre resmi globe örneği](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/)
ve kurulu 6.14.0 public API'si aynı Map içinde projection geçişini destekler.
Uygulama bu API'yi kullanır; örneğin demo endpointi/stili alınmadı. Android GPU,
WebGL ve gerçek etkileşim desteği yalnız resmi API'den çıkarılamaz.
