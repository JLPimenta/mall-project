# SmartMall Ops AI

MVP de gestão operacional para shopping centers (cenário: Capim Dourado Shopping), feito para hackathon. Fluxo central: ocorrência → triagem sugerida → revisão humana → tarefa → Central de Controle → encerramento. Inclui manutenção preventiva de equipamentos.

Referências obrigatórias antes de implementar qualquer funcionalidade:

- `docs/SmartMall_Ops_AI_Documentacao_Inicial.md` — requisitos (RF/RNF), telas, modelo de dados e critérios de aceite.
- `INSTRUCTIONS.md` e `docs/dist/` — protótipo HTML5/JS existente. Serve de referência de fluxo e identidade visual, não de código a ser copiado.

## Decisões de arquitetura

| Tema | Decisão | Observação |
|---|---|---|
| Backend | Spring Boot 3.5 (Java 21), base no template `JLPimenta/arch-spring` | Substitui a proposta Node.js/Express do documento |
| Banco | PostgreSQL via Docker, migrações com Liquibase | Substitui a proposta SQLite |
| Frontend | React + TypeScript + Vite | TypeScript compila para JavaScript; atende RNF02 no cliente |
| UI | shadcn/ui + Tailwind CSS | Componentes em `src/components/ui` |
| IA / triagem | Classificação por regras no backend, sempre revisável | Serviço de IA real é P2 e opcional |

## Estrutura do repositório

```
/
├── backend/        Spring Boot (Maven)
├── frontend/       React + TypeScript (Vite)
├── docs/           Documentação, evidências de teste e protótipo HTML5 de referência (docs/dist, somente leitura)
├── compose.yaml    PostgreSQL (e, opcionalmente, a stack completa)
├── .env.example    Variáveis de ambiente (copiar para .env)
└── CLAUDE.md
```

## Execução local

Requisito: subir o sistema com o mínimo de passos. Qualquer mudança que adicione dependência de ambiente deve atualizar o README e o `.env.example`.

```bash
cd backend && ./mvnw spring-boot:run       # sobe o PostgreSQL via compose e a API em :8080 (Swagger em /)
cd frontend && npm install && npm run dev  # UI em :5173
docker compose --profile app up --build    # alternativa: stack completa em containers
```

- Perfil `dev` (padrão): `spring-boot-docker-compose` lê `../compose.yaml`, sobe o banco e injeta a conexão. Não configurar datasource no `dev`.
- Perfil `docker`: usado pelo container do backend; conexão por variáveis `POSTGRES_*`.
- O Vite faz proxy de `/api` para `http://localhost:8080`; no container, o nginx faz o mesmo. Sem CORS.
- Dados de demonstração entram por changeset Liquibase com `context:dev`. Nenhum passo manual de carga.
- `.env` na raiz é opcional; o `compose.yaml` tem valores padrão. Nunca versionar `.env` nem senhas em `application-*.properties`.
- `JAVA_HOME` deve apontar para a pasta do JDK, não para `bin`.

## Backend — padrões (arch-spring)

Pacote raiz: `com.smartmall.ops`. Dois agrupamentos: `api` (camada web) e `domain` (regra de negócio e dados).

```
com.smartmall.ops
├── api
│   ├── config/exception      ResponseError, FieldDataValidation, RestExceptionHandler
│   ├── config/swagger        OpenAPI e redirecionamento de "/" para o Swagger
│   └── controller/<recurso>  Controllers REST
└── domain
    ├── core                  Classes genéricas (não alterar sem necessidade)
    │   ├── controller        BaseController, BaseSearchController
    │   ├── entity            BaseEntity (id UUID String, dataCriacao, dataAtualizacao)
    │   ├── exception         DomainException
    │   ├── mapper            IBaseMapper<T, R, Q>
    │   ├── repository        BaseRepository<T> (JpaRepository + JpaSpecificationExecutor)
    │   └── service           IBaseService<T>, BaseService<T>
    ├── entity                Entidades JPA
    ├── model/<recurso>       <Recurso>Request, <Recurso>Response, I<Recurso>Mapper
    ├── repository/<recurso>  <Recurso>Repository
    └── service/<recurso>     I<Recurso>Service, <Recurso>Service
```

