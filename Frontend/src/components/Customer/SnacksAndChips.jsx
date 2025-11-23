// SnacksAndChips.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

const SnacksAndChips = ({ products, cart, productLoadingStates, handleAddToCart, handleChange }) => {
  const navigate = useNavigate();

  // ✅ Filter snacks and chips products
  const snacksProducts = (Array.isArray(products) ? products : []).filter((product) => {
    const lowerCategory = (product.category || "").toLowerCase();
    const lowerName = (product.name || "").toLowerCase();

    return (
      lowerCategory.includes("snack") ||
      lowerCategory.includes("chip") ||
      lowerName.includes("snack") ||
      lowerName.includes("chip") ||
      lowerName.includes("crisp") ||
      lowerName.includes("pretzel") ||
      lowerName.includes("popcorn") ||
      lowerName.includes("nuts") ||
      lowerName.includes("cracker")
    );
  });

  if (snacksProducts.length === 0) return null;

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Snacks &amp; Chips</h2>
        <button
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate("/category/snacks")}
        >
          See all
        </button>
      </div>

      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {snacksProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={cart[product._id] || 0}
              isProductLoading={productLoadingStates[product._id] || false}
              handleAddToCart={handleAddToCart}
              handleChange={handleChange}
            />
          ))}
        </div>

        {/* Optional carousel arrows */}
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
