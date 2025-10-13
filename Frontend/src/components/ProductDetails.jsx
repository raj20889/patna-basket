import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) return <div className="text-center py-20">Loading....</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 bg-white shadow-lg rounded-lg">
      {/* Left: Product Image */}
      <div className="md:w-1/2 flex justify-center items-center bg-gray-100 p-4 rounded-lg">
        <img
          src={product.image || "https://via.placeholder.com/400"}
          alt={product.name}
          className="object-contain h-96 w-full rounded-lg"
        />
      </div>

      {/* Right: Product Info */}
      <div className="md:w-1/2 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {product.desc && (
            <p className="text-gray-700 mb-4">{product.desc}</p>
          )}

          <div className="text-2xl font-semibold mb-4 text-green-700">
            ₹{product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-lg ml-2">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-gray-500 mb-4">
            {product.category && <span>Category: {product.category}</span>}
            {product.subcategory && <span>Subcategory: {product.subcategory}</span>}
          </div>

          {/* Static info section */}
          <div className="bg-gray-100 p-4 rounded-lg text-gray-700 space-y-2">
            <p>• 100% Genuine Product</p>
            <p>• Fast Delivery within 1-2 days</p>
            <p>• Return available within 7 days</p>
            <p>• Customer Support: 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
