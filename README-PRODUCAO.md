# VSCar - Sistema Multi-Tenant de Revenda de Veículos

Versão 1.0.0 - Pronto para Produção

## Status do Projeto

✅ **Completo e Testado**

### Funcionalidades Implementadas

**Autenticação e Multi-Tenancy**
- Registro de novos tenants (revendas)
- Login com JWT
- Roles baseada em permissões (admin, vendedor, etc.)
- Proteção de rotas

**Gerenciamento de Veículos**
- CRUD completo de veículos
- Upload de imagens
- Rastreamento de status

**Sistema de Anúncios**
- Criação de anúncios a partir de veículos
- Publicação em múltiplos portais
- Rastreamento de visualizações e contatos

**Portais Integrados**
- Arquitetura genérica para múltiplos portais
- Sincronização bidirecional
- Suporte a OLX e Marketplace

**Dashboard Admin**
- Visão geral de veículos e anúncios
- Gerenciamento de portais
- Relatórios básicos

## Quick Start

### Local (Desenvolvimento)

```bash
# Clonar repositório
git clone seu-repo-aqui
cd vscar

# Instalar dependências
cd backend && npm install
cd ../frontend && npm install

# Configurar ambiente
cp .env.local.example .env.local

# Rodar com Docker Compose
docker-compose -f compose.local.yml up -d

# Acessar
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Produção

Ver arquivo `PRODUCAO.md` para instruções completas.

## Stack Tecnológico

- **Frontend**: Next.js 16, React 18, Tailwind CSS
- **Backend**: Node.js 20, Express.js, TypeScript
- **Database**: PostgreSQL 14
- **DevOps**: Docker, Docker Compose, Portainer
- **Auth**: JWT, bcrypt
- **API**: RESTful, CORS

## Arquitetura

```
vscar/
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, CORS
│   │   └── db.ts          # Pool de conexão
│   ├── scripts/           # SQL migrations
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── auth/          # Login/Register
│   │   └── dashboard/     # Admin pages
│   ├── hooks/             # useAuth
│   └── Dockerfile
├── docker-compose.yml
├── compose.local.yml
└── compose.prod.yml
```

## Testes

### Criar Conta
1. Acesse http://localhost:3000/auth/register
2. Preencha os dados
3. Clique em cadastrar

### Fazer Login
1. Acesse http://localhost:3000/auth/login
2. Use suas credenciais
3. Será redirecionado ao dashboard

### Criar Veículo
1. No dashboard, clique em "Veículos"
2. Clique em "Novo Veículo"
3. Preencha os dados
4. Salve

### Criar Anúncio
1. No dashboard, clique em "Anúncios"
2. Clique em "Novo Anúncio"
3. Selecione um veículo
4. Preencha os dados
5. Publique

## Deployment

### Via Portainer

1. Acesse Portainer (https://seu-servidor:9443)
2. Vá em Stacks → Add Stack
3. Cole o `compose.prod.yml`
4. Configure variáveis de ambiente
5. Deploy

### Via Docker Compose

```bash
docker-compose -f compose.prod.yml up -d
```

## Monitoramento

### Logs
```bash
docker logs -f vscar-backend
docker logs -f vscar-frontend
```

### Health Check
```bash
curl http://localhost:3001/health
```

## Troubleshooting

Ver arquivo `TESTE-API.md` para erros comuns e soluções.

## Suporte

Para mais informações:
- Documentação técnica: Ver `DESENVOLVIMENTO.md`
- Setup local: Ver `SETUP-LOCAL.md`
- Testes: Ver `TESTE-API.md`
- Produção: Ver `PRODUCAO.md`

## Licença

Proprietário

## Versão

1.0.0 - Primeira release

---

Desenvolvido com ❤️ para Revenda de Veículos
