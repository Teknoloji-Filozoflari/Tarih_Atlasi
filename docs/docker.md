# Docker ve hazır paket kurulumu

Tarih Atlası teknik önizlemedir. Web dağıtımı için Docker altyapısı hazırlanmıştır;
gerçek Docker Engine ve GPU kabul sonuçları [ilerleme kaydında](progress.md) izlenir.
APK veya tamamlanmış fiziksel cihaz testi iddiası yoktur.

## Kaynak koddan Docker

Docker Desktop ya da Docker Engine ve Compose v2 gerekir. Linux container modu kullanılır.

```sh
git clone https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi.git
cd Tarih_Atlasi
docker compose up -d --build --wait
```

Tarayıcı: **http://127.0.0.1:8081**. İlk derleme Node taban imajını ve npm
paketlerini internetten alır. Derleme tamamlandığında uygulama ve izinli kataloglar
imajın içindedir; npm geliştirme sunucusu çalıştırılmaz. Şehir verisi nedeniyle
ilk indirme/derleme küçücük değildir; ölçülmüş dağıtım boyutu ilgili Release'te bulunur.

```sh
docker compose logs --tail=100
docker compose ps
docker compose down
```

8081 doluysa proje kökünde `.env` dosyasına `ATLAS_PORT=8082` yazıp aynı başlatma
komutunu kullanın. Adres bu kez http://127.0.0.1:8082 olur. `.env` Git'e eklenmez.
Compose yalnız bilgisayarın loopback adresine açılır. İnternete açılacak bir
kurulumda TLS/reverse proxy ayrıca yapılandırılmalı; mevcut yayın engelleri kapatılmalıdır.

## Releases'ten hazır Docker paketi

[Releases](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/releases) altında
yayımlanmış bir önizleme varsa şu **aynı sürüme ait** dosyaları indirin:

- `tarih-atlasi-docker-linux-amd64-<sürüm>.tar.gz`
- `SHA256SUMS`

Dosyanın SHA256 değerini listedeki değerle karşılaştırın. Linux'ta
`sha256sum <indirdiğiniz-dosya>`, PowerShell'de `Get-FileHash <dosya> -Algorithm SHA256`
kullanılır. Arşivi ayrı bir klasöre açın. İçinde `Kur.sh`, `Kur.cmd`,
`compose.yaml`, README ve `tarih-atlasi-image.tar.gz` bulunur.

Linux:

```sh
sh Kur.sh
```

Windows Docker Desktop: `Kur.cmd` çalıştırın. Elle kurulum iki platformda da aynıdır:

```sh
docker load --input tarih-atlasi-image.tar.gz
docker compose up -d --wait
```

Bu hazır imaj **linux/amd64** içindir; arm64/Mac Apple Silicon üzerinde yerel
kaynak derlemesi tercih edilmelidir. İlk taslak Release yayımlanana kadar hazır
paket indirme seçeneği kullanılamaz. Docker Hub/GHCR'de yayımlanmış imaj olduğu
varsayılmaz; burada `docker load` kullanılır.

## Derlenmiş web paketi

`tarih-atlasi-web-<sürüm>.tar.gz` npm kurulumu gerektirmeyen statik uygulamadır.
Node.js **24 veya 26** gerekir. Arşivi açıp Linux'ta `sh Baslat.sh`, Windows'ta
`Baslat.cmd` çalıştırın. Başlatıcı dosyaları SHA256 manifestiyle doğrular ve
http://127.0.0.1:8081 üzerinde sunar. `index.html` dosyasını `file://` ile açmayın.

Sunucu yalnız GET/HEAD, health endpoint, hashli içerik cache'i, gzip ve CSP
başlıkları kullanır. Yazma API'si veya hesap veritabanı yoktur.

## Yer imleri, notlar ve çevrimdışı kullanım

Yer imleri, tercihler ve kişisel harita notları tarayıcı/cihaz depolamasındadır.
Docker volume'ünde tutulmaz. Aynı tarayıcı ve **aynı origin (adres + port)** ile
korunurlar; tarayıcı verisini silmek veya port değiştirmek bu kayıtlara erişimi
etkiler. Güncellerken aynı adres ve portu koruyun. Kişisel notlar için otomatik
senkron/yedek yoktur; container kopyalamak tarayıcı yedeği değildir.

Paketlenen coğrafya ve kataloglar yereldir. Güncel yol tile'ları, Wikidata'dan
yenilenen sitelinkler ve Wikipedia sayfaları ağ gerektirebilir. Bu nedenle
“tamamen çevrimdışı atlas” sözü verilmez. Güncel yollar tarihî yol kanıtı değildir.

## Geliştirici: paket oluşturma

```sh
npm ci
npm run check
npm run web:export
npm run release:stage
npm run release:verify
npm run release:pack
```

`.release/web` yalnız derlenmiş uygulamayı, sunucuyu, lisansları, başlatıcıları
ve dosya manifestini içerir. Ham indirmeler, `.env`, `node_modules`, eski
derlemeler ve geliştirici notları runtime imajına kopyalanmaz. Kaynak Docker
derlemesi de veri/lisans/hash kapılarından geçer. Hazırlanmış paketle imaj testi:

```sh
docker build -f docker/Dockerfile.release -t tarih-atlasi:0.1.0-preview.1 .release/web
docker run --rm --read-only tarih-atlasi:0.1.0-preview.1 node scripts/verify.mjs
```

Docker Engine yokken staged web paketinin HTTP/CSP smoke’u ayrı koşulabilir;
bu, imaj build/run kabulünün yerine geçmez:

```sh
npm run release:stage && npm run release:verify
npm run release:smoke-web
```

Release otomasyonu [workflow](../.github/workflows/release-preview.yml) içindedir.
Actions → **Teknik önizleme paketleri** → Run workflow. Lint, strict typecheck,
test, veri kapıları, web export, gerçek browser akışları, paket doğrulaması ve
Docker HTTP smoke başarısızsa taslak oluşturulmaz. Başarıda SHA256 listesiyle
**draft + prerelease** hazırlanır; kararlı sürüm otomatik yayımlanmaz. Güncel
NO-GO kaydı kullanıcıya gösterilir; Android APK bu akışın parçası değildir.

Release workflow dosyasının main üzerindeki güncellemesi de yeni commit'te
otomatik çalışma başlatır; sıradan ürün push'ları Release üretmez. Önce ilk
açılış/ülke/şehir kaynak kontrolleri, sonra bütün üretim E2E akışları çalışır.
Actions çalışmasının Summary alanındaki tablo hangi kapının hata verdiğini
gösterir. Bir test hatası varsa aşağıdaki Release oluşturma adımı SKIPPED olur.
Eski run'ı Re-run yapmak yeni commit'i kullanmaz. Sürüm zaten varsa workflow
onun üzerine yazmaz.

Resmi kaynaklar: [çok aşamalı Docker derlemesi](https://docs.docker.com/build/building/multi-stage/),
[docker load](https://docs.docker.com/reference/cli/docker/image/load/),
[Compose up / --wait](https://docs.docker.com/reference/cli/docker/compose/up/),
[GitHub Releases ve varlık sınırları](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).
English-Desk yalnız kurulum deneyimi referansıdır; GPL uygulama kodu kopyalanmadı.
