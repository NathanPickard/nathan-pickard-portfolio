import { expect, test } from '@playwright/test';

test.describe('skip link', () => {
  test('is hidden until tabbed to, then jumps keyboard focus past the nav', async ({ page }) => {
    await page.goto('/resume');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });

    await expect(skipLink).not.toBeInViewport();

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const focusedInMain = await page.evaluate(
      () => document.activeElement?.closest('#main-content') !== null,
    );
    expect(focusedInMain).toBe(true);
  });
});
