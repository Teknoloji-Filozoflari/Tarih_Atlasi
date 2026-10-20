# Faz 0 — repo, UI ve harita baseline

16 Ekim 2026. **İnceleme tamamlandı; gerçek viewport ölçümü BLOCKED.**
Bu belge bu görevin başlangıcındaki **mevcut çalışma dosyalarını** ölçer;
önceki konuşmada yapılan ve henüz son kabulü yapılmamış iyileştirmeler de bu
baseline'a dahildir. Eski ekranın veya temiz Git commit'inin baseline'ı olduğu
iddia edilmez. Bu oturumda incelenecek özgün ekran görüntüsü sağlanmadı;
kontrol envanteri kaynak kodundan çıkarıldı. Piksel düzeyinde eski/yeni görüntü
karşılaştırması NOT TESTED.

## Çalışma ağacını koruma

`git status --short` gerçekten çalıştırıldı: **exit128**, “not a git repository”.
[Çıktı](evidence/git-status.log). Reset, checkout, init veya silme yapılmadı.
Git diff ile kullanıcı/ajan değişikliğini ayırmak mümkün değil. Bunun yerine
kaynak/veri/test/konfigürasyonların285dosyası faz başında ve sonunda SHA-256 ile
karşılaştırıldı: **0değişen kaynak dosyası**. [Önce](evidence/source-before.json),
[sonra](evidence/source-after.json), [bütünlük](evidence/source-integrity.json).
Faz0 yalnız bu belge, kanıtlar ve progress kaydı üretir. Export/cache çıktıları
kaynak bütünlük karşılaştırmasına dahil değildir.

## Gerçek teknoloji — varsayım değil kod izi

| Alan | Kaynaktaki karşılığı / gözlenen sürüm |
| --- | --- |
| Giriş ve router | `package.json: main=expo-router/entry`; `src/app/_layout.tsx` Stack, index başlıksız; `src/app/index.tsx` doğrudan AtlasScreen; about/not-found ayrı. |
| UI | Expo57.0.29, React19.2.3, RN0.86.3, RNWeb0.21.2, Router57.0.28. Bunlar güncel sürüm önerisi değil, package/lock/kurulu paket okumasıdır. |
| Renderer | **MapLibre GL JS6.14.0**; `GlobeView.tsx` dynamic import→`renderer.ts mountRenderer`→`new library.Map`. MapLibre Native, Three.js veya D3 renderer çağrısı yok. |
| Web | `MapViewport.web.tsx`→useGlobeHost/ViewportFrame→GlobeView; doğrudan DOM/WebGL2. |
| Android | `MapViewport.native.tsx`→`GlobeDOM.tsx ('use dom')`→aynıGlobeView. `useExpoDOMWebView:false` ile RN WebView13.16.1; tek harita DOM/WebView kökü. Native renderer olduğu varsayılmaz. |
| Projeksiyon | Stil başlangıcı globe; `catalog.view` komutuyla aynıMap'te `setProjection`. AtlasScreen varsayılanı mercator; dolayısıyla dosyada globe yazması ilk ürün görünümünün Küre olduğunu kanıtlamaz. |
| Worker/GPU | YerelBlobworker, workerCount1, WebGL2probe; resizeObserver→map.resize; dispose/remove/listener/Blob cleanup var. AndroidGPU kabulü yok. |
| Zaman | `timeline/year.ts`, engine/store/frame; tarihsel yıl0yok; astronomical dönüşüm, snapshot/continuous ayrımı, abort/revision, ayrı requestedYear/sourceYear. |
| Veri | domain şema/lisans/provenance kapısı→provider tarih/bbox indeksi→sınırlı pilot→manifest/hash/LOD parçaları. DOM'da `globe/data-loader.ts`; native UI veri runtime'ı ile DOM runtime'ı aynı süreç varsayılmıyor. |
| Arama | `discovery/search.ts`, query.ts; yerel8canonical kayıt,5grup, Türkçe normalize,220ms debounce, iptal. **Yer grubu yok.** |
| Saklama | bookmark max50/64KiB; web localStorage, native özel dosya. Tercihler ayrıversion1/4KiB. Görünüm türü paylaşım/yer iminde var, genel tercihte yok. |
| URL/paylaşım | `view.ts`, incoming.web/native ve +native-intent; yıl/ID/lat/lon/zoom/projection whitelist; gelen görünüm önce incelenip uygulanıyor. Web Share desteklenmiyorsa gönder tuşu sessizce sonuçsuz; seçilebilir URL var. |
| Kaynak | sources repository/sitelink snapshot, TR→EN→WD, dış URL politikası. WikidataCC0 ile makale/görsel lisansları ayrı. |
| Tema/i18n | tokenlar, AppText/Action; `t`/tr kataloğu. Bazı kaynak açıklamaları ham editöryal İngilizce; kaynak alıntısı ile UI çevirisi ayrılmalı. |
| Test/CI | Node test runner TS strip, MapLibre/DOM double renderer entegrasyonu, ayrıworker AST/VM testleri, Playwrightdesktop+narrow, snapshot beklentileri. CI varlığı yeşilCI kanıtı değildir. |

