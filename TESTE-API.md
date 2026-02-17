# Teste da API VSCar

## 1. Criar Conta (Registro)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_name": "Minha Revenda",
    "tenant_slug": "minha-revenda",
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123456"
  }'
```

Resposta esperada:
```json
{
  "message": "Tenant and user created successfully",
  "tenant": { "id": "...", "name": "Minha Revenda", "slug": "minha-revenda" },
  "user": { "id": "...", "email": "joao@example.com", "name": "João Silva", "role": "admin" },
  "token": "eyJhbGc..."
}
```

## 2. Fazer Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123456"
  }'
```

Resposta esperada:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { "id": "...", "email": "joao@example.com", "name": "João Silva", "role": "admin", "tenant_id": "..." }
}
```

## 3. Acessar Dashboard

Após fazer login, o token é armazenado em `localStorage` e você é redirecionado automaticamente para `/dashboard`.

## 4. Testar no Frontend

### Passo 1: Criar uma conta
1. Acesse http://localhost:3000/auth/register
2. Preencha os campos:
   - Nome da Empresa: "Minha Revenda"
   - Slug da Empresa: "minha-revenda"
   - Seu Nome: "João Silva"
   - Email: "joao@example.com"
   - Senha: "senha123456"
   - Confirmar Senha: "senha123456"
3. Clique em "Cadastrar"

### Passo 2: Fazer login
1. Acesse http://localhost:3000/auth/login
2. Preencha os campos:
   - Email: "joao@example.com"
   - Senha: "senha123456"
3. Clique em "Entrar"

### Passo 3: Acessar o Dashboard
Você será redirecionado automaticamente para o dashboard onde pode gerenciar:
- Veículos
- Anúncios
- Portais

## Troubleshooting

### "NEXT_PUBLIC_API_URL não está definido"
Certifique-se de que o arquivo `frontend/.env.local` contém:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### "Erro ao conectar com o backend"
Verifique se:
1. Backend está rodando: `docker-compose -f compose.local.yml ps`
2. PostgreSQL está acessível
3. Variáveis de ambiente estão corretas em `.env.local`

### "Email já cadastrado"
Use um email diferente ou delete os dados do banco de dados e recrie.

## Próximos Passos

Após testar a autenticação, você pode:
1. Criar veículos
2. Criar anúncios
3. Sincronizar com portais (OLX, Marketplace)
