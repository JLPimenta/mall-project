# Módulo de Manutenção

Requisitos de origem: RF08 (manutenção preventiva, P0) e RF09 (checklist, P1), seções 3.1 (Tela 6) e 6 da documentação inicial. Referência visual: tela Manutenção do protótipo (`docs/dist`).

## Passo a passo do usuário

| Passo | O que acontece | Quem | Situação |
|---|---|---|---|
| 1. Checklist | Cadastra o modelo de verificação com os itens e o tipo de resposta de cada um | Administrador, Supervisor | Implementado |
| 2. Agendamento | Escolhe equipamento, checklist, data, horário, duração e responsável | Administrador, Supervisor | A definir |
| 3. Execução | O responsável preenche o checklist, registra observações e conclui | Funcionário (responsável) | A definir |
| 4. Validação | Supervisor confere a execução e aprova ou devolve | Administrador, Supervisor | A definir |

## Checklist (passo 1)

Modelo reutilizável. Um agendamento referencia um checklist; a execução grava as respostas.

| Campo | Regra |
|---|---|
| Nome | Obrigatório, até 100 caracteres |
| Itens | Pelo menos 1, até 50, na ordem definida pelo usuário |
| Item: pergunta | Obrigatória, até 200 caracteres |
| Item: tipo de resposta | `SIM_NAO`, `TEXTO` ou `NUMERO` |
| Item: máximo de caracteres | Só para `TEXTO`; de 1 a 500 (limite da coluna de resposta) |
| Item: obrigatório | Indica se a resposta é exigida na execução |

Endpoints (`/api/checklist`), restritos a Administrador e Supervisor: listar, buscar, criar, atualizar e excluir.

Pendências para o passo 2:

- Ao editar um checklist já usado em agendamentos, as execuções anteriores não podem mudar. Proposta: copiar os itens para o agendamento no momento do agendamento.
- Exclusão de checklist em uso deve ser bloqueada.

Os checklists da seed são demonstrativos e não substituem procedimentos técnicos aprovados (seção 6 da documentação).
