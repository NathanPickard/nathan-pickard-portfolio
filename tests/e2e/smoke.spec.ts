import { expect, test } from '@playwright/test';

test.describe('smoke routes', () => {
  test('home page loads with expected title and heading', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Nathan Pickard/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('blog index loads and shows blog heading', async ({ page }) => {
    await page.goto('/blog');

    await expect(page).toHaveURL(/\/blog\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/thinking|building|reading/i);
  });

  test('resume page loads and has download link', async ({ page }) => {
    await page.goto('/resume');

    await expect(page).toHaveURL(/\/resume\/?$/);
    await expect(page.getByRole('link', { name: /download pdf/i })).toHaveAttribute('href', '/resume.pdf');
  });
});
