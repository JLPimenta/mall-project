# Tarefas e Manutenção programada

Requisitos de origem: RF05 (tarefas), RF08 (manutenção preventiva, P0) e RF09 (checklist, P1), seções 3.1 (Telas 5 e 6) e 6 da documentação inicial. Referência visual: telas Tarefas e Manutenção do protótipo (`docs/dist`).

## Glossário

```
Chamado ──► Plano de ação (1..n tarefas) ──┐
                                            ├──► Tarefa ──► execução (checklist) ──► validação
Manutenção programada (recorrência) ────────┘
```

- **Tarefa:** unidade de trabalho. Tem origem, equipe, equipamento, modelo de checklist, data prevista, status e, no futuro, prazo (SLA). Os dois fluxos terminam numa tarefa.
- **Manutenção programada:** agendamento recorrente (ou único) que gera tarefas numa frequência.
- **Modelo de checklist:** molde de verificação. A tarefa terá o checklist preenchido.
- **Chamado** e **Plano de ação** (uma ou várias tarefas geradas por um chamado): a implementar.

## Passo a passo do usuário

| Passo | O que acontece | Quem | Menu | Situação |
|---|---|---|---|---|
| 0. Cadastros de apoio | Equipamentos e Equipes (com seus funcionários) | Administrador, Supervisor | Cadastros | Implementado |
| 1. Modelo de checklist | Cadastra os itens de verificação e o tipo de resposta de cada um | Administrador, Supervisor | Planejamento | Implementado |
| 2. Manutenção programada | Escolhe equipamento, modelo de checklist, equipe e recorrência; o sistema gera as tarefas | Administrador, Supervisor | Planejamento | Implementado |
| 3. Tarefas | Calendário das tarefas, com atrasadas e próximas | Todos (Funcionário vê só as das suas equipes) | Operação | Implementado |
| 4. Execução | Um membro da equipe preenche o checklist da tarefa e conclui | Funcionário da equipe | Operação | A definir |
| 5. Validação | Supervisor confere a execução e aprova ou devolve | Administrador, Supervisor | Operação | A definir |

## Decisões

- 14/11/2026: equipamentos têm cadastro próprio; manutenção preventiva recorrente; responsável é uma equipe (qualquer membro executa); etapa de agendar e listar.
- 15/11/2026: nomenclatura revista para os dois fluxos que geram tarefas.
  - "Plano de manutenção" virou **Manutenção programada**, para não se confundir com o Plano de ação dos chamados.
  - "Manutenção" (data gerada) virou **Tarefa**.
  - "Checklist" virou **Modelo de checklist** na interface.
  - "Agenda" virou **Tarefas**.
  - Renomeado também no código, na API e no banco (migração `20261115-1-renomeia-para-tarefa.sql`, que preserva os dados).
  - A tarefa ganhou a coluna `origem`.

## Equipamento

| Campo | Regra |
|---|---|
| Código | Obrigatório, até 20, único (ex.: `ELV-E1`) |
| Nome | Obrigatório, até 100 |
| Categoria | Elevador, Escada rolante, Climatização, Elétrica, Hidráulica, Segurança, Acesso, Outros |
| Piso | Obrigatório (pisos cadastrados) |
| Localização | Obrigatória, até 150 (referência dentro do piso) |
| Condição | Operando, Atenção, Inoperante |

Não pode ser excluído se tiver manutenção programada.

## Equipe

| Campo | Regra |
|---|---|
| Nome | Obrigatório, até 60, único (ex.: Climatização) |
| Membros | Usuários com perfil Funcionário; de 0 a 50 |

Não pode ser excluída se tiver manutenção programada.

## Modelo de checklist

| Campo | Regra |
|---|---|
| Nome | Obrigatório, até 100 caracteres |
| Itens | Pelo menos 1, até 50, na ordem definida pelo usuário |
| Item: pergunta | Obrigatória, até 200 caracteres |
| Item: tipo de resposta | `SIM_NAO`, `TEXTO` ou `NUMERO` |
| Item: máximo de caracteres | Só para `TEXTO`; de 1 a 500 (limite da coluna de resposta) |
| Item: obrigatório | Indica se a resposta é exigida na execução |

Não pode ser excluído se for usado em manutenção programada.

## Manutenção programada (recorrência)

| Campo | Regra |
|---|---|
| Equipamento, Modelo de checklist, Equipe | Obrigatórios |
| Frequência | Única, Diária, Semanal, Mensal |
| A cada | 1 a 12 (ex.: a cada 2 semanas). Ignorado em "Única" |
| Início | Data e horário no futuro ao criar |
| Horário | Hora de início de cada tarefa |
| Duração | 15 a 720 minutos |
| Término | Opcional; se informado, não pode ser antes do início |
| Observações | Opcional, até 500 |

Regras de geração das tarefas:

- **Cálculo da sequência:** as datas saem do início, somando `k × intervalo`:
  - Semanal: repete o dia da semana do início.
  - Mensal: repete o dia do mês do início. Em meses mais curtos, usa o último dia do mês (31/01 → 28/02 → 31/03).
- **Horizonte:** são criadas as tarefas dos próximos **120 dias**. Uma rotina diária, às 03:00, e a inicialização do backend estendem o horizonte das manutenções programadas ativas.
- **Editar** refaz apenas as tarefas **futuras**:
  - mantém as que continuam na nova sequência, incluindo as canceladas;
  - remove as que saíram;
  - cria as que faltam.
- **Tarefas passadas** nunca são alteradas.
- **Cancelar uma tarefa** (Administrador e Supervisor) afeta só aquela data, e o cancelamento se mantém numa edição que não mude aquela data.
- **Encerrar** (desativar) cancela as tarefas futuras ainda agendadas e deixa a manutenção programada somente leitura.
- **Excluir** só é permitido se nenhuma tarefa dela tiver sido executada.
- **Atrasada:** tarefa agendada cuja data e hora já passaram. É calculado na consulta, não gravado.
- **Horários:** fuso do shopping (`America/Araguaina`), configurável pela variável de ambiente `APP_FUSO_HORARIO`.

## Pendências

- **Execução (passo 4):** copiar os itens do modelo de checklist para a tarefa quando a execução começar, para que editar o modelo não altere execuções já feitas.
- **Chamados:**
  - incluir `CHAMADO` em `OrigemTarefa`;
  - tornar `manutencao_programada_id` opcional;
  - levar para a tarefa os dados que hoje vêm da manutenção programada (equipe, equipamento, modelo de checklist, duração), mais o prazo (SLA).

Os modelos de checklist e equipamentos da seed são demonstrativos e não substituem procedimentos técnicos aprovados (seção 6 da documentação).
