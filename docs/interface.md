# Faz 03 — Atlas arayüzü

**18 Ekim 2026 — güncel sunum:** Ülkeler harita/kart/arama/listede kısa adla
görünür; uzun kaynak adları açılabilir ayrıntıda korunur. Kaynak/counter/cache
satırları ana görünümden Keşfet'e taşındı. Kartta kaynak/belirsizlik kapalı
başlar; ©atfı daima erişilebilir. Timeline yıl/oynatma/slider ile kompakt,
ölçek/hız/atlama/cetvel ayrı araç panelinde. Kısmi alan, önizleme kaynak yılı
ve hata uyarıları görünür kalır. Gerçek görsel/cihaz kabulü açık.
[Uygulama ve testler](reports/compact-country-map.md).
Aşağıdaki notlar önceki sürümlerin kayıtlarıdır.

Faz 09 ekleri: **Bu yılın kültürel kayıtları**, ≈ işaretli kültür kartı ve ayrı
lejant; kültür/siyasi katmanlar bağımsızdır. Çoklu hitte **Bu noktadaki kayıtlar**
paneli tür adları ve 8'li sayfalarla bütün adaylara erişir. Çağdaş fiziksel taban
ve tarih/alan belirsizliği açıklamaları var. [Akışlar](cultural-layer.md),
[güncel kabul](reports/phase-09.md); gerçek tarayıcı/Android kabulü açık.

2026-10-15 · **SOURCE IMPLEMENTED — PLATFORM ACCEPTANCE BLOCKED**.
Faz 02'nin gerçek küre/cihaz kanıtı yoktur. Bu arayüzün hazırlanması o kapıyı
kapatmaz. [Faz raporu](reports/phase-03.md).

## Tasarım ve bileşenler

Özgün düzen: koyu mürekkep zemin, açık kum vurgusu, ince çizgili tarih şeridi,
biçim + ad + renk taşıyan katmanlar. Geographic History'den ekran, stil, ikon,
metin veya görsel kopyalanmadı; harita/arama/tarih/panel işlevleri kullanıcı
isteğinden uygulandı. Yeni UI bağımlılığı, fotoğraf, font veya ikon paketi yok.
Sistem gliflerinin platformlar arasındaki görünümü ayrıca incelenmeli.

`src/atlas` altındaki AppHeader, GlobeViewport, TimelineBar, YearPicker,
MapControls, LayersDrawer, EntityCard, EntitySheet, AttributionPanel, LoadingState
ve ErrorState istenen bileşen sınırlarını kurar. AtlasScreen yalnız akışı ve
UI durumunu yönetir. Alan modelinin yerini almaz. GlobeViewport mevcut tek
MapViewport adaptörünü kullanır; ikinci renderer veya WebView oluşturmaz.

1100px ve üzerinde, yeterli yükseklikte ve normal metin ölçeğinde araçlar solda,
küre geniş alanda; bilgi modal paneli sağda açılır. Dar/yatay telefon veya ≥1.6
fontScale için kompakt araçlar ve alttan açılan sheet kullanılır. Başlık ve arama
üstte, tarih şeridi altta kalır. Harita bölümü flex alanını doldurur; minimum
280px. Düşük yükseklik veya büyük metinde içerik kaydırılır; tarih şeridi bağımsızdır.
Bu davranış kaynak tasarımıdır; gerçek layout ölçümü yapılmadı.

Tüm kenarlarda SafeAreaView, klavye için KeyboardAvoidingView, sheet içinde
ScrollView bulunur. Sheet %75 yükseklikle başlar, masaüstünde sağdaki 380px sütundur.
Sheet her iki düzende modal: görünür küre etkileşimi panel kapanana kadar durur.
Örtüye tıklamak paneli kapatmaz; kapat düğmesi, Escape veya Android geri kullanılır.
Kapat düğmesi odağı alır; RN Web Modal'ın focus containment/restore davranışı
kullanılır. Native erişilebilir odak ayrıca istenir; cihaz sonucu doğrulanmadı.

## Tokenlar ve anlam

Renk/boşluk/radius/tipografi/dokunma/breakpoint değerleri theme/tokens.ts içindedir.
Ortak DOM küre stili ve marker da aynı renk tokenlarını kullanır. Katman işaretleri:

| Katman | Biçim | Token | Anlam sınırı |
| --- | --- | --- | --- |
| Devlet | ▱ | state | Siyasi katman |
| Kültür | ◇ | culture | Kültürel alan, siyasi sınır değildir |
| Kişi | ● | person | Kaynak olmadan tarihlenmiş konum iddiası yok |
| Savaş | ⚔ | war | Ayrı katman |
| Olay | ✦ | event | Ayrı katman |

