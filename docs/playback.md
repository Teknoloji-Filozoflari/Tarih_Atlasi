# Tarih çizelgesi ve oynatma

**18 Ekim 2026 — kompakt düzen:** Yıl girişi, önce/sonra, oynat/durdur ve
slider ana şeritte. **⋯ Tarih araçlarını genişlet** panelinde tüm tarih/200/20
yıl ölçeği, ±10/100, başlangıç/bitiş, hız ve snapshot/cetvel var. Panel normal
akışta yüksekliği artırmaz; açmak oynatmayı durdurur. Veri durumu kısa etiket,
ayrıntılar Keşfet'te. Önizlemenin kaynak yılı sürekli görünür; yıl sıfırı,
manuel girdide durma ve kamera koruma aynı motor/testlerle sürer.
[Son doğrulama ve cihaz sınırları](reports/compact-country-map.md).
Aşağıdaki ilk kullanım yerleşimi tarihîdir.

2026-10-16 · Faz 07. Yeni veri veya bağımlılık yok; [Faz 06 zaman motoru](timeline.md)
aynı kalır. Yeni etkileşimler eski source/rights sınırlarını genişletmez.

## Kullanım

- Yıl düğmesi yıl panelini açar. `MÖ 44`, `MS 1867`, `1867 MS` doğrudan kabul
  edilir. Yalnız sayı seçili MÖ/MS düğmesini kullanır. Geçersiz sözdizimi,
  yıl sıfırı, MÖ 2000 öncesi ve günümüz sonrasında Türkçe hata görünür.
- Slider web'de sürüklenir; Android'de tek parmakla kullanılabilir. Tüm tarih,
  200 yıl ve 20 yıl ölçeği arasında geçilir. Dar ölçek küçük hareketle yıl
  seçimini kolaylaştırır. Dışarıya bir atlama yapılınca pencere yeni yılı kapsar;
  slider sürüklenirken pencere sabit kalır.
- Önceki/sonraki yıl, ±10/100, başlangıç (MÖ 2000), bitiş (güncel yıl) vardır.
  Dar ekranda ek kontroller yatay kaydırılabilir; safe-area AtlasScreen'de korunur.
- Web slider'ında oklar bir yıl, PageUp/PageDown yüz yıl; Home/End görünür
  slider aralığının uçlarıdır. Başlangıç/günümüz düğmeleri bütün aralığa gider.
  Native adjustable increment/decrement bir yıl ilerler; Türkçe valueText
  MÖ/MS biçimindedir. Touch hedefleri en az 48 dp, thumb görünümü 24 dp'dir.
- Oynat/durdur, 1/10/100 yıl/adım. Normal tercih 500 ms, reduced motion 1000 ms
  adım aralığıdır. Otomatik başlatılmaz, interpolasyon/kamera animasyonu yoktur.
  Son yılda durur; son yılda yeniden Oynat, MÖ 2000'den başlar.
- Çizelge sürükleme, yıl girişi/panel, atlama, preview veya panel açılması oynatmayı
  durdurur. Ekrandan çıkma/arka plan da durdurur; dönüşte kendiliğinden başlamaz.
  Harita kamerasını sürüklemek zaman girdisi değildir; oynatma devam edebilir.
- Tarih değişimi kamerayı korur. **1867 sınır örneğini göster** artık yalnız yılı
  ve devlet görünürlüğünü seçer. Çizgiyi bulmak için ayrı **Kaynaklı örneğe
  odaklan** düğmesi kullanılabilir. Önizleme açılması da kamerayı değiştirmez.
  Kamera sıfırlama açık kullanıcı eylemi olarak çalışmaya devam eder.

İnce işaretler gerçek snapshot yıllarıdır. Aralarındaki kesikli hat kesintisiz
kapsam beyanı değildir. Şu an yalnız 1867 işareti vardır; çizgi kaynağı 20 Haziran
1867'dir, bütün yılı kapsayan sınır iddiası değildir. Yoğun katalogda mobilde
24/web'de 64 gerçek kaynak yılı gösterilir; metinde seyreltme belirtilir. Hızlı
oynatma tek yıllık bir snapshot'ı atlayabilir; bu durumda sınır uydurulmaz.

## State ve aynı yıl bağlamı

