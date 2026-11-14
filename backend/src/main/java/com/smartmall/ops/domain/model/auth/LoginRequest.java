package com.smartmall.ops.domain.model.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class LoginRequest {

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "E-mail inválido.")
    private String email;

    @NotBlank(message = "Informe a senha.")
    private String senha;
}
