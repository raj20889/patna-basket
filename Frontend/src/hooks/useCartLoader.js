import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setCart } from '../redux/cartSlice';
import axios from 'axios';

const useCartLoader = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      console.log("useCartLoader: Initializing guest cart from localStorage.");
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
      console.log("useCartLoader: guestCart from localStorage:", guestCart);
      const itemsTotal = guestCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      const selectedTip = 0;
      const donationSelected = false;
      const grandTotal = itemsTotal + 2 + selectedTip + (donationSelected ? 1 : 0);
      
      dispatch(setCart({
        cartItems: guestCart,
        itemsTotal,
        deliveryCharge: 0,
        handlingCharge: 2,
        tipAmount: selectedTip,
        donationAmount: donationSelected ? 1 : 0,
        grandTotal
      }));
      console.log("useCartLoader: Dispatched guest cart to Redux.");
    }
  }, [dispatch, token]);

  const fetchCart = useCallback(async () => {
    console.log("useCartLoader: fetchCart called.");
    try {
      if (token) {
        console.log("useCartLoader: Fetching cart for logged-in user.");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("useCartLoader: Cart API response:", res.data);
        
        if (res.data) {
          dispatch(setCart({
            cartItems: res.data.products?.map(item => ({
              productId: item.productId._id,
              name: item.productId.name,
              price: item.productId.price,
              quantity: item.quantity,
              image: item.productId.image,
              variant: item.productId.variant || '1 unit'
            })) || [],
            itemsTotal: res.data.itemsTotal || 0,
            deliveryCharge: res.data.deliveryCharge || 0,
            handlingCharge: res.data.handlingCharge || 2,
            tipAmount: res.data.tipAmount || 0,
            donationAmount: res.data.donationAmount || 0,
            grandTotal: res.data.grandTotal || 0
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (token) {
      fetchCart();
    }

    const handleCartUpdate = () => {
      if (token) {
        fetchCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCart, token]);

  return { fetchCart };
};

export default useCartLoader;
