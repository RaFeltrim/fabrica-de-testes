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
- Historical trend analysis with time-series charts

🔍 **Advanced Features**
- Advanced filtering with persistence (date range, project, framework, status)
- Sort by date, project, or success rate
- Visual status badges
- Smart empty states
- Real-time WebSocket updates
- Export to CSV and PDF with professional templates

⚡ **Real-Time Updates**
- WebSocket integration for instant dashboard updates
- Connection status indicator with pulse animation
- Toast notifications for new test results
- Automatic refresh every 30 seconds as fallback

📤 **Export & Reporting**
- CSV export with detailed test data
- PDF reports with executive summary and charts
- Scheduled exports (daily/weekly/monthly)
- Automatic cleanup of old exports

🔗 **CI/CD Integration**
- GitHub Actions webhook support
- Jenkins integration
- GitLab CI webhook endpoint
- Generic webhook for custom CI/CD platforms
- Signature verification for security

### 🎯 MVP - Module 4: Automation Dashboard

This MVP focuses on the core "killer feature": receiving automated test results and displaying them in a real-time professional dashboard.

## 🚀 Key Features

### 📊 Dashboard & Visualization
- **Real-time Metrics**: 4 key metric cards (executions, projects, total tests, success rate)
- **Multiple Chart Types**: Doughnut chart, bar chart, and historical trend line charts
- **Advanced Filtering**: Filter by date range, project, framework, and status
- **Filter Persistence**: Filters saved in localStorage for better UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 📈 Historical Analysis
- **Trend Visualization**: View test results trends over time
- **Flexible Grouping**: Group data by hour, day, week, or month
- **Customizable Time Ranges**: View trends for 7, 14, 30, 60, or 90 days
- **Project Comparison**: Compare performance across different projects
- **Dual-axis Charts**: See pass rates and test counts simultaneously

### ⚡ Real-Time Features
- **WebSocket Integration**: Instant dashboard updates when new results arrive
- **Connection Status**: Visual indicator showing real-time connection status
- **Toast Notifications**: Alerts for new test results
- **Auto-refresh**: Fallback polling every 30 seconds
- **Live Updates**: See changes as they happen without manual refresh

### 📤 Export & Reporting
- **Multiple Formats**: Export as CSV or PDF
- **Professional PDF Reports**: Executive summary with charts and statistics
- **Scheduled Exports**: Set up daily, weekly, or monthly automated reports
- **Custom Schedules**: Use cron expressions for flexible scheduling
- **Auto-cleanup**: Automatically remove old export files

### 🔗 CI/CD Integration
- **GitHub Actions**: Direct webhook integration
- **Jenkins Support**: Build notification webhooks
- **GitLab CI**: Pipeline event webhooks
- **Generic Webhook**: Support for any custom CI/CD platform
- **Security**: HMAC signature verification for GitHub, token auth for others
- **Automatic Ingestion**: Test results automatically added to dashboard

### 🔍 Failure Analysis
- **Top Failures**: Visualize most common failure types
- **Error Clustering**: Group similar errors together
- **Trend Analysis**: See how failure rates change over time
- **Detailed Reports**: Export failure analysis to PDF

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

- **Backend**: Node.js, Express, SQLite, Knex.js, Socket.IO, PDFKit, Node-Cron
- **Frontend**: React, Vite, Chart.js, Axios, Socket.IO Client
- **Automação**: Robot Framework, Python
- **Database**: SQLite
- **Real-time**: WebSocket (Socket.IO)
- **Security**: HMAC signature verification, token authentication

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the `backend` directory for optional security features:

```env
# Server Configuration
PORT=3001

# Webhook Security (Optional but recommended)
GITHUB_WEBHOOK_SECRET=your_github_secret
JENKINS_WEBHOOK_TOKEN=your_jenkins_token
GITLAB_WEBHOOK_TOKEN=your_gitlab_token
```

**Note**: These are optional. The system works without them, but they add security to webhook endpoints.

### Webhook Configuration

To set up webhooks in your CI/CD platform:

1. **GitHub Actions**: Settings → Webhooks → Add webhook
   - Payload URL: `http://your-server:3001/api/v1/webhooks/github`
   - Content type: `application/json`
   - Secret: (your GITHUB_WEBHOOK_SECRET)
   - Events: Select "Workflow runs"

2. **Jenkins**: Configure build trigger
   - Use "Trigger builds remotely"
   - Add build step to POST to: `http://your-server:3001/api/v1/webhooks/jenkins`
   - Include header: `Authorization: Bearer YOUR_TOKEN`

