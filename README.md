# QADash - Professional Test Automation Dashboard

## 📊 About the Project

QADash is a **professional-grade SaaS dashboard** designed for QA engineers and freelancers to manage multiple projects and centralize test automation results from ANY testing framework (Robot Framework, Cypress, Playwright, Jest, Vitest, etc.).

**Main Function**: Centralize and visualize automated test results from ALL your projects in a single, professional dashboard.

### ✨ Recent Improvements (November 2025)

🎨 **Complete UI Redesign**
- Modern, professional interface (no more "AI-generated" look)
- Clean design with gradient accents
- SVG icons instead of emojis
- Fully responsive layout

📊 **Enhanced Data Visualization**
- 4 key metric cards with real-time stats
- Dual chart system (Doughnut + Bar chart)
- Project-wise comparison view
- Color-coded progress bars

🔍 **Advanced Features**
- Filter by status (All/Passed/Failed)
- Sort by date, project, or success rate
- Visual status badges
- Smart empty states

### 🎯 MVP - Module 4: Automation Dashboard

This MVP focuses on the core "killer feature": receiving automated test results and displaying them in a real-time professional dashboard.

## 🏗️ Arquitetura

```
qadash-mvp/
├── backend/              # API REST com Node.js + Express
│   ├── src/
│   │   ├── controllers/  # Lógica de controle (resultsController.js)
│   │   ├── routes/       # Rotas da API (api.js)
│   │   ├── services/     # Serviços de DB (dbService.js)
│   │   ├── app.js        # Configuração Express
│   │   └── server.js     # Servidor HTTP
│   └── database/         # SQLite DB e migrations
├── frontend/             # Dashboard React + Vite
│   └── src/
│       ├── components/   # Dashboard, ResultsChart, ResultsList
│       ├── services/     # apiService.js
│       └── App.jsx
└── automation-scripts/   # Scripts Robot Framework (EXEMPLO)
    ├── tests/            # Seus testes Robot (saucedemo.robot)
    ├── post_results.py   # Script para enviar resultados ao QADash
    └── run_tests.bat     # Script de execução
```

## 🛠️ Stack Tecnológica

- **Backend**: Node.js, Express, SQLite, Knex.js
- **Frontend**: React, Vite, Chart.js, Axios
- **Automação**: Robot Framework, Python
- **Database**: SQLite

## 🚀 Quick Start

### Easy Way (Recommended)
Double-click `start-qadash.bat` in the project root - it will:
1. Install dependencies if needed
2. Create database if needed
3. Start both backend and frontend
4. Open the dashboard in your browser

### Manual Way

#### Prerequisites
- Node.js 18+
- Python 3.8+ (optional, for Robot Framework integration)

#### 1️⃣ Backend
```bash
cd backend
npm install
npm run migrate
npm run dev
```
O backend estará rodando em: **http://localhost:3001**

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```
O dashboard estará disponível em: **http://localhost:5173**

### 3️⃣ Automação (Exemplo)
```bash
cd automation-scripts
pip install -r requirements.txt
```

## 🎯 Como Usar - Integrando com SEU Projeto

### Opção 1: Robot Framework

1. **Execute seus testes Robot Framework** (em qualquer projeto):
```bash
robot --outputdir ./results meus_testes.robot
```

2. **Copie o script `post_results.py`** para o diretório dos seus resultados

3. **Execute o script** para enviar ao QADash:
```bash
python post_results.py
```

### Opção 2: Qualquer Framework (via API)

Envie uma requisição POST para a API do QADash:

```bash
curl -X POST http://localhost:3001/api/v1/results \
  -H "Content-Type: application/json" \
  -d '{
    "suite_name": "Meus Testes de API",
    "total": 25,
    "passed": 23,
    "failed": 2
  }'
```

### Opção 3: Integração com Jest/Cypress/etc

Crie um script customizado que parse seus resultados e envie para:
- **Endpoint**: `POST http://localhost:3001/api/v1/results`
- **Body**: `{ suite_name, total, passed, failed }`

## 📡 API Endpoints

### POST /api/v1/results
Recebe resultados de testes