[Ölçülmüş paket/veri/stil değerleri](evidence/source-facts.json).
Kök lockfileVersion3; root dependency eşleşmesi kontrol edildi; paket kurulumu
veya yükseltme yapılmadı. `Screen.tsx` içindeki960px maxWidth Hakkında/hata
sayfasına aittir; AtlasScreen bu bileşenle sarmalanmaz. Küreyi bu değer
küçültüyormuş gibi teşhis etmek hatalı olur.

## Kontrol envanteri

Sınıf kontrolün gerçek işlevini gösterir; her satırdaki parametrik üyeler aynı
handler/modeli paylaşır. Salt metin/snapshot tickleri düğme sayılmaz. Görüntü
sağlanmadığından piksellerde mevcut oldukları iddia edilmez.

| Kontrol / konum | Gerçek işlev | Sınıf |
| --- | --- | --- |
| Ana arama alanı, Ara/Enter | query günceller, SearchResults açar; otomatik yıl değiştirmez | primary-user-flow |
| Arama düzenleme, sonuç, sonuç sayfalama | yerel indeksi sorgular/iptal eder; canonical hedef açar | primary-user-flow |
| Sonuçta ilgili tarihe git / seçili yılda kal | açık tarih tercihi; kaynaklı konum varsa odak ayrı | primary-user-flow |
| Sonuç/varlık coğrafyasına odak | izinli ve o yılda görünür kayda kamera isteği | primary-user-flow |
| Arama sonuçlarına dön | sonuç listesine geri gider | primary-user-flow |
| Atlas / Küre | aynırenderer projeksiyonunu değiştirir | primary-user-flow |
| Harita drag/touch/rotate, wheel/pinch, klavye | MapLibre etkileşim handler'ları | primary-user-flow |
| + / − | cameraRequest, zoom0–8clamp | primary-user-flow |
| Kamerayı sıfırla | INITIAL_CAMERA0°,0°,z1,bearing/pitch0 | secondary-user-flow |
| Harita siyasi/kültür etiketi, kişi/olay marker'ı, polygon | feature seçimi; örtüşen aday listesi/sayfalama | primary-user-flow |
| Cluster düğmesi | aday listesi verir; otomatik zoom/expand yok | primary-user-flow |
| Katmanlar | LayersDrawer açar | primary-user-flow |
| Devlet/kültür/kişi/savaş/olay/tarihî yer anahtarları |6bağımsız görünürlük; persist edilir | primary-user-flow |
| Kesin destek/güven/siyasi tür/kişi ilişkisi/olay türü | source-temporal filtre; kaynaksız kesinlik üretmez | secondary-user-flow |
| Yaklaşık kişi konumu / seyrek etiket | açık tercih; askıdaki konumu açamaz | secondary-user-flow |
| Legend | semantik açıklama; tıklanan yeni veri özelliği değil | primary-user-flow |
| Önceki/sonraki yıl, yıl düğmesi, slider/ok/Home/End | yıl0atlayarak tarih/store; manuel giriş playback durdurur | primary-user-flow |
| Yıl girişinde MÖ/MS, metin, uygula | parse/limit/hata; onayla tarihi değiştirir | primary-user-flow |
| Oynat/durdur | store playback; ilk açılışta otomatik başlamaz | primary-user-flow |
| Tarih araçları aç/kapat | ek timeline kontrollerini açar | secondary-user-flow |
| Başlangıç/günümüz,±10/100,ölçek tüm/200/20,hız1/10/100 | atlama,slider penceresi,playback adımı | secondary-user-flow |
| Kapsamı incele | Keşfet/kapsam paneli açar | primary-user-flow |
| En yakın kaynak yılını önizle/kapat | kaynak yılı açık olan opt-in preview; kesin yıl değildir | secondary-user-flow |
| Keşfet | katalog, görünüm yönetimi ve kapsam menüsü | primary-user-flow |
| Bu yılın siyasi/kültürel/savaş-olay kayıtları, kişi kataloğu | ilgili liste/kart açar; eksikliği gösterebilir | primary-user-flow |
|1867sınır/1066muharebe/Kişi1880inceleme | sabit tarih ve katman seçer; teknik örnek kısayolları | developer-only |
| Kaynaklı örneğe odaklan | ilk görünür kaynak kaydına focus; eski Alaska-sabitliği giderilmiş | secondary-user-flow |
| Pilotun kaynak/kapsamı | PilotCard; kaynak + türetim + geometri kısıtı | diagnostic |
| Kapsam ve kaynaklar / Atlas hakkında | genel ürün/kapsam açıklaması | secondary-user-flow |
| Yer imleri giriş/kaydet yıl-varlık-kamera/aç/sil/sayfala | yerel kullanıcı kaydı; görünümü uygulamak açık seçim | secondary-user-flow |
| Bozuk yer imi retry/incele/vazgeç/onayla sıfırla | ham kaydı değiştirmeden inceletir; yalnız explicit onay temizler | secondary-user-flow |
| Görünümü paylaş/gönder, gelen görünümü incele/yoksay/uygula | URL/native share; hash-parametre güvenliği | secondary-user-flow |
| Ayarlar/gizlilik,system/reduce,retry,tercih reset | tercihler; yer imini silmez | secondary-user-flow |
| Paneli kapat/Escape/Android geri | mevcut Modal'i kapatır | primary-user-flow |
| Varlık kartında kaynakları/belirsizliği aç, kaynak sayfalama | bilimsel iddia/atıf/revizyon gösterir | primary-user-flow |
| Wikipedia/WD/doğrudan kaynak/bağımsız inceleme bağlantısı | doğrulanmış dış URL'yi açar; harita WebView navigasyonu değil | secondary-user-flow |
| Harita lisansları©, haritadaki noticesdetails, atıf paneli | bağımsız kod/veri/font hakları | legal-attribution |
| Harita konumu/seçim bilgisi⌖ | kamera sayıları ve köprü seçimi metnini açar | diagnostic |
| Sentetik teknik işaret göster/gizle ve◎marker | teknik köprü testi; tarihî varlık değil | developer-only |
| Harita/veri/ayar/kaynak hata retry | ilgili yükleme ya da saklamayı tekrar dener | primary-user-flow |
| __ATLAS_PROFILE__/__ATLAS_METRICS__ | sınırlandırılmış geliştirici ölçümleri; normal UIkontrolü değil | developer-only |

