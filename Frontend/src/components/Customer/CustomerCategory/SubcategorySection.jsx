import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "../../Product/ProductCard";

const SubcategorySection = ({ 
  products, 
  sectionTitle, 
  subcategoryFilter, 
  navigatePath 
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Filter products by subcategory (check both subcategory and category fields for compatibility)
  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) => {
    // Support multiple filters separated by | or , (e.g., "milk|bread|egg" or "oil,fortune")
    const filters = subcategoryFilter.toLowerCase().split(/[|,]/).map(f => f.trim());
    
    // Check subcategory field
    const productSubcategories = Array.isArray(product.subcategory)
      ? product.subcategory.map((s) => (s || '').toLowerCase())
      : [(product.subcategory || '').toLowerCase()];
    
    const matchesSubcategory = productSubcategories.some(sub => 
      filters.some(filter => sub.includes(filter))
    );

    // Also check category field for backward compatibility
    const productCategories = Array.isArray(product.category)
      ? product.category.map((c) => (c || '').toLowerCase())
      : [(product.category || '').toLowerCase()];
    
    const matchesCategory = productCategories.some(cat => 
      filters.some(filter => cat.includes(filter))
    );

    return matchesSubcategory || matchesCategory;
  });

  if (filteredProducts.length === 0) return null;

  return (
    <div className="px-4 py-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{sectionTitle}</h2>
        <button
          className="text-blue-500 text-sm font-medium hover:text-blue-600"
          onClick={() => navigate(token ? `/c/${navigatePath}` : `/${navigatePath}`)}
        >
          See all
        </button>
      </div>

      {/* Product Slider */}
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        {filteredProducts.length > 4 && (
          <>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10">
              <FiChevronLeft size={20} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10">
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubcategorySection;
