# 🚀 PLANO DE IMPLEMENTAÇÃO - FÁBRICA DE TESTES (QADash)
## Transformação de Nível Pleno (PL) para Sênior (SR)

**Data de Criação:** 10 de Dezembro de 2025  
**Versão:** 1.0  
**Responsável:** Rafael Feltrim  

---

## 📋 SUMÁRIO EXECUTIVO

### Objetivo
Elevar o projeto **QADash (Fábrica de Testes)** de um nível **Pleno** para **Sênior**, implementando:
- ✅ Testes automatizados robustos (80%+ cobertura)
- ✅ Arquitetura profissional documentada
- ✅ Segurança avançada
- ✅ Observability & Monitoring
- ✅ Deploy containerizado (Docker/K8s ready)
- ✅ Integração com CNPJ-QA-Training Framework (opcional futura)

### Estado Atual do Projeto
```
📁 fabrica-de-testes/
├── backend/           ✅ Node.js/Express + SQLite + Socket.IO
├── frontend/          ✅ React 18 + Vite + Chart.js
├── automation-scripts/ ✅ Scripts de envio de resultados
└── start-qadash.bat   ✅ Script de inicialização
```

### Stack Tecnológico Atual
| Camada | Tecnologia | Status |
|--------|------------|--------|
| Frontend | React 18 + Vite + Chart.js | ✅ Implementado |
| Backend | Node.js + Express | ✅ Implementado |
| Database | SQLite (Knex.js) | ✅ Implementado |
| Real-time | Socket.IO | ✅ Implementado |
| CI/CD | GitHub Actions | ❌ Pendente |
| Testes | Jest + Vitest | ❌ Pendente |
| Docker | Dockerfiles | ❌ Pendente |

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### Timeline Total: 8-10 Semanas

```
┌────────────────────────────────────────────────────────────────────────────┐
│  SEMANA 1-2        │  SEMANA 3-4       │  SEMANA 5-6      │  SEMANA 7-8   │
├────────────────────────────────────────────────────────────────────────────┤
│  FASE 1            │  FASE 2           │  FASE 3          │  FASE 4       │
│  Testes Backend    │  Testes Frontend  │  Infraestrutura  │  Produção     │
│  + Documentação    │  + Segurança      │  + DevOps        │  + Polish     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 FASE 1: TESTES & DOCUMENTAÇÃO (Semanas 1-2)

### 1.1 Setup de Testes Backend (Jest + Supertest)

#### Passo 1: Instalação de Dependências
```bash
cd backend
npm install --save-dev jest supertest @babel/preset-env babel-jest
```

#### Passo 2: Configuração Jest
**Criar arquivo:** `backend/jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/knexfile.js',
    '!src/server.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/database/'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

#### Passo 3: Estrutura de Testes a Criar
```
backend/src/
├── controllers/
│   ├── resultsController.js
│   └── __tests__/
│       └── resultsController.test.js     ← CRIAR
├── services/
│   ├── dbService.js
│   └── __tests__/
│       └── dbService.test.js              ← CRIAR
├── routes/
│   └── __tests__/
│       └── api.integration.test.js        ← CRIAR
└── __tests__/
    └── setup.test.js                      ← CRIAR
```

#### Testes Essenciais a Implementar:

**1. Testes do ResultsController:**
- [ ] `POST /api/v1/results` - salvar resultado válido
- [ ] `POST /api/v1/results` - rejeitar dados inválidos
- [ ] `GET /api/v1/results` - listar resultados com paginação
- [ ] `GET /api/v1/results` - aplicar filtros corretamente
- [ ] Rate limiting (429 após 100 requests/15min)

**2. Testes do TrendsController:**
- [ ] `GET /api/v1/trends` - retornar dados agregados
- [ ] `GET /api/v1/trends` - filtrar por período
- [ ] `GET /api/v1/trends` - agrupar por hora/dia/semana

**3. Testes do WebhookController:**
- [ ] Validação de assinatura HMAC (GitHub)
- [ ] Rejeitar assinatura inválida
- [ ] Processar payload de CI/CD

**4. Testes do ExportController:**
- [ ] Geração de CSV
- [ ] Geração de PDF
- [ ] Scheduled exports

### 1.2 Documentação de Arquitetura (ADRs)

