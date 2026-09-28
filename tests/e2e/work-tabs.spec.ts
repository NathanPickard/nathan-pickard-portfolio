import { expect, test } from '@playwright/test';

test.describe('work history tabs', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('arrow keys move selection between tabs and wrap at the ends', async ({ page }) => {
    await page.goto('/work');
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    const selected = page.getByRole('tab', { selected: true });

    await selected.focus();
    const startIndex = Number(await selected.getAttribute('data-index'));
    const nextIndex = (startIndex + 1) % count;

    await page.keyboard.press('ArrowDown');
    await expect(tabs.nth(nextIndex)).toBeFocused();
    await expect(tabs.nth(nextIndex)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator(`#panel-${nextIndex}`)).toBeVisible();

    await page.keyboard.press('ArrowUp');
    await expect(tabs.nth(startIndex)).toBeFocused();

    await page.keyboard.press('Home');
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(tabs.last()).toBeFocused();
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
  });
});
