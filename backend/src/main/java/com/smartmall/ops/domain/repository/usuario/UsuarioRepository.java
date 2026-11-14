package com.smartmall.ops.domain.repository.usuario;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Usuario;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends BaseRepository<Usuario> {
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
