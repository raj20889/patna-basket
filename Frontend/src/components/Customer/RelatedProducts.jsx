import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import axios from 'axios';

const RelatedProducts = ({ products, onCartUpdate, cart: parentCart, loading: parentLoading }) => {
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState({});
  const [localLoading, setLocalLoading] = useState({});
  const token = localStorage.getItem('token');

  // ✅ Initialize and sync with parent cart state
  useEffect(() => {
    const initializeCart = () => {
      const initialCart = {};
      
      if (Array.isArray(parentCart)) {
        parentCart.forEach(item => {
          const productId = item.productId?._id || item._id;
          initialCart[productId] = item.quantity;
        });
      }
      
      setLocalCart(initialCart);
    };

    initializeCart();
  }, [parentCart]);

  // ✅ Sync loading states
  useEffect(() => {
    if (parentLoading && typeof parentLoading === 'object') {
      setLocalLoading(parentLoading);
    }
  }, [parentLoading]);

  // ✅ Fetch updated cart after any cart update
  const fetchCart = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && onCartUpdate) {
        const count = response.data.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const total = response.data.itemsTotal || 0;
        onCartUpdate(count, total);
        
        // Update localCart with fresh data
        const updatedCart = {};
        response.data.products.forEach(item => {
          const productId = item.productId?._id || item._id;
          updatedCart[productId] = item.quantity;
        });
        setLocalCart(updatedCart);
      }
    } catch (err) {
      console.error('Error fetching updated cart:', err);
    }
  };

  // ✅ Update cart function
  const updateCart = async (productId, newQuantity) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.msg === 'Cart updated successfully') {
        await fetchCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating cart:', err);
      return false;
    }
  };

  const handleChange = async (productId, change) => {
    const currentQty = localCart[productId] || 0;
    const newQty = currentQty + change;
    if (newQty < 0) return;

    setLocalLoading(prev => ({ ...prev, [productId]: true }));
    setLocalCart(prev => ({ ...prev, [productId]: newQty }));

    try {
      const success = await updateCart(productId, newQty);
      if (!success) {
        setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
      }
    } catch (err) {
      console.error('Error updating cart', err);
      setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
    } finally {
      setLocalLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

  // ✅ Filter dairy-related products safely
  const dairyProducts = (Array.isArray(products) ? products : []).filter(product => {
    const lowerName = (product.category || '').toLowerCase();
    return lowerName.includes('milk') ||
           lowerName.includes('bread') ||
           lowerName.includes('egg');
  });

  if (dairyProducts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Dairy &amp; Bread</h2>
        <button
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate('/category/dairy')}
        >
          See all
        </button>
      </div>

      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {dairyProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={localCart[product._id] || 0}
              isLoading={localLoading[product._id]}
              handleAddToCart={handleAddToCart}
              handleChange={handleChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;