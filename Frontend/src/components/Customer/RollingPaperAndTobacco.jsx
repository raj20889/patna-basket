// RollingPaperTobacco.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

const RollingPaperTobacco = ({ products, cart, loadingProduct, handleAddToCart, handleChange }) => {
  const navigate = useNavigate();

  // ✅ Filter rolling paper & tobacco products
  const rollingPaperProducts = (Array.isArray(products) ? products : []).filter((product) => {
    const lowerName = (product.name || "").toLowerCase();
    const lowerCategory = (product.category || "").toLowerCase();

    return (
      lowerName.includes("rolling paper") ||
      lowerName.includes("tobacco") ||
      lowerName.includes("cigarette") ||
      lowerName.includes("smoking") ||
      lowerName.includes("paper") ||
      lowerName.includes("marlboro") ||
      lowerName.includes("filter") ||
      lowerCategory.includes("tobacco") ||
      lowerCategory.includes("smoking")
    );
  });

  if (rollingPaperProducts.length === 0) return null;

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Rolling Paper & Tobacco</h2>
        <button
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate("/category/tobacco")}
        >
          See all
        </button>
      </div>

      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {rollingPaperProducts.map((product) => (
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

        {/* Optional arrows if you want like carousel */}
        {rollingPaperProducts.length > 4 && (
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

export default RollingPaperTobacco;
