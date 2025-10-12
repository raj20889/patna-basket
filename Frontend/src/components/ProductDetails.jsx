import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  if (!product) return <div>Loading...</div>;

  return (
    <div className="p-4 flex flex-col md:flex-row gap-6">
      <img
        src={product.image || "https://via.placeholder.com/300"}
        alt={product.name}
        className="w-full md:w-1/3 object-contain rounded-lg"
      />
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-700 mb-4">{product.desc}</p>
        <p className="text-xl font-semibold mb-2">₹{product.price}</p>
        <p className="text-gray-500">Category: {product.category}</p>
        <p className="text-gray-500">Subcategory: {product.subcategory}</p>
      </div>
    </div>
  );
}

export default ProductDetails;
