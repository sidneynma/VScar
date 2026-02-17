# Setup Local - VSCar Revenda de Veículos

## Pré-requisitos

- Docker Desktop instalado
- PostgreSQL 14+ rodando no Windows (localhost:5432)
- Node.js 20+ (opcional, se rodar sem Docker)

## Configuração do Banco de Dados Local

### 1. PostgreSQL no Windows

Certifique-se que seu PostgreSQL está rodando. Você pode verificar:

```bash
psql -U postgres -h localhost -c "SELECT version();"
```

### 2. Criar banco de dados

```bash
# Com psql
psql -U postgres -h localhost

# Dentro do psql
CREATE DATABASE vscar_db;
```

### 3. Executar migrations

```bash
# Copie o arquivo SQL e execute
psql -U postgres -h localhost -d vscar_db -f backend/scripts/init.sql
```

## Iniciar com Docker Compose Local

```bash
# Subir apenas Backend e Frontend (sem PostgreSQL)
docker-compose -f compose.local.yml up -d

# Verificar logs
docker-compose -f compose.local.yml logs -f

# Parar
docker-compose -f compose.local.yml down
```

## Acessar

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Credenciais Padrão

```
Username: admin@vscar.com
Password: admin123
```

## Troubleshooting

### Erro: "host.docker.internal" não resolve
- **Solução**: Use `host.docker.internal` (Windows/Mac) ou `172.17.0.1` (Linux)

### Erro: PostgreSQL connection refused
- Verificar se PostgreSQL está rodando no Windows
- Verificar credenciais em `.env.local`

### Limpar e recomeçar

```bash
# Remove containers e volumes
docker-compose -f compose.local.yml down -v

# Recria tudo
docker-compose -f compose.local.yml up -d
