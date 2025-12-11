# ADR-005: Authentication Strategy

**Status:** Proposed  
**Date:** 2024-12-11  
**Decision Makers:** Security Lead, Backend Architect  
**Tags:** #security #auth #jwt

## Context

O QADash atualmente não possui autenticação implementada. Para evolução para nível Senior QA, precisamos de um sistema de autenticação robusto que:

- Proteja endpoints sensíveis (export, schedules, admin)
- Suporte diferentes níveis de acesso (viewer, qa, admin)
- Seja escalável para múltiplos times/projetos
- Integre com SSO corporativo (futuro)

### Requisitos

1. **Segurança:**
   - Tokens com expiração
   - Proteção contra CSRF
   - Rate limiting em endpoints de auth

2. **Usabilidade:**
   - Login único (SSO ready)
   - Refresh tokens para sessões longas
   - Remember me opcional

3. **Performance:**
   - Validação rápida (<10ms)
   - Stateless para horizontal scaling
   - Cache de permissões

### Alternativas Consideradas

1. **JWT (JSON Web Tokens)**
   - ✅ Stateless - não precisa armazenar sessões no servidor
   - ✅ Escalável - funciona em múltiplas instâncias sem sync
   - ✅ Padrão da indústria - bibliotecas maduras
   - ⚠️ Tokens não podem ser revogados facilmente
   - ⚠️ Payload visível (base64, não criptografado)

2. **Session-based (Cookie + Redis)**
   - ✅ Controle total - pode invalidar sessões instantaneamente
   - ✅ Seguro - sessão ID não expõe dados
   - ⚠️ Stateful - precisa Redis para múltiplas instâncias
   - ⚠️ Mais complexo - gerenciamento de sessões

3. **OAuth 2.0 / OpenID Connect**
   - ✅ Padrão corporativo - integra com Google, Azure AD
   - ✅ Delegação de autenticação
   - ⚠️ Complexo para MVP
   - ⚠️ Dependência de provedor externo

4. **Passport.js + Strategies**
   - ✅ Flexível - múltiplas estratégias
   - ✅ Comunidade grande
   - ⚠️ Over-engineered para necessidades atuais

## Decision

**Escolhemos JWT com Refresh Tokens** para autenticação inicial, com arquitetura preparada para migração futura para OAuth 2.0.

### Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client    │────▶│ Auth Service │────▶│   Database   │
│  (Browser)  │◀────│  (Express)   │◀────│   (SQLite)   │
└─────────────┘     └──────────────┘     └──────────────┘
      │ JWT                  │                    │
      │ Access Token         │ Verify JWT         │ User lookup
      │ Refresh Token        │ Generate Tokens    │ Store tokens
      └──────────────────────┴────────────────────┘
```

### Token Structure

**Access Token (Short-lived: 15 minutes)**
```json
{
  "sub": "user-id-123",
  "email": "qa@example.com",
  "role": "qa",
  "permissions": ["read:results", "write:results", "export:data"],
  "iat": 1702300000,
  "exp": 1702300900
}
```

**Refresh Token (Long-lived: 7 days)**
```json
{
  "sub": "user-id-123",
  "type": "refresh",
  "iat": 1702300000,
  "exp": 1702905600
}
```

### User Roles

| Role | Permissions | Use Case |
|------|------------|----------|
| **viewer** | read:results, read:trends | Visualizar dashboards |
| **qa** | viewer + write:results, write:failures | Enviar resultados de testes |
| **admin** | qa + manage:users, manage:schedules | Gerenciar sistema |

## Implementation

### 1. Dependencies

```bash
npm install jsonwebtoken bcrypt express-validator
```

### 2. Auth Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

### 3. Protected Routes

```javascript
// src/routes/api.js
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);

// Protected routes - require authentication
router.use(authenticateToken);

router.get('/results', resultsController.getResults);
router.post('/results', requireRole(['qa', 'admin']), resultsController.saveResult);
router.post('/export', requireRole(['qa', 'admin']), exportController.exportData);
router.post('/schedules', requireRole(['admin']), scheduleController.createSchedule);
```

### 4. Environment Variables

```env
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Consequences

### Positivas

- ✅ **Stateless:** Não precisa Redis/session store inicialmente
- ✅ **Escalável:** Funciona em múltiplas instâncias sem configuração extra
- ✅ **Flexível:** Fácil adicionar OAuth posteriormente
- ✅ **Performance:** Validação local de JWT é rápida (<5ms)
- ✅ **Mobile-ready:** JWT funciona nativamente em apps mobile

### Negativas

- ⚠️ **Token Revocation:** Precisa blacklist para logout forçado
- ⚠️ **Token Size:** JWT pode ser grande (~200-500 bytes)
- ⚠️ **Security:** Secret precisa ser rotacionado periodicamente

### Mitigações

1. **Token Revocation:**
   - Implementar blacklist em Redis para tokens revogados
   - Access tokens curtos (15min) minimizam janela de risco

2. **Token Rotation:**
   - Refresh tokens geram novos access tokens
   - Rotate refresh tokens a cada uso (sliding window)

3. **Security Best Practices:**
   - HTTPS obrigatório em produção
   - HttpOnly cookies para refresh tokens
   - CSRF protection com SameSite=Strict

## Migration Path

### Phase 1 (Current): JWT Básico
- Login com email/senha
- Access + Refresh tokens
- 3 roles: viewer, qa, admin

### Phase 2 (Q1 2025): Enhanced Security
- Blacklist de tokens em Redis
- 2FA opcional (TOTP)
- Audit log de acessos

### Phase 3 (Q2 2025): OAuth Integration
- Google Workspace SSO
- Azure Active Directory
- Manter JWT como fallback

## Security Checklist

- [ ] JWT secret min 32 caracteres aleatórios
- [ ] HTTPS obrigatório em produção
- [ ] Rate limiting em /auth/login (5 req/hour)
- [ ] Password hashing com bcrypt (rounds=12)
- [ ] Refresh tokens em HttpOnly cookies
- [ ] CORS configurado corretamente
- [ ] Input validation com express-validator
- [ ] SQL injection protection (prepared statements)

## References

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT vs Sessions](https://stackoverflow.com/questions/43452896/authentication-jwt-usage-vs-session)

## Revision History

- **2024-12-11:** Initial proposal - JWT with Refresh Tokens
