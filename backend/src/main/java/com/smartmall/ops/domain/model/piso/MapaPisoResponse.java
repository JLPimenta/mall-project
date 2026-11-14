package com.smartmall.ops.domain.model.piso;

import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.entity.enums.PrioridadeChamado;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Visão do piso na Central de Controle: planta e marcadores posicionados.
 * Só entra o que tem posição na planta; os totais sem posição aparecem como contagem.
 */
public record MapaPisoResponse(
        String pisoId,
        String pisoNome,
        PlantaResponse planta,
        List<EquipamentoNoMapa> equipamentos,
        List<ChamadoNoMapa> chamados,
        /* Equipamentos e chamados abertos do piso ainda sem posição na planta. */
        int semPosicao) {

    public record EquipamentoNoMapa(String id, String codigo, String nome, CondicaoEquipamento condicao,
                                    BigDecimal x, BigDecimal y, int atrasadas, List<TarefaDoDia> tarefasHoje) { }

    public record TarefaDoDia(String id, LocalDateTime dataHoraPrevista, StatusTarefa status, boolean atrasada,
                              String equipe, String responsavel) { }

    public record ChamadoNoMapa(String id, String protocolo, StatusChamado status, PrioridadeChamado prioridade,
                                String resumo, String local, LocalDateTime criadoEm, BigDecimal x, BigDecimal y) { }
}
