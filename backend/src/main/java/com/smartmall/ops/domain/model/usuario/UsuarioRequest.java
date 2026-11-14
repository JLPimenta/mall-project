package com.smartmall.ops.domain.model.usuario;

import com.smartmall.ops.domain.entity.enums.Perfil;
import jakarta.validation.constraints.Email;
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
public class UsuarioRequest {

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100)
    private String nome;

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "E-mail inválido.")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Informe a senha.")
    @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres.")
    private String senha;

    @NotNull(message = "Informe o perfil.")
    private Perfil perfil;

    @Builder.Default
    private Boolean ativo = Boolean.TRUE;
}
