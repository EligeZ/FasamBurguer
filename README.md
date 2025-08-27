# 🍔 FasamBurguer

## 🇧🇷 Sobre o Projeto

O **FasamBurguer** é um sistema desenvolvido para gerenciar pedidos de uma hamburgueria, cobrindo desde o atendimento até o acompanhamento da cozinha.  
Ele foi criado como projeto acadêmico, mas pode ser expandido para uso em ambientes reais de pequenos negócios.

O sistema permite:

- Registrar pedidos dos clientes.
- Acompanhar o status dos pedidos na cozinha.
- Organizar fluxo de trabalho e tempo de preparo.
- Usar mensageria com **RabbitMQ** para comunicação entre serviços.

---

## 🇺🇸 About the Project

**FasamBurguer** is a system developed to manage orders for a burger restaurant, covering everything from customer service to kitchen monitoring.  
It was originally built as an academic project but can be expanded for real-world use in small businesses.

The system allows you to:

- Register customer orders.
- Track order status in the kitchen.
- Organize workflow and preparation time.
- Use messaging with **RabbitMQ** for service communication.

---

## 🚀 Tecnologias / Technologies

O projeto foi construído usando uma arquitetura modular, com as seguintes tecnologias principais:

- **Backend:**

  - **Java** e **Spring Boot**: Para o desenvolvimento da API de gerenciamento de pedidos.
  - **Maven**: Gerenciamento de dependências.
  - **SQL**: Banco de dados relacional para armazenar dados de pedidos e clientes.

- **Frontend:**

  - **HTML, CSS, JavaScript**: Para a interface do cliente e do painel da cozinha.
  - **Node.js**: Backend para o painel da cozinha, facilitando a comunicação em tempo real.

- **Mensageria:**
  - **RabbitMQ**: Utilizado para a comunicação assíncrona entre o backend e o painel da cozinha, garantindo que as atualizações de pedidos sejam rápidas e confiáveis.

---

## 📂 Estrutura / Structure

```
FasamBurguer/
├─ Cozinha/                      # Painel da cozinha (Node.js + EJS)
├─ FASAM BURGUER/
│  └─ FASAM BURGUER/            # Site do cliente (estático)
└─ rotina/                       # Back-end (Spring Boot)
```

---

## 🛠️ Melhorias Futuras / Future Improvements

- Melhorar o design da tela da cozinha (mais intuitiva e responsiva).
- Aprimorar a modelagem e normalização do banco de dados.
- Implementar **React** para front-end moderno e dinâmico.
- Criar testes unitários e de integração para maior confiabilidade.

---

## 🚀 Como rodar (passo a passo)

0. Pré-requisitos

Java 17+

Node.js 18+ e npm

(Opcional) RabbitMQ local (padrão: guest/guest)

1. Back-end (Spring Boot)

# Windows

cd rotina
mvnw.cmd clean spring-boot:run

# macOS / Linux

cd rotina
./mvnw clean spring-boot:run

Porta padrão mais comum: 8080 (ajuste no application.properties se necessário).

2. Painel da Cozinha (Node + EJS)
   cd Cozinha
   npm install

# Se existir script "start":

npm start

# Caso não exista, execute:

node index.js

Porta comum: 3000 (caso use PORT, ajuste no .env ou no próprio index.js).

3. Site do Cliente (estático)

# Caminho tem espaço: use aspas no terminal

cd "FASAM BURGUER/FASAM BURGUER"

# Opção 1: npx (recomendado)

npx live-server

# Opção 2: extensão Live Server (VS Code) > "Open with Live Server"

A página abre em uma porta local (ex.: 5500 ou similar).

## 🧩 Integrações e Mensageria

RabbitMQ

Painel: http://localhost:15672

Usuário: guest | Senha: guest (padrão local)

Ajuste URLs do back-end no front (cozinha/cliente) se o back-end não estiver em http://localhost:8080.

---

## 👨‍💻 Autor / Author

Desenvolvido por **Luiz Gustavo Cardoso Resende**  
📌 [GitHub](https://github.com/EligeZ)
