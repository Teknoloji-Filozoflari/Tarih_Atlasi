# TA-8 — Kaynaklı veri derinliği planı

**Tarih:** 28 Ekim 2026  
**Durum:** Teşhis + plan + salt-okunur pilot audit (üretim geometrisi/tarih **değişmedi**)  
**İlkeler:** Uydurma yok; siyasi ≠ kültür; harita noktası yalnız kaynaklı zaman+konum; lisans kesinleşmeden yeniden dağıtım yok.

---

## 1. Kültür polygon — neden BLOCKED?

| Kaynak | Lisans / hak | Neden kültür alanı değil / engel |
| --- | --- | --- |
| D-PLACE | CC BY-**NC** 4.0 | Açık yeniden kullanım politikasında NC seçilmedi; veri indirilmedi |
| Pleiades | CC BY 3.0 | Yer/nokta/bbox gazetteer; noktalardan tampon/convex hull **kültür yayılımı uydurur** |
| OpenHistoricalMap | Varsayılan CC0 + nesne `license=*` istisnaları | Kültürel yorum + üye + tarih + hak zinciri nesne bazında incelenmeden alınmaz |
| Historical Basemaps | GPL-3.0; upstream hak zinciri bulanık | **BLOCKED FOR REDISTRIBUTION**; siyasi poligonu kültür diye yeniden etiketlemek yasak |
| Cliopatria / Seshat | CC BY 4.0 (Cliopatria veri) | **POLITY** rekonstrüksiyonu; kültür alanı sayılmaz |
| Euratlas / CShapes NC | Özel / NC-SA | Yeniden dağıtıma uygun değil veya seçilmedi |

**Üretim:** kültürel alan kaydı **0**. Kod modeli (Faz 09) hazır; gerçek pilot **BLOCKED — VERIFIED CULTURAL AREA / SOURCE REVIEW** (`docs/cultural-layer.md`, `docs/reports/phase-09-source-review.md`).

**Açılabilecek yol (gelecek tur, onaylı):** Tek bir kaynakta birlikte bulunan (1) kültürel yayılım/etkileşim iddiası, (2) özgün alan geometrisi, (3) yıl/aralık, (4) belirsizlik metni, (5) yeniden dağıtım hakkı + SHA/atıf/ETL kapısı. Aday bulunamazsa katman dürüst boş kalır.

---

## 2. Konumlu kişi / olay — oranlar

Kaynak: history arşiv manifesti + 21 Ekim import özeti (`docs/reports/history-import-2026-10-21.md`).

| Ölçü | Sayı | Oran (yaklaşık) |
| --- | ---: | ---: |
| Uygulama kişi profili | 3.203 | — |
| Yıllık doğum noktası (uygulama toplamı) | 193 | **~%6,0** kişi |
| History arşivi kişi | 2.969 | — |
| History arşivinde geometrili kişi (doğum yılı) | 46 | **~%1,6** arşiv kişi |
| Uygulama olay | 1.120 | — |
| History arşivi olay | 1.084 | — |
| History arşivinde geometrili olay (muharebe P625) | 35 | **~%3,2** arşiv olay |
| Kültür polygon | 0 | BLOCKED |

Konumsuz 2.923 kişi / 1.049 olay arama ve yıl listesinde kalır; haritada “bulunuyordu” iddiası yoktur.

### Güvenli genişleme yolu (Wikidata)

1. **Kimlik:** QID + pinlenmiş revision; P31=human / olay sınıfı; sitelink yalnız API `sitelinks` eşleşmesi (slug uydurma yok).
2. **Kişi noktası:** Tek referanslı P569 + P19; belirsiz/qualifier yok; yer P625 önceki pinlenmiş şehir incelemesinden; yalnız **doğum yılı** `timed-presence`; yaşam/ikamet/görev çıkarılmaz.
3. **Şehir allowlist:** `scripts/history/birth-city-allowlist.mjs` — yalnız insan onaylı yerleşim adları. İncelenmiş 182 yerden çoğu allowlist dışı (hastane/saray/ilçe vb.); otomatik eklenmez.
4. **Muharebe noktası:** `normalize.mjs` kapıları — tek Earth P625, precision ∈ (0,1], qualifier yok, ≥1 reference, destekli tarih; savaş/antlaşma centroid’i yok.
5. **Staging:** `productionApproved:false` kalır; `history:prepare` pinsiz yeni dosyayı üretime almaz.

---

## 3. Bu tur uygulaması (küçük dilim)

| Yapıldı | Yapılmadı |
| --- | --- |
| Plan (bu dosya) | Yeni kültür geometrisi |
| Allowlist’i ayrı modüle çıkarma (davranış aynı) | Allowlist’e otomatik şehir ekleme |
| `npm run history:location-depth` salt-okunur audit + JSON rapor | Üretim katalog / atlas pack değişikliği |
| Unit test (sınıflandırma + parser) | Ağdan Wikidata indirme |
| `docs/progress.md` | UI/stil PR’larına karışma |

Kanıt komutu: `npm run history:location-depth` → `docs/reports/location-depth-audit.json`.

---

## 4. Sonraki onaylı dilimler (öncelik)

1. **P0 veri dürüstlüğü (UI, ayrı iş):** Katman yardım metnini güncel kapsama hizala (içerik uydurma değil).
2. **P1 kişi noktaları:** `settlement-candidate` listesinden 5–15 şehir insan incelemesi → allowlist → pin → `history:prepare` (sınırlı).
3. **P1 muharebe:** Mevcut ham entity’lerde kapıyı geçen ek P625’leri raporla; yalnız referanslı olanları pinle.
4. **P2 kültür:** Lisanslı alan kaynağı bulunursa tek dönem/tek bölge pilot; bulunamazsa BLOCKED sürer.
5. **Yapılmayacaklar:** Siyasi→kültür; nokta→hull; modern ülke etiketi; kaynaksız dönem listesi; Historical Basemaps.

---

## 5. Riskler

- Allowlist genişletmesi yanlış ölçekli yeri (saray/ilçe) yıllık nokta yapabilir → sınıflandırıcı + insan onayı.
- Büyük history regenerate UI worker’larıyla conflict → bu tur üretim binary’sine dokunulmadı.
- Kültür boşken görsel “medeniyet katmanı” kullanıcı güvenini bozar → dürüst boş durum korunmalı.
