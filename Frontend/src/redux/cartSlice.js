import { createSlice } from '@reduxjs/toolkit';

const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('guestCart');
    console.log("localStorage: Raw guestCart from getItem:", serializedCart);
    if (serializedCart === null) {
      console.log("localStorage: guestCart is empty or null.");
      return [];
    }
    const parsedCart = JSON.parse(serializedCart);
    console.log("localStorage: Loaded guestCart:", parsedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Error loading cart from local storage:", error);
    return [];
  }
};

const saveCartToLocalStorage = (cart) => {
  try {
    console.log("localStorage: Saving guestCart:", cart);
    const serializedCart = JSON.stringify(cart);
    console.log("localStorage: Stringified guestCart for setItem:", serializedCart);
    localStorage.setItem('guestCart', serializedCart);
  } catch (error) {
    console.error("Error saving cart to local storage:", error);
  }
};

const calculateTotals = (items) => {
  let totalQuantity = 0;
  let totalPrice = 0;
  items.forEach(item => {
    totalQuantity += item.quantity;
    totalPrice += item.quantity * item.price;
  });
  return { totalQuantity, totalPrice };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: (() => {
    const initialItems = loadCartFromLocalStorage();
    const { totalQuantity, totalPrice } = calculateTotals(initialItems);
    return {
      items: initialItems,
      totalQuantity,
      totalPrice,
    };
  })(),
  reducers: {
    addToCart: (state, action) => {
      const { productId, name, price, image, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        state.items.push({ productId, name, price, image, quantity });
      }
      saveCartToLocalStorage(state.items);
      const { totalQuantity: newTotalQuantity, totalPrice: newTotalPrice } = calculateTotals(state.items);
      state.totalQuantity = newTotalQuantity;
      state.totalPrice = newTotalPrice;
    },
    removeFromCart: (state, action) => {
      console.log("removeFromCart reducer: called with payload:", action.payload);
      const productIdToRemove = action.payload.productId; // Access productId from payload
      state.items = state.items.filter(item => item.productId !== productIdToRemove);
      console.log("removeFromCart reducer: items after filter:", state.items);
      saveCartToLocalStorage(state.items);
      const { totalQuantity: newTotalQuantity, totalPrice: newTotalPrice } = calculateTotals(state.items);
      state.totalQuantity = newTotalQuantity;
      state.totalPrice = newTotalPrice;
      console.log("removeFromCart reducer: new totalQuantity:", state.totalQuantity, "new totalPrice:", state.totalPrice);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity = quantity;
        // Do not remove item when quantity is 0, just set the quantity to 0
        // The ProductDetails component will handle displaying the "Add to Cart" button when quantity is 0
      }
      saveCartToLocalStorage(state.items);
      const { totalQuantity: newTotalQuantity, totalPrice: newTotalPrice } = calculateTotals(state.items);
      state.totalQuantity = newTotalQuantity;
      state.totalPrice = newTotalPrice;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      saveCartToLocalStorage(state.items);
    },
    setCart: (state, action) => {
      console.log("Redux: Setting cart with payload:", action.payload);
      state.items = action.payload.cartItems || [];
      const { totalQuantity: newTotalQuantity, totalPrice: newTotalPrice } = calculateTotals(state.items);
      state.totalQuantity = newTotalQuantity;
      state.totalPrice = newTotalPrice;
      saveCartToLocalStorage(state.items);
    },
    handleStockUpdate: (state, action) => {
      const { productId, stock } = action.payload;
      const existingItem = state.items.find(item => item.productId === productId);
      if (existingItem) {
        // Adjust quantity to match available stock
        existingItem.quantity = Math.min(existingItem.quantity, stock);
        if (stock === 0) {
          // Remove item if stock is zero
          state.items = state.items.filter(item => item.productId !== productId);
        }
      }
      saveCartToLocalStorage(state.items);
      const { totalQuantity, totalPrice } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalPrice = totalPrice;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart, handleStockUpdate } = cartSlice.actions;
export default cartSlice.reducer;