**Kaynakla kanıtlanan hiyerarşi açıkları:** demoToggle düğmesi yalnız preferences
read/writeerror dalında; normal Keşfet'te yok. Gizli işareti normal durumda
etkinleştirmeyi bekleyen E2E kısayolu bu nedenle erişilemez. Kamera sayısı/köprü
metni normal üretim bilgi kontrolünde; örnek/pilot kısayolları Keşfet'te.
Production dili ve geliştirici işlevleri hâlâ ayrılmamış. Genel projection
tercihi yeniden açılışta geri yüklenmiyor. Mobil sheet Modal ve background
pointerEvents none: harita tamamen kilitli. Bunlar renk değişikliğiyle çözülmez.

## Kürenin küçük görünmesi — container/kamera ayrımı

| Katman | Koddan kesin değer | Gerçek ölçüm durumu / teşhis |
| --- | --- | --- |
| HTMLroot | viewport meta veScrollViewStyleReset; nativeDOM html/body/#root height100%,overflowhidden | computed/root bounding rect ölçülemedi |
| Atlasroot | SafeAreaView flex1→KeyboardAvoidingView flex1→ScreenSurface flex1 | safe-area/klavye yüksekliği runtimegerektirir |
| Header | padding8,border1;48touch; compact normal2satır,wide1satır | normalmobil header yüksekliği sabit64değil; sarılma ek yer harcar |
| Workspace | flex1,minHeight160;windowheight<500ise120 | CSS alt sınırı gerçek canvas yüksekliği değildir |
| Body/globe | flex1;body relative;globe minWidth0;aktif CSSgrid yok | aspectRatio/sabit kare kısıtı yok |
| ViewportFrame | width100%,flex1,min160/120;viewport flex1,min160/120,overflowhidden | parent'tan küçük yükseklik gelirse minimum/clipping riski; bounding rect yok |
| DOMsection/container | section height100%,width100%,minHeight0;hostabsoluteinset0 | canvas,bufferwidth/height veDPR ölçümü yok |
| Kamera | INITIALz1,center0/0,pitch0,bearing0;maxz8;dprcap2 | gerçek etkileşim sonrası kamera/ekrandaki küre çapı ölçülemedi; küçük görünümü sadece zoom'a bağlamak kanıtsız |
| Resize | ResizeObserver→map.resize ve marker refresh | observer varlığı doğru boyut aldığına kanıt değil |
| Alt documentflow | kapsamstrip48hedef + koşullu cache/sürüm satırı + timeline(48row,48slider,10tick,21axis,padding/gap;expandmax160) | normal akış harita için kalan yüksekliği azaltır; satır sarılması/uyarılar/expanded dock ayrıca etkiler |
| Overlayler | view switch/tools absolute;bilgi/notices absolute;detailModal | normal harita alanını CSSflow'da daraltmazlar, fakat görsel/etkileşim alanını kapatabilirler |
| Eski token/rail | theme.mapMinHeight280,style.rail180 mevcut ama bu ana ekrandaki aktif min160/120;rail render edilmiyor | eski sabitleri gerçek viewport ölçümü saymama |

