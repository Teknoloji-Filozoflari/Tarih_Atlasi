# Release biçimlendirme engeli — 21 Ekim 2026

## Doğrudan GitHub kanıtı

[Release çalıştırması 39632750777](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/runs/39632750777),
commit `c27dd1fcebb83d2779d75321397f3455b4dacb44`, job `119335088546`:

- `npm ci`: PASS.
- `npm run check` içindeki lint ve native/web strict typecheck: PASS.
- 414 ana test ve 5 worker testi: PASS.
- Veri/lisans/hash kontrolleri: PASS.
- Son `npm run format:check`: FAIL; yalnız `src/app/index.tsx` işaretlendi.
- Web export, browser E2E, Docker ve Release oluşturma: SKIPPED.
- GitHub Releases API listesi inceleme sırasında boştu; paket oluşturulmadı.

Önceki yönlendirmede verilen useSyncExternalStore kodunun satır bölmeleri projenin
Prettier ayarlarıyla uyuşmuyordu. ESLint engeli aşılmış, sonraki biçim kapısı
takılmıştır. Test veya kontrol kapısı kaldırılmadı.

## Düzeltme ve yerel doğrulama

Yerel çalışma ağacındaki eski route, kesin uzak commit'ten okunan hydration
korumalı route'un Prettier çıktısıyla eşitlendi. Uzak commit'e göre fark yalnız
biçimdir; yeni dependency, veri, lisans veya ürün özelliği yoktur.

- `prettier --check src/app/index.tsx`: PASS, exit 0.
- `eslint src/app/index.tsx --max-warnings 0`: PASS, exit 0.
- `npm run typecheck`: native/web strict PASS, exit 0.
- Uzak dosyanın format hatası tekrar üretildi; düzeltilmiş dosyanın
  `prettier.format(remoteBefore)` ile birebir eşitliği assertion ile doğrulandı.
- Uzak 414+5 test bu tur yerelde tekrar çalıştırılmadı; yukarıdaki PASS kayıtları
  GitHub'ın başarısız paket job'ındaki gerçek test sonuçlarıdır.
- Browser/GPU, Android cihaz ve Docker bu tur NOT TESTED.

## Kullanıcının Git kopyasında gönderim

GitHub bağlantısının yazma yetkisi önceki denemelerde 403 döndü; bu düzeltme uzak
depoya gönderilmiş olarak sunulmaz. Güncel kullanıcı Git kopyasında:

```bash
git pull --ff-only
npx prettier --write src/app/index.tsx
npx prettier --check src/app/index.tsx
git diff -- src/app/index.tsx
git add src/app/index.tsx
git commit -m "fix: format atlas route for release checks"
git push origin main
```

Pull başarısızsa sonraki komutlara geçilmez; yerel değişiklikler silinmez.
Ardından Release workflow'u main üzerinden yeni bir Run workflow olarak
başlatılır. Eski başarısız çalıştırmayı Re-run yapmak eski commit'i kullanır.
Başarıda taslak önizleme oluşturulur; kararlı ürünün NO-GO ve gerçek cihaz
doğrulama kayıtları bu biçim düzeltmesiyle kapanmaz.
