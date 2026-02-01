import { test, expect } from '@playwright/test';

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders footer with brand link to home', async ({ page }) => {
    const brandLink = page.locator('footer').getByRole('link', { name: 'KalasKoll' });
    await expect(brandLink).toBeVisible();
    await expect(brandLink).toHaveAttribute('href', '/');
  });

  test('renders creator credit', async ({ page }) => {
    await expect(page.locator('footer').getByText('Skapad av')).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Klas Olsson' })).toBeVisible();
  });

  test('opens and closes Om oss modal', async ({ page }) => {
    await page.locator('footer').getByText('Om oss').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Om KalasKoll')).toBeVisible();
    await expect(modal.getByText('Klas Olsson')).toBeVisible();
    await expect(modal.getByText('Alexander')).toBeVisible();

    // Close with X button
    await modal.getByRole('button', { name: /stäng/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('opens Priser modal with free and premium info', async ({ page }) => {
    await page.locator('footer').getByText('Priser').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Gratis')).toBeVisible();
    await expect(modal.getByText(/guldkalas/i)).toBeVisible();
    await expect(modal.getByText('49 kr/kalas')).toBeVisible();
  });

  test('opens Integritetspolicy modal with GDPR info', async ({ page }) => {
    await page.locator('footer').getByText('Integritetspolicy').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/GDPR/)).toBeVisible();
    await expect(modal.getByText(/AES-256/)).toBeVisible();
    await expect(modal.getByText(/7 dagar/)).toBeVisible();
  });

  test('opens Cookiepolicy modal', async ({ page }) => {
    await page.locator('footer').getByText('Cookiepolicy').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/nödvändiga cookies/)).toBeVisible();
  });

  test('closes modal with Escape key', async ({ page }) => {
    await page.locator('footer').getByText('Om oss').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows copyright text', async ({ page }) => {
    const year = new Date().getFullYear();
    await expect(page.locator('footer').getByText(`${year} KalasKoll`)).toBeVisible();
  });
});
