# ADR-007: API Versioning Strategy

**Status:** Accepted  
**Date:** 2024-12-11  
**Decision Makers:** Backend Team, API Consumer Teams  
**Tags:** #api #versioning #backwards-compatibility

## Context

O QADash precisa de uma estratégia de versionamento de API para:

- Permitir evolução da API sem quebrar clientes existentes
- Facilitar deprecação gradual de endpoints antigos
- Dar previsibilidade para consumidores da API
- Suportar múltiplas versões simultaneamente durante transições

### Requisitos

1. **Clareza:** Versão explícita e fácil de identificar
2. **Simplicidade:** Fácil de implementar e manter
3. **Flexibilidade:** Suportar mudanças breaking sem afetar clientes antigos
4. **Documentação:** Fácil de documentar e comunicar

### Cenários de Mudança

1. **Non-breaking (Patch/Minor):**
   - Adicionar novos campos opcionais em request/response
   - Adicionar novos endpoints
   - Melhorias de performance
   - Bug fixes

2. **Breaking (Major):**
   - Remover campos de response
   - Alterar tipo de dados de campos existentes
   - Tornar campos obrigatórios
   - Mudar comportamento de endpoint

## Decision

Implementar **URL Path Versioning** com formato `/api/v{major}/resource`.

### Formato

```
https://api.qadash.com/api/v1/results
                        └─┬─┘
                          └── Versão Major
```

### Estratégia de Versionamento Semântico

Seguir **Semantic Versioning (SemVer)** adaptado para APIs:

- **Major (v1, v2, v3):** Breaking changes
- **Minor:** Adições backwards-compatible (não precisa nova versão de API)
- **Patch:** Bug fixes (não precisa nova versão de API)

### Alternativas Consideradas

1. **✅ URL Path Versioning** (Escolhida)
   ```
   GET /api/v1/results
   GET /api/v2/results
   ```
   - ✅ Visível e explícita
   - ✅ Fácil de rotear e cachear
   - ✅ Funciona em qualquer client (browser, curl, etc.)
   - ✅ Simples de documentar

2. **❌ Header Versioning**
   ```
   GET /api/results
   Accept: application/vnd.qadash.v1+json
   ```
   - ⚠️ Menos visível
   - ⚠️ Difícil de testar no browser
   - ⚠️ Requer header customizado

3. **❌ Query Parameter Versioning**
   ```
   GET /api/results?version=1
   ```
   - ⚠️ Parâmetro pode ser omitido acidentalmente
   - ⚠️ Conflito com outros query params
   - ⚠️ Difícil de cachear

4. **❌ Subdomain Versioning**
   ```
   GET https://v1.api.qadash.com/results
   ```
   - ⚠️ Complexo para DNS e certificados SSL
   - ⚠️ Overkill para escala atual

## Implementation

### 1. Route Structure

```javascript
// src/routes/index.js
const express = require('express');
const v1Routes = require('./v1');
// const v2Routes = require('./v2'); // Future

const router = express.Router();

// v1 routes (current)
router.use('/v1', v1Routes);

// Default to latest stable version
router.use('/', v1Routes);

module.exports = router;
```

```javascript
// src/routes/v1/index.js
const express = require('express');
const resultsRouter = require('./results');
const trendsRouter = require('./trends');
const webhooksRouter = require('./webhooks');
const exportRouter = require('./export');

const router = express.Router();

router.use('/results', resultsRouter);
router.use('/trends', trendsRouter);
router.use('/webhooks', webhooksRouter);
router.use('/export', exportRouter);

// Version metadata
router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    status: 'stable',
    documentation: 'https://docs.qadash.com/api/v1',
    deprecation: null
  });
});

module.exports = router;
```

### 2. Migration Path for Breaking Changes

#### Scenario: Mudança em formato de data

**v1 (Old):**
```json
{
  "created_at": "2024-12-11 10:30:00"  // String format
}
```

**v2 (New):**
```json
{
  "created_at": "2024-12-11T10:30:00.000Z",  // ISO 8601
  "created_timestamp": 1702292400000         // Unix timestamp
}
```

#### Implementation:

```javascript
// src/routes/v1/results.js (mantido para backwards compatibility)
router.get('/:id', async (req, res) => {
  const result = await dbService.getResult(req.params.id);
  
  // v1 format - string date
  res.json({
    ...result,
    created_at: result.created_at.toLocaleString()
  });
});

// src/routes/v2/results.js (nova versão)
router.get('/:id', async (req, res) => {
  const result = await dbService.getResult(req.params.id);
  
  // v2 format - ISO 8601 + timestamp
  res.json({
    ...result,
    created_at: result.created_at.toISOString(),
    created_timestamp: result.created_at.getTime()
  });
});
```

