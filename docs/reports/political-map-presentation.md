# Siyasi harita çizimi ve ülke adları — 17 Ekim 2026

Kullanıcı mevcut küreyi beğendi; yalnız ülke adlarının küçülmesini, neon
etkisinin giderilmesini ve GeaCron'un sınır/ad sunumunun görsel referans
alınmasını istedi. Yeni harita motoru, veri aktarımı veya ürün fazı açılmadı.

## İnceleme ve kapsam

`AGENTS.md`, README, ilerleme kaydı, mevcut siyasi stil, renk üretimi,
DOM etiketleri, çakışma hesabı ve ilgili testler incelendi. `git status --short`
bu ortamda `fatal: not a git repository` verdi; Git farkı alınamadı.
Kullanıcı dosyalarını geri alan veya silen bir komut çalıştırılmadı.

[GeaCron referans sayfası](https://geacron.com/home-en/) ve onun
[gömülü harita adresi](https://geacron.com/map/atlas/mapal.html) açılmaya
çalışıldı. Ana sayfa erişildi; JavaScript haritası araştırma aracında görsel
olarak açılamadı. Görsel aramada önceki harita ekranlarının açıklamaları da
incelendi; canlı ürünün tüm zoom seviyeleri incelenmiş sayılmaz.
Bu yüzden birebir stil veya davranış eşleşmesi iddia edilmiyor.
GeaCron'un geometrisi, verisi, yazılımı, renk değerleri, fontu veya görselleri
projeye alınmadı. Kullanıcının istediği sade atlas çizimi özgün tema tokenlarıyla
mevcut lisanslı siyasi kayıtların üzerine uygulandı.

## Küçük değişiklik planı ve sonuç — IMPLEMENTED

1. Ülke renklerini mat, düşük doygunluklu tonlara çevir; dolgu ve sınırı ayır.
2. Kalın renkli kenarlar yerine ince, ortak nötr sınır kullan; yaklaşık ve
   ihtilaflı alanların ayrı kesik çizgi desenlerini koru.
3. Ülke etiketlerinin sürekli kutusunu kaldır; küçük metin, görünür klavye
   odağı ve büyük dokunma alanını birlikte kullan. Çakışma hesabını boyutla eşle.
4. Lejantı sınır rengiyle eşle; testleri, platform paketlemelerini ve belgeyi güncelle.

Normal/yaklaşık çizgiler zoom'a göre **0,65–1,2 px**; önceki yaklaşık çizgi
**4 px** idi. İhtilaf/ortak yönetim/vasallık çizgileri **0,85–1,5 px** ve ayrı
desenler taşır. Seçimde dar, sıcak tonlu ek kenar ve dolgu vurgusu vardır;
belirsizlik desenini kapatan kalın bir parlama eklenmedi.

Ülke dolgusu sabit kimlikten üretilen sekiz özgün mat tondan gelir; normal
opaklık 0,30, seçili 0,38, ihtilaflı 0,14, ortak/vasal 0,24.
Bunlar görsel sunum değerleridir; sınır hassasiyetini veya siyasi iddiayı
değiştirmez. Bilimsel belirsizlik kaynak kartında ve çizgi deseninde korunur.

Ülke adları zoom <2 için **10 px**, 2–4,5 için **11 px**, daha yakında
**12 px**; kutusuz ve en çok 176 px genişliğindedir. Asıl dokunma alanı en az
**48×48 px** kalır. Yalnız ülke adlarından kutu/önek kaldırıldı; kültür ve yer
etiketlerinin ayrı simgeleri korunur. Klavye odağında kontrastlı arka plan ve
çerçeve, seçimde alt çizgi vardır. Arka yüzdeki etiketleri gizleme, sürükleme
sonrası yanlış seçimi engelleme ve unmount temizliği korunur.

Kürenin projeksiyonu, kamera ayarları, kara/deniz/göl/akarsu renk ve verileri,
harita boyutu, yıl kapsamı, ülke geometrileri ve kaynak kayıtları değiştirilmedi.
Yeni bağımlılık, indirme, tile/glyph servisi veya ücretli API yok.

## Değişen dosyalar

- `src/theme/tokens.ts`: mat siyasi palet ve harita sunum tokenları.
- `src/politics/model.ts`: iddia türüne göre dolgu opaklıkları.
- `src/politics/selection.ts`: ülke etiketi boyutu ve dokunma/çakışma ölçüsü.
- `src/map/globe/style.ts`: siyasi çizgi, dolgu ve seçim görünümü.
- `src/map/globe/political-labels.ts`: kutusuz ülke adları, zoom yazı boyutu.
- `src/map/globe/markers.css`: ülke adı hover, seçim ve klavye odağı.
- `src/atlas/LegendPanel.tsx`: nötr sınır rengiyle eşleşen lejant.
- `docs/progress.md`, `docs/license-register.md`, `THIRD_PARTY_NOTICES.md` ve
  bu rapor: kapsam, doğrulama ve referans hakları.

## Doğrulama

Son kontrollerin gerçek komut kayıtları
[kanıt klasöründe](political-map-presentation/commands.json).

| Kontrol | Sonuç | Kanıt |
| --- | --- | --- |
| `npm run lint` | PASS, 0 uyarı | [Log](political-map-presentation/lint.log) |
| `npm run typecheck` | PASS, native + web strict | [Log](political-map-presentation/typecheck.log) |
| `npm test` | PASS, 283/283; 0 fail/skip | [Log](political-map-presentation/tests.log) |
| `npm run test:worker` | PASS, 5/5 | [Log](political-map-presentation/worker.log) |
| Değişen yedi kaynak dosyasında Prettier | PASS | [Log](political-map-presentation/format.log) |
| `npm run web:export` | PASS, 4 rota, `dist` | [Log](political-map-presentation/web-export.log) |
| `npm run android:bundle` | PASS, Hermes + DOM JS; APK değil | [Log](political-map-presentation/android-export.log) |
| MapLibre stil / çakışma / kontrast probe | PASS | [JSON](political-map-presentation/style-probe.json) |
| Gerçek Chromium / screenshot / E2E | BLOCKED, ortam izni; 0 screenshot | [Log](political-map-presentation/browser.log) |
| Fiziksel Android / TalkBack | NOT TESTED — UNVERIFIED ON DEVICE | Cihaz doğrulaması yapılmadı |

Tek siyasi dolgunun fiziksel kara tokenı üzerine sRGB alfa bileşiminde,
sekiz rengin en düşük küçük metin kontrastı normalde **5,17:1**, seçilide
**4,57:1** hesaplandı; hedef en az 4,5:1. İlk opaklıklar bu hedefi sağlamadığı
için düşürülüp son kontroller tekrar koşuldu. Bu hesap, çakışan poligonlarda,
nehir/sahil üstünde veya gerçek WebView piksel çıktısında kontrast denetimi
yerine geçmez. Koyu metin gölgesi ve odakta opak arka plan ayrıca vardır.

283 mevcut birim testinin siyasi stil doğrulama, belirsizlik ayrımı, etiket
çakışması, drag/arka yüz seçimi ve kaynak temizliği testleri kullanıldı;
başarısız test silinmedi veya beklenti gevşetilmedi. Yeni sentetik ürün verisi yok.

Görsel tarayıcı denemesinde Chromium açılışı
`sandbox_host_linux.cc:41 … Operation not permitted` ile engellendi.
Bu ortamda ekran görüntüsü üretilemedi; görsel kabul **BLOCKED**, screenshot
sayısı **0**. Sayısal stil/yerleşim probe'u gerçek GPU ekran görüntüsü değildir.
Android fiziksel cihaz doğrulaması **UNVERIFIED ON DEVICE**; JavaScript export
başarısı APK/cihaz başarısı sayılmaz.

## Kullanıcı doğrulaması ve kalan risk

`npm run web -- --clear` ile web'i açın; mevcut sunucuda sayfayı yenilemek de
yeterlidir. Yeni veri indirmeniz gerekmez. 2000/1453 gibi desteklenen yıllarda
uzak/yakın görünümü, yoğun Avrupa bölgesini, seçilen ülkeyi ve Tab/Enter ile
etiket seçimini inceleyin. Küçük telefon ekranında adların yoğunluğu ve çizgi
okunabilirliği gerçek cihazda ayrıca değerlendirilmelidir. Tarihî kapsamın
eksikliği bu görsel değişiklikle giderilmiş sayılmaz; yeni faza geçilmedi.
