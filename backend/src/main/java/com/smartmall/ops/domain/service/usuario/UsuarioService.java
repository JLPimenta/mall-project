package com.smartmall.ops.domain.service.usuario;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService extends BaseService<Usuario> implements IUsuarioService {

    private final PasswordEncoder passwordEncoder;

    protected UsuarioService(final UsuarioRepository repository, final PasswordEncoder passwordEncoder) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public Usuario create(Usuario usuario) throws DomainException {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return super.create(usuario);
    }

    @Override
    public void validate(Usuario usuario) throws DomainException {
        if (getRepository().existeEmail(usuario.getEmail(), usuario.getId())) {
            throw new DomainException("Já existe um usuário com o e-mail %s.", usuario.getEmail());
        }
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return getRepository().findByEmailIgnoreCase(email);
    }

    @Override
    public List<Usuario> funcionariosAtivos() {
        return getRepository().findByPerfilAndAtivoTrueOrderByNome(Perfil.FUNCIONARIO);
    }

    @Override
    public UsuarioRepository getRepository() {
        return (UsuarioRepository) super.getRepository();
    }
}