Yükseklik bütçesi: `harita ≈ kullanılabilir pencere − safearea − header − uyarılar
− kapsam/cache satırları − timeline`. Bu bir **bağıntı**, ölçülmüş px sonucu
değildir. Güncel kodda geçmişteki çok sayıda örnek butonu artık map altındaki
normalflow'da değil, Keşfet Modal'i içinde. Eski küçük küre ekranının bugün de
aynı DOM olduğu varsayılmaz. Güncel risk çok satırlı mobilheader ve ayrı alt
satırların harita yüksekliğini tüketmesidir; gerçek dar/geniş ekran sayıları
olmadan kesin kök neden/önce-sonra oranı verilmez.

**BLOCKED ölçümler:** parent/container/canvas client rect, canvas width/height,
aspectratio, küre çapı, viewport yüzdesi, scrollWidth/clientWidth,computedoverflow.
Loopback8081listenEPERM; Chromium sandbox_host_linux Operation not permitted.
[Browser](evidence/browser-launch.log), [port](evidence/loopback.log).
Ölçüm sağlanmadan “küre alanı%Xarttı” denmeyecek.

## Ayrıntı eksikliği — viewport'tan bağımsız

Disk/katalog ölçümü: **NaturalEarthv5.1.2,1:110m,127feature,128ring,5143konum,
138160ham byte**.50mmodülünull; daha ayrıntılı geometri mevcut değil.
Style **2GeoJSONsource,15layer,0symbol,0raster**, glyphs/spritenull.
Fizikselfeatureproperties0: siyasi isimler bilerek çıkarılmış. Remote resource
transformRequest tarafından reddediliyor; vector tile, nehir/göl/relief ve
fiziksel ad katmanı yok. Bu kaynak/stil kararlarıdır; canvas'ı büyütmek yeni
kıyı noktası/nehir/şehir üretmez. Yüksek zoom aynı5143konumu büyütür.

