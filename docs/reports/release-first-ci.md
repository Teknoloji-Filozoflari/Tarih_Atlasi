# İlk GitHub kontrolü ve görünmeyen Releases — 21 Ekim 2026

## Bulgular

Kaynak yüklemesi başarılı: `0129efebf28af8455a4d58060b8e0717bc449258`.
[İlk push çalıştırması](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/runs/39544262326)
üzerinden sonuçlar doğrudan okundu. Node 24.22.0 / npm 12.2.0 ile npm ci ve
unit işi başarılıdır. Quality-and-web işi lint sonrasında web strict typecheck'te
durdu: YearSlider.web.tsx, GlobeView.tsx ve markers.css için üç TS2882 bildirimi.

Expo geliştirme sunucusunun ürettiği, Git dışında tutulan expo-env.d.ts,
expo/types referansını sağlıyordu. Yeni checkout'ta henüz dev sunucusu çalışmadığı
zaman bu referans yoktu. `src/types/expo.d.ts` Expo'nun gerçek varlık/CSS
bildirimlerini kaynak ağacından yükler. Paket, runtime, UI, veri, lisans veya
TypeScript strict seçenekleri değişmedi. Mevcut kod MIT kapsamında kalır.

## Yerel doğrulama

- Generated expo-env.d.ts ve .expo türleri bulunmayan kaynak snapshot kullanıldı.
- Web config'ten yeni deklarasyon dışlandığında aynı üç TS2882 hatası: exit 2.
- Yeni deklarasyon dahil native ve web konfigürasyonları: her ikisi exit 0.
- Hedefli ESLint ve Prettier: exit 0.
- [Hatanın yeniden üretimi](release-first-ci/before.txt).
- [Sonuç kaydı](release-first-ci/checks.json).
- Bu tur 414 test yerelde yeniden koşturulmadı; yeni bilgi GitHub'ın ilk unit
  işinin gerçek başarısıdır. Son düzeltmenin yeni uzak CI sonucu ayrıca izlenir.
- Android cihaz, browser/GPU ve Docker runtime bu tur yeniden doğrulanmadı.

## Release neden görünmüyor?

GitHub API kontrolünde Releases `[]`; yalnız push için altyapı çalıştırması var.
`.github/workflows/release-preview.yml` manuel workflow_dispatch kullanıyor.
Push, bu akışı otomatik çalıştırmaz. Ayrıca başarıda draft+prerelease üretir;
herkese açık yayın durumu otomatik oluşmaz. Bu mevcut NO-GO kararını korur.

[Release akışını aç](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/workflows/release-preview.yml)
→ Run workflow → main → 0.1.0-preview.1. Lint/typecheck/test, veri kapıları,
web E2E ve Docker smoke başarısızsa paket/taslak oluşmaz. Başarıda oluşan taslak
repo yetkilisine görünür; mevcut ürün yayın engelleri ayrıca değerlendirilir.

## Düzeltmenin gönderim durumu

GitHub bağlantısı Git tree ve contents yazmalarına 403 Resource not accessible by integration
yanıtı verdi. Düzeltme yerelde ayrı bir commit olarak hazırlandı; yayımlanmış ilk commit
amend edilmedi. Kullanıcının çalışan terminalinden git push ile gönderilmelidir.
Yeni CI sonucu henüz PASS sayılmaz.
