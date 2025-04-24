import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductComponent from './ProductComponent';

const RelatedProducts = ({ products = [], onCartChange, cart = [], loading, isLoggedIn }) => {
  const navigate = useNavigate();

  // Safely filter dairy-related products
  const dairyProducts = (products || []).filter(product => {
    if (!product || !product.name) return false;
    
    const lowerName = product.name.toLowerCase();
    return lowerName.includes('milk') || 
           lowerName.includes('bread') || 
           lowerName.includes('egg') ||
           lowerName.includes('cheese') ||
           lowerName.includes('butter') ||
           lowerName.includes('yogurt');
  });

  // Show loading state if data is being fetched
  if (loading) {
    return (
      <div className="px-4 py-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Dairy &amp; Bread</h2>
          <button className="text-blue-500 text-sm font-medium">See all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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
          cart={cart}
          onCartChange={onCartChange}
          isLoggedIn={isLoggedIn}
        />
        
        {/* Navigation Arrows */}
        {dairyProducts.length > 4 && (
          <>
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              onClick={() => {/* Add scroll left functionality */}}
            >
              <FiChevronLeft size={20} />
            </button>
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              onClick={() => {/* Add scroll right functionality */}}
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