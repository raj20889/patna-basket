// RelatedProducts.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ products, cart, productLoadingStates, handleAddToCart, handleChange }) => {
  const navigate = useNavigate();

  // ✅ Filter dairy-related products safely
  const dairyProducts = (Array.isArray(products) ? products : []).filter(
    (product) => {
      const lowerName = (product.category || "").toLowerCase();
      return (
        lowerName.includes("milk") ||
        lowerName.includes("bread") ||
        lowerName.includes("egg")
      );
    }
  );

  if (dairyProducts.length === 0) return null;

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Dairy &amp; Bread</h2>
        <button
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate("/category/dairy")}
        >
          See all
        </button>
      </div>

      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {dairyProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={cart[product._id] || 0}
              isProductLoading={productLoadingStates[product._id] || false} // 👈 check here
              handleAddToCart={handleAddToCart}
              handleChange={handleChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
