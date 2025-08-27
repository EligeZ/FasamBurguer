import express from "express";
import session from "express-session";
import fetch from "node-fetch"; // Já existe
import multer from "multer"; // Importar multer
import fs from "fs";
import bodyParser from "body-parser"; // Importar body-parser
import amqp from "amqplib"; // Importar amqplib para RabbitMQ
import {
  initRabbit,
  channel,
  QUEUE,
  getNextOrder,
  ackOrder,
  nackOrder,
} from "./cozinhaConsumer.js";

const app = express();
const port = 3000;
const backendApiUrl = "http://localhost:9090"; // URL do seu backend Spring Boot

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Configurar middleware de sessão
app.use(
  session({
    secret: "sua_chave_secreta_aqui",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    req.session.errorMessage = "Acesso negado. Faça login.";
    res.redirect("/");
  }
}

let posts = []; // Manter para a rota '/' e 'materia' se ainda forem usadas para "notícias"
let nextPostId = 1;

// Configuração do Multer para armazenamento temporário dos arquivos
// IMPORTANTE: Crie uma pasta 'uploads' no mesmo nível do seu index.js
const upload = multer({ dest: "uploads/" });

// Rota GET para a página inicial (Login ou Dashboard)
app.get("/", (req, res) => {
  if (req.session.isLoggedIn) {
    const latestPosts = [...posts].sort((a, b) => b.date - a.date).slice(0, 5);
    res.render("index.ejs", {
      posts: latestPosts,
      isLoggedIn: true,
      username: req.session.username,
      errorMessage: null,
    });
  } else {
    res.render("index.ejs", {
      posts: [],
      isLoggedIn: false,
      username: null,
      errorMessage: req.session.errorMessage,
    });
    req.session.errorMessage = null;
  }
});

// Rota POST para processar o login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await fetch(`${backendApiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: username, senha: password }),
    });

    if (response.ok) {
      req.session.isLoggedIn = true;
      req.session.username = username;
      res.redirect("/");
    } else {
      const errorData = await response.text();
      req.session.errorMessage = errorData || "Credenciais inválidas.";
      res.redirect("/");
    }
  } catch (error) {
    console.error("Erro ao tentar login com o backend:", error);
    req.session.errorMessage = "Erro ao tentar conectar com o servidor.";
    res.redirect("/");
  }
});

// Rota GET para a página de cadastro
app.get("/cadastro", (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/");
  } else {
    res.render("cadastro.ejs", { errorMessage: req.session.errorMessage });
    req.session.errorMessage = null;
  }
});

