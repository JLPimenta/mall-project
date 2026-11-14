package com.smartmall.ops.domain.repository.usuario;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends BaseRepository<Usuario> {
    Optional<Usuario> findByEmailIgnoreCase(String email);

    /** E-mail já usado por outro usuário. id nulo = cadastro novo. */
    @Query("select count(u) > 0 from Usuario u where lower(u.email) = lower(:email) and (:id is null or u.id <> :id)")
    boolean existeEmail(String email, String id);

    List<Usuario> findByPerfilAndAtivoTrueOrderByNome(Perfil perfil);
}
