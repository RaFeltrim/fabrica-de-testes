const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 QADash API Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/v1/results`);
});
