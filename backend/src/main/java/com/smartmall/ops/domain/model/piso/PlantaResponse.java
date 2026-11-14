package com.smartmall.ops.domain.model.piso;

import com.smartmall.ops.domain.entity.PlantaPiso;

import java.time.LocalDateTime;

/** Metadados da planta; a imagem e o PDF são baixados por endpoints próprios. */
public record PlantaResponse(String nomeArquivo, Integer pagina, Integer largura, Integer altura, LocalDateTime atualizadaEm) {

    public static PlantaResponse de(PlantaPiso p) {
        return new PlantaResponse(p.getNomeArquivo(), p.getPagina(), p.getLargura(), p.getAltura(),
                p.getDataAtualizacao() == null ? p.getDataCriacao() : p.getDataAtualizacao());
    }
}
