# Cliopatria indirme zaman aşımı — 16 Ekim 2026

Kullanıcının gerçek koşusunda üç Natural Earth10m dosyası hash kontrolünü geçti;
Cliopatria ZIP iki120s denemesinde tamamlanamadı. `--verify` bu yüzden ilk üç
dosyada cache başarısı, ZIP'te `SOURCE_NOT_DOWNLOADED` verdi. Bu bütün verilerin
bozuk olduğu veya ilk üç dosyanın yeniden indirilmesi gerektiği anlamına gelmez.

Küçük düzeltme planı: ZIP için15dakika/deneme, diğer dosyalar için2dakika sınırı;
isteğe bağlı sınırlı timeout override; ilerleme çıktısı; cache ve exclusive
dosya/hash/byte/Retry-After korumalarını sürdür. Timeout/eksik dosya davranışını
gerçek geçici dosyada sentetik stream ile test et. Mevcut üç dosyayı değiştirme.

## Uygulanan düzeltme

ZIP artık15dakika/deneme, küçük dosyalar2dakika/deneme kullanır. Yavaş ağ için
en fazla30dakika seçilebilir:

```sh
npm run data:download
# Çok yavaş bağlantı için alternatif:
npm run data:download -- --timeout-seconds 1800
```

Başarıyla tamamlandıktan sonra `npm run data:download -- --verify` çalıştırılır.
İlk üç dosya checksum/receipt eşleşmesiyle cache'den geçer; yeniden indirilmez.
CLI yaklaşık10s arayla alınanMiB ve deneme sayısını gösterir. En fazla2deneme,
byte/URL/lisans sınırı ve Retry-After korunur; sınırsız timeout yoktur.

**Byte offset'ten devam desteği eklenmedi.** Süresi dolan eksik ZIP temizlenir
ve sonraki deneme o dosyayı baştan alır; daha önce tamamlanmış kaynaklar yerinde
kalır. Eksik dosya başarı/üretim kaydı sayılmaz. `SOURCE_NOT_DOWNLOADED`
bu durumda beklenen doğrulama sonucudur. Henüz ülke geometrileri alınmadı veya
haritaya eklenmedi. Yeni paket/lisans/hak onayı yoktur.

Değişen dosyalar: `scripts/map-sources.mjs`, `tests/unit/map-sources.test.mjs`,
README, araştırma rehberi ve progress/rapor. Yeni negatif testler timeout
override sınırı/CLI, AbortSignal'e verilen süre parametresi, kesilenbody/yeniden
deneme, ilerleme ve başarılıcache'i doğrular. Bunlar sentetik yanıtlarla gerçek
geçici dosyalarda çalışır; gerçekZIP aktarımı veya Android kanıtı değildir.

## Sonuç

- `npm test`: exit0, **262test**; [çıktı](map-download-timeout/tests.log).
- `npm run check`: lint/strictTS/unit/worker/hash/format sonuçları
  [toplu logda](map-download-timeout/check.log).
- `npm run data:download -- --verify`: exit1; ilk3dosya SHA/cachePASS,
  ZIP eksik olduğu için `SOURCE_NOT_DOWNLOADED` beklenir.
  [Gerçek kontrol](map-download-timeout/verify.log).
-6kaynak/receipt dosyasının SHA'sı korunur;
  [önce](map-download-timeout/staging-before.json),
  [son bütünlük](map-download-timeout/staging-integrity.json).
- Gerçek büyükZIP indirmesi yeni limitlerle bu ortamda tamamlanmadı;
  ağdaki aktarım başarısı **NOT TESTED**. Web/Android UI değiştirilmedi;
  bu CLI düzeltmesi için yeni browser/APK/cihaz testi çalıştırılmadı.

Bir sonraki gerekli adım kullanıcının `npm run data:download` komutunu tekrar
çalıştırması ve bütün6dosya tamamlandığında verify yapmasıdır. İndirme henüz
üretime veri eklemez; mevcut harita/katalog akışı korunur.
