import { Reporter, FullResult } from '@playwright/test/reporter';
import axios from 'axios';

class QADashReporter implements Reporter {
  async onEnd(result: FullResult) {
    const total = result.testResults?.length || 1; // Ajuste para Playwright
    const passed = result.status === 'passed' ? total : 0;
    const failed = result.status === 'failed' ? total : 0;

    console.log('📤 Enviando resultados para o QADash...');

    try {
      await axios.post('http://localhost:3001/api/v1/results', {
        suite_name: "Playwright Self-Test",
        total: total,
        passed: passed,
        failed: failed,
        framework: "Playwright",
        project_category: "Internal QA"
      });
      console.log('✅ Resultados enviados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao enviar resultados:', error.message);
    }
  }
}
export default QADashReporter;