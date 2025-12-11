import { Page } from '@playwright/test';

export class ExportPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
    await this.page.click('text=Export');
  }

  async exportData(format: string) {
    await this.page.selectOption('select[name="format"]', format);
    await this.page.click('button:has-text("Export")');
  }

  async verifyExportSuccess() {
    await this.page.waitForURL(/.*download.*/);
  }
}
