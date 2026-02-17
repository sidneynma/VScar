# Guia de Desenvolvimento

## Arquitetura

### Backend
- **Framework**: Express.js
- **Auth**: JWT com multi-tenancy
- **Database**: PostgreSQL com connection pool
- **Estrutura**: Routes → Middleware → Controllers

### Frontend
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **State**: localStorage para token (melhorar com Zustand em futuro)

## Fluxo de Autenticação

```
1. User cadastra-se
   ↓
2. Tenant criado (empresa)
   ↓
3. User criado (admin do tenant)
   ↓
4. JWT retornado
   ↓
5. Token salvo no localStorage
   ↓
6. Requests autenticados com Bearer token
```

## Multi-Tenancy

Cada tenant tem seus próprios dados:
- **Revendas**: Filiais/Lojas do tenant
- **Veículos**: Inventário da revenda
- **Anúncios**: Publicações dos veículos
- **Usuários**: Time do tenant
- **Portais**: Integrações (OLX, Marketplace)

### Isolamento de Dados

Todos os endpoints verificam `tenant_id` do user logado:

```typescript
// Backend
const result = await pool.query(
  "SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2",
  [vehicleId, req.user.tenant_id]  // ← Sempre filtrar por tenant_id
)
```

## Adicionando Novas Features

### 1. Criar um novo Endpoint

**Backend** (`backend/src/routes/novo-recurso.ts`):
```typescript
import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"

const router = express.Router()

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Seu código aqui
    res.json({ data: [] })
  } catch (err) {
    res.status(500).json({ message: "Error" })
  }
})

export default router
```

**Registrar em** `backend/src/index.ts`:
```typescript
import novoRecursoRoutes from "./routes/novo-recurso"
app.use("/api/novo-recurso", novoRecursoRoutes)
```

### 2. Criar Página Frontend

**Página** (`frontend/app/dashboard/novo-recurso/page.tsx`):
```typescript
"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function NovoRecursoPage() {
  const [data, setData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/novo-recurso`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setData(res.data))
  }, [])

  return <div>{/* Sua UI aqui */}</div>
}
```

### 3. Adicionar Link no Dashboard

**Editar** `frontend/app/dashboard/page.tsx`:
```typescript
<Link href="/dashboard/novo-recurso" className="card">
  <h3>Novo Recurso</h3>
</Link>
```

## Convenções

### Nomes
- Routes: `/api/recurso` (plural, lowercase)
- Funções: `getNomeRecurso()`
- Componentes: `NomeRecursoPage`, `NomeRecurso`

### Erros
- `400`: Validação falhou
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Não encontrado
- `500`: Erro interno

### Roles (Permissões)
- `admin`: Acesso total ao tenant
- `manager`: Gerenciar usuários, portais
- `seller`: Criar/editar anúncios
- `viewer`: Visualizar apenas

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Deployment

### Build
```bash
docker-compose build
```

### Push para Registry
```bash
docker tag vscar-backend:latest seu-registry/vscar-backend
docker push seu-registry/vscar-backend
```

### Deploy no Portainer
1. Crie Stack com `docker-compose.yml`
2. Configure variáveis
3. Deploy

## Performance

- Use índices no banco: ✓ (já implementados)
- Cache de queries: ⚠️ (TODO: implementar Redis)
- Pagination: ⚠️ (TODO: adicionar paginação nas listagens)
- Image optimization: ⚠️ (TODO: otimizar imagens com Sharp)

## Próximas Melhorias

1. **Redis**: Cache de sessões e queries
2. **Paginação**: Limitar resultados por página
3. **Upload S3**: Armazenar imagens na nuvem
4. **Webhooks**: Notificações de eventos
5. **Testes**: Unit tests e E2E tests
6. **CI/CD**: GitHub Actions automatizado
7. **Monitoring**: Sentry para erros
8. **Analytics**: Dashboard com métricas

---

Happy coding! 🚀
