// RelatedProducts.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ products, onCartUpdate, cart }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Fetch updated cart after any cart update
  const fetchCart = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok && onCartUpdate) {
        const data = await response.json();
        const count =
          data.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const total =
          data.products?.reduce(
            (sum, item) => sum + item.productId.price * item.quantity,
            0
          ) || 0;

        onCartUpdate(count, total);
      }
    } catch (err) {
      console.error("Error fetching updated cart:", err);
    }
  };

  // ✅ Update cart function
  const updateCart = async (productId, newQuantity) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity: newQuantity }),
        }
      );

      if (response.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating cart:", err);
      return false;
    }
  };

  const handleChange = async (productId, change) => {
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;
    if (newQty < 0) return;
    await updateCart(productId, newQty);
  };

  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

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

  if (dairyProducts.length === 0) {
    return null;
  }

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
