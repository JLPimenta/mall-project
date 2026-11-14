package com.smartmall.ops.api.controller.usuario;

import com.smartmall.ops.domain.model.usuario.IUsuarioMapper;
import com.smartmall.ops.domain.model.usuario.UsuarioResponse;
import com.smartmall.ops.domain.service.usuario.IUsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Consultas de usuários para montar cadastros (sem CRUD de usuários nesta etapa).
 * Restrito a Administrador e Supervisor em SecurityConfiguration.
 */
@RestController
@RequestMapping(value = "/api/usuario", produces = "application/json")
@Tag(name = "Usuário", description = "Consultas de usuários.")
public class UsuarioController {

    private final IUsuarioService service;
    private final IUsuarioMapper mapper;

    public UsuarioController(IUsuarioService service, IUsuarioMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping("/funcionarios")
    @Operation(description = "Funcionários ativos, candidatos a membros de equipe.")
    public List<UsuarioResponse> funcionarios() {
        return mapper.toListResponse(service.funcionariosAtivos());
    }
}
