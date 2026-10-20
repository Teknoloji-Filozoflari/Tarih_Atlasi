# Tarih Atlası — Teknik önizleme

Türkçe, hesapsız ve ücretsiz 3D tarih atlası. Bu paket kararlı/üretime hazır sürüm
iddiası taşımaz. Kaynak ve güncel belgeler:
https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi

## Hazır Docker arşivini indirdiysen

Docker Desktop (Linux container modu) veya Docker Engine + Compose v2 gerekir.
Hazır imaj linux/amd64 içindir. İndirdiğin dış arşivin SHA256 değerini aynı
Release'teki SHA256SUMS ile karşılaştır; arşivi ayrı bir klasöre aç.

Linux'ta `sh Kur.sh`, Windows'ta `Kur.cmd` çalıştır. Elle:

```sh
docker load --input tarih-atlasi-image.tar.gz
docker compose up -d --wait
```

**http://127.0.0.1:8081** adresini aç. Durum için `docker compose ps`, kayıtlar için
`docker compose logs --tail=100`, kapatmak için `docker compose down` kullanılır.
8081 doluysa aynı klasörde `.env` dosyasına `ATLAS_PORT=8082` yazıp başlat;
adresin portunu 8082 yap. ARM cihazlar için kaynak Docker derlemesi tercih edilir.

## Derlenmiş web arşivini indirdiysen

Node.js 24 veya 26 gerekir; npm kurulumu gerekmez. Linux'ta `sh Baslat.sh`,
Windows'ta `Baslat.cmd` çalıştır. Dosya manifesti kontrol edilir; ardından
**http://127.0.0.1:8081** açılır. Terminali açık tut; kapatmak için Ctrl+C.
`index.html` dosyasını doğrudan file:// ile açma.

## Veriler ve kayıtların korunması

- Yerel katalog, her yılda tam dünya bilgisi garantisi değildir. Boşluklar
  tarihsel yokluk anlamına gelmez; belirsizlik ve kaynak yılı korunur.
- Güncel şehir ve yollar tarihî yol/şehir sınırı kanıtı değildir.
- Yer imleri, tercihler ve kişisel notlar tarayıcı/cihaz depolamasındadır;
  container volume'ünde değildir. Güncellerken aynı tarayıcı, adres ve portu koru.
  Tarayıcı verilerini silmek kayıtları silebilir. Otomatik not yedeği/senkronu yoktur.
- Paketlenmiş kataloglar yereldir; güncel yollar, Wikipedia ve bağlantı yenilemeleri
  internet gerektirebilir. Tam çevrimdışı garanti verilmez.
- Kod MIT; kaynaklar kendi haklarını taşır. Web paketinde `dist/licenses/`,
  tarayıcıda `/licenses/THIRD_PARTY_NOTICES.md` ve uygulama atıf paneline bak.
- Web paketindeki `release-manifest.json` dosya byte/hash'lerini içerir.
  Node ile bağımsız kontrol: `node scripts/verify.mjs`.

Android APK bu pakette yoktur. Fiziksel Android doğrulaması tamamlanmadı.
Bilinen güvenlik, lisans incelemesi ve platform kabul engelleri web paketindeki
`KNOWN-LIMITATIONS.md` ve aşağıdaki güncel kayıttadır:
https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/blob/main/docs/release-blockers.md

Sorun bildirirken yıl, bölge/kayıt, sürüm ve tekrar adımlarını yaz; kişisel bilgi
ve anahtar paylaşma. Görüş/bildirim:
https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/issues