3. **GitLab CI**: Settings → Webhooks
   - URL: `http://your-server:3001/api/v1/webhooks/gitlab`
   - Secret Token: (your GITLAB_WEBHOOK_TOKEN)
   - Trigger: Pipeline events

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

### Test Results

#### POST /api/v1/results
Recebe resultados de testes

**Request Body**:
```json
{
  "suite_name": "Login Tests",
  "total": 10,
  "passed": 8,
  "failed": 2,
  "framework": "Playwright",
  "test_type": "E2E",
  "project_category": "Frontend"
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

#### GET /api/v1/results
Retorna todos os resultados salvos

**Query Parameters**:
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)

**Response** (200 OK):
```json
{
  "message": "Results retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 2,
      "suite_name": "API Tests",
      "framework": "Jest",
      "total": 15,
      "passed": 15,
      "failed": 0,
      "created_at": "2025-11-17 12:30:00"
    }
  ]
}
```

### Trend Analysis

#### GET /api/v1/trends
Get aggregated trend data over time

**Query Parameters**:
- `grouping`: Time grouping (hour/day/week/month) - default: day
- `days`: Number of days to look back (1-365) - default: 30

**Response**:
```json
{
  "message": "Trend data retrieved successfully",
  "grouping": "day",
  "days": 30,
  "data": [
    {
      "date_group": "2025-11-18",
      "execution_count": 5,
      "total_tests": 150,
      "total_passed": 145,
      "total_failed": 5,
      "avg_pass_rate": 96.67
    }
  ]
}
```

#### GET /api/v1/trends/projects
Get project-specific trend data

**Query Parameters**:
- `project`: Project name (optional, default: all)
- `days`: Number of days (1-365) - default: 30

### Export

#### GET /api/v1/export/csv
Export test results as CSV file

**Query Parameters**:
- `startDate`: Optional start date filter
- `endDate`: Optional end date filter

#### GET /api/v1/export/pdf
Export test results as PDF report with charts and statistics

**Query Parameters**:
- `startDate`: Optional start date filter
- `endDate`: Optional end date filter

### Scheduled Exports

#### GET /api/v1/schedules
List all scheduled export jobs

#### POST /api/v1/schedules
Create a new scheduled export job

**Request Body**:
```json
{
  "id": "daily-report",
  "schedule": "0 0 * * *",
  "format": "csv",
  "filename": "daily-report",
  "enabled": true
}
```

**Cron Schedule Examples**:
- `0 0 * * *` - Daily at midnight
- `0 1 * * 0` - Weekly on Sunday at 1 AM
- `0 9 * * 1-5` - Weekdays at 9 AM

#### DELETE /api/v1/schedules/:id
Stop and remove a scheduled export job

### CI/CD Webhooks

#### GET /api/v1/webhooks
Get webhook configuration documentation

#### POST /api/v1/webhooks/github
Receive GitHub Actions workflow events

**Headers**:
- `X-GitHub-Event`: workflow_run
- `X-Hub-Signature-256`: HMAC signature (if secret configured)

**Environment Variable**: `GITHUB_WEBHOOK_SECRET`

#### POST /api/v1/webhooks/jenkins
Receive Jenkins build notifications

**Headers**:
- `Authorization`: Bearer YOUR_TOKEN

**Environment Variable**: `JENKINS_WEBHOOK_TOKEN`

#### POST /api/v1/webhooks/gitlab
Receive GitLab CI pipeline events

**Headers**:
- `X-Gitlab-Token`: YOUR_TOKEN

**Environment Variable**: `GITLAB_WEBHOOK_TOKEN`

#### POST /api/v1/webhooks/generic
Generic webhook endpoint for custom integrations

**Request Body**:
```json
{
  "suite_name": "My Test Suite",
  "framework": "Custom",
  "test_type": "Integration",
  "total": 100,
  "passed": 95,
  "failed": 5
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

## 📚 Advanced Usage Examples

### Setting Up Scheduled Reports

Create a daily CSV export at midnight:
```bash
curl -X POST http://localhost:3001/api/v1/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "daily-report",
    "schedule": "0 0 * * *",
    "format": "csv",
    "filename": "daily-qa-report",
    "enabled": true
  }'
```

### Viewing Trend Data

Get last 30 days of trends grouped by day:
```bash
curl "http://localhost:3001/api/v1/trends?grouping=day&days=30"
```

Get weekly trends:
```bash
curl "http://localhost:3001/api/v1/trends?grouping=week&days=90"
```

### Exporting Reports

Download CSV report:
```bash
curl "http://localhost:3001/api/v1/export/csv" -o report.csv
```

Download PDF report with date range:
```bash
curl "http://localhost:3001/api/v1/export/pdf?startDate=2025-11-01&endDate=2025-11-18" -o report.pdf
```

### CI/CD Integration Examples

#### GitHub Actions Workflow
```yaml
name: Run Tests and Report to QADash

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Tests
        run: npm test
        
      - name: Send Results to QADash
        if: always()
        run: |
          curl -X POST http://your-qadash-server:3001/api/v1/webhooks/generic \
            -H "Content-Type: application/json" \
            -d "{
              \"suite_name\": \"${{ github.repository }} - ${{ github.workflow }}\",
              \"framework\": \"GitHub Actions\",
              \"test_type\": \"CI/CD\",
              \"total\": 100,
              \"passed\": 95,
              \"failed\": 5
            }"
```

#### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Report to QADash') {
            steps {
                script {
                    sh """
                        curl -X POST http://your-qadash-server:3001/api/v1/webhooks/jenkins \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${JENKINS_WEBHOOK_TOKEN}" \
                        -d '{"name": "${JOB_NAME}", "build": {"number": "${BUILD_NUMBER}", "result": "${currentBuild.result}"}}'
                    """
                }
            }
        }
    }
}
```

#### GitLab CI
Add to `.gitlab-ci.yml`:
```yaml
test:
  script:
    - npm test
  after_script:
    - |
      curl -X POST http://your-qadash-server:3001/api/v1/webhooks/generic \
        -H "Content-Type: application/json" \
        -d "{
          \"suite_name\": \"$CI_PROJECT_NAME - $CI_PIPELINE_ID\",
          \"framework\": \"GitLab CI\",
          \"test_type\": \"CI/CD\",
          \"total\": 100,
          \"passed\": 95,
          \"failed\": 5
        }"
