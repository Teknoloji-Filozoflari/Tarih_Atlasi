# GitHub, README ve Docker dağıtım hazırlığı — 21 Ekim 2026

## Sonuç ve kapsam

**IMPLEMENTED:** mevcut projeyi koruyan kaynak yayın filtresi, tanıtım README'si,
özgün SVG banner, geliştirici/katkı rehberi, Docker/Compose, derlenmiş web paketi,
SHA256 manifesti, paket doğrulayıcı, HTTP sunucusu ve draft prerelease workflow'u.
**PARTIAL:** kurulum/Release altyapısı hazır; Docker'ın gerçekten çalıştırılması
ve uzak yayın kabulü ortam engellerine bağlı. Kararlı ürün yayını **NO-GO** sürer.
**BLOCKED:** Git push / Release upload (terminal GitHub DNS + gh auth), Docker
build/run (socket erişimi), browser/görsel test (localhost bind EPERM).
Temiz kaynak kopyasında, mevcut bağımlılık kurulumu geçici bağlanarak ayrıca
**414/414** test geçti. İlk bağımlılıksız denemede iki test kurulu paket dosyalarını
bulamadı; bu çıktı da korunur. Bu doğrulama yeni bir npm ci iddiası değildir.
Arşiv /tmp altında açıldı; paket içindeki bağımsız verifier ve HTTP resolver
18.474 dosya / 890.123.649 byte için geçti. Tar.gz: **197.767.374 byte**.
Git nesneleri sıkıştırıldığında yaklaşık **303 MiB**.

**NOT TESTED:** fiziksel Android, Windows başlatıcıyı Windows'ta çalıştırma,
arm64 Docker ve gerçek container GPU/ağ davranışı. Ekran görüntüsü yoktur;
README banner'ı açıkça tanıtım çizimidir, gerçek ekran görüntüsü değildir.

İstek mevcut Tarih Atlası'nın yayıma hazırlanmasıydı. Uygulama sıfırdan kurulmadı,
UI/harita çekirdeği değiştirilmedi, mevcut kişiler/şehirler/olaylar silinmedi.
Yeni npm bağımlılığı veya tarihî veri eklenmedi. English-Desk yalnız kurulum UX
referansı olarak incelendi; GPL kod/görsel kopyalanmadı.

## Temizleme ve korunmuş içerik

İlk `git status --short`: **fatal: not a git repository**. Kök `.git` bu görev
ortamında salt okunur/boştur. Çalışma ağacı reset/checkout ile değiştirilmedi.
Yüklemeye hazır bağımsız Git kopyası `.publish/repository` altında hazırlanır;
`main`, hedef origin ve yerel commit burada tutulur. Uzak geçmiş force ile ezilmez.

İlk klasör yaklaşık 3,3 GiB. Yayın filtresinin envanterinde yaklaşık **1,07 GB**
kaynak/gerekli veri vardır; tam dosya/byte sayısı
[source-size.json](github-preparation/source-size.json) içindedir.
`node_modules`, `.expo`, `android/ios`, `dist`, ham `data/staging`, `.env/anahtarlar`,
araç metadatası ve yerel `.publish/.release` çıktıları Git'e girmez.
Büyük dosya/temel token-anahtar taraması yapılır; 95 MiB üstü tek dosya reddedilir.
Bu dar tarama kapsamlı güvenlik denetiminin yerine geçmez.

Gerçekten kaldırılanlar: tamamlanmamış `dist-android/` çıktısı ve üretilmiş
`test-results/` durumu. Kullanıcının ham indirmeleri, yerel Android projesi,
kurulu bağımlılıklar ve çalışan web çıktısı yerelde korunur; bunlar yayımlanmaz.
Küçük incelenmiş ETL kaynakları, testler, provenance ve lisans kayıtları tutulur.
16.102 şehir paketi ve native DOM karşılıkları iki platform için gereklidir;
“gereksiz dosya” diye silinmedi. Önceki README geliştirme notları
`docs/archive/readme-development-notes.md` olarak arşivlendi.
[Makine kaydı](github-preparation/cleanup.json).

## Kullanıcıya sunulan dağıtım

