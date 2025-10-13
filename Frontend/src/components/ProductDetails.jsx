import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AiFillStar } from "react-icons/ai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProductDetails({ onAddToCart, cart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

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

  if (!product) return <div className="text-center py-20">Loading...</div>;

  const handleAdd = async () => {
    if (onAddToCart) {
      setLoading(true);
      await onAddToCart(product._id, quantity);
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating placeholder */}
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <AiFillStar
                key={i}
                className={`h-5 w-5 ${
                  i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-500">({product.reviews || 12} reviews)</span>
          </div>

          <p className="text-gray-700 mb-4">{product.desc}</p>

          <div className="text-2xl font-semibold mb-4 text-green-700">
            ₹{product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-lg ml-2">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-gray-500 mb-4">
            <span>Category: {product.category}</span>
            <span>Subcategory: {product.subcategory}</span>
            {product.weight && <span>Weight: {product.weight}</span>}
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-3 py-1 bg-gray-200 text-gray-700 font-bold"
            >
              -
            </button>
            <span className="px-4 py-1">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="px-3 py-1 bg-gray-200 text-gray-700 font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