### 3. Deprecation Process

```javascript
// src/middleware/deprecation.js
const deprecationWarning = (version, sunset_date, replacement) => {
  return (req, res, next) => {
    res.set('Deprecation', 'true');
    res.set('Sunset', sunset_date);
    res.set('Link', `<${replacement}>; rel="alternate"`);
    next();
  };
};

// Usage in routes
router.get('/old-endpoint', 
  deprecationWarning('v1', '2025-06-01', '/api/v2/new-endpoint'),
  controller.method
);
```

### 4. Version Detection Middleware

```javascript
// src/middleware/apiVersion.js
const apiVersion = (req, res, next) => {
  const version = req.baseUrl.match(/\/v(\d+)/)?.[1] || '1';
  req.apiVersion = parseInt(version);
  res.set('X-API-Version', version);
  next();
};

module.exports = apiVersion;
```

## Version Lifecycle

```
┌──────────┐
│  v1.0.0  │  Launch (Dec 2024)
│  stable  │  ─┐
└──────────┘   │
               │ 6 months support
               │
┌──────────┐   │
│  v2.0.0  │  Launch (Jun 2025)
│  stable  │  ─┤
└──────────┘   │
               │ v1 deprecated
               │ 3 months migration period
               │
┌──────────┐   │
│  v1.0.0  │  Sunset (Sep 2025)
│  removed │  ─┘
└──────────┘
```

### Deprecation Timeline

1. **T-6 months:** Anunciar próxima versão e breaking changes
2. **T-3 months:** Lançar v2 em beta, manter v1 stable
3. **T-0:** Lançar v2 stable, deprecar v1
4. **T+3 months:** Remover v1, apenas v2 disponível

## Consequences

### Positivas

- ✅ **Clareza:** Versão explícita na URL
- ✅ **Backwards Compatibility:** v1 continua funcionando durante migração
- ✅ **Caching:** CDNs e proxies podem cachear por versão
- ✅ **Testing:** Fácil testar múltiplas versões simultaneamente
- ✅ **Documentation:** Cada versão tem sua própria doc

### Negativas

- ⚠️ **Code Duplication:** Manter 2+ versões = código duplicado
- ⚠️ **Maintenance:** Bug fixes precisam ser aplicados em todas versões ativas
- ⚠️ **Migration Burden:** Clientes precisam atualizar código

### Mitigações

1. **Shared Business Logic:**
   ```javascript
   // src/services/resultsService.js (shared)
   class ResultsService {
     async getResult(id) { /* core logic */ }
   }
   
   // src/controllers/v1/resultsController.js (v1 format)
   // src/controllers/v2/resultsController.js (v2 format)
   ```

2. **Automated Tests per Version:**
   ```javascript
   // tests/api/v1/results.test.js
   // tests/api/v2/results.test.js
   ```

3. **Clear Migration Guides:**
   ```markdown
   # Migrating from v1 to v2
   
   ## Breaking Changes
   1. Date format changed to ISO 8601
   2. `suite_name` renamed to `name`
   
   ## Migration Steps
   1. Update client to use `/api/v2/` endpoints
   2. Update date parsing logic
   3. Rename field references
   ```

## API Version Information Endpoint

```javascript
// GET /api
{
  "current_version": "v1",
  "supported_versions": ["v1"],
  "deprecated_versions": [],
  "versions": {
    "v1": {
      "status": "stable",
      "release_date": "2024-12-11",
      "documentation": "https://docs.qadash.com/api/v1",
      "deprecation_date": null,
      "sunset_date": null
    }
  }
}
```

## Best Practices

1. **Sempre prefixe endpoints com versão**
   ```javascript
   // ✅ Bom
   app.use('/api/v1', v1Routes);
   
   // ❌ Ruim
   app.use('/api', routes);
   ```

2. **Documente breaking changes**
   - Mantenha CHANGELOG.md atualizado
   - Anuncie mudanças com antecedência
   - Forneça migration guides

3. **Minimize breaking changes**
   - Prefira adições a remoções
   - Use campos opcionais
   - Deprecie antes de remover

4. **Suporte no mínimo 2 versões simultaneamente**
   - Dá tempo para migração
   - Reduz pressão em clientes

## References

- [Microsoft API Versioning Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#12-versioning)
- [Stripe API Versioning](https://stripe.com/docs/api/versioning)
- [Semantic Versioning](https://semver.org/)
- [REST API Versioning Best Practices](https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/)

## Revision History

- **2024-12-11:** Initial decision - URL Path Versioning with SemVer
