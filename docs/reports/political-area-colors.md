# Siyasi alanları renklerle ayırma — 17 Ekim 2026

Kullanıcı sınırların tek başına yeterince okunmadığını ve yıl geçişlerindeki
değişimleri farklı ülke renkleriyle takip etmek istediğini belirtti. Bu istek
önceki dolgu kaldırma kararını değiştirir. Harita motoru, veri kapsamı ve
geometriler korunarak yalnız siyasi sunum düzenlendi.

## İnceleme, plan ve uygulama

AGENTS, README, ilerleme, siyasi renk/alan üretimi, MapLibre stili, seçim
durumu, lejant ve ilgili testler okundu. Önceki kodda siyasi dolgu opaklığı
hem veri özelliklerinde hem renderer'da sıfırdı; renkler mevcut olsa bile
görünmüyordu. Sekiz benzer ton da geniş dünya kataloğunda sık tekrar ediyordu.

Küçük plan: sabit kimlikten daha geniş mat renk aralığı üret; görünür dolgu,
sınır ve seçim vurgusunu bağla; suyu koru; lejant, test ve belgeyi güncelle.

- Renk yıl, sorgu sırası veya poligon parçasından bağımsız, mevcut varlık
  ID'sinin hash'inden gelir. HSL doygunluğu %38, açıklığı %28–34; 2520 olası
  kombinasyon. Tüm komşular için ayrı renk garantisi veya topolojik graf
  boyaması iddia edilmez; belirgin sınırlar, etiket ve seçim de kullanılır.
- Normal dolgu 0,72, seçili 0,80. Tartışmalı 0,38, ortak yönetim 0,48,
  vasal ilişkili alan 0,60; özel durumun çizgi deseni korunur. Renk varlık
  ayrımıdır; tarihî bayrak/ittifak veya siyasi hakkın kesinliği değildir.
- Sınır rengi/opaklığı koyu alanlar üzerinde daha belirgindir; mevcut ince
  zoom genişlikleri, kesikli belirsizlik ve seçimin ayrı kenar çizgisi korunur.
  Siyasi adların 10–12px boyutu büyütülmedi.
- Göller/nehirler siyasi dolgudan sonra, sınır çizgilerinden önce çizilir.
  Böylece ülke rengi fiziksel su ayrıntılarını örtmez. Kaynak geometrisi veya
  tarihî kıyı kanıtı bu katman sırası değişikliğiyle üretilmiş sayılmaz.
- Seçim aynı MapLibre feature-state üzerinden işler; tıklama, klavye etiketleri,
  yıl filtreleri ve bağımsız katmanlar korunur. Kültür alanları ayrı yumuşak
  stil taşır. Kaynaksız/incelemedeki alanlara renk/geometri eklenmez.
- Lejant açıklaması Türkçe i18n kataloğundan gelir. Kapsama eksikleri bu
  değişiklikle düzelmiş sayılmaz; renkli alanların tamamı bağımsız tarihî
  sertifika almış değildir. CShapes verisi üretime alınmadı.

## Değişen dosyalar

- `src/theme/tokens.ts`: mat renk sınırları, dolgu ve sınır tokenları.
- `src/politics/model.ts`: kimliğe bağlı HSL renk üretimi.
- `src/map/globe/style.ts`: özellik/seçim bazlı dolgu, fiziksel su sırası.
- `src/i18n/tr.ts`, `src/atlas/LegendPanel.tsx`: renk anlamı ve veri yokluğu.
- `tests/unit/politics.test.mjs`: MapLibre ifadeleriyle gerçek dolgu/seçim,
  çizgi ayrımı, su sırası ve kontrast doğrulaması.
- `tests/unit/world.test.mjs`: gerçek katalogda 2000/2001 ortak kimliklerinin
  ve parçalı adaların aynı renk taşıması.
- README, ilerleme, lisans sicili, bu rapor ve kanıt dosyaları.

Yeni bağımlılık, paket indirmesi veya lisans değişikliği yok. `git status
--short` exit128 verdi; Git çalışma ağacı görünmedi. Reset/checkout veya
kullanıcının değişikliklerini geri alma işlemi yapılmadı.

## Sonuç ve kanıt

| Durum | Kontrol | Sonuç |
| --- | --- | --- |
| IMPLEMENTED / PASS | `npm test` | 295/295; 0 fail/skip |
| PASS | `npm run test:worker` | 5/5 |
| PASS | `npm run lint`, `npm run typecheck`, `npm run format:check` | Uyarısız lint, native/web strict TS, format |
| PASS | `npm run world:check` | 13379 kaynak satırı, 374 paket / 120664555 byte hash/lisans kontrolü |
| PASS | `npm run web:export` | 4 statik rota |
| PASS | `npm run android:bundle` | Hermes + DOM JavaScript export; APK/cihaz testi değil |
| PASS | MapLibre stil ve hesaplanan kontrast probe'u | Aşağıdaki sınırlı kapsam |
| BLOCKED | Chromium launch / görsel E2E | Sandbox `Operation not permitted`; screenshot 0 |
| NOT TESTED | Gerçek Android/TalkBack/FPS/GPU bellek | **UNVERIFIED ON DEVICE** |

[Gerçek komut logları](political-area-colors/commands.json),
[hesaplanan kontrast ve katman sırası](political-area-colors/style-probe.json).

Normal tek siyasi dolgunun kara tabanı üzerine sRGB bileşiminde tüm 2520
kombinasyon ve fallback için minimum küçük metin kontrastı **5,06:1**;
seçilide **4,79:1**. Bütün siyasi durumlar içinde minimum sınır kontrastı
**3,27:1**. Bunlar hesaplanan token sonuçlarıdır; örtüşen kültür/siyasi
alanlar, gerçek WebView piksel çıktısı veya bütün renk körlüğü türlerinin
görsel kabulü değildir. Etiket, çizgi deseni ve kartlar renk dışında bilgi verir.

Eski “dolgu sıfır kalmalı” beklentisi kullanıcının yeni talebiyle görünür
dolgu/seçim davranışını doğrulayan MapLibre ifade testine dönüştürüldü;
beklenti gevşetilerek test geçirme yapılmadı. Yeni dünya testi ilk koşuda
yanlış çoğul katman anahtarları yüzünden boş görünüm oluşturdu. Gerçek
`HistoricalView` alanlarıyla düzeltildi; 100'den fazla ortak kayıt şartı
korundu. İlk başarısız koşular da loglarda saklandı.

## Kullanıcı kontrolü ve kalan risk

Yeniden indirme gerekmiyor. Çalışan sayfayı yenileyin veya:

```sh
npm run web -- --clear
```

Desteklenen MS2000/2001 gibi yıllar arasında ilerleyin; aynı kimlikler rengini
korumalı. Desteklenen farklı dönemlerde sınır değişimini, ülke seçimini,
Katmanlar'dan siyasi alanları kapatmayı ve göl/akarsu görünürlüğünü kontrol
edin. Veri bulunmayan yıl renkli bir devlet haritasıyla doldurulmamalı.

Renkler her komşuda benzersiz değil; küçük/çakışan alanlar için yakınlaştırma,
etiket ve seçim gerekir. Görsel/gerçek cihaz doğrulaması hâlâ açık. Önceki
tarihî veri/lisans yayın engelleri ve NO-GO kararı değişmedi; yeni faza geçilmedi.
