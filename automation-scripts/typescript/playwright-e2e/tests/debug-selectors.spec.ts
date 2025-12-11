import { test, expect } from '@playwright/test';

test.describe('Dashboard Selector Debug Utility', () => {
  test('Log all interactive elements and their selectors', async ({ page }) => {
    console.log('\n=== DASHBOARD SELECTOR DEBUG UTILITY ===');
    console.log('Logging all interactive elements for selector discovery...\n');

    // Navigate to dashboard
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('=== PAGE INFO ===');
    console.log(`URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}`);

    // Get all interactive elements
    const interactiveSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[role="button"]',
      '[onclick]',
      '[data-testid]',
      '.export-btn',
      '.export-menu',
      '.filter-group',
      '.dashboard-footer',
      '.pipeline-controls'
    ];

    console.log('\n=== INTERACTIVE ELEMENTS ===');

    for (const selector of interactiveSelectors) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();

        if (count > 0) {
          console.log(`\n--- ${selector.toUpperCase()} (${count} found) ---`);

          for (let i = 0; i < count; i++) {
            const element = elements.nth(i);
            const isVisible = await element.isVisible();

            if (isVisible) {
              const tagName = await element.evaluate(el => el.tagName.toLowerCase());
              const className = await element.getAttribute('class') || '';
              const id = await element.getAttribute('id') || '';
              const text = await element.textContent() || '';
              const dataTestId = await element.getAttribute('data-testid') || '';
              const type = await element.getAttribute('type') || '';
              const name = await element.getAttribute('name') || '';
              const placeholder = await element.getAttribute('placeholder') || '';

              console.log(`  [${i}] ${tagName}${id ? `#${id}` : ''}${className ? `.${className.replace(/\s+/g, '.')}` : ''}`);
              if (text.trim()) console.log(`      Text: "${text.trim()}"`);
              if (dataTestId) console.log(`      data-testid: "${dataTestId}"`);
              if (type) console.log(`      type: "${type}"`);
              if (name) console.log(`      name: "${name}"`);
              if (placeholder) console.log(`      placeholder: "${placeholder}"`);
            }
          }
        }
      } catch (error) {
        console.log(`Error checking ${selector}: ${(error as Error).message}`);
      }
    }

    // Additional checks for specific dashboard elements
    console.log('\n=== DASHBOARD SPECIFIC ELEMENTS ===');

    // Check for export button
    try {
      const exportBtn = page.locator('.export-btn');
      if (await exportBtn.isVisible()) {
        console.log('✓ Export button found with class .export-btn');
        const text = await exportBtn.textContent();
        console.log(`  Text: "${text?.trim()}"`);
      } else {
        console.log('✗ Export button not found with .export-btn');
      }
    } catch (error) {
      console.log(`Error checking export button: ${(error as Error).message}`);
    }

    // Check for filter elements
    try {
      const selects = page.locator('select');
      const selectCount = await selects.count();
      console.log(`Found ${selectCount} select elements (potential filters)`);

      for (let i = 0; i < selectCount; i++) {
        const select = selects.nth(i);
        const label = await select.locator('xpath=preceding-sibling::label').textContent().catch(() => '');
        const name = await select.getAttribute('name') || '';
        console.log(`  Select ${i}: name="${name}" label="${label?.trim()}"`);
      }
    } catch (error) {
      console.log(`Error checking selects: ${(error as Error).message}`);
    }

    // Check for dashboard footer
    try {
      const footer = page.locator('.dashboard-footer');
      if (await footer.isVisible()) {
        console.log('✓ Dashboard footer found with class .dashboard-footer');
        const text = await footer.textContent();
        console.log(`  Text: "${text?.trim()}"`);
      } else {
        console.log('✗ Dashboard footer not found');
      }
    } catch (error) {
      console.log(`Error checking footer: ${(error as Error).message}`);
    }

    // Take screenshot for visual reference
    await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });
    console.log('\n=== SCREENSHOT TAKEN ===');
    console.log('File saved: debug-dashboard.png');

    // Summary
    console.log('\n=== DEBUG UTILITY COMPLETE ===');
    console.log('Use the logged selectors in your tests.');
    console.log('Screenshot saved for visual reference.');
  });
});