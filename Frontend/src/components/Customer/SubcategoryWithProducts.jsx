// SubcategoryWithProducts.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNavbar from '../Navbar/CustomerNavbar';
import ProductCard from './ProductCard'; // ✅ use the same ProductCard

const SubcategoryWithProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [localCart, setLocalCart] = useState({});
  const [localLoading, setLocalLoading] = useState({});
  const [subcategoryName, setSubcategoryName] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // 🔹 Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/category/${category}`);
        setProducts(res.data);
        const formattedName = category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setSubcategoryName(formattedName);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
    fetchCartData();
  }, [category]);

  // 🔹 Fetch cart data (guest or logged-in)
  const fetchCartData = async () => {
    const token = localStorage.getItem("token");
    try {
      let res;
      if (!token) {
        res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/guest-cart`, {
          headers: { 'Guest-Token': localStorage.getItem('guestToken') || '' }
        });
      } else {
        res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const cartData = res.data;
      const serverCartMap = {};
      let count = 0;
      let total = 0;

      if (cartData.products?.length > 0) {
        cartData.products.forEach(item => {
          serverCartMap[item.productId._id] = item.quantity;
          count += item.quantity;
          total += item.productId.price * item.quantity;
        });
      }

      setLocalCart(serverCartMap);
      setCartCount(count);
      setTotalPrice(total);

      if (!token && cartData.guestToken) {
        localStorage.setItem('guestToken', cartData.guestToken);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  // 🔹 Update Cart (same style as RelatedProducts)
  const updateCart = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const guestToken = localStorage.getItem('guestToken');
      const endpoint = token ? 'api/cart/add' : 'api/guest-cart/add';

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token 
            ? { 'Authorization': `Bearer ${token}` }
            : { 'Guest-Token': guestToken || '' }),
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      const data = await response.json();
      if (response.ok) {
        setLocalCart(prev => ({
          ...prev,
          [productId]: newQuantity > 0 ? newQuantity : undefined
        }));

        // Refresh cart data (count + total)
        fetchCartData();

        if (!token && data.guestToken) {
          localStorage.setItem('guestToken', data.guestToken);
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

  // 🔹 Handle cart change (+/- buttons)
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

  // 🔹 Direct Add button
  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

  return (
    <div>
      <CustomerNavbar 
        cartCount={cartCount} 
        totalPrice={totalPrice} 
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{subcategoryName}</h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(product => (
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
          <div className="text-center py-12">
            <p className="text-lg">No products found in this category.</p>
            <button 
              onClick={() => navigate('/Customer/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryWithProducts;
