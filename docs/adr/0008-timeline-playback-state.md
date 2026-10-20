# ADR-0008 — Çizelge, oynatma ve tek zaman bağlamı

2026-10-16 · ACCEPTED — SOURCE / UNIT SCOPE; WEB / DEVICE ACCEPTANCE OPEN.

Faz 07'nin kullanıcı promptu eski yol haritasındaki siyasi veri katmanı başlığının
yerine geçer. Yeni tarihî veri, renderer veya bağımlılık seçilmedi. React external
store/useSyncExternalStore, web'in yerleşik range girdisi ve RN'nin mevcut responder/
adjustable erişilebilirlik API'leri kullanılır. Doğrulama kurulu paket tipleri ve
native/web strict derleme ile yapılır; gerçek touch/ekran okuyucu kanıtı değildir.

Tek store requestedYear, renderedSourceYear ve coverageStatus'u ayırır. Sorgu
başlayınca eski frame/kaynak etiketi temizlenir; AbortSignal + revision eski
başarı/hataların yayımlanmasını engeller. Coverage ve bütün varlık grupları tek
frame'de yayımlanır. Açık snapshot önizlemesinde requestedYear değişmez, bütün
gruplar açıkça etiketli kaynak yılını contextYear olarak kullanır. Renderer'ın
source.setData Promise'i tamamlanmadan catalog.applied geri bildirimi gönderilmez.
Bu, veri kaynağı uygulama ACK'sidir; fiziksel GPU/screenshot/FPS kanıtı değildir.
Session/katalog/revision/yıl/kapsam eşleşmeyen ACK reddedilir. Geometri köprüye girmez.

Manuel çizelge hareketi, yıl paneli/girdisi, atlama, başlangıç/bitiş ve önizleme
seçimi oynatmayı durdurur. Bilgi/katman paneli açılması, ekranı terk etme ve
uygulamanın arka plana geçmesi de durdurur; otomatik devam yoktur. Küreyi kamerayla
sürüklemek zaman seçimi sayılmaz ve tarih oynatmasını durdurmaz. Kamera salt tarih
veya hız değişiminde hareket etmez; reset ve ayrı kaynaklı örneğe odaklan düğmesi
kullanıcı niyetiyle hareket ettirir.

Oynatma 500 ms/adım; reduced motion 1000 ms/adım ve başlangıçta daima duruktur.
Hızlar 1/10/100 yıl/adım. Son yılda durur; son yıldayken yeniden Oynat'a basmak
MÖ 2000'den başlatır. Tek timer yeniden kurulur; her ara yıl için ayrı sorgu yoktur.
Sürükleme trailing 80 ms ile birleştirilir, bırakma hemen son sorguyu çalıştırır.
Bir scrub serisinde bridge'e tekrar tekrar boş geometri komutu yığılmaz. Zaman
motorunun mevcut indeksi/cache'i ve MapLibre örneği korunur; tick'te yeniden
WebView/harita/katalog kurulmaz. In-memory eşzamanlı döngü ortasında kesilmez;
iptal bekleyiş/commit ve signal alan adaptör düzeyindedir. Gelecekte ağ sağlayıcı
kullanılırsa signal gerçek I/O'ya da iletilmelidir.

Tüm tarih / 200 / 20 yıl ölçekleri aynı astronomik sıra üzerinde çalışır; MÖ 1
ile MS 1 komşudur. Slider iç sayısal değerleri astronomik olabilir, insan etiketi
sıfırsız MÖ/MS'dir. Kaynak işaretleri katalog snapshot API'sinden gelir; yoğun
aralıkta mobil 24/web 64 gerçek yıl seçilir. Sahte bin-merkezi yıl eklenmez;
seyreltme açıklanır. İnce işaretler arası sürekli tarihî geometri olduğu ima edilmez.

Yeni UI'nin gerçek web yerleşimi, klavye, pointer ve Android TalkBack/dokunma/
rotasyon kabulü ayrıca gerekir. Önceki Faz 05 kullanıcı testi yeni çizelgeyi
onaylamaz. [Kullanım ve state sözleşmesi](../playback.md), [faz raporu](../reports/phase-07.md).