#### Criar pasta: `docs/adr/`

**ADRs a criar:**

| ID | Título | Status |
|----|--------|--------|
| ADR-001 | Escolha do Database (SQLite vs PostgreSQL) | A criar |
| ADR-002 | WebSocket vs Polling para Real-time | A criar |
| ADR-003 | Estratégia de Cache (Redis) | A criar |
| ADR-004 | Frontend Framework (React + Vite) | A criar |
| ADR-005 | Modelo de Autenticação (JWT vs API Keys) | A criar |
| ADR-006 | Pattern de Error Handling | A criar |
| ADR-007 | Versionamento de API | A criar |

#### Template de ADR:
```markdown
# ADR-XXX: [Título da Decisão]

## Status
[Accepted/Proposed/Deprecated]

## Context
[Contexto e problema que motivou a decisão]

## Decision
[A decisão tomada]

## Consequences
- ✅ Benefícios
- ⚠️ Trade-offs
- ❌ Desvantagens
```

### 1.3 Checklist Fase 1 (Semanas 1-2)

#### Semana 1:
- [ ] Instalar Jest e Supertest no backend
- [ ] Criar jest.config.js e jest.setup.js
- [ ] Implementar 10+ testes do resultsController
- [ ] Implementar 5+ testes do trendsController
- [ ] Criar ADR-001 (Database)
- [ ] Criar ADR-002 (WebSocket)

#### Semana 2:
- [ ] Implementar 5+ testes do webhookController
- [ ] Implementar 5+ testes do exportController
- [ ] Criar testes de integração (routes)
- [ ] Alcançar 60%+ coverage no backend
- [ ] Criar ADR-003 até ADR-007
- [ ] Documentar arquitetura C4 (Level 1 e 2)

---

## 🎨 FASE 2: TESTES FRONTEND & SEGURANÇA (Semanas 3-4)

### 2.1 Setup de Testes Frontend (Vitest + React Testing Library)

#### Instalação:
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### Configuração Vitest:
**Criar arquivo:** `frontend/vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

#### Estrutura de Testes Frontend:
```
frontend/src/
├── components/
│   ├── Dashboard.jsx
│   └── __tests__/
│       └── Dashboard.test.jsx          ← CRIAR
│   ├── ResultsList.jsx
│   └── __tests__/
│       └── ResultsList.test.jsx        ← CRIAR
│   ├── TrendChart.jsx
│   └── __tests__/
│       └── TrendChart.test.jsx         ← CRIAR
├── services/
│   ├── apiService.js
│   └── __tests__/
│       └── apiService.test.js          ← CRIAR
└── test/
    └── setup.js                         ← CRIAR
```

#### Testes Essenciais Frontend:
- [ ] Dashboard renderiza métricas corretamente
- [ ] Filtros funcionam e persistem em localStorage
- [ ] Gráficos exibem dados corretamente
- [ ] WebSocket atualiza dashboard em tempo real
- [ ] Export buttons funcionam
- [ ] Responsividade mobile
- [ ] Estados de loading e erro

### 2.2 Implementação de Segurança

#### 2.2.1 Rate Limiting Avançado
```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Rate limiter geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter strict para endpoints sensíveis
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { error: 'Too many attempts' }
});

module.exports = { generalLimiter, strictLimiter };
```

#### 2.2.2 Helmet para Security Headers
```bash
npm install helmet
```

```javascript
// backend/src/app.js
const helmet = require('helmet');
app.use(helmet());
```

#### 2.2.3 Validação de Webhooks (HMAC)
```javascript
// backend/src/middleware/webhookValidator.js
const crypto = require('crypto');

function validateGitHubSignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  
  const payload = JSON.stringify(req.body);
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 2.3 Checklist Fase 2 (Semanas 3-4)

#### Semana 3:
- [ ] Instalar Vitest e Testing Library
- [ ] Configurar vitest.config.js
- [ ] Criar setup.js para testes
- [ ] Implementar 10+ testes de componentes
- [ ] Testar Dashboard completo
- [ ] Testar integração com Socket.IO

