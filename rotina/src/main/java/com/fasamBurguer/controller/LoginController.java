package com.fasamBurguer.controller;

import com.fasamBurguer.entidade.Usuario;
import com.fasamBurguer.service.UsuarioService; // Importar UsuarioService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
// @CrossOrigin(origins = "http://localhost:3000") // Certifique-se de que este
// CrossOrigin esteja ativo, ou use o global
public class LoginController {

    @Autowired
    private UsuarioService usuarioService; // Usar UsuarioService

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Usuario loginRequest) {
        // Usar o service para a lógica de login
        if (usuarioService.findByLoginAndSenha(loginRequest.getLogin(), loginRequest.getSenha()).isPresent()) {
            return ResponseEntity.ok("Login realizado com sucesso!");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos.");
        }
    }

    @PostMapping("/cadastro")
    public ResponseEntity<String> cadastrarUsuario(@RequestBody Usuario novoUsuario) {
        try {
            Usuario usuarioSalvo = usuarioService.cadastrarUsuario(novoUsuario);
            return new ResponseEntity<>("Usuário " + usuarioSalvo.getLogin() + " cadastrado com sucesso!",
                    HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao cadastrar usuário: " + e.getMessage());
        }
    }
}