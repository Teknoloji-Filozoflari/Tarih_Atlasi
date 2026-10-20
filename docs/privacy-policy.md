# Tarih Atlası — Gizlilik politikası

## 19 Ekim 2026 — Kişisel harita notları

Kişi/savaş/olay başlığı, kısa metin, yıl aralığı, koordinat ve isteğe bağlı kaynak notu yalnız web localStorage veya Android uygulama dosyasında saklanır. Harita köprüsüne sadece ID/tür/koordinat aktarılır. Üretim kataloğuna, paylaşıma, Wikidata'ya veya sunucuya not gönderilmez. Kaynak metni otomatik açılmaz. Kendi kayıtlarım panelinden silinebilir; site/uygulama verisi temizlenirse notlar kaybolur. Hesapla eşitleme veya yedek yoktur. Markerları görmek için açık katman ve uygun yıl gerekir; doğrulama statüsü daima unverified. Android davranışı fiziksel cihazda henüz test edilmedi.


## Güncel yol tile istekleri — 18 Ekim 2026

Güncel yollar açıkken görünüm alanına ait tile XYZ koordinatları sabit HTTPS
`tiles.openfreemap.org` adresine gönderilir. Sağlayıcı/CDN IP, tarayıcı ve istenen
bölgeyi görebilir. Kamera GPS değildir. Yıl, varlık kimliği veya arama metni
iletilmez; isteklerde no-referrer vardır. Cross-origin çerez gönderilmez.
Tarayıcı HTTP cache başlıklarına uyar; uygulamanın offline tile paketi yoktur.
Güncel yollar kapatılabilir. Yerel tarih/şehir verisi çalışmaya devam eder.
Sağlayıcı politikası: https://openfreemap.org/privacy/ . Cihaz/ağ ölçümü henüz yok.

## 18 Ekim 2026 — Kişi isteği ve geliştirici toplaması

Uygulamadaki geniş kişi istek indeksi yereldir; arama yazısı harita hareketinde
Wikidata'ya gönderilmez. Açık Wikipedia eylemi mevcut doğrulanmış QID hizmetini
kullanır. Yeni takip/analytics/hesap/reklam eklenmedi.
Geliştiricinin açıkça çalıştırdığı `people:requests:collect`, sabit istek
listesindeki adları TR/EN Wikidata kimlik aramasına ve bulunan QID'leri entity
API'sına gönderir. Bu, uygulama kullanıcısının arama geçmişi veya telemetri
değildir. Geliştiricinin gerçek iletişim User-Agent'ı istek ve yerel, gitignored
staging receipt'lerinde bulunabilir; uygulama bundle'ına/production kataloğuna
eklenmez. `WIKIDATA_USER_AGENT` public Expo değişkeni yapılmamalıdır.

## 18 Ekim 2026 — Dünya yerleşim paketleri

Yalnız geliştirici `places:download` komutu GeoNames dump sunucusuna bağlanır.
Runtime harita hareketi, ülke listesi, seçili yıl veya arama metni GeoNames
API'sine gönderilmez. Web kendi yayın origin'inden statik paketleri, Android
yerel paketlenmiş veriyi okur; yayın sunucusu dosya isteklerini görebilir.
Kullanıcı GeoNames kaydını açarsa harici tarayıcı GeoNames'e bağlanır; Wikipedia
işleminden ayrı etiketlenir. GPS/hesap/analitik eklenmedi. [Kapsam/cache](modern-places.md).

## 18 Ekim 2026 güncellemesi

Güncel şehir referansları izinli yerel katalogdur; GPS/konum izni/canlı arama
hizmeti eklenmedi. Modern şehir tercihi aynı yerel tercih deposunda saklanır.
Kişi/olay/şehir Wikipedia işlemi mevcut isteğe bağlı QID sitelink hizmetini
kullanır; yıl/kamera/arama metni iletilmez. Portre/harici görsel otomatik yüklenmez.
[Kaynak ve sınırlar](reports/turkey-discovery.md). Aşağıdaki17Ekim metni korunur.


Sürüm/inceleme:2026-10-17. Bu belge mevcut uygulama kodunu açıklar; genel kullanıma
yayın kabulü **NO-GO**. Aynı açıklamalar uygulamada **Ayarlar ve gizlilik** ve
**Hakkında** sayfasından okunur. Metinler `src/i18n/tr.ts` kataloğundadır.

