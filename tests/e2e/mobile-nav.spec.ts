import { expect, test } from '@playwright/test';

test.describe('mobile nav', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('closed menu links are skipped by Tab; open menu links are reachable', async ({ page }) => {
    await page.goto('/about');
    const menuButton = page.getByRole('button', { name: /open menu/i });
    const menuLinks = page.locator('#mobile-menu a');

    // Closed: tabbing past the menu button must land outside the hidden menu.
    await menuButton.focus();
    await page.keyboard.press('Tab');
    const focusedInMenuWhenClosed = await page.evaluate(
      () => document.activeElement?.closest('#mobile-menu') !== null,
    );
    expect(focusedInMenuWhenClosed).toBe(false);

    // Open: the next Tab lands on the first menu link.
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await menuButton.focus();
    await page.keyboard.press('Tab');
    await expect(menuLinks.first()).toBeFocused();
  });

  test('Escape closes the open menu and returns focus to the menu button', async ({ page }) => {
    await page.goto('/about');
    const menuButton = page.getByRole('button', { name: /open menu/i });

    await menuButton.click();
    await page.keyboard.press('Tab');
    await expect(page.locator('#mobile-menu a').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
  });
});
