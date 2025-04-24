import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductComponent from './ProductComponent';

const ColdDrinksJuices = ({ products, onCartChange, cart, loading, isLoggedIn }) => {
  const navigate = useNavigate();

  // Filter drinks products
  const drinksProducts = products.filter(product => {
    const lowerName = product.name.toLowerCase();
    return lowerName.includes('juice') || 
           lowerName.includes('sprite') || 
           lowerName.includes('cola') ||
           lowerName.includes('drink');
  });

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
        <ProductComponent 
          products={drinksProducts}
          cart={cart}
          onCartChange={onCartChange}
          isLoggedIn={isLoggedIn}
        />
        
        {drinksProducts.length > 4 && (
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

export default ColdDrinksJuices;