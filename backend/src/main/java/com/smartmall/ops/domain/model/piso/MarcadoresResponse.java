package com.smartmall.ops.domain.model.piso;

import java.math.BigDecimal;
import java.util.List;

/**
 * Equipamentos e locais QR do piso, com a posição na planta quando já marcada (x/y nulos = sem posição).
 * Base do editor de marcadores no cadastro do piso.
 */
public record MarcadoresResponse(List<Ponto> equipamentos, List<Ponto> locais) {

    public record Ponto(String id, String codigo, String nome, BigDecimal x, BigDecimal y) { }
}