**Request Body**:
```json
{
  "suite_name": "Login Tests",
  "total": 10,
  "passed": 8,
  "failed": 2
}
```

**Response** (201 Created):
```json
{
  "message": "Test result saved successfully",
  "data": {
    "id": 1,
    "suite_name": "Login Tests",
    "total": 10,
    "passed": 8,
    "failed": 2
  }
}
```

### GET /api/v1/results
Retorna todos os resultados salvos

**Response** (200 OK):
```json
{
  "message": "Results retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 2,
      "suite_name": "API Tests",
      "total": 15,
      "passed": 15,
      "failed": 0,
      "created_at": "2025-11-17 12:30:00"
    },
    {
      "id": 1,
      "suite_name": "Login Tests",
      "total": 10,
      "passed": 8,
      "failed": 2,
      "created_at": "2025-11-17 12:15:00"
    }
  ]
}
```

## 🧪 Testando o Sistema (End-to-End)

### Teste Rápido - Envio Manual
```bash
# Terminal 1: Backend rodando
cd backend && npm run dev

# Terminal 2: Frontend rodando  
cd frontend && npm run dev

# Terminal 3: Enviar resultado de teste
curl -X POST http://localhost:3001/api/v1/results \
  -H "Content-Type: application/json" \
  -d '{"suite_name":"Teste Manual","total":5,"passed":4,"failed":1}'
```

### Teste com Robot Framework (Exemplo incluído)
```bash
cd automation-scripts
run_tests.bat
```

Isto irá:
1. ✅ Executar os testes do `saucedemo.robot`
2. ✅ Parsear o `output.xml`
3. ✅ Enviar resultados para o QADash
4. ✅ Atualizar o dashboard automaticamente

## 📊 Dashboard - Features

### Modern Professional Design
- **4 Key Metric Cards**:
  - Test Executions (total runs)
  - Unique Projects (number of different projects)
  - Total Tests (cumulative count)
  - Success Rate (overall pass percentage)

### Advanced Data Visualization
- **Doughnut Chart**: Overall pass/fail ratio with center percentage
- **Bar Chart**: Project-wise comparison (top 5 projects)
- **Interactive Tooltips**: Detailed information on hover

### Smart Results Table
- **Filtering**: Show all, only passed, or only failed results
- **Sorting**: By date, project name, or success rate
- **Visual Indicators**:
  - Green/red left borders for quick status recognition
  - Progress bars with color gradients
  - Status badges with checkmark/x icons
  - Professional badge system for metrics

### Real-time Updates
- 🔄 **Auto-refresh**: Updates every 30 seconds
- 🔘 **Manual refresh**: Button in header
- ⏱️ **Last update timestamp**: Always visible

### Responsive Design
- 💻 Desktop optimized
- 📱 Tablet friendly
- 📱 Mobile compatible
- 📊 **Cards de Estatísticas**: Total, Aprovados, Reprovados, Taxa de Sucesso
- 🎨 **Visual Profissional**: Cores indicativas (verde=passou, vermelho=falhou)

## 🎓 Casos de Uso

### Para QAs Freelancers na Workana:
1. **Múltiplos Clientes**: Cada suite de teste pode representar um cliente diferente
2. **Relatórios Profissionais**: Mostre o dashboard para o cliente
3. **Histórico**: Acompanhe a evolução da qualidade ao longo do tempo
4. **Produtividade**: Centralize resultados de Robot, Cypress, Jest, etc.

### Para Projetos de Portfólio:
- ✅ Demonstra conhecimento em Full-Stack
- ✅ Mostra domínio de automação de testes
- ✅ Prova capacidade de integração de sistemas
- ✅ Evidencia visão de produto (SaaS)

## 🛠️ Desenvolvido por Rafael Feltrim

**Contato**: rafeltrim@gmail.com

Este projeto demonstra competências em:
- ✅ Engenharia de Software Full-Stack (React + Node.js)
- ✅ QA Manual e Automação (Robot Framework)
- ✅ Integração de Ferramentas de Teste
- ✅ API REST e Visualização de Dados
- ✅ Banco de Dados (SQLite + Knex.js)
- ✅ DevOps e CI/CD readiness
