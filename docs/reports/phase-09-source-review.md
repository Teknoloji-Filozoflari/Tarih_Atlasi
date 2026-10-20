# Faz 09 — kültür pilotu kaynak incelemesi

2026-10-16. Yeni kültür geometrisi veya dış veri kopyalanmadı. **BLOCKED —
VERIFIED CULTURAL AREA / SOURCE REVIEW**. Üretimde kültürel alan sayısı **0**.

| Birincil kaynak | Doğrulanan sınır ve karar |
| --- | --- |
| [D-PLACE indirme](https://d-place.org/download) | Sayfa veri için CC BY-NC 4.0 bildiriyor. Projenin açık yeniden kullanım politikasında seçilmedi; kültür polygonu veya veri altkümesi indirilmedi. Dataset/alt kaynak lisansları kendiliğinden CC0 sayılmaz |
| [Pleiades indirme](https://pleiades.stoa.org/downloads), [yer API'si](https://pleiades.stoa.org/api) | Yayıncı CC BY 3.0 veri bildiriyor; yer, konum, ad ve bağlantı verileri, temsilî noktalar/bbox ayrı tanımlanıyor. Bunlar kendiliğinden bir kültürün yayılım sınırı değildir; noktalara tampon/convex hull çizilmedi. Belirli kültürel geometri ve belge tarihi/hak zinciri incelenmedi; önceki manual-review kararı sürer |
| [OpenHistoricalMap hak sayfası](https://www.openhistoricalmap.org/copyright) | Varsayılan CC0 yanında nesne license=* istisnaları var. Kültürel yorum, tarih, relation/way/node üyeleri ve hak zinciri tek tek incelenmeden alan alınmaz. Önceki OHM karantina yaklaşımı korunur; kültür subset onayı yok |
| Historical Basemaps | Önceki **BLOCKED FOR REDISTRIBUTION** sürer. Siyasi polygonu kültür alanı olarak yeniden etiketlemek veya başka depodaki kopyayı kullanmak hak/kanıt sorununu çözmez |

Küçük bağlantı kontrolü: `curl --head --location --max-time 10 --max-filesize
65536 https://pleiades.stoa.org/places/579885/json` → **exit 6, Could not resolve
host**. [Terminal çıktısı](phase-09-source-fetch.txt). Örnek API yer kaydı kültür
pilotu seçimi değildir. Araştırma tarayıcısında resmî açıklamalar okunabildi;
bu, terminale gerçek kültürel geometri alındığı anlamına gelmez. Büyük indirme yok.

Kapanış: bir veya birkaç farklı dönem için kültürel yayılım/etkileşim olduğunu
açıkça söyleyen kayıt; kaynak sürümü, özgün geometri/yorum, yıl/aralık, coğrafi
bağlam, belirsizlik ve yeniden dağıtım hakkı birlikte incelenmeli. Ham dosya SHA,
atıf, varsa upstream, hak onayı ve ETL kapısı tamamlanmadan üretime alınmaz.
Bir sitelink bulunması Wikipedia metin/görsel lisansı veya geometri kanıtı değildir.
Doğrulanamayan alanlar boş bırakılır; sentetik alanlar yalnız test fixture'ıdır.
