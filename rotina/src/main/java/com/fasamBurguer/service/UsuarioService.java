package com.fasamBurguer.service;

import com.fasamBurguer.entidade.Usuario;
import com.fasamBurguer.repositorio.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional; // Importar Optional

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario cadastrarUsuario(Usuario usuario) {
        // Você pode adicionar validações aqui antes de salvar
        if (usuario.getLogin() == null || usuario.getLogin().isBlank()) {
            throw new IllegalArgumentException("Login é obrigatório.");
        }
        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória.");
        }
        // Opcional: verificar se o login já existe
        if (usuarioRepository.findByLogin(usuario.getLogin()).isPresent()) {
            throw new IllegalArgumentException("Login já existe. Escolha outro.");
        }

        // Definir uma permissão padrão se não for fornecida (ou validar se é uma
        // permissão válida)
        if (usuario.getPermissao() == null || usuario.getPermissao().isBlank()) {
            usuario.setPermissao("Mesa"); // Permissão padrão para novos cadastros
        }

        return usuarioRepository.save(usuario);
    }

    // -----
    public Optional<Usuario> findByLoginAndSenha(String login, String senha) {
        return usuarioRepository.findByLoginAndSenha(login, senha);
    }
    // ----------------------------------------------------------------------------------

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }
    // Adicione outros métodos de serviço conforme a necessidade
}