Convenção de genéricos: `T` = entidade, `R` = request, `Q` = response.

Para cada novo recurso, criar o conjunto completo:

1. `domain/entity/<Recurso>.java` — estende `BaseEntity`, `@Table(name = "NOME")`, colunas em `UPPER_SNAKE_CASE`.
2. Changeset Liquibase em `resources/db/changes/<recurso>/AAAAMMDD-N-descricao.sql`, incluído em `db/changelog-master.xml`. `ddl-auto=validate`: o schema vem só do Liquibase.
3. `model/<recurso>/<Recurso>Request` e `<Recurso>Response` (Lombok `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`), validação com Bean Validation no Request.
4. `I<Recurso>Mapper` com MapStruct (`@Mapper(componentModel = "spring")`) estendendo `IBaseMapper`.
5. `<Recurso>Repository` estendendo `BaseRepository<T>`.
6. `I<Recurso>Service` estendendo `IBaseService<T>` e `<Recurso>Service` estendendo `BaseService<T>`. Regras de negócio em `validate()` ou em métodos próprios do serviço.
7. Controller estendendo `BaseController` (CRUD) ou `BaseSearchController` (somente leitura), com `@Tag` do Swagger.

Regras:

- Rotas com prefixo `/api`, recurso em pt-BR no singular, kebab-case (`/api/ocorrencia`, `/api/manutencao-preventiva`).
- Transições de status (aprovar, atribuir, iniciar, concluir, encerrar) são endpoints explícitos (`POST /api/ocorrencia/{id}/aprovar`), não `PUT` genérico.
- Erro de regra de negócio: lançar `DomainException` com mensagem curta em pt-BR. O `RestExceptionHandler` converte para `ResponseError`.
- Toda mudança de status de ocorrência, tarefa e manutenção grava registro de histórico (RNF06): entidade, ação, responsável, data e resultado.
- Autorização por perfil (Administrador, Supervisor, Funcionário) verificada no servidor, não só no frontend (RNF05).
- Controllers não contêm regra de negócio; apenas delegam ao serviço.
- Testes de serviço para as regras do fluxo principal (RNF09). Controllers com `@WebMvcTest`, importando `SecurityConfiguration` e `PasswordConfiguration`.

Autenticação (`api/config/security`):

