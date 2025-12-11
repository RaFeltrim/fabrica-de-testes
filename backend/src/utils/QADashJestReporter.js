const axios = require('axios');

class QADashJestReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(testContexts, results) {
    const total = results.numTotalTests;
    const passed = results.numPassedTests;
    const failed = results.numFailedTests;

    console.log('📤 Enviando resultados dos testes Jest para o QADash...');

    axios.post('http://localhost:3001/api/v1/results', {
      suite_name: "Jest Backend Tests",
      total: total,
      passed: passed,
      failed: failed,
      framework: "Jest",
      project_category: "Backend Unit Tests"
    })
    .then(() => {
      console.log('✅ Resultados enviados com sucesso!');
    })
    .catch((error) => {
      console.error('❌ Erro ao enviar resultados:', error.message);
    });
  }
}

module.exports = QADashJestReporter;