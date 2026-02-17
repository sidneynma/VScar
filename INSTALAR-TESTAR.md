# Guia Completo - Instalar e Testar VSCar Localmente

## Pré-requisitos

Certifique-se de ter instalado:
- **Node.js 20+** - https://nodejs.org/
- **Docker Desktop** - https://www.docker.com/products/docker-desktop
- **Git** - https://git-scm.com/
- **PostgreSQL 14+** (já rodando no Windows)
- **VSCode** - https://code.visualstudio.com/

## Passo 1: Clonar/Abrir o Projeto no VSCode

```bash
# Se ainda não tem o projeto, clone:
git clone <seu-repo> vscar
cd vscar

# Ou se já tem, abra no VSCode:
code .
```

## Passo 2: Criar Banco de Dados PostgreSQL

Abra o terminal (Ctrl + `) e execute:

```bash
# Conectar ao PostgreSQL
psql -U postgres -h localhost

# Criar banco de dados
CREATE DATABASE vscar_db;
CREATE USER vscar_user WITH PASSWORD 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE vscar_db TO vscar_user;

# Sair
\q
```

## Passo 3: Verificar o .env.local

Certifique-se que o arquivo `.env.local` está configurado corretamente:

```bash
# Variáveis de Banco de Dados
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=vscar_db
DB_USER=vscar_user
DB_PASSWORD=senha_segura_aqui
DATABASE_URL=postgresql://vscar_user:senha_segura_aqui@host.docker.internal:5432/vscar_db

# Backend
BACKEND_PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_PORT=3000

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_minimo_32_caracteres

# OLX API (deixar em branco por enquanto)
OLX_API_KEY=
OLX_API_BASE_URL=https://api.olx.com.br
```

## Passo 4: Instalar Dependências Backend

No terminal do VSCode:

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Voltar para raiz
cd ..
```

## Passo 5: Instalar Dependências Frontend

```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Voltar para raiz
cd ..
```

## Passo 6: Executar Migrations (Criar Tabelas)

```bash
# Conectar ao PostgreSQL
psql -U vscar_user -h localhost -d vscar_db

# Copiar e colar o conteúdo de backend/scripts/init.sql
# Ou executar direto:
\i backend/scripts/init.sql

# Sair
\q
```

**Alternativa (se preferir executar pelo psql):**

```bash
psql -U vscar_user -h localhost -d vscar_db -f backend/scripts/init.sql
```

## Passo 7: Subir o Docker Compose Local

Com o Docker Desktop aberto, execute:

```bash
docker-compose -f compose.local.yml up -d
```

Isso vai subir:
- **Backend** em http://localhost:3001
- **Frontend** em http://localhost:3000

Verificar se está rodando:

```bash
docker-compose -f compose.local.yml ps
```

## Passo 8: Testar a Aplicação

### Opção 1: Frontend (Recomendado para começar)

1. Abra http://localhost:3000 no navegador
2. Veja se carrega a página inicial
3. Clique em "Login" ou "Cadastro"

### Opção 2: Testar Backend com Insomnia/Postman

1. **Baixe Insomnia** ou **Postman**
2. **Crie uma requisição POST** para:
   ```
   POST http://localhost:3001/api/auth/signup
   Content-Type: application/json

   {
     "email": "teste@example.com",
     "password": "Senha@123",
     "name": "Teste User"
   }
   ```
3. Você deve receber um token JWT

### Opção 3: Ver Logs no VSCode

Abra 2 terminais no VSCode (Ctrl + Shift + `):

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Agora você verá os logs em tempo real enquanto testa.

## Passo 9: Parar a Aplicação

```bash
# Parar Docker Compose
docker-compose -f compose.local.yml down

# Parar Node.js nos terminais
Ctrl + C (em cada terminal)
```

## Troubleshooting

### Erro: "Connection refused at 127.0.0.1:5432"
- Certifique-se que PostgreSQL está rodando no Windows
- Verifique se `DB_HOST=host.docker.internal` está correto no `.env.local`

### Erro: "Port 3000 already in use"
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000    # Windows (depois kill PID)
```

### Erro: "Cannot find module 'express'"
```bash
cd backend
npm install
npm run dev
```

### Erro: "Database vscar_db does not exist"
Volte ao Passo 2 e crie o banco de dados.

## Estrutura do Projeto

```
vscar/
├── backend/               # API Node.js + Express
│   ├── src/
│   │   ├── index.ts       # Servidor principal
│   │   ├── db.ts          # Conexão PostgreSQL
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── scripts/
│   │   └── init.sql       # Migrations
│   └── package.json
├── frontend/              # App Next.js 16
│   ├── app/
│   ├── components/
│   ├── pages/
│   └── package.json
├── .env.local             # Variáveis de ambiente
├── compose.local.yml      # Docker para dev local
└── docker-compose.yml     # Docker para produção
```

## Próximos Passos

1. Explore o dashboard em http://localhost:3000
2. Crie uma revenda e teste o CRUD
3. Adicione veículos e anúncios
4. Sincronize com portais (OLX)

Boa sorte! 🚀