// Rota POST para processar o cadastro
app.post("/cadastro", async (req, res) => {
  const { login, senha, permissao } = req.body;

  try {
    const response = await fetch(`${backendApiUrl}/auth/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha, permissao: permissao || "Mesa" }),
    });

    if (response.ok && response.status === 201) {
      req.session.errorMessage = "Cadastro realizado com sucesso! Faça login.";
      res.redirect("/");
    } else {
      const errorData = await response.text();
      req.session.errorMessage = errorData || "Erro ao cadastrar usuário.";
      res.redirect("/cadastro");
    }
  } catch (error) {
    console.error("Erro ao tentar cadastrar com o backend:", error);
    req.session.errorMessage =
      "Erro ao tentar conectar com o servidor de cadastro.";
    res.redirect("/cadastro");
  }
});

// Rota para fazer logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
    }
    res.redirect("/");
  });
});

// ====================================================================
// MODIFICAÇÕES CRÍTICAS NA ROTA '/pratos' PARA ALTERNAR TELAS
// ====================================================================

// Rota GET para exibir a lista de pratos (burguers) OU o formulário de novo/editar prato
app.get("/pratos", isAuthenticated, async (req, res) => {
  const postId = req.query.id; // Pode ser um ID ou string vazia para "novo prato"
  let postToEdit = null; // Será o objeto do prato se for edição
  let currentError = req.session.errorMessage;
  req.session.errorMessage = null;

  // Se 'postId' existir (não for undefined ou null) E não for uma string vazia,
  // significa que é uma requisição para editar um prato específico.
  // Se for uma string vazia (ex: '/pratos?id='), significa "novo prato".
  // Se não tiver 'id' na query (apenas '/pratos'), significa listar todos.
  if (postId !== undefined && postId !== "") {
    // Requisição para editar
    try {
      const response = await fetch(`${backendApiUrl}/burguers/${postId}`);
      if (response.ok) {
        postToEdit = await response.json();
      } else {
        console.error(
          `Erro ao buscar prato com ID ${postId}: ${
            response.status
          } ${await response.text()}`
        );
        currentError = "Prato não encontrado para edição.";
        // Se o prato não for encontrado, tratamos como uma requisição de novo prato ou erro
        postToEdit = null; // Garante que não tente editar um prato que não existe
      }
    } catch (error) {
      console.error(`Erro de rede ao buscar prato com ID ${postId}:`, error);
      currentError = "Erro ao conectar com o servidor para buscar prato.";
      postToEdit = null;
    }
    // Se chegamos aqui e postId existe (ou era vazio, mas agora tratamos como novo),
    // ou se tentou editar e não achou, renderizamos o formulário novoPrato.ejs
    return res.render("novoPrato.ejs", {
      post: postToEdit, // Será o prato para edição ou null para novo
      isLoggedIn: true,
      errorMessage: currentError,
    });
  } else if (postId === "") {
    // Requisição para CRIAR um novo prato (vindo de /pratos?id=)
    return res.render("novoPrato.ejs", {
      post: null, // Garante que é um novo prato
      isLoggedIn: true,
      errorMessage: currentError,
    });
  }

  // Se não há 'id' na query, ou 'id' é null/undefined, renderiza a lista de pratos
  try {
    const response = await fetch(`${backendApiUrl}/burguers`);
    if (response.ok) {
      const burguers = await response.json();
      res.render("pratos.ejs", {
        burguers: burguers,
        isLoggedIn: true,
        errorMessage: currentError,
      });
    } else {
      console.error(
        `Erro ao buscar lista de pratos: ${
          response.status
        } ${await response.text()}`
      );
      res.render("pratos.ejs", {
        burguers: [],
        isLoggedIn: true,
        errorMessage: currentError || "Erro ao carregar pratos do servidor.",
      });
    }
  } catch (error) {
    console.error("Erro de rede ao buscar lista de pratos:", error);
    res.render("pratos.ejs", {
      burguers: [],
      isLoggedIn: true,
      errorMessage:
        currentError || "Erro ao conectar com o servidor para listar pratos.",
    });
  }
});

// Rota POST para salvar/editar um prato (Burguer)
// Use upload.single('imagem') para lidar com o upload de um único arquivo de nome 'imagem'
app.post(
  "/salvar",
  isAuthenticated,
  upload.single("imagem"),
  async (req, res) => {
    // Use 'nome', 'descricao', 'preco' conforme o nome dos campos no EJS e no Spring Boot
    const { id, nome, descricao, preco, manterImagemExistente } = req.body;
    const imagem = req.file; // req.file contém os dados do arquivo enviado pelo Multer

    const FormData = (await import("form-data")).default; // Importação dinâmica
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("preco", parseFloat(preco)); // Garanta que o preço é um número

    if (imagem) {
      // Se um NOVO arquivo de imagem foi enviado
      // Crie um stream de leitura do arquivo temporário do multer
      const fileStream = fs.createReadStream(imagem.path);
      // Anexe a nova imagem ao FormData com o nome original
      formData.append("imagem", fileStream, imagem.originalname);
      console.log(
        `[NODE] Anexando NOVA imagem ao FormData: ${imagem.originalname}, path: ${imagem.path}`
      );
    } else if (id) {
      // Se é uma EDIÇÃO (tem ID) e NÃO tem nova imagem
      // Verifica se a imagem existente deve ser mantida ou removida
      if (manterImagemExistente === "true" && req.body.imagemUrlExistente) {
        // Se quer manter a existente
        formData.append("manterImagemExistente", "true");
        // É crucial enviar o nome da imagem existente para o Spring Boot
        formData.append("imagemUrlExistente", req.body.imagemUrlExistente);
        console.log(
          "[NODE] Sinalizando para manter imagem existente:",
          req.body.imagemUrlExistente
        );
      } else if (manterImagemExistente === "false") {
        // Se quer remover a existente
        formData.append("removerImagem", "true"); // Sinaliza para o backend remover
        console.log("[NODE] Sinalizando para remover imagem existente.");
      }
    }

    let method = "POST";
    let url = `${backendApiUrl}/burguers`;
    if (id) {
      // Se o ID existe, é uma operação de PUT (edição)
      method = "PUT";
      url = `${backendApiUrl}/burguers/${id}`;
    }

    try {
      const response = await fetch(url, {
        method: method,
        body: formData, // Envie o FormData como corpo
        // O 'Content-Type' para 'multipart/form-data' é geralmente definido
        // automaticamente pela biblioteca 'form-data' quando o 'body' é um objeto FormData.
        // Não precisa definir manualmente o Content-Type aqui, senão pode dar erro.
      });

      // Após a requisição, delete o arquivo temporário criado pelo Multer
      if (imagem) {
        fs.unlinkSync(imagem.path);
      }

      if (response.ok) {
        req.session.errorMessage = id
          ? "Prato atualizado com sucesso!"
          : "Prato cadastrado com sucesso!";
        res.redirect("/pratos");
      } else {
        const errorData = await response.text();
        req.session.errorMessage = errorData || "Erro ao salvar o prato.";

        // Se der erro, tenta buscar o prato novamente para manter os dados no formulário (para edição)
        let postData = null;
        if (id) {
          try {
            const existingPostResponse = await fetch(
              `${backendApiUrl}/burguers/${id}`
            );
            if (existingPostResponse.ok) {
              postData = await existingPostResponse.json();
            }
          } catch (fetchErr) {
            console.error(
              "Erro ao recarregar dados do prato após falha no salvamento:",
              fetchErr
            );
            // Continua com postData como null se houver erro ao buscar
          }
        } else {
          // Para novo prato, cria um objeto com os dados submetidos
          postData = { nome, descricao, preco: parseFloat(preco) };
        }

        res.render("novoPrato.ejs", {
          post: postData,
          isLoggedIn: true,
          errorMessage: req.session.errorMessage,
        });
      }
    } catch (error) {
      console.error("Erro de rede ao salvar prato:", error);
      req.session.errorMessage =
        "Erro ao conectar com o servidor para salvar o prato.";

      // Em caso de erro de rede, tenta manter os dados no formulário
      let postData = null;
      if (id) {
        try {
          const existingPostResponse = await fetch(
            `${backendApiUrl}/burguers/${id}`
          );
          if (existingPostResponse.ok) {
            postData = await existingPostResponse.json();
          }
        } catch (fetchErr) {
          console.error(
            "Erro ao recarregar dados do prato após erro de rede:",
            fetchErr
          );
        }
      } else {
        postData = { nome, descricao, preco: parseFloat(preco) };
      }

      res.render("novoPrato.ejs", {
        post: postData,
        isLoggedIn: true,
        errorMessage: req.session.errorMessage,
      });
      // Após a requisição, delete o arquivo temporário criado pelo Multer
      if (imagem) {
        require("fs").unlinkSync(imagem.path);
      }
    }
  }
);

// Rota POST para excluir um prato (Burguer)
app.post("/excluir-prato/:id", isAuthenticated, async (req, res) => {
  const burguerId = req.params.id;
  try {
    // ATENÇÃO: Seu backend agora espera DELETE /{id}, não ?id={id}
    const response = await fetch(`${backendApiUrl}/burguers/${burguerId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      req.session.errorMessage = "Prato excluído com sucesso!";
    } else {
      const errorData = await response.text();
      req.session.errorMessage = errorData || "Erro ao excluir o prato.";
    }
    res.redirect("/pratos");
  } catch (error) {
    console.error("Erro de rede ao excluir prato:", error);
    req.session.errorMessage =
      "Erro ao conectar com o servidor para excluir o prato.";
    res.redirect("/pratos");
  }
});

// ====================================================================
// ROTAS ANTIGAS (MANTIDAS COMO ESTÃO)
// ====================================================================
app.get("/materia/:id", isAuthenticated, (req, res) => {
  const postId = req.params.id;
  const post = posts.find((post) => post.id === parseInt(postId));
  if (post) {
    res.render("materia.ejs", { post, isLoggedIn: true });
  } else {
    res.status(404).send("Matéria não encontrada.");
  }
});

app.post("/excluir/:id", isAuthenticated, (req, res) => {
  const postId = req.params.id;
  posts = posts.filter((post) => post.id !== parseInt(postId));
  res.redirect("/");
});

// —————————————————————————————
// CONTROLE DE FILA DE PEDIDOS via RabbitMQ
// —————————————————————————————

initRabbit()
  .then(() => {
    // Rotas de pedido na cozinha:

    // 1) Quantos pedidos estão na fila?
    app.get("/cozinha/pedidos/count", async (req, res) => {
      try {
        const q = await channel.checkQueue(QUEUE);
        res.json({ count: q.messageCount });
      } catch {
        res.status(500).send("Erro ao contar pedidos.");
      }
    });

    // 2) “Chamar” próximo pedido
    app.post("/cozinha/pedidos/chamar", async (req, res) => {
      try {
        const pedido = await getNextOrder();

        if (!pedido) return res.status(204).send(); // Nenhum pedido na fila

        if (!pedido || !pedido.items || !Array.isArray(pedido.items)) {
          console.error("❌ Pedido inválido recebido:", pedido);
          return res
            .status(500)
            .json({ error: "Erro ao processar pedido. Estrutura incorreta." });
        }

        // Busca detalhes do Spring Boot
        const detalhes = await Promise.all(
          pedido.items.map(async (it) => {
            const resp = await fetch(`${backendApiUrl}/burguers/${it.id}`);
            if (!resp.ok) {
              console.error(
                `❌ Erro ao buscar prato com ID ${it.id}: ${
                  resp.status
                } ${await resp.text()}`
              );
              throw new Error("Erro ao buscar prato no backend");
            }

            if (!resp.ok) throw new Error("Erro ao buscar prato no backend");
            const p = await resp.json();
            return { ...p, qtd: it.qtd };
          })
        );

        req.session.lastMsg = pedido; // Guardava o pedido na sessão
        console.log("✅ Detalhes prontos para o frontend:", detalhes);

        res.json({ detalhes });
      } catch (err) {
        console.error("❌ Erro ao chamar pedido:", err);
        res.status(500).json({ error: "Erro ao chamar pedido." });
      }
    });

    app.post("/cozinha/pedidos/entregar", (req, res) => {
      ackOrder();
      res.json({ success: true });
    });

    app.post("/cozinha/pedidos/cancelar", (req, res) => {
      nackOrder();
      res.json({ success: true });
    });

    // Rota que renderiza a tela de pedidos ejs
    app.get("/pedidos", (req, res) => {
      res.render("pedidos.ejs", { isLoggedIn: req.session.isLoggedIn });
    });

    app.listen(port, () =>
      console.log(`🚀 Cozinha ouvindo em http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ Não foi possível iniciar RabbitMQ:", err);
    process.exit(1);
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
