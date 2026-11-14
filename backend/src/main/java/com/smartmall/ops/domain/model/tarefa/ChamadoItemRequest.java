package com.smartmall.ops.domain.model.tarefa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Chamado aberto a partir de um item do checklist da tarefa. O local vem da tarefa. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChamadoItemRequest {

    @NotBlank(message = "Descreva o problema.")
    @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
    private String descricao;
}
