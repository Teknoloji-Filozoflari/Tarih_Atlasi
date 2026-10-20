# CShapes gözlenen şema düzeltmesi — 17 Ekim 2026

**IMPLEMENTED:** Gerçek yerel dosya okundu, gözlenen alanlar desteklendi ve
inceleme yeniden çalıştırıldı. **PARTIAL:** MS2000 için kaynak karşılaştırma
envanteri mevcut, bağımsız tarihî/egemenlik/tamlık doğrulaması yok.
**BLOCKED:** Yeni verinin üretime alınması; lisans ve veri incelemesi tamamlanmadı.

## Sorun ve küçük değişiklik

İlk inceleyici [2018 tarihli ETH codebook taslağındaki](https://icr.ethz.ch/data/cshapes/CShapes-2.0_Codebook.pdf)
`statename/startdate/enddate/status` alanlarını bekliyordu. Kullanıcının
`CShapes-2.0.geojson` dosyasında `cntry_name` ve ayrı GW takvim alanları var.
Bu nedenle710satırın tamamında `SCHEMA_REVIEW_REQUIRED` çıktı; kayıtların
boş olduğu anlamına gelmez. Beklenen export biçimini gerçek dosya gelmeden
genellemek doğru değildi; inceleme profili yerel kanıta göre genişletildi.

İnceleyiciv2 iki açık profili destekler. Gözlenen profil `cntry_name`, `gwcode`,
`gwsyear/gwsmonth/gwsday` ve `gweyear/gwemonth/gweday` alanlarını ister.
Sadece küçük harfli bu alanlar desteklenir; rastgele alias veya karma profil
sessizce seçilmez. Eksik parça, geçersiz takvim günü veya ters aralık
araştırma adayı üretmez. Bu profil dosyanın belirli bir yayıncı sürümü olduğunun
kanıtı değildir. [Resmî R dokümanı](https://cran.r-project.org/web/packages/cshapes/cshapes.pdf)
GW/COW ve bağımsız/bağlı toprak seçeneklerinin farklılığını doğrular; yerel
export alanları ve kökeni ayrıca incelenmelidir. R/Python/yeni bağımlılık yok.

`gwsdate/gwedate` metinleri saat dilimi belirtmez. Örneğin ilk satırın başlangıç
metni `31.12.1885 23:00:00`, ayrı takvim alanları ise1886-01-01'dir. Saat
dilimi veya gün düzeltmesi tahmin edilmedi. Araştırma sorgusu açık yıl-ay-gün
alanlarını kullanır, bütün adaylarda ham tarih alanları ve bu seçimin
`unapproved` niteliği saklanır. Bu işlem üretim geçerliliği tanımlamaz.

## Gerçek dosyada gözlenen sonuç

Girdi26344671byte. SHA-256:
`384b1ea90b9419f30a858d7ec237c85a22c60d1b35b5f85f215a1204f9989d42`.
Kullanıcının bildirdiği SHA ile aynı; tekrar incelemede değişmedi.

| Ölçüm | Sonuç | Sınır |
| --- | --- | --- |
| Tanınan satır |710/710 | Dosya adı yayıncı kökenini doğrulamaz |
| Desteklenmeyen şema / bozuk takvim tarihi |0/0 | Tarihlerin bağımsız tarihî doğruluk onayı değildir |
| Gözlenen uç tarihler |1886-01-01–2019-12-31 | Her yıl/bölgenin eksiksiz olduğu anlamına gelmez |
| MS2000ile kesişen dönem satırı |179 | Tekil bağımsız ülke sayısı değildir |
| Ayrı kaynak GW kodu |177 | Bağımlı/bileşik siyasi birimleri içerebilir |
| Bütün yılı kapsayan / kısmi yıl adayları |175/4 | Yıl içinde tek sınır seçilmedi |
| Mevcut geometri kapısını geçen / incelemede |176/3 | Tam OGC veya tarihî sınır sertifikası değildir |
| Siyasi statü alanı bulunmayan |710 | Eksik statü bağımsızlık diye doldurulmadı |
| Export tarih metni için semantik inceleme |710 | Saat dilimi/gün kayması kesinleştirilmedi |
| MS2026adayları |0 | En yakın/çağdaş sınır otomatik gösterilmedi |

Geometri incelemesi gereken kaynak indeksleri513(İsrail),607(Vietnam),
646(Avustralya): `WORLD_RING_INTERSECTION`. Eşik gevşetilmedi ve sınır
çizilip onarılmış gibi sunulmadı; sorun kaynak/veri semantiğiyle ayrıca
araştırılmalıdır. Diğer176satır da bağımsız tarihî onay almış değildir.

Kısmi yıl örneği: Suudi Arabistan ve Yemen için2000-06-11'de biten ve
2000-06-12'de başlayan ayrı kaynak dönemleri var; dört satır iki kodu temsil
ediyor. Uçların tarihî/teknik anlamı üretimden önce incelenmeli. Yıllık
arayüzde bu iki geometrinin aynı gün yürürlükte olduğu varsayılmaz.

Yunanistan satırı144,1368konum ile geometri kapısını geçti; önceki
Cliopatria kaynağındaki287konuma göre daha yoğun, fakat otomatik olarak
daha doğru tarihî sınır değildir. Ürdün507, Bahreyn524 de bulundu. Kaynak
etiketleri dönemsel ad garantisi vermez: `Yugoslavia`1992–2006tek satırdır;
`Swaziland (Eswatini)` alias içerir. Sadece veri kaynağı değiştirmek önceki
ad/yıl sorunlarını tamamen çözmez. Bu dosyanın bütün ülkeleri, bağlı
toprakları veya tüm günlerdeki sınırları eksiksiz sunduğu iddia edilmez.

## Haklar ve çıktı

[ETH yayıncı sayfası](https://icr.ethz.ch/data/cshapes/) veri için
[CC BY-NC-SA4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) bildirir.
`CONDITIONAL / üretim onayı yok` kararı değişmedi. Yerel dosyanın kaynağı,
sürümü, lisans belgesi ve dağıtım koşullarına uygunluğu ayrıca incelenmeli.
Ücretsiz uygulama veya R paketinin GPL lisansı veri hakkı yerine geçmez.

Ham dosya ve tam aday envanteri Git dışında `data/staging/country-review/`
içinde kaldı. Koordinatlar yeni üretim paketine veya bu dokümana kopyalanmadı.
Yeni `review-v2-*.json` eski v1raporunu ezmez; rapor kimliği sürümü de içerir.
Sonuç `DATA_REVIEW_REQUIRED`'dır; bu beklenen açık inceleme durumudur,
şema hatasının devam ettiği veya179kaydın onaylandığı anlamına gelmez.
Her sonuçta `productionAllowed:false`, `UNVERIFIED_LOCAL_INPUT` korunur.

## Test ve kanıt

- **PASS:**293ana test,5worker testi,lint,strictnative/webTypeScript,format.
- **PASS:**374mevcut üretim paketinin hash/lisans kapısı; üretim değişmedi.
- **PASS:**gerçek dosyada iki CLI koşusu aynı; ham SHA eşleşir; eski v1raporu
  ayrı ve erişilebilir;2026sorgusu0aday.
- **NOT TESTED:**web/Android build,görsel/E2E,gerçek cihaz. Runtime/UI değişmedi;
  Android **UNVERIFIED ON DEVICE**, screenshot0; önceki yayın NO-GO sürer.
- **BLOCKED:**Git status exit128,çalışma ağacı bu ortamda görünmüyor;
  reset/checkout/silme yapılmadı.

İki yeni regresyon testi açık sentetik geometri kullanır; gerçek veri test
fixture'larına veya üretime taşınmadı. Eksik statü,tarih metni/gün farkı,
kısmi yıl değişimi,eski profil uyumu,karışık şema ve bozuk gün reddi sınandı.
Gerçek dosya sonuçları [bulgular](cshapes-schema-review/findings.json),
gerçek çıkış kodları/loglar [komut kaydı](cshapes-schema-review/commands.json).

Kod/test değişiklikleri: `scripts/etl/cshapes-review.mjs`,
`scripts/inspect-cshapes.mjs`, `tests/unit/cshapes-review.test.mjs`.
Dokümanlar:bu rapor/kanıtlar,`docs/progress.md`,`docs/country-data-research.md`,
`docs/license-register.md`,`docs/reports/cshapes-preflight.md`,`README.md`,
`scripts/etl/README.md`. Bağımlılık/lockfile/renderer/üretim veri değişikliği yok.

Yeniden indirme gerekmez; `npm run cshapes:inspect` mevcut dosyayı okur.
Sonraki önkoşullar: lisans/köken incelemesi, tarih metni ile takvim alanlarının
semantiği, üç geometri bulgusu, eksik statü ve dönemsel ad/sınır doğrulaması.
Bu koşullar çözülmeden üretim değişikliği veya yeni ürün fazı yapılmadı.
