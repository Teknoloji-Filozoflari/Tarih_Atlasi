# 1881 kişi seçimi ve şehir/nokta hataları — 20 Ekim 2026

## Bulgular ve değişiklikler

Kullanıcının `hata.png`, `1881.png`, `nokta.png` görüntüleri okundu. İki hata görüntüsü aynı `ModernCityCard.tsx` bileşenini gösteriyor: `Unexpected text node: . A text node cannot be a child of a <View>.`

**IMPLEMENTED — şehir kartı:** GeoNames'ta boş idari alanlar `''` olabilir. `city.admin2 && <AppText>` ifadesi bu durumda boş string döndürür; React Native Web View bunu geçersiz metin çocuğu olarak raporlar. Değişiklikten önce gerçek React + React Native Web render'ıyla, boş `admin2` ve `modifiedAt` içeren sentetik kayıtta aynı hata iki kez üretildi. Koşullar açık boolean'a dönüştürüldü; aynı render artık hata üretmiyor. Boş/eksik ülke, idari alan, featureCode ve değişiklik tarihi varyasyonları testli. Diğer ilgili string koşulları (Action simgesi, timeline durum etiketi, yerleşim manifest sürümü) de düzeltildi. Geliştirici panelindeki doğrudan View altına yazılmış `{' '}` kaldırıldı; bütün kaynak TSX dosyaları için literal metin denetimi eklendi.

**IMPLEMENTED — Atatürk/diğer harita seçimleri:** 1881 görüntüsünde kişi işareti Selanik dolayında zaten var; açık kart güncel Karyes şehir kartı. `onSelectionPage` şehir kartını etkileşimli panel olarak kabul etmiyordu. Artık ortak `canSelectMapRecord` politikası hem yerleşimi hem seçimi yönetiyor; şehir kartı açıkken kişi/olay seçilebilir. Açıkça seçilen kişi/olay işareti doğrudan kendi kartını açar; diğer örtüşen adaylara karttaki mevcut listeden erişilir. Kültür/siyasi alan çoklu seçim listesi korunur.

**IMPLEMENTED — eski şehir yanıtı:** bekleyen şehir-paketi okuması, daha sonra seçilmiş kişi/olay/not kartının üzerine yazabiliyordu. Yeni seçim türleri ve yıl revizyonu bu isteği iptal eder; gecikmiş yanıt atanırsa bile iptal kontrolünden geçemez.

**IMPLEMENTED — nokta seçme:** kişisel nokta seçilirken güncel şehir/kişi/olay/not veya ülke Wikipedia eylemi seçimi kesemez. Aynı politika modal araçları da korur. Noktayı ortadaki artıya getirip **Bu noktayı kullan** eylemiyle yerel not formu açılır.

**IMPLEMENTED — okunabilir işaretler:** yakınlaşma 4 ve üzerinde veya kayıt seçiliyken tek kişi/olay işaretinin altında kaynaklı adı görünür. Küme sayı davranışı korunur. Modern şehir yazılarının görünmez dokunma alanı tarihî işareti kapatmasın diye marker katman sırası tanımlandı. Caption yalnız textContent kullanır; alt yazı tıklamayı aynı işarete bırakır, arkadaki yarımkürede işaretle birlikte gizlenir.

**IMPLEMENTED — arama kartı:** aramadan açılan `SearchTargetPanel` içindeki kısa kişi/olay kartına ayrıntı anahtarı iletilmiyordu; başlıkta bilgi düğmesi de yoktu. Arama ve harita kartları aynı ayrıntı kontrolünü kullanıyor. Atatürk → ⓘ → doğum yılı eylemi hem 1881'i seçer hem kaynaklı Selanik ilişkisi çizildikten sonra odaklar.

## Toplu kişi kontrolü

`npm run qa:people-visibility` internet veya yeni veri indirmeden dört incelenmiş doğum sürümünü doğrular. Çıktı: [people-visibility-audit.json](people-visibility-audit.json).