| Alan | Anlam |
| --- | --- |
| requestedYear | Kullanıcının istediği yıl, hemen güncellenir |
| frame.contextYear | Bütün katman sorgularının yılı; normalde requestedYear, açık önizlemede kaynak yılı |
| renderedSourceYear | Renderer'ın en son güncel revision için uyguladığını bildirdiği geometrinin kaynak yılı; yok/bekliyor/hata durumunda null |
| renderedRequestedYear | Başarıyla uygulanan komutun istek yılı; kaynak yılından ayrı |
| coverageStatus | İstenen yılın kapsaması: loading/error veya üç Faz 06 modu; preview bunu doğrulanmış yıla çeviremez |
| renderStatus | pending/applied/unavailable: haritanın uygulama ACK durumu; GPU başarısı değildir |
| revision | Aynı yıl içindeki katman/preview değişimlerini de kapsayan sorgu kuşağı |

Bu alanlar bütün bilgi panellerindeki TimelineDetails'te Türkçe gösterilir.
Kaynak yokken veya harita hazır değilken uygulanmış geometri varmış gibi kaynak
yılı yazılmaz. Önizlemede kaynak yılı uyarısı ve seçili yıl birlikte kalır.
Sorgu hatası “veri yok” sayılmaz. İlgili frame hazır olmadan eski kişi/kültür/olay
listesi yeni yıl etiketi altında gösterilmez. Henüz kişi/olay verisi ve harita
render katmanı eklenmedi; ortak frame sorgusu bu fazın bağlantısıdır.

`src/timeline/store.ts` React'ten bağımsız external store, `frame.ts` tek adaptör,
`interaction.ts` parser/slider/atlama matematiğidir. `useTimelineStore` ekran
aboneliği, AppState ve reduced motion yaşam döngüsünü bağlar. Frame load önce
coverage'ı, ardından tek contextYear için entity/territory/person/event sorgularını
toplar. Kültür kayıtları aynı coverage sonucunda gelir. Bütün sonuçlar hazırsa
tek commit olur; biri hata verirse kısmi/tutarsız frame yayımlanmaz.

Manuel slider hareketi 80 ms trailing birleştirmeli; bırakma/blur/termination son
sorguyu flush eder. Hızlı seçimde önceki AbortController iptal edilir. Revizyon
kontrolü iptale uymayan eski adaptörün sonucunu/hatasını da reddeder. In-memory
motorun çalışan senkron döngüsü yarıda kesilmez, sonucu atılır; gelecekte ağ
adaptörü signal'ı fetch/stream'e iletmelidir. Kullanıcı iptalinden kaynaklanan
hata error durumuna dönüşmez. Timer, abonelik ve gecikmiş sorgular unmount'ta bırakılır.

## Harita köprüsü ve performans sınırı

Bridge v1'e opsiyonel revision/suspendHistory ve catalog.applied eklendi.
Revision sonlu/sınırlı tam sayı, suspendHistory boolean; ACK yıl/kaynak yılı,
mod, katalog sürümü, oturum ve yön doğrulamasından geçer. source.setData'nın
kurulu MapLibre 6.14 kaynağındaki Promise sözleşmesi await edilir; eski Promise
sonucu yeni yıl için ACK oluşturamaz. Kaynak uygulaması, fiziksel rasterizasyon
veya belirli FPS'nin doğrulandığı anlamına gelmez.

Geometri bridge'e taşınmaz. Sürüklemede bir başlangıç clear, final frame'de
bir apply gönderilir; yavaş köprüde kamera/ACK kuyruğu en son değerle birleşir
ve 8 olayla sınırlıdır. Normal query kadansı saniyede en çok iki oynatma adımıdır;
bu MapLibre kamera FPS'sini kilitlemez. Mevcut indeks/LRU/WebView/renderer ve
fiziksel taban korunur; her adımda katalog indirilmez veya harita yeniden kurulmaz.
Snapshot işaretleri yalnız katman/üst yıl değişiminde sorgulanır, her tick'te değil.
Gerçek Android bellek/FPS/touch ölçümü yapılmadı.

## Doğrulama

```sh
npm run check
npm run web:export
npm run android:bundle
npm run test:web -- tests/web/playback.spec.ts
```

Saf store testleri kontrollü clock ile kadans, hız, uçta durma, manuel giriş,
abort/debounce/flush, atomik frame ve ACK reddini sınar. Renderer testi Promise'i
geciktirip eski ACK/kamera değişimini denetler. Bunlar gerçek cihaz kanıtı değildir.
[Sonuçlar ve açık platform kabulü](reports/phase-07.md).
