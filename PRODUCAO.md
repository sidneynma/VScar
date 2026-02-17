# Deploy do VSCar em Produção com Portainer

## 1. Preparação do Servidor

### Requisitos
- Docker 20.10+
- Docker Compose 2.0+
- Portainer (instalado via Docker)
- PostgreSQL 14+ (pode estar no mesmo servidor ou remoto)

### Instalar Portainer

```bash
docker run -d -p 8000:8000 -p 9443:9443 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Acesse: https://seu-servidor:9443

## 2. Preparar Variáveis de Ambiente

Crie um arquivo `.env.production` com as seguintes variáveis:

```bash
# Backend
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://usuario:senha@seu-postgres:5432/vscar_db
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=https://sua-api.com.br
```

## 3. Preparar Docker Compose para Produção

Crie um arquivo `compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: seu-registry/vscar-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - API_PORT=3001
      - DATABASE_URL=postgresql://usuario:senha@postgres:5432/vscar_db
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
    depends_on:
      - postgres
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: seu-registry/vscar-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://sua-api.com.br
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=vscar_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=vscar_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vscar_user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## 4. Deploy via Portainer

### Passo 1: Fazer Login no Portainer
1. Acesse https://seu-servidor:9443
2. Faça login com suas credenciais

### Passo 2: Criar uma Stack
1. Vá em "Stacks" → "Add stack"
2. Cole o conteúdo do `compose.prod.yml`
3. Configure as variáveis de ambiente
4. Clique em "Deploy the stack"

### Passo 3: Monitorar
1. Vá em "Containers" para ver o status
2. Verifique os logs para erros
3. Acesse:
   - Frontend: https://seu-servidor:3000
   - Backend: https://seu-servidor:3001/health

## 5. Configurar HTTPS (SSL/TLS)

### Opção 1: Nginx Reverse Proxy

Instale Nginx e configure:

```nginx
server {
    listen 443 ssl http2;
    server_name sua-api.com.br;

    ssl_certificate /etc/letsencrypt/live/sua-api.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sua-api.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Opção 2: Caddy (Mais fácil)

```bash
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy caddy reverse-proxy --from sua-api.com.br --to localhost:3000
```

## 6. Backups Automáticos

Configure backups do banco de dados:

```bash
# Script: backup-db.sh
#!/bin/bash
BACKUP_DIR="/backups/vscar"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

docker exec postgres pg_dump -U vscar_user vscar_db | gzip > "$BACKUP_DIR/vscar_db_$TIMESTAMP.sql.gz"

# Manter apenas últimos 7 dias
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

Adicione ao crontab:
```bash
0 2 * * * /scripts/backup-db.sh
```

## 7. Monitoramento

### Logs
```bash
# Ver logs do backend
docker logs -f vscar-backend

# Ver logs do frontend
docker logs -f vscar-frontend
```

### Métricas
Acesse Portainer → Stacks → Seu Stack para ver uso de CPU e memória

## 8. Troubleshooting

### "Erro ao conectar com banco de dados"
- Verifique se PostgreSQL está rodando
- Confira a `DATABASE_URL` nas variáveis de ambiente
- Teste a conexão: `psql -U vscar_user -h seu-postgres -d vscar_db`

### "Frontend não conecta ao backend"
- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Confirme que o backend está acessível
- Verifique CORS no backend

### "Porta já está em uso"
```bash
# Liberar porta
sudo lsof -ti:3000,3001,5432 | xargs kill -9
```

## Próximos Passos

1. Configurar domínio próprio
2. Ativar SSL/TLS com Let's Encrypt
3. Configurar alertas no Portainer
4. Implementar CI/CD com GitHub Actions
5. Adicionar mais portais (Imóvel, Emprego, etc.)
