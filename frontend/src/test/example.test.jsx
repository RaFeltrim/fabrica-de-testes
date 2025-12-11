import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Simple example component for testing
function Button({ onClick, children }) {
  return (
    <button onClick={onClick} data-testid="test-button">
      {children}
    </button>
  );
}

describe('Example Test Suite', () => {
  it('should render button with text', () => {
    render(<Button>Click Me</Button>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  it('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByTestId('test-button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByTestId('test-button');
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});

describe('Vitest Configuration Test', () => {
  it('should have access to globals', () => {
    expect(window).toBeDefined();
    expect(document).toBeDefined();
  });

  it('should support async/await', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should support mocking', () => {
    const mockFn = vi.fn(() => 'mocked');
    const result = mockFn();
    
    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('mocked');
  });
});
