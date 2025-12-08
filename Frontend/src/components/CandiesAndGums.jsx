import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductComponent from './ProductComponent';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, setCart } from '../redux/cartSlice';
import axios from 'axios';

const CandiesAndGums = ({ products = [] }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const userIsLoggedIn = !!localStorage.getItem("token");

  const productMap = products.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const handleCartChange = async (productId, change) => {
    const currentQty = cartItems.find(item => item.productId === productId)?.quantity || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    try {
      if (!userIsLoggedIn) {
        const product = productMap[productId];
        if (!product) return;

        if (newQty > 0) {
          dispatch(addToCart({ productId, name: product.name, price: product.price, image: product.image, quantity: newQty }));
        } else {
          dispatch(removeFromCart({ productId }));
        }
      } else {
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

  // Filter candies and gums related products
  const candyGumProducts = products.filter(product => {
    const lowerName = product.category.toLowerCase();
    return lowerName.includes('candy') || 
           lowerName.includes('gum') || 
           lowerName.includes('chocolate') ||
           lowerName.includes('lollipop') ||
           lowerName.includes('sweets') ||
           lowerName.includes('mint');
  });

  if (candyGumProducts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Candies & Gums</h2>
        <button 
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate('/category/candies')}
        >
          See all
        </button>
      </div>
      
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth scrollbar-hide gap-4 pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <ProductComponent 
            products={candyGumProducts}
            cart={cartItems}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            horizontalScroll
          />
        </div>
        
        {/* Navigation Arrows */}
        {candyGumProducts.length > 4 && (
          <>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100" onClick={() => scroll('left')}>
              <FiChevronLeft size={20} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100" onClick={() => scroll('right')}>
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CandiesAndGums;