Hesap, reklam, uygulama analitiği, takip çerezi veya otomatik hata raporlama
servisi eklenmedi. Uygulama GPS istemez. Harita kamerasının koordinatı cihazın
fiziksel konumu değildir. Yerel arama dizini kullanılır; arama metni oturum
belleğinde kalır, üçüncü taraf arama servisine gönderilmez.

| Bilgi | Nerede / amaç | Silme ve sınırlama |
| --- | --- | --- |
| Katman/filtre/hareket tercihleri | Tarayıcı localStorage `tarihatlasi.preferences.v1`; Android uygulama özel dosyası | Ayarlardan yalnız tercihleri sıfırla; yıl/kamera/yer imleri bundan ayrı |
| Seçerek kaydedilen yer imleri | Yerel yıl/varlık/isteğe bağlı kamera; hesap senkronu yok | Yer imleri panelinden sil; tüm site/uygulama verilerini temizlemek de kaldırır |
| İzinli katalog cache'i | Web CacheStorage; Android cache alanı; hash ve kota kontrollü | Site/uygulama verilerini temizle; OS kendi silebilir. Kalıcı arşiv veya tam offline garantisi yok |
| İsteğe bağlı Wikidata sitelink cache'i | Yalnız ülke adına/kart işlemine tıklanınca QID, gerçek TR/EN bağlantısı ve revision; oturum belleğinde 128 girişlik LRU | En çok 24 saat; uygulama/sekme kapanınca gider. Makale/medya alınmaz, kalıcı depoya yazılmaz |
| Paylaşım URL'si | Kullanıcı eylemiyle yıl/entityId/isteğe bağlı kamera; Android seçilen paylaşım uygulaması alır | URL alıcılara, tarayıcı geçmişine ve hizmet sağlayıcılara görünür; başka uygulamalardan otomatik silinmez |
| Geliştirici performans sayaçları | Varsayılan kapalı, sınırlı yerel oturum ölçümü | Uygulama dışına otomatik gönderilmez; kullanıcı analitiği servisi yok |

Web sayfası, uygulama dosyaları ve veri parçaları yayın sunucusuna istek yapar.
Sunucu/CDN IP adresi, zaman ve URL erişim kayıtları tutabilir. Yayın sağlayıcısı,
saklama süresi ve iletişim sorumlusu henüz seçilmedi; bunlara ilişkin bir isim,
e-posta veya “hiç kayıt tutulmaz” iddiası uydurulmadı. Uygulamanın çerez yazma kodu
yok; gerçek hosting ve transitive runtime davranışı ağ incelemesiyle ayrıca
kontrol edilmelidir. Native üretim açılışı/ağ kaydı henüz doğrulanmadı.

Wikipedia, Wikidata ve kaynak bağlantıları harici tarayıcıda açılır; gidilen
sitenin kendi gizlilik/çerez politikası geçerlidir. Mevcut sürümlü yerel
sitelink kataloğu korunur. Ülke adından makale açma isteğinde bağlantı cache'te
yoksa yalnız kaynak QID'si `https://www.wikidata.org/w/api.php` adresine
gönderilir. Wikimedia hizmeti IP/bağlantı bilgilerini görebilir. Arama metni,
seçilen yıl, kamera ve yer imleri bu isteğe eklenmez. İstek credentials omit
ve no-referrer ile tasarlanmıştır; yeni çerez/analytics eklenmedi. Harita
hareketi veya sayfa açılışı bu yeni canlı sorguyu başlatmaz.

Tek eşzamanlı istek, en az 1 saniye aralık, 8 saniye timeout ve 256KiB yanıt
sınırı vardır. 429/503 sonrası Retry-After beklenir; otomatik tekrar yapılmaz.
Harici sekme uygulama yıl/kamera durumundan ayrıdır. Gerçek browser/native
ağ ve referrer davranışı henüz doğrulanmadı. ETL kaynak indirmeleri ayrı
geliştirici komutlarıdır; ürün kullanıcı araması olarak gönderilmez.

Expo geliştirme araçları uygulamanın release davranışından ayrıdır. Geliştirici
telemetrisini kapatmak için `EXPO_NO_TELEMETRY=1` kullanılabilir; Playwright/CI
komutlarında ayarlıdır. Bu ortamda gerçek cihaz ağı ve nihai hosting
incelenmediğinden gizlilik kabulü tamamlanmış sayılmaz. Yeni servis/medya/analytics
veya hosting kararı alınırsa politika ve uygulama metinleri birlikte güncellenir.
