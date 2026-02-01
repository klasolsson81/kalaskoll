import { test, expect } from '@playwright/test';

test.describe('Navigation & protected routes', () => {
  test('unauthenticated user is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user is redirected from /kalas/new to /login', async ({ page }) => {
    await page.goto('/kalas/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user can access landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByText(/smarta inbjudningar/i)).toBeVisible();
  });

  test('unauthenticated user can access login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: /logga in/i })).toBeVisible();
  });

  test('unauthenticated user can access register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
  });

  test('unauthenticated user can access RSVP pages', async ({ page }) => {
    // RSVP pages should be publicly accessible (no auth redirect)
    await page.goto('/r/test1234');
    // Should NOT redirect to /login
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('SEO & metadata', () => {
  test('landing page has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/KalasKoll/);
  });

  test('landing page has JSON-LD structured data', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(2); // app + FAQ

    const appJsonLd = await jsonLd.first().textContent();
    expect(appJsonLd).toContain('WebApplication');
    expect(appJsonLd).toContain('KalasKoll');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('Sitemap');
    expect(text).toContain('/api/');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });
});

test.describe('Accessibility basics', () => {
  test('landing page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    const h2s = page.getByRole('heading', { level: 2 });
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThanOrEqual(3); // How it works, Features, FAQ, CTA
  });

  test('landing page has lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('sv');
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    // Landing page may use emojis instead of images — only verify images that exist
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });
});
