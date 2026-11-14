package com.smartmall.ops.domain.service.usuario;

import com.smartmall.ops.domain.core.service.IBaseService;
import com.smartmall.ops.domain.entity.Usuario;

import java.util.Optional;

public interface IUsuarioService extends IBaseService<Usuario> {
    Optional<Usuario> buscarPorEmail(String email);
}
