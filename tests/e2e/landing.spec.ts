import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /smarta inbjudningar/i })).toBeVisible();
    await expect(page.getByText('för barnkalas')).toBeVisible();
    await expect(page.getByText('Gratis att börja')).toBeVisible();
  });

  test('has working CTA buttons', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /skapa ditt första kalas/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/register');
  });

  test('shows how-it-works section', async ({ page }) => {
    await expect(page.getByText('Så här fungerar KalasKoll')).toBeVisible();
    await expect(page.getByText('Skapa kalas')).toBeVisible();
    await expect(page.getByText('Dela inbjudan')).toBeVisible();
    await expect(page.getByText('Samla svar')).toBeVisible();
  });

  test('shows features section', async ({ page }) => {
    await expect(page.getByText('Allt du behöver för kalaset')).toBeVisible();
    await expect(page.getByText('AI-genererade inbjudningar')).toBeVisible();
    await expect(page.getByText('QR-kod för enkel OSA')).toBeVisible();
    await expect(page.getByText('Allergihantering med GDPR')).toBeVisible();
    await expect(page.getByText('Gästlista i realtid')).toBeVisible();
  });

  test('shows FAQ section with all questions', async ({ page }) => {
    await expect(page.getByText('Vanliga frågor')).toBeVisible();
    await expect(page.getByText('Kostar det något att använda KalasKoll?')).toBeVisible();
    await expect(page.getByText('Hur fungerar QR-koden?')).toBeVisible();
    await expect(page.getByText('Är allergiinformationen säker?')).toBeVisible();
    await expect(page.getByText('Kan jag se gästlistan i realtid?')).toBeVisible();
    await expect(page.getByText('Vem ligger bakom KalasKoll?')).toBeVisible();
  });

  test('header has login and register links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /logga in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /kom igång gratis/i })).toBeVisible();
  });

  test('navigates to register page via CTA', async ({ page }) => {
    await page.getByRole('link', { name: /skapa ditt första kalas/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('navigates to login page via header', async ({ page }) => {
    await page.getByRole('link', { name: /logga in/i }).click();
    await expect(page).toHaveURL('/login');
  });
});
