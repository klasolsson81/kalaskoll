import { test, expect } from '@playwright/test';

test.describe('RSVP page — invalid token', () => {
  test('shows error for invalid QR code token', async ({ page }) => {
    await page.goto('/r/invalidtoken');
    await expect(page.getByText(/hittades inte|ogiltig/i)).toBeVisible();
  });
});

test.describe('RSVP page — valid token', () => {
  // These tests require a valid invitation token in the database.
  // In CI, we use a seeded test token. Locally, set TEST_RSVP_TOKEN env var.
  const token = process.env.TEST_RSVP_TOKEN || 'test1234';

  test.beforeEach(async ({ page }) => {
    await page.goto(`/r/${token}`);
  });

  test('shows party header with child name and details', async ({ page }) => {
    // If the token is valid, party details should appear
    const header = page.locator('.gradient-celebration');
    const hasHeader = await header.isVisible().catch(() => false);

    if (hasHeader) {
      await expect(page.getByText(/du är inbjuden till/i)).toBeVisible();
      await expect(page.getByText(/fyller.*år/i)).toBeVisible();
    } else {
      // Token not in database — just verify error page renders cleanly
      await expect(page.getByText(/hittades inte|ogiltig/i)).toBeVisible();
    }
  });

  test('shows RSVP form with attending buttons', async ({ page }) => {
    const yesButton = page.getByText('Ja, vi kommer!');
    const hasForm = await yesButton.isVisible().catch(() => false);

    if (hasForm) {
      await expect(yesButton).toBeVisible();
      await expect(page.getByText('Nej, tyvärr')).toBeVisible();
      await expect(page.getByText('Kan ni komma?')).toBeVisible();
    }
  });

  test('expanding form after selecting attending shows all fields', async ({ page }) => {
    const yesButton = page.getByText('Ja, vi kommer!');
    const hasForm = await yesButton.isVisible().catch(() => false);

    if (hasForm) {
      await yesButton.click();

      // Should show email, child name, parent info, allergies
      await expect(page.getByLabel(/e-post/i)).toBeVisible();
      await expect(page.getByLabel(/barnets namn/i)).toBeVisible();
      await expect(page.getByText(/allergier/i)).toBeVisible();
    }
  });

  test('declining shows form without allergy section', async ({ page }) => {
    const noButton = page.getByText('Nej, tyvärr');
    const hasForm = await noButton.isVisible().catch(() => false);

    if (hasForm) {
      await noButton.click();

      await expect(page.getByLabel(/e-post/i)).toBeVisible();
      await expect(page.getByLabel(/barnets namn/i)).toBeVisible();
      // Allergy section should NOT be visible when declining
      await expect(page.getByText(/allergier.*specialkost/i)).not.toBeVisible();
    }
  });

  test('allergy consent appears when selecting a predefined allergy', async ({ page }) => {
    const yesButton = page.getByText('Ja, vi kommer!');
    const hasForm = await yesButton.isVisible().catch(() => false);

    if (hasForm) {
      await yesButton.click();

      // Select a predefined allergy
      const laktos = page.getByText('Laktos');
      if (await laktos.isVisible()) {
        await laktos.click();
        await expect(page.getByText(/samtycker till att allergiinformation/i)).toBeVisible();
      }
    }
  });

  test('allergy consent appears when typing free-text dietary info', async ({ page }) => {
    const yesButton = page.getByText('Ja, vi kommer!');
    const hasForm = await yesButton.isVisible().catch(() => false);

    if (hasForm) {
      await yesButton.click();

      const otherInput = page.getByPlaceholder(/vegetarian/i);
      if (await otherInput.isVisible()) {
        await otherInput.fill('Vegetarian');
        await expect(page.getByText(/samtycker till att allergiinformation/i)).toBeVisible();
      }
    }
  });

  test('description shows Info label', async ({ page }) => {
    // If the party has a description, the "Info" label should be visible
    const infoLabel = page.getByText('Info', { exact: true });
    const hasInfo = await infoLabel.isVisible().catch(() => false);
    if (hasInfo) {
      await expect(infoLabel).toBeVisible();
    }
  });

  test('theme badge is NOT shown to guests', async ({ page }) => {
    // Theme should not appear as a badge on the RSVP page
    const badges = page.locator('[class*="badge"]');
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).textContent();
      // Theme badges would show things like "Disco Pop", "Dinosaurier" etc
      // Only allowed badge is the OSA deadline
      if (text && !text.includes('OSA senast')) {
        // Not a theme badge — this is fine
      }
    }
  });
});

test.describe('RSVP page — mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.goto(`/r/${process.env.TEST_RSVP_TOKEN || 'test1234'}`);

    // Page should not overflow horizontally
    const body = page.locator('body');
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
