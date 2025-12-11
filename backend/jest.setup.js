// Jest Setup File
jest.setTimeout(30000);

// Mock do socket.io para testes
jest.mock('socket.io', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    to: jest.fn(() => ({
      emit: jest.fn()
    })),
    disconnect: jest.fn()
  }));
});

// Mock do dbService para testes
jest.mock('./src/services/dbService', () => ({
  saveResult: jest.fn().mockResolvedValue({ id: 1 }),
  insert: jest.fn().mockResolvedValue({ id: 1 }),
  getResults: jest.fn().mockResolvedValue([]),
  getTrendData: jest.fn().mockResolvedValue([])
}));

// Suprimir warnings de console em testes (opcional)
global.console = {
  ...console,
  // Manter error e warn visíveis
  error: jest.fn(),
  warn: jest.fn(),
  // Mas suprimir logs normais
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
