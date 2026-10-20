# Erişilebilirlik denetimi — Faz 16

2026-10-16 · Kaynak/unit kontrolleri PASS; **PLATFORM ACCEPTANCE BLOCKED**.
Gerçek WCAG uygunluğu veya TalkBack kabulü iddiası yoktur.

| Alan | Gerçekten yapılan kontrol | Kalan doğrulama |
| --- | --- | --- |
| Renk dışında anlam | Altı bağımsız katman adı/simgesi ve kültür/siyaset ayrımı unit testi; yaklaşık/konumsuz işaret metinleri | Gerçek renk körlüğü/görsel okunurluk; çakışan yarı saydam alanlar |
| Kontrast | Token renkleriyle katman işaretlerinin panel zemini üzerinde4.5:1 oranı unit testinde geçer | Bütün metin, focus, disabled/border ve harita üzerindeki gerçek kompozit kontrast incelenmedi; sadece token testiyle tüm UI geçmez |
| Dokunma hedefi | Paylaşılan Action/katman/slider kodunda48dp hedef, etiketli kontroller | Gerçek çentik/safe area/Android navigation ve küçük telefon parmak kullanımı |
| Tarih / klavye | Yıl sıfırı reddi, MÖ/MS giriş/ok adımı ve slider hesabı unit; klavye akışı Playwright senaryolarında | Gerçek tab/focus sırası, oklar, Escape, modal odak geri dönüşü |
| Paneller / harita | Modal kaynakları, background pointer/accessibility engelleri kaynakta; marker drag/backface double testleri | Web DOM + native UI focus etkileşimi, panel sırasında yanlış harita kayması |
| Metin büyütme |320px/küçük/yatay/büyük fontta kompakt layout hesap testi | Gerçek200% web zoom/native büyük yazı, IME, taşma ve satır kaybı |
| Reduced motion | Sistem/manual tercih; oynatma/backdrop ve odak kamera davranışı testleri | OS tercihiyle gerçek browser/cihaz animasyonu ve arka plan davranışı |
| Haritasız erişim | Fallback metni, tarih/arama/yıl listeleri/atıf kaynakta; yeni privacy metni ayar ve Hakkında'da | Gerçek WebGL yokluğunda tüm işlemlerin klavye/TalkBack ile tamamlanması |
| Ekran okuyucu | Anlamlı role/label/live region kodları ve Türkçe katalog | TalkBack fiziksel cihazda **UNVERIFIED ON DEVICE**; sesli yıl, seçim ve hata duyurusu test edilmedi |

[78 browser senaryosu/12 dosya](reports/phase-16-browser-list.log) yalnız keşfedildi;
loopback EPERM ve35s deneme sınırı nedeniyle gerçek koşu tamamlanmadı. Screenshot
baseline önceki fazlardan beri eksik; bu ortamda sentetik golden üretilerek
“görsel test PASS” yazılmadı. Kültür örtüşmesinin üretimde gerçek pilotu da yok;
sentetik alan testi veri/model regresyonudur.

Kapanış için masaüstü ve360px web'de tarih→arama→kart→kaynak→geri/odak; fiziksel
Android'de TalkBack, büyük yazı, dokunma, pinch, rotation, IME, geri, offline ve
harici tarayıcıdan dönüş akışları kayda alınmalıdır. Cihaz/OS/WebView/GPU sürümü,
problem ve sonuç her çalışmada yazılmalıdır. [Yayın engelleri](release-blockers.md).
