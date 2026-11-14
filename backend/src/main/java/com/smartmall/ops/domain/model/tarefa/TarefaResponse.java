package com.smartmall.ops.domain.model.tarefa;

import com.smartmall.ops.domain.core.model.Resumo;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import com.smartmall.ops.domain.entity.enums.OrigemTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarefaResponse {
    private String id;
    private OrigemTarefa origem;
    /** Manutenção programada que gerou a tarefa (origem MANUTENCAO_PROGRAMADA). */
    private String manutencaoProgramadaId;
    private LocalDateTime dataHoraPrevista;
    private Integer duracaoMinutos;
    private StatusTarefa status;
    /** Agendada com data e hora já passadas (calculado na consulta). */
    private boolean atrasada;
    private Frequencia frequencia;
    private Resumo equipamento;
    private String piso;
    private String localizacao;
    private Resumo checklist;
    private Resumo equipe;
    /** Membro da equipe que assumiu a tarefa. */
    private Resumo responsavel;
    private Integer envios;
    private LocalDateTime ultimoEnvio;

    public static TarefaResponse de(Tarefa tarefa, LocalDateTime agora) {
        var programada = tarefa.getProgramada();
        var equipamento = programada.getEquipamento();
        return TarefaResponse.builder()
                .id(tarefa.getId())
                .origem(tarefa.getOrigem())
                .manutencaoProgramadaId(programada.getId())
                .dataHoraPrevista(tarefa.getDataHoraPrevista())
                .duracaoMinutos(programada.getDuracaoMinutos())
                .status(tarefa.getStatus())
                .atrasada(tarefa.isAtrasada(agora))
                .frequencia(programada.getFrequencia())
                .equipamento(new Resumo(equipamento.getId(), equipamento.getNome(), equipamento.getCodigo()))
                .piso(equipamento.getPiso().getNome())
                .localizacao(equipamento.getLocalizacao())
                .checklist(new Resumo(programada.getChecklist().getId(), programada.getChecklist().getNome(), null))
                .equipe(new Resumo(programada.getEquipe().getId(), programada.getEquipe().getNome(), null))
                .responsavel(TarefaDetalheResponse.resumo(tarefa.getResponsavel()))
                .envios(tarefa.getEnvios())
                .ultimoEnvio(tarefa.getUltimoEnvio())
                .build();
    }
}
