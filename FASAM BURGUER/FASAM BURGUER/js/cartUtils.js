export const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
export const setCart = (cartData) =>
  localStorage.setItem("cart", JSON.stringify(cartData));
