# Son doğrulama kanıtlarının sınırı

`commands.json` gerçek komut/başlangıç/süre/exit ve log yolunu kaydeder.
Shell yönlendirmesiyle stdout+stderr dosyaya yazılır. `probes.log` programı
Node26 stdin üzerinde gerçekten yürütülerek üretildi; sonuç metnini okuyup
test edilmiş sayma yöntemi kullanılmadı.

`initial-commands.json` ilk kayıt yardımcısının denemesidir. Bu ortamda child
process pipe çıktıları yakalanmadığı için logları boştu; stdin probe yürütmesi
de bu denemede kanıt sayılamaz. Kanıtı eksik bu girişler kabul sonucu olarak
kullanılmadı. Komutlar shell dosya yönlendirmesiyle tekrar yürütüldü; güncel
`commands.json` ve dolu loglar esastır. Yardımcı kayıt araçları `/tmp` altında
kaldı, uygulamaya Python/başka runtime bağımlılığı eklenmedi.

`static-response.json` gerçek dist dosyaları üzerinde saf yanıt fonksiyonunun
çıktısıdır; HTTP portu veya browser testi değildir. `contrast.json` token renk
oranı matematiğidir; gerçek harita/ekran/disabled/focus/a11y kabulü değildir.
`source-facts.json` kaynak sabitlerini sayar; runtimeBounds null'dır.
`changed-files.json` V3 kaynak baseline'ı ile SHA farkıdır; Git diff değildir.
Dokümanlar ve generated dist/cache bu kaynak envanterinin dışındadır.

E2E exit1: yerel önizleme sunucusu listen EPERM ile başlatılamadı. Doğrudan
Chromium denemesi de sandbox başlangıcında Operation not permitted ile durdu.
Gerçek ekran görüntüsü, viewport ölçümü veya tamamlanan browser testi yoktur.
Android JS export APK veya fiziksel cihaz kanıtı sayılmaz.
