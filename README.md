# VSCar - Sistema de Revenda de Veículos SaaS

Um sistema completo e escalável para gerenciamento de revendas de veículos com suporte a múltiplos portais de anúncios.

## Tecnologias

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express, TypeScript
- **Database**: PostgreSQL 14
- **Containerização**: Docker, Docker Compose

## Iniciando Localmente

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20+ (opcional para desenvolvimento local)

### Passo 1: Clonar o repositório

```bash
git clone <seu-repositorio>
cd vscar
```

### Passo 2: Configurar variáveis de ambiente

```bash
cp .env.local .env.local.example
# Editar .env.local com suas configurações
```

### Passo 3: Iniciar com Docker Compose

```bash
docker-compose up -d
```

Isso irá:
- Criar o banco PostgreSQL
- Executar as migrations
- Iniciar o backend na porta 3001
- Iniciar o frontend na porta 3000

### Passo 4: Acessar a aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Banco de dados: localhost:5432

## Estrutura do Projeto

```
vscar/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── routes/  # Endpoints da API
│   │   ├── middleware/
│   │   └── index.ts
│   ├── scripts/      # Scripts SQL
│   └── Dockerfile
├── frontend/         # Next.js App
│   ├── app/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── layout.tsx
│   └── Dockerfile
├── docker-compose.yml
├── .env.local
└── README.md
```

## Filas de Desenvolvimento

### Backend
1. Setup do PostgreSQL e Docker Compose ✓
2. Autenticação JWT multi-tenant ✓
3. CRUD Revendas, Veículos e Anúncios ✓
4. Sistema de Portais genérico ✓
5. Integração OLX (API genérica)
6. Sistema de contatos e leads
7. Relatórios e analytics
8. Upload de imagens

### Frontend
1. Autenticação e login ✓
2. Dashboard principal ✓
3. CRUD Veículos
4. CRUD Anúncios
5. Gerenciamento de Portais
6. Relatórios e dashboard de dados
7. Upload de imagens em massa
8. Interface responsiva completa

## Deployment com Portainer

### Passo 1: Exportar Docker Compose

```bash
docker-compose config > docker-compose.prod.yml
```

### Passo 2: No Portainer

1. Vá para Stacks
2. Clique em "Add Stack"
3. Selecione "Upload" e faça upload do arquivo docker-compose.prod.yml
4. Configure as variáveis de ambiente
5. Deploy

## API Endpoints

### Auth
- \`POST /api/auth/register\` - Registrar novo tenant
- \`POST /api/auth/login\` - Login

### Tenants
- \`GET /api/tenants/me\` - Dados do tenant
- \`PUT /api/tenants/me\` - Atualizar tenant

### Usuários
- \`GET /api/users\` - Listar usuários
- \`POST /api/users\` - Criar usuário
- \`PUT /api/users/:id\` - Atualizar usuário

### Revendas
- \`GET /api/revendas\` - Listar revendas
- \`POST /api/revendas\` - Criar revenda
- \`PUT /api/revendas/:id\` - Atualizar revenda

### Veículos
- \`GET /api/vehicles\` - Listar veículos
- \`POST /api/vehicles\` - Criar veículo
- \`GET /api/vehicles/:id\` - Obter detalhes
- \`PUT /api/vehicles/:id\` - Atualizar veículo

### Anúncios
- \`GET /api/announcements\` - Listar anúncios
- \`POST /api/announcements\` - Criar anúncio
- \`PUT /api/announcements/:id\` - Atualizar anúncio

### Portais
- \`GET /api/portals\` - Listar portais
- \`POST /api/portals\` - Criar portal
- \`POST /api/portals/:id/sync\` - Sincronizar com portal

## Contribuindo

1. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
2. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
3. Push para a branch (\`git push origin feature/AmazingFeature\`)
4. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License.
```
