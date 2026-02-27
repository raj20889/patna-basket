import React, { useState, useEffect } from "react";
import ProductCard from "../../Product/ProductCard";
import { io } from "socket.io-client"; // Import socket.io-client

const AllProducts = ({
  products = [],
}) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [liveProducts, setLiveProducts] = useState(products); // State for live updates

  // Add socket.io listener for live stock updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
    });

    socket.on('stockUpdate', (updatedProduct) => {
      console.log('Stock update received:', updatedProduct);
      setLiveProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProduct.productId
            ? { ...product, stock: updatedProduct.stock }
            : product
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Get unique categories
  const categories = [
    "all",
    ...new Set(liveProducts.map((p) => p.category).filter(Boolean)),
  ];

  // Filter + sort
  useEffect(() => {
    let result = [...liveProducts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(result);
  }, [liveProducts, searchTerm, selectedCategory]);

  return (
    <div>
      <h2>All Products</h2>
      <div className="product-list">
        {filteredProducts.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default AllProducts;
