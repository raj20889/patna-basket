import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

const SnacksAndChips = ({ products, onCartUpdate, cart: parentCart, loading: parentLoading }) => {
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState({});
  const [localLoading, setLocalLoading] = useState({});

  // Sync with parent cart state
  useEffect(() => {
    if (parentCart) {
      setLocalCart(parentCart);
    }
  }, [parentCart]);

  useEffect(() => {
    if (parentLoading) {
      setLocalLoading(parentLoading);
    }
  }, [parentLoading]);

  const updateCart = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = token ? 'api/cart/add' : 'api/guest-cart/add';
      
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      const data = await response.json();
      if (response.ok) {
        setLocalCart(prev => ({
          ...prev,
          [productId]: newQuantity > 0 ? newQuantity : undefined
        }));
        
        if (onCartUpdate) {
          const cartResponse = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            const count = cartData.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const total = cartData.products?.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0) || 0;
            onCartUpdate(count, total);
          }
        }
        
        return true;
      } else {
        console.error("Error updating cart:", data.msg);
        return false;
      }
    } catch (err) {
      console.error("Error updating cart:", err);
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
      console.error("Error updating cart", err);
      setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
    } finally {
      setLocalLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

  // Filter snacks and chips products
  const snacksProducts = products.filter(product => {
    const lowerCategory = product.category.toLowerCase();
    const lowerName = product.name.toLowerCase();
    return lowerCategory.includes('snack') || 
           lowerCategory.includes('chip') ||
           lowerName.includes('snack') || 
           lowerName.includes('chip') ||
           lowerName.includes('crisp') ||
           lowerName.includes('pretzel') ||
           lowerName.includes('popcorn') ||
           lowerName.includes('nuts') ||
           lowerName.includes('cracker');
  });

  if (snacksProducts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Snacks &amp; Chips</h2>
        <button 
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate('/category/snacks')}
        >
          See all
        </button>
      </div>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {snacksProducts.map(product => (
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
        
        {/* Navigation Arrows */}
        {snacksProducts.length > 4 && (
          <>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
              <FiChevronLeft size={20} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SnacksAndChips;