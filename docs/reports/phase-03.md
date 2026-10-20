# Faz 03 — Özgün responsive kullanıcı arayüzü raporu

2026-10-15 · **SOURCE IMPLEMENTED — ACCEPTANCE BLOCKED**.
Android: **UNVERIFIED ON DEVICE**. Faz 04'e geçilmedi.

## Yetki, plan ve tamamlanan kaynaklar

AGENTS.md, progress, Faz 02 raporu/kodları, README ve ürün/mimari kayıtları incelendi.
Kullanıcının açık Faz 03 isteği bu çalışmayı yetkilendirir; önceki fazların kurulum
ve gerçek cihaz engelleri kapanmış sayılmaz. Küçük plan: (1) mevcut renderer'ı koru,
(2) token tabanlı atlas düzeni ve küçük bileşenler, (3) güvenli panel/klavye/boş veri
akışları, (4) testler ve faz/kaynak/lisans/ilerleme kaydı. Yeni dış bağımlılık yok.

- Büyük harita alanı; üstte ürün/arama, solda veya kompakt üst sırada araçlar,
  altta tarih şeridi. Masaüstü sağ panel, telefon bottom sheet.
- İstenen 11 bileşen ve ortak Action; responsive layout politikası, SafeArea,
  klavye kaçınma ve kaydırılabilen panel içerikleri.
- Token renk/tipografi/boşlukları; kültür/devlet/kişi/savaş/olay ayrı renk,
  biçim ve etiket. Yeni dış görsel/font/ikon kullanılmadı.
- Bağımsız katman tercihleri, MÖ/MS yıl önizleme seçimi ve dürüst boş arama.
  Yeni tarihî veri/ETL/temporal domain modeli eklenmedi; katalog hâlâ 0.
- Gerçek marker v1 callback'i EntityCard'a bağlandı. Panel arkasında pointer ve
  erişilebilirlik etkileşimi sınırlandı; drag sonrası marker seçimi bastırılır.
  Map reset aynı köprüye gider, yeni renderer/WebView yok.
- Etiketli kontroller, 48px hedefler, düğme focus ring, modal açılış odağı,
  Escape/Android geri, RNW focus containment/restore kullanımı; animasyonsuz
  sheet/reset, azaltılmış hareketle spinner kapatma; Türkçe katalog.
- Playwright UI/görsel/snapshot senaryoları ve eski gerçek renderer testlerinin
  yeni bilgi paneline uyarlanması. **Snapshot görüntüleri/baseline üretilmedi**.

## Değişen dosyalar

[Tam elle tutulan envanter](phase-03-files.txt). Ana gruplar:
`src/atlas/*`, src/app/index ve _layout, src/theme/tokens, src/i18n/tr;
MapViewport adaptörleri/ViewportFrame/useGlobeHost/viewport sözleşmesi;
DOM renderer/style/görünümde tokenlar ve drag seçim kontrolü;
tests/unit/atlas, tests/run, tests/web/atlas ve app.spec;
README, interface, progress, architecture/roadmap/risk/lisans/atıf ve bu raporlar.
Kullanıcı kodu silinmedi; mevcut about/not-found/error akışları korunuyor.

## Test ve platform sonucu

[Ham komutlar](phase-03-validation.txt).

| Kontrol | Sonuç ve gerçek sınır |
| --- | --- |
| npm test | **PASS 15/15**, önceki 11 dahil; yıl sınırları/yıl sıfırı, layout kararı, katman ayrımı, kontrast |
| Bağımsız strict TS | **PASS** — presentation + önceki pure contracts/i18n/tema/katalog/negatif testler; React/Expo/MapLibre UI semantiği dahil değil |
| TS/TSX syntax | **PASS**, 51 dosya/0 tanı; tam typecheck değildir |
| Format | **PASS**, mevcut Prettier 3.9.9 araç kopyası; projeye kurulu paket başarısı değildir |
| npm run lint/typecheck | **BLOCKED**, exit 127; eslint/tsc kurulu değil |
| Web smoke, görsel ve snapshot | **BLOCKED**, playwright bulunamadı; baseline ve ekran görüntüsü yok |
| Web/Android JS export | **BLOCKED**, expo bulunamadı; gerçek layout veya APK kanıtı yok |
| Registry | **BLOCKED**, yeniden denemede EAI_AGAIN |
| Android çentik/nav/IME/dönme/geri/TalkBack/touch | **NOT RUN — UNVERIFIED ON DEVICE**, Java/SDK/adb yok |
| CI | NOT RUN; mevcut lock/kalite kapısı korunur |

## Kabul durumu ve riskler

Web ve Android ortak ekran kodu var; **cihazda bütünleşik yerleşim ve haritayı
kapatmaması kabulü BLOCKED**. Oyun/quiz veya sahte tarihî entity eklenmemesi kaynak
incelemesiyle sağlandı. Kontrast testleri ve erişilebilirlik önlemleri uygulandı;
**kritik erişilebilirlik sorunları giderildi kabulü BLOCKED**: gerçek klavye, ekran
okuyucu, büyük metin ve viewport ölçümleri yapılmadı.

Faz 02: renderer/worker/CSS/asset ve raw Expo bridge güven sınırları hâlâ açık.
Fiziksel taban/worker/Notice null; geniş atlas yerleşimi çalışan küre demek değildir.
Yeni riskler: dar/yatay ekranda minimum map alanının scroll ile paylaşımı, sanal
klavyeyle sheet yüksekliği, sistem gliflerinin platform görünümü, native modal
odak dönüşü, panel açıkken WebView touch interception. Hiçbiri cihazda kapatılmadı.

## Sonraki fazın önkoşulları

Mevcut Faz 01/02 kurulum/lock/lisans/boyut ve gerçek GPU/bridge kapılarını kapat.
Tam lint/typecheck/test/format/export; gerçek web UI ve renderer testleri, incelenmiş
snapshot baseline; Android APK, çentik/navigation/IME/rotation/large text/TalkBack,
klavye ve modal geri/odak testlerini kaydet. Yalnız bunlarla kritik derleme ve
UI hatası olmadığı söylenebilir. Ayrıntılı akış ve test matrisi [interface.md](../interface.md).
Faz 04 için ayrıca kullanıcı onayı gerekir; otomatik ilerleme yapılmadı.