```

## 📊 Dashboard - Features

### Modern Professional Design
- **4 Key Metric Cards**:
  - Test Executions (total runs)
  - Unique Projects (number of different projects)
  - Total Tests (cumulative count)
  - Success Rate (overall pass percentage)

### Advanced Data Visualization
- **Historical Trends**: Line chart showing test results over time
  - Configurable grouping (hour/day/week/month)
  - Selectable time ranges (7-90 days)
  - Dual-axis chart (pass rate % + test counts)
  - Summary statistics below chart
- **Doughnut Chart**: Overall pass/fail ratio with center percentage
- **Bar Chart**: Project-wise comparison (top 5 projects)
- **Failure Analysis**: Top 5 recurring failures with bar chart
- **Interactive Tooltips**: Detailed information on hover

### Smart Filtering System
- **Date Range Filters**: 
  - Quick filters (All time, Today, Last 7 days, Last 30 days)
  - Custom date range picker
- **Project Filter**: Filter by specific test suite
- **Framework Filter**: Filter by testing framework
- **Status Filter**: Show all, passed only, or failed only
- **Filter Persistence**: Filters saved in localStorage
- **Results Counter**: Shows filtered vs total results

### Smart Results Table
- **Sorting**: By date, project name, or success rate
- **Visual Indicators**:
  - Green/red left borders for quick status recognition
  - Progress bars with color gradients
  - Status badges with checkmark/x icons
  - Framework badges with color coding
  - Category tags for project classification

### Real-time Updates
- ⚡ **WebSocket Connection**: Live updates without refresh
- 🔌 **Connection Status**: Visual pulse indicator showing connection state
- 🔔 **Toast Notifications**: Alerts when new test results arrive
- 🔄 **Auto-refresh**: Fallback polling every 30 seconds
- 🔘 **Manual refresh**: Button in header
- ⏱️ **Last update timestamp**: Always visible

### Export Capabilities
- 📥 **CSV Export**: Download data as spreadsheet
- 📄 **PDF Reports**: Professional reports with charts and statistics
- 📅 **Scheduled Exports**: Automated daily/weekly/monthly reports
- 🧹 **Auto-cleanup**: Old exports automatically removed

### Responsive Design
- 💻 Desktop optimized (full feature set)
- 📱 Tablet friendly (adapted layouts)
- 📱 Mobile compatible (touch-optimized)
- 🎨 **Visual Profissional**: Cores indicativas (verde=passou, vermelho=falhou)
- 🌐 **Cross-browser**: Works on Chrome, Firefox, Safari, Edge

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
