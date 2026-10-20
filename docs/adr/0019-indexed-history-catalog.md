# ADR 0019 — İndirilmiş kişi/olay kataloğunu parçalara ayırma

Tarih: 21 Ekim 2026. Durum: uygulandı; fiziksel Android doğrulaması açık.

4.273 Wikidata yanıtını mevcut küçük pilot/people extension içine koymak
800/1.000 kayıt sınırlarını aşar ve bütün kaynak metnini açılış belleğine yükler.
Bu sınırlar büyütülmedi; 3D MapLibre çekirdeği ve platform köprüsü değiştirilmedi.

4053 yeni kişi/olay için küçük, geometri içermeyen ad/tür/yıl/paket indeksi
kullanılır. `SearchEntry.record=null`, henüz yüklenmemiş kayıt anlamına gelir;
sahte domain kaydı değildir. Seçim, ayrıntı, kaynak veya ilgili yıl sorgusunda
SHA256/byte/şema/lisans kontrolünden geçen `.atlas` paketleri yüklenir. Eski
arama ve zaman motorları kendi küçük sağlayıcısında kalır; yeni katman bunları
indeks üzerinden birleştirir. Siyasi bağlam eski sağlayıcısını korur; binlerce
kişi kimliği siyasi sorgunun 1.000 kayıt bütçesine sokulmaz.

- 338 paket, her biri ≤256 KiB ve ≤100 kayıt; toplam 32.177.954 byte.
- Manifest en fazla 10.000 ana kayıt, 512 paket ve 64 MiB; bu sınırlar doldurulmuş
  veri miktarı değildir. Şimdiki ana kayıt sayısı 4.053.
- Paket LRU en fazla 8 / 2 MiB JSON; gerçek çözülmüş JS nesne belleği daha
  büyüktür ve fiziksel cihazda ölçülmedi. Aynı anda en fazla iki gerçek okuma,
  bekleyen iş en fazla32. Yıl/snapshot paketleri async iterator ile akıtılır;
  bütün paket nesnelerini aynı anda bir dizide tutma yoktur.
- Web: Expo'nun aynı origin yerel asset URI'si; boyut sınırlı okuma, yönlendirme
  reddi, hash kontrolü. Native: mevcut Expo Asset/FileSystem, paylaşılan yerel
  asset kotası. DOM file-origin için kayıpsız gzip modülleri; decompression
  sınırı/hash/şema aynıdır. Origin/file izinleri gevşetilmedi.
- Köprüden paket, ham entity JSON veya büyük kaynak metni geçirilmez. Renderer
  aynı katalog indeksi ve yerel assetleri kullanır; mevcut frame protokolü kalır.
- Kişi sorguları yaşam ile doğum noktasını ayırır. Yeni doğum noktası için tek,
  referanslı P569/P19, belirsiz olmayan Gregorian yıl ve önceki incelenmiş şehir
  koordinatı birlikte gerekir. Diğer kişiler aramada kalır; tahminî nokta yoktur.
- Eski elle incelenmiş kişi/olaylar QID ile korunur. Başlık benzerliği yeni
  kişinin eski kaydın yerine geçmesine yol açmaz. Yeni arşiv kaynakları/ham input
  eşleşmeleri ayrıntı ekranında paket yüklenince çözülür.

Güven kökü `src/history/policy.ts` içindeki incelenmiş girdi envanteri ve
manifest SHA256 pinleridir. Collector bu pinleri yazamaz. Yeni ham dosya
`history:prepare` tarafından otomatik onaylanmaz. Kaynak kimliği/revizyon,
rank/qualifier/references ve doğrulanmış sitelink API yanıtına kadar izlenir.
Wikidata veri lisansı CC0'dır; makale/görsel/tile haklarıyla birleştirilmez.

Bedel: ad/tarih indeksi başlangıç paketindedir; tam metinler/yer geometrisi
sonradan yüklenir. Bu bir backend veya bütün dünyayı offline indirme sistemi
değildir. Gerçek startup/FPS/GPU/pil değeri bu karar kaydıyla doğrulanmış sayılmaz.
[Kapsam, testler ve açık platform sınırları](../reports/history-import-2026-10-21.md).
