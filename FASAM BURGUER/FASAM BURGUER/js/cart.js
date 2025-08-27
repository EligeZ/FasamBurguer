import { getCart, setCart } from "./cartUtils.js";

// Getting from HTML
const cartNotify = document.querySelector(".cartNotify");
// Functions
const addToCart = (id) => {
  const cart = getCart();

  if (cart.length > 0) {
    let wasModified = false;

    cart.forEach((item) => {
      if (item.id === id) {
        item.qtd += 1;
        wasModified = true;
      }
    });

    !wasModified && cart.push({ id: id, qtd: 1 });
  } else cart.push({ id: id, qtd: 1 });

  setCart(cart);
  notification.showToast();
  showingNotifications();
};

const showingNotifications = () => {
  const cart = getCart();

  if (cart.length > 0) cartNotify.style.display = "block";
};

// Notifications
const notification = Toastify({
  text: "Produto adicionado no carrinho de compras.",
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

showingNotifications();
window.addToCart = addToCart;