Kaynak Docker kurulumu: `docker compose up -d --build --wait`.
Sunucu: http://127.0.0.1:8081. Host portu ATLAS_PORT ile değiştirilebilir.
Çok aşamalı build, kilitli npm, veri/hash/hak kontrolleri ve manifest doğrulaması
kullanır. Runtime npm bağımlılığı veya Expo geliştirme sunucusu taşımaz; root
olmayan kullanıcı, read-only filesystem, capability kaldırma ve healthcheck vardır.

Statik HTTP sunucusu yalnız GET/HEAD kabul eder. CSP inline hash, aynı-kaynak
asset politikası, path/symlink sınırı, gzip, ETag, bounded HTML cache ve hashli
veri cache başlıklarını uygular. Büyük dosyalar stream edilir. Web preview da
aynı sunucuyu kullanır; eski exportCSP/exportResponse test arayüzü korunur.

`.release/web` uygulama, lisanslar ve 18 binin üzerinde hashli dosya içerir.
Paketin tam byte sayısı [stage.txt](github-preparation/stage.txt), bağımsız kontrolü
[package-verify.txt](github-preparation/package-verify.txt) içindedir.
`.release/out/tarih-atlasi-web-0.1.0-preview.1.tar.gz` ve SHA256SUMS yerelde
hazırlanır; **paketlendi demek GitHub'a yüklendi demek değildir**.
[Arşiv komutu ve hash](github-preparation/archive.txt).

Release workflow'u manuel çalışır. Kalite, gerçek web akışları ve Docker smoke
geçerse web tar.gz, linux/amd64 Docker-load tar.gz ve SHA256SUMS üretir; bunlarla
**draft + prerelease** oluşturur. Başarısız kontrol kaldırılmaz/continue-on-error
ile gizlenmez. Kararlı yayın otomatik yapılmaz; APK sağlanmaz. Workflow bu ortamda
GitHub'da çalıştırılmadı. Kaynak Docker arm64 hedefi de ayrıca doğrulanmalıdır.

Yer imleri/notlar tarayıcı/cihazda; volume veya hesap senkronu eklenmedi. Aynı
origin korunmalıdır. Güncel yol tile'ları, Wikipedia ve sitelink yenilemeleri ağ
kullanabilir. README veri kapsamını ve bu sınırları açıklar.

## Bulunan eski doğrulayıcı hatası

`npm run check`, `people:expanded:check` içinde `220 !== 144` ile durdu.
İlgili dosya genişletmeden önceki toplu kişi eşleşmesini 144 sanıyordu. Güncel
pinlenmiş arşiv/manifest ve registry karşılaştırmaları 220 eşleşme gösteriyor.

Tek gevşek sayım kullanılmadı: toplam registry özeti **823 istek / 220 eşleşen /
594 bekleyen / 5 grup / 9 belirsiz atlanan** olarak tam eşitlikle sabitlendi.
Orijinal 29 profillik expansion'ın katalog, raw input hash, kaynak, manifest,
25 yıllık doğum noktası ve 3 biyografik konum kontrolleri korunur. Başarısız test
silinmedi veya toleransı artırılmadı; eski toplu sürüm varsayımı düzeltildi.
[Önceki hatanın gerçek çıktısı](github-preparation/check-before-registry-fix.txt).

## Doğrulama kanıtları

Ortam: Node v26.11.1, npm 12.2.1. Kilitli kurulum/CI/Docker npm 12.2.0 ister;
Node 24 ve temiz npm ci bu kısıtlı ortamda yeniden çalıştırılmış sayılmaz.

