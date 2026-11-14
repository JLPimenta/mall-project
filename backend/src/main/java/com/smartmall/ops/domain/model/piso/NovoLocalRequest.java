package com.smartmall.ops.domain.model.piso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Local de QR Code criado direto na planta do piso. O código (usado no link do QR) é gerado pelo nome. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NovoLocalRequest {

    @NotBlank(message = "Informe o nome do local.")
    @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
    private String nome;
}
