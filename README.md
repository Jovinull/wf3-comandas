# WF3 Comandas — Backend (AdonisJS v6 + PostgreSQL)

Backend SaaS multi-tenant para restaurantes. **Um único backend** atende múltiplos restaurantes e **o isolamento é garantido** por:
- Usuário autenticado via **JWT** (Bearer)
- Middleware `authJwt` carrega `ctx.authUser`
- Middleware `tenant` injeta `ctx.tenant = { restaurantId }`
- **Todas as queries** filtram por `restaurantId` do token (nunca do client)

## Stack
- AdonisJS v6 + TypeScript
- PostgreSQL + Lucid ORM
- VineJS Validators
- JWT (jsonwebtoken)
- RBAC: `MANAGER` e `WAITER`

## Como rodar
1) Instale dependências:
```bash
npm install
````

2. Configure `.env` (use `.env.example` como base)

3. Rode migrations e seed:

```bash
npm run migration:run
npm run db:seed
```

4. Suba o servidor:

```bash
npm run dev
```

## Env vars importantes

* `JWT_SECRET`: segredo forte do JWT
* `JWT_EXPIRES_IN`: ex `7d`
* `CORS_ORIGINS`: origens permitidas (CSV)
* `DEFAULT_SEED_PASSWORD`: senha usada no seed demo

## Seed demo (SaaS)

Cria 2 restaurantes:

* Restaurante 1: `gestor@restaurante1.com` / `garcom@restaurante1.com`
* Restaurante 2: `gestor@restaurante2.com` / `garcom@restaurante2.com`

Senha: `DEFAULT_SEED_PASSWORD`

## Auth

* `POST /api/auth/login` -> retorna `{ token, user }`
* `GET /api/auth/me` -> retorna usuário e restaurant do token
* `POST /api/auth/logout` -> **não revoga** JWT (stateless). No frontend basta apagar o token.

> Se futuramente você quiser “revogação”, implemente refresh token + blacklist (exige storage e regras). Mantive simples e robusto.

## Fluxo operacional “Seleção do garçom”

Mesmo com login do usuário WAITER:

* o front seleciona `operationalWaiterId` (da tabela `waiters`)
* ao criar pedido, o backend valida:

  * waiter existe
  * pertence ao mesmo `restaurantId`
  * está ativo

## Concorrência: “apenas 1 comanda ABERTA por mesa”

Garantias:

1. Transaction + lock (`SELECT ... FOR UPDATE`) na `tables`
2. Partial unique index no Postgres:

   * unique (restaurant_id, table_id) WHERE status='OPEN'
3. Se ocorrer corrida, o backend trata conflito e reconsulta a comanda aberta.

## Exemplos rápidos (curl)

### Login

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gestor@restaurante1.com","password":"12345678"}'
```

Guarde o token e use:
`Authorization: Bearer <TOKEN>`

### Menu

```bash
curl http://localhost:3333/api/operational/menu \
  -H "Authorization: Bearer <TOKEN>"
```

### Criar pedido (abre comanda automaticamente)

```bash
curl -X POST http://localhost:3333/api/operational/tables/<TABLE_ID>/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "operationalWaiterId":"<WAITER_ID>",
    "note":"Sem cebola",
    "items":[{"productId":"<PRODUCT_ID>","quantity":2}]
  }'
```

---

## Guia rápido de teste (10 passos)

1. Login gestor restaurante1 e pegue token
2. Login gestor restaurante2 e pegue token
3. Com token R1: `GET /api/operational/waiters` (deve listar apenas waiters do R1)
4. Com token R2: `GET /api/operational/waiters` (apenas do R2)
5. Com token R1: `GET /api/operational/menu` (menu do R1)
6. Com token R1: `GET /api/operational/overview` (mesas do R1)
7. Com token R1: `POST /api/operational/tables/:tableId/orders` com `operationalWaiterId` válido do R1
8. `GET /api/operational/print-jobs/pending` (deve aparecer)
9. `POST /api/operational/print-jobs/:id/printed` (marca impresso)
10. Tente acessar id de recurso do outro restaurante (ex: waiterId de R2 usando token R1) -> deve retornar 404/403 (isolamento)
