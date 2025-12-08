// SubcategoryWithProducts.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '../../redux/cartSlice';
import axios from 'axios';
import CustomerNavbar from '../Navbar/CustomerNavbar';
import ProductCard from './ProductCard'; // ✅ use the same ProductCard

const SubcategoryWithProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [subcategoryName, setSubcategoryName] = useState('');

  // 🔹 Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/category/${category}`);
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
  }, [category]);

  // 🔹 Fetch cart data (guest or logged-in)
  const fetchCartData = useCallback(async () => {
    // Cart data is now managed by Redux and useCartLoader.js
    // This function can be removed or adapted if specific local cart data is still needed
  }, []);



  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // 🔹 Handle cart change (+/- buttons)
  const handleChange = async (productId, change) => {
    const existingItem = cartItems.find(item => item.productId === productId);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    setLocalLoading(prev => ({ ...prev, [productId]: true }));

    try {
      if (newQty === 0) {
        dispatch(removeFromCart({ productId }));
      } else if (currentQty === 0 && newQty > 0) {
        // This assumes you have enough product info to add to cart
        // You might need to fetch product details here or pass them down
        const productToAdd = products.find(p => p._id === productId);
        if (productToAdd) {
          dispatch(addToCart({ 
            productId: productToAdd._id,
            name: productToAdd.name,
            price: productToAdd.price,
            quantity: newQty,
            image: productToAdd.image,
            variant: productToAdd.variant || '1 unit'
          }));
        }
      } else {
        dispatch(updateQuantity({ productId, quantity: newQty }));
      }
    } catch (err) {
      console.error("Error updating cart", err);
    } finally {
      setLocalLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // 🔹 Direct Add button
  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

  const { totalQuantity, totalPrice } = useSelector((state) => state.cart);

  return (
    <div>
      <CustomerNavbar 
        cartCount={totalQuantity} 
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
                quantity={cartItems.find(item => item.productId === product._id)?.quantity || 0}
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
