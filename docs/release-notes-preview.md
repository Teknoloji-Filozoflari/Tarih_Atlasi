# Tarih Atlası — Teknik önizleme

Döndürülebilir 3D küre, MÖ/MS tarih çizelgesi, bağımsız tarih katmanları,
yerel arama, doğrulanmış Wikipedia bağlantıları, yer imleri ve kişisel notlar.

Bu paket veri kapsamı eksiksiz veya kararlı/üretime hazır sürüm değildir.
Son katalog 3.203 kişi profili, 1.120 olay ve 5.616.753 güncel coğrafi kayıt
içerir. Yalnız 193 kişi için doğum yılına bağlı yaklaşık nokta vardır;
diğer kişiler konum uydurulmadan listelenir. Şehir/ilçe kayıtları güncel
referans noktalarıdır; tarihî şehir veya idari sınır garantisi değildir.

- Hazır Docker: `tarih-atlasi-docker-linux-amd64-<sürüm>.tar.gz` → aç →
  Linux `sh Kur.sh`, Windows Docker Desktop `Kur.cmd`.
- Derlenmiş web: `tarih-atlasi-web-<sürüm>.tar.gz` → aç →
  Node.js 24/26 ile `sh Baslat.sh` veya `Baslat.cmd`.
- Adres: http://127.0.0.1:8081. İndirmeden sonra `SHA256SUMS` ile karşılaştırın.
- Kaynak lisansı MIT; Cliopatria ve GeoNames CC BY 4.0; Wikidata CC0;
  diğer bildirimler pakette `/licenses/` altındadır.
- Güncel yollar ve Wikipedia internet gerektirebilir. Hesap zorunluluğu yoktur.
- Yerel not/yer imleri tarayıcıya aittir; aynı adres ve portu koruyun.
- Android APK sağlanmaz; gerçek Android cihaz doğrulaması tamamlanmamıştır.

Bilinen güvenlik, veri ve cihaz kabul engelleri paket içindeki
`KNOWN-LIMITATIONS.md` ve repository `docs/release-blockers.md` belgesindedir.
CI test başarısı bu açık maddeleri otomatik olarak kapatmaz. Bu sürüm
inceleme/geri bildirim içindir; kritik engeller kapanmadan kararlı yayın yapılmaz.
