import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductComponent from './ProductComponent';

const ColdDrinksJuices = ({ products = [], onCartChange, cart = [], loading, isLoggedIn }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Filter drinks products
  const drinksProducts = products.filter(product => {
    if (!product || !product.name) return false;
    const lowerName = product.category.toLowerCase();
    return lowerName.includes('juice') || 
           lowerName.includes('sprite') || 
           lowerName.includes('cola') ||
           lowerName.includes('drink') ||
           lowerName.includes('beverage');
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cold Drinks & Juices</h2>
          <button className="text-blue-500 text-sm font-medium">See all</button>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (drinksProducts.length === 0) return null;

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cold Drinks & Juices</h2>
        <button 
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate('/category/beverages')}
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
            products={drinksProducts}
            cart={cart}
            onCartChange={onCartChange}
            isLoggedIn={isLoggedIn}
            horizontalScroll
          />
        </div>
        
        {drinksProducts.length > 4 && (
          <>
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
              onClick={() => scroll('left')}
            >
              <FiChevronLeft size={20} />
            </button>
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
              onClick={() => scroll('right')}
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ColdDrinksJuices;