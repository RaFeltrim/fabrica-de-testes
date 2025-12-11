import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async validateTitle(text: string) {
    // Valida especificamente o h1 principal
    const mainTitle = this.page.getByRole('heading', { level: 1 });
    await expect(mainTitle).toContainText(text);
  }

  get totalTestsCard() {
    return this.page.getByText('Total Tests');
  }
}