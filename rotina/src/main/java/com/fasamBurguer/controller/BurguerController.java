// src/main/java/com/fasamBurguer/controller/BurguerController.java
package com.fasamBurguer.controller;

import com.fasamBurguer.entidade.Burguer;
import com.fasamBurguer.service.BurguerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // Importe MultipartFile

import java.util.List;

@RestController
@RequestMapping("burguers")
// @CrossOrigin(origins = "*") // Descomente e use "*" para o frontend do
// cliente (ou "http://localhost:3000"
// // se for o único cliente)
public class BurguerController {

    @Autowired
    private BurguerService service;

    // Mantenha inalterado
    @GetMapping()
    public ResponseEntity<List<Burguer>> findAll() {
        return ResponseEntity.ok(service.listar());
    }

    // Mantenha inalterado
    @GetMapping("/{id}")
    public ResponseEntity<Burguer> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // NOVO ENDPOINT DE CADASTRO: Agora aceita MultipartFile
    @PostMapping(consumes = { "multipart/form-data" }) // Consome dados de formulário com arquivo
    public ResponseEntity<Burguer> cadastrar(
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem // Imagem é opcional
    ) {
        Burguer burguer = new Burguer();
        burguer.setNome(nome);
        burguer.setDescricao(descricao);
        burguer.setPreco(preco);

        // O serviço agora cuidará do salvamento da imagem e atualização do objeto
        // Burguer
        Burguer novoBurguer = service.cadastrarComImagem(burguer, imagem);
        return new ResponseEntity<>(novoBurguer, HttpStatus.CREATED);
    }

    // NOVO ENDPOINT DE EDIÇÃO: Agora aceita MultipartFile e flag para
    // manter/remover imagem
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" }) // Consome dados de formulário com arquivo
    public ResponseEntity<Burguer> editar(
            @PathVariable Long id,
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem, // Imagem opcional
            @RequestParam(value = "manterImagemExistente", required = false, defaultValue = "true") boolean manterImagemExistente // Flag
                                                                                                                                  // para
                                                                                                                                  // manter
                                                                                                                                  // ou
                                                                                                                                  // remover
    ) {
        Burguer burguerAtualizado = new Burguer();
        burguerAtualizado.setNome(nome);
        burguerAtualizado.setDescricao(descricao);
        burguerAtualizado.setPreco(preco);

        Burguer resultado = service.editarComImagem(id, burguerAtualizado, imagem, manterImagemExistente);
        return new ResponseEntity<>(resultado, HttpStatus.OK);
    }

    // ATENÇÃO: Seu método DELETE atual é @DeleteMapping e usa @RequestParam Long
    // id.
    // Para ser mais RESTful, é comum usar @PathVariable para DELETE by ID.
    // Vou manter o seu, mas sugiro o formato abaixo:
    @DeleteMapping("/{id}") // Mudei para @PathVariable para ser mais RESTful
    public ResponseEntity<Void> excluir(@PathVariable Long id) { // Mudei de @RequestParam para @PathVariable
        service.excluir(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}