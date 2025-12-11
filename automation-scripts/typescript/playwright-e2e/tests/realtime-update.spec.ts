import { test, expect } from '@playwright/test';
import { RealtimePage } from '../pages/RealtimePage';

test.describe('Realtime Updates', () => {
  let realtimePage: RealtimePage;

  test.beforeEach(async ({ page }) => {
    realtimePage = new RealtimePage(page);
    await realtimePage.navigate();
  });

  test('should update data in realtime', async () => {
    await realtimePage.waitForUpdate();
    const data = await realtimePage.getLatestData();
    expect(data).toBeTruthy();
  });
});