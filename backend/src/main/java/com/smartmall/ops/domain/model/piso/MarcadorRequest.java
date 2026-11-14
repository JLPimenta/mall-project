package com.smartmall.ops.domain.model.piso;

import com.smartmall.ops.domain.entity.enums.TipoMarcador;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Posição de um equipamento ou local QR na planta: frações (0 a 1) da largura e da altura. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarcadorRequest {

    @NotNull(message = "Informe o tipo do marcador.")
    private TipoMarcador tipo;

    @NotBlank(message = "Informe o registro do marcador.")
    @Size(max = 36)
    private String referenciaId;

    @NotNull(message = "Informe a posição.")
    @DecimalMin(value = "0", message = "A posição deve estar dentro da planta.")
    @DecimalMax(value = "1", message = "A posição deve estar dentro da planta.")
    private BigDecimal x;

    @NotNull(message = "Informe a posição.")
    @DecimalMin(value = "0", message = "A posição deve estar dentro da planta.")
    @DecimalMax(value = "1", message = "A posição deve estar dentro da planta.")
    private BigDecimal y;
}
