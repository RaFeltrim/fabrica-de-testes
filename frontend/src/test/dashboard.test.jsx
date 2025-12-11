import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

// Mock dos serviços para testes reais (sem mocks completos)
beforeEach(() => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => null),
      removeItem: vi.fn(() => null),
      clear: vi.fn(() => null),
    },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Dashboard Component', () => {
  it('should render dashboard with loading state initially', () => {
    render(<Dashboard />);

    // Verifica se o skeleton de loading aparece
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('should render dashboard title', () => {
    render(<Dashboard />);

    // Verifica se o título do dashboard está presente
    expect(screen.getByText('QA Environment - Production Monitor')).toBeInTheDocument();
  });

  it('should have filter controls', () => {
    render(<Dashboard />);

    // Verifica se os controles de filtro estão presentes
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('should have export functionality', () => {
    render(<Dashboard />);

    // Verifica se o botão de export está presente
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should have pipeline controls', () => {
    render(<Dashboard />);

    // Verifica se os controles de pipeline estão presentes
    expect(screen.getByText('Controles do Pipeline')).toBeInTheDocument();
  });

  it('should display results section', () => {
    render(<Dashboard />);

    // Verifica se a seção de resultados está presente
    expect(screen.getByText('Resultados dos Testes')).toBeInTheDocument();
  });

  it('should have trend chart section', () => {
    render(<Dashboard />);

    // Verifica se a seção de tendências está presente
    expect(screen.getByText('Tendências')).toBeInTheDocument();
  });

  it('should have failure analysis section', () => {
    render(<Dashboard />);

    // Verifica se a seção de análise de falhas está presente
    expect(screen.getByText('Análise de Falhas')).toBeInTheDocument();
  });
});
