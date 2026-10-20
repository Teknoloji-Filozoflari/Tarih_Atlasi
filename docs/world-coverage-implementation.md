# Dünya kataloğu uygulama planı — 17 Ekim 2026

Kullanıcı tüm dünya aktarımını açıkça istedi. Harita motoru veya ürün yeniden
kurulmayacak; çalışan pilot, kaynak/kişi askısı, küre, kayıtlı yerimleri ve
platform köprüsü korunacak.

1. Sabit ZIP/lisans/README/hash ve kaynak sürümünü yeniden kontrol et. Tüm
   siyasi satırları ve ayrı RELATION kayıtlarını say; hatalı/belirsiz kayıtları
   gerekçeli karantinada tut. Kaynak hak onayı bağımsız tarihî doğruluk sayılmaz.
2. Metaveri manifestini geometriden ayır. Kaynak koordinatlarını kayıpsız,
   hashli sınırlı statik asset paketleri yap; yalnız seçilen yılın paketlerini
   yükle. Expo'nun zaten kurulu expo-asset57.0.20(MIT) modülünü doğrudan pinle;
   Metro'ya özel atlas asset uzantısını ekle. Uygulama başlangıcına172MBGeoJSON
   veya13bin geometri gömülmesin. Cache bellek/byte/kuyruk sınırları olsun.
3. Büyük kaynak geometrileri için ayrı, süre/iş/nokta bütçeli topoloji
   doğrulaması ekle; eski küçük katalog limitlerini gevşetme. Koordinat
   uydurma/sadeleştirme yok; yalnız aynı ardışık nokta tekrarı ve halka yönü
   kayıpsız normalize edilebilir. Hatalı kalan kaydı ve kaynak nedenini raporla.
4. Yeni dünya sağlayıcısını mevcut timeline/provider, arama, siyasi kart,
   kaynak, odaklama ve cache akışlarına ekle. Sadece mevcut kaynak aralığını
   göster; kültür/kişi/savaş/olay katmanları bağımsız kalsın. Önceki16satır ve
   kimlikleri geriye uyumlu koru. Doğrulanmamış QID/Wikipedia başlığı kullanılmaz.
5. Kaynak kimliği/name gruplarını koru; Türkçe ad yoksa özgün dil açık fallback.
   Geniş dönemler ve tüm dünya eksiksizliği iddia edilmez; yıl bazında toplam,
   çizilen ve karantina sayıları görünür.2025/2026'ya sınır uzatılmaz.
6. Dünya verisi, büyük ülkeler, tarih aralıkları, hak/hash değişimi, iptal/cache
   ve mevcut kullanıcı akışlarını test et; lint/strictTS/test/export çalıştır.
   Web/GPU ve Android cihaz yapılamayanları BLOCKED/UNVERIFIED kaydet.

Yeni motor/deployment/hesap/ücretli servis yok. Üretim genişlemesi yayıncı
CC BY4.0 veri grant'i, sabit arşiv ve kaynak-rekonstrüksiyon semantiğiyle
sınırlıdır; uzman doğrulaması diye sunulmaz. Bilinen kaynak sorunları ve
geometri dışlamaları açık sicile yazılacak. Lisansı belirsiz başka veri eklenmez.

## Geniş taramada bulunan ek kaynak sorunları

13234Mali Federation1961–2023;13305Kingdom of Great Britain1969–2023;
13406Estado Novo1979–2023(Cabinda kutusu11.9–12.9E/-5.8–-4.4N);
11956Netherlands Antilles1877–2023;13558(Commonwealth of Nations)2000–2023.
2024satırlarında da bu adlar tekrar ediyor;13601/13622Mujahideen kayıtlarında
kimlik/konum yorumu ayrıca gerekiyor. Bunlar otomatik olarak güncel devlet
adlarına çevrilmeyecek veya kesin egemenlik alanı diye sunulmayacak.
Bilinen ad/dönem/alan belirsizliği olan bu kaynak satırları karantinaya alınır;
bilgi/arama kaydı ve özgün ad/dönem saklanır. Dünya kapsamı kayıp sayıları bu
nedenle ilk otomatik geometri taramasının189/192sonucundan farklı olabilir.
