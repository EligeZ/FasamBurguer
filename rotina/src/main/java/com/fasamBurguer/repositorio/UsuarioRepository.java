package com.fasamBurguer.repositorio;

import com.fasamBurguer.entidade.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLoginAndSenha(String login, String senha);

    Optional<Usuario> findByLogin(String login); // Adicionado para verificar unicidade do login
}