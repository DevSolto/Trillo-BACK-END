---
name: Débito Técnico – Refresh Tokens e Sessões
about: Rastrear implementação de refresh token com rotação e gestão de sessões
title: "Débito Técnico: Refresh tokens e gestão de sessões"
labels: ["tech-debt", "auth", "security"]
assignees: []
---

## Resumo
Implementar refresh tokens (opacos + rotação), whitelist de sessões e reforços de segurança relacionados.

## Escopo
- Entidade/Tabela de sessões com refresh tokens hasheados
- `/auth/refresh` com rotação e detecção de reutilização (reuse detection)
- Revogação de sessão: sessão atual e global
- Cookies `HttpOnly`/`Secure` + proteção CSRF
- TTLs configuráveis via env (`ACCESS_TTL`, `REFRESH_TTL`)
- Reduzir TTL do access token para ~15 minutos quando o refresh estiver ativo

## Critérios de Aceite
- [ ] Sessões persistidas com `tokenHash` hasheado e metadados (UA/IP)
- [ ] Rotação emite novo refresh e invalida o anterior
- [ ] Reutilização detectada revoga toda a família e exige novo login
- [ ] `POST /auth/refresh` retorna novo access+refresh e define cookie
- [ ] `POST /auth/logout` revoga apenas a sessão atual
- [ ] `POST /auth/logout-all` revoga todas as sessões do usuário
- [ ] TTLs configuráveis por env; defaults documentados
- [ ] Testes E2E cobrem happy path, rotação, revogação e reuse detection
- [ ] README/Swagger atualizados com fluxos e exemplos

## Observações
A v1 atual usa apenas access token (`expiresIn: 7d`). Esta tarefa introduz access tokens de curta duração e refresh tokens de longa duração com rotação.
