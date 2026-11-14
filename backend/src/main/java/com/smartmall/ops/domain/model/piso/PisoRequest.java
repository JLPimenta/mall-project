package com.smartmall.ops.domain.model.piso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PisoRequest {

    @NotBlank(message = "Informe o código.")
    @Size(max = 10)
    private String codigo;

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100)
    private String nome;

    @NotNull(message = "Informe a ordem.")
    private Integer ordem;
}
