# Testando Conexão com Banco de Dados

## 1. Verificar Status do Backend

```bash
curl http://localhost:3001/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-09T20:00:00.000Z",
  "database": "connected",
  "query_result": {
    "now": "2024-01-09T20:00:00.000Z"
  }
}
```

Se retornar erro, o banco NÃO está acessível.

## 2. Verificar Tabelas Criadas

```bash
curl http://localhost:3001/debug/tables
```

**Resposta esperada:**
```json
{
  "tables": [
    { "table_name": "tenants" },
    { "table_name": "users" },
    { "table_name": "revendas" },
    { "table_name": "vehicles" },
    { "table_name": "announcements" },
    ...
  ],
  "count": 10
}
```

Se retornar `count: 0`, as tabelas não foram criadas.

## 3. Verificar Dados no Banco

```bash
curl http://localhost:3001/debug/stats
```

**Resposta esperada:**
```json
{
  "stats": {
    "tenants": 0,
    "users": 0,
    "revendas": 0,
    "vehicles": 0,
    "announcements": 0
  },
  "timestamp": "2024-01-09T20:00:00.000Z"
}
```

## 4. Acessar Direto no PostgreSQL

```bash
# Entrar no container
docker exec -it vscar-postgres bash

# Conectar ao banco
psql -U postgres -d vscar_db

# Ver todas as tabelas
\dt

# Contar registros de cada tabela
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM vehicles;

# Sair
\q
```

## 5. Testar Criação de Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_name": "Minha Revenda",
    "tenant_slug": "minha-revenda",
    "name": "João Silva",
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Tenant and user created successfully",
  "tenant_id": "uuid-aqui",
  "user_id": "uuid-aqui",
  "token": "jwt-token-aqui"
}
```

## 6. Testar Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

## Checklist de Diagnóstico

- [ ] `/health` retorna `"database": "connected"`
- [ ] `/debug/tables` retorna lista de tabelas
- [ ] `/debug/stats` retorna contadores > 0
- [ ] `psql` conecta sem erros
- [ ] Registro de novo usuário funciona
- [ ] Login retorna JWT token

Se algum teste falhar, execute:
```bash
docker-compose -f compose.local.yml logs backend
```

Para ver os erros do backend.
