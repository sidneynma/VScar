# VSCar - Guia de Configuração

Este é um **projeto monorepo** com backend Node.js e frontend Next.js, projetado para rodar em **Docker**.

## Estrutura do Projeto

```
vscar/
├── backend/              # API Express + Node.js
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── index.ts
│   ├── scripts/
│   ├── package.json
│   └── Dockerfile
│
├── frontend/             # Next.js 16 + React 19
│   ├── app/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml    # Orquestração
├── .env.local           # Variáveis de ambiente
└── README.md
```

## Instalação e Execução

### Opção 1: Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone <seu-repo>
cd vscar

# Inicie os containers
docker-compose up -d

# Pronto! O sistema estará disponível em:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - Database: localhost:5432
```

### Opção 2: Desenvolvimento Local

**Backend:**
```bash
cd backend
npm install
npm run dev
# Rodando em http://localhost:3001
```

**Frontend (em outro terminal):**
```bash
cd frontend
npm install
npm run dev
# Rodando em http://localhost:3000
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Database
DB_USER=vscar_user
DB_PASSWORD=vscar_password
DB_NAME=vscar_db
DB_PORT=5432

# Backend
NODE_ENV=development
API_PORT=3001
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_PORT=3000
```

## Primeiro Uso

1. **Acesse** http://localhost:3000
2. **Cadastre-se** com uma nova empresa
3. **Faça login** com suas credenciais
4. **Comece a adicionar** veículos e anúncios

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo tenant
- `POST /api/auth/login` - Fazer login

### Revendas
- `GET /api/revendas` - Listar revendas
- `POST /api/revendas` - Criar revenda
- `PUT /api/revendas/:id` - Editar revenda

### Veículos
- `GET /api/vehicles` - Listar veículos
- `POST /api/vehicles` - Criar veículo
- `GET /api/vehicles/:id` - Detalhes do veículo
- `PUT /api/vehicles/:id` - Editar veículo
- `POST /api/vehicles/:id/images` - Upload de imagens

### Anúncios
- `GET /api/announcements` - Listar anúncios
- `POST /api/announcements` - Criar anúncio
- `PUT /api/announcements/:id` - Editar anúncio

### Portais (OLX, Marketplace)
- `GET /api/portals` - Listar portais
- `POST /api/portals` - Conectar novo portal
- `POST /api/portals/:id/sync/:announcement_id` - Sincronizar anúncio
- `DELETE /api/portals/:id/sync/:announcement_id` - Desincronizar anúncio

## Deployment com Portainer

### Passo 1: Exportar Configuração
```bash
docker-compose config > docker-compose.prod.yml
```

### Passo 2: Portainer Stack
1. Acesse seu Portainer
2. Vá para **Stacks** → **Add Stack**
3. Selecione **Upload** e escolha `docker-compose.prod.yml`
4. Configure as variáveis de ambiente
5. Clique em **Deploy**

### Variáveis de Produção
```bash
NODE_ENV=production
JWT_SECRET=mude_para_uma_chave_segura_aqui
DB_PASSWORD=mude_para_senha_segura
NEXT_PUBLIC_API_URL=https://seu-dominio.com/api
```

## Banco de Dados

O PostgreSQL é inicializado automaticamente com:
- 13 tabelas otimizadas
- Índices para performance
- Sistema completo de multi-tenancy

### Acesso direto ao banco (opcional)
```bash
docker exec -it vscar-postgres psql -U vscar_user -d vscar_db

# Dentro do psql:
\dt                    # Listar tabelas
\d tenants            # Descrever tabela
SELECT * FROM users;  # Query exemplo
```

## Troubleshooting

### Porta 3000/3001 já em uso
```bash
# Mudar porta no .env.local
FRONTEND_PORT=3002
API_PORT=3002
```

### Erro de conexão com banco de dados
```bash
# Verificar logs
docker-compose logs postgres
docker-compose logs backend

# Reiniciar
docker-compose down
docker-compose up -d
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker volume rm vscar_postgres_data
docker-compose up -d
```

## Integração com OLX

Para sincronizar anúncios com OLX:

1. Vá para **Dashboard** → **Portais**
2. Clique em **Conectar Portal**
3. Selecione **OLX** e adicione suas credenciais
4. Ao criar um anúncio, escolha sincronizar com OLX

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte o README.md
3. Abra uma issue no repositório

---

**VSCar v1.0.0** - Sistema de Revenda de Veículos SaaS
