import { test, expect } from '@playwright/test';

test.describe('Protected dashboard routes — unauthenticated redirects', () => {
  const protectedPaths = [
    '/dashboard',
    '/kalas/new',
    '/profile',
    '/kalas/00000000-0000-4000-8000-000000000001',
    '/kalas/00000000-0000-4000-8000-000000000001/edit',
    '/kalas/00000000-0000-4000-8000-000000000001/guests',
  ];

  for (const path of protectedPaths) {
    test(`redirects ${path} to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe('Custom 404 page', () => {
  test('renders branded 404 for unknown route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Sidan hittades inte')).toBeVisible();
    await expect(page.getByRole('link', { name: /startsidan/i })).toBeVisible();
  });

  test('404 page has proper title', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page).toHaveTitle(/hittades inte/i);
  });
});

test.describe('Forgot password flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('renders forgot password form', async ({ page }) => {
    await expect(page.getByText('Glömt lösenord?')).toBeVisible();
    await expect(page.getByLabel(/e-post/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /skicka återställningslänk/i })).toBeVisible();
  });

  test('has link back to login', async ({ page }) => {
    await expect(page.getByRole('link', { name: /inloggning/i })).toBeVisible();
  });

  test('email field is required', async ({ page }) => {
    const emailInput = page.getByLabel(/e-post/i);
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/glömt lösenord/i);
  });
});

test.describe('Reset password page', () => {
  test('renders reset password page with correct title', async ({ page }) => {
    await page.goto('/reset-password');
    // Page renders even without a valid reset token — shows the form or redirects
    await expect(page).toHaveTitle(/lösenord/i);
  });
});

test.describe('Set password page', () => {
  test('renders set password page with correct title', async ({ page }) => {
    await page.goto('/set-password');
    await expect(page).toHaveTitle(/lösenord/i);
  });
});

test.describe('Dashboard — mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('login page renders correctly on mobile', async ({ page }) => {
    await page.goto('/login');
    // Should not have horizontal overflow
    const bodyWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
    await expect(page.getByRole('button', { name: /logga in/i })).toBeVisible();
  });

  test('register page renders correctly on mobile', async ({ page }) => {
    await page.goto('/register');
    const bodyWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });

  test('forgot password page renders correctly on mobile', async ({ page }) => {
    await page.goto('/forgot-password');
    const bodyWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
    await expect(page.getByLabel(/e-post/i)).toBeVisible();
  });
});
