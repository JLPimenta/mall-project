package com.smartmall.ops.domain.model.piso;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Dados da planta enviados junto com o PDF e a imagem gerada no navegador (parte "dados" do multipart). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlantaDadosRequest {

    /** Página do PDF usada como planta. */
    @NotNull(message = "Informe a página.")
    @Min(value = 1, message = "A página deve ser entre 1 e 500.")
    @Max(value = 500, message = "A página deve ser entre 1 e 500.")
    private Integer pagina;

    /** Tamanho da imagem em pixels. */
    @NotNull(message = "Informe a largura.")
    @Min(value = 100, message = "A largura deve ser entre 100 e 10000 pixels.")
    @Max(value = 10000, message = "A largura deve ser entre 100 e 10000 pixels.")
    private Integer largura;

    @NotNull(message = "Informe a altura.")
    @Min(value = 100, message = "A altura deve ser entre 100 e 10000 pixels.")
    @Max(value = 10000, message = "A altura deve ser entre 100 e 10000 pixels.")
    private Integer altura;
}
