import { test, expect } from '@playwright/test';

test('Debug - Inspecionar seletores do Dashboard', async ({ page }) => {
  // 1. Navegar para o Dashboard (frontend)
  await page.goto('http://localhost:5173/');

  // 2. Aguardar a página carregar por 3 segundos
  await page.waitForTimeout(3000);

  // 3. Capturar o HTML completo da página
  const htmlContent = await page.content();
  console.log('=== HTML COMPLETO DA PÁGINA ===');
  console.log(htmlContent.substring(0, 2000) + '...'); // Mostra os primeiros 2000 caracteres

  // 4. Procurar por elementos que contenham a palavra "QADash"
  const elementsWithQADash = await page.locator('*').filter({ hasText: /QADash/i }).all();
  console.log('\n=== ELEMENTOS CONTENDO "QADASH" ===');
  console.log(`Encontrados: ${elementsWithQADash.length} elementos`);

  for (let i = 0; i < elementsWithQADash.length; i++) {
    const element = elementsWithQADash[i];
    const tagName = await element.evaluate(el => el.tagName);
    const text = await element.textContent();
    const className = await element.getAttribute('class') || '';
    const id = await element.getAttribute('id') || '';
    const dataTestId = await element.getAttribute('data-testid') || '';

    console.log(`\nElemento ${i + 1}:`);
    console.log(`  Tag: ${tagName}`);
    console.log(`  Texto: "${text?.trim()}"`);
    console.log(`  Classe: "${className}"`);
    console.log(`  ID: "${id}"`);
    console.log(`  data-testid: "${dataTestId}"`);

    // 5. Mostrar seletores válidos que poderiam ser usados
    const possibleSelectors = [];
    if (id) possibleSelectors.push(`#${id}`);
    if (dataTestId) possibleSelectors.push(`[data-testid="${dataTestId}"]`);
    if (className) {
      const classes = className.split(' ').filter(c => c.trim());
      classes.forEach(cls => possibleSelectors.push(`.${cls}`));
      if (classes.length > 1) possibleSelectors.push(`.${classes.join('.')}`);
    }
    possibleSelectors.push(`${tagName}:has-text("${text?.trim()}")`);

    console.log(`  Seletores possíveis: ${possibleSelectors.join(', ')}`);
  }

  // 6. Tirar uma screenshot
  await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });
  console.log('\n=== SCREENSHOT TIRADA ===');
  console.log('Arquivo salvo: debug-dashboard.png');

  // Validação básica
  expect(elementsWithQADash.length).toBeGreaterThan(0);
});