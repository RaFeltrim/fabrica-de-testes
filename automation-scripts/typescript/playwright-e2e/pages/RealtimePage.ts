import { Page } from '@playwright/test';

export class RealtimePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
    await this.page.click('text=Realtime');
  }

  async waitForUpdate() {
    await this.page.waitForTimeout(2000);
  }

  async getLatestData() {
    return await this.page.textContent('[data-testid="latest-data"]');
  }
}