- 177 yayımlanmış profil: **0 denetim hatası**.
- 111 yıllık yaklaşık doğum noktası: zoom 1/4/8'de kaynak geometrisi ve adıyla mevcut; iki komşu yılda yok; yaklaşık kayıtlar kapalıyken kesinmiş gibi çizilmiyor; marker ID'si kişi detayını açabiliyor.
- 37 yalnız biyografik yer bağı yıllık konum iddiasına dönüştürülmedi.
- 29 konumsuz profil için tahminî nokta üretilmedi.
- Kaynak ID erişimi, kişi kimliği ve revizyon/hash kapıları korunur.
- Atatürk: `births:person-q5152`, `births:location-q5152`, yalnız 1881; `[22.935555555555556, 40.640277777777776]` Selanik yer temsil noktası. Doğum evi koordinatı iddiası yok.

Bu otomasyon, yayımlanmış verinin uygulama hattını denetler; 823 isimlik isteğin tamamının yayımlandığı veya her tarihsel iddianın bağımsız uzman doğrulamasının yapıldığı anlamına gelmez. Önceki tek pilot Van Gogh profili bu dört doğum sürümünün dışındadır; önceki testleri ana test koşusunda korunur. Gerçek tarayıcıda her noktaya elle tıklanmış gibi sunulmaz.

## Test ve doğrulama

- `npm test`: **PASS 389/389**; kaynaklı siyasi/kültürel/kişi/olay regresyonları korunur. Yeni 5 test gerçek RN Web city render'ı, panel/picking politikası, eski şehir yanıtı iptali, 177/111 toplu denetim ve TSX View metin taraması içerir.
- `npm run qa:people-visibility`: **PASS**, 177 / 111 / 0 hata; JSON raporu üretildi.
- `tests/web/local-notes.spec.ts`: 4 desktop senaryosu listelendi. Yeni iki senaryo: şehir kartından Atatürk işaretine geçiş ve nokta seçiminin şehir işaretiyle kesilmemesi. Gerçek çalıştırma/ekran görüntüsü **BLOCKED**: localhost isteği `EPERM`, Playwright süre sınırına takıldı. Test listelenmesi PASS test çalışması değildir.
- Android fiziksel cihaz/GPU/TalkBack **UNVERIFIED ON DEVICE**; bu düzeltmede Android paketleme yeniden çalıştırılmadı.

- `npm run typecheck`: **PASS**, native + web strict TypeScript.
- `npm run lint`: **PASS**, tam depo ve değişen dosyalarda 0 uyarı.
- `npm run web:export`: **PASS**, 4 rota ve 16.102 statik şehir paketi / 645.992.949 byte doğrulaması.
- Değişen dosyalarda formatter kontrolü aşağıdaki logdadır.
- Playwright gerçek çalıştırma: **exit124**, 40 saniyelik süre sınırı; localhost bağımsız isteği **EPERM**. Ekran görüntüsü üretilmedi.

Loglar `map-card-fixes-2026-10-20-*.log` dosyalarındadır. Yeni E2E dosyası üretim testi komutuna da eklendi.

## Değişen dosyalar

`src/atlas/ModernCityCard.tsx`, `map-interaction.ts`, `AtlasScreen.tsx`, `SearchTargetPanel.tsx`, `Action.tsx`, `TimelineBar.tsx`, `PlaceCoverage.tsx`; `src/map/selection-requests.ts`, `useGlobeHost.ts`, `globe/person-markers.ts`, `globe/markers.css`; `scripts/qa/people-visibility.mjs`; `tests/helpers/render-native-web.mjs`, `tests/unit/map-card-regression.test.mjs`, renderer DOM doubles, `tests/web/local-notes.spec.ts`, `tests/run.mjs`; `package.json`, README ve bu rapor/ilerleme/kalite/lisans kayıtları.

Yeni dış bağımlılık, gerçek tarihî veri, geometri, Wikipedia metni veya görsel eklenmedi. Kullanıcı görselleri yalnız teşhis için okundu. Veri/kod/servis lisans ayrımı değişmedi. Yerel kişisel not deposu silinmedi veya taşınmadı. Dizin `.git` içermiyor; `git status --short` exit128. Yıkıcı git/dosya işlemi yapılmadı.

## Kullanım

Çalışan geliştirme sunucusunu Ctrl+C ile durdurup `npm run web -- --clear` çalıştır. Tarayıcıda Ctrl+Shift+R kullan; site verilerini silmeye gerek yok (bu işlem yerel notları silebilir). MS 1881'de Selanik yakınında **Mustafa Kemal Atatürk** etiketli kişi işaretini seç. Arama → Atatürk → ⓘ → **Doğum yılına git ve yaklaşık konumu aç** da kullanılabilir. Ek indirme gerekmez.
