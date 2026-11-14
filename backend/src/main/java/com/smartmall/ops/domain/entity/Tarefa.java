package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.OrigemTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Unidade de trabalho. Hoje gerada por uma manutenção programada; no futuro, também pelo plano de ação de um chamado. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TAREFA")
public class Tarefa extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "MANUTENCAO_PROGRAMADA_ID", nullable = false)
    private ManutencaoProgramada programada;

    @Column(name = "DATA_HORA_PREVISTA", nullable = false)
    private LocalDateTime dataHoraPrevista;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 12)
    private StatusTarefa status;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORIGEM", nullable = false, length = 25)
    private OrigemTarefa origem;

    public Tarefa(ManutencaoProgramada programada, LocalDateTime dataHoraPrevista) {
        this.programada = programada;
        this.dataHoraPrevista = dataHoraPrevista;
        this.status = StatusTarefa.AGENDADA;
        this.origem = OrigemTarefa.MANUTENCAO_PROGRAMADA;
    }

    /** Agendada com data e hora já passadas. */
    public boolean isAtrasada(LocalDateTime agora) {
        return status == StatusTarefa.AGENDADA && dataHoraPrevista.isBefore(agora);
    }
}