Modern ülke etiketlerinin olmaması hata değildir: bağlayıcı tarihî semantik
kuralıdır. Tarihî DOMlabel sistemi var ve prefs.labels varsayılantrue; kaynak
geometrisi/yılı/katmanı yoksa label üretilmez. Sorunu yalnız “etiketler kapalı”
diye açıklamak yanlış. Dünya tabanı güncel fiziki kıyı referansıdır; tarihî
sahil veya siyasi egemenlik kaynağı değildir.

Tarih kataloğu0.4.1-pilot:19kayıt/7kaynak;4026seçilebilir yıl içinde yalnız
1066/1867'de kaynaklı yaklaşık coğrafya;4024yılda destekli geometri yok.
Tam siyasi polygon0,kültürgeometrisi0,kesin coğrafya yılı0.1belgeli sınır
kesiti ve1yaklaşık muharebe noktası; kişi profili var ama konumu askıda.
Boş yıl tarihsel yokluk değildir. [Kapsam sayımı](evidence/coverage.json).

## Başlangıç test/build/audit durumu

Her komut ve gerçek exit/süre [commands.json](evidence/commands.json) dosyasında.

| Kontrol | Başlangıç sonucu |
| --- | --- |
| lint | PASS,exit0 |
| strict native+web typecheck | PASS,exit0 |
| unit + renderer double entegrasyonu | PASS,250test,exit0; GPU/gerçek tarayıcı testi değil |
| worker AST/VM | PASS,5test,exit0 |
| production webexport | PASS,4statikrota; browser açılışı kanıtı değil |
| Playwrightliste | PASS,84senaryo/13dosya listelendi |
| gerçek Playwrightentegrasyon | BLOCKED,30s,exit124;0tamamlanan senaryo |
| asset/pilot/sitelink/chunk | PASS,exit0;4LODgirdisi/3parça |
| basemapcheck | exit0 fakat **PARTIAL**:50myok;110m kullanılıyor |
| formatter/publicExpoConfig | PASS,exit0 |
| coverage/security/license araçları | exit0; rapor üretimi, yayın onayı değil |
| npm audit | BLOCKED,exit1,EAI_AGAIN; güvenlik temizliği iddiası yok |
| ortam | Node/npm/lockPASS;Java/adb/SDKyok,exit1; **UNVERIFIED ON DEVICE** |

Yedi audit probe dosyası gerçekten Node'da çalıştırıldı:
[başlangıç çıktısı](evidence/probes-start.log).AUD01/02/03/04/05/07 önceki düzeltme
kodlarıyla doğru korumaları gösteriyor. AUD06 bozuk JSON'da list/remove/save için
SyntaxError ve0yazma, ayrıca explicitreview/reset API'sini gösteriyor; normal
kurtarma akışı ayrı unit testinde doğrulanıyor, probe tek başına PASSsayılmaz.

## Faz 0 kabul ve sonraki adımlar

**Belgelendirme kabulü IMPLEMENTED:** viewport/yükseklik, fiziksel veri ayrıntısı,
tarihsel kapsam ve UIhiyerarşisi ayrıldı. Renk/CSSdeğişimi tek başına çözüm değil.
**Piksel baseline PARTIAL/BLOCKED:** ekran görüntüsü/runtimebounds yok.
Sonraki uygulama adımları; üretim/dev ayrımı,tekdock/kompaktheader, kalıcı
projeksiyon tercihi,yer araması ve mapile birlikte kullanılabilir detay sheet.
Ayrıntılı fiziksel katman için hakları kesin kaynak + erişim + performans kanıtı;
yeni tarihî geometriler uydurulmayacak. Gerçek görüntüler ve Android kabulü
engeller kalktığında tamamlanmalı. Sonuç bu aşamada READYdeğildir.
