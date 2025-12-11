import { test, expect } from '@playwright/test';
import { FiltersPage } from '../pages/FiltersPage';

test.describe('Filters Feature', () => {
  let filtersPage: FiltersPage;

  test.beforeEach(async ({ page }) => {
    filtersPage = new FiltersPage(page);
    await filtersPage.navigate();
  });

  test('should apply filter', async () => {
    await filtersPage.applyFilter('search', 'test');
    // Verificar se o filtro foi aplicado
    await expect(page.locator('input[name="search"]')).toHaveValue('test');
  });

  test('should clear filters', async () => {
    await filtersPage.applyFilter('search', 'test');
    await filtersPage.clearFilters();
    await expect(page.locator('input[name="search"]')).toHaveValue('');
  });
});