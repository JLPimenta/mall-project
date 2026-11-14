package com.smartmall.ops.domain.model.piso;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Todos os marcadores do piso: substitui os existentes (o que não vier fica sem posição). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarcadoresRequest {

    @Valid
    @Builder.Default
    @Size(max = 500, message = "O piso aceita até 500 marcadores.")
    private List<MarcadorRequest> marcadores = new ArrayList<>();
}
