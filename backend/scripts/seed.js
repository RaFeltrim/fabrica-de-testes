const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../database/qadash.db');

// Conectar ao banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
  console.log('✅ Banco de dados conectado');
});

// Dados de exemplo para inserir
const testResults = [
  {
    suite_name: 'Login Tests',
    framework: 'Playwright',
    test_type: 'E2E',
    project_category: 'Authentication',
    total: 10,
    passed: 9,
    failed: 1,
    timestamp: new Date(Date.now() - 72460601000).toISOString() // 7 dias atrás
  },
  {
    suite_name: 'Inventory Tests',
    framework: 'Cypress',
    test_type: 'E2E',
    project_category: 'Products',
    total: 15,
    passed: 15,
    failed: 0,
    timestamp: new Date(Date.now() - 52460601000).toISOString() // 5 dias atrás
  },
  {
    suite_name: 'Checkout Flow',
    framework: 'Playwright',
    test_type: 'E2E',
    project_category: 'Payment',
    total: 8,
    passed: 7,
    failed: 1,
    timestamp: new Date(Date.now() - 32460601000).toISOString() // 3 dias atrás
  },
  {
    suite_name: 'API Integration',
    framework: 'Jest',
    test_type: 'Integration',
    project_category: 'Backend',
    total: 25,
    passed: 24,
    failed: 1,
    timestamp: new Date(Date.now() - 12460601000).toISOString() // 1 dia atrás
  },
  {
    suite_name: 'Dashboard UI',
    framework: 'Cypress',
    test_type: 'E2E',
    project_category: 'Frontend',
    total: 12,
    passed: 12,
    failed: 0,
    timestamp: new Date().toISOString() // Hoje
  }
];

// Função para inserir dados
function seedDatabase() {
  let insertedCount = 0;

  testResults.forEach((result) => {
    const sql = `INSERT INTO test_results (suite_name, framework, test_type, project_category, total, passed, failed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
      sql,
      [
        result.suite_name,
        result.framework,
        result.test_type,
        result.project_category,
        result.total,
        result.passed,
        result.failed,
        result.timestamp
      ],
      (err) => {
        if (err) {
          console.error(`❌ Erro ao inserir ${result.suite_name}:`, err.message);
        } else {
          insertedCount++;
          console.log(`✅ Inserido: ${result.suite_name}`);
        }

        // Se todos foram inseridos, mostrar resumo
        if (insertedCount === testResults.length) {
          console.log('\n📊 RESUMO:');
          console.log(`   Total de registros inseridos: ${insertedCount}`);
          console.log(`   Banco de dados: ${dbPath}`);
          console.log('\n✨ Seed concluído com sucesso!');
          db.close();
          process.exit(0);
        }
      }
    );
  });
}

// Executar seed
console.log('🌱 Iniciando seed do banco de dados...\n');
seedDatabase();