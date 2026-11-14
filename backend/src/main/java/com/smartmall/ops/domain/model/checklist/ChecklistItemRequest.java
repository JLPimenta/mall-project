package com.smartmall.ops.domain.model.checklist;

import com.smartmall.ops.domain.entity.enums.TipoResposta;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class ChecklistItemRequest {

    @NotBlank(message = "Informe a pergunta.")
    @Size(max = 200, message = "A pergunta deve ter até 200 caracteres.")
    private String pergunta;

    @NotNull(message = "Informe o tipo de resposta.")
    private TipoResposta tipoResposta;

    @Builder.Default
    private Boolean obrigatorio = Boolean.TRUE;

    /** Obrigatório para TEXTO. Ignorado nos demais tipos. */
    @Min(value = 1, message = "O máximo de caracteres deve ser entre 1 e 500.")
    @Max(value = 500, message = "O máximo de caracteres deve ser entre 1 e 500.")
    private Integer maxCaracteres;

    /** Só para SIM_NAO: resposta esperada ("SIM" ou "NAO"); outra resposta exige abrir chamado. Ignorado nos demais tipos. */
    @Size(max = 3)
    @Pattern(regexp = "SIM|NAO", message = "A resposta esperada deve ser Sim ou Não.")
    private String respostaEsperada;
}
