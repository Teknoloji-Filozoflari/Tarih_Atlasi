# Tarihsel doğruluk örneklem denetimi

2026-10-16 · Faz 16 · Sonuç: **PARTIAL SOURCE CORROBORATION / NO-GO**.
Katalog `0.4.0-pilot`, şema2, 19 kayıt/7 kaynak. SHA-256:
`bf31bb3298029baa45da87bcc875368e183f56bbe6c59fb2f8b4fe8d0031a6e0`.
Yeni tarih/geometri uydurulmadı; müze metni, fotoğraf veya hazır GIS kopyalanmadı.
Şema/hak kontrolünün PASS olması iddianın tarihsel kesinliği değildir.

## Üç çağ ve ek pilotların incelemesi

| Pilot / çağ | Mevcut iddia ve doğrudan kayıt | Bağımsız kontrol / sonuç |
| --- | --- | --- |
| Peloponnesos Savaşı / antik | `atlas:peloponnesian-war`, [Q33745 rev2551218271](https://www.wikidata.org/w/index.php?title=Q33745&oldid=2551218271); MÖ431–404, yıl hassasiyeti, medium; geometri yok | [Perseus kurumsal edisyon kataloğu](https://catalog.perseus.org/catalog/urn:cts:greekLit:tlg0003.tlg001.perseus-grc2) bibliyografik konu alanında 431–404 aralığını destekliyor. Bu özgün statement'ın referansının doğrulanması veya gün/takvim kanıtı değildir. Çıkarımdaki tarih statement referansı0: inceleme açığı. Savaş tek nokta yapılmaz |
| Hastings / Orta Çağ | `atlas:hastings-1066`, [Q83224 rev2517858800](https://www.wikidata.org/w/index.php?title=Q83224&oldid=2517858800); 1066, yaklaşık P625 referans noktası, medium | [English Heritage tarih incelemesi](https://www.english-heritage.org.uk/visit/places/1066-battle-of-hastings-abbey-and-battlefield/history-and-stories/history/) olay tarihini 14 Ekim1066 olarak verir; tam muharebe alanının kapsamı bilinmiyor. Uygulama kaynak takvim dönüşümünü tamamlamadığından yıl hassasiyetini korur. Nokta ölçülmüş battlefield sınırı değildir |
| Alaska antlaşma kesiti / modern | `atlas:alaska-treaty-segment-1867`; [NARA transkript, Article I/IV ve proclamation](https://www.archives.gov/milestone-documents/check-for-the-purchase-of-alaska), sayfa incelemesi2024-03-28 | Transkript 141°B meridyenini ve onay değişimini20Haziran1867 olarak destekliyor. 65–68°K sadece çizilecek kesit seçimidir; antlaşmanın kapalı alanı veya modern kadastro değildir. Yalnız1867 snapshot; günümüzde veya arada otomatik süreklilik yok. Coarse2/fine7 nokta aynı ideal meridyenin türevidir |
| Van Gogh / modern kişi | `atlas:van-gogh`; [Q5582 rev2556738621](https://www.wikidata.org/w/index.php?title=Q5582&oldid=2556738621), yer [Q3280282 rev2460715196](https://www.wikidata.org/w/index.php?title=Q3280282&oldid=2460715196) | Aşağıdaki kritik konum incelemesi nedeniyle marker kapatıldı. Yaşam1853–1890 profili aramada kalır; yaşam sorgusu konum kanıtı değildir |
| Vestfalya / erken modern | `atlas:westphalia-1648`, [Q150995 rev2539526538](https://www.wikidata.org/w/index.php?title=Q150995&oldid=2539526538);1648-10-24, geometri yok | [German Historical Institute belge yayını](https://germanhistorydocs.org/de/von-den-reformationen-bis-zum-dreissigjaehrigen-krieg-1500-1648/der-westfaelische-frieden-14-24-oktober-1648) iki antlaşma ve14/24Ekim çift tarihini verir. Tek şehir/tek koordinat üretilmedi; mevcut Gregorian kayıt korunur, kaynak edisyonu review zincirine bağlanmalı |
| Almanya birleşme süreci / yakın dönem | `atlas:german-reunification-process`, [Q56039 rev2474841502](https://www.wikidata.org/w/index.php?title=Q56039&oldid=2474841502);1989-11-09–1990-10-03, uncertain, geometri yok; alternatif1991-03-15 saklı | [Bundesregierung belge/zaman çizelgesi](https://www.bundesregierung.de/breg-de/schwerpunkte/deutsche-einheit/deutsche-wiedervereinigung-fotostory-2338554) birleşme3Ekim1990 ve İki Artı Dört Antlaşmasının yürürlüğü15Mart1991 olarak ayrı dönüm noktalarını destekler. Bunları aynı olaya ait iki eşdeğer tarih saymak doğru olmaz. Alternatif özgün kaynak iddiası olarak korunur, yıllık indekse yayılmaz; editöryal anlam ayrımı henüz katalogda tamamlanmadı |

## Konum incelemesi ve güvenli geri çekme

[Art Institute of Chicago kurumsal zaman çizelgesi](https://archive.artic.edu/van-gogh-bedrooms/timeline)
1879 Ağustos başındaki Francq ikametini ve1880 Temmuzundaki Decrucq ikametini
ayırıyor. Tek müze koordinatını1879-08–1880-10 boyunca kişiye bağlayan eski
çıkarım bu ayrımı karşılamıyor. Bu, otomatik düzeltilmiş koordinat/tarih türetme
yetkisi sağlamaz. `atlas:van-gogh-maison-residence` ve `atlas:maison-van-gogh`
coğrafyası inceleme politikası1.0.0 ile askıya alındı. Kurumsal kaynak karttan
güvenli dış tarayıcıda açılabilir. Profil/özgün kaynak/atıf kaybolmaz; düzeltme
öncesi iddia arşivde açık uyarıyla kalır. Kesin, yaklaşık, nearest-preview,
coğrafi arama odağı ve yeni chunk yollarında marker üretilemez.

Yer kaydının tarihi **bilinmiyor değildir**: eski çıkarım kişi ilişkisinin ay
aralığını kopyalamıştır. Bağımsız zaman+geometri kanıtı yoktur. Önceki belgelerin
“tarihsiz yer” kısaltması bu kayıt için düzeltilir; yıllık bağımsız etiket sayısı0.

## İzlenebilirlik ve sınırlamalar

- NARA ham olgu SHA'sı `cbf1c3025bee36012e7fa1b3015ffb25d766a55b54c78aaaafdc3544a01cdf62`;
  Wikidata kişi/yer çıkarımı `7219e4518af7de0153e49ece5196ab97dffa6496c87ed6a35ee0d9295bddc902`;
  olay çıkarımı `fba37100d6ccc4393eb0c54102bd8c9dac0c5b464f8e7a65dced18d1b96bece9`.
- Bunlar özgün API response'u değildir. Sabit Wikidata revizyonlarının tekrar
  alınması bu oturumda başarısız; [müze referansı](https://www.maisonvangogh.mons.be/historique)
  de bağımsız alınamadı. Önceki çıkarım, bugünkü canlı revizyon doğrulaması sayılmaz.
- Altı iddia grubunun tümü incelendi; üç çağ örneklemi var. Tam siyasi alan0,
  kültür alanı0, bağımsız incelenmiş antik/Orta Çağ sınırı0: olmayan pilotlara
  doğruluk onayı verilmedi. Diğer9entity'nin tamamının bağımsız biyografi/siyasi
  tarih incelemesi yapılmadı; bu **örneklem** raporudur.
- 7 kaynak URL/revizyon/ham input/atıf/hak şemasını geçer;0eksik atıf sayısının
  bütün upstream statement referanslarının tamamlandığı anlamına gelmediği
  [kapsam raporunda](reports/phase-16-coverage.json) belirtilir.
- Gerçek dış kaynak geometrisi kopyalanmadı; sentetik kültür/kişi testleri bu
  tabloya ve üretim içerik sayısına dahil değildir.