| Komut | Sonuç |
| --- | --- |
| `node tests/unit/distribution.test.mjs` | PASS 6/6; static route, 404, CSP, immutable data cache, path/symlink, GET/HEAD/405/304, health, gzip, bozuk/eksik/fazla dosya |
| `npm run check` | PASS, exit 0: tam lint, web/native strict typecheck, 414/414 ana test, 5/5 worker, bütün veri/hash/hak kapıları ve formatter. |
| `npm run web:export` | PASS; 4 route; 16.102 şehir paketi / 645.992.949 byte hash ve şema kontrollü kopya |
| `npm run release:stage`, `release:verify`, `release:pack` | PASS; 18.474 dosya, 890.123.649 byte; 197.767.374 byte tar.gz ve SHA256 |
| Temiz snapshot ana testleri | PASS 414/414; mevcut node_modules geçici symlink ile kullanıldı ve sonra kaldırıldı; npm ci yapılmış sayılmaz |
| Arşiv round-trip | PASS; /tmp içine açılan paketin kendi bağımsız verifier/resolver modülleri, npm bağımlılığı olmadan |
| `docker compose config --quiet` | PASS; yapılandırma çözümlemesi, çalışan container kanıtı değildir |
| `sh -n scripts/distribution/start.sh docker/Kur.sh` | PASS; shell sözdizimi, gerçek Docker çalışması değildir |
| YAML parse (iki workflow + compose) | PASS; GitHub Actions çalıştırılmış sayılmaz |
| `npm run test:web:production` | BLOCKED, exit 1; config.webServer başlamadı. `web:serve` doğrudan denemesi EPERM. Test/screenshot sayısı 0 |
| `docker build -f docker/Dockerfile.release ...` | BLOCKED, exit 1; `/var/run/docker.sock` permission denied. Hazır Docker imajı üretilmedi |
| `npm audit --json` | BLOCKED, exit 1; registry.npmjs.org EAI_AGAIN. Önceki açık audit kaydı aynen geçerli |
| `git ls-remote <hedef>` / `gh auth status` | BLOCKED; GitHub DNS çözülemedi / terminal token'ı geçersiz. Push ve Release upload yapılmadı |
| Android native build / cihaz | NOT TESTED; UNVERIFIED ON DEVICE |

[Snapshot testleri](github-preparation/snapshot-tests.txt), [kurulum yapılmadan deneme](github-preparation/snapshot-without-install.txt),
[Arşiv round-trip](github-preparation/archive-roundtrip.json), [gerçek push hatası](github-preparation/push.txt),
[Web build](github-preparation/web-export.txt), [HTTP bind hatası](github-preparation/server.txt),
[browser başlatma](github-preparation/browser.txt), [Docker](github-preparation/docker-build.txt),
[audit erişimi](github-preparation/npm-audit.txt), [son biçim kontrolü](github-preparation/format.txt).

## Değişen dosyalar

- Tanıtım: `README.md`, `CONTRIBUTING.md`, `docs/media/tarih-atlasi-banner.svg`,
  `docs/archive/readme-development-notes.md`.
- Kaynak sınırı: `.gitignore`, `.gitattributes`, `.prettierignore`,
  `eslint.config.mjs`, `scripts/distribution/source.mjs`.
- Dağıtım: `Dockerfile`, `.dockerignore`, `compose.yaml`,
  `docker/{Dockerfile.release,RELEASE-README.md,Kur.sh,Kur.cmd}`,
  `scripts/distribution/{server,healthcheck,stage,verify,archive,smoke}.mjs`,
  `scripts/distribution/{start.sh,start.cmd}`, `scripts/qa/serve-export.mjs`.
- Kontroller: `.github/workflows/{checks.yml,release-preview.yml}`, `package.json`,
  `tests/unit/distribution.test.mjs`, `tests/run.mjs`, `scripts/people/check-expansion.mjs`.
- Belgeler: `docs/{docker,development,release-notes-preview,release-blockers,
  architecture,license-register,progress}.md`, `THIRD_PARTY_NOTICES.md`,
  `docs/adr/0020-preview-distribution.md`, bu rapor ve kanıt klasörü.

## Kalan adımlar

Yerel kaynak snapshot'ı hazır olduktan sonra ağ erişimi olan kullanıcı terminalinde:

```sh
gh auth login --hostname github.com --git-protocol https
gh auth setup-git
git -C .publish/repository push -u origin main
```

Bu komutlar root proje klasöründen çalışır; force yoktur. Uzak değişiklik varsa
push reddedilmesini zorlamayın; önce geçmişi karşılaştırın. Yükleme sonrası
GitHub Actions → Teknik önizleme paketleri → Run workflow, sürüm
`0.1.0-preview.1`. Başarılı gerçek kontrollerden sonra taslak oluşur; kararlı
ürün engelleri kapatılmadan genel üretim kabulü verilmez.
