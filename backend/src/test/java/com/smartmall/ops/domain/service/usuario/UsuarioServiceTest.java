package com.smartmall.ops.domain.service.usuario;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private UsuarioService service;

    @BeforeEach
    void setUp() {
        service = new UsuarioService(repository, encoder);
    }

    @Test
    void gravaSenhaComoHash() {
        when(repository.existsByEmailIgnoreCase("novo@smartmall.local")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var salvo = service.create(new Usuario("Novo", "novo@smartmall.local", "segredo1", Perfil.FUNCIONARIO, true));

        assertThat(salvo.getSenha()).isNotEqualTo("segredo1");
        assertThat(encoder.matches("segredo1", salvo.getSenha())).isTrue();
    }

    @Test
    void rejeitaEmailDuplicado() {
        when(repository.existsByEmailIgnoreCase("admin@smartmall.local")).thenReturn(true);

        assertThatThrownBy(() -> service.create(new Usuario("X", "admin@smartmall.local", "segredo1", Perfil.ADMINISTRADOR, true)))
                .isInstanceOf(DomainException.class)
                .hasMessage("Já existe um usuário com o e-mail admin@smartmall.local.");
    }
}
