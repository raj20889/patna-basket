import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductComponent from './ProductComponent';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, setCart } from '../redux/cartSlice';
import axios from 'axios';

const RelatedProducts = ({ products = [] }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const userIsLoggedIn = !!localStorage.getItem("token"); // Assuming token presence indicates login

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Build product map for faster cart calculations
  const productMap = products.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});

  // Handle cart changes
  const handleCartChange = async (productId, change) => {
    const currentQty = cartItems.find(item => item.productId === productId)?.quantity || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    try {
      if (!userIsLoggedIn) {
        // Guest cart
        const product = productMap[productId];
        if (!product) return;

        if (newQty > 0) {
          dispatch(addToCart({ productId, name: product.name, price: product.price, image: product.image, quantity: newQty }));
        } else {
          dispatch(removeFromCart({ productId }));
        }
      } else {
        // User cart
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
          { productId, quantity: newQty },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.products) {
          const serverCartMap = {};
          res.data.products.forEach((item) => {
            serverCartMap[item.productId._id] = item.quantity;
          });

          dispatch(setCart(serverCartMap));
        }
      }
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  // Safely filter dairy-related products
  const dairyProducts = (products || []).filter(product => {
    if (!product || !product.name) return false;
    
    const lowerName = product.category.toLowerCase();
    return lowerName.includes('milk') || 
           lowerName.includes('bread') || 
           lowerName.includes('egg') ||
           lowerName.includes('cheese') ||
           lowerName.includes('butter') ||
           lowerName.includes('yogurt');
  });

  // Don't render if no products found
  if (!dairyProducts.length) {
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
        <ProductComponent 
          products={dairyProducts}
          cart={cartItems}
          onCartChange={handleCartChange}
          isLoggedIn={userIsLoggedIn}
          scrollRef={scrollRef}
        />
        
        {/* Navigation Arrows */}
        {dairyProducts.length > 4 && (
          <>
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
              onClick={scrollLeft}
            >
              <FiChevronLeft size={20} />
            </button>
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
              onClick={scrollRight}
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;