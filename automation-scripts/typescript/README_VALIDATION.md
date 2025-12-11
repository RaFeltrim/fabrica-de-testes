# Guia de Validação: Playwright + QADash

Este guia valida se a integração entre Playwright e QADash está funcionando corretamente.

## 1. Pré-requisitos: Iniciar o QADash

Certifique-se de que o backend e frontend do QADash estão rodando antes de executar os testes.

### Terminal 1: Backend (porta 3001)
```bash
cd ~/Projetos/fabrica-de-testes/backend
npm install
npm start
```
- Deve aparecer: "Server running on port 3001"

### Terminal 2: Frontend (porta 5173)
```bash
cd ~/Projetos/fabrica-de-testes/frontend
npm install
npm run dev
```
- Deve aparecer: "Local: http://localhost:5173"

## 2. Preparar os Testes

Instale as dependências do projeto de testes Playwright.

```bash
cd ~/Projetos/fabrica-de-testes/automation-scripts/playwright-e2e
npm install
```
- Deve instalar: @playwright/test, typescript, axios, etc.

## 3. Executar e Validar

Rode o teste Playwright.

```bash
npm test
```

### Verificações de Sucesso

#### No Terminal (Console Logs)
- Deve aparecer: "📤 Enviando resultados para o QADash..."
- Deve aparecer: "✅ Resultados enviados com sucesso!"

#### No Dashboard (http://localhost:5173)
- Abra o navegador e acesse o Dashboard
- Deve aparecer um novo card ou entrada com:
  - Suite Name: "Playwright Self-Test"
  - Total: 1, Passed: 1, Failed: 0
  - Framework: "Playwright"
  - Project Category: "Internal QA"

Se todas as verificações passarem, a integração está funcionando!