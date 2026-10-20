# ADR-0020 — Kaynak, web paketi ve Docker önizleme dağıtımı

Tarih: 2026-10-21. Durum: uygulandı; Docker çalıştırma/Git push ortam engelli,
kararlı ürün yayını için önceki NO-GO geçerli.

## Bağlam ve karar

Kullanıcı mevcut uygulamanın GitHub'a hazırlanmasını, tanıtıcı README ve
English-Desk benzeri Docker / Releases kurulumunu istedi. Referans yalnız
kurulum akışıdır; GPL uygulama kodu alınmadı. Harita/veri mimarisi değiştirilmedi.

Tek Expo projesi ve gerekli incelenmiş runtime varlıkları kaynakta korunur.
GeoNames'in 16.102 web paketi ve native DOM varlıkları, platform adaptörleri
nedeniyle aynı işlevin farklı dağıtım gösterimleridir. Bunlar test edilmemiş bir
küçültme adına silinmez. Yaklaşık 1 GB kaynak verisini sonradan dinamik bir
Release'ten alma modeli bu turda eklenmez; çalışma/reproducibility bozulmaz.

Kaynak yayınından node_modules, staging/ham indirmeler, .env/anahtarlar, Expo
cache'i, derlemeler ve yerel araç klasörleri ayrılır. Küçük incelenmiş ETL
girdileri ve bilimsel provenance/lisans kayıtları tutulur. Kullanıcının
indirdiği ham arşivler yerelde korunur. Büyük dosya ve temel secret taraması
ile `.publish/repository` altında temiz Git kopyası hazırlanır. Ana `.git`
bu ortamda salt okunur/boş olduğundan kullanıcı dizini zorlanmaz. Push force
değildir; başka uzak değişiklik varsa git'in normal fast-forward koruması işler.

Docker çok aşamalıdır: kilitli npm derlemesi → yalnız statik web çıktıları,
yerel veri/lisanslar ve Node HTTP sunucusu. Runtime npm bağımlılığı, Expo
geliştirme sunucusu veya zorunlu backend yoktur. Node taban sürümü 24.22.0
bookworm-slim resmi tag listesinden kontrol edildi. Runtime root olmayan kullanıcı,
read-only filesystem, loopback Compose portu, capability kaldırma ve healthcheck
kullanır. Sunucu GET/HEAD, CSP inline hash, URL/symlink sınırı, gzip/ETag ve
sürümlü veri cache'i uygular. Byte manifesti bütün paketi doğrular.

Manuel Release workflow'u kalite ve browser kontrolleri, gerçek Docker HTTP
smoke ve paket hash kontrolünden sonra web arşivi ve amd64 Docker-load arşivi
üretir. SHA256SUMS ve kaynak commit kimliği korunur. İlk sonuç draft+prerelease;
bu akış kararlı yayın onayı veya APK üretimi değildir.

## Haklar ve sınırlar

Yeni tarihî veri, portre, makale, dış tile offline paketi veya dış servis eklenmedi.
Projeye ait banner SVG özgün tanıtım çizimidir; ekran görüntüsü değildir.
Gerekli veri/font/motor atıfları ayrıca paketlenir. Kurulu npm paketlerinin mevcut
lisans/NOTICE kopyaları ve kilitli kaynak tarball/integrity listesi eklenir;
bu envanter, önceki tamamlanmamış bağımsız lisans/güvenlik incelemesini kapatmaz.
Node taban imajının ve bağımlılıkların kendi hakları MIT proje lisansına dönüşmez.

Tarayıcı yer imleri/notları container volume'ünde değildir. Aynı origin korunur;
otomatik yedek veya hesap senkronu eklenmedi. Güncel yollar ve Wikipedia ağ ister.
Docker socket, terminal DNS/auth ve fiziksel Android testleri için gerçek sonuçlar
[dağıtım raporunda](../reports/github-preparation.md) izlenir.

## Kanıtlar

- [English-Desk kurulum UX referansı](https://github.com/Teknoloji-Filozoflari/English-Desk)
- [Docker çok aşamalı build](https://docs.docker.com/build/building/multi-stage/)
- [Resmi Node imaj tag'leri](https://hub.docker.com/_/node)
- [docker load](https://docs.docker.com/reference/cli/docker/image/load/)
- [GitHub Release modeli ve 2 GiB/varlık sınırı](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Resmi upload-artifact v7 kullanım önerisi ve MIT lisansı](https://github.com/actions/upload-artifact)
