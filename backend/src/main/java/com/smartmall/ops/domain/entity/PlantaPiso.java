package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Planta do piso: o PDF enviado (para baixar) e a página escolhida, convertida em imagem no navegador,
 * que é o fundo da visão do piso na Central de Controle. Uma por piso.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "PLANTA_PISO")
public class PlantaPiso extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "PISO_ID", nullable = false, unique = true)
    private Piso piso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    @JoinColumn(name = "PDF_ARQUIVO_ID", nullable = false)
    private Arquivo pdf;

    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    @JoinColumn(name = "IMAGEM_ARQUIVO_ID", nullable = false)
    private Arquivo imagem;

    @Column(name = "NOME_ARQUIVO", nullable = false, length = 150)
    private String nomeArquivo;

    @Column(name = "TIPO_IMAGEM", nullable = false, length = 30)
    private String tipoImagem;

    @Column(name = "PAGINA", nullable = false)
    private Integer pagina;

    @Column(name = "LARGURA", nullable = false)
    private Integer largura;

    @Column(name = "ALTURA", nullable = false)
    private Integer altura;
}
