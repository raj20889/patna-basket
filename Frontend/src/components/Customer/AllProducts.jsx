import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const AllProducts = ({ products, onCartUpdate, cart: parentCart, loading: parentLoading }) => {
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState({});
  const [localLoading, setLocalLoading] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

  // Sync with parent cart state
  useEffect(() => {
    if (parentCart) {
      setLocalCart(parentCart);
    }
  }, [parentCart]);

  useEffect(() => {
    if (parentLoading) {
      setLocalLoading(parentLoading);
    }
  }, [parentLoading]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Default sorting (may keep original order or apply another default)
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, sortOption, selectedCategory]);

  const updateCart = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = token ? 'api/cart/add' : 'api/guest-cart/add';
      
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      const data = await response.json();
      if (response.ok) {
        setLocalCart(prev => ({
          ...prev,
          [productId]: newQuantity > 0 ? newQuantity : undefined
        }));
        
        if (onCartUpdate) {
          const cartResponse = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            const count = cartData.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const total = cartData.products?.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0) || 0;
            onCartUpdate(count, total);
          }
        }
        
        return true;
      } else {
        console.error("Error updating cart:", data.msg);
        return false;
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      return false;
    }
  };

  const handleChange = async (productId, change) => {
    const currentQty = localCart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    setLocalLoading(prev => ({ ...prev, [productId]: true }));
    setLocalCart(prev => ({ ...prev, [productId]: newQty }));

    try {
      const success = await updateCart(productId, newQty);
      if (!success) {
        setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
      }
    } catch (err) {
      console.error("Error updating cart", err);
      setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
    } finally {
      setLocalLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No products available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters and Search */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort Options */}
          <div className="w-full md:w-auto">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Default Sorting</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Products Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={localCart[product._id] || 0}
              isLoading={localLoading[product._id]}
              handleAddToCart={handleAddToCart}
              handleChange={handleChange}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No products match your filters</p>
        </div>
      )}
    </div>
  );
};

export default AllProducts;