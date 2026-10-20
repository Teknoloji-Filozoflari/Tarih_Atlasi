# V3 uygulanabilir çalışma planı

Girdi: kullanıcının `/home/s-oktay/İndirilenler/geliştirme.md` yönergesi.
Fazlar aynı görevde rutin onay beklemeden ilerler. Bu belge önceki ürün
çalışmasını yeniden başlatmaz; mevcut kodu/ham veriyi koruyarak açıkları kapatır.

- Faz0: baseline, gerçek teknoloji/kontrol envanteri, kaynak sayımları ve
  komut kanıtları. TAMAM; gerçek browser ölçümü engelli.
- Faz1–3: kompakt üst bar; mobil arama girişi; üretimde teknik/örnek kontrolleri
  kapat; ayrı geliştirici panelinde çalışan eski işlevleri koru. Tek timeline
  dock; token/hover/focus/tooltip ve büyük yazı. Baseline kaynak hash'i korunur.
- Faz4–8: aynı renderer; kalıcı ve geriye uyumlu projection tercihi; nonmodal
  entity sheet/desktop panel; yer arama grubu; küme zoom/aday erişimi; gerçek
  veriyle keşif. Kaynak/quality metni okunabilir; teknik SHA alanları açılır.
  Fiziksel50m indirme engelini tekrar kanıtla; kaynak uydurma veya demo tiles yok.
- Faz9: mevcut7probe'u gerçekten çalıştır; geçmiş düzeltme ve mevcut sonucu
  ayır; bookmark hatasını kontrollü sınıfa çevir; negatif regresyonlar.
- Faz10–12: mevcut cancellation/cache/cleanup kanıtları; ham DOM/CSP kapısını
  açık tut; erişilebilir paneller ve kullanıcıya uygun ilk ekran.
- Faz13–15: gerçek katalogla A–Fsenaryoları;1453kaydı yoksa açık no-data,
  varmış gibi fixture ekleme.8ekran boyutunda gerçek screenshot+bounds planı.
  Ortam çalıştırmazsa NOT TESTED; mockup/sahtePNG üretme.
- Faz16: lint/strictTS/unit/worker/assets/rights/formatter/web+AndroidJSexport,
  probe/audit ve ortam kanıtı; rapor/README/progress/atıf. FizikselAndroid,
  browser/CSP/bağımlılık kapıları kapanmadan READY deme.

Yeni dış UI/harita bağımlılığı ve veri kaybı migration'ı yok. Belirsiz lisanslı
kaynakları eklemek yerine mevcut izinli fiziksel veri kullanılır. Gerçek cihaz
ve tarayıcı kısıtı bağımsız uygulanabilir işleri durdurmaz; yayın kararı NO-GO.

## Uygulama sonrası durum

Uygulanabilir kod, regresyonlar ve belgeler teslim edildi. Faz bazında kabul
[sonuç matrisinde](ui-and-map-redesign.md);7kontrolün gerçek yeniden koşusu
[probe raporunda](probe-remediation.md). Baseline250+5; son255+5test PASS.
Faz4ayrıntılı fiziksel içerik ve Faz13/15/16gerçek platform/görsel/yayın kabulü
PARTIAL/BLOCKED. Açık kapılar varken planın bütün kabul koşulları tamamlandı
veya ürün READY denmez.
