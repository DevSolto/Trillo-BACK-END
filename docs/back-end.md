# Banco de Dados e API — Guia para Frontend

## Visão Geral

- Banco: Postgres via TypeORM.
- Entidades: User, Association, Task.
- IDs: UUID v4. Em User, o `id` não é gerado pelo banco (vem do JWT ou seed).
- Autenticação: JWT Bearer em todas as rotas (salvo handlers com `@Public()`).
- Documentação interativa: `GET /docs` (Swagger) — use o botão Authorize com Bearer.

## Enums

- UserRole: `admin` | `editor`
- TaskStatus: `open` | `inProgress` | `finished` | `canceled`
- TaskPriority: `low` | `medium` | `high`

## Relacionamentos

```
User 1 ──< createdTasks >──* Task *──< team >──* User
                     \
                      \── many-to-one ──> Association 1 ──< tasks >──* Task
```

- Task.creator: obrigatório (N:1 com User)
- Task.association: obrigatório (N:1 com Association, onDelete: CASCADE)
- Task.team: N:M com User através da tabela `task_team_users` (`task_id`, `user_id`)

## Schemas das Entidades

### User

- id: uuid (PK, exigido)
- name: string
- email: string (único)
- role: `admin` | `editor` (default `editor`)

### Association

- id: uuid (PK, gerado)
- name: string
- cnpj: string (validação no DTO: 14 dígitos ou `00.000.000/0000-00`)
- status: boolean (default true)

### Task

- id: uuid (PK, gerado)
- title: string
- description: string (text)
- status: TaskStatus (default `open`)
- priority: TaskPriority (default `medium`)
- createdAt: timestamptz (auto)
- dueDate: timestamptz | null
- creator: User (obrigatório)
- association: Association (obrigatório; onDelete CASCADE)
- team: User[] (N:M via `task_team_users`)

## Endpoints Principais

Base URL local (ajuste conforme `.env`):

- Exemplo: `http://localhost:3001` (se `PORT=3001`)

Inclua `Authorization: Bearer <TOKEN>` nos headers.

### User

- POST `/user` — cria usuário
  - Body: `{ name, email, role }`
  - Observação: `id` vem do token (claim `sub`) e é associado no backend.
- GET `/user` — lista paginada
  - Filtros: `name`, `email`, `role`
  - Paginação: `page`, `limit`
  - Ordenação: `sortBy` ∈ `id,name,email,role`; `sortOrder` ∈ `ASC, DESC`
- GET `/user/id/:id`
- GET `/user/email/:email`
- PATCH `/user/:id`
- DELETE `/user/:id`

### Association

- POST `/association` — `{ name, cnpj, status? }`
- GET `/association` — filtros/ordenação: `id,name,cnpj,status`; paginação padrão
- GET `/association/id/:id`
- GET `/association/cnpj/:cnpj`
- PATCH `/association/:id`
- DELETE `/association/:id`

### Task

- POST `/task`
  - Body obrigatório mínimo:
    ```json
    {
      "title": "...",
      "description": "...",
      "creatorId": "<uuid>",
      "associationId": "<uuid>",
      "teamIds": []
    }
    ```
  - Opcionais: `status`, `dueDate` (ISO 8601)
  - Opcionais adicionais: `priority` ∈ `low | medium | high`
- GET `/task` — lista paginada com relações (`creator`, `association`, `team`)
  - Filtros: `title`, `status`, `priority`, `creatorId`, `associationId`
  - Paginação: `page`, `limit`
  - Ordenação: `sortBy` ∈ `id,title,status,priority,createdAt,dueDate`; `sortOrder` ∈ `ASC, DESC`
- GET `/task/:id`
- PATCH `/task/:id` — permite alterar `title`, `description`, `status`, `priority`, `dueDate`, `creatorId`, `associationId`, `teamIds`
- DELETE `/task/:id`

## Formatos de Resposta

### Paginação (ex.: GET `/task`)

```json
{
  "items": [
    {
      "id": "e1d...",
      "title": "Organize monthly meeting",
      "description": "...",
      "status": "open",
      "createdAt": "2025-09-14T12:34:56.789Z",
      "dueDate": null,
      "creator": { "id": "<uuid>", "name": "...", "email": "...", "role": "editor" },
      "association": { "id": "<uuid>", "name": "...", "cnpj": "...", "status": true },
      "team": [ { "id": "<uuid>", "name": "...", "email": "...", "role": "editor" } ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pageCount": 1
}
```

### Task (GET `/task/:id`)

```json
{
  "id": "e1d...",
  "title": "...",
  "description": "...",
  "status": "open",
  "priority": "medium",
  "createdAt": "2025-09-14T12:34:56.789Z",
  "dueDate": null,
  "creator": { "id": "<uuid>", "name": "...", "email": "...", "role": "editor" },
  "association": { "id": "<uuid>", "name": "...", "cnpj": "...", "status": true },
  "team": []
}
```

## Autenticação

- Header: `Authorization: Bearer <TOKEN>`
- Claims lidas:
  - `sub` → `userId`
- `email` → `userEmail`
- Login local está desativado. Use:
  - Token do Supabase (defina `SUPABASE_JWT_SECRET` no backend), ou
  - Token HS256 assinado com `JWT_SECRET` do backend (para desenvolvimento).

## Seeding e Dados de Desenvolvimento

- Reset/seed automático no start quando `RESET_DB_ON_START=true` (default em não‑produção).
- Fonte: `db/seed.json`. Se ausente, usa `db/seed.template.json`.
- Ordem de carga: `associations` → `users` → `tasks`.
- Convenções:
  - `users[].id` é obrigatório (User usa `@PrimaryColumn` sem geração automática).
  - `tasks[]` devem referenciar `creatorId` e `associationId` válidos.
  - `teamIds` pode ser vazio. Usuários referenciados inexistentes são criados como stubs (`role: editor`).
  - Em `tasks[]`, `status` e `priority` são opcionais (defaults: `open` e `medium`).

### Exemplo mínimo de seed (`db/seed.json`)

```json
{
  "associations": [
    { "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "name": "Assoc Demo", "cnpj": "12.345.678/0001-90", "status": true }
  ],
  "users": [
    { "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "name": "Alice", "email": "alice@example.com", "role": "editor" }
  ],
  "tasks": [
    {
      "title": "Tarefa inicial",
      "description": "Descriçao",
      "creatorId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "associationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "teamIds": []
    }
  ]
}
```

## Erros Comuns

- 401 Unauthorized: token ausente/inválido.
- 400 Bad Request: validações dos DTOs (mensagens detalhadas no corpo).
- 404 Not Found: id não encontrado.
- 409 Conflict: e‑mail de usuário duplicado.

## Notas para Integração

- Criação de User depende do `sub` presente no JWT. O backend usa esse `sub` como `id` do User.
- Para criar Task, sempre enviar `associationId` além de `creatorId`.
- Use `/docs` para explorar e testar contratos com o token atual (persist Authorization habilitado).
- Correlação de logs: todas as respostas incluem o header `x-request-id`. Reencaminhe este header em chamadas subsequentes para facilitar troubleshooting.

## Enums públicos

- `GET /enums/priorities` → lista de prioridades da Task (`low | medium | high`).
- `GET /enums/task-status` → lista de status da Task.