#### Semana 4:
- [ ] Implementar rate limiting avançado
- [ ] Adicionar Helmet para security headers
- [ ] Validar HMAC em webhooks
- [ ] Implementar CORS configurável
- [ ] Criar testes de segurança
- [ ] Alcançar 75%+ coverage frontend
- [ ] Alcançar 80%+ coverage backend

---

## 🐳 FASE 3: INFRAESTRUTURA & DEVOPS (Semanas 5-6)

### 3.1 Containerização Docker

#### Backend Dockerfile:
**Criar arquivo:** `backend/Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY src/ ./src/

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "src/server.js"]
```

#### Frontend Dockerfile:
**Criar arquivo:** `frontend/Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose:
**Criar arquivo:** `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./backend/database:/app/database
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  redis-data:
```

### 3.2 CI/CD com GitHub Actions

**Criar arquivo:** `.github/workflows/test.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests with coverage
        run: cd backend && npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage
          flags: backend

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests with coverage
        run: cd frontend && npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          directory: ./frontend/coverage
          flags: frontend

  build:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker images
        run: |
          docker build -t qadash-backend:${{ github.sha }} ./backend
          docker build -t qadash-frontend:${{ github.sha }} ./frontend
```

### 3.3 Logging Estruturado (Winston)

**Instalar Winston:**
```bash
cd backend
npm install winston
```

**Criar arquivo:** `backend/src/utils/logger.js`
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'qadash-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### 3.4 Checklist Fase 3 (Semanas 5-6)

#### Semana 5:
- [ ] Criar Dockerfile do backend
- [ ] Criar Dockerfile do frontend
- [ ] Criar docker-compose.yml
- [ ] Testar build e execução local
- [ ] Criar .dockerignore
- [ ] Configurar health checks

#### Semana 6:
- [ ] Criar workflow GitHub Actions
- [ ] Configurar Codecov
- [ ] Implementar logging com Winston
- [ ] Adicionar endpoint /health
- [ ] Adicionar endpoint /metrics (opcional)
- [ ] Testar CI/CD completo

---

## 🚀 FASE 4: PRODUÇÃO & POLISH (Semanas 7-8)

### 4.1 Melhorias de Performance

#### Cache com Redis:
```javascript
// backend/src/services/cacheService.js
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function getFromCache(key) {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function setToCache(key, value, ttlSeconds = 300) {
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
}

async function invalidateCache(pattern) {
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}

module.exports = { getFromCache, setToCache, invalidateCache };
```

### 4.2 Documentação Final

#### README.md Profissional:
- [ ] Badges de status (build, coverage, license)
- [ ] Quick Start atualizado
- [ ] Diagrama de arquitetura
- [ ] API documentation
- [ ] Contributing guidelines
- [ ] Changelog

#### Arquivos a criar/atualizar:
- [ ] `DEPLOYMENT.md` - Guia de deploy
- [ ] `CONTRIBUTING.md` - Guia de contribuição
- [ ] `SECURITY.md` - Política de segurança
- [ ] `CHANGELOG.md` - Histórico de versões
- [ ] `.env.example` - Variáveis de ambiente

### 4.3 Testes E2E com Cypress

**Instalar Cypress:**
```bash
npm install --save-dev cypress
```

**Criar arquivo:** `cypress/e2e/dashboard.cy.js`
```javascript
describe('QADash Dashboard E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should display dashboard with metrics', () => {
    cy.get('[data-testid="metrics-card"]').should('have.length', 4);
    cy.get('[data-testid="chart-container"]').should('exist');
  });

  it('should submit test results and update dashboard', () => {
    cy.request('POST', 'http://localhost:3001/api/v1/results', {
      suite_name: 'E2E Test Suite',
      total: 10,
      passed: 9,
      failed: 1,
      framework: 'Cypress'
    }).then((response) => {
      expect(response.status).to.eq(201);
    });

    cy.reload();
    cy.contains('E2E Test Suite').should('exist');
  });

  it('should filter results correctly', () => {
    cy.get('[data-testid="filter-failed"]').click();
    cy.get('[data-testid="result-item"]').each(($item) => {
      cy.wrap($item).should('contain', 'Failed');
    });
  });

  it('should export to CSV', () => {
    cy.get('[data-testid="export-csv"]').click();
    cy.readFile('cypress/downloads/export.csv').should('exist');
  });
});
```

### 4.4 Checklist Fase 4 (Semanas 7-8)

#### Semana 7:
- [ ] Implementar cache Redis
- [ ] Otimizar queries do banco
- [ ] Implementar testes E2E (Cypress)
- [ ] Testar fluxos críticos
- [ ] Performance testing básico
- [ ] Documentar API (Swagger/OpenAPI)

#### Semana 8:
- [ ] Atualizar README.md completo
- [ ] Criar DEPLOYMENT.md
- [ ] Criar CONTRIBUTING.md
- [ ] Adicionar badges ao README
- [ ] Revisão final de código
- [ ] Teste de regressão completo
- [ ] Tag de versão 1.0.0

---

## 📊 MÉTRICAS DE SUCESSO

### Critérios de Aceite para Nível SR

| Métrica | Meta | Status |
|---------|------|--------|
| Cobertura Backend | ≥ 80% | ⬜ Pendente |
| Cobertura Frontend | ≥ 75% | ⬜ Pendente |
| ADRs Documentados | ≥ 7 | ⬜ Pendente |
| Docker Funcional | ✅ | ⬜ Pendente |
| CI/CD Automático | ✅ | ⬜ Pendente |
| Testes E2E | ≥ 5 fluxos | ⬜ Pendente |
| Security Headers | Helmet ativo | ⬜ Pendente |
| Rate Limiting | 100 req/15min | ⬜ Pendente |
| Logging Estruturado | Winston JSON | ⬜ Pendente |
| Health Check | /health 200 | ⬜ Pendente |

### Matriz de Senioridade

| Aspecto | Atual (PL) | Meta (SR) |
|---------|------------|-----------|
| Testes | ~0% | 80%+ |
| Documentação | Básica | Excelente |
| Segurança | Básica | Avançada |
| Deploy | Manual | Automatizado |
| Observability | Logs básicos | Logs + Metrics |
| Arquitetura | MVC | Event-Driven |

---

## 🔮 FUTURO: INTEGRAÇÃO COM CNPJ-QA-TRAINING

### Fase Opcional (Após SR)

Conforme documentado no guia, a integração com o framework Python CNPJ-QA-Training pode ser implementada após atingir o nível SR:

```
┌─────────────────────────────────────────────────────────┐
│           QADash (Dashboard)                             │
│  - Criar cenários visualmente                           │
│  - Gerenciar dados de teste                             │
│  - Visualizar resultados                                │
└──────────────────┬──────────────────────────────────────┘
                   │ REST API + WebSocket
                   ▼
