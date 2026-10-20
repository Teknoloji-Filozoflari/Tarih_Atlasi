import { tool } from './menu';
import { expect, test } from '@playwright/test';

test('haritasız kültür listesi eksik pilotu ve çağdaş taban uyarısını açıklar', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
  await page.goto('/');
  await tool(page, 'Bu yılın kültürel kayıtları');
  await expect(page.getByText('Bu yıl için doğrulanmış kültürel alan verisi yok.')).toBeVisible();
  await expect(page.getByTestId('culture-legend')).toContainText(
    'siyasi egemenlik sınırı değildir',
  );
  await expect(page.getByTestId('culture-legend')).toContainText(
    'Tarihî sahil, nehir ve göller değişmiş olabilir',
  );
  await expect(
    page.getByText('Doğrulanmış kültür alanı pilotu henüz yok.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Wikipedia — doğrulanmış/u })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Keşfet', exact: true })).toBeFocused();
});

test('devlet ve kültür anahtarları bağımsızdır; gerçek kaynaklı siyasi kesit kültür diye çizilmez', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, '1867 sınır örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  const culture = page.getByRole('switch', { name: 'Kültür', exact: true });
  const polity = page.getByRole('switch', { name: 'Devlet', exact: true });
  await culture.click();
  await expect(culture).not.toBeChecked();
  await expect(polity).toBeChecked();
  await expect(page.getByTestId('legend-panel')).toContainText('yumuşak/kesik kenar');
  await polity.click();
  await expect(polity).not.toBeChecked();
  await culture.click();
  await expect(culture).toBeChecked();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await tool(page, 'Bu yılın kültürel kayıtları');
  await expect(page.getByText('Bu yıl için doğrulanmış kültürel alan verisi yok.')).toBeVisible();
});
