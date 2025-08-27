// src/main/java/com/fasamBurguer/Application.java
package com.fasamBurguer;

import com.fasamBurguer.entidade.Burguer;
import com.fasamBurguer.entidade.Permissao;
import com.fasamBurguer.entidade.Usuario;
import com.fasamBurguer.repositorio.BurguerRepository;
import com.fasamBurguer.repositorio.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Arrays;

@SpringBootApplication
public class Application implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Autowired
	public BurguerRepository repo;
	@Autowired
	public UsuarioRepository usuarioRepo;

	@Override
	public void run(String... args) throws Exception {

		// Limpa os dados existentes para evitar duplicatas ao reiniciar (OPCIONAL, para
		// testes)
		// repo.deleteAll();
		// usuarioRepo.deleteAll();

		Usuario cozinha = new Usuario(null, "cozinha", "cozinhaburguer", Permissao.COZINHA.getName());
		Usuario mesa = new Usuario(null, "mesa1", "mesa1", Permissao.MESA.getName());

		usuarioRepo.saveAll(Arrays.asList(cozinha, mesa));

		// id nome descricao preco imagemUrl (novo campo)
		// IMPORTANTE: Para que estas imagens apareçam, os arquivos 'basico.png',
		// 'fasam.png', 'completo.png'
		// devem existir na pasta 'src/main/resources/static/images/burguers/' ou no
		// caminho que você definiu em UPLOAD_DIR.
		Burguer burguer1 = new Burguer(null, "Básico", "Pão, ovo, presunto, cheddar, hamburguer 180g", 15.00,
				"basico.png");
		Burguer burguer2 = new Burguer(null, "FASAM", "Pão, ovo, presunto, cheddar, hamburguer 360g", 20.00,
				"fasam.png");
		Burguer burguer3 = new Burguer(null, "Completo",
				"Pão, ovo, presunto, cheddar, hamburguer 250g, batata, bacon, e refrigerante", 50.00, "completo.png");

		repo.saveAll(Arrays.asList(burguer1, burguer2, burguer3));
	}
}