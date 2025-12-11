import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard Updates', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should show dashboard footer with timestamp', async () => {
    // Verify footer exists and contains timestamp
    const footer = page.locator('.dashboard-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Última atualização');
  });

  test('should display total execution count', async () => {
    // Verify footer shows execution count
    const footer = page.locator('.dashboard-footer');
    await expect(footer).toContainText('Total de execuções');
  });

  test('should have pipeline controls available', async () => {
    // Verify pipeline control buttons exist
    await expect(page.locator('button').filter({ hasText: /Pipeline|Run|Execute/ })).toBeVisible();
  });

  test('should show results when available', async () => {
    // Wait for results to load
    await page.waitForTimeout(2000);

    // Check if results are displayed (either charts or lists)
    const hasResults = await page.locator('.results-chart, .results-list, .trend-chart').count() > 0;
    expect(hasResults).toBeTruthy();
  });
});