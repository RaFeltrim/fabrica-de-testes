# ADR-006: Error Handling Pattern

**Status:** Accepted  
**Date:** 2024-12-11  
**Decision Makers:** Backend Team, QA Lead  
**Tags:** #errorhandling #api #standardization

## Context

O QADash precisa de um padrão consistente de tratamento de erros para:

- Facilitar debugging e troubleshooting
- Fornecer feedback claro para clientes da API
- Padronizar logs e monitoramento
- Melhorar experiência do desenvolvedor

### Problemas Atuais

```javascript
// ❌ Inconsistente - diferentes formatos de erro
res.status(500).send('Error occurred');
res.json({ error: 'Something went wrong' });
res.status(400).json({ message: 'Invalid input', details: {...} });
```

### Requisitos

1. **Consistência:** Mesmo formato em todos os endpoints
2. **Informativo:** Mensagens claras para debugging
3. **Seguro:** Não expor detalhes internos em produção
4. **Rastreável:** Correlation IDs para tracking
5. **Categorizado:** Tipos de erro bem definidos

## Decision

Implementar **padrão RFC 7807 (Problem Details for HTTP APIs)** com extensões para contexto QADash.

### Estrutura Padrão de Erro

```typescript
interface ErrorResponse {
  error: string;           // Código do erro (e.g., "VALIDATION_ERROR")
  message: string;         // Mensagem legível para humanos
  statusCode: number;      // HTTP status code
  timestamp: string;       // ISO 8601 timestamp
  path: string;           // Endpoint que gerou o erro
  correlationId?: string; // UUID para rastreamento
  details?: object;       // Detalhes adicionais (apenas dev/staging)
  stack?: string;         // Stack trace (apenas dev)
}
```

### Exemplos de Uso

#### 1. Validation Error (400)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "statusCode": 400,
  "timestamp": "2024-12-11T10:30:00.000Z",
  "path": "/api/v1/results",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "fields": {
      "suite_name": "Required field missing",
      "total": "Must be a positive integer"
    }
  }
}
```

#### 2. Not Found (404)
```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Result with ID '123' not found",
  "statusCode": 404,
  "timestamp": "2024-12-11T10:30:00.000Z",
  "path": "/api/v1/results/123",
  "correlationId": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### 3. Rate Limit (429)
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "statusCode": 429,
  "timestamp": "2024-12-11T10:30:00.000Z",
  "path": "/api/v1/export",
  "correlationId": "550e8400-e29b-41d4-a716-446655440002",
  "details": {
    "limit": 10,
    "remaining": 0,
    "reset": "2024-12-11T11:30:00.000Z"
  }
}
```

#### 4. Internal Server Error (500)
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Please contact support.",
  "statusCode": 500,
  "timestamp": "2024-12-11T10:30:00.000Z",
  "path": "/api/v1/results",
  "correlationId": "550e8400-e29b-41d4-a716-446655440003"
  // stack e details omitidos em produção
}
```

## Implementation

### 1. Error Classes

```javascript
// src/utils/errors.js
class AppError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // vs programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with ID '${id}' not found`, 404, 'RESOURCE_NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

class RateLimitError extends AppError {
  constructor(limit, reset) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { limit, reset });
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError
};
```

### 2. Error Handler Middleware

```javascript
// src/middleware/errorHandler.js
const { v4: uuidv4 } = require('uuid');

const errorHandler = (err, req, res, next) => {
  const correlationId = req.id || uuidv4();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error
  console.error(`[${correlationId}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user?.id
  });

  // Operational errors (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      correlationId,
      ...(isDevelopment && err.details && { details: err.details })
    });
  }

  // Programming errors (unexpected)
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: isDevelopment 
      ? err.message 
      : 'An unexpected error occurred. Please contact support.',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.path,
    correlationId,
    ...(isDevelopment && { stack: err.stack })
  });
};

// Handle async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, asyncHandler };
```

### 3. Using in Controllers

```javascript
// src/controllers/resultsController.js
const { ValidationError, NotFoundError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/errorHandler');

class ResultsController {
  saveResult = asyncHandler(async (req, res) => {
    const { suite_name, total, passed, failed } = req.body;

    // Validation
    if (!suite_name || total === undefined) {
      throw new ValidationError('Missing required fields', {
        fields: {
          suite_name: !suite_name ? 'Required' : undefined,
          total: total === undefined ? 'Required' : undefined
        }
      });
    }

    // Business logic
    const result = await dbService.saveResult(req.body);
    
    if (!result) {
      throw new NotFoundError('Result', req.params.id);
    }

    res.status(201).json(result);
  });
}
```

### 4. Application Setup

```javascript
// src/app.js
const { errorHandler } = require('./middleware/errorHandler');
const { correlationId } = require('./middleware/correlationId');

// Middleware order matters!
app.use(correlationId);  // Add correlation ID to requests
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);   // Must be last
```

## Error Codes Catalog

| Code | Status | Descrição | Exemplo |
|------|--------|-----------|---------|
| `VALIDATION_ERROR` | 400 | Entrada inválida | Campos obrigatórios faltando |
| `UNAUTHORIZED` | 401 | Não autenticado | Token ausente/inválido |
| `FORBIDDEN` | 403 | Sem permissão | Usuário sem role adequada |
| `RESOURCE_NOT_FOUND` | 404 | Recurso não existe | Result ID inexistente |
| `CONFLICT` | 409 | Conflito de estado | Duplicate entry |
| `RATE_LIMIT_EXCEEDED` | 429 | Muitas requisições | Limite de API atingido |
| `INTERNAL_SERVER_ERROR` | 500 | Erro inesperado | Database connection failed |
| `SERVICE_UNAVAILABLE` | 503 | Serviço indisponível | Maintenance mode |

## Consequences

### Positivas

- ✅ **Consistência:** Todos os erros seguem o mesmo formato
- ✅ **Debugging:** Correlation IDs facilitam rastreamento
- ✅ **Segurança:** Stack traces apenas em dev
- ✅ **DX:** Clientes da API sabem o que esperar
- ✅ **Monitoramento:** Fácil agregar métricas por error code

### Negativas

- ⚠️ **Overhead:** Pequeno aumento no response size (~100 bytes)
- ⚠️ **Manutenção:** Precisa manter catálogo de erros atualizado

### Métricas

- Error rate por endpoint (< 1%)
- P95 error response time (< 50ms)
- % erros com correlation ID (100%)
- % erros categorizados corretamente (> 95%)

## Best Practices

1. **Use classes de erro apropriadas**
   ```javascript
   // ✅ Bom
   throw new ValidationError('Invalid input', { field: 'email' });
   
   // ❌ Ruim
   throw new Error('Validation failed');
   ```

2. **Sempre use asyncHandler para async functions**
   ```javascript
   // ✅ Bom
   router.get('/results', asyncHandler(async (req, res) => { ... }));
   
   // ❌ Ruim - erros não serão capturados
   router.get('/results', async (req, res) => { ... });
   ```

3. **Log contexto suficiente**
   ```javascript
   console.error('Error saving result:', {
     error: err.message,
     userId: req.user?.id,
     payload: req.body,
     correlationId: req.id
   });
   ```

4. **Nunca expor dados sensíveis**
   ```javascript
   // ❌ NUNCA faça isso
   throw new Error(`Database password: ${dbPassword}`);
   ```

## References

- [RFC 7807 - Problem Details](https://datatracker.ietf.org/doc/html/rfc7807)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [OWASP Error Handling](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)

## Revision History

- **2024-12-11:** Initial implementation with RFC 7807 pattern