- Sessão HTTP com cookie `JSESSIONID` (HttpOnly, SameSite=Strict). Sem JWT. CSRF desabilitado porque o frontend é same-origin via proxy.
- Endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/sessao`. Todo o resto de `/api/**` exige sessão.
- Perfis no enum `Perfil` (`ADMINISTRADOR`, `SUPERVISOR`, `FUNCIONARIO`), expostos como `ROLE_<PERFIL>`. Restringir endpoints com `@PreAuthorize("hasAnyRole('ADMINISTRADOR','SUPERVISOR')")`.
- Usuário logado no controller: `@AuthenticationPrincipal UsuarioAutenticado`. Use o `id` dele como responsável no histórico.
- Senhas sempre com BCrypt (`PasswordEncoder`); `UsuarioResponse` nunca expõe a senha.
- 401 e 403 respondem `ResponseError` em JSON.

## Frontend — padrões

Stack: Vite, React, TypeScript (`strict`), Tailwind, shadcn/ui, React Router, TanStack Query para chamadas à API, React Hook Form + Zod para formulários (padrão do `Form` do shadcn).

```
frontend/src
├── components
│   ├── ui/          Componentes do shadcn (gerados via CLI; editar com parcimônia)
│   ├── layout/      AppShell, Sidebar, Header, PageHeader
│   └── shared/      Componentes reutilizáveis do domínio (StatusBadge, PriorityBadge, EmptyState, SimulatedBadge, DataTable)
├── features/<modulo>/   ocorrencias, central, tarefas, equipamentos, manutencao, historico, auth
│   ├── components/  Componentes específicos do módulo
│   ├── api.ts       Funções de acesso à API do módulo
│   ├── hooks.ts     Hooks do TanStack Query
│   ├── schemas.ts   Schemas Zod
│   └── types.ts     Tipos espelhando os Response/Request do backend
├── pages/           Uma página por rota; compõe componentes, sem lógica pesada
├── lib/             api client (fetch), utils (cn), formatadores
└── routes.tsx
```

Componentização:

- Página só compõe. Lógica de dados em hooks; markup repetido vira componente.
- Componente com mais de ~150 linhas ou mais de uma responsabilidade deve ser dividido.
- Antes de criar componente, verificar se já existe em `ui/` ou `shared/`. Adicionar componentes shadcn com `npx shadcn@latest add <nome>`.
- Props tipadas com `type`; sem `any`.
- Menu lateral definido em `components/layout/navigation.ts`; só entra item de módulo já implementado. Cada item declara `perfis`; a rota usa `RequirePerfil` com `perfisDaRota(...)`, e o menu filtra pelo mesmo campo.
- Sessão: `useSessao()` (`features/auth/hooks.ts`). Rotas internas ficam sob `RequireAuth`. Um 401 em qualquer chamada limpa a sessão e leva ao login (`lib/query-client.ts`).
- Chamadas HTTP só via `lib/api.ts` (prefixo `/api`, erros como `ApiError`). Listagens paginadas retornam `Page<T>` (`content` + `page`).
- Status e prioridade sempre pelos componentes compartilhados, para manter cor e texto consistentes.
- Cores por tokens CSS do tema shadcn (`--primary`, etc.), nunca hex solto em componente. Paleta base do protótipo: navy `#061a37`, azul `#087cbe`, ciano `#36c6ea`, verde `#24ae72`, vermelho `#ec545b`, âmbar `#f0a633`.

HTML5 e acessibilidade (tecnologia sorteada, seção 9 da documentação — é critério de avaliação):

- `index.html` com `<!DOCTYPE html>`, `lang="pt-BR"`, `charset` e `viewport`.
- Estrutura semântica: `header`, `nav`, `main`, `section`, `footer`, hierarquia de títulos correta (um `h1` por página).
- Formulários com `label` associado, `type` adequado, `required`/`minLength`/`maxLength` quando aplicável, além da validação Zod.
- Central de Controle: diagrama do piso em SVG inline, com marcadores focáveis e operáveis por teclado.
- Layout responsivo: sidebar no desktop, navegação compacta no mobile.

Estados obrigatórios em toda tela com dados: carregando (Skeleton), vazio, erro e sucesso.

## Texto de interface

- pt-BR, direto e curto. Rótulos de uma a três palavras; botões com verbo no infinitivo ("Registrar", "Aprovar", "Encerrar").
- Sem frases de efeito, saudações, explicações óbvias ou parágrafos descritivos na tela.
- Sem texto de ajuda quando o rótulo já basta. Descrição de página: no máximo uma linha, e só se necessária.
- Mensagens de erro dizem o que fazer: "Informe a localização", não "Ops! Algo deu errado".
- Dados simulados (rotas, posições, tempos, classificação sugerida) recebem o `SimulatedBadge` ("Simulado") — exigência RNF07 — sem textos longos de aviso.
- Não apresentar como implementada uma funcionalidade planejada.

O mesmo vale para código e documentação: comentários só quando explicam o porquê; README e docs objetivos.

## Escopo e prioridade

Implementar na ordem: P0 completo antes de qualquer P1.

- P0: RF01 Autenticação por perfil, RF02 Dashboard, RF03 Ocorrências, RF04 Triagem com revisão humana, RF05 Tarefas, RF06 Central de Controle, RF08 Manutenção preventiva.
- P1: RF07 Rota ilustrativa, RF09 Checklist, RF10 Alertas, RF11 Histórico.
- P2: RF12 Análise de recorrência, serviço de IA real.

Fluxo de status da ocorrência: `REGISTRADA → EM_ANALISE → APROVADA → EM_EXECUCAO → ENCERRADA`. A sugestão de categoria, prioridade e equipe nunca é aplicada sem aprovação de Supervisor ou Administrador. Encerramento exige resolução registrada.

## Git

- Commits pequenos, mensagem em pt-BR no imperativo (`Adiciona endpoint de aprovação de ocorrência`).
- Branch por funcionalidade: `feat/<rf>-<descricao>`, `fix/<descricao>`.
- Não commitar `.env`, `node_modules/`, `target/`, `.idea/`, `frontend/dist/`.
