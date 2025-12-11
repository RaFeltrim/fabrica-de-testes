import { test, expect } from '@playwright/test';
import { ExportPage } from '../pages/ExportPage';

test.describe('Export Feature', () => {
  let exportPage: ExportPage;

  test.beforeEach(async ({ page }) => {
    exportPage = new ExportPage(page);
    await exportPage.navigate();
  });

  test('should export data as CSV', async () => {
    await exportPage.exportData('csv');
    await exportPage.verifyExportSuccess();
  });

  test('should export data as JSON', async () => {
    await exportPage.exportData('json');
    await exportPage.verifyExportSuccess();
  });
});