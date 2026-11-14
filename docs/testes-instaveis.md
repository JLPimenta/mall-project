# Testes instáveis (flaky)

Registro de testes que passaram e falharam sem mudança de código, com causa e correção. Regras de prevenção em `CLAUDE.md`, seção "Testes".

| # | Teste(s) | Sintoma | Causa | Tipo | Situação |
|---|---|---|---|---|---|
| 1 | `checklists.spec.ts` › edita nome e itens | Strict mode: `getByText('Checklist salvo.')` encontrou 2 elementos | Duas gravações seguidas deixam dois toasts na tela | Teste | Contornado com `.last()`; esse contorno escondeu o caso 2 |
| 2 | `checklists.spec.ts` › edição salva continua na tela; edita nome e itens | Diálogo "Descartar alterações?" aparece depois de salvar, às vezes | O helper `salvar()` esperava o toast, mas o toast da gravação anterior ainda estava visível; o teste seguia antes de a segunda gravação terminar | Teste (sincronização falsa) | Corrigido: `salvar()` aguarda a resposta da API e `data-alterado="false"` |
| 3 | `auth.spec.ts` (6 testes, só desktop) | Falhas na primeira execução logo após recriar o container do frontend | O teste começou enquanto o nginx reiniciava | Ambiente | Prevenido: `e2e/global-setup.ts` espera até 60 s o ambiente ficar pronto antes de iniciar |
| 4 | Suíte inteira (login) | "Falha na requisição." e 401 sem corpo em todo login | O `mvnw test` recompilou as classes; o devtools do backend dev recarregou no meio e subiu sem `SecurityConfiguration` | Ambiente | Detectado: `e2e/global-setup.ts` reprova a suíte com mensagem específica quando o 401 vem sem o JSON da aplicação. Prevenção: não compilar o backend durante o E2E |

## Riscos ainda presentes

- **Toasts como confirmação:** `Checklist excluído.` e o toast após `salvar()` são aceitáveis só porque há outra sincronização antes (resposta da API ou remoção da linha).
- **Contagem de itens da seed** (`5` e `4` em "mostra os checklists da seed"): quebra se algum teste salvar alterações num checklist da seed. Hoje os testes que abrem a seed só cancelam.
- **Arrastar com o mouse** (`page.mouse` com `steps`): estável nas execuções feitas, mas depende de tempo de animação. Se oscilar, o caminho pelo teclado já cobre a funcionalidade.