┌─────────────────────────────────────────────────────────┐
│        CNPJ-QA-Training (Framework)                     │
│  - Executar testes automatizados                        │
│  - Validações e assertions                              │
│  - Integração CI/CD                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 RESUMO DE TAREFAS POR PRIORIDADE

### 🔴 Crítico (Fazer Primeiro)
1. Setup Jest + Supertest no backend
2. Criar testes do resultsController
3. Criar testes do webhookController
4. Implementar rate limiting
5. Criar Dockerfiles

### 🟡 Alto (Segunda Prioridade)
6. Setup Vitest + Testing Library
7. Criar testes de componentes React
8. Configurar GitHub Actions
9. Criar ADRs de arquitetura
10. Implementar logging Winston

### 🟢 Médio (Terceira Prioridade)
11. Implementar cache Redis
12. Criar testes E2E Cypress
13. Documentação completa
14. Badges e README profissional
15. Performance optimization

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana:
1. **Dia 1-2:** Instalar Jest e criar configuração de testes backend
2. **Dia 3-4:** Implementar testes do resultsController e trendsController
3. **Dia 5:** Criar primeiros ADRs e revisar progresso

### Comandos para Começar:
```bash
# Backend - Setup de testes
cd backend
npm install --save-dev jest supertest @babel/preset-env babel-jest

# Adicionar scripts ao package.json
npm pkg set scripts.test="jest"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"

# Executar primeiro teste
npm test
```

---

**Versão:** 1.0  
**Última Atualização:** 10 de Dezembro de 2025  
**Próxima Revisão:** Após completar Fase 1  

---

> 💡 **Dica:** Marque os checkboxes conforme for completando cada item. Use este documento como guia principal durante toda a implementação.
