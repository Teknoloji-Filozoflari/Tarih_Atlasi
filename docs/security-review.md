# Bağımlılık güvenlik incelemesi — 2026-10-15

Kaynak: kullanıcının ağ erişimli terminalinden oluşturduğu
[gerçek npm audit JSON](reports/npm-audit.json). **29 etkilenen paket kaydı**,
10 moderate / 19 high / 0 critical. Bu raporda aynı alt bağımlılığın üst paketlere
yansıması dahil; **dört farklı temel GHSA bildirimi** var. Bildirimleri azaltmak
riskin otomatik kapandığı anlamına gelmez. Bu kayıt açık risk incelemesidir;
uygulamanın veya derleme araçlarının güvenli olduğu iddiası değildir.

| Temel bildirim | Rapor düzeyi | Bağımlılık yolu / inceleme | Düzeltme durumu |
| --- | --- | --- | --- |
| [braces: GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | high | micromatch → Metro dosya eşleme/derleme araçları; derin brace pattern ile stack exhaustion | Resmi kayıtta <=3.0.3 etkileniyor, patched version yok. Üst SDK'yı eski sürüme indirmek uygulanmadı |
| [node-forge: GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | high | Expo CLI / code-signing-certificate araç yolu; belirli RSA imza doğrulama koşulları | Resmi kayıtta <=1.4.0 etkileniyor, patched version yok. Araç kullanım yolu/sürüm bakımı açık |
| [decode-uri-component: GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | moderate | query-string → Expo Router; bozuk yüzde kodlu girdide CPU/yanıtsızlık. Runtime URL yolu ayrıca önemli | Resmi düzeltme 0.5.0. Mevcut üst paketin aralığı/sözleşmesi nedeniyle test edilmemiş override yapılmadı; uyumlu upstream veya küçük testli patch araştırması açık |
| [uuid: GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | moderate | xcode → Expo config araçları; bildirimin koşulu v3/v5/v6 + dış buffer | Resmi düzeltilmiş hatlardan biri 11.1.1. Yerel xcode çağrı yolu ve CJS/API uyumu doğrulanmadan major override yapılmadı |

Yollar yerel audit/lock grafiğine dayanır; bunlardan exploit'in uygulamada erişilebilir
olduğu veya hiçbir şekilde erişilemeyeceği sonucu çıkarılmadı. Özellikle geliştirme
sunucusu/araçları ile son kullanıcı bundle'ı aynı dağıtım yüzeyi değildir; bu ayrım
bulguyu yok sayma gerekçesi değildir.

Npm'nin önerdiği toplu force çözümü Expo **44.0.6**, React Native **0.72.17** veya
Router **58.0.19** gibi mevcut SDK57 setini bozacak sürüm değişiklikleri içeriyor.
Bu yüzden `npm audit fix --force` uygulanmadı; major SDK göçü bu fazın işi değildir.
Sadece daha küçük bir sayı elde etmek için native uyumu bozulmadı. Hiçbir audit
bulgusu resolved/ignored olarak işaretlenmedi.

ESLint **9.39.5** çalışma/API uyumu için kullanılıyor, bakım/deprecation uyarısı sürer.
React ESLint plugin'i/Expo config uyumu çözülmeden ESLint10'a zorlanmaz.
`unrs-resolver` postinstall'ı onaylanmadı: mevcut native binding ve tam lint
çalışıyor. Gerekli olmayan install script izinleri açılmadı.

Kontrollü takip: bildirimin asıl hat sürümünü ve üst bağımlılık aralığını doğrula;
uyumlu düzeltme varsa lock üzerinden küçük değişiklik yap, regresyon + lint/TS/
web/native export test et, ağ erişimli ortamda audit'i yeniden üret. Bu tur
bağımlılık sürümleri yeniden değiştirilmedi. Yukarıdaki dört resmi advisory sayfası
15 Ekim 2026'da okundu; zamanla sürüm/yama bilgileri değişebilir.
