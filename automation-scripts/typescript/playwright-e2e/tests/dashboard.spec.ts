import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test('Dashboard deve carregar elementos principais', async ({ page }) => {
  const dashboard = new DashboardPage(page);

  await dashboard.goto();
  await dashboard.validateTitle('QA Environment - Production Monitor');

  // Valida se o card existe
  await expect(dashboard.totalTestsCard).toBeVisible();
});