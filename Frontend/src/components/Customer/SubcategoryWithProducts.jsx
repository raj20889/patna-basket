import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductComponent from '../ProductComponent';
import CustomerNavbar from '../Navbar/CustomerNavbar';

const SubcategoryWithProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cart, setCart] = useState({});
  const [subcategoryName, setSubcategoryName] = useState('');

  const fetchCartData = async () => {
    const token = localStorage.getItem("token");
    try {
      let res;
      if (!token) {
        res = await axios.get('http://localhost:5000/api/guest-cart', {
          headers: { 
            'Guest-Token': localStorage.getItem('guestToken') || ''
          }
        });
      } else {
        res = await axios.get('http://localhost:5000/api/cart', {
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

      setCart(serverCartMap);
      setCartCount(count);
      setTotalPrice(total);
      
      if (!token && res.data.guestToken) {
        localStorage.setItem('guestToken', res.data.guestToken);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/category/${category}`);
        setProducts(res.data);
        const formattedName = category.replace(/-/g, ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase());
        setSubcategoryName(formattedName);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
    fetchCartData();
  }, [category]);

  const handleCartChange = async (productId, change) => {
    const token = localStorage.getItem("token");
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    // Find the product for price calculation
    const product = products.find(p => p._id === productId);
    const priceChange = (product?.price || 0) * change;

    // Optimistic UI update
    setCart(prev => ({ ...prev, [productId]: newQty }));
    setCartCount(prev => prev + change);
    setTotalPrice(prev => prev + priceChange);

    try {
      if (!token) {
        const guestToken = localStorage.getItem('guestToken');
        await axios.post(
          "http://localhost:5000/api/guest-cart/add",
          { productId, quantity: newQty },
          { headers: { 'Guest-Token': guestToken || '' } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/cart/add",
          { productId, quantity: newQty },
          { headers: { "Authorization": `Bearer ${token}` } }
        );
      }

      // Verify with server after update
      await fetchCartData();
    } catch (err) {
      console.error("Error updating cart", err);
      // Revert optimistic update on error
      setCart(prev => ({ ...prev, [productId]: currentQty }));
      setCartCount(prev => prev - change);
      setTotalPrice(prev => prev - priceChange);
    }
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
          <ProductComponent 
            products={products} 
            cart={cart}
            onCartChange={handleCartChange}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">No products found in this category.</p>
            <button 
              onClick={() => navigate('/')}
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