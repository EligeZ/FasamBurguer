import { getCart, setCart } from "./cartUtils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Se for o primeiro acesso, zera o carrinho
  if (!localStorage.getItem("visited")) {
    localStorage.setItem("cart", JSON.stringify([]));
    localStorage.setItem("visited", "true");
  }

  // Getting from HTML
  const showItems = document.querySelector("#showItems"); // Left
  if (!window.allProducts || window.allProducts.length === 0) {
    const storedProducts = localStorage.getItem("allProducts");
    if (storedProducts) {
      window.allProducts = JSON.parse(storedProducts);
      console.log("Produtos recuperados do localStorage:", window.allProducts);
    } else {
      console.warn("Nenhum produto encontrado no localStorage.");
    }
  }

  // Right
  const showAllItemsValue = document.querySelector("#showAllItemsValue");
  const showDelivery = document.querySelector("#showDelivery");
  const showDiscount = document.querySelector("#showDiscount");
  const showTotal = document.querySelector("#showTotal");
  const btnWantDelivery = document.querySelector("#wantDelivery");
  const btnDontWantDelivery = document.querySelector("#dontWantDelivery");
  const btnGenerateOrder = document.querySelector("#generateOrder");

  // Items
  let cart;
  let itemsToShow;
  let allItemsValue;
  let deliveryValue = 0;
  let discountValue = 0;

  // Funções
  const generateCart = () => {
    const cartItems = getCart();

    cart = [];
    allItemsValue = 0;

    // Certifique-se de que window.allProducts está disponível
    const availableProducts = window.allProducts || [];

    cartItems.forEach((prodInCart) => {
      // Encontra o item correspondente nos produtos carregados do backend
      const item = availableProducts.find(
        (element) => element.id === prodInCart.id
      );
      if (item) {
        // Garante que o item foi encontrado
        item.qtd = prodInCart.qtd; // Adiciona a quantidade do carrinho ao objeto do produto
        allItemsValue += item.preco * item.qtd; // Use item.preco do backend
        cart.push(item);
      }
    });

    return cart;
  };

  const addItemToItemsToShow = (prod) => {
    const price = (prod.preco * prod.qtd)
      .toFixed(2)
      .toString()
      .replace(".", ","); // Use prod.preco

    itemsToShow += `
    <div class="item">
        <img src="../img/${prod.img || "burger.png"}" alt="Imagem de um(a) ${
      prod.nome
    }"> <div>
            <p class="title">${prod.nome}</p>
            <p>${prod.descricao}</p>
            <div class="bottom">
                <div class="counter">
                    <button onclick="remItem(${prod.id})">-</button>
                    <input type="text" value="${prod.qtd}" disabled>
                    <button onclick="addItem(${prod.id})">+</button>
                </div>
                <p class="price">R$ <span>${price}</span></p>
            </div>
        </div>
    </div>
    <hr>`;
  };

  const addItem = (id) => {
    const cartItems = getCart();
    const newCartItems = [];

    cartItems.forEach((item) => {
      if (item.id === id) newCartItems.push({ id: item.id, qtd: item.qtd + 1 });
      else newCartItems.push({ id: item.id, qtd: item.qtd });
    });

    setCart(newCartItems);
    init();
  };

  const remItem = (id) => {
    const cartItems = getCart();
    const newCartItems = [];

    cartItems.forEach((item) => {
      if (item.id === id && item.qtd > 1)
        newCartItems.push({ id: item.id, qtd: item.qtd - 1 });
      else if (item.id === id && item.qtd <= 1)
        itemRemovedNotification.showToast();
      else newCartItems.push({ id: item.id, qtd: item.qtd });
    });

    setCart(newCartItems);
    init();
  };

  window.addItem = addItem;
  window.remItem = remItem;

  const chooseDelivery = (option) => {
    if (option) {
      btnWantDelivery.classList.add("active");
      btnDontWantDelivery.classList.remove("active");

      deliveryValue = 3;
    } else {
      btnWantDelivery.classList.remove("active");
      btnDontWantDelivery.classList.add("active");

      deliveryValue = 0;
    }

    init();
  };

  const init = () => {
    const generatedCart = generateCart();
    generatedCart.length > 0 &&
      generatedCart.sort((a, b) =>
        a.type < b.type ? -1 : a.type > b.type ? 1 : 0
      );

    itemsToShow = "";
    showItems.innerHTML = "";

    if (generatedCart.length > 0)
      generatedCart.forEach((data) => addItemToItemsToShow(data));
    else itemsToShow = "<p>Você ainda não adicionou itens no carrinho.</p>";

    showOnPage();
  };

  const showOnPage = () => {
    showItems.innerHTML = itemsToShow;

    const totalValue = allItemsValue + deliveryValue;
    showAllItemsValue.innerHTML =
      "R$ " + allItemsValue.toFixed(2).toString().replace(".", ",");
    showDelivery.innerHTML =
      "+ R$ " + deliveryValue.toFixed(2).toString().replace(".", ",");
    showDiscount.innerHTML =
      "- R$ " +
      ((totalValue * discountValue) / 100)
        .toFixed(2)
        .toString()
        .replace(".", ",");
    showTotal.innerHTML =
      "R$ " +
      (totalValue - (totalValue * discountValue) / 100)
        .toFixed(2)
        .toString()
        .replace(".", ",");
  };

  const generateOrder = () => {
    const cartItems = getCart();

    if (cartItems.length === 0) {
      return noItemsInCart.showToast();
    }

    const payload = {
      mesa: null, // ou um número como 3, se quiser forçar — pode deixar null por enquanto
      items: cartItems.map((item) => ({
        id: item.id,
        qtd: item.qtd,
      })),
    };

    fetch("http://localhost:9090/fila/pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          // Captura o texto da resposta (mesmo com erro)
          return response.text().then((text) => {
            throw new Error(`❌ Erro do servidor: ${text}`);
          });
        }
        return response.text(); // Caso esteja tudo certo
      })
      .then((msg) => {
        alert(msg); // Exibe a mensagem de sucesso
        localStorage.removeItem("cart");
        init(); // Atualiza a tela
      })
      .catch((err) => {
        console.error(err);
        alert(err.message); // Agora mostra a mensagem real do backend
      });
  };

  // Notifications
  const itemRemovedNotification = Toastify({
    text: "Produto removido do carrinho de compras.",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: "#262f63",
      boxShadow: "0 0 160px 0 #0008",
    },
  });
  const noItemsInCart = Toastify({
    text: "Não é possível gerar pedido sem ter item no carrinho.",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: "#262f63",
      boxShadow: "0 0 160px 0 #0008",
    },
  });

  btnWantDelivery.addEventListener("click", function () {
    chooseDelivery(true);
  });
  btnDontWantDelivery.addEventListener("click", function () {
    chooseDelivery(false);
  });
  btnGenerateOrder.addEventListener("click", generateOrder);

  init();
});