Anahtarların tümü tr kataloğunda; sonraki dil aynı MessageCatalog sözleşmesine
uyar. Hukuki NOTICE kaynak metni telif bildirimi olduğu için özgün dilinde korunur.
Renk tek anlam taşıyıcısı değildir; switch etiketleri tam Türkçe isimlerdir.
Dokunma hedefleri en az 48px; düğmelerde görünür odak sınırı, durum/semantik etiket,
metinlerde sistem ölçeklendirmesi var. Animasyonlu sheet/otomatik kamera hareketi
yok; loading spinner azaltılmış hareket tercihinde gösterilmez. Hatalar ve boş
sonuçlar okunur metindir. Kontrast birim testleri ekran okuyucu testinin yerini almaz.

## Akış örnekleri

1. Açılış → harita veya dürüst WebGL/asset hata açıklaması → Katmanlar → kültürü
   kapat → diğer switch'ler aynı kalsın → paneli kapat, haritaya dön.
2. Tarih düğmesi → MÖ/MS ve yıl gir → sıfır/hatalı aralıkta hata → MÖ 1 uygula →
   sonraki yıl MS 1. Sonlu kapsam MÖ 2000–cihazın güncel yılı. Bu **sunum seçimi**;
   temporal veri filtreleme, kaynak modeli veya tarih çizgisi motoru eklenmedi.
3. Arama metni → Ara/Enter → katalog boş açıklaması. İnternet sorgusu, uydurma
   sonuç veya gerçek entity araması yok. Seçili katmanlar UI görünürlük tercihi;
   boş tarihî katman renderer'larına gerçek veri bağlandığı iddia edilmez.
4. Gerçek renderer marker'ı → doğrulanmış v1 olay → sentetik EntityCard açılır.
   Harita sürüklemesi panel açmaz; marker dragstart tıklaması bastırılır, klavye
   seçimi korunur. Panel açıkken yeni marker callback'i başka panel açmaz.
5. Kapsam ve kaynaklar → eksik veri + ürün ilkeleri; Harita lisansları → fiziksel
   referans ve hazırlanmış tam bildirimler veya bildirim eksikliği açıklaması.
6. Bilgi sayfasına git/geri → önceki renderer lifecycle temizliği ve yeniden mount.

## Doğrulama planı ve sınırları

Gerçek Expo uygulamasını açan tests/web/atlas.spec.ts; bağımsız layer toggle,
modal açılış odağı, Tab containment, Escape ve focus restore; yıl sıfırı reddi,
MÖ/MS; boş arama; 320×568, 800×360 ve 1920×1080 layout/screenshot senaryoları.
UI testinde WebGL2 bilerek kapatılır; bu küre/GPU testi değildir. Önceki app.spec.ts
ise gerçek renderer beklemeyi sürdürür, marker sonrası bilgi paneli kapatılır.

Snapshot baseline **üretilmedi**. Ağ/kurulum kapısı sonrası:

```sh
npm run test:web -- tests/web/atlas.spec.ts --update-snapshots
npm run test:web
```

Üretilen görüntüleri insan incelemesinden sonra kaydet; çalışmayan uygulama için
beklenen ekran görüntüsü uydurma. Snapshot değişikliği kritik erişilebilirlik
sorunlarının kapandığı anlamına gelmez.

Android **UNVERIFIED ON DEVICE**: küçük telefon, çentik, gesture/3-button navbar,
portre/yatay/çoklu pencere, fiziksel klavye, IME aç/kapat, fontScale 1/1.5/2,
TalkBack odağı ve geri tuşu. Her durumda sheet içeriğine erişim, kapanış odağı,
harita kullanılabilir alanı, touch pan/pinch çatışması ölçülmeli. Web'de ayrıca
200% zoom/metin, keyboard-only ve ekran okuyucu deneyi gerekiyor. Başarılı tam
lint/typecheck/export, Faz 02 GPU/bridge kapıları ve gerçek testler olmadan kritik
sorunların giderildiği veya yerleşimin cihazda bütünleştiği iddia edilmez.

