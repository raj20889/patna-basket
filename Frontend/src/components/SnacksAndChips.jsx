import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductComponent from './ProductComponent';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, setCart } from '../redux/cartSlice';
import axios from 'axios';

const SnacksAndChips = ({ products = [] }) => {
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

  // Filter snacks and chips related products
  const snacksProducts = products.filter(product => {
    const lowerName = product.category.toLowerCase();
    return lowerName.includes('chips') || 
           lowerName.includes('snack') || 
           lowerName.includes('crisps') ||
           lowerName.includes('popcorn') ||
           lowerName.includes('nuts') ||
           lowerName.includes('pretzel');
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
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth scrollbar-hide gap-4 pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <ProductComponent 
            products={snacksProducts}
            cart={cartItems}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            horizontalScroll
          />
        </div>
        
        {/* Navigation Arrows */}
        {snacksProducts.length > 4 && (
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

export default SnacksAndChips;