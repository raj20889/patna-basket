import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the CartContext
const CartContext = createContext();

// CartProvider component which provides context to children components
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchCartData = async () => {
      if (role !== 'admin') {
        if (!token) {
          // For guest users, load from localStorage
          const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
          const guestCartMap = {};
          guestCart.forEach(item => {
            guestCartMap[item.productId] = item.quantity;
          });
          setCart(guestCartMap);
          calculateAndUpdateCart(guestCart);
        } else {
          // For logged-in users, fetch cart data from the server
          try {
            const res = await axios.get('http://localhost:5000/api/cart', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const cartData = res.data;
            const serverCartMap = {};
            
            cartData?.products?.forEach(item => {
              serverCartMap[item.productId._id] = item.quantity;
            });

            setCart(serverCartMap);
            calculateAndUpdateCart(cartData?.products || []);
          } catch (err) {
            console.error('Error fetching cart:', err);
          }
        }
      }
    };

    fetchCartData();
  }, [role, token]);

  const calculateAndUpdateCart = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);
    setCartCount(count);
    setTotalPrice(total);
  };

  const handleCartChange = async (productId, change) => {
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    try {
      if (!token) {
        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const index = guestCart.findIndex(item => item.productId === productId);

        if (index > -1) {
          if (newQty > 0) {
            guestCart[index].quantity = newQty;
          } else {
            guestCart.splice(index, 1);
          }
        } else if (newQty > 0) {
          guestCart.push({
            productId,
            quantity: newQty,
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        calculateAndUpdateCart(guestCart);
      } else {
        const res = await axios.post("http://localhost:5000/api/cart/add", 
          { productId, quantity: newQty },
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        if (res.data?.products) {
          calculateAndUpdateCart(res.data.products);
        }
      }
    } catch (err) {
      console.error("Error updating cart", err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, totalPrice, handleCartChange }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to access the CartContext
export const useCart = () => {
  return useContext(CartContext);
};

// Export the context and provider
export { CartContext, CartProvider };
