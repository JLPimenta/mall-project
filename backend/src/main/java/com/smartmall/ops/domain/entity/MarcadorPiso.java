package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.TipoMarcador;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Posição de um equipamento ou local com QR Code sobre a planta do piso.
 * x e y são frações (0 a 1) da largura e da altura da imagem: independem do tamanho em que a planta é exibida.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MARCADOR_PISO")
public class MarcadorPiso extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "PISO_ID", nullable = false)
    private Piso piso;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO", nullable = false, length = 15)
    private TipoMarcador tipo;

    /** Id do equipamento ou do local QR (sem chave estrangeira: aponta para tabelas diferentes conforme o tipo). */
    @Column(name = "REFERENCIA_ID", nullable = false, length = 36)
    private String referenciaId;

    @Column(name = "X", nullable = false, precision = 5, scale = 4)
    private BigDecimal x;

    @Column(name = "Y", nullable = false, precision = 5, scale = 4)
    private BigDecimal y;
}
