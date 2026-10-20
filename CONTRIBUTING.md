# Tarih Atlası'na katkı

Önce [AGENTS.md](AGENTS.md), [ürün ilkeleri](docs/product-requirements.md) ve
[güncel ilerleme](docs/progress.md) okunur. Kurulum: [geliştirici rehberi](docs/development.md).

## Hata bildirimi

Seçili yıl, kayıt/bölge, cihaz-tarayıcı, tekrar adımları ve beklenen davranışı
yazın. Tarihî bir iddiayı düzeltiyorsanız doğrudan kaynak bağlantısını ekleyin.
Yerel not, kişisel bilgi veya API anahtarını issue/log dosyasına koymayın.

## Kod değişikliği

- Mevcut çalışan akışları koruyun; bir değişiklikte tek somut sorunu ele alın.
- TypeScript strict, i18n üzerinden Türkçe metin ve ortak web/native sözleşmeleri korunur.
- Küreyi 2D görüntüyle ikame etmeyin; oyun/hesap/reklam eklemeyin.
- İlgili testleri ve `npm run check` çalıştırın. Browser/Android'de çalıştırmadığınız
  kontrolü açıkça NOT TESTED olarak yazın; testi kaldırarak sonucu değiştirmeyin.
- PR'da sorun, değişen davranış, test komutları ve varsa veri kapsamı/lisans değişikliğini anlatın.

## Tarihî veri katkısı

Kalıcı kimlik, doğrudan kaynak, sürüm/revizyon, lisans/atıf, tarih hassasiyeti,
konum kanıtı ve belirsizlik gerekir. Modern yer noktası tarihî ikamet kanıtı değildir.
Kişinin yaşam dönemi herhangi bir yerde bulunduğunu ispatlamaz. Eksik bilgiyi
tahminî bir koordinat/tarihle doldurmayın. Sentetik test kayıtları üretime giremez.

Ham edinimler `data/staging/` altında ve Git dışındadır. Küçük, incelenmiş kaynak
girdileri ile gerekli checksum/provenance kayıtları korunur. Onaylı manifest ve
lisans politikası geçmeden yeni veri üretime eklenmez. Historical Basemaps'in
belirsiz veri hakkı nedeniyle dağıtım engeli sürer.

## Lisans

Kod katkıları mevcut MIT lisansı altındadır. Dışarıdan gelen veri/görsel/font aynı
lisansa otomatik dönüşmez; [lisans sicili](docs/license-register.md) ve
[üçüncü taraf bildirimleri](THIRD_PARTY_NOTICES.md) ayrıca güncellenir.
