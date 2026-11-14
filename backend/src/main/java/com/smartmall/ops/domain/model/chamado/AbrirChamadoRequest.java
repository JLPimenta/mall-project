package com.smartmall.ops.domain.model.chamado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Chamado aberto por usuário logado (Tarefas). Mesmos limites do relato público. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbrirChamadoRequest {

    @NotBlank(message = "Informe o local.")
    @Size(max = 150, message = "O local deve ter no máximo 150 caracteres.")
    private String localInformado;

    @NotBlank(message = "Descreva o problema.")
    @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
    private String descricao;
}
