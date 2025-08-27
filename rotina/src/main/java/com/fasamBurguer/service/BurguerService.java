// src/main/java/com/fasamBurguer/service/BurguerService.java
package com.fasamBurguer.service;

import com.fasamBurguer.entidade.Burguer;
import com.fasamBurguer.repositorio.BurguerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // Importe MultipartFile

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional; // Importe Optional
import java.util.UUID; // Para gerar nomes de arquivo únicos

@Service
public class BurguerService {

    @Autowired
    private BurguerRepository repo;

    // Define o diretório onde as imagens serão salvas
    // Mude isso para um local adequado no seu sistema de arquivos
    // Recomendo um local FORA do src/main/resources/static para produção,
    // mas para desenvolvimento inicial dentro do static funciona.
    // Vamos usar um caminho relativo que se resolverá para o diretório de execução
    // da aplicação.
    // Você pode querer que seja um caminho absoluto para produção.
    private static final String UPLOAD_DIR = "src/main/resources/static/images/burguers/";
    // Se o seu Spring Boot estiver no mesmo nível que a pasta public do seu
    // frontend Node.js,
    // ou se você quiser que as imagens sejam servidas pelo Node.js,
    // você pode tentar algo como:
    // private static final String UPLOAD_DIR = "../public/img/burguers/";
    // Mas a melhor prática é o Spring Boot servir suas próprias imagens.

    // Método auxiliar para salvar a imagem
    private String saveImage(MultipartFile imagem) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = imagem.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        // Gera um nome de arquivo único para evitar colisões
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = Paths.get(UPLOAD_DIR, uniqueFileName);

        Files.copy(imagem.getInputStream(), filePath);
        return uniqueFileName; // Retorna apenas o nome único do arquivo
    }

    // Método auxiliar para deletar a imagem
    private void deleteImage(String imageName) {
        if (imageName != null && !imageName.isEmpty()) {
            try {
                Path imagePath = Paths.get(UPLOAD_DIR, imageName);
                Files.deleteIfExists(imagePath);
            } catch (IOException e) {
                System.err.println("Erro ao deletar imagem: " + imageName + " - " + e.getMessage());
                // Logar o erro, mas não impedir a operação principal
            }
        }
    }

    // Modificado para lidar com a imagem no cadastro
    public Burguer cadastrarComImagem(Burguer burguer, MultipartFile imagem) {
        validarDados(burguer);
        if (imagem != null && !imagem.isEmpty()) {
            try {
                String imageUrl = saveImage(imagem);
                burguer.setImagemUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Falha ao salvar imagem do burguer: " + e.getMessage());
            }
        }
        return repo.save(burguer);
    }

    // Modificado para lidar com a imagem na edição
    public Burguer editarComImagem(Long id, Burguer burguerAtualizado, MultipartFile imagem,
            boolean manterImagemExistente) {
        Burguer existingBurguer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Burguer não encontrado!"));

        validarDados(burguerAtualizado);

        // Atualiza os campos do burguer existente
        existingBurguer.setNome(burguerAtualizado.getNome());
        existingBurguer.setDescricao(burguerAtualizado.getDescricao());
        existingBurguer.setPreco(burguerAtualizado.getPreco());

        if (imagem != null && !imagem.isEmpty()) {
            // Se uma nova imagem foi enviada, deleta a antiga e salva a nova
            deleteImage(existingBurguer.getImagemUrl());
            try {
                String newImageUrl = saveImage(imagem);
                existingBurguer.setImagemUrl(newImageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Falha ao atualizar imagem do burguer: " + e.getMessage());
            }
        } else if (!manterImagemExistente) {
            // Se nenhuma nova imagem foi enviada E a flag indica para NÃO manter a
            // existente
            deleteImage(existingBurguer.getImagemUrl());
            existingBurguer.setImagemUrl(null); // Remove a referência da imagem do banco de dados
        }
        // Se nenhuma nova imagem foi enviada E manterImagemExistente for true, nada
        // muda no campo imagemUrl

        return repo.save(existingBurguer);
    }

    // Seus métodos existentes, ligeiramente adaptados se necessário para serem
    // chamados por outros lugares.
    // No seu caso, o controller agora chamará os métodos 'cadastrarComImagem' e
    // 'editarComImagem'.
    // Os métodos 'cadastrar' e 'editar' originais podem ser removidos ou mantidos
    // para uso interno sem imagem.
    // Para simplificar, vou mantê-los privados para a validação.
    private void validarDados(Burguer burguer) {
        if (burguer.getDescricao() == null || burguer.getDescricao().isBlank()) {
            throw new IllegalArgumentException("Campo DESCRIÇÃO é obrigatório!");
        }
        if (burguer.getNome() == null || burguer.getNome().isBlank()) {
            throw new IllegalArgumentException("Campo NOME é obrigatório!");
        }
    }

    // Mantenha inalterado
    public List<Burguer> listar() {
        return repo.findAll();
    }

    // Modificado para deletar a imagem associada ao burguer
    public void excluir(Long id) {
        if (id == null) {
            throw new RuntimeException("Burguer não encontrado!");
        }
        Optional<Burguer> burguerOptional = repo.findById(id);
        if (burguerOptional.isPresent()) {
            Burguer burguer = burguerOptional.get();
            deleteImage(burguer.getImagemUrl()); // Deleta a imagem física
            repo.deleteById(id); // Deleta o registro do banco de dados
        } else {
            throw new RuntimeException("Burguer não encontrado!");
        }
    }

    // Mantenha inalterado
    public Burguer buscarPorId(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Burguer não encontrado!"));
    }
}