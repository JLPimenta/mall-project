# SmartMall Ops AI

MVP de gestão operacional para shopping centers. Requisitos em [docs/SmartMall_Ops_AI_Documentacao_Inicial.md](docs/SmartMall_Ops_AI_Documentacao_Inicial.md). Padrões de projeto em [CLAUDE.md](CLAUDE.md).

| Pasta | Conteúdo |
|---|---|
| `backend/` | API Spring Boot 3.5 (Java 21), PostgreSQL, Liquibase |
| `frontend/` | React + TypeScript (Vite), Tailwind, shadcn/ui |
| `docs/dist/` | Protótipo HTML5 original, apenas referência |
| `docs/` | Documentação |

## Requisitos

- Docker Desktop em execução
- Java 21 (`JAVA_HOME` apontando para a pasta do JDK, não para `bin`)
- Node.js 22+

## Rodar em modo desenvolvimento

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:5173
- API e Swagger: http://localhost:8080

O backend sobe o PostgreSQL do `compose.yaml` automaticamente e aplica as migrações com dados de demonstração. O `.env` é opcional; veja `.env.example`.

## Rodar tudo em containers

```bash
docker compose --profile app up --build
```

Frontend em http://localhost:5173, API em http://localhost:8080.

## Contas de demonstração

Criadas pela seed do Liquibase (contexto `dev`). A tela de login tem atalhos para cada perfil.

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@smartmall.local` | `demo123` |
| Supervisor | `supervisor@smartmall.local` | `demo123` |
| Funcionário | `funcionario@smartmall.local` | `demo123` |

## Testes

```bash
cd backend && ./mvnw test
```

```bash
cd frontend && npm run build && npm run lint
```

Testes E2E (Playwright). Exigem o backend no ar com a seed de dev; o Vite é iniciado automaticamente se não estiver rodando. Na primeira vez, instale o navegador:

```bash
cd frontend && npx playwright install chromium
```

```bash
cd frontend && npm run test:e2e
```

Relatório em `frontend/playwright-report`. Para outra URL: `E2E_BASE_URL=http://host:porta npm run test:e2e`.

Antes dos testes, uma verificação aguarda até 60 s pelo frontend, pelo backend e pelo login da seed. Se o ambiente não estiver pronto, a suíte não roda e a mensagem indica a causa.
