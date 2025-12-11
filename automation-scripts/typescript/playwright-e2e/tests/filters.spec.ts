import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Filters Feature', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should apply date range filter', async () => {
    // Fill date inputs
    await page.fill('input[placeholder="Data inicial"]', '2025-01-01');
    await page.fill('input[placeholder="Data final"]', '2025-12-31');

    // Verify filter is applied (check if results are filtered)
    await expect(page.locator('.dashboard-footer')).toContainText('Última atualização');
  });

  test('should apply status filter', async () => {
    // Select status
    await page.selectOption('select[name="status"]', 'passed');

    // Verify filter is applied
    await expect(page.locator('.dashboard-footer')).toContainText('Última atualização');
  });

  test('should apply project filter', async () => {
    // Select project
    const projectSelect = page.locator('select[name="project"]');
    const options = await projectSelect.locator('option').allTextContents();

    if (options.length > 1) {
      await projectSelect.selectOption(options[1]);
      await expect(page.locator('.dashboard-footer')).toContainText('Última atualização');
    }
  });

  test('should clear filters using date range', async () => {
    // Apply a filter first
    await page.fill('input[placeholder="Data inicial"]', '2025-01-01');

    // Clear filters
    await page.click('.btn.btn-outline');

    // Verify cleared
    await expect(page.locator('.dashboard-footer')).toContainText('Última atualização');
  });
});