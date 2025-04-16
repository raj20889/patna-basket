import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductComponent from '../components/ProductComponent';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import CategoryLinks from '../components/CategoryLinks';
import CategoryGrid from '../components/CategoryGrid';

const SubcategoryWithProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState({});
  const [subcategoryName, setSubcategoryName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/category/${category}`);
        setProducts(res.data);
        // Format the category name for display
        const formattedName = category.replace(/-/g, ' ')
                                      .replace(/\b\w/g, l => l.toUpperCase());
        setSubcategoryName(formattedName);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    const fetchCartData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Load guest cart
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const guestCartMap = {};
        guestCart.forEach(item => {
          guestCartMap[item.productId] = item.quantity;
        });
        setCart(guestCartMap);
        calculateAndUpdateCart(guestCart);
      } else {
        // Fetch user's cart from server
        try {
          const res = await axios.get('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const cartData = res.data;
          const serverCartMap = {};
          
          if (cartData.products && cartData.products.length > 0) {
            cartData.products.forEach(item => {
              serverCartMap[item.productId._id] = item.quantity;
            });
          }

          setCart(serverCartMap);
          
          // Calculate totals from server data
          if (cartData.products) {
            const count = cartData.products.reduce((sum, item) => sum + item.quantity, 0);
            const total = cartData.products.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
            setCartCount(count);
            setTotalPrice(total);
          }
        } catch (err) {
          console.error('Error fetching cart:', err);
        }
      }
    };

    fetchProducts();
    fetchCartData();
  }, [category]);

  const calculateAndUpdateCart = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartCount(count);
    setTotalPrice(total);
  };

  const handleCartUpdate = (count, total, updatedProducts) => {
    setCartCount(count);
    setTotalPrice(total);
    
    if (updatedProducts) {
      const updatedCart = {};
      updatedProducts.forEach(item => {
        updatedCart[item.productId._id] = item.quantity;
      });
      setCart(updatedCart);
    }
  };

  const handleCartChange = async (productId, change) => {
    const token = localStorage.getItem("token");
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    try {
      if (!token) {
        // Handle guest cart update
        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const product = products.find(p => p._id === productId);
        
        if (!product) return;

        const index = guestCart.findIndex(item => item.productId === productId);

        if (index > -1) {
          if (newQty > 0) {
            guestCart[index].quantity = newQty;
          } else {
            guestCart.splice(index, 1);
          }
        } else if (newQty > 0) {
          guestCart.push({
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: newQty,
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        calculateAndUpdateCart(guestCart);
      } else {
        // Handle logged-in user cart update
        const res = await axios.post("http://localhost:5000/api/cart/add", 
          { productId, quantity: newQty },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (res.data.products) {
          const count = res.data.products.reduce((sum, item) => sum + item.quantity, 0);
          const total = res.data.products.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
          handleCartUpdate(count, total, res.data.products);
        }
      }
    } catch (err) {
      console.error("Error updating cart", err);
    }
  };

  return (
    <div>
      <PublicNavbar cartCount={cartCount} totalPrice={totalPrice} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{subcategoryName}</h1>
        
    
        
        {products.length > 0 ? (
       
            <ProductComponent 
              products={products} 
              onCartUpdate={handleCartUpdate}
              cart={cart}
              loading={loading}
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