Resmi davranış kaynakları (2026-10-15):
[RN erişilebilirlik](https://reactnative.dev/docs/accessibility),
[RN Modal](https://reactnative.dev/docs/modal),
[RN KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview),
[React Native Web Modal](https://necolas.github.io/react-native-web/docs/modal/).
Kaynaklar API tasarımını destekler; kurulu sürüm veya cihaz başarısı kanıtı değildir.

## Faz 07 tarih etkileşimleri

Kürenin altına web range/native adjustable slider, üç ölçek, MÖ/MS doğrudan yıl
girişi ve oynatma/hız kontrolleri bağlandı. Manuel zaman hareketi ve panel açma
oynatmayı durdurur. Dar ekranda ek kontroller yatay kayar; yeni gerçek
yerleşim/ekran okuyucu kabulü henüz yapılmadı. Bilgi paneli requestedYear,
renderedSourceYear ve coverageStatus'u ayrı sunar.
[Akışlar ve kabul planı](playback.md), [faz raporu](reports/phase-07.md).

## Faz 10 — kişi akışları

Üst arama artık **kişi kataloğunda** çalışır; diğer türlerde arama tamamlandı
iddiası yoktur. Kişi kataloğu listesi 8'li sonuçlarla konumsuz kişiyi de açar.
Kişi kartı yaşam/yer ayrımı, dil fallback, kaynak yılı/dönem/hassasiyet, konum
ölçeği/kanıtı ve ayrı açılabilir diğer bağlantıları sunar. Kişi/konum sayıları
farklı etiketlenir. ≈ yaklaşık marker ayrı tercih, ◇ biyografik bağ yalnız kart
listesidir. Küme tüm adayları sayfalarla açar; sayı konum ilişkisi sayısıdır.
48 px hedefler, Türkçe semantik etiketler, kapalı panel odağı ve azaltılmış
kamera geçişi korunur. Yaklaşık tercih değişimi oynatmayı durdurur.
Gerçek web görsel/ekran okuyucu ve Android TalkBack/geri/klavye/dönme kabulü
**BLOCKED / UNVERIFIED ON DEVICE**; kaynak/TS/test geçişi bunların yerine geçmez.
[Akışların tamamı](persons.md).

## Faz 11 — yıl olay listesi ve kart akışları

**Bu yılın savaş ve olayları** 8'li listeyi açar. Savaş anahtarı WAR/BATTLE, olay
anahtarı diğer beş tür içindir; antlaşma§, savaş⚑, muharebe⚔ ve diğer olay✦ ile
yalnız renge dayanmayan ayrım yapılır. Geometrisiz kayıt listede açık mesaj taşır.
Kart tarih/konum belirsizliği, kaynak takvimi, alternatif iddia, incelemiş kaynaklar
ve varsa katılımcı/sitelink gösterir. Desteksiz yıl veya kapalı katmanda açık
unsupported mesajı ve kapalı odak kontrolü vardır. Listede loading/error ayrıdır.
Kişiyle örtüşen olay/alanlar ortak aday sayfasından seçilebilir; 48px düğme,
modal etkileşim koruması ve reduced motion odağı korunur. Gerçek browser/Android
görsel/ekran okuyucu/klavye/dönme/geri kabulü bu kaynak/test geçişiyle kapanmaz.
[Detaylı kullanım](events.md).

## Faz 13 — keşif akışları

Üst arama aynı query state'ini arama panelinde sürdürür; five-group sonuçlar,
yıl/kapsam ayrımı ve debounce/iptal var. Sonuç kartında seçili yılda kal veya
kaynaklı ilgili tarihe git; kamera ayrı odak düğmesi. Kişi approx tercihi açıkça
bildirilir. Yer imleri ve paylaşım kompakt footer eylemlerindedir; mevcut sheet
odak/geri altyapısını kullanır. Yer imi veya gelen link önce önizleme sonra
uygula; bilinmeyen kimlik marker'a dönüşmez. Tüm yeni görünür ürün metinleri TR
kataloğunda.6 yeni browser senaryosu desktop+narrow listelendi, EPERM nedeniyle
çalıştırılamadı; TalkBack/gerçek klavye/küçük ekran/screenshot kabulü açık.
[Kullanım](discovery.md), [Faz raporu](reports/phase-13.md).

## Faz 14 — katman ve ayar akışı

LayersDrawer altı bağımsız anahtar, LayerFilters, birleşik LegendPanel ve seyrek
etiket kontrolü içerir. Ayarlar paneli sabit koyu/TR, hareket azaltma, yerel kayıt
hata/retry/reset, gizlilik ve atıf sunar. Kaynak kartı filtrelenen veriyi haritada
varmış gibi sunmaz; arama katalog çapında kalır, harita odağı filtreye uymalıdır.
Kontrollerin48px satırları, switch hitSlop ve sarılan metinleri mevcut modal/
SafeArea yapısına eklenir. Gerçek cihaz ergonomi/TalkBack ve screenshot kabulü
henüz yapılmadı. [Akışlar ve elle kontrol](layers-settings.md), [rapor](reports/phase-14.md).
