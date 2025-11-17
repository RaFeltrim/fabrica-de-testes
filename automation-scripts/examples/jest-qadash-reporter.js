// Example: Jest Reporter for QADash
// Add this to your Jest project to send results to QADash

class QADashReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const { numTotalTests, numPassedTests, numFailedTests } = results;
    
    const payload = {
      suite_name: this._options.suiteName || 'Jest Tests',
      total: numTotalTests,
      passed: numPassedTests,
      failed: numFailedTests
    };

    // Send to QADash API
    fetch('http://localhost:3001/api/v1/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => console.log('✅ Results posted to QADash!'))
    .catch(error => console.error('❌ Error posting to QADash:', error));
  }
}

module.exports = QADashReporter;

/* Usage in jest.config.js:
module.exports = {
  reporters: [
    'default',
    ['./qadash-reporter.js', { suiteName: 'My Project Tests' }]
  ]
};
*/
