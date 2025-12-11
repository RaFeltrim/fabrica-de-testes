import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Export Feature', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should export data as CSV', async () => {
    // Click export button
    await page.click('.btn.btn-secondary');

    // Wait for download to start
    await page.waitForTimeout(2000); // Wait for download to initiate
  });

  test('should export data as PDF', async () => {
    // Click export button
    await page.click('.btn.btn-secondary');

    // Wait for download to start
    await page.waitForTimeout(2000);
  });

  test('should show export button', async () => {
    // Verify export button is visible
    await expect(page.locator('.btn.btn-secondary')).toBeVisible();
    await expect(page.locator('.btn.btn-secondary')).toContainText('Exportar Dados');
  });
});