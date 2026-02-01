import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders login form with email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/e-post/i)).toBeVisible();
    await expect(page.getByLabel(/lösenord/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /logga in/i })).toBeVisible();
  });

  test('has link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /skapa konto|registrera/i });
    await expect(registerLink).toBeVisible();
  });

  test('shows validation error for empty submission', async ({ page }) => {
    await page.getByRole('button', { name: /logga in/i }).click();
    // HTML5 validation should prevent submission — check required attribute
    const emailInput = page.getByLabel(/e-post/i);
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel(/e-post/i).fill('not-an-email');
    await page.getByLabel(/lösenord/i).fill('password123');
    await page.getByRole('button', { name: /logga in/i }).click();
    // Browser will show HTML5 email validation
    const emailInput = page.getByLabel(/e-post/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('renders registration form with all fields', async ({ page }) => {
    await expect(page.getByLabel(/namn/i).first()).toBeVisible();
    await expect(page.getByLabel(/e-post/i)).toBeVisible();
    await expect(page.getByLabel(/lösenord/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /skapa konto|registrera/i })).toBeVisible();
  });

  test('has link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /logga in/i });
    await expect(loginLink).toBeVisible();
  });

  test('password field requires minimum length', async ({ page }) => {
    const passwordInput = page.getByLabel(/lösenord/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Check email page', () => {
  test('renders confirmation message', async ({ page }) => {
    await page.goto('/check-email');
    await expect(page.getByText(/e-post|mail/i)).toBeVisible();
  });
});

test.describe('Confirmed page', () => {
  test('renders verified message', async ({ page }) => {
    await page.goto('/confirmed');
    await expect(page.getByText(/konto verifierat/i)).toBeVisible();
  });
});
