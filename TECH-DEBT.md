# Tech Debt Backlog

## Refresh Tokens & Session Management

Context: v1 usa apenas access token (JWT) com `expiresIn: 7d` e não implementa refresh. A seguir, os itens para implementação futura.

- Objetivo: reduzir TTL do access token (p.ex. 15m) e adicionar refresh token opaco com rotação e whitelist.

### Itens de Implementação
- Entidade/Tabela de sessões (`refresh_tokens` ou `sessions`):
  - Campos: `id`, `userId`, `tokenHash`, `createdAt`, `expiresAt`, `revokedAt`, `replacedBy`, `userAgent`, `ip`, `familyId`.
  - Índices: `userId`, `expiresAt`.
- Geração de refresh token opaco (ex.: `crypto.randomBytes(32).toString('base64url')`) e armazenamento hasheado (argon2/bcrypt).
- Rotação de refresh: a cada `/auth/refresh` emitir novo par (access + refresh), revogar/anotar o anterior (`replacedBy`).
- Detecção de reutilização (reuse detection): se refresh antigo for usado após rotação, revogar toda a família (todas as sessões relacionadas) e exigir re-login.
- Múltiplas sessões por dispositivo: permitir vários refresh tokens ativos por usuário, com metadados (UA/IP) e endpoints para revogar sessão atual e todas.
- Transporte do refresh: cookie `HttpOnly`, `Secure`, `SameSite=Lax` (ou `Strict`), com proteção CSRF (double-submit ou header `X-CSRF-Token`).
- TTLs configuráveis por env: `ACCESS_TTL`, `REFRESH_TTL` e `REFRESH_ROTATION_OVERLAP`.
- Ajustar `accessToken` para 10–30 minutos quando o refresh estiver ativo.

### Endpoints
- `POST /auth/refresh` (Public): lê refresh do cookie, valida sessão, roda rotação e devolve novo par de tokens.
- `POST /auth/logout` (Auth): revoga apenas a sessão atual.
- `POST /auth/logout-all` (Auth): revoga todas as sessões do usuário.

### Testes & Observabilidade
- E2E cobrindo: criação de sessão, rotação, revogação, reuse detection e múltiplas sessões.
- Logs e métricas para tentativas inválidas e reuse detection.

### Docs
- Atualizar Swagger e README com fluxos, TTLs, cookies, e exemplo de uso do header CSRF.

