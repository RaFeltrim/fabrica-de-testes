# Frontend Testing Guide - QADash

## 📋 Overview

Configuração de testes para o frontend do QADash usando **Vitest** + **React Testing Library**.

## 🛠️ Stack de Testes

- **Vitest 4.0.15**: Test runner moderno e rápido (compatível com Vite)
- **@testing-library/react 16.3.0**: Testes focados no usuário
- **@testing-library/jest-dom 6.9.1**: Matchers adicionais
- **@testing-library/user-event 14.6.1**: Simulação de interações
- **jsdom 27.3.0**: Ambiente DOM para testes
- **@vitest/ui**: Interface gráfica para visualizar testes

## 🚀 Scripts Disponíveis

```bash
# Rodar testes em modo watch (desenvolvimento)
npm test

# Rodar testes uma vez e sair
npm run test:run

# Rodar testes com interface gráfica
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage

# Modo watch manual
npm run test:watch
```

## 📁 Estrutura de Arquivos

```
frontend/
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.jsx
│   │       └── Button.test.jsx         # Teste do componente
│   ├── pages/
│   │   └── Dashboard/
│   │       ├── Dashboard.jsx
│   │       └── Dashboard.test.jsx
│   ├── hooks/
│   │   └── useWebSocket/
│   │       ├── useWebSocket.js
│   │       └── useWebSocket.test.js
│   ├── services/
│   │   └── api.js
│   │   └── api.test.js
│   └── test/
│       ├── setup.js                    # Configuração global
│       ├── example.test.jsx            # Teste de exemplo
│       └── utils/                      # Helpers de teste
├── vitest.config.js                    # Configuração Vitest
└── package.json
```

## 🧪 Exemplos de Testes

### Teste Básico de Componente

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click Me</Button>);
    
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
```

### Teste com Interação

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with credentials', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Teste com Mock de API

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ResultsList from './ResultsList';
import * as api from '@services/api';

vi.mock('@services/api');

describe('ResultsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and display results', async () => {
    const mockResults = [
      { id: 1, suite_name: 'Test Suite 1', passed: 10, failed: 0 },
      { id: 2, suite_name: 'Test Suite 2', passed: 8, failed: 2 }
    ];
    
    api.getResults.mockResolvedValue(mockResults);
    
    render(<ResultsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
      expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
    });
    
    expect(api.getResults).toHaveBeenCalledTimes(1);
  });

  it('should show error message on API failure', async () => {
    api.getResults.mockRejectedValue(new Error('API Error'));
    
    render(<ResultsList />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading results/i)).toBeInTheDocument();
    });
  });
});
```

### Teste de Custom Hook

```jsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';
import { io } from 'socket.io-client';

vi.mock('socket.io-client');

describe('useWebSocket', () => {
  it('should connect and receive messages', async () => {
    const mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn()
    };
    
    io.mockReturnValue(mockSocket);
    
    const { result } = renderHook(() => useWebSocket('http://localhost:3000'));
    
    expect(io).toHaveBeenCalledWith('http://localhost:3000');
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
  });
});
```

## 📊 Cobertura de Código

### Thresholds Configurados

```javascript
coverage: {
  thresholds: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70
  }
}
```

### Visualizar Relatório de Cobertura

```bash
# Gerar relatório
npm run test:coverage

# Abrir relatório HTML (gerado em coverage/index.html)
# Abra o arquivo no navegador
```

## 🎯 Melhores Práticas

### 1. Queries de Prioridade

Use queries na seguinte ordem de prioridade:

```jsx
// ✅ Preferível - Acessível para todos
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')

// ⚠️ Use apenas se necessário
screen.getByTestId('custom-element')
```

### 2. Esperar por Elementos Assíncronos

```jsx
// ✅ Correto - espera elemento aparecer
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// ❌ Incorreto - não espera
expect(screen.getByText('Loaded')).toBeInTheDocument();
```

### 3. Limpar Mocks

```jsx
describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa histórico de chamadas
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura implementação original
  });
});
```

### 4. Testar Comportamento, Não Implementação

```jsx
// ✅ Bom - testa resultado visível ao usuário
it('should show success message after save', async () => {
  render(<Form />);
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(screen.getByText('Saved successfully')).toBeInTheDocument();
});

// ❌ Ruim - testa detalhes de implementação
it('should update state.isSaving to true', async () => {
  const { result } = renderHook(() => useForm());
  result.current.save();
  expect(result.current.state.isSaving).toBe(true);
});
```

## 🔧 Configuração Avançada

### Aliases de Path

```javascript
// vitest.config.js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
  }
}

// Use nos testes
import Button from '@components/Button';
import { useWebSocket } from '@hooks/useWebSocket';
```

### Mocks Globais

Configurados em `src/test/setup.js`:

- `window.matchMedia` - Para testes de media queries
- `IntersectionObserver` - Para lazy loading
- `ResizeObserver` - Para componentes responsivos
- `Chart.js` - Biblioteca de gráficos
- `socket.io-client` - WebSocket client

## 🐛 Troubleshooting

### Problema: "Cannot find module"

```bash
# Verifique se as dependências estão instaladas
npm install

# Limpe cache do Vitest
npx vitest --clearCache
```

### Problema: "ReferenceError: window is not defined"

Verifique se `environment: 'jsdom'` está configurado em `vitest.config.js`.

### Problema: Testes lentos

```javascript
// Aumente o timeout
test: {
  testTimeout: 10000, // 10 segundos
  hookTimeout: 10000
}
```

## 📈 Status Atual

- ✅ **Vitest configurado** com jsdom
- ✅ **React Testing Library** integrado
- ✅ **Coverage thresholds** definidos (70%+)
- ✅ **Mocks globais** para Chart.js e Socket.IO
- ✅ **Path aliases** configurados
- ✅ **6 testes de exemplo** passando
- ✅ **Scripts NPM** para teste/coverage/UI

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎯 Próximos Passos

1. Criar testes para componentes principais:
   - Dashboard
   - ResultsChart
   - TrendsView
   - WebSocketProvider

2. Implementar testes E2E com Cypress/Playwright

3. Configurar CI/CD para rodar testes automaticamente

4. Aumentar cobertura para 80%+
