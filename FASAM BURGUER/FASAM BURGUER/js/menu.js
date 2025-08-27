// Getting from HTML
const menuContainer = document.querySelector("#showMenu");
const promotionsContainer = document.querySelector("#showPromotions");

// Buttons show menu
const showAllBtn = document.querySelector("#showAll");
const showSnacksBtn = document.querySelector("#showSnacks");
const showCombosBtn = document.querySelector("#showCombos");
const showPortionsBtn = document.querySelector("#showPortions");
const showDrinksBtn = document.querySelector("#showDrinks");

// URL do seu backend Spring Boot
const BACKEND_API_URL = "http://localhost:9090/burguers";

// Variável para armazenar os produtos do backend
let allProducts = [];

// Funções Auxiliares
const clearItems = (container) => {
  container.innerHTML = "";
};

const removeClasses = () => {
  showAllBtn.classList.remove("active");
  showSnacksBtn.classList.remove("active");
  showCombosBtn.classList.remove("active");
  showPortionsBtn.classList.remove("active");
  showDrinksBtn.classList.remove("active");
};

const checkIfHaveItem = (container, itemsHtml) => {
  if (itemsHtml === "") {
    container.innerHTML = "<p>Nenhum produto encontrado!</p>";
  } else {
    container.innerHTML = itemsHtml;
  }
};

const createProductCard = (prod, isPromotion = false) => {
  let price = prod.preco.toFixed(2).toString().replace(".", ","); // Use 'preco' do backend
  let lastPriceHtml = "";

  // Se houver uma lógica de "promoção" no seu backend, adapte aqui.
  // Por enquanto, vamos assumir que 'lastPrice' vem diretamente ou é calculada.
  // Se 'lastPrice' não existe no backend, você terá que decidir como gerenciar promoções.
  // Para este exemplo, vou manter a lógica de lastPrice como existia,
  // mas você precisará adaptar se o backend não a fornece diretamente.
  // Para simplificar, vou assumir que 'lastPrice' virá do backend se um item for promocional.
  // Ou, se promoções são um conceito interno do frontend, pode ser mais complexo.
  if (isPromotion && prod.lastPrice && prod.lastPrice != 0) {
    // Assumindo que backend pode retornar lastPrice
    let lastPrice = prod.lastPrice.toFixed(2).toString().replace(".", ",");
    lastPriceHtml = `<p class="lastPrice">R$ <span>${lastPrice}</span></p>`;
  }

  // Assumindo que 'prod.img' é um campo que seu backend fornece ou que você tem uma imagem padrão.
  // Se você não armazena o caminho da imagem no backend, terá que usar uma imagem genérica.
  // Para o exemplo, vamos assumir que `prod.img` existe. Se não existir, use `burger.png` ou similar.
  const imgPath = prod.img ? `./img/${prod.img}` : "./img/burger.png";

  return `
        <div class="card">
            <div>
                <div class="cardImg">
                    <img src="${imgPath}" alt="Imagem de um(a) ${prod.nome}">
                </div>
                <h4>${prod.nome}</h4>
                <p>${prod.descricao}</p>
            </div>
            <div>
                ${lastPriceHtml}
                <p class="price">R$ <span>${price}</span></p>
                <button class="btn" onclick="addToCart(${prod.id})">
                    <span class="iconify-inline" data-icon="mdi:cart-plus"></span> Adicionar
                </button>
            </div>
        </div>`;
};

// Funções Principais

// ** Nova função para buscar os produtos do backend **
const fetchProductsFromBackend = async () => {
  try {
    const response = await fetch(BACKEND_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allProducts = await response.json();
    console.log("Produtos carregados do backend:", allProducts);
    // *** TORNE allProducts GLOBALMENTE ACESSÍVEL ***
    window.allProducts = allProducts; // Adicione esta linha!

    // Salva os produtos no localStorage para usar na página do carrinho
    localStorage.setItem("allProducts", JSON.stringify(allProducts));

    showProducts(0);
    allPromotions();
  } catch (error) {
    console.error("Erro ao buscar produtos do backend:", error);
    menuContainer.innerHTML =
      "<p>Erro ao carregar o cardápio. Por favor, tente novamente mais tarde.</p>";
    promotionsContainer.innerHTML = "<p>Erro ao carregar promoções.</p>";
  }
};

const showProducts = (type) => {
  clearItems(menuContainer);
  let itemsHtml = "";

  // Filtrar os produtos baseado no tipo (se o seu backend tiver um campo 'type')
  // Se o seu backend não tiver um campo 'type' (como no Burguer original, que tinha nome, preco, descricao),
  // você precisará definir uma lógica para categorizar os itens no frontend,
  // ou adicionar um campo 'tipo' no seu model Burguer no Spring Boot e no banco de dados.
  // Para este exemplo, vou assumir que você tem um campo 'type' (como 1 para Snack, 2 para Combo, etc.)
  // no seu modelo Burguer no Spring Boot.
  // Se não tiver, TODOS os itens serão "snacks" ou você terá que adaptar a lógica de filtragem.
  // Ou, altere os botões para filtrar por outras características.
  const filteredProducts = allProducts.filter((prod) => {
    // Se 'type' for 0, mostra todos que não são promoção
    if (type === 0) {
      // Assumindo que promoções têm lastPrice > 0 ou um campo 'isPromotion'
      return !prod.lastPrice || prod.lastPrice === 0;
    }
    // Caso contrário, filtra pelo tipo e não promoções
    return prod.type === type && (!prod.lastPrice || prod.lastPrice === 0);
  });

  if (filteredProducts.length > 0) {
    filteredProducts.forEach((prod) => {
      itemsHtml += createProductCard(prod);
    });
  }

  checkIfHaveItem(menuContainer, itemsHtml);
  removeClasses();

  if (type === 0) showAllBtn.classList.add("active");
  else if (type === 1) showSnacksBtn.classList.add("active");
  else if (type === 2) showCombosBtn.classList.add("active");
  else if (type === 3) showPortionsBtn.classList.add("active");
  else if (type === 4) showDrinksBtn.classList.add("active");
};

const allPromotions = () => {
  clearItems(promotionsContainer);
  let itemsHtml = "";

  const promotionProducts = allProducts.filter(
    (prod) => prod.lastPrice && prod.lastPrice != 0
  );

  if (promotionProducts.length > 0) {
    promotionProducts.forEach((prod) => {
      itemsHtml += createProductCard(prod, true); // Passa true para indicar que é promoção
    });
  }

  if (itemsHtml === "") {
    promotionsContainer.innerHTML =
      "<p>Nenhuma promoção hoje, tente novamente amanhã! =(</p>";
  } else {
    promotionsContainer.innerHTML = itemsHtml;
  }
};

// Capturing button clicks
showAllBtn.addEventListener("click", () => showProducts(0));
showSnacksBtn.addEventListener("click", () => showProducts(1));
showCombosBtn.addEventListener("click", () => showProducts(2));
showPortionsBtn.addEventListener("click", () => showProducts(3));
showDrinksBtn.addEventListener("click", () => showProducts(4));

// ** Inicialização: Carrega os produtos do backend quando o script é carregado **
fetchProductsFromBackend();
