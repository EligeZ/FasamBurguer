DOCUMENTAÇÃO TÉCNICA – BlogFunctions

1. Visão Geral
O BlogFunctions é um projeto de blog simples, porém funcional, desenvolvido como parte do curso Full-Stack Web Development da Dr. Angela Yu. O sistema permite que os usuários publiquem, editem e excluam postagens. Utiliza tecnologias como Node.js, Express, EJS, CSS e JavaScript.

2. Tecnologias Utilizadas

Node.js

Express

EJS (Embedded JavaScript Templates)

JavaScript

CSS

3. Estrutura de Diretórios

BlogFunctions/
├── node_modules/           # Dependências do projeto
├── public/
│   └── styles/             # Arquivos CSS
├── views/                  # Templates EJS
├── index.js                # Arquivo principal do servidor
├── package.json            # Gerenciador de dependências e scripts
└── package-lock.json       # Controle de versões das dependências

4. Funcionalidades

Criar Postagens

Editar Postagens

Excluir Postagens

Visualizar Postagens

5. Instalação e Execução
Pré-requisitos:

Node.js instalado

Passos:

git clone https://github.com/EligeZ/BlogFunctions.git

cd BlogFunctions

npm install

node index.js

Acesse: http://localhost:3000

6. Comentários sobre o Código

O arquivo index.js contém rotas para home, criação e leitura de posts, e uso do EJS para renderização dinâmica. Utiliza um array local para armazenar os posts.

7. Possíveis Melhorias

Persistência com banco de dados (ex: MongoDB)

Autenticação de usuários

Validação de formulários

Editor de texto rico

Sistema de comentários

8. Licença

Projeto criado para fins educacionais no curso da Dr. Angela Yu.
