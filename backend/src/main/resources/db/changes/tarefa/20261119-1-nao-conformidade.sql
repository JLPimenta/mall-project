--liquibase formatted sql

-- Não conformidade no checklist da tarefa abre chamado (docs/modulo-manutencao.md, "Não conformidade").

--changeset smartmall:20261119-1-resposta-esperada
-- Só para itens Sim/Não: resposta diferente da esperada é não conformidade. Nulo = sem regra.
ALTER TABLE checklist_item ADD COLUMN resposta_esperada VARCHAR(3);
ALTER TABLE checklist_item ADD CONSTRAINT ck_checklist_item_esperada CHECK (resposta_esperada IN ('SIM', 'NAO'));
ALTER TABLE tarefa_item ADD COLUMN resposta_esperada VARCHAR(3);
ALTER TABLE tarefa_item ADD CONSTRAINT ck_tarefa_item_esperada CHECK (resposta_esperada IN ('SIM', 'NAO'));

--changeset smartmall:20261119-2-chamado-da-tarefa
-- Chamado aberto a partir de um item do checklist (um por item). SET NULL: limpar um não apaga o outro.
ALTER TABLE tarefa_item ADD COLUMN chamado_id VARCHAR(36);
ALTER TABLE tarefa_item ADD CONSTRAINT fk_tarefa_item_chamado FOREIGN KEY (chamado_id) REFERENCES chamado (id) ON DELETE SET NULL;
-- Chamado aberto por um usuário logado (Tarefas ou checklist); nulo nos relatos públicos.
ALTER TABLE chamado ADD COLUMN aberto_por_id VARCHAR(36);
ALTER TABLE chamado ADD CONSTRAINT fk_chamado_aberto_por FOREIGN KEY (aberto_por_id) REFERENCES usuario (id);
ALTER TABLE chamado ADD COLUMN tarefa_origem_id VARCHAR(36);
ALTER TABLE chamado ADD CONSTRAINT fk_chamado_tarefa_origem FOREIGN KEY (tarefa_origem_id) REFERENCES tarefa (id) ON DELETE SET NULL;

--changeset smartmall:20261119-3-seed-resposta-esperada context:dev
UPDATE checklist_item SET resposta_esperada = 'SIM' WHERE tipo_resposta = 'SIM_NAO';
UPDATE checklist_item SET resposta_esperada = 'NAO' WHERE id = '7c3a9e20-0002-4b1d-9c00-000000000008'; -- Ruído ou vibração anormal?

--changeset smartmall:20261119-4-seed-resposta-esperada-pergunta context:dev
-- Editar um modelo recria os itens (novos ids): a regra da seed é aplicada pelo texto da pergunta.
UPDATE checklist_item SET resposta_esperada = 'NAO' WHERE tipo_resposta = 'SIM_NAO' AND pergunta LIKE 'Ruído ou vibração anormal%';
