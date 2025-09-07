// ColdDrinksAndJuices.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

const ColdDrinksAndJuices = ({ products, cart, loadingProduct, handleAddToCart, handleChange }) => {
  const navigate = useNavigate();

  // ✅ Filter cold drinks and juices products
  const coldDrinksProducts = (Array.isArray(products) ? products : []).filter((product) => {
    const lowerName = (product.name || "").toLowerCase();
    const lowerCategory = (product.category || "").toLowerCase();
    return (
      lowerName.includes("juice") ||
      lowerName.includes("cola") ||
      lowerName.includes("soda") ||
      lowerName.includes("drink") ||
      lowerName.includes("lemonade") ||
      lowerName.includes("iced tea") ||
      lowerCategory.includes("beverage") ||
      lowerCategory.includes("juice") ||
      lowerCategory.includes("drink")
    );
  });

  if (coldDrinksProducts.length === 0) return null;

  return (
    <div className="px-4 py-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cold Drinks & Juices</h2>
        <button
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate("/category/beverages")}
        >
          See all
        </button>
      </div>

      {/* Product Slider */}
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {coldDrinksProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={cart[product._id] || 0}
              isLoading={loadingProduct === product._id}
              handleAddToCart={handleAddToCart}
              handleChange={handleChange}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        {coldDrinksProducts.length > 4 && (
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

export default ColdDrinksAndJuices;
