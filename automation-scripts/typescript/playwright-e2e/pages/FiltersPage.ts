import { Page } from '@playwright/test';

export class FiltersPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
    await this.page.click('text=Filters');
  }

  async applyFilter(filterName: string, value: string) {
    await this.page.fill(`input[name="${filterName}"]`, value);
    await this.page.click('button:has-text("Apply")');
  }

  async clearFilters() {
    await this.page.click('button:has-text("Clear")');
  }
}